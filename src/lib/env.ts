import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables (see .env.example):\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = {
  siteUrl: parsed.data.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""),
};

export function siteHref(path: `/${string}`, locale: string): string {
  return `${env.siteUrl}/${locale}${path === "/" ? "" : path}`;
}
