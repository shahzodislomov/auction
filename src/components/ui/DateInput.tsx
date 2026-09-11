"use client";

import { useState, type InputHTMLAttributes } from "react";

type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "value"> & {
  onChange: (isoDate: string) => void;
  value: string;
};

function displayDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
}

function maskDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join(".");
}

function isoDate(value: string): string {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!match) return "";
  const [, day, month, year] = match;
  const candidate = `${year}-${month}-${day}`;
  const date = new Date(`${candidate}T00:00:00`);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== Number(year) ||
    date.getMonth() + 1 !== Number(month) ||
    date.getDate() !== Number(day)
  ) return "";
  return candidate;
}

export function DateInput({ max, onChange, value, ...props }: DateInputProps) {
  const [display, setDisplay] = useState(() => displayDate(value));

  return (
    <input
      {...props}
      autoComplete="bday"
      inputMode="numeric"
      maxLength={10}
      pattern="\d{2}\.\d{2}\.\d{4}"
      placeholder="DD.MM.YYYY"
      type="text"
      value={display}
      onChange={(event) => {
        const nextDisplay = maskDate(event.target.value);
        const nextIso = isoDate(nextDisplay);
        setDisplay(nextDisplay);
        onChange(nextIso && (!max || nextIso <= String(max)) ? nextIso : "");
      }}
    />
  );
}
