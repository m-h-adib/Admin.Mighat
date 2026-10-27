import { type NextRequest } from "next/server";
import { exportResponse } from "@/features/admin/submissions/export";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/admin/export/[kind]">,
) {
  const { kind } = await params;
  if (kind !== "art" && kind !== "science") return new Response("Not found", { status: 404 });
  return exportResponse(kind, request);
}
