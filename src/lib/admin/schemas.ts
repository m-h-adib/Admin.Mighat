import { z } from "zod";
import { categoryIds } from "@/types/domain";
import { isNationalId, latinDigits } from "@/lib/digits";
import { channelKeys, homeSections, reviewStatuses, timerScopes } from "@/lib/admin/types";

z.config(z.locales.fa());

const digits = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (typeof value === "string" ? latinDigits(value).trim() : value), schema);

const text = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} را وارد کنید.`).max(max, `${label} حداکثر ${max} نویسه باشد.`);

const optional = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max, `حداکثر ${max} نویسه مجاز است.`)
    .optional()
    .transform((value) => value || undefined);

const textOrEmpty = (max = 2000) => optional(max).transform((value) => value ?? "");

const checkbox = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

const number = (min: number, max: number) =>
  digits(
    z.coerce
      .number({ error: "یک عدد وارد کنید." })
      .int("عدد صحیح وارد کنید.")
      .min(min, `کمتر از ${min} مجاز نیست.`)
      .max(max, `بیشتر از ${max} مجاز نیست.`),
  );

const optionalNumber = (min: number, max: number) =>
  z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    number(min, max).optional(),
  );

const isoDate = z
  .string({ error: "تاریخ را انتخاب کنید." })
  .min(1, "تاریخ را انتخاب کنید.")
  .refine((value) => !Number.isNaN(Date.parse(value)), "تاریخ معتبر نیست.");

const optionalDate = z
  .string()
  .optional()
  .transform((value) => value || undefined)
  .refine((value) => value === undefined || !Number.isNaN(Date.parse(value)), "تاریخ معتبر نیست.");

const localized = (label: string, max = 200) =>
  z.object({ fa: text(label, max), en: optional(max) });

const localizedOptional = (max = 2000) => z.object({ fa: textOrEmpty(max), en: optional(max) });

const mobile = digits(z.string().regex(/^09\d{9}$/, "شماره همراه را مثل ۰۹۱۲۱۲۳۴۵۶۷ وارد کنید."));

const nationalId = digits(z.string().refine(isNationalId, "کد ملی ده‌رقمی معتبر وارد کنید."));

const email = z.union([z.literal(""), z.email("ایمیل معتبر نیست.")]);

export const profileSchema = z.object({
  name: text("نام", 80),
  phone: mobile,
  email,
});

export const reviewSchema = z
  .object({
    status: z.enum(reviewStatuses),
    reason: optional(300),
    rank: optionalNumber(1, 3),
  })
  .refine((value) => value.status !== "rejected" || value.reason, {
    path: ["reason"],
    message: "دلیل رد را بنویسید یا انتخاب کنید.",
  });

export const scoreSchema = z.object({
  scores: z.record(z.string(), number(0, 10)),
  comment: optional(1000),
});

export const participantSchema = z.object({
  firstName: text("نام", 60),
  lastName: text("نام خانوادگی", 60),
  phone: mobile,
  caravanNo: digits(z.string().regex(/^\d{3,6}$/, "شماره کاروان معتبر نیست.")),
  province: text("استان", 60),
});

export const newsSchema = z
  .object({
    intent: z.enum(["draft", "publish"]),
    title: localized("عنوان", 200),
    body: localizedOptional(20000),
    cover: optional(500),
  })
  .refine((value) => value.intent === "draft" || value.body.fa.length > 0, {
    path: ["body", "fa"],
    message: "برای انتشار، متن خبر را بنویسید.",
  });

export const winnerSchema = z
  .object({
    editionId: z.string().min(1),
    kind: z.enum(["art", "science"]),
    category: z.string().trim().min(1, "بخش را انتخاب کنید."),
    rank: number(1, 3),
    title: localized("عنوان اثر", 200),
    name: localized("نام برگزیده", 120),
    province: localized("استان", 60),
    featured: checkbox,
    submissionId: optional(40),
  })
  .refine(
    (value) =>
      value.kind === "science" || (categoryIds as readonly string[]).includes(value.category),
    { path: ["category"], message: "بخش را انتخاب کنید." },
  );

export const messageSchema = z.object({ note: optional(1000) });

export const timerSchema = z
  .object({
    name: text("نام تایمر", 120),
    label: localized("متن نمایشی", 120),
    editionId: z.string().min(1, "دوره را انتخاب کنید."),
    scope: z.enum(timerScopes),
    startsAt: optionalDate,
    endsAt: isoDate,
    extended: checkbox,
    active: checkbox,
  })
  .refine((value) => !value.startsAt || value.startsAt < value.endsAt, {
    path: ["endsAt"],
    message: "زمان پایان باید بعد از زمان شروع باشد.",
  });

export const editionSchema = z
  .object({
    number: number(1, 99),
    title: localized("عنوان دوره", 80),
    papersDeadline: optionalDate,
    worksDeadline: optionalDate,
    closingDate: optionalDate,
    current: checkbox,
  })
  .refine(
    (value) =>
      !value.closingDate ||
      [value.papersDeadline, value.worksDeadline].every(
        (deadline) => !deadline || Date.parse(deadline) < Date.parse(value.closingDate!),
      ),
    { path: ["closingDate"], message: "تاریخ اختتامیه باید بعد از مهلت‌های ارسال باشد." },
  );

export const categorySchema = z.object({
  enabled: checkbox,
  formats: z
    .string()
    .transform((value) =>
      value
        .split(/[,،\s]+/)
        .map((item) => item.trim().replace(/^\./, "").toLowerCase())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.string().regex(/^[a-z0-9]{2,5}$/, "پسوند نامعتبر است."))
        .min(1, "دست‌کم یک قالب فایل وارد کنید."),
    ),
  maxSizeMb: number(1, 4096),
  maxDurationMin: optionalNumber(1, 180),
  maxPerParticipant: number(1, 20),
  guide: localizedOptional(1000),
});

export const intakeSchema = z.object({
  open: checkbox,
  closedMessage: localized("پیام بسته بودن", 200),
});

export const identitySchema = z.object({
  name: localized("نام سایت", 120),
  tagline: localizedOptional(200),
});

export const contactSchema = z.object({
  phone: textOrEmpty(40),
  email: textOrEmpty(120),
  address: localizedOptional(300),
  hours: localizedOptional(120),
});

const channel = z.object({
  url: z.union([z.literal(""), z.url({ error: "نشانی کامل با https:// وارد کنید." })]),
  handle: textOrEmpty(60),
});

export const channelsSchema = z.object({
  channels: z.object(
    Object.fromEntries(channelKeys.map((key) => [key, channel])) as Record<
      (typeof channelKeys)[number],
      typeof channel
    >,
  ),
});

export const homeSchema = z.object({
  sections: z.object(
    Object.fromEntries(homeSections.map((key) => [key, checkbox])) as Record<
      (typeof homeSections)[number],
      typeof checkbox
    >,
  ),
  newsCount: number(3, 12),
  worksCount: number(4, 16),
  stats: z.object({
    mode: z.enum(["auto", "manual"]),
    works: number(0, 1_000_000),
    categories: number(0, 50),
    editions: number(0, 50),
  }),
});

export const bannerSchema = z
  .object({
    enabled: checkbox,
    text: localized("متن نوار", 200),
    link: textOrEmpty(300),
    linkLabel: localizedOptional(40),
    startsAt: optionalDate,
    endsAt: optionalDate,
  })
  .refine((value) => !value.startsAt || !value.endsAt || value.startsAt < value.endsAt, {
    path: ["endsAt"],
    message: "پایان نمایش باید بعد از شروع آن باشد.",
  });

export const userSchema = z.object({
  name: text("نام و نام خانوادگی", 80),
  nationalId,
  phone: mobile,
  email,
  permissions: z.array(z.string()).default([]),
  scope: z
    .object({
      categories: z.array(z.enum(categoryIds)).default([]),
      topics: z.array(z.string()).default([]),
    })
    .default({ categories: [], topics: [] }),
});
