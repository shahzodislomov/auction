"use client";

import {
  AlertTriangle,
  Eye,
  MapPin,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  UserRound,
   ThumbsUp, Clock3 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AuctionCard } from "@/components/auction/AuctionCard";
import { AuctionFacts } from "@/components/auction/AuctionFacts";
import { AuctionGallery } from "@/components/auction/AuctionGallery";
import { ParticipationPanel, depositQuote } from "@/components/auction/ParticipationPanel";
import { StatePanel } from "@/components/feedback/StatePanel";
import { AuctionCardGridSkeleton, AuctionDetailSkeleton, TabsAndListSkeleton } from "@/components/feedback/ContentSkeletons";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
import { LangSwitch } from "@/context/LangSwitch";
import { useUserContext } from "@/context/UserContext";
import { adaptAuction } from "@/lib/auction/adaptAuction";
import { checkDepositCutoff } from "@/lib/auction/depositEligibility";
import { selectVehicleAuctions } from "@/lib/auction/selectVehicleAuctions";
import type { VehicleAuction } from "@/lib/auction/types";
import { resolveProfileIdentity } from "@/lib/auth/profileIdentity";
import { translateUiText } from "@/lib/localization/uiText";
import type { ChampagneLocale } from "@/locales/champagne";
import { auctionDetailHref } from "@/lib/routing/auctionRouteId";
import { useAllCommentsByVehicle, useCreateComment } from "@/queries/comments";
import { useDepositToAuctionMutation } from "@/queries/deposit";
import { useAuction, useAuctions } from "@/queries/auction-listings";
import { useUserDeposits } from "@/queries/users";

function extractBackendMessage(error: unknown): string {
  if (!error || typeof error !== "object") return "";
  const err = error as Record<string, unknown>;
  const res = (err.response ?? {}) as Record<string, unknown>;
  const data = (res.data ?? {}) as Record<string, unknown>;

  return String(
    data.message ??
    data.error ??
    res.message ??
    res.error ??
    err.message ??
    "",
  );
}

function isInsufficientBalanceError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("insufficient") ||
    lower.includes("balance") ||
    lower.includes("mablag") ||
    lower.includes("yetarli emas") ||
    lower.includes("недостаточно") ||
    lower.includes("средств")
  );
}

const copy = {
  uz: {
    auctions: "Auksionlar",
    lot: "Lot",
    save: "Kuzatuvga saqlash",
    saved: "Kuzatuvda",
    loginToSave: "Saqlash uchun tizimga kiring.",
    description: "Sotuvchi tavsifi",
    noDescription: "Sotuvchi tavsif kiritmagan.",
    disclosure: "Holat va shikast ma’lumoti",
    condition: "Avtomobil holati",
    damage: "Ma’lum shikast va ta’mirlar",
    noDisclosure:
      "Sotuvchi alohida holat yoki shikast ma’lumotini kiritmagan.",
    related: "O‘xshash auksionlar",
    relatedIntro: "Ushbu lot uchun qaytarilgan avtomobil tavsiyalari.",
    relatedLoading: "O‘xshash auksionlar yuklanmoqda…",
    relatedError: "O‘xshash auksionlarni hozir ko‘rsatib bo‘lmadi.",
    relatedRetry: "Qayta urinish",
    relatedEmpty: "O‘xshash avtomobil auksionlari qaytarilmadi.",
    seller: "Sotuvchi",
    verified: "Tasdiqlangan sotuvchi",
    notVerified: "Tasdiqlash holati ko‘rsatilmagan",
    questions: "Savol-javob",
    questionLabel: "Sotuvchiga savol",
    questionPlaceholder: "Avtomobil haqida savolingizni yozing",
    ask: "Savol yuborish",
    loginToAsk: "Savol yuborish uchun tizimga kiring.",
    noQuestions: "Hozircha savollar yo‘q.",
    questionsLoading: "Savollar yuklanmoqda…",
    questionsError: "Savollarni yuklab bo‘lmadi.",
    questionsRetry: "Savollarni qayta yuklash",
    loading: "Avtomobil loti yuklanmoqda",
    loadingBody: "Auksionning joriy ma’lumotlari olinmoqda.",
    loadError: "Avtomobil lotini yuklab bo‘lmadi",
    loadErrorBody:
      "Lot ma’lumotini olib bo‘lmadi. Bu holat lot topilmaganini anglatmaydi; qayta urinib ko‘ring.",
    retry: "Qayta urinish",
    notFound: "Avtomobil auksioni topilmadi",
    notFoundBody: "Bu lot mavjud emas yoki avtomobil loti emas.",
    browse: "Barcha auksionlarni ko‘rish",
    depositSuccess: "Kafolat puli qabul qilindi. Jonli xonaga kirishingiz mumkin.",
    depositFailure:
      "Kafolat puli tasdiqlanmadi. Hisobdagi harakatni tekshirib, qayta urinib ko‘ring.",
    depositCutoffReached:
      "Auksion tugashiga 5 daqiqadan kam vaqt qolganda kafolat puli to‘lash va ishtirok etish mumkin emas.",
    kycRequired:
      "Auksionda ishtirok etish uchun shaxsingizni tasdiqlashingiz (KYC) va admin tomonidan tasdiqlanishi kerak.",
    kycPending:
      "Hujjatlaringiz admin tekshiruvida. Tasdiqlanishini kuting.",
    insufficientBalance:
      "Hisobingizda mablag‘ yetarli emas. Iltimos, hisobingizni to‘ldiring.",
    likeFailure: "Kuzatuv holatini yangilab bo‘lmadi.",
    questionSent: "Savol yuborildi.",
    questionFailure: "Savol yuborilmadi. Matningiz formada saqlanib qoldi.",
    views: "ko‘rish",
    watchers: "kuzatuvchi",
  },
  ru: {
    auctions: "Аукционы",
    lot: "Лот",
    save: "Добавить в избранное",
    saved: "В избранном",
    loginToSave: "Войдите, чтобы сохранить лот.",
    description: "Описание продавца",
    noDescription: "Продавец не добавил описание.",
    disclosure: "Состояние и повреждения",
    condition: "Состояние автомобиля",
    damage: "Известные повреждения и ремонт",
    noDisclosure:
      "Продавец не предоставил отдельные сведения о состоянии или повреждениях.",
    related: "Похожие аукционы",
    relatedIntro: "Рекомендации автомобилей, возвращённые для этого лота.",
    relatedLoading: "Загрузка похожих аукционов…",
    relatedError: "Похожие аукционы сейчас недоступны.",
    relatedRetry: "Повторить",
    relatedEmpty: "Похожие автомобильные аукционы не найдены.",
    seller: "Продавец",
    verified: "Подтверждённый продавец",
    notVerified: "Статус проверки не указан",
    questions: "Вопросы и ответы",
    questionLabel: "Вопрос продавцу",
    questionPlaceholder: "Напишите вопрос об автомобиле",
    ask: "Отправить вопрос",
    loginToAsk: "Войдите, чтобы задать вопрос.",
    noQuestions: "Вопросов пока нет.",
    questionsLoading: "Загрузка вопросов…",
    questionsError: "Не удалось загрузить вопросы.",
    questionsRetry: "Перезагрузить вопросы",
    loading: "Загрузка автомобильного лота",
    loadingBody: "Получаем актуальные данные аукциона.",
    loadError: "Не удалось загрузить автомобильный лот",
    loadErrorBody:
      "Данные лота не получены. Это не означает, что лот не найден; попробуйте ещё раз.",
    retry: "Повторить",
    notFound: "Автомобильный аукцион не найден",
    notFoundBody: "Лот не существует или не является автомобильным лотом.",
    browse: "Посмотреть все аукционы",
    depositSuccess: "Взнос принят. Теперь можно войти в прямой аукцион.",
    depositFailure:
      "Взнос не подтверждён. Проверьте операции по счёту перед повторной попыткой.",
    depositCutoffReached:
      "При менее чем 5 минутах до окончания аукциона внесение гарантийного взноса и участие не разрешены.",
    kycRequired:
      "Для участия в аукционе необходимо пройти верификацию (KYC) и получить подтверждение администратора.",
    kycPending:
      "Ваши документы проверяются администратором. Ожидайте подтверждения.",
    insufficientBalance:
      "Недостаточно средств на балансе. Пожалуйста, пополните счёт.",
    likeFailure: "Не удалось обновить избранное.",
    questionSent: "Вопрос отправлен.",
    questionFailure: "Вопрос не отправлен. Ваш текст остался в форме.",
    views: "просмотров",
    watchers: "наблюдателей",
  },
  en: {
    auctions: "Auctions",
    lot: "Lot",
    save: "Save to watchlist",
    saved: "Saved to watchlist",
    loginToSave: "Log in to save this lot.",
    description: "Seller description",
    noDescription: "The seller has not supplied a description.",
    disclosure: "Condition and damage disclosure",
    condition: "Vehicle condition",
    damage: "Known damage and repairs",
    noDisclosure:
      "The seller has not supplied a separate condition or damage disclosure.",
    related: "Related auctions",
    relatedIntro: "Vehicle recommendations returned for this listing.",
    relatedLoading: "Loading related auctions…",
    relatedError: "Related auctions are unavailable right now.",
    relatedRetry: "Try again",
    relatedEmpty: "No related vehicle auctions were returned.",
    seller: "Seller",
    verified: "Verified seller",
    notVerified: "Verification status not supplied",
    questions: "Questions and answers",
    questionLabel: "Question for the seller",
    questionPlaceholder: "Ask about this vehicle",
    ask: "Send question",
    loginToAsk: "Log in to ask a question.",
    noQuestions: "No questions yet.",
    questionsLoading: "Loading questions…",
    questionsError: "Questions could not be loaded.",
    questionsRetry: "Reload questions",
    loading: "Loading vehicle lot",
    loadingBody: "Retrieving the current auction information.",
    loadError: "Vehicle lot could not be loaded",
    loadErrorBody:
      "The auction service did not return the lot. Try again before treating it as unavailable.",
    retry: "Try again",
    notFound: "Vehicle auction not found",
    notFoundBody: "This lot is unavailable or is not a vehicle listing.",
    browse: "Browse all auctions",
    depositSuccess: "Deposit accepted. You can now enter the live room.",
    depositFailure:
      "The deposit was not confirmed. Check account activity before retrying.",
    depositCutoffReached:
      "Deposits and participation are not allowed when less than 5 minutes remain before the auction ends.",
    kycRequired:
      "Identity verification (KYC) and administrator approval are required to participate.",
    kycPending:
      "Your documents are under administrator review. Please wait for approval.",
    insufficientBalance:
      "Insufficient funds. Please top up your account.",
    likeFailure: "The watchlist could not be updated.",
    questionSent: "Question sent.",
    questionFailure: "The question could not be sent. Your text remains in the form.",
    views: "views",
    watchers: "watchers",
  },
} as const;

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

const conditionLabels: Record<ChampagneLocale, Record<string, string>> = {
  uz: {
    "dealer-demo": "Diler namoyish avtomobili",
    "dealer_demo": "Diler namoyish avtomobili",
    "used-excellent": "Ishlatilgan · A'lo holat",
    "used_excellent": "Ishlatilgan · A'lo holat",
    "used-good": "Ishlatilgan · Yaxshi holat",
    "used_good": "Ishlatilgan · Yaxshi holat",
    excellent: "A'lo holatda",
    good: "Yaxshi holatda",
    damaged: "Shikastlangan",
    not_running: "Yurmaydi (nosoz)",
    "not-running": "Yurmaydi (nosoz)",
    new: "Yangi",
  },
  ru: {
    "dealer-demo": "Демонстрационный автомобиль дилера",
    "dealer_demo": "Демонстрационный автомобиль дилера",
    "used-excellent": "С пробегом · Отличное состояние",
    "used_excellent": "С пробегом · Отличное состояние",
    "used-good": "С пробегом · Хорошее состояние",
    "used_good": "С пробегом · Хорошее состояние",
    excellent: "Отличное состояние",
    good: "Хорошее состояние",
    damaged: "Поврежденное",
    not_running: "Не на ходу",
    "not-running": "Не на ходу",
    new: "Новое",
  },
  en: {
    "dealer-demo": "Dealer demonstrator",
    "dealer_demo": "Dealer demonstrator",
    "used-excellent": "Used · Excellent condition",
    "used_excellent": "Used · Excellent condition",
    "used-good": "Used · Good condition",
    "used_good": "Used · Good condition",
    excellent: "Excellent condition",
    good: "Good condition",
    damaged: "Damaged",
    not_running: "Not running",
    "not-running": "Not running",
    new: "New",
  },
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrap(value: unknown): unknown {
  const record = asRecord(value);
  return record?.data ?? value;
}

function normalizedAuction(value: unknown): VehicleAuction | null {
  const unwrapped = unwrap(value);
  const item = Array.isArray(unwrapped)
    ? unwrapped[unwrapped.length - 1]
    : unwrapped;
  return adaptAuction(item);
}

function identifier(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function listFromPayload(value: unknown): unknown[] {
  const unwrapped = unwrap(value);
  if (Array.isArray(unwrapped)) return unwrapped;
  const record = asRecord(unwrapped);
  if (Array.isArray(record?.contents)) return record.contents;
  if (Array.isArray(record?.content)) return record.content;
  if (Array.isArray(record?.dtoList)) return record.dtoList;
  return [];
}

function localized(
  value: VehicleAuction["title"],
  locale: ChampagneLocale,
): string | null {
  return value[locale] ?? value.default ?? value.uz ?? value.ru ?? value.en;
}

function disclosedCondition(
  value: string,
  locale: ChampagneLocale,
): string | null {
  const trimmed = value.trim();
  const normalized = trimmed.toLocaleLowerCase("en-US");
  if (
    !trimmed ||
    normalized === "unknown" ||
    normalized === "not provided" ||
    normalized === "n/a"
  ) {
    return null;
  }

  return conditionLabels[locale][normalized] ?? trimmed;
}

interface AuctionDetailProps {
  auctionId: string;
  initialAuction?: VehicleAuction | null;
}

export function AuctionDetail(props: AuctionDetailProps) {
  return <AuctionDetailRoute key={props.auctionId} {...props} />;
}

export interface VehicleCommentUser {
  id: number;
  email: string | null;
  firstname: string | null;
  lastname: string | null;
  secretName: string | null;
}

export interface VehicleComment {
  id: number;
  comment: string;
  user: VehicleCommentUser;
  type: "POSITIVE" | "NEGATIVE" | "QUESTION" | "NEUTRAL";
  createdAt: string;
  parentComment: VehicleComment | null;
  replies: VehicleComment[];
}
function AuctionDetailRoute({
  auctionId,
  initialAuction = null,
}: AuctionDetailProps) {
  const router = useRouter();
  const { currentLang } = useContext(LangSwitch);
  const locale = currentLang as ChampagneLocale;
  const labels = copy[locale];
  const { isAuthenticated, user } = useUserContext();
  const profileIdentity = resolveProfileIdentity(
    user as { id?: string | number | null; userId?: string | number | null },
  );
  const userId =
    isAuthenticated && profileIdentity !== null
      ? String(profileIdentity)
      : null;
  const auctionQuery = useAuction(auctionId);
  const depositsQuery = useUserDeposits(userId);
  const recommendationsQuery = useAuctions({ approvalStatus: "APPROVED", page: 0, size: 7 });
  const createComment = useCreateComment();
  const depositScope = useMemo(
    () => ({ lotId: auctionId, userId }),
    [auctionId, userId],
  );
  const questionScope = useMemo(
    () => ({ lotId: auctionId, userId }),
    [auctionId, userId],
  );
  const activeQuestionScopeRef = useRef(questionScope);
  useEffect(() => {
    activeQuestionScopeRef.current = questionScope;
  }, [questionScope]);
  const [depositMade, setDepositMade] = useState<{
    scope: typeof depositScope;
  } | null>(null);
  const [depositFeedback, setDepositFeedback] = useState<{
    scope: typeof depositScope;
    tone: "success" | "danger" | "warning";
    message: string;
  } | null>(null);
  const [questionDraft, setQuestionDraft] = useState<{
    scope: typeof questionScope;
    value: string;
  }>({ scope: questionScope, value: "" });
  const [questionFeedback, setQuestionFeedback] = useState<{
    scope: typeof questionScope;
    message: string;
    tone: "danger" | "success" | "warning";
  } | null>(null);
  const question =
    questionDraft.scope === questionScope ? questionDraft.value : "";
  const visibleQuestionFeedback =
    questionFeedback?.scope === questionScope ? questionFeedback : null;

  const restAuction = normalizedAuction(auctionQuery.data);
  const auction = restAuction ?? initialAuction;
  const commentsQuery = useAllCommentsByVehicle(auction?.vehicleId);

  const depositMutation = useDepositToAuctionMutation() as unknown as {
    mutate: (
      payload: { auctionId: string | number; userId: string | number },
      options?: {
        onSuccess?: (response: { status?: string; message?: string }) => void;
        onError?: (error: unknown) => void;
      },
    ) => void;
    isPending?: boolean;
  };

const depositedIds = new Set(
  (depositsQuery.data ?? [])
  // @ts-expect-error entry auction ID structure variation
    .map((entry) =>
      identifier(
        entry?.auctionId ??
        entry?.auction?.auctionId
      )
    )
    .filter(Boolean),
);
  const relatedAuctions = useMemo(
    () =>
      selectVehicleAuctions(listFromPayload(recommendationsQuery.data))
        .filter((candidate) => candidate.id !== auctionId)
        .slice(0, 3),
    [auctionId, recommendationsQuery.data],
  );
  const hasLocalDeposit = depositMade?.scope === depositScope;
  const depositStatus =
    hasLocalDeposit ||
    (!depositsQuery.isError && depositsQuery.data !== undefined)
      ? "known"
      : "unknown";
 const hasDeposit = depositedIds.has(String(auctionId));
  const visibleDepositFeedback =
    depositFeedback?.scope === depositScope
      ? {
          message: depositFeedback.message,
          tone: depositFeedback.tone,
        }
      : null;
  const kycStatusRaw =
    (user as { kycStatus?: unknown; verificationStatus?: unknown } | null)?.kycStatus ??
    (user as { verificationStatus?: unknown } | null)?.verificationStatus;
  const kycStatusNormalized =
    typeof kycStatusRaw === "string" ? kycStatusRaw.trim().toUpperCase() : null;

  const booleanVerified =
    (user as { verified?: unknown; isVerified?: unknown; isKycVerified?: unknown } | null)?.verified ??
    (user as { isVerified?: unknown } | null)?.isVerified ??
    (user as { isKycVerified?: unknown } | null)?.isKycVerified;

  let isVerified: boolean | null = null;
  if (kycStatusNormalized) {
    isVerified = kycStatusNormalized === "APPROVED";
  } else if (typeof booleanVerified === "boolean") {
    isVerified = booleanVerified;
  }
  const isAuctionOwner = Boolean(userId && auction?.seller?.id && auction.seller.id === userId);

  const vehicleDisplayName = useMemo(() => {
    if (!auction) return "";
    const parts = [auction.year, auction.make, auction.model].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(" ");
    }
    const loc = localized(auction.title, locale);
    if (loc && !loc.toLowerCase().startsWith("auction")) {
      return loc;
    }
    return `${auction.make || "Avtomobil"} ${auction.model || ""} #${auction.id}`.trim();
  }, [auction, locale]);

  useEffect(() => {
    if (typeof document !== "undefined" && vehicleDisplayName) {
      document.title = `${vehicleDisplayName} | TezAuksion`;
    }
  }, [vehicleDisplayName]);

  if (!auction) {
    const lotIsLoading = Boolean(auctionQuery.isLoading);
    const lotHasError = Boolean(auctionQuery.isError);
    if (lotIsLoading) return <AuctionDetailSkeleton label={labels.loading} />;
    return (
      <div className="mx-auto max-w-7xl px-[var(--content-gutter)] py-12">
        <StatePanel
          title={
            lotHasError
                ? labels.loadError
                : labels.notFound
          }
          description={
            lotHasError
                ? labels.loadErrorBody
                : labels.notFoundBody
          }
          icon={
            lotHasError ? (
              <AlertTriangle />
            ) : (
              <ShieldCheck />
            )
          }
          live={lotHasError ? "assertive" : "polite"}
          action={
            lotHasError ? (
              <Button
                variant="outline"
                disabled={Boolean(auctionQuery.isFetching)}
                onClick={() => void auctionQuery.refetch?.()}
              >
                <RefreshCw aria-hidden="true" size={17} />
                {labels.retry}
              </Button>
            ) : (
              <Link
                href="/auctions"
                className="font-bold text-brand-navy-900 underline underline-offset-4"
              >
                {labels.browse}
              </Link>
            )
          }
        />
      </div>
    );
  }

  const title = vehicleDisplayName;

  const description = localized(auction.description, locale);
  const condition = disclosedCondition(auction.condition, locale);
  const damage = auction.damage ? localized(auction.damage, locale) : null;
  const region = auction.region ? localized(auction.region.name, locale) : null;
  const views = auction.counts.views;
  // const comments = listFromPayload(commentsQuery.data) as VehicleComment;
  const comments = listFromPayload(commentsQuery.data) as VehicleComment[];

  const handleDeposit = () =>
    new Promise<void>((resolve, reject) => {
      if (!userId) {
        router.push(
          `/login?returnTo=${encodeURIComponent(auctionDetailHref(auction.id))}`,
        );
        reject(new Error("authentication required"));
        return;
      }
      if (isVerified === false) {
        setDepositFeedback({
          scope: depositScope,
          tone: "danger",
          message:
            kycStatusNormalized === "PENDING"
              ? labels.kycPending
              : labels.kycRequired,
        });
        reject(new Error("kyc verification required"));
        return;
      }
      if (depositStatus !== "known") {
        void depositsQuery.refetch?.();
        reject(new Error("deposit status unavailable"));
        return;
      }

      const requestScope = depositScope;
      const requestLabels = labels;
      const cutoffCheck = checkDepositCutoff({
        status: auction.status,
        startTime: auction.startTime,
        endTime: auction.endTime,
        now: Date.now(),
      });
      if (cutoffCheck.isCutoffReached) {
        setDepositFeedback({
          scope: requestScope,
          tone: "danger",
          message: requestLabels.depositCutoffReached,
        });
        reject(new Error("deposit cutoff reached"));
        return;
      }

      const requiredDeposit = depositQuote(
        auction.startPrice,
        auction.depositPercent ?? 1,
        auction.currency,
      );
      const userBalanceRaw = (user as { balance?: unknown } | null)?.balance;
      const userBalance =
        userBalanceRaw !== undefined && userBalanceRaw !== null && userBalanceRaw !== ""
          ? Number(userBalanceRaw)
          : null;

      if (
        userBalance !== null &&
        Number.isFinite(userBalance) &&
        requiredDeposit !== null &&
        userBalance < requiredDeposit
      ) {
        setDepositFeedback({
          scope: requestScope,
          tone: "danger",
          message: requestLabels.insufficientBalance,
        });
        reject(new Error("insufficient balance"));
        return;
      }

      setDepositFeedback(null);
      depositMutation.mutate(
        {
          userId: Number(userId) || userId,
          auctionId: Number(auction.id) || auction.id,
        },
        {
          onSuccess: (response: { status?: string; message?: string }) => {
            if (response?.status !== "OK") {
              const rawMsg = response?.message || "";
              const isInsufficient = isInsufficientBalanceError(rawMsg);
              const message = isInsufficient
                ? requestLabels.insufficientBalance
                : rawMsg || requestLabels.depositFailure;

              setDepositFeedback({
                scope: requestScope,
                tone: "danger",
                message,
              });
              reject(new Error(rawMsg || "deposit rejected"));
              return;
            }
            setDepositMade({ scope: requestScope });
            setDepositFeedback({
              scope: requestScope,
              tone: "success",
              message: requestLabels.depositSuccess,
            });
            void depositsQuery.refetch?.();
            resolve();
          },
          onError: (error: unknown) => {
            const rawMsg = extractBackendMessage(error);
            const isInsufficient = isInsufficientBalanceError(rawMsg);
            const message = isInsufficient
              ? requestLabels.insufficientBalance
              : rawMsg ||
                (error instanceof Error
                  ? error.message
                  : requestLabels.depositFailure);

            setDepositFeedback({
              scope: requestScope,
              tone: "danger",
              message,
            });

            reject(error);
          },
        },
      );
    });

  const handleQuestion = (event: FormEvent) => {
    event.preventDefault();
    if (!user || !userId) {
      setQuestionFeedback({
        scope: questionScope,
        message: labels.loginToAsk,
        tone: "warning",
      });
      return;
    }
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;
    const requestScope = questionScope;
    setQuestionFeedback(null);
    createComment.mutate(
      {
        vehicleId: Number(auction.vehicleId) || auction.vehicleId,
        comment: trimmedQuestion,
        userId: Number(userId) || userId,
        parentComment: null,
        type: "POSITIVE",
      },
      {
        onSuccess: (response: { status?: string }) => {
          if (activeQuestionScopeRef.current !== requestScope) return;
          if (response?.status !== "OK") {
            setQuestionFeedback({
              scope: requestScope,
              message: labels.questionFailure,
              tone: "danger",
            });
            return;
          }
          setQuestionDraft({ scope: requestScope, value: "" });
          setQuestionFeedback({
            scope: requestScope,
            message: labels.questionSent,
            tone: "success",
          });
          void commentsQuery.refetch?.();
        },
        onError: () => {
          if (activeQuestionScopeRef.current !== requestScope) return;
          setQuestionFeedback({
            scope: requestScope,
            message: labels.questionFailure,
            tone: "danger",
          });
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-[var(--content-gutter)] py-6 md:py-10">
      <nav aria-label={translateUiText("breadcrumb", currentLang)} className="text-xs sm:text-sm text-text-secondary">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="font-bold text-text-secondary hover:text-brand-navy-900 transition-colors" href="/auctions">
              {labels.auctions}
            </Link>
          </li>
          <li aria-hidden="true" className="text-text-tertiary">/</li>
          <li className="truncate font-semibold text-brand-navy-950">
            {vehicleDisplayName}
          </li>
        </ol>
      </nav>

      <header className="mt-3.5 flex flex-col justify-between gap-4 border-b border-border-default pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
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
            {auction.make && (
              <span className="rounded-md bg-brand-navy-900/5 px-2.5 py-0.5 text-xs font-bold text-brand-navy-900">
                {auction.make} {auction.model ?? ""}
              </span>
            )}
            <span className="text-xs font-semibold text-text-tertiary">
              Lot #{auction.lotNumber ?? auction.id}
            </span>
            {region ? (
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-text-secondary">
                <MapPin aria-hidden="true" size={15} />
                {region}
              </span>
            ) : null}
          </div>
          <h1 className="mt-2.5 max-w-4xl font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-brand-navy-950">
            {title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-4 text-xs sm:text-sm text-text-secondary">
            {views !== null ? (
              <span className="inline-flex items-center gap-1.5">
                <Eye aria-hidden="true" size={15} />
                {views.toLocaleString()} {labels.views}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-8">
          <AuctionGallery auction={auction} locale={locale} />
          <AuctionFacts auction={auction} locale={locale} />

          <section aria-labelledby="description-heading" id="result">
            <Surface>
              <h2
                id="description-heading"
                className="font-display text-xl font-bold text-brand-navy-900 md:text-2xl"
              >
                {labels.description}
              </h2>
              <p className="mt-4 max-w-3xl whitespace-pre-wrap leading-7 text-text-secondary">
                {description ?? labels.noDescription}
              </p>
            </Surface>
          </section>

          <section aria-labelledby="condition-disclosure-heading">
            <Surface>
              <h2
                id="condition-disclosure-heading"
                className="font-display text-xl font-bold text-brand-navy-900 md:text-2xl"
              >
                {labels.disclosure}
              </h2>
              {condition || damage ? (
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  {condition ? (
                    <div className="rounded-md border border-border-default bg-surface-muted p-4">
                      <dt className="text-sm font-bold text-text-secondary">
                        {labels.condition}
                      </dt>
                      <dd className="mt-2 whitespace-pre-wrap leading-6 text-text-primary">
                        {condition}
                      </dd>
                    </div>
                  ) : null}
                  {damage ? (
                    <div className="rounded-md border border-border-default bg-surface-muted p-4">
                      <dt className="text-sm font-bold text-text-secondary">
                        {labels.damage}
                      </dt>
                      <dd className="mt-2 whitespace-pre-wrap leading-6 text-text-primary">
                        {damage}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <p className="mt-4 leading-7 text-text-secondary">
                  {labels.noDisclosure}
                </p>
              )}
            </Surface>
          </section>

          {auction.seller ? (
            <section aria-labelledby="seller-heading">
              <Surface>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-surface-muted text-brand-navy-900">
                      <UserRound aria-hidden="true" />
                    </span>
                    <div>
                      <h2
                        id="seller-heading"
                        className="font-display text-xl font-bold text-brand-navy-900"
                      >
                        {labels.seller}
                      </h2>
                      <p className="mt-1 font-bold text-text-primary">
                        {auction.seller.name ?? `Seller ${auction.seller.id ?? ""}`}
                      </p>
                    </div>
                  </div>
                  {auction.seller.verified !== null ? (
                    <StatusBadge tone={auction.seller.verified ? "success" : "warning"}>
                      <ShieldCheck aria-hidden="true" size={15} />
                      {auction.seller.verified
                        ? labels.verified
                        : labels.notVerified}
                    </StatusBadge>
                  ) : null}
                </div>
              </Surface>
            </section>
          ) : null}

          <section aria-labelledby="questions-heading">
            <Surface>
              <h2
                id="questions-heading"
                className="flex items-center gap-2 font-display text-xl font-bold text-brand-navy-900 md:text-2xl"
              >
                <MessageCircle aria-hidden="true" size={22} />
                {labels.questions}
              </h2>
              <form className="mt-5" onSubmit={handleQuestion}>
                <label
                  htmlFor="auction-question"
                  className="block text-sm font-bold text-text-primary"
                >
                  {labels.questionLabel}
                </label>
                <textarea
                  id="auction-question"
                  rows={3}
                  value={question}
                  onChange={(event) =>
                    setQuestionDraft({
                      scope: questionScope,
                      value: event.target.value,
                    })
                  }
                  placeholder={labels.questionPlaceholder}
                  className="mt-2 w-full rounded-md border border-border-default px-4 py-3 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                />
                <Button
                  type="submit"
                  className="mt-3"
                  disabled={!question.trim() || createComment.isPending}
                >
                  {labels.ask}
                </Button>
                {visibleQuestionFeedback ? (
                  <p
                    role={
                      visibleQuestionFeedback.tone === "danger"
                        ? "alert"
                        : "status"
                    }
                    className={`mt-2 text-sm ${
                      visibleQuestionFeedback.tone === "danger"
                        ? "font-semibold text-semantic-danger"
                        : "text-text-secondary"
                    }`}
                  >
                    {visibleQuestionFeedback.message}
                  </p>
                ) : null}
              </form>
              {commentsQuery.isLoading ? (
                <div className="mt-6">
                  <TabsAndListSkeleton label={labels.questionsLoading} rows={3} tabs={0} />
                </div>
              ) : commentsQuery.isError ? (
                <div className="mt-6 rounded-md border border-semantic-danger/40 bg-semantic-danger-surface p-4">
                  <p role="alert" className="font-bold text-semantic-danger">
                    {labels.questionsError}
                  </p>
                  <Button
                    className="mt-3"
                    variant="outline"
                    disabled={Boolean(commentsQuery.isFetching)}
                    onClick={() => void commentsQuery.refetch?.()}
                  >
                    <RefreshCw aria-hidden="true" size={17} />
                    {labels.questionsRetry}
                  </Button>
                </div>
              ) : (

<ul className="mt-6 space-y-4">
  {comments.length > 0 ? (
   comments.slice(0, 10).map((comment) => {
    
  const fullName =
    `${comment.user.firstname ?? ""} ${comment.user.lastname ?? ""}`.trim();

  return (
    <li
      key={comment.id}
      className="rounded-xl border border-border-default bg-surface p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 font-semibold text-brand-primary">
          {(fullName || "A").charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-text-primary">
              {fullName || "Anonymous"}
            </h4>

            <time className="text-xs text-text-secondary">
              {new Date(comment.createdAt).toLocaleDateString()}
            </time>
          </div>

          <p className="mt-2 leading-7 text-text-secondary">
            {comment.comment}
          </p>
        </div>
      </div>
    </li>
  );
})
  ) : (
    <li className="rounded-xl border border-dashed border-border-default p-8 text-center text-sm text-text-secondary">
      {labels.noQuestions}
    </li>
  )}
</ul>
              )}
            </Surface>
          </section>
        </div>

        <ParticipationPanel
          auction={auction}
          depositStatus={depositStatus}
          depositScopeKey={`${depositScope.userId ?? "guest"}:${depositScope.lotId}`}
          locale={locale}
          isAuthenticated={Boolean(user && userId)}
          isVerified={isVerified}
          kycStatus={kycStatusNormalized}
          isOwner={isAuctionOwner}
          hasDeposit={hasDeposit}
          isSubmitting={Boolean(depositMutation.isPending)}
          isDepositStatusChecking={Boolean(
            depositsQuery.isFetching || depositsQuery.isLoading,
          )}
          feedback={visibleDepositFeedback}
          onDeposit={handleDeposit}
          onRetryDepositStatus={() => depositsQuery.refetch?.()}
        />
      </div>

      <section
        aria-labelledby="related-auctions-heading"
        className="mt-12 border-t border-border-default pt-8"
      >
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2
              id="related-auctions-heading"
              className="font-display text-2xl font-bold text-brand-navy-900 md:text-3xl"
            >
              {labels.related}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {labels.relatedIntro}
            </p>
          </div>
        </div>

        {recommendationsQuery.isLoading ? (
          <div className="mt-5">
            <AuctionCardGridSkeleton count={3} label={labels.relatedLoading} />
          </div>
        ) : recommendationsQuery.isError ? (
          <div className="mt-5 rounded-md border border-semantic-danger/40 bg-semantic-danger-surface p-5">
            <p role="alert" className="font-bold text-semantic-danger">
              {labels.relatedError}
            </p>
            <Button
              className="mt-4"
              disabled={Boolean(recommendationsQuery.isFetching)}
              variant="outline"
              onClick={() => void recommendationsQuery.refetch?.()}
            >
              <RefreshCw aria-hidden="true" size={17} />
              {labels.relatedRetry}
            </Button>
          </div>
        ) : relatedAuctions.length > 0 ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relatedAuctions.map((relatedAuction) => (
              <AuctionCard key={relatedAuction.id} auction={relatedAuction} />
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-md border border-border-default bg-surface-muted p-5 text-sm text-text-secondary">
            {labels.relatedEmpty}
          </p>
        )}
      </section>
    </div>
  );
}
