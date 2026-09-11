"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Fuel, Gauge, Gavel, MapPin, Plus, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useContext, useMemo, useState } from "react";
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import { translateBackendValue } from "@/lib/localization/backendEnum";
import { translateUiText } from "@/lib/localization/uiText";
import { useUserContext } from "@/context/UserContext";
import { resolveProfileIdentity } from "@/lib/auth/profileIdentity";
import { useAuctionByVehicle, useAuctionFeed, useCreateAuction, useRelistVehicle } from "@/queries/auction-listings";
import { VehicleImage } from "@/components/auction/VehicleImage";
import { StatePanel } from "@/components/feedback/StatePanel";
import { AuctionCardGridSkeleton } from "@/components/feedback/ContentSkeletons";
import { StatusBadge, type StatusBadgeTone } from "@/components/ui/StatusBadge";
import type { AuctionImage } from "@/lib/auction/types";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import MoneyInput, { formatThousands } from "../ui/MoneyInput";
import { AppSelect } from "../ui/AppSelect";
import { PageSizeSelect } from "../ui/PageSizeSelect";

const messages: Record<Lang, Record<string, string>> = {
  uz: { create: "Auksion yaratish", relist: "Qayta auksionga qo‘yish", relistTitle: "Avtomobilni qayta auksionga qo‘yish", relistBody: "Avtomobil ma’lumotlari saqlanadi. Faqat yangi auksion shartlarini kiriting.", unavailableVehicle: "Bu avtomobil uchun hozir yangi auksion yaratib bo‘lmaydi.", eligibilityError: "Avtomobilning auksionga mosligini tekshirib bo‘lmadi.", all: "Barcha holatlar", empty: "Auksionlar topilmadi", emptyBody: "Tanlangan holat bo‘yicha auksion mavjud emas.", retry: "Qayta urinish", loading: "Auksionlar yuklanmoqda…", vehicle: "Avtomobil", startPrice: "Boshlang‘ich narx", startPriceHelp: "Birinchi taklif boshlanadigan narx.", reservePrice: "Rezerv narx", currency: "Valyuta", incrementType: "Qadam turi", incrementValue: "Qadam qiymati", deposit: "Depozit, %", start: "Boshlanish vaqti", end: "Tugash vaqti", cancel: "Bekor qilish", save: "Yaratish", saving: "Yaratilmoqda…", success: "Auksion muvaffaqiyatli yaratildi.", formError: "Auksionni yaratib bo‘lmadi. Ma’lumotlarni tekshirib, qayta urining.", loadError: "Auksionlarni yuklab bo‘lmadi.", fixed: "Belgilangan summa", percentage: "Foiz", selectVehicle: "Avtomobilni tanlang", noVehicles: "Yangi auksion uchun mos avtomobil topilmadi.", status: "Holat", price: "Joriy narx", period: "Savdo vaqti", page: "Sahifa" },
  en: { create: "Create auction", relist: "Relist for auction", relistTitle: "Relist vehicle for auction", relistBody: "The vehicle information will be reused. Enter only the new auction terms.", unavailableVehicle: "A new auction cannot currently be created for this vehicle.", eligibilityError: "Could not verify whether the vehicle is eligible for an auction.", all: "All statuses", empty: "No auctions found", emptyBody: "There are no auctions with the selected status.", retry: "Try again", loading: "Loading auctions…", vehicle: "Vehicle", startPrice: "Start price", startPriceHelp: "The price at which the first bid starts.", reservePrice: "Reserve price", currency: "Currency", incrementType: "Increment type", incrementValue: "Increment value", deposit: "Deposit, %", start: "Start time", end: "End time", cancel: "Cancel", save: "Create", saving: "Creating…", success: "Auction created successfully.", formError: "Could not create the auction. Check the data and try again.", loadError: "Could not load auctions.", fixed: "Fixed amount", percentage: "Percentage", selectVehicle: "Select a vehicle", noVehicles: "No vehicle is currently eligible for a new auction.", status: "Status", price: "Current price", period: "Auction period", page: "Page" },
  ru: { create: "Создать аукцион", relist: "Выставить повторно", relistTitle: "Повторно выставить автомобиль", relistBody: "Данные автомобиля будут использованы повторно. Укажите только новые условия аукциона.", unavailableVehicle: "Для этого автомобиля сейчас нельзя создать новый аукцион.", eligibilityError: "Не удалось проверить доступность автомобиля для аукциона.", all: "Все статусы", empty: "Аукционы не найдены", emptyBody: "Нет аукционов с выбранным статусом.", retry: "Повторить", loading: "Загрузка аукционов…", vehicle: "Автомобиль", startPrice: "Стартовая цена", startPriceHelp: "Цена, с которой начинается первая ставка.", reservePrice: "Резервная цена", currency: "Валюта", incrementType: "Тип шага", incrementValue: "Размер шага", deposit: "Депозит, %", start: "Начало", end: "Окончание", cancel: "Отмена", save: "Создать", saving: "Создание…", success: "Аукцион успешно создан.", formError: "Не удалось создать аукцион. Проверьте данные и повторите.", loadError: "Не удалось загрузить аукционы.", fixed: "Фиксированная сумма", percentage: "Процент", selectVehicle: "Выберите автомобиль", noVehicles: "Нет автомобиля, доступного для нового аукциона.", status: "Статус", price: "Текущая цена", period: "Период торгов", page: "Страница" },
};
const field = "mt-1 min-h-11 w-full rounded-md border border-border-default bg-[#ffffff] px-3 text-sm outline-none focus:border-brand-navy-700 focus:ring-2 focus:ring-brand-champagne-500/35";
export const parseFormattedNumber = (value: FormDataEntryValue | null) => Number(String(value ?? "").replace(/\s/g, ""));
export { formatThousands } from "../ui/MoneyInput";

const tones: Record<string, StatusBadgeTone> = {  SCHEDULED: "info", LIVE: "success", FINISHED: "neutral", CANCELED: "danger" };
const AUCTION_STATUSES = ["CURRENT", "ENDED"] as const;
type AuctionStatus = (typeof AUCTION_STATUSES)[number];
const statusLabels: Record<Lang, Record<AuctionStatus, string>> = {
  uz: {
    CURRENT: "Joriy",
    ENDED: "Yakunlangan",
  },
  en: {
    CURRENT: "Current",
    ENDED: "Ended",
  },
  ru: {
    CURRENT: "Текущие",
    ENDED: "Завершенные",
  },
};
export interface Auction { auctionId?: number | string; id?: number | string; vehicleId?: number | string; startPrice?: number; reservePrice?: number; currentPrice?: number; currency?: string; startTime?: string; endTime?: string; status?: string; dealStatus?: string; winnerId?: number | string; buyerId?: number | string; sold?: boolean; vehicle?: VehicleOption & { imageUrls?: unknown[]; images?: unknown[]; mileage?: number; region?: string; fuelType?: string } }
export interface VehicleOption { vehicleId?: number | string; id?: number | string; sellerId?: number | string; ownerId?: number | string; userId?: number | string; makeName?: string; modelName?: string; year?: number }
export function ownedVehicleOptions(vehicles: VehicleOption[], userId: number | null) {
  if (userId === null) return [];
  return vehicles.filter((vehicle) => {
    const ownerId = vehicle.sellerId ?? vehicle.ownerId ?? vehicle.userId;
    return ownerId !== null && ownerId !== undefined && String(ownerId) === String(userId);
  });
}
const activeAuctionStatuses = new Set(["DRAFT", "SCHEDULED", "LIVE"]);
const soldDealStatuses = new Set(["SOLD", "COMPLETED", "PAID", "TRANSFERRED"]);

const idOfVehicle = (vehicle: VehicleOption) => String(vehicle.vehicleId ?? vehicle.id ?? "").trim();
const idOfAuctionVehicle = (auction: Auction) => String(auction.vehicleId ?? auction.vehicle?.vehicleId ?? "").trim();

export function auctionWasSold(auction: Auction): boolean {
  const dealStatus = String(auction.dealStatus ?? "").toUpperCase();
  const auctionStatus = String(auction.status ?? "").toUpperCase();
  const hasWinner = Boolean(auction.winnerId || auction.buyerId);
  const confirmedSale = Boolean(auction.sold || hasWinner || soldDealStatuses.has(dealStatus));
  if (auctionStatus === "FINISHED") return confirmedSale;
  return Boolean(confirmedSale || soldDealStatuses.has(dealStatus));
}

export function canRelistAuction(auction: Auction | undefined): boolean {
  if (!auction || auctionWasSold(auction)) return false;
  return ["CANCELED", "CANCELLED", "FINISHED"].includes(String(auction.status ?? "").toUpperCase());
}

function auctionRecency(auction: Auction): number {
  const startTime = auction.startTime ? Date.parse(auction.startTime) : Number.NaN;
  if (Number.isFinite(startTime)) return startTime;
  const auctionId = Number(auction.auctionId ?? auction.id);
  return Number.isFinite(auctionId) ? auctionId : 0;
}

export function selectVehicleAuction<T extends Auction>(auctions: T[], vehicleId: string): T | undefined {
  return auctions
    .filter((auction) => idOfAuctionVehicle(auction) === vehicleId)
    .sort((left, right) => {
      const leftActive = activeAuctionStatuses.has(String(left.status ?? "").toUpperCase());
      const rightActive = activeAuctionStatuses.has(String(right.status ?? "").toUpperCase());
      if (leftActive !== rightActive) return rightActive ? 1 : -1;
      return auctionRecency(right) - auctionRecency(left);
    })[0];
}

export function eligibleVehicleOptions(
  vehicles: VehicleOption[],
  userId: number | null,
  auctions: Auction[],
) {
  return ownedVehicleOptions(vehicles, userId).filter((vehicle) => {
    const vehicleId = idOfVehicle(vehicle);
    if (!vehicleId) return false;
    const vehicleAuctions = auctions.filter((auction) => idOfAuctionVehicle(auction) === vehicleId);
    if (vehicleAuctions.some((auction) => activeAuctionStatuses.has(String(auction.status ?? "").toUpperCase()))) return false;
    if (vehicleAuctions.some(auctionWasSold)) return false;
    return true;
  });
}
export const formatAuctionMoney = (value?: number, currency = "UZS") => {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  const normalizedCurrency = String(currency || "").trim().toUpperCase();
  const safeCurrency = ["UZS", "USD"].includes(normalizedCurrency) ? normalizedCurrency : "UZS";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: safeCurrency, maximumFractionDigits: 2 }).format(Number(value));
};
const vehicleName = (auction: Auction) => [auction.vehicle?.makeName, auction.vehicle?.modelName, auction.vehicle?.year].filter(Boolean).join(" ") || `#${auction.vehicleId ?? "—"}`;

const cardCopy: Record<Lang, { details: string; fuel: string; image: string; lot: string; mileage: string; region: string; relist: string; unknown: string; year: string }> = {
  uz: { details: "Batafsil ko‘rish", fuel: "Yoqilg‘i", image: "Avtomobil rasmi mavjud emas", lot: "LOT", mileage: "Yurgan masofa", region: "Hudud", relist: "Qayta auksionga qo‘yish", unknown: "Noma’lum", year: "Yil" },
  en: { details: "View details", fuel: "Fuel", image: "Vehicle image unavailable", lot: "LOT", mileage: "Mileage", region: "Region", relist: "Relist for auction", unknown: "Unknown", year: "Year" },
  ru: { details: "Подробнее", fuel: "Топливо", image: "Фото автомобиля недоступно", lot: "ЛОТ", mileage: "Пробег", region: "Регион", relist: "Выставить повторно", unknown: "Неизвестно", year: "Год" },
};

function normalizeAuctionImage(value: unknown): AuctionImage | null {
  const images = Array.isArray(value) ? value : [];
  const primary = images.find((item) => typeof item === "object" && item !== null && (item as { isPrimary?: unknown }).isPrimary) ?? images[0];
  if (typeof primary === "string" && primary.trim()) {
    return { id: primary, url: primary.trim(), alt: { default: null, uz: null, ru: null, en: null } };
  }
  if (!primary || typeof primary !== "object") return null;
  const record = primary as Record<string, unknown>;
  const url = [record.imageUrl, record.fileUrl, record.url].find((item) => typeof item === "string" && item.trim());
  if (typeof url !== "string") return null;
  return { id: String(record.imageId ?? record.id ?? ""), url, alt: { default: null, uz: null, ru: null, en: null } };
}

function toLocalDateTimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function VehicleAuctionModal({
  auction,
  onClose,
  vehicle,
}: {
  auction?: Auction;
  onClose: () => void;
  vehicle: VehicleOption;
}) {
  const { currentLang } = useContext(LangSwitch);
  const t = messages[currentLang];
  const create = useCreateAuction();
  const relistVehicle = useRelistVehicle();
  const [incrementType, setIncrementType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [incrementValue, setIncrementValue] = useState("");
  const [currency, setCurrency] = useState<"UZS" | "USD">(auction?.currency === "USD" ? "USD" : "UZS");
  const [error, setError] = useState("");
  const vehicleId = idOfVehicle(vehicle);
  const pending = create.isPending || relistVehicle.isPending;
  const title = [vehicle.makeName, vehicle.modelName, vehicle.year].filter(Boolean).join(" ") || `#${vehicleId}`;

  const [initialDates] = useState(() => {
    const now = Date.now();
    return {
      defaultStartTime: toLocalDateTimeInput(new Date(now + 10 * 60 * 1000)),
      minStartTime: toLocalDateTimeInput(new Date(now + 2 * 60 * 1000)),
      defaultEndTime: toLocalDateTimeInput(new Date(now + 7 * 24 * 60 * 60 * 1000)),
    };
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const startDate = new Date(String(data.get("startTime")));
    const endDate = new Date(String(data.get("endTime")));

    if (startDate.getTime() <= Date.now() + 60 * 1000) {
      setError(
        currentLang === "uz"
          ? "Auksion boshlanish vaqti kamida 1 daqiqa kelajakda bo‘lishi kerak."
          : currentLang === "ru"
          ? "Время начала аукциона должно быть как минимум на 1 минуту в будущем."
          : "Auction start time must be at least 1 minute in the future."
      );
      return;
    }

    if (endDate.getTime() <= startDate.getTime()) {
      setError(
        currentLang === "uz"
          ? "Tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak."
          : currentLang === "ru"
          ? "Время окончания должно быть позже времени начала."
          : "Auction end time must be after start time."
      );
      return;
    }

    try {
      if (canRelistAuction(auction)) await relistVehicle.mutateAsync(vehicleId);
      await create.mutateAsync({
        vehicleId: Number(vehicleId),
        startPrice: parseFormattedNumber(data.get("startPrice")),
        reservePrice: parseFormattedNumber(data.get("reservePrice")),
        currency,
        incrementType,
        incrementValue: parseFormattedNumber(data.get("incrementValue")),
        depositPercent: Number(data.get("depositPercent")),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      });
      onClose();
    } catch (submitError) {
      setError(apiErrorMessage(submitError, t.formError, currentLang));
    }
  }

  return <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-brand-navy-950/65 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}>
    <div aria-labelledby="vehicle-auction-modal-title" aria-modal="true" className="my-6 w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl" role="dialog">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-2xl font-extrabold text-brand-navy-900" id="vehicle-auction-modal-title">{auction ? t.relistTitle : t.create}</h2><p className="mt-2 text-sm text-text-secondary">{title}</p>{auction ? <p className="mt-1 text-sm text-text-secondary">{t.relistBody}</p> : null}</div>
        <button aria-label={t.cancel} disabled={pending} onClick={onClose} type="button"><X aria-hidden="true" /></button>
      </div>
      {error ? <p className="mt-4 rounded-md bg-semantic-danger-surface px-4 py-3 text-sm font-bold text-semantic-danger" role="alert">{error}</p> : null}
      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <MoneyInput label={t.startPrice} name="startPrice" tooltip={t.startPriceHelp}/>
        <MoneyInput label={t.reservePrice} name="reservePrice"/>
        <div className="text-sm font-bold">{t.currency}<AppSelect className="mt-1" name="currency" value={currency} onChange={(val) => setCurrency(String(val) as "UZS" | "USD")} options={[{ value: "UZS", label: "So‘m (UZS)" }, { value: "USD", label: "Dollar (USD)" }]} /></div>
        <label className="text-sm font-bold">{t.deposit}<input className={field} max="100" min="0" name="depositPercent" required step="0.01" type="number"/></label>
        <div className="text-sm font-bold">{t.incrementType}<AppSelect className="mt-1" name="incrementType" onChange={(value) => { setIncrementType(String(value) as "FIXED" | "PERCENTAGE"); setIncrementValue(""); }} options={[{ value: "FIXED", label: t.fixed }, { value: "PERCENTAGE", label: t.percentage }]} value={incrementType}/></div>
        <label className="text-sm font-bold">{t.incrementValue}<span className="relative mt-1 block"><input className={`${field} mt-0 ${incrementType === "PERCENTAGE" ? "pr-9" : ""}`} inputMode={incrementType === "FIXED" ? "numeric" : "decimal"} name="incrementValue" onChange={(event) => setIncrementValue(incrementType === "FIXED" ? formatThousands(event.target.value) : event.target.value.replace(/[^\d.]/g, ""))} required value={incrementValue}/>{incrementType === "PERCENTAGE" ? <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-extrabold text-text-secondary">%</span> : null}</span></label>
        <label className="text-sm font-bold">{t.start}<input className={field} defaultValue={initialDates.defaultStartTime} min={initialDates.minStartTime} name="startTime" required type="datetime-local"/></label>
        <label className="text-sm font-bold">{t.end}<input className={field} defaultValue={initialDates.defaultEndTime} min={initialDates.defaultStartTime} name="endTime" required type="datetime-local"/></label>
        <div className="mt-2 flex justify-end gap-3 sm:col-span-2"><button className="min-h-11 rounded-md border px-5 text-sm font-bold" disabled={pending} onClick={onClose} type="button">{t.cancel}</button><button className="min-h-11 rounded-md bg-brand-navy-900 px-5 text-sm font-extrabold text-white disabled:opacity-60" disabled={pending}>{pending ? t.saving : t.save}</button></div>
      </form>
    </div>
  </div>;
}

function DashboardAuctionCard({ auction, canRelist, locale, priceLabel }: { auction: Auction; canRelist: boolean; locale: Lang; priceLabel: string }) {
  const copy = cardCopy[locale];
  const id = auction.auctionId ?? auction.id;
  const title = vehicleName(auction);
  const image = normalizeAuctionImage(auction.vehicle?.imageUrls ?? auction.vehicle?.images);

  return <article className="group overflow-hidden rounded-lg border border-border-default bg-surface-primary shadow-[0_10px_28px_rgb(4_18_43_/_0.06)] transition-transform hover:-translate-y-0.5">
    <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
      <VehicleImage image={image} alt={title} fallbackAlt={copy.image}/>
      <StatusBadge tone={tones[auction.status ?? ""] ?? "neutral"} className="absolute left-4 top-4 shadow-sm">{translateBackendValue(auction.status, locale)}</StatusBadge>
    </div>
    <div className="p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-brand-gold-text">{copy.lot} #{id ?? "—"}</p>
      <h2 className="mt-2 line-clamp-2 text-xl font-extrabold leading-tight text-brand-navy-900">{title}</h2>
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-text-secondary">
        <div className="flex items-center gap-2"><CalendarDays aria-hidden="true" className="h-4 w-4"/><dt className="sr-only">{copy.year}</dt><dd>{auction.vehicle?.year ?? copy.unknown}</dd></div>
        <div className="flex items-center gap-2"><Gauge aria-hidden="true" className="h-4 w-4"/><dt className="sr-only">{copy.mileage}</dt><dd>{auction.vehicle?.mileage != null ? `${new Intl.NumberFormat().format(auction.vehicle.mileage)} km` : copy.unknown}</dd></div>
        <div className="col-span-2 flex items-center gap-2"><MapPin aria-hidden="true" className="h-4 w-4"/><dt className="sr-only">{copy.region}</dt><dd>{auction.vehicle?.region ?? copy.unknown}</dd></div>
        <div className="col-span-2 flex items-center gap-2"><Fuel aria-hidden="true" className="h-4 w-4"/><dt className="sr-only">{copy.fuel}</dt><dd>{translateBackendValue(auction.vehicle?.fuelType, locale, copy.unknown)}</dd></div>
      </dl>
      <div className="mt-5 border-t border-border-default pt-4"><p className="text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">{priceLabel}</p><p className="mt-1 text-[1.35rem] font-extrabold leading-tight text-brand-navy-900">{formatAuctionMoney(auction.currentPrice ?? auction.startPrice, auction.currency)}</p></div>
      <Link href={`/auctions/${id}`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border-default bg-surface-primary px-5 py-2.5 text-sm font-bold text-brand-navy-900 transition-colors hover:border-brand-navy-900 hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">{copy.details}</Link>
      {canRelist ? <Link href={`/dashboard/auctions?vehicleId=${encodeURIComponent(String(auction.vehicleId ?? auction.vehicle?.vehicleId ?? ""))}&relist=1`} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-champagne-500 px-5 py-2.5 text-sm font-extrabold text-brand-navy-950"><RotateCcw aria-hidden="true" size={17}/>{copy.relist}</Link> : null}
    </div>
  </article>;
}

export function AuctionsSection({ initialVehicleId = "", relist = false }: { initialVehicleId?: string; relist?: boolean }) {
  const { currentLang } = useContext(LangSwitch); const t = messages[currentLang];
  const { user, isLoading: userLoading } = useUserContext();
  const currentUserId = resolveProfileIdentity(user);
  const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(10); const [status, setStatus] = useState<AuctionStatus | "">(""); const [open, setOpen] = useState(Boolean(initialVehicleId)); const [notice, setNotice] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId);
  const [incrementType, setIncrementType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [incrementValue, setIncrementValue] = useState("");
  const [currency, setCurrency] = useState<"UZS" | "USD">("UZS");
  const auctions = useAuctionFeed({ page, sellerId: currentUserId, size: pageSize, status }); const initialAuction = useAuctionByVehicle(initialVehicleId || null); const create = useCreateAuction(); const relistVehicle = useRelistVehicle();
  const auctionItems = useMemo(() => (auctions.data?.items ?? []) as Auction[], [auctions.data?.items]);
  const eligibilityAuctions = useMemo(() => {
    const targetedAuction = initialAuction.data as Auction | undefined;
    if (!targetedAuction) return auctionItems;
    const targetedId = String(targetedAuction.auctionId ?? targetedAuction.id ?? "");
    return [targetedAuction, ...auctionItems.filter((auction) => String(auction.auctionId ?? auction.id ?? "") !== targetedId)];
  }, [auctionItems, initialAuction.data]);
  const nestedVehicles = useMemo(() => eligibilityAuctions.flatMap((auction) => auction.vehicle ? [auction.vehicle] : []), [eligibilityAuctions]);
  const totalPages = Math.max(1, Number(auctions.data?.meta.pages ?? 1));
  const eligibilityError = auctions.isError || initialAuction.isError;
  const eligibilityLoading = auctions.isLoading || (Boolean(initialVehicleId) && initialAuction.isLoading);
  const vehicleList = useMemo(() => eligibleVehicleOptions(nestedVehicles, currentUserId, eligibilityAuctions), [currentUserId, eligibilityAuctions, nestedVehicles]);
  const initialVehicleEligible = vehicleList.some((vehicle) => idOfVehicle(vehicle) === initialVehicleId);
  const initialVehicleRejected = Boolean(initialVehicleId && !eligibilityError && !eligibilityLoading && !initialVehicleEligible);
  const visibleNotice = notice || (initialVehicleRejected ? t.unavailableVehicle : "");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setNotice(""); if (!selectedVehicleId || !vehicleList.some((vehicle) => idOfVehicle(vehicle) === selectedVehicleId)) { setNotice(t.unavailableVehicle); return; } const data = new FormData(event.currentTarget); const selectedAuction = eligibilityAuctions.find((auction) => idOfAuctionVehicle(auction) === selectedVehicleId); try { if (canRelistAuction(selectedAuction)) await relistVehicle.mutateAsync(selectedVehicleId); await create.mutateAsync({ vehicleId: Number(selectedVehicleId), startPrice: parseFormattedNumber(data.get("startPrice")), reservePrice: parseFormattedNumber(data.get("reservePrice")), currency, incrementType, incrementValue: parseFormattedNumber(data.get("incrementValue")), depositPercent: Number(data.get("depositPercent")), startTime: new Date(String(data.get("startTime"))).toISOString(), endTime: new Date(String(data.get("endTime"))).toISOString() }); setOpen(false); setNotice("success"); } catch (error) { setNotice(apiErrorMessage(error, t.formError, currentLang)); } }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div className="w-full max-w-60"><AppSelect label={t.status} value={status} onChange={(val) => { setStatus(val as AuctionStatus | ""); setPage(0); }} options={[{ value: "", label: t.all }, ...AUCTION_STATUSES.map((item) => ({ value: item, label: statusLabels[currentLang][item] }))] } /></div><button className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-champagne-500 px-5 text-sm font-extrabold text-brand-navy-950 disabled:opacity-50" onClick={() => { setNotice(""); setSelectedVehicleId(""); setIncrementType("FIXED"); setIncrementValue(""); setOpen(true); }} disabled={userLoading || currentUserId === null || eligibilityLoading || eligibilityError || vehicleList.length === 0}><Plus size={18}/>{t.create}</button></div>
    {eligibilityError ? <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-semantic-danger/30 bg-semantic-danger-surface px-4 py-3 text-sm font-bold text-semantic-danger"><span>{t.eligibilityError}</span><button className="rounded-md border border-current px-3 py-2" onClick={() => { void auctions.refetch(); if (initialVehicleId) void initialAuction.refetch(); }}>{t.retry}</button></div> : null}
    {!eligibilityError && !userLoading && currentUserId !== null && !eligibilityLoading && !vehicleList.length ? <p className="text-sm text-semantic-warning">{t.noVehicles}</p> : null}
    {visibleNotice ? <div role={visibleNotice === "success" ? "status" : "alert"} className={`rounded-md border px-4 py-3 text-sm font-bold ${visibleNotice === "success" ? "bg-semantic-success-surface text-semantic-success" : "bg-semantic-danger-surface text-semantic-danger"}`}>{visibleNotice === "success" ? t.success : visibleNotice}</div> : null}
    {auctions.isLoading ? <AuctionCardGridSkeleton label={t.loading}/> : auctions.isError ? <StatePanel icon={<Gavel/>} title={t.loadError} action={<button className="rounded-md bg-brand-navy-900 px-4 py-2 text-sm font-bold text-white" onClick={() => auctions.refetch()}>{t.retry}</button>}/> : !auctionItems.length ? <StatePanel icon={<Gavel/>} title={t.empty} description={t.emptyBody}/> : <>
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {auctionItems.map((auction, index) => {
          const vehicleId = idOfAuctionVehicle(auction);
          const selectedAuction = selectVehicleAuction(auctionItems, vehicleId);
          return <DashboardAuctionCard auction={auction} canRelist={selectedAuction === auction && canRelistAuction(auction)} locale={currentLang} priceLabel={t.price} key={auction.auctionId ?? auction.id ?? index}/>;
        })}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3"><PageSizeSelect disabled={auctions.isFetching} value={pageSize} onChange={(size) => { setPageSize(size); setPage(0); }}/><button aria-label={translateUiText("previousPage", currentLang)} className="rounded-md border p-2 disabled:opacity-40" disabled={!page} onClick={() => setPage((current) => Math.max(0, current - 1))}><ChevronLeft/></button><span className="text-sm font-bold">{t.page} {page + 1} / {totalPages}</span><button aria-label={translateUiText("nextPage", currentLang)} className="rounded-md border p-2 disabled:opacity-40" disabled={page >= totalPages - 1} onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}><ChevronRight/></button></div>
    </>}
    {open && (!initialVehicleId || initialVehicleEligible) ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy-950/65 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}><div role="dialog" aria-modal="true" aria-labelledby="auction-form-title" className="my-6 w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 id="auction-form-title" className="text-2xl font-extrabold text-brand-navy-900">{relist ? t.relistTitle : t.create}</h2>{relist ? <p className="mt-2 text-sm text-text-secondary">{t.relistBody}</p> : null}</div><button aria-label={t.cancel} onClick={() => setOpen(false)}><X/></button></div><form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
      <div className="text-sm font-bold sm:col-span-2">{t.vehicle}<AppSelect className="mt-1" name="vehicleId" placeholder={t.selectVehicle} value={selectedVehicleId} onChange={(value) => setSelectedVehicleId(String(value))} options={vehicleList.map((v) => { const id = String(v.vehicleId ?? v.id); return { value: id, label: `${v.makeName} ${v.modelName} ${v.year} — #${id}` }; })} /></div>
      <MoneyInput label={t.startPrice} name="startPrice" tooltip={t.startPriceHelp}/>
      <MoneyInput label={t.reservePrice} name="reservePrice"/>
      <div className="text-sm font-bold">{t.currency}<AppSelect className="mt-1" name="currency" value={currency} onChange={(val) => setCurrency(String(val) as "UZS" | "USD")} options={[{ value: "UZS", label: "So‘m (UZS)" }, { value: "USD", label: "Dollar (USD)" }]} /></div>
      <label className="text-sm font-bold">{t.deposit}<input required min="0" max="100" step="0.01" type="number" name="depositPercent" className={field}/></label>
      <div className="text-sm font-bold">{t.incrementType}<AppSelect className="mt-1" name="incrementType" value={incrementType} onChange={(val) => { const next = String(val) as "FIXED" | "PERCENTAGE"; setIncrementType(next); setIncrementValue(""); }} options={[{ value: "FIXED", label: t.fixed }, { value: "PERCENTAGE", label: t.percentage }]} /></div>
      <label className="text-sm font-bold">{t.incrementValue}<span className="relative mt-1 block"><input required inputMode={incrementType === "FIXED" ? "numeric" : "decimal"} name="incrementValue" className={`${field} mt-0 ${incrementType === "PERCENTAGE" ? "pr-9" : ""}`} onChange={(event) => setIncrementValue(incrementType === "FIXED" ? formatThousands(event.target.value) : event.target.value.replace(/[^\d.]/g, ""))} value={incrementValue}/>{incrementType === "PERCENTAGE" ? <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-extrabold text-text-secondary">%</span> : null}</span></label>
      <label className="text-sm font-bold">{t.start}<input required type="datetime-local" name="startTime" className={field}/></label><label className="text-sm font-bold">{t.end}<input required type="datetime-local" name="endTime" className={field}/></label><div className="mt-2 flex justify-end gap-3 sm:col-span-2"><button type="button" className="min-h-11 rounded-md border px-5 text-sm font-bold" onClick={() => setOpen(false)}>{t.cancel}</button><button disabled={create.isPending || relistVehicle.isPending} className="min-h-11 rounded-md bg-brand-navy-900 px-5 text-sm font-extrabold text-white disabled:opacity-60">{create.isPending || relistVehicle.isPending ? t.saving : t.save}</button></div>
    </form></div></div> : null}
  </div>;
}
