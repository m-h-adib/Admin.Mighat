import { type Metadata } from "next";
import { Plus } from "lucide-react";
import { env } from "@/lib/env";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { listNews } from "@/lib/admin/api/news";
import { readParam } from "@/lib/admin/params";
import { adminButton } from "@/components/admin/button";
import { Card } from "@/components/admin/primitives";
import { PageHeader } from "@/components/admin/page-header";
import { AdminLink, QueryStateProvider } from "@/features/admin/navigation";
import { SearchBox, Toolbar } from "@/features/admin/list";
import { NewsTable } from "@/features/admin/news/NewsTable";

export const metadata: Metadata = { title: "اخبار و اطلاعیه‌ها" };

export default async function NewsPage({ searchParams }: PageProps<"/[locale]/admin/news">) {
  const viewer = await requirePermission("news.view");
  const items = await listNews({ q: readParam(await searchParams, "q") });

  return (
    <QueryStateProvider>
      <PageHeader
        title="اخبار و اطلاعیه‌ها"
        description="خبرهای جشنواره که در سایت نمایش داده می‌شوند."
        actions={
          can(viewer, "news.create") && (
            <AdminLink href="/admin/news/new" className={adminButton({ variant: "primary" })}>
              <Plus aria-hidden />
              خبر تازه
            </AdminLink>
          )
        }
      />
      <Card className="overflow-hidden">
        <Toolbar className="border-b border-line">
          <SearchBox placeholder="جست‌وجو در عنوان" className="w-full sm:w-72" />
        </Toolbar>
        <NewsTable
          rows={items}
          siteUrl={`${env.siteUrl}/fa`}
          can={{ publish: can(viewer, "news.publish"), delete: can(viewer, "news.delete") }}
        />
      </Card>
    </QueryStateProvider>
  );
}
