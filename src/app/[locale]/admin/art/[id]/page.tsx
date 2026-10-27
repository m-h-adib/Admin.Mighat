import { type Metadata } from "next";
import { getSubmission } from "@/lib/admin/api/submissions";
import { SubmissionDetailPage } from "@/features/admin/submissions/SubmissionDetailPage";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/art/[id]">): Promise<Metadata> {
  const submission = await getSubmission((await params).id);
  return { title: submission?.title ?? "آثار هنری" };
}

export default async function Page({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/art/[id]">) {
  return <SubmissionDetailPage kind="art" id={(await params).id} searchParams={searchParams} />;
}
