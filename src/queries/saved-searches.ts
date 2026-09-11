"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api/api";

export interface SavedSearch {
  createdAt?: unknown;
  criteria?: unknown;
  filters?: unknown;
  id?: string | number;
  keyword?: unknown;
  name?: unknown;
  notify?: boolean;
  query?: unknown;
  searchId?: string | number;
  savedSearchId?: string | number;
  searchTerm?: unknown;
  title?: unknown;
  [key: string]: unknown;
}

export interface SavedSearchesPage {
  items: SavedSearch[];
  meta?: Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function findList(value: unknown, visited = new Set<object>()): SavedSearch[] {
  if (Array.isArray(value))
    return value.filter(
      (item): item is SavedSearch => Boolean(asRecord(item)),
    );

  const record = asRecord(value);
  if (!record || visited.has(record)) return [];
  visited.add(record);

  for (const key of [
    "data",
    "meta",
    "list",
    "content",
    "items",
    "dtoList",
    "savedSearches",
  ]) {
    const list = findList(record[key], visited);
    if (list.length) return list;
  }
  return [];
}

export function normalizeSavedSearches(value: unknown): SavedSearchesPage {
  const root = asRecord(value);
  const payload = asRecord(root?.data) ?? root;
  const meta = asRecord(payload?.meta) ?? asRecord(root?.meta) ?? undefined;

  return { items: findList(value), meta };
}

export async function fetchMySavedSearches(
  page = 0,
  size = 20,
): Promise<SavedSearchesPage> {
  const response = await api.get("/saved-searches/mine", {
    params: { page, size },
  });
  return normalizeSavedSearches(response.data);
}

export function useMySavedSearches(
  page = 0,
  size = 20,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryKey: ["saved-searches", "mine", page, size],
    queryFn: () => fetchMySavedSearches(page, size),
    staleTime: 60_000,
  });
}

// ==================== CREATE ====================

export interface CreateSavedSearchInput {
  filters?: Record<string, unknown>;
  notify?: boolean;
}

export async function createSavedSearch(
  input: CreateSavedSearchInput,
): Promise<unknown> {
  const response = await api.post("/saved-searches/create", input);
  return response.data;
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSavedSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["saved-searches", "mine"],
      });
    },
  });
}

// ==================== UPDATE ====================

export interface UpdateSavedSearchInput {
  filters?: Record<string, unknown>;
  notify?: boolean;
}

export async function updateSavedSearch(
  searchId: string | number,
  input: UpdateSavedSearchInput,
): Promise<unknown> {
  const response = await api.put(
    `/saved-searches/${encodeURIComponent(String(searchId))}`,
    input,
  );
  return response.data;
}

export function useUpdateSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      searchId,
      ...input
    }: UpdateSavedSearchInput & { searchId: string | number }) =>
      updateSavedSearch(searchId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["saved-searches", "mine"],
      });
    },
  });
}

// ==================== DELETE ====================

export async function deleteSavedSearch(
  searchId: string | number,
): Promise<unknown> {
  const response = await api.delete(
    `/saved-searches/${encodeURIComponent(String(searchId))}`,
  );
  return response.data;
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSavedSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["saved-searches", "mine"],
      });
    },
  });
}
