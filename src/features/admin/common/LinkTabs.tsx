import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/admin/format";
import { AdminLink } from "@/features/admin/navigation";

export interface LinkTab {
  value: string;
  label: string;
  href: string;
  count?: number;
}

export function LinkTabs({
  items,
  active,
  label,
  className,
}: {
  items: LinkTab[];
  active: string;
  label: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn("mb-5 flex gap-1 overflow-x-auto border-b border-line", className)}
    >
      {items.map((item) => {
        const selected = item.value === active;
        return (
          <AdminLink
            key={item.value}
            href={item.href}
            aria-current={selected ? "page" : undefined}
            scroll={false}
            className={cn(
              "-mb-px flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors",
              selected
                ? "border-teal text-ink"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="rounded-full bg-green-900/6 px-1.75 text-2xs text-ink-muted tabular-nums">
                {formatNumber(item.count)}
              </span>
            )}
          </AdminLink>
        );
      })}
    </nav>
  );
}
