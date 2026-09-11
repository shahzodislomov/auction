"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";

import { VehicleImage } from "@/components/auction/VehicleImage";
import { LangSwitch } from "@/context/LangSwitch";
import type { AuctionImage } from "@/lib/auction/types";
import { translateUiText } from "@/lib/localization/uiText";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SoldVehicleCarousel({
  alt,
  fallbackAlt,
  fallbackImages,
}: {
  alt: string;
  fallbackAlt: string;
  fallbackImages: readonly AuctionImage[];
  vehicleId?: string | null;
}) {
  const { currentLang } = useContext(LangSwitch);
  const images = fallbackImages;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const prevCountRef = useRef(images.length);

  useEffect(() => {
    if (prevCountRef.current === images.length) return;
    setActiveImageIndex(0);
    prevCountRef.current = images.length;
  }, [images.length]);

  useEffect(() => {
    if (carouselPaused || images.length < 2 || prefersReducedMotion()) return;
    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % images.length);
    }, 4_500);
    return () => window.clearInterval(interval);
  }, [carouselPaused, images.length]);

  const visibleImageIndex = images.length ? activeImageIndex % images.length : 0;
  const activeImage = images[visibleImageIndex] ?? null;

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setCarouselPaused(true)}
      onMouseLeave={() => setCarouselPaused(false)}
    >
      <VehicleImage
        image={activeImage}
        alt={alt}
        fallbackAlt={fallbackAlt}
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      {images.length > 1 ? (
        <>
          <button
            aria-label={translateUiText("previousImage", currentLang)}
            className="absolute left-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-navy-900/85 text-white shadow-md transition-opacity hover:bg-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            onClick={() =>
              setActiveImageIndex((current) => (current - 1 + images.length) % images.length)
            }
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={20} />
          </button>
          <button
            aria-label={translateUiText("nextImage", currentLang)}
            className="absolute right-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-navy-900/85 text-white shadow-md transition-opacity hover:bg-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            onClick={() => setActiveImageIndex((current) => (current + 1) % images.length)}
            type="button"
          >
            <ChevronRight aria-hidden="true" size={20} />
          </button>
          <span className="absolute bottom-2 right-2 z-10 rounded-full bg-brand-navy-900/85 px-2 py-0.5 text-xs font-bold text-white">
            {visibleImageIndex + 1} / {images.length}
          </span>
        </>
      ) : null}
    </div>
  );
}
