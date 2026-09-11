import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi, beforeEach } from "vitest";

import { VehicleQuestionnaire } from "./VehicleQuestionnaire";

const spies = vi.hoisted(() => ({
  routerPush: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: spies.routerPush,
  }),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: spies.toastError,
    success: spies.toastSuccess,
  },
}));

vi.mock("@/context/UserContext", () => ({
  useUserContext: () => ({
    user: { id: 1, firstname: "Test" },
    isAuthenticated: true,
  }),
}));

vi.mock("@/queries/auction-listings", () => ({
  useCreateAuctionWithVehicle: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
}));

vi.mock("@/queries/vehicles", () => ({
  useVehicleMakes: () => ({
    data: [
      { id: 1, name: "Chevrolet" },
      { id: 2, name: "BYD" },
    ],
  }),
  useVehicleModels: (makeId?: string) => ({
    data: makeId ? [{ id: 10, name: "Cobalt" }] : [],
  }),
  useDecodeVin: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
  useUploadVehicleAssets: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
  resolveCreatedVehicleId: () => "veh-123",
}));

describe("VehicleQuestionnaire Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("blocks next step and shows error when required identity fields are empty", async () => {
    const user = userEvent.setup();
    render(<VehicleQuestionnaire />);

    // Initially at Identity step
    expect(screen.getByText("1. Avtomobil identifikatsiyasi")).toBeVisible();

    // Click "Keyingi" without filling VIN, make, model
    const nextBtn = screen.getByRole("button", { name: "Keyingi" });
    await user.click(nextBtn);

    // Toast error should have been triggered
    expect(spies.toastError).toHaveBeenCalled();

    // It should still be on step 1 (not advanced)
    expect(screen.getByText("1. Avtomobil identifikatsiyasi")).toBeVisible();
    expect(screen.queryByText("2. Texnik xususiyatlar")).not.toBeInTheDocument();
  });

  test("advances to next step when required fields are properly filled", async () => {
    const user = userEvent.setup();
    render(<VehicleQuestionnaire />);

    // Enter valid 17-char VIN
    const vinInput = screen.getByPlaceholderText("Masalan: KMHD841EAFA...");
    await user.type(vinInput, "1HGCR2F83HA000000");

    // Select Make
    const makeSelect = screen.getByRole("combobox", { name: /Markasi/i });
    await user.selectOptions(makeSelect, "1");

    // Select Model
    const modelSelect = screen.getByRole("combobox", { name: /Modeli/i });
    await user.selectOptions(modelSelect, "10");

    // Click "Keyingi"
    const nextBtn = screen.getByRole("button", { name: "Keyingi" });
    await user.click(nextBtn);

    // Successfully transitioned to Step 2
    expect(screen.getByText("2. Texnik xususiyatlar")).toBeVisible();
  });
});
