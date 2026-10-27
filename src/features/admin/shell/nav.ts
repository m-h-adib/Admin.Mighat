import {
  BookOpenText,
  CalendarRange,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  MessagesSquare,
  Newspaper,
  Palette,
  Settings2,
  ShieldCheck,
  Timer,
  Trophy,
  UsersRound,
} from "lucide-react";
import { type Permission } from "@/lib/admin/permissions";

export type BadgeKey = "art" | "science" | "comments" | "messages";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
  badge?: BadgeKey;
  keywords?: string;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const adminNav: NavGroup[] = [
  {
    items: [
      {
        href: "/admin",
        label: "پیشخوان",
        icon: LayoutDashboard,
        permission: "dashboard.view",
        keywords: "داشبورد آمار",
      },
    ],
  },
  {
    title: "جشنواره",
    items: [
      {
        href: "/admin/art",
        label: "آثار هنری",
        icon: Palette,
        permission: "art.view",
        badge: "art",
        keywords: "عکس فیلم شعر دلنوشته داوری",
      },
      {
        href: "/admin/science",
        label: "مقالات علمی",
        icon: BookOpenText,
        permission: "science.view",
        badge: "science",
        keywords: "مقاله پژوهش داوری",
      },
      {
        href: "/admin/participants",
        label: "شرکت‌کنندگان",
        icon: UsersRound,
        permission: "participants.view",
        keywords: "زائران کاربران",
      },
      {
        href: "/admin/winners",
        label: "برگزیدگان",
        icon: Trophy,
        permission: "winners.view",
        keywords: "رتبه جوایز",
      },
    ],
  },
  {
    title: "محتوای سایت",
    items: [
      {
        href: "/admin/news",
        label: "اخبار و اطلاعیه‌ها",
        icon: Newspaper,
        permission: "news.view",
        keywords: "خبر",
      },
    ],
  },
  {
    title: "مخاطبان",
    items: [
      {
        href: "/admin/comments",
        label: "نظرات",
        icon: MessagesSquare,
        permission: "comments.view",
        badge: "comments",
        keywords: "دیدگاه",
      },
      {
        href: "/admin/inbox",
        label: "پیام‌های تماس",
        icon: Inbox,
        permission: "inbox.view",
        badge: "messages",
        keywords: "تماس با ما صندوق",
      },
    ],
  },
  {
    title: "پیکربندی",
    items: [
      {
        href: "/admin/timers",
        label: "زمان‌بندی‌ها",
        icon: Timer,
        permission: "timers.view",
        keywords: "تایمر شمارنده مهلت",
      },
      {
        href: "/admin/festival",
        label: "دوره‌ها و بخش‌ها",
        icon: CalendarRange,
        permission: "festival.view",
        keywords: "دوره بخش پذیرش",
      },
      {
        href: "/admin/site",
        label: "تنظیمات سایت",
        icon: Settings2,
        permission: "site.view",
        keywords: "ظاهر صفحه اصلی سئو تماس",
      },
    ],
  },
  {
    title: "مدیریت",
    items: [
      {
        href: "/admin/access",
        label: "مدیران و دسترسی‌ها",
        icon: ShieldCheck,
        permission: "access.view",
        keywords: "کاربر مدیر نقش مجوز",
      },
    ],
  },
];

export function isActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
