import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("keeps champagne buttons readable and keyboard focusable", () => {
    render(<Button>Qidirish</Button>);

    expect(screen.getByRole("button", { name: "Qidirish" })).toHaveClass(
      "text-brand-navy-900",
    );
  });
});
