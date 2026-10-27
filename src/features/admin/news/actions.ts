"use server";

import { authorize } from "@/lib/admin/session";
import { can } from "@/lib/admin/permissions";
import { denied, missing, parseForm, revalidateAdmin } from "@/lib/admin/forms";
import { newsSchema } from "@/lib/admin/schemas";
import {
  createNews,
  deleteNews,
  getNews,
  setNewsPublished,
  updateNews,
} from "@/lib/admin/api/news";
import { type ActionResult, type ID } from "@/lib/admin/types";

export async function saveNews(
  id: ID | undefined,
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const viewer = await authorize(id ? "news.edit" : "news.create");
  if (!viewer) return denied;
  const parsed = parseForm(newsSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { intent, ...data } = parsed.data;
  const existing = id ? await getNews(id) : undefined;
  if (id && !existing) return missing;
  const published = intent === "publish";
  if (published && !existing?.published && !can(viewer, "news.publish")) {
    return {
      ok: false,
      message: "انتشار خبر نیاز به دسترسی «انتشار» دارد؛ آن را پیش‌نویس ذخیره کنید.",
    };
  }
  const input = { ...data, published };
  if (existing && id) {
    await updateNews(id, input);
    revalidateAdmin();
    return { ok: true, id, message: published ? "تغییرات منتشر شد." : "پیش‌نویس ذخیره شد." };
  }
  const created = await createNews(input);
  revalidateAdmin();
  return { ok: true, id: created, message: published ? "خبر منتشر شد." : "پیش‌نویس ذخیره شد." };
}

export async function setNewsPublishedAction(id: ID, published: boolean): Promise<ActionResult> {
  if (!(await authorize("news.publish"))) return denied;
  await setNewsPublished(id, published);
  revalidateAdmin();
  return { ok: true, message: published ? "خبر منتشر شد." : "خبر به پیش‌نویس برگشت." };
}

export async function removeNews(id: ID): Promise<ActionResult> {
  if (!(await authorize("news.delete"))) return denied;
  await deleteNews(id);
  revalidateAdmin();
  return { ok: true, message: "خبر حذف شد." };
}
