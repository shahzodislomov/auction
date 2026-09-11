"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileCode,
  FileText,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useContext, useMemo, useState } from "react";

import { Surface } from "@/components/ui/Surface";
import { StatusBadge, type StatusBadgeTone } from "@/components/ui/StatusBadge";
import { StatePanel } from "@/components/feedback/StatePanel";
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import useDebounce from "@/hooks/useDebounce";
import {
  useGetAiFailedVehicles,
  useGetAiLogs,
  useRetryAiProcessing,
} from "@/queries/auction-listings";

interface AiVehicleRecord {
  id?: string | number;
  vehicleId?: string | number;
  make?: string;
  makeName?: string;
  model?: string;
  modelName?: string;
  year?: string | number;
  vin?: string;
  color?: string;
  region?: string;
  sellerId?: string | number;
  ownerId?: string | number;
  userId?: string | number;
  status?: string;
  images?: unknown[];
  imageUrls?: unknown[];
  photos?: unknown[];
  lotImageDtoList?: unknown[];
  imageUrl?: string;
  mainImage?: string;
  image?: string;
  [key: string]: unknown;
}

const copy: Record<Lang, Record<string, string>> = {
  uz: {
    title: "AI Photo qayta ishlash",
    subtitle:
      "Auksion tasdiqlangandan so‘ng avtoraqamlarga avtomatik logo yopishtirish jarayonida xatolik yuz bergan avtomobillar, ularning loglari va qayta urinish boshqaruvi.",
    failedCount: "Xatolik yuz bergan avtomobillar",
    searchPlaceholder: "ID, Marka, Model yoki VIN bo‘yicha qidirish...",
    manualInspectTitle: "Ixtiyoriy avtomobilni tekshirish",
    manualInspectDesc: "Xatolar ro‘yxatida bo‘lmasa ham, Vehicle ID kiriting va loglarini ko‘ring:",
    inspectBtn: "Loglarni ko‘rish",
    retryBtn: "AI qayta urinish",
    retrying: "Qayta ishlanmoqda...",
    retrySuccess: "AI qayta ishlash so‘rovi muvaffaqiyatli yuborildi.",
    retryError: "AI qayta ishlashni ishga tushirib bo‘lmadi.",
    loading: "Yuklanmoqda...",
    errorTitle: "Ma’lumotlarni yuklab bo‘lmadi",
    emptyTitle: "AI xatoliklari mavjud emas",
    emptyDesc: "Barcha avtomobil rasmlari muvaffaqiyatli qayta ishlangan yoki xatoliklar navbati bo‘sh.",
    refresh: "Yangilash",
    vehicleId: "Vehicle ID",
    vin: "VIN",
    region: "Hudud",
    seller: "Sotuvchi",
    logsModalTitle: "AI qayta ishlash loglari",
    logsModalDesc: "Avtomobil rasmlariga logo qo‘yish bo‘yicha batafsil operatsion yozuvlar",
    noLogs: "Ushbu avtomobil uchun AI loglari topilmadi.",
    photos: "Rasmlar",
    close: "Yopish",
    step: "Bosqich",
    time: "Vaqt",
    status: "Holat",
    rawDetails: "Texnik tafsilotlar",
    copyJson: "Nusxalash",
    copied: "Nusxalandi!",
  },
  ru: {
    title: "AI Обработка фото",
    subtitle:
      "Управление автомобилями, в которых произошла ошибка автоматического наложения логотипа на номерные знаки после одобрения аукциона, просмотр логов и повторная обработка.",
    failedCount: "Автомобили с ошибками",
    searchPlaceholder: "Поиск по ID, марке, модели или VIN...",
    manualInspectTitle: "Проверка любого автомобиля",
    manualInspectDesc: "Введите Vehicle ID для просмотра логов, даже если его нет в списке ошибок:",
    inspectBtn: "Смотреть логи",
    retryBtn: "Повторить AI",
    retrying: "Обработка...",
    retrySuccess: "Запрос на повторную AI-обработку успешно отправлен.",
    retryError: "Не удалось запустить повторную AI-обработку.",
    loading: "Загрузка...",
    errorTitle: "Не удалось загрузить данные",
    emptyTitle: "Нет ошибок AI",
    emptyDesc: "Все фотографии автомобилей успешно обработаны или очередь ошибок пуста.",
    refresh: "Обновить",
    vehicleId: "Vehicle ID",
    vin: "VIN",
    region: "Регион",
    seller: "Продавец",
    logsModalTitle: "Логи AI обработки",
    logsModalDesc: "Подробные операционные записи по наложению логотипа на номерные знаки",
    noLogs: "Логи AI для данного автомобиля не найдены.",
    photos: "Фотографии",
    close: "Закрыть",
    step: "Шаг",
    time: "Время",
    status: "Статус",
    rawDetails: "Технические детали",
    copyJson: "Копировать",
    copied: "Скопировано!",
  },
  en: {
    title: "AI Photo Processing",
    subtitle:
      "Manage vehicles where the automatic license plate logo overlay failed after auction approval. Inspect detailed AI logs and retry processing.",
    failedCount: "Failed vehicles",
    searchPlaceholder: "Search by ID, make, model, or VIN...",
    manualInspectTitle: "Inspect Any Vehicle",
    manualInspectDesc: "Enter a Vehicle ID to view logs, even if it is not currently in the failure queue:",
    inspectBtn: "View logs",
    retryBtn: "Retry AI",
    retrying: "Processing...",
    retrySuccess: "AI processing retry request successfully dispatched.",
    retryError: "Could not dispatch AI retry request.",
    loading: "Loading...",
    errorTitle: "Could not load data",
    emptyTitle: "No AI failures",
    emptyDesc: "All vehicle photos were processed successfully or the failure queue is empty.",
    refresh: "Refresh",
    vehicleId: "Vehicle ID",
    vin: "VIN",
    region: "Region",
    seller: "Seller",
    logsModalTitle: "AI Processing Logs",
    logsModalDesc: "Detailed operational logs for license plate masking and logo placement",
    noLogs: "No AI logs found for this vehicle.",
    photos: "Photos",
    close: "Close",
    step: "Step",
    time: "Time",
    status: "Status",
    rawDetails: "Technical details",
    copyJson: "Copy",
    copied: "Copied!",
  },
};

function normalizePhotoUrl(input: unknown): string | null {
  if (!input) return null;
  let url = "";
  if (typeof input === "string") {
    url = input.trim();
  } else if (typeof input === "object" && input !== null) {
    const obj = input as Record<string, unknown>;
    const candidate =
      obj.url ?? obj.imageUrl ?? obj.image ?? obj.path ?? obj.downloadUrl;
    if (typeof candidate === "string") url = candidate.trim();
  }
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  return `https://api.tezauksion.uz${url.startsWith("/") ? "" : "/"}${url}`;
}

function extractImagesFromVehicle(vehicle?: AiVehicleRecord | null): string[] {
  if (!vehicle) return [];
  const candidates: unknown[] = [];
  const addIfArray = (val: unknown) => {
    if (Array.isArray(val)) candidates.push(...val);
  };

  addIfArray(vehicle.imageUrls);
  addIfArray(vehicle.images);
  addIfArray(vehicle.photos);
  addIfArray(vehicle.lotImageDtoList);
  if (vehicle.imageUrl) candidates.push(vehicle.imageUrl);
  if (vehicle.mainImage) candidates.push(vehicle.mainImage);
  if (vehicle.image) candidates.push(vehicle.image);

  const seen = new Set<string>();
  const list: string[] = [];
  for (const item of candidates) {
    const norm = normalizePhotoUrl(item);
    if (norm && !seen.has(norm)) {
      seen.add(norm);
      list.push(norm);
    }
  }
  return list;
}

function getVehicleId(record: AiVehicleRecord): string {
  const val = record.vehicleId ?? record.id;
  return val !== undefined && val !== null ? String(val) : "";
}

function getVehicleTitle(record: AiVehicleRecord): string {
  const make = record.makeName || record.make || "";
  const model = record.modelName || record.model || "";
  const year = record.year ? String(record.year) : "";
  const parts = [make, model, year].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : `Vehicle #${getVehicleId(record)}`;
}

function formatLogTimestamp(value: unknown): string {
  if (!value) return "—";
  try {
    const date = new Date(String(value));
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return String(value);
  }
}

function getStatusTone(status?: string): StatusBadgeTone {
  const s = String(status || "").toUpperCase();
  if (s.includes("SUCCESS") || s.includes("COMPLETED") || s.includes("DONE")) {
    return "success";
  }
  if (
    s.includes("FAIL") ||
    s.includes("ERROR") ||
    s.includes("REJECT") ||
    s.includes("CRASH")
  ) {
    return "danger";
  }
  if (s.includes("PENDING") || s.includes("RETRY") || s.includes("WAIT")) {
    return "warning";
  }
  return "info";
}

function Lightbox({
  images,
  index,
  onClose,
}: {
  images: string[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  if (!images || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-brand-navy-950/90 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <button
        aria-label="Close"
        className="absolute right-4 top-4 z-10 text-white hover:text-brand-champagne-400"
        onClick={onClose}
        type="button"
      >
        <X size={32} />
      </button>

      {images.length > 1 ? (
        <>
          <button
            aria-label="Previous"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-white hover:text-brand-champagne-400"
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((c) => (c - 1 + images.length) % images.length);
            }}
            type="button"
          >
            <ChevronLeft size={44} />
          </button>
          <button
            aria-label="Next"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-white hover:text-brand-champagne-400"
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((c) => (c + 1) % images.length);
            }}
            type="button"
          >
            <ChevronRight size={44} />
          </button>
        </>
      ) : null}

      <div className="relative max-h-[88vh] max-w-[88vw] overflow-hidden rounded-xl border border-white/10 bg-black/40 p-2 shadow-2xl">
        <img
          alt="Enlarged vehicle"
          className="max-h-[82vh] max-w-[82vw] object-contain"
          onClick={(e) => e.stopPropagation()}
          src={images[current]}
        />
        <div className="mt-2 text-center text-xs font-bold text-white/70">
          {current + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

export function AdminAiProcessingWorkspace() {
  const { currentLang } = useContext(LangSwitch);
  const t = copy[currentLang];

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim().toLowerCase(), 300);

  const [manualIdInput, setManualIdInput] = useState("");
  const [inspectVehicleId, setInspectVehicleId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<AiVehicleRecord | null>(null);

  const [feedback, setFeedback] = useState<{
    tone: "success" | "danger";
    message: string;
  } | null>(null);

  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  const failedQuery = useGetAiFailedVehicles();
  const retryMutation = useRetryAiProcessing() as any;
  const logsQuery = useGetAiLogs(inspectVehicleId);

  const rawFailedList: AiVehicleRecord[] = useMemo(() => {
    if (!failedQuery.data) return [];
    if (Array.isArray(failedQuery.data)) return failedQuery.data as AiVehicleRecord[];
    return [];
  }, [failedQuery.data]);

  const filteredVehicles = useMemo(() => {
    if (!debouncedSearch) return rawFailedList;
    return rawFailedList.filter((v) => {
      const id = getVehicleId(v).toLowerCase();
      const title = getVehicleTitle(v).toLowerCase();
      const vin = String(v.vin || "").toLowerCase();
      return (
        id.includes(debouncedSearch) ||
        title.includes(debouncedSearch) ||
        vin.includes(debouncedSearch)
      );
    });
  }, [rawFailedList, debouncedSearch]);

  const handleRetry = async (vehicleId: string) => {
    if (!vehicleId) return;
    setFeedback(null);
    try {
      await retryMutation.mutateAsync(vehicleId);
      setFeedback({
        tone: "success",
        message: `${t.retrySuccess} (Vehicle #${vehicleId})`,
      });
      if (inspectVehicleId === vehicleId) {
        void logsQuery.refetch();
      }
    } catch {
      setFeedback({
        tone: "danger",
        message: `${t.retryError} (Vehicle #${vehicleId})`,
      });
    }
  };

  const handleOpenLogs = (vehicle: AiVehicleRecord) => {
    const vId = getVehicleId(vehicle);
    setSelectedVehicle(vehicle);
    setInspectVehicleId(vId);
  };

  const handleManualInspect = (e: React.FormEvent) => {
    e.preventDefault();
    const id = manualIdInput.trim();
    if (!id) return;
    const existing = rawFailedList.find((v) => getVehicleId(v) === id);
    setSelectedVehicle(existing || { id, vehicleId: id });
    setInspectVehicleId(id);
  };

  const closeLogsModal = () => {
    setInspectVehicleId(null);
    setSelectedVehicle(null);
  };

  const vehicleImages = useMemo(
    () => extractImagesFromVehicle(selectedVehicle),
    [selectedVehicle]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-brand-champagne-500/30 bg-gradient-to-r from-brand-navy-950 via-brand-navy-900 to-brand-navy-950 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-champagne-500/30 bg-brand-champagne-500/10 px-3 py-1 text-xs font-bold text-brand-champagne-300">
              <Sparkles className="size-3.5 text-brand-champagne-400" />
              <span>AI Photo Optimization & Masking</span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {t.title}
            </h1>
            <p className="mt-1 max-w-2xl text-xs font-medium text-white/70 sm:text-sm">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              disabled={failedQuery.isFetching}
              onClick={() => {
                void failedQuery.refetch();
              }}
              type="button"
            >
              <RefreshCw
                className={`size-4 ${failedQuery.isFetching ? "animate-spin text-brand-champagne-400" : ""}`}
              />
              <span>{t.refresh}</span>
            </button>
          </div>
        </div>

        {/* Counter and manual lookup row */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-champagne-300">
                {t.failedCount}
              </span>
              <AlertTriangle className="size-4 text-semantic-danger" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tabular-nums text-white">
                {rawFailedList.length}
              </span>
              <span className="text-xs text-white/60">dona</span>
            </div>
          </div>

          {/* Quick Manual Inspector */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:col-span-1 lg:col-span-2">
            <form
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
              onSubmit={handleManualInspect}
            >
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-brand-champagne-300">
                  {t.manualInspectTitle}
                </span>
                <p className="text-[11px] text-white/60">{t.manualInspectDesc}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  aria-label={t.vehicleId}
                  className="min-h-10 w-32 rounded-lg border border-white/20 bg-black/30 px-3 text-xs font-bold text-white placeholder:text-white/40 focus:border-brand-champagne-500 focus:outline-none"
                  placeholder="ID (e.g. 42)"
                  type="text"
                  value={manualIdInput}
                  onChange={(e) => setManualIdInput(e.target.value)}
                />
                <button
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-brand-champagne-500 px-4 text-xs font-black text-brand-navy-950 transition hover:bg-brand-champagne-400 disabled:opacity-50"
                  disabled={!manualIdInput.trim()}
                  type="submit"
                >
                  <Search size={14} />
                  <span>{t.inspectBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback ? (
        <div
          className={`flex items-center justify-between rounded-xl p-4 text-sm font-bold shadow-sm ${
            feedback.tone === "success"
              ? "border border-semantic-success/30 bg-semantic-success/15 text-semantic-success"
              : "border border-semantic-danger/30 bg-semantic-danger/15 text-semantic-danger"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.tone === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            aria-label="Close message"
            className="text-current opacity-70 hover:opacity-100"
            onClick={() => setFeedback(null)}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      {/* Search Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary size-4" />
          <input
            aria-label={t.searchPlaceholder}
            className="min-h-11 w-full rounded-xl border border-border-default bg-surface-canvas pl-9 pr-4 text-sm font-semibold text-text-primary outline-none transition focus:border-brand-champagne-500 focus:ring-2 focus:ring-brand-champagne-500/20"
            placeholder={t.searchPlaceholder}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {failedQuery.isError ? (
        <StatePanel
          action={
            <button
              className="rounded-lg bg-brand-navy-900 px-4 py-2 text-sm font-bold text-white hover:bg-brand-navy-800"
              onClick={() => void failedQuery.refetch()}
              type="button"
            >
              {t.refresh}
            </button>
          }
          title={t.errorTitle}
        />
      ) : failedQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border-default bg-surface-canvas py-16">
          <Loader2 className="size-8 animate-spin text-brand-champagne-500" />
          <span className="text-sm font-bold text-text-secondary">{t.loading}</span>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <Surface className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-brand-champagne-500/10 text-brand-champagne-600">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-lg font-black text-text-primary">{t.emptyTitle}</h3>
          <p className="max-w-md text-xs font-medium text-text-secondary">
            {t.emptyDesc}
          </p>
        </Surface>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => {
            const vId = getVehicleId(vehicle);
            const title = getVehicleTitle(vehicle);
            const images = extractImagesFromVehicle(vehicle);
            const firstImg = images[0] || null;
            const isRetrying =
              retryMutation.isPending &&
              retryMutation.variables === vId;

            return (
              <Surface
                key={vId || Math.random()}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border-default p-0 transition hover:border-brand-champagne-500/60 hover:shadow-lg"
              >
                {/* Card Image Banner */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-navy-950/20">
                  {firstImg ? (
                    <img
                      alt={title}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={firstImg}
                      onClick={() => setLightbox({ images, index: 0 })}
                    />
                  ) : (
                    <div className="grid size-full place-items-center bg-surface-muted text-text-secondary">
                      <ImageIcon className="size-10 opacity-40" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="rounded-md bg-brand-navy-950/80 px-2.5 py-1 text-xs font-black text-white backdrop-blur">
                      #{vId}
                    </span>
                    <StatusBadge tone="danger">AI Failed</StatusBadge>
                  </div>
                  {images.length > 1 ? (
                    <button
                      className="absolute bottom-2 right-2 rounded-md bg-brand-navy-950/70 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur"
                      onClick={() => setLightbox({ images, index: 0 })}
                      type="button"
                    >
                      +{images.length - 1} foto
                    </button>
                  ) : null}
                </div>

                {/* Card Details */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="line-clamp-1 text-base font-black text-text-primary">
                      {title}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs text-text-secondary">
                      {vehicle.vin ? (
                        <div className="flex items-center justify-between">
                          <span>{t.vin}:</span>
                          <span className="font-mono font-bold text-text-primary">
                            {vehicle.vin}
                          </span>
                        </div>
                      ) : null}
                      {vehicle.region ? (
                        <div className="flex items-center justify-between">
                          <span>{t.region}:</span>
                          <span className="font-bold text-text-primary">
                            {vehicle.region}
                          </span>
                        </div>
                      ) : null}
                      {vehicle.sellerId || vehicle.ownerId || vehicle.userId ? (
                        <div className="flex items-center justify-between">
                          <span>{t.seller}:</span>
                          <span className="font-bold text-text-primary">
                            #{vehicle.sellerId ?? vehicle.ownerId ?? vehicle.userId}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2 border-t border-border-default pt-3">
                    <button
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border-default bg-surface-canvas px-3 text-xs font-extrabold text-brand-navy-900 transition hover:bg-surface-muted"
                      onClick={() => handleOpenLogs(vehicle)}
                      type="button"
                    >
                      <FileText size={15} />
                      <span>{t.inspectBtn}</span>
                    </button>

                    <button
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-navy-900 px-3 text-xs font-extrabold text-white transition hover:bg-brand-navy-800 disabled:opacity-50"
                      disabled={isRetrying}
                      onClick={() => void handleRetry(vId)}
                      type="button"
                    >
                      {isRetrying ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin text-brand-champagne-400" />
                          <span>{t.retrying}</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={13} />
                          <span>{t.retryBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Surface>
            );
          })}
        </div>
      )}

      {/* AI Logs Modal */}
      {inspectVehicleId ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy-950/70 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !retryMutation.isPending) {
              closeLogsModal();
            }
          }}
          role="presentation"
        >
          <Surface
            aria-modal="true"
            className="my-6 max-h-[90vh] w-full max-w-4xl overflow-y-auto shadow-2xl"
            role="dialog"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border-default pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-brand-champagne-500/15 px-2 py-0.5 text-xs font-black text-brand-champagne-700">
                    Vehicle #{inspectVehicleId}
                  </span>
                  <StatusBadge tone="danger">AI Optimization</StatusBadge>
                </div>
                <h2 className="mt-2 text-xl font-black text-text-primary">
                  {selectedVehicle ? getVehicleTitle(selectedVehicle) : t.logsModalTitle}
                </h2>
                <p className="text-xs font-medium text-text-secondary">
                  {t.logsModalDesc}
                </p>
              </div>

              <button
                aria-label={t.close}
                className="grid size-10 place-items-center rounded-xl border border-border-default text-text-secondary transition hover:bg-surface-muted hover:text-text-primary"
                onClick={closeLogsModal}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            {/* Photos Preview in Modal */}
            {vehicleImages.length > 0 ? (
              <div className="mt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  {t.photos} ({vehicleImages.length})
                </span>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                  {vehicleImages.map((src, idx) => (
                    <img
                      key={idx}
                      alt={`Vehicle thumbnail ${idx + 1}`}
                      className="size-20 shrink-0 cursor-pointer rounded-lg border border-border-default object-cover transition hover:opacity-80"
                      src={src}
                      onClick={() =>
                        setLightbox({ images: vehicleImages, index: idx })
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {/* Logs Body */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-text-primary">
                  {t.logsModalTitle}
                </h3>
                <button
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-navy-900 hover:underline"
                  disabled={logsQuery.isFetching}
                  onClick={() => void logsQuery.refetch()}
                  type="button"
                >
                  <RefreshCw
                    className={`size-3.5 ${logsQuery.isFetching ? "animate-spin" : ""}`}
                  />
                  <span>{t.refresh}</span>
                </button>
              </div>

              {logsQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12">
                  <Loader2 className="size-6 animate-spin text-brand-champagne-500" />
                  <span className="text-xs font-bold text-text-secondary">
                    {t.loading}
                  </span>
                </div>
              ) : logsQuery.isError ? (
                <div className="rounded-xl border border-semantic-danger/30 bg-semantic-danger/10 p-4 text-xs font-bold text-semantic-danger">
                  {t.errorTitle}
                </div>
              ) : !logsQuery.data || (Array.isArray(logsQuery.data) && logsQuery.data.length === 0) ? (
                <div className="rounded-xl border border-border-default bg-surface-muted p-8 text-center text-xs font-medium text-text-secondary">
                  {t.noLogs}
                </div>
              ) : (
                <div className="space-y-2">
                  {(Array.isArray(logsQuery.data) ? logsQuery.data : [logsQuery.data]).map(
                    (logItem: unknown, index: number) => {
                      const log =
                        typeof logItem === "object" && logItem !== null
                          ? (logItem as Record<string, unknown>)
                          : { message: String(logItem) };

                      const status = String(
                        log.status || log.level || log.state || ""
                      );
                      const step = String(
                        log.step || log.action || log.stage || log.operation || ""
                      );
                      const message = String(
                        log.message || log.error || log.details || log.description || ""
                      );
                      const timestamp =
                        log.timestamp || log.createdAt || log.created_at || log.time;

                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-border-default bg-surface-canvas p-3 transition hover:border-border-strong"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {status ? (
                                <StatusBadge tone={getStatusTone(status)}>
                                  {status}
                                </StatusBadge>
                              ) : null}
                              {step ? (
                                <span className="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-[11px] font-bold text-text-primary">
                                  {step}
                                </span>
                              ) : null}
                            </div>
                            <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                              <Clock size={12} />
                              {formatLogTimestamp(timestamp)}
                            </span>
                          </div>

                          {message ? (
                            <p className="mt-2 text-xs font-semibold text-text-primary">
                              {message}
                            </p>
                          ) : null}

                          {/* Raw technical payload expansion */}
                          <details className="mt-2 group">
                            <summary className="cursor-pointer text-[11px] font-bold text-brand-navy-900 hover:underline">
                              {t.rawDetails}
                            </summary>
                            <pre className="mt-1.5 max-h-48 overflow-x-auto rounded-lg bg-brand-navy-950 p-2.5 font-mono text-[11px] text-brand-champagne-300">
                              {JSON.stringify(logItem, null, 2)}
                            </pre>
                          </details>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-border-default pt-4">
              <button
                className="rounded-xl border border-border-default px-4 py-2.5 text-xs font-extrabold text-text-primary transition hover:bg-surface-muted"
                onClick={closeLogsModal}
                type="button"
              >
                {t.close}
              </button>

              <button
                className="inline-flex items-center gap-2 rounded-xl bg-brand-navy-900 px-5 py-2.5 text-xs font-black text-white transition hover:bg-brand-navy-800 disabled:opacity-50"
                disabled={
                  retryMutation.isPending &&
                  retryMutation.variables === inspectVehicleId
                }
                onClick={() => void handleRetry(inspectVehicleId)}
                type="button"
              >
                {retryMutation.isPending &&
                retryMutation.variables === inspectVehicleId ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin text-brand-champagne-400" />
                    <span>{t.retrying}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>{t.retryBtn}</span>
                  </>
                )}
              </button>
            </div>
          </Surface>
        </div>
      ) : null}

      {/* Lightbox for photo inspection */}
      {lightbox ? (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  );
}
