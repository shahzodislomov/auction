export const VEHICLE_IMAGE_LIMITS = {
  min: 5,
  max: 30,
};

export const VEHICLE_IMAGE_CONTRACTS = {
  realVehicleImages: {
    available: true,
    reason: null,
  },
  mockVehicleImages: {
    available: true,
    reason: "vehicle_images.contract.mock_enabled",
  },
};

export function validateVehicleImagesForReview(images = []) {
  const uploadedImages = images.filter((image) => image.status !== "DELETED");
  const errors = [];

  if (uploadedImages.length < VEHICLE_IMAGE_LIMITS.min) {
    errors.push("vehicle_images.validation.min");
  }

  if (uploadedImages.length > VEHICLE_IMAGE_LIMITS.max) {
    errors.push("vehicle_images.validation.max");
  }

  const primaryCount = uploadedImages.filter((image) => image.isPrimary).length;

  if (uploadedImages.length >= VEHICLE_IMAGE_LIMITS.min && primaryCount === 0) {
    errors.push("vehicle_images.validation.primary_required");
  }

  if (primaryCount > 1) {
    errors.push("vehicle_images.validation.primary_unique");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function setPrimaryVehicleImage(images = [], imageId) {
  return normalizeVehicleImageOrder(
    images.map((image) => ({
      ...image,
      isPrimary: String(image.id) === String(imageId),
    })),
  );
}

export function moveVehicleImage(images = [], imageId, delta) {
  const ordered = sortVehicleImages(images);
  const index = ordered.findIndex((image) => String(image.id) === String(imageId));

  if (index < 0) return assignVehicleImageOrder(ordered);

  const nextIndex = Math.max(0, Math.min(ordered.length - 1, index + delta));
  if (nextIndex === index) return assignVehicleImageOrder(ordered);

  const next = ordered.slice();
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);

  return assignVehicleImageOrder(next);
}

export function normalizeVehicleImageOrder(images = []) {
  return assignVehicleImageOrder(sortVehicleImages(images));
}

export function buildVehicleImageOrderPayload(images = []) {
  return normalizeVehicleImageOrder(images).map((image) => ({
    id: String(image.id),
    order: image.order,
    isPrimary: Boolean(image.isPrimary),
  }));
}

export function prepareVehicleImageRetry(image) {
  return {
    ...image,
    status: "QUEUED",
    error: null,
    progress: 0,
  };
}

export function getAccessibleImageActions(image, index, total) {
  return {
    moveUp: {
      labelId: "vehicle_images.action.move_up",
      disabled: index <= 0,
      imageId: image?.id,
    },
    moveDown: {
      labelId: "vehicle_images.action.move_down",
      disabled: index >= total - 1,
      imageId: image?.id,
    },
    setPrimary: {
      labelId: "vehicle_images.action.set_primary",
      disabled: Boolean(image?.isPrimary),
      imageId: image?.id,
    },
    delete: {
      labelId: "vehicle_images.action.delete",
      disabled: false,
      imageId: image?.id,
    },
    retry: {
      labelId: "vehicle_images.action.retry",
      disabled: image?.status !== "FAILED",
      imageId: image?.id,
    },
  };
}

export function createVehicleImagePreview(file, urlApi = globalThis.URL) {
  return {
    url: urlApi.createObjectURL(file),
    isObjectUrl: true,
  };
}

export function revokeVehicleImagePreview(preview, urlApi = globalThis.URL) {
  if (preview?.isObjectUrl && preview.url) {
    urlApi.revokeObjectURL(preview.url);
  }
}

export function getVehicleImageDisplayUrl(image = {}) {
  return image.thumbnailUrl || image.url || image.imageUrl || "";
}

export function mapVehicleImageApiError(error) {
  const status = error?.response?.status || error?.status;
  const message = String(error?.response?.data?.message || error?.message || "").toLowerCase();

  if (status === 413 || message.includes("too large")) return "vehicle_images.error.too_large";
  if (status === 415 || message.includes("type")) return "vehicle_images.error.invalid_type";
  if (status === 404) return "vehicle.error.not_found";
  if (status === 403) return "vehicle.error.forbidden";

  return "vehicle_images.error.generic";
}

function sortVehicleImages(images = []) {
  return images.slice().sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
}

function assignVehicleImageOrder(images = []) {
  return images.map((image, index) => ({
    ...image,
    order: index,
  }));
}
