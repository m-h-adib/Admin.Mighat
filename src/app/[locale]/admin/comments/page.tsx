import { type Metadata } from "next";
import { X } from "lucide-react";
import { env } from "@/lib/env";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { findCommentWork, listComments } from "@/lib/admin/api/audience";
import { commentStateLabels } from "@/lib/admin/labels";
import { renderTime } from "@/lib/admin/format";
import { readOption, readPage, readParam } from "@/lib/admin/params";
import { type CommentState } from "@/lib/admin/types";
import { adminButton } from "@/components/admin/button";
import { Card } from "@/components/admin/primitives";
import { PageHeader } from "@/components/admin/page-header";
import { AdminLink, QueryStateProvider } from "@/features/admin/navigation";
import { Pagination, SearchBox, StatusTabs, Toolbar } from "@/features/admin/list";
import { CommentsList } from "@/features/admin/audience/CommentsList";

export const metadata: Metadata = { title: "نظرات" };

const states: CommentState[] = ["pending", "approved", "rejected"];

export default async function CommentsPage({
  searchParams,
}: PageProps<"/[locale]/admin/comments">) {
  const viewer = await requirePermission("comments.view");
  const params = await searchParams;
  const workId = readParam(params, "work");
  const [page, work] = await Promise.all([
    listComments({
      q: readParam(params, "q"),
      state: readOption(params, "state", states),
      workId,
      page: readPage(params),
    }),
    workId ? findCommentWork(workId) : undefined,
  ]);

  return (
    <QueryStateProvider>
      <PageHeader
        title="نظرات بازدیدکنندگان"
        description="نظرهایی که زیر آثار سایت نوشته می‌شوند، پس از تأیید در سایت نمایش داده می‌شوند."
        meta={
          work && (
            <AdminLink
              href="/admin/comments"
              className={adminButton({ variant: "subtle", size: "xs" })}
            >
              فقط نظرهای «{work.title}»
              <X aria-hidden />
            </AdminLink>
          )
        }
      />
      <Card className="overflow-hidden">
        <div className="border-b border-line">
          <StatusTabs
            param="state"
            label="وضعیت نظر"
            items={[
              { value: "all", label: "همه", count: page.counts.all },
              ...states.map((value) => ({
                value,
                label: commentStateLabels[value],
                count: page.counts[value],
              })),
            ]}
          />
        </div>
        <Toolbar className="border-b border-line">
          <SearchBox placeholder="نام، متن نظر یا عنوان اثر" className="w-full sm:w-80" />
        </Toolbar>
        <CommentsList
          rows={page.items}
          now={renderTime()}
          worksUrl={`${env.siteUrl}/fa/works`}
          can={{
            moderate: can(viewer, "comments.moderate"),
            delete: can(viewer, "comments.delete"),
          }}
        />
        <Pagination page={page.page} pageSize={page.pageSize} total={page.total} />
      </Card>
    </QueryStateProvider>
  );
}
