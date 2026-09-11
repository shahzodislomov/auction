import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LangSwitch, type Lang } from "@/context/LangSwitch";

import { AdminFilterTabs } from "./AdminFilterTabs";
import { OperationalTable } from "./OperationalTable";

const rows = [
  {
    id: "2",
    primary: "Zulu Motors",
    secondary: "Seller",
    value: "2 UZS",
    status: "Review",
    tone: "warning" as const,
  },
  {
    id: "1",
    primary: "Alpha Motors",
    secondary: "Buyer",
    value: "1 UZS",
    status: "Active",
    tone: "success" as const,
  },
];

describe("OperationalTable semantics", () => {
  it("uses native headers and exposes the current sort direction", async () => {
    const user = userEvent.setup();
    render(<OperationalTable label="Moderatsiya navbati" onOpen={vi.fn()} rows={rows} />);

    const table = screen.getByRole("table", { name: "Moderatsiya navbati" });
    const nameHeader = within(table).getByRole("columnheader", { name: "Nomi" });
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");

    let bodyRows = within(table).getAllByRole("row").slice(1);
    expect(bodyRows[0]).toHaveTextContent("Alpha Motors");

    await user.click(screen.getByRole("button", { name: /saralash/i }));

    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    bodyRows = within(table).getAllByRole("row").slice(1);
    expect(bodyRows[0]).toHaveTextContent("Zulu Motors");
  });

  it("opens details by clicking the row", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<OperationalTable label="Users" onOpen={onOpen} rows={rows.slice(0, 1)} />);

    await user.click(screen.getByRole("row", { name: /zulu motors tafsilotlarini ochish/i }));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);
  });

  it("keeps the table visible with localized skeleton rows while loading", () => {
    render(<OperationalTable label="Users" loading onOpen={vi.fn()} rows={[]} />);

    expect(screen.getByRole("table", { name: "Users" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Ma’lumotlar yuklanmoqda");
    expect(screen.getAllByTestId("operational-table-skeleton-row")).toHaveLength(6);
    expect(screen.queryByText("So‘rov bo‘yicha yozuv topilmadi.")).not.toBeInTheDocument();
  });

  it("uses the table context in the localized search placeholder", () => {
    render(<OperationalTable label="Foydalanuvchilar" onOpen={vi.fn()} rows={rows} />);

    expect(screen.getByRole("textbox", { name: "Jadvaldan qidirish" })).toHaveAttribute(
      "placeholder",
      "Foydalanuvchilar bo‘yicha qidiring...",
    );
  });

  it("renders status filters in a dedicated row before the table", () => {
    render(
      <OperationalTable
        label="Foydalanuvchilar"
        onOpen={vi.fn()}
        rows={rows}
        toolbarControls={
          <AdminFilterTabs
            ariaLabel="Holat bo‘yicha"
            onChange={vi.fn()}
            options={[
              { count: 2, label: "Barcha holatlar", value: "" },
              { count: 1, label: "Faol", tone: "success", value: "ACTIVE" },
            ]}
            value=""
          />
        }
      />,
    );

    const tablist = screen.getByRole("tablist", { name: "Holat bo‘yicha" });
    const table = screen.getByRole("table", { name: "Foydalanuvchilar" });
    const tableCard = table.closest("section");
    expect(tablist.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(tableCard).not.toContainElement(tablist);
    expect(screen.getByRole("tab", { name: "Barcha holatlar: 2" })).toHaveAttribute("aria-selected", "true");
  });

  it.each([
    ["uz", "Ma’lumotlar yuklanmoqda"],
    ["en", "Loading data"],
    ["ru", "Данные загружаются"],
  ] as const)("localizes the loading status in %s", (currentLang: Lang, loadingText) => {
    render(
      <LangSwitch.Provider value={{ currentLang, setCurrentLang: vi.fn() }}>
        <OperationalTable label="Users" loading onOpen={vi.fn()} rows={[]} />
      </LangSwitch.Provider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent(loadingText);
  });

  it("opens the action menu first and details only after selecting view", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<OperationalTable label="Users" onOpen={onOpen} rows={rows.slice(0, 1)} />);

    const action = screen.getByRole("button", { name: /zulu motors uchun amallar/i });
    expect(action).toHaveClass("min-h-11", "min-w-11");
    expect(action).not.toHaveClass("hidden");

    await user.click(action);
    expect(onOpen).not.toHaveBeenCalled();

    await user.click(screen.getByRole("menuitem", { name: "Ko‘rish" }));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);
  });

  it("associates responsive cells with their column headers", () => {
    render(<OperationalTable label="Users" onOpen={vi.fn()} rows={rows.slice(0, 1)} />);

    const referenceHeader = screen.getByRole("columnheader", { name: "Raqam" });
    const referenceCell = screen.getByRole("cell", { name: "Raqam2" });
    const statusHeader = screen.getByRole("columnheader", { name: "Holat" });
    const statusCell = screen.getByRole("cell", { name: /Holat.*Review/i });

    expect(referenceHeader).toHaveAttribute("id");
    expect(referenceCell).toHaveAttribute("headers", referenceHeader.id);
    expect(statusHeader).toHaveAttribute("id");
    expect(statusCell).toHaveAttribute("headers", statusHeader.id);
    expect(
      screen.getAllByText("Raqam").find((element) => element.tagName === "SPAN"),
    ).not.toHaveAttribute("aria-hidden");
  });
});
