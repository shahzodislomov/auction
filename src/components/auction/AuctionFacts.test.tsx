import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuctionFacts, localizedDomainValue } from "./AuctionFacts";
import { demoVehicleAuctions } from "@/lib/fixtures/vehicleAuctions";

describe("AuctionFacts", () => {
  it("translates domain enums correctly in Uzbek and Russian", () => {
    // Drivetrain
    expect(localizedDomainValue("FWD", "uz")).toBe("Old privod (FWD)");
    expect(localizedDomainValue("RWD", "uz")).toBe("Orqa privod (RWD)");
    expect(localizedDomainValue("AWD", "uz")).toBe("To‘liq privod (AWD)");
    expect(localizedDomainValue("4WD", "ru")).toBe("Полный привод (4x4)");

    // Fuel
    expect(localizedDomainValue("GASOLINE", "uz")).toBe("Benzin");
    expect(localizedDomainValue("petrol", "uz")).toBe("Benzin");
    expect(localizedDomainValue("DIESEL", "ru")).toBe("Дизель");
    expect(localizedDomainValue("ELECTRIC", "uz")).toBe("Elektr");

    // Transmission
    expect(localizedDomainValue("AUTOMATIC", "uz")).toBe("Avtomat");
    expect(localizedDomainValue("MANUAL", "ru")).toBe("Механика");

    // Condition
    expect(localizedDomainValue("EXCELLENT", "uz")).toBe("A'lo holatda");
    expect(localizedDomainValue("GOOD", "uz")).toBe("Yaxshi holatda");
    expect(localizedDomainValue("DAMAGED", "uz")).toBe("Shikastlangan");
    expect(localizedDomainValue("NOT_RUNNING", "uz")).toBe("Yurmaydi (nosoz)");
  });

  it("renders compact specification cards with translated facts", () => {
    const testAuction = {
      ...demoVehicleAuctions[0],
      make: "Chevrolet",
      model: "Cobalt",
      fuel: "GASOLINE",
      transmission: "AUTOMATIC",
      drivetrain: "FWD",
      condition: "EXCELLENT",
    };

    render(<AuctionFacts auction={testAuction} locale="uz" />);

    // Header badge
    expect(screen.getByText("Chevrolet Cobalt")).toBeVisible();

    // Translated specs
    expect(screen.getByText("Benzin")).toBeVisible();
    expect(screen.getByText("Avtomat")).toBeVisible();
    expect(screen.getByText("Old privod (FWD)")).toBeVisible();
    expect(screen.getByText("A'lo holatda")).toBeVisible();
  });
});
