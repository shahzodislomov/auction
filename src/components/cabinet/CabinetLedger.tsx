"use client";

import { ArrowUpRight, CheckCircle2, Clock3 } from "lucide-react";
import { useContext, useId } from "react";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
import { LangSwitch, type Lang } from "@/context/LangSwitch";

export interface LedgerRow {
  id: string;
  title: string;
  meta: string;
  amount?: string;
  status: string;
  tone?: "neutral" | "success" | "warning" | "info" | "danger";
}

interface LedgerCopy {
  table: string;
  reference: string;
  operation: string;
  amount: string;
  status: string;
  action: string;
  details: (title: string) => string;
}

const messages: Record<Lang, LedgerCopy> = {
  uz: {
    table: "Kabinet operatsiyalari",
    reference: "Raqam",
    operation: "Operatsiya",
    amount: "Qiymat",
    status: "Holat",
    action: "Amal",
    details: (title) => `${title} tafsilotlari`,
  },
  en: {
    table: "Cabinet operations",
    reference: "Reference",
    operation: "Operation",
    amount: "Amount",
    status: "Status",
    action: "Action",
    details: (title) => `Open ${title} details`,
  },
  ru: {
    table: "Операции кабинета",
    reference: "Номер",
    operation: "Операция",
    amount: "Сумма",
    status: "Статус",
    action: "Действие",
    details: (title) => `Открыть детали: ${title}`,
  },
};

function MobileLabel({ children }: { children: string }) {
  return (
    <span
      className="mb-1 block text-[0.6875rem] font-extrabold uppercase tracking-[0.12em] text-text-secondary md:hidden"
    >
      {children}
    </span>
  );
}

export function CabinetLedger({ rows }: { rows: readonly LedgerRow[] }) {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  const tableId = useId();
  const headerIds = {
    reference: `${tableId}-reference`,
    operation: `${tableId}-operation`,
    amount: `${tableId}-amount`,
    status: `${tableId}-status`,
    action: `${tableId}-action`,
  };

  return (
    <Surface padding="none" className="overflow-hidden">
      <table
        aria-label={copy.table}
        className="block w-full border-collapse md:table"
        id={tableId}
      >
        <colgroup className="hidden md:table-column-group">
          <col className="w-[110px]" />
          <col />
          <col className="w-[180px]" />
          <col className="w-[140px]" />
          <col className="w-[68px]" />
        </colgroup>
        <thead className="hidden bg-surface-muted text-left text-xs font-extrabold uppercase tracking-[0.12em] text-text-secondary md:table-header-group">
          <tr>
            <th className="px-5 py-3" id={headerIds.reference} scope="col">
              {copy.reference}
            </th>
            <th className="px-5 py-3" id={headerIds.operation} scope="col">
              {copy.operation}
            </th>
            <th className="px-5 py-3" id={headerIds.amount} scope="col">
              {copy.amount}
            </th>
            <th className="px-5 py-3" id={headerIds.status} scope="col">
              {copy.status}
            </th>
            <th className="px-3 py-3" id={headerIds.action} scope="col">
              <span className="sr-only">{copy.action}</span>
            </th>
          </tr>
        </thead>
        <tbody className="block divide-y divide-border-default md:table-row-group">
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 px-5 py-4 md:table-row md:px-0 md:py-0"
            >
              <td
                className="text-xs font-extrabold uppercase tracking-[0.12em] text-text-secondary md:table-cell md:px-5 md:py-4"
                data-label={copy.reference}
                headers={headerIds.reference}
              >
                <MobileLabel>{copy.reference}</MobileLabel>
                {row.id}
              </td>
              <td
                className="col-span-2 md:table-cell md:px-5 md:py-4"
                data-label={copy.operation}
                headers={headerIds.operation}
              >
                <MobileLabel>{copy.operation}</MobileLabel>
                <p className="font-extrabold text-brand-navy-900">
                  {row.title}
                </p>
                <p className="mt-1 text-sm text-text-secondary">{row.meta}</p>
              </td>
              <td
                className="font-extrabold tabular-nums text-brand-navy-900 md:table-cell md:px-5 md:py-4"
                data-label={copy.amount}
                headers={headerIds.amount}
              >
                <MobileLabel>{copy.amount}</MobileLabel>
                {row.amount ?? "—"}
              </td>
              <td
                className="justify-self-end md:table-cell md:px-5 md:py-4"
                data-label={copy.status}
                headers={headerIds.status}
              >
                <MobileLabel>{copy.status}</MobileLabel>
                <StatusBadge tone={row.tone}>
                  {index === 0 && row.tone === "warning" ? (
                    <Clock3 aria-hidden="true" size={13} />
                  ) : (
                    <CheckCircle2 aria-hidden="true" size={13} />
                  )}
                  {row.status}
                </StatusBadge>
              </td>
              <td headers={headerIds.action} className="col-start-2 row-start-1 justify-self-end md:table-cell md:px-3 md:py-2">
                <button
                  type="button"
                  aria-label={copy.details(row.title)}
                  className="inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-md border border-border-default text-brand-navy-900 transition-colors hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  <ArrowUpRight aria-hidden="true" size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Surface>
  );
}
