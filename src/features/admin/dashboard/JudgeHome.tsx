import { ArrowLeft, BookOpenText, Gavel, Palette } from "lucide-react";
import { cn } from "@/lib/cn";
import { can } from "@/lib/admin/permissions";
import { kindLabels } from "@/lib/admin/labels";
import { formatNumber } from "@/lib/admin/format";
import { type SubmissionKind, type Viewer } from "@/lib/admin/types";
import { adminButton } from "@/components/admin/button";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/primitives";
import { GirihPattern } from "@/components/ornaments/GirihPattern";
import { AdminLink } from "@/features/admin/navigation";

export function JudgeHome({
  viewer,
  queue,
}: {
  viewer: Viewer;
  queue: Record<SubmissionKind, number>;
}) {
  const kinds = (["art", "science"] as const).filter(
    (kind) => can(viewer, `${kind}.judge`) || can(viewer, `${kind}.view`),
  );
  return (
    <>
      <PageHeader
        title={`سلام، ${viewer.name}`}
        description="آثاری که برای داوری به شما سپرده شده، اینجا منتظرند."
      />
      {kinds.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="بخشی برای شما فعال نیست"
          description="اگر فکر می‌کنید باید دسترسی داشته باشید، با مدیر سامانه تماس بگیرید."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {kinds.map((kind) => {
            const Icon = kind === "art" ? Palette : BookOpenText;
            return (
              <section
                key={kind}
                className="relative overflow-hidden rounded-box bg-green-950 p-6 text-parchment shadow-lift"
              >
                <GirihPattern opacity={0.06} />
                <div className="relative">
                  <p className="flex items-center gap-2 text-sm text-mist-light">
                    <Icon className="size-4.5 text-gold-light" aria-hidden />
                    {kindLabels[kind].many}
                  </p>
                  <p className="mt-3 text-4xl font-bold">{formatNumber(queue[kind])}</p>
                  <p className="text-sm text-mist">{kindLabels[kind].one} در انتظار امتیاز شما</p>
                  <AdminLink
                    href={`/admin/${kind}?assigned=me&unscored=1`}
                    className={cn(adminButton({ variant: "gold" }), "mt-6")}
                  >
                    شروع داوری
                    <ArrowLeft className="ltr:rotate-180" aria-hidden />
                  </AdminLink>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
