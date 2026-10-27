"use server";

import { authorize } from "@/lib/admin/session";
import { denied, missing, parseForm, revalidateAdmin } from "@/lib/admin/forms";
import { normalizePermissions } from "@/lib/admin/permissions";
import { userSchema } from "@/lib/admin/schemas";
import {
  countAccessManagers,
  createUser,
  deleteUser,
  getUser,
  isNationalIdTaken,
  updateUser,
} from "@/lib/admin/api/access";
import { type ActionResult, type ID } from "@/lib/admin/types";

const lastManager: ActionResult = {
  ok: false,
  message: "دست‌کم یک مدیر با دسترسی «مدیریت مدیران» باید بماند.",
};

export async function saveUser(
  id: ID | undefined,
  _state: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const viewer = await authorize("access.manage");
  if (!viewer) return denied;
  const parsed = parseForm(userSchema, formData);
  if (!parsed.ok) return parsed.result;
  const permissions = normalizePermissions(parsed.data.permissions);
  const input = {
    ...parsed.data,
    permissions,
    scope: {
      categories: permissions.includes("art.judge") ? parsed.data.scope.categories : [],
      topics: permissions.includes("science.judge") ? parsed.data.scope.topics : [],
    },
  };
  if (permissions.length === 0) return { ok: false, message: "دست‌کم یک دسترسی انتخاب کنید." };
  if (await isNationalIdTaken(input.nationalId, id)) {
    return {
      ok: false,
      message: "مدیر دیگری با این کد ملی وجود دارد.",
      fieldErrors: { nationalId: "کد ملی تکراری است." },
    };
  }

  if (!id) {
    const created = await createUser(input);
    revalidateAdmin();
    return { ok: true, id: created, message: "مدیر تازه افزوده شد." };
  }

  const existing = await getUser(id);
  if (!existing) return missing;
  if (id === viewer.id) {
    Object.assign(input, { permissions: existing.permissions, scope: existing.scope });
  }
  if (!input.permissions.includes("access.manage") && (await countAccessManagers(id)) === 0) {
    return lastManager;
  }
  await updateUser(id, input);
  revalidateAdmin();
  return { ok: true, id, message: "مشخصات و دسترسی‌های مدیر ذخیره شد." };
}

export async function removeUser(id: ID): Promise<ActionResult> {
  const viewer = await authorize("access.manage");
  if (!viewer) return denied;
  if (id === viewer.id) return { ok: false, message: "نمی‌توانید حساب خودتان را حذف کنید." };
  if (!(await getUser(id))) return missing;
  if ((await countAccessManagers(id)) === 0) return lastManager;
  await deleteUser(id);
  revalidateAdmin();
  return { ok: true, message: "مدیر حذف شد." };
}
