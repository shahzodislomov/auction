import { type NextRequest, NextResponse } from "next/server";

import {
  CHAMPAGNE_LOCALE_REQUEST_HEADER,
  resolveChampagneLocale,
} from "@/lib/i18n/locale";
import {
  CHAMPAGNE_LOCALE_STORAGE_KEY,
  isChampagneLocale,
} from "@/locales/champagne";

export function proxy(request: NextRequest) {
  const requestedLocale = request.nextUrl.searchParams.get("lang");
  const persistedLocale = request.cookies.get(
    CHAMPAGNE_LOCALE_STORAGE_KEY,
  )?.value;
  const locale = resolveChampagneLocale(requestedLocale, persistedLocale);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CHAMPAGNE_LOCALE_REQUEST_HEADER, locale);

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const hasAuthToken = Boolean(
    request.cookies.get("token")?.value ||
      request.cookies.get("sessionToken")?.value ||
      request.cookies.get("userId")?.value ||
      request.cookies.get("auth_token")?.value,
  );

  if (isProtectedRoute && !hasAuthToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (
    isChampagneLocale(requestedLocale) &&
    requestedLocale !== persistedLocale
  ) {
    response.cookies.set(CHAMPAGNE_LOCALE_STORAGE_KEY, requestedLocale, {
      maxAge: 31_536_000,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:avif|gif|ico|jpeg|jpg|png|svg|webp)$).*)",
  ],
};
