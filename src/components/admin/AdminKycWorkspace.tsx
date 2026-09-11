"use client";

import { ChevronLeft, ChevronRight, ExternalLink, FileCheck2, Loader2, X } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import { OperationalTable, type OperationalRow } from "@/components/admin/OperationalTable";
import { AdminFilterTabs } from "@/components/admin/AdminFilterTabs";
import { StatePanel } from "@/components/feedback/StatePanel";
import { StatusBadge, type StatusBadgeTone } from "@/components/ui/StatusBadge";
import { AppSelect } from "@/components/ui/AppSelect";
import { PageSizeSelect } from "@/components/ui/PageSizeSelect";
import { Surface } from "@/components/ui/Surface";
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import useDebounce from "@/hooks/useDebounce";
import { translateBackendValue } from "@/lib/localization/backendEnum";
import { translateUiText } from "@/lib/localization/uiText";
import { USER_DOCUMENT_STATUSES, type UserDocument, type UserDocumentStatus, useAdminUserDocuments, useApproveUserDocument, useRejectUserDocument } from "@/queries/user-documents";
import { useUserById } from "@/queries/users";
import { AdminConfirmModal } from "./AdminConfirmModal";

const copy: Record<Lang, Record<string, string>> = {
  uz: { table: "Foydalanuvchi hujjatlari", search: "Ism, telefon, e-mail yoki hujjat bo‘yicha qidirish...", status: "Holat", all: "Barcha holatlar", allTypes: "Barcha hujjat turlari", filterUserId: "User ID bo‘yicha", loading: "Foydalanuvchi hujjatlari yuklanmoqda", error: "Foydalanuvchi hujjatlarini yuklab bo‘lmadi", retry: "Qayta urinish", empty: "Hujjatlar topilmadi", emptyBody: "Tanlangan holat bo‘yicha foydalanuvchi hujjati yo‘q.", details: "Hujjat tafsilotlari", close: "Yopish", user: "Foydalanuvchi", type: "Hujjat turi", uploaded: "Yuklangan vaqt", reviewedBy: "Tekshirgan admin", file: "Faylni ko‘rish", noFile: "Backend fayl havolasini qaytarmadi", approve: "Tasdiqlash", reject: "Rad etish", confirmApprove: "Ushbu foydalanuvchi hujjatini tasdiqlaysizmi?", confirmReject: "Ushbu foydalanuvchi hujjatini rad etasizmi?", rejectReason: "Rad etish sababi", reasonPlaceholder: "Aniq sababni yozing", cancel: "Bekor qilish", confirm: "Tasdiqlash", success: "Hujjat statusi muvaffaqiyatli yangilandi.", actionError: "Statusni yangilab bo‘lmadi.", page: "Sahifa", userId: "User ID", email: "E-mail", phone: "Telefon", roles: "Rollar", userType: "Account turi", userStatus: "Tekshiruv holati", profileLoading: "Foydalanuvchi ma’lumotlari yuklanmoqda", profileError: "Foydalanuvchi ma’lumotlarini yuklab bo‘lmadi" },
  en: { table: "User identity documents", search: "Search by name, phone, email, or document...", status: "Status", all: "All statuses", allTypes: "All document types", filterUserId: "Filter by user ID", loading: "Loading user identity documents", error: "Could not load user identity documents", retry: "Try again", empty: "No documents found", emptyBody: "There are no user identity documents with the selected status.", details: "Document details", close: "Close", user: "User", type: "Document type", uploaded: "Uploaded", reviewedBy: "Reviewed by", file: "View file", noFile: "The backend did not return a file URL", approve: "Approve", reject: "Reject", confirmApprove: "Approve this user identity document?", confirmReject: "Reject this user identity document?", rejectReason: "Rejection reason", reasonPlaceholder: "Enter a clear reason", cancel: "Cancel", confirm: "Confirm", success: "Document status updated successfully.", actionError: "Could not update the status.", page: "Page", userId: "User ID", email: "Email", phone: "Phone", roles: "Roles", userType: "Account type", userStatus: "Verification status", profileLoading: "Loading user profile", profileError: "Could not load user profile" },
  ru: { table: "Документы пользователей", search: "Поиск по имени, телефону, e-mail или документу...", status: "Статус", all: "Все статусы", allTypes: "Все типы документов", filterUserId: "Фильтр по ID пользователя", loading: "Загрузка документов пользователей", error: "Не удалось загрузить документы пользователей", retry: "Повторить", empty: "Документы не найдены", emptyBody: "Нет документов пользователей с выбранным статусом.", details: "Детали документа", close: "Закрыть", user: "Пользователь", type: "Тип документа", uploaded: "Загружен", reviewedBy: "Проверил", file: "Открыть файл", noFile: "Backend не вернул ссылку на файл", approve: "Одобрить", reject: "Отклонить", confirmApprove: "Одобрить этот документ пользователя?", confirmReject: "Отклонить этот документ пользователя?", rejectReason: "Причина отказа", reasonPlaceholder: "Укажите точную причину", cancel: "Отмена", confirm: "Подтвердить", success: "Статус документа успешно обновлён.", actionError: "Не удалось обновить статус.", page: "Страница", userId: "User ID", email: "E-mail", phone: "Телефон", roles: "Роли", userType: "Тип аккаунта", userStatus: "Статус проверки", profileLoading: "Загрузка данных пользователя", profileError: "Не удалось загрузить данные пользователя" },
};
const USER_DOCUMENT_TYPES = ["PASSPORT", "ID_CARD", "ORG_CERTIFICATE", "AUTHORIZATION"] as const;
const tones: Record<string, StatusBadgeTone> = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" };
const statusLabels: Record<Lang, Record<string, string>> = {
  uz: {
    NOT_SUBMITTED: "Yuborilmagan",
    PENDING: "Ko‘rib chiqilmoqda",
    APPROVED: "Tasdiqlangan",
    REJECTED: "Rad etilgan",
  },
  en: {
    NOT_SUBMITTED: "Not submitted",
    PENDING: "Pending review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  },
  ru: {
    NOT_SUBMITTED: "Не отправлено",
    PENDING: "На проверке",
    APPROVED: "Одобрено",
    REJECTED: "Отклонено",
  },
};
const statusLabel = (lang: Lang, status?: string | null) => {
  if (!status) return "—";
  return statusLabels[lang][status.toUpperCase()] ?? status;
};
const documentId = (document: UserDocument) => document.documentId ?? document.id;
const fileUrl = (document: UserDocument) => document.fileUrl ?? document.downloadUrl ?? document.url;
const userName = (document: UserDocument) => document.userOrgName || [document.userFirstName, document.userLastName].filter(Boolean).join(" ") || [document.user?.firstname, document.user?.lastname].filter(Boolean).join(" ") || document.user?.email || `User #${document.userId ?? "—"}`;
const reviewerName = (document: UserDocument) => document.reviewedByOrgName || [document.reviewedByFirstName, document.reviewedByLastName].filter(Boolean).join(" ") || "—";
const asRecord = (value: unknown): Record<string, unknown> | null => value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
const unwrapUserPayload = (value: unknown): Record<string, unknown> | null => {
  const source = asRecord(value);
  if (!source) return null;
  return asRecord(source.data) ?? source;
};
const textValue = (source: Record<string, unknown> | null, keys: string[]) => {
  if (!source) return "";
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" || typeof value === "number") {
      const normalized = String(value).trim();
      if (normalized) return normalized;
    }
  }
  return "";
};
const rolesOf = (source: Record<string, unknown> | null) => {
  const roles = source?.roles;
  if (!Array.isArray(roles)) return "";
  return roles
    .map((role) => {
      if (typeof role === "string") return role;
      const entry = asRecord(role);
      return textValue(entry, ["name"]);
    })
    .filter(Boolean)
    .join(" · ");
};

export function AdminKycWorkspace() {
  const { currentLang } = useContext(LangSwitch); 
  const t = copy[currentLang];
  const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(10); const [status, setStatus] = useState<UserDocumentStatus | "">("");
  const [docType, setDocType] = useState(""); const [userId, setUserId] = useState(""); const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [selectedId, setSelectedId] = useState<string | number | null>(null); const [decision, setDecision] = useState<"approve" | "reject" | null>(null); const [reason, setReason] = useState(""); const [feedback, setFeedback] = useState<"success" | "error" | "">("");
  const query = useAdminUserDocuments({ docType, page, search: debouncedSearch, size: pageSize, status, userId }); const approve = useApproveUserDocument(); const reject = useRejectUserDocument(); const pending = approve.isPending || reject.isPending;
  const selected = query.data?.list.find((item) => String(documentId(item)) === String(selectedId));
  const selectedUserId = selected?.userId ? String(selected.userId) : "";
  const userQuery = useUserById(selectedUserId);
  const selectedUser = unwrapUserPayload(userQuery.data);
  const selectedVerificationStatus = textValue(selectedUser, ["kycStatus", "verificationStatus"]);
  const profileName = [textValue(selectedUser, ["firstname", "firstName"]), textValue(selectedUser, ["lastname", "lastName"])].filter(Boolean).join(" ");
  const modalTitle = profileName || textValue(selectedUser, ["email", "phone", "phoneNumber"]) || (selected ? userName(selected) : "—");
  const rows = useMemo<OperationalRow[]>(() => (query.data?.list ?? []).map((document) => ({ id: `#${documentId(document) ?? "—"}`, primary: userName(document), secondary: [document.user?.email ?? document.user?.phone, translateBackendValue(document.docType, currentLang), reviewerName(document) !== "—" ? `${t.reviewedBy}: ${reviewerName(document)}` : ""].filter(Boolean).join(" · ") || "—", value: document.createdAt || document.uploadedAt ? new Date(document.createdAt ?? document.uploadedAt ?? "").toLocaleDateString() : "—", status: statusLabel(currentLang, document.status ?? "PENDING"), tone: tones[document.status ?? "PENDING"] ?? "neutral" })), [currentLang, query.data, t.reviewedBy]);
  const statusTabs = [{ value: "", label: t.all, count: status === "" ? query.data?.elements ?? rows.length : rows.length }, ...USER_DOCUMENT_STATUSES.map((option) => ({ value: option, label: statusLabel(currentLang, option), count: status === option ? query.data?.elements ?? rows.length : rows.filter((row) => row.status === statusLabel(currentLang, option)).length, tone: tones[option] }))];
  const complete = () => { setFeedback("success"); setDecision(null); setReason(""); setSelectedId(null); };
  const fail = () => setFeedback("error");
  const confirm = async () => { if (!selectedId || !decision || (decision === "reject" && !reason.trim())) return; setFeedback(""); try { if (decision === "approve") await approve.mutateAsync(selectedId); else await reject.mutateAsync({ documentId: selectedId, reason }); complete(); } catch { fail(); } };

  return <div className="space-y-4">
    {feedback ? <StatusBadge tone={feedback === "success" ? "success" : "danger"}>{feedback === "success" ? t.success : t.actionError}</StatusBadge> : null}
    {query.isError ? <StatePanel icon={<FileCheck2/>} title={t.error} action={<button className="rounded-md bg-brand-navy-900 px-4 py-2 text-sm font-bold text-white" onClick={() => query.refetch()}>{t.retry}</button>}/> : <OperationalTable actionsDisabled={pending} disableClientProcessing label={t.table} loading={query.isLoading} searchPlaceholder={t.search} searchQuery={search} onSearchQueryChange={(value) => { setSearch(value); setPage(0); }} rows={rows} onOpen={(row) => { setSelectedId(row.id.replace(/^#/, "")); setDecision(null); setReason(""); }} toolbarControls={<><div className="grid w-full gap-3 sm:grid-cols-2"><AppSelect aria-label={t.type} disabled={pending} value={docType} onChange={(value) => { setDocType(String(value)); setPage(0); }} options={[{ value: "", label: t.allTypes }, ...USER_DOCUMENT_TYPES.map((value) => ({ value, label: translateBackendValue(value, currentLang) }))]}/><label className="sr-only" htmlFor="admin-kyc-user-id">{t.filterUserId}</label><input id="admin-kyc-user-id" inputMode="numeric" className="min-h-11 rounded-md border border-border-default bg-white px-3 text-sm outline-none focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25" placeholder={t.filterUserId} value={userId} onChange={(event) => { setUserId(event.target.value.replace(/\D/g, "")); setPage(0); }}/></div><AdminFilterTabs ariaLabel={t.status} disabled={pending} value={status} onChange={(value) => { setStatus(value as UserDocumentStatus | ""); setPage(0); }} options={statusTabs} /></>} />}
    {query.data?.list.length ? <div className="flex flex-wrap items-center justify-end gap-3"><PageSizeSelect disabled={query.isLoading} value={pageSize} onChange={(size) => { setPageSize(size); setPage(0); }}/><button aria-label={translateUiText("previousPage", currentLang)} className="rounded-md border border-border-default p-2 disabled:opacity-40" disabled={!page} onClick={() => setPage(page - 1)}><ChevronLeft/></button><span className="text-sm font-bold">{t.page} {page + 1}{query.data.pages ? ` / ${query.data.pages}` : ""}</span><button aria-label={translateUiText("nextPage", currentLang)} className="rounded-md border border-border-default p-2 disabled:opacity-40" disabled={page + 1 >= (query.data.pages || 1)} onClick={() => setPage(page + 1)}><ChevronRight/></button></div> : null}
    {selected ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy-950/65 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) { setSelectedId(null); setDecision(null); setReason(""); } }} role="presentation"><Surface aria-modal="true" className="my-6 w-full max-w-3xl shadow-2xl" role="dialog"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-brand-gold-text">{t.details}</p><h2 className="mt-2 text-xl font-black text-brand-navy-900">{modalTitle}</h2></div><button aria-label={t.close} className="grid min-h-11 min-w-11 place-items-center rounded-md border" disabled={pending} onClick={() => { setSelectedId(null); setDecision(null); setReason(""); }}><X size={18}/></button></div><div className="mt-5 grid gap-5 border-t pt-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"><section className="space-y-4"><div className="rounded-2xl border border-border-default bg-surface-muted/40 p-4"><p className="text-xs font-black uppercase tracking-[0.11em] text-brand-gold-text">{t.user}</p>{userQuery.isLoading ? <div className="mt-3 flex items-center gap-2 text-sm font-bold text-text-secondary"><Loader2 className="animate-spin" size={16} />{t.profileLoading}</div> : userQuery.isError ? <div className="mt-3 space-y-3"><p className="text-sm text-semantic-danger">{t.profileError}</p><button className="rounded-md border border-border-default bg-white px-3 py-2 text-sm font-bold" onClick={() => userQuery.refetch()} type="button">{t.retry}</button></div> : <dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-bold text-text-secondary">{t.userId}</dt><dd className="mt-1 font-bold text-brand-navy-900">{selectedUserId || "—"}</dd></div><div><dt className="text-xs font-bold text-text-secondary">{t.userType}</dt><dd className="mt-1 font-bold text-brand-navy-900">{textValue(selectedUser, ["userType", "type"]) || "—"}</dd></div><div><dt className="text-xs font-bold text-text-secondary">{t.email}</dt><dd className="mt-1 text-sm text-brand-navy-900">{textValue(selectedUser, ["email"]) || selected.user?.email || "—"}</dd></div><div><dt className="text-xs font-bold text-text-secondary">{t.phone}</dt><dd className="mt-1 text-sm text-brand-navy-900">{textValue(selectedUser, ["phone", "phoneNumber", "phone_number"]) || selected.user?.phone || "—"}</dd></div><div className="sm:col-span-2"><dt className="text-xs font-bold text-text-secondary">{t.roles}</dt><dd className="mt-1 text-sm font-bold text-brand-navy-900">{rolesOf(selectedUser) || "—"}</dd></div><div className="sm:col-span-2"><dt className="text-xs font-bold text-text-secondary">{t.userStatus}</dt><dd className="mt-1"><StatusBadge tone={tones[selectedVerificationStatus || selected.status || "PENDING"] ?? "neutral"}>{statusLabel(currentLang, selectedVerificationStatus || selected.status)}</StatusBadge></dd></div></dl>}</div></section><section><dl className="grid gap-4 rounded-2xl border border-border-default p-4 sm:grid-cols-2"><div><dt className="text-xs font-bold text-text-secondary">{t.type}</dt><dd className="mt-1 font-bold">{translateBackendValue(selected.docType, currentLang)}</dd></div><div><dt className="text-xs font-bold text-text-secondary">{t.status}</dt><dd className="mt-1"><StatusBadge tone={tones[selected.status ?? "PENDING"] ?? "neutral"}>{statusLabel(currentLang, selected.status ?? "PENDING")}</StatusBadge></dd></div><div><dt className="text-xs font-bold text-text-secondary">{t.uploaded}</dt><dd className="mt-1 text-sm">{selected.createdAt || selected.uploadedAt ? new Date(selected.createdAt ?? selected.uploadedAt ?? "").toLocaleString() : "—"}</dd></div><div><dt className="text-xs font-bold text-text-secondary">{t.file}</dt><dd className="mt-1">{fileUrl(selected) ? <a className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-navy-900 underline" href={fileUrl(selected)} rel="noreferrer" target="_blank">{t.file}<ExternalLink size={15}/></a> : <span className="text-sm text-text-secondary">{t.noFile}</span>}</dd></div></dl>{selected.status === "PENDING" || !selected.status ? <div className="mt-5 flex gap-3 border-t pt-5"><button className="min-h-11 rounded-md bg-semantic-success px-5 text-sm font-extrabold text-white" disabled={pending} onClick={() => { setDecision("approve"); setReason(""); }}>{t.approve}</button><button className="min-h-11 rounded-md bg-semantic-danger px-5 text-sm font-extrabold text-white" disabled={pending} onClick={() => setDecision("reject")}>{t.reject}</button></div> : null}<AdminConfirmModal isOpen={Boolean(decision)} type={decision ?? "approve"} title={decision === "approve" ? t.confirmApprove : t.confirmReject} reason={reason} onReasonChange={setReason} reasonLabel={t.rejectReason} reasonPlaceholder={t.reasonPlaceholder} cancelLabel={t.cancel} confirmLabel={t.confirm} pending={pending} onConfirm={() => void confirm()} onCancel={() => { setDecision(null); setReason(""); }} /></section></div></Surface></div> : null}
  </div>;
}
