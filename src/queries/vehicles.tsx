"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buildVehicleCreatePayload,
} from "@/features/user-v2/vehicle.mjs";
import { api } from "@/api/api";
import { uploadVehicleImage as uploadLiveVehicleImage } from "@/queries/vehicle-images";

// ==================== TYPES ====================

export interface Vehicle {
  vehicleId: number;
  sellerId?: number;
  ownerId?: number;
  userId?: number;
  makeId: number;
  makeName: string;
  modelId: number;
  modelName: string;
  year: number;
  description: string;
  color: string;
  vin: string;
  region: string;
  createdAt: string;
  updatedAt: string;
  mileage?: number;
  engineVolume?: number;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  bodyType?: string;
  conditionGrade?: string;
  imageUrls?: string[];
  images?: VehicleImage[];
  documents?: VehicleDocument[];
}

export interface VehicleImage {
  id?: string | number;
  imageId?: string | number;
  imageUrl?: string;
  fileUrl?: string;
  url?: string;
  isPrimary?: boolean;
}

export interface VehicleDocument {
  id?: string | number;
  documentId?: string | number;
  docType?: string;
  type?: string;
  fileName?: string;
  name?: string;
  fileUrl?: string;
  url?: string;
}

export interface VehiclesMeta {
  pages: number;
  elements: number;
  list: Vehicle[];
}

export interface VehiclesResponse {
  meta: VehiclesMeta;
}

export interface OwnerVehiclesRequest {
  bodyType?: string;
  page?: number;
  sellerId?: string | number;
  size?: number;
  search?: string;
  type?: string;
}

// The shared `api` client's envelope is inconsistent in practice: some
// responses arrive as { data: {...} } and others (confirmed for GET
// /vehicles, via a response interceptor further up the chain) arrive
// already unwrapped as just {...}. Rather than hardcode one assumption per
// endpoint, unwrap() picks the inner `data` when present and otherwise
// returns the value as-is, so call sites work with either shape.
function unwrap<T = unknown>(value: unknown): T {
  if (value && typeof value === "object" && "data" in (value as Record<string, unknown>)) {
    return (value as Record<string, unknown>).data as T;
  }
  return value as T;
}

function unwrapList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  for (const key of [
    "data",
    "list",
    "content",
    "dtoList",
    "items",
    "images",
    "documents",
    "vehicleImages",
    "vehicleDocuments",
  ]) {
    const result = unwrapList<T>(record[key]);
    if (result.length) return result;
  }
  return [];
}

// ==================== VEHICLES ====================

export const fetchOwnerVehicles = async (
  request: OwnerVehiclesRequest = {},
): Promise<VehiclesResponse> => {
  const { bodyType = "", page = 0, sellerId, size = 20, search = "", type = "" } = request;
  const { data } = await api.get("/vehicles", {
    params: {
      page,
      ...(sellerId !== undefined && String(sellerId).trim() ? { sellerId } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      size,
      ...(bodyType.trim() ? { bodyType: bodyType.trim() } : {}),
      ...(type.trim() ? { type: type.trim() } : {}),
    },
  });

  const payload = unwrap<{ meta?: VehiclesMeta }>(data);

  if (!payload?.meta || !Array.isArray(payload.meta.list)) {
    console.warn("[fetchOwnerVehicles] unexpected /vehicles response shape:", data);
    return { meta: { pages: 0, elements: 0, list: [] } };
  }

  const list = await Promise.all(
    payload.meta.list.map(async (vehicle) => {
      const documents = await fetchVehicleDocuments(vehicle.vehicleId).catch(() => []);
      return {
        ...vehicle,
        documents,
      };
    }),
  );

  return { meta: { ...payload.meta, list } };
};

export const fetchVehicleDetail = async (
  vehicleId: string | number,
): Promise<Vehicle> => {
  const [{ data }, imagesResult, documentsResult] = await Promise.all([
    api.get(`/vehicles/${vehicleId}`),
    fetchVehicleImages(vehicleId).catch(() => []),
    fetchVehicleDocuments(vehicleId).catch(() => []),
  ]);
  const vehicle = unwrap<Vehicle>(data);
  const finalImages = (imagesResult && imagesResult.length > 0)
    ? imagesResult
    : (vehicle.imageUrls?.map((url) => ({ url, isPrimary: false })) ?? []);

  return {
    ...vehicle,
    images: finalImages,
    documents: documentsResult,
  };
};

export const createVehicle = async ({ form }: { form: Record<string, unknown> }) => {
  const payload = buildVehicleCreatePayload(form);

  const { data } = await api.post("/vehicles/create", payload);

  const status =
    data && typeof data === "object" && "status" in data
      ? String((data as { status?: unknown }).status ?? "").toUpperCase()
      : "";
  if (status && !["OK", "CREATED", "SUCCESS"].includes(status)) {
    throw new Error(
      (data as { message?: string }).message ||
        "The server did not confirm vehicle creation.",
    );
  }

  return unwrap(data);
};

export function resolveCreatedVehicleId(response: unknown): string | number | null {
  const queue: Array<{ value: unknown; depth: number; vehicleContext: boolean }> = [
    { value: response, depth: 0, vehicleContext: false },
  ];
  while (queue.length) {
    const current = queue.shift();
    if (!current || current.depth > 5 || !current.value || typeof current.value !== "object") continue;
    const record = current.value as Record<string, unknown>;
    const directId = record.vehicleId ?? (current.vehicleContext ? record.id : undefined);
    if (typeof directId === "number" || typeof directId === "string") return directId;
    for (const key of ["vehicle", "data", "result", "meta"]) {
      if (record[key] && typeof record[key] === "object") {
        queue.push({ value: record[key], depth: current.depth + 1, vehicleContext: current.vehicleContext || key === "vehicle" });
      }
    }
  }
  const root = response && typeof response === "object" ? response as Record<string, unknown> : null;
  const fallbackId = root?.id;
  if (typeof fallbackId === "number" || typeof fallbackId === "string") return fallbackId;
  return null;
}

export const uploadVehicleAssets = async ({
  documents = [],
  images,
  vehicleId,
}: {
  documents?: Array<{ docType: string; file: File }>;
  images: File[];
  vehicleId: string | number;
}) => {
  for (const [index, file] of images.entries()) {
    await uploadLiveVehicleImage({ file, isPrimary: index === 0, vehicleId });
  }

  for (const document of documents) {
    await uploadVehicleDocument({ docType: document.docType, file: document.file, vehicleId });
  }

  return { vehicleId };
};

export const createVehicleWithImages = async ({
  form,
  images,
  documents = [],
}: {
  form: Record<string, unknown>;
  images: File[];
  documents?: Array<{ docType: string; file: File }>;
}) => {
  const vehicle = await createVehicle({ form });
  const vehicleId = resolveCreatedVehicleId(vehicle);

  if (!vehicleId) {
    throw new Error("Vehicle was created, but its identifier was not returned.");
  }

  await uploadVehicleAssets({ documents, images, vehicleId });

  return { vehicle, vehicleId };
};

// Swagger PUT /vehicles/{vehicleId} expects the complete vehicle DTO.
export const updateVehicle = async ({
  id,
  form,
}: {
  id: string | number;
  form: Record<string, unknown>;
}) => {
  const payload = buildVehicleCreatePayload(form);

  const { data } = await api.put(`/vehicles/${id}`, payload);

  return unwrap(data);
};

// ==================== LOOKUPS ====================

export interface VehicleLookupOption {
  id: string | number;
  name: string;
}

function lookupItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  for (const key of ["list", "content", "dtoList", "items", "data"]) {
    const items = lookupItems(record[key]);
    if (items.length) return items;
  }
  return [];
}

export function normalizeVehicleLookup(
  value: unknown,
  type: "make" | "model",
): VehicleLookupOption[] {
  const idKeys = type === "make" ? ["makeId", "id"] : ["modelId", "id"];
  const nameKeys = type === "make"
    ? ["makeName", "name", "title"]
    : ["modelName", "name", "title"];

  return lookupItems(value).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const id = idKeys.map((key) => record[key]).find(
      (candidate) => typeof candidate === "number" || typeof candidate === "string",
    );
    const name = nameKeys.map((key) => record[key]).find(
      (candidate) => typeof candidate === "string" && candidate.trim(),
    );
    return id === undefined || typeof name !== "string"
      ? []
      : [{ id: id as string | number, name: name.trim() }];
  });
}

export const fetchVehicleMakes = async (): Promise<VehicleLookupOption[]> => {
  const { data } = await api.get("/vehicles/makes");

  return normalizeVehicleLookup(unwrap(data), "make");
};

export const fetchVehicleModels = async (
  makeId: string | number,
): Promise<VehicleLookupOption[]> => {
  const { data } = await api.get("/vehicles/models", { params: { makeId } });

  return normalizeVehicleLookup(unwrap(data), "model");
};

// ==================== IMAGES ====================

export async function fetchVehicleImages(
  vehicleId: string | number,
): Promise<VehicleImage[]> {
  const { data } = await api.get(`/vehicles/${vehicleId}/images`);

  return unwrapList<VehicleImage>(unwrap(data));
}

export const uploadVehicleImage = async ({
  vehicleId,
  file,
  isPrimary = false,
}: {
  vehicleId: string | number;
  file: File;
  isPrimary?: boolean;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(
    `/vehicles/${vehicleId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { isPrimary: Boolean(isPrimary) },
    }
  );

  return unwrap(data);
};

export const setPrimaryVehicleImage = async ({
  vehicleId,
  imageId,
}: {
  vehicleId: string | number;
  imageId: string | number;
}) => {
  const { data } = await api.patch(
    `/vehicles/${vehicleId}/images/${imageId}/primary`
  );

  return unwrap(data);
};

export const deleteVehicleImage = async ({
  vehicleId,
  imageId,
}: {
  vehicleId: string | number;
  imageId: string | number;
}) => {
  const { data } = await api.delete(
    `/vehicles/${vehicleId}/images/${imageId}`
  );

  return unwrap(data);
};

// ==================== DOCUMENTS ====================

export async function fetchVehicleDocuments(
  vehicleId: string | number
): Promise<VehicleDocument[]> {
  const { data } = await api.get(
    `/vehicles/${vehicleId}/documents`
  );

  return unwrapList<VehicleDocument>(unwrap(data));
}

export const uploadVehicleDocument = async ({
  vehicleId,
  docType,
  file,
}: {
  vehicleId: string | number;
  docType: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(
    `/vehicles/${vehicleId}/documents/upload-file`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { docType },
    }
  );

  return unwrap(data);
};

// ==================== REACT QUERY ====================

export const useOwnerVehicles = (request: OwnerVehiclesRequest = {}) => {
  const { bodyType = "", page = 0, sellerId, size = 20, search = "", type = "" } = request;
  return useQuery({
    queryKey: ["vehicles", "owner", sellerId, page, size, search, type, bodyType],
    queryFn: () => fetchOwnerVehicles({ bodyType, page, sellerId, size, search, type }),
    staleTime: 60000,
  });
};

export const useVehicleDetail = (vehicleId: string | number | null | undefined) => {
  return useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetchVehicleDetail(vehicleId!),
    enabled: !!vehicleId,
  });
};

export const useVehicleMakes = () =>
  useQuery({
    queryKey: ["vehicle-makes"],
    queryFn: fetchVehicleMakes,
  });

export const useVehicleModels = (makeId: string | number | null | undefined) =>
  useQuery({
    queryKey: ["vehicle-models", makeId],
    queryFn: () => fetchVehicleModels(makeId!),
    enabled: makeId !== null && makeId !== undefined && String(makeId).trim() !== "",
  });

export const useVehicleImages = (vehicleId: string | number | null | undefined) =>
  useQuery({
    queryKey: ["vehicle-images", vehicleId],
    queryFn: () => fetchVehicleImages(vehicleId!),
    enabled: !!vehicleId,
  });

export const useVehicleDocuments = (vehicleId: string | number | null | undefined) =>
  useQuery({
    queryKey: ["vehicle-documents", vehicleId],
    queryFn: () => fetchVehicleDocuments(vehicleId!),
    enabled: !!vehicleId,
  });

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },
  });
};

export const useCreateVehicleWithImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVehicleWithImages,
    onSuccess: ({ vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["vehicleImages", String(vehicleId)] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-documents", vehicleId] });
    },
  });
};

export const useUploadVehicleAssets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadVehicleAssets,
    onSuccess: ({ vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["vehicleImages", String(vehicleId)] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-documents", vehicleId] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVehicle,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });

      queryClient.invalidateQueries({
        queryKey: ["vehicle", variables.id],
      });
    },
  });
};

export const useUploadVehicleImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadVehicleImage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["vehicle-images", variables.vehicleId],
      });
    },
  });
};

export const useDeleteVehicleImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVehicleImage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle-images", variables.vehicleId],
      });
    },
  });
};

export const useSetPrimaryVehicleImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setPrimaryVehicleImage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle-images", variables.vehicleId],
      });
    },
  });
};

export const useUploadVehicleDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadVehicleDocument,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["vehicle-documents", variables.vehicleId],
      });
    },
  });
};

export interface VinDecodeResult {
  makeId?: number;
  makeName?: string;
  modelId?: number;
  modelName?: string;
  year?: number | string;
  engineVolume?: number | string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  drivetrain?: string;
  [key: string]: unknown;
}

export const decodeVin = async (vin: string): Promise<VinDecodeResult> => {
  const response = await api.get("/vehicles/vin-decode", {
    params: { vin: vin.trim().toUpperCase() },
  });
  return response.data?.data ?? response.data;
};

export const useDecodeVin = () => {
  return useMutation({
    mutationFn: decodeVin,
  });
};

