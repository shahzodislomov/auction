export const REFERENCE_CONTRACTS = {
  vehicleMakes: {
    available: false,
    reason: "reference.contract.vehicle_makes_unavailable",
  },
  vehicleModels: {
    available: false,
    reason: "reference.contract.vehicle_models_unavailable",
  },
  regions: {
    available: true,
  },
  districts: {
    available: true,
  },
};

export const MOCK_VEHICLE_MAKES = [
  { id: 1, name: "Toyota", nameUz: "Toyota", nameRu: "Toyota", nameEn: "Toyota", active: true },
  { id: 2, name: "Chevrolet", nameUz: "Chevrolet", nameRu: "Chevrolet", nameEn: "Chevrolet", active: true },
];

export const MOCK_VEHICLE_MODELS = [
  { id: 10, makeId: 1, name: "Camry", nameUz: "Camry", nameRu: "Camry", nameEn: "Camry", active: true },
  { id: 11, makeId: 1, name: "Corolla", nameUz: "Corolla", nameRu: "Corolla", nameEn: "Corolla", active: true },
  { id: 20, makeId: 2, name: "Cobalt", nameUz: "Cobalt", nameRu: "Cobalt", nameEn: "Cobalt", active: true },
  { id: 21, makeId: 2, name: "Gentra", nameUz: "Gentra", nameRu: "Gentra", nameEn: "Gentra", active: true },
];

export function buildModelsByMakeQueryKey(makeId) {
  return ["vehicleModels", "byMake", String(makeId || "")];
}

export function validateReferenceName(name, existing = [], currentId = null) {
  const normalized = normalizeName(name);

  if (!normalized) {
    return { valid: false, reason: "reference.validation.name_required" };
  }

  const duplicate = existing.some((item) => {
    const itemName = normalizeName(item.name || item.nameUz || item.nameEn || item.nameRu);
    return itemName === normalized && String(item.id) !== String(currentId ?? "");
  });

  if (duplicate) {
    return { valid: false, reason: "reference.validation.duplicate" };
  }

  return { valid: true, reason: null };
}

export function buildArchivePayload(id, isActive) {
  return {
    id,
    active: !isActive,
  };
}

export function normalizeDuplicateError(error) {
  const message = String(error?.response?.data?.message || error?.message || "").toLowerCase();

  if (message.includes("duplicate") || message.includes("already exists") || message.includes("exists")) {
    return "reference.validation.duplicate";
  }

  return null;
}

export function mapReferenceOptions(items = [], locale = "uz") {
  return items.map((item) => ({
    value: String(item.id),
    label: getReferenceLabel(item, locale),
    raw: item,
  }));
}

export function getReferenceLabel(item = {}, locale = "uz") {
  return (
    item[`name${capitalize(locale)}`] ||
    item.name ||
    item.nameUz ||
    item.nameRu ||
    item.nameEn ||
    String(item.id || "")
  );
}

export function filterMockModelsByMake(makeId) {
  return MOCK_VEHICLE_MODELS.filter((model) => String(model.makeId) === String(makeId || ""));
}

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

function capitalize(value) {
  const text = String(value || "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
