"use client";

import { useEffect, useRef } from "react";
import { CheckCheck, Inbox, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import { ActionForm, Field, SubmitButton, Textarea } from "@/components/admin/form";
import { Avatar, Badge, Card, EmptyState, type BadgeTone } from "@/components/admin/primitives";
import { adminButton } from "@/components/admin/button";
import { useActionRunner } from "@/components/admin/use-action";
import { messageStateLabels } from "@/lib/admin/labels";
import { formatDateTime, formatDigits, formatRelative } from "@/lib/admin/format";
import { type InboxMessage, type MessageState } from "@/lib/admin/types";
import { PendingFrame, useQueryState } from "@/features/admin/navigation";
import { markMessageRead, saveMessageNote } from "@/features/admin/audience/actions";

type Row = InboxMessage & { handler?: string };

const stateTone: Record<MessageState, BadgeTone> = {
  new: "danger",
  read: "neutral",
  answered: "success",
};

export function InboxView({
  messages,
  activeId,
  now,
  canManage,
}: {
  messages: Row[];
  activeId?: string;
  now: number;
  canManage: boolean;
}) {
  const { update } = useQueryState();
  const active = messages.find((message) => message.id === activeId) ?? messages[0];

  if (messages.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Inbox}
          title="پیامی در این فهرست نیست"
          description="پیام‌هایی که بازدیدکنندگان از فرم تماس سایت می‌فرستند اینجا می‌آیند."
        />
      </Card>
    );
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <Card className="overflow-hidden">
        <PendingFrame>
          <ul className="max-h-[70dvh] divide-y divide-line overflow-y-auto">
            {messages.map((message) => {
              const selected = message.id === active?.id;
              return (
                <li key={message.id}>
                  <button
                    type="button"
                    aria-current={selected}
                    onClick={() => update({ id: message.id, page: null })}
                    className={cn(
                      "flex w-full flex-col gap-1 px-4 py-3.5 text-start transition-colors",
                      selected ? "bg-firuze/8" : "hover:bg-canvas",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {message.state === "new" && (
                        <span
                          aria-label="جدید"
                          className="size-2 shrink-0 rounded-full bg-danger"
                        />
                      )}
                      <span
                        className={cn(
                          "flex-1 truncate text-sm",
                          message.state === "new" ? "font-bold text-ink" : "text-ink",
                        )}
                      >
                        {message.name}
                      </span>
                      <time
                        dateTime={message.receivedAt}
                        className="shrink-0 text-2xs text-ink-muted"
                      >
                        {formatRelative(message.receivedAt, now)}
                      </time>
                    </span>
                    <span className="line-clamp-2 text-caption text-ink-muted">
                      {message.message}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </PendingFrame>
      </Card>
      {active && <MessageDetail key={active.id} message={active} canManage={canManage} />}
    </div>
  );
}

function MessageDetail({ message, canManage }: { message: Row; canManage: boolean }) {
  const { run } = useActionRunner();
  const marked = useRef(false);
  const isPhone = /^0?9\d{9}$/.test(message.reply);

  useEffect(() => {
    if (message.state === "new" && !marked.current) {
      marked.current = true;
      run(() => markMessageRead(message.id));
    }
  }, [message.id, message.state, run]);

  return (
    <Card>
      <header className="flex flex-wrap items-start gap-3 border-b border-line px-5 py-4">
        <Avatar name={message.name} id={message.id} />
        <div className="min-w-0 flex-1">
          <h2 className="text-body font-bold text-ink">{message.name}</h2>
          <p className="text-caption text-ink-muted">{formatDateTime(message.receivedAt)}</p>
        </div>
        <Badge tone={stateTone[message.state]} dot>
          {messageStateLabels[message.state]}
        </Badge>
      </header>
      <div className="px-5 py-5">
        <p className="text-body leading-prose whitespace-pre-line text-ink">{message.message}</p>
        <a
          href={isPhone ? `tel:${message.reply}` : `mailto:${message.reply}`}
          className={cn(adminButton({ variant: "outline", size: "sm" }), "mt-5")}
        >
          {isPhone ? <Phone aria-hidden /> : <Mail aria-hidden />}
          <span dir="ltr">{isPhone ? formatDigits(message.reply) : message.reply}</span>
        </a>
      </div>
      {message.note && (
        <p className="mx-5 mb-4 rounded-btn-sm bg-gold/10 px-3.5 py-2.5 text-caption leading-loose text-ink">
          <b>{message.handler ?? "پیگیری"}:</b> {message.note}
        </p>
      )}
      {canManage && (
        <div className="flex flex-col gap-4 border-t border-line px-5 py-4">
          <ActionForm
            action={saveMessageNote.bind(null, message.id)}
            className="flex flex-col gap-3"
          >
            <Field label="شرح پیگیری" name="note" hint="مثلاً: تماس گرفته شد و راهنمایی شد.">
              <Textarea name="note" rows={2} defaultValue={message.note ?? ""} />
            </Field>
            <SubmitButton size="sm" className="self-end">
              <CheckCheck aria-hidden />
              ثبت پاسخ و پیگیری
            </SubmitButton>
          </ActionForm>
        </div>
      )}
    </Card>
  );
}
