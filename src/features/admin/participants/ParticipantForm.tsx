"use client";

import { ActionForm, Field, Input, SubmitButton } from "@/components/admin/form";
import { Select } from "@/components/admin/controls";
import { type Participant } from "@/lib/admin/types";
import { saveParticipant } from "@/features/admin/participants/actions";

export function ParticipantForm({
  person,
  provinces,
  canEdit,
}: {
  person: Participant;
  provinces: string[];
  canEdit: boolean;
}) {
  return (
    <ActionForm action={saveParticipant.bind(null, person.id)} className="flex flex-col gap-4">
      <fieldset disabled={!canEdit} className="grid gap-4 sm:grid-cols-2">
        <Field label="نام" name="firstName" required>
          <Input name="firstName" defaultValue={person.firstName} />
        </Field>
        <Field label="نام خانوادگی" name="lastName" required>
          <Input name="lastName" defaultValue={person.lastName} />
        </Field>
        <Field label="تلفن همراه" name="phone" required>
          <Input name="phone" dir="ltr" defaultValue={person.phone} />
        </Field>
        <Field label="شماره کاروان" name="caravanNo" required>
          <Input name="caravanNo" dir="ltr" defaultValue={person.caravanNo} />
        </Field>
        <Field label="استان" name="province" required>
          <Select
            name="province"
            defaultValue={person.province}
            options={provinces.map((name) => ({ value: name, label: name }))}
          />
        </Field>
        <Field label="کد ملی" hint="کد ملی پس از ثبت‌نام قابل تغییر نیست.">
          <Input value={person.nationalId} dir="ltr" readOnly disabled />
        </Field>
      </fieldset>
      {canEdit && <SubmitButton className="self-end">ذخیره مشخصات</SubmitButton>}
    </ActionForm>
  );
}
