import { type Metadata } from "next";
import { getSubmission } from "@/lib/admin/api/submissions";
import { SubmissionDetailPage } from "@/features/admin/submissions/SubmissionDetailPage";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/science/[id]">): Promise<Metadata> {
  const submission = await getSubmission((await params).id);
  return { title: submission?.title ?? "مقالات علمی" };
}

export default async function Page({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/science/[id]">) {
  return <SubmissionDetailPage kind="science" id={(await params).id} searchParams={searchParams} />;
}
