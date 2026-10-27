"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  ArrowLeft,
  CornerDownLeft,
  FilePlus2,
  Hash,
  Search,
  TimerReset,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Kbd } from "@/components/admin/primitives";
import { latinDigits } from "@/lib/digits";
import { can } from "@/lib/admin/permissions";
import { type Viewer } from "@/lib/admin/types";
import { type NavGroup } from "@/features/admin/shell/nav";
import { useAdminRouter } from "@/features/admin/navigation";

interface Command {
  id: string;
  label: string;
  hint?: string;
  href: string;
  icon: LucideIcon;
  keywords?: string;
}

const fold = (text: string) =>
  text.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").toLowerCase();

export function CommandPalette({
  open,
  onOpenChange,
  groups,
  viewer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: NavGroup[];
  viewer: Viewer;
}) {
  const router = useAdminRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const commands = useMemo<Command[]>(() => {
    const pages = groups.flatMap((group) =>
      group.items.map((item) => ({
        id: item.href,
        label: item.label,
        hint: group.title ?? "",
        href: item.href,
        icon: item.icon,
        keywords: item.keywords,
      })),
    );
    const actions: (Command & { show: boolean })[] = [
      {
        id: "new-news",
        label: "نوشتن خبر یا اطلاعیه تازه",
        href: "/admin/news/new",
        icon: FilePlus2,
        show: can(viewer, "news.create"),
      },
      {
        id: "new-timer",
        label: "افزودن تایمر",
        href: "/admin/timers?new=1",
        icon: TimerReset,
        show: can(viewer, "timers.edit"),
      },
      {
        id: "new-user",
        label: "افزودن مدیر",
        href: "/admin/access?new=1",
        icon: UserPlus,
        show: can(viewer, "access.manage"),
      },
    ];
    return [
      ...pages,
      ...actions
        .filter((action) => action.show)
        .map((action) => ({ ...action, hint: "اقدام سریع" })),
    ];
  }, [groups, viewer]);

  const results = useMemo(() => {
    const words = fold(query.trim()).split(/\s+/).filter(Boolean);
    const list = words.length
      ? commands.filter((command) => {
          const haystack = fold(`${command.label} ${command.keywords ?? ""} ${command.hint ?? ""}`);
          return words.every((word) => haystack.includes(word));
        })
      : [...commands];
    const code = latinDigits(query.trim().toUpperCase());
    const match = /^([AS])(\d+)-(\d{1,5})$/.exec(code);
    if (match) {
      const kind = match[1] === "A" ? "art" : "science";
      if (can(viewer, `${kind}.view`)) {
        list.unshift({
          id: "code",
          label: `جست‌وجوی کد رهگیری ${code}`,
          hint: kind === "art" ? "آثار هنری" : "مقالات علمی",
          href: `/admin/${kind}?q=${encodeURIComponent(code)}&edition=${match[2]}`,
          icon: Hash,
        });
      }
    }
    return list;
  }, [commands, query, viewer]);

  function go(command: Command | undefined) {
    if (!command) return;
    onOpenChange(false);
    router.push(command.href);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % Math.max(1, results.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + results.length) % Math.max(1, results.length));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    }
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setQuery("");
          setActive(0);
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-green-950/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          onKeyDown={onKeyDown}
          className="fixed inset-x-3 top-[12dvh] z-50 mx-auto max-w-xl overflow-hidden rounded-box border border-line bg-white shadow-pop outline-none data-[state=open]:animate-pop-in"
        >
          <DialogPrimitive.Title className="sr-only">جست‌وجو در پنل</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            نام بخش، اقدام یا کد رهگیری اثر را بنویسید.
          </DialogPrimitive.Description>
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Search className="size-4.5 text-sage" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              placeholder="نام بخش، اقدام یا کد رهگیری (مثلاً A3-00125)"
              aria-label="جست‌وجو"
              role="combobox"
              aria-expanded
              aria-controls="command-results"
              aria-activedescendant={results[active] ? `command-${results[active].id}` : undefined}
              className="h-13 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-sage"
            />
          </div>
          <ul id="command-results" role="listbox" className="max-h-[50dvh] overflow-y-auto p-1.5">
            {results.length === 0 && (
              <li className="px-3 py-8 text-center text-caption text-ink-muted">
                نتیجه‌ای پیدا نشد.
              </li>
            )}
            {results.map((command, index) => (
              <li
                key={command.id}
                id={`command-${command.id}`}
                role="option"
                aria-selected={index === active}
                onPointerMove={() => setActive(index)}
                onClick={() => go(command)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm",
                  index === active ? "bg-green-900/6 text-ink" : "text-ink",
                )}
              >
                <command.icon className="size-4.5 text-ink-muted" aria-hidden />
                <span className="flex-1">{command.label}</span>
                {command.hint && <span className="text-2xs text-ink-muted">{command.hint}</span>}
                {index === active && (
                  <ArrowLeft className="size-4 text-teal ltr:rotate-180" aria-hidden />
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 border-t border-line bg-canvas/60 px-4 py-2 text-2xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              جابه‌جایی
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>
                <CornerDownLeft className="size-3" aria-hidden />
              </Kbd>
              باز کردن
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>Esc</Kbd>
              بستن
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
