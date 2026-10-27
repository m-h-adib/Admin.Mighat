import { readMedia } from "@/lib/admin/api/media";

export async function GET(_request: Request, { params }: RouteContext<"/api/admin/media/[id]">) {
  const media = await readMedia((await params).id);
  if (!media) return new Response("Not found", { status: 404 });
  return new Response(new Blob([media.data]), {
    headers: {
      "Content-Type": media.asset.type,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
