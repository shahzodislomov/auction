"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";
import {
  VEHICLE_IMAGE_CONTRACTS,
  buildVehicleImageOrderPayload,
} from "@/features/user-v2/vehicle-images.mjs";
import { getVehicleApiMode } from "@/features/user-v2/vehicle.mjs";

const MOCK_BASE = "/api/mock/vehicles";

export const isVehicleImageMockMode = () => getVehicleApiMode() === "mock";
export const isVehicleImageRealMode = () => getVehicleApiMode() === "real";

export const getVehicleImageContractState = () => {
  if (isVehicleImageMockMode()) {
    return {
      isContractAvailable: true,
      isMock: true,
      unavailableReason: null,
    };
  }

  return {
    isContractAvailable: VEHICLE_IMAGE_CONTRACTS.realVehicleImages.available,
    isMock: false,
    unavailableReason: VEHICLE_IMAGE_CONTRACTS.realVehicleImages.reason,
  };
};

export async function fetchVehicleImages(vehicleId) {
  if (isVehicleImageRealMode()) {
    const response = await api.get(`/vehicles/${vehicleId}/images`);
    return response.data?.data ?? response.data ?? [];
  }

  if (!isVehicleImageMockMode()) {
    throw new Error(VEHICLE_IMAGE_CONTRACTS.realVehicleImages.reason);
  }

  const response = await fetch(`${MOCK_BASE}/${vehicleId}/images`);
  const body = await parseVehicleImageResponse(response);
  return body?.data || [];
}

export async function uploadVehicleImage({ vehicleId, file, isPrimary = false, shouldFail = false }) {
  if (isVehicleImageRealMode()) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/vehicles/${vehicleId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { isPrimary: Boolean(isPrimary) },
    });

    return response.data?.data ?? response.data;
  }

  if (!isVehicleImageMockMode()) {
    throw new Error(VEHICLE_IMAGE_CONTRACTS.realVehicleImages.reason);
  }

  const formData = new FormData();
  formData.append("image", file);
  if (shouldFail) formData.append("fail", "true");

  const response = await fetch(`${MOCK_BASE}/${vehicleId}/images`, {
    method: "POST",
    body: formData,
  });
  const body = await parseVehicleImageResponse(response);
  return body?.data;
}

export async function deleteVehicleImage({ vehicleId, imageId }) {
  if (isVehicleImageRealMode()) {
    const response = await api.delete(`/vehicles/${vehicleId}/images/${imageId}`);
    return response.data?.data ?? response.data ?? [];
  }

  if (!isVehicleImageMockMode()) {
    throw new Error(VEHICLE_IMAGE_CONTRACTS.realVehicleImages.reason);
  }

  const response = await fetch(`${MOCK_BASE}/${vehicleId}/images/${imageId}`, {
    method: "DELETE",
  });
  const body = await parseVehicleImageResponse(response);
  return body?.data || [];
}

export async function setVehiclePrimaryImage({ vehicleId, imageId }) {
  if (isVehicleImageRealMode()) {
    const response = await api.patch(`/vehicles/${vehicleId}/images/${imageId}/primary`);
    return response.data?.data ?? response.data ?? [];
  }

  if (!isVehicleImageMockMode()) {
    throw new Error(VEHICLE_IMAGE_CONTRACTS.realVehicleImages.reason);
  }

  const response = await fetch(`${MOCK_BASE}/${vehicleId}/images/${imageId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "SET_PRIMARY" }),
  });
  const body = await parseVehicleImageResponse(response);
  return body?.data || [];
}

export async function reorderVehicleImages({ vehicleId, images }) {
  if (!isVehicleImageMockMode()) {
    throw new Error(VEHICLE_IMAGE_CONTRACTS.realVehicleImages.reason);
  }

  const response = await fetch(`${MOCK_BASE}/${vehicleId}/images/order`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images: buildVehicleImageOrderPayload(images) }),
  });
  const body = await parseVehicleImageResponse(response);
  return body?.data || [];
}

export const useVehicleImages = (vehicleId) => {
  const contract = getVehicleImageContractState();
  try {
    const query = useQuery({
      queryKey: ["vehicleImages", String(vehicleId || "")],
      queryFn: () => fetchVehicleImages(vehicleId),
      enabled: contract.isContractAvailable && Boolean(vehicleId),
      staleTime: 60 * 1000,
      retry: false,
    });
    return {
      ...query,
      ...contract,
    };
  } catch {
    return { data: [], isLoading: false, isError: false, ...contract };
  }
};

export const useUploadVehicleImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadVehicleImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleImages", String(variables.vehicleId || "")] });
    },
  });
};

export const useDeleteVehicleImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVehicleImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleImages", String(variables.vehicleId || "")] });
    },
  });
};

export const useSetVehiclePrimaryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setVehiclePrimaryImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleImages", String(variables.vehicleId || "")] });
    },
  });
};

export const useReorderVehicleImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderVehicleImages,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleImages", String(variables.vehicleId || "")] });
    },
  });
};

async function parseVehicleImageResponse(response) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body?.message || "Vehicle image request failed");
    error.response = {
      status: response.status,
      data: body,
    };
    throw error;
  }

  return body;
}
