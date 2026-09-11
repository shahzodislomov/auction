import test from "node:test";
import assert from "node:assert/strict";
import {
  KYC_DOCUMENT_TYPES,
  KYC_STATUSES,
  buildKycStatusViewModel,
  evaluateKycGate,
  getKycDocumentRequirements,
  getResubmissionSteps,
  validateKycFile,
} from "./kyc.mjs";

const pdfPolicy = {
  allowedMimeTypes: ["application/pdf"],
  maxBytes: 1024,
};

test("user-type document requirements support individual and organization KYC", () => {
  assert.deepEqual(getKycDocumentRequirements("INDIVIDUAL"), {
    mode: "one_of",
    acceptedTypes: [KYC_DOCUMENT_TYPES.PASSPORT, KYC_DOCUMENT_TYPES.ID_CARD],
  });

  assert.deepEqual(getKycDocumentRequirements("ORGANIZATION"), {
    mode: "all",
    acceptedTypes: [KYC_DOCUMENT_TYPES.ORG_CERTIFICATE],
  });
});

test("upload validation rejects unsupported type and oversize files", () => {
  assert.deepEqual(
    validateKycFile({ name: "passport.exe", type: "application/x-msdownload", size: 10 }, pdfPolicy),
    { valid: false, reason: "kyc.upload.invalid_type" }
  );

  assert.deepEqual(
    validateKycFile({ name: "passport.pdf", type: "application/pdf", size: 2048 }, pdfPolicy),
    { valid: false, reason: "kyc.upload.too_large" }
  );

  assert.deepEqual(
    validateKycFile({ name: "passport.pdf", type: "application/pdf", size: 512 }, pdfPolicy),
    { valid: true, reason: null }
  );
});

test("status rendering distinguishes all required KYC states", () => {
  assert.deepEqual(buildKycStatusViewModel({ status: KYC_STATUSES.NOT_SUBMITTED }), {
    severity: "info",
    titleId: "kyc.status.NOT_SUBMITTED",
    actionId: "kyc.start",
    rejectionReason: null,
  });

  assert.deepEqual(buildKycStatusViewModel({ status: KYC_STATUSES.REJECTED, rejectionReason: "Blurred scan" }), {
    severity: "error",
    titleId: "kyc.status.REJECTED",
    actionId: "kyc.resubmit",
    rejectionReason: "Blurred scan",
  });
});

test("rejected status exposes resubmission steps without private document URLs", () => {
  const steps = getResubmissionSteps({
    status: KYC_STATUSES.REJECTED,
    rejectionReason: "Expired document",
    privateDocumentUrl: "https://storage.example/private.pdf",
  });

  assert.equal(steps.includes("https://storage.example/private.pdf"), false);
  assert.deepEqual(steps, [
    "kyc.resubmit.step.review_reason",
    "kyc.resubmit.step.replace_documents",
    "kyc.resubmit.step.submit_again",
  ]);
});

test("KYC guards allow only approved status and block unavailable contracts without fake approval", () => {
  assert.deepEqual(
    evaluateKycGate({ capability: "available", status: KYC_STATUSES.APPROVED }, "bid"),
    { allowed: true, reason: null, ctaHref: null }
  );

  assert.deepEqual(
    evaluateKycGate({ capability: "available", status: KYC_STATUSES.PENDING }, "bid"),
    { allowed: false, reason: "kyc.gate.pending", ctaHref: "/dashboard/kyc" }
  );

  assert.deepEqual(
    evaluateKycGate({ capability: "unavailable" }, "sell"),
    { allowed: false, reason: "kyc.contract_unavailable", ctaHref: "/dashboard/kyc" }
  );
});
