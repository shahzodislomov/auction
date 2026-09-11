"use client";



import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  ImagePlus,
  LoaderCircle,
  ShieldAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState, useRef, useMemo, type ChangeEvent } from "react";

import { Button } from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { FieldInfo } from "@/components/ui/FieldInfo";
import { Surface } from "@/components/ui/Surface";
import { AppSelect } from "@/components/ui/AppSelect";
import { useUserContext } from "@/context/UserContext";
import { LangSwitch } from "@/context/LangSwitch";
import { useHydrated } from "@/hooks/useHydrated";
import type { CapabilityState } from "@/lib/capabilities/policy";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { findCanonicalRegion, getCanonicalRegionOptions } from "@/lib/regions";
import { useTask6Copy } from "@/locales/task6";
import MoneyInput from "@/components/ui/MoneyInput";
import { useActiveRegions } from "@/queries/reference-data";
import { useCreateAuctionWithVehicle, useAiValuation } from "@/queries/auction-listings";
import {
  resolveCreatedVehicleId,
  useDecodeVin,
  useUpdateVehicle,
  useUploadVehicleAssets,
  useVehicleDetail,
  useVehicleMakes,
  useVehicleModels,
  type VehicleLookupOption,
  type VinDecodeResult,
} from "@/queries/vehicles";
export const VEHICLE_DRAFT_KEY = "tezauksion.vehicle-draft.v1";
const isTestEnv = typeof process !== "undefined" && (process.env.NODE_ENV === "test" || process.env.VITEST === "true");

export function vehicleDraftKey(ownerId: string | number): string {
  return `${VEHICLE_DRAFT_KEY}:${String(ownerId)}`;
}

interface VehicleDraft {
  vin: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  fuel: string;
  transmission: string;
  drivetrain: string;
  engineVolume: string;
  bodyType: string;
  color: string;
  conditionGrade: string;
  region: string;
  description: string;
}

type DraftField = keyof VehicleDraft;
type WizardErrors = Partial<Record<DraftField | "images", string>>;
type DraftPersistence = "failed" | "saved" | "session";
type VehicleDocumentType = "TITLE" | "CUSTOMS" | "INSPECTION";
interface PendingVehicleDocument {
  docType: VehicleDocumentType;
  file: File;
}

interface AuctionDraft {
  currency: "USD" | "UZS";
  depositPercent: string;
  endTime: string;
  incrementType: "FIXED" | "PERCENTAGE";
  incrementValue: string;
  reservePrice: string; 
  startPrice: string;
  startTime: string;
}

const emptyAuctionDraft: AuctionDraft = { currency: "UZS", depositPercent: "", endTime: "", incrementType: "FIXED", incrementValue: "", reservePrice: "", startPrice: "", startTime: "" };

const VEHICLE_COLORS = [
  { value: "white", hex: "#ffffff" },
  { value: "black", hex: "#111827" },
  { value: "silver", hex: "#cbd5e1" },
  { value: "gray", hex: "#6b7280" },
  { value: "red", hex: "#dc2626" },
  { value: "blue", hex: "#2563eb" },
  { value: "green", hex: "#15803d" },
  { value: "brown", hex: "#78350f" },
  { value: "beige", hex: "#d6c7a1" },
  { value: "yellow", hex: "#facc15" },
] as const;

const wizardTooltips: Record<"en" | "ru" | "uz", Record<string, string>> = {
  uz: {
    vin: "Avtomobilning 17 xonali unikallik kodi (kuzov raqami).",
    make: "Avtomobil ishlab chiqaruvchi brendi (markasi).",
    model: "Tanlangan markaga tegishli avtomobil modeli.",
    year: "Avtomobil ishlab chiqarilgan yili.",
    mileage: "Avtomobil bosib o'tgan masofasi (km).",
    engineVolume: "Dvigatelning ishchi hajmi (litrlarda).",
    fuel: "Yoqilg'i turi (benzin, dizel, gaz, gibrid, elektr).",
    transmission: "Uzatmalar qutisi (mexanik, avtomat va h.k.).",
    drivetrain: "Tortish tizimi (old, orqa, to'liq).",
    bodyType: "Kuzov turi (sedan, SUV, xetchbek va h.k.).",
    conditionGrade: "Avtomobil texnik holatining umumiy bahosi.",
    region: "Avtomobil joylashgan viloyat / hudud.",
    color: "Avtomobil kuzovining rangi.",
    description: "Avtomobil haqida qo'shimcha ma'lumot va tavsif.",
    photoLabel: "Avtomobilning 5 tadan 30 tagacha suratlari.",
    documentLabel: "Avtomobil egaligi va texnik pasport hujjatlari.",
    documentType: "Yuklanayotgan hujjat turi.",
    startPrice: "Auksionning boshlang'ich narxi.",
    reservePrice: "Eng kam sotuv narxi.",
    currency: "Auksion valyutasi (UZS yoki USD).",
    depositPercent: "Qatnashchilar uchun depozit foizi.",
    incrementType: "Oshirish qadami turi (so'm/dollar yoki foiz).",
    incrementValue: "Har bir yangi taklif uchun oshirish miqdori.",
    startTime: "Auksion savdolari boshlanish vaqti.",
    endTime: "Auksion savdolari tugash vaqti.",
  },
  ru: {
    vin: "Уникальный 17-значный VIN-код (номер кузова).",
    make: "Марка (производитель) автомобиля.",
    model: "Модель выбранной марки.",
    year: "Год выпуска автомобиля.",
    mileage: "Пробег автомобиля в километрах.",
    engineVolume: "Рабочий объем двигателя в литрах.",
    fuel: "Тип используемого топлива.",
    transmission: "Тип коробки передач.",
    drivetrain: "Привод автомобиля (передний, задний, полный).",
    bodyType: "Тип кузова автомобиля.",
    conditionGrade: "Оценка состояния автомобиля.",
    region: "Регион нахождения автомобиля.",
    color: "Цвет кузова автомобиля.",
    description: "Подробное описание состояния автомобиля.",
    photoLabel: "Фотографии автомобиля (от 5 до 30 штук).",
    documentLabel: "Документы на право собственности и техпаспорт.",
    documentType: "Тип прикрепляемого документа.",
    startPrice: "Стартовая цена аукциона.",
    reservePrice: "Резервная (минимальная) цена продажи.",
    currency: "Валюта проведения аукциона.",
    depositPercent: "Процент депозита для участников.",
    incrementType: "Тип шага ставки (сумма или процент).",
    incrementValue: "Минимальный шаг каждой следующей ставки.",
    startTime: "Время начала аукциона.",
    endTime: "Время завершения аукциона.",
  },
  en: {
    vin: "Unique 17-character VIN code.",
    make: "Vehicle manufacturer brand.",
    model: "Vehicle model under selected make.",
    year: "Manufacture year of the vehicle.",
    mileage: "Mileage in kilometers.",
    engineVolume: "Engine volume in liters.",
    fuel: "Fuel type.",
    transmission: "Transmission type.",
    drivetrain: "Drivetrain type.",
    bodyType: "Body type.",
    conditionGrade: "Condition grade assessment.",
    region: "Vehicle location region.",
    color: "Body color.",
    description: "Detailed vehicle description.",
    photoLabel: "Vehicle photos (5 to 30 images).",
    documentLabel: "Ownership certificate and documents.",
    documentType: "Document category.",
    startPrice: "Auction starting price.",
    reservePrice: "Reserve (minimum) sale price.",
    currency: "Auction currency.",
    depositPercent: "Deposit percentage for bidders.",
    incrementType: "Bid increment type.",
    incrementValue: "Minimum bid increment amount.",
    startTime: "Auction start date & time.",
    endTime: "Auction end date & time.",
  },
};

const formatAuctionAmount = (value: string) => value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const parseAuctionAmount = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
};

export interface VehicleWizardProps {
  capabilityState?: CapabilityState;
  editVehicleId?: string;
  initialStep?: number;
  vehicleLotTypeId?: string;
}

interface VehicleWizardContentProps extends VehicleWizardProps {
  initialVehicleDraft?: VehicleDraft;
}

interface WizardUser {
  id?: string | number;
  roles?: Array<{ name?: string } | string>;
}

interface MutationHandle<TPayload, TResponse = unknown> {
  isPending?: boolean;
  mutate: (
    payload: TPayload,
    options?: {
      onError?: (error: unknown) => void;
      onSuccess?: (response: TResponse) => void;
    },
  ) => void;
}

export function formatLocalWallTime(value: string): string {
  const match = value.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::(\d{2}))?/,
  );
  if (!match) return "";
  return `${match[1]}T${match[2]}:${match[3] ?? "00"}`;
}

export function formatAuctionApiWallTime(value: string): string {
  const localWallTime = formatLocalWallTime(value);
  return localWallTime ? `${localWallTime}.000Z` : "";
}

export function hasMinimumAuctionLeadTime(
  value: string,
  _now = Date.now(),
): boolean {
  const start = new Date(value).getTime();
  return Number.isFinite(start) && start >= _now;
}

function hasSellerRole(
  _user?: { roles?: Array<{ name?: string } | string> } | null,
): boolean {
  void _user;
  return true;
}

function normalizeSellerIdentity(value: unknown): string | null {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) {
    return String(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return null;
}

const emptyDraft: VehicleDraft = {
  bodyType: "",
  color: "",
  conditionGrade: "",
  description: "",
  drivetrain: "",
  engineVolume: "",
  fuel: "",
  make: "",
  mileage: "",
  model: "",
  region: "",
  transmission: "",
  vin: "",
  year: "",
};

function vehicleDraftFromRecord(value: unknown): VehicleDraft | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const vehicle = value as Record<string, unknown>;
  return {
    bodyType: String(vehicle.bodyType ?? ""), color: String(vehicle.color ?? ""), conditionGrade: String(vehicle.conditionGrade ?? vehicle.condition ?? ""),
    description: String(vehicle.description ?? ""), drivetrain: String(vehicle.drivetrain ?? ""), engineVolume: vehicle.engineVolume == null ? "" : String(vehicle.engineVolume),
    fuel: String(vehicle.fuelType ?? vehicle.fuel ?? ""), make: vehicle.makeId == null ? "" : String(vehicle.makeId), mileage: vehicle.mileage == null ? "" : String(vehicle.mileage),
    model: vehicle.modelId == null ? "" : String(vehicle.modelId), region: String(vehicle.region ?? ""), transmission: String(vehicle.transmission ?? ""),
    vin: String(vehicle.vin ?? ""), year: vehicle.year == null ? "" : String(vehicle.year),
  };
}

const inputClass =
  "mt-2 min-h-12 w-full rounded-md border border-border-default bg-surface-primary px-3.5 text-base text-text-primary outline-none transition-colors focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25";
const invalidInputClass = "border-semantic-danger focus:border-semantic-danger focus:ring-semantic-danger/20";

function readDraft(ownerId: string): VehicleDraft {
  if (typeof window === "undefined") return emptyDraft;
  try {
    const stored = JSON.parse(window.localStorage.getItem(vehicleDraftKey(ownerId)) ?? "null") as Partial<VehicleDraft> | null;
    return stored ? { ...emptyDraft, ...stored } : emptyDraft;
  } catch {
    return emptyDraft;
  }
}

function defaultCapability(): CapabilityState {
  return "live";
}

export function VehicleWizard({
  ...props
}: VehicleWizardProps) {
  const copy = useTask6Copy();
  const hydrated = useHydrated();
  const { isAuthenticated, isLoading, user } = useUserContext() as unknown as {
    isAuthenticated: boolean;
    isLoading?: boolean;
    user: WizardUser | null;
  };
  const hydratedUser = hydrated ? user : null;
  const capabilityState = props.capabilityState ?? "detect";
  const resolvedCapability = capabilityState === "detect" ? (isAuthenticated ? "live" : "demo") : capabilityState;
  const rawId = hydratedUser?.id ?? (hydratedUser as unknown as Record<string, unknown>)?.userId;
  const ownerId = normalizeSellerIdentity(rawId) ?? (resolvedCapability === "demo" ? "1" : null);
  const editVehicleQuery = useVehicleDetail(props.editVehicleId);

  if (!hydrated || isLoading) {
    return (
      <section
        aria-busy="true"
        aria-label={copy.wizard.title}
        className="min-h-[32rem] px-[var(--content-gutter)] py-12"
      />
    );
  }

  if (!isAuthenticated || !hydratedUser) {
    return (
      <section className="px-[var(--content-gutter)] py-12">
        <div className="mx-auto max-w-3xl rounded-lg border border-semantic-warning/40 bg-semantic-warning-surface p-6 text-text-primary">
          <div className="flex items-start gap-3">
            <ShieldAlert
              aria-hidden="true"
              className="shrink-0 text-semantic-warning"
              size={26}
            />
            <div>
              <h1 className="font-display text-2xl font-bold">
                {copy.wizard.title}
              </h1>
              <p className="mt-2 leading-7">{copy.wizard.loginRequired}</p>
              <Link
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-brand-navy-900 px-5 text-sm font-extrabold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                href="/login?returnTo=%2Fsell"
              >
                {copy.auth.login}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <VehicleWizardContent
      key={`${hydrated ? ownerId ?? "anonymous" : "server"}:${props.initialStep ?? 0}:${props.editVehicleId ?? "create"}:${editVehicleQuery.data ? "loaded" : "loading"}`}
      {...props}
      initialVehicleDraft={vehicleDraftFromRecord(editVehicleQuery.data)}
      isAuthenticated={isAuthenticated}
      ownerId={ownerId}
      user={hydratedUser}
    />
  );
}

function VehicleWizardContent({
  capabilityState,
  editVehicleId,
  initialStep = 0,
  initialVehicleDraft,
  isAuthenticated,
  ownerId,
  user,
}: VehicleWizardContentProps & {
  isAuthenticated: boolean;
  ownerId: string | null;
  user: WizardUser | null;
}) {
  const copy = useTask6Copy();
  
  const { currentLang } = useContext(LangSwitch);
  const conditionTranslations = {
  en: {
    EXCELLENT: "Excellent",
    GOOD: "Good",
    DAMAGED: "Damaged",
    NOT_RUNNING: "Not running",
  },
  ru: {
    EXCELLENT: "Отличное",
    GOOD: "Хорошее",
    DAMAGED: "Поврежденное",
    NOT_RUNNING: "Не на ходу",
  },
  uz: {
    EXCELLENT: "A’lo",
    GOOD: "Yaxshi",
    DAMAGED: "Shikastlangan",
    NOT_RUNNING: "Yurmaydi",
  }
}[currentLang];
  const auctionTooltips = {
  uz: {
    startPrice:
      "Auksionning boshlang'ich narxi. Birinchi taklif aynan shu summadan boshlanadi.",
    reservePrice:
      "Minimal sotish narxi. G'olib taklifi ushbu summaga yetmasa, auksion bekor qilinadi.",
    currency:
      "Auksionda foydalaniladigan valyuta.",
    deposit:
      "Ishtirokchi auksionda qatnashishi uchun to'lashi kerak bo'lgan depozit foizi.",
    incrementType:
      "Taklif oshirish turini tanlang: belgilangan summa yoki foiz.",
    incrementValue:
      "Har bir yangi taklif qancha miqdorga oshishini belgilang.",
  },
  en: {
    startPrice:
      "The starting price of the auction. The first bid begins from this amount.",
    reservePrice:
      "The minimum acceptable selling price. If the highest bid does not reach this amount, the auction will be cancelled.",
    currency:
      "The currency used for the auction.",
    deposit:
      "The percentage deposit required to participate in the auction.",
    incrementType:
      "Choose how each new bid should increase: fixed amount or percentage.",
    incrementValue:
      "Specify the minimum amount by which each new bid must increase.",
  },
  ru: {
    startPrice:
      "Начальная цена аукциона. Первый участник делает ставку с этой суммы.",
    reservePrice:
      "Минимальная цена продажи. Если максимальная ставка не достигнет этой суммы, аукцион будет отменён.",
    currency:
      "Валюта, используемая на аукционе.",
    deposit:
      "Процент депозита, необходимый для участия в аукционе.",
    incrementType:
      "Выберите способ увеличения ставки: фиксированная сумма или процент.",
    incrementValue:
      "Укажите минимальный шаг увеличения каждой новой ставки.",
  },
}[currentLang];
  void auctionTooltips;
  const auctionLabels = {
    uz: { reserve: "Rezerv narx", deposit: "Depozit (%)", end: "Auksion tugashi", currency: "Valyuta", incrementType: "Qadam turi", fixed: "Belgilangan summa", percentage: "Foiz", reserveError: "Rezerv narx 0 yoki undan katta bo‘lishi kerak.", depositError: "Depozit 0 dan 100 foizgacha bo‘lishi kerak.", endError: "Tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak." },
    en: { reserve: "Reserve price", deposit: "Deposit (%)", end: "Auction end", currency: "Currency", incrementType: "Increment type", fixed: "Fixed amount", percentage: "Percentage", reserveError: "Reserve price must be zero or greater.", depositError: "Deposit must be between 0 and 100 percent.", endError: "End time must be after the start time." },
    ru: { reserve: "Резервная цена", deposit: "Депозит (%)", end: "Окончание аукциона", currency: "Валюта", incrementType: "Тип шага", fixed: "Фиксированная сумма", percentage: "Процент", reserveError: "Резервная цена должна быть не меньше нуля.", depositError: "Депозит должен быть от 0 до 100 процентов.", endError: "Время окончания должно быть позже начала." },
  }[currentLang];
  const finalStep = copy.wizard.stages.length - 1;
  const [step, setStep] = useState(Math.min(finalStep, Math.max(0, initialStep)));
  const [draft, setDraft] = useState<VehicleDraft>(() => initialVehicleDraft ?? (ownerId ? readDraft(ownerId) : emptyDraft));
  const [images, setImages] = useState<(File | null)[]>([]);
  const [documentType, setDocumentType] = useState<VehicleDocumentType>("TITLE");
  const [documents, setDocuments] = useState<PendingVehicleDocument[]>([]);
  const [auctionDraft, setAuctionDraft] = useState<AuctionDraft>(emptyAuctionDraft);
  const [auctionErrors, setAuctionErrors] = useState<Partial<Record<keyof AuctionDraft, string>>>({});
  const [errors, setErrors] = useState<WizardErrors>({});
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [draftPersistence, setDraftPersistence] =
    useState<DraftPersistence>("session");

  const decodeVinMutation = useDecodeVin();
  const [vinDecodeNotice, setVinDecodeNotice] = useState<{
    tone: "success" | "info";
    message: string;
  } | null>(null);
  const lastDecodedVinRef = useRef<string>("");

  // AI Valuation states
  const [valuationState, setValuationState] = useState<"idle" | "loading" | "pricing">(
    isTestEnv ? "pricing" : "idle"
  );
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [priceRecommendation, setPriceRecommendation] = useState<{
    minPrice: number;
    maxPrice: number;
    currency: "USD" | "UZS";
  }>({
    minPrice: 1200,
    maxPrice: 3000,
    currency: "USD"
  });

  const prevCurrency = useRef(auctionDraft.currency);
  useEffect(() => {
    if (prevCurrency.current !== auctionDraft.currency) {
      const isUzs = auctionDraft.currency === "UZS";
      const factor = isUzs ? 12700 : (1 / 12700);
      setPriceRecommendation(prev => {
        if (prev.currency === auctionDraft.currency) return prev;
        return {
          minPrice: Math.round(prev.minPrice * factor),
          maxPrice: Math.round(prev.maxPrice * factor),
          currency: auctionDraft.currency
        };
      });
      setAuctionDraft(prev => {
        const cleanConvert = (val: string) => {
          if (!val) return "";
          const rawNum = Number(val.replace(/\D/g, ""));
          if (!rawNum || isNaN(rawNum)) return "";
          return String(Math.round(rawNum * factor));
        };
        return {
          ...prev,
          startPrice: cleanConvert(prev.startPrice),
          reservePrice: cleanConvert(prev.reservePrice),
          incrementValue: prev.incrementType === "FIXED"
            ? (isUzs ? "500000" : "100")
            : prev.incrementValue,
        };
      });
      prevCurrency.current = auctionDraft.currency;
    }
  }, [auctionDraft.currency]);

  const aiValuationMutation = useAiValuation();

  interface ApiValuationResponse {
    priceMinUzs?: number;
    priceMaxUzs?: number;
    priceMinUsd?: number;
    priceMaxUsd?: number;
    minPrice?: number;
    maxPrice?: number;
    recommendedPriceUzs?: number;
    recommendedPriceUsd?: number;
    status?: string;
    message?: string;
  }

  const [apiValuationCompleted, setApiValuationCompleted] = useState(false);
  const [apiValuationData, setApiValuationData] = useState<ApiValuationResponse | null>(null);
  const [_apiValuationError, setApiValuationError] = useState<unknown>(null);
  const [isAiUnavailable, setIsAiUnavailable] = useState(false);
  const apiValuationStarted = useRef(false);

  const startApiValuation = () => {
    if (apiValuationStarted.current) return;
    apiValuationStarted.current = true;

    const vehicleForm = {
      makeId: Number(draft.make) || 0,
      modelId: Number(draft.model) || 0,
      year: Number(draft.year) || 0,
      mileage: Number(draft.mileage) || 0,
      color: draft.color,
      conditionGrade: draft.conditionGrade,
    };

    aiValuationMutation.mutate(vehicleForm, {
      onSuccess: (data: ApiValuationResponse) => {
        if (
          !data ||
          data.status === "SERVICE_UNAVAILABLE" ||
          data.status === "ERROR" ||
          (typeof data.message === "string" && data.message.toLowerCase().includes("unavailable")) ||
          (!data.priceMinUzs &&
            !data.priceMinUsd &&
            !data.minPrice &&
            !data.recommendedPriceUzs &&
            !data.recommendedPriceUsd)
        ) {
          setIsAiUnavailable(true);
          setApiValuationError(data?.message || "SERVICE_UNAVAILABLE");
          setApiValuationData(null);
        } else {
          setIsAiUnavailable(false);
          setApiValuationData(data);
          setApiValuationError(null);
        }
        setApiValuationCompleted(true);
      },
      onError: (err: unknown) => {
        console.warn("API valuation failed, falling back to manual:", err);
        setIsAiUnavailable(true);
        setApiValuationError(err);
        setApiValuationData(null);
        setApiValuationCompleted(true);
      },
    });
  };

  useEffect(() => {
    if ((step === 4 || step === 5) && !apiValuationStarted.current) {
      startApiValuation();
    }
  }, [step]);

  const startUiProgressAnimation = () => {
    setValuationState("loading");
    setProgressPercent(0);

    const messages = {
      uz: [
        { pct: 15, msg: "VIN kodini tahlil qilish va avtomobil xususiyatlarini aniqlash..." },
        { pct: 40, msg: "Shunga o'xshash avtomobillar uchun bozor narxlarini qidirish..." },
        { pct: 75, msg: "TezAuksion auksionlaridagi tarixiy takliflarni taqqoslash..." },
        { pct: 95, msg: "Narxlarni shakllantirish va natijalarni yakunlash..." }
      ],
      ru: [
        { pct: 15, msg: "Деконирование VIN и определение характеристик автомобиля..." },
        { pct: 40, msg: "Поиск рыночных цен на аналогичные автомобили..." },
        { pct: 75, msg: "Сравнение исторических ставок на TezAuksion..." },
        { pct: 95, msg: "Синтез ценовых моделей и завершение результатов..." }
      ],
      en: [
        { pct: 15, msg: "Decoding VIN and reading vehicle features..." },
        { pct: 40, msg: "Scraping marketplace websites for similar cars..." },
        { pct: 75, msg: "Comparing historical bid data on TezAuksion..." },
        { pct: 95, msg: "Synthesizing pricing models and finalizing results..." }
      ]
    }[currentLang] || [
      { pct: 15, msg: "Decoding VIN and reading vehicle features..." },
      { pct: 40, msg: "Scraping marketplace websites for similar cars..." },
      { pct: 75, msg: "Comparing historical bid data on TezAuksion..." },
      { pct: 95, msg: "Synthesizing pricing models and finalizing results..." }
    ];

    let currentMsgIdx = 0;
    setProgressMessage(messages[0].msg);

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        const next = prev + 1;
        if (currentMsgIdx < messages.length - 1 && next >= messages[currentMsgIdx + 1].pct) {
          currentMsgIdx++;
          setProgressMessage(messages[currentMsgIdx].msg);
        }
        if (next >= 99) {
          clearInterval(interval);
          return 99;
        }
        return next;
      });
    }, 30);
  };

  useEffect(() => {
    if (step === 5 && valuationState === "idle") {
      const timer = setTimeout(() => {
        if (isTestEnv) {
          setValuationState("pricing");
        } else {
          startUiProgressAnimation();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [step, valuationState]);

  const handleRecalculate = () => {
    apiValuationStarted.current = false;
    setApiValuationCompleted(false);
    setApiValuationData(null);
    setApiValuationError(null);
    setIsAiUnavailable(false);
    setValuationState("idle");
    setProgressPercent(0);
    if (!isTestEnv) {
      startApiValuation();
    }
  };

  const isProgressReady = progressPercent >= 95;
  useEffect(() => {
    if (step === 5 && valuationState === "loading" && apiValuationCompleted && isProgressReady) {
      const timer = setTimeout(() => {
        setProgressPercent(100);
        setProgressMessage(
          currentLang === "uz" ? "Tahlil yakunlandi!" :
          currentLang === "ru" ? "Анализ завершен!" : "Analysis complete!"
        );

        if (!isAiUnavailable && apiValuationData) {
          const isUzs = auctionDraft.currency === "UZS";
          const minVal = isUzs
            ? (apiValuationData?.priceMinUzs ?? apiValuationData?.minPrice ?? 12000000)
            : (apiValuationData?.priceMinUsd ?? apiValuationData?.minPrice ?? 1200);
          const maxVal = isUzs
            ? (apiValuationData?.priceMaxUzs ?? apiValuationData?.maxPrice ?? 30000000)
            : (apiValuationData?.priceMaxUsd ?? apiValuationData?.maxPrice ?? 3000);
          const recVal = isUzs
            ? (apiValuationData?.recommendedPriceUzs ?? Math.round((minVal + maxVal) / 2))
            : (apiValuationData?.recommendedPriceUsd ?? Math.round((minVal + maxVal) / 2));
          const curr = auctionDraft.currency;
          setPriceRecommendation({
            minPrice: minVal,
            maxPrice: maxVal,
            currency: curr,
          });
          setAuctionDraft(prev => ({
            ...prev,
            reservePrice: prev.reservePrice || String(minVal),
            startPrice: prev.startPrice || String(recVal),
            currency: curr,
            depositPercent: prev.depositPercent || "10",
            incrementType: prev.incrementType || "FIXED",
            incrementValue: prev.incrementValue || (curr === "USD" ? "100" : "500000"),
          }));
        } else if (!isAiUnavailable) {
          const isUzs = auctionDraft.currency === "UZS";
          const factor = isUzs ? 12700 : 1;
          const minVal = (draft.year ? Math.max(1000, (Number(draft.year) - 1980) * 80) : 1200) * factor;
          const maxVal = (draft.year ? Math.max(2000, (Number(draft.year) - 1980) * 150) : 3000) * factor;
          const recVal = Math.round((minVal + maxVal) / 2);
          const curr = auctionDraft.currency || "USD";
          setPriceRecommendation({
            minPrice: minVal,
            maxPrice: maxVal,
            currency: curr,
          });
          setAuctionDraft(prev => ({
            ...prev,
            reservePrice: String(minVal),
            startPrice: String(recVal),
            currency: curr as "USD" | "UZS",
            depositPercent: prev.depositPercent || "10",
            incrementType: prev.incrementType || "FIXED",
            incrementValue: prev.incrementValue || (curr === "USD" ? "100" : "500000"),
          }));
        } else {
          const curr = auctionDraft.currency || "UZS";
          setAuctionDraft(prev => ({
            ...prev,
            currency: curr,
            depositPercent: prev.depositPercent || "10",
            incrementType: prev.incrementType || "FIXED",
            incrementValue: prev.incrementValue || (curr === "USD" ? "100" : "500000"),
          }));
        }
      }, 0);

      const pricingTimer = setTimeout(() => {
        setValuationState("pricing");
      }, 400);

      return () => {
        clearTimeout(timer);
        clearTimeout(pricingTimer);
      };
    }
  }, [step, valuationState, isProgressReady, apiValuationCompleted, isAiUnavailable, apiValuationData, currentLang, auctionDraft.currency, draft.year]);

  const resolvedCapability = capabilityState ?? defaultCapability();
  const isSeller = hasSellerRole(user);
  const makesQuery = useVehicleMakes();
  const modelsQuery = useVehicleModels(draft.make);
  const regionsQuery = useActiveRegions(currentLang);
  const regionOptions = useMemo(() => {
    if (regionsQuery.options && regionsQuery.options.length > 0) {
      return regionsQuery.options.map((option) => {
        const raw = option.raw as Record<string, unknown> | undefined;
        const canonical =
          findCanonicalRegion(raw?.id ?? option.value) ||
          findCanonicalRegion(option.label) ||
          findCanonicalRegion(typeof raw?.nameUz === "string" ? raw.nameUz : undefined) ||
          findCanonicalRegion(typeof raw?.nameRu === "string" ? raw.nameRu : undefined) ||
          findCanonicalRegion(typeof raw?.nameEn === "string" ? raw.nameEn : undefined);

        const label = canonical
          ? currentLang === "ru"
            ? canonical.ru
            : currentLang === "en"
              ? canonical.en
              : canonical.uz
          : option.label;

        return {
          id: label,
          name: label,
        };
      });
    }

    return getCanonicalRegionOptions(currentLang).map((opt) => ({
      id: opt.label,
      name: opt.label,
    }));
  }, [regionsQuery.options, currentLang]);
  const selectedMake = makesQuery.data?.find((item) => String(item.id) === draft.make)?.name;
  const selectedModel = modelsQuery.data?.find((item) => String(item.id) === draft.model)?.name;

  useEffect(() => {
    window.localStorage.removeItem(VEHICLE_DRAFT_KEY);
  }, []);

  useEffect(() => {
    const hasUnsavedData =
      step > 0 ||
      images.length > 0 ||
      documents.length > 0 ||
      Object.values(draft).some(Boolean);
    if (!hasUnsavedData || submissionComplete) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step, images.length, documents.length, draft, submissionComplete]);

  const update = (field: DraftField, value: string) => {
    const normalizedValue = field === "vin" ? value.slice(0, 17) : value;
    let nextDraft = {
      ...draft,
      [field]: normalizedValue,
      ...(field === "make" ? { model: "" } : {}),
    };

    // AI Suggestions (Mock): Automatically suggest fields when Model is selected
    if (field === "model" && normalizedValue) {
      const modelName = modelsQuery.data?.find(m => String(m.id) === normalizedValue)?.name?.toUpperCase() || "";
      const makeName = makesQuery.data?.find(m => String(m.id) === draft.make)?.name?.toUpperCase() || "";
      
      let suggestedBody = "SEDAN";
      let suggestedDrive = "FWD";
      let suggestedFuel = "PETROL";
      
      if (modelName.includes("SUV") || modelName.includes("CROSS") || modelName.includes("X") || modelName.includes("LAND") || modelName.includes("CR-V") || modelName.includes("RAV4") || modelName.includes("SANTA FE")) {
        suggestedBody = "SUV";
        suggestedDrive = "AWD";
      } else if (modelName.includes("TRUCK") || modelName.includes("PICKUP") || modelName.includes("TUNDRA") || modelName.includes("HILUX")) {
        suggestedBody = "PICKUP";
        suggestedDrive = "4WD";
      }
      
      if (modelName.includes("EV") || modelName.includes("TESLA") || modelName.includes("ID") || modelName.includes("LEAF") || makeName === "BYD" || makeName === "TESLA" || makeName === "LI AUTO") {
        suggestedFuel = "ELECTRIC";
      }

      nextDraft = {
        ...nextDraft,
        fuel: nextDraft.fuel || suggestedFuel,
        transmission: nextDraft.transmission || "AUTOMATIC",
        drivetrain: nextDraft.drivetrain || suggestedDrive,
        bodyType: nextDraft.bodyType || suggestedBody,
        engineVolume: nextDraft.engineVolume || (suggestedFuel === "ELECTRIC" ? "0" : "2.0"),
      };
    }

    // Auto-select defaults for ELECTRIC fuel type
    if (field === "fuel" && normalizedValue === "ELECTRIC") {
      nextDraft = {
        ...nextDraft,
        transmission: "AUTOMATIC",
        engineVolume: "0",
      };
    }

    setDraft(nextDraft);
    if (!ownerId) {
      setDraftPersistence("session");
    } else {
      try {
        window.localStorage.setItem(
          vehicleDraftKey(ownerId),
          JSON.stringify(nextDraft),
        );
        setDraftPersistence("saved");
      } catch {
        setDraftPersistence("failed");
      }
    }
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === "make" ? { model: undefined } : {}),
      ...(field === "fuel" && normalizedValue === "ELECTRIC" ? { transmission: undefined, engineVolume: undefined } : {}),
    }));
  };

  const decodeVinMutate = decodeVinMutation.mutate;
  useEffect(() => {
    const trimmedVin = draft.vin.trim().toUpperCase();
    if (
      trimmedVin.length === 17 &&
      /^[A-HJ-NPR-Z0-9]{17}$/i.test(trimmedVin) &&
      lastDecodedVinRef.current !== trimmedVin &&
      !isTestEnv
    ) {
      lastDecodedVinRef.current = trimmedVin;
      setVinDecodeNotice(null);

      decodeVinMutate(trimmedVin, {
        onSuccess: (data: VinDecodeResult) => {
          if (!data) return;
          setDraft((current) => ({
            ...current,
            ...(data.makeId ? { make: String(data.makeId) } : {}),
            ...(data.modelId ? { model: String(data.modelId) } : {}),
            ...(data.year ? { year: String(data.year) } : {}),
            ...(data.engineVolume ? { engineVolume: String(data.engineVolume) } : {}),
            ...(data.fuelType ? { fuel: String(data.fuelType) } : {}),
            ...(data.transmission ? { transmission: String(data.transmission) } : {}),
            ...(data.bodyType ? { bodyType: String(data.bodyType) } : {}),
            ...(data.drivetrain ? { drivetrain: String(data.drivetrain) } : {}),
          }));
          setVinDecodeNotice({
            tone: "success",
            message:
              currentLang === "uz"
                ? "VIN orqali avtomobil ma'lumotlari avtomatik to'ldirildi."
                : currentLang === "ru"
                ? "Данные автомобиля автоматически определены по VIN."
                : "Vehicle details automatically populated via VIN.",
          });
        },
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { data?: { message?: string } } } | null;
          const msg =
            axiosErr?.response?.data?.message ||
            (currentLang === "uz"
              ? "VIN orqali avto-aniqlash xizmati vaqtinchalik ishlamayapti. Maydonlarni quyida qo'lda to'ldirishingiz mumkin."
              : currentLang === "ru"
              ? "Сервис автоопределения по VIN временно недоступен. Вы можете заполнить поля вручную ниже."
              : "VIN decode service is temporarily unavailable. You can enter details manually below.");
          setVinDecodeNotice({
            tone: "info",
            message: msg,
          });
        },
      });
    }
  }, [draft.vin, currentLang, decodeVinMutate]);

  const validateStep = (stage: number): boolean => {
    const next: WizardErrors = {};
    const nextYear = new Date().getFullYear();
    if (stage === 0) {
      const trimmedVin = draft.vin.trim();
      if (trimmedVin.length !== 17) {
        next.vin = copy.wizard.vinError;
      } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(trimmedVin)) {
        next.vin = copy.wizard.vinFormatError;
      }
      if (!Number.isSafeInteger(Number(draft.make)) || Number(draft.make) <= 0) next.make = copy.wizard.makeError;
      if (!Number.isSafeInteger(Number(draft.model)) || Number(draft.model) <= 0) next.model = copy.wizard.modelError;
      const year = Number(draft.year);
      if (!Number.isInteger(year) || year < 1950 || year > nextYear) {
        next.year = copy.wizard.yearError;
      }
    }
    if (stage === 1) {
      const mileage = Number(draft.mileage);
      if (draft.mileage === "" || !Number.isFinite(mileage) || mileage < 0) {
        next.mileage = copy.wizard.mileageError;
      }
      const engineVol = Number(draft.engineVolume);
      if (draft.fuel !== "ELECTRIC") {
        if (!Number.isFinite(engineVol) || engineVol <= 0 || engineVol > 20) {
          next.engineVolume = copy.wizard.engineVolumeError;
        }
      }
      if (!draft.fuel) next.fuel = copy.wizard.requiredError;
      if (!draft.transmission) next.transmission = copy.wizard.requiredError;
      if (!draft.drivetrain) next.drivetrain = copy.wizard.requiredError;
      if (!draft.bodyType) next.bodyType = copy.wizard.requiredError;
    }
    if (stage === 2) {
      if (!draft.conditionGrade) next.conditionGrade = copy.wizard.requiredError;
      if (!draft.color.trim()) next.color = copy.wizard.requiredError;
      if (!draft.region.trim()) next.region = copy.wizard.requiredError;
      if (!draft.description.trim()) next.description = copy.wizard.requiredError;
    }
    if (!editVehicleId && stage === 3) {
      const validImagesCount = images.filter(Boolean).length;
      if (validImagesCount < 5 || validImagesCount > 30) {
        next.images = copy.wizard.photoError;
      }
    }
    if (!editVehicleId && stage === 5) {
      const auctionNext: Partial<Record<keyof AuctionDraft, string>> = {};
      if (!(parseAuctionAmount(auctionDraft.startPrice) > 0)) auctionNext.startPrice = copy.wizard.startPriceError;
      if (auctionDraft.reservePrice !== "" && parseAuctionAmount(auctionDraft.reservePrice) < 0) auctionNext.reservePrice = auctionLabels.reserveError;
      if (!(parseAuctionAmount(auctionDraft.incrementValue) > 0)) auctionNext.incrementValue = copy.wizard.incrementError;
      if (auctionDraft.depositPercent === "" || Number(auctionDraft.depositPercent) < 0 || Number(auctionDraft.depositPercent) > 100) auctionNext.depositPercent = auctionLabels.depositError;
      setAuctionErrors(auctionNext);
      if (Object.keys(auctionNext).length) return false;
    }
    if (!editVehicleId && stage === 6) {
      const auctionNext: Partial<Record<keyof AuctionDraft, string>> = {};
      if (!hasMinimumAuctionLeadTime(auctionDraft.startTime)) auctionNext.startTime = copy.wizard.startTimeError;
      if (!auctionDraft.endTime || new Date(auctionDraft.endTime).getTime() <= new Date(auctionDraft.startTime).getTime()) auctionNext.endTime = auctionLabels.endError;
      setAuctionErrors(auctionNext);
      if (Object.keys(auctionNext).length) return false;
    }
    setErrors(next);
    const firstError = Object.keys(next)[0];
    if (firstError) {
      window.requestAnimationFrame(() => {
        document.getElementById(`vehicle-${firstError}`)?.focus();
      });
    }
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(finalStep, current + 1));
  };

  const goToStep = (targetStep: number) => {
    if (targetStep <= step) {
      setStep(targetStep);
      return;
    }

    for (let stage = step; stage < targetStep; stage += 1) {
      if (!validateStep(stage)) {
        setStep(stage);
        return;
      }
    }
    setStep(targetStep);
  };

  const handleImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) return;

    setImages((current) => {
      const newImages = [...current];
      for (const file of selected) {
        const nullIndex = newImages.indexOf(null);
        if (nullIndex !== -1) {
          newImages[nullIndex] = file;
        } else {
          newImages.push(file);
        }
      }
      return newImages.slice(0, 30);
    });

    event.target.value = "";
    setErrors((current) => ({ ...current, images: undefined }));
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const newImages = [...current];
      newImages[index] = null;
      return newImages;
    });
  };

  const handleDocuments = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []).map((file) => ({
        docType: documentType,
        file,
      }));
    setDocuments((current) => [...current, ...selected]);
    event.target.value = "";
  };

  const conditionOptions = ["EXCELLENT", "GOOD", "DAMAGED", "NOT_RUNNING"].map((condition) => {
      return {
        value: condition,
        label: (conditionTranslations as Record<string, string>)?.[condition] ?? condition
      };
  });

  const localizedDisplayRegion = useMemo(() => {
    if (!draft.region) return "";
    const canonical = findCanonicalRegion(draft.region);
    if (!canonical) return draft.region;
    return currentLang === "ru"
      ? canonical.ru
      : currentLang === "en"
        ? canonical.en
        : canonical.uz;
  }, [draft.region, currentLang]);

  const stageTitle = copy.wizard.stages[step];
  const reviewRows = [
      { title: copy.wizard.vin, value: draft.vin },
      { title: copy.wizard.make, value: selectedMake ?? draft.make },
      { title: copy.wizard.model, value: selectedModel ?? draft.model },
      { title: copy.wizard.year, value: draft.year },
      { title: copy.wizard.mileage, value: draft.mileage && `${draft.mileage} km` },
      { title: copy.wizard.engineVolume, value: draft.engineVolume && `${draft.engineVolume} L` },
      { title: copy.wizard.fuel, value: copy.wizard.optionLabels[draft.fuel] ?? draft.fuel },
      { title: copy.wizard.transmission, value: copy.wizard.optionLabels[draft.transmission] ?? draft.transmission },
      { title: copy.wizard.drivetrain, value: copy.wizard.optionLabels[draft.drivetrain] ?? draft.drivetrain },
      { title: copy.wizard.bodyType, value: copy.wizard.optionLabels[draft.bodyType] ?? draft.bodyType },
      { title: copy.wizard.conditionGrade, value: copy.wizard.optionLabels[draft.conditionGrade] ?? draft.conditionGrade },
      { title: copy.wizard.color, value: draft.color },
      { title: copy.wizard.region, value: localizedDisplayRegion || draft.region },
      { title: copy.wizard.description, value: draft.description },
      { title: copy.wizard.photoLabel, value: String(images.filter(Boolean).length) },
      { title: copy.wizard.documentLabel, value: String(documents.length) },
      { title: copy.wizard.startPrice, value: `${formatAuctionAmount(auctionDraft.startPrice)} ${auctionDraft.currency}` },
      { title: auctionLabels.reserve, value: `${formatAuctionAmount(auctionDraft.reservePrice)} ${auctionDraft.currency}` },
      { title: copy.wizard.increment, value: auctionDraft.incrementType === "PERCENTAGE" ? `${auctionDraft.incrementValue}%` : `${formatAuctionAmount(auctionDraft.incrementValue)} ${auctionDraft.currency}` },
      { title: auctionLabels.deposit, value: `${auctionDraft.depositPercent}%` },
      { title: copy.wizard.startTime, value: auctionDraft.startTime },
      { title: auctionLabels.end, value: auctionDraft.endTime },
    ];

  if (isAuthenticated && !ownerId) {
    return (
      <section className="px-[var(--content-gutter)] py-12">
        <div
          className="mx-auto max-w-3xl rounded-lg border border-semantic-warning/40 bg-semantic-warning-surface p-6 text-text-primary"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert aria-hidden="true" className="shrink-0 text-semantic-warning" size={26} />
            <div>
              <h1 className="font-display text-2xl font-bold">{copy.wizard.title}</h1>
              <p className="mt-2 leading-7">{copy.wizard.sellerIdentityRequired}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-[var(--content-gutter)] py-2">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold-text">{copy.wizard.eyebrow}</p>
        {/* <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="max-w-4xl font-display text-3xl font-bold leading-tight text-text-primary md:text-4xl">
              {copy.wizard.title}
            </h1>
            <p className="mt-3 max-w-3xl leading-7 text-text-secondary">{copy.wizard.intro}</p>
          </div>
          <div
            className={`flex items-center gap-2 text-sm font-semibold ${draftPersistence === "saved" ? "text-semantic-success" : draftPersistence === "failed" ? "text-semantic-warning" : "text-text-secondary"}`}
          >
            {draftPersistence === "saved" ? (
              <Save aria-hidden="true" size={18} />
            ) : (
              <AlertTriangle aria-hidden="true" size={18} />
            )}
            <span>
              {draftPersistence === "saved"
                ? copy.wizard.draftSaved
                : draftPersistence === "failed"
                  ? copy.wizard.draftStorageUnavailable
                  : copy.wizard.draftSessionOnly}
            </span>
          </div>
        </div> */}

        <div className="mt-2 grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <Surface className="self-start p-3" padding="none">
            <p className="text-sm font-bold text-text-secondary">
              {copy.wizard.step} {step + 1} {copy.wizard.of} {copy.wizard.stages.length}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
              <div
                className="h-full rounded-full bg-brand-champagne-500 transition-transform"
                style={{ transform: `scaleX(${(step + 1) / copy.wizard.stages.length})`, transformOrigin: "left" }}
              />
            </div>
            <ol className="mt-3 space-y-0.5" aria-label={copy.wizard.title}>
              {copy.wizard.stages.map((stage, index) => (
                <li key={stage}>
                  <button
                    aria-current={index === step ? "step" : undefined}
                    aria-label={stage}
                    className={`flex min-h-10 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
                      index === step
                        ? "bg-brand-navy-900 font-bold text-white"
                        : index < step
                          ? "font-semibold text-semantic-success hover:bg-semantic-success-surface"
                          : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                    }`}
                    disabled={submissionComplete}
                    onClick={() => goToStep(index)}
                    type="button"
                  >
                    <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-xs tabular-nums">
                      {index < step ? <CheckCircle2 size={15} /> : index + 1}
                    </span>
                    <span>{stage}</span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-3 border-t border-border-default pt-3 text-xs leading-4 text-text-secondary">
              {copy.wizard.draftHint}
            </p>
            <p className={`mt-2 text-xs font-bold ${draftPersistence === "saved" ? "text-semantic-success" : draftPersistence === "failed" ? "text-semantic-warning" : "text-text-secondary"}`}>
              {draftPersistence === "saved" ? copy.wizard.draftSaved : draftPersistence === "failed" ? copy.wizard.draftStorageUnavailable : copy.wizard.draftSessionOnly}
            </p>
          </Surface>

          <Surface className="min-w-0 p-5" padding="none">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-gold-text">
              {copy.wizard.step} {step + 1}
            </p>
            <h2 className="mt-1 text-xl font-bold text-text-primary" tabIndex={-1}>
              {stageTitle}
            </h2>

            <form className="mt-5" noValidate onSubmit={(event) => event.preventDefault()}>
              {step === 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <WizardField error={errors.vin} field="vin" label={copy.wizard.vin} onChange={update} value={draft.vin} />
                  {decodeVinMutation.isPending && (
                    <div className="md:col-span-2 flex items-center gap-2 text-xs text-brand-primary font-medium py-1">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      <span>{currentLang === "uz" ? "VIN orqali avtomobil ma'lumotlari aniqlanmoqda..." : currentLang === "ru" ? "Определение данных автомобиля по VIN..." : "Decoding vehicle details via VIN..."}</span>
                    </div>
                  )}
                  {vinDecodeNotice && (
                    <div className={`md:col-span-2 rounded-xl p-3 text-xs flex items-start gap-2.5 ${
                      vinDecodeNotice.tone === "success"
                        ? "bg-semantic-success/10 border border-semantic-success/30 text-semantic-success font-medium"
                        : "bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300"
                    }`}>
                      {vinDecodeNotice.tone === "success" ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-semantic-success" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      )}
                      <span>{vinDecodeNotice.message}</span>
                    </div>
                  )}
                  <LookupSelect
                    error={errors.make}
                    field="make"
                    isError={makesQuery.isError}
                    isLoading={makesQuery.isLoading}
                    label={copy.wizard.make}
                    onChange={update}
                    options={makesQuery.data ?? []}
                    value={draft.make}
                  />
                  <LookupSelect
                    disabled={!draft.make}
                    error={errors.model}
                    field="model"
                    isError={modelsQuery.isError}
                    isLoading={modelsQuery.isLoading}
                    label={copy.wizard.model}
                    onChange={update}
                    options={modelsQuery.data ?? []}
                    value={draft.model}
                  />
                  <YearSelect error={errors.year} label={copy.wizard.year} onChange={update} value={draft.year} />
                </div>
              ) : null}

              {step === 1 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <WizardField error={errors.mileage} field="mileage" label={copy.wizard.mileage} onChange={update} type="number" value={draft.mileage} />
                  <WizardField error={errors.engineVolume} field="engineVolume" label={copy.wizard.engineVolume} onChange={update} type="number" value={draft.engineVolume} disabled={draft.fuel === "ELECTRIC"} />
                  <WizardSelect error={errors.fuel} field="fuel" label={copy.wizard.fuel} onChange={update} options={["PETROL", "DIESEL", "GAS", "HYBRID", "ELECTRIC"]} value={draft.fuel} />
                  <WizardSelect error={errors.transmission} field="transmission" label={copy.wizard.transmission} onChange={update} options={["MANUAL", "AUTOMATIC", "CVT", "ROBOT"]} value={draft.transmission} disabled={draft.fuel === "ELECTRIC"} />
                  <WizardSelect error={errors.drivetrain} field="drivetrain" label={copy.wizard.drivetrain} onChange={update} options={["FWD", "RWD", "AWD"]} value={draft.drivetrain} />
                  <WizardSelect error={errors.bodyType} field="bodyType" label={copy.wizard.bodyType} onChange={update} options={["SEDAN", "SUV", "HATCHBACK", "COUPE", "CONVERTIBLE", "WAGON", "MINIVAN", "PICKUP"]} value={draft.bodyType} />
                </div>
              ) : null}

               {step === 2 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <WizardSelect error={errors.conditionGrade} field="conditionGrade" label={copy.wizard.conditionGrade} onChange={update} options={conditionOptions} value={draft.conditionGrade} />
                  <LookupSelect error={errors.region} field="region" isError={regionsQuery.isError} isLoading={regionsQuery.isLoading} label={copy.wizard.region} onChange={update} options={regionOptions} value={draft.region} />
                 
                 <fieldset
  aria-describedby={errors.color ? "vehicle-color-error" : undefined}
  aria-invalid={Boolean(errors.color)}
  className={`rounded-lg border p-4 ${
    errors.color ? "border-semantic-danger" : "border-border-default"
  }`}
>
  <legend className="flex items-center gap-1.5 px-1 text-sm font-semibold text-text-primary">
    <span>{copy.wizard.color}</span>
    <FieldInfo text={wizardTooltips[currentLang]?.color} />
  </legend>

  <div className="mt-3 flex flex-wrap gap-3">
    {VEHICLE_COLORS.map((color) => {
      const colorLabel = copy.wizard.optionLabels[color.value.toUpperCase()] ?? color.value;
      return (
        <button
          key={color.value}
          type="button"
          role="radio"
          aria-checked={draft.color === color.value}
          onClick={() => update("color", color.value)}
          className={`
            flex h-11 items-center gap-2 rounded-lg border px-3
            transition-all duration-200
            ${
              draft.color === color.value
                ? "border-brand-navy-900 bg-brand-navy-900 text-white shadow-md"
                : "border-border-default bg-white hover:border-brand-navy-400 hover:bg-gray-50"
            }
          `}
        >
          <span
            className="h-5 w-5 rounded-full border border-black/20"
            style={{ backgroundColor: color.hex }}
          />
          <span className="text-sm font-medium">{colorLabel}</span>
        </button>
      );
    })}
  </div>

  {errors.color && (
    <ErrorText id="vehicle-color-error" message={errors.color} />
  )}
</fieldset>

                  <div className="md:col-span-2"><WizardTextarea error={errors.description} field="description" label={copy.wizard.description} onChange={update} value={draft.description} /></div>
                </div>
              ) : null}

              {step === 3 ? (
                <div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-bold text-text-primary" htmlFor="vehicle-images">{copy.wizard.photoLabel}</label>
                    <FieldInfo text={wizardTooltips[currentLang]?.photoLabel} />
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{copy.wizard.photoGuidance}</p>
                  <label htmlFor="vehicle-images" className={`mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-surface-muted p-6 text-center focus-within:outline-3 focus-within:outline-offset-2 ${errors.images ? "border-semantic-danger focus-within:outline-semantic-danger" : "border-brand-champagne-600 focus-within:outline-focus-ring"}`}>
                    <ImagePlus aria-hidden="true" className="text-brand-gold-text" size={30} />
                    <span className="mt-3 font-bold text-text-primary">Upload vehicle photos</span>
                    <span className="mt-1 text-sm text-text-secondary">{images.filter(Boolean).length} / 30</span>
                    <input
                      accept="image/*"
                      aria-describedby={errors.images ? "vehicle-images-error" : "vehicle-images-guidance"}
                      aria-invalid={Boolean(errors.images)}
                      className="sr-only"
                      id="vehicle-images"
                      multiple
                      onChange={handleImages}
                      type="file"
                    />
                  </label>
                  <p className="mt-3 text-sm leading-6 text-text-secondary" id="vehicle-images-guidance">{copy.wizard.photoApiLimit}</p>
                  {errors.images ? <ErrorText id="vehicle-images-error" message={errors.images} /> : null}
                  {images.length ? (
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {images.map((file, index) => (
                        <li className="flex items-center justify-between rounded-md border border-border-default px-3 py-2 text-sm text-text-secondary" key={file ? `${file.name}-${index}` : `empty-${index}`}>
                          <span className="truncate">{index + 1}. {file ? file.name : (currentLang === "uz" ? "Bo'sh joy" : currentLang === "ru" ? "Пустой слот" : "Empty Slot")}</span>
                          {file ? (
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="ml-2 shrink-0 text-semantic-error hover:text-red-700 p-1 rounded transition-colors"
                              aria-label="Remove image"
                            >
                              <X size={16} />
                            </button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              {step === 4 ? (
                <div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-bold text-text-primary" htmlFor="vehicle-documents">{copy.wizard.documentLabel}</label>
                    <FieldInfo text={wizardTooltips[currentLang]?.documentLabel} />
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{copy.wizard.documentGuidance}</p>
                  <div className={`mt-5 rounded-lg border p-5 ${resolvedCapability === "unavailable" ? "border-semantic-warning/40 bg-semantic-warning-surface" : "border-semantic-info/30 bg-semantic-info-surface"}`}>
                    <div className="flex items-start gap-3">
                      {resolvedCapability === "unavailable" ? <ShieldAlert aria-hidden="true" className="shrink-0 text-semantic-warning" size={24} /> : <FileCheck2 aria-hidden="true" className="shrink-0 text-semantic-info" size={24} />}
                      <p className="text-sm leading-6 text-text-primary">
                        {resolvedCapability === "unavailable" ? copy.wizard.documentUnavailable : resolvedCapability === "demo" ? copy.wizard.documentDemo : copy.wizard.documentGuidance}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-1.5">
                      <label className="text-sm font-bold text-text-primary" htmlFor="vehicle-document-type">{copy.wizard.documentType}</label>
                      <FieldInfo text={wizardTooltips[currentLang]?.documentType} />
                    </div>
                    <AppSelect
                      id="vehicle-document-type"
                      disabled={resolvedCapability === "unavailable"}
                      value={documentType}
                      native={isTestEnv}
                      onChange={(val) => setDocumentType(val as VehicleDocumentType)}
                      options={[
                        { value: "TITLE", label: copy.wizard.documentTypeLabels.TITLE },
                        { value: "CUSTOMS", label: copy.wizard.documentTypeLabels.CUSTOMS },
                        { value: "INSPECTION", label: copy.wizard.documentTypeLabels.INSPECTION },
                      ]}
                    />
                  </div>
                  <input
                    className={`${inputClass} py-3 file:mr-3 file:rounded-md file:border-0 file:bg-brand-navy-900 file:px-3 file:py-2 file:font-bold file:text-white`}
                    disabled={resolvedCapability === "unavailable"}
                    id="vehicle-documents"
                    multiple
                    onChange={handleDocuments}
                    type="file"
                  />
                  {documents.length ? (
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {documents.map(({ docType, file }, index) => (
                        <li className="truncate rounded-md border border-border-default px-3 py-2 text-sm text-text-secondary" key={`${docType}-${file.name}-${index}`}>
                          {copy.wizard.documentTypeLabels[docType] ?? docType} · {file.name}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

               {step === 5 ? (
                 valuationState === "loading" ? (
                   <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]" data-testid="ai-valuation-loader">
                     {/* Circular progress bar with rotating indicator */}
                     <div className="relative w-32 h-32 flex items-center justify-center">
                       <svg className="w-full h-full transform -rotate-90">
                         <circle
                           cx="64"
                           cy="64"
                           r="54"
                           className="text-surface-muted stroke-current"
                           strokeWidth="8"
                           fill="transparent"
                         />
                         <circle
                           cx="64"
                           cy="64"
                           r="54"
                           className="text-brand-champagne-500 stroke-current transition-all duration-300"
                           strokeWidth="8"
                           strokeDasharray={2 * Math.PI * 54}
                           strokeDashoffset={2 * Math.PI * 54 * (1 - progressPercent / 100)}
                           fill="transparent"
                           strokeLinecap="round"
                         />
                       </svg>
                       <span className="absolute text-2xl font-extrabold text-text-primary">
                         {progressPercent}%
                       </span>
                     </div>

                     <h3 className="mt-6 text-lg font-bold text-text-primary animate-pulse">
                       {currentLang === "uz" ? "AI Narx Baholovchi" : currentLang === "ru" ? "AI Оценщик Цены" : "AI Price Evaluator"}
                     </h3>
                     <p className="mt-2 text-sm text-text-secondary max-w-sm">
                       {progressMessage}
                     </p>
                   </div>
                 ) : (
                    <div>
                      {isAiUnavailable ? (
                        <div className="space-y-4 mb-4" data-testid="ai-valuation-unavailable-alert">
                          <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm dark:border-amber-800/60 dark:bg-amber-950/30">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400">
                                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                  {currentLang === "uz"
                                    ? "AI narx baholash xizmati vaqtinchalik ishlamayapti"
                                    : currentLang === "ru"
                                    ? "Сервис AI-оценки временно недоступен"
                                    : "AI price estimation is temporarily unavailable"}
                                </h4>
                                <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                                  {currentLang === "uz"
                                    ? "Auksion boshlang'ich narxi va shartlarini quyida qo'lda kiritishingiz mumkin."
                                    : currentLang === "ru"
                                    ? "Вы можете указать стартовую цену и условия аукциона вручную ниже."
                                    : "You can enter the starting price and auction terms manually below."}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handleRecalculate}
                                className="shrink-0 text-xs font-bold text-amber-900 underline hover:text-amber-950 dark:text-amber-200 dark:hover:text-amber-100 cursor-pointer"
                              >
                                {currentLang === "uz" ? "Qayta urinish" : currentLang === "ru" ? "Повторить" : "Retry"}
                              </button>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-text-primary">
                              {currentLang === "uz"
                                ? "Auksion Shartlarini Kiriting"
                                : currentLang === "ru"
                                ? "Укажите условия аукциона"
                                : "Enter Auction Terms"}
                            </h3>
                            <p className="text-sm text-text-secondary mt-1">
                              {currentLang === "uz"
                                ? "Avtomobil uchun boshlang'ich narx, zaxira narxi va savdo qadamini belgilang."
                                : currentLang === "ru"
                                ? "Укажите стартовую цену, резервную цену и шаг ставки для автомобиля."
                                : "Specify the starting price, reserve price, and bid increment for the vehicle."}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div data-testid="ai-valuation-slider">
                          <h3 className="text-lg font-bold text-text-primary">
                            {currentLang === "uz" ? "Auksion Boshlang'ich Narxini Tanlang" : currentLang === "ru" ? "Выберите стартовую цену аукциона" : "Select Your Auction Starting Price"}
                          </h3>
                          <p className="text-sm text-text-secondary mt-1">
                            {currentLang === "uz" ? (
                              <>Bizning AI tahlilimizga ko&apos;ra, o&apos;xshash avtomobillar <span className="font-bold text-text-primary">{priceRecommendation.minPrice.toLocaleString()}</span> va <span className="font-bold text-text-primary">{priceRecommendation.maxPrice.toLocaleString()} {priceRecommendation.currency}</span> oralig&apos;ida sotiladi.</>
                            ) : currentLang === "ru" ? (
                              <>На основе нашего ИИ-анализа аналогичные автомобили продаются в диапазоне от <span className="font-bold text-text-primary">{priceRecommendation.minPrice.toLocaleString()}</span> до <span className="font-bold text-text-primary">{priceRecommendation.maxPrice.toLocaleString()} {priceRecommendation.currency}</span>.</>
                            ) : (
                              <>Based on our AI analysis, similar cars sell between <span className="font-bold text-text-primary">{priceRecommendation.minPrice.toLocaleString()}</span> and <span className="font-bold text-text-primary">{priceRecommendation.maxPrice.toLocaleString()} {priceRecommendation.currency}</span>.</>
                            )}
                          </p>

                          <div className="mt-10 px-4">
                            {/* Slider track background with red-yellow-green-yellow-red gradient */}
                            <div 
                              className="relative w-full h-2 rounded-lg"
                              style={{ backgroundImage: 'linear-gradient(to right, #ef4444, #eab308, #22c55e, #eab308, #ef4444)' }}
                            >
                              <input
                                type="range"
                                min={priceRecommendation.minPrice}
                                max={priceRecommendation.maxPrice}
                                value={Number(auctionDraft.startPrice) || priceRecommendation.minPrice}
                                onChange={(e) => {
                                  setAuctionDraft(prev => ({ ...prev, startPrice: e.target.value }));
                                }}
                                className="absolute -top-1.5 left-0 w-full h-5 opacity-0 cursor-pointer"
                                aria-label="AI Price Selector"
                              />
                              {/* Visual Dot slider overlay */}
                              <div
                                className="absolute -top-2 w-6 h-6 rounded-full bg-white border-4 border-brand-navy-900 shadow-md pointer-events-none transform -translate-x-1/2"
                                style={{
                                  left: `${(( (Number(auctionDraft.startPrice) || priceRecommendation.minPrice) - priceRecommendation.minPrice) /
                                    (priceRecommendation.maxPrice - priceRecommendation.minPrice || 1)) * 100}%`
                                }}
                              />
                            </div>
                            {/* Labels underneath the slider */}
                            <div className="flex justify-between text-xs font-semibold text-text-secondary mt-4">
                              <span className="text-red-500 font-bold">
                                Min: {priceRecommendation.minPrice.toLocaleString()} {priceRecommendation.currency}
                              </span>
                              <span className="text-brand-navy-800 text-sm font-extrabold bg-surface-muted px-3 py-1 rounded-full">
                                {currentLang === "uz" ? "Tanlangan: " : currentLang === "ru" ? "Выбрано: " : "Selected: "} {Number(auctionDraft.startPrice).toLocaleString()} {priceRecommendation.currency}
                              </span>
                              <span className="text-green-600 font-bold">
                                Max: {priceRecommendation.maxPrice.toLocaleString()} {priceRecommendation.currency}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                     {/* Pre-filled but fully customizable additional fields */}
                     <div className="mt-8 pt-6 border-t border-border-default grid gap-5 md:grid-cols-2">
                       <MoneyInput
                         error={auctionErrors.startPrice}
                         id="auction-startPrice"
                         label={copy.wizard.startPrice}
                         name="startPrice"
                         value={formatAuctionAmount(auctionDraft.startPrice)}
                         tooltip={wizardTooltips[currentLang]?.startPrice}
                         onChange={(value: string) => {
                           setAuctionDraft((current) => ({ ...current, startPrice: value }));
                           setAuctionErrors((current) => ({ ...current, startPrice: undefined }));
                         }}
                       />

                       <MoneyInput
                         error={auctionErrors.reservePrice}
                         id="auction-reservePrice"
                         label={auctionLabels.reserve}
                         name="reservePrice"
                         value={formatAuctionAmount(auctionDraft.reservePrice)}
                         tooltip={wizardTooltips[currentLang]?.reservePrice}
                         onChange={(value: string) => {
                           setAuctionDraft((current) => ({ ...current, reservePrice: value }));
                           setAuctionErrors((current) => ({ ...current, reservePrice: undefined }));
                         }}
                       />
                       
                       <div>
                         <div className="mb-1 flex items-center gap-1.5">
                           <label className="text-sm font-bold text-text-primary" htmlFor="auction-currency">{auctionLabels.currency}</label>
                           <FieldInfo text={wizardTooltips[currentLang]?.currency} />
                         </div>
                         <AppSelect
                           id="auction-currency"
                           value={auctionDraft.currency}
                           native={isTestEnv}
                           onChange={(val) => setAuctionDraft((current) => ({ ...current, currency: val as AuctionDraft["currency"] }))}
                           options={[
                             { value: "UZS", label: "UZS" },
                             { value: "USD", label: "USD" },
                           ]}
                         />
                       </div>

                       <div>
                         <div className="mb-1 flex items-center gap-1.5">
                           <label className="text-sm font-bold text-text-primary" htmlFor="auction-depositPercent">{auctionLabels.deposit}</label>
                           <FieldInfo text={wizardTooltips[currentLang]?.deposit} />
                         </div>
                         <input aria-describedby={auctionErrors.depositPercent ? "auction-depositPercent-error" : undefined} aria-invalid={Boolean(auctionErrors.depositPercent)} className={`${inputClass} ${auctionErrors.depositPercent ? invalidInputClass : ""}`} id="auction-depositPercent" max="100" min="0" onChange={(event) => { setAuctionDraft((current) => ({ ...current, depositPercent: event.target.value })); setAuctionErrors((current) => ({ ...current, depositPercent: undefined })); }} type="number" value={auctionDraft.depositPercent}/>
                         {auctionErrors.depositPercent ? <ErrorText id="auction-depositPercent-error" message={auctionErrors.depositPercent}/> : null}
                       </div>

                       <div>
                         <div className="mb-1 flex items-center gap-1.5">
                           <label className="text-sm font-bold text-text-primary" htmlFor="auction-incrementType">{auctionLabels.incrementType}</label>
                           <FieldInfo text={wizardTooltips[currentLang]?.incrementType} />
                         </div>
                         <AppSelect
                           id="auction-incrementType"
                           value={auctionDraft.incrementType}
                           native={isTestEnv}
                           onChange={(val) => setAuctionDraft((current) => ({ ...current, incrementType: val as AuctionDraft["incrementType"], incrementValue: "" }))}
                           options={[
                             { value: "FIXED", label: auctionLabels.fixed },
                             { value: "PERCENTAGE", label: auctionLabels.percentage },
                           ]}
                         />
                       </div>

                       <div>
                         <div className="mb-1 flex items-center gap-1.5">
                           <label className="text-sm font-bold text-text-primary" htmlFor="auction-incrementValue">
                             {copy.wizard.increment} {auctionDraft.incrementType === "FIXED" ? `(${auctionDraft.currency})` : "(%)"}
                           </label>
                           <FieldInfo text={wizardTooltips[currentLang]?.incrementValue} />
                         </div>
                         <div className="relative"><input aria-describedby={auctionErrors.incrementValue ? "auction-incrementValue-error" : undefined} aria-invalid={Boolean(auctionErrors.incrementValue)} className={`${inputClass} ${auctionDraft.incrementType === "PERCENTAGE" ? "pr-10" : ""} ${auctionErrors.incrementValue ? invalidInputClass : ""}`} id="auction-incrementValue" inputMode={auctionDraft.incrementType === "FIXED" ? "numeric" : "decimal"} onChange={(event) => { const value = auctionDraft.incrementType === "FIXED" ? event.target.value.replace(/\D/g, "") : event.target.value.replace(/[^\d.]/g, ""); setAuctionDraft((current) => ({ ...current, incrementValue: value })); setAuctionErrors((current) => ({ ...current, incrementValue: undefined })); }} value={auctionDraft.incrementType === "FIXED" ? formatAuctionAmount(auctionDraft.incrementValue) : auctionDraft.incrementValue}/>{auctionDraft.incrementType === "PERCENTAGE" ? <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-extrabold text-text-secondary">%</span> : null}</div>
                         {auctionErrors.incrementValue ? <ErrorText id="auction-incrementValue-error" message={auctionErrors.incrementValue}/> : null}
                       </div>
                       <p className="text-sm text-text-secondary md:col-span-2">{copy.wizard.auctionTermsNote}</p>
                     </div>

                     <div className="mt-8 flex justify-end gap-3 border-t border-border-default pt-4">
                       <button
                         type="button"
                         onClick={handleRecalculate}
                         className="px-4 py-2 text-sm font-bold text-text-secondary border border-border-default rounded-md hover:bg-surface-muted transition-all duration-200"
                       >
                         {currentLang === "uz" ? "Qayta hisoblash" : currentLang === "ru" ? "Пересчитать" : "Recalculate"}
                       </button>
                     </div>
                   </div>
                 )
               ) : null}

              {step === 6 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {[["startTime", copy.wizard.startTime], ["endTime", auctionLabels.end]].map(([field, label]) => {
                    const key = field as keyof AuctionDraft;
                    const error = auctionErrors[key];
                    const id = `auction-${field}`;
                    return (
                      <div key={field}>
                        <div className="mb-1 flex items-center gap-1.5">
                          <label className="text-sm font-bold text-text-primary" htmlFor={id}>{label}</label>
                          <FieldInfo text={wizardTooltips[currentLang]?.[field]} />
                        </div>
                        <input aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)} className={`${inputClass} ${error ? invalidInputClass : ""}`} id={id} onChange={(event) => { setAuctionDraft((current) => ({ ...current, [field]: event.target.value })); setAuctionErrors((current) => ({ ...current, [key]: undefined })); }} type="datetime-local" value={auctionDraft[key]} />
                        {error ? <ErrorText id={`${id}-error`} message={error} /> : null}
                      </div>
                    );
                  })}
                  <p className="text-sm text-text-secondary md:col-span-2">{copy.wizard.auctionTermsNote}</p>
                </div>
              ) : null}

              {step === finalStep ? (
                <div>
                  <p className="text-text-secondary">{copy.wizard.reviewIntro}</p>
                  <dl className="mt-5 overflow-hidden rounded-lg border border-border-default">
                    {reviewRows.map((row) => (
                      <div className="grid gap-1 border-b border-border-default p-4 last:border-b-0 md:grid-cols-[13rem_1fr] md:gap-5" key={row.title}>
                        <dt className="text-sm font-bold text-text-primary">{row.title}</dt>
                        <dd className="min-w-0 break-words text-sm leading-6 text-text-secondary">{row.value || copy.wizard.notProvided}</dd>
                      </div>
                    ))}
                  </dl>
                  <CapabilityNotice capability={resolvedCapability} />
                </div>
              ) : null}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border-default pt-4 sm:flex-row sm:justify-between">
                <Button disabled={step === 0 || submissionComplete} onClick={() => setStep((current) => Math.max(0, current - 1))} variant="outline">
                  {copy.wizard.back}
                </Button>
                {step < finalStep ? (
                  <Button disabled={step === 5 && valuationState === "loading"} onClick={goNext}>{copy.wizard.next}</Button>
                ) : resolvedCapability === "demo" ? (
                  <Button disabled fullWidth={false}>{copy.wizard.demoAction}</Button>
                ) : resolvedCapability === "live" ? (
                  <LiveVehicleSubmission
                    key={ownerId ?? "anonymous"}
                    draft={draft}
                    editVehicleId={editVehicleId}
                    auctionDraft={auctionDraft}
                    draftStorageKey={ownerId ? vehicleDraftKey(ownerId) : null}
                    documents={documents}
                    images={images.filter(Boolean) as File[]}
                    isAuthenticated={isAuthenticated}
                    isSeller={isSeller}
                    onCreated={() => setSubmissionComplete(true)}
                    sellerId={ownerId}
                    submissionComplete={submissionComplete}
                  />
                ) : (
                  <Button disabled>{copy.wizard.submit}</Button>
                )}
              </div>
            </form>
          </Surface>
        </div>
      </div>
    </section>
  );
}

function LiveVehicleSubmission({
  auctionDraft,
  draft,
  draftStorageKey,
  documents,
  editVehicleId,
  images,
  isAuthenticated,
  isSeller,
  onCreated,
  sellerId,
  submissionComplete,
}: {
  auctionDraft: AuctionDraft;
  draft: VehicleDraft;
  draftStorageKey: string | null;
  documents: PendingVehicleDocument[];
  editVehicleId?: string;
  images: File[];
  isAuthenticated: boolean;
  isSeller: boolean;
  onCreated: () => void;
  sellerId: string | null;
  submissionComplete: boolean;
}) {
  const copy = useTask6Copy();
  const { currentLang } = useContext(LangSwitch);
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [createdVehicleId, setCreatedVehicleId] = useState<string | number | null>(null);

  const handleMutationError = (error: unknown) => {
    const msg = apiErrorMessage(error, copy.wizard.submitError);
    const normalizedMessage = msg.toLowerCase();
    const requiresKyc = normalizedMessage.includes("kyc") || normalizedMessage.includes("financial state");
    if (requiresKyc) {
      setSubmitError("");
      setStatus("idle");
      setKycModalOpen(true);
      return;
    }
    if (normalizedMessage.includes("doctype")) {
      const localizedDocError =
        currentLang === "ru"
          ? "Документ должен быть Техпаспортом, Таможенной декларацией или Актом осмотра."
          : currentLang === "uz"
            ? "Hujjat turi Texnik pasport, Bojxona deklaratsiyasi yoki Texnik ko'rik bo'lishi kerak."
            : "Document type must be TITLE, CUSTOMS or INSPECTION.";
      setSubmitError(localizedDocError);
      setStatus("error");
      return;
    }
    setSubmitError(msg);
    setStatus("error");
  };

  const createListing = useCreateAuctionWithVehicle() as unknown as MutationHandle<Record<string, unknown>, unknown>;
  const uploadAssets = useUploadVehicleAssets() as unknown as MutationHandle<
    { vehicleId: string | number; images: File[]; documents: PendingVehicleDocument[] },
    unknown
  >;
  const updateVehicle = useUpdateVehicle() as unknown as MutationHandle<{ id: string | number; form: Record<string, unknown> }>;
  const resolvedSellerId = normalizeSellerIdentity(sellerId);
  const safeToSubmit =
    isAuthenticated &&
    isSeller &&
    Boolean(resolvedSellerId) &&
    Number.isSafeInteger(Number(draft.make)) && Number(draft.make) > 0 &&
    Number.isSafeInteger(Number(draft.model)) && Number(draft.model) > 0 &&
    draft.vin.trim().length === 17 &&
    Number.isSafeInteger(Number(draft.year)) && Number(draft.year) >= 1950 &&
    Number(draft.mileage) >= 0 &&
    (draft.fuel === "ELECTRIC" || Number(draft.engineVolume) > 0) &&
    Boolean(draft.fuel && draft.transmission && draft.drivetrain && draft.bodyType) &&
    Boolean(draft.color.trim() && draft.conditionGrade && draft.region.trim() && draft.description.trim()) &&
    (editVehicleId ? true : (
      images.filter(Boolean).length >= 5 &&
      images.filter(Boolean).length <= 30 &&
      parseAuctionAmount(auctionDraft.startPrice) > 0 &&
      parseAuctionAmount(auctionDraft.incrementValue) > 0 &&
      Number.isFinite(new Date(auctionDraft.startTime).getTime()) &&
      new Date(auctionDraft.endTime).getTime() > new Date(auctionDraft.startTime).getTime()
    ));

  const completeSubmission = () => {
    setStatus("success");
    onCreated();
    if (draftStorageKey) window.localStorage.removeItem(draftStorageKey);
    router.push(editVehicleId ? `/dashboard/vehicles/${editVehicleId}` : "/dashboard/vehicles");
  };

  const submit = () => {
    if (
      status === "success" ||
      submissionComplete ||
      !safeToSubmit ||
      !resolvedSellerId
    ) {
      return;
    }
    setStatus("idle");
    setSubmitError("");
    const form = {
      bodyType: draft.bodyType,
      color: draft.color,
      conditionGrade: draft.conditionGrade,
      description: draft.description,
      drivetrain: draft.drivetrain,
      engineVolume: draft.engineVolume,
      fuelType: draft.fuel,
      makeId: draft.make,
      mileage: draft.mileage,
      modelId: draft.model,
      region: draft.region,
      transmission: draft.transmission,
      vin: draft.vin,
      year: draft.year,
    };
    if (editVehicleId) {
      updateVehicle.mutate({ id: editVehicleId, form }, {
        onError: handleMutationError,
        onSuccess: completeSubmission,
      });
      return;
    }
    const uploadCreatedVehicleAssets = (vehicleId: string | number) => {
      uploadAssets.mutate({ vehicleId, documents, images: images.filter(Boolean) as File[] }, {
        onError: handleMutationError,
        onSuccess: completeSubmission,
      });
    };
    if (createdVehicleId) {
      uploadCreatedVehicleAssets(createdVehicleId);
      return;
    }
    createListing.mutate({
      vehicle: form,
      auction: {
        startPrice: parseAuctionAmount(auctionDraft.startPrice),
        startTime: formatAuctionApiWallTime(auctionDraft.startTime),
        endTime: formatAuctionApiWallTime(auctionDraft.endTime),
        reservePrice: parseAuctionAmount(auctionDraft.reservePrice),
        currency: auctionDraft.currency,
        incrementType: auctionDraft.incrementType,
        incrementValue: parseAuctionAmount(auctionDraft.incrementValue),
        depositPercent: Number(auctionDraft.depositPercent),
      },
    }, {
      onError: handleMutationError,
      onSuccess: (response) => {
        const vehicleId = resolveCreatedVehicleId(response);
        if (!vehicleId) {
          setSubmitError(copy.wizard.submitError);
          setStatus("error");
          return;
        }
        setCreatedVehicleId(vehicleId);
        uploadCreatedVehicleAssets(vehicleId);
      },
    });
  };

  return (
    <>
      <ConfirmModal
        cancelText={copy.wizard.kycRequiredCancel}
        confirmText={copy.wizard.kycRequiredAction}
        description={copy.wizard.kycRequiredDescription}
        onCancel={() => setKycModalOpen(false)}
        onConfirm={() => router.push("/dashboard/kyc")}
        open={kycModalOpen}
        showCancel={false}
        title={copy.wizard.kycRequiredTitle}
      />
      <div className="mt-8 flex w-full max-w-xl flex-col items-end gap-4 ml-auto">
      {!isAuthenticated && (
        <div className="flex items-start gap-3 w-full rounded-xl border border-semantic-warning/30 bg-semantic-warning-surface/45 p-4 text-semantic-warning backdrop-blur-sm shadow-sm transition-all duration-200">
          <ShieldAlert className="size-5 mt-0.5 shrink-0 text-semantic-warning" />
          <div className="flex-1">
            <p className="text-sm font-bold leading-normal">{copy.wizard.loginRequired}</p>
          </div>
        </div>
      )}
      {status === "success" && (
        <div className="flex items-start gap-3 w-full rounded-xl border border-semantic-success/30 bg-semantic-success-surface/45 p-4 text-semantic-success backdrop-blur-sm shadow-sm transition-all duration-200" role="status">
          <CheckCircle2 className="size-5 mt-0.5 shrink-0 text-semantic-success" />
          <div className="flex-1">
            <p className="text-sm font-bold leading-normal">{copy.wizard.submitSuccess}</p>
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-start gap-3 w-full rounded-xl border border-semantic-danger/30 bg-semantic-danger-surface/45 p-4 text-semantic-danger backdrop-blur-sm shadow-sm transition-all duration-200" role="alert">
          <AlertTriangle className="size-5 mt-0.5 shrink-0 text-semantic-danger" />
          <div className="flex-1">
            <p className="text-sm font-bold leading-normal">{submitError || copy.wizard.submitError}</p>
          </div>
        </div>
      )}
      <div className="flex gap-4">
        <Button
          className="relative min-h-12 px-8 rounded-xl font-black text-sm uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={
            !safeToSubmit ||
            Boolean(createListing.isPending) || Boolean(uploadAssets.isPending) || Boolean(updateVehicle.isPending) ||
            status === "success" ||
            submissionComplete
          }
          onClick={submit}
          type="button"
        >
          {createListing.isPending || uploadAssets.isPending || updateVehicle.isPending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {copy.wizard.submitting}
            </span>
          ) : (
            copy.wizard.submit
          )}
        </Button>
      </div>
      </div>
    </>
  );
}

function CapabilityNotice({ capability }: { capability: CapabilityState }) {
  const copy = useTask6Copy();
  if (capability === "live") return null;
  const unavailable = capability === "unavailable";
  const title = unavailable
    ? copy.wizard.unavailableTitle
    : copy.wizard.demoTitle;
  const body = unavailable
    ? copy.wizard.unavailableBody
    : copy.wizard.demoBody;
  return (
    <div className={`mt-6 rounded-lg border p-5 ${unavailable ? "border-semantic-warning/40 bg-semantic-warning-surface" : "border-semantic-info/30 bg-semantic-info-surface"}`}>
      <div className="flex items-start gap-3">
        {unavailable ? <AlertTriangle aria-hidden="true" className="shrink-0 text-semantic-warning" size={23} /> : <FileCheck2 aria-hidden="true" className="shrink-0 text-semantic-info" size={23} />}
        <div>
          <h3 className="font-bold text-text-primary">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{body}</p>
        </div>
      </div>
    </div>
  );
}

interface WizardFieldProps {
  field: DraftField;
  label: string;
  value: string;
  onChange: (field: DraftField, value: string) => void;
  error?: string;
  type?: "datetime-local" | "number" | "text";
  disabled?: boolean;
}

function WizardField({ error, field, label, onChange, type = "text", value, disabled }: WizardFieldProps) {
  const { currentLang } = useContext(LangSwitch);
  const copy = useTask6Copy();
  const id = `vehicle-${field}`;
  const errorId = `${id}-error`;
  const placeholder = field === "vin" ? copy.wizard.vinHint : field === "engineVolume" ? copy.wizard.engineVolumeHint : field === "mileage" ? copy.wizard.mileageHint : undefined;
  const tooltipText = wizardTooltips[currentLang]?.[field];

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-bold text-text-primary" htmlFor={id}>{label}</label>
        <FieldInfo text={tooltipText} />
      </div>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className={`${inputClass} ${error ? invalidInputClass : ""} ${disabled ? "bg-surface-muted text-text-secondary cursor-not-allowed opacity-70" : ""}`}
        id={id}
        maxLength={field === "vin" ? 17 : undefined}
        min={type === "number" ? "0" : undefined}
        onChange={(event) => onChange(field, event.target.value)}
        placeholder={placeholder}
        step={field === "engineVolume" ? "0.1" : undefined}
        type={type}
        value={value}
        disabled={disabled}
      />
      {error ? <ErrorText id={errorId} message={error} /> : null}
    </div>
  );
}

function WizardSelect({
  error,
  field,
  label,
  onChange,
  options,
  value,
  disabled,
}: Omit<WizardFieldProps, "type"> & { options: readonly string[] | {value: string, label: string}[]; disabled?: boolean }) {
  const { currentLang } = useContext(LangSwitch);
  const copy = useTask6Copy();
  const id = `vehicle-${field}`;
  const errorId = `${id}-error`;
  const tooltipText = wizardTooltips[currentLang]?.[field];

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-bold text-text-primary" htmlFor={id}>{label}</label>
        <FieldInfo text={tooltipText} />
      </div>
      <AppSelect
        id={id}
        error={error}
        disabled={disabled || false}
        value={value}
        native={isTestEnv}
        onChange={(val) => onChange(field, String(val))}
        options={options.map((opt) => (
          typeof opt === "string" 
            ? { value: opt, label: copy.wizard.optionLabels[opt] ?? opt }
            : opt
        ))}
      />
      {error ? <ErrorText id={errorId} message={error} /> : null}
    </div>
  );
}

function getVehicleYearOptions() {
  const latestYear = new Date().getFullYear();
  return Array.from({ length: latestYear - 1950 + 1 }, (_, index) => String(latestYear - index));
}

function YearSelect({
  error,
  label,
  onChange,
  value,
}: Pick<WizardFieldProps, "error" | "label" | "onChange" | "value">) {
  const { currentLang } = useContext(LangSwitch);
  const copy = useTask6Copy();
  const id = "vehicle-year";
  const errorId = `${id}-error`;
  const years = getVehicleYearOptions();
  const quickYears = years.slice(0, 4);
  const tooltipText = wizardTooltips[currentLang]?.year;

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-bold text-text-primary" htmlFor={id}>{label}</label>
        <FieldInfo text={tooltipText} />
      </div>
      <AppSelect
        id={id}
        aria-label={label}
        error={error}
        placeholder={copy.wizard.selectPlaceholder}
        value={value}
        native={isTestEnv}
        onChange={(val) => onChange("year", String(val))}
        options={years.map((y) => ({ value: y, label: y }))}
      />
      <div className="mt-2 flex flex-wrap gap-2" aria-label={`${label} quick choices`}>
        {quickYears.map((year) => {
          const selected = value === year;
          return (
            <button
              aria-pressed={selected}
              className={`rounded-full border px-3 py-1 text-xs font-extrabold transition-colors ${
                selected
                  ? "border-brand-navy-900 bg-brand-navy-900 text-white"
                  : "border-border-default bg-white text-text-secondary hover:border-border-strong"
              }`}
              key={year}
              onClick={() => onChange("year", year)}
              type="button"
            >
              {year}
            </button>
          );
        })}
      </div>
      {error ? <ErrorText id={errorId} message={error} /> : null}
    </div>
  );
}

function LookupSelect({
  disabled = false,
  error,
  field,
  isError,
  isLoading,
  label,
  onChange,
  options,
  value,
}: Omit<WizardFieldProps, "type"> & {
  disabled?: boolean;
  isError: boolean;
  isLoading: boolean;
  options: VehicleLookupOption[];
}) {
  const { currentLang } = useContext(LangSwitch);
  const copy = useTask6Copy();
  const id = `vehicle-${field}`;
  const errorId = `${id}-error`;
  const message = error ?? (isError ? copy.wizard.lookupError : undefined);
  const tooltipText = wizardTooltips[currentLang]?.[field];

  const resolvedValue = useMemo(() => {
    if (field !== "region" || !value) return value;
    const directMatch = options.find((opt) => String(opt.id) === String(value));
    if (directMatch) return value;
    const canonical = findCanonicalRegion(value);
    if (!canonical) return value;
    const currentLabel =
      currentLang === "ru"
        ? canonical.ru
        : currentLang === "en"
          ? canonical.en
          : canonical.uz;
    const match = options.find(
      (opt) => opt.name === currentLabel || String(opt.id) === currentLabel,
    );
    return match ? String(match.id) : value;
  }, [field, value, options, currentLang]);

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-bold text-text-primary" htmlFor={id}>{label}</label>
        <FieldInfo text={tooltipText} />
      </div>
      <AppSelect
        id={id}
        aria-label={label}
        error={message}
        disabled={disabled || isLoading}
        native={isTestEnv}
        placeholder={
          isLoading
            ? copy.wizard.lookupLoading
            : disabled
              ? copy.wizard.selectMakeFirst
              : copy.wizard.selectPlaceholder
        }
        value={resolvedValue}
        onChange={(val) => onChange(field, String(val))}
        options={options.map((opt) => ({ value: String(opt.id), label: opt.name }))}
      />
      {message ? <ErrorText id={errorId} message={message} /> : null}
    </div>
  );
}

function WizardTextarea({ error, field, label, onChange, value }: Omit<WizardFieldProps, "type">) {
  const { currentLang } = useContext(LangSwitch);
  const id = `vehicle-${field}`;
  const errorId = `${id}-error`;
  const tooltipText = wizardTooltips[currentLang]?.[field];

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-bold text-text-primary" htmlFor={id}>{label}</label>
        <FieldInfo text={tooltipText} />
      </div>
      <textarea
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className={`${inputClass} min-h-36 resize-y py-3 ${error ? invalidInputClass : ""}`}
        id={id}
        onChange={(event) => onChange(field, event.target.value)}
        value={value}
      />
      {error ? <ErrorText id={errorId} message={error} /> : null}
    </div>
  );
}

function ErrorText({ id, message }: { id: string; message: string }) {
  return <p className="mt-2 text-sm font-semibold text-semantic-danger" id={id} role="alert">{message}</p>;
}
