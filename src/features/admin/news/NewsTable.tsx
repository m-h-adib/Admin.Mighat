"use client";

import { useState } from "react";
import Image from "next/image";
import { Ellipsis, ExternalLink, EyeOff, Newspaper, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { type Tone } from "@/types/domain";
import { Badge, EmptyState } from "@/components/admin/primitives";
import {
  Confirm,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/admin/overlay";
import { Table, Td, Th, Tr, rowLinkClass } from "@/components/admin/table";
import { adminButton } from "@/components/admin/button";
import { useActionRunner } from "@/components/admin/use-action";
import { formatDate } from "@/lib/admin/format";
import { type AdminNews } from "@/lib/admin/types";
import { AdminLink, PendingFrame } from "@/features/admin/navigation";
import { removeNews, setNewsPublishedAction } from "@/features/admin/news/actions";

const toneFill: Record<Tone, string> = {
  pine: "bg-tone-pine",
  umber: "bg-tone-umber",
  indigo: "bg-tone-indigo",
  plum: "bg-tone-plum",
  jade: "bg-tone-jade",
  rust: "bg-tone-rust",
  ocean: "bg-tone-ocean",
  olive: "bg-tone-olive",
};

function NewsThumb({ cover, tone, className }: { cover?: string; tone: Tone; className?: string }) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-md",
        toneFill[tone],
        className,
      )}
    >
      {cover ? (
        <Image src={cover} alt="" fill unoptimized className="object-cover" />
      ) : (
        <span aria-hidden className="absolute inset-0 girih opacity-25" />
      )}
    </span>
  );
}

export function NewsTable({
  rows,
  siteUrl,
  can,
}: {
  rows: AdminNews[];
  siteUrl: string;
  can: { publish: boolean; delete: boolean };
}) {
  const { run, pending } = useActionRunner();
  const [deleting, setDeleting] = useState<AdminNews | null>(null);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Newspaper}
        title="خبری پیدا نشد"
        description="عبارت جست‌وجو را تغییر دهید یا خبر تازه‌ای بنویسید."
      />
    );
  }

  return (
    <PendingFrame>
      <Confirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف این خبر؟"
        description={deleting ? `«${deleting.title.fa}» برای همیشه حذف می‌شود.` : undefined}
        confirmLabel="حذف"
        onConfirm={() => deleting && run(() => removeNews(deleting.id))}
      />
      <Table>
        <thead>
          <tr>
            <Th className="w-20">تصویر</Th>
            <Th>عنوان</Th>
            <Th>وضعیت</Th>
            <Th className="w-12">
              <span className="sr-only">عملیات</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Tr key={row.id}>
              <Td>
                <NewsThumb cover={row.cover} tone={row.tone} className="h-11 w-16" />
              </Td>
              <Td className="max-w-md min-w-60">
                <AdminLink href={`/admin/news/${row.id}`} className={rowLinkClass}>
                  <span className="line-clamp-1">{row.title.fa}</span>
                </AdminLink>
                <span className="mt-0.5 block text-2xs text-ink-muted">
                  {formatDate(row.published ? row.publishAt : row.updatedAt)}
                </span>
              </Td>
              <Td>
                <Badge tone={row.published ? "success" : "neutral"} dot>
                  {row.published ? "منتشرشده" : "پیش‌نویس"}
                </Badge>
              </Td>
              <Td className="relative z-1">
                {(row.published || can.publish || can.delete) && (
                  <Menu>
                    <MenuTrigger
                      aria-label={`عملیات ${row.title.fa}`}
                      disabled={pending}
                      className={adminButton({ variant: "ghost", size: "icon-sm" })}
                    >
                      <Ellipsis aria-hidden />
                    </MenuTrigger>
                    <MenuContent>
                      {row.published && (
                        <MenuItem asChild>
                          <a href={`${siteUrl}/news/${row.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink aria-hidden />
                            مشاهده در سایت
                          </a>
                        </MenuItem>
                      )}
                      {can.publish && (
                        <MenuItem
                          onSelect={() => run(() => setNewsPublishedAction(row.id, !row.published))}
                        >
                          {row.published ? <EyeOff aria-hidden /> : <Send aria-hidden />}
                          {row.published ? "برگرداندن به پیش‌نویس" : "انتشار"}
                        </MenuItem>
                      )}
                      {can.delete && (
                        <>
                          <MenuSeparator />
                          <MenuItem tone="danger" onSelect={() => setDeleting(row)}>
                            <Trash2 aria-hidden />
                            حذف
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
  );
}
