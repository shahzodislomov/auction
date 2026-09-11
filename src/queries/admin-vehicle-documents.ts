"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";

export const VEHICLE_DOCUMENT_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type VehicleDocumentStatus = (typeof VEHICLE_DOCUMENT_STATUSES)[number];
export interface AdminVehicleDocument {
  documentId?: string | number; docId?: string | number; id?: string | number;
  vehicleId?: string | number; docType?: string; status?: string;
  fileName?: string; originalFileName?: string; fileUrl?: string; downloadUrl?: string; url?: string;
  rejectionReason?: string; reason?: string; createdAt?: string; uploadedAt?: string;
  vehicle?: { vehicleId?: string | number; makeName?: string; modelName?: string; year?: number; vin?: string };
}
export interface AdminVehicleDocumentsPage { list: AdminVehicleDocument[]; page: number; size: number; pages: number; elements: number }
const record = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
function listFrom(value: unknown, depth = 0): AdminVehicleDocument[] { if (Array.isArray(value)) return value as AdminVehicleDocument[]; const source = record(value); if (!source || depth > 4) return []; for (const key of ["list", "content", "items", "documents", "dtoList", "data", "meta"]) { const list = listFrom(source[key], depth + 1); if (list.length || Array.isArray(source[key])) return list; } return []; }
function metaFrom(value: unknown, depth = 0): Record<string, unknown> { const source = record(value); if (!source || depth > 4) return {}; if (["pages", "totalPages", "elements", "totalElements", "page", "number"].some((key) => key in source)) return source; return metaFrom(source.meta ?? source.data, depth + 1); }

export async function fetchAdminVehicleDocuments({ page = 0, size = 20, status = "" }: { page?: number; size?: number; status?: VehicleDocumentStatus | "" } = {}): Promise<AdminVehicleDocumentsPage> {
  const { data } = await api.get("/admin/vehicle-documents", { params: { page, size, ...(status ? { status } : {}) } });
  const list = listFrom(data); const meta = metaFrom(data);
  return { list, page: Number(meta.page ?? meta.number ?? page), size: Number(meta.size ?? size), pages: Number(meta.pages ?? meta.totalPages ?? (list.length < size ? page + 1 : page + 2)), elements: Number(meta.elements ?? meta.totalElements ?? list.length) };
}
export async function approveVehicleDocument(docId: string | number) { const { data } = await api.patch(`/admin/vehicle-documents/${docId}/approve`); return data?.data ?? data; }
export async function rejectVehicleDocument({ docId, reason }: { docId: string | number; reason: string }) { const { data } = await api.patch(`/admin/vehicle-documents/${docId}/reject`, { reason: reason.trim() }); return data?.data ?? data; }
export function useAdminVehicleDocuments(page = 0, size = 20, status: VehicleDocumentStatus | "" = "") { return useQuery({ queryKey: ["vehicle-documents", "admin", page, size, status], queryFn: () => fetchAdminVehicleDocuments({ page, size, status }) }); }
function useDecision<T>(mutationFn: (variables: T) => Promise<unknown>) { const client = useQueryClient(); return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: ["vehicle-documents", "admin"] }) }); }
export function useApproveVehicleDocument() { return useDecision(approveVehicleDocument); }
export function useRejectVehicleDocument() { return useDecision(rejectVehicleDocument); }
