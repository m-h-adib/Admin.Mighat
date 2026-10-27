import { type Metadata, type Viewport } from "next";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import "../globals.css";
import { getDirection, isLocale, locales } from "@/i18n/config";
import { vazirmatn } from "@/lib/fonts";
import { THEME_COLOR } from "@/lib/theme";
import { SkipLink } from "@/components/layout/SkipLink";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: "light",
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await rootLocale();
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    robots: { index: false, follow: false },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Common" });

  return (
    <html lang={locale} dir={getDirection(locale)} className={vazirmatn.variable}>
      <body className="min-h-dvh">
        <SkipLink label={t("skipToContent")} />
        {children}
      </body>
    </html>
  );
}
