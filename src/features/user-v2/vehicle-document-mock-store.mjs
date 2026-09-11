import {
  VEHICLE_DOCUMENT_STATUSES,
  VEHICLE_DOCUMENT_TYPES,
} from "./vehicle-documents.mjs";
import { getMockVehicle } from "./vehicle-mock-store.mjs";

const STORE_KEY = "__auctionVehicleDocumentMockStore";

export function getVehicleDocumentMockStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      nextId: 1,
      byVehicleId: {},
    };
  }

  return globalThis[STORE_KEY];
}

export function listMockVehicleDocuments(vehicleId) {
  const store = getVehicleDocumentMockStore();
  return sortDocuments(store.byVehicleId[String(vehicleId)] || []);
}

export function uploadMockVehicleDocument(vehicleId, input = {}) {
  const vehicle = getMockVehicle(vehicleId);

  if (!vehicle) {
    return mockError(404, "Vehicle not found");
  }

  if (!Object.values(VEHICLE_DOCUMENT_TYPES).includes(input.type)) {
    return mockError(400, "Unsupported vehicle document type");
  }

  const now = new Date().toISOString();
  const current = listMockVehicleDocuments(vehicleId).filter((document) => document.type !== input.type);
  const store = getVehicleDocumentMockStore();
  const document = {
    id: String(store.nextId++),
    vehicleId: String(vehicleId),
    ownerId: String(vehicle.ownerId || input.ownerId || ""),
    type: input.type,
    fileName: input.fileName || `${input.type}.pdf`,
    status: VEHICLE_DOCUMENT_STATUSES.PENDING,
    rejectionReason: null,
    canDownload: true,
    downloadToken: `mock-doc-${vehicleId}-${input.type}-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };

  store.byVehicleId[String(vehicleId)] = sortDocuments([...current, document]);

  return { ok: true, data: document };
}

export function deleteMockVehicleDocument(vehicleId, documentId) {
  const current = listMockVehicleDocuments(vehicleId);
  const existing = current.find((document) => String(document.id) === String(documentId));

  if (!existing) {
    return mockError(404, "Vehicle document not found");
  }

  if (existing.status === VEHICLE_DOCUMENT_STATUSES.APPROVED) {
    return mockError(400, "Approved vehicle document cannot be deleted");
  }

  getVehicleDocumentMockStore().byVehicleId[String(vehicleId)] = current.filter(
    (document) => String(document.id) !== String(documentId),
  );

  return { ok: true, data: listMockVehicleDocuments(vehicleId) };
}

export function setMockVehicleDocumentReviewStatus(vehicleId, documentId, status, rejectionReason = null) {
  const current = listMockVehicleDocuments(vehicleId);
  const index = current.findIndex((document) => String(document.id) === String(documentId));

  if (index < 0) {
    return mockError(404, "Vehicle document not found");
  }

  const next = current.slice();
  next[index] = {
    ...next[index],
    status,
    rejectionReason: status === VEHICLE_DOCUMENT_STATUSES.REJECTED ? rejectionReason || "Mock rejection reason" : null,
    updatedAt: new Date().toISOString(),
  };

  getVehicleDocumentMockStore().byVehicleId[String(vehicleId)] = sortDocuments(next);

  return { ok: true, data: next[index] };
}

export function getMockVehicleDocumentDownload(vehicleId, documentId) {
  const document = listMockVehicleDocuments(vehicleId).find((item) => String(item.id) === String(documentId));

  if (!document) {
    return mockError(404, "Vehicle document not found");
  }

  if (!document.canDownload) {
    return mockError(403, "Vehicle document download is not permitted");
  }

  return {
    ok: true,
    data: {
      fileName: document.fileName,
      contentType: "text/plain",
      content: `Mock private vehicle document: ${document.type} / ${document.fileName}`,
    },
  };
}

function sortDocuments(documents = []) {
  const order = {
    [VEHICLE_DOCUMENT_TYPES.TITLE]: 0,
    [VEHICLE_DOCUMENT_TYPES.CUSTOMS]: 1,
    [VEHICLE_DOCUMENT_TYPES.INSPECTION]: 2,
  };

  return documents.slice().sort((a, b) => (order[a.type] ?? 99) - (order[b.type] ?? 99));
}

function mockError(status, message) {
  return {
    ok: false,
    status,
    body: {
      success: false,
      message,
    },
  };
}
