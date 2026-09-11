"use client";

import {
  Bell,
  BellOff,
  ChevronLeft,
  ChevronRight,
  Heart,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { useContext, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { StatePanel } from "@/components/feedback/StatePanel";
import { TabsAndListSkeleton } from "@/components/feedback/ContentSkeletons";
import { Button } from "@/components/ui/Button";
import { FieldInfo } from "@/components/ui/FieldInfo";
import { AppSelect } from "@/components/ui/AppSelect";
import { PageSizeSelect } from "@/components/ui/PageSizeSelect";
import { Surface } from "@/components/ui/Surface";
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import {
  useCreateSavedSearch,
  useDeleteSavedSearch,
  useMySavedSearches,
  useUpdateSavedSearch,
  type SavedSearch,
} from "@/queries/saved-searches";
import { useVehicleMakes, useVehicleModels } from "@/queries/vehicles";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { useLikedLots, useLot, useLotImages, useAllLotsAvailable } from "@/queries/lots";

function useSafeQueryClient() {
  try {
    return useQueryClient();
  } catch {
    return null;
  }
}

function WatchlistLotCardItem({ liked, index, allCachedLots }: { liked: any; index: number; allCachedLots: any[] }) {
  const queryClient = useSafeQueryClient();
  const auctionId = liked?.id ?? liked?.auctionId ?? liked?.lotId ?? index;

  const cachedLot = allCachedLots.find((l: any) => String(l.id) === String(auctionId) || String(l.auctionId) === String(auctionId)) || queryClient?.getQueryData(["lot", auctionId]);
  const hasImmediateData = Boolean(cachedLot || liked?.title || liked?.make || liked?.auction || liked?.lot || (Array.isArray(liked?.images) && liked.images.length > 0));
  
  const { data: fetchedLot } = useLot(hasImmediateData ? null : auctionId);
  const hasImages = Boolean((Array.isArray(cachedLot?.images) && cachedLot.images.length > 0) || (Array.isArray(liked?.images) && liked.images.length > 0) || liked?.image || liked?.imageUrl || cachedLot?.image || cachedLot?.imageUrl);
  const { data: lotImagesData } = useLotImages(hasImages ? null : auctionId);

  const auction = cachedLot ?? liked?.auction ?? liked?.lot ?? fetchedLot ?? (hasImmediateData ? liked : null);
  if (!auction) return null;

  const hasRealDetails = Boolean(
    auction.title || auction.make || auction.name || auction.model ||
    (Array.isArray(auction.images) && auction.images.length > 0) ||
    (Array.isArray(lotImagesData) && lotImagesData.length > 0) ||
    auction.image || auction.imageUrl || auction.startPrice || auction.price || auction.startingPrice
  );
  if (!hasRealDetails && !fetchedLot) return null;

  const yearMakeModel = [auction.year ?? auction.productionYear, auction.make, auction.model].filter(Boolean).join(" ");

  const extractImages = () => {
    if (Array.isArray(auction.images) && auction.images.length > 0) return auction.images;
    if (Array.isArray(auction.lotImageDtoList) && auction.lotImageDtoList.length > 0) {
      return auction.lotImageDtoList.map((img: any) => img.url || img.imagePath || img.path || img);
    }
    if (Array.isArray(lotImagesData) && lotImagesData.length > 0) {
      return lotImagesData.map((img: any) => img.url || img.imagePath || img.path || img);
    }
    if (Array.isArray(auction.photos) && auction.photos.length > 0) return auction.photos;
    if (auction.image) return [auction.image];
    if (auction.imageUrl) return [auction.imageUrl];
    if (auction.mainImage) return [auction.mainImage];
    if (liked.image) return [liked.image];
    if (liked.imageUrl) return [liked.imageUrl];
    return [];
  };

  const rawStatus = auction.status ?? auction.lotStatus ?? auction.state;
  const statusStr = rawStatus ? String(rawStatus).toLowerCase() : "live";
  const finalStatus = statusStr === "upcoming" || statusStr === "ended" || statusStr === "sold" ? statusStr : "live";

  const normalizedAuction = {
    ...auction,
    id: auctionId,
    title: auction.title ?? auction.name ?? (yearMakeModel ? yearMakeModel : `Lot #${auctionId}`),
    year: auction.year ?? auction.productionYear ?? auction.manufactureYear ?? null,
    mileage: auction.mileage ?? auction.mileageKm ?? auction.odometer ?? auction.distance ?? null,
    startPrice: auction.startPrice ?? auction.startingPrice ?? auction.price ?? auction.currentBid ?? auction.currentPrice ?? 0,
    currentPrice: auction.currentPrice ?? auction.currentBid ?? auction.price ?? auction.startPrice ?? auction.startingPrice ?? null,
    images: extractImages(),
    region: auction.region ?? (typeof auction.location === "string" ? { name: auction.location } : typeof auction.city === "string" ? { name: auction.city } : null),
    status: finalStatus,
  };

  return <AuctionCard auction={normalizedAuction} />;
}

export function WatchlistAuctionsSection({ userId }: { userId?: string | number }) {
  const { currentLang } = useContext(LangSwitch);
  const copy = sectionCopy[currentLang];
  const queryClient = useSafeQueryClient();
  const { data: likedLots, isLoading, isError } = useLikedLots(userId);
  const availableQuery = useAllLotsAvailable(0, 100);
  const availableLots = availableQuery?.data;

  const allCachedLots = useMemo(() => {
    const cached = queryClient?.getQueryData(["allLots"]) || queryClient?.getQueryData(["allLotsAvailable"]) || queryClient?.getQueryData(["initialLots"]);
    const list = Array.isArray(cached) ? cached : Array.isArray((cached as any)?.content) ? (cached as any).content : Array.isArray((cached as any)?.data) ? (cached as any).data : [];
    const available = Array.isArray(availableLots) ? availableLots : Array.isArray((availableLots as any)?.content) ? (availableLots as any).content : Array.isArray((availableLots as any)?.data) ? (availableLots as any).data : [];
    return [...list, ...available] as any[];
  }, [queryClient, availableLots]);
  
  if (isLoading) {
    return <TabsAndListSkeleton label={copy.loading} rows={6} tabs={0} />;
  }
  
  if (isError) {
    return <StatePanel icon={<ShieldAlert size={32} />} title={copy.error} description="" />;
  }
  
  const lots = Array.isArray(likedLots) ? likedLots : [];
  
  if (lots.length === 0) {
    return (
      <StatePanel
        title={currentLang === "uz" ? "Saqlangan avtomobillar yo'q" : currentLang === "ru" ? "Нет сохраненных автомобилей" : "No saved vehicles"}
        description={currentLang === "uz" ? "Sizga yoqqan avtomobillarni saqlang va ular shu yerda ko'rinadi." : currentLang === "ru" ? "Сохраняйте понравившиеся автомобили, и они появятся здесь." : "Save vehicles you like and they will appear here."}
      />
    );
  }
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {lots.map((liked: any, index: number) => (
        <WatchlistLotCardItem
          key={String(liked?.id ?? liked?.auctionId ?? liked?.lotId ?? index)}
          liked={liked}
          index={index}
          allCachedLots={allCachedLots}
        />
      ))}
    </div>
  );
}

export function WatchlistSection({ userId }: { userId?: string | number }) {
  const [tab, setTab] = useState<"auctions" | "searches">("auctions");
  const { currentLang } = useContext(LangSwitch);
  const accountId = savedSearchAccountId(userId);
  const copy = sectionCopy[currentLang];

  if (!accountId) {
    return (
      <StatePanel
        icon={<ShieldAlert size={32} />}
        title={copy.missingAccountTitle}
        description={copy.missingAccountBody}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Surface className="space-y-4 border-brand-champagne-500/35 bg-[linear-gradient(135deg,rgba(244,208,111,0.12),rgba(255,255,255,0.96)_42%,rgba(7,31,68,0.03))]">
        <div className="flex flex-wrap items-center gap-6 border-b border-border-default" role="tablist">
          <button
            aria-selected={tab === "auctions"}
            className={`-mb-px min-h-11 border-b-2 px-1 text-sm font-extrabold transition-colors ${
              tab === "auctions"
                ? "border-brand-navy-900 text-brand-navy-900"
                : "border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary"
            }`}
            onClick={() => setTab("auctions")}
            role="tab"
          >
            {currentLang === "uz" ? "Avtomobillar" : currentLang === "ru" ? "Автомобили" : "Vehicles"}
          </button>
          <button
            aria-selected={tab === "searches"}
            className={`-mb-px min-h-11 border-b-2 px-1 text-sm font-extrabold transition-colors ${
              tab === "searches"
                ? "border-brand-navy-900 text-brand-navy-900"
                : "border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary"
            }`}
            onClick={() => setTab("searches")}
            role="tab"
          >
            {currentLang === "uz" ? "Qidiruvlar" : currentLang === "ru" ? "Поиски" : "Searches"}
          </button>
        </div>
      </Surface>

      {tab === "auctions" ? <WatchlistAuctionsSection userId={userId} /> : <SavedSearchSection userId={userId} />}
    </div>
  );
}

// ── helpers ─────────────────────────────────────────────────────

function savedSearchText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

function savedSearchFilters(
  search: SavedSearch,
  labels?: Record<string, string>,
): Array<[string, string]> {
  const source = search.filters ?? search.criteria;
  if (!source || typeof source !== "object" || Array.isArray(source))
    return [];

  return Object.entries(source as Record<string, unknown>)
    .flatMap(([key, value]) => {
      const label = labels?.[key] ?? key;
      const direct = savedSearchText(value);
      if (direct) return [[label, direct] as [string, string]];
      if (Array.isArray(value)) {
        const values = value
          .map(savedSearchText)
          .filter((item): item is string => Boolean(item));
        return values.length
          ? [[label, values.join(", ")] as [string, string]]
          : [];
      }
      return [];
    })
    .slice(0, 8);
}

function savedSearchId(search: SavedSearch): string | number | null {
  return search.searchId ?? search.savedSearchId ?? search.id ?? null;
}

function savedSearchAccountId(value: string | number | undefined): string {
  if (value === undefined) return "";
  const normalized = String(value).trim();
  const numeric = Number(normalized);
  return normalized && Number.isSafeInteger(numeric) && numeric > 0 ? String(numeric) : "";
}

function formatDate(value: unknown, locale: Lang): string {
  const raw = savedSearchText(value);
  if (!raw) return "";

  try {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return raw;
  }
}

type SearchFormValues = {
  query: string;
  make: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  priceFrom: string;
  priceTo: string;
  status: string;
};

const emptySearchForm: SearchFormValues = {
  query: "",
  make: "",
  model: "",
  yearFrom: "",
  yearTo: "",
  priceFrom: "",
  priceTo: "",
  status: "",
};

const formCopy: Record<Lang, Record<string, string>> = {
  uz: { query: "Qidiruv matni", make: "Marka", model: "Model", yearFrom: "Yildan", yearTo: "Yilgacha", priceFrom: "Narxdan", priceTo: "Narxgacha", status: "Holat", notify: "Mos transportlar paydo bo‘lsa xabar berish", selectMake: "Markani tanlang", selectModel: "Modelni tanlang", modelDisabled: "Avval markani tanlang", close: "Yopish" },
  en: { query: "Search text", make: "Make", model: "Model", yearFrom: "Year from", yearTo: "Year to", priceFrom: "Price from", priceTo: "Price to", status: "Status", notify: "Notify when new matching vehicles appear", selectMake: "Select make", selectModel: "Select model", modelDisabled: "Select a make first", close: "Close" },
  ru: { query: "Текст поиска", make: "Марка", model: "Модель", yearFrom: "Год от", yearTo: "Год до", priceFrom: "Цена от", priceTo: "Цена до", status: "Статус", notify: "Уведомлять о новых подходящих автомобилях", selectMake: "Выберите марку", selectModel: "Выберите модель", modelDisabled: "Сначала выберите марку", close: "Закрыть" },
};

const searchTooltips: Record<Lang, Record<string, string>> = {
  uz: {
    query: "Lotlar nomi yoki tavsifi bo'yicha qidiruv matni",
    make: "Filtrlash uchun avtomobil markasi",
    model: "Filtrlash uchun avtomobil modeli",
    yearFrom: "Avtomobilning minimal ishlab chiqarilgan yili",
    yearTo: "Avtomobilning maksimal ishlab chiqarilgan yili",
    priceFrom: "Auksionning UZS dagi minimal boshlang'ich narxi",
    priceTo: "Auksionning UZS dagi maksimal boshlang'ich narxi",
    status: "Auksion holati bo'yicha filtrlash (Jonli, Rejalashtirilgan va h.k.)",
    notify: "Mos avtomobillar paydo bo'lganda avtomatik xabar yuborish",
  },
  ru: {
    query: "Ключевые слова для поиска по названию или описанию авто",
    make: "Выберите марку автомобиля для фильтрации",
    model: "Выберите модель выбранной марки",
    yearFrom: "Минимальный год выпуска автомобиля",
    yearTo: "Максимальный год выпуска автомобиля",
    priceFrom: "Минимальная стартовая цена аукциона в UZS",
    priceTo: "Максимальная стартовая цена аукциона в UZS",
    status: "Фильтр по текущему статусу аукциона",
    notify: "Уведомлять о новых подходящих автомобилях",
  },
  en: {
    query: "Keywords to search in lot titles or descriptions",
    make: "Filter by vehicle make",
    model: "Filter by vehicle model",
    yearFrom: "Minimum vehicle manufacture year",
    yearTo: "Maximum vehicle manufacture year",
    priceFrom: "Minimum starting price in UZS",
    priceTo: "Maximum starting price in UZS",
    status: "Filter by auction status",
    notify: "Notify when new matching vehicles appear",
  },
};

const auctionStatusLabels: Record<Lang, Record<string, string>> = {
  uz: {
    DRAFT: "Qoralama",
    SCHEDULED: "Rejalashtirilgan",
    LIVE: "Jonli",
    FINISHED: "Yakunlangan",
    CANCELED: "Bekor qilingan",
  },
  en: {
    DRAFT: "Draft",
    SCHEDULED: "Scheduled",
    LIVE: "Live",
    FINISHED: "Finished",
    CANCELED: "Canceled",
  },
  ru: {
    DRAFT: "Черновик",
    SCHEDULED: "Запланирован",
    LIVE: "Идёт",
    FINISHED: "Завершён",
    CANCELED: "Отменён",
  },
};

function yearDateValue(year: string) {
  return /^\d{4}$/.test(year) ? `${year}-01-01` : "";
}

function yearFromDateValue(value: string) {
  return value ? value.slice(0, 4) : "";
}

function formFromFilters(filtersText = ""): SearchFormValues {
  if (!filtersText.trim()) return emptySearchForm;
  try {
    const filters = JSON.parse(filtersText) as Record<string, unknown>;
    return {
      query: savedSearchText(filters.query ?? filters.keyword ?? filters.searchTerm) ?? "",
      make: savedSearchText(filters.make) ?? "",
      model: savedSearchText(filters.model) ?? "",
      yearFrom: savedSearchText(filters.yearFrom) ?? "",
      yearTo: savedSearchText(filters.yearTo) ?? "",
      priceFrom: savedSearchText(filters.priceFrom) ?? "",
      priceTo: savedSearchText(filters.priceTo) ?? "",
      status: savedSearchText(filters.status) ?? "",
    };
  } catch {
    return emptySearchForm;
  }
}

function filtersFromForm(values: SearchFormValues): Record<string, unknown> {
  const filters: Record<string, unknown> = {};
  const setText = (key: string, value: string) => {
    if (value.trim()) filters[key] = value.trim();
  };
  const setNumber = (key: string, value: string) => {
    if (!value.trim()) return;
    const parsed = Number(value);
    filters[key] = Number.isFinite(parsed) ? parsed : value.trim();
  };
  setText("query", values.query);
  setText("make", values.make);
  setText("model", values.model);
  setNumber("yearFrom", values.yearFrom);
  setNumber("yearTo", values.yearTo);
  setNumber("priceFrom", values.priceFrom);
  setNumber("priceTo", values.priceTo);
  setText("status", values.status);
  return filters;
}

function savedSearchCreatedAt(search: SavedSearch): number {
  const createdAt = savedSearchText(search.createdAt);
  const timestamp = createdAt ? Date.parse(createdAt) : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function savedSearchTitle(search: SavedSearch): string {
  return savedSearchText(search.name ?? search.title) ?? "";
}

function localizeSavedSearchTitle(
  title: string | null,
  fallbackTitle: string,
  id: string | number,
): string {
  const fallback = `${fallbackTitle} #${id}`;
  if (!title) return fallback;
  const match = /^saved search\s*#?\s*(\d+)$/i.exec(title);
  return match ? `${fallbackTitle} #${match[1]}` : title;
}

function filterSavedSearches(
  searches: readonly SavedSearch[],
  filter: "all" | "notify-off" | "notify-on",
  searchText: string,
): SavedSearch[] {
  const keyword = searchText.trim().toLowerCase();
  return searches.filter((search) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "notify-on" && search.notify === true) ||
      (filter === "notify-off" && search.notify !== true);
    if (!matchesFilter) return false;
    if (!keyword) return true;

    return [
      savedSearchTitle(search),
      savedSearchText(search.query ?? search.keyword ?? search.searchTerm),
      savedSearchText(search.createdAt),
      ...savedSearchFilters(search).flatMap(([label, value]) => [label, value]),
    ]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(keyword));
  });
}

function sortSavedSearches(
  searches: readonly SavedSearch[],
  sort: "name" | "newest" | "oldest",
): SavedSearch[] {
  return [...searches].sort((left, right) => {
    if (sort === "name") {
      return savedSearchTitle(left).localeCompare(savedSearchTitle(right));
    }
    const leftDate = savedSearchCreatedAt(left);
    const rightDate = savedSearchCreatedAt(right);
    return sort === "oldest" ? leftDate - rightDate : rightDate - leftDate;
  });
}

// ── i18n copy ────────────────────────────────────────────────────

const sectionCopy: Record<Lang, {
  title: string;
  description: string;
  newSearch: string;
  noSearches: [string, string];
  loading: string;
  error: string;
  date: string;
  fallbackTitle: string;
  filterLabels: Record<string, string>;
  remove: string;
  removeError: string;
  removed: string;
  edit: string;
  notifyOn: string;
  notifyOff: string;
  updateSuccess: string;
  updateError: string;
  confirmDeleteTitle: string;
  confirmDeleteBody: string;
  cancel: string;
  delete: string;
  createTitle: string;
  createDescription: string;
  createSuccess: string;
  createError: string;
  all: string;
  byName: string;
  filter: string;
  filteredEmptyBody: string;
  filteredEmptyTitle: string;
  newest: string;
  oldest: string;
  search: string;
  sort: string;
  page: string;
  previousPage: string;
  nextPage: string;
  missingAccountTitle: string;
  missingAccountBody: string;
}> = {
  uz: {
    title: "Saqlangan qidiruvlar",
    description: "Saqlangan qidiruvlaringiz va ularning mezonlarini boshqaring.",
    newSearch: "Yangi qidiruv",
    noSearches: ["Saqlangan qidiruvlar yo‘q", "Qidiruvlaringizni saqlang va ular shu yerda ko‘rinadi."],
    loading: "Ma’lumot yuklanmoqda",
    error: "Ma’lumot yuklanmadi",
    date: "Sana",
    fallbackTitle: "Saqlangan qidiruv",
    filterLabels: {
      make: "Marka",
      model: "Model",
      priceFrom: "Narxdan",
      priceTo: "Narxgacha",
      query: "Qidiruv",
      searchTerm: "Qidiruv",
      status: "Holat",
      yearFrom: "Yildan",
      yearTo: "Yilgacha",
    },
    remove: "O‘chirish",
    removeError: "Qidiruvni o‘chirib bo‘lmadi.",
    removed: "Qidiruv o‘chirildi.",
    edit: "Tahrirlash",
    notifyOn: "Bildirishnoma yoqilgan",
    notifyOff: "Bildirishnoma o‘chirilgan",
    updateSuccess: "Qidiruv yangilandi.",
    updateError: "Qidiruvni yangilab bo‘lmadi.",
    confirmDeleteTitle: "Qidiruvni o‘chirish",
    confirmDeleteBody: "Bu qidiruvni o‘chirishga ishonchingiz komilmi?",
    cancel: "Bekor qilish",
    delete: "O‘chirish",
    createTitle: "Yangi qidiruv",
    createDescription: "Filterlar va bildirishnoma sozlamalari bilan yangi qidiruv yarating.",
    createSuccess: "Qidiruv yaratildi.",
    createError: "Qidiruvni yaratib bo‘lmadi.",
    all: "Barchasi",
    byName: "Nomi bo‘yicha",
    filter: "Saqlangan qidiruvlarni filterlash",
    filteredEmptyBody: "Qidiruv matni yoki bildirishnoma holatini o‘zgartirib ko‘ring.",
    filteredEmptyTitle: "Bu ko‘rinishda saqlangan qidiruv topilmadi",
    newest: "Eng yangi",
    oldest: "Eng eski",
    search: "Qidirish...",
    sort: "Saqlangan qidiruvlarni saralash",
    page: "Sahifa",
    previousPage: "Oldingi sahifa",
    nextPage: "Keyingi sahifa",
    missingAccountTitle: "Hisob aniqlanmadi",
    missingAccountBody: "Hisob identifikatori topilmadi. Qayta kirib ko‘ring.",
  },
  en: {
    title: "Saved searches",
    description: "Manage your saved searches and their criteria.",
    newSearch: "New search",
    noSearches: ["No saved searches", "Your saved searches will appear here."],
    loading: "Loading data",
    error: "Data could not be loaded",
    date: "Date",
    fallbackTitle: "Saved search",
    filterLabels: {
      make: "Make",
      model: "Model",
      priceFrom: "Price from",
      priceTo: "Price to",
      query: "Search",
      searchTerm: "Search",
      status: "Status",
      yearFrom: "Year from",
      yearTo: "Year to",
    },
    remove: "Delete",
    removeError: "The search could not be deleted.",
    removed: "Search deleted.",
    edit: "Edit",
    notifyOn: "Notifications enabled",
    notifyOff: "Notifications disabled",
    updateSuccess: "Search updated.",
    updateError: "The search could not be updated.",
    confirmDeleteTitle: "Delete saved search",
    confirmDeleteBody: "Are you sure you want to delete this saved search?",
    cancel: "Cancel",
    delete: "Delete",
    createTitle: "New saved search",
    createDescription: "Create a new saved search with filters and notification settings.",
    createSuccess: "Saved search created.",
    createError: "The saved search could not be created.",
    all: "All",
    byName: "By name",
    filter: "Filter saved searches",
    filteredEmptyBody: "Try changing the search text or selected notification state.",
    filteredEmptyTitle: "No saved searches match this view",
    newest: "Newest",
    oldest: "Oldest",
    search: "Search...",
    sort: "Sort saved searches",
    page: "Page",
    previousPage: "Previous page",
    nextPage: "Next page",
    missingAccountTitle: "Account not identified",
    missingAccountBody: "The account identifier is missing. Try signing in again.",
  },
  ru: {
    title: "Сохранённые поиски",
    description: "Управляйте сохранёнными поисками и их параметрами.",
    newSearch: "Новый поиск",
    noSearches: ["Нет сохранённых поисков", "Сохранённые поиски появятся здесь."],
    loading: "Загрузка данных",
    error: "Данные не загрузились",
    date: "Дата",
    fallbackTitle: "Сохранённый поиск",
    filterLabels: {
      make: "Марка",
      model: "Модель",
      priceFrom: "Цена от",
      priceTo: "Цена до",
      query: "Поиск",
      searchTerm: "Поиск",
      status: "Статус",
      yearFrom: "Год от",
      yearTo: "Год до",
    },
    remove: "Удалить",
    removeError: "Не удалось удалить поиск.",
    removed: "Поиск удалён.",
    edit: "Изменить",
    notifyOn: "Уведомления включены",
    notifyOff: "Уведомления выключены",
    updateSuccess: "Поиск обновлён.",
    updateError: "Не удалось обновить поиск.",
    confirmDeleteTitle: "Удалить сохранённый поиск",
    confirmDeleteBody: "Вы уверены, что хотите удалить этот сохранённый поиск?",
    cancel: "Отмена",
    delete: "Удалить",
    createTitle: "Новый сохранённый поиск",
    createDescription: "Создайте новый сохранённый поиск с фильтрами и настройками уведомлений.",
    createSuccess: "Сохранённый поиск создан.",
    createError: "Не удалось создать сохранённый поиск.",
    all: "Все",
    byName: "По названию",
    filter: "Фильтр сохранённых поисков",
    filteredEmptyBody: "Попробуйте изменить поиск или выбранное состояние уведомлений.",
    filteredEmptyTitle: "Нет сохранённых поисков для этого представления",
    newest: "Сначала новые",
    oldest: "Сначала старые",
    search: "Поиск...",
    sort: "Сортировка сохранённых поисков",
    page: "Страница",
    previousPage: "Предыдущая страница",
    nextPage: "Следующая страница",
    missingAccountTitle: "Аккаунт не определён",
    missingAccountBody: "Не найден идентификатор аккаунта. Попробуйте войти снова.",
  },
};

// ── Delete confirm modal ─────────────────────────────────────────

function ConfirmDeleteModal({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-extrabold text-brand-navy-900">{title}</h2>
        <p className="mt-2 text-sm text-text-secondary">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button disabled={loading} onClick={onCancel} variant="outline">
            {cancelLabel}
          </Button>
          <Button disabled={loading} onClick={onConfirm}>
            {loading ? (
              <LoaderCircle className="animate-spin motion-reduce:animate-none" size={17} />
            ) : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Create / Edit modal ──────────────────────────────────────────

function SearchFormModal({
  open,
  title,
  description,
  initialFilters,
  initialNotify,
  saveLabel,
  loading,
  onSave,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  initialFilters?: string;
  initialNotify?: boolean;
  saveLabel: string;
  loading: boolean;
  onSave: (filters: Record<string, unknown>, notify: boolean) => void;
  onCancel: () => void;
}) {
  const { currentLang } = useContext(LangSwitch);
  const labels = formCopy[currentLang];
  const [values, setValues] = useState<SearchFormValues>(() => formFromFilters(initialFilters));
  const [notify, setNotify] = useState(initialNotify ?? true);
  const makesQuery = useVehicleMakes();
  const selectedMakeId = useMemo(
    () =>
      makesQuery.data?.find((make) => make.name === values.make)?.id ?? null,
    [makesQuery.data, values.make],
  );
  const modelsQuery = useVehicleModels(selectedMakeId);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(filtersFromForm(values), notify);
  };
  const updateField = (field: keyof SearchFormValues) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues((current) => ({ ...current, [field]: e.target.value }));
  };
  const updateMake = (e: ChangeEvent<HTMLSelectElement>) => {
    setValues((current) => ({ ...current, make: e.target.value, model: "" }));
  };
  const updateYear = (field: "yearFrom" | "yearTo") => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: yearFromDateValue(e.target.value) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 pb-10 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-brand-navy-900">{title}</h2>
          <button
            aria-label={labels.close}
            className="rounded-full p-1 text-text-secondary hover:bg-gray-100"
            disabled={loading}
            onClick={onCancel}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-brand-navy-900">
                <span>{labels.query}</span>
                <FieldInfo text={searchTooltips[currentLang]?.query} />
              </span>
              <input className="min-h-11 w-full rounded-lg border border-border-default px-3 text-sm focus:border-brand-champagne-500 focus:outline-none focus:ring-2 focus:ring-brand-champagne-500/30" onChange={updateField("query")} value={values.query} />
            </label>
            <div className="block">
              <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-brand-navy-900">
                <span>{labels.make}</span>
                <FieldInfo text={searchTooltips[currentLang]?.make} />
              </span>
              <AppSelect
                disabled={makesQuery.isLoading}
                value={values.make}
                onChange={(val) => setValues((prev) => ({ ...prev, make: String(val), model: "" }))}
                options={[
                  { value: "", label: makesQuery.isLoading ? "..." : labels.selectMake },
                  ...(makesQuery.data ?? []).map((make) => ({ value: make.name, label: make.name })),
                ]}
              />
            </div>
            <div className="block">
              <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-brand-navy-900">
                <span>{labels.model}</span>
                <FieldInfo text={searchTooltips[currentLang]?.model} />
              </span>
              <AppSelect
                disabled={!selectedMakeId || modelsQuery.isLoading}
                value={values.model}
                onChange={(val) => setValues((prev) => ({ ...prev, model: String(val) }))}
                options={[
                  { value: "", label: !selectedMakeId ? labels.modelDisabled : modelsQuery.isLoading ? "..." : labels.selectModel },
                  ...(modelsQuery.data ?? []).map((model) => ({ value: model.name, label: model.name })),
                ]}
              />
            </div>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-brand-navy-900">
                <span>{labels.yearFrom}</span>
                <FieldInfo text={searchTooltips[currentLang]?.yearFrom} />
              </span>
              <input className="min-h-11 w-full rounded-lg border border-border-default px-3 text-sm focus:border-brand-champagne-500 focus:outline-none focus:ring-2 focus:ring-brand-champagne-500/30" onChange={updateYear("yearFrom")} type="date" value={yearDateValue(values.yearFrom)} />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-brand-navy-900">
                <span>{labels.yearTo}</span>
                <FieldInfo text={searchTooltips[currentLang]?.yearTo} />
              </span>
              <input className="min-h-11 w-full rounded-lg border border-border-default px-3 text-sm focus:border-brand-champagne-500 focus:outline-none focus:ring-2 focus:ring-brand-champagne-500/30" onChange={updateYear("yearTo")} type="date" value={yearDateValue(values.yearTo)} />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-brand-navy-900">
                <span>{labels.priceFrom}</span>
                <FieldInfo text={searchTooltips[currentLang]?.priceFrom} />
              </span>
              <input className="min-h-11 w-full rounded-lg border border-border-default px-3 text-sm focus:border-brand-champagne-500 focus:outline-none focus:ring-2 focus:ring-brand-champagne-500/30" inputMode="numeric" onChange={updateField("priceFrom")} value={values.priceFrom} />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-brand-navy-900">
                <span>{labels.priceTo}</span>
                <FieldInfo text={searchTooltips[currentLang]?.priceTo} />
              </span>
              <input className="min-h-11 w-full rounded-lg border border-border-default px-3 text-sm focus:border-brand-champagne-500 focus:outline-none focus:ring-2 focus:ring-brand-champagne-500/30" inputMode="numeric" onChange={updateField("priceTo")} value={values.priceTo} />
            </label>
            <div className="block sm:col-span-2">
              <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-brand-navy-900">
                <span>{labels.status}</span>
                <FieldInfo text={searchTooltips[currentLang]?.status} />
              </span>
              <AppSelect
                value={values.status}
                onChange={(val) => setValues((prev) => ({ ...prev, status: String(val) }))}
                options={[
                  { value: "", label: "—" },
                  ...["DRAFT", "SCHEDULED", "LIVE", "FINISHED", "CANCELED"].map((st) => ({
                    value: st,
                    label: auctionStatusLabels[currentLang][st],
                  })),
                ]}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm">
            <input
              checked={notify}
              className="h-4 w-4 rounded border-border-default text-brand-champagne-600 focus:ring-brand-champagne-500"
              onChange={(e) => setNotify(e.target.checked)}
              type="checkbox"
            />
            <span className="flex items-center gap-1.5 font-bold text-brand-navy-900">
              <span>{labels.notify}</span>
              <FieldInfo text={searchTooltips[currentLang]?.notify} />
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button disabled={loading} onClick={onCancel} type="button" variant="outline">
              {loading ? "..." : "Cancel"}
            </Button>
            <Button disabled={loading} type="submit">
              {loading ? (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" size={17} />
              ) : null}
              {saveLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Saved Search Card Item ────────────────────────────────────────

function SavedSearchCardItem({
  search,
  index,
  copy,
  currentLang,
  updateMutation,
  handleToggleFavorite,
  handleToggleNotify,
  setEditTarget,
  setDeleteTarget,
}: {
  search: SavedSearch;
  index: number;
  copy: any;
  currentLang: Lang;
  updateMutation: any;
  handleToggleFavorite: (search: SavedSearch) => Promise<void>;
  handleToggleNotify: (search: SavedSearch) => Promise<void>;
  setEditTarget: (search: SavedSearch) => void;
  setDeleteTarget: (search: SavedSearch) => void;
}) {
  const [isLiked, setIsLiked] = useState(true);

  const id = savedSearchId(search) ?? index + 1;
  const title = localizeSavedSearchTitle(
    savedSearchText(search.name ?? search.title),
    copy.fallbackTitle,
    id,
  );
  const keyword = savedSearchText(
    search.query ?? search.keyword ?? search.searchTerm,
  );
  const filters = savedSearchFilters(search, copy.filterLabels);
  const createdAt = savedSearchText(search.createdAt);
  const notify = search.notify ?? false;

  const onHeartClick = async () => {
    if (isLiked) {
      setIsLiked(false);
      await handleToggleFavorite(search);
    } else {
      setIsLiked(true);
    }
  };

  return (
    <Surface className="flex min-h-52 flex-col" key={String(id)}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-gold-text">
            {copy.title}
          </p>
          <h3 className="mt-2 truncate text-lg font-extrabold text-brand-navy-900">
            {title}
          </h3>
        </div>
        <button
          aria-label={
            isLiked
              ? currentLang === "uz"
                ? "Izbrannoyedan chiqarish"
                : currentLang === "ru"
                ? "Убрать из избранного"
                : "Remove from favorites"
              : currentLang === "uz"
              ? "Izbrannoyega qo'shish"
              : currentLang === "ru"
              ? "Добавить в избранное"
              : "Add to favorites"
          }
          className="group shrink-0 rounded-full p-2 transition-all hover:bg-brand-champagne-100/40 focus-visible:outline-2 focus-visible:outline-brand-gold-text cursor-pointer"
          onClick={onHeartClick}
          title={
            isLiked
              ? currentLang === "uz"
                ? "Izbrannoyedan chiqarish"
                : currentLang === "ru"
                ? "Убрать из избранного"
                : "Remove from favorites"
              : currentLang === "uz"
              ? "Izbrannoyega qo'shish"
              : currentLang === "ru"
              ? "Добавить в избранное"
              : "Add to favorites"
          }
          type="button"
        >
          <Heart
            className={`shrink-0 transition-all duration-300 group-hover:scale-110 ${
              isLiked
                ? "fill-[#8B5A2B] text-[#8B5A2B] scale-105 drop-shadow-[0_2px_6px_rgba(139,90,43,0.35)]"
                : "fill-white text-gray-400 stroke-[2] group-hover:text-[#8B5A2B]"
            }`}
            size={22}
          />
        </button>
      </div>

      {/* Keyword */}
      {keyword ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-text-secondary">
          <Search size={14} /> {keyword}
        </p>
      ) : null}

      {/* Filters */}
      {filters.length ? (
        <dl className="mt-4 grid gap-2 border-t border-border-default pt-4 text-sm">
          {filters.map(([label, value]) => (
            <div className="flex justify-between gap-3" key={label}>
              <dt className="text-text-secondary">{label}</dt>
              <dd className="truncate text-right font-bold text-brand-navy-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {/* Spacer */}
      <div className="mt-auto" />

      {/* Date */}
      {createdAt ? (
        <p className="pt-4 text-xs text-text-secondary">
          {copy.date}: {formatDate(createdAt, currentLang)}
        </p>
      ) : null}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2 border-t border-border-default pt-3">
        {/* Notify toggle */}
        <button
          aria-label={notify ? copy.notifyOn : copy.notifyOff}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
            notify
              ? "bg-brand-champagne-100 text-brand-champagne-800"
              : "bg-gray-100 text-text-secondary hover:bg-gray-200"
          }`}
          disabled={updateMutation.isPending}
          onClick={() => handleToggleNotify(search)}
          type="button"
        >
          {notify ? <Bell size={14} /> : <BellOff size={14} />}
          {notify ? copy.notifyOn : copy.notifyOff}
        </button>

        <div className="ml-auto flex gap-1">
          {/* Edit button */}
          <button
            aria-label={copy.edit}
            className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-gray-100"
            onClick={() => {
              setEditTarget(search);
            }}
            type="button"
          >
            <Pencil size={16} />
          </button>

          {/* Delete button */}
          <button
            aria-label={copy.remove}
            className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50"
            onClick={() => setDeleteTarget(search)}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Surface>
  );
}

// ── Main section ─────────────────────────────────────────────────

export function SavedSearchSection({
  userId,
}: {
  userId?: string | number;
}) {
  const { currentLang } = useContext(LangSwitch);
  const copy = sectionCopy[currentLang];

  const accountId = savedSearchAccountId(userId);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState<"all" | "notify-off" | "notify-on">("all");
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState<"name" | "newest" | "oldest">("newest");

  const query = useMySavedSearches(page, pageSize, Boolean(accountId));
  const searches = useMemo(() => {
    const data = query.data as { items?: SavedSearch[] } | undefined;
    return Array.isArray(data?.items) ? data.items : [];
  }, [query.data]);
  const visibleSearches = useMemo(
    () => sortSavedSearches(filterSavedSearches(searches, filter, searchText), sort),
    [filter, searchText, searches, sort],
  );
  const totalPages = Math.max(
    1,
    Number(
      query.data?.meta?.pages ??
        query.data?.meta?.totalPages ??
        query.data?.meta?.pageCount ??
        (searches.length < pageSize ? page + 1 : page + 2),
    ),
  );

  // Mutations
  const deleteMutation = useDeleteSavedSearch();
  const updateMutation = useUpdateSavedSearch();
  const createMutation = useCreateSavedSearch();

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<SavedSearch | null>(null);

  // Edit modal state
  const [editTarget, setEditTarget] = useState<SavedSearch | null>(null);

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);

  // Toast / feedback
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (kind: "success" | "error", message: string) => {
    setFeedback({ kind, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ── Handlers ──

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = savedSearchId(deleteTarget);
    if (id === null || id === undefined) return;

    try {
      await deleteMutation.mutateAsync(id);
      showFeedback("success", copy.removed);
      setDeleteTarget(null);
    } catch {
      showFeedback("error", copy.removeError);
    }
  };

  const handleToggleFavorite = async (search: SavedSearch) => {
    const id = savedSearchId(search);
    if (id === null || id === undefined) return;

    try {
      await deleteMutation.mutateAsync(id);
      showFeedback("success", currentLang === "uz" ? "Izbrannoyedan olib tashlandi" : currentLang === "ru" ? "Удалено из избранного" : "Removed from favorites");
    } catch {
      showFeedback("error", copy.removeError);
    }
  };

  const handleToggleNotify = async (search: SavedSearch) => {
    const id = savedSearchId(search);
    if (id === null || id === undefined) return;

    try {
      await updateMutation.mutateAsync({
        searchId: id,
        notify: !search.notify,
      });
      showFeedback("success", copy.updateSuccess);
    } catch {
      showFeedback("error", copy.updateError);
    }
  };

  const handleEditSave = async (filters: Record<string, unknown>, notify: boolean) => {
    if (!editTarget) return;
    const id = savedSearchId(editTarget);
    if (id === null || id === undefined) return;

    try {
      await updateMutation.mutateAsync({ searchId: id, filters, notify });
      showFeedback("success", copy.updateSuccess);
      setEditTarget(null);
    } catch {
      showFeedback("error", copy.updateError);
    }
  };

  const handleCreateSave = async (filters: Record<string, unknown>, notify: boolean) => {
    try {
      await createMutation.mutateAsync({
        filters,
        notify,
      });
      showFeedback("success", copy.createSuccess);
      setCreateOpen(false);
    } catch {
      showFeedback("error", copy.createError);
    }
  };

  // ── Render ──

  if (!accountId) {
    return (
      <StatePanel
        icon={<ShieldAlert size={32} />}
        title={copy.missingAccountTitle}
        description={copy.missingAccountBody}
      />
    );
  }

  if (query.isLoading) {
    return <TabsAndListSkeleton label={copy.loading} rows={6} tabs={3} />;
  }

  if (query.isError) {
    return (
      <StatePanel
        icon={<ShieldAlert size={32} />}
        title={copy.error}
        description=""
        action={
          <Button onClick={() => query.refetch()} variant="outline">
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* Toast feedback */}
      {feedback ? (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm font-bold ${
            feedback.kind === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {/* Header + create button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy-900">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">{copy.description}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={17} /> {copy.newSearch}
        </Button>
      </div>

      {/* Empty state */}
      {searches.length === 0 ? (
        <StatePanel title={copy.noSearches[0]} description={copy.noSearches[1]} />
      ) : (
        <>
          <Surface className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="relative block">
              <span className="sr-only">{copy.search}</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                size={18}
              />
              <input
                className="min-h-11 w-full rounded-md border border-border-default bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-focus-ring md:w-80"
                onChange={(event) => {
                  setSearchText(event.target.value);
                  setPage(0);
                }}
                placeholder={copy.search}
                value={searchText}
              />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <AppSelect
                className="w-full sm:w-52"
                aria-label={copy.filter}
                value={filter}
                options={[
                  { value: "all", label: copy.all },
                  { value: "notify-on", label: copy.notifyOn },
                  { value: "notify-off", label: copy.notifyOff },
                ]}
                onChange={(val) => {
                  setFilter(val as "all" | "notify-off" | "notify-on");
                  setPage(0);
                }}
              />
            </div>
          </Surface>

          {visibleSearches.length === 0 ? (
            <StatePanel
              description={copy.filteredEmptyBody}
              title={copy.filteredEmptyTitle}
            />
          ) : null}

          {/* Grid */}
          {visibleSearches.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleSearches.map((search, index) => (
                <SavedSearchCardItem
                  copy={copy}
                  currentLang={currentLang}
                  handleToggleFavorite={handleToggleFavorite}
                  handleToggleNotify={handleToggleNotify}
                  index={index}
                  key={String(savedSearchId(search) ?? index + 1)}
                  search={search}
                  setDeleteTarget={setDeleteTarget}
                  setEditTarget={setEditTarget}
                  updateMutation={updateMutation}
                />
              ))}
            </div>
          ) : null}

          {/* Pagination */}
          <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
            <PageSizeSelect
              disabled={query.isFetching}
              onChange={(size) => { setPageSize(size); setPage(0); }}
              value={pageSize}
            />
            <button
              aria-label={copy.previousPage}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default bg-white text-brand-navy-900 transition-colors hover:bg-surface-muted disabled:text-text-secondary disabled:opacity-45"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={19} />
            </button>
            <span className="min-w-14 text-center text-sm font-extrabold tabular-nums text-brand-navy-900">
              {page + 1} / {totalPages}
            </span>
            <button
              aria-label={copy.nextPage}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default bg-white text-brand-navy-900 transition-colors hover:bg-surface-muted disabled:text-text-secondary disabled:opacity-45"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" size={19} />
            </button>
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        body={copy.confirmDeleteBody}
        cancelLabel={copy.cancel}
        confirmLabel={copy.delete}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        open={deleteTarget !== null}
        title={copy.confirmDeleteTitle}
      />

      {/* Edit modal */}
      <SearchFormModal
        description=""
        key={`edit-${editTarget ? savedSearchId(editTarget) : "none"}`}
        initialFilters={
          editTarget?.filters
            ? JSON.stringify(editTarget.filters, null, 2)
            : editTarget?.criteria
              ? JSON.stringify(editTarget.criteria, null, 2)
              : ""
        }
        initialNotify={editTarget?.notify ?? false}
        loading={updateMutation.isPending}
        onCancel={() => setEditTarget(null)}
        onSave={(f, n) => void handleEditSave(f, n)}
        open={editTarget !== null}
        saveLabel={copy.edit}
        title={copy.edit}
      />

      {/* Create modal */}
      <SearchFormModal
        description={copy.createDescription}
        key={createOpen ? "create-open" : "create-closed"}
        initialNotify={false}
        loading={createMutation.isPending}
        onCancel={() => setCreateOpen(false)}
        onSave={(f, n) => void handleCreateSave(f, n)}
        open={createOpen}
        saveLabel={copy.newSearch}
        title={copy.createTitle}
      />
    </div>
  );
}
