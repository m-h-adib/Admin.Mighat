import { categoryIds, type CategoryId } from "@/types/domain";
import { managerPermissions } from "@/lib/admin/permissions";
import { type AdminDb } from "@/lib/admin/store";
import { type ArtCategoryConfig } from "@/lib/admin/types";

const DAY = 86_400_000;

const categoryRules: Record<
  CategoryId,
  Pick<ArtCategoryConfig, "formats" | "maxSizeMb" | "maxDurationMin" | "maxPerParticipant">
> = {
  photo: { formats: ["jpg", "png"], maxSizeMb: 10, maxPerParticipant: 5 },
  film: { formats: ["mp4", "mov"], maxSizeMb: 500, maxDurationMin: 5, maxPerParticipant: 2 },
  podcast: { formats: ["mp3", "m4a"], maxSizeMb: 60, maxDurationMin: 15, maxPerParticipant: 2 },
  note: { formats: ["docx", "pdf"], maxSizeMb: 5, maxPerParticipant: 3 },
  poem: { formats: ["docx", "pdf"], maxSizeMb: 5, maxPerParticipant: 3 },
  calligraphy: { formats: ["jpg", "png", "tif"], maxSizeMb: 20, maxPerParticipant: 3 },
  painting: { formats: ["jpg", "png", "tif"], maxSizeMb: 20, maxPerParticipant: 3 },
};

const topics = [
  ["t1", "حج؛ نمونه‌ای از پیوند عبادت فردی و مسئولیت اجتماعی"],
  ["t2", "حج و همگرایی امت اسلامی"],
  ["t3", "اسرار و معارف مناسک حج"],
  ["t4", "حج در قرآن و روایات"],
  ["t5", "تجربه زیسته زائران و آموزش حج"],
] as const;

export function createSeed(): AdminDb {
  const now = Date.now();
  const ago = (days: number) => new Date(now - days * DAY).toISOString();

  return {
    festival: {
      currentEditionId: "3",
      editions: [
        {
          id: "3",
          number: 3,
          title: { fa: "دوره سوم", en: "Third edition" },
          worksDeadline: "2026-11-08T23:59:00+03:30",
          papersDeadline: "2026-11-22T23:59:00+03:30",
          closingDate: "2027-01-20T10:00:00+03:30",
        },
      ],
      categories: categoryIds.map((id) => ({
        id,
        enabled: true,
        ...categoryRules[id],
        guide: { fa: "" },
      })),
      topics: topics.map(([id, title]) => ({ id, title: { fa: title }, enabled: true })),
      criteria: {
        art: [
          { id: "c1", title: "خلاقیت و نوآوری", weight: 30 },
          { id: "c2", title: "کیفیت فنی و هنری", weight: 30 },
          { id: "c3", title: "ارتباط با مضامین حج", weight: 25 },
          { id: "c4", title: "تأثیرگذاری و پیام", weight: 15 },
        ],
        science: [
          { id: "s1", title: "نوآوری و اصالت", weight: 25 },
          { id: "s2", title: "روش‌شناسی پژوهش", weight: 25 },
          { id: "s3", title: "استناد و منابع", weight: 20 },
          { id: "s4", title: "ساختار و نگارش", weight: 15 },
          { id: "s5", title: "ارتباط با محور", weight: 15 },
        ],
      },
      intake: {
        art: {
          open: true,
          closedMessage: {
            fa: "مهلت ارسال آثار هنری به پایان رسیده است.",
            en: "Art submissions are closed.",
          },
        },
        science: {
          open: true,
          closedMessage: {
            fa: "مهلت ارسال مقالات به پایان رسیده است.",
            en: "Paper submissions are closed.",
          },
        },
      },
    },
    timers: [
      {
        id: "tm1",
        name: "مهلت ارسال آثار هنری — دوره سوم",
        label: { fa: "تا پایان مهلت ارسال آثار", en: "Until submissions close" },
        editionId: "3",
        scope: "art",
        startsAt: ago(30),
        endsAt: "2026-11-08T23:59:00+03:30",
        active: true,
        updatedAt: ago(3),
      },
    ],
    participants: [
      {
        id: "p1",
        firstName: "زهرا",
        lastName: "محمدی",
        nationalId: "0012345679",
        phone: "09121112233",
        caravanNo: "21458",
        province: "تهران",
        gender: "female",
        birthYear: 1362,
        registeredAt: ago(12),
      },
    ],
    submissions: [
      {
        id: "a3-1",
        code: "A3-00001",
        kind: "art",
        editionId: "3",
        category: "photo",
        title: "طواف در باران",
        summary:
          "روایت زهرا محمدی از شب‌های مسجدالحرام؛ این عکس در سفر حج سال گذشته و در کنار همسفران کاروان ۲۱۴۵۸ ثبت شده است.",
        file: { name: "work-1.jpg", type: "image", size: 4_300_000 },
        participantId: "p1",
        submittedAt: ago(3),
        status: "judging",
        assignments: [{ judgeId: "u2", assignedAt: ago(2) }],
      },
      {
        id: "s3-1",
        code: "S3-0001",
        kind: "science",
        editionId: "3",
        category: "t1",
        title: "زیارت و مسئولیت اجتماعی در تجربه زائران ایرانی",
        summary:
          "این پژوهش با روش توصیفی‌ـ‌تحلیلی و با تکیه بر منابع قرآنی و روایی، کارکردهای اجتماعی سفر حج را در زندگی زائران بررسی می‌کند.",
        file: { name: "paper-1.pdf", type: "document", size: 1_250_000 },
        participantId: "p1",
        submittedAt: ago(10),
        status: "pending",
        assignments: [],
      },
    ],
    news: [
      {
        id: "n1",
        slug: "third-miqat-festival",
        title: {
          fa: "فراخوان سومین جشنواره فرهنگی هنری «میقات»",
          en: "Call for the third Miqat Cultural and Art Festival",
        },
        excerpt: {
          fa: "سومین جشنواره میقات در هفت بخش هنری و یک بخش علمی برگزار می‌شود.",
          en: "The third Miqat festival runs in seven art categories and a science section.",
        },
        body: {
          fa: "سومین جشنواره میقات در هفت بخش هنری و یک بخش علمی برگزار می‌شود.\n\nزائران حج تمتع می‌توانند آثار خود را از طریق پنل شرکت‌کنندگان ارسال کنند.",
          en: "The third Miqat festival runs in seven art categories and a science section.\n\nPilgrims can submit their works through the participant panel.",
        },
        tone: "pine",
        published: true,
        publishAt: ago(20),
        authorId: "u1",
        updatedAt: ago(20),
      },
    ],
    winners: [
      {
        id: "w1",
        editionId: "3",
        kind: "art",
        category: "photo",
        rank: 1,
        title: { fa: "سپیده‌دم عرفات" },
        name: { fa: "مهدی کریمی" },
        province: { fa: "اصفهان" },
        featured: true,
      },
    ],
    comments: [
      {
        id: "c1",
        work: { id: "1", title: "طواف در باران", category: "photo" },
        author: "مریم صادقی",
        text: "عکس بسیار تأثیرگذاری است؛ حال‌وهوای مسجدالحرام را به‌خوبی منتقل می‌کند.",
        date: ago(0.2),
        state: "pending",
      },
    ],
    inbox: [
      {
        id: "m1",
        name: "حسین رضایی",
        reply: "09131234567",
        message: "سلام، آیا می‌توان یک اثر را در دو بخش مختلف جشنواره فرستاد؟",
        receivedAt: ago(0.5),
        state: "new",
      },
    ],
    site: {
      identity: {
        name: { fa: "جشنواره فرهنگی هنری میقات", en: "Miqat Cultural and Art Festival" },
        tagline: { fa: "روایت زائران از سفر معنوی حج", en: "Pilgrims’ stories of the Hajj" },
      },
      contact: {
        phone: "",
        email: "",
        address: { fa: "", en: "" },
        hours: { fa: "", en: "" },
      },
      channels: {
        eitaa: { url: "https://eitaa.com/", handle: "" },
        bale: { url: "https://ble.ir/", handle: "" },
        rubika: { url: "", handle: "" },
        telegram: { url: "", handle: "" },
        instagram: { url: "", handle: "" },
        aparat: { url: "", handle: "" },
      },
      home: {
        sections: {
          hero: true,
          hizam: true,
          stats: true,
          news: true,
          steps: true,
          submit: true,
          works: true,
          winners: true,
          faq: true,
          cta: true,
        },
        newsCount: 6,
        worksCount: 8,
        stats: { mode: "manual", works: 1700, categories: 7, editions: 2 },
      },
      banner: {
        enabled: false,
        text: {
          fa: "مهلت ارسال مقالات علمی تا اول آذر تمدید شد.",
          en: "The paper deadline has been extended to 22 November.",
        },
        link: "/news/third-miqat-festival",
        linkLabel: { fa: "جزئیات", en: "Details" },
      },
    },
    users: [
      {
        id: "u1",
        name: "سیدعلی حسینی",
        nationalId: "1234567891",
        phone: "09121234567",
        email: "admin@miqat.ir",
        permissions: [...managerPermissions],
        scope: { categories: [], topics: [] },
        createdAt: ago(200),
      },
      {
        id: "u2",
        name: "نرگس احمدی",
        nationalId: "0087654326",
        phone: "09351234567",
        email: "",
        permissions: ["art.view", "art.judge"],
        scope: { categories: ["photo", "painting"], topics: [] },
        createdAt: ago(60),
      },
    ],
    media: new Map(),
  };
}
