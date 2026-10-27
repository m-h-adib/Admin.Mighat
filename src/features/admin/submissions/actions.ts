"use server";

import { type Rank } from "@/types/domain";
import { authorize } from "@/lib/admin/session";
import { can } from "@/lib/admin/permissions";
import { denied, missing, parseForm, revalidateAdmin } from "@/lib/admin/forms";
import { reviewSchema, scoreSchema } from "@/lib/admin/schemas";
import { reviewLabels } from "@/lib/admin/labels";
import { formatNumber } from "@/lib/admin/format";
import {
  assignJudges,
  deleteSubmissions,
  getSubmission,
  scoreSubmission,
  setReviewStatus,
} from "@/lib/admin/api/submissions";
import {
  type ActionResult,
  type ID,
  type ReviewStatus,
  type SubmissionKind,
} from "@/lib/admin/types";

export async function reviewSubmissions(
  kind: SubmissionKind,
  ids: ID[],
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await authorize(`${kind}.review`))) return denied;
  const parsed = parseForm(reviewSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { status, reason, rank } = parsed.data;
  const count = await setReviewStatus(ids, status, { reason, rank: rank as Rank | undefined });
  revalidateAdmin();
  return {
    ok: true,
    message:
      count > 1
        ? `وضعیت ${formatNumber(count)} مورد «${reviewLabels[status]}» شد.`
        : `وضعیت به «${reviewLabels[status]}» تغییر کرد.`,
  };
}

export async function quickStatus(
  kind: SubmissionKind,
  ids: ID[],
  status: ReviewStatus,
): Promise<ActionResult> {
  if (!(await authorize(`${kind}.review`))) return denied;
  if (status === "rejected") return { ok: false, message: "برای رد کردن، دلیل را بنویسید." };
  const count = await setReviewStatus(ids, status);
  revalidateAdmin();
  return { ok: true, message: `وضعیت ${formatNumber(count)} مورد «${reviewLabels[status]}» شد.` };
}

export async function assignSubmissions(
  kind: SubmissionKind,
  ids: ID[],
  judgeIds: ID[],
): Promise<ActionResult> {
  if (!(await authorize(`${kind}.assign`))) return denied;
  if (judgeIds.length === 0) return { ok: false, message: "دست‌کم یک داور انتخاب کنید." };
  const count = await assignJudges(ids, judgeIds);
  revalidateAdmin();
  return { ok: true, message: `${formatNumber(count)} مورد به داوران سپرده شد.` };
}

export async function scoreAction(
  kind: SubmissionKind,
  id: ID,
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const viewer = await authorize(`${kind}.judge`);
  if (!viewer) return denied;
  const submission = await getSubmission(id);
  if (!submission) return missing;
  const assigned = submission.assignments.some((assignment) => assignment.judgeId === viewer.id);
  if (!assigned && !can(viewer, `${kind}.review`)) {
    return { ok: false, message: "این مورد به شما سپرده نشده است." };
  }
  if (submission.status === "pending" || submission.status === "rejected") {
    return { ok: false, message: "فقط موارد پذیرفته‌شده داوری می‌شوند." };
  }
  const parsed = parseForm(scoreSchema, formData);
  if (!parsed.ok) return parsed.result;
  await scoreSubmission(id, viewer.id, parsed.data.scores, parsed.data.comment);
  revalidateAdmin();
  return { ok: true, message: "امتیاز شما ثبت شد." };
}

export async function deleteAction(kind: SubmissionKind, ids: ID[]): Promise<ActionResult> {
  if (!(await authorize(`${kind}.delete`))) return denied;
  await deleteSubmissions(ids);
  revalidateAdmin();
  return { ok: true, message: `${formatNumber(ids.length)} مورد حذف شد.` };
}
