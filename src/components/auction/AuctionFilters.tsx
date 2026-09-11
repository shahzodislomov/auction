"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useIntl } from "react-intl";
import { ChevronDown, Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { AuctionStatus } from "@/lib/auction/types";

export type AuctionFilterKey =
  | "make"
  | "model"
  | "year"
  | "region"
  | "status";

export interface AuctionFilterState {
  make: string;
  model: string;
  year: string;
  region: string;
  status: string;
  sort: string;
}

export interface AuctionFilterOptions {
  makes: readonly string[];
  models: readonly string[];
  years: readonly number[];
  regions: readonly string[];
}

export interface AuctionFiltersProps {
  filters: AuctionFilterState;
  idPrefix?: string;
  onChange: (key: AuctionFilterKey, value: string) => void;
  onReset: () => void;
  options: AuctionFilterOptions;
}

const statusOptions: readonly AuctionStatus[] = [
  "live",
  "ending-soon",
  "upcoming",
  "sold",
  "ended",
];

/* ---------- Custom Select ---------- */

export interface CustomSelectOption {
  label: string;
  value: string;
}

export interface CustomSelectProps {
  id: string;
  label?: string;
  ariaLabel?: string;
  value: string;
  placeholder: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
}

export function CustomSelect({
  id,
  label,
  ariaLabel,
  value,
  placeholder,
  options,
  onChange,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const allOptions: CustomSelectOption[] = [
    { label: placeholder, value: "" },
    ...options,
  ];

  const selected =
    allOptions.find((option) => option.value === value) ?? allOptions[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    if (!open) {
      const index = allOptions.findIndex((o) => o.value === value);
      setHighlighted(index >= 0 ? index : 0);
    }
    setOpen((prev) => !prev);
  }

  function selectOption(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
  }

  function handleKeyDown(event: ReactKeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        selectOption(allOptions[highlighted].value);
      } else {
        toggleOpen();
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setHighlighted((prev) => Math.min(prev + 1, allOptions.length - 1));
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (open) {
        setHighlighted((prev) => Math.max(prev - 1, 0));
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-brand-navy-900"
        >
          {label}
        </label>
      )}

      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel || label}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className={[
          "flex h-11 sm:h-12 w-full items-center justify-between rounded-xl border-2 bg-surface-primary px-3 sm:px-4",
          "text-sm font-bold text-brand-navy-900 shadow-sm transition-all duration-150 cursor-pointer",
          open
            ? "border-brand-navy-800 ring-2 ring-brand-navy-800/20"
            : "border-brand-champagne-500 hover:border-brand-champagne-600 hover:bg-surface-muted",
        ].join(" ")}
      >
  <span className={[
    "truncate text-left",
    selected.value ? "" : "text-brand-navy-900/60",
  ].join(" ")}>
    {selected.label}
  </span>
  <ChevronDown
    className={[
      "ml-2 h-4 w-4 shrink-0 text-brand-champagne-700 transition-transform duration-200",
      open ? "rotate-180" : "rotate-0",
    ].join(" ")}
  />
</button>

{open && (
  <ul
    id={listboxId}
    role="listbox"
    tabIndex={-1}
    aria-activedescendant={`${id}-option-${highlighted}`}
    className={[
      "absolute z-20 mt-2 w-full overflow-auto rounded-xl border-2 border-brand-champagne-500",
      "max-h-[45vh] sm:max-h-64",
      "bg-surface-primary p-1.5 shadow-lg shadow-brand-navy-900/10",
    ].join(" ")}
  >
    {allOptions.map((option, index) => {
      const isSelected = option.value === selected.value;
      const isKeyboardHighlighted = index === highlighted;

      return (
        <li
          key={option.value || "all"}
          id={`${id}-option-${index}`}
          role="option"
          aria-selected={isSelected}
          onMouseEnter={() => setHighlighted(index)}
          onClick={() => selectOption(option.value)}
          className={[
            "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 sm:py-2",
            "text-sm font-semibold transition-colors duration-100",
            isSelected
              ? "bg-brand-navy-800 text-white"
              : [
                  "text-brand-navy-900",
                  "hover:bg-brand-champagne-500/15",
                  isKeyboardHighlighted ? "bg-brand-champagne-500/15" : "bg-transparent",
                ].join(" "),
          ].join(" ")}
        >
          <span className="truncate">{option.label}</span>
          {isSelected && <Check className="h-4 w-4 shrink-0" />}
        </li>
      );
    })}
  </ul>
)}
      
    </div>
  );
}

/* ---------- Asosiy komponent ---------- */

export function AuctionFilters({
  filters,
  idPrefix = "auction-filter",
  onChange,
  onReset,
  options,
}: AuctionFiltersProps) {
  const intl = useIntl();
  const allLabel = intl.formatMessage({ id: "filter.all" });

  const fields = [
    {
      key: "make" as const,
      label: intl.formatMessage({ id: "filter.make" }),
      values: options.makes,
    },
    {
      key: "model" as const,
      label: intl.formatMessage({ id: "filter.model" }),
      values: options.models,
    },
    {
      key: "year" as const,
      label: intl.formatMessage({ id: "filter.year" }),
      values: options.years.map(String),
    },
    {
      key: "region" as const,
      label: intl.formatMessage({ id: "filter.region" }),
      values: options.regions,
    },
  ];

  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <CustomSelect
          key={field.key}
          id={`${idPrefix}-${field.key}`}
          label={field.label}
          placeholder={allLabel}
          value={filters[field.key]}
          options={field.values.map((v) => ({ label: v, value: v }))}
          onChange={(val) => onChange(field.key, val)}
        />
      ))}

      <CustomSelect
        id={`${idPrefix}-status`}
        label={intl.formatMessage({ id: "filter.status" })}
        placeholder={allLabel}
        value={filters.status}
        options={statusOptions.map((status) => ({
          label: intl.formatMessage({ id: `status.${status}` }),
          value: status,
        }))}
        onChange={(val) => onChange("status", val)}
      />

      <Button variant="outline" fullWidth onClick={onReset}>
        {intl.formatMessage({ id: "filter.reset" })}
      </Button>
    </div>
  );
}