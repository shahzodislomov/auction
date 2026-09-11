import {
  BadgeCheck,
  CarFront,
  ClipboardCheck,
  FileCheck2,
  Fuel,
  Gauge,
  Layers,
  MapPin,
  Palette,
  Settings2,
  Zap,
} from "lucide-react";

import { Surface } from "@/components/ui/Surface";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { VehicleAuction } from "@/lib/auction/types";
import { formatMileage } from "@/lib/formatting/auction";
import type { ChampagneLocale } from "@/locales/champagne";

const copy = {
  uz: {
    heading: "Avtomobil tafsilotlari",
    make: "Markasi",
    model: "Modeli",
    year: "Yili",
    mileage: "Yurgan masofa",
    fuel: "Yoqilg‘i",
    transmission: "Uzatmalar qutisi",
    drivetrain: "Yuritma (Privod)",
    bodyType: "Kuzov turi",
    engineVolume: "Dvigatel hajmi",
    color: "Rangi",
    region: "Joylashuv",
    condition: "Holati",
    vin: "VIN kodi",
    inspection: "Tekshiruv",
    documents: "Hujjatlar",
    verified: "Tasdiqlangan",
    notVerified: "Tasdiqlanmagan",
    unknown: "Ko‘rsatilmagan",
  },
  ru: {
    heading: "Характеристики автомобиля",
    make: "Марка",
    model: "Модель",
    year: "Год",
    mileage: "Пробег",
    fuel: "Топливо",
    transmission: "Коробка передач",
    drivetrain: "Привод",
    bodyType: "Тип кузова",
    engineVolume: "Объем двигателя",
    color: "Цвет",
    region: "Местоположение",
    condition: "Состояние",
    vin: "VIN-код",
    inspection: "Осмотр",
    documents: "Документы",
    verified: "Подтверждено",
    notVerified: "Не подтверждено",
    unknown: "Не указано",
  },
  en: {
    heading: "Vehicle details",
    make: "Make",
    model: "Model",
    year: "Year",
    mileage: "Mileage",
    fuel: "Fuel",
    transmission: "Transmission",
    drivetrain: "Drivetrain",
    bodyType: "Body type",
    engineVolume: "Engine volume",
    color: "Color",
    region: "Location",
    condition: "Condition",
    vin: "VIN",
    inspection: "Inspection",
    documents: "Documents",
    verified: "Verified",
    notVerified: "Not verified",
    unknown: "Not supplied",
  },
} as const;

const localeTags: Record<ChampagneLocale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

const domainValues: Record<ChampagneLocale, Record<string, string>> = {
  uz: {
    // Yoqilg'i (Fuel)
    petrol: "Benzin",
    gasoline: "Benzin",
    benzin: "Benzin",
    diesel: "Dizel",
    electric: "Elektr",
    electro: "Elektr",
    hybrid: "Gibrid",
    "petrol-hybrid": "Benzin-gibrid",
    petrol_hybrid: "Benzin-gibrid",
    "plug-in-hybrid": "Plug-in Gibrid",
    gas: "Gaz",
    metan: "Metan (gaz)",
    cng: "Metan (CNG)",
    propan: "Propan (gaz)",
    lpg: "Propan (LPG)",

    // Transmission
    automatic: "Avtomat",
    avtomat: "Avtomat",
    manual: "Mexanika",
    mexanik: "Mexanika",
    mexanika: "Mexanika",
    robot: "Robot",
    robotic: "Robotlashtirilgan",
    amt: "Robot (AMT)",
    cvt: "Variator (CVT)",
    variator: "Variator",

    // Drivetrain (Privod)
    fwd: "Old privod (FWD)",
    front: "Old privod (FWD)",
    "front-wheel-drive": "Old privod (FWD)",
    front_wheel_drive: "Old privod (FWD)",
    rwd: "Orqa privod (RWD)",
    rear: "Orqa privod (RWD)",
    "rear-wheel-drive": "Orqa privod (RWD)",
    rear_wheel_drive: "Orqa privod (RWD)",
    awd: "To‘liq privod (AWD)",
    "4wd": "To‘liq privod (4x4)",
    "4x4": "To‘liq privod (4x4)",
    "all-wheel-drive": "To‘liq privod (AWD)",
    all_wheel_drive: "To‘liq privod (AWD)",

    // Condition
    excellent: "A'lo holatda",
    "used-excellent": "Ishlatilgan · A'lo",
    used_excellent: "Ishlatilgan · A'lo",
    good: "Yaxshi holatda",
    "used-good": "Ishlatilgan · Yaxshi",
    used_good: "Ishlatilgan · Yaxshi",
    damaged: "Shikastlangan",
    not_running: "Yurmaydi (nosoz)",
    "not-running": "Yurmaydi (nosoz)",
    "dealer-demo": "Diler namoyish avtosi",
    dealer_demo: "Diler namoyish avtosi",
    new: "Yangi",

    // Body types
    sedan: "Sedan",
    suv: "Krossover / SUV",
    crossover: "Krossover",
    hatchback: "Xetchbek",
    coupe: "Kupe",
    minivan: "Miniven",
    pickup: "Pikap",
    wagon: "Universal",
    universal: "Universal",
    cabriolet: "Kabriolet",

    // Colors
    white: "Oq",
    black: "Qora",
    silver: "Kumushrang",
    gray: "Kulrang",
    grey: "Kulrang",
    blue: "Ko'k",
    red: "Qizil",
    brown: "Jigarrang",
    green: "Yashil",

    // Inspection
    passed: "Tekshiruvdan o‘tgan",
    attention: "E’tibor talab etadi",
    failed: "Tekshiruvdan o‘tmagan",
    pending: "Tekshiruv kutilmoqda",

    // Documents
    title: "Texnik pasport",
    customs: "Bojxona deklaratsiyasi",
    inspection: "Texnik ko‘rik",
  },
  ru: {
    // Топливо
    petrol: "Бензин",
    gasoline: "Бензин",
    benzin: "Бензин",
    diesel: "Дизель",
    electric: "Электро",
    electro: "Электро",
    hybrid: "Гибрид",
    "petrol-hybrid": "Бензиновый гибрид",
    petrol_hybrid: "Бензиновый гибрид",
    "plug-in-hybrid": "Plug-in Гибрид",
    gas: "Газ",
    metan: "Метан (газ)",
    cng: "Метан (CNG)",
    propan: "Пропан (газ)",
    lpg: "Пропан (LPG)",

    // Коробка передач
    automatic: "Автомат",
    avtomat: "Автомат",
    manual: "Механика",
    mexanik: "Механика",
    mexanika: "Механика",
    robot: "Робот",
    robotic: "Роботизированная",
    amt: "Робот (AMT)",
    cvt: "Вариатор (CVT)",
    variator: "Вариатор",

    // Привод
    fwd: "Передний привод (FWD)",
    front: "Передний привод (FWD)",
    "front-wheel-drive": "Передний привод (FWD)",
    front_wheel_drive: "Передний привод (FWD)",
    rwd: "Задний привод (RWD)",
    rear: "Задний привод (RWD)",
    "rear-wheel-drive": "Задний привод (RWD)",
    rear_wheel_drive: "Задний привод (RWD)",
    awd: "Полный привод (AWD)",
    "4wd": "Полный привод (4x4)",
    "4x4": "Полный привод (4x4)",
    "all-wheel-drive": "Полный привод (AWD)",
    all_wheel_drive: "Полный привод (AWD)",

    // Состояние
    excellent: "Отличное",
    "used-excellent": "С пробегом · Отличное",
    used_excellent: "С пробегом · Отличное",
    good: "Хорошее",
    "used-good": "С пробегом · Хорошее",
    used_good: "С пробегом · Хорошее",
    damaged: "Поврежденное",
    not_running: "Не на ходу",
    "not-running": "Не на ходу",
    "dealer-demo": "Демонстрационный авто",
    dealer_demo: "Демонстрационный авто",
    new: "Новое",

    // Кузов
    sedan: "Седан",
    suv: "Внедорожник / SUV",
    crossover: "Кроссовер",
    hatchback: "Хэтчбек",
    coupe: "Купе",
    minivan: "Минивэн",
    pickup: "Пикап",
    wagon: "Универсал",
    universal: "Универсал",
    cabriolet: "Кабриолет",

    // Цвета
    white: "Белый",
    black: "Черный",
    silver: "Серебристый",
    gray: "Серый",
    grey: "Серый",
    blue: "Синий",
    red: "Красный",
    brown: "Коричневый",
    green: "Зеленый",

    // Осмотр
    passed: "Осмотр пройден",
    attention: "Требует внимания",
    failed: "Осмотр не пройден",
    pending: "Осмотр ожидается",

    // Документы
    title: "Техпаспорт",
    customs: "Таможенная декларация",
    inspection: "Техосмотр",
  },
  en: {
    // Fuel
    petrol: "Petrol",
    gasoline: "Gasoline",
    benzin: "Petrol",
    diesel: "Diesel",
    electric: "Electric",
    electro: "Electric",
    hybrid: "Hybrid",
    "petrol-hybrid": "Petrol hybrid",
    petrol_hybrid: "Petrol hybrid",
    "plug-in-hybrid": "Plug-in Hybrid",
    gas: "Gas",
    metan: "Methane (CNG)",
    cng: "Methane (CNG)",
    propan: "Propane (LPG)",
    lpg: "Propane (LPG)",

    // Transmission
    automatic: "Automatic",
    avtomat: "Automatic",
    manual: "Manual",
    mexanik: "Manual",
    mexanika: "Manual",
    robot: "Robotic",
    robotic: "Robotic",
    amt: "Robot (AMT)",
    cvt: "CVT",
    variator: "CVT",

    // Drivetrain
    fwd: "Front-wheel drive (FWD)",
    front: "Front-wheel drive (FWD)",
    "front-wheel-drive": "Front-wheel drive (FWD)",
    front_wheel_drive: "Front-wheel drive (FWD)",
    rwd: "Rear-wheel drive (RWD)",
    rear: "Rear-wheel drive (RWD)",
    "rear-wheel-drive": "Rear-wheel drive (RWD)",
    rear_wheel_drive: "Rear-wheel drive (RWD)",
    awd: "All-wheel drive (AWD)",
    "4wd": "Four-wheel drive (4x4)",
    "4x4": "Four-wheel drive (4x4)",
    "all-wheel-drive": "All-wheel drive (AWD)",
    all_wheel_drive: "All-wheel drive (AWD)",

    // Condition
    excellent: "Excellent condition",
    "used-excellent": "Used · Excellent",
    used_excellent: "Used · Excellent",
    good: "Good condition",
    "used-good": "Used · Good",
    used_good: "Used · Good",
    damaged: "Damaged",
    not_running: "Not running",
    "not-running": "Not running",
    "dealer-demo": "Dealer demonstrator",
    dealer_demo: "Dealer demonstrator",
    new: "New",

    // Body types
    sedan: "Sedan",
    suv: "SUV / Crossover",
    crossover: "Crossover",
    hatchback: "Hatchback",
    coupe: "Coupe",
    minivan: "Minivan",
    pickup: "Pickup",
    wagon: "Station wagon",
    universal: "Station wagon",
    cabriolet: "Convertible",

    // Colors
    white: "White",
    black: "Black",
    silver: "Silver",
    gray: "Gray",
    grey: "Gray",
    blue: "Blue",
    red: "Red",
    brown: "Brown",
    green: "Green",

    // Inspection
    passed: "Inspection passed",
    attention: "Needs attention",
    failed: "Inspection failed",
    pending: "Inspection pending",

    // Documents
    title: "Vehicle title",
    customs: "Customs declaration",
    inspection: "Inspection report",
  },
};

export function localizedDomainValue(
  value: string | null | undefined,
  locale: ChampagneLocale,
): string {
  if (!value) return "";
  const directKey = String(value).trim().toLowerCase();
  const hyphenKey = directKey.replaceAll("_", "-");
  const underscoreKey = directKey.replaceAll("-", "_");
  return (
    domainValues[locale]?.[directKey] ??
    domainValues[locale]?.[hyphenKey] ??
    domainValues[locale]?.[underscoreKey] ??
    value
      .replaceAll("-", " ")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

function localized(
  value: VehicleAuction["title"],
  locale: ChampagneLocale,
): string | null {
  return value[locale] ?? value.default ?? value.uz ?? value.ru ?? value.en;
}

export function AuctionFacts({
  auction,
  locale,
}: {
  auction: VehicleAuction;
  locale: ChampagneLocale;
}) {
  const labels = copy[locale];
  const region = auction.region
    ? [
        localized(auction.region.name, locale),
        auction.region.district
          ? localized(auction.region.district, locale)
          : null,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  const rawEngineVolume = auction.engineVolume
    ? `${auction.engineVolume} L`
    : null;

  const facts = [
    { label: labels.year, value: auction.year, icon: CarFront },
    {
      label: labels.mileage,
      value: formatMileage(auction.mileage, localeTags[locale], labels.unknown),
      icon: Gauge,
    },
    {
      label: labels.fuel,
      value: localizedDomainValue(auction.fuel, locale),
      icon: Fuel,
    },
    {
      label: labels.transmission,
      value: localizedDomainValue(auction.transmission, locale),
      icon: Settings2,
    },
    {
      label: labels.drivetrain,
      value: localizedDomainValue(auction.drivetrain, locale),
      icon: Zap,
    },
    ...(auction.bodyType
      ? [
          {
            label: labels.bodyType,
            value: localizedDomainValue(auction.bodyType, locale),
            icon: Layers,
          },
        ]
      : []),
    ...(rawEngineVolume
      ? [
          {
            label: labels.engineVolume,
            value: rawEngineVolume,
            icon: Zap,
          },
        ]
      : []),
    ...(auction.color
      ? [
          {
            label: labels.color,
            value: localizedDomainValue(auction.color, locale),
            icon: Palette,
          },
        ]
      : []),
    {
      label: labels.condition,
      value: localizedDomainValue(auction.condition, locale),
      icon: ClipboardCheck,
    },
    { label: labels.region, value: region, icon: MapPin },
    { label: labels.vin, value: auction.vin, icon: BadgeCheck },
  ].filter(
    (fact) =>
      fact.value !== null &&
      fact.value !== undefined &&
      fact.value !== "" &&
      fact.value !== "unknown" &&
      fact.value !== labels.unknown,
  );

  return (
    <section aria-labelledby="auction-facts-heading">
      <div className="rounded-2xl border border-border-default/80 bg-white p-4 sm:p-5 shadow-xs">
        <div className="mb-3.5 flex items-center justify-between">
          <h2
            id="auction-facts-heading"
            className="font-display text-base sm:text-lg font-bold text-brand-navy-950"
          >
            {labels.heading}
          </h2>
          {auction.make && (
            <span className="rounded-md bg-brand-navy-900/5 px-2.5 py-1 text-xs font-bold text-brand-navy-900">
              {auction.make} {auction.model ?? ""}
            </span>
          )}
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {facts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div
                key={fact.label}
                className="group flex flex-col justify-center rounded-xl border border-border-default/70 bg-surface-canvas/60 px-3 py-2 sm:px-3.5 sm:py-2.5 transition hover:border-brand-navy-900/30 hover:bg-surface-canvas"
              >
                <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary truncate">
                  <Icon
                    aria-hidden="true"
                    size={14}
                    className="shrink-0 text-text-tertiary transition-colors group-hover:text-brand-navy-900"
                  />
                  <span className="truncate">{fact.label}</span>
                </dt>
                <dd
                  className="mt-1 text-xs sm:text-sm font-extrabold text-brand-navy-950 truncate"
                  title={String(fact.value)}
                >
                  {fact.value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {auction.inspection || auction.documents.length > 0 ? (
        <div className="mt-4 grid gap-3.5 md:grid-cols-2">
          {auction.inspection ? (
            <Surface padding="small">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-brand-navy-900">
                    <ClipboardCheck aria-hidden="true" size={17} />
                    {labels.inspection}
                  </h3>
                  {localized(auction.inspection.summary, locale) ? (
                    <p className="mt-1.5 text-xs sm:text-sm leading-5 text-text-secondary">
                      {localized(auction.inspection.summary, locale)}
                    </p>
                  ) : null}
                </div>
                <StatusBadge
                  tone={
                    auction.inspection.status === "passed"
                      ? "success"
                      : auction.inspection.status === "failed"
                        ? "danger"
                        : "warning"
                  }
                >
                  {localizedDomainValue(auction.inspection.status, locale)}
                  {auction.inspection.score !== null
                    ? ` · ${auction.inspection.score}/100`
                    : ""}
                </StatusBadge>
              </div>
            </Surface>
          ) : null}

          {auction.documents.length > 0 ? (
            <Surface padding="small">
              <h3 className="flex items-center gap-2 font-bold text-brand-navy-900">
                <FileCheck2 aria-hidden="true" size={17} />
                {labels.documents}
              </h3>
              <ul className="mt-2.5 space-y-1.5">
                {auction.documents.map((document, index) => (
                  <li
                    key={document.id ?? `${document.type}-${index}`}
                    className="flex items-center justify-between gap-3 text-xs sm:text-sm rounded-lg bg-surface-canvas/70 px-2.5 py-1.5"
                  >
                    <span className="min-w-0 truncate font-medium text-text-secondary">
                      {document.name ?? localizedDomainValue(document.type, locale)}
                    </span>
                    {document.verified !== null ? (
                      <StatusBadge
                        tone={document.verified ? "success" : "warning"}
                      >
                        {document.verified
                          ? labels.verified
                          : labels.notVerified}
                      </StatusBadge>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Surface>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default AuctionFacts;
