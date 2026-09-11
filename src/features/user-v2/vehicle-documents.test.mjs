import assert from "node:assert/strict";
import test from "node:test";
import {
  VEHICLE_DOCUMENT_TYPES,
  buildVehicleDocumentStatusView,
  canReplaceVehicleDocument,
  canViewPrivateVehicleDocument,
  getVehicleDocumentRequirements,
  prepareVehicleDocumentRetry,
  validateVehicleDocumentsForReview,
} from "./vehicle-documents.mjs";

test("vehicle document requirements mark TITLE and CUSTOMS required and INSPECTION optional", () => {
  assert.deepEqual(getVehicleDocumentRequirements(), {
    requiredTypes: [VEHICLE_DOCUMENT_TYPES.TITLE, VEHICLE_DOCUMENT_TYPES.CUSTOMS],
    optionalTypes: [VEHICLE_DOCUMENT_TYPES.INSPECTION],
  });
});

test("review readiness blocks missing required documents only", () => {
  const result = validateVehicleDocumentsForReview([
    { type: "INSPECTION", status: "APPROVED" },
  ]);

  assert.equal(result.ready, false);
  assert.deepEqual(result.blockingTypes, ["TITLE", "CUSTOMS"]);
  assert.deepEqual(result.optionalTypes, ["INSPECTION"]);
});

test("review readiness blocks rejected required documents but not pending or approved required uploads", () => {
  assert.deepEqual(
    validateVehicleDocumentsForReview([
      { type: "TITLE", status: "PENDING" },
      { type: "CUSTOMS", status: "APPROVED" },
    ]),
    {
      ready: true,
      blockingTypes: [],
      optionalTypes: ["INSPECTION"],
    },
  );

  assert.deepEqual(
    validateVehicleDocumentsForReview([
      { type: "TITLE", status: "REJECTED", rejectionReason: "Unreadable" },
      { type: "CUSTOMS", status: "APPROVED" },
    ]),
    {
      ready: false,
      blockingTypes: ["TITLE"],
      optionalTypes: ["INSPECTION"],
    },
  );
});

test("document status rendering exposes rejection reason and resubmission CTA", () => {
  assert.deepEqual(buildVehicleDocumentStatusView({ status: "PENDING" }), {
    severity: "warning",
    labelId: "vehicle_documents.status.PENDING",
    ctaId: null,
    rejectionReason: null,
  });

  assert.deepEqual(buildVehicleDocumentStatusView({ status: "REJECTED", rejectionReason: "Expired" }), {
    severity: "error",
    labelId: "vehicle_documents.status.REJECTED",
    ctaId: "vehicle_documents.replace_resubmit",
    rejectionReason: "Expired",
  });
});

test("rejected and pending documents can be replaced before final approval", () => {
  assert.equal(canReplaceVehicleDocument({ status: "REJECTED" }), true);
  assert.equal(canReplaceVehicleDocument({ status: "PENDING" }), true);
  assert.equal(canReplaceVehicleDocument({ status: "APPROVED" }), false);
});

test("private document access requires backend download permission and owner/admin context", () => {
  const document = { canDownload: true, ownerId: "7" };

  assert.equal(canViewPrivateVehicleDocument(document, { id: "7", roles: ["USER"] }), true);
  assert.equal(canViewPrivateVehicleDocument(document, { id: "8", roles: ["ADMIN"] }), true);
  assert.equal(canViewPrivateVehicleDocument(document, { id: "8", roles: ["USER"] }), false);
  assert.equal(canViewPrivateVehicleDocument({ ...document, canDownload: false }, { id: "7" }), false);
});

test("failed upload retry preserves type and file while resetting transient state", () => {
  assert.deepEqual(
    prepareVehicleDocumentRetry({
      id: "tmp-1",
      type: "TITLE",
      fileName: "title.pdf",
      file: { name: "title.pdf" },
      status: "FAILED",
      progress: 0,
      error: "network",
    }),
    {
      id: "tmp-1",
      type: "TITLE",
      fileName: "title.pdf",
      file: { name: "title.pdf" },
      status: "QUEUED",
      progress: 0,
      error: null,
    },
  );
});
