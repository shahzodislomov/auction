import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LangSwitch } from "@/context/LangSwitch";
import { AdminAiProcessingWorkspace } from "./AdminAiProcessingWorkspace";

const mockState = vi.hoisted(() => ({
  failedVehicles: [] as Array<Record<string, unknown>>,
  logs: [] as Array<Record<string, unknown>>,
  logsVehicleIdCalled: null as string | number | null,
  retryVehicleIdCalled: null as string | number | null,
  retryMutateAsync: vi.fn(),
}));

vi.mock("@/queries/auction-listings", () => ({
  useGetAiFailedVehicles: () => ({
    data: mockState.failedVehicles,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useGetAiLogs: (vehicleId: string | number | null) => {
    mockState.logsVehicleIdCalled = vehicleId;
    return {
      data: mockState.logs,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    };
  },
  useRetryAiProcessing: () => ({
    isPending: false,
    variables: null,
    mutateAsync: mockState.retryMutateAsync,
  }),
}));

describe("AdminAiProcessingWorkspace", () => {
  beforeEach(() => {
    mockState.failedVehicles = [];
    mockState.logs = [];
    mockState.logsVehicleIdCalled = null;
    mockState.retryVehicleIdCalled = null;
    mockState.retryMutateAsync = vi.fn().mockImplementation(async (id) => {
      mockState.retryVehicleIdCalled = id;
      return { status: "SUCCESS" };
    });
  });

  it("renders empty state when there are no failed vehicles", () => {
    render(
      <LangSwitch.Provider value={{ currentLang: "uz", setCurrentLang: vi.fn() }}>
        <AdminAiProcessingWorkspace />
      </LangSwitch.Provider>
    );

    expect(screen.getByText("AI Photo qayta ishlash")).toBeInTheDocument();
    expect(screen.getByText("AI xatoliklari mavjud emas")).toBeInTheDocument();
  });

  it("renders failed vehicles queue with cards and information", () => {
    mockState.failedVehicles = [
      {
        id: 42,
        vehicleId: 42,
        makeName: "Chevrolet",
        modelName: "Cobalt",
        year: 2023,
        vin: "XWB11223344",
        region: "Toshkent",
        sellerId: 101,
        images: ["https://api.tezauksion.uz/uploads/car1.jpg"],
      },
    ];

    render(
      <LangSwitch.Provider value={{ currentLang: "uz", setCurrentLang: vi.fn() }}>
        <AdminAiProcessingWorkspace />
      </LangSwitch.Provider>
    );

    expect(screen.getByText("Chevrolet Cobalt 2023")).toBeInTheDocument();
    expect(screen.getByText("#42")).toBeInTheDocument();
    expect(screen.getByText("XWB11223344")).toBeInTheDocument();
    expect(screen.getByText("Toshkent")).toBeInTheDocument();
  });

  it("opens AI logs modal when clicking inspect button", async () => {
    const user = userEvent.setup();
    mockState.failedVehicles = [
      {
        id: 42,
        vehicleId: 42,
        makeName: "Chevrolet",
        modelName: "Cobalt",
        year: 2023,
        vin: "XWB11223344",
      },
    ];
    mockState.logs = [
      {
        step: "PLATE_DETECTION",
        status: "FAILED",
        message: "No clear license plate detected in rear image",
        timestamp: "2026-09-10T12:00:00Z",
      },
    ];

    render(
      <LangSwitch.Provider value={{ currentLang: "uz", setCurrentLang: vi.fn() }}>
        <AdminAiProcessingWorkspace />
      </LangSwitch.Provider>
    );

    const inspectBtns = screen.getAllByRole("button", { name: /Loglarni ko‘rish/i });
    // Click the card inspect button (second button, first is manual inspector form)
    await user.click(inspectBtns[1]);

    expect(mockState.logsVehicleIdCalled).toBe("42");
    expect(screen.getAllByText(/Vehicle #42/i).length).toBeGreaterThan(0);
    expect(screen.getByText("No clear license plate detected in rear image")).toBeInTheDocument();
    expect(screen.getByText("PLATE_DETECTION")).toBeInTheDocument();
  });

  it("calls retry AI processing mutation when clicking retry button", async () => {
    const user = userEvent.setup();
    mockState.failedVehicles = [
      {
        id: 88,
        vehicleId: 88,
        makeName: "BYD",
        modelName: "Song Plus",
        year: 2024,
      },
    ];

    render(
      <LangSwitch.Provider value={{ currentLang: "uz", setCurrentLang: vi.fn() }}>
        <AdminAiProcessingWorkspace />
      </LangSwitch.Provider>
    );

    const retryBtn = screen.getByRole("button", { name: /AI qayta urinish/i });
    await user.click(retryBtn);

    expect(mockState.retryMutateAsync).toHaveBeenCalledWith("88");
    await waitFor(() => {
      expect(screen.getByText(/AI qayta ishlash so‘rovi muvaffaqiyatli yuborildi/i)).toBeInTheDocument();
    });
  });

  it("supports manual vehicle ID inspection via the search input", async () => {
    const user = userEvent.setup();
    render(
      <LangSwitch.Provider value={{ currentLang: "uz", setCurrentLang: vi.fn() }}>
        <AdminAiProcessingWorkspace />
      </LangSwitch.Provider>
    );

    const input = screen.getByLabelText("Vehicle ID");
    await user.type(input, "999");

    const formInspectBtn = screen.getAllByRole("button", { name: /Loglarni ko‘rish/i })[0];
    await user.click(formInspectBtn);

    expect(mockState.logsVehicleIdCalled).toBe("999");
    expect(screen.getAllByText(/Vehicle #999/i).length).toBeGreaterThan(0);
  });
});
