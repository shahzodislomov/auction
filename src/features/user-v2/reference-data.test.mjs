import test from "node:test";
import assert from "node:assert/strict";
import {
  REFERENCE_CONTRACTS,
  buildArchivePayload,
  buildModelsByMakeQueryKey,
  mapReferenceOptions,
  normalizeDuplicateError,
  validateReferenceName,
} from "./reference-data.mjs";

test("model query key changes when make changes", () => {
  assert.notDeepEqual(
    buildModelsByMakeQueryKey(1),
    buildModelsByMakeQueryKey(2)
  );
  assert.deepEqual(buildModelsByMakeQueryKey(7), ["vehicleModels", "byMake", "7"]);
});

test("admin validation rejects blank and duplicate names", () => {
  assert.deepEqual(validateReferenceName("  ", []), {
    valid: false,
    reason: "reference.validation.name_required",
  });

  assert.deepEqual(validateReferenceName("Toyota", [{ id: 1, name: "toyota" }]), {
    valid: false,
    reason: "reference.validation.duplicate",
  });

  assert.deepEqual(validateReferenceName("Honda", [{ id: 1, name: "toyota" }]), {
    valid: true,
    reason: null,
  });
});

test("archive payload uses active flag without deleting records", () => {
  assert.deepEqual(buildArchivePayload(12, true), { id: 12, active: false });
  assert.deepEqual(buildArchivePayload(12, false), { id: 12, active: true });
});

test("duplicate server errors normalize to a localized message id", () => {
  assert.equal(
    normalizeDuplicateError({ response: { data: { message: "Make already exists" } } }),
    "reference.validation.duplicate"
  );
  assert.equal(normalizeDuplicateError({ response: { data: { message: "Other" } } }), null);
});

test("stable select option mapping keeps ids as string values", () => {
  assert.deepEqual(
    mapReferenceOptions([{ id: 5, name: "Toyota" }, { id: "x", nameUz: "Toshkent" }]),
    [
      { value: "5", label: "Toyota", raw: { id: 5, name: "Toyota" } },
      { value: "x", label: "Toshkent", raw: { id: "x", nameUz: "Toshkent" } },
    ]
  );
});

test("vehicle make/model contracts are explicitly unavailable until backend exposes them", () => {
  assert.equal(REFERENCE_CONTRACTS.vehicleMakes.available, false);
  assert.equal(REFERENCE_CONTRACTS.vehicleModels.available, false);
});
