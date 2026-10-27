"use server";

import { type CategoryId } from "@/types/domain";
import { authorize } from "@/lib/admin/session";
import { denied, missing, parseForm, revalidateAdmin } from "@/lib/admin/forms";
import { categorySchema, editionSchema, intakeSchema } from "@/lib/admin/schemas";
import {
  activateEdition,
  getFestival,
  saveEdition,
  setIntake,
  updateCategory,
} from "@/lib/admin/api/festival";
import { type ActionResult, type ID, type SubmissionKind } from "@/lib/admin/types";

const activated: ActionResult = {
  ok: true,
  message: "دوره فعال تغییر کرد؛ پیشخوان و فهرست‌ها از این پس بر پایه این دوره‌اند.",
};

export async function editionAction(
  id: ID | undefined,
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await authorize("festival.edit"))) return denied;
  const parsed = parseForm(editionSchema, formData);
  if (!parsed.ok) return parsed.result;
  const festival = await getFestival();
  if (id && !festival.editions.some((edition) => edition.id === id)) return missing;
  if (
    festival.editions.some((edition) => edition.number === parsed.data.number && edition.id !== id)
  ) {
    return {
      ok: false,
      message: "این شماره دوره قبلاً ثبت شده است.",
      fieldErrors: { number: "شماره تکراری است." },
    };
  }
  const wasCurrent = id === festival.currentEditionId;
  await saveEdition(id, { ...parsed.data, current: parsed.data.current || wasCurrent });
  revalidateAdmin();
  if (parsed.data.current && !wasCurrent) return activated;
  return { ok: true, message: id ? "دوره به‌روزرسانی شد." : "دوره تازه ساخته شد." };
}

export async function activateEditionAction(id: ID): Promise<ActionResult> {
  if (!(await authorize("festival.edit"))) return denied;
  if (!(await activateEdition(id))) return missing;
  revalidateAdmin();
  return activated;
}

export async function categoryAction(
  id: CategoryId,
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await authorize("festival.edit"))) return denied;
  const parsed = parseForm(categorySchema, formData);
  if (!parsed.ok) return parsed.result;
  await updateCategory(id, parsed.data);
  revalidateAdmin();
  return { ok: true, message: "تنظیمات بخش ذخیره شد." };
}

export async function toggleCategory(id: CategoryId, enabled: boolean): Promise<ActionResult> {
  if (!(await authorize("festival.edit"))) return denied;
  if (!(await updateCategory(id, { enabled }))) return missing;
  revalidateAdmin();
  return {
    ok: true,
    message: enabled ? "بخش فعال شد." : "بخش غیرفعال شد و در فرم ارسال نمایش داده نمی‌شود.",
  };
}

export async function intakeAction(
  kind: SubmissionKind,
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await authorize("festival.edit"))) return denied;
  const parsed = parseForm(intakeSchema, formData);
  if (!parsed.ok) return parsed.result;
  await setIntake(kind, parsed.data);
  revalidateAdmin();
  return { ok: true, message: parsed.data.open ? "پذیرش آثار باز است." : "پذیرش آثار بسته شد." };
}
