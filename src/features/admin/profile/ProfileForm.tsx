"use client";

import { ActionForm, Field, Input, SubmitButton } from "@/components/admin/form";
import { Card, CardHeader } from "@/components/admin/primitives";
import { type StaffUser } from "@/lib/admin/types";
import { saveProfile } from "@/features/admin/profile/actions";

export function ProfileForm({ user }: { user: StaffUser }) {
  return (
    <Card className="max-w-2xl">
      <CardHeader title="مشخصات" description="نام شما کنار امتیازهای داوری دیده می‌شود." />
      <ActionForm action={saveProfile} className="flex flex-col gap-4 px-5 pt-4 pb-5">
        <Field label="نام و نام خانوادگی" name="name" required>
          <Input name="name" defaultValue={user.name} />
        </Field>
        <Field label="تلفن همراه" name="phone" required>
          <Input name="phone" dir="ltr" defaultValue={user.phone} />
        </Field>
        <Field label="ایمیل" name="email">
          <Input name="email" type="email" dir="ltr" defaultValue={user.email} />
        </Field>
        <Field
          label="کد ملی"
          hint="با این کد وارد پنل می‌شوید و فقط مدیر کل می‌تواند آن را تغییر دهد."
        >
          <Input value={user.nationalId} dir="ltr" readOnly disabled />
        </Field>
        <SubmitButton className="self-end">ذخیره</SubmitButton>
      </ActionForm>
    </Card>
  );
}
