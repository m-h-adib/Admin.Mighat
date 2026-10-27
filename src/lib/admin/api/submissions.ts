import { type Rank } from "@/types/domain";
import { db, nowIso } from "@/lib/admin/store";
import { emptyStatusCounts, matcher, paginate } from "@/lib/admin/api/util";
import { reviewLabels, sectionLabels } from "@/lib/admin/labels";
import { weightedScore } from "@/lib/admin/scoring";
import {
  type ID,
  type Participant,
  type ReviewStatus,
  type Submission,
  type SubmissionDetail,
  type SubmissionKind,
  type SubmissionPage,
  type SubmissionQuery,
  type SubmissionRow,
} from "@/lib/admin/types";

function toRow(submission: Submission, person: Participant): SubmissionRow {
  return {
    id: submission.id,
    code: submission.code,
    kind: submission.kind,
    editionId: submission.editionId,
    category: submission.category,
    title: submission.title,
    participantId: submission.participantId,
    submittedAt: submission.submittedAt,
    status: submission.status,
    rejectReason: submission.rejectReason,
    rank: submission.rank,
    assignments: submission.assignments,
    score: submission.score,
    participant: {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      nationalId: person.nationalId,
      phone: person.phone,
      caravanNo: person.caravanNo,
      province: person.province,
    },
  };
}

function select(query: SubmissionQuery) {
  const persons = new Map(db.participants.map((participant) => [participant.id, participant]));
  const match = matcher(query.q);
  const counts = emptyStatusCounts();
  const list: Submission[] = [];

  for (const submission of db.submissions) {
    if (submission.kind !== query.kind || submission.editionId !== query.editionId) continue;
    if (query.category && submission.category !== query.category) continue;
    if (query.participantId && submission.participantId !== query.participantId) continue;
    if (query.from && submission.submittedAt < query.from) continue;
    if (query.to && submission.submittedAt > query.to) continue;
    if (
      query.assignedTo &&
      !submission.assignments.some(
        (assignment) =>
          assignment.judgeId === query.assignedTo &&
          (!query.unscored || assignment.total === undefined),
      )
    )
      continue;
    const person = persons.get(submission.participantId);
    if (!person) continue;
    if (query.province && person.province !== query.province) continue;
    if (
      !match(
        submission.title,
        submission.code,
        `${person.firstName} ${person.lastName}`,
        person.nationalId,
        person.phone,
        person.caravanNo,
      )
    )
      continue;
    counts.all += 1;
    counts[submission.status] += 1;
    if (!query.status || submission.status === query.status) list.push(submission);
  }

  list.sort((a, b) => {
    if (query.sort === "oldest") return a.submittedAt.localeCompare(b.submittedAt);
    if (query.sort === "score") return (b.score ?? -1) - (a.score ?? -1);
    return b.submittedAt.localeCompare(a.submittedAt);
  });
  return { sorted: list, counts, persons };
}

export async function listSubmissions(query: SubmissionQuery): Promise<SubmissionPage> {
  const { sorted, counts, persons } = select(query);
  const page = paginate(sorted, query.page, query.pageSize);
  return {
    ...page,
    items: page.items.map((item) => toRow(item, persons.get(item.participantId)!)),
    counts,
  };
}

export async function getSubmission(id: ID): Promise<SubmissionDetail | undefined> {
  const submission = db.submissions.find((item) => item.id === id);
  const participant =
    submission && db.participants.find((item) => item.id === submission.participantId);
  return submission && participant ? { ...submission, participant } : undefined;
}

export async function getAdjacent(query: SubmissionQuery, id: ID) {
  const { sorted } = select(query);
  const index = sorted.findIndex((item) => item.id === id);
  if (index === -1) return { total: sorted.length };
  return {
    position: index + 1,
    total: sorted.length,
    prev: sorted[index - 1]?.id,
    next: sorted[index + 1]?.id,
  };
}

export async function getPendingCounts(editionId: ID): Promise<Record<SubmissionKind, number>> {
  const counts = { art: 0, science: 0 };
  for (const item of db.submissions) {
    if (item.editionId === editionId && item.status === "pending") counts[item.kind] += 1;
  }
  return counts;
}

export async function getJudgeQueue(
  judgeId: ID,
  editionId: ID,
): Promise<Record<SubmissionKind, number>> {
  const queue = { art: 0, science: 0 };
  for (const item of db.submissions) {
    if (
      item.editionId === editionId &&
      item.assignments.some(
        (assignment) => assignment.judgeId === judgeId && assignment.total === undefined,
      )
    ) {
      queue[item.kind] += 1;
    }
  }
  return queue;
}

export async function setReviewStatus(
  ids: ID[],
  status: ReviewStatus,
  options: { reason?: string; rank?: Rank } = {},
) {
  const targets = new Set(ids);
  let count = 0;
  for (const submission of db.submissions) {
    if (!targets.has(submission.id)) continue;
    submission.status = status;
    submission.rejectReason = status === "rejected" ? options.reason : undefined;
    submission.rank = status === "selected" ? options.rank : undefined;
    count += 1;
  }
  return count;
}

export async function assignJudges(ids: ID[], judgeIds: ID[]) {
  const targets = new Set(ids);
  const judges = new Set(
    db.users.filter((user) => judgeIds.includes(user.id)).map((user) => user.id),
  );
  let count = 0;
  for (const submission of db.submissions) {
    if (!targets.has(submission.id)) continue;
    const assigned = new Set(submission.assignments.map((assignment) => assignment.judgeId));
    for (const judgeId of judges) {
      if (!assigned.has(judgeId)) submission.assignments.push({ judgeId, assignedAt: nowIso() });
    }
    if (submission.status === "pending" || submission.status === "judged") {
      submission.status = "judging";
    }
    count += 1;
  }
  return count;
}

const average = (values: number[]) =>
  values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : undefined;

export async function scoreSubmission(
  id: ID,
  judgeId: ID,
  scores: Record<ID, number>,
  comment?: string,
) {
  const submission = db.submissions.find((item) => item.id === id);
  if (!submission) return;
  const total = weightedScore(db.festival.criteria[submission.kind], scores);
  let assignment = submission.assignments.find((item) => item.judgeId === judgeId);
  if (!assignment) {
    assignment = { judgeId, assignedAt: nowIso() };
    submission.assignments.push(assignment);
  }
  Object.assign(assignment, { scores, total, comment: comment || undefined, scoredAt: nowIso() });
  submission.score = average(
    submission.assignments.flatMap((item) => (item.total === undefined ? [] : [item.total])),
  );
  if (
    submission.status === "judging" &&
    submission.assignments.every((item) => item.total !== undefined)
  ) {
    submission.status = "judged";
  }
}

export async function deleteSubmissions(ids: ID[]) {
  const targets = new Set(ids);
  db.submissions = db.submissions.filter((item) => !targets.has(item.id));
}

const csvCell = (value: string | number | undefined) => {
  const text = value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export async function exportSubmissions(query: SubmissionQuery): Promise<string> {
  const { sorted, persons } = select(query);
  const sections = sectionLabels(query.kind, db.festival.topics);
  const header = [
    "کد رهگیری",
    "عنوان",
    query.kind === "art" ? "بخش" : "محور",
    "نام",
    "نام خانوادگی",
    "کد ملی",
    "تلفن همراه",
    "شماره کاروان",
    "استان",
    "تاریخ ارسال",
    "وضعیت",
    "امتیاز",
    "رتبه",
  ];
  const rows = sorted.map((item) => {
    const person = persons.get(item.participantId)!;
    return [
      item.code,
      item.title,
      sections[item.category],
      person.firstName,
      person.lastName,
      person.nationalId,
      person.phone,
      person.caravanNo,
      person.province,
      item.submittedAt.slice(0, 10),
      reviewLabels[item.status],
      item.score,
      item.rank,
    ];
  });
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}
