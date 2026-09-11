import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api/api";

import { fetchVehicleDetail } from "./vehicles";

vi.mock("@/api/api", () => ({
  api: {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("fetchVehicleDetail", () => {
  beforeEach(() => vi.mocked(api.get).mockReset());

  it("combines vehicle data with its images and documents", async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: { data: { vehicleId: 41, makeName: "Toyota", modelName: "Camry" } } })
      .mockResolvedValueOnce({ data: { data: { list: [{ imageId: 8, imageUrl: "/camry.jpg", isPrimary: true }] } } })
      .mockResolvedValueOnce({ data: { data: [{ documentId: 3, fileUrl: "/document.pdf" }] } });

    await expect(fetchVehicleDetail(41)).resolves.toMatchObject({
      vehicleId: 41,
      images: [{ imageId: 8, imageUrl: "/camry.jpg", isPrimary: true }],
      documents: [{ documentId: 3, fileUrl: "/document.pdf" }],
    });
  });

  it("still returns vehicle data when related media cannot be loaded", async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: { vehicleId: 41 } })
      .mockRejectedValueOnce(new Error("Images unavailable"))
      .mockRejectedValueOnce(new Error("Documents unavailable"));

    await expect(fetchVehicleDetail(41)).resolves.toMatchObject({
      vehicleId: 41,
      images: [],
      documents: [],
    });
  });
});
