"use client";

import { ExternalLink, Send, Trash2 } from "lucide-react";
import { ActionForm, Field, SubmitButton, useFormState } from "@/components/admin/form";
import { ImageField } from "@/components/admin/image-field";
import { LanguageProvider, LanguageSwitch, LocalizedInput } from "@/components/admin/localized";
import { Confirm } from "@/components/admin/overlay";
import { Badge, Card } from "@/components/admin/primitives";
import { adminButton } from "@/components/admin/button";
import { useActionRunner } from "@/components/admin/use-action";
import { type AdminNews } from "@/lib/admin/types";
import { removeNews, saveNews } from "@/features/admin/news/actions";
import { useAdminRouter } from "@/features/admin/navigation";

interface NewsEditorProps {
  news?: AdminNews;
  siteUrl: string;
  canPublish: boolean;
  canDelete: boolean;
}

export function NewsEditor({ news, siteUrl, canPublish, canDelete }: NewsEditorProps) {
  const router = useAdminRouter();
  const { run } = useActionRunner();

  return (
    <LanguageProvider>
      <ActionForm
        action={saveNews.bind(null, news?.id)}
        onSuccess={(result) => {
          if (!news && result.id) router.replace(`/admin/news/${result.id}`);
        }}
        className="max-w-3xl"
      >
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            {news ? (
              <Badge tone={news.published ? "success" : "neutral"} dot>
                {news.published ? "منتشرشده" : "پیش‌نویس"}
              </Badge>
            ) : (
              <span />
            )}
            <LanguageSwitch />
          </div>
          <div className="flex flex-col gap-5 px-5 py-5">
            <LocalizedInput
              name="title"
              label="عنوان"
              required
              maxLength={200}
              defaultValue={news?.title}
            />
            <Field label="تصویر (اختیاری)" name="cover">
              <ImageField name="cover" defaultValue={news?.cover} />
            </Field>
            <LocalizedInput
              name="body"
              label="متن"
              multiline
              rows={12}
              defaultValue={news?.body}
              hint="بندها را با یک خط خالی از هم جدا کنید."
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4">
            {news && canDelete && (
              <Confirm
                title="حذف این خبر؟"
                description={`«${news.title.fa}» برای همیشه حذف می‌شود.`}
                confirmLabel="حذف"
                onConfirm={() =>
                  run(
                    () => removeNews(news.id),
                    () => router.replace("/admin/news"),
                  )
                }
                trigger={
                  <button
                    type="button"
                    className={adminButton({ variant: "danger-ghost", size: "sm" })}
                  >
                    <Trash2 aria-hidden />
                    حذف
                  </button>
                }
              />
            )}
            {news?.published && (
              <a
                href={`${siteUrl}/news/${news.slug}`}
                target="_blank"
                rel="noreferrer"
                className={adminButton({ variant: "ghost", size: "sm" })}
              >
                <ExternalLink aria-hidden />
                مشاهده در سایت
              </a>
            )}
            <PublishButtons published={Boolean(news?.published)} canPublish={canPublish} />
          </div>
        </Card>
      </ActionForm>
    </LanguageProvider>
  );
}

function PublishButtons({ published, canPublish }: { published: boolean; canPublish: boolean }) {
  const { pending } = useFormState();
  return (
    <div className="ms-auto flex flex-wrap gap-2">
      <button
        type="submit"
        name="intent"
        value="draft"
        disabled={pending}
        className={adminButton({ variant: "outline" })}
      >
        {published ? "برگرداندن به پیش‌نویس" : "ذخیره پیش‌نویس"}
      </button>
      {canPublish && (
        <SubmitButton name="intent" value="publish">
          <Send aria-hidden />
          {published ? "ذخیره تغییرات" : "انتشار"}
        </SubmitButton>
      )}
    </div>
  );
}
