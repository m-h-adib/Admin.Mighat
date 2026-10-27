import { type Metadata } from "next";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { getEditions, getFestival } from "@/lib/admin/api/festival";
import { listTimers } from "@/lib/admin/api/timers";
import { editionOptions } from "@/lib/admin/labels";
import { renderTime } from "@/lib/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { TimersBoard } from "@/features/admin/timers/TimersBoard";

export const metadata: Metadata = { title: "زمان‌بندی‌ها" };

export default async function TimersPage({ searchParams }: PageProps<"/[locale]/admin/timers">) {
  const viewer = await requirePermission("timers.view");
  const [timers, editions, festival, params] = await Promise.all([
    listTimers(),
    getEditions(),
    getFestival(),
    searchParams,
  ]);
  return (
    <>
      <PageHeader
        title="زمان‌بندی‌ها"
        description="شمارنده‌های معکوس سایت؛ برای هر دوره و بخش جداگانه."
      />
      <TimersBoard
        timers={timers}
        editions={editionOptions(editions)}
        currentEditionId={festival.currentEditionId}
        now={renderTime()}
        canEdit={can(viewer, "timers.edit")}
        openNew={params.new === "1"}
      />
    </>
  );
}
