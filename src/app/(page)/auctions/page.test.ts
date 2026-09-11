import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
}));

import { generateMetadata } from "./page";

describe("auction discovery metadata", () => {
  it("uses the persisted locale when no language query is present", async () => {
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValueOnce({
      get: () => ({ value: "en" }),
    } as Awaited<ReturnType<typeof cookies>>);

    const metadata = await generateMetadata({
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe("Vehicle auctions | TezAuksion");
    expect(metadata.alternates?.canonical).toBe("/auctions?lang=en");
  });
});
