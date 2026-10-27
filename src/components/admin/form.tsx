"use client";

import {
  createContext,
  startTransition,
  use,
  useActionState,
  useEffect,
  useId,
  useRef,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { type VariantProps } from "class-variance-authority";
import { adminButton } from "@/components/admin/button";
import { DialogClose } from "@/components/admin/overlay";
import { useToast } from "@/components/admin/toast";
import { type ActionResult } from "@/lib/admin/types";

export type FormAction = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

interface FormState {
  state: ActionResult | null;
  pending: boolean;
}

const FormContext = createContext<FormState>({ state: null, pending: false });

export function useFormState() {
  return use(FormContext);
}

function useFieldError(name?: string) {
  const { state } = use(FormContext);
  if (!name || !state || state.ok) return undefined;
  return state.fieldErrors?.[name];
}

interface ActionFormProps extends Omit<ComponentProps<"form">, "action" | "onSubmit"> {
  action: FormAction;
  onSuccess?: (result: Extract<ActionResult, { ok: true }>) => void;
  successToast?: boolean;
}

export function ActionForm({
  action,
  onSuccess,
  successToast = true,
  children,
  className,
  ...props
}: ActionFormProps) {
  const [state, dispatch, pending] = useActionState(action, null);
  const notify = useToast();
  const handled = useRef<ActionResult | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state || handled.current === state) return;
    handled.current = state;
    if (state.ok) {
      if (successToast && state.message) notify({ tone: "success", title: state.message });
      onSuccess?.(state);
    } else {
      notify({ tone: "error", title: state.message });
      const first = state.fieldErrors && Object.keys(state.fieldErrors)[0];
      if (first) {
        const field = formRef.current?.querySelector<HTMLElement>(`[name="${CSS.escape(first)}"]`);
        if (field && field.offsetParent !== null) field.focus();
      }
    }
  }, [state, notify, onSuccess, successToast]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.name) formData.set(submitter.name, submitter.value);
    startTransition(() => dispatch(formData));
  }

  return (
    <FormContext value={{ state, pending }}>
      <form ref={formRef} noValidate onSubmit={handleSubmit} className={className} {...props}>
        {children}
      </form>
    </FormContext>
  );
}

type ButtonVariants = VariantProps<typeof adminButton>;

export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  className,
  pendingLabel,
  disabled,
  ...props
}: ComponentProps<"button"> & ButtonVariants & { pendingLabel?: string }) {
  const { pending } = useFormState();
  return (
    <button
      type="submit"
      {...props}
      disabled={pending || disabled}
      aria-busy={pending}
      className={cn(adminButton({ variant, size }), className)}
    >
      {pending && <LoaderCircle className="animate-spin" aria-hidden />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

export function DialogActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end gap-2 border-t border-line pt-4">
      <DialogClose className={adminButton({ variant: "ghost" })}>انصراف</DialogClose>
      <SubmitButton>{children}</SubmitButton>
    </div>
  );
}

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useField() {
  return use(FieldContext);
}

interface FieldProps {
  label: ReactNode;
  name?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  name,
  hint,
  error,
  required,
  aside,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const formError = useFieldError(name);
  const message = error ?? formError;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = message ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext value={{ id, describedBy, invalid: Boolean(message) }}>
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={id} className="text-caption font-medium text-ink">
            {label}
            {required && (
              <span className="ms-0.5 text-danger" aria-hidden>
                *
              </span>
            )}
          </label>
          {aside}
        </div>
        {children}
        {message ? (
          <p id={errorId} className="text-2xs font-medium text-danger">
            {message}
          </p>
        ) : (
          hint && (
            <p id={hintId} className="text-2xs text-ink-muted">
              {hint}
            </p>
          )
        )}
      </div>
    </FieldContext>
  );
}

export const controlClass = cn(
  "rounded-btn-sm border border-line-strong bg-white text-sm text-ink placeholder:text-sage",
  "transition-[border-color,box-shadow] duration-150 outline-none",
  "hover:border-green-900/30 focus:border-teal focus:ring-3 focus:ring-firuze/20 focus-visible:outline-none",
  "aria-invalid:border-danger aria-invalid:focus:ring-danger/15",
  "disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-muted",
);

function useControlProps<
  T extends { id?: string; "aria-describedby"?: string; "aria-invalid"?: unknown },
>(props: T) {
  const field = useField();
  return {
    ...props,
    id: props.id ?? field?.id,
    "aria-describedby": props["aria-describedby"] ?? field?.describedBy,
    "aria-invalid": props["aria-invalid"] ?? (field?.invalid || undefined),
  };
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(controlClass, "h-10 w-full px-3", className)}
      {...useControlProps(props)}
    />
  );
}

export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      rows={rows}
      className={cn(controlClass, "min-h-20 w-full resize-y px-3 py-2.5 leading-loose", className)}
      {...useControlProps(props)}
    />
  );
}

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "grid gap-x-8 gap-y-5 border-t border-line py-6 first:border-t-0 first:pt-0 lg:grid-cols-[16rem_1fr]",
        className,
      )}
    >
      <div>
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        {description && <p className="mt-1 text-caption text-ink-muted">{description}</p>}
      </div>
      <div className="grid min-w-0 gap-5">{children}</div>
    </section>
  );
}
