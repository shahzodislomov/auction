import { buildVehiclePayload, isVinChecksumValid, normalizeVin, validateVehicleForm } from "./vehicle.mjs";

const STORE_KEY = "__auctionVehicleMockStore";

export function getVehicleMockStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      nextId: 1,
      vehicles: [],
    };
  }

  return globalThis[STORE_KEY];
}

export function listMockVehicles({ ownerId } = {}) {
  const store = getVehicleMockStore();
  const vehicles = ownerId
    ? store.vehicles.filter((vehicle) => String(vehicle.ownerId || "") === String(ownerId))
    : store.vehicles;

  return vehicles.slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getMockVehicle(id) {
  return getVehicleMockStore().vehicles.find((vehicle) => String(vehicle.id) === String(id)) || null;
}

export function createMockVehicle(input) {
  const payload = buildVehiclePayload(input, { ownerId: input.ownerId });
  const validation = validateVehicleForm(payload);
  const vin = normalizeVin(payload.vin);

  if (validation.errors?.vin === "vehicle.validation.vin_checksum_hint") {
    return mockError(400, "Invalid VIN checksum", validation.errors);
  }

  if (!validation.valid) {
    return mockError(400, "Vehicle validation failed", validation.errors);
  }

  if (!isVinChecksumValid(vin)) {
    return mockError(400, "Invalid VIN checksum");
  }

  if (getVehicleMockStore().vehicles.some((vehicle) => vehicle.vin === vin)) {
    return mockError(409, "VIN already exists");
  }

  const now = new Date().toISOString();
  const store = getVehicleMockStore();
  const vehicle = {
    ...payload,
    id: String(store.nextId++),
    status: "DRAFT",
    createdAt: now,
    updatedAt: now,
  };

  store.vehicles.push(vehicle);

  return { ok: true, data: vehicle };
}

export function updateMockVehicle(id, input) {
  const store = getVehicleMockStore();
  const index = store.vehicles.findIndex((vehicle) => String(vehicle.id) === String(id));

  if (index < 0) {
    return mockError(404, "Vehicle not found");
  }

  const existing = store.vehicles[index];

  if (input.ownerId && existing.ownerId && String(input.ownerId) !== String(existing.ownerId)) {
    return mockError(403, "Vehicle owner mismatch");
  }

  const payload = buildVehiclePayload(input, { ownerId: existing.ownerId || input.ownerId });
  const validation = validateVehicleForm(payload);
  const vin = normalizeVin(payload.vin);

  if (validation.errors?.vin === "vehicle.validation.vin_checksum_hint") {
    return mockError(400, "Invalid VIN checksum", validation.errors);
  }

  if (!validation.valid) {
    return mockError(400, "Vehicle validation failed", validation.errors);
  }

  if (!isVinChecksumValid(vin)) {
    return mockError(400, "Invalid VIN checksum");
  }

  if (store.vehicles.some((vehicle) => vehicle.vin === vin && String(vehicle.id) !== String(id))) {
    return mockError(409, "VIN already exists");
  }

  const updated = {
    ...existing,
    ...payload,
    id: existing.id,
    status: existing.status || "DRAFT",
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  store.vehicles[index] = updated;

  return { ok: true, data: updated };
}

function mockError(status, message, details = null) {
  return {
    ok: false,
    status,
    body: {
      success: false,
      message,
      details,
    },
  };
}
