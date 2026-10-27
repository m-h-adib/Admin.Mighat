import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { getNews } from "@/lib/admin/api/news";
import { formatDateTime } from "@/lib/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { NewsEditor } from "@/features/admin/news/NewsEditor";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/news/[id]">): Promise<Metadata> {
  const news = await getNews((await params).id);
  return { title: news?.title.fa ?? "خبر" };
}

export default async function EditNewsPage({ params }: PageProps<"/[locale]/admin/news/[id]">) {
  const viewer = await requirePermission("news.edit");
  const news = await getNews((await params).id);
  if (!news) notFound();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/news", label: "اخبار و اطلاعیه‌ها" }}
        title="ویرایش خبر"
        description={`آخرین ویرایش: ${formatDateTime(news.updatedAt)}`}
      />
      <NewsEditor
        news={news}
        siteUrl={`${env.siteUrl}/fa`}
        canPublish={can(viewer, "news.publish")}
        canDelete={can(viewer, "news.delete")}
      />
    </>
  );
}
