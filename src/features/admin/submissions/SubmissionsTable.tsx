"use client";

import { useState } from "react";
import { ChevronDown, ClipboardCheck, Gavel, Inbox, Trash2, UserCheck, X } from "lucide-react";
import { Badge, EmptyState } from "@/components/admin/primitives";
import { Checkbox } from "@/components/admin/controls";
import { Confirm, Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/admin/overlay";
import { Table, Td, Th, Tr, rowLinkClass } from "@/components/admin/table";
import { adminButton } from "@/components/admin/button";
import { useActionRunner } from "@/components/admin/use-action";
import { kindLabels, reviewLabels } from "@/lib/admin/labels";
import { formatDigits, formatNumber, formatShortDate, fullName } from "@/lib/admin/format";
import {
  type ID,
  type ReviewStatus,
  type SubmissionKind,
  type SubmissionRow,
} from "@/lib/admin/types";
import { AdminLink, PendingFrame, useQueryState } from "@/features/admin/navigation";
import { AssignDialog, ReviewDialog, type JudgeOption } from "@/features/admin/submissions/dialogs";
import { deleteAction, quickStatus } from "@/features/admin/submissions/actions";

interface SubmissionsTableProps {
  kind: SubmissionKind;
  rows: SubmissionRow[];
  sectionLabels: Record<string, string>;
  judges: JudgeOption[];
  viewerId: ID;
  can: { review: boolean; assign: boolean; delete: boolean; judge: boolean };
  filtered: boolean;
}

export function SubmissionsTable({
  kind,
  rows,
  sectionLabels,
  judges,
  viewerId,
  can,
  filtered,
}: SubmissionsTableProps) {
  const { params } = useQueryState();
  const [selected, setSelected] = useState<ID[]>([]);
  const [rejecting, setRejecting] = useState(false);
  const { run, pending } = useActionRunner();
  const selectable = can.review || can.assign || can.delete;
  const visible = new Set(rows.map((row) => row.id));
  const picked = selected.filter((id) => visible.has(id));
  const all = rows.length > 0 && picked.length === rows.length;
  const query = params.toString();
  const detailHref = (id: ID) => `/admin/${kind}/${id}${query ? `?${query}` : ""}`;
  const clear = () => setSelected([]);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={filtered ? ClipboardCheck : Inbox}
        title={
          filtered ? "موردی با این فیلترها پیدا نشد" : `هنوز ${kindLabels[kind].one}ی نرسیده است`
        }
        description={filtered ? "فیلترها را تغییر دهید یا پاک کنید." : undefined}
      />
    );
  }

  return (
    <div className="relative">
      {picked.length > 0 && (
        <div className="sticky top-15 z-10 flex flex-wrap items-center gap-2 border-b border-teal/25 bg-firuze/8 px-4 py-2.5 backdrop-blur sm:px-5">
          <button
            type="button"
            onClick={clear}
            aria-label="لغو انتخاب"
            className={adminButton({ variant: "ghost", size: "icon-sm" })}
          >
            <X aria-hidden />
          </button>
          <span className="text-caption font-bold text-ink">
            {formatNumber(picked.length)} مورد انتخاب شده
          </span>
          <span className="ms-auto flex flex-wrap gap-2">
            {can.review && (
              <Menu>
                <MenuTrigger
                  className={adminButton({ variant: "outline", size: "sm" })}
                  disabled={pending}
                >
                  تغییر وضعیت
                  <ChevronDown aria-hidden />
                </MenuTrigger>
                <MenuContent>
                  {(["judging", "judged", "selected", "pending"] as ReviewStatus[]).map(
                    (status) => (
                      <MenuItem
                        key={status}
                        onSelect={() => run(() => quickStatus(kind, picked, status), clear)}
                      >
                        {reviewLabels[status]}
                      </MenuItem>
                    ),
                  )}
                  <MenuItem tone="danger" onSelect={() => setRejecting(true)}>
                    رد کردن…
                  </MenuItem>
                </MenuContent>
              </Menu>
            )}
            {can.assign && (
              <AssignDialog
                kind={kind}
                ids={picked}
                judges={judges}
                sectionLabels={sectionLabels}
                onDone={clear}
                trigger={
                  <button type="button" className={adminButton({ variant: "outline", size: "sm" })}>
                    <UserCheck aria-hidden />
                    سپردن به داور
                  </button>
                }
              />
            )}
            {can.delete && (
              <Confirm
                title={`حذف ${formatNumber(picked.length)} مورد؟`}
                description="این موارد و امتیازهایشان برای همیشه حذف می‌شوند."
                confirmLabel="حذف"
                onConfirm={() => run(() => deleteAction(kind, picked), clear)}
                trigger={
                  <button
                    type="button"
                    className={adminButton({ variant: "danger-ghost", size: "sm" })}
                  >
                    <Trash2 aria-hidden />
                    حذف
                  </button>
                }
              />
            )}
          </span>
        </div>
      )}

      {can.review && (
        <ReviewDialog
          kind={kind}
          ids={picked}
          initial="rejected"
          open={rejecting}
          onOpenChange={setRejecting}
          onDone={clear}
        />
      )}

      <PendingFrame>
        <Table>
          <thead>
            <tr>
              {selectable && (
                <Th className="w-10">
                  <Checkbox
                    aria-label="انتخاب همه ردیف‌های این صفحه"
                    checked={all ? true : picked.length > 0 ? "indeterminate" : false}
                    onCheckedChange={(checked) =>
                      setSelected(checked ? rows.map((row) => row.id) : [])
                    }
                  />
                </Th>
              )}
              <Th>عنوان</Th>
              <Th>شرکت‌کننده</Th>
              <Th className="hidden xl:table-cell">تماس</Th>
              <Th>{kind === "art" ? "بخش" : "محور"}</Th>
              <Th>تاریخ ارسال</Th>
              <Th className="text-center">{can.judge && !can.review ? "امتیاز شما" : "امتیاز"}</Th>
              <Th>وضعیت</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const mine = row.assignments.find((assignment) => assignment.judgeId === viewerId);
              const scored = row.assignments.filter(
                (assignment) => assignment.total !== undefined,
              ).length;
              const isSelected = picked.includes(row.id);
              return (
                <Tr key={row.id} selected={isSelected}>
                  {selectable && (
                    <Td className="relative z-1">
                      <Checkbox
                        aria-label={`انتخاب ${row.title}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          setSelected((list) =>
                            checked ? [...list, row.id] : list.filter((id) => id !== row.id),
                          )
                        }
                      />
                    </Td>
                  )}
                  <Td className="max-w-80 min-w-52">
                    <AdminLink href={detailHref(row.id)} className={rowLinkClass}>
                      <span className="line-clamp-2">{row.title}</span>
                    </AdminLink>
                    <span
                      dir="ltr"
                      className="mt-0.5 block text-end text-2xs text-ink-muted tabular-nums"
                    >
                      {row.code}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <span className="block">{fullName(row.participant)}</span>
                    <span className="text-2xs text-ink-muted tabular-nums">
                      کد ملی {formatDigits(row.participant.nationalId)}
                    </span>
                  </Td>
                  <Td className="hidden whitespace-nowrap xl:table-cell">
                    <span className="block tabular-nums">
                      {formatDigits(row.participant.phone)}
                    </span>
                    <span className="text-2xs text-ink-muted">
                      کاروان {formatDigits(row.participant.caravanNo)}
                    </span>
                  </Td>
                  <Td className="max-w-48">
                    <span className="line-clamp-2 text-caption">
                      {sectionLabels[row.category] ?? row.category}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap tabular-nums">
                    {formatShortDate(row.submittedAt)}
                  </Td>
                  <Td className="text-center whitespace-nowrap tabular-nums">
                    {can.judge && !can.review ? (
                      mine?.total !== undefined ? (
                        <span className="font-bold">{formatDigits(mine.total)}</span>
                      ) : (
                        <Badge tone="judging">
                          <Gavel className="size-3" aria-hidden />
                          منتظر شما
                        </Badge>
                      )
                    ) : row.score !== undefined ? (
                      <span className="flex flex-col items-center leading-tight">
                        <span className="font-bold">{formatDigits(row.score)}</span>
                        <span className="text-2xs text-ink-muted">
                          {formatDigits(scored)} از {formatDigits(row.assignments.length)} داور
                        </span>
                      </span>
                    ) : row.assignments.length > 0 ? (
                      <span className="text-2xs text-ink-muted">
                        {formatDigits(scored)} از {formatDigits(row.assignments.length)} داور
                      </span>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <Badge tone={row.status} dot>
                      {reviewLabels[row.status]}
                      {row.status === "selected" && row.rank
                        ? ` · رتبه ${formatDigits(row.rank)}`
                        : ""}
                    </Badge>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </PendingFrame>
    </div>
  );
}
