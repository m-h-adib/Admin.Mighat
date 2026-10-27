export const locales = ["fa", "en"] as const;

export type Locale = (typeof locales)[number];
type Direction = "rtl" | "ltr";

export const defaultLocale = "fa" satisfies Locale;
export type DefaultLocale = typeof defaultLocale;

interface LocaleSettings {
  dir: Direction;
  intl: string;
  nativeName: string;
  shortName: string;
}

export const localeSettings: Record<Locale, LocaleSettings> = {
  fa: {
    dir: "rtl",
    intl: "fa-IR-u-ca-persian-nu-arabext",
    nativeName: "فارسی",
    shortName: "فا",
  },
  en: {
    dir: "ltr",
    intl: "en-GB-u-ca-gregory-nu-latn",
    nativeName: "English",
    shortName: "EN",
  },
};

export const timeZone = "Asia/Tehran";

export function getDirection(locale: Locale): Direction {
  return localeSettings[locale].dir;
}

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}
