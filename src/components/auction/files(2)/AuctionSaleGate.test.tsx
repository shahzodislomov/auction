import { waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AuctionBidEntry } from "@/components/auction/BidLedger";
import type { VehicleAuction } from "@/lib/auction/types";
import { renderWithAppProviders } from "@/test/render";
import { AuctionSaleGate } from "./AuctionSaleGate";

const gateState = vi.hoisted(() => ({
  counterpart: {
    id: "buyer-9",
    label: "Buyer 9",
    phone: "+998901112233",
  },
  createNotice: vi.fn(),
  vehicleImages: [
    { imageId: 77, imageUrl: "/vehicle-api-1.jpg", isPrimary: true },
    { imageId: 78, imageUrl: "/vehicle-api-2.jpg", isPrimary: false },
  ],
}));

vi.mock("./AuctionSaleModal", () => ({
  AuctionSaleModal: ({
    open,
    role,
    counterpart,
    imageUrls,
    vehicleTitle,
    vehicleYear,
  }: {
    open: boolean;
    role: string;
    counterpart: { label: string } | null;
    imageUrls: string[];
    vehicleTitle: string;
    vehicleYear: number | null;
  }) =>
    open ? (
      <div data-testid="auction-sale-modal">
        {role} · {vehicleTitle} · {counterpart?.label ?? "pending"} · {imageUrls.join(",")} · {vehicleYear}
      </div>
    ) : null,
}));

vi.mock("./useUserById", () => ({
  useUserById: () => ({
    data: gateState.counterpart,
    isLoading: false,
    isError: false,
  }),
  normalizeCounterparty: (value: unknown) => value,
}));

vi.mock("@/queries/users", () => ({
  useCreateNotif: () => ({
    mutate: gateState.createNotice,
  }),
}));

vi.mock("@/queries/contracts", () => ({
  useAuctionCounterparty: () => ({
    data: gateState.counterpart,
    isError: false,
    isLoading: false,
  }),
}));

function endedAuction(): VehicleAuction {
  return {
    id: "49",
    vehicleId: "58",
    lotNumber: "49",
    vin: "1HGCM82633A004352",
    status: "ended",
    title: {
      default: "Chevrolet Tracker",
      uz: "Chevrolet Tracker",
      ru: "Chevrolet Tracker",
      en: "Chevrolet Tracker",
    },
    description: {
      default: "Ended auction",
      uz: "Ended auction",
      ru: "Ended auction",
      en: "Ended auction",
    },
    make: "Chevrolet",
    model: "Tracker",
    year: 2024,
    startPrice: 1000,
    currentPrice: 2500,
    finalPrice: 2500,
    currency: "UZS",
    incrementType: "FIXED",
    incrementValue: 100,
    startTime: "2026-07-27T10:00:00.000Z",
    endTime: "2026-07-27T10:10:00.000Z",
    publishedAt: "2026-07-27T09:00:00.000Z",
    mileage: 12000,
    fuel: "PETROL",
    transmission: "AUTOMATIC",
    drivetrain: "FWD",
    region: null,
    condition: "GOOD",
    damage: null,
    seller: {
      id: "seller-7",
      name: "Seller 7",
      rating: null,
      verified: true,
    },
    inspection: null,
    documents: [],
    images: [
      {
        id: "image-1",
        url: "/tracker.jpg",
        alt: {
          default: "Chevrolet Tracker",
          uz: "Chevrolet Tracker",
          ru: "Chevrolet Tracker",
          en: "Chevrolet Tracker",
        },
      },
    ],
    counts: {
      views: 0,
      bids: 0,
      watchers: 0,
      participants: 0,
    },
    capabilities: [],
  };
}

describe("AuctionSaleGate", () => {
  beforeEach(() => {
    gateState.createNotice.mockReset();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("opens the ended-auction modal for the winner without creating a frontend contract request", async () => {
    const highestBid: AuctionBidEntry = {
      id: "bid-1",
      amount: 2500,
      bidderId: "buyer-9",
      bidderLabel: "Buyer 9",
      timestamp: "2026-07-27T10:09:00.000Z",
    };

    renderWithAppProviders(
      <AuctionSaleGate
        auctionId="49"
        auction={endedAuction()}
        vehicleTitle="Chevrolet Tracker"
        highestBid={highestBid}
        bids={[highestBid]}
        userId="buyer-9"
        locale="uz"
      />,
      { locale: "uz" },
    );

    await waitFor(() => {
      expect(document.querySelector('[data-testid="auction-sale-modal"]')).toHaveTextContent(
        "winner · Chevrolet Tracker · pending · /tracker.jpg · 2024",
      );
    });
    expect(gateState.createNotice).not.toHaveBeenCalled();
  });
});
