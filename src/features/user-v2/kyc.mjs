export const KYC_STATUSES = {
  NOT_SUBMITTED: "NOT_SUBMITTED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export const KYC_DOCUMENT_TYPES = {
  PASSPORT: "PASSPORT",
  ID_CARD: "ID_CARD",
  ORG_CERTIFICATE: "ORG_CERTIFICATE",
};

export function createUnavailableKycStatus() {
  return {
    capability: "unavailable",
    status: null,
    rejectionReason: null,
  };
}

export function getKycDocumentRequirements(userType) {
  if (userType === "ORGANIZATION") {
    return {
      mode: "all",
      acceptedTypes: [KYC_DOCUMENT_TYPES.ORG_CERTIFICATE],
    };
  }

  return {
    mode: "one_of",
    acceptedTypes: [KYC_DOCUMENT_TYPES.PASSPORT, KYC_DOCUMENT_TYPES.ID_CARD],
  };
}

export function validateKycFile(file, policy) {
  if (!file) {
    return { valid: false, reason: "kyc.upload.required" };
  }

  if (!policy) {
    return { valid: false, reason: "kyc.upload.policy_unavailable" };
  }

  if (
    Array.isArray(policy.allowedMimeTypes) &&
    policy.allowedMimeTypes.length > 0 &&
    !policy.allowedMimeTypes.includes(file.type)
  ) {
    return { valid: false, reason: "kyc.upload.invalid_type" };
  }

  if (policy.maxBytes && Number(file.size) > policy.maxBytes) {
    return { valid: false, reason: "kyc.upload.too_large" };
  }

  return { valid: true, reason: null };
}

export function buildKycStatusViewModel(status = {}) {
  switch (status.status) {
    case KYC_STATUSES.PENDING:
      return {
        severity: "warning",
        titleId: "kyc.status.PENDING",
        actionId: null,
        rejectionReason: null,
      };
    case KYC_STATUSES.APPROVED:
      return {
        severity: "success",
        titleId: "kyc.status.APPROVED",
        actionId: null,
        rejectionReason: null,
      };
    case KYC_STATUSES.REJECTED:
      return {
        severity: "error",
        titleId: "kyc.status.REJECTED",
        actionId: "kyc.resubmit",
        rejectionReason: status.rejectionReason || null,
      };
    case KYC_STATUSES.NOT_SUBMITTED:
    default:
      return {
        severity: "info",
        titleId: "kyc.status.NOT_SUBMITTED",
        actionId: "kyc.start",
        rejectionReason: null,
      };
  }
}

export function getResubmissionSteps(status = {}) {
  if (status.status !== KYC_STATUSES.REJECTED) return [];

  return [
    "kyc.resubmit.step.review_reason",
    "kyc.resubmit.step.replace_documents",
    "kyc.resubmit.step.submit_again",
  ];
}

export function evaluateKycGate(status = createUnavailableKycStatus(), _target = "action") {
  if (status.capability === "unavailable") {
    return {
      allowed: false,
      reason: "kyc.contract_unavailable",
      ctaHref: "/dashboard/kyc",
    };
  }

  if (status.status === KYC_STATUSES.APPROVED) {
    return { allowed: true, reason: null, ctaHref: null };
  }

  if (status.status === KYC_STATUSES.PENDING) {
    return { allowed: false, reason: "kyc.gate.pending", ctaHref: "/dashboard/kyc" };
  }

  if (status.status === KYC_STATUSES.REJECTED) {
    return { allowed: false, reason: "kyc.gate.rejected", ctaHref: "/dashboard/kyc" };
  }

  return { allowed: false, reason: "kyc.gate.not_submitted", ctaHref: "/dashboard/kyc" };
}
