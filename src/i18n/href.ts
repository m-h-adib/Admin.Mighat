import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

export type Pathname = "/" | "/login" | "/admin" | `/admin/${string}`;

export type Href = Pathname | { pathname: Pathname; hash?: string };

export function localizeHref(href: Href, locale: Locale): string {
  const { pathname, hash } = typeof href === "string" ? { pathname: href, hash: undefined } : href;
  return `/${locale}${pathname === "/" ? "" : pathname}${hash ? `#${hash}` : ""}`;
}

export function splitLocale(path: string): { locale: Locale; pathname: string } {
  const [, first, ...rest] = path.split("/");
  if (isLocale(first)) return { locale: first, pathname: `/${rest.join("/")}` };
  return { locale: defaultLocale, pathname: path || "/" };
}
