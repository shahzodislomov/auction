"use client";

import { Drawer } from "@mui/material";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { AuctionCard } from "@/components/auction/AuctionCard";
import { StatePanel } from "@/components/feedback/StatePanel";
import { AuctionCardGridSkeleton } from "@/components/feedback/ContentSkeletons";
import { Button } from "@/components/ui/Button";
import { AppSelect } from "@/components/ui/AppSelect";
import { PageSizeSelect, PAGE_SIZE_OPTIONS } from "@/components/ui/PageSizeSelect";
import { LangSwitch } from "@/context/LangSwitch";
import { translateUiText } from "@/lib/localization/uiText";
import type {
  AuctionCurrency,
  AuctionStatus,
  LocalizedText,
  VehicleAuction,
} from "@/lib/auction/types";
import { findCanonicalRegion, getCanonicalRegionOptions } from "@/lib/regions";
import { useAuctionFeed } from "@/queries/auction-listings";
import { useVehicleMakes, useVehicleModels } from "@/queries/vehicles";

type DiscoveryFilterKey =
  | "search"
  | "status"
  | "make"
  | "model"
  | "year"
  | "region"
  | "priceFrom"
  | "priceTo";

type DiscoveryFilters = {
  make: string;
  model: string;
  priceFrom: string;
  priceTo: string;
  region: string;
  search: string;
  status: string;
  year: string;
};

type FeedMeta = {
  counts?: {
    all: number;
    approval: Record<string, number>;
    lifecycle: Record<string, number>;
  };
  elements: number;
  pages: number;
};

const emptyFilters: DiscoveryFilters = {
  make: "",
  model: "",
  priceFrom: "",
  priceTo: "",
  region: "",
  search: "",
  status: "CURRENT",
  year: "",
};

const auctionStatusOptions = [
  { value: "ALL", labels: { uz: "Barcha auksionlar", ru: "Все аукционы", en: "All auctions" } },
  { value: "CURRENT", labels: { uz: "Joriy", ru: "Текущие", en: "Current" } },
  { value: "ENDED", labels: { uz: "Yakunlangan", ru: "Завершенные", en: "Ended" } },
] as const;


function localizeOption(
  option: { labels: Record<"uz" | "ru" | "en", string> },
  locale: "uz" | "ru" | "en",
) {
  return option.labels[locale];
}

function readFilters(search: string): DiscoveryFilters {
  const params = new URLSearchParams(search);
  const rawStatus = params.get("status");
  let status = "CURRENT";
  if (rawStatus !== null) {
    status = rawStatus === "" || rawStatus === "ALL" ? "ALL" : rawStatus;
  }

  return {
    status,
    make: params.get("make") ?? "",
    model: params.get("model") ?? "",
    year: params.get("year") ?? "",
    region: params.get("region") ?? "",
    priceFrom: params.get("priceFrom") ?? "",
    priceTo: params.get("priceTo") ?? "",
    search: params.get("search") ?? "",
  };
}

function readPage(search: string): number {
  const raw = new URLSearchParams(search).get("page");
  if (!raw) return 0;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 1 ? Math.floor(value) - 1 : 0;
}

function readPageSize(search: string): number {
  const value = Number(new URLSearchParams(search).get("size") ?? "10");
  return PAGE_SIZE_OPTIONS.includes(value as (typeof PAGE_SIZE_OPTIONS)[number]) ? value : 10;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const number = Number(value.trim().replace(/\s/g, ""));
  return Number.isFinite(number) ? number : null;
}

function text(value: unknown): LocalizedText {
  return { default: asString(value), uz: null, ru: null, en: null };
}

function normalizeApiStatus(value: unknown): AuctionStatus {
  const status = asString(value)?.toUpperCase().replace(/[\s_]+/g, "-");
  switch (status) {
    case "LIVE":
    case "ACTIVE":
      return "live";
    case "SCHEDULED":
    case "DRAFT":
    case "PENDING-REVIEW":
      return "upcoming";
    case "FINISHED":
    case "ENDED":
      return "ended";
    case "SOLD":
      return "sold";
    case "CANCELED":
    case "CANCELLED":
      return "cancelled";
    default:
      return "unknown";
  }
}

function normalizeCurrency(value: unknown): AuctionCurrency {
  const currency = asString(value)?.toUpperCase();
  return currency === "UZS" || currency === "USD" ? currency : "UZS";
}

function firstImageUrl(record: Record<string, unknown>): string | null {
  const images = Array.isArray(record.imageUrls)
    ? record.imageUrls
    : Array.isArray(record.images)
      ? record.images
      : Array.isArray(record.vehicleImages)
        ? record.vehicleImages
        : [];
  const first = images[0];
  const direct = asString(first);
  if (direct) return direct;
  const image = asRecord(first);
  return asString(image?.imageUrl) ?? asString(image?.url) ?? asString(image?.src);
}

export function adaptLiveAuctionRecord(raw: unknown): VehicleAuction | null {
  const source = asRecord(raw);
  if (!source) return null;
  const vehicle = asRecord(source.vehicle) ?? source;
  const id = asString(source.auctionId) ?? asString(source.id);
  if (!id || (!source.auctionId && !source.vehicle)) return null;

  const make = asString(vehicle.make) ?? asString(vehicle.makeName);
  const model = asString(vehicle.model) ?? asString(vehicle.modelName);
  const year = asNumber(vehicle.year);
  const title =
    asString(source.title) ??
    asString(vehicle.title) ??
    [year, make, model].filter(Boolean).join(" ");
  const imageUrl = firstImageUrl(vehicle) ?? firstImageUrl(source);
  const rawRegion =
    vehicle.region ??
    vehicle.regionName ??
    source.region;
  const regionValue =
    typeof rawRegion === "string"
      ? rawRegion.trim()
      : typeof rawRegion === "object" && rawRegion !== null
        ? String(
            (rawRegion as any).name ??
              (rawRegion as any).nameUz ??
              (rawRegion as any).id ??
              "",
          ).trim()
        : null;
  const regionCanonical = findCanonicalRegion(regionValue);
  const isInvalidRegion =
    !regionValue ||
    ["string", "null", "undefined", "none", "-"].includes(
      regionValue.toLowerCase(),
    );
  const regionNameText: LocalizedText | null = regionCanonical
    ? {
        default: regionCanonical.uz,
        uz: regionCanonical.uz,
        ru: regionCanonical.ru,
        en: regionCanonical.en,
      }
    : !isInvalidRegion
      ? text(regionValue!)
      : null;

  return {
    id,
    vehicleId: asString(source.vehicleId) ?? asString(vehicle.vehicleId),
    lotNumber: asString(source.lotNumber),
    vin: asString(vehicle.vin),
    status: normalizeApiStatus(source.status ?? source.auctionStatus),
    title: text(title || `#${id}`),
    description: text(source.description ?? vehicle.description),
    make,
    model,
    year,
    startPrice: asNumber(source.startPrice),
    depositPercent: asNumber(source.depositPercent),
    currentPrice: asNumber(source.currentPrice ?? source.highestBid),
    finalPrice: asNumber(source.finalPrice ?? source.winningPrice),
    currency: normalizeCurrency(source.currency),
    incrementType: "unknown",
    incrementValue: asNumber(source.incrementValue),
    startTime: asString(source.startsAt ?? source.startTime),
    endTime: asString(source.endsAt ?? source.endTime),
    publishedAt: asString(source.publishedAt ?? source.createdAt),
    mileage: asNumber(vehicle.mileage),
    fuel: asString(vehicle.fuelType) ?? "unknown",
    transmission: asString(vehicle.transmission) ?? "unknown",
    drivetrain: asString(vehicle.drivetrain) ?? "unknown",
    region: regionNameText ? { name: regionNameText, district: null } : null,
    condition: asString(vehicle.conditionGrade ?? vehicle.condition) ?? "unknown",
    damage: null,
    seller: null,
    inspection: null,
    documents: [],
    images: imageUrl ? [{ id: null, url: imageUrl, alt: text(title) }] : [],
    counts: { views: null, bids: null, watchers: null, participants: null },
    capabilities: ["watchlist", "bidding", "deposits"],
  };
}

function buildAuctionQuery(filters: DiscoveryFilters, page: number, pageSize: number) {
  const params = new URLSearchParams();
  if (page > 0) params.set("page", String(page + 1));
  if (pageSize !== 10) params.set("size", String(pageSize));
  if (filters.status && filters.status !== "CURRENT") params.set("status", filters.status);
  if (filters.make) params.set("make", filters.make);
  if (filters.model) params.set("model", filters.model);
  if (filters.year) params.set("year", filters.year);
  if (filters.region) params.set("region", filters.region);
  if (filters.priceFrom) params.set("priceFrom", filters.priceFrom);
  if (filters.priceTo) params.set("priceTo", filters.priceTo);
  if (filters.search.trim()) params.set("search", filters.search.trim());
  return params.toString();
}

type FilterOption = {
  label: string;
  value: string;
};

type DiscoveryFilterOptions = {
  makes: FilterOption[];
  models: FilterOption[];
  regions: FilterOption[];
  years: FilterOption[];
};

function uniqueOptions(values: Array<string | number | null | undefined>): FilterOption[] {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }));
}

export const MIN_VEHICLE_YEAR = 1980;
export const MAX_VEHICLE_YEAR = 2026;

export function getVehicleYearFilterOptions(
  minYear = MIN_VEHICLE_YEAR,
  maxYear = MAX_VEHICLE_YEAR,
): FilterOption[] {
  const options: FilterOption[] = [];
  for (let year = maxYear; year >= minYear; year--) {
    const val = String(year);
    options.push({ label: val, value: val });
  }
  return options;
}

const STATIC_YEAR_OPTIONS = getVehicleYearFilterOptions();

function localizedRegionName(
  auction: VehicleAuction,
  locale: "uz" | "ru" | "en",
): string | null {
  if (!auction.region) return null;
  return (
    auction.region.name[locale] ??
    auction.region.name.default ??
    auction.region.name.uz ??
    auction.region.name.ru ??
    auction.region.name.en ??
    null
  );
}

function FilterPanel({
  currentLang,
  filters,
  onChange,
  onReset,
  options,
}: {
  currentLang: "uz" | "ru" | "en";
  filters: DiscoveryFilters;
  onChange: (key: DiscoveryFilterKey, value: string) => void;
  onReset: () => void;
  options: DiscoveryFilterOptions;
}) {
  const fieldClassName =
    "min-h-11 w-full rounded-xl border-2 border-brand-champagne-500 bg-surface-primary px-4 text-sm font-bold text-brand-navy-900 shadow-sm outline-none transition focus:border-brand-navy-800 focus:ring-2 focus:ring-brand-navy-800/20";
  const labels = {
    allMakes: currentLang === "uz" ? "Barcha markalar" : currentLang === "ru" ? "Все марки" : "All makes",
    allModels: currentLang === "uz" ? "Barcha modellar" : currentLang === "ru" ? "Все модели" : "All models",
    allRegions: currentLang === "uz" ? "Barcha hududlar" : currentLang === "ru" ? "Все регионы" : "All regions",
    allYears: currentLang === "uz" ? "Barcha yillar" : currentLang === "ru" ? "Все годы" : "All years",
    auctionStatus: currentLang === "uz" ? "Auksion holati" : currentLang === "ru" ? "Статус аукциона" : "Auction status",
    make: currentLang === "uz" ? "Marka" : currentLang === "ru" ? "Марка" : "Make",
    model: currentLang === "uz" ? "Model" : currentLang === "ru" ? "Модель" : "Model",
    priceFrom: currentLang === "uz" ? "Narxdan" : currentLang === "ru" ? "Цена от" : "Price from",
    priceTo: currentLang === "uz" ? "Narxgacha" : currentLang === "ru" ? "Цена до" : "Price to",
    region: currentLang === "uz" ? "Hudud" : currentLang === "ru" ? "Регион" : "Region",
    reset: currentLang === "uz" ? "Filtrlarni tozalash" : currentLang === "ru" ? "Сбросить фильтры" : "Reset filters",
    search: currentLang === "uz" ? "Qidirish" : currentLang === "ru" ? "Поиск" : "Search",
    searchPlaceholder: currentLang === "uz" ? "Marka, model, lot yoki VIN..." : currentLang === "ru" ? "Марка, модель, лот или VIN..." : "Make, model, lot, or VIN...",
    year: currentLang === "uz" ? "Yil" : currentLang === "ru" ? "Год" : "Year",
  };

  const renderSelect = (
    key: DiscoveryFilterKey,
    label: string,
    placeholder: string,
    items: readonly FilterOption[],
  ) => (
    <div className="block">
      <AppSelect
        label={label}
        placeholder={placeholder}
        value={filters[key]}
        onChange={(val) => onChange(key, String(val))}
        options={[
          { value: "", label: placeholder },
          ...items.map((opt) => ({ value: opt.value, label: opt.label })),
        ]}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <label className="relative block">
        <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-brand-navy-900">
          {labels.search}
        </span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3.5 left-3 text-text-secondary"
          size={16}
        />
        <input
          className={`${fieldClassName} pl-9`}
          onChange={(event) => onChange("search", event.target.value)}
          placeholder={labels.searchPlaceholder}
          type="search"
          value={filters.search}
        />
      </label>

      <div className="block">
        <AppSelect
          label={labels.auctionStatus}
          value={filters.status}
          onChange={(val) => onChange("status", String(val))}
          options={auctionStatusOptions.map((opt) => ({
            value: opt.value,
            label: localizeOption(opt, currentLang),
          }))}
        />
      </div>

      {renderSelect("make", labels.make, labels.allMakes, options.makes)}
      {renderSelect("model", labels.model, labels.allModels, options.models)}
      {renderSelect("year", labels.year, labels.allYears, options.years)}
      {renderSelect("region", labels.region, labels.allRegions, options.regions)}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-brand-navy-900">
            {labels.priceFrom}
          </span>
          <input
            className={fieldClassName}
            inputMode="numeric"
            onChange={(event) => onChange("priceFrom", event.target.value.replace(/[^\d]/g, ""))}
            type="text"
            value={filters.priceFrom}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-brand-navy-900">
            {labels.priceTo}
          </span>
          <input
            className={fieldClassName}
            inputMode="numeric"
            onChange={(event) => onChange("priceTo", event.target.value.replace(/[^\d]/g, ""))}
            type="text"
            value={filters.priceTo}
          />
        </label>
      </div>

      <Button fullWidth variant="outline" onClick={onReset}>
        {labels.reset}
      </Button>
    </div>
  );
}

export function AuctionDiscovery() {
  const intl = useIntl();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentLang } = useContext(LangSwitch);
  const search = searchParams?.toString() ?? "";
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filters = useMemo(() => readFilters(search), [search]);
  const page = useMemo(() => readPage(search), [search]);
  const pageSize = useMemo(() => readPageSize(search), [search]);
  const makesQuery = useVehicleMakes();
  const selectedMakeId = useMemo(() => {
    if (!filters.make) return null;
    return makesQuery.data?.find((make) => make.name === filters.make)?.id ?? null;
  }, [filters.make, makesQuery.data]);
  const modelsQuery = useVehicleModels(selectedMakeId);
  const feedQuery = useAuctionFeed({
    approvalStatus: "APPROVED",
    page,
    size: pageSize,
    status: filters.status === "ALL" ? undefined : filters.status,
    search: filters.search,
    make: filters.make,
    model: filters.model,
    year: filters.year,
    region: filters.region,
    priceFrom: filters.priceFrom,
    priceTo: filters.priceTo,
  });
  const adaptedAuctions = useMemo<VehicleAuction[]>(
    () => (feedQuery.data?.items ?? []).flatMap((record: unknown) => {
      const auction = adaptLiveAuctionRecord(record);
      return auction ? [auction] : [];
    }),
    [feedQuery.data?.items],
  );
  const filterOptions = useMemo<DiscoveryFilterOptions>(() => {
    const backendMakes = (makesQuery.data ?? []).map((make) => ({
      label: make.name,
      value: make.name,
    }));
    const backendModels = (modelsQuery.data ?? []).map((model) => ({
      label: model.name,
      value: model.name,
    }));
    const officialRegions = getCanonicalRegionOptions(currentLang);

    return {
      makes: [...backendMakes, ...uniqueOptions(adaptedAuctions.map((auction) => auction.make))]
        .filter((option, index, list) => list.findIndex((item) => item.value === option.value) === index),
      models: [...backendModels, ...uniqueOptions(adaptedAuctions.map((auction) => auction.model))]
        .filter((option, index, list) => list.findIndex((item) => item.value === option.value) === index),
      regions: officialRegions,
      years: STATIC_YEAR_OPTIONS,
    };
  }, [adaptedAuctions, currentLang, makesQuery.data, modelsQuery.data]);
  const visibleAuctions = useMemo(() => {
    if (!filters.region) return adaptedAuctions;
    const selectedCanonical = findCanonicalRegion(filters.region);
    return adaptedAuctions.filter((auction) => {
      if (!auction.region) return false;
      if (selectedCanonical) {
        const itemCanonical = findCanonicalRegion(
          auction.region.name.default ??
            auction.region.name.uz ??
            auction.region.name.ru ??
            auction.region.name.en,
        );
        if (itemCanonical) {
          return itemCanonical.id === selectedCanonical.id;
        }
        return (
          auction.region.name.uz === selectedCanonical.uz ||
          auction.region.name.ru === selectedCanonical.ru ||
          auction.region.name.en === selectedCanonical.en ||
          auction.region.name.default === selectedCanonical.uz ||
          auction.region.name.default === selectedCanonical.ru
        );
      }
      return localizedRegionName(auction, currentLang) === filters.region;
    });
  }, [adaptedAuctions, filters.region, currentLang]);
  const meta: FeedMeta = useMemo(() => {
    if (filters.region && visibleAuctions.length !== adaptedAuctions.length) {
      return {
        elements: visibleAuctions.length,
        pages: Math.max(1, Math.ceil(visibleAuctions.length / pageSize)),
      };
    }
    return feedQuery.data?.meta ?? { elements: 0, pages: 1 };
  }, [filters.region, visibleAuctions.length, adaptedAuctions.length, pageSize, feedQuery.data?.meta]);

  function navigate(nextFilters: DiscoveryFilters, nextPage = 0, nextPageSize = pageSize) {
    const query = buildAuctionQuery(nextFilters, nextPage, nextPageSize);
    router.push(query ? `/auctions?${query}` : "/auctions");
  }

  function updateFilter(key: DiscoveryFilterKey, value: string) {
    navigate({
      ...filters,
      [key]: value,
      ...(key === "make" ? { model: "" } : null),
    }, 0);
  }

  function resetFilters() {
    navigate(emptyFilters, 0);
  }

  return (
    <section id="search" className="bg-surface-canvas">
      <div className="border-b border-border-default bg-brand-navy-900 text-white">
        <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-gutter)] py-10 md:py-14">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-champagne-500">
            TezAuksion
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-[-0.03em] md:text-5xl">
            {intl.formatMessage({ id: "auction.title" })}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
            {intl.formatMessage({ id: "auction.description" })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-gutter)] py-8 md:py-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-lg font-extrabold text-brand-navy-900">
            {intl.formatMessage(
              { id: "auction.results" },
              { count: meta.elements },
            )}
          </p>

          <Button
            variant="outline"
            className="lg:hidden"
            aria-label={intl.formatMessage({ id: "filter.open" })}
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">
              {intl.formatMessage({ id: "filter.status" })}
            </span>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[17.5rem_minmax(0,1fr)]">
          <aside className="hidden self-start rounded-lg border border-border-default bg-surface-primary p-5 lg:sticky lg:top-[calc(var(--public-header-height)+1rem)] lg:block">
            <FilterPanel
              currentLang={currentLang}
              filters={filters}
              onChange={updateFilter}
              onReset={resetFilters}
              options={filterOptions}
            />
          </aside>

          <div aria-label={intl.formatMessage({ id: "auction.resultsLabel" })}>
            {feedQuery.isLoading ? (
              <AuctionCardGridSkeleton label={translateUiText("loadingAuctions", currentLang)} />
            ) : feedQuery.isError ? (
              <StatePanel
                title={intl.formatMessage({ id: "auction.errorTitle" })}
                description={intl.formatMessage({ id: "auction.errorDescription" })}
                action={
                  <Button onClick={() => window.location.reload()}>
                    {intl.formatMessage({ id: "action.retry" })}
                  </Button>
                }
              />
            ) : visibleAuctions.length === 0 ? (
              <StatePanel
                title={intl.formatMessage({ id: "auction.emptyTitle" })}
                description={intl.formatMessage({ id: "auction.emptyDescription" })}
                action={
                  <Button variant="outline" onClick={resetFilters}>
                    {intl.formatMessage({ id: "filter.reset" })}
                  </Button>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {visibleAuctions.map((auction: VehicleAuction) => (
                    <AuctionCard key={auction.id} auction={auction} />
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                    <PageSizeSelect
                      disabled={feedQuery.isFetching}
                      onChange={(size) => navigate(filters, 0, size)}
                      value={pageSize}
                    />
                    <button
                      aria-label={translateUiText("previousPage", currentLang)}
                      className="rounded-md border border-border-default bg-white p-2 text-brand-navy-900 disabled:opacity-40"
                      disabled={page === 0}
                      onClick={() => navigate(filters, Math.max(0, page - 1))}
                      type="button"
                    >
                      <ChevronLeft aria-hidden="true" size={18} />
                    </button>
                    <span className="text-sm font-bold text-brand-navy-900">
                      {currentLang === "uz" ? "Sahifa" : currentLang === "ru" ? "Страница" : "Page"} {page + 1} / {meta.pages}
                    </span>
                    <button
                      aria-label={translateUiText("nextPage", currentLang)}
                      className="rounded-md border border-border-default bg-white p-2 text-brand-navy-900 disabled:opacity-40"
                      disabled={page >= meta.pages - 1}
                      onClick={() => navigate(filters, Math.min(meta.pages - 1, page + 1))}
                      type="button"
                    >
                      <ChevronRight aria-hidden="true" size={18} />
                    </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Drawer
        anchor="right"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "var(--surface-canvas)",
              maxWidth: "100%",
              padding: 3,
              width: 360,
            },
          },
        }}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-brand-navy-900">
            {intl.formatMessage({ id: "filter.applied" })}
          </h2>
          <button
            type="button"
            aria-label={intl.formatMessage({ id: "filter.close" })}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            onClick={() => setMobileFiltersOpen(false)}
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <FilterPanel
          currentLang={currentLang}
          filters={filters}
          onChange={updateFilter}
          onReset={resetFilters}
          options={filterOptions}
        />
      </Drawer>
    </section>
  );
}
