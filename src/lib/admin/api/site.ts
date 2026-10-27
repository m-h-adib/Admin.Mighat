import { db } from "@/lib/admin/store";
import { type SiteSettings } from "@/lib/admin/types";

export async function getSiteSettings(): Promise<SiteSettings> {
  return db.site;
}

export async function updateSiteSettings<K extends keyof SiteSettings>(
  section: K,
  value: SiteSettings[K],
) {
  db.site[section] = value;
}
