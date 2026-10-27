import { Download } from "lucide-react";
import { categoryIds } from "@/types/domain";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { getEditions, getFestival } from "@/lib/admin/api/festival";
import { getJudgeQueue, listSubmissions } from "@/lib/admin/api/submissions";
import { listJudges } from "@/lib/admin/api/access";
import { listProvinces } from "@/lib/admin/api/participants";
import {
  categoryLabels,
  editionOptions,
  kindLabels,
  reviewLabels,
  sectionLabels,
} from "@/lib/admin/labels";
import { formatNumber } from "@/lib/admin/format";
import { readParam, toQueryString, type SearchParams } from "@/lib/admin/params";
import { reviewStatuses, type SubmissionKind } from "@/lib/admin/types";
import { adminButton } from "@/components/admin/button";
import { Card, StatusDot } from "@/components/admin/primitives";
import { PageHeader } from "@/components/admin/page-header";
import { QueryStateProvider } from "@/features/admin/navigation";
import {
  ClearFilters,
  DateRangeFilter,
  EditionSelect,
  FilterSelect,
  Pagination,
  SearchBox,
  StatusTabs,
  Toolbar,
} from "@/features/admin/list";
import { SubmissionsTable } from "@/features/admin/submissions/SubmissionsTable";
import { QueueToggle } from "@/features/admin/submissions/QueueToggle";
import {
  filterParams,
  isJudgeOnly,
  parseSubmissionQuery,
} from "@/features/admin/submissions/query";

export async function SubmissionsPage({
  kind,
  searchParams,
}: {
  kind: SubmissionKind;
  searchParams: Promise<SearchParams>;
}) {
  const viewer = await requirePermission(`${kind}.view`);
  const [festival, params] = await Promise.all([getFestival(), searchParams]);
  const query = parseSubmissionQuery(kind, params, viewer, festival.currentEditionId);
  const judgeOnly = isJudgeOnly(viewer, kind);

  const [page, provinces, judges, editions, queue] = await Promise.all([
    listSubmissions(query),
    listProvinces(),
    can(viewer, `${kind}.assign`) ? listJudges(kind) : [],
    getEditions(),
    getJudgeQueue(viewer.id, query.editionId),
  ]);

  const categoryOptions =
    kind === "art"
      ? categoryIds.map((id) => ({ value: id, label: categoryLabels[id] }))
      : festival.topics.map((topic) => ({ value: topic.id, label: topic.title.fa }));
  const filtered = filterParams.some((key) => key !== "status" && readParam(params, key));

  return (
    <QueryStateProvider>
      <PageHeader
        title={kindLabels[kind].many}
        description={
          judgeOnly
            ? `${kindLabels[kind].many}ی که برای داوری به شما سپرده شده است.`
            : `همه ${kindLabels[kind].many} ارسال‌شده؛ بررسی اولیه، سپردن به داور و تعیین نتیجه.`
        }
        actions={
          <>
            <EditionSelect
              current={festival.currentEditionId}
              editions={editionOptions(editions)}
            />
            {can(viewer, `${kind}.export`) && (
              <a
                href={`/api/admin/export/${kind}${toQueryString(params, ["page"])}`}
                className={adminButton({ variant: "outline", size: "sm" })}
              >
                <Download aria-hidden />
                خروجی اکسل
              </a>
            )}
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b border-line">
          <StatusTabs
            label="وضعیت"
            items={[
              { value: "all", label: "همه", count: page.counts.all },
              ...reviewStatuses.map((status) => ({
                value: status,
                label: reviewLabels[status],
                count: page.counts[status],
                dot: <StatusDot tone={status} />,
              })),
            ]}
          />
        </div>
        <Toolbar className="border-b border-line">
          <SearchBox
            placeholder="نام، کد ملی، موبایل، کد رهگیری یا کاروان"
            className="w-full sm:w-80"
          />
          <FilterSelect
            param="category"
            label={kind === "art" ? "بخش" : "محور"}
            allLabel={kind === "art" ? "همه بخش‌ها" : "همه محورها"}
            options={categoryOptions}
            className="max-w-60"
          />
          <FilterSelect
            param="province"
            label="استان"
            allLabel="همه استان‌ها"
            options={provinces.map((name) => ({ value: name, label: name }))}
          />
          <DateRangeFilter />
          <FilterSelect
            param="sort"
            label="ترتیب"
            allLabel="جدیدترین"
            options={[
              { value: "oldest", label: "قدیمی‌ترین" },
              { value: "score", label: "بیشترین امتیاز" },
            ]}
          />
          {can(viewer, `${kind}.judge`) && <QueueToggle forced={judgeOnly} waiting={queue[kind]} />}
          <ClearFilters params={filterParams.filter((key) => key !== "status")} />
          <p className="ms-auto text-caption text-ink-muted">{formatNumber(page.total)} مورد</p>
        </Toolbar>
        <SubmissionsTable
          kind={kind}
          rows={page.items}
          sectionLabels={sectionLabels(kind, festival.topics)}
          judges={judges}
          viewerId={viewer.id}
          filtered={filtered || Boolean(query.status)}
          can={{
            review: can(viewer, `${kind}.review`),
            assign: can(viewer, `${kind}.assign`),
            delete: can(viewer, `${kind}.delete`),
            judge: can(viewer, `${kind}.judge`),
          }}
        />
        <Pagination page={page.page} pageSize={page.pageSize} total={page.total} />
      </Card>
    </QueryStateProvider>
  );
}
