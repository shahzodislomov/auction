"use client";

import React, { useContext, useState } from "react";

import { LangSwitch } from "@/context/LangSwitch";
import { translateUiText } from "@/lib/localization/uiText";

export interface FieldInfoProps {
  text?: string;
}

export function FieldInfo({ text }: FieldInfoProps) {
  const { currentLang } = useContext(LangSwitch);
  const [visible, setVisible] = useState(false);

  if (!text) return null;

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={translateUiText("fieldInformation", currentLang)}
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-extrabold font-serif leading-none text-white shadow-sm transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-navy-900 cursor-help"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        i
      </button>

      {visible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-60 -translate-x-1/2 rounded-lg bg-brand-navy-900 px-3 py-2 text-xs font-medium leading-relaxed text-white shadow-xl pointer-events-none transition-all duration-150 ease-out"
        >
          {text}
          <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-brand-navy-900" />
        </div>
      )}
    </div>
  );
}
