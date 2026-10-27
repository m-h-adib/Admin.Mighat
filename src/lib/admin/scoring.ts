import { type Criterion, type ID } from "@/lib/admin/types";

export function weightedScore(criteria: Criterion[], scores: Record<ID, number>): number {
  return Math.round(
    criteria.reduce(
      (sum, criterion) => sum + ((scores[criterion.id] ?? 0) / 10) * criterion.weight,
      0,
    ),
  );
}
