import { type ReactNode } from "react";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Sparkline } from "@/components/admin/charts";
import { formatNumber, formatPercent } from "@/lib/admin/format";
import { AdminLink } from "@/features/admin/navigation";

interface StatTileProps {
  label: string;
  value: number;
  icon: LucideIcon;
  href?: string;
  delta?: { current: number; previous: number; period: string };
  trend?: number[];
  footer?: ReactNode;
}

export function StatTile({ label, value, icon: Icon, href, delta, trend, footer }: StatTileProps) {
  const change =
    delta && delta.previous > 0 ? (delta.current - delta.previous) / delta.previous : undefined;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 text-caption text-ink-muted">
          <Icon className="size-4 text-sage" aria-hidden />
          {label}
        </p>
        {trend && <Sparkline values={trend} />}
      </div>
      <p className="mt-1.5 text-display font-bold text-ink">{formatNumber(value)}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-ink-muted">
        {delta && (
          <span className="flex items-center gap-1">
            {change !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold",
                  change >= 0 ? "bg-success/10 text-success" : "bg-danger/8 text-danger",
                )}
              >
                {change >= 0 ? (
                  <TrendingUp className="size-3" aria-hidden />
                ) : (
                  <TrendingDown className="size-3" aria-hidden />
                )}
                {formatPercent(Math.abs(change))}
              </span>
            )}
            {formatNumber(delta.current)} {delta.period}
          </span>
        )}
        {footer}
      </div>
    </>
  );

  const className = "block rounded-box border border-line bg-white p-4.5 shadow-card";
  return href ? (
    <AdminLink
      href={href}
      className={cn(
        className,
        "transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-lift",
      )}
    >
      {body}
    </AdminLink>
  ) : (
    <div className={className}>{body}</div>
  );
}
