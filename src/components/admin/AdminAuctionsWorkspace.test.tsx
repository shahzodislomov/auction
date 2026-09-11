import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LangSwitch } from "@/context/LangSwitch";
import { AdminAuctionsWorkspace } from "./AdminVehiclesWorkspace";

const testState = vi.hoisted(() => ({
  feedItems: [] as Array<Record<string, unknown>>,
  singleAuction: null as Record<string, unknown> | null,
  singleAuctionIdCalled: null as string | number | null,
}));

vi.mock("@/queries/auction-listings", () => ({
  useAuctionFeed: () => ({
    data: {
      items: testState.feedItems,
      meta: { elements: testState.feedItems.length, pages: 1, counts: { all: testState.feedItems.length } },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useAuction: (auctionId: string | number) => {
    testState.singleAuctionIdCalled = auctionId;
    return {
      data: testState.singleAuction,
      isLoading: false,
      isFetching: false,
      isError: false,
    };
  },
  useAdminVehicles: () => ({ data: [], isLoading: false, isError: false }),
  useAuctions: () => ({ data: [], isLoading: false, isError: false }),
  useGetAiFailedVehicles: () => ({ data: [], isLoading: false, isError: false }),
  useGetAiLogs: () => ({ data: [], isLoading: false, isError: false }),
  useRetryAiProcessing: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useApproveAdminAuction: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useRejectAdminAuction: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/queries/admin-vehicle-documents", () => ({
  useAdminVehicleDocuments: () => ({
    data: { list: [], elements: 0, pages: 1 },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useApproveVehicleDocument: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useRejectVehicleDocument: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

describe("AdminAuctionsWorkspace - Single Auction Photos", () => {
  beforeEach(() => {
    testState.singleAuctionIdCalled = null;
    testState.feedItems = [
      {
        auctionId: "777",
        status: "LIVE",
        approvalStatus: "APPROVED",
        startPrice: 50000000,
        vehicle: {
          vehicleId: "123",
          makeName: "Chevrolet",
          modelName: "Malibu",
          year: 2023,
        },
      },
    ];
    testState.singleAuction = {
      auctionId: "777",
      status: "LIVE",
      approvalStatus: "APPROVED",
      lotImageDtoList: [
        { imageUrl: "/uploads/car_front.jpg" },
        { imageUrl: "https://external.com/car_rear.jpg" },
      ],
      vehicle: {
        vehicleId: "123",
        makeName: "Chevrolet",
        modelName: "Malibu",
        year: 2023,
        imageUrls: ["/uploads/car_side.jpg"],
      },
    };
  });

  it("fetches single auction endpoint when an auction row is opened and renders all transport photos", async () => {
    const user = userEvent.setup();

    render(
      <LangSwitch.Provider value={{ currentLang: "uz", setCurrentLang: vi.fn() }}>
        <AdminAuctionsWorkspace />
      </LangSwitch.Provider>,
    );

    // Click on the row to open the details modal
    const row = screen.getByRole("row", { name: /tafsilotlarini ochish/i });
    await user.click(row);

    // Verify useAuction was called with auctionId 777
    expect(testState.singleAuctionIdCalled).toBe("777");

    // Modal is open, switch to the "Avtomobil" tab
    const vehicleTab = screen.getByRole("tab", { name: "Avtomobil" });
    await user.click(vehicleTab);

    // Check that photos are displayed with normalized URLs
    await waitFor(() => {
      const photos = screen.getAllByAltText(/Vehicle \d+/);
      expect(photos.length).toBe(3); // 2 from lotImageDtoList + 1 from vehicle.imageUrls

      // Relative URLs should be normalized with backend domain
      expect(photos[0]).toHaveAttribute("src", "https://api.tezauksion.uz/uploads/car_front.jpg");
      expect(photos[1]).toHaveAttribute("src", "https://external.com/car_rear.jpg");
      expect(photos[2]).toHaveAttribute("src", "https://api.tezauksion.uz/uploads/car_side.jpg");
    });
  });
});
