"use client";

import { startTransition, useActionState, useId, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CircleCheck, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { isNationalId, latinDigits, persianDigits } from "@/lib/digits";
import { signIn, type SignInState } from "@/lib/auth/actions";
import { adminButton } from "@/components/admin/button";

export interface LoginLabels {
  nationalId: string;
  submit: string;
  pending: string;
  required: string;
  short: string;
  invalid: string;
}

const LENGTH = 10;

interface LoginFormProps {
  locale: string;
  labels: LoginLabels;
  className?: string;
}

export function LoginForm({ locale, labels, className }: LoginFormProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [state, dispatch, pending] = useActionState(signIn, null);
  const [digits, setDigits] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [seen, setSeen] = useState<SignInState>(null);

  const complete = digits.length === LENGTH;
  const valid = complete && isNationalId(digits);
  const message =
    submitError ??
    (state && state !== seen ? state.error : null) ??
    (complete && !valid ? labels.invalid : null);

  function handleChange(value: string) {
    setDigits(latinDigits(value).replace(/\D/g, "").slice(0, LENGTH));
    setSubmitError(null);
    setSeen(state);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) {
      if (!digits) setSubmitError(labels.required);
      else if (!complete) setSubmitError(labels.short);
      input.current?.focus();
      return;
    }
    const formData = new FormData(event.currentTarget);
    formData.set("nationalId", digits);
    startTransition(() => dispatch(formData));
  }

  return (
    <form noValidate onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="locale" value={locale} />
      <label htmlFor={id} className="text-sm font-bold text-ink">
        {labels.nationalId}
      </label>
      <div className="relative mt-2">
        <input
          ref={input}
          id={id}
          name="nationalId"
          value={locale === "fa" ? persianDigits(digits) : digits}
          onChange={(event) => handleChange(event.target.value)}
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={message ? true : undefined}
          aria-describedby={`${id}-status`}
          className={cn(
            "h-15 w-full rounded-btn border border-line-strong bg-white px-12 text-center text-3xl font-semibold text-green-900 tabular-nums shadow-card outline-none",
            "indent-[0.28em] tracking-[0.28em]",
            "transition-[border-color,box-shadow] duration-150 ease-miqat hover:border-green-900/30",
            "focus:border-teal focus:ring-4 focus:ring-firuze/15 focus-visible:outline-none",
            "aria-invalid:border-danger aria-invalid:focus:ring-danger/12",
          )}
        />
        {valid && (
          <CircleCheck
            className="absolute end-4 top-1/2 size-5.5 -translate-y-1/2 text-teal motion-safe:animate-pop-in"
            aria-hidden
          />
        )}
      </div>

      <div dir="ltr" aria-hidden className="mt-3 flex gap-1.5">
        {Array.from({ length: LENGTH }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-200 ease-miqat",
              index >= digits.length
                ? message
                  ? "bg-danger/15"
                  : "bg-line"
                : message
                  ? "bg-danger"
                  : valid
                    ? "bg-teal"
                    : "bg-gold",
            )}
          />
        ))}
      </div>
      <p
        id={`${id}-status`}
        aria-live="polite"
        className="mt-2 min-h-5.5 text-caption font-medium text-danger-ink"
      >
        {message}
      </p>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={cn(
          adminButton({ variant: "primary", size: "lg" }),
          "group mt-4 h-12 w-full rounded-btn text-base font-bold",
        )}
      >
        {pending ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden />
            {labels.pending}
          </>
        ) : (
          <>
            {labels.submit}
            <ArrowRight
              className="transition-transform duration-200 ease-miqat group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
              aria-hidden
            />
          </>
        )}
      </button>
    </form>
  );
}
