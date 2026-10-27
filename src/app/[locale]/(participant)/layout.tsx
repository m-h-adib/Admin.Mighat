import { requireRole } from "@/lib/auth/session";
import { PanelShell } from "@/features/panel/PanelShell";

export default async function ParticipantLayout({ children }: LayoutProps<"/[locale]">) {
  await requireRole("participant");
  return <PanelShell>{children}</PanelShell>;
}
