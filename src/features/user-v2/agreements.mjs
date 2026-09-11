export const AGREEMENT_TYPES = ["TERMS", "PUBLIC_OFFER", "PRIVACY"];

export function createAgreementAcceptanceDefaults(value = false) {
  return AGREEMENT_TYPES.reduce((acc, type) => {
    acc[type] = value;
    return acc;
  }, {});
}

export function areRegistrationAgreementsAccepted(accepted = {}) {
  return AGREEMENT_TYPES.every((type) => accepted[type] === true);
}

export function createUnavailableAgreementStatus() {
  return {
    capability: "unavailable",
    mandatoryOutdated: [],
    history: [],
  };
}

export function evaluateMandatoryAgreementStatus(status) {
  if (!status || status.capability === "unavailable") {
    return {
      blocked: false,
      reason: "agreement.contract_unavailable",
      outdated: [],
    };
  }

  const outdated = Array.isArray(status.mandatoryOutdated)
    ? status.mandatoryOutdated
    : [];

  return {
    blocked: outdated.length > 0,
    reason: outdated.length > 0 ? "agreement.reaccept_required" : null,
    outdated,
  };
}
