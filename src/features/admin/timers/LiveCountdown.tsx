"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatTwoDigits } from "@/lib/admin/format";

const units = [
  ["days", "روز"],
  ["hours", "ساعت"],
  ["minutes", "دقیقه"],
  ["seconds", "ثانیه"],
] as const;

function remaining(target: number, now: number) {
  const total = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: total === 0,
  };
}

export function LiveCountdown({
  endsAt,
  initialNow,
  size = "md",
  tone = "light",
}: {
  endsAt: string;
  initialNow: number;
  size?: "sm" | "md";
  tone?: "light" | "dark";
}) {
  const target = new Date(endsAt).getTime();
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const left = remaining(target, now);
  if (left.done)
    return (
      <p className={cn("text-caption", tone === "dark" ? "text-gold-light" : "text-ink-muted")}>
        به پایان رسیده
      </p>
    );

  return (
    <ol
      dir="ltr"
      role="timer"
      aria-live="off"
      className={cn("flex", size === "md" ? "gap-2" : "gap-1.5")}
    >
      {units.map(([unit, label]) => (
        <li
          key={unit}
          className={cn(
            "flex flex-col items-center rounded-md",
            size === "md" ? "min-w-14 px-2 py-1.5" : "min-w-10 px-1.5 py-1",
            tone === "dark" ? "bg-white/8" : "bg-green-900/5",
          )}
        >
          <span
            className={cn(
              "font-bold tabular-nums",
              size === "md" ? "text-2xl leading-tight" : "text-sm leading-tight",
              tone === "dark" ? "text-parchment" : "text-ink",
            )}
          >
            {formatTwoDigits(left[unit])}
          </span>
          <span className={cn("text-2xs", tone === "dark" ? "text-gold-light" : "text-ink-muted")}>
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
