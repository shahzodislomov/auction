"use client";

import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export interface CarouselSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  href: string;
  actionText: string;
}

const CAROUSEL_SLIDES: readonly CarouselSlide[] = [
  {
    id: "slide-1",
    badge: "Online Auksion",
    title: "O’zbekistonning xohlagan joyidan auksionda qatnashing",
    subtitle: "Respublika bo‘ylab istalgan hududdan qulay va tez auksionda ishtirok eting",
    image: "/carousel/zeekr-suv.jpg",
    alt: "Zeekr uslubidagi zamonaviy premium SUV",
    href: "/auctions",
    actionText: "Auksionlarni ko‘rish",
  },
  {
    id: "slide-2",
    badge: "Tezkor Savdo",
    title: "Tez soting va sotib oling",
    subtitle: "Avtomobilingizni tez sotishingiz va yangi avtomobil sotib olishingiz mumkin",
    image: "/carousel/gelik-suv.jpg",
    alt: "Mercedes G-Class Gelik premium SUV",
    href: "/sell",
    actionText: "Avtomobil sotish",
  },
  {
    id: "slide-3",
    badge: "100% Shaffof",
    title: "Fake akkauntlarsiz haqiqiy auksion",
    subtitle: "Hammasi jonli va haqiqiy xaridorlar bilan",
    image: "/carousel/byd-champion.jpg",
    alt: "BYD Champion zamonaviy avtomobil",
    href: "/auctions",
    actionText: "Jonli savdolar",
  },
  {
    id: "slide-4",
    badge: "Keng Tanlov",
    title: "Eng ommabop avtomobildan premiumgacha",
    subtitle: "Turli toifadagi avtomobillar uchun auksionlar",
    image: "/carousel/cobalt-sedan.jpg",
    alt: "Chevrolet Cobalt ommabop sedan",
    href: "/auctions",
    actionText: "Katalogga o‘tish",
  },
  {
    id: "slide-5",
    badge: "Xavfsiz Depozit",
    title: "% yoki o‘zingiz belgilagan depozit summasi",
    subtitle: "Auksionda ishtirok etish uchun shaffof va kafolatlangan depozit tizimi",
    image: "/carousel/deposit-feature.jpg",
    alt: "Auksion depoziti va moliyaviy kafolatlar",
    href: "/faq",
    actionText: "Qanday ishlaydi?",
  },
];

export function HomeHeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = CAROUSEL_SLIDES.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay handling
  useEffect(() => {
    if (isPaused) return;

    autoPlayTimer.current = setInterval(() => {
      goToNext();
    }, 5500);

    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [isPaused, goToNext]);

  // Touch swipe support
  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setIsPaused(true);
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }

  function handleTouchEnd() {
    if (touchStartX.current === null) return;
    const swipeThreshold = 45;
    if (touchDeltaX.current < -swipeThreshold) {
      goToNext();
    } else if (touchDeltaX.current > swipeThreshold) {
      goToPrev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setIsPaused(false);
  }

  return (
    <section
      aria-label="TezAuksion afzalliklari karuseli"
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative mx-auto w-full max-w-[91.125rem] px-3 pt-3 sm:px-6 sm:pt-4 md:pt-6">
        <div className="relative min-h-[22rem] sm:min-h-[27rem] md:min-h-[30rem] lg:min-h-[32rem] w-full overflow-hidden rounded-2xl md:rounded-3xl bg-brand-navy-950 shadow-[0_12px_36px_rgb(4_18_43_/_0.15)]">
          {/* Slides container */}
          <div
            className="flex h-full w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {CAROUSEL_SLIDES.map((slide, index) => {
              const isCurrent = index === currentIndex;
              return (
                <div
                  key={slide.id}
                  aria-hidden={!isCurrent}
                  className="relative h-full w-full min-w-full max-w-full flex-shrink-0"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      priority={index === 0}
                      className="object-cover object-center brightness-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1400px) 92vw, 1400px"
                    />
                    {/* Light, vivid overlay to keep cars bright and colorful */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 sm:from-black/65 sm:via-black/20 sm:to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent sm:from-black/45 sm:via-black/10" />
                  </div>

                  {/* Slide Content */}
                  <div className="relative z-10 flex min-h-[22rem] sm:min-h-[27rem] md:min-h-[30rem] lg:min-h-[32rem] w-full max-w-full flex-col justify-end p-4 pb-14 sm:p-8 sm:px-12 md:py-12 md:px-20 lg:py-14 lg:px-24">
                    <div className="w-full max-w-2xl">
                      {/* Badge */}
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/50 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-300 backdrop-blur-md shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        {slide.badge}
                      </span>

                      {/* Main Title */}
                      <h2 className="mt-2.5 sm:mt-3 font-display text-xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                        {slide.title}
                      </h2>

                      {/* Subtitle */}
                      <p className="mt-2 max-w-xl text-xs sm:text-base md:text-lg leading-relaxed text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                        {slide.subtitle}
                      </p>

                      {/* Action Button */}
                      <div className="mt-4 sm:mt-6">
                        <Link
                          href={slide.href}
                          className="inline-flex min-h-10 sm:min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-champagne-500 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-extrabold text-brand-navy-950 shadow-md transition-all hover:bg-brand-champagne-600 hover:shadow-lg active:scale-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          <span>{slide.actionText}</span>
                          <ArrowRight aria-hidden="true" size={14} className="sm:size-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Previous / Next Desktop Controls */}
          <button
            type="button"
            aria-label="Oldingi slayd"
            onClick={goToPrev}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-brand-navy-950/60 text-white backdrop-blur-md transition-all hover:bg-brand-navy-950 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Keyingi slayd"
            onClick={goToNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-brand-navy-950/60 text-white backdrop-blur-md transition-all hover:bg-brand-navy-950 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronRight size={22} />
          </button>

          {/* Pagination Indicators (Dots) */}
          <div
            role="tablist"
            aria-label="Karusel slaydlari"
            className="absolute bottom-3.5 right-3.5 sm:bottom-6 sm:right-8 z-20 flex items-center gap-2 rounded-full bg-brand-navy-950/60 px-3 py-1.5 backdrop-blur-md"
          >
            {CAROUSEL_SLIDES.map((slide, index) => {
              const isCurrent = index === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={`${index + 1}-slayd`}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 transition-all duration-300 rounded-full focus-visible:outline-2 focus-visible:outline-brand-champagne-500 ${
                    isCurrent
                      ? "w-6 bg-brand-champagne-500"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
