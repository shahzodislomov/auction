"use client";

import { useState, type ChangeEvent } from "react";
import { FieldInfo } from "./FieldInfo";

export const formatThousands = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export default function MoneyInput({
  error,
  id,
  label,
  name,
  value: externalValue,
  tooltip,
  onChange,
}: {
  error?: string;
  id?: string;
  label: string;
  name: string;
  value?: string;
  tooltip?: string;
  onChange?: (value: string) => void;
}) {
  const [internalValue, setInternalValue] = useState("");
  const field =
    "mt-1 min-h-11 w-full rounded-md border border-border-default bg-white px-3 text-sm outline-none focus:border-brand-navy-700 focus:ring-2 focus:ring-brand-champagne-500/35";
  const errorId = id ? `${id}-error` : undefined;

  const displayValue = externalValue ?? internalValue;

  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-sm font-bold text-text-primary">
        <label htmlFor={id}>{label}</label>
        {tooltip ? <FieldInfo text={tooltip} /> : null}
      </div>
      <input
        aria-describedby={error && errorId ? errorId : undefined}
        aria-invalid={Boolean(error)}
        id={id}
        inputMode="numeric"
        name={name}
        className={`${field} ${error ? "border-semantic-danger" : ""}`}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const formatted = formatThousands(event.target.value);
          setInternalValue(formatted);
          onChange?.(formatted);
        }}
        value={displayValue}
      />
      {error && errorId ? <p className="mt-2 text-sm font-semibold text-semantic-danger" id={errorId}>{error}</p> : null}
    </div>
  );
}
