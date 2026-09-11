import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Wallet,
  X,
} from "lucide-react";

import { useMyPayments } from "@/queries/payments";
import {
  CabinetUser,
  canonicalAccountId,
  confirmedCurrency,
  formatAmount,
  formatDate,
  missingAccount,
  QuerySnapshot,
  queryState,
  TransactionRecord,
  transactionType,
  useLiveCopy,
} from "./CabinetLiveSections";
import { Surface } from "../ui/Surface";
import { AppSelect } from "../ui/AppSelect";
import { PageSizeSelect } from "../ui/PageSizeSelect";
import { StatusBadge } from "../ui/StatusBadge";
import { StatePanel } from "@/components/feedback/StatePanel";
import { DashboardTableSkeleton } from "@/components/feedback/ContentSkeletons";
import { useContext, useMemo, useState } from "react";
import Link from "next/link";
import { LangSwitch, type Lang } from "@/context/LangSwitch";

type PaymentTone = "success" | "danger" | "neutral";

interface PaymentLabel {
  title: string;
  description: string;
  tone: PaymentTone;
}

const uzPaymentTypeLabels: Record<string, PaymentLabel> = {
  DEPOSIT: {
    title: "Auksion uchun depozit",
    description:
      "Auksionda ishtirok etish uchun hamyoningizdan depozit yechildi.",
    tone: "danger",
  },
  FINAL_PAYMENT: {
    title: "Avtomobil uchun yakuniy to'lov",
    description:
      "Siz auksionda g'olib bo'lganingiz sababli avtomobil narxi hamyoningizdan yechildi.",
    tone: "danger",
  },
  REFUND: {
    title: "Depozit qaytarildi",
    description:
      "Siz auksionda g'olib bo'lmaganingiz uchun depozit hamyoningizga qaytarildi.",
    tone: "success",
  },
  FEE: {
    title: "Xizmat haqi",
    description:
      "Avtomobil muvaffaqiyatli sotilgani uchun xizmat haqi yechildi.",
    tone: "danger",
  },
  PAYMENT: {
    title: "Hisobni to'ldirish",
    description: "Hamyoningizga mablag' qo'shildi.",
    tone: "success",
  },
  SELLER_PAYOUT: {
    title: "Sotuvdan tushgan pul",
    description:
      "Xaridor to'lovidan keyin avtomobil sotuvi summasi hamyoningizga o'tkazildi.",
    tone: "success",
  },
};

const enPaymentTypeLabels: Record<string, PaymentLabel> = {
  DEPOSIT: {
    title: "Auction deposit",
    description: "Deposit deducted from your wallet to participate in the auction.",
    tone: "danger",
  },
  FINAL_PAYMENT: {
    title: "Final payment for vehicle",
    description: "Vehicle price deducted from your wallet after winning the auction.",
    tone: "danger",
  },
  REFUND: {
    title: "Refund",
    description: "Deposit returned to your wallet because you did not win the auction.",
    tone: "success",
  },
  FEE: {
    title: "Service fee",
    description: "Service fee deducted for a successfully sold vehicle.",
    tone: "danger",
  },
  PAYMENT: {
    title: "Refill",
    description: "Funds were added to your wallet.",
    tone: "success",
  },
  SELLER_PAYOUT: {
    title: "Seller payout",
    description:
      "Vehicle sale funds were transferred to your wallet after the buyer payment.",
    tone: "success",
  },
};

const ruPaymentTypeLabels: Record<string, PaymentLabel> = {
  DEPOSIT: {
    title: "Депозит для аукциона",
    description: "Депозит списан с кошелька для участия в аукционе.",
    tone: "danger",
  },
  FINAL_PAYMENT: {
    title: "Окончательный платёж за автомобиль",
    description: "Стоимость автомобиля списана с кошелька после победы в аукционе.",
    tone: "danger",
  },
  REFUND: {
    title: "Депозит возвращён",
    description: "Депозит возвращён на кошелёк, так как вы не выиграли аукцион.",
    tone: "success",
  },
  FEE: {
    title: "Комиссия за услугу",
    description: "Комиссия списана за успешно проданный автомобиль.",
    tone: "danger",
  },
  PAYMENT: {
    title: "Пополнение",
    description: "Средства добавлены на ваш кошелёк.",
    tone: "success",
  },
  SELLER_PAYOUT: {
    title: "Выплата продавцу",
    description:
      "Средства от продажи автомобиля зачислены на ваш кошелёк после оплаты покупателем.",
    tone: "success",
  },
};

function paymentLabels(lang: string): Record<string, PaymentLabel> {
  if (lang === "uz") return uzPaymentTypeLabels;
  if (lang === "ru") return ruPaymentTypeLabels;
  return enPaymentTypeLabels;
}

const paymentStatusLabels: Record<string, Record<string, string>> = {
  uz: {
    SUCCESS: "Muvaffaqiyatli",
    PENDING: "Kutilmoqda",
    FAILED: "Muvaffaqiyatsiz",
    CANCELLED: "Bekor qilingan",
    CANCELED: "Bekor qilingan",
    ACTIVE: "Faol",
  },
  ru: {
    SUCCESS: "Успешно",
    PENDING: "В ожидании",
    FAILED: "Неуспешно",
    CANCELLED: "Отменено",
    CANCELED: "Отменено",
    ACTIVE: "Активно",
  },
  en: {
    SUCCESS: "Successful",
    PENDING: "Pending",
    FAILED: "Failed",
    CANCELLED: "Cancelled",
    CANCELED: "Canceled",
    ACTIVE: "Active",
  },
};

const paymentSectionCopy: Record<Lang, Record<string, string>> = {
  uz: {
    balance: "Balans", income: "Kirim", outgoing: "Chiqimlar", search: "Qidirish...",
    all: "Barchasi", refund: "Qaytarilgan mablag‘", newest: "Eng yangi", oldest: "Eng eski",
    amountDescending: "Narx: yuqoridan pastga", amountAscending: "Narx: pastdan yuqoriga",
    auction: "Auksion", status: "Holat", previousPage: "Oldingi sahifa", nextPage: "Keyingi sahifa",
    close: "Yopish", noResults: "Hech narsa topilmadi", noResultsBody: "Qidiruv yoki filtr sozlamalarini o‘zgartiring.",
  },
  en: {
    balance: "Balance", income: "Income", outgoing: "Expenses", search: "Search...",
    all: "All", refund: "Refund", newest: "Newest", oldest: "Oldest",
    amountDescending: "Amount: high to low", amountAscending: "Amount: low to high",
    auction: "Auction", status: "Status", previousPage: "Previous page", nextPage: "Next page",
    close: "Close", noResults: "Nothing found", noResultsBody: "Change the search or filter settings.",
  },
  ru: {
    balance: "Баланс", income: "Поступления", outgoing: "Расходы", search: "Поиск...",
    all: "Все", refund: "Возврат", newest: "Сначала новые", oldest: "Сначала старые",
    amountDescending: "Сумма: по убыванию", amountAscending: "Сумма: по возрастанию",
    auction: "Аукцион", status: "Статус", previousPage: "Предыдущая страница", nextPage: "Следующая страница",
    close: "Закрыть", noResults: "Ничего не найдено", noResultsBody: "Измените параметры поиска или фильтра.",
  },
};

function enumLabel(value: string, lang: string, map: Record<string, Record<string, string>>) {
  if (!value || value === "—") return "—";
  const normalized = value.toUpperCase();
  return map[lang]?.[normalized] ?? map.en?.[normalized] ?? value;
}

function StatusDot({ tone }: { tone: PaymentTone }) {
  const colors: Record<PaymentTone, string> = {
    success: "bg-emerald-500",
    danger: "bg-red-500",
    neutral: "bg-stone-300",
  };
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${colors[tone]}`}
    />
  );
}

function StatCard({
  title,
  value,
  icon,
  tone = "neutral",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  tone?: PaymentTone;
}) {
  const toneClass: Record<PaymentTone, string> = {
    success: "bg-emerald-50 text-emerald-700",
    danger: "bg-red-50 text-red-700",
    neutral: "bg-brand-champagne-500/20 text-brand-navy-900",
  };

  return (
    <div className="rounded-lg border border-border-default bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-[0.12em] text-text-secondary">
          {title}
        </span>
        <div className={`rounded-md p-2 ${toneClass[tone]}`}>{icon}</div>
      </div>
      <div className="mt-4 text-2xl font-black tabular-nums text-brand-navy-900">
        {value}
      </div>
    </div>
  );
}

function paymentDate(row: TransactionRecord) {
  return row.createdAt ?? row.paidAt ?? row.paymentTime ?? row.transactionTime;
}

function paymentKind(row: TransactionRecord): string {
  const directType = transactionType(
    row.paymentType ?? row.transactionType ?? row.type ?? row.paymentMethod,
  );
  if (directType !== "UNKNOWN") return directType;

  const statusType = transactionType(
    (row as TransactionRecord & { status?: string }).status ?? row.paymentStatus,
  );
  return statusType === "SELLER_PAYOUT" ? statusType : directType;
}

function formatWalletStatAmount(
  amount: number,
  lang: string,
  currency: "USD" | "UZS" = "UZS",
) {
  return `${new Intl.NumberFormat(lang).format(amount)} ${currency}`;
}

export function PaymentsSection({ user }: { user: CabinetUser }) {
  const { copy, currentLang } = useLiveCopy();
  const { currentLang: lang } = useContext(LangSwitch);
  const section = paymentSectionCopy[lang];
  const accountId = canonicalAccountId(user.id);
  const labels = paymentLabels(lang);

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<TransactionRecord | null>(null);

  const query = useMyPayments(accountId, page, pageSize) as unknown as QuerySnapshot;
  const queryData = query.data as
    | { list?: TransactionRecord[]; pages?: number; elements?: number }
    | undefined;
  const rows = useMemo(
    () => (Array.isArray(queryData?.list) ? queryData.list : []),
    [queryData],
  );
  const totalPages = Math.max(1, queryData?.pages ?? 1);

  const filteredRows = useMemo(
    () =>
      [...rows]
        .filter((row) => {
          const type = paymentKind(row);
          const info = labels[type as keyof typeof labels];
          const keyword = search.toLowerCase();
          const matchSearch =
            !keyword ||
            String(row.paymentId ?? "").toLowerCase().includes(keyword) ||
            String(row.auctionId ?? "").toLowerCase().includes(keyword) ||
            info?.title.toLowerCase().includes(keyword);
          const matchType = paymentFilter === "ALL" || type === paymentFilter;
          return matchSearch && matchType;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "OLDEST":
              return new Date(paymentDate(a) ?? "").getTime() - new Date(paymentDate(b) ?? "").getTime();
            case "AMOUNT_ASC":
              return (a.amount ?? 0) - (b.amount ?? 0);
            case "AMOUNT_DESC":
              return (b.amount ?? 0) - (a.amount ?? 0);
            default:
              return new Date(paymentDate(b) ?? "").getTime() - new Date(paymentDate(a) ?? "").getTime();
          }
        }),
    [rows, search, paymentFilter, sortBy, labels],
  );
  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const type = paymentKind(row);
        const amount = Number(row.amount ?? 0);
        if (!Number.isFinite(amount)) return acc;
        if (type === "REFUND" || type === "PAYMENT" || type === "SELLER_PAYOUT") acc.income += amount;
        else acc.outgoing += amount;
        return acc;
      },
      { income: 0, outgoing: 0 },
    );
  }, [rows]);
  const selectedType = selectedPayment
    ? paymentKind(selectedPayment)
    : "";
  const selectedInfo = selectedType ? labels[selectedType as keyof typeof labels] : undefined;
  const selectedCurrency = selectedPayment ? confirmedCurrency(selectedPayment.currency) : null;
  const selectedStatus = selectedPayment
    ? String(
        (selectedPayment as TransactionRecord & { status?: string }).status ??
          selectedPayment.paymentStatus ??
          "—",
      )
    : "—";
  const selectedTypeLabel = selectedInfo?.title ?? enumLabel(selectedType, lang, {
    uz: Object.fromEntries(
      Object.entries(uzPaymentTypeLabels).map(([key, value]) => [key, value.title]),
    ),
    ru: Object.fromEntries(
      Object.entries(ruPaymentTypeLabels).map(([key, value]) => [key, value.title]),
    ),
    en: Object.fromEntries(
      Object.entries(enPaymentTypeLabels).map(([key, value]) => [key, value.title]),
    ),
  });
  const selectedStatusLabel = enumLabel(selectedStatus, lang, paymentStatusLabels);

  if (!accountId) return missingAccount(copy);

  if (query.isLoading) {
    return <DashboardTableSkeleton columns={5} label={copy.loadingTitle} />;
  }

  const state = queryState(query, copy, rows.length === 0, copy.empty.payments);
  if (state) return state;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={section.balance}
          value={formatWalletStatAmount(Number(user.balance ?? 0), currentLang)}
          icon={<Wallet className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title={section.income}
          value={formatWalletStatAmount(totals.income, currentLang)}
          icon={<ArrowDownLeft className="h-5 w-5 text-emerald-600" />}
          tone="success"
        />
        <StatCard
          title={section.outgoing}
          value={formatWalletStatAmount(totals.outgoing, currentLang)}
          icon={<ArrowUpRight className="h-5 w-5 text-red-500" />}
          tone="danger"
        />
      </div>

      {/* Filters */}
      <Surface className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          placeholder={section.search}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="min-h-11 w-full rounded-md border border-border-default bg-white px-4 text-sm outline-none focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25 lg:max-w-xs"
        />
        <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
          <AppSelect
            className="w-full sm:w-48"
            value={paymentFilter}
            onChange={(val) => {
              setPaymentFilter(String(val));
              setPage(0);
            }}
            options={[
              { value: "ALL", label: section.all },
              ...Object.entries(labels).map(([value, label]) => ({ value, label: label.title })),
            ]}
          />
          <AppSelect
            className="w-full sm:w-40"
            value={sortBy}
            onChange={(val) => setSortBy(String(val))}
            options={[
              { value: "NEWEST", label: section.newest },
              { value: "OLDEST", label: section.oldest },
              { value: "AMOUNT_DESC", label: section.amountDescending },
              { value: "AMOUNT_ASC", label: section.amountAscending },
            ]}
          />
        </div>
      </Surface>

      {/* Mobile Card List */}
      <div className="space-y-3 sm:hidden">
        {filteredRows.map((row, index) => {
          const type = paymentKind(row);
          const info = labels[type as keyof typeof labels];
          const currency = confirmedCurrency(row.currency);
          return (
            <Surface
              key={String(row.paymentId ?? row.id ?? index)}
              className="cursor-pointer space-y-2 p-4 transition-colors hover:bg-surface-muted/30"
              onClick={() => setSelectedPayment(row)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusDot tone={info?.tone ?? "neutral"} />
                  <span className="font-bold text-sm truncate">{info?.title ?? type}</span>
                </div>
                <span className="text-xs text-text-secondary shrink-0 font-semibold">
                  #{String(row.paymentId ?? row.id ?? index + 1)}
                </span>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2">{info?.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border-default text-xs">
                <span className="font-extrabold text-sm text-brand-navy-900 tabular-nums">
                  {formatAmount(row.amount, currentLang, currency, copy.currencyUnknown)}
                </span>
                <span className="text-text-secondary">
                  {formatDate(paymentDate(row), currentLang)}
                </span>
              </div>
            </Surface>
          );
        })}
      </div>

      {/* Desktop Table */}
      <Surface className="hidden sm:block overflow-x-auto" padding="none">
        <table
          aria-label={copy.payments}
          className="w-full min-w-[42rem] border-collapse"
        >
          <thead className="bg-surface-muted text-left text-xs font-extrabold uppercase tracking-[0.1em] text-text-secondary">
            <tr>
              <th className="px-5 py-3">{copy.reference}</th>
              <th className="px-5 py-3">{copy.type}</th>
              <th className="px-5 py-3">{copy.amount}</th>
              <th className="px-5 py-3">{section.auction}</th>
              <th className="px-5 py-3">{copy.date}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {filteredRows.map((row, index) => {
              const type = paymentKind(row);
              const info = labels[type as keyof typeof labels];
              const currency = confirmedCurrency(row.currency);
              return (
                <tr
                  key={String(row.paymentId ?? row.id ?? index)}
                  className="cursor-pointer hover:bg-surface-muted/40"
                  onClick={() => setSelectedPayment(row)}
                >
                  <td className="px-5 py-4 font-semibold">
                    {String(row.paymentId ?? row.id ?? index + 1)}
                  </td>
                  <td aria-label={info?.title ?? type} className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <StatusDot tone={info?.tone ?? "neutral"} />
                      <div>
                        <div className="font-semibold">{info?.title ?? type}</div>
                        <div aria-hidden="true" className="mt-1 text-xs text-text-secondary">
                          {info?.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-extrabold tabular-nums">
                    {formatAmount(row.amount, currentLang, currency, copy.currencyUnknown)}
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {row.auctionId ? (
                      <Link
                        href={`/auctions/${row.auctionId}`}
                        className="inline-flex items-center gap-1 font-bold text-brand-navy-900 underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        #{String(row.auctionId)} <ExternalLink aria-hidden="true" size={14} />
                      </Link>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {formatDate(paymentDate(row), currentLang)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Surface>

      {!filteredRows.length ? (
        <StatePanel
          description={section.noResultsBody}
          title={section.noResults}
        />
      ) : null}

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <PageSizeSelect
          disabled={query.isLoading}
          onChange={(size) => { setPageSize(size); setPage(0); }}
          value={pageSize}
        />
        <button
          aria-label={section.previousPage}
          className="rounded-md border border-border-default p-2 text-brand-navy-900 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          type="button"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold text-text-primary">
          {page + 1} / {totalPages}
        </span>
        <button
          aria-label={section.nextPage}
          className="rounded-md border border-border-default p-2 text-brand-navy-900 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          type="button"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {selectedPayment ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy-950/65 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPayment(null);
          }}
          role="presentation"
        >
          <Surface
            aria-modal="true"
            className="my-6 max-h-[calc(100dvh-3rem)] w-full max-w-2xl overflow-y-auto shadow-2xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-gold-text">
                  {copy.payments} #{String(selectedPayment.paymentId ?? selectedPayment.id ?? "—")}
                </p>
                <h2 className="mt-2 text-xl font-black text-brand-navy-900">
                  {selectedInfo?.title ?? selectedType}
                </h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {selectedInfo?.description}
                </p>
              </div>
              <button
                aria-label={section.close}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default text-brand-navy-900 hover:bg-surface-muted"
                onClick={() => setSelectedPayment(null)}
                type="button"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>

            <dl className="mt-5 grid gap-4 border-t border-border-default pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold text-text-secondary">{copy.amount}</dt>
                <dd className="mt-1 text-lg font-black text-brand-navy-900">
                  {formatAmount(selectedPayment.amount, currentLang, selectedCurrency, copy.currencyUnknown)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-text-secondary">{copy.type}</dt>
                <dd className="mt-1">
                  <StatusBadge tone={selectedInfo?.tone === "success" ? "success" : selectedInfo?.tone === "danger" ? "danger" : "neutral"}>
                    {selectedTypeLabel}
                  </StatusBadge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-text-secondary">{copy.date}</dt>
                <dd className="mt-1 text-sm font-bold text-brand-navy-900">
                  {formatDate(paymentDate(selectedPayment), currentLang) || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-text-secondary">{section.auction}</dt>
                <dd className="mt-1 text-sm font-bold text-brand-navy-900">
                  {selectedPayment.auctionId ? (
                    <Link
                      className="inline-flex items-center gap-1 underline"
                      href={`/auctions/${selectedPayment.auctionId}`}
                    >
                      #{String(selectedPayment.auctionId)} <ExternalLink aria-hidden="true" size={14} />
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-text-secondary">{copy.reference}</dt>
                <dd className="mt-1 text-sm font-bold text-brand-navy-900">
                  {String(selectedPayment.paymentId ?? selectedPayment.id ?? "—")}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-text-secondary">{section.status}</dt>
                <dd className="mt-1 text-sm font-bold text-brand-navy-900">
                  {selectedStatusLabel}
                </dd>
              </div>
            </dl>
          </Surface>
        </div>
      ) : null}
    </div>
  );
}
