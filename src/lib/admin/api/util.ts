import { latinDigits } from "@/lib/digits";
import { reviewStatuses, type Page, type ReviewStatus } from "@/lib/admin/types";

const DEFAULT_PAGE_SIZE = 20;

export function paginate<T>(list: T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): Page<T> {
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  return {
    items: list.slice((current - 1) * pageSize, current * pageSize),
    total: list.length,
    page: current,
    pageSize,
  };
}

export function emptyStatusCounts(): Record<ReviewStatus | "all", number> {
  return Object.fromEntries(["all", ...reviewStatuses].map((status) => [status, 0])) as Record<
    ReviewStatus | "all",
    number
  >;
}

function normalize(text: string): string {
  return latinDigits(text)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[‌ً-ٟ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function matcher(query: string | undefined) {
  const needle = query ? normalize(query) : "";
  if (!needle) return () => true;
  return (...fields: (string | undefined)[]) =>
    fields.some((field) => field !== undefined && normalize(field).includes(needle));
}
