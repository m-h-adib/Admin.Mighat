import { type Metadata } from "next";
import { SubmissionsPage } from "@/features/admin/submissions/SubmissionsPage";

export const metadata: Metadata = { title: "آثار هنری" };

export default function Page({ searchParams }: PageProps<"/[locale]/admin/art">) {
  return <SubmissionsPage kind="art" searchParams={searchParams} />;
}
