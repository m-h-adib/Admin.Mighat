import { type Pathname } from "@/i18n/href";

export type Role = "participant" | "admin";

export const roleHome = {
  participant: "/",
  admin: "/admin",
} as const satisfies Record<Role, Pathname>;
