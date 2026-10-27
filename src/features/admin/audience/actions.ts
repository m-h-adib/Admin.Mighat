"use server";

import { authorize } from "@/lib/admin/session";
import { denied, parseForm, revalidateAdmin } from "@/lib/admin/forms";
import { messageSchema } from "@/lib/admin/schemas";
import { formatNumber } from "@/lib/admin/format";
import { deleteComments, setCommentState, updateMessage } from "@/lib/admin/api/audience";
import { type ActionResult, type CommentState, type ID } from "@/lib/admin/types";

export async function moderateComments(ids: ID[], state: CommentState): Promise<ActionResult> {
  if (!(await authorize("comments.moderate"))) return denied;
  await setCommentState(ids, state);
  revalidateAdmin();
  const label = state === "approved" ? "تأیید" : state === "rejected" ? "رد" : "بازگردانده";
  return {
    ok: true,
    message: ids.length > 1 ? `${formatNumber(ids.length)} نظر ${label} شد.` : `نظر ${label} شد.`,
  };
}

export async function removeComments(ids: ID[]): Promise<ActionResult> {
  if (!(await authorize("comments.delete"))) return denied;
  await deleteComments(ids);
  revalidateAdmin();
  return { ok: true, message: `${formatNumber(ids.length)} نظر حذف شد.` };
}

export async function markMessageRead(id: ID): Promise<ActionResult> {
  if (!(await authorize("inbox.view"))) return denied;
  await updateMessage(id, { state: "read" });
  revalidateAdmin();
  return { ok: true };
}

export async function saveMessageNote(
  id: ID,
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await authorize("inbox.manage"))) return denied;
  const parsed = parseForm(messageSchema, formData);
  if (!parsed.ok) return parsed.result;
  await updateMessage(id, { ...parsed.data, state: "answered" });
  revalidateAdmin();
  return { ok: true, message: "پیگیری ثبت شد." };
}
