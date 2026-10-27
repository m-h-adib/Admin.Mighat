"use server";

import { type Rank } from "@/types/domain";
import { authorize } from "@/lib/admin/session";
import { denied, parseForm, revalidateAdmin } from "@/lib/admin/forms";
import { winnerSchema } from "@/lib/admin/schemas";
import {
  createWinner,
  deleteWinner,
  setWinnerFeatured,
  updateWinner,
} from "@/lib/admin/api/winners";
import { type ActionResult, type ID } from "@/lib/admin/types";

export async function saveWinner(
  id: ID | undefined,
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await authorize("winners.edit"))) return denied;
  const parsed = parseForm(winnerSchema, formData);
  if (!parsed.ok) return parsed.result;
  const input = {
    ...parsed.data,
    rank: parsed.data.rank as Rank,
    featured: parsed.data.kind === "art" && parsed.data.featured,
  };
  if (id) {
    await updateWinner(id, input);
    if (input.featured) await setWinnerFeatured(id, true);
    revalidateAdmin();
    return { ok: true, id, message: "برگزیده به‌روزرسانی شد." };
  }
  const created = await createWinner({ ...input, featured: false });
  if (input.featured) await setWinnerFeatured(created, true);
  revalidateAdmin();
  return { ok: true, id: created, message: "برگزیده ثبت شد." };
}

export async function featureWinner(id: ID, featured: boolean): Promise<ActionResult> {
  if (!(await authorize("winners.edit"))) return denied;
  await setWinnerFeatured(id, featured);
  revalidateAdmin();
  return {
    ok: true,
    message: featured ? "روی سکوی صفحه اول قرار گرفت." : "از سکوی صفحه اول برداشته شد.",
  };
}

export async function removeWinner(id: ID): Promise<ActionResult> {
  if (!(await authorize("winners.edit"))) return denied;
  await deleteWinner(id);
  revalidateAdmin();
  return { ok: true, message: "برگزیده حذف شد." };
}
