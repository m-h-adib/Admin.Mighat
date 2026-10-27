import { type Metadata } from "next";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { listUsers } from "@/lib/admin/api/access";
import { getFestival } from "@/lib/admin/api/festival";
import { readParam } from "@/lib/admin/params";
import { PageHeader } from "@/components/admin/page-header";
import { QueryStateProvider } from "@/features/admin/navigation";
import { SearchBox } from "@/features/admin/list";
import { UsersPanel } from "@/features/admin/access/UsersPanel";

export const metadata: Metadata = { title: "مدیران و دسترسی‌ها" };

export default async function AccessPage({ searchParams }: PageProps<"/[locale]/admin/access">) {
  const viewer = await requirePermission("access.view");
  const params = await searchParams;
  const [users, festival] = await Promise.all([
    listUsers({ q: readParam(params, "q") }),
    getFestival(),
  ]);

  return (
    <QueryStateProvider>
      <PageHeader
        title="مدیران و دسترسی‌ها"
        description="همه کاربران پنل «مدیر» هستند؛ دسترسی هر مدیر را بخش‌به‌بخش در درخت دسترسی تعیین کنید. داوران فقط آثار سپرده‌شده به خودشان را می‌بینند."
      />
      <UsersPanel
        users={users}
        topics={festival.topics.map((topic) => ({ id: topic.id, title: topic.title.fa }))}
        viewerId={viewer.id}
        canManage={can(viewer, "access.manage")}
        openNew={params.new === "1"}
        search={<SearchBox placeholder="نام، کد ملی، تلفن یا ایمیل" className="w-full sm:w-72" />}
      />
    </QueryStateProvider>
  );
}
