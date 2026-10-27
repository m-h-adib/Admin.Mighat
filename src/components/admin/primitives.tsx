import { type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { type LucideIcon } from "lucide-react";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-box border border-line bg-white shadow-card", className)}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
  id?: string;
}

export function CardHeader({
  title,
  description,
  action,
  icon: Icon,
  className,
  id,
}: CardHeaderProps) {
  return (
    <header
      className={cn("flex flex-wrap items-start justify-between gap-3 px-5 pt-4.5", className)}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-firuze/10 text-firuze-deep">
            <Icon className="size-4.5" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <h2 id={id} className="text-body font-bold text-ink">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-caption text-ink-muted">{description}</p>}
        </div>
      </div>
      {action}
    </header>
  );
}

const badgeTones = {
  neutral: "bg-green-900/6 text-ink-muted",
  teal: "bg-firuze/12 text-firuze-deep",
  gold: "bg-gold/15 text-gold-ink",
  green: "bg-green-900 text-gold-light",
  danger: "bg-danger/10 text-danger-ink",
  success: "bg-success/10 text-success",
  pending: "bg-status-pending/12 text-status-pending-ink",
  judging: "bg-status-judging/10 text-status-judging-ink",
  judged: "bg-status-judged/12 text-status-judged-ink",
  selected: "bg-status-selected/16 text-status-selected-ink",
  rejected: "bg-status-rejected/10 text-status-rejected-ink",
} as const;

const dotTones: Record<BadgeTone, string> = {
  neutral: "bg-sage",
  teal: "bg-firuze",
  gold: "bg-gold",
  green: "bg-gold-light",
  danger: "bg-danger",
  success: "bg-success",
  pending: "bg-status-pending",
  judging: "bg-status-judging",
  judged: "bg-status-judged",
  selected: "bg-status-selected",
  rejected: "bg-status-rejected",
};

export type BadgeTone = keyof typeof badgeTones;

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
  ...props
}: ComponentProps<"span"> & { tone?: BadgeTone; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 text-2xs leading-none font-bold whitespace-nowrap",
        badgeTones[tone],
        className,
      )}
      {...props}
    >
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", dotTones[tone])} />}
      {children}
    </span>
  );
}

export function StatusDot({ tone, className }: { tone: BadgeTone; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 rounded-full", dotTones[tone], className)}
    />
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-green-900/6 text-sage">
        <Icon className="size-6" aria-hidden />
      </span>
      <div>
        <p className="text-body font-bold text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-caption text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-line-strong bg-white px-1 font-sans text-[0.6875rem] leading-none text-ink-muted",
        className,
      )}
      {...props}
    />
  );
}

const avatarTones = [
  "bg-tone-pine text-gold-light",
  "bg-tone-indigo text-gold-light",
  "bg-tone-umber text-gold-light",
  "bg-tone-jade text-gold-light",
  "bg-tone-plum text-gold-light",
  "bg-tone-ocean text-gold-light",
];

export function Avatar({
  name,
  id,
  size = "md",
}: {
  name: string;
  id: string;
  size?: "sm" | "md" | "lg";
}) {
  const parts = name.replace(/^(سید|سیده)\s*/, "").split(/\s+/);
  const initials = `${parts[0]?.[0] ?? ""}${parts.length > 1 ? `‌${parts[parts.length - 1]![0]}` : ""}`;
  const tone =
    avatarTones[[...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarTones.length];
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        tone,
        size === "sm" && "size-7 text-[0.6875rem]",
        size === "md" && "size-9 text-caption",
        size === "lg" && "size-14 text-lg",
      )}
    >
      {initials}
    </span>
  );
}

export function Meter({
  value,
  max,
  tone = "teal",
  label,
}: {
  value: number;
  max: number;
  tone?: "teal" | "gold" | "danger";
  label?: string;
}) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full",
        tone === "teal" && "bg-firuze/15",
        tone === "gold" && "bg-gold/20",
        tone === "danger" && "bg-danger/15",
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-miqat",
          tone === "teal" && "bg-firuze-deep",
          tone === "gold" && "bg-gold",
          tone === "danger" && "bg-danger",
        )}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
