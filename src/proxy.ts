import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intl = createMiddleware(routing);

const foreignAdmin = /^\/(?!fa\/)[a-z]{2}(\/admin(?:\/.*)?)$/;

export default function proxy(request: NextRequest) {
  const match = foreignAdmin.exec(request.nextUrl.pathname);
  if (match) {
    const url = request.nextUrl.clone();
    url.pathname = `/fa${match[1]}`;
    return NextResponse.redirect(url);
  }
  return intl(request);
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
