import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LangSwitch } from "@/context/LangSwitch";

import { CabinetLedger } from "./CabinetLedger";

const rows = [
  {
    id: "TX-1",
    title: "Deposit",
    meta: "Lot #42",
    amount: "10 UZS",
    status: "Confirmed",
    tone: "success" as const,
  },
];

describe("CabinetLedger semantics", () => {
  it("renders native table headers and keeps the row action available", () => {
    render(<CabinetLedger rows={rows} />);

    expect(screen.getByRole("table", { name: /kabinet operatsiyalari/i })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Raqam" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Operatsiya" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "RaqamTX-1" })).toHaveAttribute("data-label", "Raqam");

    const action = screen.getByRole("button", { name: /deposit tafsilotlari/i });
    expect(action).toHaveClass("min-h-11", "min-w-11");
    expect(action).not.toHaveClass("hidden");
  });

  it("localizes its table and action labels", () => {
    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <CabinetLedger rows={rows} />
      </LangSwitch.Provider>,
    );

    expect(screen.getByRole("table", { name: "Cabinet operations" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Reference" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Open Deposit details" })).toBeVisible();
  });

  it("associates responsive cells with their column headers", () => {
    render(<CabinetLedger rows={rows} />);

    const referenceHeader = screen.getByRole("columnheader", { name: "Raqam" });
    const referenceCell = screen.getByRole("cell", { name: "RaqamTX-1" });
    const statusHeader = screen.getByRole("columnheader", { name: "Holat" });
    const statusCell = screen.getByRole("cell", { name: "HolatConfirmed" });

    expect(referenceHeader).toHaveAttribute("id");
    expect(referenceCell).toHaveAttribute("headers", referenceHeader.id);
    expect(statusHeader).toHaveAttribute("id");
    expect(statusCell).toHaveAttribute("headers", statusHeader.id);
    expect(
      screen.getAllByText("Raqam").find((element) => element.tagName === "SPAN"),
    ).not.toHaveAttribute("aria-hidden");
  });
});
