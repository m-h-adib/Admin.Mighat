"use client";

import { useState, type ReactNode } from "react";
import { Megaphone } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  ActionForm,
  Field,
  FormSection,
  Input,
  SubmitButton,
  type FormAction,
} from "@/components/admin/form";
import { Segmented, Switch } from "@/components/admin/controls";
import { DatePicker } from "@/components/admin/date-picker";
import { LanguageProvider, LanguageSwitch, LocalizedInput } from "@/components/admin/localized";
import { Card } from "@/components/admin/primitives";
import { channelLabels, homeSectionLabels } from "@/lib/admin/labels";
import { channelKeys, homeSections, type SiteSettings } from "@/lib/admin/types";
import {
  saveBanner,
  saveChannels,
  saveContact,
  saveHome,
  saveIdentity,
} from "@/features/admin/site/actions";

function SettingsCard({
  action,
  title,
  description,
  canEdit,
  children,
  bilingual = true,
}: {
  action: FormAction;
  title: string;
  description?: string;
  canEdit: boolean;
  children: ReactNode;
  bilingual?: boolean;
}) {
  return (
    <Card className="mb-4">
      <LanguageProvider>
        <ActionForm action={action}>
          <fieldset disabled={!canEdit} className="contents">
            <div className="px-5 pt-5 sm:px-6">
              <FormSection title={title} description={description}>
                {bilingual && <LanguageSwitch className="justify-self-start" />}
                {children}
              </FormSection>
            </div>
          </fieldset>
          {canEdit && (
            <div className="flex justify-end border-t border-line bg-canvas/50 px-5 py-3 sm:px-6">
              <SubmitButton>ذخیره</SubmitButton>
            </div>
          )}
        </ActionForm>
      </LanguageProvider>
    </Card>
  );
}

export function GeneralSettings({ site, canEdit }: { site: SiteSettings; canEdit: boolean }) {
  return (
    <>
      <SettingsCard
        action={saveIdentity}
        canEdit={canEdit}
        title="هویت سایت"
        description="نام و شعار در سربرگ، پانویس و عنوان صفحه‌ها نمایش داده می‌شود."
      >
        <LocalizedInput
          name="name"
          label="نام سایت"
          required
          defaultValue={site.identity.name}
          maxLength={120}
        />
        <LocalizedInput
          name="tagline"
          label="شعار کوتاه"
          defaultValue={site.identity.tagline}
          maxLength={200}
        />
      </SettingsCard>

      <SettingsCard
        action={saveContact}
        canEdit={canEdit}
        title="اطلاعات تماس"
        description="در صفحه تماس، پرسش‌های متداول و پانویس سایت."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="تلفن دبیرخانه" name="phone">
            <Input name="phone" dir="ltr" defaultValue={site.contact.phone} />
          </Field>
          <Field label="ایمیل" name="email">
            <Input name="email" type="email" dir="ltr" defaultValue={site.contact.email} />
          </Field>
        </div>
        <LocalizedInput
          name="address"
          label="نشانی"
          multiline
          rows={2}
          defaultValue={site.contact.address}
        />
        <LocalizedInput name="hours" label="ساعت پاسخ‌گویی" defaultValue={site.contact.hours} />
      </SettingsCard>

      <SettingsCard
        action={saveChannels}
        canEdit={canEdit}
        bilingual={false}
        title="شبکه‌های اجتماعی"
        description="فقط شبکه‌هایی که نشانی دارند در سایت نمایش داده می‌شوند."
      >
        <div className="grid gap-4">
          {channelKeys.map((key) => (
            <div key={key} className="grid gap-3 sm:grid-cols-[7rem_1fr_12rem] sm:items-start">
              <p className="pt-2 text-sm font-medium text-ink">{channelLabels[key]}</p>
              <Field label="نشانی" name={`channels.${key}.url`}>
                <Input
                  name={`channels.${key}.url`}
                  dir="ltr"
                  placeholder="https://"
                  defaultValue={site.channels[key].url}
                />
              </Field>
              <Field label="شناسه" name={`channels.${key}.handle`}>
                <Input
                  name={`channels.${key}.handle`}
                  dir="ltr"
                  placeholder="@miqat"
                  defaultValue={site.channels[key].handle}
                />
              </Field>
            </div>
          ))}
        </div>
      </SettingsCard>
    </>
  );
}

export function HomeSettings({ site, canEdit }: { site: SiteSettings; canEdit: boolean }) {
  const [mode, setMode] = useState(site.home.stats.mode);
  return (
    <SettingsCard
      action={saveHome}
      canEdit={canEdit}
      bilingual={false}
      title="صفحه اول"
      description="بخش‌های صفحه اول را روشن یا خاموش کنید. ترتیب بخش‌ها ثابت است تا هماهنگی طراحی حفظ شود."
    >
      <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {homeSections.map((section) => (
          <li key={section}>
            {section === "hero" ? (
              <Switch
                checked
                disabled
                label={homeSectionLabels[section].label}
                description={`${homeSectionLabels[section].hint} · همیشه روشن`}
              />
            ) : (
              <Switch
                name={`sections.${section}`}
                defaultChecked={site.home.sections[section]}
                label={homeSectionLabels[section].label}
                description={homeSectionLabels[section].hint}
              />
            )}
          </li>
        ))}
      </ul>

      <div className="grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
        <Field label="تعداد خبر در اسلایدر" name="newsCount" hint="بین ۳ تا ۱۲">
          <Input
            name="newsCount"
            inputMode="numeric"
            dir="ltr"
            defaultValue={site.home.newsCount}
          />
        </Field>
        <Field label="تعداد آثار منتخب" name="worksCount" hint="بین ۴ تا ۱۶">
          <Input
            name="worksCount"
            inputMode="numeric"
            dir="ltr"
            defaultValue={site.home.worksCount}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-4 border-t border-line pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">اعداد بخش آمار</p>
            <p className="text-caption text-ink-muted">
              خودکار: از داده‌های جشنواره حساب می‌شود. دستی: همین اعداد نمایش داده می‌شود.
            </p>
          </div>
          <input type="hidden" name="stats.mode" value={mode} />
          <Segmented
            label="روش محاسبه آمار"
            value={mode}
            onValueChange={setMode}
            options={[
              { value: "auto", label: "خودکار" },
              { value: "manual", label: "دستی" },
            ]}
          />
        </div>
        <div className={cn("grid gap-5 sm:grid-cols-3", mode === "auto" && "opacity-50")}>
          <Field label="تعداد آثار" name="stats.works">
            <Input
              name="stats.works"
              inputMode="numeric"
              dir="ltr"
              defaultValue={site.home.stats.works}
              readOnly={mode === "auto"}
            />
          </Field>
          <Field label="تعداد بخش‌ها" name="stats.categories">
            <Input
              name="stats.categories"
              inputMode="numeric"
              dir="ltr"
              defaultValue={site.home.stats.categories}
              readOnly={mode === "auto"}
            />
          </Field>
          <Field label="تعداد دوره‌ها" name="stats.editions">
            <Input
              name="stats.editions"
              inputMode="numeric"
              dir="ltr"
              defaultValue={site.home.stats.editions}
              readOnly={mode === "auto"}
            />
          </Field>
        </div>
      </div>
    </SettingsCard>
  );
}

export function BannerSettings({ site, canEdit }: { site: SiteSettings; canEdit: boolean }) {
  const [text, setText] = useState(site.banner.text.fa);
  const [label, setLabel] = useState(site.banner.linkLabel.fa);
  const [enabled, setEnabled] = useState(site.banner.enabled);
  return (
    <SettingsCard
      action={saveBanner}
      canEdit={canEdit}
      title="نوار اطلاع‌رسانی"
      description="نوار باریکی بالای همه صفحه‌های سایت؛ برای تمدید مهلت، اعلام نتایج یا خبرهای فوری."
    >
      <div>
        <p className="mb-2 text-caption font-medium text-ink">پیش‌نمایش</p>
        <div
          className={cn(
            "flex items-center justify-center gap-2 rounded-btn-sm bg-gold px-4 py-2.5 text-caption text-green-950 transition-opacity",
            !enabled && "opacity-40",
          )}
        >
          <Megaphone className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{text || "متن نوار"}</span>
          {label && (
            <span className="shrink-0 font-bold underline underline-offset-4">{label}</span>
          )}
        </div>
      </div>
      <Switch
        name="enabled"
        checked={enabled}
        onCheckedChange={setEnabled}
        label="نوار نمایش داده شود"
      />
      <div
        onInput={(event) => {
          const target = event.target as HTMLInputElement;
          if (target.name === "text.fa") setText(target.value);
          if (target.name === "linkLabel.fa") setLabel(target.value);
        }}
        className="grid gap-5"
      >
        <LocalizedInput
          name="text"
          label="متن"
          required
          maxLength={200}
          defaultValue={site.banner.text}
        />
        <div className="grid gap-5 sm:grid-cols-[1fr_14rem]">
          <Field label="پیوند" name="link" hint="نشانی کامل یا مسیر داخلی مثل /news/…">
            <Input name="link" dir="ltr" defaultValue={site.banner.link} />
          </Field>
          <LocalizedInput name="linkLabel" label="متن پیوند" defaultValue={site.banner.linkLabel} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="شروع نمایش (اختیاری)" name="startsAt">
          <DatePicker name="startsAt" withTime clearable defaultValue={site.banner.startsAt} />
        </Field>
        <Field label="پایان نمایش (اختیاری)" name="endsAt">
          <DatePicker name="endsAt" withTime clearable defaultValue={site.banner.endsAt} />
        </Field>
      </div>
    </SettingsCard>
  );
}
