import { type ReactNode } from "react";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, Gavel, Phone, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { getFestival } from "@/lib/admin/api/festival";
import { getAdjacent, getSubmission } from "@/lib/admin/api/submissions";
import { listStaffNames } from "@/lib/admin/api/access";
import {
  editionName,
  kindLabels,
  reviewHints,
  reviewLabels,
  sectionLabels,
} from "@/lib/admin/labels";
import {
  formatDateTime,
  formatDigits,
  formatFileSize,
  formatNumber,
  formatRelative,
  fullName,
  renderTime,
} from "@/lib/admin/format";
import { toQueryString, type SearchParams } from "@/lib/admin/params";
import { type ID, type SubmissionKind } from "@/lib/admin/types";
import { adminButton } from "@/components/admin/button";
import { GirihPattern } from "@/components/ornaments/GirihPattern";
import { Badge, Card, CardHeader } from "@/components/admin/primitives";
import { PageHeader } from "@/components/admin/page-header";
import { AdminLink } from "@/features/admin/navigation";
import { SubmissionIcon } from "@/features/admin/submissions/icons";
import { ScoreForm, StatusActions } from "@/features/admin/submissions/detail-parts";
import { isJudgeOnly, parseSubmissionQuery } from "@/features/admin/submissions/query";

interface Props {
  kind: SubmissionKind;
  id: string;
  searchParams: Promise<SearchParams>;
}

export async function SubmissionDetailPage({ kind, id, searchParams }: Props) {
  const viewer = await requirePermission(`${kind}.view`);
  const [submission, festival, params] = await Promise.all([
    getSubmission(id),
    getFestival(),
    searchParams,
  ]);
  if (!submission || submission.kind !== kind) notFound();

  const judgeOnly = isJudgeOnly(viewer, kind);
  const mine = submission.assignments.find((assignment) => assignment.judgeId === viewer.id);
  if (judgeOnly && !mine) notFound();

  const query = parseSubmissionQuery(
    kind,
    { ...params, edition: params.edition ?? submission.editionId },
    viewer,
    festival.currentEditionId,
  );
  const [adjacent, names] = await Promise.all([getAdjacent(query, id), listStaffNames()]);

  const now = renderTime();
  const listQuery = toQueryString(params);
  const listHref = `/admin/${kind}${listQuery}`;
  const categoryLabel = sectionLabels(kind, festival.topics)[submission.category];
  const canReview = can(viewer, `${kind}.review`);
  const canJudge = can(viewer, `${kind}.judge`) && (Boolean(mine) || canReview);
  const judgeable = submission.status !== "pending" && submission.status !== "rejected";
  const person = submission.participant;
  const isText = submission.file.type === "text" || kind === "science";

  return (
    <>
      <PageHeader
        back={{ href: listHref, label: kindLabels[kind].many }}
        title={submission.title}
        meta={
          <>
            <Badge tone={submission.status} dot>
              {reviewLabels[submission.status]}
              {submission.rank ? ` · رتبه ${formatDigits(submission.rank)}` : ""}
            </Badge>
            <Badge dir="ltr" className="tabular-nums">
              {submission.code}
            </Badge>
            <span className="text-caption text-ink-muted">
              {categoryLabel} · {editionName(Number(submission.editionId))} · ارسال{" "}
              {formatRelative(submission.submittedAt, now)}
            </span>
          </>
        }
        actions={
          adjacent.position !== undefined && (
            <nav aria-label="مورد قبلی و بعدی" className="flex items-center gap-1">
              <span className="me-1 text-2xs text-ink-muted tabular-nums">
                {formatNumber(adjacent.position)} از {formatNumber(adjacent.total)}
              </span>
              <AdjacentLink kind={kind} id={adjacent.prev} query={listQuery}>
                <ChevronRight className="ltr:rotate-180" aria-hidden />
                قبلی
              </AdjacentLink>
              <AdjacentLink kind={kind} id={adjacent.next} query={listQuery}>
                بعدی
                <ChevronLeft className="ltr:rotate-180" aria-hidden />
              </AdjacentLink>
            </nav>
          )
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="overflow-hidden">
            <div
              className={cn(
                "relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-green-900 px-6 text-center",
                isText ? "py-10" : "aspect-video",
              )}
            >
              <GirihPattern />
              <SubmissionIcon
                kind={kind}
                category={submission.category}
                className="relative size-10 text-gold-light"
                strokeWidth={1.4}
                aria-hidden
              />
              <p className="relative text-caption text-mist-light">
                {submission.file.name} · {formatFileSize(submission.file.size)}
              </p>
              {submission.file.url ? (
                <a
                  href={submission.file.url}
                  download
                  className={cn(adminButton({ variant: "gold", size: "sm" }), "relative")}
                >
                  <Download aria-hidden />
                  دریافت فایل
                </a>
              ) : (
                <p className="relative text-2xs text-sage">پیش‌نمایش این فایل در دسترس نیست.</p>
              )}
            </div>
            <div className="px-5 py-4.5">
              <h2 className="mb-2 text-sm font-bold text-ink">
                {kind === "science" ? "چکیده" : "روایت صاحب اثر"}
              </h2>
              <p className="text-body leading-prose text-ink">{submission.summary}</p>
            </div>
          </Card>

          {canJudge && judgeable && (
            <Card>
              <CardHeader
                icon={Gavel}
                title="داوری شما"
                description={
                  mine?.total !== undefined
                    ? "امتیاز شما ثبت شده؛ تا پایان داوری می‌توانید آن را تغییر دهید."
                    : "به هر معیار از ۰ تا ۱۰ امتیاز دهید."
                }
              />
              <div className="px-5 pt-4 pb-5">
                <ScoreForm kind={kind} id={id} criteria={festival.criteria[kind]} current={mine} />
              </div>
            </Card>
          )}

          {canReview &&
            submission.assignments.some((assignment) => assignment.total !== undefined) && (
              <Card className="overflow-hidden">
                <CardHeader
                  title="کارنامه داوری"
                  description={`میانگین: ${submission.score !== undefined ? formatDigits(submission.score) : "—"} از ۱۰۰`}
                />
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-canvas/70 text-2xs text-ink-muted">
                        <th scope="col" className="px-5 py-2 text-start font-bold">
                          معیار
                        </th>
                        {submission.assignments.map((assignment) => (
                          <th
                            key={assignment.judgeId}
                            scope="col"
                            className="px-3 py-2 text-center font-bold whitespace-nowrap"
                          >
                            {names.get(assignment.judgeId)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {festival.criteria[kind].map((criterion) => (
                        <tr key={criterion.id} className="border-t border-line">
                          <th scope="row" className="px-5 py-2.5 text-start font-normal text-ink">
                            {criterion.title}{" "}
                            <span className="text-2xs text-ink-muted">
                              ({formatDigits(criterion.weight)}٪)
                            </span>
                          </th>
                          {submission.assignments.map((assignment) => (
                            <td
                              key={assignment.judgeId}
                              className="px-3 py-2.5 text-center tabular-nums"
                            >
                              {assignment.scores?.[criterion.id] !== undefined
                                ? formatDigits(assignment.scores[criterion.id]!)
                                : "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="border-t border-line bg-canvas/50 font-bold">
                        <th scope="row" className="px-5 py-2.5 text-start">
                          جمع (از ۱۰۰)
                        </th>
                        {submission.assignments.map((assignment) => (
                          <td
                            key={assignment.judgeId}
                            className="px-3 py-2.5 text-center tabular-nums"
                          >
                            {assignment.total !== undefined ? formatDigits(assignment.total) : "—"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                {submission.assignments.some((assignment) => assignment.comment) && (
                  <ul className="flex flex-col gap-2 border-t border-line px-5 py-4">
                    {submission.assignments
                      .filter((assignment) => assignment.comment)
                      .map((assignment) => (
                        <li
                          key={assignment.judgeId}
                          className="text-caption leading-loose text-ink"
                        >
                          <b>{names.get(assignment.judgeId)}:</b> {assignment.comment}
                        </li>
                      ))}
                  </ul>
                )}
              </Card>
            )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-21">
          <Card>
            <CardHeader title="وضعیت" />
            <div className="flex flex-col gap-3 px-5 pt-3 pb-5">
              <p className="text-caption text-ink-muted">{reviewHints[submission.status]}</p>
              {submission.rejectReason && (
                <p className="rounded-btn-sm bg-status-rejected/8 px-3 py-2 text-caption text-status-rejected-ink">
                  دلیل: {submission.rejectReason}
                </p>
              )}
              {canReview && <StatusActions kind={kind} id={id} status={submission.status} />}
            </div>
          </Card>

          {!judgeOnly && (
            <Card>
              <CardHeader icon={UserRound} title="شرکت‌کننده" />
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 px-5 pt-4 pb-5 text-caption">
                <dt className="text-ink-muted">نام</dt>
                <dd className="font-medium text-ink">
                  {can(viewer, "participants.view") ? (
                    <AdminLink
                      href={`/admin/participants/${person.id}`}
                      className="hover:text-teal"
                    >
                      {fullName(person)}
                    </AdminLink>
                  ) : (
                    fullName(person)
                  )}
                </dd>
                <dt className="text-ink-muted">کد ملی</dt>
                <dd className="text-ink tabular-nums">{formatDigits(person.nationalId)}</dd>
                <dt className="text-ink-muted">همراه</dt>
                <dd>
                  <a
                    href={`tel:${person.phone}`}
                    className="inline-flex items-center gap-1.5 text-ink tabular-nums hover:text-teal"
                  >
                    <Phone className="size-3.5" aria-hidden />
                    {formatDigits(person.phone)}
                  </a>
                </dd>
                <dt className="text-ink-muted">کاروان</dt>
                <dd className="text-ink tabular-nums">{formatDigits(person.caravanNo)}</dd>
                <dt className="text-ink-muted">استان</dt>
                <dd className="text-ink">{person.province}</dd>
                <dt className="text-ink-muted">زمان ارسال</dt>
                <dd className="text-ink">{formatDateTime(submission.submittedAt)}</dd>
              </dl>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}

function AdjacentLink({
  kind,
  id,
  query,
  children,
}: {
  kind: SubmissionKind;
  id?: ID;
  query: string;
  children: ReactNode;
}) {
  const className = adminButton({ variant: "outline", size: "sm" });
  if (!id) {
    return (
      <span aria-disabled className={className}>
        {children}
      </span>
    );
  }
  return (
    <AdminLink href={`/admin/${kind}/${id}${query}`} className={className}>
      {children}
    </AdminLink>
  );
}
