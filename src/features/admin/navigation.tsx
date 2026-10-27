"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useTransition,
  type ComponentProps,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { type Pathname } from "@/i18n/href";
import { Link, useRouter as useLocaleRouter } from "@/i18n/navigation";

export function AdminLink({
  href,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  return <Link href={href as Pathname} {...props} />;
}

export function useAdminRouter() {
  const router = useLocaleRouter();
  return {
    push: (href: string) => router.push(href as Pathname),
    replace: (href: string) => router.replace(href as Pathname),
  };
}

type Patch = Record<string, string | number | boolean | null | undefined>;

interface QueryState {
  params: URLSearchParams;
  pending: boolean;
  update: (patch: Patch) => void;
}

const QueryContext = createContext<QueryState | null>(null);

export function QueryStateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === "" || value === false)
          next.delete(key);
        else next.set(key, String(value));
      }
      if (!("page" in patch)) next.delete("page");
      const query = next.toString();
      startTransition(() =>
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
      );
    },
    [params, pathname, router],
  );

  const value = useMemo(
    () => ({ params: new URLSearchParams(params.toString()), pending, update }),
    [params, pending, update],
  );

  return <QueryContext value={value}>{children}</QueryContext>;
}

export function useQueryState(): QueryState {
  const context = use(QueryContext);
  if (!context) throw new Error("useQueryState must be used inside <QueryStateProvider>");
  return context;
}

export function PendingFrame({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useQueryState();
  return (
    <div
      aria-busy={pending}
      className={cn(
        "transition-opacity duration-200",
        pending && "pointer-events-none opacity-55 delay-150",
        className,
      )}
    >
      {children}
    </div>
  );
}
