"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Bell,
  ChevronsUpDown,
  ExternalLink,
  LogOut,
  Menu as MenuIcon,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { usePathname } from "@/i18n/navigation";
import { Wordmark } from "@/components/ornaments/Wordmark";
import { adminButton } from "@/components/admin/button";
import { Avatar, Kbd } from "@/components/admin/primitives";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
} from "@/components/admin/overlay";
import { can } from "@/lib/admin/permissions";
import { formatNumber } from "@/lib/admin/format";
import { type Viewer } from "@/lib/admin/types";
import { AdminLink } from "@/features/admin/navigation";
import { CommandPalette } from "@/features/admin/shell/CommandPalette";
import { adminNav, isActive, type BadgeKey } from "@/features/admin/shell/nav";
import { signOut } from "@/lib/auth/actions";

interface AdminShellProps {
  viewer: Viewer;
  badges: Record<BadgeKey, number>;
  edition: { name: string; open: boolean };
  siteUrl: string;
  children: ReactNode;
}

export function AdminShell({ viewer, badges, edition, siteUrl, children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const typing =
        event.target instanceof HTMLElement &&
        event.target.closest("input, textarea, select, [contenteditable]");
      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !typing)
      ) {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = adminNav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => can(viewer, item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  const alerts = (
    [
      {
        key: "art",
        label: "اثر هنری در انتظار بررسی",
        href: "/admin/art?status=pending",
        show: can(viewer, "art.review"),
      },
      {
        key: "science",
        label: "مقاله در انتظار بررسی",
        href: "/admin/science?status=pending",
        show: can(viewer, "science.review"),
      },
      {
        key: "comments",
        label: "نظر در انتظار تأیید",
        href: "/admin/comments?state=pending",
        show: can(viewer, "comments.moderate"),
      },
      {
        key: "messages",
        label: "پیام تماس تازه",
        href: "/admin/inbox?state=new",
        show: can(viewer, "inbox.view"),
      },
    ] satisfies { key: BadgeKey; label: string; href: string; show: boolean }[]
  ).filter((alert) => alert.show && badges[alert.key] > 0);
  const alertCount = alerts.reduce((sum, alert) => sum + badges[alert.key], 0);

  const sidebar = (instance: "rail" | "sheet") => (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/8 px-5 pt-14 pb-4.5 lg:pt-5">
        <AdminLink href="/admin" className="flex items-center gap-3 rounded-md">
          <Wordmark
            label="میقات"
            variant="compact"
            id={`mq-wordmark-admin-${instance}`}
            className="h-8 w-auto"
          />
          <span aria-hidden className="h-7 w-px bg-gold/40" />
          <span className="text-caption font-medium text-mist">پنل مدیریت</span>
        </AdminLink>
        <p className="relative mt-4 flex items-center gap-2 rounded-md bg-white/5 px-2.5 py-1.5 text-2xs text-mist-light">
          <span
            aria-hidden
            className={cn("size-1.5 rounded-full", edition.open ? "bg-firuze-light" : "bg-gold")}
          />
          {edition.name}
          <span className="text-sage">·</span>
          {edition.open ? "در حال پذیرش آثار" : "پذیرش بسته است"}
        </p>
      </div>

      <nav
        aria-label="بخش‌های پنل"
        className="flex-1 [scrollbar-width:thin] overflow-y-auto px-3 py-4"
      >
        {groups.map((group, index) => (
          <div key={group.title ?? index} className={cn(index > 0 && "mt-5")}>
            {group.title && (
              <p className="mb-1.5 px-3 text-2xs font-medium text-sage">{group.title}</p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const count = item.badge ? badges[item.badge] : 0;
                return (
                  <li key={item.href}>
                    <AdminLink
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex h-10 items-center gap-3 rounded-btn-sm px-3 text-sm transition-colors duration-150",
                        active
                          ? "bg-white/9 font-medium text-parchment"
                          : "text-mist-light hover:bg-white/5 hover:text-white",
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute inset-y-2 start-0 w-0.75 rounded-full bg-gold"
                        />
                      )}
                      <item.icon
                        className={cn(
                          "size-4.5 shrink-0",
                          active ? "text-gold-light" : "text-sage group-hover:text-mist-light",
                        )}
                        aria-hidden
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {count > 0 && (
                        <span className="rounded-full bg-gold/18 px-1.75 py-0.25 text-2xs font-bold text-gold-light tabular-nums">
                          {formatNumber(count)}
                        </span>
                      )}
                    </AdminLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 p-3">
        <Menu>
          <MenuTrigger className="flex w-full items-center gap-3 rounded-btn-sm p-2 text-start transition-colors hover:bg-white/5">
            <Avatar name={viewer.name} id={viewer.id} />
            <span className="flex min-w-0 flex-1 flex-col leading-snug">
              <span className="truncate text-sm font-medium text-parchment">{viewer.name}</span>
              <span className="truncate text-2xs text-sage">{viewer.title}</span>
            </span>
            <ChevronsUpDown className="size-4 text-sage" aria-hidden />
          </MenuTrigger>
          <MenuContent side="top" align="start" className="w-60">
            <MenuLabel>{viewer.title}</MenuLabel>
            <MenuItem asChild>
              <AdminLink href="/admin/profile">
                <UserRound aria-hidden />
                حساب کاربری من
              </AdminLink>
            </MenuItem>
            <MenuItem asChild>
              <a href={siteUrl} target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden />
                مشاهده سایت
              </a>
            </MenuItem>
            <MenuSeparator />
            <MenuItem tone="danger" onSelect={() => void signOut()}>
              <LogOut aria-hidden />
              خروج از حساب
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-canvas">
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-68 bg-green-900 lg:block">
        {sidebar("rail")}
      </aside>

      <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-green-950/50 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in lg:hidden" />
          <DialogPrimitive.Content className="fixed inset-y-0 start-0 z-50 w-[min(18rem,86vw)] bg-green-900 shadow-header outline-none [--sheet-from:-100%] data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in lg:hidden rtl:[--sheet-from:100%]">
            <DialogPrimitive.Title className="sr-only">منوی پنل</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              بخش‌های پنل مدیریت
            </DialogPrimitive.Description>
            {sidebar("sheet")}
            <DialogPrimitive.Close
              aria-label="بستن منو"
              className="absolute end-2 top-2 flex size-9 items-center justify-center rounded-md text-mist hover:bg-white/8 hover:text-white"
            >
              <X className="size-5" aria-hidden />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <div className="lg:ps-68">
        <header className="sticky top-0 z-20 flex h-15 items-center gap-2 border-b border-line bg-canvas/85 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            aria-label="باز کردن منو"
            onClick={() => setMenuOpen(true)}
            className={cn(adminButton({ variant: "ghost", size: "icon" }), "lg:hidden")}
          >
            <MenuIcon aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex h-9.5 w-full max-w-md items-center gap-2.5 rounded-btn-sm border border-line bg-white px-3 text-sm text-sage transition-colors hover:border-line-strong"
          >
            <Search className="size-4" aria-hidden />
            <span className="flex-1 truncate text-start">جست‌وجو یا رفتن به بخش‌ها…</span>
            <span className="hidden items-center gap-1 sm:flex" dir="ltr">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>

          <div className="ms-auto flex items-center gap-1">
            <Menu>
              <MenuTrigger
                aria-label={
                  alertCount ? `${formatNumber(alertCount)} مورد نیازمند رسیدگی` : "اعلان‌ها"
                }
                className={cn(adminButton({ variant: "ghost", size: "icon" }), "relative")}
              >
                <Bell aria-hidden />
                {alertCount > 0 && (
                  <span
                    aria-hidden
                    className="absolute end-2 top-2 size-2 rounded-full bg-danger ring-2 ring-canvas"
                  />
                )}
              </MenuTrigger>
              <MenuContent className="w-72">
                <MenuLabel>نیازمند رسیدگی</MenuLabel>
                {alerts.length === 0 && (
                  <p className="px-2.5 py-3 text-caption text-ink-muted">موردی برای رسیدگی نیست.</p>
                )}
                {alerts.map((alert) => (
                  <MenuItem key={alert.key} asChild>
                    <AdminLink href={alert.href} className="justify-between">
                      <span>{alert.label}</span>
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-2xs font-bold text-danger tabular-nums">
                        {formatNumber(badges[alert.key])}
                      </span>
                    </AdminLink>
                  </MenuItem>
                ))}
              </MenuContent>
            </Menu>
            <a
              href={siteUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(adminButton({ variant: "ghost", size: "sm" }), "max-sm:hidden")}
            >
              <ExternalLink aria-hidden />
              مشاهده سایت
            </a>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-admin px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        groups={groups}
        viewer={viewer}
      />
    </div>
  );
}
