import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { LangSwitch } from "@/context/LangSwitch";

import {
  formatAuctionApiWallTime,
  formatLocalWallTime,
  hasMinimumAuctionLeadTime,
  vehicleDraftKey,
  VehicleWizard,
} from "./VehicleWizard";

const wizardSpies = vi.hoisted(() => ({
  createVehicle: vi.fn(),
  createVehicleSuccess: null as null | ((response: unknown) => void),
  createVehicleError: null as null | ((error: unknown) => void),
  uploadAssets: vi.fn(),
  uploadAssetsSuccess: null as null | ((response: unknown) => void),
  uploadVehicleImage: vi.fn(),
  editVehicle: null as null | Record<string, unknown>,
  updateVehicle: vi.fn(),
  updateVehicleSuccess: null as null | ((response: unknown) => void),
  updateVehicleError: null as null | ((error: unknown) => void),
  uploadVehicleImageSuccess: null as null | ((response: unknown) => void),
  routerPush: vi.fn(),
  aiValuationResult: null as null | {
    data?: unknown;
    error?: unknown;
  },
  user: {
    id: 7,
    firstname: "Seller",
    roles: [{ name: "SELLER" }],
  } as null | {
    id?: string | number;
    firstname: string;
    roles: Array<{ name: string }>;
  },
}));

vi.mock("@/queries/auction-listings", () => ({
  useCreateAuctionWithVehicle: () => ({
    isPending: false,
    mutate: (payload: unknown, options?: { onSuccess?: (response: unknown) => void; onError?: (error: unknown) => void }) => {
      wizardSpies.createVehicle(payload);
      wizardSpies.createVehicleSuccess = options?.onSuccess ?? null;
      wizardSpies.createVehicleError = options?.onError ?? null;
    },
  }),
  useAiValuation: () => ({
    isPending: false,
    mutate: (payload: unknown, options?: { onSuccess?: (response: unknown) => void; onError?: (error: unknown) => void }) => {
      if (wizardSpies.aiValuationResult?.error) {
        options?.onError?.(wizardSpies.aiValuationResult.error);
        return;
      }
      if (wizardSpies.aiValuationResult?.data !== undefined) {
        options?.onSuccess?.(wizardSpies.aiValuationResult.data);
        return;
      }
      options?.onSuccess?.({
        priceMinUsd: 1200,
        priceMaxUsd: 3000,
        priceMinUzs: 15240000,
        priceMaxUzs: 38100000,
        currency: "USD"
      });
    },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: wizardSpies.routerPush }),
}));

vi.mock("@/queries/vehicles", () => ({
  useDecodeVin: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
  useVehicleMakes: () => ({
    data: [
      { id: 1, name: "Volkswagen" },
      { id: 101, name: "Account A make" },
      { id: 202, name: "Account B make" },
    ],
    isError: false,
    isLoading: false,
  }),
  useVehicleModels: (makeId: string) => ({
    data: makeId === "1" ? [{ id: 10, name: "Passat" }] : [],
    isError: false,
    isLoading: false,
  }),
  useVehicleDetail: () => ({ data: wizardSpies.editVehicle, isError: false, isLoading: false }),
  useUpdateVehicle: () => ({
    isPending: false,
    mutate: (payload: unknown, options?: { onSuccess?: (response: unknown) => void; onError?: (error: unknown) => void }) => {
      wizardSpies.updateVehicle(payload);
      wizardSpies.updateVehicleSuccess = options?.onSuccess ?? null;
      wizardSpies.updateVehicleError = options?.onError ?? null;
    },
  }),
  resolveCreatedVehicleId: (response: unknown) => {
    const record = response as { vehicleId?: number; id?: number };
    return record?.vehicleId ?? record?.id ?? null;
  },
  useUploadVehicleAssets: () => {
    return {
      isPending: false,
      mutate: (payload: unknown, options?: { onSuccess?: (response: unknown) => void }) => {
        wizardSpies.uploadAssets(payload);
        wizardSpies.uploadAssetsSuccess = options?.onSuccess ?? null;
      },
    };
  },
}));

vi.mock("@/queries/reference-data", () => ({
  useActiveRegions: (locale: string) => ({
    options: [
      {
        label:
          locale === "ru"
            ? "Ташкентская область"
            : locale === "en"
              ? "Tashkent Region"
              : "Toshkent viloyati",
        raw: { id: "11", nameUz: "Toshkent viloyati", nameRu: "Ташкентская область", nameEn: "Tashkent Region" },
        value: "11",
      },
      {
        label:
          locale === "ru"
            ? "Город Ташкент"
            : locale === "en"
              ? "Tashkent City"
              : "Toshkent",
        raw: { id: "14", nameUz: "Toshkent", nameRu: "Город Ташкент", nameEn: "Tashkent City" },
        value: "14",
      },
    ],
    isError: false,
    isLoading: false,
  }),
}));

vi.mock("@/context/UserContext", () => ({
  useUserContext: () => ({
    isAuthenticated: Boolean(wizardSpies.user),
    user: wizardSpies.user,
  }),
}));

function renderInEnglish(ui: ReactElement) {
  return render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <LangSwitch.Provider
        value={{ currentLang: "en", setCurrentLang: vi.fn() }}
      >
        {ui}
      </LangSwitch.Provider>
    </LocalizationProvider>,
  );
}

async function fillAuctionStep(user: ReturnType<typeof userEvent.setup>) {
  const start = new Date(Date.now() + 12 * 60 * 60 * 1000);
  const end = new Date(Date.now() + 36 * 60 * 60 * 1000);
  const local = (value: Date) => new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const startTime = local(start);
  const endTime = local(end);
  await user.type(screen.getByLabelText(/Starting price/i), "20000");
  await user.type(screen.getByLabelText("Reserve price"), "25000");
  await user.type(screen.getByLabelText(/Bid increment/i), "500");
  await user.type(screen.getByLabelText("Deposit (%)"), "10");
  await user.click(screen.getByRole("button", { name: "Next step" }));
  fireEvent.change(screen.getByLabelText("Preferred auction start"), { target: { value: startTime } });
  fireEvent.change(screen.getByLabelText("Auction end"), { target: { value: endTime } });
  await user.click(screen.getByRole("button", { name: "Next step" }));
  return { endTime, startTime };
}

function renderInLanguage(ui: ReactElement, currentLang: "en" | "ru" | "uz") {
  return render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <LangSwitch.Provider value={{ currentLang, setCurrentLang: vi.fn() }}>
        {ui}
      </LangSwitch.Provider>
    </LocalizationProvider>,
  );
}

function EnglishProviders({ children }: { children: ReactElement }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <LangSwitch.Provider
        value={{ currentLang: "en", setCurrentLang: vi.fn() }}
      >
        {children}
      </LangSwitch.Provider>
    </LocalizationProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  wizardSpies.createVehicleSuccess = null;
  wizardSpies.uploadAssetsSuccess = null;
  wizardSpies.editVehicle = null;
  wizardSpies.updateVehicle.mockReset();
  wizardSpies.uploadVehicleImageSuccess = null;
  wizardSpies.routerPush.mockReset();
  wizardSpies.aiValuationResult = null;
  wizardSpies.user = {
    id: 7,
    firstname: "Seller",
    roles: [{ name: "SELLER" }],
  };
  window.localStorage.clear();
  window.localStorage.setItem("userId", "7");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("vehicle seller wizard", () => {
  test("prefills the new-vehicle form when opened in edit mode", async () => {
    wizardSpies.editVehicle = {
      bodyType: "SEDAN", color: "white", conditionGrade: "GOOD", description: "Clean vehicle",
      drivetrain: "FWD", engineVolume: 1.5, fuelType: "PETROL", makeId: 1, mileage: 125000,
      modelId: 10, region: "Toshkent viloyati", transmission: "AUTOMATIC",
      vehicleId: 13, vin: "98GV7DAPNLPEV1NKK", year: 2025,
    };

    renderInEnglish(<VehicleWizard capabilityState="live" editVehicleId="13" />);

    await waitFor(() => expect(screen.getByLabelText("VIN")).toHaveValue("98GV7DAPNLPEV1NKK"));
    expect(screen.getByLabelText("Make")).toHaveValue("1");
    expect(screen.getByLabelText("Model")).toHaveValue("10");
    expect(screen.getByRole("combobox", { name: "Year" })).toHaveValue("2025");
  });

  test("uses a bounded year selector with quick recent choices", async () => {
    const user = userEvent.setup();
    renderInEnglish(<VehicleWizard capabilityState="demo" />);

    const latestYear = String(new Date().getFullYear());
    const year = screen.getByRole("combobox", { name: "Year" });

    expect(screen.getByRole("option", { name: latestYear })).toHaveValue(latestYear);
    expect(screen.queryByRole("option", { name: "1949" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: latestYear }));
    expect(year).toHaveValue(latestYear);
  });

  test("select placeholder options are disabled and hidden to prevent resetting", () => {
    renderInEnglish(<VehicleWizard capabilityState="demo" initialStep={0} />);

    const makeSelect = screen.getByLabelText("Make");
    const options = makeSelect.querySelectorAll("option");
    const placeholderOption = options[0];

    expect(placeholderOption).toBeDisabled();
    expect(placeholderOption).toHaveAttribute("hidden");
  });

  test("displays VIN format validation error when invalid characters are entered", async () => {
    const user = userEvent.setup();
    renderInEnglish(<VehicleWizard capabilityState="demo" initialStep={0} />);

    const vin = screen.getByLabelText("VIN");
    await user.type(vin, "1234567890123456@"); // invalid character '@'

    await user.click(screen.getByRole("button", { name: "Next step" }));

    expect(
      await screen.findByText(
        "VIN must contain 17 valid alphanumeric characters.",
      ),
    ).toBeInTheDocument();
  });

  test.each([
    ["en", "Petrol", "Manual", "Front-wheel drive", "SUV", "Excellent"],
    ["uz", "Benzin", "Mexanik", "Old tortish", "Yo‘ltanlamas", "A’lo"],
    ["ru", "Бензин", "Механическая", "Передний привод", "Внедорожник", "Отличное"],
  ] as const)("translates selector labels in %s without changing backend values", (language, fuel, transmission, drivetrain, bodyType, condition) => {
    const technical = renderInLanguage(<VehicleWizard capabilityState="demo" initialStep={1} />, language);

    expect(screen.getByRole("option", { name: fuel })).toHaveValue("PETROL");
    expect(screen.getByRole("option", { name: transmission })).toHaveValue("MANUAL");
    expect(screen.getByRole("option", { name: drivetrain })).toHaveValue("FWD");
    expect(screen.getByRole("option", { name: bodyType })).toHaveValue("SUV");

    technical.unmount();
    renderInLanguage(<VehicleWizard capabilityState="demo" initialStep={2} />, language);
    expect(screen.getByRole("option", { name: condition })).toHaveValue("EXCELLENT");
  });

  test("loads regions into a selector and lets the seller pick a vehicle color", async () => {
    const user = userEvent.setup();
    renderInEnglish(<VehicleWizard capabilityState="demo" initialStep={2} />);

    const region = screen.getByLabelText("Region");
    expect(region).toBeEnabled();
    expect(screen.getByRole("option", { name: "Tashkent Region" })).toBeVisible();
    await user.selectOptions(region, "Tashkent City");
    expect(region).toHaveValue("Tashkent City");

    const colors = screen.getAllByRole("radio");
    expect(colors).toHaveLength(10);
    const blue = screen.getByRole("radio", { name: "Blue" });
    await user.click(blue);
    expect(blue).toHaveAttribute("aria-checked", "true");
  });

  test.each([
    ["en", "Tashkent Region", "Tashkent City"],
    ["uz", "Toshkent viloyati", "Toshkent shahri"],
    ["ru", "Ташкентская область", "Город Ташкент"],
  ] as const)("translates region selector labels in %s", (language, region1, region2) => {
    renderInLanguage(<VehicleWizard capabilityState="demo" initialStep={2} />, language);

    expect(screen.getByRole("option", { name: region1 })).toBeVisible();
    expect(screen.getByRole("option", { name: region2 })).toBeVisible();
  });

  test.each([
    ["uz", "Belgilangan summa", "Foiz"],
    ["en", "Fixed amount", "Percentage"],
    ["ru", "Фиксированная сумма", "Процент"],
  ] as const)("translates auction increment types in %s while preserving API values", (language, fixed, percentage) => {
    renderInLanguage(<VehicleWizard capabilityState="demo" initialStep={5} />, language);

    expect(screen.getByRole("option", { name: fixed })).toHaveValue("FIXED");
    expect(screen.getByRole("option", { name: percentage })).toHaveValue("PERCENTAGE");
  });

  test("shows eight vehicle and auction stages", () => {
    renderInEnglish(<VehicleWizard capabilityState="demo" />);

    [
      "VIN & identity",
      "Technical facts",
      "Condition & description",
      "Photos",
      "Documents",
      "Auction terms",
      "Auction schedule",
      "Review",
    ].forEach((stage) => expect(screen.getAllByText(stage)[0]).toBeVisible());
    expect(screen.getAllByText("Auction schedule")[0]).toBeVisible();
  });

  test("does not skip required stages when a future step indicator is clicked", async () => {
    const user = userEvent.setup();
    renderInEnglish(<VehicleWizard capabilityState="demo" />);

    await user.click(screen.getByRole("button", { name: "Auction terms" }));

    expect(screen.getByRole("heading", { name: "VIN & identity" })).toBeVisible();
    expect(screen.getByRole("button", { name: "VIN & identity" })).toHaveAttribute("aria-current", "step");
    expect(screen.getByLabelText("VIN")).toHaveAttribute("aria-invalid", "true");
  });

  test("limits VIN input to 17 characters", async () => {
    const user = userEvent.setup();
    renderInEnglish(<VehicleWizard capabilityState="demo" />);

    const vin = screen.getByLabelText("VIN");
    await user.type(vin, "WVWZZZ1JZXW000001EXTRA");

    expect(vin).toHaveValue("WVWZZZ1JZXW000001");
  });

  test("translates vehicle color choices", async () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <LangSwitch.Provider
          value={{ currentLang: "uz", setCurrentLang: vi.fn() }}
        >
          <VehicleWizard capabilityState="demo" initialStep={2} />
        </LangSwitch.Provider>
      </LocalizationProvider>,
    );

    expect(screen.getByRole("radio", { name: "Oq" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "Qora" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "Kumush" })).toBeVisible();
    expect(screen.queryByRole("radio", { name: "White" })).not.toBeInTheDocument();
  });

  test("places validation beside the field and supports next and back", async () => {
    const user = userEvent.setup();
    renderInEnglish(<VehicleWizard capabilityState="demo" />);

    const vin = screen.getByLabelText("VIN");
    expect(screen.getByLabelText("Model")).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next step" }));

    const error = screen.getByText("Enter a 17-character VIN.");
    expect(error).toBeVisible();
    expect(vin).toHaveAttribute("aria-describedby", error.id);
    expect(vin).toHaveAttribute("aria-invalid", "true");
    expect(vin).toHaveClass("border-semantic-danger");

    await user.type(vin, "WVWZZZ1JZXW000001");
    await user.selectOptions(screen.getByLabelText("Make"), "1");
    expect(screen.getByLabelText("Model")).toBeEnabled();
    await user.selectOptions(screen.getByLabelText("Model"), "10");
    await user.selectOptions(screen.getByRole("combobox", { name: "Year" }), "2022");
    await user.click(screen.getByRole("button", { name: "Next step" }));

    expect(
      screen.getByRole("heading", { name: "Technical facts" }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(
      screen.getByRole("heading", { name: "VIN & identity" }),
    ).toBeVisible();
  });

  test("shows field-specific red validation for auction terms and schedule", async () => {
    const user = userEvent.setup();
    const terms = renderInEnglish(<VehicleWizard capabilityState="demo" initialStep={5} />);

    await user.click(screen.getByRole("button", { name: "Next step" }));
    const startPrice = screen.getByRole("textbox", { name: /Starting price \(UZS\)/i });
    expect(startPrice).toHaveClass("border-semantic-danger");
    expect(screen.getByText("Enter a starting price greater than zero.")).toBeVisible();
    expect(screen.getByText("Deposit must be between 0 and 100 percent.")).toBeVisible();

    terms.unmount();
    renderInEnglish(<VehicleWizard capabilityState="demo" initialStep={6} />);
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByLabelText("Preferred auction start")).toHaveClass("border-semantic-danger");
    expect(screen.getByText("Choose an auction start time.")).toBeVisible();
    expect(screen.getByText("End time must be after the start time.")).toBeVisible();
  });

  test("allows moving past auction terms when reserve price is empty", async () => {
    const user = userEvent.setup();
    renderInEnglish(<VehicleWizard capabilityState="demo" initialStep={5} />);

    await user.type(screen.getByLabelText("Starting price (UZS)"), "20000");
    await user.type(screen.getByLabelText("Bid increment (UZS)"), "500");
    await user.type(screen.getByLabelText("Deposit (%)"), "10");
    await user.click(screen.getByRole("button", { name: "Next step" }));

    expect(screen.getByRole("heading", { name: "Auction schedule" })).toBeVisible();
  });

  test("saves a local draft while the seller types", async () => {
    const user = userEvent.setup();
    renderInEnglish(<VehicleWizard capabilityState="demo" />);

    await user.type(screen.getByLabelText("VIN"), "WVWZZZ1JZXW000001");

    await waitFor(() => {
      expect(
        JSON.parse(
          window.localStorage.getItem(vehicleDraftKey(7)) ?? "{}",
        ).vin,
      ).toBe("WVWZZZ1JZXW000001");
    });
    expect(screen.getByText("Draft saved locally")).toBeVisible();
  });

  test("gates the seller journey before an anonymous user starts a draft", () => {
    wizardSpies.user = null;
    renderInEnglish(<VehicleWizard capabilityState="demo" />);

    expect(
      screen.getByText("Log in before submitting this vehicle draft."),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fsell",
    );
    expect(screen.queryByLabelText("VIN")).not.toBeInTheDocument();
  });

  test("reports restricted draft storage without a false saved state", async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("storage denied", "SecurityError");
    });
    renderInEnglish(<VehicleWizard capabilityState="demo" />);

    await user.type(screen.getByLabelText("VIN"), "W");

    expect(
      screen.getByText(
        "Local draft storage is unavailable; changes remain in this session.",
      ),
    ).toBeVisible();
    expect(screen.queryByText("Draft saved locally")).not.toBeInTheDocument();
  });

  test("shows the required photo range", () => {
    renderInEnglish(<VehicleWizard capabilityState="demo" initialStep={3} />);

    expect(screen.getByText(/add 5–30 clear vehicle images/i)).toBeVisible();
  });

  test("adds vehicle photos across separate picker selections", async () => {
    const user = userEvent.setup();
    const { container } = renderInEnglish(
      <VehicleWizard capabilityState="demo" initialStep={3} />,
    );

    const picker = container.querySelector<HTMLInputElement>("#vehicle-images");
    expect(picker).toBeInstanceOf(HTMLInputElement);

    await user.upload(
      picker!,
      new File(["front"], "front.jpg", { type: "image/jpeg" }),
    );
    await user.upload(
      picker!,
      new File(["rear"], "rear.jpg", { type: "image/jpeg" }),
    );

    expect(screen.getByText("1. front.jpg")).toBeVisible();
    expect(screen.getByText("2. rear.jpg")).toBeVisible();
    expect(screen.getByText("2 / 30")).toBeVisible();
  });

  test("disables production submission when vehicle documents are unavailable", () => {
    renderInEnglish(
      <VehicleWizard capabilityState="unavailable" initialStep={7} />,
    );

    expect(
      screen.getByText(/document verification is not connected/i),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Submit vehicle" })).toBeDisabled();
  });

  test("does not show the obsolete generic lot notice for live submission", () => {
    renderInEnglish(
      <VehicleWizard
        capabilityState="live"
        initialStep={7}
        vehicleLotTypeId="vehicle-type"
      />,
    );

    expect(screen.queryByText("Connected submission")).not.toBeInTheDocument();
    expect(screen.queryByText(/generic lot endpoint/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit vehicle" })).toBeVisible();
    expect(screen.queryByText("Demo workflow")).not.toBeInTheDocument();
    expect(screen.queryByText(/only saves the local draft/i)).not.toBeInTheDocument();
  });

  test("allows the vehicle wizard for any authenticated account", () => {
    wizardSpies.user = {
      id: 7,
      firstname: "User",
      roles: [{ name: "USER" }],
    };

    renderInEnglish(<VehicleWizard capabilityState="live" />);

    expect(screen.queryByText(/seller role is required/i)).not.toBeInTheDocument();
  });

  test("keeps the legacy local wall time and accepts any valid start time", () => {
    const now = new Date("2026-07-16T10:00:00").getTime();

    expect(formatLocalWallTime("2026-07-20T10:00")).toBe(
      "2026-07-20T10:00:00",
    );
    expect(formatAuctionApiWallTime("2026-08-11T20:00")).toBe(
      "2026-08-11T20:00:00.000Z",
    );
    expect(hasMinimumAuctionLeadTime("2026-07-16T10:01", now)).toBe(true);
    expect(hasMinimumAuctionLeadTime("not-a-date", now)).toBe(false);
  });

  test("creates a vehicle through the live vehicle API and uploads images", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      vehicleDraftKey(7),
      JSON.stringify({
        vin: "WVWZZZ1JZXW000001",
        make: "1",
        model: "10",
        year: "2022",
        mileage: "22000",
        engineVolume: "1.5",
        fuel: "PETROL",
        transmission: "AUTOMATIC",
        drivetrain: "FWD",
        bodyType: "SEDAN",
        color: "White",
        conditionGrade: "EXCELLENT",
        region: "Tashkent",
        description: "Inspected",
      }),
    );

    renderInEnglish(
      <VehicleWizard
        capabilityState="live"
        initialStep={3}
        vehicleLotTypeId="vehicle-type"
      />,
    );

    const images = Array.from(
      { length: 5 },
      (_, index) =>
        new File([`image-${index}`], `vehicle-${index}.jpg`, {
          type: "image/jpeg",
        }),
    );
    const ownershipDocument = new File(["document"], "ownership.pdf", {
      type: "application/pdf",
    });

    await user.upload(screen.getByLabelText("Vehicle photos"), images);
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.upload(
      screen.getByLabelText("Ownership and vehicle documents"),
      ownershipDocument,
    );
    await user.click(screen.getByRole("button", { name: "Next step" }));

    const auctionTimes = await fillAuctionStep(user);

    const submit = screen.getByRole("button", { name: "Submit vehicle" });
    expect(submit).toBeEnabled();
    await user.click(submit);

    expect(wizardSpies.createVehicle).toHaveBeenCalledWith({
      vehicle: expect.objectContaining({
        bodyType: "SEDAN",
        color: "White",
        conditionGrade: "EXCELLENT",
        description: "Inspected",
        drivetrain: "FWD",
        engineVolume: "1.5",
        fuelType: "PETROL",
        makeId: "1",
        mileage: "22000",
        modelId: "10",
        region: "Tashkent",
        transmission: "AUTOMATIC",
        vin: "WVWZZZ1JZXW000001",
        year: "2022",
      }),
      auction: expect.objectContaining({
        currency: "UZS",
        depositPercent: 10,
        incrementType: "FIXED",
        incrementValue: 500,
        reservePrice: 25000,
        startPrice: 20000,
        startTime: formatAuctionApiWallTime(auctionTimes.startTime),
        endTime: formatAuctionApiWallTime(auctionTimes.endTime),
      }),
    });

    act(() => wizardSpies.createVehicleSuccess?.({ vehicleId: 81, auctionId: 901 }));

    expect(wizardSpies.uploadAssets).toHaveBeenCalledWith({
      documents: [{ docType: "TITLE", file: ownershipDocument }],
      images,
      vehicleId: 81,
    });
    act(() => wizardSpies.uploadAssetsSuccess?.({ vehicleId: 81 }));

    expect(wizardSpies.routerPush).toHaveBeenCalledWith("/dashboard/vehicles");
    expect(screen.getByText(/vehicle lot created/i)).toBeVisible();
    expect(submit).toBeDisabled();
    const back = screen.getByRole("button", { name: "Back" });
    expect(back).toBeDisabled();
    await user.click(back);
    expect(screen.getByRole("heading", { name: "Review" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Next step" })).not.toBeInTheDocument();
    await user.click(submit);
    expect(wizardSpies.createVehicle).toHaveBeenCalledTimes(1);
  });

  test("opens the localized KYC modal for the backend financial-state conflict", async () => {
    const user = userEvent.setup();
    wizardSpies.editVehicle = {
      bodyType: "SEDAN", color: "white", conditionGrade: "GOOD", description: "Clean vehicle",
      drivetrain: "FWD", engineVolume: 1.5, fuelType: "PETROL", makeId: 1, mileage: 125000,
      modelId: 10, region: "Toshkent viloyati", transmission: "AUTOMATIC",
      vehicleId: 13, vin: "98GV7DAPNLPEV1NKK", year: 2025,
    };

    renderInEnglish(
      <VehicleWizard
        capabilityState="live"
        initialStep={7}
        editVehicleId="13"
      />,
    );

    // Wait for data load
    await waitFor(() => expect(screen.getByRole("button", { name: "Submit vehicle" })).toBeEnabled());

    const submit = screen.getByRole("button", { name: "Submit vehicle" });
    await user.click(submit);

    act(() =>
      wizardSpies.updateVehicleError?.({
        response: {
          data: {
            message: "Request conflicts with existing financial state",
          },
        },
      }),
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Verify your identity" })).toBeVisible();
    expect(screen.queryByText("Request conflicts with existing financial state")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Not now" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Verify identity" }));
    expect(wizardSpies.routerPush).toHaveBeenCalledWith("/dashboard/kyc");
  });

  test("keeps 11–30 photos in the draft and allows live vehicle submission", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      vehicleDraftKey(7),
      JSON.stringify({
        vin: "WVWZZZ1JZXW000001",
        make: "1",
        model: "10",
        year: "2022",
        mileage: "22000",
        engineVolume: "1.5", fuel: "PETROL", transmission: "MANUAL", drivetrain: "FWD",
        bodyType: "SEDAN", color: "White", conditionGrade: "GOOD", region: "Tashkent", description: "Inspected",
      }),
    );

    renderInEnglish(
      <VehicleWizard
        capabilityState="live"
        initialStep={3}
        vehicleLotTypeId="vehicle-type"
      />,
    );

    const images = Array.from(
      { length: 11 },
      (_, index) =>
        new File([`image-${index}`], `vehicle-${index}.jpg`, {
          type: "image/jpeg",
        }),
    );
    await user.upload(screen.getByLabelText("Vehicle photos"), images);
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));

    await fillAuctionStep(user);

    const submit = screen.getByRole("button", { name: "Submit vehicle" });
    expect(submit).toBeEnabled();
    await user.click(submit);
    expect(wizardSpies.createVehicle).toHaveBeenCalledOnce();
  });

  test("loads only the authenticated seller's draft and resets it on account change", async () => {
    window.localStorage.setItem(
      vehicleDraftKey(7),
      JSON.stringify({ make: "101", model: "1001", vin: "AAAAAAAAAAAAAAAAA" }),
    );
    window.localStorage.setItem(
      vehicleDraftKey(8),
      JSON.stringify({ make: "202", model: "2002", vin: "BBBBBBBBBBBBBBBBB" }),
    );
    const view = renderInEnglish(<VehicleWizard capabilityState="demo" />);
    expect(await screen.findByLabelText("Make")).toHaveValue("101");

    wizardSpies.user = {
      id: 8,
      firstname: "Second seller",
      roles: [{ name: "SELLER" }],
    };
    view.rerender(
      <EnglishProviders>
        <VehicleWizard capabilityState="demo" />
      </EnglishProviders>,
    );

    expect(await screen.findByLabelText("Make")).toHaveValue("202");
  });

  test("keeps owner-scoped localStorage out of the server render", () => {
    window.localStorage.setItem(
      vehicleDraftKey(7),
      JSON.stringify({ make: "Browser-only private draft", vin: "AAAAAAAAAAAAAAAAA" }),
    );

    const html = renderToString(
      <EnglishProviders>
        <VehicleWizard capabilityState="demo" />
      </EnglishProviders>,
    );

    expect(html).not.toContain("Browser-only private draft");
  });

  test("never falls back to a stale stored seller identity", async () => {
    window.localStorage.setItem("userId", "88");
    wizardSpies.user = {
      firstname: "Seller without identity",
      roles: [{ name: "SELLER" }],
    };

    renderInEnglish(
      <VehicleWizard capabilityState="live" initialStep={7} vehicleLotTypeId="vehicle-type" />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /your account identity is unavailable/i,
    );
    expect(screen.queryByRole("button", { name: "Submit vehicle" })).not.toBeInTheDocument();
    expect(wizardSpies.createVehicle).not.toHaveBeenCalled();
  });

  test("renders select default placeholder options with disabled attribute", () => {
    renderInEnglish(<VehicleWizard capabilityState="demo" />);

    const yearSelect = screen.getByRole("combobox", { name: "Year" });
    const firstYearOption = yearSelect.querySelector("option[value='']");
    expect(firstYearOption).toBeDisabled();

    const makeSelect = screen.getByLabelText("Make");
    const firstMakeOption = makeSelect.querySelector("option[value='']");
    expect(firstMakeOption).toBeDisabled();
  });

  test("resets selected model when make changes", async () => {
    const user = userEvent.setup();
    renderInEnglish(<VehicleWizard capabilityState="demo" />);

    await user.selectOptions(screen.getByLabelText("Make"), "1");
    expect(screen.getByLabelText("Model")).toBeEnabled();
    await user.selectOptions(screen.getByLabelText("Model"), "10");
    expect(screen.getByLabelText("Model")).toHaveValue("10");

    await user.selectOptions(screen.getByLabelText("Make"), "101");
    expect(screen.getByLabelText("Model")).toHaveValue("");
  });

  test("renders AI valuation slider on pricing step", () => {
    renderInEnglish(<VehicleWizard capabilityState="demo" initialStep={5} />);
    expect(screen.getByTestId("ai-valuation-slider")).toBeVisible();
    expect(screen.getByLabelText("AI Price Selector")).toBeVisible();
  });

  test("auto-selects and disables transmission/engineVolume for ELECTRIC vehicles", async () => {
    const user = userEvent.setup();
    renderInEnglish(<VehicleWizard capabilityState="demo" initialStep={1} />);

    const fuelSelect = screen.getByLabelText("Fuel");
    const transmissionSelect = screen.getByLabelText("Transmission");
    const engineVolumeInput = screen.getByLabelText("Engine volume (L)");

    expect(transmissionSelect).toBeEnabled();
    expect(engineVolumeInput).toBeEnabled();

    await user.selectOptions(fuelSelect, "ELECTRIC");

    expect(transmissionSelect).toBeDisabled();
    expect(transmissionSelect).toHaveValue("AUTOMATIC");
    expect(engineVolumeInput).toBeDisabled();
    expect(engineVolumeInput).toHaveValue(0);

    // Enter mileage and other required fields to proceed to the next step
    const mileageInput = screen.getByLabelText("Mileage (km)");
    await user.type(mileageInput, "50000");
    await user.selectOptions(screen.getByLabelText("Drivetrain"), "FWD");
    await user.selectOptions(screen.getByLabelText("Body type"), "SEDAN");

    await user.click(screen.getByRole("button", { name: "Next step" }));

    // Confirm it successfully moves to Step 2 (Condition & description)
    expect(screen.getByLabelText("Condition grade")).toBeInTheDocument();
  });

  test("shows temporary unavailable notice and allows manual price entry when AI valuation is unavailable", async () => {
    wizardSpies.aiValuationResult = {
      data: {
        message: "Vehicle price estimation service is currently unavailable",
        status: "SERVICE_UNAVAILABLE",
      },
    };

    renderInEnglish(<VehicleWizard capabilityState="demo" initialStep={5} />);

    expect(screen.getByTestId("ai-valuation-unavailable-alert")).toBeVisible();
    expect(screen.getByText("AI price estimation is temporarily unavailable")).toBeVisible();
    expect(screen.getByText("You can enter the starting price and auction terms manually below.")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Enter Auction Terms" })).toBeVisible();
    expect(screen.getByLabelText("Starting price (UZS)")).toBeVisible();
    expect(screen.queryByTestId("ai-valuation-slider")).not.toBeInTheDocument();
  });
});
