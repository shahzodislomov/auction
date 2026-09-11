import { describe, expect, it } from "vitest";

import nextConfig from "../../../next.config";

describe("legacy create vehicle route", () => {
  it("pins build roots to this worktree", () => {
    expect(nextConfig.outputFileTracingRoot).toBe(process.cwd());
    expect(nextConfig.turbopack?.root).toBe(nextConfig.outputFileTracingRoot);
  });

  it("permanently redirects to the supported seller wizard", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          destination: "/sell",
          permanent: true,
          source: "/create-vehicle-lot/page",
        },
        {
          destination: "/sell",
          permanent: true,
          source: "/create-vehicle-lot",
        },
      ]),
    );
  });
});
