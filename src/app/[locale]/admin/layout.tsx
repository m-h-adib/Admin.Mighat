import { env } from "@/lib/env";
import { requireRole } from "@/lib/auth/session";
import { can } from "@/lib/admin/permissions";
import { requireViewer } from "@/lib/admin/session";
import { getFestival } from "@/lib/admin/api/festival";
import { getJudgeQueue, getPendingCounts } from "@/lib/admin/api/submissions";
import { getAudienceCounts } from "@/lib/admin/api/audience";
import { editionName } from "@/lib/admin/labels";
import { AdminProviders } from "@/features/admin/shell/AdminProviders";
import { AdminShell } from "@/features/admin/shell/AdminShell";

export default async function AdminLayout({ children }: LayoutProps<"/[locale]/admin">) {
  await requireRole("admin");
  const viewer = await requireViewer();
  const festival = await getFestival();
  const editionId = festival.currentEditionId;
  const [pending, queue, audience] = await Promise.all([
    getPendingCounts(editionId),
    getJudgeQueue(viewer.id, editionId),
    getAudienceCounts(),
  ]);
  const edition = festival.editions.find((item) => item.id === editionId);
  const badge = (kind: "art" | "science") =>
    can(viewer, `${kind}.review`) ? pending[kind] : can(viewer, `${kind}.judge`) ? queue[kind] : 0;

  return (
    <AdminProviders>
      <AdminShell
        viewer={viewer}
        siteUrl={`${env.siteUrl}/fa`}
        edition={{
          name: edition ? editionName(edition.number) : "",
          open: festival.intake.art.open || festival.intake.science.open,
        }}
        badges={{
          art: badge("art"),
          science: badge("science"),
          comments: can(viewer, "comments.moderate") ? audience.comments : 0,
          messages: can(viewer, "inbox.view") ? audience.messages : 0,
        }}
      >
        {children}
      </AdminShell>
    </AdminProviders>
  );
}
