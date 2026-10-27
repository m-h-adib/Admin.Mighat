import { SearchX } from "lucide-react";
import { adminButton } from "@/components/admin/button";
import { EmptyState } from "@/components/admin/primitives";
import { AdminLink } from "@/features/admin/navigation";

export default function AdminNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="این صفحه پیدا نشد"
      description="ممکن است مورد موردنظر حذف شده یا نشانی اشتباه باشد."
      action={
        <AdminLink href="/admin" className={adminButton({ variant: "primary" })}>
          بازگشت به پیشخوان
        </AdminLink>
      }
      className="py-24"
    />
  );
}
