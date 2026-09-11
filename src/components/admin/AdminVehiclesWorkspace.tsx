"use client";

import { Check, ChevronLeft, ChevronRight, ExternalLink, Layers, Sparkles, X, XCircle } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import { OperationalTable, type OperationalRow } from "@/components/admin/OperationalTable";
import { StatePanel } from "@/components/feedback/StatePanel";
import { StatusBadge, type StatusBadgeTone } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
import { PageSizeSelect } from "@/components/ui/PageSizeSelect";
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import useDebounce from "@/hooks/useDebounce";
import { translateBackendValue } from "@/lib/localization/backendEnum";
import { translateUiText } from "@/lib/localization/uiText";
import { type AdminVehicleDocument, useAdminVehicleDocuments, useApproveVehicleDocument, useRejectVehicleDocument } from "@/queries/admin-vehicle-documents";
import { useAdminVehicles, useApproveAdminAuction, useAuction, useAuctions, useRejectAdminAuction, useAuctionFeed, useGetAiFailedVehicles, useGetAiLogs, useRetryAiProcessing } from "@/queries/auction-listings";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";

function normalizePhotoUrl(raw: unknown): string {
  if (!raw) return "";
  let url = "";
  if (typeof raw === "string") {
    url = raw.trim();
  } else if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const candidate = obj.imageUrl ?? obj.url ?? obj.fileUrl ?? obj.path ?? obj.imagePath ?? obj.downloadUrl ?? obj.src;
    if (typeof candidate === "string") {
      url = candidate.trim();
    }
  }
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  return `https://api.tezauksion.uz${url.startsWith("/") ? "" : "/"}${url}`;
}

function extractAllVehicleImages(auction?: AuctionRecord | null, vehicle?: VehicleRecord | null): string[] {
  const candidates: unknown[] = [];

  const addIfArray = (val: unknown) => {
    if (Array.isArray(val)) {
      candidates.push(...val);
    }
  };

  if (auction) {
    addIfArray(auction.lotImageDtoList);
    addIfArray(auction.images);
    addIfArray(auction.imageUrls);
    addIfArray(auction.photos);
    if (auction.image) candidates.push(auction.image);
    if (auction.imageUrl) candidates.push(auction.imageUrl);
    if (auction.mainImage) candidates.push(auction.mainImage);
  }

  if (vehicle) {
    addIfArray(vehicle.imageUrls);
    addIfArray(vehicle.images);
    addIfArray(vehicle.vehicleImages);
    addIfArray(vehicle.lotImageDtoList);
    addIfArray(vehicle.photos);
    if (vehicle.image) candidates.push(vehicle.image);
    if (vehicle.imageUrl) candidates.push(vehicle.imageUrl);
    if (vehicle.mainImage) candidates.push(vehicle.mainImage);
  }

  const seen = new Set<string>();
  const list: string[] = [];
  for (const item of candidates) {
    const norm = normalizePhotoUrl(item);
    if (norm && !seen.has(norm)) {
      seen.add(norm);
      list.push(norm);
    }
  }
  return list;
}

const vehicleReferenceLabel: Record<Lang, string> = { uz: "Ma’lumotnoma", en: "Reference", ru: "Справочник" };
const AUCTION_STATUS_FILTERS = ["DRAFT", "SCHEDULED", "LIVE", "FINISHED", "CANCELED"] as const;
const AUCTION_APPROVAL_STATUS_FILTERS = ["PENDING_REVIEW", "APPROVED", "REJECTED"] as const;
const messages: Record<Lang, Record<string, string>> = {
  uz: { table: "Auksionlar", status: "Vehicle holati", auctionStatus: "Auksion holati", approvalStatus: "Tekshiruv holati", allAuctionStatuses: "Barcha auksion holatlari", allApprovalStatuses: "Barcha tekshiruv holatlari", auction: "Auksion", startPrice: "Boshlang‘ich narx", period: "Savdo vaqti", all: "Barcha holatlar", loading: "Ma’lumotlar yuklanmoqda", error: "Ma’lumotlarni yuklab bo‘lmadi", retry: "Qayta urinish", empty: "Yozuvlar topilmadi", emptyBody: "Tanlangan status bo‘yicha vehicle va auksion mavjud emas.", details: "Vehicle va auksion tafsilotlari", close: "Yopish", seller: "Sotuvchi", vin: "VIN", approve: "Auksionni tasdiqlash", reject: "Auksionni rad etish", reason: "Rad etish sababi", reasonPlaceholder: "Aniq sababni yozing", confirmApprove: "Ushbu auksionni tasdiqlaysizmi?", confirmReject: "Ushbu auksionni rad etasizmi?", cancel: "Bekor qilish", confirm: "Tasdiqlash", success: "Auksion holati yangilandi.", actionError: "Amalni bajarib bo‘lmadi.", page: "Sahifa", unavailable: "Bu auksion allaqachon tekshiruvdan o‘tkazilgan.", draft: "Qoralama", pendingReview: "Tekshiruvda", approved: "Tasdiqlangan", rejected: "Rad etilgan", published: "Nashr qilingan", live: "Jonli auksion", sold: "Sotilgan", archived: "Arxivlangan" },
  en: { table: "Vehicles and auctions", status: "Vehicle status", auctionStatus: "Auction status", approvalStatus: "Review status", allAuctionStatuses: "All auction statuses", allApprovalStatuses: "All review statuses", auction: "Auction", startPrice: "Start price", period: "Auction period", all: "All statuses", loading: "Loading records", error: "Could not load records", retry: "Try again", empty: "No records found", emptyBody: "There are no vehicles and auctions with the selected status.", details: "Vehicle and auction details", close: "Close", seller: "Seller", vin: "VIN", approve: "Approve auction", reject: "Reject auction", reason: "Rejection reason", reasonPlaceholder: "Enter a clear reason", confirmApprove: "Approve this auction?", confirmReject: "Reject this auction?", cancel: "Cancel", confirm: "Confirm", success: "Auction status updated.", actionError: "Could not complete the action.", page: "Page", unavailable: "This auction has already been reviewed.", draft: "Draft", pendingReview: "Pending review", approved: "Approved", rejected: "Rejected", published: "Published", live: "Live auction", sold: "Sold", archived: "Archived" },
  ru: { table: "Аукционы", status: "Статус автомобиля", auctionStatus: "Статус аукциона", approvalStatus: "Статус проверки", allAuctionStatuses: "Все статусы аукциона", allApprovalStatuses: "Все статусы проверки", auction: "Аукцион", startPrice: "Стартовая цена", period: "Период торгов", all: "Все статусы", loading: "Загрузка данных", error: "Не удалось загрузить данные", retry: "Повторить", empty: "Записи не найдены", emptyBody: "Нет автомобилей и аукционов с выбранным статусом.", details: "Детали автомобиля и аукциона", close: "Закрыть", seller: "Продавец", vin: "VIN", approve: "Одобрить аукцион", reject: "Отклонить аукцион", reason: "Причина отказа", reasonPlaceholder: "Укажите точную причину", confirmApprove: "Одобрить этот аукцион?", confirmReject: "Отклонить этот аукцион?", cancel: "Отмена", confirm: "Подтвердить", success: "Статус аукциона обновлён.", actionError: "Не удалось выполнить действие.", page: "Страница", unavailable: "Этот аукцион уже прошёл проверку.", draft: "Черновик", pendingReview: "На проверке", approved: "Одобрен", rejected: "Отклонён", published: "Опубликован", live: "Активный аукцион", sold: "Продан", archived: "Архивирован" },
};
const detailMessages: Record<Lang, Record<string, string>> = {
  uz: { vehicleInfo: "Avtomobil", auctionInfo: "Auksion", documentsInfo: "Avtomobil hujjatlari", photos: "Rasmlar", makeModel: "Marka va model", year: "Yil", mileage: "Yurgan masofa", engine: "Dvigatel hajmi", fuel: "Yoqilg‘i", transmission: "Uzatmalar qutisi", drivetrain: "Uzatma turi", body: "Kuzov", condition: "Holati", color: "Rang", region: "Hudud", description: "Tavsif", reservePrice: "Rezerv narx", currentPrice: "Joriy narx", increment: "Qadam", deposit: "Depozit", start: "Boshlanish", end: "Tugash", documentType: "Hujjat turi", documentStatus: "Hujjat holati", viewFile: "Faylni ko‘rish", noDocuments: "Bu avtomobil uchun hujjatlar topilmadi", approveDocument: "Hujjatni tasdiqlash", rejectDocument: "Hujjatni rad etish", documentSuccess: "Hujjat holati yangilandi." },
  en: { vehicleInfo: "Vehicle", auctionInfo: "Auction", documentsInfo: "Vehicle documents", photos: "Photos", makeModel: "Make and model", year: "Year", mileage: "Mileage", engine: "Engine volume", fuel: "Fuel", transmission: "Transmission", drivetrain: "Drivetrain", body: "Body type", condition: "Condition", color: "Color", region: "Region", description: "Description", reservePrice: "Reserve price", currentPrice: "Current price", increment: "Increment", deposit: "Deposit", start: "Start", end: "End", documentType: "Document type", documentStatus: "Document status", viewFile: "View file", noDocuments: "No documents were found for this vehicle", approveDocument: "Approve document", rejectDocument: "Reject document", documentSuccess: "Document status updated." },
  ru: { vehicleInfo: "Автомобиль", auctionInfo: "Аукцион", documentsInfo: "Документы автомобиля", photos: "Фотографии", makeModel: "Марка и модель", year: "Год", mileage: "Пробег", engine: "Объём двигателя", fuel: "Топливо", transmission: "Коробка передач", drivetrain: "Привод", body: "Кузов", condition: "Состояние", color: "Цвет", region: "Регион", description: "Описание", reservePrice: "Резервная цена", currentPrice: "Текущая цена", increment: "Шаг", deposit: "Депозит", start: "Начало", end: "Окончание", documentType: "Тип документа", documentStatus: "Статус документа", viewFile: "Открыть файл", noDocuments: "Документы для этого автомобиля не найдены", approveDocument: "Одобрить документ", rejectDocument: "Отклонить документ", documentSuccess: "Статус документа обновлён." },
};
type VehicleRecord = Record<string, unknown>;
type AuctionRecord = Record<string, unknown>;
interface AdminMutation { isPending: boolean; mutateAsync: (variables: unknown) => Promise<unknown> }
const auctionTone: Record<string, StatusBadgeTone> = {
  DRAFT: "neutral",
  SCHEDULED: "info",
  LIVE: "success",
  FINISHED: "success",
  CANCELED: "danger",
};
const approvalTone: Record<string, StatusBadgeTone> = { PENDING_REVIEW: "warning", APPROVED: "success", REJECTED: "danger" };
const text = (record: VehicleRecord, keys: string[]) => { for (const key of keys) { const value = record[key]; if (typeof value === "string" || typeof value === "number") return String(value); } return ""; };
const idOf = (record: VehicleRecord) => text(record, ["vehicleId", "id"]);
const titleOf = (record: VehicleRecord, vehicleLabel = "Vehicle") => [text(record, ["makeName", "make"]), text(record, ["modelName", "model"]), text(record, ["year"])].filter(Boolean).join(" ") || `${vehicleLabel} #${idOf(record)}`;
const auctionVehicleId = (record: AuctionRecord) => {
  const direct = text(record, ["vehicleId"]);
  if (direct) return direct;
  const vehicle = record.vehicle;
  return vehicle && typeof vehicle === "object" ? text(vehicle as VehicleRecord, ["vehicleId", "id"]) : "";
};
const formatDate = (value: string) => value && !Number.isNaN(Date.parse(value)) ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const formatMoney = (record?: AuctionRecord) => {
  if (!record) return "—";
  const value = Number(record.startPrice);
  if (!Number.isFinite(value)) return "—";
  return `${new Intl.NumberFormat().format(value)} ${text(record, ["currency"]) || "UZS"}`;
};
const documentIdOf = (doc: AdminVehicleDocument) => doc.documentId ?? doc.docId ?? doc.id;
const documentVehicleId = (doc: AdminVehicleDocument) => String(doc.vehicleId ?? doc.vehicle?.vehicleId ?? "");
const documentUrl = (doc: AdminVehicleDocument) => doc.fileUrl ?? doc.downloadUrl ?? doc.url;
const translateStatus = (raw: string, lang: Lang): string => translateBackendValue(raw, lang, raw);
const approvalStatusOf = (record: AuctionRecord) => text(record, ["approvalStatus", "auctionApprovalStatus"]).toUpperCase();

function adminVehicleItems(value: unknown): VehicleRecord[] {
  if (Array.isArray(value)) return value as VehicleRecord[];
  if (value && typeof value === "object") {
    const record = value as { items?: unknown; meta?: { list?: unknown } };
    if (Array.isArray(record.items)) return record.items as VehicleRecord[];
    if (Array.isArray(record.meta?.list)) return record.meta.list as VehicleRecord[];
  }
  return [];
}

function adminVehicleMeta(value: unknown): { pages: number; elements: number } {
  const fallback = { pages: 1, elements: 0 };
  if (!value || typeof value !== "object") return fallback;
  const record = value as { meta?: { pages?: unknown; totalPages?: unknown; elements?: unknown; totalElements?: unknown } };
  const pages = Number(record.meta?.pages ?? record.meta?.totalPages ?? 1);
  const elements = Number(record.meta?.elements ?? record.meta?.totalElements ?? 0);
  return {
    pages: Number.isFinite(pages) && pages > 0 ? pages : 1,
    elements: Number.isFinite(elements) && elements >= 0 ? elements : 0,
  };
}

export function AdminVehiclesWorkspace() {
  const { currentLang } = useContext(LangSwitch); const t = messages[currentLang];
  const details = detailMessages[currentLang];
  const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(10); const [searchQuery, setSearchQuery] = useState(""); const [selectedId, setSelectedId] = useState(""); const [activeTab, setActiveTab] = useState<"vehicle" | "auction" | "documents" | "aiLogs">("vehicle"); const [reason, setReason] = useState(""); const [documentDecision, setDocumentDecision] = useState<{ id: string | number; type: "approve" | "reject" } | null>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [feedback, setFeedback] = useState<"document-success" | "error" | "">("");
  const [showAiFailedOnly, setShowAiFailedOnly] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 350);
  const query = useAdminVehicles({ page, size: pageSize, search: debouncedSearchQuery }); const auctionsQuery = useAuctions({ page: 0, size: 100 }); const documentsQuery = useAdminVehicleDocuments(0, 100, ""); const aiFailedQuery = useGetAiFailedVehicles(); const aiLogsQuery = useGetAiLogs(activeTab === "aiLogs" ? selectedId : null); const retryAi = useRetryAiProcessing() as any; const approveDocument = useApproveVehicleDocument(); const rejectDocument = useRejectVehicleDocument(); const pending = approveDocument.isPending || rejectDocument.isPending;
  const auctionByVehicle = useMemo(() => new Map(((auctionsQuery.data ?? []) as AuctionRecord[]).map((auction) => [auctionVehicleId(auction), auction])), [auctionsQuery.data]);
  const records = useMemo(() => {
    if (showAiFailedOnly && aiFailedQuery.data) return adminVehicleItems(aiFailedQuery.data);
    return adminVehicleItems(query.data);
  }, [query.data, aiFailedQuery.data, showAiFailedOnly]);
  const selected = records.find((record) => idOf(record) === selectedId); const selectedAuction = selected ? auctionByVehicle.get(idOf(selected)) : undefined;
  const vehicleMeta = adminVehicleMeta(query.data);
  const totalPages = vehicleMeta.pages;
  const selectedDocuments = useMemo(() => (documentsQuery.data?.list ?? []).filter((doc) => documentVehicleId(doc) === selectedId), [documentsQuery.data, selectedId]);
  const rows = useMemo<OperationalRow[]>(() => records.map((record) => { const auction = auctionByVehicle.get(idOf(record)); const auctionStatus = auction ? text(auction, ["status"]).toUpperCase() : ""; const approvalStatus = auction ? approvalStatusOf(auction) : ""; return { id: `#${idOf(record)}`, primary: titleOf(record, details.vehicleInfo), secondary: [text(record, ["vin"]), text(record, ["region"]), auction ? `${t.auction} #${text(auction, ["auctionId", "id"])}` : `${t.auction}: —`].filter(Boolean).join(" · ") || "—", value: formatMoney(auction), vin: text(record, ["vin"]), status: vehicleReferenceLabel[currentLang], tone: "info", additionalStatuses: [auctionStatus ? { label: translateStatus(auctionStatus, currentLang), tone: auctionTone[auctionStatus] ?? "neutral" } : null, approvalStatus ? { label: translateStatus(approvalStatus, currentLang), tone: approvalTone[approvalStatus] ?? "neutral" } : null].filter((item): item is { label: string; tone: StatusBadgeTone } => item !== null) }; }), [auctionByVehicle, currentLang, details.vehicleInfo, records, t]);
  const confirmDocument = async () => { if (!documentDecision || (documentDecision.type === "reject" && !reason.trim())) return; setFeedback(""); try { if (documentDecision.type === "approve") await approveDocument.mutateAsync(documentDecision.id); else await rejectDocument.mutateAsync({ docId: documentDecision.id, reason }); setFeedback("document-success"); setDocumentDecision(null); setReason(""); } catch { setFeedback("error"); } };
  const vehicleDetails = selected ? [
    [details.makeModel, titleOf(selected, details.vehicleInfo)], [details.year, text(selected, ["year"])], [details.mileage, text(selected, ["mileage"]) && `${text(selected, ["mileage"])} km`], [details.engine, text(selected, ["engineVolume"])],
    [details.fuel, translateBackendValue(text(selected, ["fuelType"]), currentLang)], [details.transmission, translateBackendValue(text(selected, ["transmission"]), currentLang)], [details.drivetrain, translateBackendValue(text(selected, ["drivetrain"]), currentLang)], [details.body, translateBackendValue(text(selected, ["bodyType"]), currentLang)],
    [details.condition, translateBackendValue(text(selected, ["conditionGrade", "condition"]), currentLang)], [details.color, text(selected, ["color"])], [details.region, text(selected, ["region"])], [t.vin, text(selected, ["vin"])],
    [t.seller, text(selected, ["sellerId", "ownerId", "userId"]) && `#${text(selected, ["sellerId", "ownerId", "userId"])}`], [details.description, text(selected, ["description"])],
  ] : [];
  const auctionDetails = selectedAuction ? [
    [t.auction, `#${text(selectedAuction, ["auctionId", "id"]) || "—"}`], [t.auctionStatus, translateStatus(text(selectedAuction, ["status"]).toUpperCase(), currentLang)], [t.approvalStatus, translateStatus(approvalStatusOf(selectedAuction), currentLang)], [t.startPrice, formatMoney(selectedAuction)],
    [details.reservePrice, text(selectedAuction, ["reservePrice"]) ? `${new Intl.NumberFormat().format(Number(selectedAuction.reservePrice))} ${text(selectedAuction, ["currency"]) || "UZS"}` : ""],
    [details.currentPrice, text(selectedAuction, ["currentPrice"]) ? `${new Intl.NumberFormat().format(Number(selectedAuction.currentPrice))} ${text(selectedAuction, ["currency"]) || "UZS"}` : ""],
    [details.increment, text(selectedAuction, ["incrementValue"]) ? `${text(selectedAuction, ["incrementValue"])} ${text(selectedAuction, ["incrementType"]) === "PERCENTAGE" ? "%" : text(selectedAuction, ["currency"]) || "UZS"}` : ""],
    [details.deposit, text(selectedAuction, ["depositPercent"]) ? `${text(selectedAuction, ["depositPercent"])}%` : ""], [details.start, formatDate(text(selectedAuction, ["startTime"]))], [details.end, formatDate(text(selectedAuction, ["endTime"]))],
  ] : [];

  const close = () => { setSelectedId(""); setDocumentDecision(null); setReason(""); setLightbox(null); };
  const tabs = [
    ["vehicle", details.vehicleInfo],
    ["auction", details.auctionInfo],
    ["documents", `${details.documentsInfo} (${selectedDocuments.length})`],
    ["aiLogs", "AI Logs"],
  ] as const;

  return <div className="space-y-4">
    {feedback ? <StatusBadge tone={feedback === "error" ? "danger" : "success"}>{feedback === "document-success" ? details.documentSuccess : t.actionError}</StatusBadge> : null}
    <div className="flex gap-2">
      <button className={`px-4 py-2 text-sm font-bold rounded-md ${!showAiFailedOnly ? 'bg-brand-navy-900 text-white' : 'bg-surface-muted text-text-secondary'}`} onClick={() => { setShowAiFailedOnly(false); setPage(0); }}>Barcha avtomobillar</button>
      <button className={`px-4 py-2 text-sm font-bold rounded-md ${showAiFailedOnly ? 'bg-semantic-danger text-white' : 'bg-surface-muted text-text-secondary'}`} onClick={() => { setShowAiFailedOnly(true); setPage(0); }}>AI Xatolar (Failed)</button>
    </div>
    {query.isError || auctionsQuery.isError || documentsQuery.isError || aiFailedQuery.isError ? <StatePanel title={t.error} action={<button className="rounded-md bg-brand-navy-900 px-4 py-2 text-sm font-bold text-white" onClick={() => { void query.refetch(); void auctionsQuery.refetch(); void documentsQuery.refetch(); void aiFailedQuery.refetch(); }}>{t.retry}</button>} /> : <OperationalTable actionsDisabled={pending} disableClientProcessing label={t.table} loading={query.isLoading || auctionsQuery.isLoading || documentsQuery.isLoading || aiFailedQuery.isLoading} onSearchQueryChange={(value) => { setSearchQuery(value); setPage(0); }} rows={rows} searchQuery={searchQuery} onOpen={(row) => { setSelectedId(row.id.replace(/^#/, "")); setActiveTab("vehicle"); setDocumentDecision(null); }} />}
    {records.length && !showAiFailedOnly ? <div className="flex flex-wrap items-center justify-end gap-3"><PageSizeSelect disabled={query.isLoading} value={pageSize} onChange={(size) => { setPageSize(size); setPage(0); }} /><button aria-label={translateUiText("previousPage", currentLang)} className="rounded-md border p-2 disabled:opacity-40" disabled={!page} onClick={() => setPage(page - 1)}><ChevronLeft /></button><span className="text-sm font-bold">{t.page} {page + 1} / {totalPages}</span><button aria-label={translateUiText("nextPage", currentLang)} className="rounded-md border p-2 disabled:opacity-40" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight /></button></div> : null}
    {selected ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy-950/65 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) close(); }} role="presentation">
      <Surface aria-modal="true" className="my-6 w-full max-w-5xl shadow-2xl" role="dialog">
        <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-brand-gold-text">{t.details}</p><h2 className="mt-2 text-xl font-black">{titleOf(selected, details.vehicleInfo)}</h2></div><button aria-label={t.close} className="grid min-h-11 min-w-11 place-items-center rounded-md border" disabled={pending} onClick={close}><X size={18} /></button></div>
        <div className="mt-5 flex gap-6 overflow-x-auto border-y border-border-default pt-3" role="tablist">{tabs.map(([key, label]) => <button aria-selected={activeTab === key} className={`-mb-px min-h-11 shrink-0 border-b-2 px-1 text-sm font-extrabold transition-colors ${activeTab === key ? "border-brand-navy-900 text-brand-navy-900" : "border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary"}`} key={key} onClick={() => { setActiveTab(key); setDocumentDecision(null); setReason(""); }} role="tab" type="button">{label}</button>)}</div>
        {activeTab === "vehicle" ? <section className="mt-5" role="tabpanel">{(() => { const vehicleImages = selected ? extractAllVehicleImages(null, selected) : []; return <div className="space-y-6">{vehicleImages.length > 0 ? <div><h3 className="mb-3 text-sm font-bold text-text-primary">{details.photos}</h3><div className="flex gap-3 overflow-x-auto pb-2">{vehicleImages.map((img, idx) => <img alt="Vehicle" className="h-32 w-48 shrink-0 cursor-pointer rounded-md border border-border-default object-cover hover:opacity-80 transition-opacity" key={idx} src={img} onClick={() => setLightbox({ images: vehicleImages, index: idx })} />)}</div></div> : null}<dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{vehicleDetails.map(([label, value]) => <div className="rounded-md bg-surface-muted p-3" key={label}><dt className="text-xs font-bold text-text-secondary">{label}</dt><dd className="mt-1 break-words text-sm font-bold">{value || "—"}</dd></div>)}</dl></div>; })()}</section> : null}
        {activeTab === "auction" ? <section className="mt-5" role="tabpanel">{selectedAuction ? <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{auctionDetails.map(([label, value]) => <div className="rounded-md bg-brand-champagne-50 p-3" key={label}><dt className="text-xs font-bold text-text-secondary">{label}</dt><dd className="mt-1 break-words text-sm font-bold">{value || "—"}</dd></div>)}</dl> : <p className="text-sm text-text-secondary">—</p>}</section> : null}
        {activeTab === "documents" ? <section className="mt-5 space-y-3" role="tabpanel">{selectedDocuments.length ? selectedDocuments.map((doc) => { const docId = documentIdOf(doc); const url = documentUrl(doc); return <div className="rounded-md border border-border-default p-4" key={String(docId)}><div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center"><div><p className="text-xs font-bold text-text-secondary">{details.documentType}</p><p className="mt-1 font-extrabold">{translateBackendValue(doc.docType, currentLang)}</p></div><div><p className="text-xs font-bold text-text-secondary">{details.documentStatus}</p><StatusBadge className="mt-1" tone={doc.status === "APPROVED" ? "success" : doc.status === "REJECTED" ? "danger" : "warning"}>{translateBackendValue(doc.status ?? "PENDING", currentLang)}</StatusBadge></div>{url ? <a className="inline-flex min-h-11 items-center gap-2 font-bold underline" href={url} rel="noreferrer" target="_blank">{details.viewFile}<ExternalLink size={16} /></a> : null}</div>{(!doc.status || doc.status === "PENDING") && docId != null ? <div className="mt-4 flex gap-2 border-t pt-4"><button className="rounded-md bg-semantic-success px-4 py-2 text-sm font-bold text-white" disabled={pending} onClick={() => { setDocumentDecision({ id: docId, type: "approve" }); setReason(""); }}>{details.approveDocument}</button><button className="rounded-md bg-semantic-danger px-4 py-2 text-sm font-bold text-white" disabled={pending} onClick={() => { setDocumentDecision({ id: docId, type: "reject" }); setReason(""); }}>{details.rejectDocument}</button></div> : null}</div>; }) : <p className="rounded-md bg-surface-muted p-4 text-sm text-text-secondary">{details.noDocuments}</p>}</section> : null}
        {activeTab === "aiLogs" ? <section className="mt-5" role="tabpanel">
          {aiLogsQuery.isLoading ? <p className="text-sm font-bold">{t.loading}</p> : null}
          {aiLogsQuery.isError ? <p className="text-sm text-semantic-danger font-bold">{t.error}</p> : null}
          {aiLogsQuery.data && !aiLogsQuery.isLoading ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-surface-muted p-3 rounded-md">
                <h3 className="font-bold text-sm">AI ishlov berish loglari</h3>
                <button className="rounded-md bg-brand-navy-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50" disabled={retryAi.isPending} onClick={async () => { try { await retryAi.mutateAsync(selectedId); void aiLogsQuery.refetch(); } catch (e) { } }}>{t.retry} AI</button>
              </div>
              {aiLogsQuery.data.length > 0 ? (
                <ul className="space-y-2">
                  {aiLogsQuery.data.map((log: any, i: number) => (
                    <li key={i} className="rounded-md border border-border-default p-3 text-xs overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{typeof log === 'string' ? log : JSON.stringify(log, null, 2)}</pre>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary">{t.empty}</p>
              )}
            </div>
          ) : null}
        </section> : null}
        <AdminConfirmModal
          isOpen={Boolean(documentDecision)}
          type={documentDecision?.type ?? "approve"}
          title={documentDecision?.type === "approve" ? details.approveDocument : details.rejectDocument}
          reason={reason}
          onReasonChange={setReason}
          reasonLabel={t.reason}
          reasonPlaceholder={t.reasonPlaceholder}
          cancelLabel={t.cancel}
          confirmLabel={t.confirm}
          pending={pending}
          onConfirm={() => void confirmDocument()}
          onCancel={() => { setDocumentDecision(null); setReason(""); }}
        />
      </Surface>
    </div> : null}
    {lightbox ? <LightboxModal images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} /> : null}
  </div>;
}

export function AdminAuctionsWorkspace() {
  const { currentLang } = useContext(LangSwitch);
  const t = messages[currentLang];
  const details = detailMessages[currentLang];
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [activeTab, setActiveTab] = useState<"auction" | "vehicle" | "documents">("auction");
  const [operation, setOperation] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<"success" | "error" | "">("");
  const [documentDecision, setDocumentDecision] = useState<{ id: string | number; type: "approve" | "reject" } | null>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [documentFeedback, setDocumentFeedback] = useState<"document-success" | "error" | "">("");
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 350);
  const query = useAuctionFeed({
    approvalStatus: approvalStatus || undefined,
    page,
    search: debouncedSearchQuery,
    size: pageSize,
    status: status || undefined,
  });
  const singleAuctionQuery = useAuction(selectedId);
  const approve = useApproveAdminAuction() as unknown as AdminMutation;
  const reject = useRejectAdminAuction() as unknown as AdminMutation;
  const approveDocument = useApproveVehicleDocument();
  const rejectDocument = useRejectVehicleDocument();
  const pending = approve.isPending || reject.isPending || approveDocument.isPending || rejectDocument.isPending;
  const records = useMemo(() => (query.data?.items ?? []) as AuctionRecord[], [query.data]);
  const totalPages = query.data?.meta?.pages ?? 1;
  const selectedAuctionFromList = records.find((record) => text(record, ["auctionId", "id"]) === selectedId);
  const singleAuction = singleAuctionQuery.data as AuctionRecord | undefined;
  const selectedAuction = useMemo(() => {
    if (!selectedAuctionFromList && !singleAuction) return undefined;
    return {
      ...(selectedAuctionFromList ?? {}),
      ...(singleAuction ?? {}),
    } as AuctionRecord;
  }, [selectedAuctionFromList, singleAuction]);

  const selectedVehicle = useMemo(() => {
    const fromSingle = singleAuction?.vehicle;
    if (fromSingle && typeof fromSingle === "object") return fromSingle as VehicleRecord;
    const fromList = selectedAuctionFromList?.vehicle;
    if (fromList && typeof fromList === "object") return fromList as VehicleRecord;
    return null;
  }, [singleAuction, selectedAuctionFromList]);

  const selectedVehicleId = selectedVehicle ? idOf(selectedVehicle) : "";
  const selectedApprovalStatus = selectedAuction ? approvalStatusOf(selectedAuction) : "";
  // Admin can approve/reject any auction still in PENDING_REVIEW state regardless of lifecycle status
  const canModerate = Boolean(selectedId) && selectedApprovalStatus === "PENDING_REVIEW";
  const documentsQuery = useAdminVehicleDocuments(0, 100, "");
  const selectedDocuments = (documentsQuery.data?.list ?? []).filter((doc) => documentVehicleId(doc) === selectedVehicleId);
  const rows = useMemo<OperationalRow[]>(
    () =>
      records.map((auction) => {
        const auctionId = text(auction, ["auctionId", "id"]);
        const rawStatus = text(auction, ["status"]).toUpperCase();
        const vehicle = auction.vehicle && typeof auction.vehicle === "object" ? auction.vehicle as VehicleRecord : {};
        const title = titleOf(vehicle, details.vehicleInfo);

        return {
          id: `#${auctionId}`,
          primary: title,
          secondary: [
            auctionId ? `${t.auction} #${auctionId}` : t.auction,
            [formatDate(text(auction, ["startTime"])), formatDate(text(auction, ["endTime"]))].filter((item) => item !== "—").join(" → "),
          ].filter(Boolean).join(" · ") || "—",
          value: formatMoney(auction),
          status: translateStatus(rawStatus, currentLang),
          tone: auctionTone[rawStatus] ?? "neutral",
        };
      }),
    [currentLang, details.vehicleInfo, records, t],
  );

  const vehicleDetails = selectedVehicle ? [
    [details.makeModel, titleOf(selectedVehicle, details.vehicleInfo)], [details.year, text(selectedVehicle, ["year"])], [details.mileage, text(selectedVehicle, ["mileage"]) && `${text(selectedVehicle, ["mileage"])} km`], [details.engine, text(selectedVehicle, ["engineVolume"])],
    [details.fuel, translateBackendValue(text(selectedVehicle, ["fuelType"]), currentLang)], [details.transmission, translateBackendValue(text(selectedVehicle, ["transmission"]), currentLang)], [details.drivetrain, translateBackendValue(text(selectedVehicle, ["drivetrain"]), currentLang)], [details.body, translateBackendValue(text(selectedVehicle, ["bodyType"]), currentLang)],
    [details.condition, translateBackendValue(text(selectedVehicle, ["conditionGrade", "condition"]), currentLang)], [details.color, text(selectedVehicle, ["color"])], [details.region, text(selectedVehicle, ["region"])], [t.vin, text(selectedVehicle, ["vin"])],
    [t.seller, text(selectedVehicle, ["sellerId", "ownerId", "userId"]) && `#${text(selectedVehicle, ["sellerId", "ownerId", "userId"])}`], [details.description, text(selectedVehicle, ["description"])],
  ] : [];
  const auctionDetails = selectedAuction ? [
    [t.auction, `#${text(selectedAuction, ["auctionId", "id"]) || "—"}`], [t.auctionStatus, translateStatus(text(selectedAuction, ["status"]).toUpperCase(), currentLang)], [t.approvalStatus, translateStatus(approvalStatusOf(selectedAuction), currentLang)], [t.startPrice, formatMoney(selectedAuction)],
    [details.reservePrice, text(selectedAuction, ["reservePrice"]) ? `${new Intl.NumberFormat().format(Number(selectedAuction.reservePrice))} ${text(selectedAuction, ["currency"]) || "UZS"}` : ""],
    [details.currentPrice, text(selectedAuction, ["currentPrice"]) ? `${new Intl.NumberFormat().format(Number(selectedAuction.currentPrice))} ${text(selectedAuction, ["currency"]) || "UZS"}` : ""],
    [details.increment, text(selectedAuction, ["incrementValue"]) ? `${text(selectedAuction, ["incrementValue"])} ${text(selectedAuction, ["incrementType"]) === "PERCENTAGE" ? "%" : text(selectedAuction, ["currency"]) || "UZS"}` : ""],
    [details.deposit, text(selectedAuction, ["depositPercent"]) ? `${text(selectedAuction, ["depositPercent"])}%` : ""], [details.start, formatDate(text(selectedAuction, ["startTime"]))], [details.end, formatDate(text(selectedAuction, ["endTime"]))],
  ] : [];
  const confirm = async () => {
    if (!selectedId || !operation || (operation === "reject" && !reason.trim())) return;
    setFeedback("");
    try {
      if (operation === "approve") await approve.mutateAsync(selectedId);
      else await reject.mutateAsync({ auctionId: selectedId, reason });
      setFeedback("success");
      setSelectedId("");
      setOperation(null);
      setReason("");
    } catch {
      setFeedback("error");
    }
  };
  const confirmDocument = async () => {
    if (!documentDecision || (documentDecision.type === "reject" && !reason.trim())) return;
    setDocumentFeedback("");
    try {
      if (documentDecision.type === "approve") await approveDocument.mutateAsync(documentDecision.id);
      else await rejectDocument.mutateAsync({ docId: documentDecision.id, reason });
      setDocumentFeedback("document-success");
      setDocumentDecision(null);
      setReason("");
      void documentsQuery.refetch();
    } catch {
      setDocumentFeedback("error");
    }
  };
  const close = () => {
    setSelectedId("");
    setOperation(null);
    setReason("");
    setDocumentDecision(null);
    setDocumentFeedback("");
    setLightbox(null);
  };
  const smartTabs = useMemo(() => [
    { id: "all", label: "Barchasi", count: query.data?.meta?.counts?.all ?? query.data?.meta?.elements ?? 0, appVal: "", statVal: "" },
    { id: "pending", label: " Moderatsiyada", count: query.data?.meta?.counts?.approval?.PENDING_REVIEW ?? 0, appVal: "PENDING_REVIEW", statVal: "" },
    { id: "live", label: " Jonli savdo", count: query.data?.meta?.counts?.lifecycle?.LIVE ?? 0, appVal: "", statVal: "LIVE" },
    { id: "scheduled", label: " Rejalashtirilgan", count: query.data?.meta?.counts?.lifecycle?.SCHEDULED ?? 0, appVal: "", statVal: "SCHEDULED" },
    { id: "approved", label: " Tasdiqlangan", count: query.data?.meta?.counts?.approval?.APPROVED ?? 0, appVal: "APPROVED", statVal: "" },
    { id: "rejected", label: " Rad etilgan", count: query.data?.meta?.counts?.approval?.REJECTED ?? 0, appVal: "REJECTED", statVal: "" },
    { id: "finished", label: " Yakunlangan", count: query.data?.meta?.counts?.lifecycle?.FINISHED ?? 0, appVal: "", statVal: "FINISHED" },
    { id: "draft", label: " Qoralamalar", count: query.data?.meta?.counts?.lifecycle?.DRAFT ?? 0, appVal: "", statVal: "DRAFT" },
  ], [query.data]);

  const tabs = [
    ["auction", details.auctionInfo],
    ["vehicle", details.vehicleInfo],
    ["documents", `${details.documentsInfo} (${selectedDocuments.length})`],
  ] as const;

  const smartToolbar = (
    <div className="bg-white p-3 rounded-xl border border-border-default shadow-xs">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-brand-gold-text">
          Aqlli tezkor navbat (Smart views)
        </span>
        <span className="text-[11px] text-text-secondary">Barcha asosiy holatlar bitta qatorda</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {smartTabs.map((item) => {
          const isActive =
            (item.appVal === approvalStatus && item.statVal === status) ||
            (!item.appVal && !item.statVal && !approvalStatus && !status);
          return (
            <button
              key={item.id}
              type="button"
              disabled={pending}
              onClick={() => {
                setApprovalStatus(item.appVal);
                setStatus(item.statVal);
                setPage(0);
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-extrabold transition-all ${
                isActive
                  ? "bg-brand-navy-900 text-white shadow-xs"
                  : "bg-surface-canvas border border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-surface-muted text-text-secondary"
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return <div className="space-y-4">
    {feedback ? <StatusBadge tone={feedback === "success" ? "success" : "danger"}>{feedback === "success" ? t.success : t.actionError}</StatusBadge> : null}
    {documentFeedback ? <StatusBadge tone={documentFeedback === "error" ? "danger" : "success"}>{documentFeedback === "document-success" ? details.documentSuccess : t.actionError}</StatusBadge> : null}

    {query.isError || documentsQuery.isError ? <StatePanel title={t.error} action={<button className="rounded-md bg-brand-navy-900 px-4 py-2 text-sm font-bold text-white" onClick={() => { void query.refetch(); void documentsQuery.refetch(); }}>{t.retry}</button>} /> : <OperationalTable actionsDisabled={pending} disableClientProcessing label={t.table} loading={query.isLoading || documentsQuery.isLoading} onOpen={(row) => { setSelectedId(row.id.replace(/^#/, "")); setActiveTab("auction"); setOperation(null); setReason(""); }} onSearchQueryChange={(value) => { setSearchQuery(value); setPage(0); }} rows={rows} searchQuery={searchQuery} toolbarControls={smartToolbar} />}
    {!query.isLoading && !query.isError ? <div className="flex flex-wrap items-center justify-end gap-3"><PageSizeSelect disabled={query.isLoading} value={pageSize} onChange={(size) => { setPageSize(size); setPage(0); }} /><button aria-label={translateUiText("previousPage", currentLang)} className="rounded-md border p-2 disabled:opacity-40" disabled={!page} onClick={() => setPage(page - 1)}><ChevronLeft /></button><span className="text-sm font-bold">{t.page} {page + 1} / {totalPages}</span><button aria-label={translateUiText("nextPage", currentLang)} className="rounded-md border p-2 disabled:opacity-40" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight /></button></div> : null}
    {selectedAuction ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy-950/65 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) close(); }} role="presentation">
      <Surface aria-modal="true" className="my-6 w-full max-w-5xl shadow-2xl" role="dialog">
        <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-brand-gold-text">{t.details}</p><h2 className="mt-2 text-xl font-black">{t.auction} #{text(selectedAuction, ["auctionId", "id"])}</h2></div><button aria-label={t.close} className="grid min-h-11 min-w-11 place-items-center rounded-md border" disabled={pending} onClick={close}><X size={18} /></button></div>
        <div className="mt-5 flex gap-6 overflow-x-auto border-y border-border-default pt-3" role="tablist">{tabs.map(([key, label]) => <button aria-selected={activeTab === key} className={`-mb-px min-h-11 shrink-0 border-b-2 px-1 text-sm font-extrabold transition-colors ${activeTab === key ? "border-brand-navy-900 text-brand-navy-900" : "border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary"}`} key={key} onClick={() => { setActiveTab(key); setOperation(null); setReason(""); setDocumentDecision(null); }} role="tab" type="button">{label}</button>)}</div>
        {activeTab === "auction" ? <section className="mt-5" role="tabpanel"><dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{auctionDetails.map(([label, value]) => <div className="rounded-md bg-brand-champagne-50 p-3" key={label}><dt className="text-xs font-bold text-text-secondary">{label}</dt><dd className="mt-1 break-words text-sm font-bold">{value || "—"}</dd></div>)}</dl></section> : null}
        {activeTab === "vehicle" ? <section className="mt-5" role="tabpanel">{selectedVehicle || singleAuction ? (() => { const vehicleImages = extractAllVehicleImages(selectedAuction, selectedVehicle); return <div className="space-y-6"><div><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-text-primary">{details.photos} {vehicleImages.length > 0 ? `(${vehicleImages.length})` : ""}</h3>{singleAuctionQuery.isFetching ? <span className="text-xs text-text-secondary animate-pulse">{t.loading}...</span> : null}</div>{vehicleImages.length > 0 ? <div className="flex gap-3 overflow-x-auto pb-2">{vehicleImages.map((imgUrl, idx) => <img alt={`Vehicle ${idx + 1}`} className="h-32 w-48 shrink-0 cursor-pointer rounded-md border border-border-default object-cover hover:opacity-80 transition-opacity" key={idx} src={imgUrl} onClick={() => setLightbox({ images: vehicleImages, index: idx })} />)}</div> : singleAuctionQuery.isLoading ? <div className="flex items-center gap-2 py-6 text-sm text-text-secondary"><div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-navy-900 border-t-transparent" /><span>{t.loading}...</span></div> : <p className="rounded-md bg-surface-muted p-4 text-sm text-text-secondary">{t.empty}</p>}</div><dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{vehicleDetails.map(([label, value]) => <div className="rounded-md bg-surface-muted p-3" key={label}><dt className="text-xs font-bold text-text-secondary">{label}</dt><dd className="mt-1 break-words text-sm font-bold">{value || "—"}</dd></div>)}</dl></div>; })() : <p className="text-sm text-text-secondary">—</p>}</section> : null}
        {activeTab === "documents" ? <section className="mt-5 space-y-3" role="tabpanel">{selectedDocuments.length ? selectedDocuments.map((doc) => { const docId = documentIdOf(doc); const url = documentUrl(doc); return <div className="rounded-md border border-border-default p-4" key={String(docId)}><div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center"><div><p className="text-xs font-bold text-text-secondary">{details.documentType}</p><p className="mt-1 font-extrabold">{translateBackendValue(doc.docType, currentLang)}</p></div><div><p className="text-xs font-bold text-text-secondary">{details.documentStatus}</p><StatusBadge className="mt-1" tone={doc.status === "APPROVED" ? "success" : doc.status === "REJECTED" ? "danger" : "warning"}>{translateBackendValue(doc.status ?? "PENDING", currentLang)}</StatusBadge></div>{url ? <a className="inline-flex min-h-11 items-center gap-2 font-bold underline" href={url} rel="noreferrer" target="_blank">{details.viewFile}<ExternalLink size={16} /></a> : null}</div>{(!doc.status || doc.status === "PENDING") && docId != null ? <div className="mt-4 flex gap-2 border-t pt-4"><button className="rounded-md bg-semantic-success px-4 py-2 text-sm font-bold text-white" disabled={pending} onClick={() => { setDocumentDecision({ id: docId, type: "approve" }); setReason(""); }} type="button">{details.approveDocument}</button><button className="rounded-md bg-semantic-danger px-4 py-2 text-sm font-bold text-white" disabled={pending} onClick={() => { setDocumentDecision({ id: docId, type: "reject" }); setReason(""); }} type="button">{details.rejectDocument}</button></div> : null}</div>; }) : <p className="rounded-md bg-surface-muted p-4 text-sm text-text-secondary">{details.noDocuments}</p>}</section> : null}
        {activeTab !== "documents" ? <div className="mt-5 flex gap-3 border-t pt-5">{canModerate ? <><button className="inline-flex min-h-11 items-center gap-2 rounded-md bg-semantic-success px-5 text-sm font-extrabold text-white" disabled={pending} onClick={() => { setOperation("approve"); setReason(""); }} type="button"><Check size={17} />{t.approve}</button><button className="inline-flex min-h-11 items-center gap-2 rounded-md bg-semantic-danger px-5 text-sm font-extrabold text-white" disabled={pending} onClick={() => setOperation("reject")} type="button"><XCircle size={17} />{t.reject}</button></> : <p className="text-sm text-text-secondary">{t.unavailable}</p>}</div> : null}
        <AdminConfirmModal
          isOpen={Boolean(operation)}
          type={operation ?? "approve"}
          title={operation === "approve" ? t.confirmApprove : t.confirmReject}
          reason={reason}
          onReasonChange={setReason}
          reasonLabel={t.reason}
          reasonPlaceholder={t.reasonPlaceholder}
          cancelLabel={t.cancel}
          confirmLabel={t.confirm}
          pending={pending}
          onConfirm={() => void confirm()}
          onCancel={() => { setOperation(null); setReason(""); }}
        />
        <AdminConfirmModal
          isOpen={Boolean(documentDecision)}
          type={documentDecision?.type ?? "approve"}
          title={documentDecision?.type === "approve" ? details.approveDocument : details.rejectDocument}
          reason={reason}
          onReasonChange={setReason}
          reasonLabel={t.reason}
          reasonPlaceholder={t.reasonPlaceholder}
          cancelLabel={t.cancel}
          confirmLabel={t.confirm}
          pending={pending}
          onConfirm={() => void confirmDocument()}
          onCancel={() => { setDocumentDecision(null); setReason(""); }}
        />
      </Surface>
    </div> : null}
    {lightbox ? <LightboxModal images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} /> : null}
  </div>;
}

function LightboxModal({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!images || images.length === 0) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-brand-navy-950/90 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <button
        aria-label="Close"
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        onClick={onClose}
      >
        <X size={32} />
      </button>

      {images.length > 1 && (
        <>
          <button
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
            onClick={handlePrev}
          >
            <ChevronLeft size={48} />
          </button>

          <button
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
            onClick={handleNext}
          >
            <ChevronRight size={48} />
          </button>
        </>
      )}

      <img
        src={images[currentIndex]}
        alt="Enlarged view"
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-md"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white font-bold bg-black/50 px-4 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
