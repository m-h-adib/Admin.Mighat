"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarClock, Ellipsis, Pencil, Plus, Timer, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { ActionForm, DialogActions, Field, Input } from "@/components/admin/form";
import { Select, Switch } from "@/components/admin/controls";
import { DatePicker } from "@/components/admin/date-picker";
import { LanguageProvider, LanguageSwitch, LocalizedInput } from "@/components/admin/localized";
import {
  Confirm,
  Dialog,
  DialogContent,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Tooltip,
} from "@/components/admin/overlay";
import { Badge, EmptyState, Meter, type BadgeTone } from "@/components/admin/primitives";
import { adminButton } from "@/components/admin/button";
import { useActionRunner } from "@/components/admin/use-action";
import { timerScopeLabels, timerStateLabels } from "@/lib/admin/labels";
import { formatDate, formatDateTime, formatDigits } from "@/lib/admin/format";
import { MAX_TIMERS, timerScopes, type TimerRow, type TimerState } from "@/lib/admin/types";
import { LiveCountdown } from "@/features/admin/timers/LiveCountdown";
import { removeTimer, saveTimer, toggleTimer } from "@/features/admin/timers/actions";

const stateTone: Record<TimerState, BadgeTone> = {
  running: "success",
  scheduled: "judging",
  ended: "neutral",
  inactive: "neutral",
};

interface TimersBoardProps {
  timers: TimerRow[];
  editions: { id: string; label: string }[];
  currentEditionId: string;
  now: number;
  canEdit: boolean;
  openNew: boolean;
}

export function TimersBoard({
  timers,
  editions,
  currentEditionId,
  now,
  canEdit,
  openNew,
}: TimersBoardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const full = timers.length >= MAX_TIMERS;
  const [editing, setEditing] = useState<TimerRow | "new" | null>(
    openNew && canEdit && !full ? "new" : null,
  );
  const [deleting, setDeleting] = useState<TimerRow | null>(null);
  const { run, pending } = useActionRunner();
  const editionLabel = new Map(editions.map((edition) => [edition.id, edition.label]));

  function close() {
    setEditing(null);
    if (openNew) router.replace(pathname, { scroll: false });
  }

  return (
    <>
      {canEdit && (
        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          <span className="text-caption text-ink-muted">
            {formatDigits(timers.length)} از {formatDigits(MAX_TIMERS)} تایمر
          </span>
          <Tooltip
            content={
              full
                ? `حداکثر ${formatDigits(MAX_TIMERS)} تایمر می‌توان ساخت؛ یکی را ویرایش یا حذف کنید.`
                : "ساخت تایمر تازه"
            }
          >
            <span className="inline-flex">
              <button
                type="button"
                disabled={full}
                onClick={() => setEditing("new")}
                className={adminButton({ variant: "primary" })}
              >
                <Plus aria-hidden />
                تایمر تازه
              </button>
            </span>
          </Tooltip>
        </div>
      )}

      {timers.length === 0 ? (
        <EmptyState
          icon={Timer}
          title="هنوز تایمری ساخته نشده"
          description={`برای مهلت ارسال آثار یا مقالات تایمر بسازید؛ حداکثر ${formatDigits(MAX_TIMERS)} تایمر.`}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {timers.map((timer) => {
            const start = timer.startsAt ? new Date(timer.startsAt).getTime() : undefined;
            const end = new Date(timer.endsAt).getTime();
            const progress =
              start !== undefined && end > start
                ? Math.min(1, Math.max(0, (now - start) / (end - start)))
                : undefined;
            return (
              <li
                key={timer.id}
                className={cn(
                  "flex flex-col rounded-box border border-line bg-white pb-4.5 shadow-card",
                  timer.state === "inactive" && "opacity-70",
                )}
              >
                <div className="flex items-start gap-3 px-5 pt-4.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={stateTone[timer.state]} dot>
                        {timerStateLabels[timer.state]}
                      </Badge>
                      <Badge tone="teal">{timerScopeLabels[timer.scope]}</Badge>
                      <Badge>{editionLabel.get(timer.editionId) ?? timer.editionId}</Badge>
                      {timer.originalEndsAt && <Badge tone="gold">تمدیدشده</Badge>}
                    </div>
                    <h2 className="mt-2.5 text-body font-bold text-ink">{timer.name}</h2>
                    <p className="text-caption text-ink-muted">«{timer.label.fa}»</p>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <Switch
                        aria-label={timer.active ? "غیرفعال کردن" : "فعال کردن"}
                        checked={timer.active}
                        disabled={pending}
                        onCheckedChange={(checked) => run(() => toggleTimer(timer.id, checked))}
                      />
                      <Menu>
                        <MenuTrigger
                          aria-label={`عملیات ${timer.name}`}
                          className={adminButton({ variant: "ghost", size: "icon-sm" })}
                        >
                          <Ellipsis aria-hidden />
                        </MenuTrigger>
                        <MenuContent>
                          <MenuItem onSelect={() => setEditing(timer)}>
                            <Pencil aria-hidden />
                            ویرایش
                          </MenuItem>
                          <MenuSeparator />
                          <MenuItem tone="danger" onSelect={() => setDeleting(timer)}>
                            <Trash2 aria-hidden />
                            حذف
                          </MenuItem>
                        </MenuContent>
                      </Menu>
                    </div>
                  )}
                </div>

                <div className="mt-4 px-5">
                  {timer.state === "running" ? (
                    <LiveCountdown endsAt={timer.endsAt} initialNow={now} />
                  ) : timer.state === "scheduled" && timer.startsAt ? (
                    <div>
                      <p className="mb-2 text-2xs text-ink-muted">تا شروع:</p>
                      <LiveCountdown endsAt={timer.startsAt} initialNow={now} size="sm" />
                    </div>
                  ) : (
                    <p className="rounded-btn-sm bg-canvas px-3 py-2.5 text-caption text-ink-muted">
                      {timer.state === "ended"
                        ? `پایان یافت: ${formatDate(timer.endsAt)}`
                        : "این تایمر در سایت نمایش داده نمی‌شود."}
                    </p>
                  )}
                </div>

                {progress !== undefined && timer.state === "running" && (
                  <div className="mt-4 px-5">
                    <Meter
                      value={progress * 100}
                      max={100}
                      tone={progress > 0.85 ? "danger" : "teal"}
                      label="زمان سپری‌شده"
                    />
                  </div>
                )}

                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 px-5 text-caption">
                  {timer.startsAt && (
                    <>
                      <dt className="text-ink-muted">شروع</dt>
                      <dd className="text-ink">{formatDateTime(timer.startsAt)}</dd>
                    </>
                  )}
                  <dt className="text-ink-muted">پایان</dt>
                  <dd className="text-ink">{formatDateTime(timer.endsAt)}</dd>
                  {timer.originalEndsAt && (
                    <>
                      <dt className="text-ink-muted">مهلت اولیه</dt>
                      <dd className="text-ink-muted line-through">
                        {formatDateTime(timer.originalEndsAt)}
                      </dd>
                    </>
                  )}
                </dl>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent title={editing === "new" ? "تایمر تازه" : "ویرایش تایمر"} size="lg">
          {editing !== null && (
            <TimerForm
              timer={editing === "new" ? undefined : editing}
              editions={editions}
              currentEditionId={currentEditionId}
              onDone={close}
            />
          )}
        </DialogContent>
      </Dialog>

      <Confirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف این تایمر؟"
        description={deleting ? `«${deleting.name}» از همه جای سایت برداشته می‌شود.` : undefined}
        confirmLabel="حذف"
        onConfirm={() => deleting && run(() => removeTimer(deleting.id))}
      />
    </>
  );
}

function TimerForm({
  timer,
  editions,
  currentEditionId,
  onDone,
}: {
  timer?: TimerRow;
  editions: { id: string; label: string }[];
  currentEditionId: string;
  onDone: () => void;
}) {
  const [endsAt, setEndsAt] = useState(timer?.endsAt);
  const changedEnd = Boolean(timer && endsAt && endsAt !== timer.endsAt);

  return (
    <LanguageProvider>
      <ActionForm
        action={saveTimer.bind(null, timer?.id)}
        onSuccess={onDone}
        className="flex flex-col gap-5"
      >
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field
            label="نام تایمر"
            name="name"
            required
            hint="برای شناختن تایمر در پنل؛ مثلاً «مهلت ارسال آثار — دوره سوم»"
          >
            <Input name="name" defaultValue={timer?.name} />
          </Field>
          <LanguageSwitch className="mb-6" />
        </div>
        <LocalizedInput
          name="label"
          label="متنی که بالای شمارنده دیده می‌شود"
          required
          defaultValue={timer?.label}
          placeholder="تا پایان مهلت ارسال آثار"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="دوره" name="editionId" required>
            <Select
              name="editionId"
              defaultValue={timer?.editionId ?? currentEditionId}
              options={editions.map((edition) => ({ value: edition.id, label: edition.label }))}
            />
          </Field>
          <Field label="مربوط به" name="scope">
            <Select
              name="scope"
              defaultValue={timer?.scope ?? "art"}
              options={timerScopes.map((value) => ({ value, label: timerScopeLabels[value] }))}
            />
          </Field>
          <Field
            label="شروع (اختیاری)"
            name="startsAt"
            hint="برای نمایش نوار پیشرفت و تایمرهایی که بعداً شروع می‌شوند"
          >
            <DatePicker name="startsAt" withTime clearable defaultValue={timer?.startsAt} />
          </Field>
          <Field label="پایان" name="endsAt" required>
            <DatePicker name="endsAt" withTime value={endsAt ?? ""} onChange={setEndsAt} />
          </Field>
        </div>

        {timer && (changedEnd || timer.originalEndsAt) && (
          <div className="rounded-btn-sm border border-gold/40 bg-gold/8 p-3.5">
            <Switch
              name="extended"
              defaultChecked={Boolean(timer.originalEndsAt) || changedEnd}
              label="این تغییر تمدید مهلت است"
              description={`سایت برچسب «تمدید شد» را کنار شمارنده نشان می‌دهد${timer.originalEndsAt ? `؛ مهلت اولیه: ${formatDate(timer.originalEndsAt)}` : ""}.`}
            />
          </div>
        )}

        <Switch
          name="active"
          defaultChecked={timer?.active ?? true}
          label="فعال"
          description="تایمر غیرفعال در سایت دیده نمی‌شود."
          className="rounded-btn-sm bg-canvas p-4"
        />

        <DialogActions>
          <CalendarClock aria-hidden />
          {timer ? "ذخیره تایمر" : "ساخت تایمر"}
        </DialogActions>
      </ActionForm>
    </LanguageProvider>
  );
}
