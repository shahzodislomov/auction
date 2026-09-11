import assert from "node:assert/strict";
import test from "node:test";
import {
  VEHICLE_IMAGE_LIMITS,
  buildVehicleImageOrderPayload,
  createVehicleImagePreview,
  getAccessibleImageActions,
  moveVehicleImage,
  prepareVehicleImageRetry,
  revokeVehicleImagePreview,
  setPrimaryVehicleImage,
  validateVehicleImagesForReview,
} from "./vehicle-images.mjs";

const images = (count) => Array.from({ length: count }, (_, index) => ({
  id: String(index + 1),
  url: `https://example.test/${index + 1}.jpg`,
  order: index,
  isPrimary: index === 0,
  status: "UPLOADED",
}));

test("vehicle image validation enforces 5 minimum and 30 maximum before review", () => {
  assert.deepEqual(validateVehicleImagesForReview(images(4)), {
    valid: false,
    errors: ["vehicle_images.validation.min"],
  });

  assert.deepEqual(validateVehicleImagesForReview(images(31)), {
    valid: false,
    errors: ["vehicle_images.validation.max"],
  });

  assert.equal(validateVehicleImagesForReview(images(VEHICLE_IMAGE_LIMITS.min)).valid, true);
  assert.equal(validateVehicleImagesForReview(images(VEHICLE_IMAGE_LIMITS.max)).valid, true);
});

test("primary image action keeps exactly one primary image", () => {
  const updated = setPrimaryVehicleImage(images(5), "3");

  assert.equal(updated.filter((image) => image.isPrimary).length, 1);
  assert.equal(updated.find((image) => image.isPrimary).id, "3");
});

test("review validation rejects missing or duplicate primary images", () => {
  assert.deepEqual(validateVehicleImagesForReview(images(5).map((image) => ({ ...image, isPrimary: false }))), {
    valid: false,
    errors: ["vehicle_images.validation.primary_required"],
  });

  const duplicatePrimary = images(5).map((image, index) => ({ ...image, isPrimary: index < 2 }));
  assert.deepEqual(validateVehicleImagesForReview(duplicatePrimary), {
    valid: false,
    errors: ["vehicle_images.validation.primary_unique"],
  });
});

test("moving images preserves a stable order payload", () => {
  const moved = moveVehicleImage(images(5), "3", -1);

  assert.deepEqual(moved.map((image) => image.id), ["1", "3", "2", "4", "5"]);
  assert.deepEqual(buildVehicleImageOrderPayload(moved), [
    { id: "1", order: 0, isPrimary: true },
    { id: "3", order: 1, isPrimary: false },
    { id: "2", order: 2, isPrimary: false },
    { id: "4", order: 3, isPrimary: false },
    { id: "5", order: 4, isPrimary: false },
  ]);
});

test("upload failure can be prepared for retry without changing order or primary", () => {
  const failed = {
    id: "tmp-1",
    fileName: "front.jpg",
    order: 2,
    isPrimary: true,
    status: "FAILED",
    error: "network",
  };

  assert.deepEqual(prepareVehicleImageRetry(failed), {
    id: "tmp-1",
    fileName: "front.jpg",
    order: 2,
    isPrimary: true,
    status: "QUEUED",
    error: null,
    progress: 0,
  });
});

test("accessible image controls expose labels and disabled move states", () => {
  const firstActions = getAccessibleImageActions({ id: "1", isPrimary: true }, 0, 5);
  assert.equal(firstActions.moveUp.disabled, true);
  assert.equal(firstActions.moveDown.disabled, false);
  assert.equal(firstActions.setPrimary.disabled, true);
  assert.equal(firstActions.moveUp.labelId, "vehicle_images.action.move_up");

  const lastActions = getAccessibleImageActions({ id: "5", isPrimary: false }, 4, 5);
  assert.equal(lastActions.moveUp.disabled, false);
  assert.equal(lastActions.moveDown.disabled, true);
  assert.equal(lastActions.setPrimary.disabled, false);
});

test("object URL preview helpers revoke only local previews", () => {
  const calls = [];
  const preview = createVehicleImagePreview({ name: "a.jpg" }, {
    createObjectURL: (file) => `blob:${file.name}`,
  });

  assert.deepEqual(preview, {
    url: "blob:a.jpg",
    isObjectUrl: true,
  });

  revokeVehicleImagePreview(preview, {
    revokeObjectURL: (url) => calls.push(url),
  });

  revokeVehicleImagePreview({ url: "https://example.test/a.jpg", isObjectUrl: false }, {
    revokeObjectURL: (url) => calls.push(url),
  });

  assert.deepEqual(calls, ["blob:a.jpg"]);
});
