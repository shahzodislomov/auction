"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";
import {
  REFERENCE_CONTRACTS,
  MOCK_VEHICLE_MAKES,
  buildModelsByMakeQueryKey,
  filterMockModelsByMake,
  mapReferenceOptions,
} from "@/features/user-v2/reference-data.mjs";
import { getVehicleApiMode } from "@/features/user-v2/vehicle.mjs";
import { findCanonicalRegion, getCanonicalRegionOptions } from "@/lib/regions";

export const fetchRegions = async () => {
  const response = await api.get("/gov/regions");
  return response.data?.data || [];
};

export const fetchDistrictsByRegion = async (regionId) => {
  const normalizedRegionId = String(regionId ?? "").trim();

  if (!normalizedRegionId) {
    throw new Error("reference.contract.region_id_required");
  }

  const response = await api.get(
    `/gov/district-of-region/${encodeURIComponent(normalizedRegionId)}`,
  );
  return response.data?.data || [];
};

export const useActiveRegions = (locale = "uz") => {
  const query = useQuery({
    queryKey: ["regions", "active"],
    queryFn: fetchRegions,
    staleTime: 5 * 60 * 1000,
  });

  const rawOptions = mapReferenceOptions(query.data || [], locale);
  const options =
    rawOptions.length > 0
      ? rawOptions.map((opt) => {
          const canonical =
            findCanonicalRegion(opt.raw?.id ?? opt.value) ||
            findCanonicalRegion(opt.label) ||
            findCanonicalRegion(opt.raw?.nameUz) ||
            findCanonicalRegion(opt.raw?.nameRu) ||
            findCanonicalRegion(opt.raw?.nameEn);

          if (!canonical) return opt;

          const label =
            locale === "ru"
              ? canonical.ru
              : locale === "en"
                ? canonical.en
                : canonical.uz;

          return {
            ...opt,
            label,
          };
        })
      : getCanonicalRegionOptions(locale).map((opt) => ({
          value: opt.value,
          label: opt.label,
          raw: { name: opt.label },
        }));

  return {
    ...query,
    options,
    isContractAvailable: REFERENCE_CONTRACTS.regions.available,
  };
};

export const useDistrictsByRegion = (regionId, locale = "uz") => {
  const normalizedRegionId = String(regionId ?? "").trim();
  const query = useQuery({
    queryKey: ["districts", "byRegion", normalizedRegionId],
    queryFn: () => fetchDistrictsByRegion(normalizedRegionId),
    enabled: Boolean(normalizedRegionId),
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    options: mapReferenceOptions(query.data || [], locale),
    isContractAvailable: REFERENCE_CONTRACTS.districts.available,
  };
};

export const useActiveVehicleMakes = (locale = "uz") => {
  if (getVehicleApiMode() === "mock") {
    return {
      data: MOCK_VEHICLE_MAKES,
      options: mapReferenceOptions(MOCK_VEHICLE_MAKES, locale),
      isLoading: false,
      isError: false,
      error: null,
      isContractAvailable: true,
      isMock: true,
      unavailableReason: null,
      refetch: () => Promise.resolve({ data: MOCK_VEHICLE_MAKES }),
    };
  }

  return {
    data: undefined,
    options: [],
    isLoading: false,
    isError: false,
    error: null,
    isContractAvailable: REFERENCE_CONTRACTS.vehicleMakes.available,
    isMock: false,
    unavailableReason: REFERENCE_CONTRACTS.vehicleMakes.reason,
    refetch: () => Promise.resolve({ data: undefined }),
  };
};

export const useVehicleModelsByMake = (makeId, locale = "uz") => {
  if (getVehicleApiMode() === "mock") {
    const data = filterMockModelsByMake(makeId);

    return {
      data,
      options: mapReferenceOptions(data, locale),
      isLoading: false,
      isError: false,
      error: null,
      queryKey: buildModelsByMakeQueryKey(makeId),
      isContractAvailable: true,
      isMock: true,
      unavailableReason: null,
      refetch: () => Promise.resolve({ data }),
    };
  }

  return {
    data: undefined,
    options: [],
    isLoading: false,
    isError: false,
    error: null,
    queryKey: buildModelsByMakeQueryKey(makeId),
    isContractAvailable: REFERENCE_CONTRACTS.vehicleModels.available,
    isMock: false,
    unavailableReason: REFERENCE_CONTRACTS.vehicleModels.reason,
    refetch: () => Promise.resolve({ data: undefined }),
  };
};
