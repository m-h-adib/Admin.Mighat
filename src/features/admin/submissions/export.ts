import { type NextRequest } from "next/server";
import { authorize } from "@/lib/admin/session";
import { getCurrentEditionId } from "@/lib/admin/api/festival";
import { exportSubmissions } from "@/lib/admin/api/submissions";
import { type SubmissionKind } from "@/lib/admin/types";
import { parseSubmissionQuery } from "@/features/admin/submissions/query";

export async function exportResponse(kind: SubmissionKind, request: NextRequest) {
  const viewer = await authorize(`${kind}.export`);
  if (!viewer) return new Response("Forbidden", { status: 403 });
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const query = parseSubmissionQuery(kind, params, viewer, await getCurrentEditionId());
  const csv = await exportSubmissions(query);
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="miqat-${kind}-${query.editionId}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
