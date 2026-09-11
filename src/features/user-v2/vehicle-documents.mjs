import { hasAnyRole, hasUserRole } from "./roles.mjs";

export const VEHICLE_DOCUMENT_TYPES = {
  TITLE: "TITLE",
  CUSTOMS: "CUSTOMS",
  INSPECTION: "INSPECTION",
};

export const VEHICLE_DOCUMENT_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export const VEHICLE_DOCUMENT_CONTRACTS = {
  realVehicleDocuments: {
    available: false,
    reason: "vehicle_documents.contract.unavailable",
  },
  mockVehicleDocuments: {
    available: true,
    reason: "vehicle_documents.contract.mock_enabled",
  },
};

export const VEHICLE_DOCUMENT_POLICY = {
  allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  maxBytes: 10 * 1024 * 1024,
};

export function getVehicleDocumentRequirements() {
  return {
    requiredTypes: [VEHICLE_DOCUMENT_TYPES.TITLE, VEHICLE_DOCUMENT_TYPES.CUSTOMS],
    optionalTypes: [VEHICLE_DOCUMENT_TYPES.INSPECTION],
  };
}

export function validateVehicleDocumentsForReview(documents = []) {
  const { requiredTypes, optionalTypes } = getVehicleDocumentRequirements();
  const byType = new Map(documents.map((document) => [document.type, document]));
  const blockingTypes = requiredTypes.filter((type) => {
    const document = byType.get(type);
    return !document || document.status === VEHICLE_DOCUMENT_STATUSES.REJECTED;
  });

  return {
    ready: blockingTypes.length === 0,
    blockingTypes,
    optionalTypes,
  };
}

export function buildVehicleDocumentStatusView(document = {}) {
  switch (document.status) {
    case VEHICLE_DOCUMENT_STATUSES.APPROVED:
      return {
        severity: "success",
        labelId: "vehicle_documents.status.APPROVED",
        ctaId: null,
        rejectionReason: null,
      };
    case VEHICLE_DOCUMENT_STATUSES.REJECTED:
      return {
        severity: "error",
        labelId: "vehicle_documents.status.REJECTED",
        ctaId: "vehicle_documents.replace_resubmit",
        rejectionReason: document.rejectionReason || null,
      };
    case VEHICLE_DOCUMENT_STATUSES.PENDING:
    default:
      return {
        severity: "warning",
        labelId: "vehicle_documents.status.PENDING",
        ctaId: null,
        rejectionReason: null,
      };
  }
}

export function canReplaceVehicleDocument(document = {}) {
  return document.status !== VEHICLE_DOCUMENT_STATUSES.APPROVED;
}

export function canDeleteVehicleDocument(document = {}) {
  return document.status !== VEHICLE_DOCUMENT_STATUSES.APPROVED;
}

export function canViewPrivateVehicleDocument(document = {}, user = {}) {
  if (!document.canDownload) return false;

  const userId = user.id || user.userId;
  const isOwner = String(document.ownerId || "") === String(userId || "");

  return hasAnyRole(user, ["ADMIN", "MODERATOR"]) || (isOwner && hasUserRole(user));
}

export function prepareVehicleDocumentRetry(document) {
  return {
    ...document,
    status: "QUEUED",
    progress: 0,
    error: null,
  };
}

export function validateVehicleDocumentFile(file, policy = VEHICLE_DOCUMENT_POLICY) {
  if (!file) return { valid: false, reason: "vehicle_documents.upload.required" };

  if (
    Array.isArray(policy.allowedMimeTypes) &&
    policy.allowedMimeTypes.length > 0 &&
    !policy.allowedMimeTypes.includes(file.type)
  ) {
    return { valid: false, reason: "vehicle_documents.upload.invalid_type" };
  }

  if (policy.maxBytes && Number(file.size) > policy.maxBytes) {
    return { valid: false, reason: "vehicle_documents.upload.too_large" };
  }

  return { valid: true, reason: null };
}

export function mapVehicleDocumentApiError(error) {
  const status = error?.response?.status || error?.status;
  const message = String(error?.response?.data?.message || error?.message || "").toLowerCase();

  if (status === 413 || message.includes("too large")) return "vehicle_documents.upload.too_large";
  if (status === 415 || message.includes("type")) return "vehicle_documents.upload.invalid_type";
  if (status === 404) return "vehicle.error.not_found";
  if (status === 403) return "vehicle.error.forbidden";

  return "vehicle_documents.error.generic";
}
