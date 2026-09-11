import {
  Check,
  Circle,
  FileSignature,
  Handshake,
  Landmark,
  Star,
} from "lucide-react";

import { Surface } from "@/components/ui/Surface";

const steps = [
  {
    label: "Auksion yakunlandi",
    note: "16 iyul, 10:42",
    done: true,
    icon: Check,
  },
  {
    label: "Shartnoma",
    note: "Imzolash kutilmoqda",
    done: false,
    icon: FileSignature,
  },
  { label: "To‘lov", note: "Shartnomadan keyin", done: false, icon: Landmark },
  {
    label: "Topshirish",
    note: "Tomonlar kelishuvi",
    done: false,
    icon: Handshake,
  },
  { label: "Baholash", note: "Bitim yakunlangach", done: false, icon: Star },
] as const;

export function DealTimeline() {
  return (
    <Surface>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-gold-text">
            Bitim #DL-10245
          </p>
          <h2 className="mt-2 text-xl font-extrabold">
            Chevrolet Tahoe High Country
          </h2>
        </div>
        <span className="text-right text-sm font-extrabold">
          846 000 000 UZS
        </span>
      </div>
      <ol className="grid gap-0 md:grid-cols-5">
        {steps.map(({ done, icon: Icon, label, note }, index) => (
          <li
            key={label}
            className="relative flex gap-4 pb-6 md:block md:pb-0 md:pr-4"
          >
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={`absolute left-[17px] top-9 h-[calc(100%-24px)] w-px md:left-9 md:top-[17px] md:h-px md:w-[calc(100%-24px)] ${done ? "bg-semantic-success" : "bg-border-default"}`}
              />
            ) : null}
            <span
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${done ? "border-semantic-success bg-semantic-success text-white" : "border-border-default bg-white text-text-secondary"}`}
            >
              {done ? (
                <Icon aria-hidden="true" size={17} />
              ) : (
                <Circle aria-hidden="true" size={12} />
              )}
            </span>
            <div className="md:mt-4">
              <h3 className="text-sm font-extrabold">{label}</h3>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                {note}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Surface>
  );
}
