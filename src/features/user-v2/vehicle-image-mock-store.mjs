import {
  VEHICLE_IMAGE_LIMITS,
  buildVehicleImageOrderPayload,
  normalizeVehicleImageOrder,
  setPrimaryVehicleImage,
} from "./vehicle-images.mjs";
import { getMockVehicle } from "./vehicle-mock-store.mjs";

const STORE_KEY = "__auctionVehicleImageMockStore";

export function getVehicleImageMockStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      nextId: 1,
      byVehicleId: {},
    };
  }

  return globalThis[STORE_KEY];
}

export function listMockVehicleImages(vehicleId) {
  const store = getVehicleImageMockStore();
  return normalizeVehicleImageOrder(store.byVehicleId[String(vehicleId)] || []);
}

export function uploadMockVehicleImage(vehicleId, input = {}) {
  const vehicle = getMockVehicle(vehicleId);

  if (!vehicle) {
    return mockError(404, "Vehicle not found");
  }

  const current = listMockVehicleImages(vehicleId);

  if (current.length >= VEHICLE_IMAGE_LIMITS.max) {
    return mockError(400, "Vehicle image maximum exceeded");
  }

  const now = new Date().toISOString();
  const store = getVehicleImageMockStore();
  const image = {
    id: String(store.nextId++),
    vehicleId: String(vehicleId),
    fileName: input.fileName || "vehicle-image.jpg",
    url: input.url || `data:image/svg+xml,${encodeURIComponent(buildMockSvg(input.fileName || "vehicle image"))}`,
    thumbnailUrl: input.thumbnailUrl || null,
    order: current.length,
    isPrimary: current.length === 0,
    status: "UPLOADED",
    createdAt: now,
    updatedAt: now,
  };

  store.byVehicleId[String(vehicleId)] = normalizeVehicleImageOrder([...current, image]);

  return { ok: true, data: image };
}

export function deleteMockVehicleImage(vehicleId, imageId) {
  const current = listMockVehicleImages(vehicleId);
  const existing = current.find((image) => String(image.id) === String(imageId));

  if (!existing) {
    return mockError(404, "Vehicle image not found");
  }

  let next = current.filter((image) => String(image.id) !== String(imageId));

  if (existing.isPrimary && next.length > 0) {
    next = setPrimaryVehicleImage(next, next[0].id);
  }

  getVehicleImageMockStore().byVehicleId[String(vehicleId)] = normalizeVehicleImageOrder(next);

  return { ok: true, data: listMockVehicleImages(vehicleId) };
}

export function setPrimaryMockVehicleImage(vehicleId, imageId) {
  const current = listMockVehicleImages(vehicleId);

  if (!current.some((image) => String(image.id) === String(imageId))) {
    return mockError(404, "Vehicle image not found");
  }

  getVehicleImageMockStore().byVehicleId[String(vehicleId)] = setPrimaryVehicleImage(current, imageId);

  return { ok: true, data: listMockVehicleImages(vehicleId) };
}

export function reorderMockVehicleImages(vehicleId, orderPayload = []) {
  const current = listMockVehicleImages(vehicleId);
  const byId = new Map(current.map((image) => [String(image.id), image]));

  if (orderPayload.length !== current.length || orderPayload.some((item) => !byId.has(String(item.id)))) {
    return mockError(400, "Vehicle image order payload does not match current images");
  }

  const next = orderPayload
    .slice()
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
    .map((item, index) => ({
      ...byId.get(String(item.id)),
      order: index,
      isPrimary: Boolean(item.isPrimary),
      updatedAt: new Date().toISOString(),
    }));

  const primaryCount = next.filter((image) => image.isPrimary).length;

  if (primaryCount !== 1 && next.length > 0) {
    return mockError(400, "Vehicle images require exactly one primary image");
  }

  getVehicleImageMockStore().byVehicleId[String(vehicleId)] = normalizeVehicleImageOrder(next);

  return { ok: true, data: listMockVehicleImages(vehicleId) };
}

export function reconcileMockVehicleImages(vehicleId, images) {
  return reorderMockVehicleImages(vehicleId, buildVehicleImageOrderPayload(images));
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

function buildMockSvg(label) {
  const safeLabel = String(label || "vehicle image").replace(/[<>]/g, "");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
    <rect width="640" height="420" fill="#e5e7eb"/>
    <rect x="40" y="40" width="560" height="340" rx="24" fill="#bfdbfe"/>
    <text x="320" y="210" text-anchor="middle" font-family="Arial" font-size="28" fill="#1e3a8a">${safeLabel}</text>
  </svg>`;
}
