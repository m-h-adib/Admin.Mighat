import { db, newId, nowIso } from "@/lib/admin/store";
import { matcher } from "@/lib/admin/api/util";
import { type Permission } from "@/lib/admin/permissions";
import { type ID, type StaffUser, type SubmissionKind } from "@/lib/admin/types";

export type UserInput = Pick<
  StaffUser,
  "name" | "nationalId" | "phone" | "email" | "permissions" | "scope"
>;

export async function listUsers(query: { q?: string } = {}): Promise<StaffUser[]> {
  const match = matcher(query.q);
  return db.users.filter((user) => match(user.name, user.nationalId, user.phone, user.email));
}

export async function getUser(id: ID): Promise<StaffUser | undefined> {
  return db.users.find((item) => item.id === id);
}

export async function isNationalIdTaken(nationalId: string, exceptId?: ID) {
  return db.users.some((user) => user.nationalId === nationalId && user.id !== exceptId);
}

export async function createUser(input: UserInput): Promise<ID> {
  const user = { ...input, id: newId(), createdAt: nowIso() };
  db.users.push(user);
  return user.id;
}

export async function updateUser(id: ID, input: UserInput) {
  const user = db.users.find((item) => item.id === id);
  if (user) Object.assign(user, input);
}

export async function deleteUser(id: ID) {
  db.users = db.users.filter((item) => item.id !== id);
}

export async function countAccessManagers(exceptId?: ID) {
  return db.users.filter(
    (user) => user.id !== exceptId && user.permissions.includes("access.manage"),
  ).length;
}

export async function listJudges(kind: SubmissionKind) {
  const permission: Permission = `${kind}.judge`;
  return db.users
    .filter((user) => user.permissions.includes(permission))
    .map((user) => ({ id: user.id, name: user.name, scope: user.scope }));
}

export async function listStaffNames() {
  return new Map(db.users.map((user) => [user.id, user.name]));
}
