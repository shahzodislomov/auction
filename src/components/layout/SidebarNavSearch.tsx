"use client";

import { Search } from "lucide-react";
import { useContext, useEffect, useRef } from "react";

import { LangSwitch, type Lang } from "@/context/LangSwitch";

const copy: Record<Lang, { clear: string; label: string; placeholder: string }> = {
  uz: { clear: "Menu qidiruvini tozalash", label: "Menu bo‘limlarini qidirish", placeholder: "Qidirish" },
  en: { clear: "Clear menu search", label: "Search menu sections", placeholder: "Search" },
  ru: { clear: "Очистить поиск по меню", label: "Поиск по разделам меню", placeholder: "Поиск" },
};

interface SidebarNavSearchProps {
  compact: boolean;
  onChange: (value: string) => void;
  onRequestExpand: () => void;
  value: string;
}

function isEditableTarget(target: EventTarget | null) {
  const element = target instanceof HTMLElement ? target : null;
  return Boolean(element?.closest("input, textarea, select, [contenteditable='true']"));
}

export function SidebarNavSearch({ compact, onChange, onRequestExpand, value }: SidebarNavSearchProps) {
  const { currentLang } = useContext(LangSwitch);
  const labels = copy[currentLang];
  const inputRef = useRef<HTMLInputElement>(null);
  const focusRequested = useRef(false);

  const requestFocus = () => {
    if (compact) {
      focusRequested.current = true;
      onRequestExpand();
      return;
    }
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (!compact && focusRequested.current) {
      inputRef.current?.focus();
      focusRequested.current = false;
    }
  }, [compact]);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (
        !event?.key ||
        typeof event.key !== "string" ||
        event.key.toLowerCase() !== "s" ||
        !event.shiftKey ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isEditableTarget(event.target)
      ) return;
      event.preventDefault();
      requestFocus();
    };
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  if (compact) {
    return (
      <div className="px-2 py-3">
        <button
          aria-label={`${labels.label} (Shift + S)`}
          className="mx-auto grid size-12 place-items-center rounded-xl border border-white/12 text-white/65 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-brand-champagne-500"
          onClick={requestFocus}
          type="button"
        >
          <Search aria-hidden="true" size={22} />
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 py-3">
      <label className="relative block">
        <span className="sr-only">{labels.label}</span>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/55" size={19} />
        <input
          aria-keyshortcuts="Shift+S"
          className="min-h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] py-2 pl-10 pr-[5.5rem] text-sm font-semibold text-white outline-none transition placeholder:text-white/45 focus:border-brand-champagne-500 focus:ring-2 focus:ring-brand-champagne-500/20"
          onChange={(event) => onChange(event.target.value)}
          placeholder={labels.placeholder}
          ref={inputRef}
          type="search"
          value={value}
        />
        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[10px] font-extrabold text-white/65">
          <kbd className="rounded-md border border-white/10 bg-white/10 px-1.5 py-1">Shift</kbd>
          <span>+</span>
          <kbd className="rounded-md border border-white/10 bg-white/10 px-1.5 py-1">S</kbd>
        </span>
      </label>
    </div>
  );
}
