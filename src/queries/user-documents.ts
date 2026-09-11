"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, fileSend } from "@/api/api";

export const USER_DOCUMENT_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type UserDocumentStatus = (typeof USER_DOCUMENT_STATUSES)[number];

export interface AdminUserDocumentsRequest {
  docType?: string;
  page?: number;
  search?: string;
  size?: number;
  status?: UserDocumentStatus | "";
  userId?: string | number;
}

export interface UserDocument {
  documentId?: number | string;
  id?: number | string;
  userId?: number | string;
  docType?: string;
  status?: string;
  fileName?: string;
  originalFileName?: string;
  fileUrl?: string;
  url?: string;
  downloadUrl?: string;
  rejectionReason?: string;
  reason?: string;
  reviewedByFirstName?: string;
  reviewedByLastName?: string;
  reviewedByOrgName?: string;
  userFirstName?: string;
  userLastName?: string;
  userOrgName?: string;
  createdAt?: string;
  uploadedAt?: string;
  user?: { firstname?: string; lastname?: string; email?: string; phone?: string };
}

export interface UserDocumentsPage {
  list: UserDocument[];
  page: number;
  size: number;
  pages: number;
  elements: number;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

function findList(value: unknown, depth = 0): UserDocument[] {
  if (Array.isArray(value)) return value as UserDocument[];
  const source = asRecord(value);
  if (!source || depth > 4) return [];
  for (const key of ["list", "content", "items", "documents", "dtoList", "data", "meta"]) {
    const result = findList(source[key], depth + 1);
    if (result.length || Array.isArray(source[key])) return result;
  }
  return [];
}

function findMeta(value: unknown, depth = 0): Record<string, unknown> {
  const source = asRecord(value);
  if (!source || depth > 4) return {};
  if (["pages", "totalPages", "elements", "totalElements", "number", "page"].some((key) => key in source)) return source;
  return findMeta(source.meta ?? source.data, depth + 1);
}

export async function fetchAdminUserDocuments({
  docType = "",
  page = 0,
  search = "",
  size = 20,
  status = "",
  userId,
}: AdminUserDocumentsRequest = {}): Promise<UserDocumentsPage> {
  const { data } = await api.get("/user-documents/admin", {
    params: {
      page,
      size,
      ...(status ? { status } : {}),
      ...(docType.trim() ? { docType: docType.trim() } : {}),
      ...(userId !== undefined && String(userId).trim() ? { userId: Number(userId) } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    },
  });
  const list = findList(data);
  const meta = findMeta(data);
  return {
    list,
    page: Number(meta.number ?? meta.page ?? page),
    size: Number(meta.size ?? size),
    pages: Number(meta.pages ?? meta.totalPages ?? (list.length < size ? page + 1 : page + 2)),
    elements: Number(meta.elements ?? meta.totalElements ?? list.length),
  };
}

export async function fetchMyUserDocuments(): Promise<UserDocument[]> {
  const { data } = await api.get("/user-documents/mine");
  return findList(data);
}

export async function uploadUserDocumentFile({
  docType,
  file,
}: {
  docType: string;
  file: File;
}): Promise<UserDocument> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await fileSend.post("/user-documents/upload-file", formData, {
    params: { docType },
  });

  return (data?.data ?? data) as UserDocument;
}

export async function approveUserDocument(documentId: number | string) {
  const { data } = await api.patch(`/user-documents/admin/${documentId}/approve`);
  return data?.data ?? data;
}

export async function rejectUserDocument({ documentId, reason }: { documentId: number | string; reason: string }) {
  const { data } = await api.patch(`/user-documents/admin/${documentId}/reject`, { reason: reason.trim() });
  return data?.data ?? data;
}

export function useAdminUserDocuments(request: AdminUserDocumentsRequest = {}) {
  const { docType = "", page = 0, search = "", size = 20, status = "", userId = "" } = request;
  return useQuery({
    queryKey: ["user-documents", "admin", page, size, status, docType, userId, search],
    queryFn: () => fetchAdminUserDocuments({ docType, page, search, size, status, userId }),
  });
}

function useDocumentDecision<T>(mutationFn: (variables: T) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-documents", "admin"] }) });
}

export function useApproveUserDocument() { return useDocumentDecision(approveUserDocument); }
export function useRejectUserDocument() { return useDocumentDecision(rejectUserDocument); }
