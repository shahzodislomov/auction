"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Gauge, MapPin, PartyPopper, Phone, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useModalFocus } from "@/hooks/useModalFocus";
import { formatAuctionPrice } from "@/lib/formatting/auction";
import type { ChampagneLocale } from "@/locales/champagne";
import type { AuctionCounterparty } from "./useUserById";
import type { AuctionCurrency } from "@/lib/auction/types";

const copy = {
  uz: {
    sellerTitle: "Avtomobilingiz sotildi",
    winnerTitle: "Siz avtomobilni sotib oldingiz",
    sellerBody:
      "Auksion yakunlandi. Quyidagi ma'lumotlar avtomobil, yakuniy narx va xaridor haqida.",
    winnerBody:
      "Auksion yakunlandi. Quyidagi ma'lumotlar avtomobil, yakuniy narx va sotuvchi haqida.",
    lot: "Lot",
    finalPrice: "Yakuniy narx",
    vehicle: "Avtomobil",
    year: "Yil",
    mileage: "Yurgan masofa",
    region: "Hudud",
    seller: "Sotuvchi",
    buyer: "Xaridor",
    contactPending: "Kontakt ma’lumotlari tayyorlanmoqda…",
    noPhone: "Telefon raqami ko‘rsatilmagan",
    sellerResult: "Siz bu avtomobilni yakuniy narxda sotdingiz.",
    winnerResult: "Siz bu avtomobilni yakuniy narxda sotib oldingiz.",
    dealNotice:
      "Kelishuvni yakunlash uchun Bitimlar sahifasiga o‘ting va kelishuvni tasdiqlang.",
    openDeals: "Bitimlarga o‘tish",
    imageFallback: "Avtomobil rasmi",
    previousImage: "Oldingi rasm",
    nextImage: "Keyingi rasm",
    close: "Yopish",
    done: "Tushunarli",
  },
  ru: {
    sellerTitle: "Ваш автомобиль продан",
    winnerTitle: "Вы купили автомобиль",
    sellerBody:
      "Аукцион завершён. Ниже показаны автомобиль, итоговая цена и данные покупателя.",
    winnerBody:
      "Аукцион завершён. Ниже показаны автомобиль, итоговая цена и данные продавца.",
    lot: "Лот",
    finalPrice: "Итоговая цена",
    vehicle: "Автомобиль",
    year: "Год",
    mileage: "Пробег",
    region: "Регион",
    seller: "Продавец",
    buyer: "Покупатель",
    contactPending: "Контактные данные готовятся…",
    noPhone: "Номер телефона не указан",
    sellerResult: "Вы продали этот автомобиль по итоговой цене.",
    winnerResult: "Вы купили этот автомобиль по итоговой цене.",
    dealNotice:
      "Чтобы завершить сделку, перейдите в раздел сделок и подтвердите соглашение.",
    openDeals: "Перейти к сделкам",
    imageFallback: "Фото автомобиля",
    previousImage: "Предыдущее изображение",
    nextImage: "Следующее изображение",
    close: "Закрыть",
    done: "Понятно",
  },
  en: {
    sellerTitle: "Your vehicle has been sold",
    winnerTitle: "You bought the vehicle",
    sellerBody:
      "The auction has ended. The vehicle, final price, and buyer details are shown below.",
    winnerBody:
      "The auction has ended. The vehicle, final price, and seller details are shown below.",
    lot: "Lot",
    finalPrice: "Final price",
    vehicle: "Vehicle",
    year: "Year",
    mileage: "Mileage",
    region: "Region",
    seller: "Seller",
    buyer: "Buyer",
    contactPending: "Contact details are being prepared…",
    noPhone: "No phone number listed",
    sellerResult: "You sold this vehicle for the final auction price.",
    winnerResult: "You bought this vehicle for the final auction price.",
    dealNotice:
      "Go to the deals page to finish the process and confirm the agreement.",
    openDeals: "Open deals",
    imageFallback: "Vehicle image",
    previousImage: "Previous image",
    nextImage: "Next image",
    close: "Close",
    done: "Got it",
  },
} as const;

export interface AuctionSaleModalProps {
  open: boolean;
  role: "seller" | "winner";
  locale: ChampagneLocale;
  vehicleTitle: string;
  lotNumber: string | number | null;
  currency: AuctionCurrency;
  finalPrice: number | null;
  imageUrls: string[];
  vehicleYear: number | null;
  mileage: number | null;
  regionName: string | null;
  counterpart: AuctionCounterparty | null;
  counterpartKnown: boolean;
  onClose: () => void;
}

const localeTags: Record<ChampagneLocale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

export function AuctionSaleModal({
  open,
  role,
  locale,
  vehicleTitle,
  lotNumber,
  currency,
  finalPrice,
  imageUrls,
  vehicleYear,
  mileage,
  regionName,
  counterpart,
  counterpartKnown,
  onClose,
}: AuctionSaleModalProps) {
  const labels = copy[locale];
  const dialogRef = useModalFocus<HTMLDivElement>({
    isOpen: open,
    onClose,
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveImageIndex(0);
  }, [imageUrls.length, open]);

  if (!open) return null;

  const visibleImageIndex = imageUrls.length ? activeImageIndex % imageUrls.length : 0;
  const activeImageUrl = imageUrls[visibleImageIndex] ?? null;
  const showPreviousImage = () => {
    setActiveImageIndex((current) => (current - 1 + imageUrls.length) % imageUrls.length);
  };
  const showNextImage = () => {
    setActiveImageIndex((current) => (current + 1) % imageUrls.length);
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auction-sale-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-lg border border-border-default bg-white shadow-xl"
      >
        <div className="relative aspect-[21/9] max-h-64 bg-surface-muted">
          {activeImageUrl ? (
            <img
              alt={`${vehicleTitle || labels.imageFallback} ${visibleImageIndex + 1}`}
              className="h-full w-full object-cover"
              src={activeImageUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-bold text-text-secondary">
              {labels.imageFallback}
            </div>
          )}
          {imageUrls.length > 1 ? (
            <>
              <button
                aria-label={labels.previousImage}
                className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-navy-900/85 text-white shadow-md transition-colors hover:bg-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                onClick={showPreviousImage}
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={19} />
              </button>
              <button
                aria-label={labels.nextImage}
                className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-navy-900/85 text-white shadow-md transition-colors hover:bg-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                onClick={showNextImage}
                type="button"
              >
                <ChevronRight aria-hidden="true" size={19} />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-brand-navy-900/85 px-3 py-1 text-xs font-bold text-white">
                {visibleImageIndex + 1} / {imageUrls.length}
              </span>
            </>
          ) : null}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <PartyPopper className="h-5 w-5 text-brand-navy-900" aria-hidden="true" />
                <h2 id="auction-sale-modal-title" className="text-xl font-bold text-brand-navy-900">
                  {role === "seller" ? labels.sellerTitle : labels.winnerTitle}
                </h2>
              </div>
              <p className="mt-1.5 text-sm leading-5 text-brand-navy-900/80">
                {role === "seller" ? labels.sellerBody : labels.winnerBody}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={labels.close}
              className="inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="rounded-md border border-border-default p-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-gold-text">
                {labels.vehicle}
              </p>
              <p className="mt-1.5 text-base font-bold text-brand-navy-900">{vehicleTitle}</p>
              {lotNumber !== null ? (
                <p className="mt-1 text-sm text-brand-navy-900/70">
                  {labels.lot} #{lotNumber}
                </p>
              ) : null}
              <dl className="mt-3 grid gap-2 text-sm text-brand-navy-900/75 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  <div>
                    <dt className="sr-only">{labels.year}</dt>
                    <dd>{vehicleYear ?? "—"}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4" aria-hidden="true" />
                  <div>
                    <dt className="sr-only">{labels.mileage}</dt>
                    <dd>
                      {mileage !== null
                        ? `${new Intl.NumberFormat(localeTags[locale]).format(mileage)} km`
                        : "—"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <div>
                    <dt className="sr-only">{labels.region}</dt>
                    <dd>{regionName ?? "—"}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="rounded-md border border-border-default p-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-gold-text">
                {labels.finalPrice}
              </p>
              <p className="mt-1.5 text-lg font-bold tabular-nums text-brand-navy-900">
                {finalPrice !== null
                  ? formatAuctionPrice(finalPrice, { currency, locale: localeTags[locale] })
                  : "—"}
              </p>
              <p className="mt-2 text-sm leading-5 text-brand-navy-900/70">
                {role === "seller" ? labels.sellerResult : labels.winnerResult}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-md border border-border-default p-3">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-brand-navy-900" aria-hidden="true" />
              <span className="font-bold text-brand-navy-900">
                {role === "seller" ? labels.buyer : labels.seller}
              </span>
            </div>
            {counterpartKnown && counterpart ? (
              <div className="mt-2 flex flex-col gap-1 text-sm text-brand-navy-900">
                <span className="font-semibold">{counterpart.label}</span>
                <span className="inline-flex items-center gap-2 text-brand-navy-900/70">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {counterpart.phone ?? labels.noPhone}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-brand-navy-900/60">{labels.contactPending}</p>
            )}
          </div>

          <div className="mt-3 rounded-md bg-surface-muted p-3 text-sm font-semibold leading-5 text-brand-navy-900">
            {labels.dealNotice}
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-border-default px-5 font-semibold text-brand-navy-900 hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              {labels.done}
            </button>
            <Link
              href="/dashboard/deals"
              onClick={onClose}
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-brand-navy-900 px-5 font-semibold text-white hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              {labels.openDeals}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
