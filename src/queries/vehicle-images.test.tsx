import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteVehicleImage,
  fetchVehicleImages,
  getVehicleImageContractState,
  setVehiclePrimaryImage,
  uploadVehicleImage,
} from "./vehicle-images";

const apiMocks = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: apiMocks,
}));

describe("vehicle image live API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_VEHICLE_API_MODE", "real");
  });

  it("enables the real vehicle image contract", () => {
    expect(getVehicleImageContractState()).toEqual({
      isContractAvailable: true,
      isMock: false,
      unavailableReason: null,
    });
  });

  it("lists vehicle images through the live endpoint", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: [{ id: 9 }] } });

    await expect(fetchVehicleImages(42)).resolves.toEqual([{ id: 9 }]);

    expect(apiMocks.get).toHaveBeenCalledWith("/vehicles/42/images");
  });

  it("uploads a vehicle image with the backend file field and primary query", async () => {
    const file = new File(["image"], "front.jpg", { type: "image/jpeg" });
    apiMocks.post.mockResolvedValue({ data: { data: { id: 7 } } });

    await expect(
      uploadVehicleImage({ vehicleId: 42, file, isPrimary: true }),
    ).resolves.toEqual({ id: 7 });

    const [url, formData, config] = apiMocks.post.mock.calls[0];
    expect(url).toBe("/vehicles/42/images");
    expect(formData.get("file")).toBe(file);
    expect(formData.has("image")).toBe(false);
    expect(config).toEqual({
      headers: { "Content-Type": "multipart/form-data" },
      params: { isPrimary: true },
    });
  });

  it("deletes and marks primary through the live endpoints", async () => {
    apiMocks.delete.mockResolvedValue({ data: { data: [] } });
    apiMocks.patch.mockResolvedValue({ data: { data: [{ id: 8, isPrimary: true }] } });

    await expect(deleteVehicleImage({ vehicleId: 42, imageId: 8 })).resolves.toEqual([]);
    await expect(setVehiclePrimaryImage({ vehicleId: 42, imageId: 8 })).resolves.toEqual([
      { id: 8, isPrimary: true },
    ]);

    expect(apiMocks.delete).toHaveBeenCalledWith("/vehicles/42/images/8");
    expect(apiMocks.patch).toHaveBeenCalledWith("/vehicles/42/images/8/primary");
  });
});
