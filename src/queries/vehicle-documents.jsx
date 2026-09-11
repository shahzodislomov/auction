"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  VEHICLE_DOCUMENT_CONTRACTS,
} from "@/features/user-v2/vehicle-documents.mjs";
import { getVehicleApiMode } from "@/features/user-v2/vehicle.mjs";

const MOCK_BASE = "/api/mock/vehicles";

export const isVehicleDocumentMockMode = () => getVehicleApiMode() === "mock";

export const getVehicleDocumentContractState = () => {
  if (isVehicleDocumentMockMode()) {
    return {
      isContractAvailable: true,
      isMock: true,
      unavailableReason: null,
    };
  }

  return {
    isContractAvailable: VEHICLE_DOCUMENT_CONTRACTS.realVehicleDocuments.available,
    isMock: false,
    unavailableReason: VEHICLE_DOCUMENT_CONTRACTS.realVehicleDocuments.reason,
  };
};

export async function fetchVehicleDocuments(vehicleId) {
  if (!isVehicleDocumentMockMode()) {
    throw new Error(VEHICLE_DOCUMENT_CONTRACTS.realVehicleDocuments.reason);
  }

  const response = await fetch(`${MOCK_BASE}/${vehicleId}/documents`);
  const body = await parseVehicleDocumentResponse(response);
  return body?.data || [];
}

export async function uploadVehicleDocument({ vehicleId, type, file, shouldFail = false }) {
  if (!isVehicleDocumentMockMode()) {
    throw new Error(VEHICLE_DOCUMENT_CONTRACTS.realVehicleDocuments.reason);
  }

  const formData = new FormData();
  formData.append("type", type);
  formData.append("document", file);
  if (shouldFail) formData.append("fail", "true");

  const response = await fetch(`${MOCK_BASE}/${vehicleId}/documents`, {
    method: "POST",
    body: formData,
  });
  const body = await parseVehicleDocumentResponse(response);
  return body?.data;
}

export async function deleteVehicleDocument({ vehicleId, documentId }) {
  if (!isVehicleDocumentMockMode()) {
    throw new Error(VEHICLE_DOCUMENT_CONTRACTS.realVehicleDocuments.reason);
  }

  const response = await fetch(`${MOCK_BASE}/${vehicleId}/documents/${documentId}`, {
    method: "DELETE",
  });
  const body = await parseVehicleDocumentResponse(response);
  return body?.data || [];
}

export async function downloadVehicleDocument({ vehicleId, documentId }) {
  if (!isVehicleDocumentMockMode()) {
    throw new Error(VEHICLE_DOCUMENT_CONTRACTS.realVehicleDocuments.reason);
  }

  const response = await fetch(`${MOCK_BASE}/${vehicleId}/documents/${documentId}/download`);

  if (!response.ok) {
    await parseVehicleDocumentResponse(response);
  }

  return response.blob();
}

export async function setVehicleDocumentReviewStatus({ vehicleId, documentId, status, rejectionReason }) {
  if (!isVehicleDocumentMockMode()) {
    throw new Error(VEHICLE_DOCUMENT_CONTRACTS.realVehicleDocuments.reason);
  }

  const response = await fetch(`${MOCK_BASE}/${vehicleId}/documents/${documentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, rejectionReason }),
  });
  const body = await parseVehicleDocumentResponse(response);
  return body?.data;
}

export const useVehicleDocuments = (vehicleId) => {
  const contract = getVehicleDocumentContractState();
  const query = useQuery({
    queryKey: ["vehicleDocuments", String(vehicleId || "")],
    queryFn: () => fetchVehicleDocuments(vehicleId),
    enabled: contract.isContractAvailable && Boolean(vehicleId),
    staleTime: 60 * 1000,
    retry: false,
  });

  return {
    ...query,
    ...contract,
  };
};

export const useUploadVehicleDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadVehicleDocument,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleDocuments", String(variables.vehicleId || "")] });
    },
  });
};

export const useDeleteVehicleDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVehicleDocument,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleDocuments", String(variables.vehicleId || "")] });
    },
  });
};

export const useDownloadVehicleDocument = () => useMutation({
  mutationFn: downloadVehicleDocument,
});

export const useSetVehicleDocumentReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setVehicleDocumentReviewStatus,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleDocuments", String(variables.vehicleId || "")] });
    },
  });
};

async function parseVehicleDocumentResponse(response) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body?.message || "Vehicle document request failed");
    error.response = {
      status: response.status,
      data: body,
    };
    throw error;
  }

  return body;
}
