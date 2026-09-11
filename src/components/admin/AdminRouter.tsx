"use client";

import { ArchiveX, LoaderCircle, LogIn, ShieldAlert, ShieldX } from "lucide-react";
import Link from "next/link";
import { useContext, useSyncExternalStore } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { ConnectedAdminWorkspace } from "@/components/admin/ConnectedAdminWorkspace";
import { StatePanel } from "@/components/feedback/StatePanel";
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import { useUserContext } from "@/context/UserContext";

const uzHeadings: Record<string, [string, string]> = {
  "": [
    "Boshqaruv markazi",
    "Platforma navbatlari, auksionlar va moliyaviy holatning tezkor ko‘rinishi.",
  ],
  moderation: [
    "Moderatsiya",
    "Avtomobil, hujjat va sotuvchi ma’lumotlarini izchil tekshirish.",
  ],
  kyc: [
    "Shaxsni tasdiqlash",
    "Foydalanuvchi hujjatlarini ko‘rib chiqing, tasdiqlang yoki sabab bilan rad eting.",
  ],
  "vehicle-documents": [
    "Avtomobil hujjatlari",
    "Sotuvchilar yuklagan avtomobil hujjatlarini tasdiqlang yoki sabab bilan rad eting.",
  ],
  users: [
    "Foydalanuvchilar",
    "Rollar, hisob holati, balans va xavfsizlik boshqaruvi.",
  ],
  vehicles: [
    "Avtomobillar",
    "Qoralama, moderatsiya va e’lon qilingan transport vositalari.",
  ],
  auctions: [
    "Auksionlar",
    "Avtomobil va unga tegishli auksionni bitta joyda tasdiqlang yoki rad eting.",
  ],
  "ai-processing": [
    "AI Photo qayta ishlash",
    "Avtoraqam logolarini qo‘yishdagi xatoliklar, loglar va qayta urinish boshqaruvi.",
  ],
  finance: [
    "Moliya",
    "Depozit, taklif va tranzaksiyalarning operatsion jurnali.",
  ],
  "reference-data": [
    "Ma’lumotnomalar",
    "Marka, model, atribut va bannerlar uchun legacy moslik maydoni.",
  ],
  contracts: [
    "Shartnomalar",
    "Auksion g‘oliblari bilan tuzilgan shartnomalar.",
  ],
  disputes: [
    "Nizolar",
    "Dalillar, tomonlar va qarorlar uchun kelajakdagi ish maydoni.",
  ],
  risk: ["Risk nazorati", "Shubhali faollik va qo‘lda tekshirish navbati."],
  audit: [
    "Audit jurnali",
    "Muhim administrator harakatlarining o‘zgarmas izi.",
  ],
};

const headings: Record<Lang, Record<string, [string, string]>> = {
  uz: uzHeadings,
  en: {
    "": ["Operations center", "A current view of platform queues, auctions, and finance."],
    moderation: ["Moderation", "Review vehicle, document, and seller information consistently."],
    kyc: ["Identity verification", "Review, approve, or reject user identity documents."],
    "vehicle-documents": ["Vehicle documents", "Approve or reject seller vehicle documents."],
    users: ["Users", "Manage roles, account status, balances, and security."],
    vehicles: ["Vehicles", "Draft, moderated, and published vehicles."],
    auctions: ["Vehicles and auctions", "Approve or reject a vehicle and its auction together."],
    "ai-processing": ["AI Photo processing", "Manage failed plate masking jobs, inspect logs, and retry processing."],
    finance: ["Finance", "Operational ledger for deposits, bids, and transactions."],
    "reference-data": ["Reference data", "Legacy-compatible makes, models, attributes, and banners."],
    contracts: ["Contracts", "Contracts created with auction winners."],
    disputes: ["Disputes", "Future workspace for evidence, parties, and decisions."],
    risk: ["Risk control", "Suspicious activity and manual review queue."],
    audit: ["Audit log", "An immutable trail of important administrator actions."],
  },
  ru: {
    "": ["Операционный центр", "Текущее состояние очередей, аукционов и финансов платформы."],
    moderation: ["Модерация", "Последовательная проверка автомобиля, документов и продавца."],
    kyc: ["Проверка личности", "Проверяйте, одобряйте или отклоняйте документы пользователей."],
    "vehicle-documents": ["Документы автомобилей", "Одобряйте или отклоняйте документы автомобилей."],
    users: ["Пользователи", "Управление ролями, статусом аккаунта, балансом и безопасностью."],
    vehicles: ["Автомобили", "Черновики, модерация и опубликованные автомобили."],
    auctions: ["Аукционы", "Одобряйте или отклоняйте автомобиль и его аукцион вместе."],
    "ai-processing": ["AI Обработка фото", "Управление ошибками наложения логотипов на номера, логи и повторная обработка."],
    finance: ["Финансы", "Операционный журнал депозитов, ставок и транзакций."],
    "reference-data": ["Справочники", "Марки, модели, атрибуты и баннеры с legacy-совместимостью."],
    contracts: ["Контракты", "Контракты, созданные с победителями аукционов."],
    disputes: ["Споры", "Будущее пространство для доказательств, сторон и решений."],
    risk: ["Контроль рисков", "Подозрительная активность и очередь ручной проверки."],
    audit: ["Журнал аудита", "Неизменяемый след важных действий администратора."],
  },
};

interface AdminUser {
  email?: string;
  firstname?: string;
  lastname?: string;
  roles?: Array<string | { name?: string }>;
}

interface AdminAccessCopy {
  loadingTitle: string;
  loadingBody: string;
  loginTitle: string;
  loginBody: string;
  loginAction: string;
  deniedTitle: string;
  deniedBody: string;
  homeAction: string;
  administrator: string;
  verifiedAccess: string;
  unavailableBody: string;
  sections: Record<string, string>;
  unavailableTitle: (section: string) => string;
  notFoundTitle: string;
  notFoundBody: string;
}

const accessMessages: Record<Lang, AdminAccessCopy> = {
  uz: {
    loadingTitle: "Admin kabineti tekshirilmoqda",
    loadingBody: "Hisob va administrator roli xavfsiz tekshirilmoqda.",
    loginTitle: "Admin kabinetiga kirish",
    loginBody: "Operatsion ma’lumotlarni ko‘rish uchun avval hisobingizga kiring.",
    loginAction: "Kirish",
    deniedTitle: "Ruxsat yetarli emas",
    deniedBody: "Bu maydon uchun ADMIN roli talab qilinadi.",
    homeAction: "Bosh sahifaga qaytish",
    administrator: "Administrator",
    verifiedAccess: "Kirish tasdiqlangan",
    unavailableBody:
      "Ushbu operatsion xizmat hali backendga ulanmagan. Panel soxta yozuvlar yoki muvaffaqiyat holatini ko‘rsatmaydi.",
    sections: {
      "": "Boshqaruv",
      moderation: "Moderatsiya",
      kyc: "Shaxsni tasdiqlash",
      "vehicle-documents": "Vehicle hujjatlari",
      contracts: "Shartnomalar",
      users: "Foydalanuvchilar",
      vehicles: "Avtomobillar",
      auctions: "Auksionlar",
      "ai-processing": "AI Photo qayta ishlash",
      finance: "Moliya",
      "reference-data": "Ma’lumotnomalar",
      disputes: "Nizolar",
      risk: "Risk nazorati",
      audit: "Audit jurnali",
    },
    unavailableTitle: (section) => `${section} ma’lumotlari hali ulanmagan`,
    notFoundTitle: "Bo‘lim topilmadi",
    notFoundBody: "Admin menyusidan mavjud bo‘limni tanlang.",
  },
  en: {
    loadingTitle: "Checking admin access",
    loadingBody: "We are securely checking the account and administrator role.",
    loginTitle: "Sign in to the admin workspace",
    loginBody: "Sign in before viewing operational information.",
    loginAction: "Sign in",
    deniedTitle: "Insufficient access",
    deniedBody: "The administrator role is required for this workspace.",
    homeAction: "Return home",
    administrator: "Administrator",
    verifiedAccess: "Access verified",
    unavailableBody:
      "This operational service is not connected yet. The panel does not show fabricated records or success states.",
    sections: {
      "": "Overview",
      moderation: "Moderation",
      kyc: "Identity verification",
      "vehicle-documents": "Vehicle documents",
      contracts: "Contracts",
      users: "Users",
      vehicles: "Vehicles",
      auctions: "Auctions",
      "ai-processing": "AI Photo processing",
      finance: "Finance",
      "reference-data": "Reference data",
      disputes: "Disputes",
      risk: "Risk control",
      audit: "Audit log",
    },
    unavailableTitle: (section) => `${section} data is not connected yet`,
    notFoundTitle: "Section not found",
    notFoundBody: "Choose an available section from the admin navigation.",
  },
  ru: {
    loadingTitle: "Проверяем доступ администратора",
    loadingBody: "Безопасно проверяем аккаунт и роль администратора.",
    loginTitle: "Войдите в панель администратора",
    loginBody: "Войдите в аккаунт, чтобы просматривать операционные данные.",
    loginAction: "Войти",
    deniedTitle: "Недостаточно прав",
    deniedBody: "Для этого раздела требуется роль ADMIN.",
    homeAction: "Вернуться на главную",
    administrator: "Администратор",
    verifiedAccess: "Доступ подтверждён",
    unavailableBody:
      "Этот операционный сервис пока не подключён. Панель не показывает вымышленные записи или успешные статусы.",
    sections: {
      "": "Обзор",
      moderation: "Модерация",
      kyc: "Проверка личности",
      "vehicle-documents": "Документы авто",
      contracts: "Контракты",
      users: "Пользователи",
      vehicles: "Автомобили",
      auctions: "Аукционы",
      "ai-processing": "AI Обработка фото",
      finance: "Финансы",
      "reference-data": "Справочники",
      disputes: "Споры",
      risk: "Контроль рисков",
      audit: "Журнал аудита",
    },
    unavailableTitle: (section) => `Данные раздела «${section}» пока не подключены`,
    notFoundTitle: "Раздел не найден",
    notFoundBody: "Выберите доступный раздел в навигации администратора.",
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
const connectedSections = new Set([
  "",
  "moderation",
  "kyc",
  "vehicle-documents",
  "users",
  "vehicles",
  "auctions",
  "ai-processing",
  "finance",
  "reference-data",
  "contracts",
  "audit",
]);

function useHydrated() {
  return useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
}

export function AdminRouter({ section = [] }: { section?: string[] }) {
  const { currentLang } = useContext(LangSwitch);
  const copy = accessMessages[currentLang];
  const hydrated = useHydrated();
  const { isAuthenticated, isLoading, user } = useUserContext() as unknown as {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: AdminUser | null | undefined;
  };
  const active = section[0] ?? "";
  const returnPath = section.length ? `/admin/${section.join("/")}` : "/admin";

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

  const isAdmin = user.roles?.some((role) => {
    const roleName = typeof role === "string" ? role : role.name;
    return roleName?.toUpperCase() === "ADMIN";
  });

  if (!isAdmin) {
    return (
      <AccessState
        action={
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-default bg-white px-5 text-sm font-extrabold text-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            href="/"
          >
            {copy.homeAction}
          </Link>
        }
        description={copy.deniedBody}
        icon={<ShieldX size={34} />}
        title={copy.deniedTitle}
      />
    );
  }

  const localizedHeadings = headings[currentLang];
  const [title, description] = localizedHeadings[active] ?? [
    copy.notFoundTitle,
    copy.notFoundBody,
  ];
  const supportedSection = Object.prototype.hasOwnProperty.call(
    localizedHeadings,
    active,
  );
  let content;
  if (supportedSection && connectedSections.has(active))
    content = <ConnectedAdminWorkspace active={active} />;
  else if (supportedSection)
    content = (
      <StatePanel
        icon={<ShieldAlert size={34} />}
        title={copy.unavailableTitle(copy.sections[active] ?? copy.administrator)}
        description={copy.unavailableBody}
      />
    );
  else
    content = (
      <StatePanel
        icon={<ArchiveX size={34} />}
        title={copy.notFoundTitle}
        description={copy.notFoundBody}
      />
    );
  return (
    <AdminShell
      accessStatus={copy.verifiedAccess}
      active={active}
      description={description}
      identityName={
        [user.firstname, user.lastname].filter(Boolean).join(" ") ||
        user.email ||
        copy.administrator
      }
      identityRole={copy.administrator}
      title={title}
    >
      {content}
    </AdminShell>
  );
}
