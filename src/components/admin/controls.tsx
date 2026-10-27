"use client";

import { type ComponentProps, type ReactNode } from "react";
import {
  Checkbox as CheckboxPrimitive,
  Select as SelectPrimitive,
  Switch as SwitchPrimitive,
  ToggleGroup,
} from "radix-ui";
import { Check, ChevronDown, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { controlClass, useField } from "@/components/admin/form";

export interface SelectOption {
  value: string;
  label: ReactNode;
  hint?: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<ComponentProps<typeof SelectPrimitive.Root>, "children"> {
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
  "aria-label"?: string;
}

export function Select({ options, placeholder, className, size = "md", ...props }: SelectProps) {
  const field = useField();
  return (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger
        id={field?.id}
        aria-label={props["aria-label"]}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        className={cn(
          controlClass,
          "flex cursor-pointer items-center justify-between gap-2 ps-3 pe-2.5 text-start data-placeholder:text-sage",
          size === "md" ? "h-10 w-full" : "h-8.5 w-auto text-caption",
          className,
        )}
      >
        <span className="truncate">
          <SelectPrimitive.Value placeholder={placeholder} />
        </span>
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 text-ink-muted" aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-60 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden rounded-btn-sm border border-line bg-white shadow-pop",
            "data-[state=open]:animate-pop-in",
          )}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  "relative flex cursor-pointer items-center gap-2 rounded-md py-2 ps-8 pe-3 text-sm text-ink outline-none select-none",
                  "data-disabled:cursor-not-allowed data-disabled:opacity-45 data-highlighted:bg-green-900/6",
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute start-2.5">
                  <Check className="size-4 text-teal" aria-hidden />
                </SelectPrimitive.ItemIndicator>
                <div className="flex flex-col">
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  {option.hint && <span className="text-2xs text-ink-muted">{option.hint}</span>}
                </div>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

interface SwitchProps extends ComponentProps<typeof SwitchPrimitive.Root> {
  label?: ReactNode;
  description?: ReactNode;
}

export function Switch({ label, description, className, id, ...props }: SwitchProps) {
  const control = (
    <SwitchPrimitive.Root
      id={id}
      className={cn(
        "relative inline-flex h-5.5 w-9.5 shrink-0 cursor-pointer items-center rounded-full bg-line-strong transition-colors duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-teal",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        !label && className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block size-4.5 rounded-full bg-white shadow-card transition-transform duration-200 ease-miqat",
          "translate-x-0.5 data-[state=checked]:translate-x-4.5 rtl:-translate-x-0.5 rtl:data-[state=checked]:-translate-x-4.5",
        )}
      />
    </SwitchPrimitive.Root>
  );
  if (!label) return control;
  return (
    <label className={cn("flex cursor-pointer items-start justify-between gap-4", className)}>
      <span className="flex flex-col">
        <span className="text-sm font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 text-caption text-ink-muted">{description}</span>}
      </span>
      {control}
    </label>
  );
}

interface CheckboxProps extends ComponentProps<typeof CheckboxPrimitive.Root> {
  label?: ReactNode;
  description?: ReactNode;
}

export function Checkbox({ label, description, className, ...props }: CheckboxProps) {
  const box = (
    <CheckboxPrimitive.Root
      className={cn(
        "flex size-4.5 shrink-0 cursor-pointer items-center justify-center rounded-xs border border-line-strong bg-white transition-colors",
        "hover:border-teal data-[state=checked]:border-teal data-[state=checked]:bg-teal data-[state=indeterminate]:border-teal data-[state=indeterminate]:bg-teal",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        !label && className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-white">
        {props.checked === "indeterminate" ? (
          <Minus className="size-3.5" strokeWidth={3} aria-hidden />
        ) : (
          <Check className="size-3.5" strokeWidth={3} aria-hidden />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
  if (!label) return box;
  return (
    <label className={cn("flex cursor-pointer items-start gap-2.5", className)}>
      <span className="mt-0.5">{box}</span>
      <span className="flex flex-col">
        <span className="text-sm text-ink">{label}</span>
        {description && <span className="text-2xs text-ink-muted">{description}</span>}
      </span>
    </label>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
  size?: "sm" | "md";
  className?: string;
}

export function Segmented<T extends string>({
  value,
  onValueChange,
  options,
  label,
  size = "md",
  className,
}: SegmentedProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => next && onValueChange(next as T)}
      aria-label={label}
      className={cn("inline-flex rounded-btn-sm bg-green-900/6 p-0.75", className)}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md font-medium text-ink-muted transition-[background-color,color,box-shadow] duration-150",
            "hover:text-ink data-[state=on]:bg-white data-[state=on]:text-ink data-[state=on]:shadow-card",
            size === "md" ? "h-8 px-3 text-caption" : "h-7 px-2.5 text-2xs",
          )}
        >
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
