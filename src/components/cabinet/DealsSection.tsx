"use client";

import { ChevronLeft, ChevronRight, ExternalLink, FileText, Inbox, Search, X } from "lucide-react";
import Link from "next/link";
import SignatureCanvas from "react-signature-canvas";
import { useContext, useMemo, useRef, useState } from "react";

import AnimatedNumber from "@/components/ui/AnimatedNumber";
import { Surface } from "@/components/ui/Surface";
import { StatusBadge, type StatusBadgeTone } from "@/components/ui/StatusBadge";
import { PageSizeSelect } from "@/components/ui/PageSizeSelect";
import { StatePanel } from "@/components/feedback/StatePanel";
import {
  DashboardTableSkeleton,
  TabsAndListSkeleton,
} from "@/components/feedback/ContentSkeletons";
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import { useUserContext } from "@/context/UserContext";
import { resolveProfileIdentity } from "@/lib/auth/profileIdentity";
import {
  useAuctionById,
  useAuctionCounterparty,
  useContracts,
  useSignContract,
  type ContractAuctionRecord,
  type ContractCounterpartyRecord,
  type ContractCounterpartyUser,
} from "@/queries/contracts";
import { uploadUserDocumentFile } from "@/queries/user-documents";

type QueryState = {
  data?: unknown;
  error?: unknown;
  isError?: boolean;
  isLoading?: boolean;
  isPending?: boolean;
  refetch?: () => Promise<unknown>;
};

interface DealsCopy {
  loading: string;
  loadingBody: string;
  error: string;
  errorBody: string;
  empty: string;
  emptyBody: string;
  emptyFiltered: string;
  emptyFilteredBody: string;
  table: string;
  status: string;
  auctionId: string;
  created: string;
  buyer: string;
  seller: string;
  vehicle: string;
  pricing: string;
  schedule: string;
  dealStatus: string;
  startPrice: string;
  reservePrice: string;
  currentPrice: string;
  deposit: string;
  increment: string;
  startTime: string;
  endTime: string;
  vin: string;
  mileage: string;
  location: string;
  close: string;
  page: string;
  prevPage: string;
  nextPage: string;
  search: string;
  all: string;
  signed: string;
  metricsAll: string;
  metricsCancelled: string;
  metricsDraft: string;
  metricsPaid: string;
  metricsSigned: string;
  draft: string;
  cancelled: string;
  auctionTab: string;
  sellerTab: string;
  buyerTab: string;
  contactInfo: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  viewAuction: string;
  signContract: string;
  signDescription: string;
  agreeTerms: string;
  agreeRequired: string;
  signing: string;
  signedSuccess: string;
  signedAlready: string;
  signature: string;
  signatureClear: string;
  signatureRequired: string;
  signatureUploading: string;
  signError: string;
  statuses: Record<string, string>;

}

const messages: Record<Lang, DealsCopy> = {
  uz: {
    loading: "Ma’lumotlar yuklanmoqda",
    loadingBody: "Shartnomalar ro‘yxati olinmoqda.",
    error: "Ma’lumotlarni yuklab bo‘lmadi",
    errorBody: "Ulanishni tekshirib, keyinroq qayta urinib ko‘ring.",
    empty: "Hozircha shartnoma yo‘q",
    emptyBody: "Siz bilan bog‘liq shartnoma hali mavjud emas.",
    emptyFiltered: "Hech narsa topilmadi",
    emptyFilteredBody: "Filtrlash va qidiruv sozlamalarini o‘zgartiring.",
    table: "Shartnomalar",
    status: "Holat",
    auctionId: "Auksion",
    created: "Yaratilgan",
    buyer: "Xaridor",
    seller: "Sotuvchi",
    vehicle: "Avtomobil",
    pricing: "Narxlar",
    schedule: "Savdo vaqti",
    dealStatus: "Bitim holati",
    startPrice: "Boshlang‘ich narx",
    reservePrice: "Minimal narx",
    currentPrice: "Joriy narx",
    deposit: "Depozit",
    increment: "Qadam",
    startTime: "Boshlanish vaqti",
    endTime: "Tugash vaqti",
    vin: "VIN",
    mileage: "Yurgani",
    location: "Hudud",
    close: "Yopish",
    page: "Sahifa",
    prevPage: "Oldingi sahifa",
    nextPage: "Keyingi sahifa",
    search: "Shartnoma yoki auksion ID bo‘yicha qidirish",
    all: "Barcha",
    signed: "Imzolangan",
    metricsAll: "Barcha bitimlar",
    metricsCancelled: "Bekor qilingan",
    metricsDraft: "Qoralama/kutilayotgan",
    metricsPaid: "To‘langan",
    metricsSigned: "Imzolangan",
    draft: "Qoralama",
    cancelled: "Bekor qilingan",
    auctionTab: "Auksion ma’lumotlari",
    sellerTab: "Sotuvchi ma’lumotlari",
    buyerTab: "Xaridor ma’lumotlari",
    contactInfo: "Kontakt ma’lumotlari",
    userId: "User ID",
    fullName: "To‘liq ism",
    email: "Email",
    phone: "Telefon",
    viewAuction: "Auksionga o‘tib ko‘rish",
    signContract: "Kelishuvni tasdiqlash",
    signDescription:
      "Kelishuvni yakunlash uchun backendda yaratilgan shartnomani tasdiqlang.",
    agreeTerms: "Shartnoma shartlariga roziman",
    agreeRequired: "Kelishuvni tasdiqlash uchun avval shartlarga rozilik bildiring.",
    signing: "Tasdiqlanmoqda...",
    signedSuccess: "Kelishuv tasdiqlandi.",
    signedAlready: "Kelishuv allaqachon tasdiqlangan.",
    signature: "Imzo",
    signatureClear: "Imzoni tozalash",
    signatureRequired: "Kelishuvni tasdiqlash uchun avval imzo qo‘ying.",
    signatureUploading: "Imzo yuklanmoqda...",
    signError: "Kelishuvni tasdiqlab bo‘lmadi.",
    statuses: {
      ACTIVE: "Faol",
      APPROVED: "Tasdiqlangan",
      ARCHIVED: "Arxivlangan",
      CANCELED: "Bekor qilingan",
      CANCELLED: "Bekor qilingan",
      DRAFT: "Qoralama",
      FINISHED: "Yakunlangan",
      LIVE: "Jonli",
      PAID: "To‘langan",
      PENDING: "Kutilmoqda",
      PENDING_REVIEW: "Tekshiruvda",
      REJECTED: "Rad etilgan",
      SCHEDULED: "Rejalashtirilgan",
      SIGNED: "Imzolangan",
      SOLD: "Sotilgan",
      VERIFIED: "Tasdiqlangan",
    },
  
  },
  en: {
    loading: "Loading records",
    loadingBody: "Fetching the contract list.",
    error: "Could not load records",
    errorBody: "Check the connection and try again shortly.",
    empty: "No contracts yet",
    emptyBody: "No contracts are associated with your account yet.",
    emptyFiltered: "Nothing found",
    emptyFilteredBody: "Try changing the filter or search query.",
    table: "Contracts",
    status: "Status",
    auctionId: "Auction",
    created: "Created",
    buyer: "Buyer",
    seller: "Seller",
    vehicle: "Vehicle",
    pricing: "Pricing",
    schedule: "Schedule",
    dealStatus: "Deal status",
    startPrice: "Start price",
    reservePrice: "Reserve price",
    currentPrice: "Current price",
    deposit: "Deposit",
    increment: "Increment",
    startTime: "Start time",
    endTime: "End time",
    vin: "VIN",
    mileage: "Mileage",
    location: "Location",
    close: "Close",
    page: "Page",
    prevPage: "Previous page",
    nextPage: "Next page",
    search: "Search by contract or auction ID",
    all: "All",
    signed: "Signed",
    metricsAll: "All deals",
    metricsCancelled: "Cancelled",
    metricsDraft: "Draft/pending",
    metricsPaid: "Paid",
    metricsSigned: "Signed",
    draft: "Draft",
    cancelled: "Cancelled",
    auctionTab: "Auction details",
    sellerTab: "Seller details",
    buyerTab: "Buyer details",
    contactInfo: "Contact details",
    userId: "User ID",
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
    viewAuction: "View auction",
    signContract: "Confirm agreement",
    signDescription:
      "Confirm the auto-created contract to finish the deal process.",
    agreeTerms: "I agree to the contract terms",
    agreeRequired: "Agree to the contract terms before confirming.",
    signing: "Confirming...",
    signedSuccess: "Agreement confirmed.",
    signedAlready: "The agreement is already confirmed.",
    signature: "Signature",
    signatureClear: "Clear signature",
    signatureRequired: "Add your signature before confirming the agreement.",
    signatureUploading: "Uploading signature...",
    signError: "Could not confirm the agreement.",
    statuses: {
      ACTIVE: "Active",
      APPROVED: "Approved",
      ARCHIVED: "Archived",
      CANCELED: "Canceled",
      CANCELLED: "Cancelled",
      DRAFT: "Draft",
      FINISHED: "Finished",
      LIVE: "Live",
      PAID: "Paid",
      PENDING: "Pending",
      PENDING_REVIEW: "Pending review",
      REJECTED: "Rejected",
      SCHEDULED: "Scheduled",
      SIGNED: "Signed",
      SOLD: "Sold",
      VERIFIED: "Verified",
    },

  },
  ru: {
    loading: "Загружаем данные",
    loadingBody: "Получаем список контрактов.",
    error: "Не удалось загрузить данные",
    errorBody: "Проверьте соединение и повторите попытку позже.",
    empty: "Контрактов пока нет",
    emptyBody: "С вашим аккаунтом пока не связано ни одного контракта.",
    emptyFiltered: "Ничего не найдено",
    emptyFilteredBody: "Измените фильтр или поисковый запрос.",
    table: "Контракты",
    status: "Статус",
    auctionId: "Аукцион",
    created: "Создан",
    buyer: "Покупатель",
    seller: "Продавец",
    vehicle: "Автомобиль",
    pricing: "Цены",
    schedule: "Время торгов",
    dealStatus: "Статус сделки",
    startPrice: "Стартовая цена",
    reservePrice: "Резервная цена",
    currentPrice: "Текущая цена",
    deposit: "Депозит",
    increment: "Шаг",
    startTime: "Время старта",
    endTime: "Время окончания",
    vin: "VIN",
    mileage: "Пробег",
    location: "Регион",
    close: "Закрыть",
    page: "Страница",
    prevPage: "Предыдущая страница",
    nextPage: "Следующая страница",
    search: "Поиск по ID контракта или аукциона",
    all: "Все",
    signed: "Подписан",
    metricsAll: "Все сделки",
    metricsCancelled: "Отменённые",
    metricsDraft: "Черновик/ожидание",
    metricsPaid: "Оплаченные",
    metricsSigned: "Подписанные",
    draft: "Черновик",
    cancelled: "Отменён",
    auctionTab: "Данные аукциона",
    sellerTab: "Данные продавца",
    buyerTab: "Данные покупателя",
    contactInfo: "Контактные данные",
    userId: "User ID",
    fullName: "Полное имя",
    email: "Email",
    phone: "Телефон",
    viewAuction: "Посмотреть аукцион",
    signContract: "Подтвердить соглашение",
    signDescription:
      "Подтвердите автоматически созданный контракт, чтобы завершить сделку.",
    agreeTerms: "Я согласен с условиями договора",
    agreeRequired: "Перед подтверждением согласитесь с условиями договора.",
    signing: "Подтверждаем...",
    signedSuccess: "Соглашение подтверждено.",
    signedAlready: "Соглашение уже подтверждено.",
    signature: "Подпись",
    signatureClear: "Очистить подпись",
    signatureRequired: "Перед подтверждением соглашения поставьте подпись.",
    signatureUploading: "Загружаем подпись...",
    signError: "Не удалось подтвердить соглашение.",
    statuses: {
      ACTIVE: "Активен",
      APPROVED: "Одобрен",
      ARCHIVED: "В архиве",
      CANCELED: "Отменён",
      CANCELLED: "Отменён",
      DRAFT: "Черновик",
      FINISHED: "Завершён",
      LIVE: "Идёт",
      PAID: "Оплачен",
      PENDING: "Ожидает",
      PENDING_REVIEW: "На проверке",
      REJECTED: "Отклонён",
      SCHEDULED: "Запланирован",
      SIGNED: "Подписан",
      SOLD: "Продан",
      VERIFIED: "Подтверждён",
    },
  
  },
};

type StatusFilter = "all" | "signed" | "draft" | "cancelled";
type SortDir = "newest" | "oldest";
type DealModalTab = "auction" | "seller" | "buyer";
const CONTRACT_SIGNATURE_DOC_TYPE = "PASSPORT";

function canvasToPngFile(canvas: HTMLCanvasElement, fileName: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("signature_canvas_empty"));
        return;
      }
      resolve(new File([blob], fileName, { type: "image/png" }));
    }, "image/png");
  });
}

function matchesStatus(rawStatus: string, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  const s = rawStatus.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (filter === "signed") return ["ACTIVE", "LIVE", "APPROVED", "VERIFIED", "SIGNED"].includes(s);
  if (filter === "draft") return ["DRAFT", "PENDING"].includes(s);
  if (filter === "cancelled") return ["CANCELLED", "REJECTED", "EXPIRED"].includes(s);
  return true;
}

function statusDetails(rawStatus: string, copy: DealsCopy): [string, StatusBadgeTone] {
  const s = rawStatus.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (["ACTIVE", "LIVE", "APPROVED", "VERIFIED", "SIGNED"].includes(s))
    return [copy.statuses[s] || s, "success"];
  if (["DRAFT", "PENDING", "PENDING_REVIEW", "SCHEDULED"].includes(s)) return [copy.statuses[s] || s, "warning"];
  if (["CANCELED", "CANCELLED", "REJECTED", "EXPIRED"].includes(s)) return [copy.statuses[s] || s, "danger"];
  return [copy.statuses[s] || s || copy.status, "neutral"];
}

function translatedStatus(rawStatus: string | undefined, copy: DealsCopy): string {
  const s = String(rawStatus || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  return copy.statuses[s] || s || "—";
}

function isSignedStatus(rawStatus: string): boolean {
  const s = rawStatus.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return ["ACTIVE", "APPROVED", "SIGNED", "VERIFIED"].includes(s);
}

function normalizedDealStatus(rawStatus: unknown): string {
  return String(rawStatus || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
}

function isDraftDealStatus(status: string): boolean {
  return ["DRAFT", "PENDING", "PENDING_REVIEW", "SCHEDULED"].includes(status);
}

function isCancelledDealStatus(status: string): boolean {
  return ["CANCELED", "CANCELLED", "REJECTED", "EXPIRED"].includes(status);
}

type DealMetrics = {
  all: number;
  cancelled: number;
  draft: number;
  paid: number;
  signed: number;
};

function dealMetrics(records: readonly Record<string, unknown>[]): DealMetrics {
  return records.reduce<DealMetrics>(
    (total, record) => {
      const status = normalizedDealStatus(record.status);
      return {
        all: total.all + 1,
        cancelled: total.cancelled + (isCancelledDealStatus(status) ? 1 : 0),
        draft: total.draft + (isDraftDealStatus(status) ? 1 : 0),
        paid: total.paid + (status === "PAID" ? 1 : 0),
        signed: total.signed + (isSignedStatus(status) ? 1 : 0),
      };
    },
    { all: 0, cancelled: 0, draft: 0, paid: 0, signed: 0 },
  );
}

function DealMetric({ label, value }: { label: string; value: number }) {
  return (
    <Surface className="min-h-28">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-text-secondary">
        {label}
      </p>
      <AnimatedNumber
        className="mt-3 text-2xl font-extrabold tabular-nums text-brand-navy-900"
        duration={1.4}
        end={value}
        formattingFn={(amount) => String(Math.round(amount))}
      />
    </Surface>
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function userRecord(value: unknown): ContractCounterpartyUser | null {
  const record = asRecord(value);
  return Object.keys(record).length > 0 ? (record as ContractCounterpartyUser) : null;
}

function counterpartyData(value: unknown): ContractCounterpartyRecord {
  const record = asRecord(value);
  const nested = asRecord(record.data);
  return (Object.keys(nested).length > 0 ? nested : record) as ContractCounterpartyRecord;
}

function counterpartyUser(
  value: unknown,
  role: "seller" | "buyer",
  expectedId = "",
): ContractCounterpartyUser | null {
  const data = counterpartyData(value);
  const fallbackUsers = [userRecord(data.counterparty), userRecord(data.user)].filter(Boolean);
  const matchingFallback =
    fallbackUsers.find((user) => textValue(asRecord(user), ["id", "userId"]) === expectedId) ?? null;
  if (role === "seller") {
    return userRecord(data.seller) ?? userRecord(data.sellerDto) ?? matchingFallback;
  }

  return (
    userRecord(data.buyer) ??
    userRecord(data.buyerDto) ??
    userRecord(data.winner) ??
    userRecord(data.winnerDto) ??
    matchingFallback
  );
}

function listFrom(value: unknown, depth = 0): Record<string, unknown>[] {
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

function textValue(record: Record<string, unknown>, paths: string[], fallback = ""): string {
  for (const path of paths) {
    const value = path.split(".").reduce<unknown>((v, k) => {
      const r = v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
      return r[k];
    }, record);
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function numberValue(record: Record<string, unknown>, paths: string[]): number | null {
  for (const path of paths) {
    const value = path.split(".").reduce<unknown>((v, k) => {
      const r = v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
      return r[k];
    }, record);
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function formatDate(value: string | number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ContractRow({
  contract,
  copy,
  onClick,
}: {
  contract: Record<string, unknown>;
  copy: DealsCopy;
  onClick: () => void;
}) {
  const id = textValue(contract, ["contractId"]);
  const rawStatus = textValue(contract, ["status"]);
  const [status, tone] = statusDetails(rawStatus, copy);
  const auctionId = textValue(contract, ["auctionId"]);
  const createdAt = typeof contract.createdAt === "string" ? contract.createdAt : "";

  return (
    <button
      className="flex w-full items-center gap-4 border-b border-border-default px-4 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring"
      onClick={onClick}
      type="button"
    >
      <FileText aria-hidden="true" className="shrink-0 text-brand-gold-text" size={20} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-text-primary">
          {copy.table} #{id}
        </p>
        <p className="mt-0.5 truncate text-xs text-text-secondary">
          {copy.auctionId}: {auctionId}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <StatusBadge tone={tone}>{status}</StatusBadge>
        <p className="mt-0.5 text-xs text-text-secondary">{createdAt ? formatDate(createdAt) : ""}</p>
      </div>
    </button>
  );
}

function QueryStatePanel({ query, copy }: { query: QueryState; copy: DealsCopy }) {
  if (query.isLoading || query.isPending) {
    return <TabsAndListSkeleton label={copy.loading} rows={5} tabs={0} />;
  }
  if (query.isError || query.error) {
    return <StatePanel description={copy.errorBody} icon={<Inbox size={32} />} title={copy.error} />;
  }
  return <StatePanel description={copy.emptyBody} icon={<Inbox size={32} />} title={copy.empty} />;
}

function priceText(value: number | undefined, currency: string | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${new Intl.NumberFormat().format(Number(value))} ${currency || ""}`.trim();
}

function AuctionDetails({ auctionId, copy }: { auctionId: string; copy: DealsCopy }) {
  const query = useAuctionById(auctionId) as QueryState & { data?: ContractAuctionRecord | null };
  const auction = query.data;
  const vehicle = auction?.vehicle;

  if (query.isLoading || query.isPending) {
    return <TabsAndListSkeleton label={copy.loading} rows={3} tabs={0} />;
  }

  if (query.isError || !auction) {
    return <p className="text-sm text-text-secondary">{copy.errorBody}</p>;
  }

  const vehicleTitle = [vehicle?.makeName, vehicle?.modelName, vehicle?.year ? String(vehicle.year) : ""]
    .filter(Boolean)
    .join(" ");
  const detailAuctionId = auction.auctionId ?? Number(auctionId);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border-default bg-surface-muted/35 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.11em] text-brand-gold-text">{copy.vehicle}</p>
            <p className="mt-2 text-lg font-extrabold text-brand-navy-900">
              {vehicleTitle || `#${auctionId}`}
            </p>
          </div>
          {detailAuctionId ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border-default bg-white px-3 text-sm font-black text-brand-navy-900 transition-colors hover:bg-surface-muted"
              href={`/auctions/${detailAuctionId}`}
            >
              {copy.viewAuction}
              <ExternalLink aria-hidden="true" size={15} />
            </Link>
          ) : null}
        </div>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold text-text-secondary">{copy.vin}</dt>
            <dd className="mt-1 font-bold text-brand-navy-900">{vehicle?.vin || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-text-secondary">{copy.mileage}</dt>
            <dd className="mt-1 text-brand-navy-900">{vehicle?.mileage != null ? `${vehicle.mileage} km` : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-text-secondary">{copy.location}</dt>
            <dd className="mt-1 text-brand-navy-900">{vehicle?.region || "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-default p-4">
          <p className="text-xs font-black uppercase tracking-[0.11em] text-brand-gold-text">{copy.pricing}</p>
          <dl className="mt-3 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-secondary">{copy.startPrice}</dt>
              <dd className="font-bold text-brand-navy-900">{priceText(auction.startPrice, auction.currency)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-secondary">{copy.reservePrice}</dt>
              <dd className="font-bold text-brand-navy-900">{priceText(auction.reservePrice, auction.currency)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-secondary">{copy.currentPrice}</dt>
              <dd className="font-bold text-brand-navy-900">{priceText(auction.currentPrice, auction.currency)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-secondary">{copy.deposit}</dt>
              <dd className="font-bold text-brand-navy-900">{auction.depositPercent != null ? `${auction.depositPercent}%` : "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-secondary">{copy.increment}</dt>
              <dd className="font-bold text-brand-navy-900">
                {auction.incrementValue != null
                  ? `${auction.incrementValue} ${auction.incrementType === "PERCENTAGE" ? "%" : auction.currency || ""}`.trim()
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border-default p-4">
          <p className="text-xs font-black uppercase tracking-[0.11em] text-brand-gold-text">{copy.schedule}</p>
          <dl className="mt-3 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-secondary">{copy.status}</dt>
              <dd><StatusBadge tone="neutral">{translatedStatus(auction.status, copy)}</StatusBadge></dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-secondary">{copy.dealStatus}</dt>
              <dd><StatusBadge tone="neutral">{translatedStatus(auction.dealStatus, copy)}</StatusBadge></dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-secondary">{copy.startTime}</dt>
              <dd className="font-bold text-brand-navy-900">{auction.startTime ? formatDate(auction.startTime) : "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-secondary">{copy.endTime}</dt>
              <dd className="font-bold text-brand-navy-900">{auction.endTime ? formatDate(auction.endTime) : "—"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function UserDetailsCard({
  auctionId,
  copy,
  label,
  role,
  userId,
}: {
  auctionId: string;
  copy: DealsCopy;
  label: string;
  role: "seller" | "buyer";
  userId: string;
}) {
  const query = useAuctionCounterparty(auctionId) as QueryState;
  const selectedUser = counterpartyUser(query.data, role, userId);

  if (!auctionId) {
    return <p className="text-sm text-text-secondary">{copy.errorBody}</p>;
  }

  if (query.isLoading || query.isPending) {
    return <TabsAndListSkeleton label={copy.loading} rows={3} tabs={0} />;
  }

  if (query.isError) {
    return <p className="text-sm text-text-secondary">{copy.errorBody}</p>;
  }

  const selectedUserRecord = asRecord(selectedUser);
  const name = [
    textValue(selectedUserRecord, ["firstname", "firstName", "name"]),
    textValue(selectedUserRecord, ["lastname", "lastName", "surname"]),
  ]
    .filter(Boolean)
    .join(" ");
  const email = textValue(selectedUserRecord, ["email"]);
  const phone = textValue(selectedUserRecord, ["phone", "phoneNumber", "mobile"]);
  const resolvedUserId = textValue(selectedUserRecord, ["id", "userId"], userId);

  return (
    <div className="rounded-2xl border border-border-default bg-surface-muted/35 p-4">
      <p className="text-xs font-black uppercase tracking-[0.11em] text-brand-gold-text">
        {copy.contactInfo}
      </p>
      <h3 className="mt-2 text-xl font-black text-brand-navy-900">{label}</h3>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold text-text-secondary">{copy.userId}</dt>
          <dd className="mt-1 font-bold text-brand-navy-900">{resolvedUserId ? `#${resolvedUserId}` : "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-text-secondary">{copy.fullName}</dt>
          <dd className="mt-1 font-bold text-brand-navy-900">{name || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-text-secondary">{copy.email}</dt>
          <dd className="mt-1 break-all font-bold text-brand-navy-900">{email || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-text-secondary">{copy.phone}</dt>
          <dd className="mt-1 font-bold text-brand-navy-900">{phone || "—"}</dd>
        </div>
      </dl>
    </div>
  );
}

export function DealsSection() {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  const { user } = useUserContext() as {
    user?: { id?: string | number | null; userId?: string | number | null } | null;
  };
  const currentUserId = resolveProfileIdentity(user);
  const currentUserIdText = currentUserId === null ? "" : String(currentUserId);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDir] = useState<SortDir>("newest");
  const [modalTab, setModalTab] = useState<DealModalTab>("auction");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signFeedback, setSignFeedback] = useState<{ message: string; tone: "danger" | "success" | "warning" } | null>(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const signContract = useSignContract();
  const signingPending = signContract.isPending || signatureUploading;

  const query = useContracts(page, pageSize) as QueryState;
  const queryData = asRecord(query.data);
  const metaData = asRecord(queryData.meta);
  const totalPages = numberValue(metaData, ["pages"]) ?? 1;
  const records = useMemo(() => listFrom(query.data), [query.data]);
  const metrics = useMemo(() => dealMetrics(records), [records]);

  const filteredAndSorted = useMemo(() => {
    let result = records;

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((r) => {
        const raw = textValue(r, ["status"]);
        return matchesStatus(raw, statusFilter);
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((r) => {
        const contractId = textValue(r, ["contractId"]).toLowerCase();
        const auctionId = textValue(r, ["auctionId"]).toLowerCase();
        return contractId.includes(q) || auctionId.includes(q);
      });
    }

    // Sort
    result = [...result].sort((a, b) => {
      const aTime = new Date(String(a.createdAt ?? "")).getTime();
      const bTime = new Date(String(b.createdAt ?? "")).getTime();
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;
      return sortDir === "newest" ? bTime - aTime : aTime - bTime;
    });

    return result;
  }, [records, statusFilter, searchQuery, sortDir]);

  const selectedBuyerId = selected ? textValue(selected, ["buyerId"]) : "";
  const selectedSellerId = selected ? textValue(selected, ["sellerId"]) : "";
  const selectedContractId = selected ? textValue(selected, ["contractId"]) : "";
  const selectedStatus = selected ? textValue(selected, ["status"]) : "";
  const selectedIsSigned = selected ? isSignedStatus(selectedStatus) : false;
  const currentUserDealRole =
    currentUserIdText && selectedSellerId === currentUserIdText
      ? "seller"
      : currentUserIdText && selectedBuyerId === currentUserIdText
        ? "buyer"
        : null;
  const visibleModalTabs = [
    { label: copy.auctionTab, value: "auction" as const },
    ...(currentUserDealRole === "seller"
      ? [{ label: copy.buyerTab, value: "buyer" as const }]
      : currentUserDealRole === "buyer"
        ? [{ label: copy.sellerTab, value: "seller" as const }]
        : [
            { label: copy.sellerTab, value: "seller" as const },
            { label: copy.buyerTab, value: "buyer" as const },
          ]),
  ];

  const handleSignContract = async () => {
    if (!selectedContractId) return;
    if (selectedIsSigned) {
      setSignFeedback({ message: copy.signedAlready, tone: "warning" });
      return;
    }
    if (!termsAccepted) {
      setSignFeedback({ message: copy.agreeRequired, tone: "warning" });
      return;
    }
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      setSignFeedback({ message: copy.signatureRequired, tone: "warning" });
      return;
    }
    try {
      setSignatureUploading(true);
      setSignFeedback(null);
      const signatureFile = await canvasToPngFile(
        signatureRef.current.getTrimmedCanvas(),
        `contract-${selectedContractId}-signature.png`,
      );
      const uploaded = await uploadUserDocumentFile({
        docType: CONTRACT_SIGNATURE_DOC_TYPE,
        file: signatureFile,
      });
      const fileUrl = uploaded.fileUrl ?? uploaded.url ?? uploaded.downloadUrl;
      if (!fileUrl) throw new Error("signature_upload_missing_file_url");
      await signContract.mutateAsync({
        contractId: selectedContractId,
        fileUrl,
      });
      setSignFeedback({ message: copy.signedSuccess, tone: "success" });
      setTermsAccepted(false);
      signatureRef.current?.clear();
      await query.refetch?.();
    } catch {
      setSignFeedback({ message: copy.signError, tone: "danger" });
    } finally {
      setSignatureUploading(false);
    }
  };

  if (records.length === 0 && !query.isLoading && !query.isPending) {
    return <QueryStatePanel copy={copy} query={query} />;
  }

  if (query.isLoading || query.isPending) {
    return <DashboardTableSkeleton columns={5} label={copy.loading} />;
  }

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: copy.all },
    { value: "draft", label: copy.draft },
    { value: "signed", label: copy.signed },
    { value: "cancelled", label: copy.cancelled },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <DealMetric label={copy.metricsAll} value={metrics.all} />
        <DealMetric label={copy.metricsSigned} value={metrics.signed} />
        <DealMetric label={copy.metricsPaid} value={metrics.paid} />
        <DealMetric label={copy.metricsDraft} value={metrics.draft} />
        <DealMetric label={copy.metricsCancelled} value={metrics.cancelled} />
      </div>

      {/* Toolbar: search + filter + sort */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-0 flex-1 md:max-w-xs">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
          <input
            aria-label={copy.search}
            className="min-h-11 w-full rounded-md border border-border-default bg-white pl-9 pr-3 text-sm"
            onChange={(event) => { setSearchQuery(event.target.value); setPage(0); }}
            placeholder={copy.search}
            type="text"
            value={searchQuery}
          />
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-1" role="group">
          {statusFilters.map(({ label, value }) => (
            <button
              aria-pressed={statusFilter === value}
              className={`min-h-9 rounded-md px-3 text-xs font-extrabold transition-colors ${
                statusFilter === value
                  ? "bg-brand-navy-900 text-white"
                  : "border border-border-default bg-white text-text-secondary hover:border-border-strong"
              }`}
              key={value}
              onClick={() => { setStatusFilter(value); setPage(0); }}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort */}
    
      </div>

      {/* Contract list */}
      <Surface>
        {filteredAndSorted.length > 0 ? (
          filteredAndSorted.map((record, index) => (
            <ContractRow
              contract={record}
              copy={copy}
              key={textValue(record, ["contractId"], String(index))}
              onClick={() => {
                setSelected(record);
                setModalTab("auction");
                setTermsAccepted(false);
                setSignFeedback(null);
              }}
            />
          ))
        ) : (
          <div className="flex flex-col items-center py-10 text-center">
            <Inbox aria-hidden="true" className="text-text-secondary" size={32} />
            <p className="mt-3 text-sm font-bold text-text-primary">{copy.emptyFiltered}</p>
            <p className="mt-1 text-xs text-text-secondary">{copy.emptyFilteredBody}</p>
          </div>
        )}
      </Surface>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <PageSizeSelect
          disabled={query.isLoading || query.isPending}
          onChange={(size) => { setPageSize(size); setPage(0); }}
          value={pageSize}
        />
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

      {/* Modal */}
      {selected ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy-950/65 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
                setSelected(null);
                setModalTab("auction");
                setTermsAccepted(false);
                setSignFeedback(null);
            }
          }}
          role="presentation"
        >
          <Surface
            aria-modal="true"
            className="my-6 max-h-[calc(100dvh-3rem)] w-full max-w-3xl overflow-y-auto shadow-2xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-gold-text">
                  {copy.table} #{textValue(selected, ["contractId"])}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {copy.auctionId}: {textValue(selected, ["auctionId"])}
                </p>
              </div>
              <button
                aria-label={copy.close}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default text-brand-navy-900 hover:bg-surface-muted"
                onClick={() => {
                  setSelected(null);
                  setModalTab("auction");
                  setTermsAccepted(false);
                  setSignFeedback(null);
                }}
                type="button"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-3 border-t border-border-default pt-5">
              <div className="flex items-center gap-2 text-sm">
                <StatusBadge tone={statusDetails(textValue(selected, ["status"]), copy)[1]}>
                  {statusDetails(textValue(selected, ["status"]), copy)[0]}
                </StatusBadge>
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-text-secondary">
                  {copy.created}: {formatDate(String(selected.createdAt ?? ""))}
                </span>
              </div>

              <div className="flex gap-6 overflow-x-auto border-b border-border-default">
                {visibleModalTabs.map((tab) => (
                  <button
                    aria-pressed={modalTab === tab.value}
                    className={`shrink-0 border-b-2 px-1 pb-3 text-sm font-black transition-colors ${
                      modalTab === tab.value
                        ? "border-brand-gold-text text-brand-navy-900"
                        : "border-transparent text-text-secondary hover:text-brand-navy-900"
                    }`}
                    key={tab.value}
                    onClick={() => setModalTab(tab.value)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {modalTab === "auction" ? (
                <AuctionDetails auctionId={textValue(selected, ["auctionId"])} copy={copy} />
              ) : null}
              {modalTab === "seller" && visibleModalTabs.some((tab) => tab.value === "seller") ? (
                <UserDetailsCard
                  auctionId={textValue(selected, ["auctionId"])}
                  copy={copy}
                  label={copy.seller}
                  role="seller"
                  userId={selectedSellerId}
                />
              ) : null}
              {modalTab === "buyer" && visibleModalTabs.some((tab) => tab.value === "buyer") ? (
                <UserDetailsCard
                  auctionId={textValue(selected, ["auctionId"])}
                  copy={copy}
                  label={copy.buyer}
                  role="buyer"
                  userId={selectedBuyerId}
                />
              ) : null}

              <div className="rounded-2xl border border-border-default bg-surface-muted/35 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-brand-navy-900">{copy.signContract}</p>
                    <p className="mt-1 text-sm leading-5 text-text-secondary">{copy.signDescription}</p>
                  </div>
                  <button
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-brand-navy-900 px-4 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={selectedIsSigned || signingPending || !termsAccepted}
                    onClick={() => void handleSignContract()}
                    type="button"
                  >
                    {signatureUploading ? copy.signatureUploading : signContract.isPending ? copy.signing : selectedIsSigned ? copy.signedAlready : copy.signContract}
                  </button>
                </div>
                {!selectedIsSigned ? (
                  <>
                    <div className="mt-4 rounded-xl border border-border-default bg-white p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-black text-brand-navy-900">{copy.signature}</span>
                        <button
                          className="rounded-md border border-border-default px-3 py-1.5 text-xs font-bold text-brand-navy-900 hover:bg-surface-muted disabled:opacity-50"
                          disabled={signingPending}
                          onClick={() => signatureRef.current?.clear()}
                          type="button"
                        >
                          {copy.signatureClear}
                        </button>
                      </div>
                      <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{
                          "aria-label": copy.signature,
                          className: "h-40 w-full rounded-lg border border-dashed border-border-default bg-white",
                        }}
                        clearOnResize={false}
                        penColor="#071f44"
                      />
                    </div>
                    <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-border-default bg-white px-3 py-3 text-sm font-bold text-brand-navy-900">
                      <input
                        checked={termsAccepted}
                        className="mt-0.5 size-4 rounded border-border-default accent-brand-navy-900"
                        disabled={signingPending}
                        onChange={(event) => setTermsAccepted(event.target.checked)}
                        type="checkbox"
                      />
                      <span>{copy.agreeTerms}</span>
                    </label>
                  </>
                ) : null}
                {signFeedback ? (
                  <p
                    className={`mt-3 rounded-md px-3 py-2 text-sm font-bold ${
                      signFeedback.tone === "success"
                        ? "bg-semantic-success-surface text-semantic-success"
                        : signFeedback.tone === "warning"
                          ? "bg-semantic-warning-surface text-semantic-warning"
                          : "bg-semantic-danger-surface text-semantic-danger"
                    }`}
                    role={signFeedback.tone === "danger" ? "alert" : "status"}
                  >
                    {signFeedback.message}
                  </p>
                ) : null}
              </div>
            </div>
          </Surface>
        </div>
      ) : null}
    </div>
  );
}
