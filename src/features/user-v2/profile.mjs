export const USER_PROFILE_TYPES = {
  INDIVIDUAL: "INDIVIDUAL",
  ORGANIZATION: "ORGANIZATION",
};

export const BACKEND_UPDATE_USER_FIELDS = [
  "id",
  "firstname",
  "lastname",
  "type",
  "orgName",
  "orgInn",
];

export const UNSUPPORTED_V2_PROFILE_FIELDS = [
  "dateOfBirth",
  "legalAddress",
  "contactPerson",
];
export function getProfileFormDefaults(user = {}) {
  return {
    firstname: user.firstname ?? user.firstName ?? "",
    lastname: user.lastname ?? user.lastName ?? "",
    type: user.type ?? user.userType ?? USER_PROFILE_TYPES.INDIVIDUAL,
    orgName: user.orgName ?? "",
    orgInn: user.orgInn ?? user.orgTaxId ?? "",
  };
}
export function getProfileFieldMode(type) {
  if (type === USER_PROFILE_TYPES.ORGANIZATION) {
    return {
      type,
      editable: ["type", "orgName", "orgInn", "firstname", "lastname"],
      unavailable: ["legalAddress", "contactPerson"],
    };
  }

  return {
    type: USER_PROFILE_TYPES.INDIVIDUAL,
    editable: ["type", "firstname", "lastname"],
    unavailable: ["dateOfBirth"],
  };
}

export function validateProfileForm(form = {}) {
  const errors = {};
  const type = form.type || USER_PROFILE_TYPES.INDIVIDUAL;

  if (!Object.values(USER_PROFILE_TYPES).includes(type)) {
    errors.type = "profile.validation.type";
  }

  if (type === USER_PROFILE_TYPES.INDIVIDUAL) {
    if (!String(form.firstname || "").trim()) {
      errors.firstname = "profile.validation.firstname";
    }
    if (!String(form.lastname || "").trim()) {
      errors.lastname = "profile.validation.lastname";
    }
  }

  if (type === USER_PROFILE_TYPES.ORGANIZATION) {
    if (!String(form.orgName || "").trim()) {
      errors.orgName = "profile.validation.orgName";
    }
    const orgInn = String(form.orgInn || "").trim();
    if (!orgInn) {
      errors.orgInn = "profile.validation.orgInn";
    } else if (!/^\d{9}$/.test(orgInn)) {
      errors.orgInn = "profile.validation.orgInnFormat";
    }
  }

  return errors;
}

export function hasProfileErrors(errors = {}) {
  return Object.keys(errors).length > 0;
}

export function buildUpdateUserPayload(userId, form = {}) {
  const userType = Object.values(USER_PROFILE_TYPES).includes(form.type)
    ? form.type
    : USER_PROFILE_TYPES.INDIVIDUAL;

  const payload = {
    id: userId,
    firstname: normalizeOptionalString(form.firstname),
    lastname: normalizeOptionalString(form.lastname),
    type: userType,
  };

  if (userType === USER_PROFILE_TYPES.ORGANIZATION) {
    payload.orgName = normalizeOptionalString(form.orgName);
    payload.orgInn = normalizeOptionalString(form.orgInn);
  }

  return payload;
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null) return undefined;
  return String(value).trim();
}
