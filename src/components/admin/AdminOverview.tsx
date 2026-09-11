import {
  ArrowRight,
  CarFront,
  CircleDollarSign,
  Clock3,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";

const metrics = [
  {
    label: "Moderatsiya navbati",
    value: "18",
    delta: "+4 bugun",
    icon: ShieldCheck,
    tone: "warning",
  },
  {
    label: "Faol auksionlar",
    value: "42",
    delta: "8 tasi yakunlanmoqda",
    icon: CarFront,
    tone: "success",
  },
  {
    label: "Foydalanuvchilar",
    value: "8 421",
    delta: "+126 bu oy",
    icon: UsersRound,
    tone: "info",
  },
  {
    label: "Bugungi aylanma",
    value: "4,8 mlrd",
    delta: "UZS",
    icon: CircleDollarSign,
    tone: "neutral",
  },
] as const;

export function AdminOverview() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ delta, icon: Icon, label, tone, value }) => (
          <Surface key={label} className="shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-text-secondary">{label}</p>
                <p className="mt-3 text-3xl font-black text-brand-navy-900">
                  {value}
                </p>
              </div>
              <span className="rounded-lg bg-brand-champagne-500/20 p-2.5 text-brand-gold-text">
                <Icon aria-hidden="true" size={22} />
              </span>
            </div>
            <StatusBadge tone={tone} className="mt-4">
              {delta}
            </StatusBadge>
          </Surface>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,.7fr)]">
        <Surface padding="none" className="overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-gold-text">
                Ustuvor ishlar
              </p>
              <h2 className="mt-1 text-xl font-black">Moderatsiya navbati</h2>
            </div>
            <Link
              href="/admin/moderation"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-gold-text"
            >
              Navbatni ochish <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="divide-y divide-border-default">
            {[
              [
                "Chevrolet Tahoe High Country",
                "Hujjat tekshiruvi",
                "12 daqiqa",
              ],
              ["Zeekr 001 Privilege", "Tasvirlar tekshiruvi", "28 daqiqa"],
              ["BYD Han EV", "Sotuvchi ma’lumoti", "43 daqiqa"],
            ].map(([title, step, time], index) => (
              <div
                key={title}
                className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
              >
                <div>
                  <h3 className="font-extrabold">{title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{step}</p>
                </div>
                <StatusBadge tone={index === 0 ? "warning" : "neutral"}>
                  P{index + 1}
                </StatusBadge>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-text-secondary">
                  <Clock3 aria-hidden="true" size={14} />
                  {time}
                </span>
              </div>
            ))}
          </div>
        </Surface>
        <Surface tone="navy" className="shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-brand-champagne-500">
            Xizmat darajasi
          </p>
          <h2 className="mt-3 text-2xl font-black">94% qarorlar SLA ichida</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Moderatsiya navbatining median ko‘rib chiqish vaqti — 36 daqiqa.
          </p>
          <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[94%] bg-brand-champagne-500" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
            <div>
              <p className="text-2xl font-black">7</p>
              <p className="text-xs text-white/55">SLA yaqinida</p>
            </div>
            <div>
              <p className="text-2xl font-black">0</p>
              <p className="text-xs text-white/55">Kritik</p>
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );
}
