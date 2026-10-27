import { categoryIds } from "@/types/domain";
import { fromJalali, jalaliMonths, toTehran } from "@/lib/jalali";
import { db } from "@/lib/admin/store";
import { formatDigits, formatWeekday } from "@/lib/admin/format";
import { emptyStatusCounts } from "@/lib/admin/api/util";
import { type Dashboard, type ID, type TrendPoint } from "@/lib/admin/types";

const DAY = 86_400_000;

function trendFrame(now: number) {
  const today = toTehran(new Date(now));
  const monthName = jalaliMonths[today.month - 1]!;
  const year = formatDigits(today.year);
  const month: TrendPoint[] = Array.from({ length: today.day }, (_, index) => ({
    key: `d${index + 1}`,
    label: formatDigits(index + 1),
    detail: formatWeekday(
      fromJalali({ year: today.year, month: today.month, day: index + 1 }, "12:00"),
    ),
    art: 0,
    science: 0,
  }));
  const months: TrendPoint[] = jalaliMonths.slice(0, today.month).map((name, index) => ({
    key: `m${index + 1}`,
    label: name,
    detail: `${name} ${year}`,
    art: 0,
    science: 0,
  }));
  return { today, month, months, monthTitle: `${monthName} ${year}`, yearTitle: `سال ${year}` };
}

export async function getDashboard(editionId: ID): Promise<Dashboard> {
  const now = Date.now();
  const weekAgo = new Date(now - 7 * DAY).toISOString();
  const twoWeeksAgo = new Date(now - 14 * DAY).toISOString();
  const people = new Map(db.participants.map((person) => [person.id, person]));
  const frame = trendFrame(now);

  const totals = { art: emptyStatusCounts(), science: emptyStatusCounts() };
  const thisWeek = { art: 0, science: 0 };
  const lastWeek = { art: 0, science: 0 };
  const participantIds = new Set<ID>();
  const newParticipants = new Set<ID>();
  const categories = new Map<string, number>();
  const topics = new Map<string, number>();
  const judging = new Map<string, { judged: number; total: number }>();

  for (const item of db.submissions) {
    if (item.editionId !== editionId) continue;
    const { kind } = item;
    totals[kind].all += 1;
    totals[kind][item.status] += 1;
    if (item.submittedAt >= weekAgo) thisWeek[kind] += 1;
    else if (item.submittedAt >= twoWeeksAgo) lastWeek[kind] += 1;

    participantIds.add(item.participantId);
    const person = people.get(item.participantId);
    if (person && person.registeredAt >= weekAgo) newParticipants.add(person.id);

    const date = toTehran(item.submittedAt);
    if (date.year === frame.today.year) {
      const month = frame.months[date.month - 1];
      if (month) month[kind] += 1;
      if (date.month === frame.today.month) {
        const day = frame.month[date.day - 1];
        if (day) day[kind] += 1;
      }
    }

    const counter = kind === "art" ? categories : topics;
    counter.set(item.category, (counter.get(item.category) ?? 0) + 1);

    if (item.status === "judging" || item.status === "judged" || item.status === "selected") {
      const key = kind === "art" ? item.category : "science";
      const entry = judging.get(key) ?? { judged: 0, total: 0 };
      entry.total += 1;
      if (item.status !== "judging") entry.judged += 1;
      judging.set(key, entry);
    }
  }

  return {
    editionId,
    totals,
    thisWeek,
    lastWeek,
    participants: { total: participantIds.size, thisWeek: newParticipants.size },
    trend: {
      month: { title: frame.monthTitle, points: frame.month },
      year: { title: frame.yearTitle, points: frame.months },
    },
    byCategory: categoryIds.map((id) => ({ id, count: categories.get(id) ?? 0 })),
    byTopic: db.festival.topics.map((topic) => ({
      id: topic.id,
      count: topics.get(topic.id) ?? 0,
    })),
    judging: [...categoryIds, "science"].flatMap((id) => {
      const entry = judging.get(id);
      return entry ? [{ id, ...entry }] : [];
    }),
  };
}
