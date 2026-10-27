"use server";

import { getViewer } from "@/lib/admin/session";
import { denied, parseForm, revalidateAdmin } from "@/lib/admin/forms";
import { profileSchema } from "@/lib/admin/schemas";
import { updateProfile } from "@/lib/admin/api/auth";
import { type ActionResult } from "@/lib/admin/types";

export async function saveProfile(
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return denied;
  const parsed = parseForm(profileSchema, formData);
  if (!parsed.ok) return parsed.result;
  await updateProfile(viewer.id, parsed.data);
  revalidateAdmin();
  return { ok: true, message: "مشخصات شما ذخیره شد." };
}
