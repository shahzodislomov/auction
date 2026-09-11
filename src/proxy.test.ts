import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { CHAMPAGNE_LOCALE_REQUEST_HEADER } from "@/lib/i18n/locale";
import { CHAMPAGNE_LOCALE_STORAGE_KEY } from "@/locales/champagne";

import { proxy } from "./proxy";

describe("locale request proxy", () => {
  it("forwards the query locale for SSR and persists it", () => {
    const response = proxy(
      new NextRequest("https://auction.example/sold?lang=ru", {
        headers: {
          cookie: `${CHAMPAGNE_LOCALE_STORAGE_KEY}=en`,
        },
      }),
    );

    expect(
      response.headers.get(
        `x-middleware-request-${CHAMPAGNE_LOCALE_REQUEST_HEADER}`,
      ),
    ).toBe("ru");
    expect(response.cookies.get(CHAMPAGNE_LOCALE_STORAGE_KEY)?.value).toBe(
      "ru",
    );
  });

  it("uses the persisted locale when the query is missing or invalid", () => {
    const response = proxy(
      new NextRequest("https://auction.example/auctions?lang=invalid", {
        headers: {
          cookie: `${CHAMPAGNE_LOCALE_STORAGE_KEY}=en`,
        },
      }),
    );

    expect(
      response.headers.get(
        `x-middleware-request-${CHAMPAGNE_LOCALE_REQUEST_HEADER}`,
      ),
    ).toBe("en");
    expect(response.cookies.get(CHAMPAGNE_LOCALE_STORAGE_KEY)).toBeUndefined();
  });

  it("redirects anonymous users away from protected routes", () => {
    const response = proxy(
      new NextRequest("https://auction.example/dashboard"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://auction.example/login",
    );
  });
});
