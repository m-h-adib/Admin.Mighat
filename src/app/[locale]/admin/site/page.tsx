import { type Metadata } from "next";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { getSiteSettings } from "@/lib/admin/api/site";
import { readOption } from "@/lib/admin/params";
import { PageHeader } from "@/components/admin/page-header";
import { LinkTabs } from "@/features/admin/common/LinkTabs";
import { BannerSettings, GeneralSettings, HomeSettings } from "@/features/admin/site/forms";

export const metadata: Metadata = { title: "تنظیمات سایت" };

const tabs = [
  { value: "general", label: "عمومی و تماس" },
  { value: "home", label: "صفحه اول" },
  { value: "banner", label: "نوار اطلاع‌رسانی" },
] as const;

export default async function SitePage({ searchParams }: PageProps<"/[locale]/admin/site">) {
  const viewer = await requirePermission("site.view");
  const [site, params] = await Promise.all([getSiteSettings(), searchParams]);
  const tab =
    readOption(
      params,
      "tab",
      tabs.map((item) => item.value),
    ) ?? "general";
  const canEdit = can(viewer, "site.edit");

  return (
    <>
      <PageHeader
        title="تنظیمات سایت"
        description="آنچه بازدیدکنندگان در سایت می‌بینند؛ تغییرات پس از ذخیره روی سایت اعمال می‌شود."
        meta={
          !canEdit && (
            <span className="text-caption text-ink-muted">
              فقط مشاهده؛ برای تغییر به دسترسی «ویرایش تنظیمات سایت» نیاز دارید.
            </span>
          )
        }
      />
      <LinkTabs
        label="بخش‌های تنظیمات"
        active={tab}
        items={tabs.map((item) => ({ ...item, href: `/admin/site?tab=${item.value}` }))}
      />
      <div className="max-w-5xl">
        {tab === "general" && <GeneralSettings site={site} canEdit={canEdit} />}
        {tab === "home" && <HomeSettings site={site} canEdit={canEdit} />}
        {tab === "banner" && <BannerSettings site={site} canEdit={canEdit} />}
      </div>
    </>
  );
}
