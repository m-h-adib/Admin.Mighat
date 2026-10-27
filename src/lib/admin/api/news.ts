import { type Localized } from "@/types/domain";
import { db, newId, nowIso } from "@/lib/admin/store";
import { getViewer } from "@/lib/admin/session";
import { matcher } from "@/lib/admin/api/util";
import { type AdminNews, type ID } from "@/lib/admin/types";

export type NewsInput = Pick<AdminNews, "title" | "body" | "cover" | "published">;

function excerptOf(body: Localized): Localized {
  const cut = (text: string) => {
    const first = text.trim().split(/\n\s*\n/)[0] ?? "";
    return first.length > 200 ? `${first.slice(0, 200).trimEnd()}…` : first;
  };
  return { fa: cut(body.fa), ...(body.en && { en: cut(body.en) }) };
}

export async function listNews(query: { q?: string } = {}) {
  const match = matcher(query.q);
  return db.news
    .filter((item) => match(item.title.fa, item.title.en))
    .sort((a, b) => b.publishAt.localeCompare(a.publishAt));
}

export async function getNews(id: ID) {
  return db.news.find((item) => item.id === id);
}

export async function createNews(input: NewsInput): Promise<ID> {
  const viewer = await getViewer();
  const id = newId();
  const now = nowIso();
  db.news.unshift({
    ...input,
    id,
    slug: `news-${id}`,
    excerpt: excerptOf(input.body),
    tone: "pine",
    publishAt: now,
    authorId: viewer?.id ?? "",
    updatedAt: now,
  });
  return id;
}

export async function updateNews(id: ID, input: NewsInput) {
  const item = db.news.find((entry) => entry.id === id);
  if (!item) return;
  const now = nowIso();
  if (input.published && !item.published) item.publishAt = now;
  Object.assign(item, input, { excerpt: excerptOf(input.body), updatedAt: now });
}

export async function setNewsPublished(id: ID, published: boolean) {
  const item = db.news.find((entry) => entry.id === id);
  if (!item) return;
  const now = nowIso();
  if (published && !item.published) item.publishAt = now;
  Object.assign(item, { published, updatedAt: now });
}

export async function deleteNews(id: ID) {
  db.news = db.news.filter((entry) => entry.id !== id);
}
