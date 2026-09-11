import { useState, type ChangeEvent, type FormEvent, useContext } from "react";
import {
  BadgeCheck,
  CircleAlert,
  FileLock2,
  Loader2,
  ShieldCheck,
  Check,
  Clock3,
  Search,
  UserRoundCheck,
  X,
} from "lucide-react";

import { StatePanel } from "@/components/feedback/StatePanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DateInput } from "@/components/ui/DateInput";
import { useUserDocumentUpload } from "@/queries/users";
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import type { CabinetUser } from "./CabinetLiveSections";

type DocType = "PASSPORT" | "ID_CARD" | "ORG_CERTIFICATE" | "AUTHORIZATION";
type KycStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
type StepState = "done" | "current" | "pending" | "rejected";
type KycFieldName =
  | "firstName"
  | "lastName"
  | "birthDate"
  | "phone"
  | "email"
  | "organizationName"
  | "legalAddress"
  | "taxId"
  | "representative";
type KycFieldErrors = Partial<Record<KycFieldName, string>>;

const kycCopyByLocale: Record<Lang, {
  uiLabel: string;
  stepLabels: readonly [string, string, string];
  stepHints: Record<KycStatus, string[]>;
  statusLabels: Record<KycStatus, { label: string; tone: "danger" | "neutral" }>;
  header: {
    titleOrganization: string;
    titleIndividual: string;
    description: string;
  };
  rejectionTitle: string;
  rejectionFallback: string;
  pendingTitle: string;
  pendingDescription: string;
  approvedTitle: string;
  approvedDescription: string;
  unavailableTitle: string;
  unavailableDescription: string;
  infoCards: {
    data: { eyebrow: string; title: string; note: string };
    documents: { eyebrow: string; title: string; note: string };
    moderator: { eyebrow: string; title: string; note: string };
  };
  fields: {
    organizationName: string;
    taxId: string;
    legalAddress: string;
    representative: string;
    phone: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    email: string;
    docType: string;
    file: string;
  };
  docTypes: {
    PASSPORT: string;
    ID_CARD: string;
    ORG_CERTIFICATE: string;
    AUTHORIZATION: string;
  };
  fileErrorType: string;
  fileErrorSize: string;
  formErrorRequired: string;
  fileErrorEmpty: string;
  fieldRequired: string;
  phoneRequired: string;
  phoneInvalid: string;
  emailRequired: string;
  birthDateRequired: string;
  submitError: string;
  submitting: string;
  submitRejected: string;
  submitDefault: string;
  footer: string;
}> = {
  uz: {
    uiLabel: "Shaxsni tasdiqlash",
    stepLabels: ["Ma'lumotlar", "Tekshiruv", "Tasdiq"],
    stepHints: {
      PENDING: ["✓ Ma'lumotlar yuborildi", "⏳ Moderator tekshirmoqda", "Tasdiqlash kutilmoqda"],
      APPROVED: ["✓ Ma'lumotlar", "✓ Tekshirildi", "✓ Tasdiqlandi"],
      REJECTED: ["✓ Ma'lumotlar yuborildi", "✕ Rad etildi", "Qayta yuboring"],
      NOT_SUBMITTED: ["Ma'lumotlarni to'ldiring", "Tekshiruv kutilmoqda", "Tasdiq kutilmoqda"],
    },
    statusLabels: {
      REJECTED: { label: "Rad etilgan", tone: "danger" },
      PENDING: { label: "Ko'rib chiqilmoqda", tone: "neutral" },
      APPROVED: { label: "Tasdiqlangan", tone: "neutral" },
      NOT_SUBMITTED: { label: "Yuborilmagan", tone: "neutral" },
    },
    header: {
      titleOrganization: "Tashkilotni tasdiqlash",
      titleIndividual: "Shaxsni tasdiqlash",
      description: "Shaxs tasdiqlangach, rolingizga mos ravishda bid qo‘yish, depozit to‘lash va avtomobil sotish imkoniyatlari ochiladi.",
    },
    rejectionTitle: "Rad etish sababi",
    rejectionFallback: "Moderator sababni ko‘rsatmagan. Hujjatlarni tekshirib, qayta yuboring.",
    pendingTitle: "Moderator tasdig‘i kutilmoqda",
    pendingDescription: "Hujjatingiz muvaffaqiyatli yuborildi. Tekshiruv tugaguncha ma’lumot va hujjatlarni o‘zgartirib bo‘lmaydi. Natija kabinet va bildirishnomalarda ko‘rinadi.",
    approvedTitle: "Tasdiqlangan",
    approvedDescription: "Shaxsingiz tasdiqlandi. Rolingizga mos auksion, depozit, bid va sotuv imkoniyatlaridan foydalanishingiz mumkin.",
    unavailableTitle: "Tasdiqlash xizmati tayyorlanmoqda",
    unavailableDescription: "KYC backend xizmati ishlab chiqarish muhitida hali ulanmagan. Auksionlarda qatnashishning amaldagi depozit qoidalari o‘zgarishsiz qoladi.",
    infoCards: {
      data: { eyebrow: "Ma’lumotlarni to‘ldirish", title: "Shaxs ma’lumotlari", note: "Majburiy maydonlarni to‘ldiring" },
      documents: { eyebrow: "Hujjatlarni yuklash", title: "Hujjatlar", note: "JPG, PNG yoki PDF · 10MB gacha" },
      moderator: { eyebrow: "Tekshiruv natijasi", title: "Moderator xulosasi", note: "Natijani status orqali kuzating" },
    },
    fields: {
      organizationName: "Tashkilot nomi",
      taxId: "INN/STIR",
      legalAddress: "Yuridik manzil",
      representative: "Mas’ul shaxs",
      phone: "Telefon",
      firstName: "Ism",
      lastName: "Familiya",
      birthDate: "Tug‘ilgan sana",
      email: "E-mail",
      docType: "Hujjat turi",
      file: "Fayl",
    },
    docTypes: {
      PASSPORT: "Pasport",
      ID_CARD: "ID karta",
      ORG_CERTIFICATE: "Davlat ro‘yxatidan o‘tganlik guvohnomasi",
      AUTHORIZATION: "Vakolatni tasdiqlovchi hujjat",
    },
    fileErrorType: "Faqat JPG, PNG yoki PDF fayllarni yuklash mumkin",
    fileErrorSize: "Fayl hajmi 10MB dan oshmasligi kerak",
    formErrorRequired: "Majburiy ma’lumotlarni to‘liq kiriting",
    fileErrorEmpty: "Hujjat faylini tanlang",
    fieldRequired: "Bu maydon majburiy",
    phoneRequired: "Telefon raqamini kiriting",
    phoneInvalid: "+998 dan keyingi 9 ta raqamni kiriting",
    emailRequired: "E-mail manzilni kiriting",
    birthDateRequired: "Tug‘ilgan sanani kiriting",
    submitError: "Hujjatni yuborishda xatolik yuz berdi",
    submitting: "Yuborilmoqda...",
    submitRejected: "Tuzatib qayta yuborish",
    submitDefault: "Arizani yuborish",
    footer: "Maxfiy hujjat public URL sifatida ko‘rsatilmaydi. Hozirgi backend contract hujjat faylini moderatsiyaga yuboradi.",
  },
  ru: {
    uiLabel: "Подтверждение личности",
    stepLabels: ["Данные", "Проверка", "Подтверждение"],
    stepHints: {
      PENDING: ["✓ Данные отправлены", "⏳ Модератор проверяет", "Ожидание подтверждения"],
      APPROVED: ["✓ Данные", "✓ Проверено", "✓ Подтверждено"],
      REJECTED: ["✓ Данные отправлены", "✕ Отклонено", "Отправьте снова"],
      NOT_SUBMITTED: ["Заполните данные", "Ожидание проверки", "Ожидание подтверждения"],
    },
    statusLabels: {
      REJECTED: { label: "Отклонено", tone: "danger" },
      PENDING: { label: "На проверке", tone: "neutral" },
      APPROVED: { label: "Подтверждено", tone: "neutral" },
      NOT_SUBMITTED: { label: "Не отправлено", tone: "neutral" },
    },
    header: {
      titleOrganization: "Подтверждение организации",
      titleIndividual: "Подтверждение личности",
      description: "После подтверждения вам откроются возможности делать ставки, вносить депозит и продавать автомобили в соответствии с вашей ролью.",
    },
    rejectionTitle: "Причина отказа",
    rejectionFallback: "Модератор не указал причину. Проверьте документы и отправьте снова.",
    pendingTitle: "Ожидание подтверждения модератором",
    pendingDescription: "Ваш документ успешно отправлен. Данные и документы нельзя изменить до завершения проверки. Результат появится в кабинете и уведомлениях.",
    approvedTitle: "Подтверждено",
    approvedDescription: "Ваша личность подтверждена. Вы можете пользоваться аукционом, депозитом, ставками и продажей в соответствии с вашей ролью.",
    unavailableTitle: "Сервис подтверждения готовится к запуску",
    unavailableDescription: "Бэкенд KYC пока не подключён в продакшене. Действующие правила депозита для участия в аукционах остаются без изменений.",
    infoCards: {
      data: { eyebrow: "Заполнение данных", title: "Личные данные", note: "Заполните обязательные поля" },
      documents: { eyebrow: "Загрузка документов", title: "Документы", note: "JPG, PNG или PDF · до 10MB" },
      moderator: { eyebrow: "Результат проверки", title: "Заключение модератора", note: "Следите за статусом" },
    },
    fields: {
      organizationName: "Название организации",
      taxId: "ИНН/СТИР",
      legalAddress: "Юридический адрес",
      representative: "Ответственное лицо",
      phone: "Телефон",
      firstName: "Имя",
      lastName: "Фамилия",
      birthDate: "Дата рождения",
      email: "E-mail",
      docType: "Тип документа",
      file: "Файл",
    },
    docTypes: {
      PASSPORT: "Паспорт",
      ID_CARD: "ID карта",
      ORG_CERTIFICATE: "Свидетельство о госрегистрации",
      AUTHORIZATION: "Документ, подтверждающий полномочия",
    },
    fileErrorType: "Разрешены только файлы JPG, PNG или PDF",
    fileErrorSize: "Размер файла не должен превышать 10MB",
    formErrorRequired: "Заполните все обязательные поля",
    fileErrorEmpty: "Выберите файл документа",
    fieldRequired: "Это поле обязательно",
    phoneRequired: "Введите номер телефона",
    phoneInvalid: "Введите 9 цифр после +998",
    emailRequired: "Введите e-mail",
    birthDateRequired: "Введите дату рождения",
    submitError: "Произошла ошибка при отправке документа",
    submitting: "Отправляется...",
    submitRejected: "Исправить и отправить снова",
    submitDefault: "Отправить заявку",
    footer: "Конфиденциальный документ не отображается как public URL. Текущий backend contract отправляет файл на модерацию.",
  },
  en: {
    uiLabel: "Identity verification",
    stepLabels: ["Data", "Verification", "Confirmation"],
    stepHints: {
      PENDING: ["✓ Data submitted", "⏳ Moderator is reviewing", "Awaiting confirmation"],
      APPROVED: ["✓ Data", "✓ Verified", "✓ Confirmed"],
      REJECTED: ["✓ Data submitted", "✕ Rejected", "Resubmit"],
      NOT_SUBMITTED: ["Fill in the data", "Awaiting verification", "Awaiting confirmation"],
    },
    statusLabels: {
      REJECTED: { label: "Rejected", tone: "danger" },
      PENDING: { label: "Under review", tone: "neutral" },
      APPROVED: { label: "Approved", tone: "neutral" },
      NOT_SUBMITTED: { label: "Not submitted", tone: "neutral" },
    },
    header: {
      titleOrganization: "Verify organization",
      titleIndividual: "Verify identity",
      description: "Once verified, you will be able to place bids, make deposits, and sell vehicles according to your role.",
    },
    rejectionTitle: "Rejection reason",
    rejectionFallback: "The moderator did not provide a reason. Check your documents and resubmit.",
    pendingTitle: "Awaiting moderator approval",
    pendingDescription: "Your document was submitted successfully. Data and documents cannot be changed until the review is complete. The result will be shown in the cabinet and notifications.",
    approvedTitle: "Approved",
    approvedDescription: "Your identity has been verified. You can now use auctions, deposits, bidding, and selling features according to your role.",
    unavailableTitle: "Verification service is being prepared",
    unavailableDescription: "The KYC backend is not yet connected in production. Current deposit rules for participating in auctions remain unchanged.",
    infoCards: {
      data: { eyebrow: "Complete your details", title: "Personal data", note: "Fill in the required fields" },
      documents: { eyebrow: "Upload documents", title: "Documents", note: "JPG, PNG or PDF · up to 10MB" },
      moderator: { eyebrow: "Review result", title: "Moderator conclusion", note: "Track the status" },
    },
    fields: {
      organizationName: "Organization name",
      taxId: "Tax ID",
      legalAddress: "Legal address",
      representative: "Representative",
      phone: "Phone",
      firstName: "First name",
      lastName: "Last name",
      birthDate: "Date of birth",
      email: "Email",
      docType: "Document type",
      file: "File",
    },
    docTypes: {
      PASSPORT: "Passport",
      ID_CARD: "ID card",
      ORG_CERTIFICATE: "State registration certificate",
      AUTHORIZATION: "Power of attorney document",
    },
    fileErrorType: "Only JPG, PNG or PDF files are allowed",
    fileErrorSize: "File size must not exceed 10MB",
    formErrorRequired: "Fill in all required fields",
    fileErrorEmpty: "Select a document file",
    fieldRequired: "This field is required",
    phoneRequired: "Enter a phone number",
    phoneInvalid: "Enter the 9 digits after +998",
    emailRequired: "Enter an email address",
    birthDateRequired: "Enter your date of birth",
    submitError: "An error occurred while submitting the document",
    submitting: "Submitting...",
    submitRejected: "Correct and resubmit",
    submitDefault: "Submit application",
    footer: "Confidential documents are not shown as public URLs. The current backend contract sends the document file to moderation.",
  },
};

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const UZ_PHONE_PREFIX = "+998";

function uzPhoneSubscriberDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("998")) return digits.slice(3, 12);
  return digits.slice(0, 9);
}

function normalizeUzPhone(value: string): string {
  return `${UZ_PHONE_PREFIX}${uzPhoneSubscriberDigits(value)}`;
}

function formatUzPhone(value: string): string {
  const subscriber = uzPhoneSubscriberDigits(value);
  const operator = subscriber.slice(0, 2);
  const first = subscriber.slice(2, 5);
  const second = subscriber.slice(5, 7);
  const third = subscriber.slice(7, 9);
  let formatted = UZ_PHONE_PREFIX;
  if (operator) formatted += ` (${operator}`;
  if (operator.length === 2) formatted += ")";
  if (first) formatted += ` ${first}`;
  if (second) formatted += ` ${second}`;
  if (third) formatted += ` ${third}`;
  return formatted;
}

function isCompleteUzPhone(value: string): boolean {
  return uzPhoneSubscriberDigits(value).length === 9;
}

function normalizedStatus(user: CabinetUser): KycStatus {
  const raw = String(user.kycStatus ?? user.verificationStatus ?? "NOT_SUBMITTED")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  return (["PENDING", "APPROVED", "REJECTED"] as KycStatus[]).includes(raw as KycStatus)
    ? (raw as KycStatus)
    : "NOT_SUBMITTED";
}

function isOrganization(user: CabinetUser): boolean {
  return String(user.userType || user.type || "INDIVIDUAL").toUpperCase() === "ORGANIZATION";
}

function getStepStates(status: KycStatus): StepState[] {
  switch (status) {
    case "PENDING":
      return ["done", "current", "pending"];
    case "APPROVED":
      return ["done", "done", "done"];
    case "REJECTED":
      return ["done", "rejected", "pending"];
    default:
      return ["current", "pending", "pending"];
  }
}

function KycStepper({
  status,
  stepLabels,
  hints,
}: {
  status: KycStatus;
  stepLabels: readonly [string, string, string];
  hints: string[];
}) {
  const stepStates = getStepStates(status);

  const dotClass: Record<StepState, string> = {
    done: "border-emerald-500 bg-emerald-500 text-white",
    current: "border-amber-400 bg-amber-400 text-white",
    pending: "border-border-default bg-white text-text-secondary",
    rejected: "border-semantic-danger bg-semantic-danger text-white",
  };

  const lineClass: Record<StepState, string> = {
    done: "bg-emerald-500",
    current: "bg-border-default",
    pending: "bg-border-default",
    rejected: "bg-semantic-danger",
  };

  return (
    <div className="mt-6 rounded-lg border border-border-default bg-surface-muted p-5">
      <div className="flex items-start">
        {stepLabels.map((label, index) => {
          const state = stepStates[index];
          return (
            <div className="flex flex-1 items-start last:flex-none" key={label}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold transition-colors ${dotClass[state]}`}
                >
                  {state === "done" ? (
                    <Check size={16} />
                  ) : state === "current" ? (
                    <Search size={16} />
                  ) : state === "rejected" ? (
                    <X size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="mt-2 w-20 text-center text-xs font-bold leading-4 text-brand-navy-900">
                  {label}
                </span>
              </div>
              {index < stepLabels.length - 1 ? (
                <div className={`mx-2 mt-4 h-0.5 flex-1 rounded-full transition-colors ${lineClass[state]}`} />
              ) : null}
            </div>
          );
        })}
      </div>
      <ul className="mt-5 space-y-1 text-sm text-text-secondary">
        {hints.map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Small labeled text input, kept local so every field in the form shares
 * the same label/spacing/focus treatment.
 */
function Field({
  label,
  required,
  error,
  errorId,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-bold text-brand-navy-900">
      {label}
      {required ? <span className="text-semantic-danger"> *</span> : null}
      {children}
      {error ? (
        <span className="mt-2 block text-sm font-semibold text-semantic-danger" id={errorId}>
          {error}
        </span>
      ) : null}
    </label>
  );
}

function SummaryTile({
  sectionLabel,
  icon: Icon,
  title,
  note,
}: {
  sectionLabel: string;
  icon: typeof ShieldCheck;
  title: string;
  note: string;
}) {
  return (
    <article className="min-h-[13.5rem] rounded-[1.75rem] border border-border-default bg-white p-5 shadow-sm ring-1 ring-brand-champagne-500/15">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-gold-text">
              {sectionLabel}
            </p>
            <h3 className="mt-3 max-w-[12ch] text-[1.7rem] font-extrabold leading-tight text-brand-navy-900">
              {title}
            </h3>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-brand-navy-900 text-white shadow-md">
            <Icon aria-hidden="true" size={24} />
          </div>
        </div>
        <p className="mt-auto pt-6 text-[0.95rem] leading-7 text-text-secondary">
          {note}
        </p>
      </div>
    </article>
  );
}

function StatusCallout({
  title,
  description,
  icon: Icon,
  tone,
}: {
  title: string;
  description: string;
  icon: typeof BadgeCheck;
  tone: "approved" | "pending" | "rejected";
}) {
  const styles = {
    approved: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700",
    pending: "border-border-default bg-surface-muted text-brand-navy-900",
    rejected: "border-semantic-danger/30 bg-semantic-danger/5 text-semantic-danger",
  } as const;

  return (
    <div className={`flex gap-3 rounded-2xl border p-5 ${styles[tone]}`}>
      <div className="mt-0.5 shrink-0">
        <Icon aria-hidden="true" size={20} />
      </div>
      <div>
        <h3 className="font-extrabold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

export function KycPanel({
  user,
  available = true,
}: {
  user: CabinetUser;
  /** Flip to false to show the "service not ready yet" state instead of the live form. */
  available?: boolean;
}) {
  const { currentLang } = useContext(LangSwitch);
  const copy = kycCopyByLocale[currentLang];
  const organization = isOrganization(user);
  const serverStatus = normalizedStatus(user);
  const [localStatus, setLocalStatus] = useState<KycStatus | null>(null);
  const status = localStatus ?? serverStatus;
  const docTypes = organization
    ? [
        { value: "ORG_CERTIFICATE" as DocType, label: copy.docTypes.ORG_CERTIFICATE },
        { value: "AUTHORIZATION" as DocType, label: copy.docTypes.AUTHORIZATION },
      ]
    : [
        { value: "PASSPORT" as DocType, label: copy.docTypes.PASSPORT },
        { value: "ID_CARD" as DocType, label: copy.docTypes.ID_CARD },
      ];
  const [docType, setDocType] = useState<DocType>(docTypes[0].value);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<KycFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fields, setFields] = useState({
    firstName: user.firstname || user.firstName || "",
    lastName: user.lastname || user.lastName || "",
    birthDate: user.birthDate || user.dateOfBirth || "",
    phone: normalizeUzPhone(user.phone || user.phoneNumber || user.phone_number || ""),
    email: user.email || "",
    organizationName: user.orgName || "",
    legalAddress: user.legalAddress || "",
    taxId: user.orgInn || user.orgTaxId || "",
    representative: user.representativeName || "",
  });
  const { mutateAsync: submitDocument, isPending } = useUserDocumentUpload();
  const rejectionReason = user.kycRejectionReason || user.rejectionReason;
  const badge = copy.statusLabels[status];

  const validateRequiredFields = () => {
    const next: KycFieldErrors = {};
    if (organization) {
      if (!fields.organizationName.trim()) next.organizationName = copy.fieldRequired;
      if (!fields.legalAddress.trim()) next.legalAddress = copy.fieldRequired;
      if (!fields.taxId.trim()) next.taxId = copy.fieldRequired;
      if (!fields.representative.trim()) next.representative = copy.fieldRequired;
    } else {
      if (!fields.firstName.trim()) next.firstName = copy.fieldRequired;
      if (!fields.lastName.trim()) next.lastName = copy.fieldRequired;
    }
    if (!fields.email.trim()) next.email = copy.emailRequired;
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFileError(null);
    if (!selected) return setFile(null);
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFileError(copy.fileErrorType);
      return setFile(null);
    }
    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(copy.fileErrorSize);
      return setFile(null);
    }
    setFile(selected);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setErrorMessage(null);
    const fieldsValid = validateRequiredFields();
    const selectedFile = file;
    if (!selectedFile) {
      setFileError(copy.fileErrorEmpty);
    }
    if (!fieldsValid || !selectedFile) {
      setFormError(copy.formErrorRequired);
      return;
    }
    try {
      await submitDocument({ docType, file: selectedFile });
      setLocalStatus("PENDING");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.submitError);
    }
  };

  const inputClass = "mt-2 min-h-11 w-full rounded-md border border-border-default bg-white px-3 text-sm outline-none focus:border-focus-ring";
  const fieldErrorId = (name: KycFieldName) => `kyc-${name}-error`;
  const fieldA11y = (name: KycFieldName) => ({
    "aria-describedby": fieldErrors[name] ? fieldErrorId(name) : undefined,
    "aria-invalid": Boolean(fieldErrors[name]),
  });
  const updateField = (name: keyof typeof fields, value: string) => {
    setFields((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  // Backend not wired up yet in this environment — show the same "coming soon" state
  // that the standalone demo panel used to show unconditionally.
  if (!available) {
    return (
      <StatePanel
        icon={<FileLock2 size={34} />}
        title={copy.unavailableTitle}
        description={copy.unavailableDescription}
      />
    );
  }

  const showForm = status === "NOT_SUBMITTED" || status === "REJECTED";
  const primaryActionLabel =
    status === "REJECTED"
      ? copy.submitRejected
      : currentLang === "uz"
        ? "Tasdiqlash arizasini yuborish"
        : currentLang === "ru"
          ? "Отправить заявку на подтверждение"
          : "Submit verification request";
  const infoCardItems = [
    { icon: UserRoundCheck, title: copy.infoCards.data.title, note: copy.infoCards.data.note, sectionLabel: copy.infoCards.data.eyebrow },
    { icon: FileLock2, title: copy.infoCards.documents.title, note: copy.infoCards.documents.note, sectionLabel: copy.infoCards.documents.eyebrow },
    { icon: BadgeCheck, title: copy.infoCards.moderator.title, note: copy.infoCards.moderator.note, sectionLabel: copy.infoCards.moderator.eyebrow },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border-default bg-white p-6 shadow-sm md:p-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-gold-text">
            {copy.uiLabel}
          </p>
          <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
        </div>
        <div className="rounded-[2rem] border border-brand-champagne-500/35 bg-[radial-gradient(circle_at_top_left,_rgba(234,194,122,0.18),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,1)_0%,_rgba(250,247,242,0.88)_100%)] px-4 py-5 md:px-6">
          <div className="mx-auto grid max-w-[92rem] gap-5 xl:grid-cols-3">
            {infoCardItems.map((item) => (
              <SummaryTile
                key={item.title}
                sectionLabel={item.sectionLabel}
                icon={item.icon}
                title={item.title}
                note={item.note}
              />
            ))}
          </div>
        </div>
        <KycStepper status={status} stepLabels={copy.stepLabels} hints={copy.stepHints[status]} />
      </div>

      {status === "REJECTED" ? (
        <div role="alert">
          <StatusCallout
            title={copy.rejectionTitle}
            description={rejectionReason || copy.rejectionFallback}
            icon={CircleAlert}
            tone="rejected"
          />
        </div>
      ) : null}

      {status === "PENDING" ? (
        <StatusCallout
          title={copy.pendingTitle}
          description={copy.pendingDescription}
          icon={Clock3}
          tone="pending"
        />
      ) : null}

      {showForm ? (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border-default bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-3 border-b border-border-default pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-2xl font-extrabold text-brand-navy-900">
                {currentLang === "uz" ? "Tasdiqlash ma’lumotlari" : currentLang === "ru" ? "Данные для подтверждения" : "Verification details"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {currentLang === "uz"
                  ? "Shaxsiy ma’lumotlar va hujjatni bir joyda tayyorlang. Majburiy maydonlar yuborishdan oldin tekshiriladi."
                  : currentLang === "ru"
                    ? "Подготовьте личные данные и документ в одном месте. Обязательные поля проверяются перед отправкой."
                    : "Prepare identity details and the required document in one place. Required fields are validated before submission."}
              </p>
            </div>
            <div className="rounded-2xl bg-surface-muted px-4 py-3 text-sm font-bold text-brand-navy-900">
              {organization ? copy.header.titleOrganization : copy.header.titleIndividual}
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.8fr)]">
            <div className="space-y-8">
              <section>
                <div className="mb-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-gold-text">
                    01
                  </p>
                  <h4 className="mt-2 text-lg font-extrabold text-brand-navy-900">
                    {copy.infoCards.data.title}
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    {copy.infoCards.data.note}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
            {organization ? (
              <>
                <Field error={fieldErrors.organizationName} errorId={fieldErrorId("organizationName")} label={copy.fields.organizationName} required>
                  <input
                    {...fieldA11y("organizationName")}
                    className={inputClass}
                    value={fields.organizationName}
                    onChange={(event) => updateField("organizationName", event.target.value)}
                  />
                </Field>
                <Field error={fieldErrors.taxId} errorId={fieldErrorId("taxId")} label={copy.fields.taxId} required>
                  <input
                    {...fieldA11y("taxId")}
                    className={inputClass}
                    value={fields.taxId}
                    onChange={(event) => updateField("taxId", event.target.value)}
                  />
                </Field>
                <Field error={fieldErrors.legalAddress} errorId={fieldErrorId("legalAddress")} label={copy.fields.legalAddress} required>
                  <input
                    {...fieldA11y("legalAddress")}
                    className={inputClass}
                    value={fields.legalAddress}
                    onChange={(event) => updateField("legalAddress", event.target.value)}
                  />
                </Field>
                <Field error={fieldErrors.representative} errorId={fieldErrorId("representative")} label={copy.fields.representative} required>
                  <input
                    {...fieldA11y("representative")}
                    className={inputClass}
                    value={fields.representative}
                    onChange={(event) => updateField("representative", event.target.value)}
                  />
                </Field>
                <Field error={fieldErrors.email} errorId={fieldErrorId("email")} label={copy.fields.email} required>
                  <input
                    {...fieldA11y("email")}
                    className={inputClass}
                    type="email"
                    value={fields.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field error={fieldErrors.firstName} errorId={fieldErrorId("firstName")} label={copy.fields.firstName} required>
                  <input
                    {...fieldA11y("firstName")}
                    className={inputClass}
                    value={fields.firstName}
                    onChange={(event) => updateField("firstName", event.target.value)}
                  />
                </Field>
                <Field error={fieldErrors.lastName} errorId={fieldErrorId("lastName")} label={copy.fields.lastName} required>
                  <input
                    {...fieldA11y("lastName")}
                    className={inputClass}
                    value={fields.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                  />
                </Field>
                <Field error={fieldErrors.email} errorId={fieldErrorId("email")} label={copy.fields.email} required>
                  <input
                    {...fieldA11y("email")}
                    className={inputClass}
                    type="email"
                    value={fields.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </Field>
              </>
            )}
                </div>
              </section>

              <section>
                <div className="mb-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-gold-text">
                    02
                  </p>
                  <h4 className="mt-2 text-lg font-extrabold text-brand-navy-900">
                    {copy.infoCards.documents.title}
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    {copy.infoCards.documents.note}
                  </p>
                </div>

                <div className="rounded-2xl border border-border-default bg-surface-muted/55 p-5">
                  <span className="block text-sm font-bold text-brand-navy-900">{copy.fields.docType}</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {docTypes.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDocType(option.value)}
                        className={`min-h-11 rounded-xl border px-4 text-sm font-bold transition-colors ${
                          docType === option.value
                            ? "border-brand-navy-900 bg-brand-navy-900 text-white"
                            : "border-border-default bg-white text-brand-navy-900 hover:bg-surface-muted"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <label className="mt-5 block text-sm font-bold text-brand-navy-900">
                    {copy.fields.file}
                    <span className="text-semantic-danger"> *</span>
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-border-default bg-white px-4 py-4">
                      <FileLock2 aria-hidden="true" className="shrink-0 text-brand-navy-900" size={20} />
                      <div className="min-w-0 flex-1">
                        <input
                          aria-label={copy.fields.file}
                          aria-describedby={fileError ? "kyc-file-error" : undefined}
                          aria-invalid={Boolean(fileError)}
                          type="file"
                          accept={ACCEPTED_TYPES.join(",")}
                          onChange={handleFileChange}
                          className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-brand-navy-900 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
                        />
                        {file ? (
                          <p className="mt-1 truncate text-xs text-text-secondary">{file.name}</p>
                        ) : null}
                      </div>
                    </div>
                  </label>
                  {fileError ? <p className="mt-3 text-sm font-semibold text-semantic-danger" id="kyc-file-error">{fileError}</p> : null}
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-border-default bg-surface-muted p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-gold-text">
                  03
                </p>
                <h4 className="mt-2 text-lg font-extrabold text-brand-navy-900">
                  {copy.infoCards.moderator.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {copy.infoCards.moderator.note}
                </p>
                <div className="mt-4 rounded-xl bg-white p-4">
                  <p className="text-sm font-bold text-brand-navy-900">{copy.footer}</p>
                </div>
              </div>

              {formError ? (
                <div className="rounded-2xl border border-semantic-danger/30 bg-semantic-danger/5 p-4 text-sm font-semibold text-semantic-danger">
                  {formError}
                </div>
              ) : null}

              {errorMessage ? (
                <div className="rounded-2xl border border-semantic-danger/30 bg-semantic-danger/5 p-4 text-sm font-semibold text-semantic-danger">
                  {errorMessage}
                </div>
              ) : null}

              <div className="rounded-2xl border border-border-default bg-white p-5 shadow-sm">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy-900 px-5 text-sm font-extrabold text-white transition-opacity disabled:opacity-50"
                >
                  {isPending ? <Loader2 aria-hidden="true" className="animate-spin" size={16} /> : null}
                  {isPending ? copy.submitting : primaryActionLabel}
                </button>
              </div>
            </aside>
          </div>
        </form>
      ) : null}
    </div>
  );
}
