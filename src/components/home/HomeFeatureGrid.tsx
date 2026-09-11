"use client";

import { ArrowUpRight, CarFront, Gavel, Heart, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface FeatureCardItem {
  id: string;
  href: string;
  titleFallback: string;
  descFallback: string;
  icon: typeof Gavel;
  badge?: string;
  iconColor: string;
  badgeClass: string;
  borderHover: string;
}

const ACTION_CARDS: readonly FeatureCardItem[] = [
  {
    id: "auctions",
    href: "/auctions",
    titleFallback: "Barcha auksionlar",
    descFallback: "Jonli va kutilayotgan savdolar",
    icon: Gavel,
    badge: "Jonli",
    iconColor: "text-blue-600 group-hover:text-blue-700",
    badgeClass: "bg-transparent text-blue-600 border border-blue-300",
    borderHover: "hover:border-blue-400/60",
  },
  {
    id: "sell",
    href: "/sell",
    titleFallback: "Avtomobil sotish",
    descFallback: "Auksion orqali tez va qulay soting",
    icon: CarFront,
    badge: "Tezkor",
    iconColor: "text-emerald-600 group-hover:text-emerald-700",
    badgeClass: "bg-transparent text-emerald-600 border border-emerald-300",
    borderHover: "hover:border-emerald-400/60",
  },
  {
    id: "dashboard",
    href: "/dashboard",
    titleFallback: "Mening savdolarim",
    descFallback: "Shaxsiy kabinet va stavkalar",
    icon: LayoutDashboard,
    iconColor: "text-indigo-600 group-hover:text-indigo-700",
    badgeClass: "bg-transparent text-indigo-600 border border-indigo-300",
    borderHover: "hover:border-indigo-400/60",
  },
  {
    id: "watchlist",
    href: "/dashboard/watchlist",
    titleFallback: "Kuzatuv ro‘yxati",
    descFallback: "Saqlangan avtomobillar",
    icon: Heart,
    iconColor: "text-rose-600 group-hover:text-rose-700",
    badgeClass: "bg-transparent text-rose-600 border border-rose-300",
    borderHover: "hover:border-rose-400/60",
  },
];

export function HomeFeatureGrid() {
  return (
    <section
      aria-label="Asosiy amallar va xizmatlar"
      className="mx-auto w-full max-w-[91.125rem] px-4 pt-4 sm:px-6 sm:pt-6"
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {ACTION_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.id}
              href={card.href}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_4px_16px_rgb(0_0_0_/_0.03)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_26px_rgb(0_0_0_/_0.07)] active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-champagne-500 ${card.borderHover}`}
            >
              {/* Card Header: Pure Line Icon + Badge + Arrow */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex shrink-0 items-center justify-center pt-0.5">
                  <Icon
                    className={`h-6 w-6 sm:h-7 sm:w-7 transition-transform group-hover:scale-110 ${card.iconColor}`}
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  {card.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide sm:text-xs ${card.badgeClass}`}
                    >
                      {card.badge}
                    </span>
                  )}
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary/70 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-navy-900">
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </div>

              {/* Card Body: Title & Description */}
              <div className="mt-4 sm:mt-5">
                <h3 className="text-sm font-extrabold tracking-tight text-brand-navy-900 sm:text-base md:text-lg">
                  {card.titleFallback}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
                  {card.descFallback}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
