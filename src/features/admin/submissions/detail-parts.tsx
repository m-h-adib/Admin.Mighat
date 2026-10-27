"use client";

import { useState } from "react";
import { CircleCheckBig, Pencil } from "lucide-react";
import { cn } from "@/lib/cn";
import { ActionForm, Field, SubmitButton, Textarea } from "@/components/admin/form";
import { adminButton } from "@/components/admin/button";
import { useActionRunner } from "@/components/admin/use-action";
import { formatDigits } from "@/lib/admin/format";
import { weightedScore } from "@/lib/admin/scoring";
import {
  type Criterion,
  type ID,
  type JudgeAssignment,
  type ReviewStatus,
  type SubmissionKind,
} from "@/lib/admin/types";
import { quickStatus, scoreAction } from "@/features/admin/submissions/actions";
import { ReviewDialog } from "@/features/admin/submissions/dialogs";

export function StatusActions({
  kind,
  id,
  status,
}: {
  kind: SubmissionKind;
  id: ID;
  status: ReviewStatus;
}) {
  const { run, pending } = useActionRunner();
  return (
    <div className="flex flex-wrap gap-2">
      {status === "pending" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => quickStatus(kind, [id], "judging"))}
          className={adminButton({ variant: "primary", size: "sm" })}
        >
          <CircleCheckBig aria-hidden />
          پذیرش برای داوری
        </button>
      )}
      <ReviewDialog
        kind={kind}
        ids={[id]}
        initial={status === "pending" ? "rejected" : status === "judged" ? "selected" : status}
        trigger={
          <button
            type="button"
            className={adminButton({
              variant: status === "pending" ? "outline" : "primary",
              size: "sm",
            })}
          >
            <Pencil aria-hidden />
            {status === "pending" ? "رد یا وضعیت دیگر" : "تغییر وضعیت"}
          </button>
        }
      />
    </div>
  );
}

export function ScoreForm({
  kind,
  id,
  criteria,
  current,
}: {
  kind: SubmissionKind;
  id: ID;
  criteria: Criterion[];
  current?: JudgeAssignment;
}) {
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      criteria.map((criterion) => [criterion.id, current?.scores?.[criterion.id] ?? 5]),
    ),
  );
  const total = weightedScore(criteria, scores);

  return (
    <ActionForm action={scoreAction.bind(null, kind, id)} className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {criteria.map((criterion) => (
          <li key={criterion.id}>
            <label className="flex flex-col gap-2">
              <span className="flex items-baseline justify-between gap-3 text-caption">
                <span className="font-medium text-ink">{criterion.title}</span>
                <span className="text-ink-muted">
                  وزن {formatDigits(criterion.weight)}٪ ·{" "}
                  <b className="text-sm text-ink tabular-nums">
                    {formatDigits(scores[criterion.id] ?? 0)}
                  </b>{" "}
                  از ۱۰
                </span>
              </span>
              <input
                type="range"
                name={`scores.${criterion.id}`}
                min={0}
                max={10}
                step={1}
                value={scores[criterion.id]}
                onChange={(event) =>
                  setScores((list) => ({ ...list, [criterion.id]: Number(event.target.value) }))
                }
                className="h-2 w-full cursor-pointer accent-teal"
                style={{ direction: "rtl" }}
              />
            </label>
          </li>
        ))}
      </ul>
      <Field
        label="نظر داور (اختیاری)"
        name="comment"
        hint="فقط مدیران و دبیرخانه این نظر را می‌بینند."
      >
        <Textarea name="comment" rows={3} defaultValue={current?.comment ?? ""} />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-btn-sm bg-canvas px-4 py-3">
        <p className="text-caption text-ink-muted">
          امتیاز نهایی شما:{" "}
          <b className={cn("text-xl tabular-nums", total >= 70 ? "text-success" : "text-ink")}>
            {formatDigits(total)}
          </b>{" "}
          از ۱۰۰
        </p>
        <SubmitButton>
          {current?.total !== undefined ? "به‌روزرسانی امتیاز" : "ثبت امتیاز"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
