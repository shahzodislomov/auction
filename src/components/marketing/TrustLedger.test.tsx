import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TrustLedger } from "@/components/marketing/TrustLedger";
import { renderWithAppProviders } from "@/test/render";

describe("TrustLedger", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses implemented workflow guidance instead of unsupported assurance claims", () => {
    vi.stubEnv("NODE_ENV", "production");
    renderWithAppProviders(<TrustLedger />, { locale: "en" });

    expect(screen.getByText("Find a vehicle")).toBeVisible();
    expect(screen.getByText("Review the details")).toBeVisible();
    expect(screen.getByText("Save to watchlist")).toBeVisible();
    expect(screen.getByText("Follow the auction")).toBeVisible();
    expect(screen.queryByText("Trusted inspection")).not.toBeInTheDocument();
    expect(screen.queryByText("Verified outcomes")).not.toBeInTheDocument();
    expect(screen.queryByText("Active buyers")).not.toBeInTheDocument();
    expect(screen.queryByText("Prices grounded in evidence")).not.toBeInTheDocument();
  });
});
