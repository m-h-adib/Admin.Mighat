import { type ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, LogOut } from "lucide-react";
import { getPageLocale } from "@/i18n/locale";
import { signOut } from "@/lib/auth/actions";
import { siteHref } from "@/lib/env";
import { Wordmark } from "@/components/ornaments/Wordmark";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

export async function PanelShell({ children }: { children: ReactNode }) {
  const [locale, t, tCommon] = await Promise.all([
    getPageLocale(),
    getTranslations("Panel"),
    getTranslations("Common"),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-gold/35 bg-green-900 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Wordmark
              label={tCommon("wordmark")}
              variant="compact"
              id="mq-wordmark-panel"
              className="h-7 w-auto"
            />
            <span aria-hidden className="h-6 w-px bg-gold/40" />
            <span className="text-caption font-medium text-mist">{t("name")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={siteHref("/", locale)}
              className="hidden min-h-11 items-center gap-2 rounded-btn-sm px-3 text-caption text-mist transition-colors duration-200 hover:bg-white/5 hover:text-gold-light sm:inline-flex"
            >
              <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden />
              {t("backToSite")}
            </a>
            <LocaleSwitcher label={tCommon("language")} compact />
            <form action={signOut}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                aria-label={t("logout")}
                title={t("logout")}
                className="inline-flex size-11 items-center justify-center rounded-btn-sm text-mist transition-colors duration-200 hover:bg-white/8 hover:text-gold-light"
              >
                <LogOut className="size-4.5 rtl:-scale-x-100" aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
    </div>
  );
}
