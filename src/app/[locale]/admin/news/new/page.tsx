import { type Metadata } from "next";
import { env } from "@/lib/env";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { PageHeader } from "@/components/admin/page-header";
import { NewsEditor } from "@/features/admin/news/NewsEditor";

export const metadata: Metadata = { title: "خبر تازه" };

export default async function NewNewsPage() {
  const viewer = await requirePermission("news.create");
  return (
    <>
      <PageHeader back={{ href: "/admin/news", label: "اخبار و اطلاعیه‌ها" }} title="خبر تازه" />
      <NewsEditor
        siteUrl={`${env.siteUrl}/fa`}
        canPublish={can(viewer, "news.publish")}
        canDelete={false}
      />
    </>
  );
}
