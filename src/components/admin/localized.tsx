"use client";

import { createContext, use, useState, type FormEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Field, Input, Textarea, useFormState } from "@/components/admin/form";
import { Segmented } from "@/components/admin/controls";
import { formatDigits } from "@/lib/admin/format";
import { type Localized } from "@/types/domain";

type Lang = "fa" | "en";

const LanguageContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void } | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fa");
  return <LanguageContext value={{ lang, setLang }}>{children}</LanguageContext>;
}

export function LanguageSwitch({ className }: { className?: string }) {
  const context = use(LanguageContext);
  const { state } = useFormState();
  if (!context) return null;
  const errors = state && !state.ok ? Object.keys(state.fieldErrors ?? {}) : [];
  const flag = (lang: Lang) =>
    errors.some((key) => key.endsWith(`.${lang}`)) && (
      <span aria-label="خطا" className="size-1.5 rounded-full bg-danger" />
    );
  return (
    <Segmented
      label="زبان محتوا"
      value={context.lang}
      onValueChange={context.setLang}
      className={className}
      options={[
        { value: "fa", label: <>فارسی {flag("fa")}</> },
        { value: "en", label: <>English {flag("en")}</> },
      ]}
    />
  );
}

interface LocalizedInputProps {
  name: string;
  label: string;
  defaultValue?: Partial<Localized>;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  hint?: ReactNode;
  maxLength?: number;
  placeholder?: string;
}

export function LocalizedInput({
  name,
  label,
  defaultValue,
  required,
  multiline,
  rows,
  hint,
  maxLength,
  placeholder,
}: LocalizedInputProps) {
  const shared = use(LanguageContext);
  const [own, setOwn] = useState<Lang>("fa");
  const lang = shared?.lang ?? own;
  const [lengths, setLengths] = useState({
    fa: defaultValue?.fa?.length ?? 0,
    en: defaultValue?.en?.length ?? 0,
  });

  const toggle = !shared && (
    <div role="group" aria-label={`زبان ${label}`} className="flex gap-0.5 text-2xs">
      {(["fa", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={lang === option}
          onClick={() => setOwn(option)}
          className={cn(
            "rounded-xs px-1.5 py-0.5 font-medium transition-colors",
            lang === option ? "bg-green-900 text-parchment" : "text-ink-muted hover:bg-green-900/6",
          )}
        >
          {option === "fa" ? "فا" : "EN"}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {(["fa", "en"] as const).map((option) => {
        const fieldName = `${name}.${option}`;
        const counter = maxLength && (
          <span
            className={cn(
              "text-2xs tabular-nums",
              lengths[option] > maxLength ? "text-danger" : "text-ink-muted",
            )}
          >
            {formatDigits(lengths[option])}/{formatDigits(maxLength)}
          </span>
        );
        const props = {
          name: fieldName,
          defaultValue: defaultValue?.[option] ?? "",
          dir: option === "en" ? "ltr" : "rtl",
          lang: option,
          placeholder: option === "fa" ? placeholder : undefined,
          onInput: (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const length = event.currentTarget.value.length;
            setLengths((current) => ({ ...current, [option]: length }));
          },
        } as const;
        return (
          <div key={option} hidden={lang !== option}>
            <Field
              label={option === "fa" ? label : `${label} (انگلیسی)`}
              name={fieldName}
              required={required && option === "fa"}
              hint={
                option === "en"
                  ? "اختیاری؛ اگر خالی بماند نسخه انگلیسی سایت متن فارسی را نشان می‌دهد."
                  : hint
              }
              aside={
                <span className="flex items-center gap-2">
                  {counter}
                  {toggle}
                </span>
              }
            >
              {multiline ? <Textarea rows={rows} {...props} /> : <Input {...props} />}
            </Field>
          </div>
        );
      })}
    </>
  );
}
