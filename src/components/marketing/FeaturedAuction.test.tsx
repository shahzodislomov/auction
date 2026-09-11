import { act, fireEvent, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FeaturedAuction } from "@/components/marketing/FeaturedAuction";
import { LangSwitch } from "@/context/LangSwitch";
import { demoVehicleAuctions } from "@/lib/fixtures/vehicleAuctions";
import { messages } from "@/locales";
import { renderWithAppProviders } from "@/test/render";

const testState = vi.hoisted(() => ({
  like: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: testState.push }),
}));

vi.mock("@/context/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => children,
  useUserContext: () => ({ isAuthenticated: false, user: null }),
}));

vi.mock("@/queries/lots", () => ({
  useLikeLotMutation: () => ({ isPending: false, mutate: testState.like }),
  useLikedLots: () => ({ data: [], isLoading: false, isError: false }),
}));

const timedAuction = {
  ...demoVehicleAuctions[0],
  currentPrice: 200,
  endTime: "2026-07-16T13:00:00.000Z",
  incrementType: "PERCENTAGE" as const,
  incrementValue: 10,
  startPrice: 100,
};

function renderFeaturedOnServer() {
  return renderToString(
    <LangSwitch.Provider
      value={{ currentLang: "en", setCurrentLang: vi.fn() }}
    >
      <IntlProvider locale="en" messages={messages.en}>
        <FeaturedAuction auction={timedAuction} />
      </IntlProvider>
    </LangSwitch.Provider>,
  );
}

describe("FeaturedAuction", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime("2026-07-16T12:00:00.000Z");
    testState.like.mockClear();
    testState.push.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not render a wall-clock value into server HTML", () => {
    expect(renderFeaturedOnServer()).not.toContain("01:00:00");
  });

  it("ticks the remaining time once per second after mounting", () => {
    renderWithAppProviders(<FeaturedAuction auction={timedAuction} />, {
      locale: "en",
    });

    expect(screen.getByText("01:00:00")).toBeVisible();

    act(() => vi.advanceTimersByTime(1_000));

    expect(screen.getByText("00:59:59")).toBeVisible();
  });

  it("uses percentage increments for the next bid preview", () => {
    renderWithAppProviders(<FeaturedAuction auction={timedAuction} />, {
      locale: "en",
    });

    expect(screen.getByText("UZS 220")).toBeVisible();
  });
});
