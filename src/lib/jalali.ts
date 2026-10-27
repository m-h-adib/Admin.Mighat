import { timeZone } from "@/i18n/config";

export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

export const jalaliMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export const jalaliWeekdays = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

const TEHRAN_OFFSET = "+03:30";

const breaks = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394,
  2456, 3178,
];

const div = (a: number, b: number) => Math.trunc(a / b);
const mod = (a: number, b: number) => a - Math.trunc(a / b) * b;

function farvardinFirst(jy: number) {
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0]!;
  let jump = 0;
  for (let i = 1; i < breaks.length; i += 1) {
    const jm = breaks[i]!;
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  const n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  return { gy, march: 20 + leapJ - leapG };
}

function gregorianToDay(gy: number, gm: number, gd: number) {
  const d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  return d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
}

function dayToGregorian(jdn: number) {
  let j = 4 * jdn + 139361631;
  j += div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function jalaliToDay({ year, month, day }: JalaliDate) {
  const { gy, march } = farvardinFirst(year);
  return gregorianToDay(gy, 3, march) + (month - 1) * 31 - div(month, 7) * (month - 7) + day - 1;
}

function dayToJalali(jdn: number): JalaliDate {
  let year = dayToGregorian(jdn).gy - 621;
  let start = jalaliToDay({ year, month: 1, day: 1 });
  if (jdn < start) {
    year -= 1;
    start = jalaliToDay({ year, month: 1, day: 1 });
  }
  let k = jdn - start;
  if (k <= 185) return { year, month: 1 + div(k, 31), day: mod(k, 31) + 1 };
  k -= 186;
  return { year, month: 7 + div(k, 30), day: mod(k, 30) + 1 };
}

export function jalaliMonthLength(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return (
    jalaliToDay({ year: year + 1, month: 1, day: 1 }) - jalaliToDay({ year, month: 12, day: 1 })
  );
}

export function jalaliWeekday(date: JalaliDate): number {
  return (mod(jalaliToDay(date), 7) + 2) % 7;
}

export function compareJalali(a: JalaliDate, b: JalaliDate): number {
  return jalaliToDay(a) - jalaliToDay(b);
}

const tehranParts = new Intl.DateTimeFormat("en-US", {
  timeZone,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});

export function toTehran(iso: string | Date): JalaliDate & { hour: number; minute: number } {
  const parts = Object.fromEntries(
    tehranParts.formatToParts(new Date(iso)).map((part) => [part.type, Number(part.value)]),
  ) as Record<"year" | "month" | "day" | "hour" | "minute", number>;
  const date = dayToJalali(gregorianToDay(parts.year, parts.month, parts.day));
  return { ...date, hour: parts.hour, minute: parts.minute };
}

const pad = (value: number) => String(value).padStart(2, "0");

export function fromJalali(date: JalaliDate, time = "00:00"): string {
  const { gy, gm, gd } = dayToGregorian(jalaliToDay(date));
  return `${gy}-${pad(gm)}-${pad(gd)}T${time}:00${TEHRAN_OFFSET}`;
}

export function todayJalali(): JalaliDate {
  const { year, month, day } = toTehran(new Date());
  return { year, month, day };
}
