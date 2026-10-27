"use client";

import { type ComponentProps } from "react";
import NextLink from "next/link";
import {
  useParams,
  usePathname as useNextPathname,
  useRouter as useNextRouter,
} from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { localizeHref, splitLocale, type Href } from "@/i18n/href";

export function useCurrentLocale(): Locale {
  const params = useParams<{ locale?: string }>();
  return isLocale(params.locale) ? params.locale : defaultLocale;
}

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  href: Href;
  locale?: Locale;
};

export function Link({ href, locale, ...props }: LinkProps) {
  const current = useCurrentLocale();
  const target = locale ?? current;
  return (
    <NextLink
      href={localizeHref(href, target)}
      hrefLang={locale && locale !== current ? locale : undefined}
      {...props}
    />
  );
}

export function usePathname(): string {
  return splitLocale(useNextPathname()).pathname;
}

export function useRouter() {
  const router = useNextRouter();
  const current = useCurrentLocale();
  return {
    push: (href: Href, options: { locale?: Locale } = {}) =>
      router.push(localizeHref(href, options.locale ?? current)),
    replace: (href: Href, options: { locale?: Locale } = {}) =>
      router.replace(localizeHref(href, options.locale ?? current)),
  };
}
