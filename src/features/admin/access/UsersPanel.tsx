"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Ellipsis, Pencil, ShieldCheck, Trash2, UserPlus, UsersRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { ActionForm, DialogActions, Field, Input } from "@/components/admin/form";
import {
  Confirm,
  Dialog,
  DialogContent,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/admin/overlay";
import { Avatar, Badge, Card, EmptyState } from "@/components/admin/primitives";
import { Table, Td, Th, Tr } from "@/components/admin/table";
import { adminButton } from "@/components/admin/button";
import { useActionRunner } from "@/components/admin/use-action";
import { formatDigits, formatNumber } from "@/lib/admin/format";
import { isFullAdmin, permissionResources, type Permission } from "@/lib/admin/permissions";
import { type StaffUser } from "@/lib/admin/types";
import { PendingFrame } from "@/features/admin/navigation";
import { Toolbar } from "@/features/admin/list";
import {
  PermissionTree,
  type AccessValue,
  type Topic,
} from "@/features/admin/access/PermissionTree";
import { removeUser, saveUser } from "@/features/admin/access/actions";

interface UsersPanelProps {
  users: StaffUser[];
  topics: Topic[];
  viewerId: string;
  canManage: boolean;
  openNew: boolean;
  search: ReactNode;
}

function AccessSummary({ user }: { user: StaffUser }) {
  if (isFullAdmin(user.permissions)) {
    return (
      <Badge tone="green">
        <ShieldCheck className="size-3" aria-hidden />
        مدیر کل
      </Badge>
    );
  }
  const labels = permissionResources
    .filter((resource) => user.permissions.includes(`${resource.id}.view` as Permission))
    .map((resource) => resource.label);
  if (labels.length === 0) return <span className="text-caption text-ink-muted">بدون دسترسی</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {labels.slice(0, 3).map((label) => (
        <Badge key={label} tone="teal">
          {label}
        </Badge>
      ))}
      {labels.length > 3 && <Badge>{`${formatNumber(labels.length - 3)}+`}</Badge>}
    </span>
  );
}

export function UsersPanel({
  users,
  topics,
  viewerId,
  canManage,
  openNew,
  search,
}: UsersPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [editing, setEditing] = useState<StaffUser | "new" | null>(
    openNew && canManage ? "new" : null,
  );
  const [deleting, setDeleting] = useState<StaffUser | null>(null);
  const { run, pending } = useActionRunner();

  function close() {
    setEditing(null);
    if (openNew) router.replace(pathname, { scroll: false });
  }

  return (
    <Card className="overflow-hidden">
      <Toolbar className="border-b border-line">
        {search}
        {canManage && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className={cn(adminButton({ variant: "primary", size: "sm" }), "ms-auto")}
          >
            <UserPlus aria-hidden />
            افزودن مدیر
          </button>
        )}
      </Toolbar>

      {users.length === 0 ? (
        <EmptyState icon={UsersRound} title="مدیری پیدا نشد" />
      ) : (
        <PendingFrame>
          <Table>
            <thead>
              <tr>
                <Th>مدیر</Th>
                <Th>دسترسی‌ها</Th>
                <Th className="hidden lg:table-cell">تماس</Th>
                <Th className="w-12">
                  <span className="sr-only">عملیات</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td>
                    <span className="flex items-center gap-3">
                      <Avatar name={user.name} id={user.id} />
                      <span>
                        <span className="block font-medium whitespace-nowrap">
                          {user.name}
                          {user.id === viewerId && (
                            <span className="ms-1.5 text-2xs text-ink-muted">(شما)</span>
                          )}
                        </span>
                        <span className="text-2xs text-ink-muted tabular-nums">
                          کد ملی {formatDigits(user.nationalId)}
                        </span>
                      </span>
                    </span>
                  </Td>
                  <Td className="max-w-md">
                    <AccessSummary user={user} />
                  </Td>
                  <Td className="hidden whitespace-nowrap lg:table-cell">
                    <span className="block tabular-nums">{formatDigits(user.phone)}</span>
                    {user.email && (
                      <span className="text-2xs text-ink-muted" dir="ltr">
                        {user.email}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {canManage && (
                      <Menu>
                        <MenuTrigger
                          aria-label={`عملیات ${user.name}`}
                          disabled={pending}
                          className={adminButton({ variant: "ghost", size: "icon-sm" })}
                        >
                          <Ellipsis aria-hidden />
                        </MenuTrigger>
                        <MenuContent>
                          <MenuItem onSelect={() => setEditing(user)}>
                            <Pencil aria-hidden />
                            ویرایش و دسترسی‌ها
                          </MenuItem>
                          {user.id !== viewerId && (
                            <>
                              <MenuSeparator />
                              <MenuItem tone="danger" onSelect={() => setDeleting(user)}>
                                <Trash2 aria-hidden />
                                حذف مدیر
                              </MenuItem>
                            </>
                          )}
                        </MenuContent>
                      </Menu>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </PendingFrame>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent title={editing === "new" ? "افزودن مدیر" : "ویرایش مدیر"} size="lg">
          {editing !== null && (
            <UserForm
              user={editing === "new" ? undefined : editing}
              topics={topics}
              self={editing !== "new" && editing.id === viewerId}
              onDone={close}
            />
          )}
        </DialogContent>
      </Dialog>

      <Confirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف این مدیر؟"
        description={deleting ? `${deleting.name} دیگر نمی‌تواند وارد پنل شود.` : undefined}
        confirmLabel="حذف مدیر"
        onConfirm={() => deleting && run(() => removeUser(deleting.id))}
      />
    </Card>
  );
}

function UserForm({
  user,
  topics,
  self,
  onDone,
}: {
  user?: StaffUser;
  topics: Topic[];
  self: boolean;
  onDone: () => void;
}) {
  const [access, setAccess] = useState<AccessValue>(() => ({
    permissions: user?.permissions ?? ["dashboard.view"],
    scope: user?.scope ?? { categories: [], topics: [] },
  }));

  return (
    <ActionForm
      action={saveUser.bind(null, user?.id)}
      onSuccess={onDone}
      className="flex flex-col gap-5"
    >
      {access.permissions.map((permission) => (
        <input key={permission} type="hidden" name="permissions[]" value={permission} />
      ))}
      {access.scope.categories.map((id) => (
        <input key={id} type="hidden" name="scope.categories[]" value={id} />
      ))}
      {access.scope.topics.map((id) => (
        <input key={id} type="hidden" name="scope.topics[]" value={id} />
      ))}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="نام و نام خانوادگی" name="name" required>
          <Input name="name" defaultValue={user?.name} />
        </Field>
        <Field label="کد ملی" name="nationalId" required hint="مدیر با همین کد وارد پنل می‌شود.">
          <Input
            name="nationalId"
            dir="ltr"
            inputMode="numeric"
            maxLength={10}
            defaultValue={user?.nationalId}
            autoComplete="off"
          />
        </Field>
        <Field label="تلفن همراه" name="phone" required>
          <Input
            name="phone"
            dir="ltr"
            inputMode="tel"
            defaultValue={user?.phone}
            placeholder="09121234567"
          />
        </Field>
        <Field label="ایمیل (اختیاری)" name="email">
          <Input name="email" type="email" dir="ltr" defaultValue={user?.email} />
        </Field>
      </div>

      <Field
        label="دسترسی‌ها"
        hint={
          self
            ? "دسترسی‌های حساب خودتان را نمی‌توانید تغییر دهید."
            : "هر بخش را باز کنید تا کارهای جزئی‌تر آن را ببینید؛ «داوری» را با انتخاب بخش‌ها یا محورهای مشخص محدود کنید."
        }
      >
        <PermissionTree value={access} onChange={setAccess} topics={topics} disabled={self} />
      </Field>
      <DialogActions>{user ? "ذخیره" : "افزودن مدیر"}</DialogActions>
    </ActionForm>
  );
}
