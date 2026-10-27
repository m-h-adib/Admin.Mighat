import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { requireViewer } from "@/lib/admin/session";
import { getUser } from "@/lib/admin/api/access";
import { Avatar, Badge } from "@/components/admin/primitives";
import { PageHeader } from "@/components/admin/page-header";
import { ProfileForm } from "@/features/admin/profile/ProfileForm";

export const metadata: Metadata = { title: "حساب کاربری من" };

export default async function ProfilePage() {
  const viewer = await requireViewer();
  const user = await getUser(viewer.id);
  if (!user) notFound();
  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <Avatar name={user.name} id={user.id} size="lg" />
            حساب کاربری من
          </span>
        }
        meta={<Badge tone="teal">{viewer.title}</Badge>}
      />
      <ProfileForm user={user} />
    </>
  );
}
