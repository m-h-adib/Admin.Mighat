import { type Metadata } from "next";
import { requirePermission } from "@/lib/admin/session";
import { getEditions, getFestival } from "@/lib/admin/api/festival";
import { listParticipants, listProvinces } from "@/lib/admin/api/participants";
import { editionOptions } from "@/lib/admin/labels";
import { formatNumber } from "@/lib/admin/format";
import { readPage, readParam } from "@/lib/admin/params";
import { Card } from "@/components/admin/primitives";
import { PageHeader } from "@/components/admin/page-header";
import { QueryStateProvider } from "@/features/admin/navigation";
import { EditionSelect, FilterSelect, Pagination, SearchBox, Toolbar } from "@/features/admin/list";
import { ParticipantsTable } from "@/features/admin/participants/ParticipantsTable";

export const metadata: Metadata = { title: "شرکت‌کنندگان" };

export default async function ParticipantsPage({
  searchParams,
}: PageProps<"/[locale]/admin/participants">) {
  await requirePermission("participants.view");
  const [params, festival, editions, provinces] = await Promise.all([
    searchParams,
    getFestival(),
    getEditions(),
    listProvinces(),
  ]);
  const page = await listParticipants({
    q: readParam(params, "q"),
    province: readParam(params, "province"),
    editionId: readParam(params, "edition") ?? festival.currentEditionId,
    page: readPage(params),
  });

  return (
    <QueryStateProvider>
      <PageHeader
        title="شرکت‌کنندگان"
        description="زائرانی که در این دوره اثر یا مقاله فرستاده‌اند."
        actions={
          <EditionSelect current={festival.currentEditionId} editions={editionOptions(editions)} />
        }
      />
      <Card className="overflow-hidden">
        <Toolbar className="border-b border-line">
          <SearchBox placeholder="نام، کد ملی، موبایل یا شماره کاروان" className="w-full sm:w-80" />
          <FilterSelect
            param="province"
            label="استان"
            allLabel="همه استان‌ها"
            options={provinces.map((name) => ({ value: name, label: name }))}
          />
          <p className="ms-auto text-caption text-ink-muted">{formatNumber(page.total)} نفر</p>
        </Toolbar>
        <ParticipantsTable rows={page.items} />
        <Pagination page={page.page} pageSize={page.pageSize} total={page.total} />
      </Card>
    </QueryStateProvider>
  );
}
