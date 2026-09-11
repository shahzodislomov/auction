import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveApiBaseUrl,
  resolveAppEnvironment,
  resolveV2ApiBaseUrl,
} from "../src/config/environment";
import { normalizeRequestError } from "../src/api/errors";
import { api, legacyApiClient } from "../src/api/api";
import { apiV2 } from "../src/api/v2/client";
import {
  parseEnumValue,
  parsePageRequest,
  parsePageResponse,
  type AuctionStatus,
} from "../src/api/v2/contracts";
import { createLegacyLotIdentity } from "../src/api/v2/compat";

const REAL_API_BASE_URL = "https://api.tezauksion.uz";
const REAL_WS_URL = "https://api.tezauksion.uz/ws";

test("environment URL resolution trims trailing slashes and derives v2 base", () => {
  const env = resolveAppEnvironment({
    NEXT_PUBLIC_API_BASE_URL: `${REAL_API_BASE_URL}/`,
    NEXT_PUBLIC_WS_URL: `${REAL_WS_URL}/`,
  });

  assert.equal(env.apiBaseUrl, REAL_API_BASE_URL);
  assert.equal(env.v2ApiBaseUrl, `${REAL_API_BASE_URL}/api/v1`);
  assert.equal(env.webSocketUrl, REAL_WS_URL);
  assert.equal(resolveApiBaseUrl(env), REAL_API_BASE_URL);
  assert.equal(resolveV2ApiBaseUrl(env), `${REAL_API_BASE_URL}/api/v1`);
});

test("environment URL resolution falls back to the production API base", () => {
  const env = resolveAppEnvironment({});

  assert.equal(env.apiBaseUrl, REAL_API_BASE_URL);
  assert.equal(env.v2ApiBaseUrl, `${REAL_API_BASE_URL}/api/v1`);
});

test("environment URL resolution accepts explicit v2 base without duplicating api/v1", () => {
  const env = resolveAppEnvironment({
    NEXT_PUBLIC_API_BASE_URL: `${REAL_API_BASE_URL}/api/v1`,
    NEXT_PUBLIC_API_V2_BASE_URL: `${REAL_API_BASE_URL}/api/v1/`,
    NEXT_PUBLIC_WS_URL: REAL_WS_URL,
  });

  assert.equal(env.apiBaseUrl, `${REAL_API_BASE_URL}/api/v1`);
  assert.equal(env.v2ApiBaseUrl, `${REAL_API_BASE_URL}/api/v1`);
});

test("request error normalization preserves standard API error details", () => {
  const normalized = normalizeRequestError({
    response: {
      status: 422,
      data: {
        code: "VALIDATION_ERROR",
        message: "VIN is invalid",
        details: { field: "vin" },
        timestamp: "2026-07-16T04:00:00Z",
        path: "/api/v1/vehicles",
      },
    },
  });

  assert.deepEqual(normalized, {
    code: "VALIDATION_ERROR",
    message: "VIN is invalid",
    status: 422,
    details: { field: "vin" },
    timestamp: "2026-07-16T04:00:00Z",
    path: "/api/v1/vehicles",
    isNetworkError: false,
    raw: {
      code: "VALIDATION_ERROR",
      message: "VIN is invalid",
      details: { field: "vin" },
      timestamp: "2026-07-16T04:00:00Z",
      path: "/api/v1/vehicles",
    },
  });
});

test("request error normalization handles network and unknown errors", () => {
  assert.equal(
    normalizeRequestError({ request: {}, message: "Network Error" }).code,
    "NETWORK_ERROR",
  );
  assert.equal(normalizeRequestError(new Error("Boom")).message, "Boom");
});

test("pagination parsing normalizes page, size, sort, and totals", () => {
  assert.deepEqual(
    parsePageRequest({ page: -3, size: 500, sort: [{ field: "createdAt", direction: "DESC" }] }),
    { page: 0, size: 100, sort: [{ field: "createdAt", direction: "DESC" }] },
  );

  assert.deepEqual(
    parsePageResponse({
      content: [{ id: "a" }],
      page: 2,
      size: 20,
      totalElements: 45,
      totalPages: 3,
      sort: [{ field: "createdAt", direction: "ASC" }],
    }),
    {
      content: [{ id: "a" }],
      page: 2,
      size: 20,
      totalElements: 45,
      totalPages: 3,
      sort: [{ field: "createdAt", direction: "ASC" }],
    },
  );
});

test("enum parsing keeps explicit unknown handling", () => {
  const known = parseEnumValue<AuctionStatus>(
    "LIVE",
    ["DRAFT", "SCHEDULED", "LIVE", "FINISHED", "CANCELED"],
    "UNKNOWN_AUCTION_STATUS",
  );
  const unknown = parseEnumValue<AuctionStatus>(
    "PAUSED_BY_BACKEND",
    ["DRAFT", "SCHEDULED", "LIVE", "FINISHED", "CANCELED"],
    "UNKNOWN_AUCTION_STATUS",
  );

  assert.equal(known.value, "LIVE");
  assert.equal(known.isKnown, true);
  assert.equal(unknown.value, "UNKNOWN_AUCTION_STATUS");
  assert.equal(unknown.isKnown, false);
  assert.equal(unknown.raw, "PAUSED_BY_BACKEND");
});

test("legacy lot identity compatibility maps once to vehicle and auction identifiers", () => {
  assert.deepEqual(createLegacyLotIdentity(42), {
    lotId: "42",
    vehicleId: "42",
    auctionId: "42",
    source: "legacy-lot",
  });
});

test("legacy and v2 clients coexist with separate base URLs", () => {
  assert.equal(api, legacyApiClient);
  assert.notEqual(api, apiV2);
  assert.equal(api.defaults.baseURL, REAL_API_BASE_URL);
  assert.equal(apiV2.defaults.baseURL, `${REAL_API_BASE_URL}/api/v1`);
});

test("request error normalization converts 401 Unauthorized correctly", () => {
  const normalized = normalizeRequestError({
    response: {
      status: 401,
      data: {
        code: "UNAUTHORIZED",
        message: "Session expired",
      },
    },
  });

  assert.equal(normalized.status, 401);
  assert.equal(normalized.code, "UNAUTHORIZED");
  assert.equal(normalized.message, "Session expired");
  assert.equal(normalized.isNetworkError, false);
});
