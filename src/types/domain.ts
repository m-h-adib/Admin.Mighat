import { type DefaultLocale, type Locale } from "@/i18n/config";

export const categoryIds = [
  "photo",
  "film",
  "podcast",
  "note",
  "poem",
  "calligraphy",
  "painting",
] as const;
export type CategoryId = (typeof categoryIds)[number];

export type Tone = "pine" | "umber" | "indigo" | "plum" | "jade" | "rust" | "ocean" | "olive";

export type Rank = 1 | 2 | 3;

export type Localized<T = string> = Record<DefaultLocale, T> &
  Partial<Record<Exclude<Locale, DefaultLocale>, T>>;
