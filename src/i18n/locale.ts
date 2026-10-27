import { locale as rootLocale } from "next/root-params";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

export async function getPageLocale(): Promise<Locale> {
  const value = await rootLocale();
  return isLocale(value) ? value : defaultLocale;
}
