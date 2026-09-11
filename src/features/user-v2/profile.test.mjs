import test from "node:test";
import assert from "node:assert/strict";
import {
  USER_PROFILE_TYPES,
  buildUpdateUserPayload,
  getProfileFieldMode,
  validateProfileForm,
} from "./profile.mjs";

test("profile field mode switches between individual and organization fields", () => {
  assert.deepEqual(getProfileFieldMode(USER_PROFILE_TYPES.INDIVIDUAL), {
    type: "INDIVIDUAL",
    editable: ["type", "firstname", "lastname"],
    unavailable: ["dateOfBirth"],
  });

  assert.deepEqual(getProfileFieldMode(USER_PROFILE_TYPES.ORGANIZATION), {
    type: "ORGANIZATION",
    editable: ["type", "orgName", "orgInn", "firstname", "lastname"],
    unavailable: ["legalAddress", "contactPerson"],
  });
});

test("individual profile validation requires first and last name", () => {
  assert.deepEqual(validateProfileForm({ type: "INDIVIDUAL" }), {
    firstname: "profile.validation.firstname",
    lastname: "profile.validation.lastname",
  });
});

test("organization form validates company name and 9 digit tax id", () => {
  assert.deepEqual(validateProfileForm({ type: "ORGANIZATION", orgInn: "12" }), {
    orgName: "profile.validation.orgName",
    orgInn: "profile.validation.orgInnFormat",
  });

  assert.deepEqual(
    validateProfileForm({
      type: "ORGANIZATION",
      orgName: "Acme LLC",
      orgInn: "123456789",
    }),
    {}
  );
});

test("profile payload only contains backend UpdateUser DTO fields", () => {
  assert.deepEqual(
    buildUpdateUserPayload(42, {
      type: "ORGANIZATION",
      firstname: "Ali",
      lastname: "Valiyev",
      orgName: "Acme LLC",
      orgInn: "123456789",
      legalAddress: "Unsupported",
      contactPerson: "Unsupported",
    }),
    {
      id: 42,
      firstname: "Ali",
      lastname: "Valiyev",
      type: "ORGANIZATION",
      orgName: "Acme LLC",
      orgInn: "123456789",
    }
  );
});
