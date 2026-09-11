import test from "node:test";
import assert from "node:assert/strict";
import {
  areRegistrationAgreementsAccepted,
  createAgreementAcceptanceDefaults,
  evaluateMandatoryAgreementStatus,
} from "./agreements.mjs";

test("registration requires all current mandatory agreements", () => {
  assert.equal(
    areRegistrationAgreementsAccepted({
      TERMS: true,
      PUBLIC_OFFER: true,
      PRIVACY: false,
    }),
    false
  );

  assert.equal(
    areRegistrationAgreementsAccepted(createAgreementAcceptanceDefaults(true)),
    true
  );
});

test("mandatory agreement status blocks only when backend adapter reports outdated agreements", () => {
  assert.deepEqual(
    evaluateMandatoryAgreementStatus({
      capability: "available",
      mandatoryOutdated: [{ type: "TERMS", version: "v2" }],
    }),
    {
      blocked: true,
      reason: "agreement.reaccept_required",
      outdated: [{ type: "TERMS", version: "v2" }],
    }
  );
});

test("missing agreement contract does not fake a blocking or accepted state", () => {
  assert.deepEqual(evaluateMandatoryAgreementStatus({ capability: "unavailable" }), {
    blocked: false,
    reason: "agreement.contract_unavailable",
    outdated: [],
  });
});
