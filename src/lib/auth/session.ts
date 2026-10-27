import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/redirect";
import { roleHome, type Role } from "@/lib/auth/roles";

const SESSION_COOKIE = "miqat-role";

export type Session = { role: "participant" } | { role: "admin"; userId: string };

export const getSession = cache(async (): Promise<Session | null> => {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (value === "participant") return { role: "participant" };
  if (value?.startsWith("admin:") && value.length > 6)
    return { role: "admin", userId: value.slice(6) };
  return null;
});

export async function writeSession(session: Session) {
  (await cookies()).set(
    SESSION_COOKIE,
    session.role === "admin" ? `admin:${session.userId}` : session.role,
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.role === "admin" ? 60 * 60 * 12 : 60 * 60 * 24 * 7,
    },
  );
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function requireRole(role: Role): Promise<Session> {
  const session = await getSession();
  if (!session) return redirect("/login");
  if (session.role !== role) return redirect(roleHome[session.role]);
  return session;
}
