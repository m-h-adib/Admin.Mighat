"use server";

import { authorize } from "@/lib/admin/session";
import { denied, parseForm, revalidateAdmin } from "@/lib/admin/forms";
import {
  bannerSchema,
  channelsSchema,
  contactSchema,
  homeSchema,
  identitySchema,
} from "@/lib/admin/schemas";
import { updateSiteSettings } from "@/lib/admin/api/site";
import { type ActionResult } from "@/lib/admin/types";

const saved: ActionResult = { ok: true, message: "تنظیمات ذخیره شد." };

async function guard() {
  return Boolean(await authorize("site.edit"));
}

export async function saveIdentity(
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return denied;
  const parsed = parseForm(identitySchema, formData);
  if (!parsed.ok) return parsed.result;
  await updateSiteSettings("identity", parsed.data);
  revalidateAdmin();
  return saved;
}

export async function saveContact(
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return denied;
  const parsed = parseForm(contactSchema, formData);
  if (!parsed.ok) return parsed.result;
  await updateSiteSettings("contact", parsed.data);
  revalidateAdmin();
  return saved;
}

export async function saveChannels(
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return denied;
  const parsed = parseForm(channelsSchema, formData);
  if (!parsed.ok) return parsed.result;
  await updateSiteSettings("channels", parsed.data.channels);
  revalidateAdmin();
  return saved;
}

export async function saveHome(
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return denied;
  const parsed = parseForm(homeSchema, formData);
  if (!parsed.ok) return parsed.result;
  await updateSiteSettings("home", {
    ...parsed.data,
    sections: { ...parsed.data.sections, hero: true },
  });
  revalidateAdmin();
  return saved;
}

export async function saveBanner(
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return denied;
  const parsed = parseForm(bannerSchema, formData);
  if (!parsed.ok) return parsed.result;
  await updateSiteSettings("banner", parsed.data);
  revalidateAdmin();
  return {
    ok: true,
    message: parsed.data.enabled
      ? "نوار اطلاع‌رسانی ذخیره و فعال شد."
      : "نوار اطلاع‌رسانی ذخیره شد (غیرفعال).",
  };
}
