import { getRequestConfig } from "next-intl/server";
import { isLocale, timeZone } from "@/i18n/config";
import { getPageLocale } from "@/i18n/locale";

export default getRequestConfig(async ({ locale: override }) => {
  const locale = isLocale(override) ? override : await getPageLocale();

  return {
    locale,
    timeZone,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
