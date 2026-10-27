"use client";

import { useState, type ReactNode } from "react";
import { CalendarPlus, Pencil } from "lucide-react";
import { cn } from "@/lib/cn";
import { ActionForm, DialogActions, Field, Input, SubmitButton } from "@/components/admin/form";
import { Switch } from "@/components/admin/controls";
import { DatePicker } from "@/components/admin/date-picker";
import { LanguageProvider, LanguageSwitch, LocalizedInput } from "@/components/admin/localized";
import { Dialog, DialogContent, DialogTrigger, Tooltip } from "@/components/admin/overlay";
import { Card, CardHeader } from "@/components/admin/primitives";
import { Table, Td, Th, Tr } from "@/components/admin/table";
import { adminButton } from "@/components/admin/button";
import { useActionRunner } from "@/components/admin/use-action";
import { categoryLabels, editionName } from "@/lib/admin/labels";
import { formatDate, formatDigits, formatNumber } from "@/lib/admin/format";
import {
  type AdminEdition,
  type ArtCategoryConfig,
  type EditionStats,
  type Intake,
  type SubmissionKind,
} from "@/lib/admin/types";
import { SubmissionIcon } from "@/features/admin/submissions/icons";
import {
  activateEditionAction,
  categoryAction,
  editionAction,
  intakeAction,
  toggleCategory,
} from "@/features/admin/festival/actions";

function FormDialog({
  title,
  trigger,
  children,
}: {
  title: string;
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={title}>{open && children(() => setOpen(false))}</DialogContent>
    </Dialog>
  );
}

const editionDates = [
  { name: "worksDeadline", label: "مهلت ارسال آثار", time: "23:59" },
  { name: "papersDeadline", label: "مهلت ارسال مقالات", time: "23:59" },
  { name: "closingDate", label: "تاریخ اختتامیه", time: "10:00" },
] as const;

export function EditionsPanel({
  editions,
  currentEditionId,
  stats,
  canEdit,
}: {
  editions: AdminEdition[];
  currentEditionId: string;
  stats: Record<string, EditionStats>;
  canEdit: boolean;
}) {
  const { run, pending } = useActionRunner();
  const next = Math.max(0, ...editions.map((edition) => edition.number)) + 1;
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="دوره‌های جشنواره"
        description="دوره فعال، مبنای پیشخوان، تایمرها و فهرست آثار است؛ همیشه یک دوره فعال است."
        action={
          canEdit && (
            <FormDialog
              title="دوره تازه"
              trigger={
                <button type="button" className={adminButton({ variant: "primary", size: "sm" })}>
                  <CalendarPlus aria-hidden />
                  دوره تازه
                </button>
              }
            >
              {(close) => <EditionForm defaultNumber={next} onDone={close} />}
            </FormDialog>
          )
        }
      />
      <div className="mt-4">
        <Table>
          <thead>
            <tr>
              <Th>دوره</Th>
              {editionDates.map((item) => (
                <Th key={item.name}>{item.label}</Th>
              ))}
              <Th>ارسال‌ها</Th>
              <Th>فعال</Th>
              <Th className="w-12">
                <span className="sr-only">عملیات</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {editions.map((edition) => {
              const stat = stats[edition.id];
              const current = edition.id === currentEditionId;
              return (
                <Tr key={edition.id}>
                  <Td>
                    <span className="font-bold">{edition.title.fa}</span>
                    {edition.title.en && (
                      <span className="block text-2xs text-ink-muted" dir="ltr">
                        {edition.title.en}
                      </span>
                    )}
                  </Td>
                  {editionDates.map((item) => (
                    <Td key={item.name} className="whitespace-nowrap">
                      {edition[item.name] ? (
                        formatDate(edition[item.name]!)
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </Td>
                  ))}
                  <Td className="text-caption whitespace-nowrap text-ink-muted">
                    {formatNumber(stat?.art ?? 0)} اثر · {formatNumber(stat?.science ?? 0)} مقاله
                  </Td>
                  <Td>
                    <Tooltip
                      content={
                        current
                          ? "دوره فعال است؛ برای تغییر، دوره دیگری را فعال کنید."
                          : "فعال کردن این دوره"
                      }
                    >
                      <span className="inline-flex">
                        <Switch
                          checked={current}
                          disabled={!canEdit || current || pending}
                          aria-label={`فعال بودن ${edition.title.fa}`}
                          onCheckedChange={(checked) =>
                            checked && run(() => activateEditionAction(edition.id))
                          }
                        />
                      </span>
                    </Tooltip>
                  </Td>
                  <Td>
                    {canEdit && (
                      <FormDialog
                        title={`ویرایش ${edition.title.fa}`}
                        trigger={
                          <button
                            type="button"
                            aria-label={`ویرایش ${edition.title.fa}`}
                            className={adminButton({ variant: "ghost", size: "icon-sm" })}
                          >
                            <Pencil aria-hidden />
                          </button>
                        }
                      >
                        {(close) => (
                          <EditionForm edition={edition} current={current} onDone={close} />
                        )}
                      </FormDialog>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Card>
  );
}

function EditionForm({
  edition,
  current = false,
  defaultNumber,
  onDone,
}: {
  edition?: AdminEdition;
  current?: boolean;
  defaultNumber?: number;
  onDone: () => void;
}) {
  return (
    <LanguageProvider>
      <ActionForm
        action={editionAction.bind(null, edition?.id)}
        onSuccess={onDone}
        className="flex flex-col gap-5"
      >
        <div className="flex justify-end">
          <LanguageSwitch />
        </div>
        <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
          <Field label="شماره دوره" name="number" required>
            <Input
              name="number"
              inputMode="numeric"
              dir="ltr"
              defaultValue={edition?.number ?? defaultNumber}
            />
          </Field>
          <LocalizedInput
            name="title"
            label="عنوان"
            required
            defaultValue={edition?.title ?? { fa: editionName(defaultNumber ?? 1) }}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {editionDates.map((item) => (
            <Field key={item.name} label={item.label} name={item.name}>
              <DatePicker
                name={item.name}
                clearable
                defaultTime={item.time}
                defaultValue={edition?.[item.name]}
              />
            </Field>
          ))}
        </div>
        <Switch
          name="current"
          defaultChecked={current}
          disabled={current}
          label="دوره فعال"
          description={
            current
              ? "یک دوره همیشه فعال است؛ برای تغییر، دوره دیگری را فعال کنید."
              : "با فعال کردن این دوره، دوره فعال فعلی غیرفعال می‌شود."
          }
          className="rounded-btn-sm bg-canvas p-4"
        />
        {current && <input type="hidden" name="current" value="on" />}
        <DialogActions>{edition ? "ذخیره" : "ساخت دوره"}</DialogActions>
      </ActionForm>
    </LanguageProvider>
  );
}

export function IntakeCard({
  kind,
  intake,
  canEdit,
}: {
  kind: SubmissionKind;
  intake: Intake;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(intake.open);
  return (
    <Card className="mb-4">
      <LanguageProvider>
        <ActionForm
          action={intakeAction.bind(null, kind)}
          className="flex flex-col gap-4 px-5 py-4.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={cn("size-2.5 rounded-full", open ? "bg-success" : "bg-danger")}
                aria-hidden
              />
              <div>
                <h2 className="text-body font-bold text-ink">
                  پذیرش {kind === "art" ? "آثار هنری" : "مقالات"}: {open ? "باز" : "بسته"}
                </h2>
                <p className="text-caption text-ink-muted">
                  {open
                    ? "شرکت‌کنندگان می‌توانند از پنل کاربری ارسال کنند."
                    : "دکمه‌های ارسال در سایت غیرفعال و پیام زیر نمایش داده می‌شود."}
                </p>
              </div>
            </div>
            <Switch
              name="open"
              checked={open}
              onCheckedChange={setOpen}
              disabled={!canEdit}
              aria-label="پذیرش باز است"
            />
          </div>
          {!open && (
            <LocalizedInput
              name="closedMessage"
              label="پیام هنگام بسته بودن"
              required
              defaultValue={intake.closedMessage}
            />
          )}
          {open && (
            <>
              <input type="hidden" name="closedMessage.fa" value={intake.closedMessage.fa} />
              <input type="hidden" name="closedMessage.en" value={intake.closedMessage.en ?? ""} />
            </>
          )}
          {canEdit && open !== intake.open && (
            <div className="flex items-center justify-end gap-2">
              <span className="text-caption text-ink-muted">تغییر هنوز ذخیره نشده است.</span>
              <SubmitButton size="sm">{open ? "باز کردن پذیرش" : "بستن پذیرش"}</SubmitButton>
            </div>
          )}
          {canEdit && !open && open === intake.open && (
            <SubmitButton size="sm" variant="outline" className="self-end">
              ذخیره پیام
            </SubmitButton>
          )}
        </ActionForm>
      </LanguageProvider>
    </Card>
  );
}

export function CategoriesPanel({
  categories,
  canEdit,
}: {
  categories: ArtCategoryConfig[];
  canEdit: boolean;
}) {
  const { run, pending } = useActionRunner();
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="بخش‌های هنری"
        description="قالب و حجم فایل مجاز، و سقف ارسال هر شرکت‌کننده در هر بخش."
      />
      <ul className="mt-4 divide-y divide-line border-t border-line">
        {categories.map((category) => (
          <li
            key={category.id}
            className={cn(
              "flex flex-wrap items-center gap-4 px-5 py-4",
              !category.enabled && "opacity-60",
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-btn-sm bg-green-900 text-gold-light">
              <SubmissionIcon kind="art" category={category.id} className="size-5" aria-hidden />
            </span>
            <div className="min-w-40 flex-1">
              <p className="text-sm font-bold text-ink">{categoryLabels[category.id]}</p>
              <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-2xs text-ink-muted">
                <span dir="ltr">{category.formats.map((format) => `.${format}`).join("  ")}</span>
                <span>تا {formatNumber(category.maxSizeMb)} مگابایت</span>
                {category.maxDurationMin && (
                  <span>حداکثر {formatDigits(category.maxDurationMin)} دقیقه</span>
                )}
                <span>{formatDigits(category.maxPerParticipant)} اثر برای هر نفر</span>
              </p>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <Tooltip content={category.enabled ? "غیرفعال کردن بخش" : "فعال کردن بخش"}>
                  <span>
                    <Switch
                      checked={category.enabled}
                      disabled={pending}
                      aria-label={`فعال بودن ${categoryLabels[category.id]}`}
                      onCheckedChange={(checked) => run(() => toggleCategory(category.id, checked))}
                    />
                  </span>
                </Tooltip>
                <FormDialog
                  title={`بخش ${categoryLabels[category.id]}`}
                  trigger={
                    <button
                      type="button"
                      className={adminButton({ variant: "outline", size: "sm" })}
                    >
                      <Pencil aria-hidden />
                      تنظیمات
                    </button>
                  }
                >
                  {(close) => <CategoryForm category={category} onDone={close} />}
                </FormDialog>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function CategoryForm({ category, onDone }: { category: ArtCategoryConfig; onDone: () => void }) {
  const timed = category.id === "film" || category.id === "podcast";
  return (
    <LanguageProvider>
      <ActionForm
        action={categoryAction.bind(null, category.id)}
        onSuccess={onDone}
        className="flex flex-col gap-5"
      >
        <Switch
          name="enabled"
          defaultChecked={category.enabled}
          label="این بخش فعال است"
          description="بخش غیرفعال در فراخوان و فرم ارسال دیده نمی‌شود."
        />
        <Field label="قالب‌های مجاز" name="formats" hint="با ویرگول جدا کنید؛ مثلاً jpg, png">
          <Input name="formats" dir="ltr" defaultValue={category.formats.join(", ")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="حداکثر حجم (مگابایت)" name="maxSizeMb" required>
            <Input
              name="maxSizeMb"
              inputMode="numeric"
              dir="ltr"
              defaultValue={category.maxSizeMb}
            />
          </Field>
          {timed ? (
            <Field label="حداکثر مدت (دقیقه)" name="maxDurationMin">
              <Input
                name="maxDurationMin"
                inputMode="numeric"
                dir="ltr"
                defaultValue={category.maxDurationMin ?? ""}
              />
            </Field>
          ) : (
            <span className="hidden sm:block" />
          )}
          <Field label="سقف اثر برای هر نفر" name="maxPerParticipant" required>
            <Input
              name="maxPerParticipant"
              inputMode="numeric"
              dir="ltr"
              defaultValue={category.maxPerParticipant}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <LanguageSwitch />
        </div>
        <LocalizedInput
          name="guide"
          label="راهنمای ارسال این بخش"
          multiline
          rows={3}
          defaultValue={category.guide}
          hint="در فراخوان و فرم ارسال، زیر نام بخش نمایش داده می‌شود."
        />
        <DialogActions>ذخیره</DialogActions>
      </ActionForm>
    </LanguageProvider>
  );
}
