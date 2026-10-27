import { redirect as nextRedirect } from "next/navigation";
import { getPageLocale } from "@/i18n/locale";
import { localizeHref, type Href } from "@/i18n/href";

export async function redirect(href: Href): Promise<never> {
  nextRedirect(localizeHref(href, await getPageLocale()));
}
