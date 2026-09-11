import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AppSelect } from "./AppSelect";

describe("AppSelect component", () => {
  const sampleOptions = [
    { value: "all", label: "Все" },
    { value: "notify-on", label: "Уведомления включены" },
    { value: "notify-off", label: "Уведомления выключены" },
  ];

  it("renders trigger with placeholder or selected label", () => {
    render(<AppSelect native={false} options={sampleOptions} value="all" />);
    expect(screen.getByRole("button")).toHaveTextContent("Все");
  });

  it("opens options popup on click and fires onChange when selected", () => {
    const handleChange = vi.fn();
    render(
      <AppSelect
        native={false}
        options={sampleOptions}
        value="all"
        onChange={handleChange}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const optionToSelect = screen.getByText("Уведомления включены");
    expect(optionToSelect).toBeInTheDocument();

    fireEvent.click(optionToSelect);
    expect(handleChange).toHaveBeenCalledWith("notify-on", sampleOptions[1]);
  });

  it("renders in native fallback mode", () => {
    const handleChange = vi.fn();
    render(
      <AppSelect
        native
        options={sampleOptions}
        value="notify-on"
        onChange={handleChange}
      />
    );

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("notify-on");

    fireEvent.change(select, { target: { value: "notify-off" } });
    expect(handleChange).toHaveBeenCalledWith("notify-off", sampleOptions[2]);
  });
});
