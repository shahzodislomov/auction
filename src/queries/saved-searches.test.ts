import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api/api";

import {
  deleteSavedSearch,
  fetchMySavedSearches,
  normalizeSavedSearches,
  updateSavedSearch,
} from "./saved-searches";

vi.mock("@/api/api", () => ({
  api: { delete: vi.fn(), get: vi.fn(), put: vi.fn() },
}));

describe("saved searches", () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockReset();
    vi.mocked(api.get).mockReset();
    vi.mocked(api.put).mockReset();
  });

  it.each([
    { data: [{ id: 1 }] },
    { data: { content: [{ id: 1 }] } },
    { data: { meta: { list: [{ id: 1 }] } } },
    { meta: { dtoList: [{ id: 1 }] } },
  ])("normalizes supported backend envelopes", (response) => {
    expect(normalizeSavedSearches(response).items).toEqual([{ id: 1 }]);
  });

  it("requests the authenticated user's page", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: { items: [{ searchId: 9, name: "SUV" }] } },
    });

    await expect(fetchMySavedSearches(2, 12)).resolves.toMatchObject({
      items: [{ searchId: 9, name: "SUV" }],
    });
    expect(api.get).toHaveBeenCalledWith("/saved-searches/mine", {
      params: { page: 2, size: 12 },
    });
  });

  it("updates a saved search by path id with filters and notify", async () => {
    const payload = {
      filters: { make: "Toyota", status: "LIVE" },
      notify: true,
    };
    vi.mocked(api.put).mockResolvedValue({
      data: { status: "OK", data: { searchId: 1, ...payload } },
    });

    await expect(updateSavedSearch(1, payload)).resolves.toMatchObject({
      status: "OK",
    });
    expect(api.put).toHaveBeenCalledWith("/saved-searches/1", payload);
  });

  it("deletes a saved search by path id", async () => {
    vi.mocked(api.delete).mockResolvedValue({
      data: { status: "OK", message: "Saved search deleted" },
    });

    await expect(deleteSavedSearch(2)).resolves.toMatchObject({
      status: "OK",
    });
    expect(api.delete).toHaveBeenCalledWith("/saved-searches/2");
  });
});
