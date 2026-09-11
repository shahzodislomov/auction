import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PageSizeSelect } from "@/components/ui/PageSizeSelect";
import { renderWithAppProviders } from "@/test/render";

describe("PageSizeSelect", () => {
  it("offers the supported page sizes and reports the selected number", () => {
    const onChange = vi.fn();
    renderWithAppProviders(<PageSizeSelect onChange={onChange} value={10} />, { locale: "uz" });

    const select = screen.getByRole("combobox", { name: "Sahifadagi yozuvlar soni" });
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["10", "25", "50", "100"]);

    fireEvent.change(select, { target: { value: "50" } });
    expect(onChange).toHaveBeenCalledWith(50);
  });

  it("localizes its accessible label", () => {
    renderWithAppProviders(<PageSizeSelect onChange={vi.fn()} value={25} />, { locale: "ru" });
    expect(screen.getByRole("combobox", { name: "Записей на странице" })).toHaveValue("25");
  });
});
