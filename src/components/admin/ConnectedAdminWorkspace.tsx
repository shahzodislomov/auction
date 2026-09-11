"use client";

import {
  BadgeDollarSign,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Gavel,
  Inbox,
  LoaderCircle,
  Send,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { OperationalTable, type OperationalRow } from "@/components/admin/OperationalTable";
import { AdminFilterTabs, type AdminFilterTabOption } from "@/components/admin/AdminFilterTabs";
import { AppSelect } from "@/components/ui/AppSelect";
import { PageSizeSelect } from "@/components/ui/PageSizeSelect";
import { AdminKycWorkspace } from "@/components/admin/AdminKycWorkspace";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminAiProcessingWorkspace } from "@/components/admin/AdminAiProcessingWorkspace";
import { AdminAuctionsWorkspace, AdminVehiclesWorkspace } from "@/components/admin/AdminVehiclesWorkspace";
import { StatePanel } from "@/components/feedback/StatePanel";
import { StatusBadge, type StatusBadgeTone } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import { auctionDetailHref } from "@/lib/routing/auctionRouteId";
import { translateBackendValue } from "@/lib/localization/backendEnum";
import { useLotStatistics, useTranStatistics, useUserStatistics } from "@/queries";
import { useAllBids } from "@/queries/bid";
import {
  useCreateLotAttribute,
  useCreateAttrOption,
  useAttr,
  useAttrBySubtype,
  useAttrOptions,
  useDeleteAttr,
  useTieAttribute,
  useUntiedAttr,
} from "@/queries/attributes";
import {
  useCreateLotTypeMutation,
  useDeleteLotTypeMutation,
  useLotTypes,
  useUpdateLotTypeMutation,
} from "@/queries/lot-types";
import {
  useAddBannerMutation,
  useAllLotsNotApproved,
  useApproveLotMutation,
  useBanner,
  useDeclineLotMutation,
  useDeleteBannerMutation,
} from "@/queries/lots";
import {
  useCreateSubType,
  useDeleteSub,
  useSub,
  useUpdateSubTypeMutation,
} from "@/queries/subtypes";
import { useAllTransactions } from "@/queries/transaction";
import { isExplicitMutationSuccess } from "@/queries/mutationResponse";
import {
  useAddBalance,
  useAddRole,
  useAllUsers,
  useBlockUserMutation,
  useCreateNotif,
  useDeleteRole,
} from "@/queries/users";
import { api } from "@/api/api";
import {
  useAllContracts,
  useAuctionById,
  useAuctionCounterparty,
  type ContractAuctionRecord,
  type ContractCounterpartyRecord,
  type ContractCounterpartyUser,
} from "@/queries/contracts";
import AnimatedNumber from "../ui/AnimatedNumber";
import { UserDocumentStatus } from "@/queries/user-documents";

const isTestEnv = typeof process !== "undefined" && (process.env.NODE_ENV === "test" || process.env.VITEST === "true");

type UnknownRecord = Record<string, unknown>;

interface QueryState {
  data?: unknown;
  error?: unknown;
  isError?: boolean;
  isLoading?: boolean;
  isPending?: boolean;
  refetch?: () => unknown;
}

interface MutationState {
  isLoading?: boolean;
  isPending?: boolean;
  mutate: (value: unknown, options?: MutationOptions) => void;
}

interface MutationOptions {
  onError?: (error: unknown) => void;
  onSuccess?: (data: unknown) => void;
}

interface WorkspaceCopy {
  loading: string;
  loadingBody: string;
  error: string;
  errorBody: string;
  empty: string;
  emptyBody: string;
  close: string;
  details: string;
  usersTable: string;
  vehiclesTable: string;
  auctionsTable: string;
  moderationTable: string;
  transactionsTable: string;
  bidsTable: string;
  referenceTable: string;
  totalUsers: string;
  activeUsers: string;
  totalLots: string;
  activeLots: string;
  pendingLots: string;
  finishedLots: string;
  turnover: string;
  transactionCount: string;
  overviewBody: string;
  active: string;
  blocked: string;
  pending: string;
  approved: string;
  declined: string;
  completed: string;
  expired: string;
  recorded: string;
  published: string;
  reference: string;
  noValue: string;
  unknown: string;
  balance: string;
  addBalance: string;
  amount: string;
  sendNotice: string;
  notice: string;
  roles: string;
  addRole: string;
  removeRole: string;
  blockAccount: string;
  unblockAccount: string;
  approve: string;
  decline: string;
  openAuction: string;
  operationSuccess: string;
  operationError: string;
  confirm: string;
  cancel: string;
  reason: string;
  reasonRequired: string;
  legacyReasonNote: string;
  confirmRoleRemoval: string;
  confirmAccountChange: string;
  confirmApprove: string;
  confirmDecline: string;
  transactions: string;
  bids: string;
  attributes: string;
  lotTypes: string;
  subtypes: string;
  banners: string;
  create: string;
  update: string;
  delete: string;
  save: string;
  nameUz: string;
  nameEn: string;
  nameRu: string;
  valueType: string;
  selectable: string;
  lotType: string;
  options: string;
  attachedAttributes: string;
  availableAttributes: string;
  attachAttribute: string;
  detachAttribute: string;
  expires: string;
  image: string;
  lotId: string;
  choose: string;
  managementIntro: string;
  confirmDelete: string;
  contractsTable: string;
  seller: string;
  buyer: string;
  auctionId: string;
  page: string;
  prevPage: string;
  nextPage: string;
  auditTable: string;
  auditAction: string;
  auditEntity: string;
  auditUserId: string;
  auditFrom: string;
  auditTo: string;
  auditFilter: string;
  auditClearFilter: string;
  auditMetadata: string;
  auditCreatedAt: string;
  auditLogId: string;
  auditSearch: string;
  auditUserRef: string;
  status: string;
}

const messages: Record<Lang, WorkspaceCopy> = {
  uz: {
    loading: "Ma’lumotlar yuklanmoqda",
    loadingBody: "Operatsion xizmatdan eng so‘nggi yozuvlar olinmoqda.",
    error: "Ma’lumotlarni yuklab bo‘lmadi",
    errorBody: "Ulanishni tekshirib, keyinroq qayta urinib ko‘ring.",
    empty: "Hozircha yozuv yo‘q",
    emptyBody: "Ushbu bo‘limga mos operatsion yozuv hali yaratilmagan.",
    close: "Tafsilotlarni yopish",
    details: "Yozuv tafsilotlari",
    usersTable: "Foydalanuvchilar ro‘yxati",
    vehiclesTable: "Avtomobillar ro‘yxati",
    auctionsTable: "Auksionlar ro‘yxati",
    moderationTable: "Moderatsiya navbati",
    transactionsTable: "Tranzaksiyalar jurnali",
    bidsTable: "Takliflar jurnali",
    referenceTable: "Transport vositasi turlari ma’lumotnomasi",
    totalUsers: "Jami foydalanuvchilar",
    activeUsers: "Faol foydalanuvchilar",
    totalLots: "Jami transport vositalari",
    activeLots: "Faol auksionlar",
    pendingLots: "Moderatsiyada",
    finishedLots: "Yakunlangan transport vositalari",
    turnover: "Umumiy pul aylanmasi",
    transactionCount: "Tranzaksiyalar",
    overviewBody: "Ko‘rsatkichlar platformaning amaldagi statistika xizmatidan olinadi.",
    active: "Faol",
    blocked: "Bloklangan",
    pending: "Kutilmoqda",
    approved: "Tasdiqlangan",
    declined: "Rad etilgan",
    completed: "Yakunlangan",
    expired: "Muddati tugagan",
    recorded: "Qayd etilgan",
    published: "E’lon qilingan",
    reference: "Amaldagi",
    noValue: "—",
    unknown: "Noma’lum",
    balance: "Balans",
    addBalance: "Balans qo‘shish",
    amount: "Miqdor",
    sendNotice: "Bildirishnoma yuborish",
    notice: "Bildirishnoma matni",
    roles: "Rollar",
    addRole: "Rol qo‘shish",
    removeRole: "Rolni olib tashlash",
    blockAccount: "Hisobni bloklash",
    unblockAccount: "Hisobni faollashtirish",
    approve: "Tasdiqlash",
    decline: "Rad etish",
    openAuction: "Auksionni ochish",
    operationSuccess: "Amal muvaffaqiyatli bajarildi.",
    operationError: "Amalni bajarib bo‘lmadi. Qayta urinib ko‘ring.",
    confirm: "Tasdiqlash",
    cancel: "Bekor qilish",
    reason: "Qaror sababi",
    reasonRequired: "Davom etish uchun sababni kiriting.",
    legacyReasonNote: "Amaldagi legacy endpoint bu sababni saqlamaydi; u qarorni ongli ravishda tasdiqlash uchun so‘ralmoqda.",
    confirmRoleRemoval: "Bu rolni olib tashlashni tasdiqlaysizmi?",
    confirmAccountChange: "Hisob holatini o‘zgartirishni tasdiqlaysizmi?",
    confirmApprove: "Ushbu transport vositasini tasdiqlashni xohlaysizmi?",
    confirmDecline: "Ushbu transport vositasini rad etishni xohlaysizmi?",
    transactions: "Tranzaksiyalar",
    bids: "Takliflar",
    attributes: "Atributlar",
    lotTypes: "Transport vositasi turlari",
    subtypes: "Ichki turlar",
    banners: "Bannerlar",
    create: "Yaratish",
    update: "Tahrirlash",
    delete: "O‘chirish",
    save: "Saqlash",
    nameUz: "Nomi — o‘zbekcha",
    nameEn: "Nomi — inglizcha",
    nameRu: "Nomi — ruscha",
    valueType: "Qiymat turi",
    selectable: "Tanlanadigan qiymat",
    lotType: "Transport vositasi turi",
    options: "Variantlar",
    attachedAttributes: "Biriktirilgan atributlar",
    availableAttributes: "Mavjud atributlar",
    attachAttribute: "Atributni biriktirish",
    detachAttribute: "Atributni ajratish",
    expires: "Amal qilish muddati",
    image: "Banner tasviri",
    lotId: "Transport ID",
    choose: "Tanlang",
    managementIntro: "Legacy moslik ma’lumotlari va promo bannerlar amaldagi backend xizmatlari orqali boshqariladi.",
    confirmDelete: "Ushbu yozuvni o‘chirishni tasdiqlaysizmi?",
    contractsTable: "Shartnomalar jadvali",
    seller: "Sotuvchi",
    buyer: "Xaridor",
    auctionId: "Auksion ID",
    page: "Sahifa",
    prevPage: "Oldingi sahifa",
    nextPage: "Keyingi sahifa",
    auditTable: "Audit yozuvlari",
    auditAction: "Harakat",
    auditEntity: "Ob'ekt",
    auditUserId: "Foydalanuvchi ID",
    auditFrom: "Sanadan",
    auditTo: "Sanagacha",
    auditFilter: "Filtrlash",
    auditClearFilter: "Filtrlarni tozalash",
    auditMetadata: "Metama'lumotlar",
    auditCreatedAt: "Yaratilgan vaqt",
    auditLogId: "Log ID",
    auditSearch: "Qidirish",
    auditUserRef: "Foydalanuvchi",
    status: "Status",
  },
  en: {
    loading: "Loading records",
    loadingBody: "Fetching the latest records from the operational service.",
    error: "Could not load records",
    errorBody: "Check the connection and try again shortly.",
    empty: "No records yet",
    emptyBody: "No operational record has been created for this section yet.",
    close: "Close details",
    details: "Record details",
    usersTable: "User list",
    vehiclesTable: "Vehicle list",
    auctionsTable: "Auction list",
    moderationTable: "Moderation queue",
    transactionsTable: "Transaction ledger",
    bidsTable: "Bid ledger",
    referenceTable: "Vehicle type reference data",
    totalUsers: "Total users",
    activeUsers: "Active users",
    totalLots: "Total vehicles",
    activeLots: "Live auctions",
    pendingLots: "Awaiting moderation",
    finishedLots: "Completed vehicles",
    turnover: "Total turnover",
    transactionCount: "Transactions",
    overviewBody: "Metrics come from the platform's connected statistics service.",
    active: "Active",
    blocked: "Blocked",
    pending: "Pending",
    approved: "Approved",
    declined: "Declined",
    completed: "Completed",
    expired: "Expired",
    recorded: "Recorded",
    published: "Published",
    reference: "Current",
    noValue: "—",
    unknown: "Unknown",
    balance: "Balance",
    addBalance: "Add balance",
    amount: "Amount",
    sendNotice: "Send notification",
    notice: "Notification message",
    roles: "Roles",
    addRole: "Add role",
    removeRole: "Remove role",
    blockAccount: "Block account",
    unblockAccount: "Activate account",
    approve: "Approve",
    decline: "Decline",
    openAuction: "Open auction",
    operationSuccess: "The operation completed successfully.",
    operationError: "The operation could not be completed. Try again.",
    confirm: "Confirm",
    cancel: "Cancel",
    reason: "Decision reason",
    reasonRequired: "Enter a reason before continuing.",
    legacyReasonNote: "The current legacy endpoint does not store this reason; it is requested to make the decision deliberate.",
    confirmRoleRemoval: "Confirm removing this role?",
    confirmAccountChange: "Confirm changing this account status?",
    confirmApprove: "Do you want to approve this vehicle?",
    confirmDecline: "Do you want to decline this vehicle?",
    transactions: "Transactions",
    bids: "Bids",
    attributes: "Attributes",
    lotTypes: "Vehicle types",
    subtypes: "Subtypes",
    banners: "Banners",
    create: "Create",
    update: "Edit",
    delete: "Delete",
    save: "Save",
    nameUz: "Name — Uzbek",
    nameEn: "Name — English",
    nameRu: "Name — Russian",
    valueType: "Value type",
    selectable: "Selectable value",
    lotType: "Vehicle type",
    options: "Options",
    attachedAttributes: "Attached attributes",
    availableAttributes: "Available attributes",
    attachAttribute: "Attach attribute",
    detachAttribute: "Detach attribute",
    expires: "Expires at",
    image: "Banner image",
    lotId: "Vehicle ID",
    choose: "Choose",
    managementIntro: "Legacy compatibility data and promotional banners are managed through connected backend services.",
    confirmDelete: "Confirm deleting this record?",
    contractsTable: "Contracts table",
    seller: "Seller",
    buyer: "Buyer",
    auctionId: "Auction ID",
    page: "Page",
    prevPage: "Previous page",
    nextPage: "Next page",
    auditTable: "Audit records",
    auditAction: "Action",
    auditEntity: "Entity",
    auditUserId: "User ID",
    auditFrom: "From date",
    auditTo: "To date",
    auditFilter: "Filter",
    auditClearFilter: "Clear filters",
    auditMetadata: "Metadata",
    auditCreatedAt: "Created at",
    auditLogId: "Log ID",
    auditSearch: "Search",
    auditUserRef: "User",
    status: "Status",
  },
  ru: {
    loading: "Загружаем данные",
    loadingBody: "Получаем актуальные записи из операционного сервиса.",
    error: "Не удалось загрузить данные",
    errorBody: "Проверьте соединение и повторите попытку позже.",
    empty: "Записей пока нет",
    emptyBody: "Для этого раздела ещё нет операционных записей.",
    close: "Закрыть детали",
    details: "Детали записи",
    usersTable: "Список пользователей",
    vehiclesTable: "Список автомобилей",
    auctionsTable: "Список аукционов",
    moderationTable: "Очередь модерации",
    transactionsTable: "Журнал транзакций",
    bidsTable: "Журнал ставок",
    referenceTable: "Справочник типов транспорта",
    totalUsers: "Всего пользователей",
    activeUsers: "Активные пользователи",
    totalLots: "Всего транспортных средств",
    activeLots: "Активные аукционы",
    pendingLots: "На модерации",
    finishedLots: "Завершённые транспортные средства",
    turnover: "Общий оборот",
    transactionCount: "Транзакции",
    overviewBody: "Показатели поступают из подключённого сервиса статистики платформы.",
    active: "Активен",
    blocked: "Заблокирован",
    pending: "Ожидает",
    approved: "Одобрен",
    declined: "Отклонён",
    completed: "Завершён",
    expired: "Истёк",
    recorded: "Зафиксирован",
    published: "Опубликован",
    reference: "Актуален",
    noValue: "—",
    unknown: "Неизвестно",
    balance: "Баланс",
    addBalance: "Пополнить баланс",
    amount: "Сумма",
    sendNotice: "Отправить уведомление",
    notice: "Текст уведомления",
    roles: "Роли",
    addRole: "Добавить роль",
    removeRole: "Удалить роль",
    blockAccount: "Заблокировать аккаунт",
    unblockAccount: "Активировать аккаунт",
    approve: "Одобрить",
    decline: "Отклонить",
    openAuction: "Открыть аукцион",
    operationSuccess: "Операция выполнена успешно.",
    operationError: "Не удалось выполнить операцию. Попробуйте снова.",
    confirm: "Подтвердить",
    cancel: "Отмена",
    reason: "Причина решения",
    reasonRequired: "Укажите причину, чтобы продолжить.",
    legacyReasonNote: "Текущий legacy-endpoint не сохраняет эту причину; она запрашивается для осознанного подтверждения решения.",
    confirmRoleRemoval: "Подтвердить удаление этой роли?",
    confirmAccountChange: "Подтвердить изменение статуса аккаунта?",
    confirmApprove: "Одобрить этот транспорт?",
    confirmDecline: "Отклонить этот транспорт?",
    transactions: "Транзакции",
    bids: "Ставки",
    attributes: "Атрибуты",
    lotTypes: "Типы транспорта",
    subtypes: "Подтипы",
    banners: "Баннеры",
    create: "Создать",
    update: "Изменить",
    delete: "Удалить",
    save: "Сохранить",
    nameUz: "Название — узбекский",
    nameEn: "Название — английский",
    nameRu: "Название — русский",
    valueType: "Тип значения",
    selectable: "Выбираемое значение",
    lotType: "Тип транспорта",
    options: "Варианты",
    attachedAttributes: "Привязанные атрибуты",
    availableAttributes: "Доступные атрибуты",
    attachAttribute: "Привязать атрибут",
    detachAttribute: "Отвязать атрибут",
    expires: "Срок действия",
    image: "Изображение баннера",
    lotId: "ID транспорта",
    choose: "Выберите",
    managementIntro: "Данные legacy-совместимости и промобаннеры управляются через подключённые backend-сервисы.",
    confirmDelete: "Подтвердить удаление этой записи?",
    contractsTable: "Таблица контрактов",
    seller: "Продавец",
    buyer: "Покупатель",
    auctionId: "ID аукциона",
    page: "Страница",
    prevPage: "Предыдущая страница",
    nextPage: "Следующая страница",
    auditTable: "Записи аудита",
    auditAction: "Действие",
    auditEntity: "Сущность",
    auditUserId: "ID пользователя",
    auditFrom: "От даты",
    auditTo: "До даты",
    auditFilter: "Фильтр",
    auditClearFilter: "Очистить фильтры",
    auditMetadata: "Метаданные",
    auditCreatedAt: "Создано",
    auditLogId: "ID записи",
    auditSearch: "Поиск",
    auditUserRef: "Пользователь",
    status: "Статус",
  },
};

const roleOptions = [
  { id: 1, name: "ADMIN" },
  { id: 2, name: "USER" },
] as const;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function listFrom(value: unknown, depth = 0): UnknownRecord[] {
  if (Array.isArray(value)) return value.map(asRecord).filter((item) => Object.keys(item).length > 0);
  if (depth > 4) return [];
  const record = asRecord(value);
  for (const key of ["content", "dtoList", "list", "data", "meta"]) {
    if (record[key] !== undefined) {
      const nested = listFrom(record[key], depth + 1);
      if (nested.length > 0 || Array.isArray(record[key])) return nested;
    }
  }
  return [];
}

function recordFrom(value: unknown, depth = 0): UnknownRecord {
  const record = asRecord(value);
  if (depth > 3) return record;
  const keys = Object.keys(record);
  if (keys.length === 1 && keys[0] === "data") return recordFrom(record.data, depth + 1);
  return record;
}

function reportRecordFrom(value: unknown): UnknownRecord {
  const record = asRecord(value);
  const data = asRecord(record.data);
  return Object.keys(data).length > 0 ? data : recordFrom(value);
}

function readPath(record: UnknownRecord, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => asRecord(value)[key], record);
}

function textValue(record: UnknownRecord, paths: string[], fallback = ""): string {
  for (const path of paths) {
    const value = readPath(record, path);
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function numberValue(record: UnknownRecord, paths: string[]): number | null {
  for (const path of paths) {
    const value = readPath(record, path);
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function localeFor(lang: Lang) {
  return lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ";
}

function formatNumber(value: number | null, lang: Lang, suffix = "") {
  if (value === null) return "—";
  const formatted = new Intl.NumberFormat(localeFor(lang), { maximumFractionDigits: 2 }).format(value);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

function confirmedCurrency(record: UnknownRecord) {
  const currency = textValue(record, ["currency", "currencyCode", "money.currency"]).toUpperCase();
  return currency === "UZS" || currency === "USD" ? currency : "";
}

function auditUserLabel(record: UnknownRecord, copy: WorkspaceCopy) {
  const orgName = textValue(record, ["userOrgName", "user.orgName", "user.organizationName"]);
  if (orgName) return orgName;
  const fullName = [
    textValue(record, ["userFirstName", "user.firstName", "user.firstname"]),
    textValue(record, ["userLastName", "user.lastName", "user.lastname"]),
  ].filter(Boolean).join(" ");
  if (fullName) return fullName;
  const userId = textValue(record, ["userId", "user.id"], "");
  return userId ? `${copy.auditUserRef} #${userId}` : copy.noValue;
}

function formatDate(value: unknown, lang: Lang) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(localeFor(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const backendEnumLabels: Record<Lang, Record<string, string>> = {
  uz: {
    ACTIVE: "Faol",
    INACTIVE: "Faol emas",
    ADMIN: "Administrator",
    ADMIN_BALANCE_ADJUSTED: "Administrator balansni o‘zgartirdi",
    ADMIN_NOTIFICATION_SENT: "Administrator bildirishnoma yubordi",
    APPROVED: "Tasdiqlangan",
    APPROVE: "Tasdiqlash",
    ARCHIVED: "Arxivlangan",
    AUCTION: "Auksion",
    AUCTION_APPROVED: "Auksion tasdiqlandi",
    AUCTION_CANCELLED: "Auksion bekor qilindi",
    AUCTION_CREATED: "Auksion yaratildi",
    AUKSION: "Auksion",
    AUCTION_OPENED: "Auksion ochildi",
    AUCTION_PUBLISHED: "Auksion e’lon qilindi",
    AUCTION_UPDATED: "Auksion yangilandi",
    AVAILABLE: "Mavjud",
    BALANCE: "Balans",
    BALANCE_ADJUSTED: "Balans o‘zgartirildi",
    BALANCE_TOP_UP: "Balans to‘ldirildi",
    BLOCKED: "Bloklangan",
    BID: "Taklif",
    BID_CREATED: "Taklif yaratildi",
    BID_PLACED: "Taklif berildi",
    BUYER: "Foydalanuvchi",
    CANCELED: "Bekor qilingan",
    CANCELLED: "Bekor qilingan",
    CHANGE_STATUS: "Statusni o‘zgartirish",
    COMPLETED: "Yakunlangan",
    CONTRACT: "Shartnoma",
    CONTRACT_CREATED: "Shartnoma yaratildi",
    CONTRACT_SIGNED: "Shartnoma imzolandi",
    CREATE: "Yaratish",
    CREATED: "Yaratilgan",
    DECLINED: "Rad etilgan",
    DECLINE: "Rad etish",
    DEPOSIT: "Deposit",
    DOCUMENT: "Hujjat",
    DOCUMENT_APPROVED: "Hujjat tasdiqlandi",
    DOCUMENT_REJECTED: "Hujjat rad etildi",
    DELETE: "O‘chirish",
    DELETED: "O‘chirilgan",
    DRAFT: "Qoralama",
    ENDED: "Yakunlangan",
    EXPORT: "Eksport",
    FAILED: "Muvaffaqiyatsiz",
    FINISHED: "Yakunlangan",
    KYC: "Shaxsni tasdiqlash",
    KYC_APPROVED: "Shaxs tasdiqlandi",
    KYC_DOCUMENT_UPLOADED: "KYC hujjati yuklandi",
    KYC_REJECTED: "Shaxsni tasdiqlash rad etildi",
    LIVE: "Jonli",
    LOGIN: "Tizimga kirish",
    LOGOUT: "Tizimdan chiqish",
    LOT: "Transport vositasi",
    LOT_APPROVED: "Transport vositasi tasdiqlandi",
    LOT_CREATED: "Transport vositasi yaratildi",
    LOT_DECLINED: "Transport vositasi rad etildi",
    LOT_REJECTED: "Transport vositasi rad etildi",
    LOT_UPDATED: "Transport vositasi yangilandi",
    MODERATION: "Moderatsiyada",
    NEW_MATCH: "Yangi moslik",
    NOTIFICATION: "Bildirishnoma",
    NOTIFICATION_SENT: "Bildirishnoma yuborildi",
    NOT_APPROVED: "Tasdiqlanmagan",
    PAID: "To‘langan",
    PAYMENT: "To‘lov",
    PAYMENT_CREATED: "To‘lov yaratildi",
    PAYMENT_FAILED: "To‘lov amalga oshmadi",
    PAYMENT_SUCCESS: "To‘lov muvaffaqiyatli",
    PENDING: "Kutilmoqda",
    PENDING_PAYMENT: "To‘lov kutilmoqda",
    PENDING_REVIEW: "Tekshiruvda",
    PUBLISHED: "E’lon qilingan",
    REJECT: "Rad etish",
    REJECTED: "Rad etilgan",
    ROLE: "Rol",
    ROLE_ADDED: "Rol qo‘shildi",
    ROLE_ASSIGNED: "Rol biriktirildi",
    ROLE_REMOVED: "Rol olib tashlandi",
    SELLER: "Sotuvchi",
    SIGN: "Imzolash",
    SIGNED: "Imzolangan",
    SOLD: "Sotilgan",
    SUCCESS: "Muvaffaqiyatli",
    TRANSACTION: "Tranzaksiya",
    TRANSACTION_CREATED: "Tranzaksiya yaratildi",
    UPDATE: "Yangilash",
    UPDATED: "Yangilangan",
    USER: "Foydalanuvchi",
    USER_ACTIVATED: "Foydalanuvchi faollashtirildi",
    USER_BALANCE: "Foydalanuvchi balansi",
    USER_BLOCKED: "Foydalanuvchi bloklandi",
    USER_CREATED: "Foydalanuvchi yaratildi",
    USERDOCUMENT: "Foydalanuvchi hujjati",
    USER_DOCUMENT: "Foydalanuvchi hujjati",
    USER_ROLE: "Foydalanuvchi roli",
    USER_UNBLOCKED: "Foydalanuvchi blokdan chiqarildi",
    USER_UPDATED: "Foydalanuvchi yangilandi",
    VEHICLE: "Transport vositasi",
    VEHICLE_APPROVED: "Transport vositasi tasdiqlandi",
    VEHICLE_CREATED: "Transport vositasi yaratildi",
    VEHICLE_DECLINED: "Transport vositasi rad etildi",
    VEHICLE_DOCUMENT: "Transport hujjati",
    VEHICLEDOCUMENT: "Transport hujjati",
    VEHICLE_REJECTED: "Transport vositasi rad etildi",
    VEHICLE_UPDATED: "Transport vositasi yangilandi",
    VERIFIED: "Tasdiqlangan",
  },
  en: {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    ADMIN: "Administrator",
    ADMIN_BALANCE_ADJUSTED: "Administrator adjusted balance",
    ADMIN_NOTIFICATION_SENT: "Administrator sent notification",
    APPROVED: "Approved",
    APPROVE: "Approve",
    ARCHIVED: "Archived",
    AUCTION: "Auction",
    AUCTION_APPROVED: "Auction approved",
    AUCTION_CANCELLED: "Auction canceled",
    AUCTION_CREATED: "Auction created",
    AUKSION: "Auction",
    AUCTION_OPENED: "Auction opened",
    AUCTION_PUBLISHED: "Auction published",
    AUCTION_UPDATED: "Auction updated",
    AVAILABLE: "Available",
    BALANCE: "Balance",
    BALANCE_ADJUSTED: "Balance adjusted",
    BALANCE_TOP_UP: "Balance topped up",
    BLOCKED: "Blocked",
    BID: "Bid",
    BID_CREATED: "Bid created",
    BID_PLACED: "Bid placed",
    BUYER: "User",
    CANCELED: "Canceled",
    CANCELLED: "Canceled",
    CHANGE_STATUS: "Change status",
    COMPLETED: "Completed",
    CONTRACT: "Contract",
    CONTRACT_CREATED: "Contract created",
    CONTRACT_SIGNED: "Contract signed",
    CREATE: "Create",
    CREATED: "Created",
    DECLINED: "Declined",
    DECLINE: "Decline",
    DEPOSIT: "Deposit",
    DOCUMENT: "Document",
    DOCUMENT_APPROVED: "Document approved",
    DOCUMENT_REJECTED: "Document rejected",
    DELETE: "Delete",
    DELETED: "Deleted",
    DRAFT: "Draft",
    ENDED: "Ended",
    EXPORT: "Export",
    FAILED: "Failed",
    FINISHED: "Finished",
    KYC: "Identity verification",
    KYC_APPROVED: "Identity approved",
    KYC_DOCUMENT_UPLOADED: "KYC document uploaded",
    KYC_REJECTED: "Identity rejected",
    LIVE: "Live",
    LOGIN: "Sign in",
    LOGOUT: "Sign out",
    LOT: "Vehicle",
    LOT_APPROVED: "Vehicle approved",
    LOT_CREATED: "Vehicle created",
    LOT_DECLINED: "Vehicle declined",
    LOT_REJECTED: "Vehicle rejected",
    LOT_UPDATED: "Vehicle updated",
    MODERATION: "In moderation",
    NEW_MATCH: "New match",
    NOTIFICATION: "Notification",
    NOTIFICATION_SENT: "Notification sent",
    NOT_APPROVED: "Not approved",
    PAID: "Paid",
    PAYMENT: "Payment",
    PAYMENT_CREATED: "Payment created",
    PAYMENT_FAILED: "Payment failed",
    PAYMENT_SUCCESS: "Payment successful",
    PENDING: "Pending",
    PENDING_PAYMENT: "Payment pending",
    PENDING_REVIEW: "In review",
    PUBLISHED: "Published",
    REJECT: "Reject",
    REJECTED: "Rejected",
    ROLE: "Role",
    ROLE_ADDED: "Role added",
    ROLE_ASSIGNED: "Role assigned",
    ROLE_REMOVED: "Role removed",
    SELLER: "Seller",
    SIGN: "Sign",
    SIGNED: "Signed",
    SOLD: "Sold",
    SUCCESS: "Successful",
    TRANSACTION: "Transaction",
    TRANSACTION_CREATED: "Transaction created",
    UPDATE: "Update",
    UPDATED: "Updated",
    USER: "User",
    USER_ACTIVATED: "User activated",
    USER_BALANCE: "User balance",
    USER_BLOCKED: "User blocked",
    USER_CREATED: "User created",
    USERDOCUMENT: "User document",
    USER_DOCUMENT: "User document",
    USER_ROLE: "User role",
    USER_UNBLOCKED: "User unblocked",
    USER_UPDATED: "User updated",
    VEHICLE: "Vehicle",
    VEHICLE_APPROVED: "Vehicle approved",
    VEHICLE_CREATED: "Vehicle created",
    VEHICLE_DECLINED: "Vehicle declined",
    VEHICLE_DOCUMENT: "Vehicle document",
    VEHICLEDOCUMENT: "Vehicle document",
    VEHICLE_REJECTED: "Vehicle rejected",
    VEHICLE_UPDATED: "Vehicle updated",
    VERIFIED: "Verified",
  },
  ru: {
    ACTIVE: "Активно",
    INACTIVE: "Неактивно",
    ADMIN: "Администратор",
    ADMIN_BALANCE_ADJUSTED: "Администратор изменил баланс",
    ADMIN_NOTIFICATION_SENT: "Администратор отправил уведомление",
    APPROVED: "Одобрено",
    APPROVE: "Одобрить",
    ARCHIVED: "В архиве",
    AUCTION: "Аукцион",
    AUCTION_APPROVED: "Аукцион одобрен",
    AUCTION_CANCELLED: "Аукцион отменён",
    AUCTION_CREATED: "Аукцион создан",
    AUKSION: "Аукцион",
    AUCTION_OPENED: "Аукцион открыт",
    AUCTION_PUBLISHED: "Аукцион опубликован",
    AUCTION_UPDATED: "Аукцион обновлён",
    AVAILABLE: "Доступно",
    BALANCE: "Баланс",
    BALANCE_ADJUSTED: "Баланс изменён",
    BALANCE_TOP_UP: "Баланс пополнен",
    BLOCKED: "Заблокировано",
    BID: "Ставка",
    BID_CREATED: "Ставка создана",
    BID_PLACED: "Ставка сделана",
    BUYER: "Пользователь",
    CANCELED: "Отменено",
    CANCELLED: "Отменено",
    CHANGE_STATUS: "Изменение статуса",
    COMPLETED: "Завершено",
    CONTRACT: "Контракт",
    CONTRACT_CREATED: "Контракт создан",
    CONTRACT_SIGNED: "Контракт подписан",
    CREATE: "Создание",
    CREATED: "Создано",
    DECLINED: "Отклонено",
    DECLINE: "Отклонить",
    DEPOSIT: "Депозит",
    DOCUMENT: "Документ",
    DOCUMENT_APPROVED: "Документ одобрен",
    DOCUMENT_REJECTED: "Документ отклонён",
    DELETE: "Удаление",
    DELETED: "Удалено",
    DRAFT: "Черновик",
    ENDED: "Завершено",
    EXPORT: "Экспорт",
    FAILED: "Ошибка",
    FINISHED: "Завершено",
    KYC: "Подтверждение личности",
    KYC_APPROVED: "Личность подтверждена",
    KYC_DOCUMENT_UPLOADED: "KYC документ загружен",
    KYC_REJECTED: "Подтверждение личности отклонено",
    LIVE: "В эфире",
    LOGIN: "Вход в систему",
    LOGOUT: "Выход из системы",
    LOT: "Транспорт",
    LOT_APPROVED: "Транспорт одобрен",
    LOT_CREATED: "Транспорт создан",
    LOT_DECLINED: "Транспорт отклонён",
    LOT_REJECTED: "Транспорт отклонён",
    LOT_UPDATED: "Транспорт обновлён",
    MODERATION: "На модерации",
    NEW_MATCH: "Новое совпадение",
    NOTIFICATION: "Уведомление",
    NOTIFICATION_SENT: "Уведомление отправлено",
    NOT_APPROVED: "Не одобрено",
    PAID: "Оплачено",
    PAYMENT: "Платёж",
    PAYMENT_CREATED: "Платёж создан",
    PAYMENT_FAILED: "Платёж не прошёл",
    PAYMENT_SUCCESS: "Платёж успешен",
    PENDING: "Ожидает",
    PENDING_PAYMENT: "Ожидает оплаты",
    PENDING_REVIEW: "На проверке",
    PUBLISHED: "Опубликовано",
    REJECT: "Отклонить",
    REJECTED: "Отклонено",
    ROLE: "Роль",
    ROLE_ADDED: "Роль добавлена",
    ROLE_ASSIGNED: "Роль назначена",
    ROLE_REMOVED: "Роль удалена",
    SELLER: "Продавец",
    SIGN: "Подписание",
    SIGNED: "Подписано",
    SOLD: "Продано",
    SUCCESS: "Успешно",
    TRANSACTION: "Транзакция",
    TRANSACTION_CREATED: "Транзакция создана",
    UPDATE: "Обновление",
    UPDATED: "Обновлено",
    USER: "Пользователь",
    USER_ACTIVATED: "Пользователь активирован",
    USER_BALANCE: "Баланс пользователя",
    USER_BLOCKED: "Пользователь заблокирован",
    USER_CREATED: "Пользователь создан",
    USERDOCUMENT: "Документ пользователя",
    USER_DOCUMENT: "Документ пользователя",
    USER_ROLE: "Роль пользователя",
    USER_UNBLOCKED: "Пользователь разблокирован",
    USER_UPDATED: "Пользователь обновлён",
    VEHICLE: "Транспорт",
    VEHICLE_APPROVED: "Транспорт одобрен",
    VEHICLE_CREATED: "Транспорт создан",
    VEHICLE_DECLINED: "Транспорт отклонён",
    VEHICLE_DOCUMENT: "Документ транспорта",
    VEHICLEDOCUMENT: "Документ транспорта",
    VEHICLE_REJECTED: "Транспорт отклонён",
    VEHICLE_UPDATED: "Транспорт обновлён",
    VERIFIED: "Подтверждено",
  },
};

function enumKey(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase().replace(/[\s-]+/g, "_") : "";
}

function translateBackendEnum(value: unknown, lang: Lang, fallback = "—") {
  const key = enumKey(value);
  if (!key) return fallback;
  return backendEnumLabels[lang][key] ?? translateBackendValue(value, lang, fallback);
}

const auditMetadataLabels: Record<Lang, Record<string, string>> = {
  uz: {
    amount: "Miqdor",
    auctionId: "Auksion ID",
    balance: "Balans",
    buyerId: "Xaridor ID",
    contractId: "Shartnoma ID",
    currency: "Valyuta",
    documentId: "Hujjat ID",
    email: "E-mail",
    message: "Xabar",
    newBalance: "Yangi balans",
    newStatus: "Yangi holat",
    oldBalance: "Oldingi balans",
    oldStatus: "Oldingi holat",
    reason: "Sabab",
    role: "Rol",
    roleName: "Rol nomi",
    sellerId: "Sotuvchi ID",
    status: "Holat",
    targetUserId: "Amal qo‘llangan foydalanuvchi ID",
    userId: "Foydalanuvchi ID",
    vehicleId: "Transport vositasi ID",
  },
  en: {
    amount: "Amount",
    auctionId: "Auction ID",
    balance: "Balance",
    buyerId: "Buyer ID",
    contractId: "Contract ID",
    currency: "Currency",
    documentId: "Document ID",
    email: "Email",
    message: "Message",
    newBalance: "New balance",
    newStatus: "New status",
    oldBalance: "Previous balance",
    oldStatus: "Previous status",
    reason: "Reason",
    role: "Role",
    roleName: "Role name",
    sellerId: "Seller ID",
    status: "Status",
    targetUserId: "Affected user ID",
    userId: "User ID",
    vehicleId: "Vehicle ID",
  },
  ru: {
    amount: "Сумма",
    auctionId: "ID аукциона",
    balance: "Баланс",
    buyerId: "ID покупателя",
    contractId: "ID контракта",
    currency: "Валюта",
    documentId: "ID документа",
    email: "Email",
    message: "Сообщение",
    newBalance: "Новый баланс",
    newStatus: "Новый статус",
    oldBalance: "Предыдущий баланс",
    oldStatus: "Предыдущий статус",
    reason: "Причина",
    role: "Роль",
    roleName: "Название роли",
    sellerId: "ID продавца",
    status: "Статус",
    targetUserId: "ID затронутого пользователя",
    userId: "ID пользователя",
    vehicleId: "ID транспорта",
  },
};

function humanizeMetadataKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function auditMetadataEntries(value: unknown, prefix = ""): Array<[string, unknown]> {
  if (!value || typeof value !== "object" || value instanceof Date) return prefix ? [[prefix, value]] : [];
  if (Array.isArray(value)) return prefix ? [[prefix, value]] : [];
  return Object.entries(value as UnknownRecord).flatMap(([key, item]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === "object" && !Array.isArray(item)) return auditMetadataEntries(item, path);
    return [[path, item] as [string, unknown]];
  });
}

function formatAuditMetadataValue(key: string, value: unknown, lang: Lang, fallback: string) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "boolean") return value ? ({ uz: "Ha", en: "Yes", ru: "Да" }[lang]) : ({ uz: "Yo‘q", en: "No", ru: "Нет" }[lang]);
  if (Array.isArray(value)) {
    return value.map((item) => {
      const translated = backendEnumLabels[lang][enumKey(item)];
      return translated ?? String(item);
    }).join(", ");
  }
  if (/(?:at|date|time)$/i.test(key) && (typeof value === "string" || typeof value === "number")) {
    return formatDate(value, lang) || String(value);
  }
  if (typeof value === "string") return backendEnumLabels[lang][enumKey(value)] ?? value;
  return String(value);
}

function queryLoading(query: QueryState) {
  return Boolean(query.isLoading || query.isPending);
}

function mutationLoading(mutation: MutationState) {
  return Boolean(mutation.isLoading || mutation.isPending);
}

function statusDetails(rawStatus: string, copy: WorkspaceCopy, lang?: Lang): [string, StatusBadgeTone] {
  const normalized = rawStatus.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const label = lang ? translateBackendEnum(rawStatus, lang, rawStatus || copy.recorded) : rawStatus;
  if (["ACTIVE", "LIVE", "SUCCESS", "PAID", "AVAILABLE"].includes(normalized))
    return [label || copy.active, "success"];
  if (["APPROVED", "VERIFIED"].includes(normalized)) return [label || copy.approved, "success"];
  if (["FINISHED", "COMPLETED", "SOLD", "ENDED"].includes(normalized))
    return [label || copy.completed, "neutral"];
  if (["DECLINED", "REJECTED", "FAILED", "CANCELLED", "BLOCKED", "INACTIVE"].includes(normalized))
    return [label || (normalized === "BLOCKED" ? copy.blocked : copy.declined), "danger"];
  if (["PENDING", "NOT_APPROVED", "DRAFT", "UPCOMING", "MODERATION"].includes(normalized))
    return [label || copy.pending, "warning"];
  return [label || copy.recorded, "info"];
}

const filterLabels: Record<Lang, { all: string; status: string; type: string }> = {
  uz: { all: "Barchasi", status: "Status bo‘yicha", type: "Tur bo‘yicha" },
  en: { all: "All", status: "Filter by status", type: "Filter by type" },
  ru: { all: "Все", status: "Фильтр по статусу", type: "Фильтр по типу" },
};

function filterValue(record: UnknownRecord, paths: string[]): string {
  return textValue(record, paths).trim().toUpperCase();
}

function filterOptions(records: UnknownRecord[], paths: string[]) {
  const counts = new Map<string, number>();
  records.forEach((record) => {
    const value = filterValue(record, paths);
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return Array.from(counts, ([value, count]) => ({ count, value })).sort((a, b) =>
    a.value.localeCompare(b.value),
  );
}

function filteredBy(records: UnknownRecord[], paths: string[], value: string) {
  if (!value) return records;
  return records.filter((record) => filterValue(record, paths) === value);
}

function AdminFilterBar({
  forceVisible = false,
  label,
  onChange,
  options,
  value,
}: {
  forceVisible?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ count: number; value: string }>;
  value: string;
}) {
  const { currentLang } = useContext(LangSwitch);
  const labels = filterLabels[currentLang];
  const selectOptions =
    value && !options.some((option) => option.value === value)
      ? [{ count: 0, value }, ...options]
      : options;
  if (!forceVisible && !selectOptions.length) return null;
  const tabOptions: AdminFilterTabOption[] = [
    { count: options.reduce((total, option) => total + option.count, 0), label: labels.all, value: "" },
    ...selectOptions.map((option) => ({
      count: option.count,
      label: translateBackendEnum(option.value, currentLang, option.value),
      tone: statusDetails(option.value, messages[currentLang], currentLang)[1],
      value: option.value,
    })),
  ];
  return (
    <AdminFilterTabs ariaLabel={label} onChange={onChange} options={tabOptions} value={value} />
  );
}

function recordId(record: UnknownRecord, index: number) {
  return textValue(record, ["id", "lotId", "userId", "transactionId", "bidId"], String(index + 1));
}

function userRoles(record: UnknownRecord) {
  const roles = record.roles;
  if (!Array.isArray(roles)) return [];
  return roles
    .map((role) => {
      const item = asRecord(role);
      const name = typeof role === "string" ? role : textValue(item, ["name", "roleName"]);
      const id = numberValue(item, ["id", "roleId"]);
      return name ? { id, name: name.toUpperCase() } : null;
    })
    .filter((role): role is { id: number | null; name: string } => Boolean(role));
}

export function userAccountFilterValue(record: UnknownRecord): "ACTIVE" | "INACTIVE" {
  const rawStatus = textValue(record, ["accountStatus", "userStatus", "status"])
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (
    record.isActive === false ||
    record.active === false ||
    record.blocked === true ||
    record.isBlocked === true ||
    ["INACTIVE", "DISABLED", "BLOCKED", "DEACTIVATED"].includes(rawStatus)
  ) return "INACTIVE";
  return "ACTIVE";
}

function userRows(records: UnknownRecord[], copy: WorkspaceCopy, lang: Lang): OperationalRow[] {
  return records.map((record, index) => {
    const id = recordId(record, index);
    const name = [textValue(record, ["firstname", "firstName"]), textValue(record, ["lastname", "lastName"])]
      .filter(Boolean)
      .join(" ");
    const [status, tone] = statusDetails(userAccountFilterValue(record), copy, lang);
    const roles = userRoles(record).map((role) => role.name).join(" · ");
    return {
      id: `#${id}`,
      primary: name || textValue(record, ["email", "username"], `${copy.unknown} #${id}`),
      secondary: [textValue(record, ["email", "phone", "phoneNumber"]), roles].filter(Boolean).join(" · ") || copy.unknown,
      value: formatNumber(numberValue(record, ["balance", "walletBalance"]), lang, confirmedCurrency(record)),
      status,
      tone,
    };
  });
}

function lotTitle(record: UnknownRecord, id: string, copy: WorkspaceCopy) {
  const explicit = textValue(record, ["title", "name", "vehicleName"]);
  if (explicit) return explicit;
  const composed = [
    textValue(record, ["brand", "make", "carBrand.name", "brandDto.name"]),
    textValue(record, ["model", "carModel.name", "modelDto.name"]),
  ]
    .filter(Boolean)
    .join(" ");
  return composed || `${copy.unknown} #${id}`;
}

function lotRows(records: UnknownRecord[], copy: WorkspaceCopy, lang: Lang): OperationalRow[] {
  return records.map((record, index) => {
    const id = recordId(record, index);
    const rawStatus = textValue(record, ["lotStatus", "status", "auctionStatus"]);
    const [status, tone] = statusDetails(rawStatus, copy, lang);
    const seller = textValue(record, ["sellerName", "seller.email", "sellerDto.email", "sellerId", "userId"]);
    const date = formatDate(record.startTime ?? record.createdAt, lang);
    return {
      id: `#${id}`,
      primary: lotTitle(record, id, copy),
      secondary: [seller ? `ID ${seller}` : "", date].filter(Boolean).join(" · ") || copy.unknown,
      value: formatNumber(numberValue(record, ["currentPrice", "lastPrice", "startPrice", "startingPrice", "price"]), lang, confirmedCurrency(record)),
      status,
      tone,
    };
  });
}

function transactionRows(records: UnknownRecord[], copy: WorkspaceCopy, lang: Lang): OperationalRow[] {
  return records.map((record, index) => {
    const id = recordId(record, index);
    const [status, tone] = statusDetails(textValue(record, ["status", "transactionStatus"]), copy, lang);
    return {
      id: `#${id}`,
      primary: translateBackendEnum(textValue(record, ["type", "transactionType", "title"], `${copy.transactions} #${id}`), lang),
      secondary: [
        textValue(record, ["user.email", "userDto.email", "userId"]),
        formatDate(record.createdAt ?? record.transactionTime, lang),
      ].filter(Boolean).join(" · ") || copy.unknown,
      value: formatNumber(numberValue(record, ["amount", "sum", "value"]), lang, confirmedCurrency(record)),
      status,
      tone,
    };
  });
}

function bidRows(records: UnknownRecord[], copy: WorkspaceCopy, lang: Lang): OperationalRow[] {
  return records.map((record, index) => {
    const id = recordId(record, index);
    const [status, tone] = statusDetails(textValue(record, ["bidStatus", "status"]), copy, lang);
    const lot = textValue(record, ["lot.title", "lotDto.title", "lotId"]);
    const bidderFullName = [
      textValue(record, ["bidderDto.firstName", "bidderDto.firstname"]),
      textValue(record, ["bidderDto.lastName", "bidderDto.lastname"]),
    ].filter(Boolean).join(" ");

    const bidder = bidderFullName || textValue(record, ["bidderDto.secretName", "bidderDto.email", "bidderDto.id", "bidderId", "userId"]);

    return {
      id: `#${id}`,
      primary: lot || `${copy.bids} #${id}`,
      secondary: [bidder, formatDate(record.bidTime ?? record.createdAt, lang)].filter(Boolean).join(" · ") || copy.unknown,
      value: formatNumber(numberValue(record, ["bidAmount", "amount", "price"]), lang, confirmedCurrency(record)),
      status,
      tone,
    };
  });
}

function localizedRecordName(record: UnknownRecord, lang: Lang) {
  const value = record.name ?? record.title ?? record.value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = asRecord(JSON.parse(trimmed));
        return textValue(parsed, [lang, "default", "uz", "ru", "en"], trimmed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  const localized = asRecord(value);
  return textValue(localized, [lang, "default", "uz", "ru", "en"]);
}

function localizedNameParts(record: UnknownRecord) {
  const value = record.name ?? record.title ?? record.value;
  if (typeof value === "string" && value.trim().startsWith("{")) {
    try {
      const parsed = asRecord(JSON.parse(value));
      return {
        en: textValue(parsed, ["en", "default"]),
        ru: textValue(parsed, ["ru", "default"]),
        uz: textValue(parsed, ["uz", "default"]),
      };
    } catch {
      return { en: value, ru: value, uz: value };
    }
  }
  const localized = asRecord(value);
  if (Object.keys(localized).length > 0) {
    return {
      en: textValue(localized, ["en", "default"]),
      ru: textValue(localized, ["ru", "default"]),
      uz: textValue(localized, ["uz", "default"]),
    };
  }
  const plain = typeof value === "string" ? value : "";
  return { en: plain, ru: plain, uz: plain };
}

function referenceRows(records: UnknownRecord[], copy: WorkspaceCopy, lang: Lang): OperationalRow[] {
  return records.map((record, index) => {
    const id = recordId(record, index);
    const attributes = Array.isArray(record.attributes)
      ? record.attributes.length
      : Array.isArray(record.attributeDtoList)
        ? record.attributeDtoList.length
        : numberValue(record, ["attributeCount"]);
    return {
      id: `#${id}`,
      primary: localizedRecordName(record, lang) || `${copy.reference} #${id}`,
      secondary: textValue(record, ["description", "slug", "valueType", "lotType.name"], copy.reference),
      value: attributes === null ? copy.noValue : `${attributes} ${copy.attributes}`,
      status: copy.reference,
      tone: "info",
    };
  });
}

function QueryStatePanel({ query }: { query: QueryState }) {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  if (queryLoading(query)) {
    return (
      <StatePanel
        description={copy.loadingBody}
        icon={<LoaderCircle className="animate-spin motion-reduce:animate-none" size={32} />}
        title={copy.loading}
      />
    );
  }
  if (query.isError || query.error) {
    return <StatePanel description={copy.errorBody} icon={<Inbox size={32} />} title={copy.error} />;
  }
  return <StatePanel description={copy.emptyBody} icon={<Inbox size={32} />} title={copy.empty} />;
}

function RecordInspector({
  disabled = false,
  onClose,
  row,
}: {
  disabled?: boolean;
  onClose: () => void;
  row: OperationalRow;
}) {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy-950/65 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !disabled) onClose();
      }}
      role="presentation"
    >
      <Surface
        aria-modal="true"
        className="my-6 w-full max-w-2xl shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-gold-text">{copy.details}</p>
            <h2 className="mt-2 text-xl font-black text-brand-navy-900">{row.primary}</h2>
            <p className="mt-2 text-sm text-text-secondary">{row.secondary}</p>
          </div>
          <button
            aria-label={copy.close}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default text-brand-navy-900 hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border-default pt-4">
          <span className="font-black tabular-nums text-brand-navy-900">{row.value}</span>
          <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-text-secondary">{row.id}</span>
        </div>
      </Surface>
    </div>
  );
}

function formatContractPrice(value: number | undefined, currency: string | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${new Intl.NumberFormat().format(Number(value))} ${currency || ""}`.trim();
}

const contractDetailCopy = {
  uz: { userId: "Foydalanuvchi ID", name: "Ism", email: "E-mail", phone: "Telefon", vin: "VIN", mileage: "Yurgan masofa", region: "Hudud", pricing: "Narxlar", startPrice: "Boshlang‘ich narx", reservePrice: "Rezerv narx", currentPrice: "Joriy narx", deposit: "Depozit", increment: "Qadam", auction: "Auksion", dealStatus: "Bitim holati", startTime: "Boshlanish vaqti", endTime: "Tugash vaqti" },
  en: { userId: "User ID", name: "Name", email: "Email", phone: "Phone", vin: "VIN", mileage: "Mileage", region: "Region", pricing: "Pricing", startPrice: "Start price", reservePrice: "Reserve price", currentPrice: "Current price", deposit: "Deposit", increment: "Increment", auction: "Auction", dealStatus: "Deal status", startTime: "Start time", endTime: "End time" },
  ru: { userId: "ID пользователя", name: "Имя", email: "Email", phone: "Телефон", vin: "VIN", mileage: "Пробег", region: "Регион", pricing: "Цены", startPrice: "Стартовая цена", reservePrice: "Резервная цена", currentPrice: "Текущая цена", deposit: "Депозит", increment: "Шаг", auction: "Аукцион", dealStatus: "Статус сделки", startTime: "Время начала", endTime: "Время окончания" },
} satisfies Record<Lang, Record<string, string>>;

function counterpartyRecord(value: unknown): ContractCounterpartyRecord {
  const record = recordFrom(value);
  const nested = recordFrom(record.data);
  return (Object.keys(nested).length > 0 ? nested : record) as ContractCounterpartyRecord;
}

function counterpartyUser(value: unknown, role: "seller" | "buyer"): ContractCounterpartyUser | null {
  const data = counterpartyRecord(value);
  const fallback = data.counterparty ?? data.user;
  const fallbackRecord = recordFrom(fallback);
  const fallbackRole = textValue(fallbackRecord, ["role", "type"]).toLowerCase();
  const roleFallback =
    fallbackRole.includes(role) || (role === "buyer" && fallbackRole.includes("winner"))
      ? (fallbackRecord as ContractCounterpartyUser)
      : null;
  const user =
    role === "seller"
      ? data.seller ?? data.sellerDto ?? roleFallback
      : data.buyer ?? data.buyerDto ?? data.winner ?? data.winnerDto ?? roleFallback;
  const record = recordFrom(user);
  return Object.keys(record).length > 0 ? (record as ContractCounterpartyUser) : null;
}

function CounterpartyCard({
  copy,
  fallbackId,
  label,
  labels,
  user,
}: {
  copy: WorkspaceCopy;
  fallbackId?: string;
  label: string;
  labels: (typeof contractDetailCopy)[Lang];
  user: ContractCounterpartyUser | null;
}) {
  const record = recordFrom(user);
  const id = textValue(record, ["id", "userId"], fallbackId || copy.noValue);
  const name = [
    textValue(record, ["firstname", "firstName", "name"]),
    textValue(record, ["lastname", "lastName", "surname"]),
  ]
    .filter(Boolean)
    .join(" ");
  const email = textValue(record, ["email"], copy.noValue);
  const phone = textValue(record, ["phone", "phoneNumber", "mobile"], copy.noValue);

  return (
    <div className="rounded-2xl border border-border-default bg-surface-muted/35 p-4">
      <p className="text-xs font-black uppercase tracking-[0.11em] text-brand-gold-text">{label}</p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold text-text-secondary">{labels.userId}</dt>
          <dd className="mt-1 font-bold text-brand-navy-900">{id === copy.noValue ? id : `#${id}`}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-text-secondary">{labels.name}</dt>
          <dd className="mt-1 font-bold text-brand-navy-900">{name || copy.noValue}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-text-secondary">{labels.email}</dt>
          <dd className="mt-1 break-all font-bold text-brand-navy-900">{email}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-text-secondary">{labels.phone}</dt>
          <dd className="mt-1 font-bold text-brand-navy-900">{phone}</dd>
        </div>
      </dl>
    </div>
  );
}

function ContractAuctionInspector({
  auctionId,
  buyerId,
  onClose,
  sellerId,
}: {
  auctionId: string;
  buyerId?: string;
  onClose: () => void;
  sellerId?: string;
}) {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  const labels = contractDetailCopy[currentLang];
  const [activeCounterpartyTab, setActiveCounterpartyTab] = useState<"seller" | "buyer">("seller");
  const query = useAuctionById(auctionId) as QueryState & {
    data?: ContractAuctionRecord | null;
  };
  const counterpartyQuery = useAuctionCounterparty(auctionId) as QueryState;
  const auction = query.data;
  const seller = counterpartyUser(counterpartyQuery.data, "seller");
  const buyer = counterpartyUser(counterpartyQuery.data, "buyer");
  const vehicle = auction?.vehicle;
  const vehicleTitle = [
    vehicle?.makeName,
    vehicle?.modelName,
    vehicle?.year ? String(vehicle.year) : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy-950/65 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <Surface
        aria-modal="true"
        className="my-6 max-h-[calc(100dvh-3rem)] w-full max-w-4xl overflow-y-auto shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-gold-text">{copy.details}</p>
            <h2 className="mt-2 text-xl font-black text-brand-navy-900">
              {copy.auctionId} #{auctionId}
            </h2>
          </div>
          <button aria-label={copy.close} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default" onClick={onClose} type="button">
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        {queryLoading(query) ? (
          <div className="mt-6 flex items-center gap-3 border-t border-border-default pt-6 text-sm text-text-secondary">
            <LoaderCircle className="animate-spin motion-reduce:animate-none" size={18} />
            {copy.loading}
          </div>
        ) : query.isError || !auction ? (
          <div className="mt-6 border-t border-border-default pt-6 text-sm text-semantic-danger">
            {copy.errorBody}
          </div>
        ) : (
          <div className="mt-6 space-y-4 border-t border-border-default pt-6">
            <div className="rounded-2xl border border-border-default bg-surface-muted/35 p-4">
              <p className="text-xs font-black uppercase tracking-[0.11em] text-brand-gold-text">{copy.vehiclesTable}</p>
              <p className="mt-2 text-lg font-black text-brand-navy-900">{vehicleTitle || `${copy.auctionId} #${auctionId}`}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold text-text-secondary">{labels.vin}</p>
                  <p className="mt-1 text-sm font-bold text-brand-navy-900">{vehicle?.vin || copy.noValue}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary">{copy.status}</p>
                  <div className="mt-1">
                    <StatusBadge tone="neutral">{translateBackendEnum(vehicle?.status, currentLang, copy.noValue)}</StatusBadge>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary">{labels.mileage}</p>
                  <p className="mt-1 text-sm font-bold text-brand-navy-900">{vehicle?.mileage != null ? `${vehicle.mileage} km` : copy.noValue}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary">{labels.region}</p>
                  <p className="mt-1 text-sm font-bold text-brand-navy-900">{vehicle?.region || copy.noValue}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border-default p-4">
                <p className="text-xs font-black uppercase tracking-[0.11em] text-brand-gold-text">{labels.pricing}</p>
                <div className="mt-3 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-3"><span className="text-text-secondary">{labels.startPrice}</span><span className="font-bold text-brand-navy-900">{formatContractPrice(auction.startPrice, auction.currency)}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-text-secondary">{labels.reservePrice}</span><span className="font-bold text-brand-navy-900">{formatContractPrice(auction.reservePrice, auction.currency)}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-text-secondary">{labels.currentPrice}</span><span className="font-bold text-brand-navy-900">{formatContractPrice(auction.currentPrice, auction.currency)}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-text-secondary">{labels.deposit}</span><span className="font-bold text-brand-navy-900">{auction.depositPercent != null ? `${auction.depositPercent}%` : copy.noValue}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-text-secondary">{labels.increment}</span><span className="font-bold text-brand-navy-900">{auction.incrementValue != null ? `${auction.incrementValue} ${auction.incrementType === "PERCENTAGE" ? "%" : auction.currency || ""}`.trim() : copy.noValue}</span></div>
                </div>
              </div>

              <div className="rounded-2xl border border-border-default p-4">
                <p className="text-xs font-black uppercase tracking-[0.11em] text-brand-gold-text">{labels.auction}</p>
                <div className="mt-3 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-3"><span className="text-text-secondary">{copy.status}</span><StatusBadge tone="neutral">{translateBackendEnum(auction.status, currentLang, copy.noValue)}</StatusBadge></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-text-secondary">{labels.dealStatus}</span><StatusBadge tone="neutral">{translateBackendEnum(auction.dealStatus, currentLang, copy.noValue)}</StatusBadge></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-text-secondary">{labels.startTime}</span><span className="font-bold text-brand-navy-900">{formatDate(auction.startTime, currentLang) || copy.noValue}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-text-secondary">{labels.endTime}</span><span className="font-bold text-brand-navy-900">{formatDate(auction.endTime, currentLang) || copy.noValue}</span></div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-default p-4">
              <p className="text-xs font-black uppercase tracking-[0.11em] text-brand-gold-text">{copy.usersTable}</p>
              {queryLoading(counterpartyQuery) ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
                  <LoaderCircle className="animate-spin motion-reduce:animate-none" size={16} />
                  {copy.loading}
                </div>
              ) : counterpartyQuery.isError ? (
                <p className="mt-4 text-sm text-semantic-danger">{copy.errorBody}</p>
              ) : (
                <div className="mt-4">
                  <div className="flex gap-6 border-b border-border-default" role="tablist">
                    {(["seller", "buyer"] as const).map((tab) => (
                      <button
                        aria-controls={`contract-${tab}-panel`}
                        aria-selected={activeCounterpartyTab === tab}
                        className={`-mb-px min-h-11 border-b-2 px-1 text-sm font-extrabold transition-colors ${
                          activeCounterpartyTab === tab
                            ? "border-brand-navy-900 text-brand-navy-900"
                            : "border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary"
                        }`}
                        id={`contract-${tab}-tab`}
                        key={tab}
                        onClick={() => setActiveCounterpartyTab(tab)}
                        role="tab"
                        type="button"
                      >
                        {tab === "seller" ? copy.seller : copy.buyer}
                      </button>
                    ))}
                  </div>
                  <div
                    aria-labelledby={`contract-${activeCounterpartyTab}-tab`}
                    className="mt-4"
                    id={`contract-${activeCounterpartyTab}-panel`}
                    role="tabpanel"
                  >
                    {activeCounterpartyTab === "seller" ? (
                      <CounterpartyCard copy={copy} fallbackId={sellerId} label={copy.seller} labels={labels} user={seller} />
                    ) : (
                      <CounterpartyCard copy={copy} fallbackId={buyerId} label={copy.buyer} labels={labels} user={buyer} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Surface>
    </div>
  );
}

function ConnectedTable({
  label,
  query,
  rows,
  toolbarControls,
}: {
  label: string;
  query: QueryState;
  rows: OperationalRow[];
  toolbarControls?: ReactNode;
}) {
  const [selected, setSelected] = useState<OperationalRow | null>(null);
  if (query.isError || query.error) return <QueryStatePanel query={query} />;
  return (
    <>
      <OperationalTable label={label} loading={queryLoading(query)} onOpen={setSelected} rows={rows} toolbarControls={toolbarControls} />
      {selected ? <RecordInspector onClose={() => setSelected(null)} row={selected} /> : null}
    </>
  );
}

const overviewReportCopy: Record<Lang, Record<string, string>> = {
  uz: {
    avgSale: "O‘rtacha sotuv narxi",
    auctionsWithBids: "Taklif tushgan auksionlar",
    conversion: "Konversiya",
    deposits: "Depozitlar",
    finalPayments: "Yakuniy to‘lovlar",
    highestBid: "Eng yuqori taklif",
    marketplace: "Marketplace holati",
    paymentCount: "To‘lovlar soni",
    platformFees: "Platforma fee",
    refunds: "Qaytarilgan pullar",
    reportsIntro: "Backend report xizmatlaridan olingan jonli marketplace va moliyaviy ko‘rsatkichlar.",
    sellers: "Top sotuvchilar",
    soldAuctions: "So‘nggi sotilgan auksionlar",
    soldGross: "Sotuvlar jami",
    totalAuctions: "Jami auksionlar",
    totalBids: "Jami takliflar",
    uniqueBidders: "Unique bidderlar",
  },
  en: {
    avgSale: "Average sold price",
    auctionsWithBids: "Auctions with bids",
    conversion: "Conversion",
    deposits: "Deposits",
    finalPayments: "Final payments",
    highestBid: "Highest bid",
    marketplace: "Marketplace health",
    paymentCount: "Payments",
    platformFees: "Platform fees",
    refunds: "Refunds paid",
    reportsIntro: "Live marketplace and financial indicators from backend report services.",
    sellers: "Top sellers",
    soldAuctions: "Recent sold auctions",
    soldGross: "Gross sold amount",
    totalAuctions: "Total auctions",
    totalBids: "Total bids",
    uniqueBidders: "Unique bidders",
  },
  ru: {
    avgSale: "Средняя цена продажи",
    auctionsWithBids: "Аукционы со ставками",
    conversion: "Конверсия",
    deposits: "Депозиты",
    finalPayments: "Финальные платежи",
    highestBid: "Максимальная ставка",
    marketplace: "Состояние marketplace",
    paymentCount: "Платежи",
    platformFees: "Комиссия платформы",
    refunds: "Возвраты",
    reportsIntro: "Живые marketplace и финансовые показатели из backend report-сервисов.",
    sellers: "Топ продавцов",
    soldAuctions: "Последние проданные аукционы",
    soldGross: "Сумма продаж",
    totalAuctions: "Всего аукционов",
    totalBids: "Всего ставок",
    uniqueBidders: "Уникальные участники",
  },
};

function OverviewWorkspace() {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  const reportCopy = overviewReportCopy[currentLang];
  const userQuery = useUserStatistics() as QueryState;
  const lotQuery = useLotStatistics() as QueryState;
  const transactionQuery = useTranStatistics() as QueryState;
  const marketplaceQuery = useQuery({
    queryKey: ["admin-report", "marketplace-summary"],
    queryFn: async () => (await api.get("/admin/reports/marketplace-summary")).data,
    staleTime: 60 * 1000,
  }) as QueryState;
  const financialQuery = useQuery({
    queryKey: ["admin-report", "financial-summary"],
    queryFn: async () => (await api.get("/admin/reports/financial-summary")).data,
    staleTime: 60 * 1000,
  }) as QueryState;
  const sellersQuery = useQuery({
    queryKey: ["admin-report", "seller-performance"],
    queryFn: async () => (await api.get("/admin/reports/seller-performance", { params: { size: 5 } })).data,
    staleTime: 60 * 1000,
  }) as QueryState;
  const soldQuery = useQuery({
    queryKey: ["admin-report", "sold-auctions"],
    queryFn: async () => (await api.get("/admin/reports/sold-auctions", { params: { page: 0, size: 5 } })).data,
    staleTime: 60 * 1000,
  }) as QueryState;
  const userStats = recordFrom(userQuery.data);
  const lotStats = recordFrom(lotQuery.data);
  const transactionStats = recordFrom(transactionQuery.data);
  const marketplace = reportRecordFrom(marketplaceQuery.data);
  const financial = reportRecordFrom(financialQuery.data);
  const sellers = listFrom(sellersQuery.data).slice(0, 5);
  const soldAuctions = listFrom(soldQuery.data).slice(0, 5);
  const metrics = [
    {
      icon: UsersRound,
      label: copy.totalUsers,
      value: numberValue(userStats, ["allUsersCount", "totalUsers", "count"]),
      detail: `${copy.activeUsers}: ${formatNumber(numberValue(userStats, ["activeUsersCount", "activeUsers"]), currentLang)}`,
      tone: "info" as const,
      link:"/admin/users"
    },
    {
      icon: Gavel,
      label: copy.totalLots,
      value: numberValue(lotStats, ["allLotsCount", "totalLots", "count", "lotCount.allLotsCount", "lotCount.totalLots", "lotCount.count"]),
      detail: `${copy.activeLots}: ${formatNumber(numberValue(lotStats, ["activeLotsCount", "activeLots", "lotCount.activeLotsCount", "lotCount.activeLots"]), currentLang)}`,
      tone: "success" as const,
      link:"/admin/auctions"

    },
    {
      icon: ShieldCheck,
      label: copy.pendingLots,
      value: numberValue(lotStats, ["pendingLotsCount", "pendingLots", "notApprovedLotsCount", "lotCount.pendingLotsCount", "lotCount.pendingLots", "lotCount.notApprovedLotsCount"]),
      detail: `${copy.finishedLots}: ${formatNumber(numberValue(lotStats, ["finishedLotsCount", "finishedLots", "lotCount.finishedLotsCount", "lotCount.finishedLots"]), currentLang)}`,
      tone: "warning" as const,
      link:"/admin/moderation"
      
    },
    {
      icon: CircleDollarSign,
      label: copy.turnover,
      value: numberValue(transactionStats, ["allTransactionAmount", "allTransactionSum", "totalAmount", "allTransactionCount"]),
      detail: `${copy.transactionCount}: ${formatNumber(numberValue(transactionStats, ["transactionCount", "transactionsCount", "count"]), currentLang)}`,
      tone: "neutral" as const,
      suffix: confirmedCurrency(transactionStats),
    },
    {
      icon: BadgeDollarSign,
      label: reportCopy.soldGross,
      value: numberValue(marketplace, ["soldGrossAmount"]),
      detail: `${reportCopy.avgSale}: ${formatNumber(numberValue(marketplace, ["averageSoldPrice"]), currentLang)}`,
      tone: "success" as const,
      suffix: "UZS",
    },
    {
      icon: Gavel,
      label: reportCopy.totalBids,
      value: numberValue(marketplace, ["totalBids"]),
      detail: `${reportCopy.uniqueBidders}: ${formatNumber(numberValue(marketplace, ["uniqueBidders"]), currentLang)}`,
      tone: "info" as const,
    },
    {
      icon: ShieldCheck,
      label: reportCopy.conversion,
      value: numberValue(marketplace, ["auctionConversionRatePercent"]),
      detail: `${reportCopy.auctionsWithBids}: ${formatNumber(numberValue(marketplace, ["auctionsWithBids"]), currentLang)}`,
      tone: "warning" as const,
      suffix: "%",
    },
    {
      icon: CircleDollarSign,
      label: reportCopy.platformFees,
      value: numberValue(financial, ["platformFeesCollected"]),
      detail: `${reportCopy.paymentCount}: ${formatNumber(numberValue(financial, ["paymentCount"]), currentLang)}`,
      tone: "neutral" as const,
      suffix: "UZS",
    },
  ];
  const queries = [userQuery, lotQuery, transactionQuery, marketplaceQuery, financialQuery, sellersQuery, soldQuery];
  const hasMetric = metrics.some((metric) => metric.value !== null);
  const heroMetrics = metrics.slice(0, 4);
  const reportMetrics = metrics.slice(4);
  const heroStyles = [
    "border-brand-navy-900 bg-brand-navy-900 text-white",
    "border-emerald-200 bg-emerald-50 text-brand-navy-900",
    "border-amber-200 bg-amber-50 text-brand-navy-900",
    "border-brand-champagne-500/70 bg-[linear-gradient(135deg,#fffaf0_0%,#efe8dd_100%)] text-brand-navy-900",
  ];
  const reportStyles = [
    "border-l-4 border-l-emerald-500",
    "border-l-4 border-l-sky-500",
    "border-l-4 border-l-amber-500",
    "border-l-4 border-l-brand-gold-text",
  ];
  const marketBars = [
    { label: copy.finishedLots, value: numberValue(marketplace, ["soldAuctions"]) ?? 0 },
    { label: reportCopy.auctionsWithBids, value: numberValue(marketplace, ["auctionsWithBids"]) ?? 0 },
    { label: reportCopy.totalBids, value: numberValue(marketplace, ["totalBids"]) ?? 0 },
    { label: reportCopy.uniqueBidders, value: numberValue(marketplace, ["uniqueBidders"]) ?? 0 },
  ];
  const maxMarketBar = Math.max(...marketBars.map((bar) => bar.value), 1);
  if (!hasMetric) {
    const state: QueryState = {
      isLoading: queries.some(queryLoading),
      isError: queries.every((query) => Boolean(query.isError || query.error)),
    };
    return <QueryStatePanel query={state} />;
  }
  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-text-secondary">{reportCopy.reportsIntro}</p>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <Surface className="overflow-hidden shadow-lg" padding="none" tone="navy">
          <div className="relative p-6">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-champagne-500/20" />
            <div className="absolute -bottom-16 right-16 h-36 w-36 rounded-full border border-white/10" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-champagne-500">{heroMetrics[3]?.label}</p>
                <p className="mt-3 text-2xl sm:text-4xl xl:text-5xl font-black leading-tight tabular-nums text-white break-words">
                  {formatNumber(heroMetrics[3]?.value ?? 0, currentLang, heroMetrics[3]?.suffix)}
                </p>
                <p className="mt-4 max-w-md text-sm font-bold text-white/70">{heroMetrics[3]?.detail}</p>
              </div>
              <span className="relative rounded-2xl bg-white/10 p-4 text-brand-champagne-500">
                <CircleDollarSign aria-hidden="true" size={34} />
              </span>
            </div>
            <div className="relative mt-10 grid h-44 grid-cols-4 items-end gap-4 border-b border-white/15 pb-6">
              {marketBars.map((bar) => (
                <div className="flex h-full flex-col justify-end gap-3" key={bar.label}>
                  <div
                    className="min-h-6 rounded-t-xl bg-white/35"
                    style={{ height: `${Math.max(18, (bar.value / maxMarketBar) * 100)}%` }}
                  />
                  <div>
                    <p className="text-center text-lg font-black tabular-nums text-white">{formatNumber(bar.value, currentLang)}</p>
                    <p className="mt-1 truncate text-center text-[11px] font-bold text-white/55">{bar.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Surface>
       <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
  {heroMetrics.slice(0, 3).map(
    ({ detail, icon: Icon, label, suffix, value, link }, index) => {
      const content = (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-text-secondary">
                {label}
              </p>

              <AnimatedNumber
                className="mt-2 block tabular-nums text-brand-navy-900"
                duration={3}
                end={value ?? 0}
                separator=" "
                suffix={suffix ? ` ${suffix}` : ""}
                sx={{
                  fontSize: 32,
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
                variant="h4"
              />
            </div>

            <span className="rounded-xl bg-white/70 p-2.5 text-brand-gold-text shadow-sm">
              <Icon aria-hidden="true" size={22} />
            </span>
          </div>

          <p className="mt-3 text-xs font-bold text-text-secondary">
            {detail}
          </p>
        </>
      );

      return (
        <Surface
          className={`shadow-sm ${heroStyles[index + 1]}`}
          key={label}
        >
          {link ? (
            <Link href={link} className="block">
              {content}
            </Link>
          ) : (
            content
          )}
        </Surface>
      );
    },
  )}
</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {reportMetrics.map(({ detail, icon: Icon, label, suffix, tone, value }, index) => (
          <Surface className={`bg-white/80 p-4 shadow-sm ${reportStyles[index] ?? ""}`} key={label}>
            <div className="flex items-start gap-3">
              <span className="rounded-lg bg-brand-champagne-500/20 p-2 text-brand-gold-text">
                <Icon aria-hidden="true" size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-text-secondary">{label}</p>
                <AnimatedNumber
                  className="mt-2 block tabular-nums text-brand-navy-900"
                  duration={3}
                  end={value ?? 0}
                  separator=" "
                  suffix={suffix ? ` ${suffix}` : ""}
                  sx={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}
                  variant="h4"
                />
                <StatusBadge className="mt-3" tone={tone}>{detail}</StatusBadge>
              </div>
            </div>
          </Surface>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Surface className="shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-gold-text">{reportCopy.marketplace}</p>
              <h3 className="mt-2 text-xl font-black text-brand-navy-900">{reportCopy.soldAuctions}</h3>
            </div>
            <StatusBadge tone="success">{formatNumber(numberValue(marketplace, ["soldAuctions"]), currentLang)} / {formatNumber(numberValue(marketplace, ["totalAuctions"]), currentLang)}</StatusBadge>
          </div>
          <div className="mt-4 divide-y divide-border-default">
            {soldAuctions.length ? soldAuctions.map((record) => (
              <div className="grid gap-3 py-3 text-sm md:grid-cols-[1fr_auto]" key={textValue(record, ["auctionId", "vehicleId"])}>
                <div>
                  <p className="font-black text-brand-navy-900">#{textValue(record, ["auctionId"])} · {textValue(record, ["sellerName"], copy.unknown)} → {textValue(record, ["winnerName"], copy.unknown)}</p>
                  <p className="mt-1 text-text-secondary">{formatDate(textValue(record, ["endTime"]), currentLang)} · {translateBackendEnum(textValue(record, ["dealStatus"]), currentLang, copy.noValue)}</p>
                </div>
                <p className="font-black text-brand-navy-900">{formatNumber(numberValue(record, ["soldPrice"]), currentLang, textValue(record, ["currency"], "UZS"))}</p>
              </div>
            )) : <p className="mt-4 text-sm text-text-secondary">{copy.emptyBody}</p>}
          </div>
        </Surface>
        <Surface className="shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-gold-text">{reportCopy.sellers}</p>
          <div className="mt-4 space-y-3">
            {sellers.length ? sellers.map((seller, index) => (
              <div className="rounded-md border border-border-default bg-surface-muted/35 p-3" key={textValue(seller, ["sellerId"], String(index))}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-brand-navy-900">{index + 1}. {textValue(seller, ["sellerName"], copy.unknown)}</p>
                    <p className="mt-1 text-xs text-text-secondary">{textValue(seller, ["email"], copy.noValue)}</p>
                  </div>
                  <StatusBadge tone="info">{formatNumber(numberValue(seller, ["conversionRatePercent"]), currentLang)}%</StatusBadge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <span className="rounded bg-white px-2 py-1 font-bold text-text-secondary">{reportCopy.totalAuctions}: {formatNumber(numberValue(seller, ["listedAuctions"]), currentLang)}</span>
                  <span className="rounded bg-white px-2 py-1 font-bold text-text-secondary">{reportCopy.soldAuctions}: {formatNumber(numberValue(seller, ["soldAuctions"]), currentLang)}</span>
                  <span className="rounded bg-white px-2 py-1 font-bold text-text-secondary">{reportCopy.soldGross}: {formatNumber(numberValue(seller, ["soldGrossAmount"]), currentLang)}</span>
                </div>
              </div>
            )) : <p className="text-sm text-text-secondary">{copy.emptyBody}</p>}
          </div>
        </Surface>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [reportCopy.deposits, numberValue(financial, ["depositsCollected"]), "UZS"],
          [reportCopy.finalPayments, numberValue(financial, ["finalPaymentsCollected"]), "UZS"],
          [reportCopy.refunds, numberValue(financial, ["refundsPaid"]), "UZS"],
        ].map(([label, value, suffix]) => (
          <Surface className="bg-surface-muted/35 shadow-sm" key={String(label)}>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-text-secondary">{label}</p>
            <p className="mt-2 text-2xl font-black text-brand-navy-900">{formatNumber(value as number | null, currentLang, String(suffix))}</p>
          </Surface>
        ))}
      </div>
    </div>
  );
}

function UsersWorkspace() {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["allUsers", page, pageSize],
    queryFn: async () => {
      const response = await api.get("/user/getAllUsers", {
        params: { page, size: pageSize },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  }) as QueryState;

  const queryData = asRecord(query.data);
  const metaData = asRecord(queryData.meta);
  const totalPages = numberValue(metaData, ["pages"]) ?? 1;
  const records = useMemo(() => listFrom(query.data), [query.data]);
  const [userStatusFilter, setUserStatusFilter] = useState("");
  const userStatusOptions = useMemo(() => [
    { count: records.filter((record) => userAccountFilterValue(record) === "ACTIVE").length, value: "ACTIVE" },
    { count: records.filter((record) => userAccountFilterValue(record) === "INACTIVE").length, value: "INACTIVE" },
  ], [records]);
  const visibleRecords = useMemo(
    () => userStatusFilter ? records.filter((record) => userAccountFilterValue(record) === userStatusFilter) : records,
    [records, userStatusFilter],
  );
  const blockUser = useBlockUserMutation() as MutationState;
  const addBalance = useAddBalance() as MutationState;
  const createNotice = useCreateNotif() as MutationState;
  const addRole = useAddRole() as MutationState;
  const deleteRole = useDeleteRole() as MutationState;
  const rows = useMemo(() => userRows(visibleRecords, copy, currentLang), [copy, currentLang, visibleRecords]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [balance, setBalance] = useState("");
  const [notice, setNotice] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roleToRemove, setRoleToRemove] = useState<number | null>(null);
  const [accountDecisionOpen, setAccountDecisionOpen] = useState(false);
  const [accountReason, setAccountReason] = useState("");
  const [userTab, setUserTab] = useState<"roles" | "balance" | "notice" | "security">("roles");
  const [feedback, setFeedback] = useState<{ message: string; tone: StatusBadgeTone } | null>(null);
  const selectedIndex = rows.findIndex((row) => row.id === selectedId);
  const selectedRow = selectedIndex >= 0 ? rows[selectedIndex] : null;
  const selectedRecord = selectedIndex >= 0 ? visibleRecords[selectedIndex] : null;
  const selectedUserId = selectedRecord ? textValue(selectedRecord, ["id", "userId"]) : "";
  const userTabLabels = {
    uz: { roles: "Rollar", balance: "Balans", notice: "Bildirishnoma", security: "Xavfsizlik" },
    en: { roles: "Roles", balance: "Balance", notice: "Notification", security: "Security" },
    ru: { roles: "Роли", balance: "Баланс", notice: "Уведомление", security: "Безопасность" },
  }[currentLang];
  const selectedUserIdRef = useRef(selectedUserId);
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);
  const roles = selectedRecord ? userRoles(selectedRecord) : [];
  const isActive = selectedRecord
    ? selectedRecord.isActive !== false && selectedRecord.blocked !== true && selectedRecord.isBlocked !== true
    : false;
  const userOperationPending =
    mutationLoading(blockUser) ||
    mutationLoading(addBalance) ||
    mutationLoading(createNotice) ||
    mutationLoading(addRole) ||
    mutationLoading(deleteRole);
  const complete = () => {
    setFeedback({ message: copy.operationSuccess, tone: "success" });
    setRoleToRemove(null);
    setAccountDecisionOpen(false);
    setAccountReason("");
    void query.refetch?.();
  };
  const fail = () => setFeedback({ message: copy.operationError, tone: "danger" });
  const mutationOptionsFor = (
    requestUserId: string,
    afterSuccess?: () => void,
  ): MutationOptions => ({
    onError: () => {
      if (selectedUserIdRef.current === requestUserId) fail();
    },
    onSuccess: (response) => {
      if (selectedUserIdRef.current !== requestUserId) return;
      if (!isExplicitMutationSuccess(response, ["OK", "CREATED"])) {
        fail();
        return;
      }
      afterSuccess?.();
      complete();
    },
  });
  if (query.isError || query.error) return <QueryStatePanel query={query} />;
  return (
    <div>
      <OperationalTable
        actionsDisabled={userOperationPending}
        label={copy.usersTable}
        loading={queryLoading(query)}
        onOpen={(row) => {
          setSelectedId(row.id);
          setRoleToRemove(null);
          setAccountDecisionOpen(false);
          setAccountReason("");
          setUserTab("roles");
          setFeedback(null);
        }}
        rows={rows}
        toolbarControls={
          <AdminFilterBar
            label={filterLabels[currentLang].status}
            onChange={setUserStatusFilter}
            options={userStatusOptions}
            value={userStatusFilter}
          />
        }
      />
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <PageSizeSelect disabled={queryLoading(query)} value={pageSize} onChange={(size) => { setPageSize(size); setPage(0); }} />
        <button
          aria-label={copy.prevPage}
          className="rounded-md border border-border-default p-2 text-brand-navy-900 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          type="button"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold text-text-primary">
          {copy.page} {page + 1} / {totalPages}
        </span>
        <button
          aria-label={copy.nextPage}
          className="rounded-md border border-border-default p-2 text-brand-navy-900 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          type="button"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      {selectedRow && selectedRecord ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy-950/65 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !userOperationPending) {
              setSelectedId(null);
              setRoleToRemove(null);
              setAccountDecisionOpen(false);
              setAccountReason("");
            }
          }}
          role="presentation"
        >
        <Surface
          aria-modal="true"
          className="my-6 max-h-[calc(100dvh-3rem)] w-full max-w-4xl overflow-y-auto shadow-2xl"
          role="dialog"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-gold-text">{copy.details}</p>
              <h2 className="mt-2 text-xl font-black text-brand-navy-900">{selectedRow.primary}</h2>
              <p className="mt-2 text-sm text-text-secondary">{selectedRow.secondary}</p>
            </div>
            <button aria-label={copy.close} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default disabled:opacity-50" disabled={userOperationPending} onClick={() => setSelectedId(null)} type="button">
              <X aria-hidden="true" size={18} />
            </button>
          </div>
          <div className="mt-5 flex gap-6 overflow-x-auto border-y border-border-default pt-3" role="tablist">
            {(["roles", "balance", "notice", "security"] as const).map((tab) => <button aria-selected={userTab === tab} className={`-mb-px min-h-11 shrink-0 border-b-2 px-1 text-sm font-extrabold transition-colors ${userTab === tab ? "border-brand-navy-900 text-brand-navy-900" : "border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary"}`} key={tab} onClick={() => { setUserTab(tab); setRoleToRemove(null); setAccountDecisionOpen(false); }} role="tab" type="button">{userTabLabels[tab]}</button>)}
          </div>
          <div className="mt-5">
            <div className={userTab === "roles" ? "" : "hidden"} role="tabpanel">
              <p className="text-sm font-black text-brand-navy-900">{copy.roles}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {roles.length ? roles.map((role) => (
                  <button
                    className="inline-flex min-h-11 items-center rounded-full border border-border-default px-3 text-xs font-black text-brand-navy-900 hover:border-semantic-danger hover:text-semantic-danger disabled:opacity-50"
                    disabled={!role.id || userOperationPending}
                    key={`${role.id}-${role.name}`}
                    onClick={() => role.id && setRoleToRemove(role.id)}
                    title={copy.removeRole}
                    type="button"
                  >
                    {role.name} <X aria-hidden="true" className="ml-1" size={14} />
                  </button>
                )) : <span className="text-sm text-text-secondary">{copy.noValue}</span>}
              </div>
              {roleToRemove ? (
                <div className="mt-4 rounded-md border border-semantic-warning/35 bg-semantic-warning-surface p-4">
                  <p className="text-sm font-bold text-brand-navy-900">{copy.confirmRoleRemoval}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="min-h-11 rounded-md border border-border-default bg-white px-4 text-sm font-extrabold disabled:opacity-50" disabled={userOperationPending} onClick={() => setRoleToRemove(null)} type="button">{copy.cancel}</button>
                    <button className="min-h-11 rounded-md bg-semantic-danger px-4 text-sm font-extrabold text-white disabled:opacity-50" disabled={userOperationPending} onClick={() => deleteRole.mutate({ roleIds: roleToRemove, userId: selectedUserId }, mutationOptionsFor(selectedUserId))} type="button">{copy.confirm}</button>
                  </div>
                </div>
              ) : null}
              <div className="mt-4 flex items-center gap-2">
                <AppSelect
                  id="admin-role-select"
                  native={isTestEnv}
                  className="flex-1"
                  disabled={userOperationPending}
                  placeholder={copy.addRole}
                  value={roleId}
                  onChange={(val) => setRoleId(String(val))}
                  options={[
                    { value: "", label: copy.addRole },
                    ...roleOptions
                      .filter((option) => !roles.some((role) => role.name === option.name))
                      .map((opt) => ({ value: opt.id, label: opt.name })),
                  ]}
                />
                <button className="min-h-11 rounded-md bg-brand-navy-900 px-4 text-sm font-extrabold text-white disabled:opacity-50" disabled={!roleId || userOperationPending} onClick={() => addRole.mutate({ roleIds: Number(roleId), userId: selectedUserId }, mutationOptionsFor(selectedUserId, () => setRoleId("")))} type="button">{copy.addRole}</button>
              </div>
            </div>
            <div className="space-y-4">
              {userTab === "balance" ? <div className="flex gap-2" role="tabpanel">
                <label className="sr-only" htmlFor="admin-balance-input">{copy.amount}</label>
                <input id="admin-balance-input" className="min-h-11 min-w-0 flex-1 rounded-md border border-border-default px-3 text-sm" disabled={userOperationPending} min="1" onChange={(event) => setBalance(event.target.value)} placeholder={copy.amount} type="number" value={balance} />
                <button className="min-h-11 rounded-md border border-brand-navy-900 px-4 text-sm font-extrabold text-brand-navy-900 disabled:opacity-50" disabled={!balance || Number(balance) <= 0 || userOperationPending} onClick={() => addBalance.mutate({ balance: Number(balance), userId: selectedUserId }, mutationOptionsFor(selectedUserId, () => setBalance("")))} type="button">{copy.addBalance}</button>
              </div> : null}
              {userTab === "notice" ? <div className="flex gap-2" role="tabpanel">
                <label className="sr-only" htmlFor="admin-notice-input">{copy.notice}</label>
                <input id="admin-notice-input" className="min-h-11 min-w-0 flex-1 rounded-md border border-border-default px-3 text-sm" disabled={userOperationPending} onChange={(event) => setNotice(event.target.value)} placeholder={copy.notice} value={notice} />
                <button aria-label={copy.sendNotice} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-brand-navy-900 text-white disabled:opacity-50" disabled={!notice.trim() || userOperationPending} onClick={() => createNotice.mutate({ title: notice.trim(), userId: selectedUserId }, mutationOptionsFor(selectedUserId, () => setNotice("")))} type="button"><Send aria-hidden="true" size={17} /></button>
              </div> : null}
              {userTab === "security" ? <div role="tabpanel"><button className={`min-h-11 w-full rounded-md px-4 text-sm font-extrabold disabled:opacity-50 ${isActive ? "bg-semantic-danger text-white" : "bg-semantic-success text-white"}`} disabled={userOperationPending} onClick={() => setAccountDecisionOpen(true)} type="button">{isActive ? copy.blockAccount : copy.unblockAccount}</button>
              {accountDecisionOpen ? (
                <div className="rounded-md border border-semantic-warning/35 bg-semantic-warning-surface p-4">
                  <p className="text-sm font-bold text-brand-navy-900">{copy.confirmAccountChange}</p>
                  <label className="mt-3 block text-xs font-black uppercase tracking-[0.1em] text-text-secondary" htmlFor="admin-account-reason">{copy.reason}</label>
                  <textarea id="admin-account-reason" className="mt-2 min-h-24 w-full rounded-md border border-border-default bg-white p-3 text-sm" disabled={userOperationPending} onChange={(event) => setAccountReason(event.target.value)} value={accountReason} />
                  <p className="mt-2 text-xs leading-5 text-text-secondary">{copy.legacyReasonNote}</p>
                  {!accountReason.trim() ? <p className="mt-2 text-xs font-bold text-semantic-danger">{copy.reasonRequired}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="min-h-11 rounded-md border border-border-default bg-white px-4 text-sm font-extrabold disabled:opacity-50" disabled={userOperationPending} onClick={() => { setAccountDecisionOpen(false); setAccountReason(""); }} type="button">{copy.cancel}</button>
                    <button className="min-h-11 rounded-md bg-brand-navy-900 px-4 text-sm font-extrabold text-white disabled:opacity-50" disabled={!accountReason.trim() || userOperationPending} onClick={() => blockUser.mutate(selectedUserId, mutationOptionsFor(selectedUserId))} type="button">{copy.confirm}</button>
                  </div>
                </div>
              ) : null}</div> : null}
            </div>
          </div>
          {feedback ? <StatusBadge className="mt-5" tone={feedback.tone}>{feedback.message}</StatusBadge> : null}
        </Surface>
        </div>
      ) : null}
    </div>
  );
}

function ModerationWorkspace() {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  const query = useAllLotsNotApproved(0, 50) as QueryState;
  const approve = useApproveLotMutation() as MutationState;
  const decline = useDeclineLotMutation() as MutationState;
  const records = useMemo(() => listFrom(query.data), [query.data]);
  const [moderationStatusFilter, setModerationStatusFilter] = useState("");
  const moderationStatusOptions = useMemo(
    () => filterOptions(records, ["lotStatus", "status", "auctionStatus"]),
    [records],
  );
  const visibleRecords = useMemo(
    () => filteredBy(records, ["lotStatus", "status", "auctionStatus"], moderationStatusFilter),
    [moderationStatusFilter, records],
  );
  const rows = useMemo(() => lotRows(visibleRecords, copy, currentLang), [copy, currentLang, visibleRecords]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decision, setDecision] = useState<"approve" | "decline" | null>(null);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<{ message: string; tone: StatusBadgeTone } | null>(null);
  const selectedIndex = rows.findIndex((row) => row.id === selectedId);
  const selectedRow = selectedIndex >= 0 ? rows[selectedIndex] : null;
  const selectedRecord = selectedIndex >= 0 ? visibleRecords[selectedIndex] : null;
  const id = selectedRecord ? textValue(selectedRecord, ["id", "lotId"]) : "";
  const decisionPending = mutationLoading(approve) || mutationLoading(decline);
  const complete = () => {
    setFeedback({ message: copy.operationSuccess, tone: "success" });
    setSelectedId(null);
    setDecision(null);
    setReason("");
    void query.refetch?.();
  };
  const fail = () => setFeedback({ message: copy.operationError, tone: "danger" });
  const finish = (response: unknown) => {
    if (isExplicitMutationSuccess(response, ["OK", "CREATED"])) complete();
    else fail();
  };
  if (query.isError || query.error) return <QueryStatePanel query={query} />;
  return (
    <div>
      {feedback ? <StatusBadge className="mb-4" tone={feedback.tone}>{feedback.message}</StatusBadge> : null}
      <OperationalTable
        actionsDisabled={decisionPending}
        label={copy.moderationTable}
        loading={queryLoading(query)}
        onOpen={(row) => { setSelectedId(row.id); setDecision(null); setReason(""); }}
        rows={rows}
        toolbarControls={
          <AdminFilterBar
            label={filterLabels[currentLang].status}
            onChange={setModerationStatusFilter}
            options={moderationStatusOptions}
            value={moderationStatusFilter}
          />
        }
      />
      {selectedRow && selectedRecord ? (
        <Surface className="mt-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-gold-text">{copy.details}</p>
              <h2 className="mt-2 text-xl font-black text-brand-navy-900">{selectedRow.primary}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{textValue(selectedRecord, ["description"], selectedRow.secondary)}</p>
            </div>
            <button aria-label={copy.close} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default disabled:opacity-50" disabled={decisionPending} onClick={() => setSelectedId(null)} type="button"><X aria-hidden="true" size={18} /></button>
          </div>
          <div className="mt-5 flex flex-col gap-3 border-t border-border-default pt-5 sm:flex-row sm:items-center">
            <Link className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-default px-4 text-sm font-extrabold text-brand-navy-900" href={auctionDetailHref(id)}>{copy.openAuction}</Link>
            <button className="min-h-11 rounded-md bg-semantic-success px-5 text-sm font-extrabold text-white disabled:opacity-50" disabled={!id || decisionPending} onClick={() => { setDecision("approve"); setReason(""); }} type="button">{copy.approve}</button>
            <button className="min-h-11 rounded-md bg-semantic-danger px-5 text-sm font-extrabold text-white disabled:opacity-50" disabled={!id || decisionPending} onClick={() => { setDecision("decline"); setReason(""); }} type="button">{copy.decline}</button>
          </div>
          <AdminConfirmModal
            isOpen={Boolean(decision)}
            type={decision === "decline" ? "reject" : "approve"}
            title={decision === "approve" ? copy.confirmApprove : copy.confirmDecline}
            reason={reason}
            onReasonChange={setReason}
            reasonLabel={copy.reason}
            reasonPlaceholder=""
            cancelLabel={copy.cancel}
            confirmLabel={copy.confirm}
            pending={decisionPending}
            onConfirm={() => (decision === "approve" ? approve : decline).mutate(id, { onError: fail, onSuccess: finish })}
            onCancel={() => { setDecision(null); setReason(""); }}
          />
        </Surface>
      ) : null}
    </div>
  );
}

function VehiclesWorkspace() {
  return <AdminVehiclesWorkspace />;
}

function AuctionsWorkspace() {
  return <AdminAuctionsWorkspace />;
}

function FinanceWorkspace() {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState<"transactions" | "bids">("transactions");
  const [transactionPage, setTransactionPage] = useState(0);
  const [bidPage, setBidPage] = useState(0);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
  const [bidStatusFilter, setBidStatusFilter] = useState("");
  const transactions = useAllTransactions(0, 100) as QueryState;
  const bids = useAllBids(0, 100) as QueryState;
  const transactionRecords = useMemo(() => listFrom(transactions.data), [transactions.data]);
  const bidRecords = useMemo(() => listFrom(bids.data), [bids.data]);
  const transactionTypeOptions = useMemo(
    () => filterOptions(transactionRecords, ["type", "transactionType", "title"]),
    [transactionRecords],
  );
  const bidStatusOptions = useMemo(
    () => filterOptions(bidRecords, ["bidStatus", "status"]),
    [bidRecords],
  );
  const visibleTransactionRecords = useMemo(
    () => filteredBy(transactionRecords, ["type", "transactionType", "title"], transactionTypeFilter),
    [transactionRecords, transactionTypeFilter],
  );
  const visibleBidRecords = useMemo(
    () => filteredBy(bidRecords, ["bidStatus", "status"], bidStatusFilter),
    [bidRecords, bidStatusFilter],
  );
  const transactionData = useMemo(() => transactionRows(visibleTransactionRecords, copy, currentLang), [copy, currentLang, visibleTransactionRecords]);
  const bidData = useMemo(() => bidRows(visibleBidRecords, copy, currentLang), [visibleBidRecords, copy, currentLang]);
  const transactionPages = Math.max(1, Math.ceil(transactionData.length / pageSize));
  const bidPages = Math.max(1, Math.ceil(bidData.length / pageSize));
  const pagedTransactions = useMemo(
    () => transactionData.slice(transactionPage * pageSize, (transactionPage + 1) * pageSize),
    [pageSize, transactionData, transactionPage],
  );
  const pagedBids = useMemo(
    () => bidData.slice(bidPage * pageSize, (bidPage + 1) * pageSize),
    [bidData, bidPage, pageSize],
  );
  const currentRows = activeTab === "transactions" ? pagedTransactions : pagedBids;
  const currentQuery = activeTab === "transactions" ? transactions : bids;
  const currentLabel = activeTab === "transactions" ? copy.transactionsTable : copy.bidsTable;
  const currentPage = activeTab === "transactions" ? transactionPage : bidPage;
  const currentPages = activeTab === "transactions" ? transactionPages : bidPages;
  const setCurrentPage = activeTab === "transactions" ? setTransactionPage : setBidPage;

  return (
    <div className="space-y-6">
      <div className="flex gap-6 border-b border-border-default" role="tablist">
        <button
          aria-selected={activeTab === "transactions"}
          className={`-mb-px min-h-11 border-b-2 px-1 text-sm font-extrabold transition-colors ${
            activeTab === "transactions"
              ? "border-brand-navy-900 text-brand-navy-900"
              : "border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary"
          }`}
          onClick={() => setActiveTab("transactions")}
          role="tab"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <BadgeDollarSign aria-hidden="true" size={18} />
            {copy.transactions}
          </span>
        </button>
        <button
          aria-selected={activeTab === "bids"}
          className={`-mb-px min-h-11 border-b-2 px-1 text-sm font-extrabold transition-colors ${
            activeTab === "bids"
              ? "border-brand-navy-900 text-brand-navy-900"
              : "border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary"
          }`}
          onClick={() => setActiveTab("bids")}
          role="tab"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Gavel aria-hidden="true" size={18} />
            {copy.bids}
          </span>
        </button>
      </div>

      <div role="tabpanel">
        <ConnectedTable
          label={currentLabel}
          query={currentQuery}
          rows={currentRows}
          toolbarControls={activeTab === "transactions" ? (
            <AdminFilterBar
              label={filterLabels[currentLang].type}
              onChange={(value) => {
                setTransactionTypeFilter(value);
                setTransactionPage(0);
              }}
              options={transactionTypeOptions}
              value={transactionTypeFilter}
            />
          ) : (
            <AdminFilterBar
              label={filterLabels[currentLang].status}
              onChange={(value) => {
                setBidStatusFilter(value);
                setBidPage(0);
              }}
              options={bidStatusOptions}
              value={bidStatusFilter}
            />
          )}
        />
        {!queryLoading(currentQuery) && currentRows.length ? (
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            <PageSizeSelect disabled={queryLoading(currentQuery)} value={pageSize} onChange={(size) => { setPageSize(size); setTransactionPage(0); setBidPage(0); }} />
            <button
              aria-label={copy.prevPage}
              className="rounded-md border border-border-default p-2 text-brand-navy-900 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
              type="button"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-text-primary">
              {copy.page} {currentPage + 1} / {currentPages}
            </span>
            <button
              aria-label={copy.nextPage}
              className="rounded-md border border-border-default p-2 text-brand-navy-900 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage + 1 >= currentPages}
              onClick={() => setCurrentPage((page) => Math.min(currentPages - 1, page + 1))}
              type="button"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type LocalizedNames = { en: string; ru: string; uz: string };
type ReferenceMode = "types" | "subtypes" | "attributes" | "banners";

function LocalizedNameFields({
  copy,
  disabled = false,
  names,
  onChange,
}: {
  copy: WorkspaceCopy;
  disabled?: boolean;
  names: LocalizedNames;
  onChange: (names: LocalizedNames) => void;
}) {
  const fields = [
    ["uz", copy.nameUz],
    ["en", copy.nameEn],
    ["ru", copy.nameRu],
  ] as const;
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {fields.map(([key, label]) => (
        <label className="block text-xs font-black uppercase tracking-[0.08em] text-text-secondary" key={key}>
          {label}
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-border-default bg-white px-3 text-sm font-medium normal-case tracking-normal text-text-primary"
            disabled={disabled}
            onChange={(event) => onChange({ ...names, [key]: event.target.value })}
            value={names[key]}
          />
        </label>
      ))}
    </div>
  );
}

function ReferenceWorkspace() {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  const typeQuery = useLotTypes(0, 50) as QueryState;
  const subtypeQuery = useSub() as QueryState;
  const attributeQuery = useAttr() as QueryState;
  const bannerQuery = useBanner() as QueryState;
  const [mode, setMode] = useState<ReferenceMode>("types");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [selectedSubtypeId, setSelectedSubtypeId] = useState<string>("");
  const [attributeToTie, setAttributeToTie] = useState<string>("");
  const [selectedOptionRow, setSelectedOptionRow] = useState<OperationalRow | null>(null);
  const optionQuery = useAttrOptions(selectedAttributeId || null) as QueryState;
  const attachedAttributeQuery = useAttrBySubtype(selectedSubtypeId || null) as QueryState;
  const untiedAttributeQuery = useUntiedAttr(selectedSubtypeId || null) as QueryState;
  const createType = useCreateLotTypeMutation() as MutationState;
  const updateType = useUpdateLotTypeMutation() as MutationState;
  const deleteType = useDeleteLotTypeMutation() as MutationState;
  const createSubtype = useCreateSubType() as MutationState;
  const updateSubtype = useUpdateSubTypeMutation() as MutationState;
  const deleteSubtype = useDeleteSub() as MutationState;
  const createAttribute = useCreateLotAttribute() as MutationState;
  const deleteAttribute = useDeleteAttr() as MutationState;
  const createOption = useCreateAttrOption() as MutationState;
  const tieAttribute = useTieAttribute() as MutationState;
  const addBanner = useAddBannerMutation() as MutationState;
  const deleteBanner = useDeleteBannerMutation() as MutationState;
  const referencePending = [
    createType,
    updateType,
    deleteType,
    createSubtype,
    updateSubtype,
    deleteSubtype,
    createAttribute,
    deleteAttribute,
    createOption,
    tieAttribute,
    addBanner,
    deleteBanner,
  ].some(mutationLoading);
  const [names, setNames] = useState<LocalizedNames>({ en: "", ru: "", uz: "" });
  const [optionNames, setOptionNames] = useState<LocalizedNames>({ en: "", ru: "", uz: "" });
  const [lotTypeId, setLotTypeId] = useState("");
  const [valueType, setValueType] = useState("STRING");
  const [selectable, setSelectable] = useState(false);
  const [typeImage, setTypeImage] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [bannerLotId, setBannerLotId] = useState("");
  const [bannerExpiry, setBannerExpiry] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [referenceNow] = useState(() => Date.now());
  const [feedback, setFeedback] = useState<{ message: string; tone: StatusBadgeTone } | null>(null);
  const [referenceFilter, setReferenceFilter] = useState("");

  const typeRecords = useMemo(() => listFrom(typeQuery.data), [typeQuery.data]);
  const subtypeRecords = useMemo(() => listFrom(subtypeQuery.data), [subtypeQuery.data]);
  const attributeRecords = useMemo(() => listFrom(attributeQuery.data), [attributeQuery.data]);
  const bannerRecords = useMemo(() => listFrom(bannerQuery.data), [bannerQuery.data]);
  const optionRecords = useMemo(() => listFrom(optionQuery.data), [optionQuery.data]);
  const attachedAttributeRecords = useMemo(
    () => listFrom(attachedAttributeQuery.data),
    [attachedAttributeQuery.data],
  );
  const untiedAttributeRecords = useMemo(
    () => listFrom(untiedAttributeQuery.data),
    [untiedAttributeQuery.data],
  );
  const activeRecords =
    mode === "types"
      ? typeRecords
      : mode === "subtypes"
        ? subtypeRecords
        : mode === "attributes"
          ? attributeRecords
          : bannerRecords;
  const activeFilterPaths =
    mode === "attributes"
      ? ["valueType", "type"]
      : mode === "banners"
        ? ["bannerStatus", "status"]
        : mode === "subtypes"
          ? ["lotTypeId", "lotType.id", "lotType.name"]
          : ["status", "type"];
  const activeFilterLabel =
    mode === "attributes" || mode === "subtypes" ? filterLabels[currentLang].type : filterLabels[currentLang].status;
  const activeFilterOptions = useMemo(
    () => filterOptions(activeRecords, activeFilterPaths),
    [activeRecords, activeFilterPaths],
  );
  const visibleActiveRecords = useMemo(
    () => filteredBy(activeRecords, activeFilterPaths, referenceFilter),
    [activeFilterPaths, activeRecords, referenceFilter],
  );
  const activeQuery =
    mode === "types"
      ? typeQuery
      : mode === "subtypes"
        ? subtypeQuery
        : mode === "attributes"
          ? attributeQuery
          : bannerQuery;
  const activeRows = useMemo(() => {
    if (mode !== "banners") return referenceRows(visibleActiveRecords, copy, currentLang);
    return visibleActiveRecords.map((record, index) => {
      const id = recordId(record, index);
      const lotId = textValue(record, ["lotDto.id", "lotId"]);
      const rawStatus = textValue(record, ["bannerStatus", "status"]);
      const expiryValue = record.expiresDate ?? record.expiresAt;
      const expiry =
        typeof expiryValue === "string" || typeof expiryValue === "number"
          ? new Date(expiryValue).getTime()
          : Number.NaN;
      const [status, tone] = rawStatus
        ? statusDetails(rawStatus, copy, currentLang)
        : Number.isFinite(expiry)
          ? expiry <= referenceNow
            ? [copy.expired, "neutral" as const]
            : [copy.active, "success" as const]
          : [copy.unknown, "neutral" as const];
      return {
        id: `#${id}`,
        primary: textValue(record, ["lotDto.title", "title"], `${copy.banners} #${id}`),
        secondary: formatDate(record.expiresDate ?? record.expiresAt, currentLang) || copy.noValue,
        value: lotId ? `${copy.lotId}: ${lotId}` : copy.noValue,
        status,
        tone,
      };
    });
  }, [copy, currentLang, mode, referenceNow, visibleActiveRecords]);
  const selectedIndex = activeRows.findIndex((row) => row.id === selectedId);
  const selectedRow = selectedIndex >= 0 ? activeRows[selectedIndex] : null;
  const selectedRecord = selectedIndex >= 0 ? visibleActiveRecords[selectedIndex] : null;

  const resetEditor = () => {
    setNames({ en: "", ru: "", uz: "" });
    setLotTypeId("");
    setValueType("STRING");
    setSelectable(false);
    setTypeImage(null);
    setEditing(false);
  };
  const succeed = () => {
    setFeedback({ message: copy.operationSuccess, tone: "success" });
    setDeletePending(false);
    setSelectedId(null);
    resetEditor();
    void activeQuery.refetch?.();
  };
  const fail = () => setFeedback({ message: copy.operationError, tone: "danger" });
  const mutationOptions: MutationOptions = {
    onError: fail,
    onSuccess: (response) => {
      if (isExplicitMutationSuccess(response, ["OK", "CREATED"])) succeed();
      else fail();
    },
  };
  const tieMutationOptions: MutationOptions = {
    onError: fail,
    onSuccess: (response) => {
      if (!isExplicitMutationSuccess(response, ["OK"])) {
        fail();
        return;
      }
      setAttributeToTie("");
      setFeedback({ message: copy.operationSuccess, tone: "success" });
      void attachedAttributeQuery.refetch?.();
      void untiedAttributeQuery.refetch?.();
    },
  };
  const namesComplete = Boolean(names.uz.trim() && names.en.trim() && names.ru.trim());
  const optionNamesComplete = Boolean(optionNames.uz.trim() && optionNames.en.trim() && optionNames.ru.trim());

  const beginEdit = () => {
    if (!selectedRecord || (mode !== "types" && mode !== "subtypes")) return;
    setNames(localizedNameParts(selectedRecord));
    setLotTypeId(textValue(selectedRecord, ["lotTypeId", "lotType.id"]));
    setEditing(true);
  };
  const saveReference = () => {
    if (!namesComplete) return;
    const id = selectedRecord ? textValue(selectedRecord, ["id"]) : "";
    if (mode === "types") {
      const payload = { id, image: typeImage, name: JSON.stringify(names) };
      (editing ? updateType : createType).mutate(payload, mutationOptions);
    } else if (mode === "subtypes" && lotTypeId) {
      const payload = { id, lotTypeId: Number(lotTypeId), name: names };
      (editing ? updateSubtype : createSubtype).mutate(payload, mutationOptions);
    } else if (mode === "attributes") {
      createAttribute.mutate(
        { isSelectable: selectable, name: names, valueType },
        mutationOptions,
      );
    }
  };
  const confirmDelete = () => {
    if (!selectedRecord) return;
    const id = textValue(selectedRecord, ["id"]);
    if (mode === "types") deleteType.mutate(id, mutationOptions);
    if (mode === "subtypes") deleteSubtype.mutate(id, mutationOptions);
    if (mode === "attributes") deleteAttribute.mutate(id, mutationOptions);
    if (mode === "banners") {
      const lotId = textValue(selectedRecord, ["lotDto.id", "lotId", "id"]);
      deleteBanner.mutate(lotId, mutationOptions);
    }
  };
  const tabs: Array<[ReferenceMode, string]> = [
    ["types", copy.lotTypes],
    ["subtypes", copy.subtypes],
    ["attributes", copy.attributes],
    ["banners", copy.banners],
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-text-secondary">{copy.managementIntro}</p>
      <div aria-label={copy.referenceTable} className="flex flex-wrap gap-2" role="tablist">
        {tabs.map(([value, label]) => (
          <button
            aria-selected={mode === value}
            className={`min-h-11 rounded-full px-4 text-sm font-extrabold ${mode === value ? "bg-brand-navy-900 text-white" : "border border-border-default bg-white text-text-secondary"}`}
            disabled={referencePending}
            key={value}
            onClick={() => {
              setMode(value);
              setSelectedId(null);
              setDeletePending(false);
              setSelectedAttributeId("");
              setSelectedSubtypeId("");
              setAttributeToTie("");
              setSelectedOptionRow(null);
              setReferenceFilter("");
              setFeedback(null);
              resetEditor();
            }}
            role="tab"
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {!activeQuery.isError && !activeQuery.error ? (
        <OperationalTable
          actionsDisabled={referencePending}
          label={tabs.find(([value]) => value === mode)?.[1] ?? copy.referenceTable}
          loading={queryLoading(activeQuery)}
          onOpen={(row) => {
            setSelectedId(row.id);
            setDeletePending(false);
            setEditing(false);
            if (mode === "attributes") {
              const index = activeRows.findIndex((item) => item.id === row.id);
              setSelectedAttributeId(index >= 0 ? textValue(visibleActiveRecords[index], ["id"]) : "");
            }
            if (mode === "subtypes") {
              const index = activeRows.findIndex((item) => item.id === row.id);
              setSelectedSubtypeId(index >= 0 ? textValue(visibleActiveRecords[index], ["id"]) : "");
              setAttributeToTie("");
            }
          }}
          rows={activeRows}
          toolbarControls={
            <AdminFilterBar
              label={activeFilterLabel}
              onChange={setReferenceFilter}
              options={activeFilterOptions}
              value={referenceFilter}
            />
          }
        />
      ) : (
        <QueryStatePanel query={activeQuery} />
      )}

      {selectedRow && selectedRecord ? (
        <Surface className="shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-gold-text">{copy.details}</p>
              <h2 className="mt-2 text-xl font-black text-brand-navy-900">{selectedRow.primary}</h2>
              <p className="mt-2 text-sm text-text-secondary">{selectedRow.secondary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(mode === "types" || mode === "subtypes") ? <button className="min-h-11 rounded-md border border-border-default px-4 text-sm font-extrabold disabled:opacity-50" disabled={referencePending} onClick={beginEdit} type="button">{copy.update}</button> : null}
              <button className="min-h-11 rounded-md bg-semantic-danger px-4 text-sm font-extrabold text-white disabled:opacity-50" disabled={referencePending} onClick={() => setDeletePending(true)} type="button">{copy.delete}</button>
              <button aria-label={copy.close} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default disabled:opacity-50" disabled={referencePending} onClick={() => { setSelectedId(null); setSelectedSubtypeId(""); setAttributeToTie(""); }} type="button"><X aria-hidden="true" size={18} /></button>
            </div>
          </div>
          {deletePending ? (
            <div className="mt-4 rounded-md border border-semantic-warning/35 bg-semantic-warning-surface p-4">
              <p className="text-sm font-bold">{copy.confirmDelete}</p>
              <div className="mt-3 flex gap-2">
                <button className="min-h-11 rounded-md border border-border-default bg-white px-4 text-sm font-extrabold disabled:opacity-50" disabled={referencePending} onClick={() => setDeletePending(false)} type="button">{copy.cancel}</button>
                <button className="min-h-11 rounded-md bg-semantic-danger px-4 text-sm font-extrabold text-white disabled:opacity-50" disabled={referencePending} onClick={confirmDelete} type="button">{copy.confirm}</button>
              </div>
            </div>
          ) : null}
        </Surface>
      ) : null}

      {mode === "subtypes" && selectedSubtypeId ? (
        <Surface className="shadow-sm">
          <h2 className="text-xl font-black text-brand-navy-900">{copy.attachedAttributes}</h2>
          {attachedAttributeRecords.length ? (
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {attachedAttributeRecords.map((record, index) => {
                const attributeId = recordId(record, index);
                return (
                  <li className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-border-default bg-white px-3" key={attributeId}>
                    <span className="text-sm font-bold text-text-primary">{localizedRecordName(record, currentLang) || `#${attributeId}`}</span>
                    <button
                      className="min-h-10 rounded-md border border-semantic-danger px-3 text-xs font-extrabold text-semantic-danger disabled:opacity-50"
                      disabled={referencePending}
                      onClick={() => tieAttribute.mutate({ attributeId, subTypeId: selectedSubtypeId }, tieMutationOptions)}
                      type="button"
                    >
                      {copy.detachAttribute}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <QueryStatePanel query={attachedAttributeQuery} />
          )}
          <div className="mt-5 border-t border-border-default pt-5">
            <label className="block text-xs font-black uppercase tracking-[0.08em] text-text-secondary" htmlFor="admin-attribute-to-tie">{copy.availableAttributes}</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <AppSelect
                id="admin-attribute-to-tie"
                native={isTestEnv}
                className="flex-1 min-w-0"
                disabled={referencePending}
                value={attributeToTie}
                onChange={(val) => setAttributeToTie(String(val))}
                options={[
                  { value: "", label: copy.choose },
                  ...untiedAttributeRecords.map((record, index) => {
                    const attributeId = recordId(record, index);
                    return {
                      value: attributeId,
                      label: localizedRecordName(record, currentLang) || `#${attributeId}`,
                    };
                  }),
                ]}
              />
              <button
                className="min-h-11 rounded-md bg-brand-navy-900 px-5 text-sm font-extrabold text-white disabled:opacity-50"
                disabled={referencePending || !attributeToTie}
                onClick={() => tieAttribute.mutate({ attributeId: attributeToTie, subTypeId: selectedSubtypeId }, tieMutationOptions)}
                type="button"
              >
                {copy.attachAttribute}
              </button>
            </div>
          </div>
        </Surface>
      ) : null}

      {mode !== "banners" ? (
        <Surface className="shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-brand-navy-900">{editing ? copy.update : copy.create}</h2>
            {editing ? <button className="min-h-11 rounded-md border border-border-default px-4 text-sm font-extrabold disabled:opacity-50" disabled={referencePending} onClick={resetEditor} type="button">{copy.cancel}</button> : null}
          </div>
          <LocalizedNameFields copy={copy} disabled={referencePending} names={names} onChange={setNames} />
          {mode === "types" ? (
            <label className="mt-4 block text-xs font-black uppercase tracking-[0.08em] text-text-secondary">
              {copy.image}
              <input accept="image/*" className="mt-2 block min-h-11 w-full rounded-md border border-border-default bg-white p-2 text-sm" disabled={referencePending} onChange={(event) => setTypeImage(event.target.files?.[0] ?? null)} type="file" />
            </label>
          ) : null}
          {mode === "subtypes" ? (
            <div className="mt-4 block text-xs font-black uppercase tracking-[0.08em] text-text-secondary">
              {copy.lotType}
              <AppSelect
                className="mt-2"
                native={isTestEnv}
                disabled={referencePending}
                value={lotTypeId}
                onChange={(val) => setLotTypeId(String(val))}
                options={[
                  { value: "", label: copy.choose },
                  ...typeRecords.map((record, index) => ({
                    value: recordId(record, index),
                    label: localizedRecordName(record, currentLang) || recordId(record, index),
                  })),
                ]}
              />
            </div>
          ) : null}
          {mode === "attributes" ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="text-xs font-black uppercase tracking-[0.08em] text-text-secondary">{copy.valueType}<AppSelect className="mt-2" native={isTestEnv} disabled={referencePending} value={valueType} onChange={(val) => setValueType(String(val))} options={["STRING", "INTEGER", "BOOLEAN", "DATE", "DATETIME", "TIME"].map((value) => ({ value, label: value }))} /></div>
              <label className="flex min-h-11 items-center gap-3 self-end rounded-md border border-border-default bg-white px-4 text-sm font-bold"><input checked={selectable} disabled={referencePending} onChange={(event) => setSelectable(event.target.checked)} type="checkbox" /> {copy.selectable}</label>
            </div>
          ) : null}
          <button className="mt-5 min-h-11 rounded-md bg-brand-navy-900 px-5 text-sm font-extrabold text-white disabled:opacity-50" disabled={referencePending || !namesComplete || (mode === "subtypes" && !lotTypeId)} onClick={saveReference} type="button">{editing ? copy.save : copy.create}</button>
        </Surface>
      ) : (
        <Surface className="shadow-sm">
          <h2 className="text-xl font-black text-brand-navy-900">{copy.create} · {copy.banners}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-xs font-black uppercase tracking-[0.08em] text-text-secondary">{copy.lotId}<input className="mt-2 min-h-11 w-full rounded-md border border-border-default px-3 text-sm" disabled={referencePending} onChange={(event) => setBannerLotId(event.target.value)} value={bannerLotId} /></label>
            <label className="text-xs font-black uppercase tracking-[0.08em] text-text-secondary">{copy.expires}<input className="mt-2 min-h-11 w-full rounded-md border border-border-default px-3 text-sm" disabled={referencePending} onChange={(event) => setBannerExpiry(event.target.value)} type="datetime-local" value={bannerExpiry} /></label>
            <label className="text-xs font-black uppercase tracking-[0.08em] text-text-secondary md:col-span-2">{copy.image}<input accept="image/*" className="mt-2 block min-h-11 w-full rounded-md border border-border-default bg-white p-2 text-sm" disabled={referencePending} onChange={(event) => setBannerFile(event.target.files?.[0] ?? null)} type="file" /></label>
          </div>
          <button className="mt-5 min-h-11 rounded-md bg-brand-navy-900 px-5 text-sm font-extrabold text-white disabled:opacity-50" disabled={referencePending || !bannerLotId || !bannerExpiry || !bannerFile} onClick={() => bannerFile && addBanner.mutate({ banner: bannerFile, expiresDate: bannerExpiry, lotId: bannerLotId }, { onError: fail, onSuccess: (response) => { if (!isExplicitMutationSuccess(response, ["OK", "CREATED"])) { fail(); return; } setBannerLotId(""); setBannerExpiry(""); setBannerFile(null); succeed(); } })} type="button">{copy.create}</button>
        </Surface>
      )}

      {mode === "attributes" && selectedAttributeId ? (
        <Surface className="shadow-sm">
          <h2 className="text-xl font-black text-brand-navy-900">{copy.options}</h2>
          {optionRecords.length || queryLoading(optionQuery) ? <OperationalTable actionsDisabled={referencePending} label={copy.options} loading={queryLoading(optionQuery)} onOpen={setSelectedOptionRow} rows={referenceRows(optionRecords, copy, currentLang)} /> : <QueryStatePanel query={optionQuery} />}
          {selectedOptionRow ? <RecordInspector disabled={referencePending} onClose={() => setSelectedOptionRow(null)} row={selectedOptionRow} /> : null}
          <div className="mt-5 border-t border-border-default pt-5">
            <LocalizedNameFields copy={copy} disabled={referencePending} names={optionNames} onChange={setOptionNames} />
            <button className="mt-4 min-h-11 rounded-md bg-brand-navy-900 px-5 text-sm font-extrabold text-white disabled:opacity-50" disabled={referencePending || !optionNamesComplete} onClick={() => createOption.mutate({ attributeId: selectedAttributeId, data: optionNames }, { onError: fail, onSuccess: (response) => { if (!isExplicitMutationSuccess(response, ["OK", "CREATED"])) { fail(); return; } setOptionNames({ en: "", ru: "", uz: "" }); setFeedback({ message: copy.operationSuccess, tone: "success" }); void optionQuery.refetch?.(); } })} type="button">{copy.create}</button>
          </div>
        </Surface>
      ) : null}
      {feedback ? <StatusBadge tone={feedback.tone}>{feedback.message}</StatusBadge> : null}
    </div>
  );
}

function ContractsWorkspace() {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const query = useAllContracts(page, pageSize) as QueryState;
  const queryData = asRecord(query.data);
  const metaData = asRecord(queryData.meta);
  const totalPages = numberValue(metaData, ["pages"]) ?? 1;
  const records = useMemo(() => listFrom(query.data), [query.data]);
  const [contractStatusFilter, setContractStatusFilter] = useState("");
  const contractStatusOptions = useMemo(
    () => filterOptions(records, ["status"]),
    [records],
  );
  const visibleRecords = useMemo(
    () => filteredBy(records, ["status"], contractStatusFilter),
    [contractStatusFilter, records],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      visibleRecords.map((record, index) => {
        const id = textValue(record, ["contractId"], String(index + 1));
        const rawStatus = textValue(record, ["status"]);
        const [status, tone] = statusDetails(rawStatus, copy, currentLang);
        return {
          id: `#${id}`,
          primary: `${copy.contractsTable} #${id}`,
          secondary: [
            `${copy.auctionId}: ${textValue(record, ["auctionId"])}`,
            formatDate(record.createdAt, currentLang),
          ]
            .filter(Boolean)
            .join(" · "),
          value: status,
          status,
          tone,
        };
      }),
    [copy, currentLang, visibleRecords],
  );
  const selectedIndex = rows.findIndex((row) => row.id === selectedId);
  const selectedRecord = selectedIndex >= 0 ? visibleRecords[selectedIndex] : null;
  const selectedAuctionId = selectedRecord ? textValue(selectedRecord, ["auctionId"]) : "";
  const selectedSellerId = selectedRecord ? textValue(selectedRecord, ["sellerId"]) : "";
  const selectedBuyerId = selectedRecord ? textValue(selectedRecord, ["buyerId"]) : "";

  if (query.isError || query.error) return <QueryStatePanel query={query} />;

  return (
    <div>
      <OperationalTable
        label={copy.contractsTable}
        loading={queryLoading(query)}
        onOpen={(row) => setSelectedId(row.id)}
        rows={rows}
        toolbarControls={
          <AdminFilterBar
            label={filterLabels[currentLang].status}
            onChange={setContractStatusFilter}
            options={contractStatusOptions}
            value={contractStatusFilter}
          />
        }
      />
      {selectedAuctionId ? <ContractAuctionInspector auctionId={selectedAuctionId} buyerId={selectedBuyerId} onClose={() => setSelectedId(null)} sellerId={selectedSellerId} /> : null}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <PageSizeSelect disabled={queryLoading(query)} value={pageSize} onChange={(size) => { setPageSize(size); setPage(0); }} />
        <button
          aria-label={copy.prevPage}
          className="rounded-md border border-border-default p-2 text-brand-navy-900 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          type="button"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold text-text-primary">
          {copy.page} {page + 1} / {totalPages}
        </span>
        <button
          aria-label={copy.nextPage}
          className="rounded-md border border-border-default p-2 text-brand-navy-900 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          type="button"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function AuditLogWorkspace() {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const query = useQuery({
    queryKey: ["auditLog", page, pageSize, actionFilter, entityFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, size: pageSize };
      if (actionFilter.trim()) params.action = actionFilter.trim();
      if (entityFilter.trim()) params.entity = entityFilter.trim();
      const response = await api.get("/audit-log/admin", { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  }) as QueryState;

  const queryData = asRecord(query.data);
  const metaData = asRecord(queryData.meta);
  const totalPages = numberValue(metaData, ["pages"]) ?? 1;
  const records = useMemo(() => listFrom(query.data), [query.data]);
  const actionOptions = useMemo(() => filterOptions(records, ["action"]), [records]);
  const entityOptions = useMemo(() => filterOptions(records, ["entity"]), [records]);

  const [selectedRow, setSelectedRow] = useState<OperationalRow | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<UnknownRecord | null>(null);

  const rows = useMemo(
    () =>
      records.map((record, index) => {
        const logId = textValue(record, ["logId"], String(index + 1));
        const rawAction = textValue(record, ["action"], copy.unknown);
        const rawEntity = textValue(record, ["entity"], copy.unknown);
        const action = translateBackendEnum(rawAction, currentLang, copy.unknown);
        const entity = translateBackendEnum(rawEntity, currentLang, copy.unknown);
        const entityId = textValue(record, ["entityId"], "");
        const user = auditUserLabel(record, copy);
        const createdAt = formatDate(record.createdAt, currentLang);
        return {
          id: `#${logId}`,
          primary: action,
          secondary: [entity, entityId ? `ID ${entityId}` : "", createdAt].filter(Boolean).join(" · "),
          value: user,
          status: action,
          tone: "info" as const,
        };
      }),
    [copy, currentLang, records],
  );

  const clearFilters = () => {
    setActionFilter("");
    setEntityFilter("");
    setPage(0);
  };

  const hasFilters = actionFilter || entityFilter;
  const selectedMetadata = selectedRecord ? auditMetadataEntries(selectedRecord.metadata) : [];

  if (query.isError || query.error) return <QueryStatePanel query={query} />;

  return (
    <div>
      <OperationalTable
        label={copy.auditTable}
        loading={queryLoading(query)}
        onOpen={(row) => {
          const index = rows.findIndex((r) => r.id === row.id);
          setSelectedRow(row);
          setSelectedRecord(index >= 0 ? records[index] : null);
        }}
        rows={rows}
        toolbarControls={
          <>
            <AdminFilterBar
              forceVisible
              label={copy.auditAction}
              onChange={(value) => {
                setActionFilter(value);
                setPage(0);
              }}
              options={actionOptions}
              value={actionFilter}
            />
            <AdminFilterBar
              forceVisible
              label={copy.auditEntity}
              onChange={(value) => {
                setEntityFilter(value);
                setPage(0);
              }}
              options={entityOptions}
              value={entityFilter}
            />
            {hasFilters ? (
              <button
                aria-label={copy.auditClearFilter}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default text-brand-navy-900 hover:bg-surface-muted"
                onClick={clearFilters}
                title={copy.auditClearFilter}
                type="button"
              >
                <X aria-hidden="true" size={18} />
              </button>
            ) : null}
          </>
        }
      />

      {selectedRow && selectedRecord ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy-950/65 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRow(null);
              setSelectedRecord(null);
            }
          }}
          role="presentation"
        >
          <Surface
            aria-modal="true"
            className="my-6 w-full max-w-5xl shadow-2xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-gold-text">{copy.details}</p>
                <h2 className="mt-2 text-xl font-black text-brand-navy-900">{selectedRow.primary}</h2>
                <p className="mt-2 text-sm text-text-secondary">{selectedRow.secondary}</p>
              </div>
              <button
                aria-label={copy.close}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default text-brand-navy-900 hover:bg-surface-muted"
                onClick={() => { setSelectedRow(null); setSelectedRecord(null); }}
                type="button"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-3 border-t border-border-default pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.1em] text-text-secondary">{copy.auditLogId}</p>
                <p className="mt-1 text-sm font-bold text-brand-navy-900">{textValue(selectedRecord, ["logId"])}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.1em] text-text-secondary">{copy.auditAction}</p>
                <p className="mt-1 text-sm font-bold text-brand-navy-900">{translateBackendEnum(textValue(selectedRecord, ["action"]), currentLang, copy.noValue)}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.1em] text-text-secondary">{copy.auditEntity}</p>
                <p className="mt-1 text-sm font-bold text-brand-navy-900">
                  {translateBackendEnum(textValue(selectedRecord, ["entity"]), currentLang, copy.noValue)}
                  {textValue(selectedRecord, ["entityId"]) ? ` · ID ${textValue(selectedRecord, ["entityId"])}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.1em] text-text-secondary">{copy.auditUserRef}</p>
                <p className="mt-1 text-sm font-bold text-brand-navy-900">{auditUserLabel(selectedRecord, copy)}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.1em] text-text-secondary">{copy.auditCreatedAt}</p>
                <p className="mt-1 text-sm font-bold text-brand-navy-900">{formatDate(selectedRecord.createdAt, currentLang) || copy.noValue}</p>
              </div>
            </div>
            {selectedMetadata.length ? (
              <div className="mt-4 border-t border-border-default pt-4">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-text-secondary">{copy.auditMetadata}</p>
                <dl className="mt-3 grid max-h-[45vh] gap-3 overflow-y-auto sm:grid-cols-2">
                  {selectedMetadata.map(([path, value]) => {
                    const key = path.split(".").at(-1) ?? path;
                    const label = auditMetadataLabels[currentLang][key] ?? humanizeMetadataKey(key);
                    return (
                      <div className="rounded-md bg-surface-muted p-3" key={path}>
                        <dt className="text-xs font-bold text-text-secondary">{label}</dt>
                        <dd className="mt-1 break-words text-sm font-bold text-brand-navy-900">
                          {formatAuditMetadataValue(key, value, currentLang, copy.noValue)}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            ) : null}
          </Surface>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <PageSizeSelect disabled={queryLoading(query)} value={pageSize} onChange={(size) => { setPageSize(size); setPage(0); }} />
        <button
          aria-label={copy.prevPage}
          className="rounded-md border border-border-default p-2 text-brand-navy-900 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          type="button"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold text-text-primary">
          {copy.page} {page + 1} / {totalPages}
        </span>
        <button
          aria-label={copy.nextPage}
          className="rounded-md border border-border-default p-2 text-brand-navy-900 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          type="button"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export function ConnectedAdminWorkspace({ active }: { active: string }) {
  switch (active) {
    case "":
      return <OverviewWorkspace />;
    case "moderation":
      return <ModerationWorkspace />;
    case "kyc":
      return <AdminKycWorkspace />;
    case "vehicle-documents":
      return <AdminVehiclesWorkspace />;
    case "users":
      return <UsersWorkspace />;
    case "vehicles":
      return <VehiclesWorkspace />;
    case "auctions":
      return <AuctionsWorkspace />;
    case "ai-processing":
      return <AdminAiProcessingWorkspace />;
    case "finance":
      return <FinanceWorkspace />;
    case "reference-data":
      return <ReferenceWorkspace />;
    case "contracts":
      return <ContractsWorkspace />;
    case "audit":
      return <AuditLogWorkspace />;
    default:
      return null;
  }
}
