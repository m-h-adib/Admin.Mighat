import { type Metadata } from "next";
import {
  ClipboardCheck,
  FileStack,
  Gavel,
  ListChecks,
  PieChart,
  Shapes,
  Timer,
  UsersRound,
} from "lucide-react";
import { categoryIds } from "@/types/domain";
import { can } from "@/lib/admin/permissions";
import { requireViewer } from "@/lib/admin/session";
import { getDashboard } from "@/lib/admin/api/dashboard";
import { getEditions, getFestival } from "@/lib/admin/api/festival";
import { listTimers } from "@/lib/admin/api/timers";
import { getJudgeQueue } from "@/lib/admin/api/submissions";
import {
  categoryLabels,
  editionOptions,
  kindLabels,
  reviewLabels,
  timerScopeLabels,
  topicLabels,
} from "@/lib/admin/labels";
import { formatDate, formatNumber, formatWeekday, renderTime } from "@/lib/admin/format";
import { readParam } from "@/lib/admin/params";
import { reviewStatuses, type SubmissionKind, type TimerRow } from "@/lib/admin/types";
import { Card, CardHeader, EmptyState, Meter } from "@/components/admin/primitives";
import { BarList, StackedBar } from "@/components/admin/charts";
import { PageHeader } from "@/components/admin/page-header";
import { GirihPattern } from "@/components/ornaments/GirihPattern";
import { AdminLink, QueryStateProvider } from "@/features/admin/navigation";
import { EditionSelect } from "@/features/admin/list";
import { LiveCountdown } from "@/features/admin/timers/LiveCountdown";
import { StatTile } from "@/features/admin/dashboard/StatTile";
import { TrendCard } from "@/features/admin/dashboard/TrendCard";
import { JudgeHome } from "@/features/admin/dashboard/JudgeHome";

export const metadata: Metadata = { title: "پیشخوان" };

export default async function DashboardPage({ searchParams }: PageProps<"/[locale]/admin">) {
  const viewer = await requireViewer();
  const festival = await getFestival();
  const editionId = readParam(await searchParams, "edition") ?? festival.currentEditionId;
  const now = renderTime();

  if (!can(viewer, "dashboard.view")) {
    const queue = await getJudgeQueue(viewer.id, festival.currentEditionId);
    return <JudgeHome viewer={viewer} queue={queue} />;
  }

  const [data, editions, timers] = await Promise.all([
    getDashboard(editionId),
    getEditions(),
    listTimers(),
  ]);

  const canArt = can(viewer, "art.view");
  const canScience = can(viewer, "science.view");
  const running = timers.filter(
    (timer) => timer.state === "running" && timer.editionId === editionId,
  );
  const firstName = viewer.name.split(" ")[0]?.replace(/^سید/, "") ?? viewer.name;
  const topics = topicLabels(festival.topics);
  const kinds = (["art", "science"] as const).filter((kind) =>
    kind === "art" ? canArt : canScience,
  );
  const sum = (count: (kind: SubmissionKind) => number) =>
    kinds.reduce((total, kind) => total + count(kind), 0);
  const listHref = (kind: SubmissionKind) =>
    `/admin/${kind}${editionId === festival.currentEditionId ? "" : `?edition=${editionId}`}`;

  return (
    <QueryStateProvider>
      <PageHeader
        title={`سلام، ${firstName}`}
        description={`${formatWeekday(new Date(now).toISOString())} · خلاصه وضعیت جشنواره.`}
        actions={
          <EditionSelect current={festival.currentEditionId} editions={editionOptions(editions)} />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <TimerCard timers={running} now={now} canEdit={can(viewer, "timers.view")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 xl:col-span-3">
          {kinds.length > 0 && (
            <StatTile
              label={
                kinds.length > 1 ? "آثار و مقالات دریافتی" : `${kindLabels[kinds[0]!].many} دریافتی`
              }
              icon={FileStack}
              href={kinds.length > 1 ? undefined : listHref(kinds[0]!)}
              value={sum((kind) => data.totals[kind].all)}
              delta={{
                current: sum((kind) => data.thisWeek[kind]),
                previous: sum((kind) => data.lastWeek[kind]),
                period: "در این هفته",
              }}
              trend={data.trend.month.points.map((point) => sum((kind) => point[kind]))}
              footer={
                kinds.length > 1 && (
                  <span className="flex basis-full gap-3 pt-1">
                    {kinds.map((kind) => (
                      <AdminLink key={kind} href={listHref(kind)} className="hover:text-teal">
                        {kindLabels[kind].many}: {formatNumber(data.totals[kind].all)}
                      </AdminLink>
                    ))}
                  </span>
                )
              }
            />
          )}
          <StatTile
            label="شرکت‌کنندگان"
            icon={UsersRound}
            href={can(viewer, "participants.view") ? "/admin/participants" : undefined}
            value={data.participants.total}
            footer={<span>{formatNumber(data.participants.thisWeek)} نفر تازه در این هفته</span>}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {kinds.length > 0 && <TrendCard trend={data.trend} kinds={kinds} />}
        {canArt && (
          <Card>
            <CardHeader icon={Shapes} title="آثار به تفکیک بخش" />
            <div className="px-5 pt-4 pb-5">
              <BarList
                label="تعداد آثار هر بخش"
                items={categoryIds.map((id) => ({
                  key: id,
                  label: categoryLabels[id],
                  value: data.byCategory.find((row) => row.id === id)?.count ?? 0,
                }))}
              />
            </div>
          </Card>
        )}
        {!canArt && canScience && (
          <Card>
            <CardHeader icon={PieChart} title="مقالات به تفکیک محور" />
            <div className="px-5 pt-4 pb-5">
              <BarList
                label="تعداد مقالات هر محور"
                items={data.byTopic.map((row) => ({
                  key: row.id,
                  label: topics[row.id] ?? row.id,
                  value: row.count,
                }))}
              />
            </div>
          </Card>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            icon={ListChecks}
            title="وضعیت بررسی"
            description="هر اثر از بررسی اولیه تا داوری و انتخاب"
          />
          <div className="flex flex-col gap-6 px-5 pt-4 pb-5">
            {kinds.map((kind) => (
              <div key={kind}>
                <p className="mb-2.5 flex items-baseline justify-between text-caption">
                  <span className="font-bold text-ink">{kindLabels[kind].many}</span>
                  <AdminLink href={`/admin/${kind}`} className="text-ink-muted hover:text-teal">
                    {formatNumber(data.totals[kind].all)} مورد
                  </AdminLink>
                </p>
                <StackedBar
                  label={`توزیع وضعیت ${kind === "art" ? "آثار هنری" : "مقالات"}`}
                  segments={reviewStatuses.map((status) => ({
                    key: status,
                    label: reviewLabels[status],
                    value: data.totals[kind][status],
                    tone: status,
                  }))}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            icon={Gavel}
            title="پیشرفت داوری"
            description="سهم آثار پذیرفته‌شده که داوری‌شان کامل شده"
          />
          <div className="px-5 pt-4 pb-5">
            {data.judging.length === 0 ? (
              <EmptyState
                icon={ClipboardCheck}
                title="هنوز اثری به داوری نرسیده"
                className="py-8"
              />
            ) : (
              <ul className="flex flex-col gap-3.5">
                {data.judging.map((row) => (
                  <li
                    key={row.id}
                    className="grid grid-cols-[6.5rem_1fr_5.5rem] items-center gap-3"
                  >
                    <span className="truncate text-caption text-ink">
                      {row.id === "science"
                        ? kindLabels.science.many
                        : categoryLabels[row.id as keyof typeof categoryLabels]}
                    </span>
                    <Meter value={row.judged} max={row.total} label={`پیشرفت داوری ${row.id}`} />
                    <span className="text-end text-2xs text-ink-muted tabular-nums">
                      {formatNumber(row.judged)} از {formatNumber(row.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </QueryStateProvider>
  );
}

function TimerCard({
  timers,
  now,
  canEdit,
}: {
  timers: TimerRow[];
  now: number;
  canEdit: boolean;
}) {
  const primary = timers[0];
  return (
    <section className="relative flex flex-col overflow-hidden rounded-box bg-green-950 p-5 text-parchment shadow-lift">
      <GirihPattern opacity={0.06} />
      <div className="relative flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-caption text-mist-light">
          <Timer className="size-4 text-gold-light" aria-hidden />
          {primary ? primary.name : "زمان‌بندی"}
        </h2>
        {canEdit && (
          <AdminLink href="/admin/timers" className="text-2xs text-gold-light hover:text-white">
            همه تایمرها
          </AdminLink>
        )}
      </div>
      {primary ? (
        <div className="relative mt-4 flex flex-1 flex-col justify-between gap-4">
          <LiveCountdown endsAt={primary.endsAt} initialNow={now} tone="dark" />
          <div className="flex flex-col gap-1.5 text-2xs text-mist">
            <span>پایان: {formatDate(primary.endsAt)}</span>
            {timers.length > 1 && (
              <span>
                {formatNumber(timers.length - 1)} تایمر دیگر در جریان است (
                {timers
                  .slice(1)
                  .map((timer) => timerScopeLabels[timer.scope])
                  .join("، ")}
                )
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="relative mt-4 text-caption text-mist">
          تایمر فعالی برای این دوره در جریان نیست.
        </p>
      )}
    </section>
  );
}
