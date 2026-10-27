"use client";

import { createContext, use, useCallback, useState, type ReactNode } from "react";
import { Toast as ToastPrimitive } from "radix-ui";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface ToastItem {
  id: number;
  tone: "success" | "error";
  title: string;
  description?: string;
}

type Notify = (toast: Omit<ToastItem, "id">) => void;

const ToastContext = createContext<Notify>(() => {});

export function useToast(): Notify {
  return use(ToastContext);
}

let nextId = 0;

export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback<Notify>((toast) => {
    nextId += 1;
    const item = { ...toast, id: nextId };
    setToasts((list) => [...list.slice(-2), item]);
  }, []);

  return (
    <ToastContext value={notify}>
      <ToastPrimitive.Provider swipeDirection="down" duration={4500} label="اعلان">
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            onOpenChange={(open) => {
              if (!open) setToasts((list) => list.filter((item) => item.id !== toast.id));
            }}
            className={cn(
              "pointer-events-auto relative flex items-start gap-3 rounded-box border bg-white p-3.5 pe-10 shadow-pop",
              "data-[state=closed]:animate-fade-out data-[state=open]:animate-toast-in",
              "data-[swipe=end]:animate-fade-out data-[swipe=move]:translate-y-(--radix-toast-swipe-move-y)",
              toast.tone === "success" ? "border-success/25" : "border-danger/30",
            )}
          >
            {toast.tone === "success" ? (
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
            ) : (
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
            )}
            <div className="min-w-0">
              <ToastPrimitive.Title className="text-sm font-bold text-ink">
                {toast.title}
              </ToastPrimitive.Title>
              {toast.description && (
                <ToastPrimitive.Description className="mt-0.5 text-caption text-ink-muted">
                  {toast.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              aria-label="بستن"
              className="absolute end-2.5 top-2.5 flex size-7 items-center justify-center rounded-md text-sage hover:bg-green-900/6 hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="pointer-events-none fixed inset-x-4 bottom-4 z-100 flex flex-col gap-2 outline-none sm:inset-x-auto sm:end-5 sm:bottom-5 sm:w-96" />
      </ToastPrimitive.Provider>
    </ToastContext>
  );
}
