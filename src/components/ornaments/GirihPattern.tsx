import { cn } from "@/lib/cn";

interface GirihPatternProps {
  opacity?: number;
  className?: string;
}

export function GirihPattern({ opacity = 0.08, className }: GirihPatternProps) {
  return (
    <div
      aria-hidden
      style={{ opacity }}
      className={cn("pointer-events-none absolute girih", className ?? "inset-0")}
    />
  );
}
