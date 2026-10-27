"use client";

import { Gavel } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/admin/format";
import { useQueryState } from "@/features/admin/navigation";

export function QueueToggle({ forced, waiting }: { forced: boolean; waiting: number }) {
  const { params, update } = useQueryState();
  const mine = forced || params.get("assigned") === "me";
  const unscored = params.get("unscored") === "1";
  const active = mine && unscored;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() =>
        update(
          active
            ? { unscored: null, assigned: null }
            : { unscored: "1", assigned: forced ? null : "me" },
        )
      }
      className={cn(
        "inline-flex h-8.5 items-center gap-2 rounded-md border px-3 text-caption font-medium transition-colors",
        active
          ? "border-teal bg-firuze/10 text-teal"
          : "border-line-strong bg-white text-ink hover:border-teal/50",
      )}
    >
      <Gavel className="size-4" aria-hidden />
      منتظر امتیاز من
      <span
        className={cn(
          "rounded-full px-1.75 text-2xs tabular-nums",
          active ? "bg-teal text-white" : "bg-green-900/6 text-ink-muted",
        )}
      >
        {formatNumber(waiting)}
      </span>
    </button>
  );
}
