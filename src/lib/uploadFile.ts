import { api } from "@/api/api";

export type DocType = "PASSPORT" | "ID_CARD";

export interface UserDocumentUploadPayload {
  docType: DocType;
  fileUrl: string;
}

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  token: string;
  status: string;
  errors?: Record<string, string>;
  meta?: Record<string, unknown>;
  data: T;
}

// TODO: point this at your real raw-file upload / presigned URL endpoint.
export async function uploadFileAndGetUrl(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // Don't set Content-Type manually — axios/the browser needs to add the
  // multipart boundary itself, which a hardcoded header string won't include.
  const { data } = await api.post<ApiEnvelope<{ url: string }>>(
    "/files/upload",
    formData
  );

  return data.data.url;
}