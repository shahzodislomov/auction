import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VehicleImage } from "@/components/auction/VehicleImage";
import { renderWithAppProviders } from "@/test/render";

describe("VehicleImage", () => {
  it("uses a neutral brand state when no vehicle image is supplied", () => {
    renderWithAppProviders(
      <div className="relative h-64">
        <VehicleImage image={null} alt="Vehicle" />
      </div>,
    );

    const fallback = screen.getByRole("img", {
      name: "Vehicle image unavailable",
    });
    expect(fallback).toBeVisible();
    expect(fallback.innerHTML).toContain("brand.png");
    expect(fallback.innerHTML).not.toContain(
      "champagne-ledger-featured-suv.png",
    );
  });

  it("replaces a broken API image with the neutral unavailable state", () => {
    renderWithAppProviders(
      <div className="relative h-64">
        <VehicleImage
          image={{
            id: "broken",
            url: "/broken-vehicle.jpg",
            alt: { default: null, en: null, ru: null, uz: null },
          }}
          alt="Current lot"
        />
      </div>,
    );

    fireEvent.error(screen.getByRole("img", { name: "Current lot" }));

    const fallback = screen.getByRole("img", {
      name: "Vehicle image unavailable",
    });
    expect(fallback.innerHTML).toContain("brand.png");
    expect(fallback.innerHTML).not.toContain(
      "champagne-ledger-featured-suv.png",
    );
  });
});
