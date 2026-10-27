import { categoryIds } from "@/types/domain";
import { db, newId } from "@/lib/admin/store";
import { type ID, type SubmissionKind, type WinnerEntry } from "@/lib/admin/types";

export type WinnerInput = Omit<WinnerEntry, "id">;

export async function listWinners(editionId: ID, kind: SubmissionKind) {
  const order: string[] =
    kind === "art" ? [...categoryIds] : db.festival.topics.map((topic) => topic.id);
  return db.winners
    .filter((item) => item.editionId === editionId && item.kind === kind)
    .sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || a.rank - b.rank);
}

export async function countWinners(editionId: ID): Promise<Record<SubmissionKind, number>> {
  const counts = { art: 0, science: 0 };
  for (const item of db.winners) if (item.editionId === editionId) counts[item.kind] += 1;
  return counts;
}

export async function createWinner(input: WinnerInput): Promise<ID> {
  const item = { ...input, id: newId() };
  db.winners.push(item);
  return item.id;
}

export async function updateWinner(id: ID, input: WinnerInput) {
  const item = db.winners.find((entry) => entry.id === id);
  if (!item) return;
  Object.assign(item, input);
}

export async function setWinnerFeatured(id: ID, featured: boolean) {
  const item = db.winners.find((entry) => entry.id === id);
  if (!item || item.kind !== "art") return;
  if (featured) {
    for (const other of db.winners) {
      if (other.editionId === item.editionId && other.kind === "art" && other.rank === item.rank)
        other.featured = false;
    }
  }
  item.featured = featured;
}

export async function deleteWinner(id: ID) {
  db.winners = db.winners.filter((entry) => entry.id !== id);
}

export async function getLatestWinnersEditionId(): Promise<ID | undefined> {
  const numbers = new Map(db.festival.editions.map((edition) => [edition.id, edition.number]));
  return [...new Set(db.winners.map((winner) => winner.editionId))].sort(
    (a, b) => (numbers.get(b) ?? 0) - (numbers.get(a) ?? 0),
  )[0];
}
