import { type Metadata } from "next";
import { categoryIds } from "@/types/domain";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { getEditions, getFestival } from "@/lib/admin/api/festival";
import { countWinners, getLatestWinnersEditionId, listWinners } from "@/lib/admin/api/winners";
import { listSubmissions } from "@/lib/admin/api/submissions";
import { categoryLabels, editionOptions, kindLabels } from "@/lib/admin/labels";
import { fullName } from "@/lib/admin/format";
import { type SubmissionKind } from "@/lib/admin/types";
import { readParam } from "@/lib/admin/params";
import { PageHeader } from "@/components/admin/page-header";
import { QueryStateProvider } from "@/features/admin/navigation";
import { EditionSelect } from "@/features/admin/list";
import { LinkTabs } from "@/features/admin/common/LinkTabs";
import { WinnersBoard } from "@/features/admin/winners/WinnersBoard";

export const metadata: Metadata = { title: "برگزیدگان" };

const kinds: SubmissionKind[] = ["art", "science"];

export default async function WinnersPage({ searchParams }: PageProps<"/[locale]/admin/winners">) {
  const viewer = await requirePermission("winners.view");
  const params = await searchParams;
  const kind: SubmissionKind = readParam(params, "kind") === "science" ? "science" : "art";
  const [festival, editions, latest] = await Promise.all([
    getFestival(),
    getEditions(),
    getLatestWinnersEditionId(),
  ]);
  const fallback = latest ?? editions[0]?.id ?? "";
  const chosenEdition = readParam(params, "edition");
  const editionId = chosenEdition ?? fallback;
  const canEdit = can(viewer, "winners.edit");
  const [winners, counts, selected] = await Promise.all([
    listWinners(editionId, kind),
    countWinners(editionId),
    canEdit
      ? listSubmissions({
          kind,
          editionId,
          status: "selected",
          sort: "score",
          pageSize: 500,
        })
      : null,
  ]);

  const sections =
    kind === "art"
      ? categoryIds.map((id) => ({ id, label: categoryLabels[id] }))
      : festival.topics
          .filter(
            (topic) => topic.enabled || winners.some((winner) => winner.category === topic.id),
          )
          .map((topic) => ({ id: topic.id, label: topic.title.fa }));

  const tabHref = (value: SubmissionKind) => {
    const query = new URLSearchParams();
    if (value === "science") query.set("kind", value);
    if (chosenEdition) query.set("edition", chosenEdition);
    const text = query.toString();
    return text ? `/admin/winners?${text}` : "/admin/winners";
  };

  return (
    <QueryStateProvider>
      <PageHeader
        title="برگزیدگان"
        description="برگزیدگان بخش هنری و بخش علمی جدا تعیین و اعلام می‌شوند؛ این فهرست در صفحه «برگزیدگان» سایت نمایش داده می‌شود."
        actions={<EditionSelect current={fallback} editions={editionOptions(editions)} />}
      />
      <LinkTabs
        label="بخش‌های برگزیدگان"
        active={kind}
        items={kinds.map((value) => ({
          value,
          label: kindLabels[value].section,
          href: tabHref(value),
          count: counts[value],
        }))}
      />
      <WinnersBoard
        key={kind}
        kind={kind}
        editionId={editionId}
        sections={sections}
        winners={winners}
        canEdit={canEdit}
        candidates={(selected?.items ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          name: fullName(item.participant),
          province: item.participant.province,
          category: item.category,
          score: item.score,
        }))}
      />
    </QueryStateProvider>
  );
}
