"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { adminButton } from "@/components/admin/button";
import { controlClass } from "@/components/admin/form";
import { Select, type SelectOption } from "@/components/admin/controls";
import { DatePicker } from "@/components/admin/date-picker";
import { formatDigits, formatNumber } from "@/lib/admin/format";
import { useQueryState } from "@/features/admin/navigation";

export function SearchBox({
  placeholder,
  param = "q",
  className,
}: {
  placeholder: string;
  param?: string;
  className?: string;
}) {
  const { params, update } = useQueryState();
  const current = params.get(param) ?? "";
  const [value, setValue] = useState(current);
  const [synced, setSynced] = useState(current);
  const timer = useRef<number>(0);

  if (current !== synced) {
    setSynced(current);
    if (current !== value.trim()) setValue(current);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function change(next: string) {
    setValue(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => update({ [param]: next.trim() }), 350);
  }

  return (
    <div className={cn("relative min-w-0", className)}>
      <Search
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-sage"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => change(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          controlClass,
          "h-8.5 w-full ps-9 pe-8 text-caption [&::-webkit-search-cancel-button]:hidden",
        )}
      />
      {value && (
        <button
          type="button"
          aria-label="پاک کردن جست‌وجو"
          onClick={() => change("")}
          className="absolute end-1.5 top-1/2 flex size-6.5 -translate-y-1/2 items-center justify-center rounded-sm text-sage hover:bg-green-900/6 hover:text-ink"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function FilterSelect({
  param,
  label,
  options,
  allLabel,
  className,
}: {
  param: string;
  label: string;
  options: SelectOption[];
  allLabel: string;
  className?: string;
}) {
  const { params, update } = useQueryState();
  return (
    <Select
      aria-label={label}
      size="sm"
      value={params.get(param) ?? "all"}
      onValueChange={(value) => update({ [param]: value === "all" ? null : value })}
      options={[{ value: "all", label: allLabel }, ...options]}
      className={cn("min-w-36", className)}
    />
  );
}

export function DateRangeFilter() {
  const { params, update } = useQueryState();
  return (
    <div className="flex items-center gap-1.5">
      <DatePicker
        size="sm"
        aria-label="از تاریخ"
        placeholder="از تاریخ"
        clearable
        value={params.get("from") ?? ""}
        onChange={(iso) => update({ from: iso })}
        className="w-36"
      />
      <span className="text-2xs text-ink-muted">تا</span>
      <DatePicker
        size="sm"
        aria-label="تا تاریخ"
        placeholder="تا تاریخ"
        clearable
        defaultTime="23:59"
        value={params.get("to") ?? ""}
        onChange={(iso) => update({ to: iso })}
        className="w-36"
      />
    </div>
  );
}

export function ClearFilters({ params: keys }: { params: string[] }) {
  const { params, update } = useQueryState();
  if (!keys.some((key) => params.has(key))) return null;
  return (
    <button
      type="button"
      onClick={() => update(Object.fromEntries(keys.map((key) => [key, null])))}
      className={adminButton({ variant: "ghost", size: "sm" })}
    >
      <X aria-hidden />
      حذف فیلترها
    </button>
  );
}

export interface TabItem {
  value: string;
  label: string;
  count?: number;
  dot?: ReactNode;
}

export function StatusTabs({
  param = "status",
  items,
  label,
}: {
  param?: string;
  items: TabItem[];
  label: string;
}) {
  const { params, update } = useQueryState();
  const active = params.get(param) ?? "all";
  return (
    <div
      role="tablist"
      aria-label={label}
      className="-mb-px flex gap-1 overflow-x-auto px-3 sm:px-4"
    >
      {items.map((item) => {
        const selected = item.value === active;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => update({ [param]: item.value === "all" ? null : item.value })}
            className={cn(
              "flex h-11 shrink-0 items-center gap-2 border-b-2 px-2.5 text-caption font-medium whitespace-nowrap transition-colors",
              selected
                ? "border-teal text-ink"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {item.dot}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.75 py-0.25 text-2xs tabular-nums",
                  selected ? "bg-teal text-white" : "bg-green-900/6 text-ink-muted",
                )}
              >
                {formatNumber(item.count)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const { update } = useQueryState();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const windowed = Array.from(new Set([1, page - 1, page, page + 1, pages]))
    .filter((value) => value >= 1 && value <= pages)
    .sort((a, b) => a - b);

  return (
    <nav
      aria-label="صفحه‌بندی"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3"
    >
      <p className="text-caption text-ink-muted">
        نمایش {formatNumber(from)} تا {formatNumber(to)} از {formatNumber(total)}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="صفحه قبل"
            disabled={page <= 1}
            onClick={() => update({ page: page - 1 })}
            className={adminButton({ variant: "ghost", size: "icon-sm" })}
          >
            <ChevronRight className="ltr:rotate-180" aria-hidden />
          </button>
          {windowed.map((value, index) => (
            <span key={value} className="flex items-center gap-1">
              {index > 0 && value - windowed[index - 1]! > 1 && (
                <span className="px-1 text-ink-muted">…</span>
              )}
              <button
                type="button"
                aria-current={value === page ? "page" : undefined}
                onClick={() => update({ page: value === 1 ? null : value })}
                className={cn(
                  "h-8 min-w-8 rounded-md px-2 text-caption tabular-nums transition-colors",
                  value === page
                    ? "bg-green-900 font-bold text-parchment"
                    : "text-ink hover:bg-green-900/6",
                )}
              >
                {formatDigits(value)}
              </button>
            </span>
          ))}
          <button
            type="button"
            aria-label="صفحه بعد"
            disabled={page >= pages}
            onClick={() => update({ page: page + 1 })}
            className={adminButton({ variant: "ghost", size: "icon-sm" })}
          >
            <ChevronLeft className="ltr:rotate-180" aria-hidden />
          </button>
        </div>
      )}
    </nav>
  );
}

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5", className)}>
      {children}
    </div>
  );
}

export function EditionSelect({
  editions,
  current,
  className,
}: {
  editions: { id: string; label: string }[];
  current: string;
  className?: string;
}) {
  const { params, update } = useQueryState();
  return (
    <Select
      aria-label="دوره جشنواره"
      size="sm"
      value={params.get("edition") ?? current}
      onValueChange={(value) => update({ edition: value === current ? null : value })}
      options={editions.map((edition) => ({ value: edition.id, label: edition.label }))}
      className={cn("min-w-32", className)}
    />
  );
}
