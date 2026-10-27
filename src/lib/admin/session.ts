import { cache } from "react";
import { redirect } from "@/i18n/redirect";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/admin/store";
import { can, managerTitle, type Permission } from "@/lib/admin/permissions";
import { type Viewer } from "@/lib/admin/types";

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await getSession();
  if (session?.role !== "admin") return null;
  const user = db.users.find((item) => item.id === session.userId);
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    title: managerTitle(user.permissions),
    permissions: user.permissions,
    scope: user.scope,
  };
});

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) return redirect("/login");
  return viewer;
}

export async function requirePermission(permission: Permission): Promise<Viewer> {
  const viewer = await requireViewer();
  if (!can(viewer, permission)) return redirect("/admin/forbidden");
  return viewer;
}

export async function authorize(permission: Permission): Promise<Viewer | null> {
  const viewer = await getViewer();
  return viewer && can(viewer, permission) ? viewer : null;
}
