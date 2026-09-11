import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/queries/vehicle-images", () => ({
  useVehicleImages: () => ({
    data: [],
    isError: false,
    isLoading: false,
  }),
}));

import { AuctionGallery } from "@/components/auction/AuctionGallery";
import { ParticipationPanel } from "@/components/auction/ParticipationPanel";
import { demoVehicleAuctions } from "@/lib/fixtures/vehicleAuctions";
import { renderWithAppProviders } from "@/test/render";

// Stub for prefers-reduced-motion used by carousel auto-play
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

const auction = {
  ...demoVehicleAuctions[0],
  images: [
    {
      id: "front",
      url: "/vehicles/champagne-ledger-featured-suv.png",
      alt: {
        default: "Front view",
        uz: "Old ko‘rinish",
        ru: "Вид спереди",
        en: "Front view",
      },
    },
    {
      id: "rear",
      url: "/vehicles/champagne-ledger-hero-suv.png",
      alt: {
        default: "Rear view",
        uz: "Orqa ko‘rinish",
        ru: "Вид сзади",
        en: "Rear view",
      },
    },
  ],
};

afterEach(() => {
  vi.useRealTimers();
});

describe("AuctionGallery", () => {
  it("renders the first vehicle image as a background", () => {
    renderWithAppProviders(<AuctionGallery auction={auction} locale="en" />, {
      locale: "en",
    });

    const image = screen.getByRole("img", {
      name: /2024 Chevrolet.*Vehicle gallery 1/i,
    });
    expect(image).toBeVisible();
    expect(image).toHaveStyle({
      backgroundImage: expect.stringContaining("champagne-ledger-featured-suv.png"),
    });
  });

  it("shows prev/next buttons and image counter when multiple images exist", () => {
    renderWithAppProviders(<AuctionGallery auction={auction} locale="en" />, {
      locale: "en",
    });

    expect(screen.getByRole("button", { name: /previous/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /next/i })).toBeVisible();
    expect(screen.getByText("1 / 2")).toBeVisible();
  });

  it("navigates through images with prev/next buttons", async () => {
    const user = userEvent.setup();
    renderWithAppProviders(<AuctionGallery auction={auction} locale="en" />, {
      locale: "en",
    });

    const image = screen.getByRole("img", { name: /Vehicle gallery 1/i });

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByRole("img", { name: /Vehicle gallery 2/i })).toBeVisible();

    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(screen.getByRole("img", { name: /Vehicle gallery 1/i })).toBeVisible();
  });

  it("pauses auto-play on hover", () => {
    renderWithAppProviders(<AuctionGallery auction={auction} locale="en" />, {
      locale: "en",
    });

    const section = screen.getByRole("region", { name: /vehicle gallery/i });
    fireEvent.mouseEnter(section);
    expect(section).toBeVisible();
  });

  it("shows unavailable message when there are no images", () => {
    renderWithAppProviders(
      <AuctionGallery
        auction={{ ...auction, images: [] }}
        locale="en"
      />,
      { locale: "en" },
    );

    expect(screen.getByText(/vehicle image unavailable/i)).toBeVisible();
  });
});

describe("ParticipationPanel", () => {
  it("sends an unverified bidder to the honest KYC status route", () => {
    renderWithAppProviders(
      <ParticipationPanel
        auction={{ ...auction, status: "upcoming" }}
        locale="en"
        isAuthenticated
        isVerified={false}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={vi.fn()}
      />,
      { locale: "en" },
    );

    expect(screen.getByRole("link", { name: "Verify identity" })).toHaveAttribute(
      "href",
      "/dashboard/kyc",
    );
  });

  it("shows a display-only countdown that updates from the supplied end time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T10:00:00.000Z"));

    renderWithAppProviders(
      <ParticipationPanel
        auction={{
          ...auction,
          status: "upcoming",
          endTime: "2026-07-16T11:01:05.000Z",
        }}
        locale="en"
        isAuthenticated
        isVerified={null}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={vi.fn()}
      />,
      { locale: "en" },
    );

    expect(screen.getByRole("timer")).toHaveTextContent(
      "1h 01m 05s remaining",
    );
    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByRole("timer")).toHaveTextContent(
      "1h 01m 04s remaining",
    );
    vi.useRealTimers();
  });

  it("shows start time and countdown to start for upcoming auctions in Tashkent timezone", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-07T12:00:00.000Z"));

    renderWithAppProviders(
      <ParticipationPanel
        auction={{
          ...auction,
          status: "upcoming",
          startTime: "2026-09-07T19:19:00",
          endTime: "2026-09-09T14:19:00",
        }}
        locale="ru"
        isAuthenticated
        isVerified={null}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={vi.fn()}
      />,
      { locale: "ru" },
    );

    expect(screen.getByText("Начало")).toBeInTheDocument();
    expect(screen.getByText(/19:19/)).toBeInTheDocument();
    expect(screen.getByText(/07 сент/)).toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveTextContent(/2ч 19м 00с осталось/);

    vi.useRealTimers();
  });

  it("keeps payment available when only the device clock has passed the end time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T12:00:00.000Z"));

    renderWithAppProviders(
      <ParticipationPanel
        auction={{
          ...auction,
          status: "upcoming",
          endTime: "2026-07-16T11:00:00.000Z",
        }}
        locale="en"
        isAuthenticated
        isVerified={null}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={vi.fn()}
      />,
      { locale: "en" },
    );

    expect(screen.getByRole("timer")).toHaveTextContent(
      "Time reached — waiting for auction status",
    );
    expect(
      screen.getByRole("button", { name: /pay 1% deposit/i }),
    ).toBeEnabled();
  });

  it("derives the deposit CTA and confirms before requesting money movement", async () => {
    const user = userEvent.setup();
    const onDeposit = vi.fn().mockResolvedValue(undefined);

    renderWithAppProviders(
      <ParticipationPanel
        auction={{ ...auction, status: "upcoming" }}
        locale="en"
        isAuthenticated
        isVerified={null}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={onDeposit}
      />,
      { locale: "en" },
    );

    await user.click(screen.getByRole("button", { name: /pay 1% deposit/i }));
    expect(screen.getByRole("dialog", { name: /confirm deposit/i })).toBeVisible();
    expect(onDeposit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /confirm deposit/i }));
    expect(onDeposit).toHaveBeenCalledTimes(1);
  });

  it("preserves minor-unit precision in a non-UZS deposit quote", async () => {
    const user = userEvent.setup();
    renderWithAppProviders(
      <ParticipationPanel
        auction={{
          ...auction,
          status: "upcoming",
          currency: "USD",
          startPrice: 12_345,
        }}
        locale="en"
        isAuthenticated
        isVerified={null}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={vi.fn()}
      />,
      { locale: "en" },
    );

    expect(screen.getByText("USD 123.45")).toBeVisible();
    expect(screen.queryByText("USD 123.00")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /pay 1% deposit/i }));
    expect(
      within(screen.getByRole("dialog", { name: /confirm deposit/i })).getByText(
        "USD 123.45",
      ),
    ).toBeVisible();
  });

  it("traps focus in the deposit dialog and restores the deposit trigger", async () => {
    const user = userEvent.setup();

    renderWithAppProviders(
      <ParticipationPanel
        auction={{ ...auction, status: "upcoming" }}
        locale="en"
        isAuthenticated
        isVerified={null}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={vi.fn()}
      />,
      { locale: "en" },
    );

    const trigger = screen.getByRole("button", { name: /pay 1% deposit/i });
    trigger.focus();
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: /confirm deposit/i });
    const dialogButtons = within(dialog).getAllByRole("button");
    expect(dialogButtons[0]).toHaveFocus();

    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(dialogButtons.at(-1)).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("moves focus to the surviving live action after a successful deposit", async () => {
    const user = userEvent.setup();

    function DepositTransition() {
      const [hasDeposit, setHasDeposit] = useState(false);
      return (
        <ParticipationPanel
          auction={{ ...auction, status: "upcoming" }}
          locale="en"
          isAuthenticated
          isVerified={null}
          hasDeposit={hasDeposit}
          isSubmitting={false}
          onDeposit={() => setHasDeposit(true)}
        />
      );
    }

    renderWithAppProviders(<DepositTransition />, { locale: "en" });

    await user.click(screen.getByRole("button", { name: /pay 1% deposit/i }));
    await user.click(screen.getByRole("button", { name: /confirm deposit/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /enter live auction/i })).toHaveFocus();
  });

  it("keeps a rejected deposit visible and announced inside its confirmation", async () => {
    const user = userEvent.setup();

    function DepositFailure() {
      const [feedback, setFeedback] = useState<{
        tone: "danger";
        message: string;
      } | null>(null);

      return (
        <ParticipationPanel
          auction={{ ...auction, status: "upcoming" }}
          feedback={feedback}
          locale="en"
          isAuthenticated
          isVerified={null}
          hasDeposit={false}
          isSubmitting={false}
          onDeposit={async () => {
            setFeedback({
              tone: "danger",
              message: "The deposit could not be confirmed.",
            });
            throw new Error("rejected");
          }}
        />
      );
    }

    renderWithAppProviders(<DepositFailure />, { locale: "en" });

    await user.click(screen.getByRole("button", { name: /pay 1% deposit/i }));
    const dialog = screen.getByRole("dialog", { name: /confirm deposit/i });
    await user.click(
      within(dialog).getByRole("button", { name: /confirm deposit/i }),
    );

    await waitFor(() =>
      expect(within(dialog).getByRole("alert")).toHaveTextContent(
        /could not be confirmed/i,
      ),
    );
    expect(dialog).toBeVisible();
  });

  it("invalidates an open confirmation when its account or auction scope changes", async () => {
    const user = userEvent.setup();
    const onDeposit = vi.fn();
    const view = renderWithAppProviders(
      <ParticipationPanel
        auction={{ ...auction, status: "upcoming" }}
        depositScopeKey="19:10245"
        locale="en"
        isAuthenticated
        isVerified={null}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={onDeposit}
      />,
      { locale: "en" },
    );

    await user.click(screen.getByRole("button", { name: /pay 1% deposit/i }));
    expect(screen.getByRole("dialog", { name: /confirm deposit/i })).toBeVisible();

    view.rerender(
      <ParticipationPanel
        auction={{ ...auction, status: "upcoming" }}
        depositScopeKey="23:10245"
        locale="en"
        isAuthenticated
        isVerified={null}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={onDeposit}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onDeposit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /pay 1% deposit/i }));
    expect(screen.getByRole("dialog", { name: /confirm deposit/i })).toBeVisible();
    view.rerender(
      <ParticipationPanel
        auction={{ ...auction, status: "ended" }}
        depositScopeKey="23:10245"
        locale="en"
        isAuthenticated
        isVerified={null}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={onDeposit}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onDeposit).not.toHaveBeenCalled();
  });

  it("labels verified sold evidence as final and hides future payment prompts", () => {
    renderWithAppProviders(
      <ParticipationPanel
        auction={{
          ...auction,
          status: "sold",
          startPrice: 100,
          currentPrice: 200,
          finalPrice: 333,
        }}
        locale="en"
        isAuthenticated={false}
        isVerified={null}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={vi.fn()}
      />,
      { locale: "en" },
    );

    expect(screen.getByText("Final price")).toBeVisible();
    expect(screen.getByText("UZS 333")).toBeVisible();
    expect(screen.queryByText(/minimum next bid/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/security deposit/i)).not.toBeInTheDocument();
  });

  it("routes a closed-auction winner to the connected bid ledger", () => {
    renderWithAppProviders(
      <ParticipationPanel
        auction={{ ...auction, status: "sold", finalPrice: 333 }}
        locale="en"
        isAuthenticated
        isVerified={null}
        isWinner
        hasDeposit
        isSubmitting={false}
        onDeposit={vi.fn()}
      />,
      { locale: "en" },
    );

    expect(screen.getByRole("link", { name: /continue/i })).toHaveAttribute(
      "href",
      "/dashboard/bids",
    );
  });

  it("uses the live-room CTA after the deposit and disables work in flight", () => {
    const { rerender } = renderWithAppProviders(
      <ParticipationPanel
        auction={auction}
        locale="en"
        isAuthenticated
        isVerified={null}
        hasDeposit
        isSubmitting={false}
        onDeposit={vi.fn()}
      />,
      { locale: "en" },
    );

    expect(
      screen.getByRole("link", { name: /enter live auction/i }),
    ).toHaveAttribute("href", "/auctions/10245/live");

    rerender(
      <ParticipationPanel
        auction={{ ...auction, status: "upcoming" }}
        locale="en"
        isAuthenticated
        isVerified={null}
        hasDeposit={false}
        isSubmitting
        onDeposit={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /processing/i })).toBeDisabled();
  });

  it("allows paying deposit after auction starts if more than 5 minutes remain", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T12:00:00.000Z"));

    renderWithAppProviders(
      <ParticipationPanel
        auction={{
          ...auction,
          status: "live",
          startTime: "2026-09-10T11:00:00.000Z",
          endTime: "2026-09-10T12:10:00.000Z",
        }}
        locale="en"
        isAuthenticated
        isVerified={null}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={vi.fn()}
      />,
      { locale: "en" },
    );

    expect(screen.getByRole("button", { name: /pay 1% deposit/i })).toBeEnabled();

    vi.useRealTimers();
  });

  it("disables deposit and announces cutoff when auction is live and 5 minutes or less remain", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T12:00:00.000Z"));

    renderWithAppProviders(
      <ParticipationPanel
        auction={{
          ...auction,
          status: "live",
          startTime: "2026-09-10T11:00:00.000Z",
          endTime: "2026-09-10T12:04:00.000Z",
        }}
        locale="en"
        isAuthenticated
        isVerified={null}
        hasDeposit={false}
        isSubmitting={false}
        onDeposit={vi.fn()}
      />,
      { locale: "en" },
    );

    expect(
      screen.getByRole("button", { name: /deposit window closed/i }),
    ).toBeDisabled();
    expect(
      screen.getByText(
        /deposits and participation are not allowed when less than 5 minutes remain/i,
      ),
    ).toBeInTheDocument();

    vi.useRealTimers();
  });
});
