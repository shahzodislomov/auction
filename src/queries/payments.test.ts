import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchAuctionPayments,
  fetchMyPayments,
  fetchPayment,
  fetchPaymentMethods,
  fetchPaymentStatuses,
  fetchPaymentTypes,
  payAuctionFromWallet,
  recordAuctionFee,
} from "./payments";

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock("@/api/api", () => ({ api: apiMocks }));

describe("payment-controller queries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads and normalizes the authenticated user's payment page", async () => {
    apiMocks.get.mockResolvedValue({
      data: { data: { content: [{ paymentId: 9, paymentType: "FEE" }], totalPages: 3, totalElements: 41 } },
    });

    await expect(fetchMyPayments(1, 20)).resolves.toMatchObject({
      list: [{ paymentId: 9, paymentType: "FEE" }],
      page: 1,
      pages: 3,
      elements: 41,
    });
    expect(apiMocks.get).toHaveBeenCalledWith("/payments/mine", {
      params: { page: 1, size: 20 },
    });
  });

  it("uses the payment and auction lookup endpoints", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: { paymentId: 5 } } });
    await expect(fetchPayment(5)).resolves.toEqual({ paymentId: 5 });
    expect(apiMocks.get).toHaveBeenLastCalledWith("/payments/5");

    await fetchAuctionPayments(12);
    expect(apiMocks.get).toHaveBeenLastCalledWith("/payments/by-auction/12");
  });

  it("records fees and wallet payments only after explicit backend success", async () => {
    apiMocks.post.mockResolvedValue({ data: { status: "OK" } });
    const fee = { auctionId: 12, amount: 50000, paymentMethod: "WALLET" as const };
    await expect(recordAuctionFee(fee)).resolves.toMatchObject({ status: "OK" });
    expect(apiMocks.post).toHaveBeenCalledWith("/payments/fee", fee);

    await expect(payAuctionFromWallet(12)).resolves.toMatchObject({ status: "OK" });
    expect(apiMocks.post).toHaveBeenCalledWith("/payments/auctions/12/pay-wallet");

    apiMocks.post.mockResolvedValueOnce({ data: { status: "ERROR" } });
    await expect(payAuctionFromWallet(12)).rejects.toThrow(/did not confirm/i);
  });

  it("loads payment reference values", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: ["VALUE"] } });
    await expect(fetchPaymentTypes()).resolves.toEqual(["VALUE"]);
    await expect(fetchPaymentStatuses()).resolves.toEqual(["VALUE"]);
    await expect(fetchPaymentMethods()).resolves.toEqual(["VALUE"]);
    expect(apiMocks.get.mock.calls.map(([url]) => url)).toEqual([
      "/payment/getAllPaymentType",
      "/payment/getAllPaymentStatus",
      "/payment/getAllPaymentMethod",
    ]);
  });
});
