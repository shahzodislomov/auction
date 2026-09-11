
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi, describe, expect, it } from "vitest";

import { LangSwitch } from "@/context/LangSwitch";

import { SellerVehicleDetailSection, SellerVehiclesSection } from "./CabinetLiveSections";

const imageActions = vi.hoisted(() => ({
  createAuction: vi.fn(),
  deleteImage: vi.fn(),
  routerPush: vi.fn(),
  setPrimary: vi.fn(),
  relistVehicle: vi.fn(),
  vehicleDetail: vi.fn(),
}));

const auctionRequests = vi.hoisted(() => [] as Array<Record<string, unknown>>);

const vehicleFixtures = vi.hoisted(() => ({
  elements: 1,
  list: [
    {
      color: "White",
      description: "Clean vehicle",
      imageUrls: ["/front.jpg", "/rear.jpg"],
      makeName: "Toyota",
      modelName: "Camry",
      ownerId: 7,
      region: "Tashkent",
      status: "DRAFT",
      vehicleId: 81,
      vin: "98GV7DAPNLPEV1NKK",
      year: 2030,
    },
  ] as Array<Record<string, unknown>>,
  pages: 1,
}));

function matchesMockSearch(record: Record<string, unknown>, search: string): boolean {
  const haystack = [
    record.vehicleId,
    record.makeName,
    record.modelName,
    record.vin,
    record.region,
    record.color,
    record.description,
    record.year,
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");

  return haystack.includes(search.toLowerCase());
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: imageActions.routerPush }),
}));

vi.mock("@/queries/auction-listings", () => ({
  useCreateAuction: () => ({ isPending: false, mutateAsync: imageActions.createAuction }),
  useRelistVehicle: () => ({ isPending: false, mutateAsync: imageActions.relistVehicle }),
  useAuctionFeed: (request: Record<string, unknown> = {}) => {
    auctionRequests.push(request);
    const page = Number(request.page ?? 0);
    const size = Number(request.size ?? 20);
    const search = String(request.search ?? "").trim();
    let list = [...vehicleFixtures.list];
    if (search) list = list.filter((record) => matchesMockSearch(record, search));
    const start = page * size;
    const items = list.slice(start, start + size).map((vehicle, index) => ({
      auctionId: Number(vehicle.vehicleId ?? start + index + 1) + 800,
      status: "SCHEDULED",
      vehicle,
      vehicleId: vehicle.vehicleId,
    }));
    return {
      data: {
        items,
        meta: {
          elements: vehicleFixtures.elements,
          pages: vehicleFixtures.pages,
        },
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    };
  },
}));

vi.mock("@/queries/vehicles", () => ({
  useDeleteVehicleImage: () => ({ isPending: false, mutate: imageActions.deleteImage }),
  useOwnerVehicles: (request = {}) => {
    const page = Number((request as { page?: number }).page ?? 0);
    const size = Number((request as { size?: number }).size ?? 20);
    const search = String((request as { search?: string }).search ?? "").trim();
    let list = [...vehicleFixtures.list];
    if (search) list = list.filter((record) => matchesMockSearch(record, search));
    const start = page * size;
    const paged = list.slice(start, start + size);
    return {
      data: {
        meta: {
          elements: vehicleFixtures.elements,
          list: paged,
          pages: vehicleFixtures.pages,
        },
      },
      isError: false,
      isLoading: false,
    };
  },
  useSetPrimaryVehicleImage: () => ({ isPending: false, mutate: imageActions.setPrimary }),
  useUpdateVehicle: () => ({ isPending: false, mutate: vi.fn() }),
  useVehicleDetail: () => imageActions.vehicleDetail(),
  useVehicleMakes: () => ({ data: [{ id: 1, name: "Toyota" }], isLoading: false }),
  useVehicleModels: () => ({ data: [{ id: 10, name: "Camry" }], isLoading: false }),
  useVehicleDocuments: vi.fn(),
  useVehicleImages: vi.fn(),
}));

describe("SellerVehiclesSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auctionRequests.length = 0;
    vehicleFixtures.elements = 1;
    vehicleFixtures.list = [
      {
        color: "White",
        description: "Clean vehicle",
        imageUrls: ["/front.jpg", "/rear.jpg"],
        makeName: "Toyota",
        modelName: "Camry",
        ownerId: 7,
        region: "Tashkent",
        status: "DRAFT",
        vehicleId: 81,
        vin: "98GV7DAPNLPEV1NKK",
        year: 2030,
      },
    ];
    vehicleFixtures.pages = 1;
  });

  it("allows editing without vehicle moderation status", () => {
    imageActions.vehicleDetail.mockReturnValue({
      data: {
        bodyType: "SEDAN", color: "White", conditionGrade: "GOOD", description: "Draft vehicle",
        drivetrain: "FWD", engineVolume: 1, fuelType: "PETROL", images: [], makeId: 1,
        makeName: "Toyota", mileage: 100, modelId: 10, modelName: "Camry", ownerId: 7,
        region: "Tashkent", status: "DRAFT", transmission: "MANUAL", vehicleId: 81,
        vin: "98GV7DAPNLPEV1NKK", year: 2030,
      },
      isError: false,
      isLoading: false,
    });

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <SellerVehicleDetailSection userId={7} vehicleId="81" />
      </LangSwitch.Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit vehicle" }));
    expect(imageActions.routerPush).toHaveBeenCalledWith("/dashboard/vehicles/new?edit=81");

    expect(screen.queryByRole("button", { name: "Archive vehicle" })).not.toBeInTheDocument();
  });

  it("shows labelled metadata and lets the seller move through vehicle images", async () => {
    const user = userEvent.setup();
    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <SellerVehiclesSection userId={7} />
      </LangSwitch.Provider>,
    );

    expect(screen.getByText("Color:")).toBeVisible();
    expect(screen.getByText("Tashkent")).toBeVisible();
    expect(screen.getByText("VIN:")).toBeVisible();
    expect(screen.getByText("Description:")).toBeVisible();
    expect(screen.getByRole("img", { name: /images/i })).toHaveStyle({
      backgroundImage: 'url("/front.jpg")',
    });

    expect(screen.queryByRole("button", { name: "Next image" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Set as primary image" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete image" })).not.toBeInTheDocument();

  });

  it("shows matching auction data without a separate auction button", () => {
    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <SellerVehiclesSection
          auctionByVehicleId={new Map([
            ["81", { auctionId: 901, currency: "USD", currentPrice: 25000, startTime: "2030-06-01T10:00:00Z", status: "LIVE", vehicleId: 81 }],
          ])}
          userId={7}
        />
      </LangSwitch.Provider>,
    );

    const details = screen.getByRole("link", { name: /view details/i });
    expect(screen.getByText("Live")).toBeVisible();
    expect(screen.getAllByText(/2030/)[0]).toBeVisible();
    expect(details).toHaveAttribute("href", "/dashboard/vehicles/81");
    expect(screen.queryByRole("link", { name: /view auction/i })).not.toBeInTheDocument();
  });

  it("shows auction beside the image and vehicle information below on the detail page", () => {
    imageActions.vehicleDetail.mockReturnValue({
      data: {
        color: "White",
        images: [{ imageId: 1, imageUrl: "/front.jpg", isPrimary: true }],
        makeName: "Toyota",
        mileage: 45000,
        modelName: "Camry",
        ownerId: 7,
        region: "Tashkent",
        status: "APPROVED",
        vehicleId: 81,
        vin: "98GV7DAPNLPEV1NKK",
        year: 2030,
      },
      isError: false,
      isLoading: false,
    });

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <SellerVehicleDetailSection
          auction={{
            auctionId: 901,
            currency: "USD",
            currentPrice: 25000,
            depositPercent: 10,
            endTime: "2030-06-02T10:00:00Z",
            incrementType: "FIXED",
            incrementValue: 500,
            reservePrice: 27000,
            startPrice: 22000,
            startTime: "2030-06-01T10:00:00Z",
            status: "LIVE",
            vehicleId: 81,
          }}
          userId={7}
          vehicleId="81"
        />
      </LangSwitch.Provider>,
    );

    const image = screen.getByRole("img", { name: /toyota camry.*images 1/i });
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(imageActions.routerPush).toHaveBeenCalledWith("/dashboard/vehicles");
    const auction = screen.getByRole("heading", { name: "Auction information" }).closest("aside");
    const vehicle = screen.getByRole("heading", { name: "Vehicle information" }).closest("section");
    expect(auction).toContainElement(screen.getByText("Live"));
    expect(auction).toHaveTextContent(/25[\s, ]?000/);
    expect(image.compareDocumentPosition(auction!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(auction!.compareDocumentPosition(vehicle!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit vehicle" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Archive vehicle" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Set as primary image" }));
    expect(imageActions.setPrimary).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete image" }));
    expect(screen.getByRole("alertdialog", { name: "Delete vehicle image" })).toBeVisible();
  });

  it("opens the relist modal on the vehicle detail page without changing the URL", async () => {
    const user = userEvent.setup();
    imageActions.vehicleDetail.mockReturnValue({
      data: {
        images: [], makeName: "Toyota", modelName: "Camry", ownerId: 7,
        status: "APPROVED", vehicleId: 81, year: 2030,
      },
      isError: false,
      isLoading: false,
    });

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <SellerVehicleDetailSection
          auction={{ auctionId: 901, status: "CANCELED", vehicleId: 81 }}
          userId={7}
          vehicleId="81"
        />
      </LangSwitch.Provider>,
    );

    await user.click(screen.getByRole("button", { name: "Relist for auction" }));

    expect(screen.getByRole("dialog", { name: "Relist vehicle for auction" })).toBeVisible();
    expect(imageActions.routerPush).not.toHaveBeenCalledWith(expect.stringContaining("/dashboard/auctions?"));
  });

  it("opens the relist modal from a canceled vehicle card without changing the URL", async () => {
    const user = userEvent.setup();
    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <SellerVehiclesSection
          auctionByVehicleId={new Map([["81", { auctionId: 901, status: "CANCELED", vehicleId: 81 }]])}
          userId={7}
        />
      </LangSwitch.Provider>,
    );

    await user.click(screen.getByRole("button", { name: "Relist for auction" }));

    expect(screen.getByRole("dialog", { name: "Relist vehicle for auction" })).toBeVisible();
    expect(imageActions.routerPush).not.toHaveBeenCalledWith(expect.stringContaining("/dashboard/auctions?"));
  });

  it("filters vehicles by search query and reports an empty filtered state", async () => {
    const user = userEvent.setup();

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <SellerVehiclesSection userId={7} />
      </LangSwitch.Provider>,
    );

    const search = screen.getByRole("searchbox", {
      name: "Search by make, model, VIN, region, or vehicle ID",
    });
    await user.type(search, "bmw");

    expect(await screen.findByText("No vehicles match this view")).toBeVisible();
    expect(screen.queryByText("Toyota")).not.toBeInTheDocument();
  });

  it("shows all vehicles without moderation status tabs", () => {
    vehicleFixtures.list = [
      {
        color: "White",
        description: "Draft vehicle",
        images: [{ imageId: 1, imageUrl: "/toyota.jpg", isPrimary: true }],
        makeName: "Toyota",
        modelName: "Camry",
        ownerId: 7,
        region: "Tashkent",
        status: "DRAFT",
        vehicleId: 81,
        vin: "TOYOTA81",
        year: 2028,
      },
      {
        color: "Black",
        description: "Approved vehicle",
        images: [{ imageId: 2, imageUrl: "/honda.jpg", isPrimary: true }],
        makeName: "Honda",
        modelName: "Accord",
        ownerId: 7,
        region: "Samarkand",
        status: "APPROVED",
        vehicleId: 82,
        vin: "HONDA82",
        year: 2032,
      },
    ];
    vehicleFixtures.elements = 2;
    vehicleFixtures.pages = 2;

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <SellerVehiclesSection
          userId={7}
          auctionByVehicleId={new Map([
            ["81", { auctionId: 901, status: "LIVE", vehicleId: 81 }],
            ["82", { auctionId: 902, status: "SCHEDULED", vehicleId: 82 }],
          ])}
        />
      </LangSwitch.Provider>,
    );

    expect(screen.queryByRole("button", { name: /Approved/ })).not.toBeInTheDocument();
    expect(screen.getByText("2032 Honda Accord")).toBeVisible();
    expect(screen.getByText("2028 Toyota Camry")).toBeVisible();
  });

  it("uses backend pagination metadata for counters and paging controls", async () => {
    const user = userEvent.setup();
    vehicleFixtures.list = Array.from({ length: 15 }, (_, index) => ({
      color: "White",
      description: `Vehicle ${index + 1}`,
      images: [{ imageId: index + 1, imageUrl: `/vehicle-${index + 1}.jpg`, isPrimary: true }],
      makeName: "Toyota",
      modelName: `Camry ${index + 1}`,
      ownerId: 7,
      region: "Tashkent",
      status: "DRAFT",
      vehicleId: index + 1,
      vin: `VIN${index + 1}`,
      year: 2030,
    }));
    vehicleFixtures.elements = 58;
    vehicleFixtures.pages = 6;

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <SellerVehiclesSection userId={7} />
      </LangSwitch.Provider>,
    );

    expect(screen.getByText("Showing 10 of 58")).toBeVisible();
    const previousPage = screen.getByRole("button", { name: "Previous page" });
    const nextPage = screen.getByRole("button", { name: "Next page" });
    expect(previousPage).toBeDisabled();
    expect(nextPage).toBeEnabled();

    await user.click(nextPage);

    expect(previousPage).toBeEnabled();
    expect(auctionRequests).toContainEqual(expect.objectContaining({
      page: 1,
      sellerId: "7",
      size: 10,
    }));
  });
});
