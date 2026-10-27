import { type Metadata } from "next";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { listMessages } from "@/lib/admin/api/audience";
import { messageStateLabels } from "@/lib/admin/labels";
import { renderTime } from "@/lib/admin/format";
import { type MessageState } from "@/lib/admin/types";
import { readOption, readParam } from "@/lib/admin/params";
import { Card } from "@/components/admin/primitives";
import { PageHeader } from "@/components/admin/page-header";
import { QueryStateProvider } from "@/features/admin/navigation";
import { SearchBox, StatusTabs, Toolbar } from "@/features/admin/list";
import { InboxView } from "@/features/admin/audience/InboxView";

export const metadata: Metadata = { title: "پیام‌های تماس" };

const states: MessageState[] = ["new", "read", "answered"];

export default async function InboxPage({ searchParams }: PageProps<"/[locale]/admin/inbox">) {
  const viewer = await requirePermission("inbox.view");
  const params = await searchParams;
  const { items, counts } = await listMessages({
    q: readParam(params, "q"),
    state: readOption(params, "state", states),
  });

  return (
    <QueryStateProvider>
      <PageHeader
        title="پیام‌های تماس"
        description="پیام‌هایی که از فرم «تماس با ما» سایت رسیده‌اند."
      />
      <Card className="mb-4 overflow-hidden">
        <div className="border-b border-line">
          <StatusTabs
            param="state"
            label="وضعیت پیام"
            items={[
              { value: "all", label: "همه", count: counts.all },
              ...states.map((value) => ({
                value,
                label: messageStateLabels[value],
                count: counts[value],
              })),
            ]}
          />
        </div>
        <Toolbar>
          <SearchBox placeholder="نام، شماره، ایمیل یا متن پیام" className="w-full sm:w-80" />
        </Toolbar>
      </Card>
      <InboxView
        messages={items}
        activeId={readParam(params, "id")}
        now={renderTime()}
        canManage={can(viewer, "inbox.manage")}
      />
    </QueryStateProvider>
  );
}
