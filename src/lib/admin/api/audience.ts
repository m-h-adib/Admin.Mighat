import { db } from "@/lib/admin/store";
import { getViewer } from "@/lib/admin/session";
import { matcher, paginate } from "@/lib/admin/api/util";
import {
  type CommentState,
  type ID,
  type InboxMessage,
  type MessageState,
  type Page,
  type WorkComment,
} from "@/lib/admin/types";

export interface CommentQuery {
  q?: string;
  state?: CommentState;
  workId?: ID;
  page?: number;
}

export type CommentPage = Page<WorkComment> & { counts: Record<CommentState | "all", number> };

export async function listComments(query: CommentQuery = {}): Promise<CommentPage> {
  const match = matcher(query.q);
  const counts = { all: 0, pending: 0, approved: 0, rejected: 0 };
  const rows: WorkComment[] = [];
  for (const comment of db.comments) {
    if (query.workId && comment.work.id !== query.workId) continue;
    if (!match(comment.author, comment.text, comment.work.title)) continue;
    counts.all += 1;
    counts[comment.state] += 1;
    if (!query.state || comment.state === query.state) rows.push(comment);
  }
  rows.sort((a, b) => b.date.localeCompare(a.date));
  return { ...paginate(rows, query.page, 25), counts };
}

export async function findCommentWork(workId: ID) {
  return db.comments.find((comment) => comment.work.id === workId)?.work;
}

export async function setCommentState(ids: ID[], state: CommentState) {
  const targets = new Set(ids);
  for (const comment of db.comments) if (targets.has(comment.id)) comment.state = state;
}

export async function deleteComments(ids: ID[]) {
  const targets = new Set(ids);
  db.comments = db.comments.filter((comment) => !targets.has(comment.id));
}

export interface InboxQuery {
  q?: string;
  state?: MessageState;
}

export async function listMessages(query: InboxQuery = {}) {
  const match = matcher(query.q);
  const counts = { all: 0, new: 0, read: 0, answered: 0 };
  const users = new Map(db.users.map((user) => [user.id, user.name]));
  const items: (InboxMessage & { handler?: string })[] = [];
  for (const message of db.inbox) {
    if (!match(message.name, message.reply, message.message)) continue;
    counts.all += 1;
    counts[message.state] += 1;
    if (query.state && message.state !== query.state) continue;
    items.push({ ...message, handler: message.handledBy && users.get(message.handledBy) });
  }
  items.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  return { items, counts };
}

export async function updateMessage(id: ID, patch: Partial<Pick<InboxMessage, "state" | "note">>) {
  const message = db.inbox.find((item) => item.id === id);
  if (!message) return;
  Object.assign(message, patch);
  if (patch.state === "answered" || patch.note) message.handledBy = (await getViewer())?.id;
}

export async function getAudienceCounts() {
  let comments = 0;
  let messages = 0;
  for (const comment of db.comments) if (comment.state === "pending") comments += 1;
  for (const message of db.inbox) if (message.state === "new") messages += 1;
  return { comments, messages };
}
