"use client";

import { ArrowDownUp, Eye, MoreHorizontal, Search } from "lucide-react";
import { useContext, useEffect, useId, useMemo, useState, type ReactNode } from "react";

import { StatusBadge, type StatusBadgeTone } from "@/components/ui/StatusBadge";
import { LangSwitch, type Lang } from "@/context/LangSwitch";

export interface OperationalRow {
  id: string;
  primary: string;
  secondary: string;
  value: string;
  status: string;
  tone: StatusBadgeTone;
  additionalStatuses?: ReadonlyArray<{
    label: string;
    tone: StatusBadgeTone;
  }>;
}

interface OperationalCopy {
  search: string;
  sort: string;
  reference: string;
  name: string;
  information: string;
  loading: string;
  value: string;
  status: string;
  action: string;
  actions: (title: string) => string;
  empty: string;
  open: (title: string) => string;
  view: string;
}

const messages: Record<Lang, OperationalCopy> = {
  uz: {
    search: "Jadvaldan qidirish",
    sort: "Saralash",
    reference: "Raqam",
    name: "Nomi",
    information: "Ma’lumot",
    loading: "Ma’lumotlar yuklanmoqda",
    value: "Qiymat",
    status: "Holat",
    action: "Amal",
    actions: (title) => `${title} uchun amallar`,
    empty: "So‘rov bo‘yicha yozuv topilmadi.",
    open: (title) => `${title} tafsilotlarini ochish`,
    view: "Ko‘rish",
  },
  en: {
    search: "Search table",
    sort: "Sort",
    reference: "Reference",
    name: "Name",
    information: "Information",
    loading: "Loading data",
    value: "Value",
    status: "Status",
    action: "Action",
    actions: (title) => `Actions for ${title}`,
    empty: "No record matches this query.",
    open: (title) => `Open ${title} details`,
    view: "View",
  },
  ru: {
    search: "Поиск по таблице",
    sort: "Сортировка",
    reference: "Номер",
    name: "Название",
    information: "Информация",
    loading: "Данные загружаются",
    value: "Значение",
    status: "Статус",
    action: "Действие",
    actions: (title) => `Действия для ${title}`,
    empty: "По запросу ничего не найдено.",
    open: (title) => `Открыть детали: ${title}`,
    view: "Просмотр",
  },
};

function MobileLabel({ children }: { children: string }) {
  return (
    <span className="mb-1 block text-[0.6875rem] font-black uppercase tracking-[0.11em] text-text-secondary lg:hidden">
      {children}
    </span>
  );
}

function SkeletonBar({ className }: { className: string }) {
  return <span className={`block animate-pulse rounded bg-surface-muted motion-reduce:animate-none ${className}`} />;
}

export function OperationalTable({
  actionsDisabled = false,
  disableClientProcessing = false,
  hideInformationColumn = false,
  label,
  loading = false,
  onOpen,
  rows,
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder,
  toolbarControls = null,
}: {
  actionsDisabled?: boolean;
  disableClientProcessing?: boolean;
  hideInformationColumn?: boolean;
  label: string;
  loading?: boolean;
  onOpen: (row: OperationalRow) => void;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  searchPlaceholder?: string;
  rows: readonly OperationalRow[];
  toolbarControls?: ReactNode;
}) {
  const { currentLang } = useContext(LangSwitch);
  const copy = messages[currentLang];
  const tableId = useId();
  const headerIds = {
    reference: `${tableId}-reference`,
    name: `${tableId}-name`,
    information: `${tableId}-information`,
    value: `${tableId}-value`,
    status: `${tableId}-status`,
    action: `${tableId}-action`,
  };
  const [query, setQuery] = useState("");
  const [ascending, setAscending] = useState(true);
  const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);
  const effectiveQuery = searchQuery ?? query;
  const effectiveSearchPlaceholder =
    searchPlaceholder ??
    (currentLang === "uz"
      ? `${label} bo‘yicha qidiring...`
      : currentLang === "ru"
        ? `Поиск: ${label.toLocaleLowerCase()}...`
        : `Search ${label.toLocaleLowerCase()}...`);
  const shouldHideInformationColumn =
    hideInformationColumn ||
    label === "Foydalanuvchi hujjatlari" ||
    label === "User identity documents" ||
    label === "Документы пользователей";
  const filtered = useMemo(
    () =>
      disableClientProcessing
        ? [...rows]
        : rows
            .filter((row) =>
              `${row.id} ${row.primary} ${row.secondary} ${row.value} ${row.status} ${row.additionalStatuses?.map((item) => item.label).join(" ") ?? ""}`
                .toLocaleLowerCase()
                .includes(effectiveQuery.toLocaleLowerCase()),
            )
            .toSorted((a, b) =>
              ascending
                ? a.primary.localeCompare(b.primary)
                : b.primary.localeCompare(a.primary),
            ),
    [ascending, disableClientProcessing, effectiveQuery, rows],
  );

  useEffect(() => {
    const closeMenu = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("[data-operational-menu]")) {
        setOpenMenuRowId(null);
      }
    };
    const closeMenuWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenuRowId(null);
    };

    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeMenuWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeMenuWithEscape);
    };
  }, []);

  const openRow = (row: OperationalRow) => {
    if (actionsDisabled) return;
    setOpenMenuRowId(null);
    onOpen(row);
  };

  return (
    <div>
      {toolbarControls ? (
        <div className="mb-4 flex min-w-0 flex-col gap-3 overflow-hidden px-1">
          {toolbarControls}
        </div>
      ) : null}

      <section className="rounded-lg border border-border-default bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border-default p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full shrink-0 lg:max-w-sm">
          <label className="relative block w-full">
            <span className="sr-only">{copy.search}</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              size={18}
            />
            <input
              value={effectiveQuery}
              onChange={(event) => {
                const value = event.target.value;
                if (onSearchQueryChange) onSearchQueryChange(value);
                else setQuery(value);
              }}
              placeholder={effectiveSearchPlaceholder}
              className="min-h-11 w-full rounded-md border border-border-default bg-surface-canvas pl-10 pr-4 text-sm outline-none focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25"
            />
          </label>
        </div>
        {!disableClientProcessing ? (
          <button
            type="button"
            aria-controls={tableId}
            onClick={() => setAscending((value) => !value)}
            className="inline-flex min-h-11 shrink-0 touch-manipulation items-center justify-center gap-2 rounded-md border border-border-default px-4 text-sm font-extrabold transition-colors hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <ArrowDownUp aria-hidden="true" size={16} /> {copy.sort}
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="border-b border-border-default bg-surface-muted/45 px-5 py-2 text-xs font-bold text-text-secondary" role="status">
          {copy.loading}
        </p>
      ) : null}
      <table
        aria-label={label}
        aria-busy={loading}
        className="block w-full border-collapse lg:table"
        id={tableId}
      >
        <colgroup className="hidden lg:table-column-group">
          <col className="w-[120px]" />
          <col />
          {!shouldHideInformationColumn ? <col className="w-[190px]" /> : null}
          <col className="w-[170px]" />
          <col className="w-[150px]" />
          <col className="w-[68px]" />
        </colgroup>
        <thead className="hidden border-b border-border-default bg-surface-muted text-left text-xs font-black uppercase tracking-[0.11em] text-text-secondary lg:table-header-group">
          <tr>
            <th className="px-5 py-3" id={headerIds.reference} scope="col">
              {copy.reference}
            </th>
            <th
              aria-sort={disableClientProcessing ? undefined : ascending ? "ascending" : "descending"}
              className="px-5 py-3"
              id={headerIds.name}
              scope="col"
            >
              {copy.name}
            </th>
            {!shouldHideInformationColumn ? (
              <th className="px-5 py-3" id={headerIds.information} scope="col">
                {copy.information}
              </th>
            ) : null}
            <th className="px-5 py-3" id={headerIds.value} scope="col">
              {copy.value}
            </th>
            <th className="px-5 py-3" id={headerIds.status} scope="col">
              {copy.status}
            </th>
            <th className="px-3 py-3" id={headerIds.action} scope="col">
              <span className="sr-only">{copy.action}</span>
            </th>
          </tr>
        </thead>
        <tbody className="block divide-y divide-border-default lg:table-row-group">
          {loading ? Array.from({ length: 6 }, (_, index) => (
            <tr
              aria-hidden="true"
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 px-5 py-4 lg:table-row lg:px-0 lg:py-0"
              data-testid="operational-table-skeleton-row"
              key={`skeleton-${index}`}
            >
              <td className="lg:table-cell lg:px-5 lg:py-4"><SkeletonBar className="h-3 w-14" /></td>
              <td className="col-span-2 lg:table-cell lg:px-5 lg:py-4"><SkeletonBar className="h-4 w-36 max-w-full" /></td>
              {!shouldHideInformationColumn ? (
                <td className="col-span-2 lg:table-cell lg:px-5 lg:py-4"><SkeletonBar className="h-3 w-44 max-w-full" /></td>
              ) : null}
              <td className="lg:table-cell lg:px-5 lg:py-4"><SkeletonBar className="h-4 w-24" /></td>
              <td className="justify-self-end lg:table-cell lg:px-5 lg:py-4"><SkeletonBar className="h-7 w-20 rounded-full" /></td>
              <td className="col-start-2 row-start-1 justify-self-end lg:table-cell lg:px-3 lg:py-2"><SkeletonBar className="size-11 rounded-md" /></td>
            </tr>
          )) : filtered.map((row) => (
            <tr
              key={row.id}
              aria-label={copy.open(row.primary)}
              className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-surface-muted/60 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-focus-ring lg:table-row lg:px-0 lg:py-0"
              onClick={() => openRow(row)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openRow(row);
                }
              }}
              tabIndex={actionsDisabled ? -1 : 0}
            >
              <td
                className="text-xs font-black uppercase tracking-[0.1em] text-text-secondary lg:table-cell lg:px-5 lg:py-4"
                data-label={copy.reference}
                headers={headerIds.reference}
              >
                <MobileLabel>{copy.reference}</MobileLabel>
                {row.id}
              </td>
              <td
                className="col-span-2 font-extrabold text-brand-navy-900 lg:table-cell lg:px-5 lg:py-4"
                data-label={copy.name}
                headers={headerIds.name}
              >
                <MobileLabel>{copy.name}</MobileLabel>
                {row.primary}
              </td>
              {!shouldHideInformationColumn ? (
                <td
                  className="col-span-2 text-sm text-text-secondary lg:table-cell lg:px-5 lg:py-4"
                  data-label={copy.information}
                  headers={headerIds.information}
                >
                  <MobileLabel>{copy.information}</MobileLabel>
                  {row.secondary}
                </td>
              ) : null}
              <td
                className="font-extrabold tabular-nums text-brand-navy-900 lg:table-cell lg:px-5 lg:py-4"
                data-label={copy.value}
                headers={headerIds.value}
              >
                <MobileLabel>{copy.value}</MobileLabel>
                {row.value}
              </td>
              <td
                className="justify-self-end lg:table-cell lg:px-5 lg:py-4"
                data-label={copy.status}
                headers={headerIds.status}
              >
                <MobileLabel>{copy.status}</MobileLabel>
                <div className="flex flex-wrap items-center justify-end gap-2 lg:justify-start">
                  <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
                  {row.additionalStatuses?.map((item, index) => (
                    <StatusBadge key={`${item.label}-${index}`} tone={item.tone}>{item.label}</StatusBadge>
                  ))}
                </div>
              </td>
              <td headers={headerIds.action} className="col-start-2 row-start-1 justify-self-end lg:table-cell lg:px-3 lg:py-2">
                <div
                  className="relative"
                  data-operational-menu
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-expanded={openMenuRowId === row.id}
                    aria-haspopup="menu"
                    aria-label={copy.actions(row.primary)}
                    disabled={actionsDisabled}
                    onClick={() => setOpenMenuRowId((current) => current === row.id ? null : row.id)}
                    className="inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-md border border-border-default text-brand-navy-900 transition-colors hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MoreHorizontal aria-hidden="true" size={19} />
                  </button>
                  {openMenuRowId === row.id ? (
                    <div
                      className="absolute right-0 top-full z-30 mt-1 min-w-36 rounded-md border border-border-default bg-white p-1 shadow-lg"
                      role="menu"
                    >
                      <button
                        className="flex min-h-10 w-full items-center gap-2 rounded px-3 text-left text-sm font-bold text-brand-navy-900 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus-ring"
                        onClick={() => openRow(row)}
                        role="menuitem"
                        type="button"
                      >
                        <Eye aria-hidden="true" size={17} />
                        {copy.view}
                      </button>
                    </div>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
          {!loading && filtered.length === 0 ? (
            <tr className="block lg:table-row">
              <td
                className="block px-5 py-12 text-center text-sm text-text-secondary lg:table-cell"
                colSpan={shouldHideInformationColumn ? 5 : 6}
              >
                {copy.empty}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      </section>
    </div>
  );
}
