"use client";

import { useState } from "react";
import { Medal, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { type Rank } from "@/types/domain";
import { ActionForm, DialogActions, Field } from "@/components/admin/form";
import { Select, Switch } from "@/components/admin/controls";
import { LanguageProvider, LanguageSwitch, LocalizedInput } from "@/components/admin/localized";
import { Confirm, Dialog, DialogContent, Tooltip } from "@/components/admin/overlay";
import { Card, EmptyState } from "@/components/admin/primitives";
import { adminButton } from "@/components/admin/button";
import { useActionRunner } from "@/components/admin/use-action";
import { formatDigits } from "@/lib/admin/format";
import { type SubmissionKind, type WinnerEntry } from "@/lib/admin/types";
import { SubmissionIcon } from "@/features/admin/submissions/icons";
import { featureWinner, removeWinner, saveWinner } from "@/features/admin/winners/actions";

export interface WinnerCandidate {
  id: string;
  title: string;
  name: string;
  province: string;
  category: string;
  score?: number;
}

export interface WinnerSection {
  id: string;
  label: string;
}

const ranks: Rank[] = [1, 2, 3];

const rankStyles: Record<Rank, string> = {
  1: "bg-gold text-green-950",
  2: "bg-mist-light text-ink",
  3: "bg-[#c9926a] text-white",
};

const rankNames: Record<Rank, string> = { 1: "رتبه اول", 2: "رتبه دوم", 3: "رتبه سوم" };

const formLabels: Record<SubmissionKind, { pick: string; item: string; name: string }> = {
  art: { pick: "از میان آثار برگزیده این بخش", item: "اثر", name: "نام برگزیده" },
  science: { pick: "از میان مقالات برگزیده این محور", item: "مقاله", name: "نام نویسنده" },
};

interface WinnersBoardProps {
  kind: SubmissionKind;
  editionId: string;
  sections: WinnerSection[];
  winners: WinnerEntry[];
  candidates: WinnerCandidate[];
  canEdit: boolean;
}

type Editing = { winner?: WinnerEntry; category: string; rank: Rank };

export function WinnersBoard({
  kind,
  editionId,
  sections,
  winners,
  candidates,
  canEdit,
}: WinnersBoardProps) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<WinnerEntry | null>(null);
  const { run, pending } = useActionRunner();
  const podium = kind === "art";
  const featured = winners.filter((winner) => winner.featured).sort((a, b) => a.rank - b.rank);
  const sectionLabel = (id: string) => sections.find((section) => section.id === id)?.label ?? "";

  if (sections.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Medal}
          title="محوری برای بخش علمی تعریف نشده است"
          description="محورهای علمی را در «دوره‌ها و بخش‌ها» تعریف کنید تا برگزیدگان هر محور را اینجا ثبت کنید."
        />
      </Card>
    );
  }

  return (
    <>
      {podium && (
        <Card className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <Star className="size-4 fill-gold text-gold" aria-hidden />
            سکوی صفحه اول
          </p>
          {ranks.map((rank) => {
            const winner = featured.find((item) => item.rank === rank);
            return (
              <p key={rank} className="flex items-center gap-2 text-caption">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-2xs font-bold",
                    rankStyles[rank],
                  )}
                >
                  {formatDigits(rank)}
                </span>
                {winner ? (
                  <span className="text-ink">
                    {winner.title.fa}{" "}
                    <span className="text-ink-muted">({sectionLabel(winner.category)})</span>
                  </span>
                ) : (
                  <span className="text-ink-muted">انتخاب نشده</span>
                )}
              </p>
            );
          })}
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <h2 className="flex items-center gap-2.5 border-b border-line px-5 py-3.5 text-body font-bold text-ink">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-green-900 text-gold-light">
                <SubmissionIcon kind={kind} category={section.id} className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 leading-snug">{section.label}</span>
            </h2>
            <ol className="divide-y divide-line">
              {ranks.map((rank) => {
                const winner = winners.find(
                  (item) => item.category === section.id && item.rank === rank,
                );
                return (
                  <li key={rank} className="flex items-center gap-3 px-5 py-3">
                    <span
                      aria-label={rankNames[rank]}
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-bold",
                        rankStyles[rank],
                      )}
                    >
                      {formatDigits(rank)}
                    </span>
                    {winner ? (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{winner.title.fa}</p>
                          <p className="truncate text-2xs text-ink-muted">
                            {winner.name.fa} · {winner.province.fa}
                          </p>
                        </div>
                        {canEdit ? (
                          <span className="flex shrink-0 items-center">
                            {podium && (
                              <Tooltip
                                content={
                                  winner.featured
                                    ? "روی سکوی صفحه اول است"
                                    : "نمایش روی سکوی صفحه اول"
                                }
                              >
                                <button
                                  type="button"
                                  aria-pressed={winner.featured}
                                  aria-label="سکوی صفحه اول"
                                  disabled={pending}
                                  onClick={() =>
                                    run(() => featureWinner(winner.id, !winner.featured))
                                  }
                                  className={adminButton({ variant: "ghost", size: "icon-sm" })}
                                >
                                  <Star
                                    className={cn(
                                      winner.featured ? "fill-gold text-gold" : "text-sage",
                                    )}
                                    aria-hidden
                                  />
                                </button>
                              </Tooltip>
                            )}
                            <button
                              type="button"
                              aria-label="ویرایش"
                              onClick={() => setEditing({ winner, category: section.id, rank })}
                              className={adminButton({ variant: "ghost", size: "icon-sm" })}
                            >
                              <Pencil aria-hidden />
                            </button>
                            <button
                              type="button"
                              aria-label="حذف"
                              onClick={() => setDeleting(winner)}
                              className={adminButton({ variant: "ghost", size: "icon-sm" })}
                            >
                              <Trash2 aria-hidden />
                            </button>
                          </span>
                        ) : (
                          winner.featured && (
                            <Star
                              className="size-4 fill-gold text-gold"
                              aria-label="روی سکوی صفحه اول"
                            />
                          )
                        )}
                      </>
                    ) : canEdit ? (
                      <button
                        type="button"
                        onClick={() => setEditing({ category: section.id, rank })}
                        className="flex flex-1 items-center gap-1.5 rounded-md border border-dashed border-line-strong px-3 py-2 text-caption text-ink-muted transition-colors hover:border-teal hover:text-teal"
                      >
                        <Plus className="size-3.5" aria-hidden />
                        تعیین {rankNames[rank]}
                      </button>
                    ) : (
                      <span className="text-caption text-ink-muted">تعیین نشده</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </Card>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent
          title={
            editing?.winner
              ? "ویرایش برگزیده"
              : `${editing ? rankNames[editing.rank] : ""} — ${editing ? sectionLabel(editing.category) : ""}`
          }
        >
          {editing && (
            <WinnerForm
              kind={kind}
              editing={editing}
              editionId={editionId}
              candidates={candidates.filter((candidate) => candidate.category === editing.category)}
              onDone={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Confirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف این برگزیده؟"
        description={
          deleting ? `«${deleting.title.fa}» از فهرست برگزیدگان برداشته می‌شود.` : undefined
        }
        confirmLabel="حذف"
        onConfirm={() => deleting && run(() => removeWinner(deleting.id))}
      />
    </>
  );
}

function WinnerForm({
  kind,
  editing,
  editionId,
  candidates,
  onDone,
}: {
  kind: SubmissionKind;
  editing: Editing;
  editionId: string;
  candidates: WinnerCandidate[];
  onDone: () => void;
}) {
  const [source, setSource] = useState<WinnerCandidate | undefined>();
  const values = source
    ? { title: { fa: source.title }, name: { fa: source.name }, province: { fa: source.province } }
    : editing.winner;
  const labels = formLabels[kind];
  return (
    <LanguageProvider>
      <ActionForm
        key={source?.id ?? "manual"}
        action={saveWinner.bind(null, editing.winner?.id)}
        onSuccess={onDone}
        className="flex flex-col gap-5"
      >
        <input type="hidden" name="editionId" value={editionId} />
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="category" value={editing.category} />
        {(source?.id ?? editing.winner?.submissionId) && (
          <input
            type="hidden"
            name="submissionId"
            value={source?.id ?? editing.winner?.submissionId}
          />
        )}
        {!editing.winner && candidates.length > 0 && (
          <div className="rounded-btn-sm border border-teal/25 bg-firuze/6 p-3.5">
            <Field label={labels.pick} hint="مشخصات خودکار پر می‌شود.">
              <Select
                placeholder={`انتخاب ${labels.item}…`}
                value={source?.id}
                onValueChange={(id) =>
                  setSource(candidates.find((candidate) => candidate.id === id))
                }
                options={candidates.map((candidate) => ({
                  value: candidate.id,
                  label: `${candidate.title} — ${candidate.name}`,
                  hint:
                    candidate.score !== undefined
                      ? `امتیاز ${formatDigits(candidate.score)}`
                      : undefined,
                }))}
              />
            </Field>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="رتبه" name="rank">
            <Select
              name="rank"
              defaultValue={String(editing.rank)}
              options={ranks.map((rank) => ({
                value: String(rank),
                label: rankNames[rank],
              }))}
            />
          </Field>
          <LanguageSwitch className="mb-0.5" />
        </div>
        <LocalizedInput
          name="title"
          label={`عنوان ${labels.item}`}
          required
          defaultValue={values?.title}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <LocalizedInput name="name" label={labels.name} required defaultValue={values?.name} />
          <LocalizedInput name="province" label="استان" required defaultValue={values?.province} />
        </div>
        {kind === "art" && (
          <Switch
            name="featured"
            defaultChecked={editing.winner?.featured}
            label="روی سکوی صفحه اول"
            description="برای هر رتبه فقط یک اثر روی سکو می‌رود؛ انتخاب قبلی برداشته می‌شود."
          />
        )}
        <DialogActions>
          <Medal aria-hidden />
          {editing.winner ? "ذخیره" : "ثبت برگزیده"}
        </DialogActions>
      </ActionForm>
    </LanguageProvider>
  );
}
