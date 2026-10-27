import { type Metadata } from "next";
import { SubmissionsPage } from "@/features/admin/submissions/SubmissionsPage";

export const metadata: Metadata = { title: "مقالات علمی" };

export default function Page({ searchParams }: PageProps<"/[locale]/admin/science">) {
  return <SubmissionsPage kind="science" searchParams={searchParams} />;
}
