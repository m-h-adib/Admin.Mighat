import { type Session } from "@/lib/auth/session";
import { db } from "@/lib/admin/store";
import { type ID } from "@/lib/admin/types";

export async function sessionFor(nationalId: string): Promise<Session> {
  const user = db.users.find((item) => item.nationalId === nationalId);
  return user ? { role: "admin", userId: user.id } : { role: "participant" };
}

export async function updateProfile(
  userId: ID,
  input: { name: string; phone: string; email: string },
) {
  const user = db.users.find((item) => item.id === userId);
  if (user) Object.assign(user, input);
}
