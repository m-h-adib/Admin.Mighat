"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { localizeHref } from "@/i18n/href";
import { roleHome } from "@/lib/auth/roles";
import { clearSession, writeSession } from "@/lib/auth/session";
import { isNationalId, latinDigits } from "@/lib/digits";
import { sessionFor } from "@/lib/admin/api/auth";

function localeOf(formData?: FormData) {
  const value = String(formData?.get("locale"));
  return isLocale(value) ? value : defaultLocale;
}

export type SignInState = { error: string } | null;

export async function signIn(_state: SignInState, formData: FormData): Promise<SignInState> {
  const locale = localeOf(formData);
  const t = await getTranslations({ locale, namespace: "Panel.login.errors" });
  const nationalId = latinDigits(String(formData.get("nationalId") ?? "")).replace(/\D/g, "");

  if (!nationalId) return { error: t("required") };
  if (!isNationalId(nationalId)) return { error: t("invalid") };
  const session = await sessionFor(nationalId);

  await writeSession(session);
  redirect(localizeHref(roleHome[session.role], session.role === "admin" ? "fa" : locale));
}

export async function signOut(formData?: FormData) {
  await clearSession();
  redirect(localizeHref("/login", localeOf(formData)));
}
