import { randomUUID } from "node:crypto";
import { createSeed } from "@/lib/admin/seed";
import {
  type AdminNews,
  type FestivalSettings,
  type ID,
  type InboxMessage,
  type MediaAsset,
  type Participant,
  type SiteSettings,
  type StaffUser,
  type Submission,
  type Timer,
  type WinnerEntry,
  type WorkComment,
} from "@/lib/admin/types";

export interface AdminDb {
  festival: FestivalSettings;
  timers: Timer[];
  participants: Participant[];
  submissions: Submission[];
  news: AdminNews[];
  winners: WinnerEntry[];
  comments: WorkComment[];
  inbox: InboxMessage[];
  site: SiteSettings;
  users: StaffUser[];
  media: Map<ID, { asset: MediaAsset; data: Uint8Array<ArrayBuffer> }>;
}

const holder = globalThis as typeof globalThis & { __miqatPanelDb?: AdminDb };

export const db: AdminDb = (holder.__miqatPanelDb ??= createSeed());

export function newId(): ID {
  return randomUUID().slice(0, 8);
}

export function nowIso(): string {
  return new Date().toISOString();
}
