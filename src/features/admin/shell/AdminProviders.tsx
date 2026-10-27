"use client";

import { type ReactNode } from "react";
import { Direction } from "radix-ui";
import { TooltipProvider } from "@/components/admin/overlay";
import { Toaster } from "@/components/admin/toast";

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <Direction.Provider dir="rtl">
      <TooltipProvider delayDuration={250}>
        <Toaster>{children}</Toaster>
      </TooltipProvider>
    </Direction.Provider>
  );
}
