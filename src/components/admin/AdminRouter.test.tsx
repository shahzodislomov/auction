import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LangSwitch } from "@/context/LangSwitch";

import { AdminRouter } from "./AdminRouter";

const auth = vi.hoisted(() => ({
  isAuthenticated: false,
  isLoading: false,
  logout: vi.fn(),
  user: null as null | {
    firstname?: string;
    lastname?: string;
    roles?: Array<{ name?: string }>;
  },
}));

const connected = vi.hoisted(() => ({
  bids: [] as Array<Record<string, unknown>>,
  attributes: [] as Array<Record<string, unknown>>,
  attachedAttributes: [] as Array<Record<string, unknown>>,
  attributeOptions: [] as Array<Record<string, unknown>>,
  untiedAttributes: [] as Array<Record<string, unknown>>,
  banners: [] as Array<Record<string, unknown>>,
  lotStats: undefined as Record<string, unknown> | undefined,
  lotTypes: [] as Array<Record<string, unknown>>,
  lots: [] as Array<Record<string, unknown>>,
  approvedLots: [] as Array<Record<string, unknown>>,
  auctions: [] as Array<Record<string, unknown>>,
  auctionCounts: null as null | {
    all: number;
    approval: Record<string, number>;
    lifecycle: Record<string, number>;
  },
  auctionFeedRequest: null as Record<string, unknown> | null,
  adminVehicles: [] as Array<Record<string, unknown>>,
  vehicleDocuments: [] as Array<Record<string, unknown>>,
  pendingLots: [] as Array<Record<string, unknown>>,
  subtypes: [] as Array<Record<string, unknown>>,
  transactions: [] as Array<Record<string, unknown>>,
  roles: [] as Array<Record<string, unknown>>,
  tranStats: undefined as Record<string, unknown> | undefined,
  users: [] as Array<Record<string, unknown>>,
  userStats: undefined as Record<string, unknown> | undefined,
  auditLogs: [] as Array<Record<string, unknown>>,
  refetch: vi.fn(),
}));

const mutations = vi.hoisted(() => ({
  addBalance: vi.fn(),
  addRole: vi.fn(),
  approve: vi.fn(),
  block: vi.fn(),
  createNotice: vi.fn(),
  decline: vi.fn(),
  deleteRole: vi.fn(),
  createAttribute: vi.fn(),
  createBanner: vi.fn(),
  createOption: vi.fn(),
  createSubtype: vi.fn(),
  createType: vi.fn(),
  tieAttribute: vi.fn(),
  deleteAttribute: vi.fn(),
  deleteBanner: vi.fn(),
  deleteLot: vi.fn(),
  deleteSubtype: vi.fn(),
  deleteType: vi.fn(),
  updateSubtype: vi.fn(),
  updateType: vi.fn(),
  approveAuction: vi.fn(),
  approveVehicleDocument: vi.fn(),
  rejectAuction: vi.fn(),
  rejectVehicleDocument: vi.fn(),
}));

const pendingMutations = vi.hoisted(() => new Set<string>());

const query = (data: unknown) => ({
  data,
  error: null,
  isError: false,
  isLoading: false,
  isPending: false,
  refetch: connected.refetch,
});

const mutation = (mutate: typeof mutations.approve, key: string) => ({
  isLoading: pendingMutations.has(key),
  isPending: pendingMutations.has(key),
  mutate,
});

vi.mock("@/context/UserContext", () => ({
  useUserContext: () => auth,
}));

vi.mock("react-countup", () => ({
  __esModule: true,
  default: ({ end, prefix, suffix }: { end: number; prefix?: string; suffix?: string }) => (
    <span>{prefix}{end}{suffix}</span>
  ),
}));

vi.mock("@tanstack/react-query", () => {
  return {
    useQuery: (options: { queryKey: unknown[] }) => {
      const key = options.queryKey[0];
      const subKey = options.queryKey[1];
      if (key === "allUsers") {
        return query(connected.users);
      }
      if (key === "auditLog") {
        return query({
          list: connected.auditLogs || [],
          meta: { elements: (connected.auditLogs || []).length, pages: 1 },
        });
      }
      if (key === "admin-report") {
        if (subKey === "marketplace-summary") {
          return query(connected.lotStats);
        }
        if (subKey === "financial-summary") {
          return query(connected.tranStats);
        }
        if (subKey === "seller-performance") {
          return query(connected.userStats);
        }
        if (subKey === "sold-auctions") {
          return query({});
        }
      }
      return query(undefined);
    },
    useMutation: () => ({ mutate: vi.fn(), isLoading: false }),
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

vi.mock("@/queries", () => ({
  useLotStatistics: () => query(connected.lotStats),
  useTranStatistics: () => query(connected.tranStats),
  useUserStatistics: () => query(connected.userStats),
}));

vi.mock("@/queries/bid", () => ({
  useAllBids: () => query(connected.bids),
}));

vi.mock("@/queries/auction-listings", () => ({
  useAdminVehicles: () => query(connected.adminVehicles),
  useGetAiFailedVehicles: () => query([]),
  useGetAiLogs: () => query([]),
  useRetryAiProcessing: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useAuctionFeed: (request: Record<string, unknown>) => {
    connected.auctionFeedRequest = request;
    return query({
      items: connected.auctions,
      meta: {
        ...(connected.auctionCounts ? { counts: connected.auctionCounts } : {}),
        elements: connected.auctionCounts?.all ?? connected.auctions.length,
        pages: 1,
      },
    });
  },
  usePendingAdminAuctions: () => query({
    items: connected.auctions,
    meta: { elements: connected.auctions.length, pages: 1 },
  }),
  useAuction: (auctionId: string | number) =>
    query(
      connected.auctions.find(
        (a) => String(a.auctionId || a.id) === String(auctionId),
      ),
    ),
  useAuctions: () => query(connected.auctions),
  useApproveAdminAuction: () => ({ isPending: false, mutateAsync: mutations.approveAuction }),
  useRejectAdminAuction: () => ({ isPending: false, mutateAsync: mutations.rejectAuction }),
}));

vi.mock("@/queries/admin-vehicle-documents", () => ({
  useAdminVehicleDocuments: () => query({ elements: connected.vehicleDocuments.length, list: connected.vehicleDocuments, page: 0, pages: 1, size: 100 }),
  useApproveVehicleDocument: () => ({ isPending: false, mutateAsync: mutations.approveVehicleDocument }),
  useRejectVehicleDocument: () => ({ isPending: false, mutateAsync: mutations.rejectVehicleDocument }),
}));

vi.mock("@/queries/lot-types", () => ({
  useCreateLotTypeMutation: () => mutation(mutations.createType, "createType"),
  useDeleteLotTypeMutation: () => mutation(mutations.deleteType, "deleteType"),
  useLotTypes: () => query(connected.lotTypes),
  useUpdateLotTypeMutation: () => mutation(mutations.updateType, "updateType"),
}));

vi.mock("@/queries/attributes", () => ({
  useAttr: () => query(connected.attributes),
  useAttrBySubtype: () => query(connected.attachedAttributes),
  useAttrOptions: () => query(connected.attributeOptions),
  useCreateAttrOption: () => mutation(mutations.createOption, "createOption"),
  useCreateLotAttribute: () => mutation(mutations.createAttribute, "createAttribute"),
  useDeleteAttr: () => mutation(mutations.deleteAttribute, "deleteAttribute"),
  useTieAttribute: () => mutation(mutations.tieAttribute, "tieAttribute"),
  useUntiedAttr: () => query(connected.untiedAttributes),
}));

vi.mock("@/queries/lots", () => ({
  useAllLots: () => query(connected.lots),
  useAllLotsApproved: () => query(connected.approvedLots),
  useAllLotsNotApproved: () => query(connected.pendingLots),
  useAddBannerMutation: () => mutation(mutations.createBanner, "createBanner"),
  useApproveLotMutation: () => mutation(mutations.approve, "approve"),
  useBanner: () => query(connected.banners),
  useDeclineLotMutation: () => mutation(mutations.decline, "decline"),
  useDeleteBannerMutation: () => mutation(mutations.deleteBanner, "deleteBanner"),
  useDeleteLotMutation: () => mutation(mutations.deleteLot, "deleteLot"),
}));

vi.mock("@/queries/subtypes", () => ({
  useCreateSubType: () => mutation(mutations.createSubtype, "createSubtype"),
  useDeleteSub: () => mutation(mutations.deleteSubtype, "deleteSubtype"),
  useSub: () => query(connected.subtypes),
  useUpdateSubTypeMutation: () => mutation(mutations.updateSubtype, "updateSubtype"),
}));

vi.mock("@/queries/transaction", () => ({
  useAllTransactions: () => query(connected.transactions),
}));

vi.mock("@/queries/users", () => ({
  useAddBalance: () => mutation(mutations.addBalance, "addBalance"),
  useAddRole: () => mutation(mutations.addRole, "addRole"),
  useAllRoles: () => query(connected.roles),
  useAllUsers: () => query(connected.users),
  useBlockUserMutation: () => mutation(mutations.block, "block"),
  useCreateNotif: () => mutation(mutations.createNotice, "createNotice"),
  useDeleteRole: () => mutation(mutations.deleteRole, "deleteRole"),
}));

describe("AdminRouter access and production integrity", () => {
  beforeEach(() => {
    auth.isAuthenticated = false;
    auth.isLoading = false;
    auth.user = null;
    connected.bids = [];
    connected.attributes = [];
    connected.attachedAttributes = [];
    connected.attributeOptions = [];
    connected.untiedAttributes = [];
    connected.banners = [];
    connected.lotStats = undefined;
    connected.lotTypes = [];
    connected.lots = [];
    connected.approvedLots = [];
    connected.auctions = [];
    connected.auctionCounts = null;
    connected.auctionFeedRequest = null;
    connected.adminVehicles = [];
    connected.vehicleDocuments = [];
    connected.pendingLots = [];
    connected.subtypes = [];
    connected.transactions = [];
    connected.roles = [
      { id: 1, name: "ADMIN" },
      { id: 7, name: "USER" },
    ];
    connected.tranStats = undefined;
    connected.users = [];
    connected.userStats = undefined;
    connected.auditLogs = [];
    connected.refetch.mockReset();
    auth.logout.mockReset();
    pendingMutations.clear();
    Object.values(mutations).forEach((mock) => mock.mockReset());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not render the admin workspace for an anonymous visitor", () => {
    render(<AdminRouter section={["moderation"]} />);

    expect(screen.getByRole("heading", { name: /admin kabinetiga kirish/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /kirish/i })).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fadmin%2Fmoderation",
    );
    expect(screen.queryByText("Chevrolet Tahoe High Country")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin Karimov")).not.toBeInTheDocument();
  });

  it("denies an authenticated user without the ADMIN role", () => {
    auth.isAuthenticated = true;
    auth.user = { firstname: "Support", roles: [{ name: "SUPPORT" }] };

    render(<AdminRouter />);

    expect(screen.getByRole("heading", { name: /ruxsat yetarli emas/i })).toBeVisible();
    expect(screen.queryByText("Moderatsiya navbati")).not.toBeInTheDocument();
  });

  it("shows a branded loading state before deciding access", () => {
    auth.isLoading = true;

    render(<AdminRouter />);

    expect(screen.getByRole("heading", { name: /admin kabineti tekshirilmoqda/i })).toBeVisible();
    expect(screen.queryByText("Boshqaruv markazi")).not.toBeInTheDocument();
  });

  it("renders the same safe loading gate on the server even for a cached client user", () => {
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };

    const html = renderToString(<AdminRouter />);

    expect(html).toContain("Admin kabineti tekshirilmoqda");
    expect(html).not.toContain("Dilshod");
  });

  it("uses the authenticated administrator identity in development", () => {
    auth.isAuthenticated = true;
    auth.user = {
      firstname: "Dilshod",
      lastname: "Raximov",
      roles: [{ name: "ADMIN" }],
    };

    render(<AdminRouter />);

    expect(screen.getByText("Dilshod Raximov")).toBeVisible();
    expect(screen.queryByText("Admin Karimov")).not.toBeInTheDocument();
  });

  it("offers user-panel navigation and confirmed logout in the admin menu", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };

    render(<AdminRouter />);

    expect(screen.getAllByRole("link", { name: "Mening profilim" })[0]).toHaveAttribute("href", "/dashboard");
    await user.click(screen.getByRole("button", { name: "Dilshod: Mening profilim" }));
    await user.click(screen.getAllByRole("button", { name: "Chiqish" })[0]);
    expect(screen.getByRole("dialog", { name: "Hisobdan chiqasizmi?" })).toBeVisible();
    expect(auth.logout).not.toHaveBeenCalled();

    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Chiqish" }));
    expect(auth.logout).toHaveBeenCalledOnce();
  });

  it("does not introduce a nested main landmark inside the application shell", () => {
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };

    render(<AdminRouter />);

    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });

  it("does not present fabricated operational records in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };

    render(<AdminRouter section={["moderation"]} />);

    expect(screen.getByText("So‘rov bo‘yicha yozuv topilmadi.")).toBeVisible();
    expect(screen.queryByText("Chevrolet Tahoe High Country")).not.toBeInTheDocument();
    expect(screen.queryByText("Premium Auto LLC")).not.toBeInTheDocument();
  });

  it("renders users from the connected admin query", () => {
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.users = [
      {
        balance: 125000,
        email: "nodira@example.uz",
        firstname: "Nodira",
        id: 17,
        isActive: true,
        lastname: "Saidova",
        roles: [{ id: 7, name: "USER" }],
      },
      {
        email: "unknown-status@example.uz",
        firstname: "Noma’lum",
        id: 18,
        lastname: "Status",
        roles: [{ id: 7, name: "USER" }],
      },
    ];

    render(<AdminRouter section={["users"]} />);

    expect(screen.getByRole("table", { name: "Foydalanuvchilar ro‘yxati" })).toBeVisible();
    expect(screen.getByText("Nodira Saidova")).toBeVisible();
    expect(screen.getByText(/nodira@example\.uz/i)).toBeVisible();
    expect(
      within(screen.getByRole("table", { name: "Foydalanuvchilar ro‘yxati" }))
        .getByText("Noma’lum Status"),
    ).toBeVisible();
    expect(screen.queryByText("Admin Karimov")).not.toBeInTheDocument();
  });

  it("offers USER from the backend role catalog", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.users = [
      { email: "account@example.uz", firstname: "Marketplace", id: 17, isActive: true, lastname: "Account", roles: [] },
    ];

    render(<AdminRouter section={["users"]} />);
    await user.click(screen.getByRole("row", { name: /marketplace account tafsilotlarini ochish/i }));
    await user.click(screen.getByLabelText("Rol qo‘shish"));

    expect(screen.getByRole("option", { name: "USER" })).toBeVisible();
  });

  it("renders live statistics without substituting fabricated metrics", () => {
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.userStats = { activeUsersCount: 91, allUsersCount: 104 };
    connected.lotStats = { activeLotsCount: 7, allLotsCount: 33, finishedLotsCount: 19, pendingLotsCount: 4 };
    connected.tranStats = { allTransactionCount: 87000000, currency: "UZS", transactionCount: 26 };

    render(<AdminRouter />);

    expect(screen.getByText("104")).toBeVisible();
    expect(screen.getByText("33")).toBeVisible();
    expect(screen.getByText("4")).toBeVisible();
    expect(screen.getByText(/87[\s,]000[\s,]000 UZS/)).toBeVisible();
  });

  it("connects moderation decisions to the existing lot mutations", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.pendingLots = [
      { id: 71, lotStatus: "NOT_APPROVED", sellerId: 9, startPrice: 300000000, title: "Connected review lot" },
    ];

    render(<AdminRouter section={["moderation"]} />);
    await user.click(screen.getByRole("row", { name: /connected review lot tafsilotlarini ochish/i }));
    await user.click(screen.getAllByRole("button", { name: "Tasdiqlash" }).at(-1)!);
    await user.click(screen.getAllByRole("button", { name: "Tasdiqlash" }).at(-1)!);

    expect(mutations.approve).toHaveBeenCalledWith("71", expect.objectContaining({ onSuccess: expect.any(Function) }));
  });

  it("locks the moderation inspector and table while a decision is pending", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.pendingLots = [
      { id: 71, lotStatus: "NOT_APPROVED", sellerId: 9, title: "Pending decision" },
      { id: 72, lotStatus: "NOT_APPROVED", sellerId: 10, title: "Second decision" },
    ];
    const view = render(<AdminRouter section={["moderation"]} />);
    await user.click(screen.getByRole("row", { name: /pending decision tafsilotlarini ochish/i }));
    await user.click(screen.getAllByRole("button", { name: "Tasdiqlash" }).at(-1)!);

    pendingMutations.add("approve");
    view.rerender(<AdminRouter section={["moderation"]} />);

    expect(screen.getByRole("row", { name: /second decision tafsilotlarini ochish/i })).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("button", { name: "Tafsilotlarni yopish" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Bekor qilish" })).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Tasdiqlash" }).at(-1)).toBeDisabled();
  });

  it("locks every user editor and row switch while one account operation is pending", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.users = [
      { email: "a@example.uz", firstname: "Account", id: 17, isActive: true, lastname: "A", roles: [{ id: 7, name: "USER" }] },
      { email: "b@example.uz", firstname: "Account", id: 18, isActive: true, lastname: "B", roles: [{ id: 7, name: "USER" }] },
    ];
    const view = render(<AdminRouter section={["users"]} />);
    await user.click(screen.getByRole("row", { name: /account a tafsilotlarini ochish/i }));

    pendingMutations.add("addBalance");
    view.rerender(<AdminRouter section={["users"]} />);

    expect(screen.getByRole("row", { name: /account b tafsilotlarini ochish/i })).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("button", { name: "Tafsilotlarni yopish" })).toBeDisabled();
    expect(screen.getByLabelText("Rol qo‘shish")).toBeDisabled();

    await user.click(screen.getByRole("tab", { name: "Balans" }));
    expect(screen.getByLabelText("Miqdor")).toBeDisabled();

    await user.click(screen.getByRole("tab", { name: "Bildirishnoma" }));
    expect(screen.getByLabelText("Bildirishnoma matni")).toBeDisabled();

    await user.click(screen.getByRole("tab", { name: "Xavfsizlik" }));
    expect(screen.getByRole("button", { name: "Hisobni bloklash" })).toBeDisabled();
  });

  it("locks reference tabs and creation controls during a mutation", () => {
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.lotTypes = [{ id: 1, name: { en: "Cars", ru: "Автомобили", uz: "Avtomobillar" } }];
    pendingMutations.add("createType");

    render(<AdminRouter section={["reference-data"]} />);

    const refTabs = screen.getByRole("tablist", { name: "Transport vositasi turlari ma’lumotnomasi" });
    within(refTabs).getAllByRole("tab").forEach((tab) => expect(tab).toBeDisabled());
    expect(screen.getByLabelText("Nomi — o‘zbekcha")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Yaratish" })).toBeDisabled();
  });

  it("locks subtype relationship controls while a tie toggle is pending", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.subtypes = [{ id: 2, lotTypeId: 1, name: { en: "Sedan", ru: "Седан", uz: "Sedan" } }];
    connected.attachedAttributes = [{ id: 3, name: { en: "Color", ru: "Цвет", uz: "Rang" } }];
    connected.untiedAttributes = [{ id: 6, name: { en: "Mileage", ru: "Пробег", uz: "Yurgan masofa" } }];
    const view = render(<AdminRouter section={["reference-data"]} />);
    await user.click(screen.getByRole("tab", { name: "Ichki turlar" }));
    await user.click(screen.getByRole("row", { name: /sedan tafsilotlarini ochish/i }));

    pendingMutations.add("tieAttribute");
    view.rerender(<AdminRouter section={["reference-data"]} />);

    expect(screen.getByRole("button", { name: "Atributni ajratish" })).toBeDisabled();
    expect(screen.getByLabelText("Mavjud atributlar")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Atributni biriktirish" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Tafsilotlarni yopish" })).toBeDisabled();
    const refTabs = screen.getByRole("tablist", { name: "Transport vositasi turlari ma’lumotnomasi" });
    within(refTabs).getAllByRole("tab").forEach((tab) => expect(tab).toBeDisabled());
  });

  it("locks both attribute and option inspectors during an option mutation", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.attributes = [{ id: 3, isSelectable: true, name: { en: "Color", ru: "Цвет", uz: "Rang" }, valueType: "STRING" }];
    connected.attributeOptions = [{ id: 4, value: { en: "Blue", ru: "Синий", uz: "Ko‘k" } }];
    const view = render(<AdminRouter section={["reference-data"]} />);
    await user.click(screen.getByRole("tab", { name: "Atributlar" }));
    await user.click(screen.getByRole("row", { name: /rang tafsilotlarini ochish/i }));
    await user.click(screen.getByRole("row", { name: /ko‘k tafsilotlarini ochish/i }));

    pendingMutations.add("createOption");
    view.rerender(<AdminRouter section={["reference-data"]} />);

    const closeButtons = screen.getAllByRole("button", { name: "Tafsilotlarni yopish" });
    expect(closeButtons).toHaveLength(2);
    closeButtons.forEach((button) => expect(button).toBeDisabled());
  });

  it("renders both connected finance ledgers", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.transactions = [{ amount: 240000, createdAt: "2026-07-16T09:00:00Z", currency: "UZS", id: 8, status: "SUCCESS", type: "DEPOSIT", userId: 4 }];
    connected.bids = [{ bidAmount: 98000000, bidStatus: "ACTIVE", bidTime: "2026-07-16T09:02:00Z", bidderDto: { id: 4 }, currency: "UZS", id: 9, lotId: 71 }];

    render(<AdminRouter section={["finance"]} />);

    expect(screen.getByRole("table", { name: "Tranzaksiyalar jurnali" })).toBeVisible();
    expect(within(screen.getByRole("table", { name: "Tranzaksiyalar jurnali" })).getByText("Deposit")).toBeVisible();

    await user.click(screen.getByRole("tab", { name: "Takliflar" }));

    expect(screen.getByRole("table", { name: "Takliflar jurnali" })).toBeVisible();
    expect(screen.getAllByText(/98[\s,]000[\s,]000 UZS/).length).toBeGreaterThan(0);
  });

  it("uses vehicle data as reference and moderates only the auction", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.auctions = [{
      auctionId: 901,
      approvalStatus: "PENDING_REVIEW",
      startPrice: 100000000,
      status: "DRAFT",
      vehicleId: 81,
      vehicle: {
        makeName: "Chevrolet",
        modelName: "Malibu",
        vehicleId: 81,
        vin: "VIN81",
        year: 2026,
      },
    }];
    connected.vehicleDocuments = [{ documentId: 77, docType: "REGISTRATION", fileUrl: "/registration.pdf", status: "PENDING", vehicleId: 81 }];

    render(<AdminRouter section={["auctions"]} />);

    expect(screen.getByText("Chevrolet Malibu 2026")).toBeVisible();
    expect(screen.getByText(/Auksion #901/)).toBeVisible();
    expect(screen.queryByRole("link", { name: "Avtomobillar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Avtomobil hujjatlari" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("row", { name: /chevrolet malibu 2026 tafsilotlarini ochish/i }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("tab", { name: "Auksion" })).toHaveAttribute("aria-selected", "true");
    expect(within(dialog).getByText("Boshlang‘ich narx")).toBeVisible();
    expect(within(dialog).getByText(/100[\s,]000[\s,]000 UZS/)).toBeVisible();
    await user.click(within(dialog).getByRole("tab", { name: "Avtomobil" }));
    expect(within(dialog).getByText("VIN81")).toBeVisible();
    await user.click(within(dialog).getByRole("tab", { name: "Avtomobil hujjatlari (1)" }));
    expect(within(dialog).getByText("Ro‘yxatdan o‘tganlik guvohnomasi")).toBeVisible();
    expect(within(dialog).getByRole("link", { name: "Faylni ko‘rish" })).toHaveAttribute("href", "/registration.pdf");
    await user.click(within(dialog).getByRole("tab", { name: "Avtomobil" }));
    await user.click(screen.getByRole("button", { name: "Auksionni tasdiqlash" }));
    await user.click(screen.getAllByRole("button", { name: "Tasdiqlash" }).at(-1)!);
    expect(mutations.approveAuction).toHaveBeenCalledWith("901");
    expect(mutations.approveVehicleDocument).not.toHaveBeenCalled();

    await user.click(screen.getByRole("row", { name: /chevrolet malibu 2026 tafsilotlarini ochish/i }));
    const rejectDialog = screen.getByRole("dialog");
    await user.click(within(rejectDialog).getByRole("button", { name: "Auksionni rad etish" }));
    const confirmReject = within(rejectDialog).getAllByRole("button", { name: "Tasdiqlash" }).at(-1)!;
    expect(confirmReject).toBeDisabled();
    await user.type(within(rejectDialog).getByRole("textbox", { name: "Rad etish sababi" }), "VIN noto‘g‘ri");
    await user.click(confirmReject);
    expect(mutations.rejectAuction).toHaveBeenCalledWith({ auctionId: "901", reason: "VIN noto‘g‘ri" });
  });

  it("allows vehicle documents to be approved or rejected inside the auction review dialog", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.auctions = [{
      auctionId: 901,
      approvalStatus: "PENDING_REVIEW",
      startPrice: 100000000,
      status: "DRAFT",
      vehicleId: 81,
      vehicle: {
        makeName: "Chevrolet",
        modelName: "Malibu",
        vehicleId: 81,
        vin: "VIN81",
        year: 2026,
      },
    }];
    connected.vehicleDocuments = [{ documentId: 77, docType: "REGISTRATION", fileUrl: "/registration.pdf", status: "PENDING", vehicleId: 81 }];

    render(<AdminRouter section={["auctions"]} />);

    await user.click(screen.getByRole("row", { name: /chevrolet malibu 2026 tafsilotlarini ochish/i }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("tab", { name: "Avtomobil hujjatlari (1)" }));
    expect(within(dialog).getByText("Ro‘yxatdan o‘tganlik guvohnomasi")).toBeVisible();

    // Test Approve document
    await user.click(within(dialog).getByRole("button", { name: "Hujjatni tasdiqlash" }));
    await user.click(within(dialog).getAllByRole("button", { name: "Tasdiqlash" }).at(-1)!);
    expect(mutations.approveVehicleDocument).toHaveBeenCalledWith(77);

    // Test Reject document
    await user.click(within(dialog).getByRole("button", { name: "Hujjatni rad etish" }));
    const confirmReject = within(dialog).getAllByRole("button", { name: "Tasdiqlash" }).at(-1)!;
    expect(confirmReject).toBeDisabled();
    await user.type(within(dialog).getByRole("textbox", { name: "Rad etish sababi" }), "Sifatsiz rasm");
    await user.click(confirmReject);
    expect(mutations.rejectVehicleDocument).toHaveBeenCalledWith({ docId: 77, reason: "Sifatsiz rasm" });
  });

  it("filters auctions by localized approval and lifecycle status tabs", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.auctions = [];

    render(<AdminRouter section={["auctions"]} />);

    const pendingReviewTab = screen.getByRole("tab", { name: /Tekshiruvda/ });
    expect(screen.getByRole("tab", { name: /Tasdiqlangan/ })).toBeVisible();
    expect(screen.getByRole("tab", { name: /Rad etilgan/ })).toBeVisible();

    await user.click(pendingReviewTab);
    expect(pendingReviewTab).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(connected.auctionFeedRequest).toMatchObject({
      approvalStatus: "PENDING_REVIEW",
    }));

    const draftTab = screen.getByRole("tab", { name: /Qoralama/ });
    expect(draftTab).toBeVisible();
    await user.click(draftTab);
    expect(draftTab).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(connected.auctionFeedRequest).toMatchObject({
      approvalStatus: "PENDING_REVIEW",
      status: "DRAFT",
    }));
  });

  it("uses backend aggregate counts instead of counting the current auction page", () => {
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.auctions = Array.from({ length: 20 }, (_, index) => ({
      auctionId: index + 1,
      status: index < 3 ? "FINISHED" : "CANCELED",
      vehicle: { makeName: "Toyota", modelName: `Model ${index + 1}`, vehicleId: index + 1 },
    }));
    connected.auctionCounts = {
      all: 76,
      approval: { APPROVED: 73, PENDING_REVIEW: 3, REJECTED: 0 },
      lifecycle: { CANCELED: 57, DRAFT: 3, FINISHED: 13, LIVE: 0, SCHEDULED: 3 },
    };

    render(<AdminRouter section={["auctions"]} />);

    expect(screen.getByRole("tab", { name: /Barcha tekshiruv holatlari.*76/i })).toBeVisible();
    expect(screen.getByRole("tab", { name: /Tekshiruvda.*3/i })).toBeVisible();
    expect(screen.getByRole("tab", { name: /Tasdiqlangan.*73/i })).toBeVisible();
    expect(screen.getByRole("tab", { name: /Rad etilgan.*0/i })).toBeVisible();
    expect(screen.getByRole("tab", { name: /Barcha auksion holatlari.*76/i })).toBeVisible();
    expect(screen.getByRole("tab", { name: /Qoralama.*3/i })).toBeVisible();
    expect(screen.getByRole("tab", { name: /Rejalashtirilgan.*3/i })).toBeVisible();
    expect(screen.getByRole("tab", { name: /Jonli.*0/i })).toBeVisible();
    expect(screen.getByRole("tab", { name: /Yakunlangan.*13/i })).toBeVisible();
    expect(screen.getByRole("tab", { name: /Bekor qilingan.*57/i })).toBeVisible();
  });

  it("localizes audit action and entity enums in filters, rows, and details", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.auditLogs = [{
      action: "AUCTION_APPROVED",
      createdAt: "2026-08-13T14:42:00Z",
      entity: "VEHICLEDOCUMENT",
      entityId: 75,
      logId: 127,
      metadata: { status: "APPROVED" },
      userFirstName: "Shoxjahon",
      userLastName: "Miraloyev",
    }];

    render(
      <LangSwitch.Provider value={{ currentLang: "ru", setCurrentLang: vi.fn() }}>
        <AdminRouter section={["audit"]} />
      </LangSwitch.Provider>,
    );

    expect(screen.getAllByText("Аукцион одобрен").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Документ транспорта").length).toBeGreaterThan(0);
    expect(screen.queryByText("AUCTION APPROVED")).not.toBeInTheDocument();
    expect(screen.queryByText("VEHICLEDOCUMENT")).not.toBeInTheDocument();

    await user.click(screen.getByRole("row", { name: /Открыть детали: Аукцион одобрен/i }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getAllByText("Аукцион одобрен").length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText(/Документ транспорта.*ID 75/)).toHaveLength(2);
    expect(within(dialog).getByText("Одобрено")).toBeVisible();
  });

  it("shows only localized auction lifecycle statuses in the admin table", () => {
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.auctions = [
      { approvalStatus: "APPROVED", auctionId: 66, status: "CANCELED", vehicle: { makeName: "Hyundai", modelName: "Sonata", vehicleId: 93 } },
      { approvalStatus: "REJECTED", auctionId: 67, status: "FINISHED", vehicle: { makeName: "Toyota", modelName: "Camry", vehicleId: 94 } },
    ];

    render(<AdminRouter section={["auctions"]} />);

    const table = within(screen.getByRole("table"));
    expect(table.getAllByText("Bekor qilingan").length).toBeGreaterThan(0);
    expect(table.getAllByText("Yakunlangan").length).toBeGreaterThan(0);
    expect(table.queryByText("Tasdiqlangan")).not.toBeInTheDocument();
    expect(table.queryByText("Rad etilgan")).not.toBeInTheDocument();
    expect(table.queryByText("Canceled")).not.toBeInTheDocument();
    expect(table.queryByText("Finished")).not.toBeInTheDocument();
  });

  it("shows the localized auction status beside the vehicle reference and in its modal", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.adminVehicles = [{ makeName: "Hyundai", modelName: "Sonata", vehicleId: 93, vin: "VIN93", year: 2026 }];
    connected.auctions = [{ approvalStatus: "PENDING_REVIEW", auctionId: 66, status: "CANCELED", vehicleId: 93 }];

    render(<AdminRouter section={["vehicles"]} />);

    const row = screen.getByRole("row", { name: /hyundai sonata 2026 tafsilotlarini ochish/i });
    expect(within(row).getByText("Ma’lumotnoma")).toBeVisible();
    expect(within(row).getByText("Bekor qilingan")).toBeVisible();
    await user.click(row);
    await user.click(within(screen.getByRole("dialog")).getByRole("tab", { name: "Auksion" }));
    expect(within(screen.getByRole("dialog")).getByText("Bekor qilingan")).toBeVisible();
    expect(screen.queryByText("CANCELED")).not.toBeInTheDocument();
  });

  it("connects the reference workspace to lot type, subtype, attribute, option, and banner services", async () => {
    const user = userEvent.setup();
    auth.isAuthenticated = true;
    auth.user = { firstname: "Dilshod", roles: [{ name: "ADMIN" }] };
    connected.lotTypes = [{ id: 1, name: { en: "Cars", ru: "Автомобили", uz: "Avtomobillar" } }];
    connected.subtypes = [{ id: 2, lotTypeId: 1, name: { en: "Sedan", ru: "Седан", uz: "Sedan" } }];
    connected.attributes = [{ id: 3, isSelectable: true, name: { en: "Color", ru: "Цвет", uz: "Rang" }, valueType: "STRING" }];
    connected.attachedAttributes = [{ id: 3, isSelectable: true, name: { en: "Color", ru: "Цвет", uz: "Rang" }, valueType: "STRING" }];
    connected.untiedAttributes = [{ id: 6, name: { en: "Mileage", ru: "Пробег", uz: "Yurgan masofa" }, valueType: "INTEGER" }];
    connected.attributeOptions = [{ id: 4, value: { en: "Blue", ru: "Синий", uz: "Ko‘k" } }];
    connected.banners = [
      { expiresAt: "2099-08-01T10:00:00Z", id: 5, lotDto: { id: 81, title: "Summer vehicle" } },
      { expiresAt: "2000-01-01T00:00:00Z", id: 6, lotDto: { id: 82, title: "Expired banner" } },
      { id: 7, lotDto: { id: 83, title: "Unknown banner" } },
    ];

    render(<AdminRouter section={["reference-data"]} />);
    expect(within(screen.getByRole("table", { name: "Transport vositasi turlari" })).getByText("Avtomobillar")).toBeVisible();

    await user.click(screen.getByRole("tab", { name: "Ichki turlar" }));
    expect(screen.getByText("Sedan")).toBeVisible();
    await user.click(screen.getByRole("row", { name: /sedan tafsilotlarini ochish/i }));
    expect(screen.getByRole("heading", { name: "Biriktirilgan atributlar" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Atributni ajratish" }));
    expect(mutations.tieAttribute).toHaveBeenCalledWith(
      { attributeId: "3", subTypeId: "2" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    await user.selectOptions(screen.getByLabelText("Mavjud atributlar"), "6");
    await user.click(screen.getByRole("button", { name: "Atributni biriktirish" }));
    expect(mutations.tieAttribute).toHaveBeenCalledWith(
      { attributeId: "6", subTypeId: "2" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    act(() => {
      mutations.tieAttribute.mock.calls.at(-1)?.[1]?.onSuccess({ status: "ERROR" });
    });
    expect(screen.getByText("Amalni bajarib bo‘lmadi. Qayta urinib ko‘ring.")).toBeVisible();
    expect(screen.queryByText("Amal muvaffaqiyatli bajarildi.")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Atributlar" }));
    expect(screen.getByText("Rang")).toBeVisible();
    await user.click(screen.getByRole("row", { name: /rang tafsilotlarini ochish/i }));
    expect(screen.getByText("Ko‘k")).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Bannerlar" }));
    expect(screen.getByText("Summer vehicle")).toBeVisible();
    const bannerTable = screen.getByRole("table", { name: "Bannerlar" });
    expect(within(bannerTable).getByText("Faol")).toBeVisible();
    expect(within(bannerTable).getByText("Muddati tugagan")).toBeVisible();
    expect(within(bannerTable).getByText("Noma’lum")).toBeVisible();
  });

  it("localizes access-denied copy", () => {
    auth.isAuthenticated = true;
    auth.user = { firstname: "Support", roles: [{ name: "SUPPORT" }] };

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <AdminRouter />
      </LangSwitch.Provider>,
    );

    expect(screen.getByRole("heading", { name: "Insufficient access" })).toBeVisible();
    expect(screen.getByText(/administrator role is required/i)).toBeVisible();
  });

  it("localizes the active heading, description, and shell navigation", () => {
    auth.isAuthenticated = true;
    auth.user = { firstname: "Admin", roles: [{ name: "ADMIN" }] };

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <AdminRouter section={["users"]} />
      </LangSwitch.Provider>,
    );

    expect(screen.getByRole("heading", { name: "Users" })).toBeVisible();
    expect(screen.getByText(/roles, account status, balances, and security/i)).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Moderation" }).length).toBeGreaterThan(0);
  });
});
