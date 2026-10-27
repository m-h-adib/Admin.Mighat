"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ActionForm, DialogActions, Field, Textarea } from "@/components/admin/form";
import { Checkbox, Select } from "@/components/admin/controls";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/admin/overlay";
import { StatusDot } from "@/components/admin/primitives";
import { adminButton } from "@/components/admin/button";
import { useActionRunner } from "@/components/admin/use-action";
import { kindLabels, rejectReasons, reviewHints, reviewLabels } from "@/lib/admin/labels";
import { formatDigits, formatNumber } from "@/lib/admin/format";
import {
  reviewStatuses,
  type ID,
  type JudgeScope,
  type ReviewStatus,
  type SubmissionKind,
} from "@/lib/admin/types";
import { assignSubmissions, reviewSubmissions } from "@/features/admin/submissions/actions";

interface ReviewDialogProps {
  kind: SubmissionKind;
  ids: ID[];
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initial?: ReviewStatus;
  onDone?: () => void;
}

export function ReviewDialog({
  kind,
  ids,
  trigger,
  open: controlled,
  onOpenChange,
  initial = "judging",
  onDone,
}: ReviewDialogProps) {
  const [own, setOwn] = useState(false);
  const open = controlled ?? own;
  const setOpen = (next: boolean) => {
    setOwn(next);
    onOpenChange?.(next);
  };
  const [status, setStatus] = useState<ReviewStatus>(initial);
  const [shownFor, setShownFor] = useState(open);
  if (open !== shownFor) {
    setShownFor(open);
    if (open) setStatus(initial);
  }
  const [reason, setReason] = useState<string>(rejectReasons[0]);
  const preset = rejectReasons.includes(reason as (typeof rejectReasons)[number]);
  const many = ids.length > 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        title="تغییر وضعیت"
        description={
          many ? `${formatNumber(ids.length)} ${kindLabels[kind].one} انتخاب شده است.` : undefined
        }
        size="md"
      >
        <ActionForm
          action={reviewSubmissions.bind(null, kind, ids)}
          onSuccess={() => {
            setOpen(false);
            onDone?.();
          }}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="status" value={status} />
          <div role="radiogroup" aria-label="وضعیت تازه" className="grid gap-2 sm:grid-cols-2">
            {reviewStatuses.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={status === option}
                onClick={() => setStatus(option)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-btn-sm border p-3 text-start transition-colors",
                  status === option
                    ? "border-teal bg-firuze/6 ring-1 ring-teal"
                    : "border-line hover:border-line-strong",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-ink">
                  <StatusDot tone={option} />
                  {reviewLabels[option]}
                </span>
                <span className="text-2xs text-ink-muted">{reviewHints[option]}</span>
              </button>
            ))}
          </div>

          {status === "rejected" && (
            <div className="grid gap-3">
              <Field
                label="دلیل رد"
                name="reason"
                hint="این دلیل در صفحه اثر ثبت می‌شود و می‌تواند به شرکت‌کننده اعلام شود."
              >
                <Select
                  value={preset ? reason : "other"}
                  onValueChange={(value) => setReason(value === "other" ? "" : value)}
                  options={[
                    ...rejectReasons.map((item) => ({ value: item, label: item })),
                    { value: "other", label: "دلیل دیگر…" },
                  ]}
                />
              </Field>
              {preset ? (
                <input type="hidden" name="reason" value={reason} />
              ) : (
                <Field label="توضیح دلیل" name="reason">
                  <Textarea
                    name="reason"
                    rows={2}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                </Field>
              )}
            </div>
          )}

          {status === "selected" && (
            <Field
              label="رتبه"
              name="rank"
              hint="برای راه‌یافتگان به مرحله نهایی بدون رتبه، خالی بگذارید."
            >
              <RankPicker />
            </Field>
          )}

          <DialogActions>ثبت وضعیت</DialogActions>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}

function RankPicker() {
  const [rank, setRank] = useState("");
  return (
    <div className="flex gap-2">
      <input type="hidden" name="rank" value={rank} />
      {["", "1", "2", "3"].map((value) => (
        <button
          key={value || "none"}
          type="button"
          aria-pressed={rank === value}
          onClick={() => setRank(value)}
          className={cn(
            "h-9 rounded-btn-sm border px-3.5 text-caption font-medium transition-colors",
            rank === value
              ? "border-gold bg-gold/15 text-gold-ink"
              : "border-line text-ink-muted hover:border-line-strong",
          )}
        >
          {value ? `رتبه ${formatDigits(Number(value))}` : "بدون رتبه"}
        </button>
      ))}
    </div>
  );
}

export interface JudgeOption {
  id: ID;
  name: string;
  scope: JudgeScope;
}

interface AssignDialogProps {
  kind: SubmissionKind;
  ids: ID[];
  judges: JudgeOption[];
  trigger: ReactNode;
  sectionLabels: Record<string, string>;
  onDone?: () => void;
}

export function AssignDialog({
  kind,
  ids,
  judges,
  trigger,
  sectionLabels,
  onDone,
}: AssignDialogProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ID[]>([]);
  const { run, pending } = useActionRunner();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSelected([]);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        title="سپردن به داور"
        description={
          ids.length > 1 ? `${formatNumber(ids.length)} مورد انتخاب شده است.` : undefined
        }
        footer={
          <>
            <DialogClose className={adminButton({ variant: "ghost" })}>انصراف</DialogClose>
            <button
              type="button"
              disabled={pending || selected.length === 0}
              onClick={() =>
                run(
                  () => assignSubmissions(kind, ids, selected),
                  () => {
                    setOpen(false);
                    onDone?.();
                  },
                )
              }
              className={adminButton({ variant: "primary" })}
            >
              سپردن به {selected.length ? formatDigits(selected.length) : ""} داور
            </button>
          </>
        }
      >
        {judges.length === 0 ? (
          <p className="text-sm text-ink-muted">هیچ داور فعالی برای این بخش تعریف نشده است.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {judges.map((judge) => {
              const scope = kind === "art" ? judge.scope.categories : judge.scope.topics;
              const scopeLabel = scope.map((id) => sectionLabels[id] ?? id).join("، ");
              return (
                <li key={judge.id} className="py-2.5">
                  <Checkbox
                    checked={selected.includes(judge.id)}
                    onCheckedChange={(checked) =>
                      setSelected((list) =>
                        checked ? [...list, judge.id] : list.filter((id) => id !== judge.id),
                      )
                    }
                    label={judge.name}
                    description={scopeLabel ? `حوزه: ${scopeLabel}` : "همه حوزه‌ها"}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
