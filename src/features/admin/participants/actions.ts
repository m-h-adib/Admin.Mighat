"use server";

import { authorize } from "@/lib/admin/session";
import { denied, parseForm, revalidateAdmin } from "@/lib/admin/forms";
import { participantSchema } from "@/lib/admin/schemas";
import { updateParticipant } from "@/lib/admin/api/participants";
import { type ActionResult, type ID } from "@/lib/admin/types";

export async function saveParticipant(
  id: ID,
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await authorize("participants.edit"))) return denied;
  const parsed = parseForm(participantSchema, formData);
  if (!parsed.ok) return parsed.result;
  await updateParticipant(id, parsed.data);
  revalidateAdmin();
  return { ok: true, message: "مشخصات شرکت‌کننده ذخیره شد." };
}
