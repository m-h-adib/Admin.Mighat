"use client";

import { useCallback, useTransition } from "react";
import { useToast } from "@/components/admin/toast";
import { type ActionResult } from "@/lib/admin/types";

export function useActionRunner() {
  const notify = useToast();
  const [pending, startTransition] = useTransition();

  const run = useCallback(
    (action: () => Promise<ActionResult>, onSuccess?: (result: ActionResult) => void) => {
      startTransition(async () => {
        const result = await action();
        if (result.ok) {
          if (result.message) notify({ tone: "success", title: result.message });
          onSuccess?.(result);
        } else {
          notify({ tone: "error", title: result.message });
        }
      });
    },
    [notify],
  );

  return { run, pending };
}
