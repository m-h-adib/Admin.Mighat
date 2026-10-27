"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { adminButton } from "@/components/admin/button";
import { useField } from "@/components/admin/form";
import { useToast } from "@/components/admin/toast";
import { formatDigits } from "@/lib/admin/format";
import { MEDIA_MAX_MB, MEDIA_TYPES } from "@/lib/admin/types";

interface ImageFieldProps {
  name: string;
  defaultValue?: string;
  aspect?: "video" | "square";
  emptyLabel?: string;
}

export function ImageField({
  name,
  defaultValue,
  aspect = "video",
  emptyLabel = "تصویر را اینجا رها کنید",
}: ImageFieldProps) {
  const field = useField();
  const notify = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!MEDIA_TYPES.includes(file.type)) {
      notify({
        tone: "error",
        title: "قالب تصویر پشتیبانی نمی‌شود",
        description: "JPG، PNG، WebP یا AVIF بفرستید.",
      });
      return;
    }
    if (file.size > MEDIA_MAX_MB * 1024 * 1024) {
      notify({
        tone: "error",
        title: `حجم تصویر بیش از ${formatDigits(MEDIA_MAX_MB)} مگابایت است`,
      });
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body });
      if (!response.ok) throw new Error(await response.text());
      const asset = (await response.json()) as { url: string };
      setUrl(asset.url);
    } catch {
      notify({
        tone: "error",
        title: "بارگذاری تصویر انجام نشد",
        description: "دوباره تلاش کنید.",
      });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    void upload(event.dataTransfer.files[0]);
  }

  const ratio = aspect === "square" ? "aspect-square" : "aspect-video";

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <input
        ref={input}
        type="file"
        accept={MEDIA_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => void upload(event.target.files?.[0])}
      />
      {url ? (
        <div
          className={cn(
            "group relative overflow-hidden rounded-btn-sm border border-line bg-canvas",
            ratio,
          )}
        >
          <Image src={url} alt="" fill unoptimized className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-linear-to-t from-green-950/70 to-transparent p-2.5 pt-8">
            <button
              type="button"
              onClick={() => input.current?.click()}
              className={adminButton({ variant: "outline", size: "xs" })}
            >
              <RefreshCw aria-hidden />
              تغییر
            </button>
            <button
              type="button"
              onClick={() => setUrl("")}
              className={cn(adminButton({ variant: "outline", size: "xs" }), "text-danger")}
            >
              <Trash2 aria-hidden />
              حذف
            </button>
          </div>
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <LoaderCircle className="size-6 animate-spin text-teal" aria-hidden />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          id={field?.id}
          aria-describedby={field?.describedBy}
          onClick={() => input.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          disabled={busy}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-btn-sm border border-dashed text-center transition-colors",
            ratio,
            dragging
              ? "border-teal bg-firuze/8"
              : "border-line-strong bg-canvas/60 hover:border-teal/60 hover:bg-firuze/4",
          )}
        >
          {busy ? (
            <LoaderCircle className="size-6 animate-spin text-teal" aria-hidden />
          ) : (
            <ImagePlus className="size-6 text-sage" aria-hidden />
          )}
          <span className="text-caption font-medium text-ink">
            {busy ? "در حال بارگذاری…" : emptyLabel}
          </span>
          <span className="text-2xs text-ink-muted">
            یا برای انتخاب کلیک کنید · حداکثر {formatDigits(MEDIA_MAX_MB)} مگابایت
          </span>
        </button>
      )}
    </div>
  );
}
