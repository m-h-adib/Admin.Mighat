"use client";

import { useState } from "react";
import { Check, ExternalLink, Filter, MessagesSquare, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Checkbox } from "@/components/admin/controls";
import { Confirm } from "@/components/admin/overlay";
import { Avatar, Badge, EmptyState, type BadgeTone } from "@/components/admin/primitives";
import { adminButton } from "@/components/admin/button";
import { useActionRunner } from "@/components/admin/use-action";
import { categoryLabels, commentStateLabels } from "@/lib/admin/labels";
import { formatDateTime, formatNumber, formatRelative } from "@/lib/admin/format";
import { type CommentState, type ID, type WorkComment } from "@/lib/admin/types";
import { AdminLink, PendingFrame } from "@/features/admin/navigation";
import { moderateComments, removeComments } from "@/features/admin/audience/actions";

const stateTone: Record<CommentState, BadgeTone> = {
  pending: "pending",
  approved: "success",
  rejected: "danger",
};

export function CommentsList({
  rows,
  now,
  worksUrl,
  can,
}: {
  rows: WorkComment[];
  now: number;
  worksUrl: string;
  can: { moderate: boolean; delete: boolean };
}) {
  const [selected, setSelected] = useState<ID[]>([]);
  const [deleting, setDeleting] = useState<ID[] | null>(null);
  const { run, pending } = useActionRunner();
  const visible = new Set(rows.map((row) => row.id));
  const picked = selected.filter((id) => visible.has(id));
  const clear = () => setSelected([]);

  if (rows.length === 0) return <EmptyState icon={MessagesSquare} title="نظری در این فهرست نیست" />;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-2.5">
        <Checkbox
          aria-label="انتخاب همه"
          checked={picked.length === rows.length ? true : picked.length ? "indeterminate" : false}
          onCheckedChange={(checked) => setSelected(checked ? rows.map((row) => row.id) : [])}
          label={picked.length ? `${formatNumber(picked.length)} انتخاب‌شده` : "انتخاب همه"}
        />
        {picked.length > 0 && (
          <span className="ms-auto flex flex-wrap gap-2">
            {can.moderate && (
              <>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => moderateComments(picked, "approved"), clear)}
                  className={adminButton({ variant: "primary", size: "sm" })}
                >
                  <Check aria-hidden />
                  تأیید
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => moderateComments(picked, "rejected"), clear)}
                  className={adminButton({ variant: "outline", size: "sm" })}
                >
                  <X aria-hidden />
                  رد
                </button>
              </>
            )}
            {can.delete && (
              <button
                type="button"
                disabled={pending}
                onClick={() => setDeleting(picked)}
                className={adminButton({ variant: "danger-ghost", size: "sm" })}
              >
                <Trash2 aria-hidden />
                حذف
              </button>
            )}
          </span>
        )}
      </div>
      <PendingFrame>
        <ul className="divide-y divide-line">
          {rows.map((row) => (
            <li
              key={row.id}
              className={cn("flex gap-3 px-5 py-4", picked.includes(row.id) && "bg-firuze/6")}
            >
              <Checkbox
                aria-label={`انتخاب نظر ${row.author}`}
                checked={picked.includes(row.id)}
                onCheckedChange={(checked) =>
                  setSelected((list) =>
                    checked ? [...list, row.id] : list.filter((id) => id !== row.id),
                  )
                }
                className="mt-2.5"
              />
              <Avatar name={row.author} id={row.id} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption">
                  <b className="text-ink">{row.author}</b>
                  <time
                    dateTime={row.date}
                    title={formatDateTime(row.date)}
                    className="text-ink-muted"
                  >
                    {formatRelative(row.date, now)}
                  </time>
                  <Badge tone={stateTone[row.state]} dot>
                    {commentStateLabels[row.state]}
                  </Badge>
                </p>
                <p className="mt-1.5 text-sm leading-loose text-ink">{row.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-2xs text-ink-muted">
                  <span>
                    درباره «{row.work.title}» ({categoryLabels[row.work.category]})
                  </span>
                  <a
                    href={`${worksUrl}/${row.work.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className={adminButton({ variant: "subtle", size: "xs" })}
                  >
                    <ExternalLink aria-hidden />
                    مشاهده اثر
                  </a>
                  <AdminLink
                    href={`/admin/comments?work=${row.work.id}`}
                    className="inline-flex items-center gap-1 hover:text-teal"
                  >
                    <Filter className="size-3" aria-hidden />
                    همه نظرهای این اثر
                  </AdminLink>
                </div>
              </div>
              <div className="flex shrink-0 items-start gap-1">
                {can.moderate && row.state !== "approved" && (
                  <button
                    type="button"
                    aria-label="تأیید"
                    disabled={pending}
                    onClick={() => run(() => moderateComments([row.id], "approved"))}
                    className={adminButton({ variant: "subtle", size: "icon-sm" })}
                  >
                    <Check aria-hidden />
                  </button>
                )}
                {can.moderate && row.state !== "rejected" && (
                  <button
                    type="button"
                    aria-label="رد"
                    disabled={pending}
                    onClick={() => run(() => moderateComments([row.id], "rejected"))}
                    className={adminButton({ variant: "ghost", size: "icon-sm" })}
                  >
                    <X aria-hidden />
                  </button>
                )}
                {can.delete && (
                  <button
                    type="button"
                    aria-label="حذف"
                    disabled={pending}
                    onClick={() => setDeleting([row.id])}
                    className={adminButton({ variant: "ghost", size: "icon-sm" })}
                  >
                    <Trash2 aria-hidden />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </PendingFrame>
      <Confirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={
          deleting && deleting.length > 1
            ? `حذف ${formatNumber(deleting.length)} نظر؟`
            : "حذف این نظر؟"
        }
        description="نظرهای حذف‌شده قابل بازگشت نیستند. برای پنهان کردن، «رد» کافی است."
        confirmLabel="حذف"
        onConfirm={() => deleting && run(() => removeComments(deleting), clear)}
      />
    </>
  );
}
