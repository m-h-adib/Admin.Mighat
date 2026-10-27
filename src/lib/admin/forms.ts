import { revalidatePath } from "next/cache";
import { type z } from "zod";
import { type ActionResult } from "@/lib/admin/types";

type Tree = { [key: string]: unknown };

function formToObject(formData: FormData): Tree {
  const root: Tree = {};
  for (const [rawKey, value] of formData.entries()) {
    if (rawKey.startsWith("$ACTION")) continue;
    const isList = rawKey.endsWith("[]");
    const path = (isList ? rawKey.slice(0, -2) : rawKey).split(".");
    let node = root;
    path.slice(0, -1).forEach((part) => {
      node[part] = (node[part] as Tree | undefined) ?? {};
      node = node[part] as Tree;
    });
    const leaf = path[path.length - 1]!;
    if (isList) node[leaf] = [...((node[leaf] as unknown[] | undefined) ?? []), value];
    else node[leaf] = value;
  }
  return root;
}

function issuesToFields(issues: z.core.$ZodIssue[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    fields[key] ??= issue.message;
  }
  return fields;
}

export function parseForm<T extends z.ZodType>(
  schema: T,
  formData: FormData,
): { ok: true; data: z.output<T> } | { ok: false; result: ActionResult } {
  const parsed = schema.safeParse(formToObject(formData));
  if (parsed.success) return { ok: true, data: parsed.data };
  return {
    ok: false,
    result: {
      ok: false,
      message: "چند مورد نیاز به اصلاح دارد.",
      fieldErrors: issuesToFields(parsed.error.issues),
    },
  };
}

export const denied: ActionResult = { ok: false, message: "برای این کار دسترسی ندارید." };
export const missing: ActionResult = {
  ok: false,
  message: "مورد موردنظر پیدا نشد؛ شاید حذف شده باشد.",
};

export function revalidateAdmin() {
  revalidatePath("/[locale]/admin", "layout");
}
