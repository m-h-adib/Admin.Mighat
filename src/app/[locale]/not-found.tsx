import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { GirihPattern } from "@/components/ornaments/GirihPattern";
import { Star8Gem } from "@/components/ornaments/Star8";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <main
      id="main"
      className="relative flex min-h-dvh flex-col items-center justify-center gap-3 overflow-hidden bg-green-950 px-6 text-center"
    >
      <GirihPattern opacity={0.07} />
      <Star8Gem className="relative mb-2 size-14" />
      <h1 className="relative text-3xl font-extrabold text-parchment">{t("title")}</h1>
      <p className="relative max-w-sm text-body text-mist-light">{t("text")}</p>
      <Link
        href="/login"
        className={buttonVariants({ variant: "gold", className: "relative mt-3" })}
      >
        {t("home")}
      </Link>
    </main>
  );
}
