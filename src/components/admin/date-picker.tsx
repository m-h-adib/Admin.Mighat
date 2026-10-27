"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { controlClass, useField } from "@/components/admin/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/admin/overlay";
import { adminButton } from "@/components/admin/button";
import { formatDate, formatDateTime, formatDigits, formatTwoDigits } from "@/lib/admin/format";
import {
  compareJalali,
  fromJalali,
  jalaliMonthLength,
  jalaliMonths,
  jalaliWeekday,
  jalaliWeekdays,
  toTehran,
  todayJalali,
  type JalaliDate,
} from "@/lib/jalali";

interface DatePickerProps {
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (iso: string | undefined) => void;
  withTime?: boolean;
  defaultTime?: string;
  placeholder?: string;
  clearable?: boolean;
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
}

function parse(iso: string | undefined) {
  if (!iso) return undefined;
  const parts = toTehran(iso);
  return {
    date: { year: parts.year, month: parts.month, day: parts.day },
    time: `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`,
  };
}

export function DatePicker({
  name,
  defaultValue,
  value: controlled,
  onChange,
  withTime = false,
  defaultTime = "00:00",
  placeholder = "انتخاب تاریخ",
  clearable = false,
  size = "md",
  className,
  ...props
}: DatePickerProps) {
  const field = useField();
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled !== undefined ? controlled || undefined : internal;
  const selected = useMemo(() => parse(value), [value]);
  const today = useMemo(() => todayJalali(), []);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => selected?.date ?? today);
  const [time, setTime] = useState(selected?.time ?? (withTime ? "10:00" : defaultTime));

  function commit(date: JalaliDate | undefined, nextTime = time) {
    const iso = date ? fromJalali(date, withTime ? nextTime : defaultTime) : undefined;
    setInternal(iso);
    onChange?.(iso);
  }

  const days = jalaliMonthLength(view.year, view.month);
  const lead = jalaliWeekday({ ...view, day: 1 });
  const cells = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, index) => index + 1),
  ];

  function shiftMonth(offset: number) {
    const index = view.year * 12 + (view.month - 1) + offset;
    setView({ year: Math.floor(index / 12), month: (index % 12) + 1, day: 1 });
  }

  const [hour, minute] = time.split(":");

  return (
    <div className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setView(selected?.date ?? today);
        }}
      >
        <PopoverTrigger
          type="button"
          id={field?.id}
          aria-label={props["aria-label"]}
          aria-describedby={field?.describedBy}
          aria-invalid={field?.invalid || undefined}
          className={cn(
            controlClass,
            "flex w-full cursor-pointer items-center gap-2 ps-3 text-start",
            clearable && value ? "pe-9" : "pe-3",
            size === "md" ? "h-10" : "h-8.5 text-caption",
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-ink-muted" aria-hidden />
          <span className={cn("truncate", !value && "text-sage")}>
            {value ? (withTime ? formatDateTime(value) : formatDate(value)) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-74 p-3">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="ماه قبل"
              className={adminButton({ variant: "ghost", size: "icon-sm" })}
              onClick={() => shiftMonth(-1)}
            >
              <ChevronRight className="ltr:rotate-180" aria-hidden />
            </button>
            <p className="text-sm font-bold text-ink" aria-live="polite">
              {jalaliMonths[view.month - 1]} {formatDigits(view.year)}
            </p>
            <button
              type="button"
              aria-label="ماه بعد"
              className={adminButton({ variant: "ghost", size: "icon-sm" })}
              onClick={() => shiftMonth(1)}
            >
              <ChevronLeft className="ltr:rotate-180" aria-hidden />
            </button>
          </div>
          <div role="grid" aria-label="تقویم" className="grid grid-cols-7 gap-0.5 text-center">
            {jalaliWeekdays.map((weekday) => (
              <span
                key={weekday}
                role="columnheader"
                className="py-1 text-2xs font-medium text-ink-muted"
              >
                {weekday}
              </span>
            ))}
            {cells.map((day, index) => {
              if (day === null) return <span key={`blank-${index}`} />;
              const date = { ...view, day };
              const isSelected = selected && compareJalali(selected.date, date) === 0;
              const isToday = compareJalali(today, date) === 0;
              const isFriday = (lead + day - 1) % 7 === 6;
              return (
                <button
                  key={day}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  onClick={() => {
                    commit(date);
                    if (!withTime) setOpen(false);
                  }}
                  className={cn(
                    "flex h-8.5 items-center justify-center rounded-md text-caption transition-colors",
                    isSelected
                      ? "bg-teal font-bold text-white"
                      : cn("hover:bg-green-900/6", isFriday ? "text-danger" : "text-ink"),
                    isToday && !isSelected && "font-bold ring-1 ring-teal/50 ring-inset",
                  )}
                >
                  {formatDigits(day)}
                </button>
              );
            })}
          </div>
          {withTime && (
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="text-caption text-ink-muted">ساعت</span>
              <div dir="ltr" className="flex items-center gap-1">
                <TimeInput
                  label="ساعت"
                  value={Number(hour)}
                  max={23}
                  onChange={(next) => {
                    const nextTime = `${String(next).padStart(2, "0")}:${minute}`;
                    setTime(nextTime);
                    if (selected) commit(selected.date, nextTime);
                  }}
                />
                <span className="text-ink-muted">:</span>
                <TimeInput
                  label="دقیقه"
                  value={Number(minute)}
                  max={59}
                  step={5}
                  onChange={(next) => {
                    const nextTime = `${hour}:${String(next).padStart(2, "0")}`;
                    setTime(nextTime);
                    if (selected) commit(selected.date, nextTime);
                  }}
                />
              </div>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
            <button
              type="button"
              className={adminButton({ variant: "subtle", size: "xs" })}
              onClick={() => {
                commit(today);
                setView(today);
                if (!withTime) setOpen(false);
              }}
            >
              امروز
            </button>
            {withTime && (
              <button
                type="button"
                className={adminButton({ variant: "primary", size: "xs" })}
                onClick={() => setOpen(false)}
              >
                تأیید
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {clearable && value && (
        <button
          type="button"
          aria-label="پاک کردن تاریخ"
          onClick={() => commit(undefined)}
          className="absolute end-1.5 top-1/2 flex size-6.5 -translate-y-1/2 items-center justify-center rounded-sm text-sage hover:bg-green-900/6 hover:text-ink"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}

function TimeInput({
  label,
  value,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-8 cursor-pointer rounded-md border border-line-strong bg-white px-1.5 text-caption tabular-nums outline-none focus:border-teal"
    >
      {Array.from({ length: Math.floor(max / step) + 1 }, (_, index) => index * step).map(
        (option) => (
          <option key={option} value={option}>
            {formatTwoDigits(option)}
          </option>
        ),
      )}
    </select>
  );
}
