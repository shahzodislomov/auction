"use client";

import {
  ArrowRight,
  CalendarClock,
  Gavel,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useModalFocus } from "@/hooks/useModalFocus";
import { checkDepositCutoff } from "@/lib/auction/depositEligibility";
import { getNextBid } from "@/lib/auction/bidding";
import type { VehicleAuction } from "@/lib/auction/types";
import { formatAuctionPrice } from "@/lib/formatting/auction";
import {
  auctionDetailHref,
  auctionLiveHref,
} from "@/lib/routing/auctionRouteId";
import type { ChampagneLocale } from "@/locales/champagne";

type ParticipationAction =
  | "owner"
  | "login"
  | "verify"
  | "deposit"
  | "live"
  | "result"
  | "continue";

const copy = {
  uz: {
    current: "Joriy narx",
    final: "Yakuniy narx",
    start: "Boshlang‘ich narx",
    next: "Keyingi minimal taklif",
    deposit: "{percent}% kafolat puli",
    ownerLive: "Jonli auksionni kuzatish",
    login: "Ishtirok etish uchun kiring",
    verify: "Shaxsni tasdiqlash",
    pay: "{percent}% kafolat pulini to‘lash",
    live: "Jonli auksionga kirish",
    result: "Natijani ko‘rish",
    continue: "Bitimni davom ettirish",
    processing: "Amal bajarilmoqda…",
    confirmTitle: "Kafolat pulini tasdiqlash",
    confirmBody:
      "Ushbu lot uchun {percent}% kafolat puli yechimini tasdiqlaysiz. Amal natijasi hisobingizda ko‘rsatiladi.",
    cancel: "Bekor qilish",
    confirm: "Kafolat pulini tasdiqlash",
    depositUnknown:
      "Kafolat puli holatini tasdiqlab bo‘lmadi. Yana to‘lashdan oldin holatni yangilang.",
    retryDeposit: "Kafolat puli holatini yangilash",
    status: "Auksion holati",
    starts: "Boshlanishi",
  ends: "Tugashi",
    remaining: "qoldi",
    timeReached: "Vaqt tugadi — auksion holati kutilmoqda",
    depositCutoffNotice:
      "Auksion tugashiga 5 daqiqadan kam vaqt qolganda kafolat puli to‘lash va ishtirok etish mumkin emas.",
    depositCutoffBtn: "Kafolat puli qabuli yakunlangan",
    kycNotice:
      "Auksionda ishtirok etish va kafolat puli to‘lash uchun shaxsingiz tasdiqlangan (KYC) bo‘lishi shart.",
    kycPendingNotice:
      "Hujjatlaringiz admin tomonidan tekshirilmoqda. Tasdiqlanishini kuting.",
    kycRejectedNotice:
      "Shaxsingizni tasdiqlash rad etilgan. Qaytadan hujjat topshiring.",
    insufficientBalance:
      "Hisobingizda mablag‘ yetarli emas. Iltimos, hisobingizni to‘ldiring.",
    dayUnit: " kun",
    hourUnit: " soat",
    minuteUnit: " daq",
    secondUnit: " son",
  },
  ru: {
    current: "Текущая цена",
    final: "Итоговая цена",
    start: "Стартовая цена",
    next: "Минимальная следующая ставка",
    deposit: "Гарантийный взнос {percent}%",
    ownerLive: "Следить за прямым аукционом",
    login: "Войдите для участия",
    verify: "Подтвердить личность",
    pay: "Оплатить взнос {percent}%",
    live: "Войти в прямой аукцион",
    result: "Посмотреть результат",
    continue: "Продолжить сделку",
    processing: "Выполняется…",
    confirmTitle: "Подтвердить гарантийный взнос",
    confirmBody:
      "Подтвердите списание гарантийного взноса {percent}% для этого лота. Результат операции появится в вашем счёте.",
    cancel: "Отмена",
    confirm: "Подтвердить взнос",
    depositUnknown:
      "Не удалось подтвердить состояние взноса. Обновите его перед повторной оплатой.",
    retryDeposit: "Обновить состояние взноса",
    status: "Статус аукциона",
      starts: "Начало",
  ends: "Окончание",
    remaining: "осталось",
    timeReached: "Время истекло — ожидаем статус аукциона",
    depositCutoffNotice:
      "При менее чем 5 минутах до окончания аукциона внесение гарантийного взноса и участие не разрешены.",
    depositCutoffBtn: "Приём взносов завершён",
    kycNotice:
      "Для участия в аукционе и внесения залога требуется подтверждённая верификация (KYC).",
    kycPendingNotice:
      "Ваши документы проверяются администратором. Ожидайте подтверждения.",
    kycRejectedNotice:
      "Верификация личности отклонена. Пожалуйста, отправьте документы повторно.",
    insufficientBalance:
      "Недостаточно средств на балансе. Пожалуйста, пополните счёт.",
    dayUnit: "д",
    hourUnit: "ч",
    minuteUnit: "м",
    secondUnit: "с",
  },
  en: {
    current: "Current price",
    final: "Final price",
    start: "Starting price",
    next: "Minimum next bid",
    deposit: "{percent}% security deposit",
    ownerLive: "Watch live auction",
    login: "Log in to participate",
    verify: "Verify identity",
    pay: "Pay {percent}% deposit",
    live: "Enter live auction",
    result: "View result",
    continue: "Continue deal",
    processing: "Processing…",
    confirmTitle: "Confirm deposit",
    confirmBody:
      "Confirm the {percent}% security deposit for this lot. The operation result will appear in your account activity.",
    cancel: "Cancel",
    confirm: "Confirm deposit",
    depositUnknown:
      "Deposit status is unavailable. Refresh it before making another payment.",
    retryDeposit: "Refresh deposit status",
    status: "Auction status",
    starts: "Starts",
  ends: "Ends",
    remaining: "remaining",
    timeReached: "Time reached — waiting for auction status",
    depositCutoffNotice:
      "Deposits and participation are not allowed when less than 5 minutes remain before the auction ends.",
    depositCutoffBtn: "Deposit window closed",
    kycNotice:
      "Identity verification (KYC) is required to deposit and participate in the auction.",
    kycPendingNotice:
      "Your documents are under administrator review. Please wait for approval.",
    kycRejectedNotice:
      "Identity verification was rejected. Please re-submit your documents.",
    insufficientBalance:
      "Insufficient funds. Please top up your account.",
    dayUnit: "d",
    hourUnit: "h",
    minuteUnit: "m",
    secondUnit: "s",
  },
} as const;

const localeTags: Record<ChampagneLocale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

const statusLabels: Record<ChampagneLocale, Record<VehicleAuction["status"], string>> = {
  uz: {
    upcoming: "Kutilmoqda",
    live: "Jonli",
    "ending-soon": "Tez orada tugaydi",
    sold: "Sotilgan",
    ended: "Yakunlangan",
    cancelled: "Bekor qilingan",
    unknown: "Holat ko‘rsatilmagan",
  },
  ru: {
    upcoming: "Ожидается",
    live: "В эфире",
    "ending-soon": "Скоро завершится",
    sold: "Продано",
    ended: "Завершён",
    cancelled: "Отменён",
    unknown: "Статус не указан",
  },
  en: {
    upcoming: "Upcoming",
    live: "Live",
    "ending-soon": "Ending soon",
    sold: "Sold",
    ended: "Ended",
    cancelled: "Cancelled",
    unknown: "Status unavailable",
  },
};

const monthNames: Record<ChampagneLocale, readonly string[]> = {
  uz: [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ],
  ru: [
    "янв.",
    "февр.",
    "мар.",
    "апр.",
    "мая",
    "июн.",
    "июл.",
    "авг.",
    "сент.",
    "окт.",
    "нояб.",
    "дек.",
  ],
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

import {
  parseUzbekistanDate,
  parseUzbekistanTimestamp,
  UZBEKISTAN_TIMEZONE,
} from "@/lib/formatting/date";

function formatUzbekistanDateTime(
  value: string,
  locale: ChampagneLocale,
): string {
  const d = parseUzbekistanDate(value);
  if (Number.isNaN(d.getTime())) return "—";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: UZBEKISTAN_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const month = Number(read("month"));
  const monthName = monthNames[locale]?.[month - 1] ?? read("month");
  return `${read("day")} ${monthName} ${read("year")}, ${read("hour")}:${read("minute")}`;
}

export function depositQuote(
  startPrice: number | null,
  depositPercent: number | null,
  currency: VehicleAuction["currency"],
): number | null {
  if (
    startPrice === null ||
    depositPercent === null ||
    !Number.isFinite(startPrice) ||
    !Number.isFinite(depositPercent) ||
    startPrice < 0 ||
    depositPercent < 0 ||
    currency === "unknown"
  ) {
    return null;
  }
  const minorUnit = currency === "UZS" ? 1 : 100;
  return Math.round((startPrice * (depositPercent / 100) + Number.EPSILON) * minorUnit) / minorUnit;
}

function depositPercentLabel(value: number | null, locale: ChampagneLocale): string {
  const percent = value ?? 1;
  return new Intl.NumberFormat(localeTags[locale], {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(percent);
}

function withDepositPercent(template: string, percent: string): string {
  return template.replaceAll("{percent}", percent);
}

function formatCountdown(
  targetTime: string,
  now: number,
  labels: (typeof copy)[ChampagneLocale],
): string | null {
  const target = parseUzbekistanTimestamp(targetTime);
  if (!Number.isFinite(target)) return null;

  const remainingSeconds = Math.floor((target - now) / 1_000);
  if (remainingSeconds <= 0) return labels.timeReached;

  const days = Math.floor(remainingSeconds / 86_400);
  const hours = Math.floor((remainingSeconds % 86_400) / 3_600);
  const minutes = Math.floor((remainingSeconds % 3_600) / 60);
  const seconds = remainingSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  const parts = [
    days > 0 ? `${days}${labels.dayUnit}` : null,
    `${days > 0 ? pad(hours) : hours}${labels.hourUnit}`,
    `${pad(minutes)}${labels.minuteUnit}`,
    `${pad(seconds)}${labels.secondUnit}`,
  ].filter(Boolean);

  return `${parts.join(" ")} ${labels.remaining}`;
}

export function getParticipationAction({
  auction,
  isAuthenticated,
  isVerified,
  hasDeposit,
  isOwner,
  isWinner,
}: {
  auction: VehicleAuction;
  isAuthenticated: boolean;
  isVerified: boolean | null;
  hasDeposit: boolean;
  isOwner?: boolean;
  isWinner?: boolean;
}): ParticipationAction {
  if (isOwner) return "owner";
  if (auction.status === "sold" || auction.status === "ended") {
    return isWinner ? "continue" : "result";
  }
  if (auction.status === "cancelled") return "result";
  if (!isAuthenticated) return "login";
  if (isVerified === false) return "verify";
  if (!hasDeposit) return "deposit";
  return "live";
}

export interface ParticipationPanelProps {
  auction: VehicleAuction;
  depositStatus?: "known" | "unknown";
  depositScopeKey?: string | null;
  locale: ChampagneLocale;
  isAuthenticated: boolean;
  isVerified: boolean | null;
  kycStatus?: string | null;
  hasDeposit: boolean;
  isOwner?: boolean;
  isSubmitting: boolean;
  isWinner?: boolean;
  feedback?: { tone: "success" | "danger" | "warning"; message: string } | null;
  isDepositStatusChecking?: boolean;
  onDeposit: () => Promise<void> | void;
  onRetryDepositStatus?: () => Promise<unknown> | unknown;
}

export function ParticipationPanel({
  auction,
  depositStatus = "known",
  depositScopeKey = null,
  feedback,
  hasDeposit,
  isAuthenticated,
  isDepositStatusChecking = false,
  isSubmitting,
  isVerified,
  kycStatus,
  isOwner = false,
  isWinner,
  locale,
  onDeposit,
  onRetryDepositStatus,
}: ParticipationPanelProps) {
  const labels = copy[locale];
  const [now, setNow] = useState(() => Date.now());
  const [confirmingDeposit, setConfirmingDeposit] = useState(false);
  const [openedConfirmationScope, setOpenedConfirmationScope] =
    useState<object | null>(null);
  const actionRegionRef = useRef<HTMLDivElement>(null);
  const focusActionAfterDeposit = useRef(false);
  const action = getParticipationAction({
    auction,
    isAuthenticated,
    isVerified,
    hasDeposit,
    isOwner,
    isWinner,
  });
  const depositCutoff = useMemo(
    () =>
      checkDepositCutoff({
        status: auction.status,
        startTime: auction.startTime,
        endTime: auction.endTime,
        now,
      }),
    [auction.status, auction.startTime, auction.endTime, now],
  );
  const isDepositCutoffReached = depositCutoff.isCutoffReached;
  const confirmationScope = useMemo(
    () => ({
      action,
      auctionId: auction.id,
      depositScopeKey,
      depositPercent: auction.depositPercent,
      startPrice: auction.startPrice,
      status: auction.status,
    }),
    [
      action,
      auction.id,
      auction.depositPercent,
      auction.startPrice,
      auction.status,
      depositScopeKey,
    ],
  );
  const isDepositDialogOpen =
    confirmingDeposit &&
    action === "deposit" &&
    !isDepositCutoffReached &&
    openedConfirmationScope === confirmationScope;
  const depositDialogRef = useModalFocus<HTMLDivElement>({
    isOpen: isDepositDialogOpen,
    onClose: () => {
      if (!isSubmitting) setConfirmingDeposit(false);
    },
  });
  const isClosed =
    auction.status === "sold" ||
    auction.status === "ended" ||
    auction.status === "cancelled";
  const isUpcoming = auction.status === "upcoming";
  const startMs = parseUzbekistanTimestamp(auction.startTime);
  const isNotStarted = isUpcoming || (Number.isFinite(startMs) && now < startMs);
  const timeLabel = isNotStarted ? labels.starts : labels.ends;
  const countdownTarget = useMemo(() => {
    if (isClosed) return null;

    const nowTime = now;
    const start = parseUzbekistanTimestamp(auction.startTime);
    const end = parseUzbekistanTimestamp(auction.endTime);

    if (Number.isFinite(start) && nowTime < start) {
      return auction.startTime;
    }

    if (Number.isFinite(end)) {
      return auction.endTime;
    }

    return null;
  }, [auction.startTime, auction.endTime, isClosed, now]);

  const targetTimeDisplay = isNotStarted
    ? (auction.startTime ?? countdownTarget)
    : (auction.endTime ?? countdownTarget);

  const countdown = countdownTarget
    ? formatCountdown(countdownTarget, now, labels)
    : null;
  const hasVerifiedFinalPrice =
    (auction.status === "sold" || auction.status === "ended") &&
    auction.finalPrice !== null;
  const displayPrice =
    auction.status === "sold" || auction.status === "ended"
      ? auction.finalPrice ?? auction.currentPrice ?? auction.startPrice
      : auction.currentPrice ?? auction.startPrice;
  const nextBid = isClosed
    ? null
    : getNextBid(auction, auction.currentPrice);
  const deposit =
    !isClosed
      ? depositQuote(auction.startPrice, auction.depositPercent ?? 1, auction.currency)
      : null;
  const depositPercent = depositPercentLabel(auction.depositPercent ?? 1, locale);
  const depositLabel = withDepositPercent(labels.deposit, depositPercent);
  const depositPayLabel = withDepositPercent(labels.pay, depositPercent);
  const depositConfirmBody = withDepositPercent(labels.confirmBody, depositPercent);
  const actionLabel = {
    owner: labels.ownerLive,
    login: labels.login,
    verify: labels.verify,
    deposit: depositPayLabel,
    live: labels.live,
    result: labels.result,
    continue: labels.continue,
  }[action];
  const actionHref = {
    owner: auctionLiveHref(auction.id),
    login: `/login?returnTo=${encodeURIComponent(auctionDetailHref(auction.id))}`,
    verify: "/dashboard/kyc",
    live: auctionLiveHref(auction.id),
    result: "#result",
    continue: "/dashboard/bids",
  } as const;

  useEffect(() => {
    if (isDepositDialogOpen || !focusActionAfterDeposit.current) return;
    focusActionAfterDeposit.current = false;
    actionRegionRef.current
      ?.querySelector<HTMLElement>("a[href], button:not([disabled])")
      ?.focus();
  }, [action, confirmingDeposit, isDepositDialogOpen]);

  useEffect(() => {
    if ((!auction.endTime && !auction.startTime) || isClosed) return;

    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [auction.endTime, auction.startTime, isClosed]);

  return (
    <aside className="rounded-lg border border-border-default border-t-brand-champagne-600 bg-surface-primary p-4 shadow-sticky lg:sticky lg:top-[calc(var(--public-header-height)+var(--space-5))] lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-text-secondary">
          {labels.status}
        </span>
        <StatusBadge
          tone={
            auction.status === "live" || auction.status === "ending-soon"
              ? "success"
              : auction.status === "cancelled"
                ? "danger"
                : "info"
          }
        >
          {statusLabels[locale][auction.status]}
        </StatusBadge>
      </div>

      <div className="mt-5">
        <p className="text-sm font-bold text-text-secondary">
          {hasVerifiedFinalPrice
            ? labels.final
            : auction.currentPrice !== null
              ? labels.current
              : labels.start}
        </p>
        <p className="mt-1 font-display text-2xl font-bold tabular-nums text-brand-navy-900 md:text-3xl">
          {formatAuctionPrice(displayPrice, {
            currency: auction.currency,
            locale: localeTags[locale],
          })}
        </p>
      </div>

      <dl className="mt-4 divide-y divide-border-default rounded-md border border-border-default bg-surface-muted px-4">
        {nextBid !== null ? (
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="flex items-center gap-2 text-sm text-text-secondary">
              <Gavel aria-hidden="true" size={17} />
              {labels.next}
            </dt>
            <dd className="text-right text-sm font-bold tabular-nums text-text-primary">
              {formatAuctionPrice(nextBid, {
                currency: auction.currency,
                locale: localeTags[locale],
              })}
            </dd>
          </div>
        ) : null}
        {deposit !== null && !hasDeposit && !isOwner ? (
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="flex items-center gap-2 text-sm text-text-secondary">
              <ShieldCheck aria-hidden="true" size={17} />
              {depositLabel}
            </dt>
            <dd className="text-right text-sm font-bold tabular-nums text-text-primary">
              {formatAuctionPrice(deposit, {
                currency: auction.currency,
                locale: localeTags[locale],
              })}
            </dd>
          </div>
        ) : null}
        {targetTimeDisplay ? (
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="flex items-center gap-2 text-sm text-text-secondary">
              <CalendarClock aria-hidden="true" size={17} />
              {timeLabel}
            </dt>
            <dd className="text-right text-sm font-bold tabular-nums text-text-primary">
              <time dateTime={targetTimeDisplay}>
                {formatUzbekistanDateTime(targetTimeDisplay, locale)}
              </time>
              {countdown ? (
                <span
                  role="timer"
                  aria-live="off"
                  className="mt-1 block text-xs font-semibold text-brand-gold-text"
                >
                  {countdown}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
      </dl>

      {feedback && !isDepositDialogOpen ? (
        <p
          role={feedback.tone === "danger" ? "alert" : "status"}
          className={`mt-4 rounded-md px-3 py-2 text-sm font-bold ${
            feedback.tone === "success"
              ? "bg-semantic-success-surface text-semantic-success"
              : feedback.tone === "danger"
                ? "bg-semantic-danger-surface text-semantic-danger"
                : "bg-semantic-warning-surface text-semantic-warning"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      {action === "deposit" && depositStatus === "unknown" ? (
        <div className="mt-4 rounded-md border border-semantic-warning/40 bg-semantic-warning-surface p-3">
          <p role="alert" className="text-sm font-bold text-semantic-warning">
            {labels.depositUnknown}
          </p>
          {onRetryDepositStatus ? (
            <Button
              className="mt-3"
              disabled={isDepositStatusChecking}
              variant="outline"
              onClick={() => void onRetryDepositStatus()}
            >
              <RefreshCw aria-hidden="true" size={17} />
              {labels.retryDeposit}
            </Button>
          ) : null}
        </div>
      ) : null}

      {action === "deposit" && isDepositCutoffReached ? (
        <div className="mt-4 rounded-md border border-semantic-warning/40 bg-semantic-warning-surface p-3">
          <p role="alert" className="text-sm font-bold text-semantic-warning">
            {labels.depositCutoffNotice}
          </p>
        </div>
      ) : null}

      {action === "verify" ? (
        <div className="mt-4 rounded-md border border-semantic-warning/40 bg-semantic-warning-surface p-3">
          <p role="alert" className="text-sm font-bold text-semantic-warning">
            {kycStatus === "PENDING"
              ? labels.kycPendingNotice
              : kycStatus === "REJECTED"
                ? labels.kycRejectedNotice
                : labels.kycNotice}
          </p>
        </div>
      ) : null}

      <div ref={actionRegionRef} className="mt-4">
        {action === "deposit" ? (
          <Button
            fullWidth
            size="large"
            disabled={
              isSubmitting ||
              deposit === null ||
              depositStatus === "unknown" ||
              isDepositCutoffReached
            }
            onClick={() => {
              if (isDepositCutoffReached) return;
              setOpenedConfirmationScope(confirmationScope);
              setConfirmingDeposit(true);
            }}
          >
            {isSubmitting
              ? labels.processing
              : isDepositCutoffReached
                ? labels.depositCutoffBtn
                : actionLabel}
            {!isSubmitting && !isDepositCutoffReached ? (
              <ArrowRight aria-hidden="true" size={18} />
            ) : null}
          </Button>
        ) : (
          <Link
            href={actionHref[action]}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-brand-champagne-500 bg-brand-champagne-500 px-6 py-3 text-center font-bold text-brand-navy-900 transition-colors hover:border-brand-champagne-600 hover:bg-brand-champagne-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            {actionLabel}
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        )}
      </div>

      {isDepositDialogOpen ? (
        <div
          ref={depositDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-deposit-title"
          tabIndex={-1}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-brand-navy-950/60 p-4"
          onClick={() => !isSubmitting && setConfirmingDeposit(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-surface-primary p-6 shadow-overlay"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="confirm-deposit-title"
                className="font-display text-xl font-bold text-brand-navy-900"
              >
                {labels.confirmTitle}
              </h2>
              <button
                type="button"
                aria-label={labels.cancel}
                disabled={isSubmitting || depositStatus === "unknown"}
                onClick={() => setConfirmingDeposit(false)}
                className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-brand-navy-900 hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {depositConfirmBody}
            </p>
            {deposit !== null ? (
              <p className="mt-4 rounded-md bg-surface-muted p-3 text-center text-lg font-bold tabular-nums text-brand-navy-900">
                {formatAuctionPrice(deposit, {
                  currency: auction.currency,
                  locale: localeTags[locale],
                })}
              </p>
            ) : null}
            {feedback ? (
              <p
                role={feedback.tone === "danger" ? "alert" : "status"}
                className={`mt-4 rounded-md px-3 py-2 text-sm font-bold ${
                  feedback.tone === "success"
                    ? "bg-semantic-success-surface text-semantic-success"
                    : feedback.tone === "danger"
                      ? "bg-semantic-danger-surface text-semantic-danger"
                      : "bg-semantic-warning-surface text-semantic-warning"
                }`}
              >
                {feedback.message}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setConfirmingDeposit(false)}
              >
                {labels.cancel}
              </Button>
              <Button
                disabled={isSubmitting || isDepositCutoffReached}
                onClick={async () => {
                  if (!isDepositDialogOpen || action !== "deposit" || isDepositCutoffReached) {
                    setConfirmingDeposit(false);
                    return;
                  }
                  try {
                    await onDeposit();
                    focusActionAfterDeposit.current = true;
                    setConfirmingDeposit(false);
                  } catch {
                    // The parent supplies the server-backed failure message.
                    // Keep the dialog open so the inert background cannot hide it.
                  }
                }}
              >
                {isSubmitting ? labels.processing : labels.confirm}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
