import assert from "node:assert/strict";
import test from "node:test";
import {
  VEHICLE_CONTRACTS,
  applyVehicleFormChange,
  buildVehicleCreatePayload,
  buildVehiclePayload,
  canEditVehicle,
  createEmptyVehicleForm,
  getVehicleApiMode,
  mapVehicleApiError,
  normalizeVin,
  validateVehicleForm,
} from "./vehicle.mjs";
import {
  createMockVehicle,
  getVehicleMockStore,
  updateMockVehicle,
} from "./vehicle-mock-store.mjs";

test("make changes reset the selected model", () => {
  const form = {
    ...createEmptyVehicleForm(),
    makeId: "1",
    modelId: "10",
    vin: "1HGCM82633A004352",
  };

  const updated = applyVehicleFormChange(form, "makeId", "2");

  assert.equal(updated.makeId, "2");
  assert.equal(updated.modelId, "");
  assert.equal(form.modelId, "10");
});

test("VIN is normalized and validation reports precise VIN hints", () => {
  assert.equal(normalizeVin(" 1hg cm82633a004352 "), "1HGCM82633A004352");

  const missingRequired = validateVehicleForm(createEmptyVehicleForm());
  assert.equal(missingRequired.valid, false);
  assert.equal(missingRequired.errors.makeId, "vehicle.validation.make_required");
  assert.equal(missingRequired.errors.modelId, "vehicle.validation.model_required");
  assert.equal(missingRequired.errors.year, "vehicle.validation.year_required");
  assert.equal(missingRequired.errors.vin, "vehicle.validation.vin_required");

  const invalidVin = validateVehicleForm({
    ...createEmptyVehicleForm(),
    makeId: "1",
    modelId: "10",
    year: "2023",
    vin: "1HGCM82633A00IOQ",
  });

  assert.equal(invalidVin.valid, false);
  assert.equal(invalidVin.errors.vin, "vehicle.validation.vin_format");
});

test("vehicle payload maps structured profile fields without auction or legacy dynamic fields", () => {
  const payload = buildVehiclePayload({
    ...createEmptyVehicleForm(),
    makeId: "1",
    modelId: "10",
    year: "2024",
    vin: " 1hgcm82633a004352 ",
    mileage: "12500",
    engineVolume: "2.5",
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    drivetrain: "AWD",
    bodyType: "Sedan",
    color: "White",
    condition: "GOOD",
    regionId: "3",
    cityId: "31",
    description: "Clean owner vehicle",
    startPrice: "999",
    lotTypeId: "legacy",
    attributes: [{ id: 1 }],
  });

  assert.deepEqual(payload, {
    makeId: 1,
    modelId: 10,
    year: 2024,
    vin: "1HGCM82633A004352",
    mileage: 12500,
    engineVolume: 2.5,
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    drivetrain: "AWD",
    bodyType: "Sedan",
    color: "White",
    condition: "GOOD",
    regionId: 3,
    cityId: 31,
    description: "Clean owner vehicle",
    status: "DRAFT",
  });

  assert.equal("startPrice" in payload, false);
  assert.equal("lotTypeId" in payload, false);
  assert.equal("attributes" in payload, false);
});

test("vehicle create payload matches the live backend vehicle contract", () => {
  const payload = buildVehicleCreatePayload({
    ...createEmptyVehicleForm(),
    makeId: "1",
    modelId: "10",
    year: "2024",
    vin: " 1hgcm82633a004352 ",
    mileage: "12500",
    engineVolume: "2.5",
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    drivetrain: "AWD",
    bodyType: "SEDAN",
    color: "White",
    condition: "GOOD",
    regionId: "3",
    region: "Tashkent",
    cityId: "31",
    description: "Clean owner vehicle",
    startPrice: "999",
    lotTypeId: "legacy",
    attributes: [{ id: 1 }],
  });

  assert.deepEqual(payload, {
    makeId: 1,
    modelId: 10,
    year: 2024,
    vin: "1HGCM82633A004352",
    mileage: 12500,
    engineVolume: 2.5,
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    drivetrain: "AWD",
    bodyType: "SEDAN",
    color: "White",
    conditionGrade: "GOOD",
    region: "Tashkent",
    description: "Clean owner vehicle",
  });

  assert.equal("condition" in payload, false);
  assert.equal("regionId" in payload, false);
  assert.equal("cityId" in payload, false);
  assert.equal("status" in payload, false);
  assert.equal("startPrice" in payload, false);
  assert.equal("lotTypeId" in payload, false);
  assert.equal("attributes" in payload, false);
});

test("vehicle create payload normalizes wizard labels to backend enums", () => {
  const payload = buildVehicleCreatePayload({
    ...createEmptyVehicleForm(),
    fuelType: "Petrol",
    transmission: "Automatic",
    drivetrain: "Front wheel drive",
    condition: "Inspected",
  });

  assert.equal(payload.fuelType, "PETROL");
  assert.equal(payload.transmission, "AUTOMATIC");
  assert.equal(payload.drivetrain, "FWD");
  assert.equal(payload.conditionGrade, "GOOD");
});

test("vehicle API errors map duplicate VIN, invalid checksum, ownership and missing states", () => {
  assert.equal(
    mapVehicleApiError({ response: { status: 409, data: { message: "VIN already exists" } } }),
    "vehicle.error.duplicate_vin",
  );
  assert.equal(
    mapVehicleApiError({ response: { status: 400, data: { message: "invalid checksum" } } }),
    "vehicle.error.invalid_checksum",
  );
  assert.equal(mapVehicleApiError({ response: { status: 403 } }), "vehicle.error.forbidden");
  assert.equal(mapVehicleApiError({ response: { status: 404 } }), "vehicle.error.not_found");
});

test("ownership edit guard allows owner and admin roles only", () => {
  const vehicle = { ownerId: "7" };

  assert.equal(canEditVehicle(vehicle, { id: "7", roles: ["USER"] }), true);
  assert.equal(canEditVehicle(vehicle, { id: "8", roles: ["ADMIN"] }), true);
  assert.equal(canEditVehicle(vehicle, { id: "8", roles: ["MODERATOR"] }), true);
  assert.equal(canEditVehicle(vehicle, { id: "8", roles: ["USER"] }), false);
});

test("vehicle mock endpoint is explicitly environment gated", () => {
  assert.equal(VEHICLE_CONTRACTS.realVehicleCore.available, true);
  assert.equal(getVehicleApiMode({ NEXT_PUBLIC_VEHICLE_API_MODE: "mock" }), "mock");
  assert.equal(getVehicleApiMode({ NEXT_PUBLIC_VEHICLE_API_MODE: "real" }), "real");
  assert.equal(getVehicleApiMode({}), "real");
});

test("mock vehicle store creates and edits draft vehicles with precise VIN failures", () => {
  const store = getVehicleMockStore();
  store.nextId = 1;
  store.vehicles = [];

  const form = {
    ...createEmptyVehicleForm(),
    ownerId: "42",
    makeId: "1",
    modelId: "10",
    year: "2024",
    vin: "1HGCM82633A004352",
    mileage: "100",
  };

  const created = createMockVehicle(form);
  assert.equal(created.ok, true);
  assert.equal(created.data.status, "DRAFT");
  assert.equal(created.data.ownerId, "42");

  const duplicate = createMockVehicle(form);
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.message, "VIN already exists");

  const invalidChecksum = createMockVehicle({ ...form, vin: "1HGCM82633A004353" });
  assert.equal(invalidChecksum.ok, false);
  assert.equal(invalidChecksum.status, 400);
  assert.equal(invalidChecksum.body.message, "Invalid VIN checksum");

  const updated = updateMockVehicle(created.data.id, {
    ...form,
    mileage: "250",
  });
  assert.equal(updated.ok, true);
  assert.equal(updated.data.mileage, 250);
});
