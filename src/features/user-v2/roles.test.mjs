import test from "node:test";
import assert from "node:assert/strict";
import {
  getAssignableRoles,
  hasAnyRole,
  normalizeRoles,
} from "./roles.mjs";

test("multi-role display keeps every assigned role", () => {
  assert.deepEqual(
    normalizeRoles([
      { id: 1, name: "DEALER" },
      { id: 2, name: "MODERATOR" },
      { id: 3, name: "ADMIN" },
    ]).map((role) => role.name),
    ["DEALER", "MODERATOR", "ADMIN"]
  );
});

test("role checks do not assume one role per user", () => {
  const user = { roles: [{ name: "DEALER" }, { name: "MODERATOR" }] };
  assert.equal(hasAnyRole(user, ["MODERATOR"]), true);
  assert.equal(hasAnyRole(user, ["ADMIN"]), false);
});

test("assignable roles come from server catalog and exclude current roles", () => {
  assert.deepEqual(
    getAssignableRoles(
      [
        { id: 4, name: "DEALER" },
        { id: 5, name: "MODERATOR" },
        { id: 6, name: "ADMIN" },
      ],
      [{ id: 4, name: "DEALER" }]
    ),
    [
      { id: 5, name: "MODERATOR" },
      { id: 6, name: "ADMIN" },
    ]
  );
});
