import { Braces, Building2, FileSpreadsheet, ReceiptText } from "lucide-react";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";

export function DealerPanel() {
  const tools = [
    {
      icon: FileSpreadsheet,
      title: "Ommaviy import",
      text: "CSV/XLSX shabloni orqali katalog tayyorlash",
    },
    {
      icon: Braces,
      title: "API integratsiyasi",
      text: "Diler tizimi bilan avtomatik sinxronlash",
    },
    {
      icon: ReceiptText,
      title: "Hisobotlar",
      text: "Komissiya va bitimlar bo‘yicha ko‘chirma",
    },
  ];
  return (
    <div className="space-y-6">
      <Surface
        tone="navy"
        className="flex flex-col justify-between gap-6 md:flex-row md:items-center"
      >
        <div>
          <StatusBadge className="bg-brand-champagne-500 text-brand-navy-950">
            Demo
          </StatusBadge>
          <h2 className="mt-4 text-2xl font-extrabold">Diler markazi</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Professional sotuvchilar uchun katalog, jamoa va hisobot
            vositalarining kelajakdagi ko‘rinishi.
          </p>
        </div>
        <Building2
          aria-hidden="true"
          className="shrink-0 text-brand-champagne-500"
          size={52}
        />
      </Surface>
      <div className="grid gap-4 md:grid-cols-3">
        {tools.map(({ icon: Icon, text, title }) => (
          <Surface key={title}>
            <Icon
              aria-hidden="true"
              className="text-brand-gold-text"
              size={28}
            />
            <h3 className="mt-6 text-lg font-extrabold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{text}</p>
            <button
              disabled
              className="mt-6 text-sm font-extrabold text-text-secondary opacity-60"
              type="button"
            >
              Backend ulanishi kutilmoqda
            </button>
          </Surface>
        ))}
      </div>
    </div>
  );
}
