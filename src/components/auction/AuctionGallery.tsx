"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { VehicleAuction } from "@/lib/auction/types";
import type { ChampagneLocale } from "@/locales/champagne";

const copy = {
  uz: {
    gallery: "Avtomobil galereyasi",
    previous: "Oldingi rasm",
    next: "Keyingi rasm",
    unavailable: "Avtomobil rasmi mavjud emas",
    show: "Rasmni ko‘rsatish",
  },
  ru: {
    gallery: "Галерея автомобиля",
    previous: "Предыдущее изображение",
    next: "Следующее изображение",
    unavailable: "Изображение автомобиля недоступно",
    show: "Показать изображение",
  },
  en: {
    gallery: "Vehicle gallery",
    previous: "Previous image",
    next: "Next image",
    unavailable: "Vehicle image unavailable",
    show: "Show image",
  },
} as const;

const fallbackImage = "/brand.png";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface AuctionGalleryProps {
  auction: VehicleAuction;
  locale: ChampagneLocale;
}

export function AuctionGallery({ auction, locale }: AuctionGalleryProps) {
  const labels = copy[locale];

  const images = auction.images.length > 0 ? auction.images : [
      {
        id: "fallback",
        url: fallbackImage,
        alt: {
          default: labels.unavailable,
          uz: null,
          ru: null,
          en: null,
        },
      },
    ];

  const hasImages = images.length > 0 && images[0].url !== fallbackImage;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const prevCountRef = useRef(images.length);

  // Reset index when images count changes
  useEffect(() => {
    if (prevCountRef.current !== images.length) {
      setActiveImageIndex(0);
      prevCountRef.current = images.length;
    }
  }, [images.length]);

  // Auto-play
  useEffect(() => {
    if (carouselPaused || images.length < 2 || prefersReducedMotion()) return;
    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % images.length);
    }, 4_500);
    return () => window.clearInterval(interval);
  }, [carouselPaused, images.length]);

  const visibleImageIndex = images.length ? activeImageIndex % images.length : 0;
  const activeImage = images[visibleImageIndex];

  const showPreviousImage = () => {
    setActiveImageIndex((current) => (current - 1 + images.length) % images.length);
  };
  const showNextImage = () => {
    setActiveImageIndex((current) => (current + 1) % images.length);
  };

  const title =
    auction.title[locale] ??
    auction.title.default ??
    auction.title.uz ??
    auction.title.ru ??
    auction.title.en ??
    `Auction ${auction.id}`;

  return (
    <section
      aria-label={labels.gallery}
      className="relative min-h-64 overflow-hidden rounded-lg border border-border-default bg-[#f4f1eb]"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCarouselPaused(false);
      }}
      onFocusCapture={() => setCarouselPaused(true)}
      onMouseEnter={() => setCarouselPaused(true)}
      onMouseLeave={() => setCarouselPaused(false)}
    >
      {hasImages && activeImage ? (
        <>
          <div
            aria-label={`${title} · ${labels.gallery} ${visibleImageIndex + 1}`}
            className="min-h-64 bg-contain bg-center bg-no-repeat md:min-h-96"
            key={activeImage.url}
            role="img"
            style={{ backgroundImage: `url(${JSON.stringify(activeImage.url)})` }}
          />
          {images.length > 1 ? (
            <>
              <button
                aria-label={labels.previous}
                className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-navy-900/85 text-white shadow-md transition-colors hover:bg-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                onClick={showPreviousImage}
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={22} />
              </button>
              <button
                aria-label={labels.next}
                className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-navy-900/85 text-white shadow-md transition-colors hover:bg-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                onClick={showNextImage}
                type="button"
              >
                <ChevronRight aria-hidden="true" size={22} />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-brand-navy-900/85 px-3 py-1 text-xs font-bold text-white">
                {visibleImageIndex + 1} / {images.length}
              </span>
            </>
          ) : null}
        </>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center md:min-h-96">
          <p className="text-sm font-bold text-text-secondary">{labels.unavailable}</p>
        </div>
      )}
    </section>
  );
}
