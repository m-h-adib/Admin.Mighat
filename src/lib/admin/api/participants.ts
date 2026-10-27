import { db } from "@/lib/admin/store";
import { matcher, paginate } from "@/lib/admin/api/util";
import {
  type ID,
  type Page,
  type Participant,
  type ParticipantRow,
  type Submission,
} from "@/lib/admin/types";

export interface ParticipantQuery {
  q?: string;
  province?: string;
  editionId?: ID;
  page?: number;
  pageSize?: number;
}

function counts(editionId?: ID) {
  const map = new Map<ID, { art: number; science: number }>();
  for (const submission of db.submissions) {
    if (editionId && submission.editionId !== editionId) continue;
    const entry = map.get(submission.participantId) ?? { art: 0, science: 0 };
    entry[submission.kind] += 1;
    map.set(submission.participantId, entry);
  }
  return map;
}

export async function listParticipants(
  query: ParticipantQuery = {},
): Promise<Page<ParticipantRow>> {
  const match = matcher(query.q);
  const totals = counts(query.editionId);
  const rows = db.participants
    .filter(
      (person) =>
        (!query.editionId || totals.has(person.id)) &&
        (!query.province || person.province === query.province) &&
        match(
          `${person.firstName} ${person.lastName}`,
          person.nationalId,
          person.phone,
          person.caravanNo,
        ),
    )
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .map((person) => ({ ...person, ...(totals.get(person.id) ?? { art: 0, science: 0 }) }));
  return paginate(rows, query.page, query.pageSize);
}

export async function getParticipant(
  id: ID,
): Promise<(Participant & { submissions: Submission[] }) | undefined> {
  const person = db.participants.find((item) => item.id === id);
  if (!person) return undefined;
  return {
    ...person,
    submissions: db.submissions
      .filter((item) => item.participantId === id)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
  };
}

export async function updateParticipant(
  id: ID,
  input: Pick<Participant, "firstName" | "lastName" | "phone" | "caravanNo" | "province">,
) {
  const person = db.participants.find((item) => item.id === id);
  if (!person) return;
  Object.assign(person, input);
}

export async function listProvinces(): Promise<string[]> {
  return [...new Set(db.participants.map((person) => person.province))].sort((a, b) =>
    a.localeCompare(b, "fa"),
  );
}
