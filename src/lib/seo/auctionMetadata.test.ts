import { describe, expect, it } from "vitest";

import { demoVehicleAuctions } from "@/lib/fixtures/vehicleAuctions";
import {
  buildAuctionMetadata,
  buildVehicleStructuredData,
} from "@/lib/seo/auctionMetadata";
import type { VehicleAuction } from "@/lib/auction/types";

const verifiedAuction = demoVehicleAuctions[0];

describe("auction metadata", () => {
  it("builds canonical and locale-alternate metadata", () => {
    const metadata = buildAuctionMetadata(verifiedAuction, "en");

    expect(metadata.alternates).toMatchObject({
      canonical: "/auctions/10245?lang=en",
      languages: {
        uz: "/auctions/10245?lang=uz",
        ru: "/auctions/10245?lang=ru",
        en: "/auctions/10245?lang=en",
        "x-default": "/auctions/10245?lang=uz",
      },
    });
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "/auctions/10245?lang=en",
    });
  });

  it("omits unverified VIN, inspection, seller verification, and price values", () => {
    const unknownAuction: VehicleAuction = {
      ...verifiedAuction,
      vin: null,
      startPrice: null,
      currentPrice: null,
      finalPrice: null,
      seller: verifiedAuction.seller
        ? { ...verifiedAuction.seller, verified: null }
        : null,
      inspection: null,
    };

    const metadata = buildAuctionMetadata(unknownAuction, "en");
    const structuredData = buildVehicleStructuredData(unknownAuction, "en");
    const serializedMetadata = JSON.stringify(metadata).toLowerCase();
    const serializedData = JSON.stringify(structuredData).toLowerCase();

    expect(structuredData).not.toHaveProperty("vehicleIdentificationNumber");
    expect(structuredData).not.toHaveProperty("offers");
    expect(serializedData).not.toContain("inspection");
    expect(serializedData).not.toContain("seller verification");
    expect(serializedMetadata).not.toContain("vin");
    expect(serializedMetadata).not.toContain("inspection");
    expect(serializedMetadata).not.toContain("verified seller");
    expect(serializedMetadata).not.toContain("uzs");
  });

  it("emits verified vehicle and offer facts when supplied", () => {
    expect(buildVehicleStructuredData(verifiedAuction, "ru")).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Vehicle",
      inLanguage: "ru-RU",
      name: verifiedAuction.title.ru,
      url: "/auctions/10245?lang=ru",
      vehicleIdentificationNumber: verifiedAuction.vin,
      offers: {
        "@type": "Offer",
        price: verifiedAuction.currentPrice,
        priceCurrency: "UZS",
      },
    });
  });

  it.each(["sold", "ended"] as const)(
    "omits a %s offer when no verified final price was supplied",
    (status) => {
      const closedWithoutOutcome: VehicleAuction = {
        ...verifiedAuction,
        status,
        finalPrice: null,
        currentPrice: 240_000_000,
        startPrice: 200_000_000,
      };

      expect(buildVehicleStructuredData(closedWithoutOutcome, "en")).not.toHaveProperty(
        "offers",
      );
    },
  );

  it("omits offers for a cancelled auction even when prices are supplied", () => {
    const cancelledAuction: VehicleAuction = {
      ...verifiedAuction,
      status: "cancelled",
      finalPrice: 250_000_000,
      currentPrice: 240_000_000,
      startPrice: 200_000_000,
    };

    expect(buildVehicleStructuredData(cancelledAuction, "en")).not.toHaveProperty(
      "offers",
    );
  });

  it("can emit equivalent localized structured data for the live route", () => {
    expect(
      buildVehicleStructuredData(verifiedAuction, "en", {
        canonicalPath: "/auctions/10245/live",
      }),
    ).toMatchObject({
      name: verifiedAuction.title.en,
      url: "/auctions/10245/live?lang=en",
      offers: {
        url: "/auctions/10245/live?lang=en",
      },
    });
  });
});
