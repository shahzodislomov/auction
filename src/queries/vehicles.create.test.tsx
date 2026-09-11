import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createVehicle,
  createVehicleWithImages,
  deleteVehicleImage,
  fetchVehicleMakes,
  fetchVehicleModels,
  resolveCreatedVehicleId,
  setPrimaryVehicleImage,
  fetchOwnerVehicles,
  uploadVehicleDocument,
  uploadVehicleImage,
  updateVehicle,
} from "./vehicles";

const apiMocks = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  uploadImage: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: apiMocks,
}));

vi.mock("@/queries/vehicle-images", () => ({
  uploadVehicleImage: apiMocks.uploadImage,
}));

describe("new vehicle API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("finds the vehicle identifier in a combined auction response", () => {
    expect(resolveCreatedVehicleId({ data: { vehicle: { id: 81 }, auction: { id: 901 } } })).toBe(81);
    expect(resolveCreatedVehicleId({ data: { vehicleId: 82, auctionId: 902 } })).toBe(82);
  });

  it("creates a vehicle with the Swagger DTO", async () => {
    apiMocks.post.mockResolvedValue({
      data: { data: { vehicleId: 81 }, status: "CREATED" },
    });

    await expect(
      createVehicle({
        form: {
          bodyType: "sedan",
          color: "White",
          condition: "Inspected",
          description: "Clean vehicle",
          drivetrain: "Front wheel drive",
          engineVolume: "1.5",
          fuelType: "Petrol",
          makeId: "1",
          mileage: "22000",
          modelId: "10",
          region: "Tashkent",
          transmission: "Automatic",
          vin: "98GV7DAPNLPEV1NKK",
          year: "2030",
        },
      }),
    ).resolves.toEqual({ vehicleId: 81 });

    expect(apiMocks.post).toHaveBeenCalledWith("/vehicles/create", {
      bodyType: "SEDAN",
      color: "White",
      conditionGrade: "GOOD",
      description: "Clean vehicle",
      drivetrain: "FWD",
      engineVolume: 1.5,
      fuelType: "PETROL",
      makeId: 1,
      mileage: 22000,
      modelId: 10,
      region: "Tashkent",
      transmission: "AUTOMATIC",
      vin: "98GV7DAPNLPEV1NKK",
      year: 2030,
    });
  });

  it("updates a vehicle through the Swagger PUT endpoint", async () => {
    apiMocks.put.mockResolvedValue({ data: { data: { vehicleId: 81 }, status: "OK" } });

    await updateVehicle({ id: 81, form: {
      bodyType: "SEDAN", color: "white", conditionGrade: "EXCELLENT", description: "Updated",
      drivetrain: "FWD", engineVolume: "1", fuelType: "PETROL", makeId: "1", mileage: "0",
      modelId: "10", region: "Tashkent", transmission: "MANUAL", vin: "7HG4PBSWVZF5683PV", year: "2030",
    } });

    expect(apiMocks.put).toHaveBeenCalledWith("/vehicles/81", {
      bodyType: "SEDAN", color: "white", conditionGrade: "EXCELLENT", description: "Updated",
      drivetrain: "FWD", engineVolume: 1, fuelType: "PETROL", makeId: 1, mileage: 0,
      modelId: 10, region: "Tashkent", transmission: "MANUAL", vin: "7HG4PBSWVZF5683PV", year: 2030,
    });
  });

  it("loads makes and models using the selected makeId", async () => {
    apiMocks.post.mockReset();
    apiMocks.get
      .mockResolvedValueOnce({ data: { data: [{ makeId: 1, makeName: "Toyota" }] } })
      .mockResolvedValueOnce({ data: { data: { list: [{ modelId: 12, modelName: "Camry" }] } } });

    await expect(fetchVehicleMakes()).resolves.toEqual([{ id: 1, name: "Toyota" }]);
    await expect(fetchVehicleModels(1)).resolves.toEqual([{ id: 12, name: "Camry" }]);
    expect(apiMocks.get).toHaveBeenNthCalledWith(1, "/vehicles/makes");
    expect(apiMocks.get).toHaveBeenNthCalledWith(2, "/vehicles/models", { params: { makeId: 1 } });
  });

  it("uses vehicle imageUrls without requesting images separately", async () => {
    apiMocks.get.mockImplementation((url: string) => {
      if (url === "/vehicles") {
        return Promise.resolve({
          data: { meta: { elements: 1, list: [{ vehicleId: 81, imageUrls: ["/camry.jpg"], makeName: "Toyota" }], pages: 1 } },
        });
      }
      if (url === "/vehicles/81/documents") {
        return Promise.resolve({ data: { data: { list: [{ documentId: 9, docType: "TITLE" }] } } });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    await expect(fetchOwnerVehicles()).resolves.toEqual({
      meta: {
        elements: 1,
        list: [{
          documents: [{ documentId: 9, docType: "TITLE" }],
          imageUrls: ["/camry.jpg"],
          makeName: "Toyota",
          vehicleId: 81,
        }],
        pages: 1,
      },
    });

    expect(apiMocks.get).toHaveBeenCalledWith("/vehicles", { params: { page: 0, size: 20 } });
    expect(apiMocks.get).toHaveBeenCalledWith("/vehicles/81/documents");
    expect(apiMocks.get).not.toHaveBeenCalledWith("/vehicles/81/images");
  });

  it("passes vehicle search filters to GET /vehicles", async () => {
    apiMocks.get.mockResolvedValue({
      data: { meta: { elements: 0, list: [], pages: 0 } },
    });

    await expect(
      fetchOwnerVehicles({
        bodyType: "SEDAN",
        sellerId: 219,
        search: "cobalt",
        type: "APPROVED",
      }),
    ).resolves.toEqual({
      meta: { elements: 0, list: [], pages: 0 },
    });

    expect(apiMocks.get).toHaveBeenCalledWith("/vehicles", {
      params: {
        bodyType: "SEDAN",
        page: 0,
        sellerId: 219,
        search: "cobalt",
        size: 20,
        type: "APPROVED",
      },
    });
  });

  it("rejects an application-level vehicle creation error", async () => {
    apiMocks.post.mockResolvedValue({
      data: { message: "VIN already exists", status: "ERROR" },
    });

    await expect(
      createVehicle({ form: { vin: "98GV7DAPNLPEV1NKK" } }),
    ).rejects.toThrow("VIN already exists");
  });

  it("uploads the binary file separately with the primary query", async () => {
    const file = new File(["front"], "front.jpg", { type: "image/jpeg" });
    apiMocks.post.mockResolvedValue({
      data: { data: { imageId: 5 }, status: "CREATED" },
    });

    await expect(
      uploadVehicleImage({ file, isPrimary: true, vehicleId: 81 }),
    ).resolves.toEqual({ imageId: 5 });

    const [url, formData, config] = apiMocks.post.mock.calls[0];
    expect(url).toBe("/vehicles/81/images");
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("file")).toBe(file);
    expect(config).toEqual({
      headers: { "Content-Type": "multipart/form-data" },
      params: { isPrimary: true },
    });
  });

  it("sets a primary image and deletes an image through the Swagger endpoints", async () => {
    apiMocks.patch.mockResolvedValue({ data: { data: { imageId: 4 }, status: "OK" } });
    apiMocks.delete.mockResolvedValue({ data: { data: { imageId: 4 }, status: "OK" } });

    await expect(setPrimaryVehicleImage({ imageId: 4, vehicleId: 81 })).resolves.toEqual({ imageId: 4 });
    await expect(deleteVehicleImage({ imageId: 4, vehicleId: 81 })).resolves.toEqual({ imageId: 4 });

    expect(apiMocks.patch).toHaveBeenCalledWith("/vehicles/81/images/4/primary");
    expect(apiMocks.delete).toHaveBeenCalledWith("/vehicles/81/images/4");
  });

  it("uploads a vehicle document with docType in query params", async () => {
    const file = new File(["title"], "title.pdf", { type: "application/pdf" });
    apiMocks.post.mockResolvedValue({ data: { data: { documentId: 9 }, status: "CREATED" } });

    await expect(
      uploadVehicleDocument({ docType: "TITLE", file, vehicleId: 81 }),
    ).resolves.toEqual({ documentId: 9 });

    const [url, formData, config] = apiMocks.post.mock.calls[0];
    expect(url).toBe("/vehicles/81/documents/upload-file");
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("file")).toBe(file);
    expect(config).toEqual({
      headers: { "Content-Type": "multipart/form-data" },
      params: { docType: "TITLE" },
    });
  });

  it("creates first, then uploads every image with only the first as primary", async () => {
    const images = [
      new File(["front"], "front.jpg", { type: "image/jpeg" }),
      new File(["rear"], "rear.jpg", { type: "image/jpeg" }),
    ];
    apiMocks.post.mockResolvedValue({
      data: { data: { vehicleId: 81 }, status: "CREATED" },
    });
    apiMocks.uploadImage.mockResolvedValue({ imageId: 5 });

    await expect(
      createVehicleWithImages({
        form: { makeId: "1", modelId: "10", vin: "98GV7DAPNLPEV1NKK" },
        images,
      }),
    ).resolves.toEqual({ vehicle: { vehicleId: 81 }, vehicleId: 81 });

    expect(apiMocks.uploadImage).toHaveBeenNthCalledWith(1, {
      file: images[0],
      isPrimary: true,
      vehicleId: 81,
    });
    expect(apiMocks.uploadImage).toHaveBeenNthCalledWith(2, {
      file: images[1],
      isPrimary: false,
      vehicleId: 81,
    });
    expect(apiMocks.post).toHaveBeenCalledTimes(1);
  });

  it("creates the vehicle before uploading its documents", async () => {
    const file = new File(["customs"], "customs.pdf", { type: "application/pdf" });
    apiMocks.post.mockResolvedValueOnce({
      data: { data: { vehicleId: 81 }, status: "CREATED" },
    }).mockResolvedValueOnce({
      data: { data: { documentId: 9 }, status: "CREATED" },
    });

    await createVehicleWithImages({
      documents: [{ docType: "CUSTOMS", file }],
      form: { makeId: "1", modelId: "10", vin: "98GV7DAPNLPEV1NKK" },
      images: [],
    });

    expect(apiMocks.post.mock.calls[0][0]).toBe("/vehicles/create");
    expect(apiMocks.post.mock.calls[1][0]).toBe("/vehicles/81/documents/upload-file");
    expect(apiMocks.post.mock.calls[1][2]).toEqual({
      headers: { "Content-Type": "multipart/form-data" },
      params: { docType: "CUSTOMS" },
    });
    expect(apiMocks.post).toHaveBeenCalledTimes(2);
  });
});
