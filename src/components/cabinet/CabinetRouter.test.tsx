import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LangSwitch } from "@/context/LangSwitch";

import { CabinetRouter } from "./CabinetRouter";

const auth = vi.hoisted(() => ({
  isAuthenticated: false,
  isLoading: false,
  refetch: vi.fn(),
  user: null as null | {
    balance?: number;
    email?: string;
    id?: string | number;
    firstname?: string;
    isRegGoogle?: boolean;
    lastname?: string;
    orgInn?: string;
    orgName?: string;
    phone?: string;
    phoneNumber?: string;
    phone_number?: string;
    roles?: Array<string | { id?: string | number; name?: string }>;
    type?: string;
    kycStatus?: string;
    verificationStatus?: string;
  },
}));

const live = vi.hoisted(() => ({
  notifications: { data: [] as unknown[], isError: false, isLoading: false },
  savedSearches: { data: { items: [] as unknown[] }, isError: false, isLoading: false },
  bidRecords: { data: [] as unknown[], isError: false, isLoading: false },
  userDeposits: { data: [] as unknown[], isError: false, isLoading: false },
  participatedLots: { data: [] as unknown[], isError: false, isLoading: false },
  sellerLots: { data: null as unknown, isError: false, isLoading: false },
  winningLots: { data: [] as unknown[], isError: false, isLoading: false },
  lot: { data: null as unknown, isError: false, isLoading: false },
  transactions: { data: [] as unknown[], isError: false, isLoading: false },
  statistics: { data: null as unknown, isError: false, isLoading: false },
  identities: [{ provider: "EMAIL" }] as any[],
  lotCounts: {} as Record<string, { data?: unknown; isError?: boolean; isLoading?: boolean }>,
  like: { isPending: false, mutate: vi.fn() },
  markDeleted: { isPending: false, mutate: vi.fn() },
  updateLot: { isPending: false, mutate: vi.fn() },
  updateUser: { isPending: false, mutate: vi.fn() },
  updateEmail: { isPending: false, mutate: vi.fn() },
  updateEmailVerify: { isPending: false, mutate: vi.fn() },
  updatePassword: { isPending: false, mutate: vi.fn() },
  updatePasswordVerify: { isPending: false, mutate: vi.fn() },
  addRole: { isPending: false, mutate: vi.fn() },
  deleteRole: { isPending: false, mutate: vi.fn() },
  publish: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  socketCallbacks: {} as Record<string, (message: { body?: string }) => void>,
}));

const navigation = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/payments",
  useRouter: () => navigation,
}));

vi.mock("react-intl", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-intl")>()),
  useIntl: () => ({
    formatMessage: ({ defaultMessage, id }: { defaultMessage?: string; id: string }) =>
      defaultMessage ?? id,
  }),
}));

vi.mock("@/context/UserContext", () => ({
  useUserContext: () => auth,
}));

vi.mock("@/queries/lots", () => ({
  useAllLotsAvailable: () => ({ data: [], isLoading: false, isError: false }),
  useAllLotsBySellerId: () => live.sellerLots,
  useLikedLots: () => ({ data: [], isLoading: false, isError: false }),
  useLot: () => live.lot,
  useLotCounts: (lotId: string | number) => live.lotCounts[String(lotId)] ?? {
    data: null,
    isError: false,
    isLoading: false,
  },
  useMarkDeletedMutation: () => live.markDeleted,
  useUpdateLotMutation: () => live.updateLot,
  useUserParticipated: () => live.participatedLots,
  useWinningLots: () => live.winningLots,
}));

vi.mock("@/queries/saved-searches", () => ({
  useCreateSavedSearch: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useDeleteSavedSearch: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useMySavedSearches: () => live.savedSearches,
  useUpdateSavedSearch: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/queries/payments", () => ({
  useMyPayments: () => ({
    ...live.transactions,
    data: live.transactions.data === undefined
      ? undefined
      : { list: live.transactions.data },
  }),
}));

vi.mock("@/queries/statistics", () => ({
  useUserStatistics: () => live.statistics,
}));

vi.mock("@/queries/users", () => ({
  useAddRole: () => live.addRole,
  useGetIdentities: () => ({ data: live.identities }),
  useLinkGoogleIdentity: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useLinkTelegramIdentity: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useDeleteRole: () => live.deleteRole,
  useUserDeposits: () => live.userDeposits,
  useUpdateEmail: () => live.updateEmail,
  useUpdateEmailVerify: () => live.updateEmailVerify,
  useUpdatePasswordVerify: () => live.updatePasswordVerify,
  useUpdatePasswordWithOld: () => live.updatePassword,
  useUpdateUser: () => live.updateUser,
  useUserDocumentUpload: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/queries/authSessions", () => ({
  useAuthSessions: () => ({ data: [], isLoading: false, error: null }),
  useRevokeAuthSession: () => ({ mutate: vi.fn(), isPending: false }),
  useRevokeOtherAuthSessions: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/queries/auth2fa", () => ({
  useSetupTwoFactor: () => ({ mutate: vi.fn(), isPending: false, data: null }),
  useVerifyTwoFactor: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/queries/bid", () => ({
  useAllBidByBidderId: () => live.bidRecords,
}));

vi.mock("@/queries/contracts", () => ({
  useAuctionById: () => ({ data: null, isError: false, isLoading: false }),
  useAuctionCounterparty: () => ({ data: null, isError: false, isLoading: false }),
  useContracts: () => ({ data: { items: [] }, isError: false, isLoading: false }),
  useSignContract: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/queries/vehicles", () => ({
  useDeleteVehicleImage: () => ({ isPending: false, mutate: vi.fn() }),
  useSetPrimaryVehicleImage: () => ({ isPending: false, mutate: vi.fn() }),
  useUpdateVehicle: () => live.updateLot,
  useVehicleDetail: () => live.lot,
  useVehicleMakes: () => ({ data: [], isError: false, isLoading: false }),
  useVehicleModels: () => ({ data: [], isError: false, isLoading: false }),
}));

vi.mock("@/queries/auction-listings", () => ({
  useAuctionByVehicle: () => live.lot,
  useAuctionFeed: () => live.sellerLots,
}));

vi.mock("@/hooks/useStomp", () => ({
  useSocket: () => ({
    connected: true,
    connectionState: "connected",
    publish: live.publish,
    subscribe: live.subscribe,
  }),
}));

vi.mock("@/queries/notifications", () => ({
  markNotifAsReadById: vi.fn(),
  markNotifAsRead: vi.fn(),
  useNotificationsByUserId: () => live.notifications,
}));

vi.mock("@/components/vehicle/VehicleWizard", () => ({
  VehicleWizard: () => <div data-testid="vehicle-wizard">Live vehicle wizard</div>,
}));

vi.mock("@/components/vehicle/VehicleQuestionnaire", () => ({
  VehicleQuestionnaire: () => <div data-testid="vehicle-questionnaire">Mobile questionnaire</div>,
}));

describe("CabinetRouter access, routes, and production integrity", () => {
  beforeEach(() => {
    auth.isAuthenticated = false;
    auth.isLoading = false;
    auth.refetch.mockReset();
    auth.user = null;
    navigation.push.mockReset();
    live.savedSearches = { data: { items: [] }, isError: false, isLoading: false };
    live.bidRecords = { data: [], isError: false, isLoading: false };
    live.userDeposits = { data: [], isError: false, isLoading: false };
    live.participatedLots = { data: [], isError: false, isLoading: false };
    live.sellerLots = { data: { items: [] }, isError: false, isLoading: false };
    live.winningLots = { data: [], isError: false, isLoading: false };
    live.notifications = { data: [], isError: false, isLoading: false };
    live.lot = { data: null, isError: false, isLoading: false };
    live.transactions = { data: [], isError: false, isLoading: false };
    live.statistics = { data: null, isError: false, isLoading: false };
    live.identities = [{ provider: "EMAIL" }];
    live.lotCounts = {};
    live.like.isPending = false;
    live.like.mutate.mockReset();
    live.markDeleted.isPending = false;
    live.markDeleted.mutate.mockReset();
    live.updateLot.isPending = false;
    live.updateLot.mutate.mockReset();
    live.updateUser.isPending = false;
    live.updateUser.mutate.mockReset();
    live.updateEmail.isPending = false;
    live.updateEmail.mutate.mockReset();
    live.updateEmailVerify.isPending = false;
    live.updateEmailVerify.mutate.mockReset();
    live.updatePassword.isPending = false;
    live.updatePassword.mutate.mockReset();
    live.updatePasswordVerify.isPending = false;
    live.updatePasswordVerify.mutate.mockReset();
    live.addRole.isPending = false;
    live.addRole.mutate.mockReset();
    live.deleteRole.isPending = false;
    live.deleteRole.mutate.mockReset();
    live.publish.mockReset();
    live.unsubscribe.mockReset();
    live.socketCallbacks = {};
    live.subscribe.mockReset();
    live.subscribe.mockImplementation((destination, callback) => {
      live.socketCallbacks[destination] = callback;
      return { unsubscribe: live.unsubscribe };
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not render cabinet content for an anonymous visitor", () => {
    render(<CabinetRouter section={["bids"]} />);

    expect(screen.getByRole("heading", { name: /shaxsiy kabinetga kirish/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /kirish/i })).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fdashboard%2Fbids",
    );
    expect(screen.queryByText("Chevrolet Tahoe High Country")).not.toBeInTheDocument();
  });

  it("shows a branded loading state before deciding access", () => {
    auth.isLoading = true;

    render(<CabinetRouter />);

    expect(screen.getByRole("heading", { name: /kabinet tekshirilmoqda/i })).toBeVisible();
    expect(screen.queryByText("Faol takliflar")).not.toBeInTheDocument();
  });

  it("renders the same safe loading gate on the server even for a cached client user", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: [{ name: "SELLER" }] };

    const html = renderToString(<CabinetRouter />);

    expect(html).toContain("Kabinet tekshirilmoqda");
    expect(html).not.toContain("24,5 mln");
  });

  it("routes the new vehicle path to the real seller wizard", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", kycStatus: "APPROVED", roles: [{ name: "SELLER" }] };

    render(<CabinetRouter section={["vehicles", "new"]} />);

    expect(screen.getByTestId("vehicle-wizard")).toBeVisible();
    expect(screen.queryByText("1-bosqich / 6")).not.toBeInTheDocument();
  });

  it("allows regular users to access the new vehicle route", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 8, firstname: "User", kycStatus: "APPROVED", roles: [{ name: "USER" }] };

    render(<CabinetRouter section={["vehicles", "new"]} />);

    expect(screen.getByTestId("vehicle-wizard")).toBeVisible();
  });

  it("blocks the vehicle wizard until identity verification is approved", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { id: 8, firstname: "User", kycStatus: "PENDING", roles: [{ name: "USER" }] };

    render(<CabinetRouter section={["vehicles", "new"]} />);

    expect(screen.queryByTestId("vehicle-wizard")).not.toBeInTheDocument();
    const dialog = screen.getByRole("dialog", { name: "Shaxsingizni tasdiqlang" });
    expect(dialog).toBeVisible();
    expect(within(dialog).getAllByRole("button")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Shaxsni tasdiqlash" }));
    expect(navigation.push).toHaveBeenCalledWith("/dashboard/kyc");
  });

  it("shows all cabinet destinations for regular users", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 8, firstname: "User", roles: ["USER"] };

    render(<CabinetRouter section={["payments"]} />);

    expect(screen.getAllByRole("link", { name: "Auksionlar" }).length).toBeGreaterThan(0);
  });

  it("renders a connected seller vehicle detail route", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: [{ name: "SELLER" }] };
    live.lot.data = vehicleLot("Seller vehicle detail", 702);

    render(<CabinetRouter section={["vehicles", "702"]} />);

    expect(screen.getByRole("heading", { name: "Seller vehicle detail" })).toBeVisible();
    expect(screen.getByRole("link", { name: /auksionni ko‘rish/i })).toHaveAttribute(
      "href",
      "/auctions/702",
    );
  });

  it("renders connected bid records in production without demo fixtures", () => {
    vi.stubEnv("NODE_ENV", "production");
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: [{ name: "SELLER" }] };
    live.bidRecords.data = [
      { auctionId: 703, bidAmount: 120000000, bidStatus: "ACTIVE", bidTime: "2026-07-24T10:00:00Z" },
    ];

    render(<CabinetRouter section={["bids"]} />);

    expect(screen.queryByRole("cell", { name: "#703" })).not.toBeInTheDocument();
    expect(screen.getAllByText("UZS 120,000,000").length).toBeGreaterThan(0);
    expect(screen.queryByText("Chevrolet Tahoe High Country")).not.toBeInTheDocument();
    expect(screen.queryByText(/takliflar xizmati hali ulanmagan/i)).not.toBeInTheDocument();
  });

  it("groups bids by auction and combines matching deposit totals", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: [{ name: "SELLER" }] };
    live.bidRecords.data = [
      { auctionId: 703, bidAmount: 120000000, bidStatus: "OUTBID", bidTime: "2026-07-24T10:00:00Z" },
      { auctionId: 703, bidAmount: 130000000, bidStatus: "ACTIVE", bidTime: "2026-07-24T11:00:00Z" },
      { auctionId: 706, bidAmount: 90000000, bidStatus: "ACTIVE", bidTime: "2026-07-23T10:00:00Z" },
    ];
    live.userDeposits.data = [
      { auctionId: 703, amount: 1200000 },
      { auctionId: 706, amount: 900000 },
    ];

    render(<CabinetRouter section={["bids"]} />);

    expect(screen.getByText("Ishtirok etgan auksionlar")).toBeVisible();
    expect(screen.queryByRole("cell", { name: "#703" })).not.toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "#706" })).not.toBeInTheDocument();
    expect(screen.getByText("UZS 250,000,000")).toBeVisible();
    expect(screen.getByText("UZS 1,200,000")).toBeVisible();
  });

  it("labels won and lost auctions from bid statuses", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Bidder", roles: ["BUYER"] };
    live.bidRecords.data = [
      { auctionId: 710, bidAmount: 142000000, bidStatus: "WON", bidTime: "2026-07-24T12:00:00Z" },
      { auctionId: 711, bidAmount: 138000000, bidStatus: "OUTBID", bidTime: "2026-07-24T11:00:00Z" },
    ];

    render(<CabinetRouter section={["bids"]} />);

    expect(screen.queryByRole("cell", { name: "#710" })).not.toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "#711" })).not.toBeInTheDocument();
    expect(screen.getByText("Yutdingiz")).toBeVisible();
    expect(screen.getByText("Yutqazdingiz")).toBeVisible();
    expect(screen.getAllByText("UZS 142,000,000").length).toBeGreaterThan(0);
  });

  it.each(["bidRecords", "userDeposits"] as const)(
    "surfaces an error when the %s bid feed fails",
    (feed) => {
      auth.isAuthenticated = true;
      auth.user = { id: 7, firstname: "Seller", roles: [{ name: "SELLER" }] };
      live[feed].isError = true;

      render(<CabinetRouter section={["bids"]} />);

      expect(screen.getByRole("heading", { name: /ma’lumot yuklanmadi/i })).toBeVisible();
    },
  );

  it("keeps bids in a loading state until both connected feeds settle", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: [{ name: "SELLER" }] };
    live.userDeposits.isLoading = true;

    render(<CabinetRouter section={["bids"]} />);

    expect(screen.getByRole("status", { name: /ma’lumot yuklanmoqda/i })).toBeVisible();
  });

  it("renders an honest connected overview in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    auth.isAuthenticated = true;
    auth.user = {
      id: 7,
      firstname: "Seller",
      roles: [{ name: "SELLER" }],
      email: "seller@example.uz",
    } as typeof auth.user;

    render(<CabinetRouter />);

    expect(screen.getByText("seller@example.uz")).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Saqlanganlar" }).length).toBeGreaterThan(0);
    expect(screen.queryByText("24,5 mln")).not.toBeInTheDocument();
    expect(screen.queryByText("Siz 2 ta lotda yetakchisiz")).not.toBeInTheDocument();
  });

  it("shows the phone number instead of an absent email for phone-only accounts", () => {
    auth.isAuthenticated = true;
    auth.user = {
      id: 17,
      firstname: "Phone",
      phone: "+998901234567",
      roles: ["BUYER"],
    } as typeof auth.user;

    render(<CabinetRouter />);

    expect(screen.getByText("Telefon")).toBeVisible();
    expect(screen.getByText("+998901234567")).toBeVisible();
    expect(screen.queryByText("E-mail")).not.toBeInTheDocument();
  });

  it("renders the connected balance and actionable user statistics", () => {
    auth.isAuthenticated = true;
    auth.user = {
      balance: 1_000_000,
      id: 7,
      firstname: "Seller",
      roles: [{ id: 3, name: "SELLER" }],
    } as typeof auth.user;
    live.statistics.data = {
      bidCount: 11,
      depositCount: 4,
      lotCount: {
        activeLotsCount: 3,
        allLotsCount: 8,
        finishedLotsCount: 2,
        pendingLotsCount: 1,
      },
      transactionsForMonth: { minus: 125_000, plus: 500_000 },
    };

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <CabinetRouter />
      </LangSwitch.Provider>,
    );

    expect(screen.getByRole("heading", { name: "Live account overview" })).toBeVisible();
    expect(screen.getByText("UZS 1,000,000")).toBeVisible();
    expect(screen.getByText("UZS 500,000")).toBeVisible();
    expect(screen.getByText("UZS 125,000")).toBeVisible();
    expect(screen.getByText("11")).toBeVisible();
    expect(screen.getByText("4")).toBeVisible();
    expect(screen.getByRole("link", { name: /all vehicles.*8.*active vehicles.*3/i })).toHaveAttribute(
      "href",
      "/dashboard/vehicles",
    );
  });

  it("renders absent fields in a partial statistics payload as unknown", () => {
    auth.isAuthenticated = true;
    auth.user = {
      balance: 1_000_000,
      id: 7,
      firstname: "Seller",
      roles: [{ id: 3, name: "SELLER" }],
    } as typeof auth.user;
    live.statistics.data = { likeCount: 3 };

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <CabinetRouter />
      </LangSwitch.Provider>,
    );

    expect(screen.getByText("Bids").nextElementSibling).toHaveTextContent("—");
    expect(screen.getByText("Deposits").nextElementSibling).toHaveTextContent("—");

    const monthlySummary = screen.getByText("This month").parentElement;
    expect(monthlySummary).not.toBeNull();
    expect(monthlySummary?.querySelectorAll("dd")).toHaveLength(2);
    monthlySummary?.querySelectorAll("dd").forEach((value) => {
      expect(value).toHaveTextContent("—");
      expect(value).not.toHaveTextContent("UZS 0");
    });

    const lotSummary = screen.getByRole("link", { name: /all vehicles/i });
    expect(lotSummary.querySelectorAll("span > span:last-child")).toHaveLength(4);
    lotSummary.querySelectorAll("span > span:last-child").forEach((value) => {
      expect(value).toHaveTextContent("—");
      expect(value).not.toHaveTextContent("0");
    });
  });

  it("surfaces the connected overview statistics error", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 8, firstname: "Buyer", roles: ["BUYER"] };
    live.statistics.isError = true;

    render(<CabinetRouter />);

    expect(screen.getByRole("heading", { name: /ma’lumot yuklanmadi/i })).toBeVisible();
  });



  it("renders saved searches from the connected mine endpoint", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { id: 8, firstname: "Buyer", roles: [{ name: "BUYER" }] };
    live.savedSearches.data = {
      items: [{
        id: 704,
        name: "Tashkent sedans",
        query: "Toyota",
        filters: { bodyType: "SEDAN", yearFrom: 2020 },
        createdAt: "2026-07-20T10:00:00Z",
      }],
    };

    render(<CabinetRouter section={["watchlist"]} />);
    await user.click(screen.getByRole("tab", { name: "Qidiruvlar" }));

    expect(screen.getByRole("heading", { name: "Tashkent sedans" })).toBeVisible();
    expect(screen.getByText("Toyota")).toBeVisible();
    expect(screen.getByText("SEDAN")).toBeVisible();
    expect(screen.getByText("2020")).toBeVisible();
  });

  it.each(["", "   ", "0", "-4", "NaN"])(
    "rejects an invalid account identifier %j before rendering private watchlist data",
    (id) => {
      auth.isAuthenticated = true;
      auth.user = { id, firstname: "Buyer", roles: ["BUYER"] };
      live.savedSearches.data = { items: [{ id: 799, name: "Another account search" }] };

      render(<CabinetRouter section={["watchlist"]} />);

      expect(screen.getByRole("heading", { name: /hisob aniqlanmadi/i })).toBeVisible();
      expect(screen.queryByText("Another account search")).not.toBeInTheDocument();
    },
  );

  it.each([
    ["bids", "participatedLots"],
    ["payments", "transactions"],
  ] as const)("rejects invalid account scope before rendering private %s data", (section, feed) => {
    auth.isAuthenticated = true;
    auth.user = { id: "-8", firstname: "Buyer", roles: ["BUYER"] };
    if (feed === "participatedLots") live.participatedLots.data = [vehicleLot("Private bid", 798)];
    else live.transactions.data = [{ id: 44, amount: 100, currency: "UZS", type: "DEPOSIT" }];

    render(<CabinetRouter section={[section]} />);

    expect(screen.getByRole("heading", { name: /hisob aniqlanmadi/i })).toBeVisible();
    expect(screen.queryByText("Private bid")).not.toBeInTheDocument();
    expect(screen.queryByText("UZS 100")).not.toBeInTheDocument();
  });

  it("renders connected seller vehicles", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: [{ name: "SELLER" }] };
    live.sellerLots.data = { items: [vehicleLot("Connected seller vehicle", 705)] };

    render(<CabinetRouter section={["vehicles"]} />);

    expect(screen.getByRole("heading", { name: "Connected seller vehicle" })).toBeVisible();
    expect(screen.getByRole("link", { name: /tafsilotlarini korish/i })).toHaveAttribute(
      "href",
      "/dashboard/vehicles/705",
    );
  });

  it("shows seller vehicles without legacy moderation status groups", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: ["USER"] };
    live.sellerLots.data = {
      items: [
        vehicleLot("Draft vehicle", 720, { lotStatus: "DRAFT" }),
        vehicleLot("Review vehicle", 721, { lotStatus: "PENDING" }),
        vehicleLot("Scheduled vehicle", 722, { lotStatus: "PUBLISHED" }),
        vehicleLot("Live vehicle", 723, { lotStatus: "ACTIVE" }),
        vehicleLot("Sold vehicle", 724, { lotStatus: "SOLD" }),
        vehicleLot("Rejected vehicle", 725, { isApproved: false, lotStatus: "DECLINED" }),
        vehicleLot("Archived vehicle", 726, { lotStatus: "DELETED" }),
      ]
    };

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <CabinetRouter section={["vehicles"]} />
      </LangSwitch.Provider>,
    );

    expect(screen.queryByRole("button", { name: /Drafts/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Approved/i })).not.toBeInTheDocument();
    for (const title of [
      "Draft vehicle",
      "Review vehicle",
      "Scheduled vehicle",
      "Live vehicle",
      "Sold vehicle",
      "Rejected vehicle",
      "Archived vehicle",
    ]) {
      expect(screen.getByRole("heading", { name: new RegExp(title, "i") })).toBeVisible();
    }
  });



  it("lets the authenticated owner edit a vehicle without changing its seller", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: ["SELLER"] };
    live.lot.data = vehicleLot("Editable seller vehicle", 702, { lotStatus: "DRAFT" });

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <CabinetRouter section={["vehicles", "702"]} />
      </LangSwitch.Provider>,
    );

    await user.click(screen.getByRole("button", { name: /edit vehicle/i }));
    expect(navigation.push).toHaveBeenCalledWith("/dashboard/vehicles/new?edit=702");
  });

  it("blocks seller controls when the requested vehicle belongs to another account", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: ["SELLER"] };
    live.lot.data = vehicleLot("Another seller vehicle", 702, { sellerId: 99 });

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <CabinetRouter section={["vehicles", "702"]} />
      </LangSwitch.Provider>,
    );

    expect(screen.getByRole("heading", { name: /vehicle access unavailable/i })).toBeVisible();
    expect(screen.queryByRole("button", { name: /edit vehicle/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /archive vehicle/i })).not.toBeInTheDocument();
  });

  it("renders connected payments with localized transaction types", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 8, firstname: "Buyer", roles: ["BUYER"] };
    live.transactions.data = [
      {
        id: 91,
        amount: 250000,
        createdAt: "2026-07-16T10:00:00Z",
        currency: "UZS",
        transactionType: "REFUND",
      },
    ];

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <CabinetRouter section={["payments"]} />
      </LangSwitch.Provider>,
    );

    const paymentsTable = screen.getByRole("table", { name: "Payments" });
    expect(screen.getByRole("cell", { name: "Refund" })).toBeVisible();
    expect(within(paymentsTable).getByText(/UZS 250,000/)).toBeVisible();
  });

  it("normalizes alternate payment keys and never invents an unconfirmed currency", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 8, firstname: "Buyer", roles: ["BUYER"] };
    live.transactions.data = [
      {
        id: 92,
        amount: 125.5,
        currency: "usd",
        transactionTime: "2026-07-16T11:00:00Z",
        type: "PAYMENT",
      },
      {
        id: 93,
        amount: 99000,
        transactionTime: "2026-07-16T12:00:00Z",
        type: "DEPOSIT",
      },
    ];

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <CabinetRouter section={["payments"]} />
      </LangSwitch.Provider>,
    );

    const paymentsTable = screen.getByRole("table", { name: "Payments" });
    expect(screen.getByRole("cell", { name: "Refill" })).toBeVisible();
    expect(within(paymentsTable).getByText("USD 125.50")).toBeVisible();
    expect(within(paymentsTable).getByText(/99,000.*currency not provided/i)).toBeVisible();
    expect(screen.queryByRole("cell", { name: "99,000 UZS" })).not.toBeInTheDocument();
    expect(within(paymentsTable).getAllByText(/Jul 16, 2026/)).toHaveLength(2);
  });

  it("loads notifications from the existing live stream", async () => {
    auth.isAuthenticated = true;
    auth.user = { id: 8, firstname: "Buyer", roles: ["BUYER"] };
    live.subscribe.mockImplementation((_destination, callback) => {
      callback({
        body: JSON.stringify({
          data: [
            {
              id: 44,
              title: "Live account notice",
              body: "Your deposit was received",
              createdAt: "2026-07-16T10:00:00Z",
              isRead: false,
            },
          ],
        }),
      });
      return { unsubscribe: live.unsubscribe };
    });

    render(<CabinetRouter section={["notifications"]} />);

    expect(await screen.findByRole("heading", { name: "Live account notice" })).toBeVisible();
    expect(live.subscribe).toHaveBeenCalledWith(
      "/topic/notification/getAllNotifications/8",
      expect.any(Function),
    );
    expect(live.publish).toHaveBeenCalledWith({
      destination: "/app/notification/getAllNotifications/8",
    });
  });

  it("shows unread notifications in the dashboard header dropdown", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { id: 8, firstname: "Buyer", roles: ["BUYER"] };
    live.notifications = {
      data: [
        { body: "Auction starts soon", createdAt: "2026-08-12T08:00:00Z", id: 45, isRead: false, title: "Auction reminder" },
        { body: "Already seen", createdAt: "2026-08-11T08:00:00Z", id: 44, isRead: true, title: "Old notice" },
      ],
      isError: false,
      isLoading: false,
    };

    render(<CabinetRouter />);
    await user.click(screen.getByRole("button", { name: /bildirishnomalar markazi: 1/i }));

    expect(screen.getByText("Auction reminder")).toBeVisible();
    expect(screen.queryByText("Old notice")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bildirishnomalar sahifasiga o‘tish" })).toHaveAttribute(
      "href",
      "/dashboard/notifications",
    );
    expect(screen.getByRole("link", { name: /auction reminder/i })).toHaveAttribute(
      "href",
      "/dashboard/notifications?notificationId=45",
    );
  });

  it("clears notifications on account switch and ignores a late frame from the old account", async () => {
    auth.isAuthenticated = true;
    auth.user = { id: 8, firstname: "Buyer A", roles: ["BUYER"] };
    const { rerender } = render(<CabinetRouter section={["notifications"]} />);
    const accountACallback = live.socketCallbacks["/topic/notification/getAllNotifications/8"];

    act(() => accountACallback({
      body: JSON.stringify({ data: [{ id: 1, title: "Private A notice" }] }),
    }));
    expect(await screen.findByRole("heading", { name: "Private A notice" })).toBeVisible();

    auth.user = { id: 9, firstname: "Buyer B", roles: ["BUYER"] };
    rerender(<CabinetRouter section={["notifications"]} />);

    expect(screen.queryByText("Private A notice")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /bildirishnomalar yo‘q/i })).toBeVisible();
    act(() => accountACallback({
      body: JSON.stringify({ data: [{ id: 2, title: "Late private A notice" }] }),
    }));
    expect(screen.queryByText("Late private A notice")).not.toBeInTheDocument();

    act(() => live.socketCallbacks["/topic/notification/getAllNotifications/9"]({
      body: JSON.stringify({ data: [{ id: 3, title: "Private B notice" }] }),
    }));
    expect(await screen.findByRole("heading", { name: "Private B notice" })).toBeVisible();
  });

  it("updates the authenticated user through the connected profile mutation", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = {
      id: 8,
      firstname: "Current",
      lastname: "Buyer",
      roles: ["BUYER"],
      type: "INDIVIDUAL",
    } as typeof auth.user;

    render(<CabinetRouter section={["profile"]} />);

    const firstName = screen.getByRole("textbox", { name: "Ism" });
    await user.clear(firstName);
    await user.type(firstName, "Updated");
    await user.click(screen.getByRole("button", { name: /o‘zgarishlarni saqlash/i }));

    expect(live.updateUser.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 8, firstname: "Updated", lastname: "Buyer" }),
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );

    act(() => live.updateUser.mutate.mock.calls[0][1].onSuccess({ data: { status: "ERROR" } }));
    expect(screen.getByRole("alert")).toHaveTextContent(/profil saqlanmadi/i);
    expect(screen.queryByText(/profil ma’lumotlari saqlandi/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /o‘zgarishlarni saqlash/i }));
    act(() => live.updateUser.mutate.mock.calls[1][1].onSuccess({ status: "OK" }));
    expect(screen.getByRole("status")).toHaveTextContent(/profil ma’lumotlari saqlandi/i);
  });

  it("preserves the connected email-change and OTP verification mutations", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = {
      id: 8,
      email: "buyer@example.uz",
      firstname: "Current",
      roles: ["BUYER"],
    } as typeof auth.user;

    render(<CabinetRouter section={["profile"]} />);

    await user.clear(screen.getByRole("textbox", { name: /yangi e-mail/i }));
    await user.type(screen.getByRole("textbox", { name: /yangi e-mail/i }), "new@example.uz");
    await user.click(screen.getByRole("button", { name: /tasdiqlash kodini yuborish/i }));

    expect(live.updateEmail.mutate).toHaveBeenCalledWith(
      { email: "buyer@example.uz", newEmail: "new@example.uz" },
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );

    act(() => live.updateEmail.mutate.mock.calls[0][1].onSuccess({ data: { status: "OK" } }));
    await user.type(screen.getByRole("textbox", { name: /tasdiqlash kodi/i }), "123456");
    await user.click(screen.getByRole("button", { name: /^tasdiqlash$/i }));

    expect(live.updateEmailVerify.mutate).toHaveBeenCalledWith(
      { oldEmail: "buyer@example.uz", newEmail: "new@example.uz", code: "123456" },
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );
  });

  it("preserves the connected password-change and OTP verification mutations", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = {
      id: 8,
      email: "buyer@example.uz",
      firstname: "Current",
      roles: ["BUYER"],
    } as typeof auth.user;

    render(<CabinetRouter section={["profile"]} />);

    await user.type(screen.getByLabelText(/joriy parol/i), "old-password");
    await user.type(screen.getByLabelText(/yangi parol/i), "new-password");
    await user.click(screen.getByRole("button", { name: /parolni yangilash/i }));

    expect(live.updatePassword.mutate).toHaveBeenCalledWith(
      {
        email: "buyer@example.uz",
        newPassword: "new-password",
        oldPassword: "old-password",
      },
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );

    act(() => live.updatePassword.mutate.mock.calls[0][1].onSuccess({ data: { status: "OK" } }));
    await user.type(screen.getByRole("textbox", { name: /tasdiqlash kodi/i }), "654321");
    await user.click(screen.getByRole("button", { name: /^tasdiqlash$/i }));

    expect(live.updatePasswordVerify.mutate).toHaveBeenCalledWith(
      { email: "buyer@example.uz", password: "new-password", code: "654321" },
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );
  });

  it("resets every profile draft and verification state when the account changes", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = {
      id: 8,
      email: "a@example.uz",
      firstname: "Account A",
      lastname: "Secret",
      roles: ["BUYER"],
    } as typeof auth.user;
    const { rerender } = render(<CabinetRouter section={["profile"]} />);

    await user.clear(screen.getByRole("textbox", { name: "Ism" }));
    await user.type(screen.getByRole("textbox", { name: "Ism" }), "Unsaved A");
    await user.clear(screen.getByRole("textbox", { name: /yangi e-mail/i }));
    await user.type(screen.getByRole("textbox", { name: /yangi e-mail/i }), "secret-a@example.uz");
    await user.click(screen.getByRole("button", { name: /tasdiqlash kodini yuborish/i }));
    act(() => live.updateEmail.mutate.mock.calls[0][1].onSuccess({ status: "OK" }));
    await user.type(screen.getByRole("textbox", { name: /tasdiqlash kodi/i }), "111111");
    await user.type(screen.getByLabelText(/joriy parol/i), "old-a");

    auth.user = {
      id: 9,
      email: "b@example.uz",
      firstname: "Account B",
      lastname: "Clean",
      roles: ["BUYER"],
    } as typeof auth.user;
    rerender(<CabinetRouter section={["profile"]} />);

    expect(screen.getByRole("textbox", { name: "Ism" })).toHaveValue("Account B");
    expect(screen.getByRole("textbox", { name: "Familiya" })).toHaveValue("Clean");
    expect(screen.getByRole("textbox", { name: /yangi e-mail/i })).toHaveValue("");
    expect(screen.getByLabelText(/joriy parol/i)).toHaveValue("");
    expect(screen.queryByRole("textbox", { name: /tasdiqlash kodi/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/yuborildi/i)).not.toBeInTheDocument();

    await user.clear(screen.getByRole("textbox", { name: "Ism" }));
    await user.type(screen.getByRole("textbox", { name: "Ism" }), "Account B Modified");
    await user.click(screen.getByRole("button", { name: /o‘zgarishlarni saqlash/i }));
    expect(live.updateUser.mutate).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 9, firstname: "Account B Modified", lastname: "Clean" }),
      expect.any(Object),
    );
  });

  it("requires explicit OK for password request and verification callbacks", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = {
      id: 8,
      email: "buyer@example.uz",
      firstname: "Buyer",
      roles: ["BUYER"],
    } as typeof auth.user;
    render(<CabinetRouter section={["profile"]} />);

    await user.type(screen.getByLabelText(/joriy parol/i), "old-password");
    await user.type(screen.getByLabelText(/yangi parol/i), "new-password");
    await user.click(screen.getByRole("button", { name: /parolni yangilash/i }));
    act(() => live.updatePassword.mutate.mock.calls[0][1].onSuccess({ data: { status: "ERROR" } }));

    expect(screen.queryByRole("textbox", { name: /tasdiqlash kodi/i })).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/parolni yangilash.*bo‘lmadi/i);

    await user.click(screen.getByRole("button", { name: /parolni yangilash/i }));
    act(() => live.updatePassword.mutate.mock.calls[1][1].onSuccess({ status: "OK" }));
    await user.type(screen.getByRole("textbox", { name: /tasdiqlash kodi/i }), "222222");
    await user.click(screen.getByRole("button", { name: /^tasdiqlash$/i }));
    act(() => live.updatePasswordVerify.mutate.mock.calls[0][1].onSuccess({ data: { status: "ERROR" } }));

    expect(screen.getByRole("textbox", { name: /tasdiqlash kodi/i })).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent(/tasdiqlash kodini.*bo‘lmadi/i);
  });

  it("synchronizes the displayed and editable email after confirmed verification", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = {
      id: 8,
      email: "old@example.uz",
      firstname: "Buyer",
      roles: ["BUYER"],
    } as typeof auth.user;
    render(<CabinetRouter section={["profile"]} />);

    const emailDraft = screen.getByRole("textbox", { name: /yangi e-mail/i });
    await user.clear(emailDraft);
    await user.type(emailDraft, "new@example.uz");
    await user.click(screen.getByRole("button", { name: /tasdiqlash kodini yuborish/i }));
    act(() => live.updateEmail.mutate.mock.calls[0][1].onSuccess({ status: "OK" }));
    await user.type(screen.getByRole("textbox", { name: /tasdiqlash kodi/i }), "333333");
    await user.click(screen.getByRole("button", { name: /^tasdiqlash$/i }));
    act(() => live.updateEmailVerify.mutate.mock.calls[0][1].onSuccess({ status: "OK" }));

    expect(screen.getByLabelText(/^E-mail$/i)).toHaveValue("new@example.uz");
    expect(screen.getByRole("textbox", { name: /yangi e-mail/i })).toHaveValue("");
  });

  it("routes deals to the connected contracts surface", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: [{ name: "SELLER" }] };

    render(<CabinetRouter section={["deals"]} />);

    expect(screen.getByRole("heading", { name: /hozircha shartnoma yo‘q/i })).toBeVisible();
  });

  it.each([
    ["dealer", /diler xizmati hali ulanmagan/i],
  ])("keeps the %s v2 surface honestly unavailable", (section, expectedTitle) => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: [{ name: "SELLER" }] };

    render(<CabinetRouter section={[section]} />);

    expect(screen.getByRole("heading", { name: expectedTitle })).toBeVisible();
  });

  it("routes KYC to the connected verification form", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: [{ name: "SELLER" }] };

    render(<CabinetRouter section={["kyc"]} />);

    expect(screen.getByRole("heading", { name: /shaxsni tasdiqlash/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /Tasdiqlash arizasini yuborish/i })).toBeVisible();
  });

  it("localizes the authentication gate", () => {
    render(
      <LangSwitch.Provider value={{ currentLang: "ru", setCurrentLang: vi.fn() }}>
        <CabinetRouter section={["payments"]} />
      </LangSwitch.Provider>,
    );

    expect(screen.getByRole("heading", { name: "Войдите в личный кабинет" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Войти" })).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fdashboard%2Fpayments",
    );
  });

  it("localizes the active heading, description, and shell navigation", () => {
    auth.isAuthenticated = true;
    auth.user = { id: 7, firstname: "Seller", roles: [{ name: "SELLER" }] };

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <CabinetRouter section={["payments"]} />
      </LangSwitch.Provider>,
    );

    expect(screen.getByRole("heading", { name: "Payments" })).toBeVisible();
    expect(screen.getByText(/deposits, refunds, and wallet operations/i)).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Saved" }).length).toBeGreaterThan(0);
    const mobileNav = screen.getByRole("navigation", { name: "Mobile cabinet destinations" });
    expect(mobileNav).toHaveClass("pb-[env(safe-area-inset-bottom)]");
    expect(mobileNav.querySelector('a[href="/dashboard/vehicles"]')).not.toBeNull();
    expect(screen.getByRole("navigation", { name: "Cabinet section tabs" })).toBeInTheDocument();
  });
});

function vehicleLot(
  title: string,
  id: number,
  overrides: Record<string, unknown> = {},
) {
  const lotStatus = overrides.lotStatus ?? "ACTIVE";
  const makeName = String(overrides.makeName ?? title);
  const modelName = String(overrides.modelName ?? "");
  const year = overrides.year !== undefined ? overrides.year : undefined;
  const sellerId = overrides.sellerId !== undefined ? overrides.sellerId : 7;
  const ownerId = overrides.ownerId !== undefined ? overrides.ownerId : sellerId;
  return {
    id,
    status: lotStatus,
    lotType: { name: "CAR" },
    startPrice: 125000000,
    currentPrice: 130000000,
    currency: "UZS",
    vehicle: {
      vehicleId: id,
      makeName,
      modelName,
      year,
      status: lotStatus,
      sellerId,
      ownerId,
      title,
    },
    ...overrides,
  };
}
