import {
  ArrowRight,
  CirclePlus,
  FileClock,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";

export function VehicleWorkspace() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <Surface
        padding="none"
        className="overflow-hidden md:col-span-2 xl:col-span-1"
      >
        <div className="relative aspect-[16/10] bg-surface-muted">
          <Image
            src="/vehicles/champagne-ledger-featured-suv.png"
            alt="Navy Chevrolet Tahoe"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
          <StatusBadge tone="warning" className="absolute left-4 top-4">
            Moderatsiyada
          </StatusBadge>
        </div>
        <div className="p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-gold-text">
            Lot #10245
          </p>
          <h2 className="mt-2 text-xl font-extrabold">
            Chevrolet Tahoe High Country
          </h2>
          <div className="mt-4 flex items-center justify-between border-t border-border-default pt-4">
            <span className="text-sm font-bold text-text-secondary">
              2024 · 18 400 km
            </span>
            <Link
              href="/dashboard/vehicles/10245"
              aria-label="Chevrolet Tahoe tafsilotlari"
              className="text-brand-gold-text"
            >
              <ArrowRight aria-hidden="true" size={20} />
            </Link>
          </div>
        </div>
      </Surface>

      <Surface className="flex min-h-64 flex-col justify-between border-dashed text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-champagne-500/20 text-brand-gold-text">
          <CirclePlus aria-hidden="true" size={27} />
        </div>
        <div className="mt-5">
          <h2 className="text-lg font-extrabold">Yangi avtomobil</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Ma’lumotlar va rasmlarni bosqichma-bosqich kiriting.
          </p>
        </div>
        <Link
          href="/dashboard/vehicles/new"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-brand-navy-900 px-5 text-sm font-extrabold text-white"
        >
          Avtomobil qo‘shish
        </Link>
      </Surface>

      <Surface className="flex min-h-64 flex-col justify-between">
        <div className="flex items-start justify-between">
          <FileClock
            aria-hidden="true"
            className="text-brand-gold-text"
            size={28}
          />
          <button aria-label="Qoralama menyusi" type="button">
            <MoreHorizontal aria-hidden="true" size={22} />
          </button>
        </div>
        <div className="mt-8">
          <StatusBadge>Qoralama</StatusBadge>
          <h2 className="mt-3 text-lg font-extrabold">BYD Song Plus</h2>
          <p className="mt-2 text-sm text-text-secondary">
            7 / 10 bosqich yakunlangan
          </p>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full w-[70%] rounded-full bg-brand-champagne-600" />
        </div>
      </Surface>
    </div>
  );
}
