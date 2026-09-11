import {
  ArrowRight,
  CarFront,
  CircleDollarSign,
  Gavel,
  Heart,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";

const metrics = [
  {
    label: "Faol takliflar",
    value: "3",
    note: "1 tasi yakunlanmoqda",
    icon: Gavel,
  },
  { label: "Saqlanganlar", value: "12", note: "2 ta yangi narx", icon: Heart },
  {
    label: "Avtomobillar",
    value: "4",
    note: "1 tasi moderatsiyada",
    icon: CarFront,
  },
  {
    label: "Hamyon",
    value: "24,5 mln",
    note: "UZS balans",
    icon: CircleDollarSign,
  },
] as const;

export function CabinetOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ icon: Icon, label, note, value }) => (
          <Surface key={label} className="relative overflow-hidden">
            <div className="absolute right-4 top-4 rounded-full bg-brand-champagne-500/20 p-2 text-brand-gold-text">
              <Icon aria-hidden="true" size={20} />
            </div>
            <p className="pr-12 text-sm font-bold text-text-secondary">
              {label}
            </p>
            <p className="mt-3 text-3xl font-extrabold text-brand-navy-900">
              {value}
            </p>
            <p className="mt-2 text-xs font-semibold text-text-secondary">
              {note}
            </p>
          </Surface>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <Surface padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border-default px-5 py-4 md:px-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-gold-text">
                Jonli nazorat
              </p>
              <h2 className="mt-1 text-xl font-extrabold">Faol auksionlar</h2>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold-text"
              href="/dashboard/bids"
            >
              Barchasi <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="divide-y divide-border-default">
            {[
              [
                "Chevrolet Tahoe High Country",
                "#10245",
                "846 000 000 UZS",
                "02:14:32",
              ],
              [
                "BYD Song Plus Champion",
                "#10261",
                "418 500 000 UZS",
                "18:42:08",
              ],
              ["Kia K5 GT-Line", "#10276", "372 000 000 UZS", "1 kun"],
            ].map(([title, lot, price, time], index) => (
              <Link
                key={lot}
                href={
                  index === 0
                    ? "/auctions/10245/live"
                    : `/auctions/${lot.slice(1)}`
                }
                className="grid gap-3 px-5 py-4 hover:bg-surface-muted md:grid-cols-[1fr_auto_auto] md:items-center md:px-6"
              >
                <div>
                  <p className="font-extrabold text-brand-navy-900">{title}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">
                    Lot {lot}
                  </p>
                </div>
                <p className="text-sm font-extrabold text-brand-navy-900">
                  {price}
                </p>
                <StatusBadge tone={index === 0 ? "warning" : "info"}>
                  {time}
                </StatusBadge>
              </Link>
            ))}
          </div>
        </Surface>

        <Surface tone="navy" className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-brand-champagne-500/20" />
          <TrendingUp
            aria-hidden="true"
            className="text-brand-champagne-500"
            size={28}
          />
          <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-champagne-500">
            Haftalik holat
          </p>
          <h2 className="mt-2 text-2xl font-extrabold">
            Siz 2 ta lotda yetakchisiz
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Takliflar tarixini kuzating va yakunlanayotgan auksionlarga o‘z
            vaqtida qayting.
          </p>
          <Link
            href="/dashboard/bids"
            className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-champagne-500 px-5 text-sm font-extrabold text-brand-navy-950"
          >
            Takliflarni ko‘rish <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </Surface>
      </div>
    </div>
  );
}
