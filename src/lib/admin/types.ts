import { type CategoryId, type Localized, type Rank, type Tone } from "@/types/domain";
import { type Permission } from "@/lib/admin/permissions";

export type ID = string;

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type ActionResult =
  | { ok: true; message?: string; id?: ID }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export interface AdminEdition {
  id: ID;
  number: number;
  title: Localized;
  papersDeadline?: string;
  worksDeadline?: string;
  closingDate?: string;
}

export interface EditionStats {
  art: number;
  science: number;
  participants: number;
}

export interface ArtCategoryConfig {
  id: CategoryId;
  enabled: boolean;
  formats: string[];
  maxSizeMb: number;
  maxDurationMin?: number;
  maxPerParticipant: number;
  guide: Localized;
}

export interface ScienceTopic {
  id: ID;
  title: Localized;
  enabled: boolean;
}

export interface Criterion {
  id: ID;
  title: string;
  weight: number;
}

export interface Intake {
  open: boolean;
  closedMessage: Localized;
}

export interface FestivalSettings {
  currentEditionId: ID;
  editions: AdminEdition[];
  categories: ArtCategoryConfig[];
  topics: ScienceTopic[];
  criteria: Record<SubmissionKind, Criterion[]>;
  intake: Record<SubmissionKind, Intake>;
}

export const timerScopes = ["art", "science", "general"] as const;
export type TimerScope = (typeof timerScopes)[number];

export interface Timer {
  id: ID;
  name: string;
  label: Localized;
  editionId: ID;
  scope: TimerScope;
  startsAt?: string;
  endsAt: string;
  originalEndsAt?: string;
  active: boolean;
  updatedAt: string;
}

export type TimerState = "running" | "scheduled" | "ended" | "inactive";

export type TimerRow = Timer & { state: TimerState };

export const MAX_TIMERS = 2;

export interface Participant {
  id: ID;
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  caravanNo: string;
  province: string;
  gender: "male" | "female";
  birthYear: number;
  registeredAt: string;
}

export interface ParticipantRow extends Participant {
  art: number;
  science: number;
}

export type SubmissionKind = "art" | "science";

export const reviewStatuses = ["pending", "judging", "judged", "selected", "rejected"] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

export interface SubmissionFile {
  name: string;
  type: "image" | "video" | "audio" | "text" | "document";
  size: number;
  url?: string;
}

export interface JudgeAssignment {
  judgeId: ID;
  assignedAt: string;
  scores?: Record<ID, number>;
  total?: number;
  comment?: string;
  scoredAt?: string;
}

export interface Submission {
  id: ID;
  code: string;
  kind: SubmissionKind;
  editionId: ID;
  category: string;
  title: string;
  summary: string;
  file: SubmissionFile;
  participantId: ID;
  submittedAt: string;
  status: ReviewStatus;
  rejectReason?: string;
  rank?: Rank;
  assignments: JudgeAssignment[];
  score?: number;
}

export type SubmissionRow = Omit<Submission, "summary" | "file"> & {
  participant: Pick<
    Participant,
    "id" | "firstName" | "lastName" | "nationalId" | "phone" | "caravanNo" | "province"
  >;
};

export interface SubmissionDetail extends Submission {
  participant: Participant;
}

export const submissionSorts = ["newest", "oldest", "score"] as const;
export type SubmissionSort = (typeof submissionSorts)[number];

export interface SubmissionQuery {
  kind: SubmissionKind;
  editionId: ID;
  status?: ReviewStatus;
  category?: string;
  province?: string;
  q?: string;
  participantId?: ID;
  assignedTo?: ID;
  unscored?: boolean;
  from?: string;
  to?: string;
  sort?: SubmissionSort;
  page?: number;
  pageSize?: number;
}

export interface SubmissionPage extends Page<SubmissionRow> {
  counts: Record<ReviewStatus | "all", number>;
}

export interface AdminNews {
  id: ID;
  slug: string;
  title: Localized;
  excerpt: Localized;
  body: Localized;
  cover?: string;
  tone: Tone;
  published: boolean;
  publishAt: string;
  authorId: ID;
  updatedAt: string;
}

export interface WinnerEntry {
  id: ID;
  editionId: ID;
  kind: SubmissionKind;
  category: string;
  rank: Rank;
  title: Localized;
  name: Localized;
  province: Localized;
  featured: boolean;
  submissionId?: ID;
}

export const homeSections = [
  "hero",
  "hizam",
  "stats",
  "news",
  "steps",
  "submit",
  "works",
  "winners",
  "faq",
  "cta",
] as const;
export type HomeSection = (typeof homeSections)[number];

export const channelKeys = ["eitaa", "bale", "rubika", "telegram", "instagram", "aparat"] as const;
export type ChannelKey = (typeof channelKeys)[number];

export interface SiteSettings {
  identity: { name: Localized; tagline: Localized };
  contact: { phone: string; email: string; address: Localized; hours: Localized };
  channels: Record<ChannelKey, { url: string; handle: string }>;
  home: {
    sections: Record<HomeSection, boolean>;
    newsCount: number;
    worksCount: number;
    stats: { mode: "auto" | "manual"; works: number; categories: number; editions: number };
  };
  banner: {
    enabled: boolean;
    text: Localized;
    link: string;
    linkLabel: Localized;
    startsAt?: string;
    endsAt?: string;
  };
}

export type CommentState = "pending" | "approved" | "rejected";

export interface CommentWork {
  id: ID;
  title: string;
  category: CategoryId;
}

export interface WorkComment {
  id: ID;
  work: CommentWork;
  author: string;
  text: string;
  date: string;
  state: CommentState;
}

export type MessageState = "new" | "read" | "answered";

export interface InboxMessage {
  id: ID;
  name: string;
  reply: string;
  message: string;
  receivedAt: string;
  state: MessageState;
  note?: string;
  handledBy?: ID;
}

export interface JudgeScope {
  categories: CategoryId[];
  topics: ID[];
}

export interface StaffUser {
  id: ID;
  name: string;
  nationalId: string;
  phone: string;
  email: string;
  permissions: Permission[];
  scope: JudgeScope;
  createdAt: string;
}

export interface Viewer {
  id: ID;
  name: string;
  title: string;
  permissions: Permission[];
  scope: JudgeScope;
}

export interface TrendPoint {
  key: string;
  label: string;
  detail: string;
  art: number;
  science: number;
}

export type TrendRange = "month" | "year";

export interface Dashboard {
  editionId: ID;
  totals: Record<SubmissionKind, Record<ReviewStatus | "all", number>>;
  thisWeek: Record<SubmissionKind, number>;
  lastWeek: Record<SubmissionKind, number>;
  participants: { total: number; thisWeek: number };
  trend: Record<TrendRange, { title: string; points: TrendPoint[] }>;
  byCategory: { id: string; count: number }[];
  byTopic: { id: string; count: number }[];
  judging: { id: string; judged: number; total: number }[];
}

export const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MEDIA_MAX_MB = 8;

export interface MediaAsset {
  id: ID;
  name: string;
  type: string;
  size: number;
  url: string;
}
