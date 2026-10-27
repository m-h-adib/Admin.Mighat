import { type Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { adminButton } from "@/components/admin/button";
import { EmptyState } from "@/components/admin/primitives";
import { AdminLink } from "@/features/admin/navigation";

export const metadata: Metadata = { title: "بدون دسترسی" };

export default function ForbiddenPage() {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="به این بخش دسترسی ندارید"
      description="نقش کاربری شما اجازه دیدن این صفحه را نمی‌دهد. اگر به آن نیاز دارید، از مدیر سامانه بخواهید دسترسی‌تان را تغییر دهد."
      action={
        <AdminLink href="/admin" className={adminButton({ variant: "primary" })}>
          بازگشت به پیشخوان
        </AdminLink>
      }
      className="py-24"
    />
  );
}
