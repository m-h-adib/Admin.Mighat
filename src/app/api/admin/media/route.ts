import { getViewer } from "@/lib/admin/session";
import { saveMedia } from "@/lib/admin/api/media";
import { MEDIA_MAX_MB, MEDIA_TYPES } from "@/lib/admin/types";

export async function POST(request: Request) {
  if (!(await getViewer())) return new Response("Unauthorized", { status: 401 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return new Response("No file", { status: 400 });
  if (!MEDIA_TYPES.includes(file.type)) return new Response("Unsupported type", { status: 415 });
  if (file.size > MEDIA_MAX_MB * 1024 * 1024) return new Response("Too large", { status: 413 });
  return Response.json(await saveMedia(file), { status: 201 });
}
