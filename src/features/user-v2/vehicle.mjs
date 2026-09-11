import { hasAnyRole, hasUserRole } from "./roles.mjs";

export const VEHICLE_CONTRACTS = {
  realVehicleCore: {
    available: true,
    reason: null,
  },
  mockVehicleCore: {
    available: true,
    reason: "vehicle.contract.mock_enabled",
  },
};

export const VEHICLE_FUEL_TYPES = ["PETROL", "DIESEL", "GAS", "HYBRID", "ELECTRIC"];
export const VEHICLE_TRANSMISSIONS = ["MANUAL", "AUTOMATIC", "CVT", "ROBOT"];
export const VEHICLE_DRIVETRAINS = ["FWD", "RWD", "AWD"];
export const VEHICLE_CONDITIONS = ["EXCELLENT", "GOOD", "DAMAGED", "NOT_RUNNING"];

const VIN_ALLOWED_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

export function getVehicleApiMode(env = process.env) {
  const mode = String(env?.NEXT_PUBLIC_VEHICLE_API_MODE || "").trim().toLowerCase();

  if (mode === "mock") return "mock";
  if (mode === "real") return "real";
  return "real";
}

export function createEmptyVehicleForm() {
  return {
    makeId: "",
    modelId: "",
    year: "",
    vin: "",
    mileage: "",
    engineVolume: "",
    fuelType: "",
    transmission: "",
    drivetrain: "",
    bodyType: "",
    color: "",
    condition: "",
    regionId: "",
    cityId: "",
    description: "",
  };
}

export function applyVehicleFormChange(form, field, value) {
  const next = {
    ...form,
    [field]: field === "vin" ? normalizeVin(value) : value,
  };

  if (field === "makeId" && String(form.makeId || "") !== String(value || "")) {
    next.modelId = "";
  }

  return next;
}

export function normalizeVin(value) {
  return String(value || "").replace(/\s+/g, "").toUpperCase();
}

export function validateVehicleForm(form, now = new Date()) {
  const errors = {};
  const year = Number(form.year);
  const currentYear = now.getFullYear() + 1;
  const vin = normalizeVin(form.vin);

  if (!form.makeId) errors.makeId = "vehicle.validation.make_required";
  if (!form.modelId) errors.modelId = "vehicle.validation.model_required";
  if (!form.year) {
    errors.year = "vehicle.validation.year_required";
  } else if (!Number.isInteger(year) || year < 1900 || year > currentYear) {
    errors.year = "vehicle.validation.year_range";
  }

  if (!vin) {
    errors.vin = "vehicle.validation.vin_required";
  } else if (!VIN_ALLOWED_PATTERN.test(vin)) {
    errors.vin = "vehicle.validation.vin_format";
  } else if (!isVinChecksumValid(vin)) {
    errors.vin = "vehicle.validation.vin_checksum_hint";
  }

  if (form.mileage !== "" && Number(form.mileage) < 0) {
    errors.mileage = "vehicle.validation.non_negative";
  }

  if (form.engineVolume !== "" && Number(form.engineVolume) < 0) {
    errors.engineVolume = "vehicle.validation.non_negative";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildVehiclePayload(form, extra = {}) {
  const payload = {
    makeId: toNumberOrNull(form.makeId),
    modelId: toNumberOrNull(form.modelId),
    year: toNumberOrNull(form.year),
    vin: normalizeVin(form.vin),
    mileage: toNumberOrNull(form.mileage),
    engineVolume: toNumberOrNull(form.engineVolume),
    fuelType: form.fuelType || null,
    transmission: form.transmission || null,
    drivetrain: form.drivetrain || null,
    bodyType: trimOrNull(form.bodyType),
    color: trimOrNull(form.color),
    condition: form.condition || null,
    regionId: toNumberOrNull(form.regionId),
    cityId: toNumberOrNull(form.cityId),
    description: trimOrNull(form.description),
  };

  payload.status = extra.status || form.status || "DRAFT";

  if (extra.ownerId !== undefined && extra.ownerId !== null && extra.ownerId !== "") {
    payload.ownerId = String(extra.ownerId);
  }

  return payload;
}

export function buildVehicleCreatePayload(form) {
  return {
    makeId: toNumberOrNull(form.makeId),
    modelId: toNumberOrNull(form.modelId),
    year: toNumberOrNull(form.year),
    vin: normalizeVin(form.vin),
    mileage: toNumberOrNull(form.mileage),
    engineVolume: toNumberOrNull(form.engineVolume),
    fuelType: normalizeEnum(form.fuelType, VEHICLE_FUEL_TYPES, {
      BENZIN: "PETROL",
      GASOLINE: "PETROL",
      PETROL: "PETROL",
    }),
    transmission: normalizeEnum(form.transmission, VEHICLE_TRANSMISSIONS, {
      AUTO: "AUTOMATIC",
      AUTOMATIC: "AUTOMATIC",
    }),
    drivetrain: normalizeEnum(form.drivetrain, VEHICLE_DRIVETRAINS, {
      "4WD": "AWD",
      "ALL WHEEL DRIVE": "AWD",
      "FRONT WHEEL DRIVE": "FWD",
      "REAR WHEEL DRIVE": "RWD",
    }),
    bodyType: normalizeEnum(form.bodyType, ["SEDAN", "SUV", "HATCHBACK", "WAGON", "COUPE", "PICKUP", "VAN"]) || trimOrNull(form.bodyType),
    color: trimOrNull(form.color),
    conditionGrade: normalizeEnum(form.conditionGrade || form.condition, VEHICLE_CONDITIONS, {
      INSPECTED: "GOOD",
      NONE: "GOOD",
    }),
    region: trimOrNull(form.region) || trimOrNull(form.regionName) || trimOrNull(form.regionId),
    description: trimOrNull(form.description),
  };
}

export function mapVehicleApiError(error) {
  const status = error?.response?.status || error?.status;
  const message = String(error?.response?.data?.message || error?.message || "").toLowerCase();

  if (status === 409 || message.includes("duplicate vin") || message.includes("vin already")) {
    return "vehicle.error.duplicate_vin";
  }

  if (message.includes("checksum")) {
    return "vehicle.error.invalid_checksum";
  }

  if (status === 403) return "vehicle.error.forbidden";
  if (status === 404) return "vehicle.error.not_found";

  return "vehicle.error.generic";
}

export function canEditVehicle(vehicle, user) {
  if (hasAnyRole(user, ["ADMIN", "MODERATOR"])) {
    return true;
  }

  const isOwner = String(vehicle?.ownerId || "") === String(user?.id || user?.userId || "");

  return isOwner && hasUserRole(user);
}

export function isVinChecksumValid(vin) {
  const normalized = normalizeVin(vin);

  if (!VIN_ALLOWED_PATTERN.test(normalized)) {
    return false;
  }

  const transliteration = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
    J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
    S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  };
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum = normalized.split("").reduce((total, char, index) => {
    const value = Number.isNaN(Number(char)) ? transliteration[char] : Number(char);
    return total + value * weights[index];
  }, 0);
  const remainder = sum % 11;
  const checkDigit = remainder === 10 ? "X" : String(remainder);

  return normalized[8] === checkDigit;
}

function toNumberOrNull(value) {
  if (value === "" || value === undefined || value === null) return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function trimOrNull(value) {
  const text = String(value || "").trim();
  return text || null;
}

function normalizeEnum(value, allowed, aliases = {}) {
  const text = String(value || "").trim();
  if (!text) return null;
  const normalized = text.replace(/[-_]+/g, " ").replace(/\s+/g, " ").toUpperCase();
  const candidate = normalized.replace(/\s+/g, "_");
  if (allowed.includes(candidate)) return candidate;
  return aliases[normalized] || aliases[candidate] || null;
}
