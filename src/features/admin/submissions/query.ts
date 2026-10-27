import { can } from "@/lib/admin/permissions";
import { readOption, readPage, readParam, type SearchParams } from "@/lib/admin/params";
import {
  reviewStatuses,
  submissionSorts,
  type SubmissionKind,
  type SubmissionQuery,
  type Viewer,
} from "@/lib/admin/types";

export const filterParams = [
  "q",
  "category",
  "province",
  "from",
  "to",
  "sort",
  "assigned",
  "unscored",
  "status",
];

export function isJudgeOnly(viewer: Viewer, kind: SubmissionKind) {
  return !can(viewer, `${kind}.review`) && can(viewer, `${kind}.judge`);
}

export function parseSubmissionQuery(
  kind: SubmissionKind,
  params: SearchParams,
  viewer: Viewer,
  currentEditionId: string,
): SubmissionQuery {
  return {
    kind,
    editionId: readParam(params, "edition") ?? currentEditionId,
    status: readOption(params, "status", reviewStatuses),
    category: readParam(params, "category"),
    province: readParam(params, "province"),
    q: readParam(params, "q"),
    from: readParam(params, "from"),
    to: readParam(params, "to"),
    sort: readOption(params, "sort", submissionSorts) ?? "newest",
    assignedTo:
      isJudgeOnly(viewer, kind) || readParam(params, "assigned") === "me" ? viewer.id : undefined,
    unscored: readParam(params, "unscored") === "1",
    page: readPage(params),
  };
}
