"use client";

import { CirclePlus, LoaderCircle, LogIn, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useSyncExternalStore } from "react";

import {
  BidsSection,
  CabinetHomeSection,
  canonicalAccountId,
  NotificationsSection,
  // PaymentsSection,
  ProfileSection,
  type CabinetUser,
} from "@/components/cabinet/CabinetLiveSections";
import { CabinetShell } from "@/components/cabinet/CabinetShell";
import { SellerListingDetailSection, SellerListingsSection } from "@/components/cabinet/SellerListingsSection";
import { StatePanel } from "@/components/feedback/StatePanel";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { VehicleQuestionnaire } from "@/components/vehicle/VehicleQuestionnaire";
import { VehicleWizard } from "@/components/vehicle/VehicleWizard";
import { SavedSearchSection, WatchlistSection } from "@/components/cabinet/SavedSearchSection";
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import { useUserContext } from "@/context/UserContext";
import { useTask6Copy } from "@/locales/task6";
import { KycPanel } from "./KycPanel";
import { PaymentsSection } from "./PaymentsSection";
import { DealsSection } from "./DealsSection";
import { AuctionsSection } from "./AuctionsSection";

const uzHeadings: Record<string, [string, string]> = {
  "": ["Kabinet", "Auksionlar, aktivlar va muhim holatlar bir joyda."],
  watchlist: [
    "Saqlanganlar",
    "Saqlangan qidiruvlaringiz va ularning mezonlari.",
  ],
  bids: ["Takliflarim", "Faol va yakunlangan auksionlardagi ishtirokingiz."],
  auctions: ["Auksionlar", "Auksionlarni yarating va ularning holatini boshqaring."],
  vehicles: [
    "Auksionlar",
    "Avtomobil va unga tegishli auksion ma’lumotlarini bir joyda boshqaring.",
  ],
  deals: [
    "Bitimlar",
    "Auksiondan keyingi shartnoma, to‘lov va topshirish jarayoni.",
  ],
  payments: ["To‘lovlar", "Depozitlar, qaytarishlar va hamyon operatsiyalari."],
  notifications: [
    "Bildirishnomalar",
    "Taklif, lot va hisob holatlari bo‘yicha xabarlar.",
  ],
  kyc: [
    "Shaxsni tasdiqlash",
    "Kelajakdagi tasdiqlash jarayoni va tayyorgarlik holati.",
  ],
  profile: ["Profil", "Shaxsiy ma’lumotlar va aloqa sozlamalari."],
  dealer: [
    "Diler markazi",
    "Professional sotuvchilar uchun operatsion vositalar.",
  ],
};

const headings: Record<Lang, Record<string, [string, string]>> = {
  uz: uzHeadings,
  en: {
    "": ["Cabinet", "Auctions, assets, and important statuses in one place."],
    watchlist: ["Saved", "Your saved searches and their criteria."],
    bids: ["My bids", "Your participation in active and completed auctions."],
    auctions: ["Auctions", "Create auctions and manage their current status."],
    vehicles: ["Auctions", "Manage each vehicle together with its auction."],
    deals: ["Deals", "Contracts, payments, and handover after an auction."],
    payments: ["Payments", "Deposits, refunds, and wallet operations."],
    notifications: ["Notifications", "Updates about bids, lots, and your account."],
    kyc: ["Identity verification", "Verification readiness and future steps."],
    profile: ["Profile", "Personal information and contact settings."],
    dealer: ["Dealer center", "Operational tools for professional sellers."],
  },
  ru: {
    "": ["Кабинет", "Аукционы, активы и важные статусы в одном месте."],
    watchlist: ["Избранное", "Ваши сохранённые поиски и их параметры."],
    bids: ["Мои ставки", "Ваше участие в активных и завершённых аукционах."],
    auctions: ["Аукционы", "Создавайте аукционы и управляйте их статусом."],
    vehicles: ["Аукционы", "Управляйте автомобилем вместе с его аукционом."],
    deals: ["Сделки", "Договор, оплата и передача после аукциона."],
    payments: ["Платежи", "Депозиты, возвраты и операции кошелька."],
    notifications: ["Уведомления", "Обновления по ставкам, лотам и аккаунту."],
    kyc: ["Проверка личности", "Готовность и будущие шаги верификации."],
    profile: ["Профиль", "Личные данные и настройки контактов."],
    dealer: ["Центр дилера", "Операционные инструменты для профессиональных продавцов."],
  },
};

interface CabinetAccessCopy {
  loadingTitle: string;
  loadingBody: string;
  loginTitle: string;
  loginBody: string;
  loginAction: string;
  sellerTitle: string;
  sellerBody: string;
  cabinetAction: string;
  unavailableBody: string;
  unavailableTitles: Record<string, string>;
  addVehicle: string;
  eyebrow: string;
  notFoundTitle: string;
  notFoundBody: string;
}

const accessMessages: Record<Lang, CabinetAccessCopy> = {
  uz: {
    loadingTitle: "Kabinet tekshirilmoqda",
    loadingBody: "Hisobingiz xavfsiz tekshirilmoqda.",
    loginTitle: "Shaxsiy kabinetga kirish",
    loginBody: "Kabinet ma’lumotlarini ko‘rish uchun avval hisobingizga kiring.",
    loginAction: "Kirish",
    sellerTitle: "Sotuvchi ruxsati talab qilinadi",
    sellerBody: "Avtomobil joylash va diler vositalaridan foydalanish uchun SELLER roli talab qilinadi.",
    cabinetAction: "Kabinetga qaytish",
    unavailableTitles: {
      deals: "Bitimlar xizmati hali ulanmagan",
      kyc: "Shaxsni tasdiqlash xizmati hali ulanmagan",
      dealer: "Diler xizmati hali ulanmagan",
    },
    unavailableBody:
      "Ushbu kabinet xizmati hali backendga ulanmagan. Sahifa soxta yozuvlar yoki muvaffaqiyat holatini ko‘rsatmaydi.",
    addVehicle: "Avtomobil qo‘shish",
    eyebrow: "Shaxsiy kabinet",
    notFoundTitle: "Bo‘lim topilmadi",
    notFoundBody: "Kabinet menyusidan mavjud bo‘limni tanlang.",
  },
  en: {
    loadingTitle: "Checking cabinet access",
    loadingBody: "We are securely checking your account.",
    loginTitle: "Sign in to your cabinet",
    loginBody: "Sign in before viewing cabinet information.",
    loginAction: "Sign in",
    sellerTitle: "Seller access required",
    sellerBody: "A SELLER role is required to list vehicles and use dealer tools.",
    cabinetAction: "Return to cabinet",
    unavailableTitles: {
      deals: "Deals service is not connected yet",
      kyc: "Identity verification is not connected yet",
      dealer: "Dealer service is not connected yet",
    },
    unavailableBody:
      "This cabinet service is not connected yet. The page does not show fabricated records or success states.",
    addVehicle: "Add vehicle",
    eyebrow: "Personal cabinet",
    notFoundTitle: "Section not found",
    notFoundBody: "Choose an available section from the cabinet navigation.",
  },
  ru: {
    loadingTitle: "Проверяем доступ к кабинету",
    loadingBody: "Безопасно проверяем ваш аккаунт.",
    loginTitle: "Войдите в личный кабинет",
    loginBody: "Войдите в аккаунт, чтобы просматривать данные кабинета.",
    loginAction: "Войти",
    sellerTitle: "Требуется доступ продавца",
    sellerBody: "Для размещения автомобилей и инструментов дилера требуется роль SELLER.",
    cabinetAction: "Вернуться в кабинет",
    unavailableTitles: {
      deals: "Сервис сделок пока не подключён",
      kyc: "Проверка личности пока не подключена",
      dealer: "Сервис дилера пока не подключён",
    },
    unavailableBody:
      "Этот сервис кабинета пока не подключён. Страница не показывает вымышленные записи или успешные статусы.",
    addVehicle: "Добавить автомобиль",
    eyebrow: "Личный кабинет",
    notFoundTitle: "Раздел не найден",
    notFoundBody: "Выберите доступный раздел в навигации кабинета.",
  },
};

function AccessState({
  action,
  description,
  icon,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="min-h-[calc(100dvh-var(--public-header-height))] bg-surface-canvas px-[var(--content-gutter)] py-10 md:py-16">
      <StatePanel
        action={action}
        className="border-brand-champagne-500/45 shadow-sticky"
        description={description}
        icon={icon}
        title={title}
      />
    </div>
  );
}

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function useHydrated() {
  return useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
}

export function CabinetRouter({ section = [] }: { section?: string[] }) {
  const { currentLang } = useContext(LangSwitch);
  const copy = accessMessages[currentLang];
  const taskCopy = useTask6Copy();
  const router = useRouter();
  const hydrated = useHydrated();
  const { isAuthenticated, isLoading, refetch, user } = useUserContext() as unknown as {
    isAuthenticated: boolean;
    isLoading: boolean;
    refetch?: () => unknown;
    user: CabinetUser | null | undefined;
  };
  const requestedActive = section[0] ?? "";
  const active = requestedActive === "auctions" ? "vehicles" : requestedActive;
  const localizedHeadings = headings[currentLang];
  const [title, description] = localizedHeadings[requestedActive || active] ?? [
    copy.notFoundTitle,
    copy.notFoundBody,
  ];
  const returnPath = section.length ? `/dashboard/${section.join("/")}` : "/dashboard";
  const accountKey = canonicalAccountId(user?.id) || "missing";

  if (!hydrated || isLoading) {
    return (
      <AccessState
        description={copy.loadingBody}
        icon={<LoaderCircle className="animate-spin motion-reduce:animate-none" size={34} />}
        title={copy.loadingTitle}
      />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <AccessState
        action={
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-navy-900 px-5 text-sm font-extrabold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            href={`/login?returnTo=${encodeURIComponent(returnPath)}`}
          >
            <LogIn aria-hidden="true" size={17} /> {copy.loginAction}
          </Link>
        }
        description={copy.loginBody}
        icon={<ShieldAlert size={34} />}
        title={copy.loginTitle}
      />
    );
  }

  const action =
    active === "vehicles" && !section[1] ? (
      <Link
        href="/dashboard/vehicles/new"
        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-champagne-500 px-5 text-sm font-extrabold text-brand-navy-950"
      >
        <CirclePlus aria-hidden="true" size={18} /> {copy.addVehicle}
      </Link>
    ) : undefined;

  let content;
  const searchParams = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  if (requestedActive === "auctions")
    content = <AuctionsSection initialVehicleId={searchParams?.get("vehicleId") ?? ""} relist={searchParams?.get("relist") === "1"} />;
  else if (active === "vehicles" && section[1] === "new") {
    const identityStatus = String(user.kycStatus ?? user.verificationStatus ?? "NOT_SUBMITTED")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
    const editVehicleId = typeof window === "undefined" ? undefined : new URLSearchParams(window.location.search).get("edit") ?? undefined;
    content = identityStatus === "APPROVED" ? (
      <>
        <div className="block md:hidden">
          <VehicleQuestionnaire editVehicleId={editVehicleId} />
        </div>
        <div className="hidden md:block">
          <VehicleWizard editVehicleId={editVehicleId} />
        </div>
      </>
    ) : (
      <ConfirmModal
        confirmText={taskCopy.wizard.kycRequiredAction}
        description={taskCopy.wizard.kycRequiredDescription}
        onCancel={() => undefined}
        onConfirm={() => router.push("/dashboard/kyc")}
        open
        showCancel={false}
        title={taskCopy.wizard.kycRequiredTitle}
      />
    );
  }
  else if (active === "vehicles" && section[1])
    content = <SellerListingDetailSection key={`seller-vehicle-${accountKey}-${section[1]}`} vehicleId={section[1]} userId={user.id} />;
  else if (active === "")
    content = (
      <CabinetHomeSection
        key={`home-${accountKey}`}
        onIdentityChanged={() => {
          void refetch?.();
        }}
        user={user}
      />
    );
  else if (active === "watchlist")
    content = <WatchlistSection key={`watchlist-${accountKey}`} userId={user.id} />;
  else if (active === "bids")
    content = <BidsSection key={`bids-${accountKey}`} userId={user.id} />;
  else if (active === "vehicles")
    content = <SellerListingsSection key={`seller-vehicles-${accountKey}`} userId={user.id} />;
  else if (active === "payments")
    content = <PaymentsSection user={user} />;
  else if (active === "notifications")
    content = <NotificationsSection initialNotificationId={searchParams?.get("notificationId") ?? ""} key={`notifications-${accountKey}`} userId={user.id} />;
  else if (active === "profile")
    content = <ProfileSection key={`profile-${accountKey}`} user={user} />;
  else if (active === "kyc")
    content = <KycPanel key={`KycPanel-${accountKey}`} user={user} />;
  else if (active === "deals")
    content = <DealsSection />;
  else if (active === "dealer")
    content = (
      <StatePanel
        icon={<ShieldAlert size={34} />}
        title={copy.unavailableTitles[active] ?? copy.notFoundTitle}
        description={copy.unavailableBody}
      />
    );


  return (
    <CabinetShell
      active={active}
      compact={active === "vehicles" && section[1] === "new"}
      eyebrow={copy.eyebrow}
      title={active === "vehicles" && section[1] === "new" ? copy.addVehicle : title}
      description={description}
      action={action}
    >
      {content}
    </CabinetShell>
  );
}
