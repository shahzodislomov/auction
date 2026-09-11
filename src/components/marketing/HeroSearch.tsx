"use client";

import {
  FileText,
  Headphones,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useIntl } from "react-intl";

import { LangSwitch } from "@/context/LangSwitch";
import { useUserContext } from "@/context/UserContext";
import { CustomSelect } from "@/components/auction/AuctionFilters";
import { useCreateSavedSearch } from "@/queries/saved-searches";
import { useVehicleMakes, useVehicleModels } from "@/queries/vehicles";
import { getCanonicalRegionOptions } from "@/lib/regions";
import type { VehicleAuction } from "@/lib/auction/types";

export interface HeroSearchProps {
  auctions: readonly VehicleAuction[];
}

interface HeroUserContext {
  isAuthenticated: boolean;
  isLoading?: boolean;
}

const STATIC_HERO_YEARS: number[] = Array.from(
  { length: 2026 - 1980 + 1 },
  (_, i) => 2026 - i,
);

export function HeroSearch({ auctions }: HeroSearchProps) {
  const intl = useIntl();
  const router = useRouter();
  const { currentLang } = useContext(LangSwitch);
  const { isAuthenticated, isLoading: userLoading } =
    useUserContext() as HeroUserContext;
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [region, setRegion] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [endPrice, setEndPrice] = useState("");
  const [saveFeedback, setSaveFeedback] = useState<{
    kind: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // Backenddan ma'lumotlarni olish
  const createSavedSearch = useCreateSavedSearch();
  const makesQuery = useVehicleMakes();
  const selectedMakeId = useMemo(() => {
    if (!make) return null;
    return makesQuery.data?.find((m) => m.name === make)?.id ?? null;
  }, [makesQuery.data, make]);
  const modelsQuery = useVehicleModels(selectedMakeId);

  // Backenddan kelgan ma'lumotlarni va auctions dan olingan ma'lumotlarni birlashtirish
  const options = useMemo(() => {
    // Backenddan makes
    const backendMakes: string[] = (makesQuery.data ?? []).map((m) => m.name);
    // Agar auctions da bor makes backendda yo'q bo'lsa, qo'shib qo'yish
    const auctionMakes: string[] = [
      ...new Set(auctions.flatMap((auction) => auction.make ?? [])),
    ];
    const makes = [...new Set([...backendMakes, ...auctionMakes])].sort();

    // Backenddan models (tanlangan make bo'yicha)
    const backendModels: string[] = (modelsQuery.data ?? []).map((m) => m.name);
    // Auctions dan model filtrlash (tanlangan make bo'yicha)
    const makeFilteredAuctions = make
      ? auctions.filter((auction) => auction.make === make)
      : auctions;
    const auctionModels: string[] = [
      ...new Set(
        makeFilteredAuctions.flatMap((auction) => auction.model ?? []),
      ),
    ];
    const models = [...new Set([...backendModels, ...auctionModels])].sort();

    const years = STATIC_HERO_YEARS;

    // Regionlar: faqat 14 ta rasmiy hudud (dublikat va 'string' siz)
    const regions = getCanonicalRegionOptions(
      currentLang as "uz" | "ru" | "en",
    );

    return { makes, models, years, regions };
  }, [makesQuery.data, modelsQuery.data, auctions, currentLang, make]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (year) params.set("year", year);
    if (region) params.set("region", region);
    if (startPrice.trim()) params.set("priceFrom", startPrice.trim());
    if (endPrice.trim()) params.set("priceTo", endPrice.trim());
    const query = params.toString();
    router.push(query ? `/auctions?${query}` : "/auctions");
  }

  function handlePriceChange(
    setter: (value: string) => void,
  ): (event: ChangeEvent<HTMLInputElement>) => void {
    return (event) => {
      setter(event.target.value.replace(/[^\d]/g, ""));
    };
  }

  function buildSavedSearchFilters(): Record<string, unknown> {
    const filters: Record<string, unknown> = {};
    const setText = (key: string, value: string) => {
      const trimmed = value.trim();
      if (trimmed) filters[key] = trimmed;
    };
    const setNumber = (key: string, value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      const parsed = Number(trimmed);
      filters[key] = Number.isFinite(parsed) ? parsed : trimmed;
    };

    setText("make", make);
    setText("model", model);
    setNumber("year", year);
    setNumber("yearFrom", year);
    setNumber("yearTo", year);
    setText("region", region);
    setNumber("priceFrom", startPrice);
    setNumber("priceTo", endPrice);
    return filters;
  }

  async function handleSaveSearch() {
    const filters = buildSavedSearchFilters();

    if (!Object.keys(filters).length) {
      setSaveFeedback({
        kind: "warning",
        message: intl.formatMessage({ id: "home.searchSaveEmpty" }),
      });
      return;
    }

    try {
      await createSavedSearch.mutateAsync({ filters, notify: true });
      setSaveFeedback({
        kind: "success",
        message: intl.formatMessage({ id: "home.searchSaveSuccess" }),
      });
    } catch {
      setSaveFeedback({
        kind: "error",
        message: intl.formatMessage({ id: "home.searchSaveError" }),
      });
    }
  }

  const trustItems = [
    {
      Icon: ShieldCheck,
      title: "home.trust.inspectedTitle",
      text: "home.trust.inspectedText",
    },
    {
      Icon: FileText,
      title: "home.trust.transparentTitle",
      text: "home.trust.transparentText",
    },
    {
      Icon: MapPin,
      title: "home.trust.deliveryTitle",
      text: "home.trust.deliveryText",
    },
    {
      Icon: Headphones,
      title: "home.trust.supportTitle",
      text: "home.trust.supportText",
    },
  ] as const;

  return (
    <section aria-label={intl.formatMessage({ id: "home.searchLegend" })} className="mx-auto w-full max-w-[91.125rem] px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-border-default/80 bg-white shadow-[0_4px_20px_rgb(4_18_43_/_0.04)] grid lg:min-h-[28rem] lg:grid-cols-[58fr_42fr]">
        <div className="flex flex-col px-5 py-6 sm:px-8 sm:py-8 lg:py-10">
          <h1 className="max-w-[42rem] text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-[1.15] tracking-tight text-brand-navy-900">
            {intl.formatMessage({ id: "home.heroTitleLead" })}{" "}
            <span className="text-brand-gold-text">
              {intl.formatMessage({ id: "home.heroTitleAccent" })}
            </span>
          </h1>
          <p className="mt-2.5 max-w-[28rem] text-sm sm:text-base leading-relaxed text-text-secondary">
            {intl.formatMessage({ id: "home.heroDescription" })}
          </p>

          <form
            aria-label={intl.formatMessage({ id: "home.searchLegend" })}
            className="mt-5 w-full rounded-2xl border border-border-default/80 bg-surface-canvas/50 p-4 sm:p-5"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-6">
              <div className="xl:col-span-2">
                <CustomSelect
                  id="home-make"
                  label={intl.formatMessage({ id: "filter.make" })}
                  placeholder={intl.formatMessage({ id: "filter.all" })}
                  value={make}
                  options={options.makes.map((value) => ({ label: value, value }))}
                  onChange={(val) => {
                    setMake(val);
                    setModel("");
                  }}
                />
              </div>

              <div className="xl:col-span-2">
                <CustomSelect
                  id="home-model"
                  label={intl.formatMessage({ id: "filter.model" })}
                  placeholder={intl.formatMessage({ id: "filter.all" })}
                  value={model}
                  options={options.models.map((value) => ({ label: value, value }))}
                  onChange={(val) => setModel(val)}
                />
              </div>

              <div className="xl:col-span-2">
                <CustomSelect
                  id="home-year"
                  label={intl.formatMessage({ id: "filter.year" })}
                  placeholder={intl.formatMessage({ id: "filter.all" })}
                  value={year}
                  options={options.years.map((value) => ({ label: String(value), value: String(value) }))}
                  onChange={(val) => setYear(val)}
                />
              </div>

              <div className="sm:col-span-1 xl:col-span-2">
                <CustomSelect
                  id="home-region"
                  label={intl.formatMessage({ id: "filter.region" })}
                  placeholder={intl.formatMessage({ id: "filter.all" })}
                  value={region}
                  options={options.regions.map((opt) => ({ label: opt.label, value: opt.value }))}
                  onChange={(val) => setRegion(val)}
                />
              </div>

              <label className="block sm:col-span-1 xl:col-span-2" htmlFor="home-start-price">
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-brand-navy-900">
                  {intl.formatMessage({ id: "filter.startPrice" })}
                </span>
                <input
                  className="h-11 w-full rounded-xl border-2 border-brand-champagne-500 bg-surface-primary px-3 text-sm font-bold text-brand-navy-900 shadow-sm outline-none transition-all duration-150 placeholder:text-brand-navy-900/60 hover:border-brand-champagne-600 hover:bg-surface-muted focus:border-brand-navy-800 focus:ring-2 focus:ring-brand-navy-800/20 sm:h-12 sm:px-4"
                  id="home-start-price"
                  inputMode="numeric"
                  onChange={handlePriceChange(setStartPrice)}
                  placeholder={intl.formatMessage({ id: "filter.priceFrom" })}
                  type="text"
                  value={startPrice}
                  suppressHydrationWarning
                />
              </label>

              <label className="block sm:col-span-1 xl:col-span-2" htmlFor="home-end-price">
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-brand-navy-900">
                  {intl.formatMessage({ id: "filter.endPrice" })}
                </span>
                <input
                  className="h-11 w-full rounded-xl border-2 border-brand-champagne-500 bg-surface-primary px-3 text-sm font-bold text-brand-navy-900 shadow-sm outline-none transition-all duration-150 placeholder:text-brand-navy-900/60 hover:border-brand-champagne-600 hover:bg-surface-muted focus:border-brand-navy-800 focus:ring-2 focus:ring-brand-navy-800/20 sm:h-12 sm:px-4"
                  id="home-end-price"
                  inputMode="numeric"
                  onChange={handlePriceChange(setEndPrice)}
                  placeholder={intl.formatMessage({ id: "filter.priceTo" })}
                  type="text"
                  value={endPrice}
                  suppressHydrationWarning
                />
              </label>

              <div className="flex gap-2 self-end sm:col-span-1 xl:col-span-2 xl:col-start-5">
                <button
                  type="submit"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-brand-champagne-500 bg-brand-champagne-500 px-6 py-3 text-sm font-extrabold uppercase text-brand-navy-900 shadow-sm transition-all hover:border-brand-champagne-600 hover:bg-brand-champagne-600 active:scale-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  <Search aria-hidden="true" className="h-5 w-5" />
                  {intl.formatMessage({ id: "action.search" })}
                </button>
                {isAuthenticated ? (
                  <div className="group relative">
                    <button
                      aria-describedby="home-save-search-tooltip"
                      aria-label={intl.formatMessage({ id: "home.searchSaveAction" })}
                      className="inline-flex min-h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-navy-900 bg-brand-navy-900 text-white transition-all hover:bg-brand-navy-800 active:scale-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={Boolean(userLoading || createSavedSearch.isPending)}
                      onClick={() => {
                        void handleSaveSearch();
                      }}
                      title={intl.formatMessage({ id: "home.searchSaveTooltip" })}
                      type="button"
                    >
                      <Plus aria-hidden="true" className="h-5 w-5" />
                    </button>
                    <span
                      className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] right-0 z-10 w-56 rounded-md bg-brand-navy-900 px-3 py-2 text-xs font-semibold leading-4 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                      id="home-save-search-tooltip"
                      role="tooltip"
                    >
                      {intl.formatMessage({ id: "home.searchSaveTooltip" })}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
            {saveFeedback ? (
              <p
                className={`mt-3 text-sm font-semibold ${
                  saveFeedback.kind === "success"
                    ? "text-semantic-success"
                    : saveFeedback.kind === "warning"
                      ? "text-semantic-warning"
                      : "text-semantic-danger"
                }`}
                role={saveFeedback.kind === "error" ? "alert" : "status"}
              >
                {saveFeedback.message}
              </p>
            ) : null}
          </form>

          <div className="mt-4 grid w-full max-w-[44rem] gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {trustItems.map(({ Icon, text, title }) => (
              <div key={title} className="flex items-start gap-2.5">
                <Icon
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-navy-900"
                />
                <p className="text-xs leading-[1.35] text-text-secondary">
                  <strong className="block font-extrabold text-brand-navy-900">
                    {intl.formatMessage({ id: title })}
                  </strong>
                  {intl.formatMessage({ id: text })}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-72 overflow-hidden  lg:min-h-full">
          <Image
            src="/vehicles/herosearch.jpg"
            alt={intl.formatMessage({ id: "home.heroImageAlt" })}
            fill
            priority
            sizes="(max-width: 1023px) calc(100vw - 4rem), 44.4vw"
            className="object-cover object-[center_42%] lg:object-[center_36%] max-lg:px-8"
          />
        </div>
      </div>
    </section>
  );
}
