import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { getPageLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/redirect";
import { roleHome } from "@/lib/auth/roles";
import { getSession } from "@/lib/auth/session";
import { siteHref } from "@/lib/env";
import { getViewer } from "@/lib/admin/session";
import { GirihPattern } from "@/components/ornaments/GirihPattern";
import { Star8Gem } from "@/components/ornaments/Star8";
import { Wordmark } from "@/components/ornaments/Wordmark";
import { LoginForm } from "@/features/auth/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Panel");
  return { title: t("login.title") };
}

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role === "participant") await redirect(roleHome.participant);
  if (session?.role === "admin" && (await getViewer())) await redirect(roleHome.admin);

  const [locale, t, tCommon] = await Promise.all([
    getPageLocale(),
    getTranslations("Panel"),
    getTranslations("Common"),
  ]);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex min-h-dvh flex-col bg-cream outline-none lg:flex-row"
    >
      <div className="relative isolate flex shrink-0 flex-col items-center justify-center overflow-hidden bg-green-950 px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-16 lg:w-[46%] lg:max-w-3xl lg:py-16">
        <GirihPattern opacity={0.06} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 m-auto size-[34rem] rounded-full bg-firuze/8 blur-3xl"
        />
        <div className="relative flex flex-col items-center text-center lg:h-[29rem] lg:w-80 lg:justify-end lg:overflow-hidden lg:rounded-t-full lg:border lg:border-gold/35 lg:bg-green-900/55 lg:px-8 lg:pb-16 lg:shadow-lift-dark">
          <GirihPattern opacity={0.13} className="inset-0 hidden lg:block" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-2.5 hidden rounded-t-full border border-gold/20 lg:block"
          />
          <Star8Gem className="absolute inset-x-0 top-24 mx-auto hidden size-11 lg:block" />
          <Wordmark
            label={tCommon("wordmark")}
            variant="hero"
            id="mq-wordmark-login"
            className="relative h-16 w-auto drop-shadow-wordmark lg:h-24"
          />
          <p className="relative mt-2 text-body text-mist lg:mt-4 lg:text-lead lg:text-mist-light">
            {tCommon("festival")}
          </p>
        </div>
      </div>

      <div className="relative -mt-7 flex flex-1 flex-col gap-8 rounded-t-panel bg-cream px-5 pt-9 pb-[max(1rem,env(safe-area-inset-bottom))] lg:mt-0 lg:rounded-none lg:px-16 lg:pt-8">
        <div className="mx-auto w-full max-w-sm motion-safe:animate-page-in lg:my-auto">
          <h1 className="text-3xl font-extrabold text-green-900 lg:text-4xl">{t("login.title")}</h1>
          <p className="mt-2 text-body text-ink-muted">{t("login.text")}</p>
          <LoginForm
            locale={locale}
            className="mt-8"
            labels={{
              nationalId: t("login.nationalId"),
              submit: t("login.submit"),
              pending: t("login.pending"),
              required: t("login.errors.required"),
              short: t("login.errors.short"),
              invalid: t("login.errors.invalid"),
            }}
          />
        </div>

        <a
          href={siteHref("/", locale)}
          className="mx-auto mt-auto flex min-h-11 w-fit items-center gap-2 rounded-btn-sm px-3 text-caption text-ink-muted transition-colors duration-200 hover:text-teal lg:mt-0"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden />
          {t("backToSite")}
        </a>
      </div>
    </main>
  );
}
