import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AuctionCardGridSkeleton,
  DashboardTableSkeleton,
} from "./ContentSkeletons";

describe("ContentSkeletons", () => {
  it("renders the requested number of auction placeholders with a loading label", () => {
    render(<AuctionCardGridSkeleton count={3} label="Auksionlar yuklanmoqda" />);

    expect(screen.getByRole("status", { name: "Auksionlar yuklanmoqda" })).toBeInTheDocument();
    expect(screen.getAllByTestId("auction-card-skeleton")).toHaveLength(3);
  });

  it("announces a dashboard table loading state only once", () => {
    render(<DashboardTableSkeleton label="Ma'lumotlar yuklanmoqda" />);

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status", { name: "Ma'lumotlar yuklanmoqda" })).toBeInTheDocument();
  });
});
