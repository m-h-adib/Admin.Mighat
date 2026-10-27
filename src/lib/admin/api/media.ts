import { db, newId } from "@/lib/admin/store";
import { type ID, type MediaAsset } from "@/lib/admin/types";

export async function saveMedia(file: File): Promise<MediaAsset> {
  const id = newId();
  const asset: MediaAsset = {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    url: `/api/admin/media/${id}`,
  };
  db.media.set(id, { asset, data: new Uint8Array(await file.arrayBuffer()) });
  return asset;
}

export async function readMedia(id: ID) {
  return db.media.get(id);
}
