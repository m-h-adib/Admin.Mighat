import { type Metadata } from "next";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { getEditions, getEditionStats, getFestival } from "@/lib/admin/api/festival";
import { readOption } from "@/lib/admin/params";
import { PageHeader } from "@/components/admin/page-header";
import { LinkTabs } from "@/features/admin/common/LinkTabs";
import { CategoriesPanel, EditionsPanel, IntakeCard } from "@/features/admin/festival/panels";

export const metadata: Metadata = { title: "دوره‌ها و بخش‌ها" };

const tabs = [
  { value: "editions", label: "دوره‌ها" },
  { value: "art", label: "بخش هنری" },
  { value: "science", label: "بخش علمی" },
] as const;

export default async function FestivalPage({
  searchParams,
}: PageProps<"/[locale]/admin/festival">) {
  const viewer = await requirePermission("festival.view");
  const [festival, editions, stats, params] = await Promise.all([
    getFestival(),
    getEditions(),
    getEditionStats(),
    searchParams,
  ]);
  const tab =
    readOption(
      params,
      "tab",
      tabs.map((item) => item.value),
    ) ?? "editions";
  const canEdit = can(viewer, "festival.edit");

  return (
    <>
      <PageHeader
        title="دوره‌ها و بخش‌ها"
        description="ساختار جشنواره: دوره‌ها، بخش‌های هنری و پذیرش آثار."
      />
      <LinkTabs
        label="بخش‌های تنظیمات جشنواره"
        active={tab}
        items={tabs.map((item) => ({ ...item, href: `/admin/festival?tab=${item.value}` }))}
      />

      {tab === "editions" && (
        <EditionsPanel
          editions={editions}
          currentEditionId={festival.currentEditionId}
          stats={stats}
          canEdit={canEdit}
        />
      )}
      {tab === "art" && (
        <>
          <IntakeCard kind="art" intake={festival.intake.art} canEdit={canEdit} />
          <CategoriesPanel categories={festival.categories} canEdit={canEdit} />
        </>
      )}
      {tab === "science" && (
        <IntakeCard kind="science" intake={festival.intake.science} canEdit={canEdit} />
      )}
    </>
  );
}
