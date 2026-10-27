import { localeSettings, timeZone } from "@/i18n/config";

const intl = localeSettings.fa.intl;

const numbers = new Intl.NumberFormat(intl);
const plainDigits = new Intl.NumberFormat(intl, { useGrouping: false });
const twoDigits = new Intl.NumberFormat(intl, { minimumIntegerDigits: 2, useGrouping: false });
const percents = new Intl.NumberFormat(intl, { style: "percent", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat(intl, { notation: "compact", maximumFractionDigits: 1 });
const shortDates = new Intl.DateTimeFormat(intl, {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const longDates = new Intl.DateTimeFormat(intl, {
  timeZone,
  year: "numeric",
  month: "long",
  day: "numeric",
});
const weekdayDates = new Intl.DateTimeFormat(intl, {
  timeZone,
  weekday: "long",
  month: "long",
  day: "numeric",
});
const times = new Intl.DateTimeFormat(intl, {
  timeZone,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const relative = new Intl.RelativeTimeFormat("fa", { numeric: "auto" });

export const formatNumber = (value: number) => numbers.format(value);
export const formatDigits = (value: number | string) =>
  typeof value === "number"
    ? plainDigits.format(value)
    : value.replace(/\d/g, (digit) => plainDigits.format(Number(digit)));
export const formatTwoDigits = (value: number) => twoDigits.format(value);
export const formatPercent = (ratio: number) => percents.format(ratio);
export const formatCompact = (value: number) => compact.format(value);

export const formatShortDate = (iso: string) => shortDates.format(new Date(iso));
export const formatDate = (iso: string) => longDates.format(new Date(iso));
export const formatWeekday = (iso: string) => weekdayDates.format(new Date(iso));
export const formatDateTime = (iso: string) =>
  `${longDates.format(new Date(iso))}، ساعت ${times.format(new Date(iso))}`;

export function formatRelative(iso: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "همین حالا";
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), "hour");
  if (abs < 86_400 * 30) return relative.format(Math.round(seconds / 86_400), "day");
  return formatDate(iso);
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 ** 3)
    return `${numbers.format(Math.round((bytes / 1024 ** 3) * 10) / 10)} گیگابایت`;
  if (bytes >= 1024 ** 2)
    return `${numbers.format(Math.round((bytes / 1024 ** 2) * 10) / 10)} مگابایت`;
  return `${numbers.format(Math.max(1, Math.round(bytes / 1024)))} کیلوبایت`;
}

export function fullName(person: { firstName: string; lastName: string }) {
  return `${person.firstName} ${person.lastName}`;
}

export function renderTime(): number {
  return Date.now();
}
