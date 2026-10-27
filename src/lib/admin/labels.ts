import { type CategoryId } from "@/types/domain";
import {
  type AdminEdition,
  type ChannelKey,
  type CommentState,
  type HomeSection,
  type MessageState,
  type ReviewStatus,
  type ScienceTopic,
  type SubmissionKind,
  type TimerScope,
  type TimerState,
} from "@/lib/admin/types";

export const categoryLabels: Record<CategoryId, string> = {
  photo: "عکس",
  film: "فیلم کوتاه",
  podcast: "پادکست",
  note: "دلنوشته",
  poem: "شعر",
  calligraphy: "خوشنویسی",
  painting: "نقاشی",
};

export const kindLabels: Record<SubmissionKind, { one: string; many: string; section: string }> = {
  art: { one: "اثر", many: "آثار هنری", section: "بخش هنری" },
  science: { one: "مقاله", many: "مقالات علمی", section: "بخش علمی" },
};

export const reviewLabels: Record<ReviewStatus, string> = {
  pending: "در انتظار بررسی",
  judging: "در حال داوری",
  judged: "داوری‌شده",
  selected: "برگزیده",
  rejected: "ردشده",
};

export const reviewHints: Record<ReviewStatus, string> = {
  pending: "هنوز بررسی اولیه نشده است",
  judging: "پذیرفته شده و نزد داوران است",
  judged: "همه داوران امتیاز داده‌اند",
  selected: "به مرحله نهایی یا جمع برگزیدگان رسیده است",
  rejected: "در بررسی اولیه یا داوری کنار گذاشته شده است",
};

export const rejectReasons = [
  "خارج از موضوع جشنواره",
  "کیفیت فنی پایین",
  "ارسال تکراری",
  "عدم رعایت مشخصات فایل",
  "اثر پیش‌تر در جشنواره دیگری برگزیده شده",
] as const;

export const timerScopeLabels: Record<TimerScope, string> = {
  art: "بخش هنری",
  science: "بخش علمی",
  general: "عمومی",
};

export const timerStateLabels: Record<TimerState, string> = {
  running: "در جریان",
  scheduled: "شروع‌نشده",
  ended: "پایان‌یافته",
  inactive: "غیرفعال",
};

export const commentStateLabels: Record<CommentState, string> = {
  pending: "در انتظار تأیید",
  approved: "تأییدشده",
  rejected: "ردشده",
};

export const messageStateLabels: Record<MessageState, string> = {
  new: "جدید",
  read: "خوانده‌شده",
  answered: "پاسخ داده‌شده",
};

export const homeSectionLabels: Record<HomeSection, { label: string; hint: string }> = {
  hero: { label: "سربرگ و شمارنده", hint: "معرفی جشنواره، دکمه‌های اصلی و تایمر" },
  hizam: { label: "نوار حزام", hint: "نوار تزئینی آیه زیر سربرگ" },
  stats: { label: "آمار جشنواره", hint: "تعداد آثار، بخش‌ها و دوره‌ها" },
  news: { label: "آخرین اخبار", hint: "اسلایدر خبرها و اطلاعیه‌ها" },
  steps: { label: "مراحل شرکت", hint: "راهنمای گام‌به‌گام ارسال اثر" },
  submit: { label: "دعوت به ارسال", hint: "دکمه‌های ارسال اثر هنری و مقاله" },
  works: { label: "آثار منتخب", hint: "گزیده‌ای از آثار برگزیده جشنواره" },
  winners: { label: "برگزیدگان", hint: "سکوی برگزیدگان دوره گذشته" },
  faq: { label: "پرسش‌های متداول", hint: "چند پرسش پرتکرار" },
  cta: { label: "نوار پایانی", hint: "دعوت دوباره به شرکت پیش از پانویس" },
};

export const channelLabels: Record<ChannelKey, string> = {
  eitaa: "ایتا",
  bale: "بله",
  rubika: "روبیکا",
  telegram: "تلگرام",
  instagram: "اینستاگرام",
  aparat: "آپارات",
};

export function topicLabels(topics: ScienceTopic[]): Record<string, string> {
  return Object.fromEntries(topics.map((topic) => [topic.id, topic.title.fa]));
}

export function sectionLabels(
  kind: SubmissionKind,
  topics: ScienceTopic[],
): Record<string, string> {
  return kind === "art" ? categoryLabels : topicLabels(topics);
}

const editionOrdinals = ["", "اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم"];

export function editionName(number: number) {
  return `دوره ${editionOrdinals[number] ?? number}`;
}

export function editionOptions(editions: AdminEdition[]) {
  return editions.map((edition) => ({ id: edition.id, label: editionName(edition.number) }));
}
