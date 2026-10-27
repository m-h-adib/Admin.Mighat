import { db } from "@/lib/admin/store";
import {
  type AdminEdition,
  type ArtCategoryConfig,
  type EditionStats,
  type FestivalSettings,
  type ID,
  type Intake,
  type SubmissionKind,
} from "@/lib/admin/types";

export type EditionInput = Omit<AdminEdition, "id"> & { current: boolean };

export async function getFestival(): Promise<FestivalSettings> {
  return db.festival;
}

export async function getEditions(): Promise<AdminEdition[]> {
  return [...db.festival.editions].sort((a, b) => b.number - a.number);
}

export async function getCurrentEditionId(): Promise<ID> {
  return db.festival.currentEditionId;
}

export async function getEditionStats(): Promise<Record<ID, EditionStats>> {
  const stats: Record<ID, EditionStats> = {};
  const people = new Map<ID, Set<ID>>();
  for (const submission of db.submissions) {
    const entry = (stats[submission.editionId] ??= { art: 0, science: 0, participants: 0 });
    entry[submission.kind] += 1;
    const set = people.get(submission.editionId) ?? new Set<ID>();
    set.add(submission.participantId);
    people.set(submission.editionId, set);
  }
  for (const [id, set] of people) stats[id]!.participants = set.size;
  return stats;
}

export async function saveEdition(id: ID | undefined, { current, ...input }: EditionInput) {
  const existing = id ? db.festival.editions.find((item) => item.id === id) : undefined;
  const edition = existing ?? { ...input, id: String(input.number) };
  if (existing) Object.assign(existing, input);
  else db.festival.editions.push(edition);
  if (current) db.festival.currentEditionId = edition.id;
  return edition.id;
}

export async function activateEdition(id: ID) {
  if (!db.festival.editions.some((item) => item.id === id)) return false;
  db.festival.currentEditionId = id;
  return true;
}

export async function updateCategory(
  id: ArtCategoryConfig["id"],
  input: Partial<Omit<ArtCategoryConfig, "id">>,
) {
  const category = db.festival.categories.find((item) => item.id === id);
  if (category) Object.assign(category, input);
  return Boolean(category);
}

export async function setIntake(kind: SubmissionKind, intake: Intake) {
  db.festival.intake[kind] = intake;
}
