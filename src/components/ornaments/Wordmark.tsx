import { cn } from "@/lib/cn";
import { WORDMARK_PATH, WORDMARK_VIEWBOX } from "@/components/ornaments/wordmark-path";

const gradients = {
  hero: [
    [0, "var(--color-wordmark-1)"],
    [0.32, "var(--color-wordmark-2)"],
    [0.62, "var(--color-wordmark-3)"],
    [0.82, "var(--color-wordmark-4)"],
    [1, "var(--color-wordmark-5)"],
  ],
  compact: [
    [0, "var(--color-wordmark-1)"],
    [0.45, "var(--color-gold-light)"],
    [1, "var(--color-wordmark-deep)"],
  ],
} as const;

interface WordmarkProps {
  label: string;
  variant?: keyof typeof gradients;
  id?: string;
  className?: string;
}

export function Wordmark({
  label,
  variant = "hero",
  id = `mq-${variant}`,
  className,
}: WordmarkProps) {
  return (
    <svg
      role="img"
      aria-label={label}
      lang="fa"
      viewBox={WORDMARK_VIEWBOX}
      className={cn("block overflow-visible", className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="-960" x2="0" y2="240" gradientUnits="userSpaceOnUse">
          {gradients[variant].map(([offset, color]) => (
            <stop key={offset} offset={offset} style={{ stopColor: color }} />
          ))}
        </linearGradient>
      </defs>
      <path d={WORDMARK_PATH} fill={`url(#${id})`} />
    </svg>
  );
}
