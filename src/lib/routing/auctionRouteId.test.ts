import { describe, expect, it } from "vitest";

import {
  auctionDetailHref,
  auctionIdPathSegment,
  auctionLiveHref,
  decodeAuctionRouteParam,
} from "@/lib/routing/auctionRouteId";

describe("auction route ids", () => {
  it("decodes the single encoded layer supplied by a dynamic route", () => {
    expect(decodeAuctionRouteParam("TA%2042")).toBe("TA 42");
    expect(decodeAuctionRouteParam("%D0%A2%D0%90-42")).toBe("ТА-42");
  });

  it("keeps malformed percent escapes usable instead of throwing", () => {
    expect(decodeAuctionRouteParam("TA%ZZ42")).toBe("TA%ZZ42");
  });

  it("encodes a raw auction id exactly once for a canonical path", () => {
    expect(auctionIdPathSegment("TA 42")).toBe("TA%2042");
    expect(auctionIdPathSegment("TA%2042")).toBe("TA%252042");
  });

  it("builds encoded detail and live hrefs from raw auction ids", () => {
    expect(auctionDetailHref("TA%2042")).toBe("/auctions/TA%252042");
    expect(auctionLiveHref("TA 42")).toBe("/auctions/TA%2042/live");
  });
});
