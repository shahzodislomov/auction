"use client";

import { useContext } from "react";

import { LangSwitch, type Lang } from "@/context/LangSwitch";
import { AppSelect } from "@/components/ui/AppSelect";

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const labels: Record<Lang, string> = {
  uz: "Sahifadagi yozuvlar soni",
  en: "Items per page",
  ru: "Записей на странице",
};

interface PageSizeSelectProps {
  disabled?: boolean;
  onChange: (size: number) => void;
  value: number;
}

export function PageSizeSelect({ disabled = false, onChange, value }: PageSizeSelectProps) {
  const { currentLang } = useContext(LangSwitch);

  return (
    <AppSelect
      aria-label={labels[currentLang]}
      className="w-24 shrink-0"
      disabled={disabled}
      onChange={(nextValue) => onChange(Number(nextValue))}
      options={PAGE_SIZE_OPTIONS.map((size) => ({ label: String(size), value: size }))}
      size="sm"
      value={value}
    />
  );
}
