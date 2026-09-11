"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Gavel,
  Radio,
  RefreshCw,
  WifiOff,
  X,
} from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { api } from "@/api/api";
import {
  BidLedger,
  type AuctionBidEntry,
} from "@/components/auction/BidLedger";
import { StatePanel } from "@/components/feedback/StatePanel";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
import { useUserContext } from "@/context/UserContext";
import { LangSwitch } from "@/context/LangSwitch";
import { useModalFocus } from "@/hooks/useModalFocus";
import { useHydrated } from "@/hooks/useHydrated";
import { useSocket } from "@/hooks/useStomp";
import { adaptAuction } from "@/lib/auction/adaptAuction";
import {
  calculateAntiSnippingExtension,
  calculateAntiSnippingSeconds,
} from "@/lib/auction/antiSnipping";
import { checkDepositCutoff } from "@/lib/auction/depositEligibility";
import {
  canonicalizeBidAmount,
  getNextBid,
} from "@/lib/auction/bidding";
import type { VehicleAuction } from "@/lib/auction/types";
import { resolveProfileIdentity } from "@/lib/auth/profileIdentity";
import { formatAuctionPrice } from "@/lib/formatting/auction";
import {
  parseUzbekistanDate,
  parseUzbekistanTimestamp,
  UZBEKISTAN_TIMEZONE,
} from "@/lib/formatting/date";
import { auctionDetailHref } from "@/lib/routing/auctionRouteId";
import type { ChampagneLocale } from "@/locales/champagne";
import { useBidsByLot, useHighestBid } from "@/queries/bid";
import { useAuction } from "@/queries/auction-listings";
import { useUserDeposits } from "@/queries/users";
import { AuctionSaleGate } from "./files(2)/AuctionSaleGate";

export type LiveConnectionState =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "polling"
  | "offline"
  | "unavailable";

type BidderState = "leading" | "outbid" | "watching";

class ExplicitBidRejection extends Error { }

function backendMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  const record = asRecord(error);
  const response = asRecord(record?.response);
  const data = asRecord(response?.data);

  return String(
    data?.message ??
    data?.error ??
    record?.message ??
    record?.error ??
    "",
  );
}

function translatedBidError(error: unknown, labels: (typeof copy)[ChampagneLocale]): string {
  const message = backendMessage(error);
  const normalized = message.toLowerCase();

  if (
    normalized.includes("second bid in a row is not allowed") ||
    normalized.includes("second bid") ||
    normalized.includes("ketma-ket")
  ) {
    return labels.ownBidLocked;
  }

  if (
    normalized.includes("insufficient") ||
    normalized.includes("balance") ||
    normalized.includes("mablag") ||
    normalized.includes("yetarli emas") ||
    normalized.includes("недостаточно") ||
    normalized.includes("средств")
  ) {
    return labels.insufficientBalance;
  }

  if (
    normalized.includes("kyc") ||
    normalized.includes("not verified") ||
    normalized.includes("unverified") ||
    normalized.includes("tasdiqlanmagan")
  ) {
    return labels.kycRequired;
  }

  if (normalized.includes("invalid bid")) {
    return labels.rejected;
  }

  return labels.unconfirmed;
}

interface BidConfirmationScope {
  amount: number;
  auctionId: string;
  nextBid: number;
  userId: string | null;
}

function isLiveConnectionState(value: unknown): value is LiveConnectionState {
  return (
    value === "connecting" ||
    value === "connected" ||
    value === "reconnecting" ||
    value === "polling" ||
    value === "offline" ||
    value === "unavailable"
  );
}

const copy = {
  uz: {
    back: "Lot kartasiga qaytish",
    eyebrow: "Jonli avtomobil auksioni",
    current: "Joriy yetakchi narx",
    remaining: "Tugash vaqt",
    ended: "Auksion yakunlandi",
    awaitingServer: "Server holati yangilanishi kutilmoqda",
    minimum: "Qabul qilinadigan minimal taklif",
    bidLabel: "Taklifingiz",
    place: "Taklif berish",
    confirmTitle: "Taklifni tasdiqlash",
    confirmBody:
      "Miqdorni tekshiring. Server joriy auksion holati va taklifga ruxsatni qayta tekshiradi.",
    confirm: "Taklifni tasdiqlash",
    submitting: "Taklif yuborilmoqda…",
    cancel: "Bekor qilish",
    leading: "Siz yetakchilik qilyapsiz",
    outbid: "Sizning taklifingiz oshirildi",
    watching: "Auksionni kuzatyapsiz",
    connected: "Jonli ulanish",
    connecting: "Jonli ulanish o‘rnatilmoqda",
    reconnecting: "Qayta ulanmoqda",
    polling: "REST yangilanish rejimi",
    offline: "Internet aloqasi yo‘q",
    unavailable: "Jonli transport mavjud emas",
    pollingDetail:
      "Narx va takliflar REST orqali davriy yangilanmoqda.",
    unavailableDetail:
      "Ishlab chiqarish muhiti uchun WebSocket manzili sozlanmagan.",
    success: "Taklif qabul qilindi.",
    rejected:
      "Server taklifni rad etdi. Miqdor va auksion holatini tekshirib, keyin qayta urinib ko‘ring.",
    ownBidLocked:
      "Siz ketma-ket ikki marta taklif bera olmaysiz. Yana taklif berish uchun avval boshqa foydalanuvchi taklif kiritishi kerak.",
    unconfirmed:
      "Taklif yozilganini tasdiqlab bo‘lmadi. Qayta urinishdan oldin takliflar daftarini va hisob tarixini tekshiring.",
    login: "Taklif berish uchun hisobga kiring.",
    deposit: "Taklif berishdan oldin lot kartasida 1% kafolat pulini kiriting.",
    depositCutoff:
      "Auksion tugashiga 5 daqiqadan kam vaqt qolganda kafolat puli to‘lash va ishtirok etish mumkin emas.",
    depositUnknown:
      "Kafolat puli holatini tasdiqlab bo‘lmadi. Taklif berishdan oldin holatni yangilang.",
    refreshDeposit: "Kafolat puli holatini yangilash",
    marketUnknown:
      "Joriy narx va minimal taklifni tasdiqlab bo‘lmadi. Taklif berishdan oldin yangilang.",
    ruleUnknown:
      "Aniq minimal taklifni hisoblab bo‘lmadi: valyuta yoki taklif qoidasi qo‘llab-quvvatlanmaydi. Taklif berish o‘chirilgan.",
    minimumUnavailable: "Mavjud emas",
    invalidStep:
      "Taklif miqdori valyuta qadamiga mos bo‘lishi kerak: {step}.",
    refreshMarket: "Taklif holatini yangilash",
    notStarted: "Auksion hali boshlanmagan. Taklif berish boshlanish vaqtida ochiladi.",
    closed: "Auksion yopilgan. Taklif berish endi mavjud emas.",
    bidUnavailable: "Bu hisob uchun taklif berish hozir mavjud emas.",
    viewResult: "Auksion natijasini ko‘rish",
    openDetail: "Lot kartasini ochish",
    auctionLoading: "Jonli auksion yuklanmoqda",
    auctionLoadingBody: "Lotning joriy ma’lumotlari olinmoqda.",
    auctionError: "Jonli auksionni yuklab bo‘lmadi",
    auctionErrorBody:
      "Lot ma’lumotini olib bo‘lmadi. Bu holat lot topilmaganini anglatmaydi; qayta urinib ko‘ring.",
    retryLot: "Qayta urinish",
    noVehicle: "Avtomobil auksioni topilmadi",
    noVehicleBody: "Bu yozuv mavjud emas yoki avtomobil loti emas.",
    extended: "Anti-snipping: auksion tugashiga 2 daqiqadan kam qolganda yangi taklif berildi — auksion 5 daqiqaga uzaytirildi!",
    startTime: "Boshlanish vaqti",
    endTime: "Tugash vaqti",
    period: "Auksion davri",
    dateFormat: "{start} dan {end} gacha",
    auctionStartedTitle: "Auksion boshlandi",
    auctionStartedBody:
      "Siz kutgan auksion endi jonli. Takliflarni kuzatish uchun xonani oching.",
    staleBid:
      "Auksion holati yoki minimal taklif o‘zgardi. Miqdorni yangilab, qayta tasdiqlang.",
    accountChanged:
      "Taklif javobi oldingi hisobga tegishli. Qayta urinishdan oldin o‘sha hisob tarixini tekshiring.",
    insufficientBalance:
      "Hisobingizda mablag‘ yetarli emas. Iltimos, hisobingizni to‘ldiring.",
    kycRequired:
      "Auksionda ishtirok etish uchun shaxsingiz tasdiqlangan bo‘lishi shart.",
  },
  ru: {
    back: "Вернуться к карточке лота",
    eyebrow: "Прямой автомобильный аукцион",
    current: "Текущая лидирующая цена",
    remaining: "Конец времени",
    ended: "Аукцион завершён",
    awaitingServer: "Ожидается обновление статуса сервера",
    minimum: "Минимальная допустимая ставка",
    bidLabel: "Ваша ставка",
    place: "Сделать ставку",
    confirmTitle: "Подтвердить ставку",
    confirmBody:
      "Проверьте сумму. Сервер повторно проверит текущее состояние аукциона и право на ставку.",
    confirm: "Подтвердить ставку",
    submitting: "Ставка отправляется…",
    cancel: "Отмена",
    leading: "Ваша ставка лидирует",
    outbid: "Вашу ставку перебили",
    watching: "Вы наблюдаете за аукционом",
    connected: "Прямое подключение",
    connecting: "Устанавливается прямое подключение",
    reconnecting: "Повторное подключение",
    polling: "Обновление через REST",
    offline: "Нет подключения к интернету",
    unavailable: "Прямой канал недоступен",
    pollingDetail: "Цена и ставки периодически обновляются через REST.",
    unavailableDetail:
      "Для производственной среды не задан адрес WebSocket.",
    success: "Ставка принята.",
    rejected:
      "Сервер отклонил ставку. Проверьте сумму и состояние аукциона перед повторной попыткой.",
    ownBidLocked:
      "Нельзя делать две ставки подряд с одного аккаунта. Подождите, пока другой участник сделает ставку, и попробуйте снова.",
    unconfirmed:
      "Не удалось подтвердить, была ли ставка записана. Перед повторной попыткой проверьте журнал ставок и историю счёта.",
    login: "Войдите в аккаунт, чтобы сделать ставку.",
    deposit: "Перед ставкой внесите гарантийный взнос 1% в карточке лота.",
    depositCutoff:
      "При менее чем 5 минутах до окончания аукциона внесение гарантийного взноса и участие не разрешены.",
    depositUnknown:
      "Не удалось подтвердить состояние взноса. Обновите его перед ставкой.",
    refreshDeposit: "Обновить состояние взноса",
    marketUnknown:
      "Не удалось подтвердить текущую цену и минимальную ставку. Обновите их перед ставкой.",
    ruleUnknown:
      "Точную минимальную ставку невозможно рассчитать: валюта или правило ставки не поддерживается. Ставки отключены.",
    minimumUnavailable: "Недоступно",
    invalidStep: "Сумма ставки должна соответствовать шагу валюты: {step}.",
    refreshMarket: "Обновить состояние торгов",
    notStarted: "Аукцион ещё не начался. Ставки откроются во время старта.",
    closed: "Аукцион закрыт. Ставки больше недоступны.",
    bidUnavailable: "Для этого аккаунта ставки сейчас недоступны.",
    viewResult: "Посмотреть результат аукциона",
    openDetail: "Открыть карточку лота",
    auctionsLoading: "Загрузка прямого аукциона",
    auctionLoadingBody: "Получаем актуальные данные лота.",
    auctionError: "Не удалось загрузить прямой аукцион",
    auctionErrorBody:
      "Данные лота не получены. Это не означает, что лот не найден; попробуйте ещё раз.",
    retryLot: "Повторить",
    noVehicle: "Автомобильный аукцион не найден",
    noVehicleBody: "Запись не существует или не является автомобильным лотом.",
    extended: "Анти-снайпинг: новая ставка в последние 2 минуты продлила аукцион на 5 минут!",
    startTime: "Время начала",
    endTime: "Время окончания",
    period: "Период аукциона",
    dateFormat: "с {start} по {end}",
    auctionStartedTitle: "Аукцион начался",
    auctionStartedBody:
      "Аукцион, который вы ждали, теперь в прямом эфире. Откройте комнату, чтобы следить за ставками.",
    staleBid:
      "Статус аукциона или минимальная ставка изменились. Обновите сумму и подтвердите снова.",
    accountChanged:
      "Ответ по ставке относится к предыдущему аккаунту. Перед повторной попыткой проверьте историю того аккаунта.",
    insufficientBalance:
      "Недостаточно средств на балансе. Пожалуйста, пополните счёт.",
    kycRequired:
      "Для участия в аукционе требуется подтверждённая верификация.",
  },
  en: {
    back: "Back to lot details",
    eyebrow: "Live vehicle auction",
    current: "Current leading price",
    remaining: "End time",
    ended: "Auction finished",
    awaitingServer: "Awaiting server status",
    minimum: "Minimum accepted bid",
    bidLabel: "Your bid",
    place: "Place bid",
    confirmTitle: "Confirm bid",
    confirmBody:
      "Review the amount. The server will re-check the current auction state and bidding eligibility.",
    confirm: "Confirm bid",
    submitting: "Submitting bid…",
    cancel: "Cancel",
    leading: "You are leading",
    outbid: "You have been outbid",
    watching: "You are watching the auction",
    connected: "Live connection",
    connecting: "Connecting live updates",
    reconnecting: "Reconnecting",
    polling: "Polling fallback",
    offline: "You are offline",
    unavailable: "Live transport unavailable",
    pollingDetail: "Price and bids are refreshing periodically over REST.",
    unavailableDetail:
      "A production WebSocket URL has not been configured.",
    success: "Your bid was accepted.",
    rejected:
      "The server rejected this bid. Check the amount and auction state before trying again.",
    ownBidLocked:
      "You cannot place two bids in a row from the same account. Wait until another bidder places a bid, then try again.",
    unconfirmed:
      "We could not confirm whether the bid was recorded. Check the bid ledger and account activity before retrying.",
    login: "Log in before placing a bid.",
    deposit: "Pay the 1% deposit on the lot detail page before bidding.",
    depositCutoff:
      "Deposits and participation are not allowed when less than 5 minutes remain before the auction ends.",
    depositUnknown:
      "Deposit status could not be confirmed. Refresh it before bidding.",
    refreshDeposit: "Refresh deposit status",
    marketUnknown:
      "Current price and minimum bid could not be confirmed. Refresh them before bidding.",
    ruleUnknown:
      "The exact minimum bid cannot be calculated because the currency or bid rule is unsupported. Bidding is disabled.",
    minimumUnavailable: "Unavailable",
    invalidStep: "The bid amount must use the supported currency step: {step}.",
    refreshMarket: "Refresh bid state",
    notStarted: "This auction has not started yet. Bidding opens at the start time.",
    closed: "This auction is closed. Bidding is no longer available.",
    bidUnavailable: "Bidding is currently unavailable for this account.",
    viewResult: "View auction result",
    openDetail: "Open lot details",
    auctionLoading: "Loading live auction",
    auctionLoadingBody: "Retrieving the current lot details.",
    auctionError: "Live auction could not be loaded",
    auctionErrorBody:
      "The auction service did not return the lot. Try again before treating it as unavailable.",
    retryLot: "Try again",
    noVehicle: "Vehicle auction not found",
    noVehicleBody: "This record is unavailable or is not a vehicle lot.",
    extended: "Anti-snipping: a new bid in the final 2 minutes extended the auction by 5 minutes!",
    startTime: "Start time",
    endTime: "End time",
    period: "Auction period",
    dateFormat: "{start} to {end}",
    auctionStartedTitle: "Auction started",
    auctionStartedBody:
      "The auction you were waiting for is now live. Open the room to follow bidding.",
    staleBid:
      "The auction state or minimum bid changed. Update the amount and confirm again.",
    accountChanged:
      "This bid response belongs to the previous account. Check that account's activity before retrying.",
    insufficientBalance:
      "Insufficient funds. Please top up your balance.",
    kycRequired:
      "Identity verification is required to participate.",
  },
} as const;

const localeTags: Record<ChampagneLocale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

function formatSolidDateTime(dateVal: string | number | Date | null | undefined, locale: string = "ru") {
  if (!dateVal) return "—";
  try {
    const d = typeof dateVal === "string" ? parseUzbekistanDate(dateVal) : new Date(dateVal);
    if (isNaN(d.getTime())) return "—";
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: UZBEKISTAN_TIMEZONE,
      year: "numeric",
      month: "numeric",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const read = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? "";
    const mNum = Number(read("month"));
    const monthRu = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
    const monthUz = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
    const monthEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const months = locale === "uz" ? monthUz : locale === "en" ? monthEn : monthRu;
    const monthStr = months[mNum - 1] || "";
    return `${read("day")} ${monthStr} ${read("year")} · ${read("hour")}:${read("minute")}`;
  } catch {
    return "—";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrap(value: unknown): unknown {
  const record = asRecord(value);
  return record?.data ?? value;
}

function latest(value: unknown): unknown {
  const unwrapped = unwrap(value);
  return Array.isArray(unwrapped)
    ? unwrapped[unwrapped.length - 1] ?? null
    : unwrapped;
}

function numeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function identifier(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function normalizeBid(value: unknown, index = 0): AuctionBidEntry | null {
  const record = asRecord(value);
  if (!record) return null;
  const bidder = asRecord(record.bidderDto ?? record.bidder);
  const amount = numeric(record.bidAmount ?? record.amount);
  const timestampValue = record.bidTime ?? record.timestamp ?? record.createdAt;
  const timestamp =
    typeof timestampValue === "string" && !Number.isNaN(Date.parse(timestampValue))
      ? timestampValue
      : null;
  if (amount === null || timestamp === null) return null;

  const bidderId = identifier(bidder?.id ?? record.bidderId);
  const firstname = String(bidder?.firstname ?? bidder?.firstname ?? "").trim()
  const lastname = String(bidder?.lastname ?? bidder?.lastname ?? "").trim()
  const fullName = [
    firstname,
    lastname.length > 0 ? lastname[0] + "." : "",
  ].filter(Boolean).join(" ").trim();

  const bidderLabel = fullName || (typeof bidder?.secretName === "string" && bidder.secretName.trim() ? bidder.secretName.trim() : null) || (typeof bidder?.email === "string" ? bidder.email : null) || `Bidder #${bidderId ?? index + 1}`

  return {
    id: identifier(record.id) ?? `${timestamp}-${index}`,
    amount,
    timestamp,
    bidderId,
    bidderLabel,
  };

  // const suppliedLabel =
  //   typeof bidder?.secretName === "string" && bidder.secretName.trim()
  //     ? bidder.secretName.trim()
  //     : null;

  // return {
  //   id: identifier(record.id) ?? `${timestamp}-${index}`,
  //   amount,
  //   timestamp,
  //   bidderId,
  //   bidderLabel:
  //     suppliedLabel ?? `Bidder ••${(bidderId ?? String(index + 1)).slice(-2)}`,
  // };
}

function normalizeBids(value: unknown): AuctionBidEntry[] {
  const unwrapped = unwrap(value);
  const list = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray(asRecord(unwrapped)?.content)
      ? (asRecord(unwrapped)?.content as unknown[])
      : [];
  return list.flatMap((entry, index) => {
    const bid = normalizeBid(entry, index);
    return bid ? [bid] : [];
  });
}

function normalizeAuction(value: unknown): VehicleAuction | null {
  const record = latest(value);
  return adaptAuction(record);
}

function depositedLotIds(value: unknown): Set<string> {
  const unwrapped = unwrap(value);
  const record = asRecord(unwrapped);
  const list = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray(record?.contents)
      ? record.contents
      : Array.isArray(record?.content)
        ? record.content
        : Array.isArray(record?.data)
          ? record.data
          : [];

  return new Set(
    list.flatMap((entry) => {
      const entryRecord = asRecord(entry);
      // Serverdan kelishi mumkin bo'lgan turli field nomlari:
      // - auctionId (asosiy)
      // - lotId (eski lot tizimi)
      // - auction.id (ichma-ich object)
      // - id (deposit id'si emas, auction/lot id'si bo'lishi mumkin)
      const nestedAuction = asRecord(entryRecord?.auction);
      const auctionIdFromNested = nestedAuction
        ? identifier(nestedAuction.id ?? nestedAuction.auctionId)
        : null;
      const id = identifier(
        auctionIdFromNested ??
        entryRecord?.auctionId ??
        entryRecord?.lotId ??
        entryRecord?.id,
      );
      return id ? [id] : [];
    }),
  );
}

function useRemainingTime(
  endTime: string | null,
  serverRemainingSeconds?: number | null,
) {
  const [clock, setClock] = useState<number | null>(null);
  const [syncedSeconds, setSyncedSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (
      typeof serverRemainingSeconds === "number" &&
      !Number.isNaN(serverRemainingSeconds)
    ) {
      const timer = window.setTimeout(() => {
        setSyncedSeconds(Math.max(0, serverRemainingSeconds));
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [serverRemainingSeconds]);

  const hasSyncedSeconds = syncedSeconds !== null;
  useEffect(() => {
    if (syncedSeconds === null || syncedSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setSyncedSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [hasSyncedSeconds, syncedSeconds]);

  useEffect(() => {
    const end = endTime ? parseUzbekistanTimestamp(endTime) : Number.NaN;
    let interval: number | undefined;

    const startTimer = window.setTimeout(() => {
      if (Number.isNaN(end)) {
        setClock(null);
        return;
      }

      const tick = () => {
        const currentNow = Date.now();
        setClock(Math.min(currentNow, end));
        if (currentNow >= end && interval !== undefined) {
          window.clearInterval(interval);
        }
      };

      tick();
      if (Date.now() < end) interval = window.setInterval(tick, 1_000);
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [endTime]);

  if (!endTime || (clock === null && syncedSeconds === null)) return null;
  const endMs = parseUzbekistanTimestamp(endTime);
  const remaining = Math.max(0, endMs - (clock ?? endMs));
  if (!Number.isFinite(remaining) && syncedSeconds === null) return null;
  const totalSeconds =
    syncedSeconds !== null ? syncedSeconds : Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, ended: totalSeconds === 0 };
}

function useNow() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());

    tick();
    const interval = window.setInterval(tick, 1_000);
    return () => window.clearInterval(interval);
  }, []);

  return now;
}

// bu yerga



export interface LiveAuctionRoomProps {
  auctionId: string;
  initialAuction?: VehicleAuction | null;
  initialBids?: readonly AuctionBidEntry[];
  initialHighestBid?: AuctionBidEntry | null;
  connectionStateOverride?: LiveConnectionState;
  bidderStateOverride?: BidderState;
  canBidOverride?: boolean;
  onPlaceBidOverride?: (amount: number) => Promise<void> | void;
}

export function LiveAuctionRoom(props: LiveAuctionRoomProps) {
  return <LiveAuctionRoomRoute key={props.auctionId} {...props} />;
}

function LiveAuctionRoomRoute({
  auctionId,
  initialAuction = null,
  initialBids = [],
  initialHighestBid = null,
  connectionStateOverride,
  bidderStateOverride,
  canBidOverride,
  onPlaceBidOverride,
}: LiveAuctionRoomProps) {
  const { currentLang } = useContext(LangSwitch);
  const locale = currentLang as ChampagneLocale;
  const labels = copy[locale];
  const hydrated = useHydrated();
  const { user: contextUser } = useUserContext();


  const user = hydrated ? contextUser : null;
  const profileIdentity = resolveProfileIdentity(user);
  const userId = profileIdentity === null ? null : String(profileIdentity);
  const activeUserIdRef = useRef(userId);
  const previousUserIdRef = useRef(userId);
  const submissionScopeRef = useRef(0);
  const queryClient = useQueryClient();
  const auctionQuery = useAuction(auctionId);
  const highestBidQuery = useHighestBid(auctionId);
  const bidsQuery = useBidsByLot(auctionId);
  const depositsQuery = useUserDeposits(userId ?? 0);
  const refetchAuction = auctionQuery.refetch;
  const refetchHighestBid = highestBidQuery.refetch;
  const refetchBids = bidsQuery.refetch;
  const socket = useSocket({ pollingAvailable: true });
  const [socketHighestBid, setSocketHighestBid] =
    useState<AuctionBidEntry | null>(null);
  const [socketBids, setSocketBids] = useState<AuctionBidEntry[] | null>(null);
  const [serverRemainingSeconds, setServerRemainingSeconds] = useState<number | null>(null);
  const [confirmingBid, setConfirmingBid] = useState(false);
  const [confirmationScope, setConfirmationScope] =
    useState<BidConfirmationScope | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<
    { tone: "success" | "danger" | "warning"; message: string } | null
  >(null);
  const [bidAmount, setBidAmount] = useState("");
  const userEditedBid = useRef(false);
  const [extended, setExtended] = useState(false);
  const [effectiveEndTime, setEffectiveEndTime] = useState<string | null>(
    initialAuction?.endTime ?? null,
  );
  const previousHighestBidKeyRef = useRef<string | null>(null);
  const startNotificationShownRef = useRef(false);
  const previousHasStartedRef = useRef(false);
  const originalEndTime = useRef<string | null>(initialAuction?.endTime ?? null);

  const bidDialogRef = useModalFocus<HTMLDivElement>({
    isOpen: confirmingBid,
    onClose: () => {
      if (!submitting) {
        setConfirmingBid(false);
        setConfirmationScope(null);
      }
    },
  });
  const restAuction = normalizeAuction(auctionQuery.data);
  const auction = restAuction ?? initialAuction;

  useEffect(() => {
    if (!auction?.endTime) return;
    const timer = window.setTimeout(() => {
      setEffectiveEndTime((prev) => {
        if (!prev) return auction.endTime;
        const prevMs = parseUzbekistanTimestamp(prev);
        const serverMs = parseUzbekistanTimestamp(auction.endTime);
        return serverMs > prevMs ? auction.endTime : prev;
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [auction?.endTime]);

  const connectionState: LiveConnectionState = connectionStateOverride
    ? connectionStateOverride
    : !hydrated
      ? "connecting"
      : isLiveConnectionState(socket?.connectionState)
        ? socket.connectionState
        : socket?.connected
          ? "connected"
          : "polling";
  const useSocketSnapshots = connectionState === "connected";

  const restHighestBid = normalizeBid(latest(highestBidQuery.data));
  const highestBidStateKnown =
    (useSocketSnapshots && socketHighestBid !== null) ||
    (!highestBidQuery.isError && highestBidQuery.data !== undefined);
  const highestBid =
    (useSocketSnapshots ? socketHighestBid : null) ??
    restHighestBid ??
    initialHighestBid;
  const restBids = normalizeBids(bidsQuery.data);
  const bidLedgerStateKnown =
    (useSocketSnapshots && socketBids !== null) ||
    (!bidsQuery.isError && bidsQuery.data !== undefined);
  const bidMarketKnown = highestBidStateKnown && bidLedgerStateKnown;
  const bids =
    (useSocketSnapshots ? socketBids : null) ??
    (restBids.length > 0 ? restBids : [...initialBids]);
  const depositStatusKnown =
    !userId || (!depositsQuery.isError && depositsQuery.data !== undefined);
  const deposited =
    depositStatusKnown && depositedLotIds(depositsQuery.data).has(auctionId);
  const now = useNow();

  useEffect(() => {
    if (!highestBid) return;
    const bidKey = `${highestBid.id}:${highestBid.amount}`;
    if (previousHighestBidKeyRef.current === bidKey) return;
    const isInitial = previousHighestBidKeyRef.current === null;
    previousHighestBidKeyRef.current = bidKey;
    if (isInitial) return;

    const bidTime = parseUzbekistanTimestamp(highestBid.timestamp) || Date.now();
    const extension = calculateAntiSnippingExtension(effectiveEndTime, bidTime);
    if (extension.shouldExtend && extension.newEndTime) {
      const timer = window.setTimeout(() => {
        setEffectiveEndTime(extension.newEndTime);
        setExtended(true);
        setServerRemainingSeconds((prev) => {
          const secExt = calculateAntiSnippingSeconds(prev);
          return secExt.shouldExtend && secExt.newSeconds !== null ? secExt.newSeconds : prev;
        });
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [highestBid, effectiveEndTime]);

  const isBiddingWindow =
    auction?.status === "live" ||
    auction?.status === "ending-soon" ||
    (now !== null &&
      !!auction?.startTime &&
      !!effectiveEndTime &&
      parseUzbekistanTimestamp(auction.startTime) <= now &&
      parseUzbekistanTimestamp(effectiveEndTime) > now);
  const isOpeningBid = !highestBid && bids.length === 0;
  const nextBid = auction
    ? isOpeningBid
      ? canonicalizeBidAmount(auction.startPrice ?? NaN)
      : getNextBid(auction, highestBid?.amount ?? auction.currentPrice)
    : null;

  const bidRuleKnown = nextBid !== null;
  const bidderEligible =
    canBidOverride ??
    (Boolean(userId && user) &&
      deposited &&
      bidMarketKnown &&
      isBiddingWindow);

  const canBid = Boolean(bidderEligible && bidRuleKnown);


  const currentPrice =
    highestBid?.amount ?? auction?.currentPrice ?? auction?.startPrice ?? null;


  // time start 
  const numericBidAmount = Number(bidAmount);
  const canonicalBidAmount = canonicalizeBidAmount(numericBidAmount);

  const hasStarted = now !== null && auction?.startTime
    ? parseUzbekistanTimestamp(auction.startTime) <= now
    : false;

  const depositCutoff = checkDepositCutoff({
    status: auction?.status,
    startTime: auction?.startTime,
    endTime: effectiveEndTime,
    remainingSeconds: serverRemainingSeconds,
    now: now ?? Date.now(),
  });
  const isDepositCutoffReached = depositCutoff.isCutoffReached;

  const hasEnded = now !== null && effectiveEndTime
    ? parseUzbekistanTimestamp(effectiveEndTime) <= now
    : false;

  const targetTime = hasStarted
    ? effectiveEndTime ?? null
    : auction?.startTime ?? null;

  const remaining = useRemainingTime(targetTime, serverRemainingSeconds);

  useEffect(() => {
    if (!auction?.id || !auction.startTime) {
      previousHasStartedRef.current = false;
      startNotificationShownRef.current = false;
      return;
    }

    const wasStarted = previousHasStartedRef.current;
    previousHasStartedRef.current = hasStarted;

    if (!hasStarted || wasStarted || startNotificationShownRef.current) return;
    if (typeof window === "undefined" || typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    startNotificationShownRef.current = true;
    new Notification(`${labels.auctionStartedTitle} · #${auction.lotNumber ?? auction.id}`, {
      body:
        auction.title[locale] ??
        auction.title.default ??
        labels.auctionStartedBody,
      tag: `auction-start-${auction.id}`,
    });
  }, [
    auction?.id,
    auction?.lotNumber,
    auction?.startTime,
    auction?.title,
    hasStarted,
    labels.auctionStartedBody,
    labels.auctionStartedTitle,
    locale,
  ]);




  // timer end
  const bidIsValid = Boolean(
    canBid &&
    nextBid !== null &&
    canonicalBidAmount !== null &&
    (isOpeningBid
      ? canonicalBidAmount === nextBid
      : canonicalBidAmount >= nextBid),
  );
  const confirmationIsCurrent = Boolean(
    confirmationScope &&
    confirmationScope.auctionId === auctionId &&
    confirmationScope.userId === userId &&
    confirmationScope.amount === canonicalBidAmount &&
    confirmationScope.nextBid === nextBid &&
    bidIsValid,
  );

  useEffect(() => {
    activeUserIdRef.current = userId;
    if (previousUserIdRef.current === userId) return;

    previousUserIdRef.current = userId;
    submissionScopeRef.current += 1;
    userEditedBid.current = false;
    setBidAmount(nextBid === null ? "" : String(nextBid));
    setFeedback(null);
    setConfirmingBid(false);
    setConfirmationScope(null);
    setSubmitting(false);
  }, [nextBid, userId]);

  useEffect(() => {
    if (!auction?.endTime) return;
    if (originalEndTime.current === null) {
      originalEndTime.current = auction.endTime;
      return;
    }
    if (Date.parse(auction.endTime) > Date.parse(originalEndTime.current)) {
      originalEndTime.current = auction.endTime;
      setExtended(true);
    }
  }, [auction?.endTime]);

  useEffect(() => {
    if (nextBid === null || userEditedBid.current) return;
    setBidAmount(String(nextBid));
  }, [nextBid]);

  const visibleFeedback =
    confirmingBid && !submitting && !confirmationIsCurrent
      ? { tone: "warning" as const, message: labels.staleBid }
      : feedback;

  useEffect(() => {
    const logPrefix = "[LiveAuctionRoom WS]";
    console.debug(logPrefix, "Socket effect", {
      auctionId,
      connected: Boolean(socket?.connected),
      hasSubscribe: typeof socket?.subscribe === "function",
      hasPublish: typeof socket?.publish === "function",
    });

    if (!socket?.connected || typeof socket.subscribe !== "function") {
      console.warn(logPrefix, "Socket is not ready for subscriptions", {
        auctionId,
        connected: Boolean(socket?.connected),
      });
      return;
    }

    const highestBidTopic = `/topic/bids/auction/getHighestBid/${auctionId}`;
    const allBidsTopic = `/topic/bids/auction/getAllBidsByAuctionId/${auctionId}`;
    const highestBidRequest = `/app/bids/getHighestBid/${auctionId}`;
    const allBidsRequest = `/app/bids/getAllBidsByAuctionId/${auctionId}`;

    console.info(logPrefix, "Subscribing to auction streams", {
      auctionId,
      highestBidTopic,
      allBidsTopic,
    });

    const subscriptions = [
      socket.subscribe(
        highestBidTopic,
        (message: { body: string }) => {
          console.debug(logPrefix, "Highest bid message received", {
            auctionId,
            body: message.body,
          });
          try {
            const bid = normalizeBid(latest(JSON.parse(message.body)));
            console.debug(logPrefix, "Highest bid normalized", { auctionId, bid });
            if (bid) setSocketHighestBid(bid);
          } catch (error) {
            console.error(logPrefix, "Failed to parse highest bid message", {
              auctionId,
              error,
              body: message.body,
            });
            // Keep the last verified REST bid.
          }
        },
      ),
      socket.subscribe(
        allBidsTopic,
        (message: { body: string }) => {
          console.debug(logPrefix, "All bids message received", {
            auctionId,
            body: message.body,
          });
          try {
            const normalized = normalizeBids(JSON.parse(message.body));
            console.debug(logPrefix, "All bids normalized", {
              auctionId,
              count: normalized.length,
              bids: normalized,
            });
            setSocketBids(normalized);
          } catch (error) {
            console.error(logPrefix, "Failed to parse all bids message", {
              auctionId,
              error,
              body: message.body,
            });
            // Keep the last verified REST ledger.
          }
        },
      ),
      socket.subscribe(
        `/topic/auction/${auctionId}/time`,
        (message: { body: string }) => {
          try {
            const data = JSON.parse(message.body);
            const secs = data?.remainingSeconds ?? data?.seconds ?? data;
            if (typeof secs === "number") setServerRemainingSeconds(secs);
            if (data?.endTime && typeof data.endTime === "string") {
              setEffectiveEndTime(data.endTime);
              setExtended(true);
            }
          } catch { }
        },
      ),
      socket.subscribe(
        `/topic/auction/${auctionId}`,
        (message: { body: string }) => {
          try {
            const data = JSON.parse(message.body);
            if (typeof data?.remainingSeconds === "number") {
              setServerRemainingSeconds(data.remainingSeconds);
            }
            if (data?.endTime && typeof data.endTime === "string") {
              setEffectiveEndTime(data.endTime);
              setExtended(true);
            }
          } catch { }
        },
      ),
    ];

    console.info(logPrefix, "Publishing initial auction stream requests", {
      auctionId,
      highestBidRequest,
      allBidsRequest,
    });
    socket.publish?.({ destination: highestBidRequest });
    socket.publish?.({ destination: allBidsRequest });

    return () => {
      console.info(logPrefix, "Unsubscribing from auction streams", { auctionId });
      subscriptions.forEach((subscription) => subscription?.unsubscribe?.());
    };
  }, [auctionId, socket]);

  // useEffect(() => {
  //   const poll = () => {
  //     void refetchAuction?.();
  //     void refetchHighestBid?.();
  //     void refetchBids?.();
  //   };

  //   // Birinchi marta ham darhol chaqirsin
  //   poll();

  //   const interval = window.setInterval(poll, 3000);

  //   return () => window.clearInterval(interval);
  // }, [refetchAuction, refetchHighestBid, refetchBids]);
  useEffect(() => {
    // Websocket ishlayotgan bo'lsa REST polling kerak emas
    if (connectionState === "connected") {
      return;
    }

    const poll = () => {
      void refetchAuction?.();
      void refetchHighestBid?.();
      void refetchBids?.();
    };

    // polling mode ga o'tganda bir marta darhol yangilash
    poll();

    const interval = window.setInterval(poll, 3000);

    return () => window.clearInterval(interval);
  }, [
    connectionState,
    refetchAuction,
    refetchHighestBid,
    refetchBids,
  ]);
  const bidderState: BidderState = bidderStateOverride
    ? bidderStateOverride
    : highestBid?.bidderId && userId && highestBid.bidderId === userId
      ? "leading"
      : userId && bids.some((bid) => bid.bidderId === userId)
        ? "outbid"
        : "watching";

  const submitBid = async () => {
    if (!confirmationScope || !confirmationIsCurrent) {
      setFeedback({ tone: "warning", message: labels.staleBid });
      return;
    }
    const amount = confirmationScope.amount;
    const submittedUserId = confirmationScope.userId;
    const submissionScope = submissionScopeRef.current + 1;
    submissionScopeRef.current = submissionScope;
    const ownsActiveAccountState = () =>
      activeUserIdRef.current === submittedUserId &&
      submissionScopeRef.current === submissionScope;

    setSubmitting(true);
    setFeedback(null);
    try {
      if (onPlaceBidOverride) {
        await onPlaceBidOverride(amount);
      } else {
        if (!submittedUserId) throw new Error("missing bidder");
        const response = await api.post(
          `/bids/create?bidderId=${encodeURIComponent(submittedUserId)}&auctionId=${encodeURIComponent(auctionId)}`,
          {
            bidAmount: amount,
            bidStatus: "ACTIVE",
          },
        );
        // Server turli formatda javob qaytarishi mumkin:
        // 1) { status: "OK", data: {...} }
        // 2) { data: {...} }
        // 3) { id: "...", bidAmount: ..., ... }
        const body = response.data;
        const isSuccess =
          body?.status === "OK" ||
          body?.status === "CREATED" ||
          body?.id !== undefined ||
          body?.data?.id !== undefined;
        if (!isSuccess) {
          throw new ExplicitBidRejection(
            body?.message ?? body?.error ?? "rejected bid",
          );
        }
      }
      // Anti-snipping: if bid is placed within 2 minutes of end time, add +5 minutes
      const extension = calculateAntiSnippingExtension(effectiveEndTime, Date.now());
      if (extension.shouldExtend && extension.newEndTime) {
        setEffectiveEndTime(extension.newEndTime);
        setExtended(true);
        setServerRemainingSeconds((prev) => {
          const secExt = calculateAntiSnippingSeconds(prev);
          return secExt.shouldExtend && secExt.newSeconds !== null ? secExt.newSeconds : prev;
        });
      }

      // The mutation response is authoritative. A delayed or lost STOMP event
      // must not leave an older socket snapshot masking the refreshed REST data.
      setSocketHighestBid(null);
      setSocketBids(null);
      const cacheRefreshes = [
        queryClient.invalidateQueries({ queryKey: ["auctionId", auctionId] }),
        queryClient.invalidateQueries({ queryKey: ["auctionCounts", auctionId] }),
        queryClient.invalidateQueries({ queryKey: ["initialAuctions"] }),
        queryClient.invalidateQueries({ queryKey: ["auctions"] }),
        queryClient.invalidateQueries({ queryKey: ["auction", auctionId] }),
        queryClient.invalidateQueries({ queryKey: ["highestBid", auctionId] }),
        queryClient.invalidateQueries({ queryKey: ["bidsByAuctionId", auctionId] }),
        queryClient.invalidateQueries({ queryKey: ["bids"] }),
      ];
      if (submittedUserId) {
        cacheRefreshes.push(
          queryClient.invalidateQueries({
            queryKey: ["userAuctions", submittedUserId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["winningLots", submittedUserId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["bidByBidderId", submittedUserId],
          }),
        );
      }
      await Promise.allSettled([
        Promise.resolve(refetchHighestBid?.()),
        Promise.resolve(refetchBids?.()),
        ...cacheRefreshes,
      ]);
      if (!ownsActiveAccountState()) return;
      setFeedback({ tone: "success", message: labels.success });
      setConfirmingBid(false);
      setConfirmationScope(null);
      userEditedBid.current = false;
    } catch (error) {
      if (!ownsActiveAccountState()) return;
      setFeedback({
        tone: "danger",
        message: translatedBidError(error, labels),
      });
    } finally {
      if (ownsActiveAccountState()) setSubmitting(false);
    }
  };

  if (!auction) {
    const auctionsLoading = Boolean(auctionQuery.isLoading);
    const auctionHasError = Boolean(auctionQuery.isError);
    return (
      <div className="mx-auto max-w-7xl px-[var(--content-gutter)] py-12">
        <StatePanel
          title={
            auctionsLoading
              ? labels.auctionLoadingBody
              : auctionHasError
                ? labels.auctionError
                : labels.noVehicle
          }
          description={
            auctionsLoading
              ? labels.auctionLoadingBody
              : auctionHasError
                ? labels.auctionErrorBody
                : labels.noVehicleBody
          }
          icon={
            auctionsLoading ? (
              <RefreshCw
                className="animate-spin motion-reduce:animate-none"
                size={30}
              />
            ) : (
              <AlertTriangle size={30} />
            )
          }
          live={auctionHasError ? "assertive" : "polite"}
          action={
            auctionsLoading ? null : auctionHasError ? (
              <Button
                variant="outline"
                disabled={Boolean(auctionQuery.isFetching)}
                onClick={() => void auctionQuery.refetch?.()}
              >
                <RefreshCw aria-hidden="true" size={17} />
                {labels.retryLot}
              </Button>
            ) : (
              <Link
                href="/auctions"
                className="font-bold text-brand-navy-900 underline underline-offset-4"
              >
                {labels.back}
              </Link>
            )
          }
        />
      </div>
    );
  }

  const localizedTitle =
    auction.title[locale] ??
    auction.title.default ??
    auction.title.uz ??
    auction.title.ru ??
    auction.title.en ??
    `Auction ${auction.id}`;
  const stateLabel = {
    connected: labels.connected,
    connecting: labels.connecting,
    reconnecting: labels.reconnecting,
    polling: labels.polling,
    offline: labels.offline,
    unavailable: labels.unavailable,
  }[connectionState];
  const ConnectionIcon =
    connectionState === "connected"
      ? Radio
      : connectionState === "offline" || connectionState === "unavailable"
        ? WifiOff
        : RefreshCw;
  const bidderMessage = {
    leading: labels.leading,
    outbid: labels.outbid,
    watching: labels.watching,
  }[bidderState];

  return (
    <div className="mx-auto w-full max-w-7xl px-[var(--content-gutter)] py-8 md:py-12">
      {connectionState !== "connected" && (
        <div
          role="alert"
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 bg-semantic-danger px-4 py-2.5 text-center text-sm font-bold text-white shadow-md animate-in fade-in slide-in-from-top duration-200"
        >
          <WifiOff aria-hidden="true" size={18} className="shrink-0" />
          <span>
            {currentLang === "ru"
              ? "Соединение потеряно. Восстановление подключения..."
              : currentLang === "uz"
                ? "Ulanish uzildi. Qayta ulanmoqda..."
                : "Connection lost. Reconnecting..."}
          </span>
        </div>
      )}
      <Link
        href={auctionDetailHref(auction.id)}
        className="inline-flex min-h-11 items-center gap-2 rounded-md font-bold text-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        <ArrowLeft aria-hidden="true" size={18} />
        {labels.back}
      </Link>

      <header className="mt-5 rounded-lg bg-brand-navy-900 p-6 text-white shadow-sticky md:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-champagne-500">
              {labels.eyebrow} · #{auction.lotNumber ?? auction.id}
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-2xl font-bold leading-tight md:text-4xl">
              {localizedTitle}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              tone={connectionState === "connected" ? "success" : "warning"}
            >
              <ConnectionIcon
                aria-hidden="true"
                size={15}
                className={
                  connectionState === "reconnecting" ||
                    connectionState === "connecting"
                    ? "animate-spin motion-reduce:animate-none"
                    : ""
                }
              />
              {stateLabel}
            </StatusBadge>
            <StatusBadge
              tone={
                bidderState === "leading"
                  ? "success"
                  : bidderState === "outbid"
                    ? "warning"
                    : "neutral"
              }
            >
              {bidderMessage}
            </StatusBadge>
          </div>
        </div>

        {(connectionState === "polling" || connectionState === "unavailable") ? (
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/80">
            {connectionState === "polling"
              ? labels.pollingDetail
              : labels.unavailableDetail}
          </p>
        ) : null}
      </header>

      {extended ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-semantic-info-surface px-4 py-3 text-sm font-bold text-semantic-info"
        >
          <Clock3 aria-hidden="true" className="mr-2 inline" size={18} />
          {labels.extended}
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-6">
          <Surface className="overflow-hidden" padding="large">
            <div className="grid min-w-0 gap-8 xl:grid-cols-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-secondary">
                  {labels.current}
                </p>
                <p className="mt-2 min-w-0 whitespace-nowrap font-display text-[clamp(1.3rem,2.1vw,1.85rem)] font-bold leading-tight tracking-tight tabular-nums text-brand-navy-900">
                  {formatAuctionPrice(currentPrice, {
                    currency: auction.currency,
                    locale: localeTags[locale],
                  })}
                </p>
              </div>
              <div className="min-w-0 xl:border-l xl:border-border-default xl:pl-8">
                <p className="text-sm font-bold text-text-secondary">
                  {hasStarted ? labels.remaining : labels.startTime}
                </p>
                {remaining === null ? (
                  <p>—</p>
                ) : hasEnded ? (
                  <p className="mt-2 text-lg font-bold text-semantic-warning">
                    {labels.ended}
                  </p>
                ) : remaining.ended && !hasStarted ? (
                  <p className="mt-2 text-lg font-bold text-semantic-success">
                    {labels.startTime}
                  </p>
                ) : (

                  <div
                    aria-live="off"
                    className="mt-2 grid min-w-0 grid-cols-4 gap-1 whitespace-nowrap font-display text-[clamp(1rem,1.8vw,1.6rem)] font-bold tracking-tight tabular-nums text-brand-navy-900"
                  >
                    <span>{String(remaining?.days ?? 0).padStart(2, "0")}d</span>
                    <span>{String(remaining?.hours ?? 0).padStart(2, "0")}h</span>
                    <span>{String(remaining?.minutes ?? 0).padStart(2, "0")}m</span>
                    <span>{String(remaining?.seconds ?? 0).padStart(2, "0")}s</span>
                  </div>
                )}
              </div>
            </div>

            {auction.startTime && auction.endTime ? (
              <div className="mt-5 border-t border-border-default pt-5">
                <p className="text-sm font-bold text-text-secondary">
                  {labels.period}
                </p>
                <div className="mt-2 grid min-w-0 gap-x-8 gap-y-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold text-text-secondary">{labels.startTime}</p>
                    <p className="mt-1 font-extrabold tabular-nums text-brand-navy-900 text-sm tracking-wide">
                      {formatSolidDateTime(auction.startTime, locale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-secondary">{labels.endTime}</p>
                    <p className="mt-1 font-extrabold tabular-nums text-brand-navy-900 text-sm tracking-wide">
                      {formatSolidDateTime(effectiveEndTime ?? auction.endTime, locale)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </Surface>

          <BidLedger bids={bids} currency={auction.currency} locale={locale} />
        </div>

        <aside>
          <Surface className="shadow-sticky lg:sticky lg:top-[calc(var(--public-header-height)+var(--space-5))]">
            <div className="flex items-center gap-2">
              <Gavel aria-hidden="true" size={20} />
              <h2 className="font-display text-xl font-bold text-brand-navy-900">
                {labels.place}
              </h2>
            </div>
            <p className="mt-5 text-sm font-bold text-text-secondary">
              {labels.minimum}
              <span className="mt-1 block text-xl font-bold tabular-nums text-brand-navy-900">
                {nextBid === null
                  ? labels.minimumUnavailable
                  : formatAuctionPrice(nextBid, {
                    currency: auction.currency,
                    locale: localeTags[locale],
                  })}
              </span>
            </p>

            <label
              htmlFor="live-bid-amount"
              className="mt-5 block text-sm font-bold text-text-primary"
            >
              {labels.bidLabel}
            </label>
            <input
              id="live-bid-amount"
              type="number"
              inputMode="numeric"
              min={nextBid ?? undefined}
              value={bidAmount}
              disabled={!canBid || submitting}
              onChange={(event) => {
                userEditedBid.current = true;
                setBidAmount(event.target.value);
              }}
              className="mt-2 min-h-12 w-full rounded-md border border-border-default px-4 py-3 font-bold tabular-nums text-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50"
            />

            {!canBid ? (
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {!hasStarted
                  ? labels.notStarted
                  : hasEnded || !isBiddingWindow
                    ? labels.closed
                    : !user
                      ? labels.login
                      : !depositStatusKnown
                        ? labels.depositUnknown
                        : !bidMarketKnown
                          ? labels.marketUnknown
                          : !bidRuleKnown
                            ? labels.ruleUnknown
                            : !deposited
                              ? isDepositCutoffReached
                                ? labels.depositCutoff
                                : labels.deposit
                              : labels.bidUnavailable}
              </p>
            ) : null}
            {canBid && bidAmount.trim() && canonicalBidAmount === null ? (
              <p className="mt-3 text-sm font-semibold text-semantic-danger" role="alert">
                {/* {labels.invalidStep.replace(
                  "{step}",
                  formatAuctionPrice(bidCurrencyStep, {
                    currency: auction.currency,
                    locale: localeTags[locale],
                  }),
                )} */}
                {/* {labels.invalidAmount} */}
              </p>
            ) : null}
            {visibleFeedback && !confirmingBid ? (
              <p
                role={visibleFeedback.tone === "danger" ? "alert" : "status"}
                className={`mt-4 rounded-md px-3 py-2 text-sm font-bold ${visibleFeedback.tone === "success"
                    ? "bg-semantic-success-surface text-semantic-success"
                    : visibleFeedback.tone === "danger"
                      ? "bg-semantic-danger-surface text-semantic-danger"
                      : "bg-semantic-warning-surface text-semantic-warning"
                  }`}
              >
                {visibleFeedback.message}
              </p>
            ) : null}

            <Button
              fullWidth
              size="large"
              className="mt-5"
              disabled={
                !bidIsValid || submitting
              }
              onClick={() => {
                setFeedback(null);
                if (
                  nextBid === null ||
                  canonicalBidAmount === null ||
                  !bidIsValid
                ) return;
                setConfirmationScope({
                  amount: canonicalBidAmount,
                  auctionId,
                  nextBid,
                  userId,
                });
                setConfirmingBid(true);
              }}
            >
              {labels.place}
            </Button>
            {!canBid && isBiddingWindow && user && !depositStatusKnown ? (
              <Button
                fullWidth
                variant="outline"
                className="mt-3"
                disabled={Boolean(depositsQuery.isFetching)}
                onClick={() => void depositsQuery.refetch?.()}
              >
                <RefreshCw aria-hidden="true" size={17} />
                {labels.refreshDeposit}
              </Button>
            ) : !canBid && isBiddingWindow && user && !bidMarketKnown ? (
              <Button
                fullWidth
                variant="outline"
                className="mt-3"
                disabled={Boolean(
                  highestBidQuery.isFetching || bidsQuery.isFetching,
                )}
                onClick={() => {
                  void refetchHighestBid?.();
                  void refetchBids?.();
                  void refetchAuction?.();
                }}
              >
                <RefreshCw aria-hidden="true" size={17} />
                {labels.refreshMarket}
              </Button>
            ) : !canBid ? (
              <Link
                href={auctionDetailHref(auction.id)}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md font-bold text-brand-navy-900 underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                {isBiddingWindow ? labels.openDetail : labels.viewResult}
              </Link>
            ) : null}
          </Surface>
        </aside>
      </div>
      {hasEnded && auction ? (
        <AuctionSaleGate
          auctionId={auctionId}
          auction={auction}              // ← to'liq VehicleAuction object
          vehicleTitle={localizedTitle}  // ← lokalizlangan sarlavha
          highestBid={highestBid}        // ← eng yuqori bid yoki null
          bids={bids}                    // ← barcha bidlar ro'yxati
          userId={userId}                // ← joriy foydalanuvchi ID
          locale={locale}                // ← hozirgi til
        />
      ) : null}
      {confirmingBid ? (
        <div
          ref={bidDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-bid-title"
          tabIndex={-1}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-brand-navy-950/65 p-4"
          onClick={() => {
            if (!submitting) {
              setConfirmingBid(false);
              setConfirmationScope(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-lg bg-surface-primary p-6 shadow-overlay"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="confirm-bid-title"
                className="font-display text-xl font-bold text-brand-navy-900"
              >
                {labels.confirmTitle}
              </h2>
              <button
                type="button"
                aria-label={labels.cancel}
                disabled={submitting}
                onClick={() => {
                  setConfirmingBid(false);
                  setConfirmationScope(null);
                }}
                className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-50"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {labels.confirmBody}
            </p>
            <p className="mt-4 rounded-md bg-surface-muted p-4 text-center font-display text-2xl font-bold tabular-nums text-brand-navy-900">
              {formatAuctionPrice(confirmationScope?.amount ?? numericBidAmount, {
                currency: auction.currency,
                locale: localeTags[locale],
              })}
            </p>
            {visibleFeedback ? (
              <p
                role={visibleFeedback.tone === "danger" ? "alert" : "status"}
                className={`mt-4 rounded-md px-3 py-2 text-sm font-bold ${visibleFeedback.tone === "success"
                    ? "bg-semantic-success-surface text-semantic-success"
                    : visibleFeedback.tone === "danger"
                      ? "bg-semantic-danger-surface text-semantic-danger"
                      : "bg-semantic-warning-surface text-semantic-warning"
                  }`}
              >
                {visibleFeedback.message}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => {
                  setConfirmingBid(false);
                  setConfirmationScope(null);
                }}
              >
                {labels.cancel}
              </Button>
              <Button disabled={submitting || !confirmationIsCurrent} onClick={submitBid}>
                {submitting ? (
                  <>
                    <RefreshCw
                      aria-hidden="true"
                      size={17}
                      className="animate-spin motion-reduce:animate-none"
                    />
                    {labels.submitting}
                  </>
                ) : (
                  <>
                    <CheckCircle2 aria-hidden="true" size={17} />
                    {labels.confirm}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
