"use server";

import { authorize } from "@/lib/admin/session";
import { denied, missing, parseForm, revalidateAdmin } from "@/lib/admin/forms";
import { formatDigits } from "@/lib/admin/format";
import { timerSchema } from "@/lib/admin/schemas";
import { createTimer, deleteTimer, getTimer, updateTimer } from "@/lib/admin/api/timers";
import { MAX_TIMERS, type ActionResult, type ID } from "@/lib/admin/types";

export async function saveTimer(
  id: ID | undefined,
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await authorize("timers.edit"))) return denied;
  const parsed = parseForm(timerSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { extended, ...data } = parsed.data;

  if (!id) {
    const created = await createTimer(data);
    if (!created) {
      return {
        ok: false,
        message: `حداکثر ${formatDigits(MAX_TIMERS)} تایمر می‌توان ساخت؛ یکی از تایمرها را ویرایش یا حذف کنید.`,
      };
    }
    revalidateAdmin();
    return { ok: true, id: created, message: "تایمر ساخته شد." };
  }

  const existing = await getTimer(id);
  if (!existing) return missing;
  const originalEndsAt = extended
    ? (existing.originalEndsAt ?? (existing.endsAt !== data.endsAt ? existing.endsAt : undefined))
    : undefined;
  await updateTimer(id, { ...data, originalEndsAt });
  revalidateAdmin();
  return { ok: true, id, message: "تایمر به‌روزرسانی شد." };
}

export async function toggleTimer(id: ID, active: boolean): Promise<ActionResult> {
  if (!(await authorize("timers.edit"))) return denied;
  if (!(await getTimer(id))) return missing;
  await updateTimer(id, { active });
  revalidateAdmin();
  return { ok: true, message: active ? "تایمر فعال شد." : "تایمر غیرفعال شد." };
}

export async function removeTimer(id: ID): Promise<ActionResult> {
  if (!(await authorize("timers.edit"))) return denied;
  await deleteTimer(id);
  revalidateAdmin();
  return { ok: true, message: "تایمر حذف شد." };
}
