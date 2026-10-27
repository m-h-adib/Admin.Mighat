export const actionLabels = {
  view: "مشاهده",
  review: "بررسی و تعیین وضعیت",
  assign: "سپردن به داور",
  judge: "داوری",
  export: "خروجی اکسل",
  delete: "حذف",
  create: "نوشتن",
  edit: "ویرایش",
  publish: "انتشار",
  moderate: "تأیید و رد",
  manage: "مدیریت",
} as const;

export type Action = keyof typeof actionLabels;

export const permissionGroups = [
  {
    id: "overview",
    title: "پیشخوان",
    resources: [{ id: "dashboard", label: "پیشخوان و آمار", actions: ["view"] }],
  },
  {
    id: "festival",
    title: "جشنواره",
    resources: [
      {
        id: "art",
        label: "آثار هنری",
        actions: ["view", "review", "assign", "judge", "export", "delete"],
      },
      {
        id: "science",
        label: "مقالات علمی",
        actions: ["view", "review", "assign", "judge", "export", "delete"],
      },
      { id: "participants", label: "شرکت‌کنندگان", actions: ["view", "edit"] },
      { id: "winners", label: "برگزیدگان", actions: ["view", "edit"] },
    ],
  },
  {
    id: "content",
    title: "محتوای سایت",
    resources: [
      {
        id: "news",
        label: "اخبار و اطلاعیه‌ها",
        actions: ["view", "create", "edit", "publish", "delete"],
      },
    ],
  },
  {
    id: "audience",
    title: "مخاطبان",
    resources: [
      { id: "comments", label: "نظرات بازدیدکنندگان", actions: ["view", "moderate", "delete"] },
      { id: "inbox", label: "پیام‌های تماس", actions: ["view", "manage"] },
    ],
  },
  {
    id: "config",
    title: "پیکربندی",
    resources: [
      { id: "timers", label: "زمان‌بندی‌ها", actions: ["view", "edit"] },
      { id: "festival", label: "دوره‌ها و بخش‌ها", actions: ["view", "edit"] },
      { id: "site", label: "تنظیمات سایت", actions: ["view", "edit"] },
    ],
  },
  {
    id: "admin",
    title: "مدیریت",
    resources: [{ id: "access", label: "مدیران و دسترسی‌ها", actions: ["view", "manage"] }],
  },
] as const satisfies readonly {
  id: string;
  title: string;
  resources: readonly { id: string; label: string; actions: readonly Action[] }[];
}[];

export type PermissionGroup = (typeof permissionGroups)[number];
export type PermissionResource = PermissionGroup["resources"][number];
export type Resource = PermissionResource["id"];
export type Permission = {
  [R in PermissionResource as R["id"]]: `${R["id"]}.${R["actions"][number]}`;
}[Resource];

export const permissionResources: readonly PermissionResource[] = permissionGroups.flatMap(
  (group): readonly PermissionResource[] => group.resources,
);

export const allPermissions: Permission[] = permissionGroups.flatMap((group) =>
  group.resources.flatMap((resource) =>
    resource.actions.map((action) => `${resource.id}.${action}` as Permission),
  ),
);

const known = new Set<string>(allPermissions);

function isPermission(value: string): value is Permission {
  return known.has(value);
}

export const isJudgePermission = (permission: Permission) => permission.endsWith(".judge");

export const managerPermissions = allPermissions.filter(
  (permission) => !isJudgePermission(permission),
);

export function normalizePermissions(values: readonly string[]): Permission[] {
  const picked = new Set(values.filter(isPermission));
  for (const permission of picked) {
    picked.add(`${permission.split(".")[0]}.view` as Permission);
  }
  return allPermissions.filter((permission) => picked.has(permission));
}

export function can(holder: { permissions: readonly Permission[] }, permission: Permission) {
  return holder.permissions.includes(permission);
}

export function isFullAdmin(permissions: readonly Permission[]) {
  return managerPermissions.every((permission) => permissions.includes(permission));
}

export function managerTitle(permissions: readonly Permission[]) {
  return isFullAdmin(permissions) ? "مدیر کل" : "مدیر";
}
