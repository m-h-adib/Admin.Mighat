"use client";

import { Languages } from "lucide-react";
import { Link, useCurrentLocale, usePathname, useRouter } from "@/i18n/navigation";
import { type Pathname } from "@/i18n/href";
import { localeSettings, locales } from "@/i18n/config";
import { cn } from "@/lib/cn";

interface LocaleSwitcherProps {
  label: string;
  compact?: boolean;
  className?: string;
}

export function LocaleSwitcher({ label, compact = false, className }: LocaleSwitcherProps) {
  const locale = useCurrentLocale();
  const pathname = usePathname() as Pathname;
  const router = useRouter();

  return (
    <ul aria-label={label} className={cn("flex items-center gap-1", className)}>
      {locales
        .filter((other) => other !== locale)
        .map((other) => (
          <li key={other}>
            <Link
              href={pathname}
              locale={other}
              lang={other}
              onClick={(event) => {
                const { hash } = window.location;
                if (!hash) return;
                event.preventDefault();
                router.push({ pathname, hash: hash.slice(1) }, { locale: other });
              }}
              aria-label={compact ? localeSettings[other].nativeName : undefined}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-btn-sm text-body font-medium text-gold-light transition-colors duration-200 hover:bg-gold-light/12 hover:text-white",
                compact ? "min-w-11 border border-gold-light/40 px-2" : "px-3",
              )}
            >
              {compact ? (
                localeSettings[other].shortName
              ) : (
                <>
                  <Languages className="size-4.5" aria-hidden />
                  {localeSettings[other].nativeName}
                </>
              )}
            </Link>
          </li>
        ))}
    </ul>
  );
}
