import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAuction,
  createAuctionWithVehicle,
  fetchAdminVehicles,
  fetchAuctionFeed,
  fetchPendingAdminAuctions,
  fetchAuctionByVehicle,
  fetchAuction,
  fetchAuctions,
  fetchVehicles,
  normalizeAuctionStatusParam,
  normalizeAuctionApprovalStatusParam,
  approveAdminAuction,
  rejectAdminAuction,
  relistVehicle,
} from "./auction-listings";

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: apiMocks,
}));

describe("auction listing endpoint adapters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes auction status query values for the live auctions endpoint", () => {
    expect(normalizeAuctionStatusParam("draft")).toBe("DRAFT");
    expect(normalizeAuctionStatusParam("schedued")).toBe("SCHEDULED");
    expect(normalizeAuctionStatusParam("scheduled")).toBe("SCHEDULED");
    expect(normalizeAuctionStatusParam("live")).toBe("LIVE");
    expect(normalizeAuctionStatusParam("finished")).toBe("FINISHED");
    expect(normalizeAuctionStatusParam("canceled")).toBe("CANCELED");
    expect(normalizeAuctionStatusParam("unknown")).toBeNull();
  });

  it("normalizes auction approval status query values", () => {
    expect(normalizeAuctionApprovalStatusParam("pending_review")).toBe("PENDING_REVIEW");
    expect(normalizeAuctionApprovalStatusParam("approved")).toBe("APPROVED");
    expect(normalizeAuctionApprovalStatusParam("rejected")).toBe("REJECTED");
    expect(normalizeAuctionApprovalStatusParam("draft")).toBeNull();
  });

  it("fetches auctions through GET /auctions with page, size, status, and backend search", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: { content: [{ id: 1 }] } } });

    await expect(fetchAuctions({ approvalStatus: "approved", page: 2, search: "cobalt", size: 12, status: "live" })).resolves.toEqual([
      { id: 1 },
    ]);

    expect(apiMocks.get).toHaveBeenCalledWith("/auctions", {
      params: { approvalStatus: "APPROVED", page: 2, search: "cobalt", size: 12, status: "LIVE" },
    });
  });

  it("fetches one auction through GET /auctions/{auctionId}", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: { auctionId: 7 } } });

    await expect(fetchAuction(7)).resolves.toEqual({ auctionId: 7 });

    expect(apiMocks.get).toHaveBeenCalledWith("/auctions/7");
  });

  it("fetches a vehicle detail through its nested auction payload", async () => {
    apiMocks.get.mockResolvedValue({
      data: { data: { auctionId: 65, vehicle: { vehicleId: 92 } } },
    });

    await expect(fetchAuctionByVehicle(92)).resolves.toEqual({
      auctionId: 65,
      vehicle: { vehicleId: 92 },
    });

    expect(apiMocks.get).toHaveBeenCalledWith(
      "/auctions/by-vehicle/92",
      expect.any(Object),
    );
  });

  it("fetches the public auction feed with pagination and auction status", async () => {
    apiMocks.get.mockResolvedValue({
      data: {
        meta: { elements: 58, list: [{ auctionId: 1 }], pages: 6 },
      },
    });

    await expect(
      fetchAuctionFeed({
        page: 1,
        search: "cobalt",
        sellerId: 219,
        size: 20,
        status: "live",
      }),
    ).resolves.toEqual({
      items: [{ auctionId: 1 }],
      meta: { elements: 58, pages: 6 },
    });

    expect(apiMocks.get).toHaveBeenCalledWith("/auctions/by-seller/219", {
      params: { page: 1, search: "cobalt", size: 20, status: "live" },
    });
  });

  it("preserves backend lifecycle and approval totals from auction metadata", async () => {
    apiMocks.get.mockResolvedValue({
      data: {
        meta: {
          counts: {
            all: 76,
            approval: { APPROVED: 73, PENDING_REVIEW: 3, REJECTED: 0 },
            lifecycle: { CANCELED: 57, DRAFT: 3, FINISHED: 13, LIVE: 0, SCHEDULED: 3 },
          },
          elements: 76,
          list: [],
          pages: 4,
        },
      },
    });

    await expect(fetchAuctionFeed({ page: 0, size: 20 })).resolves.toEqual({
      items: [],
      meta: {
        counts: {
          all: 76,
          approval: { APPROVED: 73, PENDING_REVIEW: 3, REJECTED: 0 },
          lifecycle: { CANCELED: 57, DRAFT: 3, FINISHED: 13, LIVE: 0, SCHEDULED: 3 },
        },
        elements: 76,
        pages: 4,
      },
    });
  });

  it("passes approvalStatus to GET /auctions independently from lifecycle status", async () => {
    apiMocks.get.mockResolvedValue({ data: { meta: { elements: 4, list: [], pages: 1 } } });

    await fetchAuctionFeed({ approvalStatus: "pending_review", page: 0, search: "sonata", size: 20 });

    expect(apiMocks.get).toHaveBeenCalledWith("/auctions", {
      params: { approvalStatus: "PENDING_REVIEW", page: 0, search: "sonata", size: 20 },
    });
  });

  it("fetches auctions waiting for admin review from the dedicated endpoint", async () => {
    apiMocks.get.mockResolvedValue({
      data: { meta: { elements: 1, list: [{ approvalStatus: "PENDING_REVIEW", auctionId: 9 }], pages: 1 } },
    });

    await expect(fetchPendingAdminAuctions({ page: 0, search: "sonata", size: 20 })).resolves.toEqual({
      items: [{ approvalStatus: "PENDING_REVIEW", auctionId: 9 }],
      meta: { elements: 1, pages: 1 },
    });
    expect(apiMocks.get).toHaveBeenCalledWith("/auctions/admin/pending", {
      params: { page: 0, search: "sonata", size: 20 },
    });
  });

  it("omits an unknown auction status instead of sending an invalid query", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: [{ id: 2 }] } });

    await expect(fetchAuctions({ page: 0, size: 20, status: "unknown" })).resolves.toEqual([
      { id: 2 },
    ]);

    expect(apiMocks.get).toHaveBeenCalledWith("/auctions", {
      params: { page: 0, size: 20 },
    });
  });

  it("fetches vehicles and admin vehicles through their live endpoints", async () => {
    apiMocks.get
      .mockResolvedValueOnce({ data: { content: [{ id: 3 }] } })
      .mockResolvedValueOnce({ data: { data: { dtoList: [{ id: 4 }] } } });

    await expect(fetchVehicles({ page: 1, size: 10 })).resolves.toEqual([{ id: 3 }]);
    await expect(fetchAdminVehicles({ page: 0, search: "cobalt", size: 5 })).resolves.toEqual({
      items: [{ id: 4 }],
      meta: { elements: 0, pages: 1 },
    });

    expect(apiMocks.get).toHaveBeenNthCalledWith(1, "/vehicles", {
      params: { page: 1, size: 10 },
    });
    expect(apiMocks.get).toHaveBeenNthCalledWith(2, "/vehicles", {
      params: { page: 0, search: "cobalt", size: 5 },
    });
  });

  it("loads only the authenticated seller's vehicles", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: [] } });

    await fetchVehicles({ page: 0, size: 100, sellerId: 219 });

    expect(apiMocks.get).toHaveBeenCalledWith("/vehicles", {
      params: { page: 0, size: 100, sellerId: 219 },
    });
  });

  it("creates an auction through POST /auctions/create with the live request body", async () => {
    apiMocks.post.mockResolvedValue({ data: { data: { id: 77 } } });

    await expect(
      createAuction({
        vehicleId: "42",
        startPrice: "250000",
        reservePrice: "300000",
        currency: "uzs",
        incrementType: "fixed",
        incrementValue: "10000",
        depositPercent: "10",
        startTime: "2026-07-22T08:00:00.000Z",
        endTime: "2026-07-23T08:00:00.000Z",
      }),
    ).resolves.toEqual({ id: 77 });

    expect(apiMocks.post).toHaveBeenCalledWith("/auctions/create", {
      vehicleId: 42,
      startPrice: 250000,
      reservePrice: 300000,
      currency: "UZS",
      incrementType: "FIXED",
      incrementValue: 10000,
      depositPercent: 10,
      startTime: "2026-07-22T08:00:00.000Z",
      endTime: "2026-07-23T08:00:00.000Z",
    });
  });

  it("prepares an existing vehicle for another auction through the relist endpoint", async () => {
    apiMocks.post.mockResolvedValue({ data: { data: { vehicleId: 42 } } });

    await expect(relistVehicle(42)).resolves.toEqual({ vehicleId: 42 });

    expect(apiMocks.post).toHaveBeenCalledWith("/vehicles/42/relist");
  });

  it("creates a vehicle and auction through the atomic endpoint", async () => {
    apiMocks.post.mockResolvedValue({ data: { data: { vehicleId: 81, auctionId: 901 } } });

    await expect(createAuctionWithVehicle({
      vehicle: {
        makeId: "1", modelId: "10", year: "2030", vin: "W5GPTX97EX6ZG1CY7",
        mileage: "0", engineVolume: "1", fuelType: "PETROL", transmission: "MANUAL",
        drivetrain: "FWD", bodyType: "SEDAN", color: "white", conditionGrade: "EXCELLENT",
        region: "Tashkent", description: "Clean vehicle",
      },
      auction: {
        startPrice: "20000", reservePrice: "25000", currency: "uzs", incrementType: "fixed",
        incrementValue: "500", depositPercent: "10", startTime: "2030-01-01T10:00:00.000Z",
        endTime: "2030-01-02T10:00:00.000Z",
      },
    })).resolves.toEqual({ vehicleId: 81, auctionId: 901 });

    expect(apiMocks.post).toHaveBeenCalledWith("/auctions/create-with-vehicle", {
      vehicle: {
        makeId: 1, modelId: 10, year: 2030, vin: "W5GPTX97EX6ZG1CY7", mileage: 0,
        engineVolume: 1, fuelType: "PETROL", transmission: "MANUAL", drivetrain: "FWD",
        bodyType: "SEDAN", color: "white", conditionGrade: "EXCELLENT", region: "Tashkent",
        description: "Clean vehicle",
      },
      auction: {
        startPrice: 20000, reservePrice: 25000, currency: "UZS", incrementType: "FIXED",
        incrementValue: 500, depositPercent: 10, startTime: "2030-01-01T10:00:00.000Z",
        endTime: "2030-01-02T10:00:00.000Z",
      },
    });
  });

  it("approves and rejects pending-review auctions through the admin endpoints", async () => {
    apiMocks.patch.mockResolvedValue({ data: { data: {} } });

    await approveAdminAuction(41);
    await rejectAdminAuction({ auctionId: 42, reason: "  Auction terms are invalid  " });

    expect(apiMocks.patch).toHaveBeenNthCalledWith(1, "/auctions/admin/41/approve");
    expect(apiMocks.patch).toHaveBeenNthCalledWith(2, "/auctions/admin/42/reject", {
      reason: "Auction terms are invalid",
    });
  });
});
