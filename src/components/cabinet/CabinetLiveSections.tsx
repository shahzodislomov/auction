"use client";
import { CabinetSecuritySection } from "@/components/cabinet/CabinetSecuritySection";
const sellerCopyByLocale: Record<Lang, {
  archive: string;
  archiveError: string;
  archived: string;
  cancel: string;
  color: string;
  confirmArchive: string;
  confirmArchiveBody: string;
  confirmArchiveTitle: string;
  description: string;
  documents: string;
  download: string;
  deleteImage: string;
  deleteImageBody: string;
  deleteImageTitle: string;
  edit: string;
  editTitle: string;
  images: string;
  imageActionError: string;
  imageUpdated: string;
  nextImage: string;
  ownershipBody: string;
  ownershipTitle: string;
  previousImage: string;
  region: string;
  save: string;
  search: string;
  filterAll: string;
  emptyFilteredVehicles: [string, string];
  page: string;
  paginationSummary: string;
  previousPage: string;
  nextPage: string;
  submitForReview: string;
  submitForReviewBody: string;
  submitForReviewError: string;
  submitForReviewSuccess: string;
  setPrimaryImage: string;
  updateError: string;
  updated: string;
  vin: string;
  year: string;
  mileage: string;
  engineVolume: string;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  bodyType: string;
  conditionGrade: string;
  make: string;
  model: string;
}> = {
  en: {
    archive: "Archive",
    archiveError: "The vehicle could not be archived.",
    archived: "Vehicle archived.",
    cancel: "Cancel",
    color: "Color",
    confirmArchive: "Confirm archive",
    confirmArchiveBody: "The vehicle will leave the active seller workflow.",
    confirmArchiveTitle: "Archive vehicle",
    description: "Description",
    documents: "Documents",
    download: "Download",
    deleteImage: "Delete image",
    deleteImageBody: "Are you sure you want to delete this image? It will be permanently removed from the vehicle.",
    deleteImageTitle: "Delete vehicle image",
    edit: "Edit",
    editTitle: "Edit vehicle",
    images: "Images",
    imageActionError: "The image could not be updated.",
    imageUpdated: "Vehicle images updated.",
    nextImage: "Next image",
    ownershipBody: "This vehicle does not belong to the signed-in seller account.",
    ownershipTitle: "Vehicle access unavailable",
    previousImage: "Previous image",
    region: "Region",
    save: "Save vehicle",
    search: "Search by make, model, VIN, region, or vehicle ID",
    filterAll: "All statuses",
    emptyFilteredVehicles: [
      "No vehicles match this view",
      "Try changing the search text or selected status.",
    ],
    page: "Page",
    paginationSummary: "Showing {shown} of {total}",
    previousPage: "Previous page",
    nextPage: "Next page",
    submitForReview: "Submit for review",
    submitForReviewBody: "The draft will be sent to the administrator and become pending review.",
    submitForReviewError: "The vehicle could not be submitted for review.",
    submitForReviewSuccess: "Vehicle submitted for review.",
    setPrimaryImage: "Set as primary image",
    updateError: "The vehicle could not be updated.",
    updated: "Vehicle updated.",
    vin: "VIN",
    year: "Year",
    mileage: "Mileage",
    engineVolume: "Engine volume",
    fuelType: "Fuel type",
    transmission: "Transmission",
    drivetrain: "Drivetrain",
    bodyType: "Body type",
    conditionGrade: "Condition",
    make: "Make",
    model: "Model",
  },
  ru: {
    archive: "Архивировать",
    archiveError: "Не удалось архивировать автомобиль.",
    archived: "Автомобиль архивирован.",
    cancel: "Отмена",
    color: "Цвет",
    confirmArchive: "Подтвердить архивацию",
    confirmArchiveBody: "Автомобиль будет исключён из активного процесса продажи.",
    confirmArchiveTitle: "Архивировать автомобиль",
    description: "Описание",
    documents: "Документы",
    download: "Скачать",
    deleteImage: "Удалить фото",
    deleteImageBody: "Вы уверены, что хотите удалить это фото? Оно будет безвозвратно удалено из автомобиля.",
    deleteImageTitle: "Удалить фото автомобиля",
    edit: "Изменить",
    editTitle: "Изменить автомобиль",
    images: "Фотографии",
    imageActionError: "Не удалось обновить изображение.",
    imageUpdated: "Фотографии автомобиля обновлены.",
    nextImage: "Следующее фото",
    ownershipBody: "Этот автомобиль не принадлежит текущему аккаунту продавца.",
    ownershipTitle: "Нет доступа к автомобилю",
    previousImage: "Предыдущее фото",
    region: "Регион",
    save: "Сохранить автомобиль",
    search: "Поиск по марке, модели, VIN, региону или ID транспорта",
    filterAll: "Все статусы",
    emptyFilteredVehicles: [
      "Нет автомобилей для этого представления",
      "Попробуйте изменить поиск или выбранный статус.",
    ],
    page: "Страница",
    paginationSummary: "Показано {shown} из {total}",
    previousPage: "Предыдущая страница",
    nextPage: "Следующая страница",
    submitForReview: "Отправить на проверку",
    submitForReviewBody: "Черновик будет отправлен администратору и получит статус ожидания проверки.",
    submitForReviewError: "Не удалось отправить автомобиль на проверку.",
    submitForReviewSuccess: "Автомобиль отправлен на проверку.",
    setPrimaryImage: "Сделать главным фото",
    updateError: "Не удалось обновить автомобиль.",
    updated: "Автомобиль обновлён.",
    vin: "VIN",
    year: "Год",
    mileage: "Пробег",
    engineVolume: "Объём двигателя",
    fuelType: "Тип топлива",
    transmission: "Коробка передач",
    drivetrain: "Привод",
    bodyType: "Тип кузова",
    conditionGrade: "Состояние",
    make: "Марка",
    model: "Модель",
  },
  uz: {
    archive: "Arxivlash",
    archiveError: "Avtomobilni arxivlab bo‘lmadi.",
    archived: "Avtomobil arxivlandi.",
    cancel: "Bekor qilish",
    color: "Rang",
    confirmArchive: "Arxivlashni tasdiqlash",
    confirmArchiveBody: "Avtomobil faol sotuv jarayonidan chiqariladi.",
    confirmArchiveTitle: "Avtomobilni arxivlash",
    description: "Tavsif",
    documents: "Hujjatlar",
    download: "Yuklab olish",
    deleteImage: "Rasmni o‘chirish",
    deleteImageBody: "Bu rasmni o‘chirishga ishonchingiz komilmi? U avtomobildan butunlay o‘chiriladi.",
    deleteImageTitle: "Avtomobil rasmini o‘chirish",
    edit: "Tahrirlash",
    editTitle: "Avtomobilni tahrirlash",
    images: "Rasmlar",
    imageActionError: "Rasmni yangilab bo‘lmadi.",
    imageUpdated: "Avtomobil rasmlari yangilandi.",
    nextImage: "Keyingi rasm",
    ownershipBody: "Bu avtomobil tizimga kirgan sotuvchi hisobiga tegishli emas.",
    ownershipTitle: "Avtomobilga kirish mavjud emas",
    previousImage: "Oldingi rasm",
    region: "Hudud",
    save: "Avtomobilni saqlash",
    search: "Marka, model, VIN, hudud yoki transport ID bo‘yicha qidiring",
    filterAll: "Barcha holatlar",
    emptyFilteredVehicles: [
      "Bu ko‘rinish uchun avtomobil topilmadi",
      "Qidiruv yoki tanlangan holatni o‘zgartirib ko‘ring.",
    ],
    page: "Sahifa",
    paginationSummary: "{total} tadan {shown} tasi ko‘rsatilmoqda",
    previousPage: "Oldingi sahifa",
    nextPage: "Keyingi sahifa",
    submitForReview: "Tekshiruvga yuborish",
    submitForReviewBody: "Qoralama administratorga yuboriladi va tekshiruv kutilayotgan holatga o‘tadi.",
    submitForReviewError: "Avtomobilni tekshiruvga yuborib bo‘lmadi.",
    submitForReviewSuccess: "Avtomobil tekshiruvga yuborildi.",
    setPrimaryImage: "Asosiy rasm qilish",
    updateError: "Avtomobilni yangilab bo‘lmadi.",
    updated: "Avtomobil yangilandi.",
    vin: "VIN",
    year: "Yil",
    mileage: "Yurgan masofa",
    engineVolume: "Dvigatel hajmi",
    fuelType: "Yoqilg‘i turi",
    transmission: "Uzatmalar qutisi",
    drivetrain: "Uzatma turi",
    bodyType: "Kuzov turi",
    conditionGrade: "Holati",
    make: "Marka",
    model: "Model",
  },
};
const copyByLocale: Record<Lang, CabinetLiveCopy> = {
  uz: {
    account: "Hisob ma’lumotlari",
    accountBody: "Profilingiz va ulangan kabinet xizmatlariga xavfsiz kirish.",
    addVehicle: "Avtomobil qo‘shish",
    amount: "Summa",
    bids: "Takliflarim",
    bidLost: "Yutqazdingiz",
    bidWon: "Yutdingiz",
    browseAuctions: "Auksionlarni ko‘rish",
    connectedServices: "Ulangan xizmatlar",
    connectedAccounts: "Ulangan hisoblar",
    connectedAccountsBody: "Ijtimoiy tarmoq orqali kirish uchun akkauntlaringizni ulang.",
    linked: "Ulangan",
    linkAccountError: "Xatolik yuz berdi",
    linkAccountSuccess: "Hisob muvaffaqiyatli ulandi.",
    linkAccountConflict: "Ushbu ijtimoiy tarmoq akkaunti boshqa profilga ulangan. Uni ushbu profilga o'tkazishni tasdiqlaysizmi?",
    currentPassword: "Joriy parol",
    currencyUnknown: "valyuta ko‘rsatilmagan",
    date: "Sana",
    email: "E-mail",
    emailChange: "E-mailni yangilash",
    emailChanged: "E-mail muvaffaqiyatli tasdiqlandi.",
    emailCodeSent: "Yangi e-mailga tasdiqlash kodi yuborildi.",
    emailRequestError: "E-mailni yangilash so‘rovini yuborib bo‘lmadi.",
    empty: {
      bids: ["Auksion ishtiroki topilmadi", "Taklif bergan avtomobillaringiz shu yerda ko‘rinadi."],
      notifications: ["Bildirishnomalar yo‘q", "Yangi hisob va auksion xabarlari shu yerda ko‘rinadi."],
      payments: ["To‘lov operatsiyalari yo‘q", "Depozit, qaytarish va to‘lovlar shu yerda ko‘rinadi."],
      vehicles: ["Avtomobillar topilmadi", "Birinchi avtomobilingizni sotuv jarayoniga qo‘shing."],
      watchlist: ["Saqlangan qidiruvlar yo‘q", "Saqlangan qidiruvlaringiz shu yerda ko‘rinadi."],
    },
    errorBody: "Jonli ma’lumotni yuklab bo‘lmadi. Ulanishni tekshirib, qayta urinib ko‘ring.",
    errorTitle: "Ma’lumot yuklanmadi",
    firstName: "Ism",
    lastName: "Familiya",
    loadingBody: "Kabinet ma’lumoti backenddan olinmoqda.",
    loadingTitle: "Ma’lumot yuklanmoqda",
    missingAccountBody: "Hisob identifikatori topilmadi. Qayta kirib ko‘ring.",
    missingAccountTitle: "Hisob aniqlanmadi",
    newEmail: "Yangi e-mail",
    newPassword: "Yangi parol",
    notifications: "Bildirishnomalar",
    notificationDetails: "Bildirishnoma tafsilotlari",
    notificationLink: "Bog‘liq sahifani ochish",
    notificationsNew: "Yangi",
    notificationsHistory: "Tarix",
    notificationsLatest: "Oxirgi 10 ta bildirishnoma",
    closeDetails: "Tafsilotlarni yopish",
    notificationStates: {
      connecting: ["Bildirishnomalar ulanmoqda", "Jonli xabar kanali bilan aloqa o‘rnatilmoqda."],
      offline: ["Tarmoq mavjud emas", "Bildirishnomalarni olish uchun internet aloqasini tiklang."],
      unavailable: ["Bildirishnomalar kanali sozlanmagan", "Bu muhit uchun WebSocket manzili mavjud emas."],
    },
    notProvided: "Ko‘rsatilmagan",
    individual: "Jismoniy shaxs",
    organization: "Tashkilot",
    organizationInn: "STIR",
    organizationName: "Tashkilot nomi",
    payments: "To‘lovlar",
    passwordChange: "Parolni yangilash",
    passwordChanged: "Parol muvaffaqiyatli tasdiqlandi.",
    passwordCodeSent: "Parol o‘zgarishini tasdiqlash kodi yuborildi.",
    passwordRequestError: "Parolni yangilash so‘rovini yuborib bo‘lmadi.",
    phone: "Telefon",
    profileError: "Profil saqlanmadi. Kiritilgan ma’lumotlar saqlanib qoldi.",
    profileSaved: "Profil ma’lumotlari saqlandi.",
    reference: "Raqam",
    removeSaved: "Saqlanganlardan olib tashlash",
    retry: "Qayta urinish",
    role: "Rol",
    page: "Sahifa",
    previousPage: "Oldingi sahifa",
    nextPage: "Keyingi sahifa",
    saveProfile: "O‘zgarishlarni saqlash",
    saving: "Saqlanmoqda",
    sendVerificationCode: "Tasdiqlash kodini yuborish",
    statuses: {
      cancelled: "Bekor qilingan",
      ended: "Yakunlangan",
      "ending-soon": "Yakunlanmoqda",
      live: "Jonli",
      sold: "Sotilgan",
      unknown: "Holat noma’lum",
      upcoming: "Kutilmoqda",
    },
    transactionTypes: {
      DEPOSIT: "Depozit",
      FINAL: "Yakuniy to‘lov",
      FINAL_PAYMENT: "Yakuniy to‘lov",
      PAYMENT: "Hisobni to‘ldirish",
      REFUND: "Qaytarish",
      SELLER_PAYOUT: "Sotuvdan tushgan pul",
      UNKNOWN: "Noma’lum",
    },
    type: "Hisob turi",
    updatePassword: "Parolni yangilash",
    vehicles: "Avtomobillarim",
    verificationCode: "Tasdiqlash kodi",
    verificationError: "Tasdiqlash kodini tekshirib bo‘lmadi.",
    verify: "Tasdiqlash",
    viewAuction: "Auksionni ko‘rish",
    viewDetails: "tafsilotlarini korish",
    viewPayments: "To‘lovlarni ko‘rish",
    watchlistRemoveError: "Avtomobilni saqlanganlardan olib tashlab bo‘lmadi.",
    watchlistRemoved: "Avtomobil saqlanganlardan olib tashlandi.",
    watchlistStillSaved: "Avtomobil saqlanganlarda qoldi.",
    watchlistUnknown: "Server saqlanganlar holatini tasdiqlamadi.",
    watchlist: "Saqlanganlar",
  },
  en: {
    account: "Account details",
    accountBody: "Secure access to your profile and connected cabinet services.",
    addVehicle: "Add vehicle",
    amount: "Amount",
    bids: "My bids",
    bidLost: "Not won",
    bidWon: "Won",
    browseAuctions: "Browse auctions",
    connectedServices: "Connected services",
    connectedAccounts: "Connected accounts",
    connectedAccountsBody: "Link your accounts to log in via social networks.",
    linked: "Linked",
    linkAccountError: "An error occurred",
    linkAccountSuccess: "Account linked successfully.",
    linkAccountConflict: "This social media account is linked to another profile. Do you confirm moving it to this profile?",
    currentPassword: "Current password",
    currencyUnknown: "currency not provided",
    date: "Date",
    email: "Email",
    emailChange: "Change email",
    emailChanged: "Email verified successfully.",
    emailCodeSent: "A verification code was sent to the new email.",
    emailRequestError: "The email change request could not be sent.",
    empty: {
      bids: ["No auction participation", "Vehicles you bid on will appear here."],
      notifications: ["No notifications", "New account and auction updates will appear here."],
      payments: ["No payment activity", "Deposits, refunds, and payments will appear here."],
      vehicles: ["No vehicles", "Add your first vehicle to the selling workflow."],
      watchlist: ["No saved searches", "Your saved searches will appear here."],
    },
    errorBody: "Live data could not be loaded. Check the connection and try again.",
    errorTitle: "Data could not be loaded",
    firstName: "First name",
    lastName: "Last name",
    loadingBody: "Cabinet data is loading from the backend.",
    loadingTitle: "Loading data",
    missingAccountBody: "The account identifier is missing. Try signing in again.",
    missingAccountTitle: "Account not identified",
    newEmail: "New email",
    newPassword: "New password",
    notifications: "Notifications",
    notificationDetails: "Notification details",
    notificationLink: "Open related page",
    notificationsNew: "New",
    notificationsHistory: "History",
    notificationsLatest: "Latest 10 notifications",
    closeDetails: "Close details",
    notificationStates: {
      connecting: ["Connecting notifications", "Establishing the live notification channel."],
      offline: ["You are offline", "Restore your connection to receive notifications."],
      unavailable: ["Notifications are not configured", "No WebSocket URL is available for this environment."],
    },
    notProvided: "Not provided",
    individual: "Individual",
    organization: "Organization",
    organizationInn: "Tax ID",
    organizationName: "Organization name",
    payments: "Payments",
    passwordChange: "Change password",
    passwordChanged: "Password verified successfully.",
    passwordCodeSent: "A code was sent to verify the password change.",
    passwordRequestError: "The password change request could not be sent.",
    phone: "Phone",
    profileError: "The profile was not saved. Your entered values remain in the form.",
    profileSaved: "Profile details saved.",
    reference: "Reference",
    removeSaved: "Remove from saved",
    retry: "Try again",
    role: "Role",
    page: "Page",
    previousPage: "Previous page",
    nextPage: "Next page",
    saveProfile: "Save changes",
    saving: "Saving",
    sendVerificationCode: "Send verification code",
    statuses: {
      cancelled: "Cancelled",
      ended: "Ended",
      "ending-soon": "Ending soon",
      live: "Live",
      sold: "Sold",
      unknown: "Unknown status",
      upcoming: "Upcoming",
    },
    transactionTypes: {
      DEPOSIT: "Deposit",
      FINAL: "Final payment",
      FINAL_PAYMENT: "Final payment",
      PAYMENT: "Refill",
      REFUND: "Refund",
      SELLER_PAYOUT: "Seller payout",
      UNKNOWN: "Unknown",
    },
    type: "Account type",
    updatePassword: "Update password",
    vehicles: "My vehicles",
    verificationCode: "Verification code",
    verificationError: "The verification code could not be confirmed.",
    verify: "Verify",
    viewAuction: "View auction",
    viewDetails: "view details",
    viewPayments: "View payments",
    watchlistRemoveError: "The vehicle could not be removed from saved items.",
    watchlistRemoved: "The vehicle was removed from saved items.",
    watchlistStillSaved: "The vehicle remains in your saved items.",
    watchlistUnknown: "The server did not confirm the saved-item state.",
    watchlist: "Saved",
  },
  ru: {
    account: "Данные аккаунта",
    accountBody: "Безопасный доступ к профилю и подключённым сервисам кабинета.",
    addVehicle: "Добавить автомобиль",
    amount: "Сумма",
    bids: "Мои ставки",
    bidLost: "Не выиграно",
    bidWon: "Вы выиграли",
    browseAuctions: "Смотреть аукционы",
    connectedServices: "Подключённые сервисы",
    connectedAccounts: "Привязанные аккаунты",
    connectedAccountsBody: "Привяжите аккаунты для входа через социальные сети.",
    linked: "Привязан",
    linkAccountError: "Произошла ошибка",
    linkAccountSuccess: "Аккаунт успешно привязан.",
    linkAccountConflict: "Этот аккаунт социальной сети привязан к другому профилю. Вы подтверждаете перенос на этот профиль?",
    currentPassword: "Текущий пароль",
    currencyUnknown: "валюта не указана",
    date: "Дата",
    email: "Электронная почта",
    emailChange: "Изменить почту",
    emailChanged: "Почта успешно подтверждена.",
    emailCodeSent: "Код подтверждения отправлен на новую почту.",
    emailRequestError: "Не удалось отправить запрос на изменение почты.",
    empty: {
      bids: ["Нет участия в аукционах", "Автомобили, на которые вы ставили, появятся здесь."],
      notifications: ["Нет уведомлений", "Новые сообщения об аккаунте и аукционах появятся здесь."],
      payments: ["Нет платёжных операций", "Депозиты, возвраты и платежи появятся здесь."],
      vehicles: ["Нет автомобилей", "Добавьте первый автомобиль в процесс продажи."],
      watchlist: ["Нет сохранённых поисков", "Сохранённые поиски появятся здесь."],
    },
    errorBody: "Не удалось загрузить актуальные данные. Проверьте соединение и повторите попытку.",
    errorTitle: "Данные не загрузились",
    firstName: "Имя",
    lastName: "Фамилия",
    loadingBody: "Данные кабинета загружаются с backend.",
    loadingTitle: "Загрузка данных",
    missingAccountBody: "Не найден идентификатор аккаунта. Попробуйте войти снова.",
    missingAccountTitle: "Аккаунт не определён",
    newEmail: "Новая почта",
    newPassword: "Новый пароль",
    notifications: "Уведомления",
    notificationDetails: "Детали уведомления",
    notificationLink: "Открыть связанную страницу",
    notificationsNew: "Новые",
    notificationsHistory: "История",
    notificationsLatest: "Последние 10 уведомлений",
    closeDetails: "Закрыть детали",
    notificationStates: {
      connecting: ["Подключаем уведомления", "Устанавливаем соединение с каналом уведомлений."],
      offline: ["Нет сети", "Восстановите соединение, чтобы получать уведомления."],
      unavailable: ["Канал уведомлений не настроен", "Для этой среды не задан адрес WebSocket."],
    },
    notProvided: "Не указано",
    individual: "Физическое лицо",
    organization: "Организация",
    organizationInn: "ИНН",
    organizationName: "Название организации",
    payments: "Платежи",
    passwordChange: "Изменить пароль",
    passwordChanged: "Пароль успешно подтверждён.",
    passwordCodeSent: "Код для подтверждения изменения пароля отправлен.",
    passwordRequestError: "Не удалось отправить запрос на изменение пароля.",
    phone: "Телефон",
    profileError: "Профиль не сохранён. Введённые значения остались в форме.",
    profileSaved: "Данные профиля сохранены.",
    reference: "Номер",
    removeSaved: "Удалить из избранного",
    retry: "Повторить",
    role: "Роль",
    page: "Страница",
    previousPage: "Предыдущая страница",
    nextPage: "Следующая страница",
    saveProfile: "Сохранить изменения",
    saving: "Сохраняем",
    sendVerificationCode: "Отправить код подтверждения",
    statuses: {
      cancelled: "Отменён",
      ended: "Завершён",
      "ending-soon": "Скоро завершится",
      live: "Идёт сейчас",
      sold: "Продан",
      unknown: "Статус неизвестен",
      upcoming: "Ожидается",
    },
    transactionTypes: {
      DEPOSIT: "Депозит",
      FINAL: "Финальный платёж",
      FINAL_PAYMENT: "Финальный платёж",
      PAYMENT: "Пополнение",
      REFUND: "Возврат",
      SELLER_PAYOUT: "Выплата продавцу",
      UNKNOWN: "Неизвестно",
    },
    type: "Тип аккаунта",
    updatePassword: "Изменить пароль",
    vehicles: "Мои автомобили",
    verificationCode: "Код подтверждения",
    verificationError: "Не удалось подтвердить код.",
    verify: "Подтвердить",
    viewAuction: "Смотреть аукцион",
    viewDetails: "смотреть детали",
    viewPayments: "Смотреть платежи",
    watchlistRemoveError: "Не удалось удалить автомобиль из избранного.",
    watchlistRemoved: "Автомобиль удалён из избранного.",
    watchlistStillSaved: "Автомобиль остался в избранном.",
    watchlistUnknown: "Сервер не подтвердил состояние избранного.",
    watchlist: "Избранное",
  },
};
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CarFront,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CircleUserRound,
  Eye,
  EyeOff,
  FileText,
  Fuel,
  Gavel,
  Gauge,
  Heart,
  MapPin,
  RotateCcw,
  Search,
  ShieldAlert,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { StatePanel } from "@/components/feedback/StatePanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { canRelistAuction, selectVehicleAuction, VehicleAuctionModal } from "@/components/cabinet/AuctionsSection";
import type { Auction as DashboardAuction, VehicleOption } from "@/components/cabinet/AuctionsSection";
import { AuctionDetailSkeleton, DashboardTableSkeleton, MetricGridSkeleton, TabsAndListSkeleton } from "@/components/feedback/ContentSkeletons";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import { Button } from "@/components/ui/Button";
import { StatusBadge, type StatusBadgeTone } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
import { AppSelect } from "@/components/ui/AppSelect";
import { PageSizeSelect } from "@/components/ui/PageSizeSelect";
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import { translateBackendValue } from "@/lib/localization/backendEnum";
import { translateUiText } from "@/lib/localization/uiText";
import { useSocket } from "@/hooks/useStomp";
import type {
  AuctionCurrency,
  AuctionStatus,
  LocalizedText,
  VehicleAuction,
} from "@/lib/auction/types";
import { formatAuctionPrice } from "@/lib/formatting/auction";
import {
  auctionDetailHref,
  auctionLiveHref,
} from "@/lib/routing/auctionRouteId";
import { useMySavedSearches, type SavedSearch } from "@/queries/saved-searches";
import { useMyPayments } from "@/queries/payments";
import { useUserStatistics } from "@/queries/statistics";
import { markNotifAsRead, markNotifAsReadById, useNotificationsByUserId } from "@/queries/notifications";
import {
  useAddRole,
  useDeleteRole,
  useUserDeposits,
  useUpdateEmail,
  useUpdateEmailVerify,
  useUpdatePasswordVerify,
  useUpdatePasswordWithOld,
  useUpdateUser,
  useGetIdentities,
  useLinkGoogleIdentity,
  useLinkTelegramIdentity,
} from "@/queries/users";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import ConfirmModal from "@/components/ui/ConfirmModal";

function GoogleColorIcon() {
    return (
        <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24">
            <path d="M21.35 12.23c0-.71-.06-1.24-.2-1.8H12v3.47h5.37a4.62 4.62 0 0 1-1.99 2.95l-.02.12 2.89 2.24.2.02c1.84-1.7 2.9-4.2 2.9-7Z" fill="#4285F4" />
            <path d="M12 21.75c2.63 0 4.83-.87 6.44-2.52l-3.07-2.38c-.82.56-1.92.95-3.37.95a5.85 5.85 0 0 1-5.53-4.04l-.12.01-3 2.32-.04.11A9.72 9.72 0 0 0 12 21.75Z" fill="#34A853" />
            <path d="M6.47 13.76A5.95 5.95 0 0 1 6.15 12c0-.61.11-1.2.31-1.76v-.12L3.43 7.76l-.1.05A9.72 9.72 0 0 0 2.25 12c0 1.51.38 2.94 1.06 4.2l3.16-2.44Z" fill="#FBBC05" />
            <path d="M12 6.2c1.83 0 3.06.79 3.76 1.44l2.75-2.68A9.34 9.34 0 0 0 12 2.25 9.72 9.72 0 0 0 3.31 7.81l3.15 2.43A5.87 5.87 0 0 1 12 6.2Z" fill="#EA4335" />
        </svg>
    );
}

const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

function loadTelegramScript() {
    return new Promise((resolve) => {
        if (typeof window === "undefined") return resolve(false);
        if ((window as Window & { Telegram?: { Login?: unknown } }).Telegram?.Login) return resolve(true);
        const existingScript = document.getElementById("telegram-widget-script");
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(true), { once: true });
            return;
        }
        const script = document.createElement("script");
        script.id = "telegram-widget-script";
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
    });
}
import { useAllBidByBidderId } from "@/queries/bid";
import { useAuctionFeed } from "@/queries/auction-listings";
import {
  useDeleteVehicleImage,
  useSetPrimaryVehicleImage,
  useUpdateVehicle,
  useVehicleDetail,
  useVehicleMakes,
  useVehicleModels,
  type Vehicle,
} from "@/queries/vehicles";
import useDebounce from "@/hooks/useDebounce";
import { apiErrorMessage } from "@/lib/api/errorMessage";

export interface CabinetUser {
  balance?: number | string;
  email?: string;
  firstname?: string;
  id?: string | number;
  isRegGoogle?: boolean;
  lastname?: string;
  orgInn?: string;
  orgName?: string;
  phone?: string;
  phoneNumber?: string;
  phone_number?: string;
  roles?: Array<string | { id?: string | number; name?: string }>;
  type?: string;
  birthDate?: string;
  dateOfBirth?: string;
  kycStatus?: string;
  verificationStatus?: string;
  kycRejectionReason?: string;
  rejectionReason?: string;
  legalAddress?: string;
  representativeName?: string;

  firstName: string;
  lastName: string;
  orgTaxId: string;
  userType: string;
  
}

export interface QuerySnapshot {
  data?: unknown;
  isError?: boolean;
  isLoading?: boolean;
  refetch?: () => unknown;
}
export interface TransactionRecord {
  id?: number;
  paymentId?: number;
  userId?: number;
  auctionId?: number;

  amount?: number;
  currency?: string;

  gatewayTransactionId?: string | null;
  idempotencyKey?: string;

  paymentType?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;

  createdAt?: string;
  paidAt?: string | null;
  paymentTime?: string | null;
  transactionTime?: string | null;
  transactionType?: string;
  type?: string;
}
type BidOutcome = "lost" | "won";

interface UserBidRecord {
  id?: string | number;
  auctionId?: string | number;
  bidAmount?: number | string;
  bidTime?: string;
  bidStatus?: string;
  currency?: string;
}

interface UserDepositRecord {
  id?: string | number;
  auctionId?: string | number;
  lotId?: string | number;
  amount?: number | string;
  depositAmount?: number | string;
  price?: number | string;
  sum?: number | string;
  currency?: string;
  status?: string;
}

interface AuctionBidSummary {
  auctionId: string;
  bidCount: number;
  bidTotal: number;
  currency: AuctionCurrency;
  depositTotal: number;
  latestBidAt: string | null;
  latestStatus: string | null;
  maxBid: number;
  outcome: BidOutcome | null;
}

interface NotificationRecord {
  body: string;
  createdAt: string | null;
  id: string;
  isRead: boolean;
  linkHref: string | null;
  linkLabel: string | null;
  meta: Array<[string, string]>;
  raw: Record<string, unknown>;
  readId: string | null;
  title: string;
}

interface CabinetLiveCopy {
  account: string;
  accountBody: string;
  addVehicle: string;
  amount: string;
  bids: string;
  bidLost: string;
  bidWon: string;
  browseAuctions: string;
  connectedServices: string;
  connectedAccounts: string;
  connectedAccountsBody: string;
  linked: string;
  linkAccountError: string;
  linkAccountSuccess: string;
  linkAccountConflict: string;
  currentPassword: string;
  currencyUnknown: string;
  date: string;
  email: string;
  emailChange: string;
  emailChanged: string;
  emailCodeSent: string;
  emailRequestError: string;
  empty: Record<"bids" | "notifications" | "payments" | "vehicles" | "watchlist", [string, string]>;
  errorBody: string;
  errorTitle: string;
  firstName: string;
  lastName: string;
  loadingBody: string;
  loadingTitle: string;
  missingAccountBody: string;
  missingAccountTitle: string;
  newEmail: string;
  newPassword: string;
  notifications: string;
  notificationDetails: string;
  notificationLink: string;
  notificationsNew: string;
  notificationsHistory: string;
  notificationsLatest: string;
  closeDetails: string;
  notificationStates: Record<"connecting" | "offline" | "unavailable", [string, string]>;
  notProvided: string;
  individual: string;
  organization: string;
  organizationInn: string;
  organizationName: string;
  payments: string;
  passwordChange: string;
  passwordChanged: string;
  passwordCodeSent: string;
  passwordRequestError: string;
  phone: string;
  profileError: string;
  profileSaved: string;
  reference: string;
  removeSaved: string;
  retry: string;
  role: string;
  page: string;
  previousPage: string;
  nextPage: string;
  saveProfile: string;
  saving: string;
  sendVerificationCode: string;
  statuses: Record<AuctionStatus, string>;
  transactionTypes: Record<string, string>;
  type: string;
  updatePassword: string;
  vehicles: string;
  verificationCode: string;
  verificationError: string;
  verify: string;
  viewAuction: string;
  viewDetails: string;
  viewPayments: string;
  watchlistRemoveError: string;
  watchlistRemoved: string;
  watchlistStillSaved: string;
  watchlistUnknown: string;
  watchlist: string;
}

const statusTones: Record<AuctionStatus, StatusBadgeTone> = {
  cancelled: "danger",
  ended: "neutral",
  "ending-soon": "warning",
  live: "success",
  sold: "neutral",
  unknown: "neutral",
  upcoming: "info",
};

const localeTags: Record<Lang, string> = {
  en: "en-US",
  ru: "ru-RU",
  uz: "uz-UZ",
};

export function useLiveCopy() {
  const { currentLang } = useContext(LangSwitch);
  return { copy: copyByLocale[currentLang], currentLang };
}

export function canonicalAccountId(value: string | number | undefined): string {
  if (value === undefined) return "";
  const normalized = String(value).trim();
  const numeric = Number(normalized);
  return normalized && Number.isSafeInteger(numeric) && numeric > 0 ? String(numeric) : "";
}

function localizeText(text: LocalizedText, locale: Lang): string {
  return text[locale] ?? text.default ?? text.uz ?? text.ru ?? text.en ?? "";
}

export function missingAccount(copy: CabinetLiveCopy) {
  return (
    <StatePanel
      icon={<ShieldAlert size={32} />}
      title={copy.missingAccountTitle}
      description={copy.missingAccountBody}
    />
  );
}

export function queryState(
  query: QuerySnapshot,
  copy: CabinetLiveCopy,
  empty: boolean,
  emptyCopy: [string, string],
) {
  if (query.isLoading) {
    return <TabsAndListSkeleton label={copy.loadingTitle} />;
  }
  if (query.isError) {
    return (
      <StatePanel
        icon={<ShieldAlert size={32} />}
        title={copy.errorTitle}
        description={copy.errorBody}
        action={
          query.refetch ? (
            <Button onClick={() => query.refetch?.()} variant="outline">
              {copy.retry}
            </Button>
          ) : undefined
        }
      />
    );
  }
  if (empty) {
    return <StatePanel title={emptyCopy[0]} description={emptyCopy[1]} />;
  }
  return null;
}

function VehicleCollection({
  auctions,
  bidOutcomes,
  kind,
  onRemove,
  removing,
}: {
  auctions: readonly VehicleAuction[];
  bidOutcomes?: ReadonlyMap<string, BidOutcome>;
  kind: "bids" | "watchlist";
  onRemove?: (lotId: string) => void;
  removing?: boolean;
}) {
  const { copy, currentLang } = useLiveCopy();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {auctions.map((auction) => {
        const title = localizeText(auction.title, currentLang) || `${copy.vehicles} #${auction.id}`;
        const outcome = kind === "bids" ? bidOutcomes?.get(auction.id) : undefined;
        const isLive = ["live", "ending-soon"].includes(auction.status);
        const isClosed = Boolean(outcome) || ["cancelled", "ended", "sold"].includes(auction.status);
        const href = isLive
          ? auctionLiveHref(auction.id)
          : outcome === "won"
            ? "/dashboard/payments"
            : outcome === "lost"
              ? "/auctions"
              : auctionDetailHref(auction.id);
        const actionLabel = outcome === "won" && !isLive
          ? copy.viewPayments
          : outcome === "lost" && !isLive
            ? copy.browseAuctions
            : copy.viewAuction;
        const price = isClosed
          ? auction.finalPrice ?? auction.currentPrice ?? auction.startPrice
          : auction.currentPrice ?? auction.finalPrice ?? auction.startPrice;

        return (
          <Surface className="flex min-h-56 flex-col" key={auction.id}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-gold-text">
                #{auction.lotNumber ?? auction.id}
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <StatusBadge tone={statusTones[auction.status]}>
                  {copy.statuses[auction.status]}
                </StatusBadge>
                {outcome ? (
                  <StatusBadge tone={outcome === "won" ? "success" : "neutral"}>
                    {outcome === "won" ? copy.bidWon : copy.bidLost}
                  </StatusBadge>
                ) : null}
              </div>
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-brand-navy-900">{title}</h2>
            <p className="mt-3 font-extrabold tabular-nums text-text-primary">
              {formatAuctionPrice(price, { currency: auction.currency })}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
              <Link
                aria-label={`${title}: ${actionLabel}`}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-brand-navy-900 px-4 text-sm font-extrabold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                href={href}
              >
                {actionLabel}
              </Link>
              {kind === "watchlist" && onRemove ? (
                <Button
                  aria-label={`${title}: ${copy.removeSaved}`}
                  disabled={removing}
                  onClick={() => onRemove(auction.id)}
                  variant="outline"
                >
                  <Heart aria-hidden="true" fill="currentColor" size={17} />
                  {copy.removeSaved}
                </Button>
              ) : null}
            </div>
          </Surface>
        );
      })}
    </div>
  );
}


const overviewCopy: Record<Lang, {
  activeLots: string;
  allLots: string;
  balance: string;
  bids: string;
  deposits: string;
  finishedLots: string;
  income: string;
  month: string;
  outflow: string;
  pendingLots: string;
  statsTitle: string;
  unavailableBody: string;
  unavailableTitle: string;
}> = {
  en: {
    activeLots: "Active vehicles",
    allLots: "All vehicles",
    balance: "Available balance",
    bids: "Bids",
    deposits: "Deposits",
    finishedLots: "Finished vehicles",
    income: "Income",
    month: "This month",
    outflow: "Outflow",
    pendingLots: "In review",
    statsTitle: "Live account overview",
    unavailableBody: "The statistics service returned no account summary.",
    unavailableTitle: "Account statistics unavailable",
  },
  ru: {
    activeLots: "Активный транспорт",
    allLots: "Весь транспорт",
    balance: "Доступный баланс",
    bids: "Ставки",
    deposits: "Депозиты",
    finishedLots: "Завершённый транспорт",
    income: "Поступления",
    month: "За этот месяц",
    outflow: "Расходы",
    pendingLots: "На проверке",
    statsTitle: "Актуальный обзор аккаунта",
    unavailableBody: "Сервис статистики не вернул сводку аккаунта.",
    unavailableTitle: "Статистика аккаунта недоступна",
  },
  uz: {
    activeLots: "Faol transport vositalari",
    allLots: "Barcha transport vositalari",
    balance: "Mavjud balans",
    bids: "Takliflar",
    deposits: "Depozitlar",
    finishedLots: "Yakunlangan transport vositalari",
    income: "Kirim",
    month: "Shu oy",
    outflow: "Chiqim",
    pendingLots: "Tekshiruvda",
    statsTitle: "Hisobning jonli ko‘rinishi",
    unavailableBody: "Statistika xizmati hisob bo‘yicha ma’lumot qaytarmadi.",
    unavailableTitle: "Hisob statistikasi mavjud emas",
  },
};

function cabinetRoleName(role: string | { name?: string }): string {
  return (typeof role === "string" ? role : role.name ?? "").trim().toUpperCase();
}

function cabinetRoleId(role: string | { id?: string | number; name?: string }): number | null {
  const name = cabinetRoleName(role);
  if (typeof role !== "string") {
    const explicit = Number(role.id);
    if (Number.isSafeInteger(explicit) && explicit > 0) return explicit;
  }
  if (name === "USER") return 2;
  return null;
}

function safeStatistic(value: unknown): number | null {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function trimmedText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function accountContact(user: CabinetUser, copy: CabinetLiveCopy): { label: string; value: string } {
  const email = trimmedText(user.email);
  const phone = trimmedText(user.phone ?? user.phoneNumber ?? user.phone_number);

  if (email) return { label: copy.email, value: email };
  if (phone) return { label: copy.phone, value: phone };
  return { label: copy.email, value: copy.notProvided };
}

export function CabinetHomeSection({
  isSeller = true,
  user,
}: {
  isSeller?: boolean;
  onIdentityChanged?: () => void;
  user: CabinetUser;
}) {
  const { copy, currentLang } = useLiveCopy();
  const statsCopy = overviewCopy[currentLang];
  const accountId = canonicalAccountId(user.id);
  const statisticsQuery = useUserStatistics(accountId) as unknown as QuerySnapshot;
  const statistics = recordFromUnknown(statisticsQuery.data);
  const lotStatistics = recordFromUnknown(statistics?.lotCount);
  const monthlyTransactions = recordFromUnknown(statistics?.transactionsForMonth);
  const numericBalance = Number(user.balance);
  const contact = accountContact(user, copy);
  const services = [
    { href: "/dashboard/watchlist", icon: Heart, label: copy.watchlist },
    { href: "/dashboard/bids", icon: Gavel, label: copy.bids },
    { href: "/dashboard/vehicles", icon: CarFront, label: copy.vehicles },
    { href: "/dashboard/payments", icon: CircleDollarSign, label: copy.payments },
    { href: "/dashboard/notifications", icon: Bell, label: copy.notifications },
    { href: "/dashboard/profile", icon: CircleUserRound, label: copy.account },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
      <Surface>
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-gold-text">
          {copy.account}
        </p>
        <h2 className="mt-3 text-2xl font-extrabold text-brand-navy-900">
          {[user.firstname, user.lastname].filter(Boolean).join(" ") || copy.notProvided}
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{copy.accountBody}</p>
        <dl className="mt-6 border-t border-border-default pt-5">
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.1em] text-text-secondary">{contact.label}</dt>
            <dd className="mt-1 break-all font-bold">{contact.value}</dd>
          </div>
        </dl>
      </Surface>
      <Surface>
        <h2 className="text-xl font-extrabold text-brand-navy-900">{copy.connectedServices}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {services.map(({ href, icon: Icon, label }) => (
            <Link
              className="flex min-h-16 items-center gap-3 rounded-md border border-border-default px-4 font-extrabold text-brand-navy-900 transition-colors hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              href={href}
              key={href}
            >
              <Icon aria-hidden="true" className="text-brand-gold-text" size={20} />
              {label}
            </Link>
          ))}
        </div>
      </Surface>
      <Surface className="xl:col-span-2">
        <h2 className="text-xl font-extrabold text-brand-navy-900">{statsCopy.statsTitle}</h2>
        {statisticsQuery.isLoading ? (
          <div className="mt-5">
            <MetricGridSkeleton count={4} label={copy.loadingTitle} />
          </div>
        ) : statisticsQuery.isError ? (
          <StatePanel
            action={statisticsQuery.refetch ? <Button onClick={() => statisticsQuery.refetch?.()} variant="outline">{copy.retry}</Button> : undefined}
            className="mt-5"
            description={copy.errorBody}
            icon={<ShieldAlert size={28} />}
            title={copy.errorTitle}
          />
        ) : !statistics ? (
          <StatePanel className="mt-5" description={statsCopy.unavailableBody} title={statsCopy.unavailableTitle} />
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link className="rounded-md border border-border-default bg-surface-muted p-4 focus-visible:outline-3 focus-visible:outline-focus-ring" href="/dashboard/payments">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-text-secondary">{statsCopy.balance}</p>
              <p className="mt-2 text-lg font-extrabold tabular-nums text-brand-navy-900">
                {Number.isFinite(numericBalance)
                  ? formatAuctionPrice(numericBalance, { currency: "UZS" })
                  : copy.notProvided}
              </p>
            </Link>
            <Link className="rounded-md border border-border-default bg-surface-muted p-4 focus-visible:outline-3 focus-visible:outline-focus-ring" href="/dashboard/bids">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-text-secondary">{statsCopy.bids}</p>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-brand-navy-900">{safeStatistic(statistics.bidCount) ?? "—"}</p>
            </Link>
            <Link className="rounded-md border border-border-default bg-surface-muted p-4 focus-visible:outline-3 focus-visible:outline-focus-ring" href="/dashboard/payments">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-text-secondary">{statsCopy.deposits}</p>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-brand-navy-900">{safeStatistic(statistics.depositCount) ?? "—"}</p>
            </Link>
            <div className="rounded-md border border-border-default bg-surface-muted p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-text-secondary">{statsCopy.month}</p>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between gap-3"><dt>{statsCopy.income}</dt><dd className="font-extrabold tabular-nums">{formatAuctionPrice(safeStatistic(monthlyTransactions?.plus), { currency: "UZS" })}</dd></div>
                <div className="flex justify-between gap-3"><dt>{statsCopy.outflow}</dt><dd className="font-extrabold tabular-nums">{formatAuctionPrice(safeStatistic(monthlyTransactions?.minus), { currency: "UZS" })}</dd></div>
              </dl>
            </div>
            {isSeller ? (
              <Link className="grid gap-3 rounded-md border border-border-default p-4 sm:col-span-2 xl:col-span-4 xl:grid-cols-4" href="/dashboard/vehicles">
                {[
                  [statsCopy.allLots, lotStatistics?.allLotsCount],
                  [statsCopy.activeLots, lotStatistics?.activeLotsCount],
                  [statsCopy.pendingLots, lotStatistics?.pendingLotsCount],
                  [statsCopy.finishedLots, lotStatistics?.finishedLotsCount],
                ].map(([label, value]) => (
                  <span className="flex items-center justify-between gap-3 rounded-md bg-surface-muted px-4 py-3" key={String(label)}>
                    <span className="text-sm font-bold text-text-secondary">{String(label)}</span>
                    <span className="text-lg font-extrabold tabular-nums text-brand-navy-900">{safeStatistic(value) ?? "—"}</span>
                  </span>
                ))}
              </Link>
            ) : null}
          </div>
        )}
      </Surface>
    </div>
  );
}

function savedSearchText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}

function savedSearchFilters(search: SavedSearch): Array<[string, string]> {
  const source = search.filters ?? search.criteria;
  if (!source || typeof source !== "object" || Array.isArray(source)) return [];

  return Object.entries(source as Record<string, unknown>)
    .flatMap(([key, value]) => {
      const direct = savedSearchText(value);
      if (direct) return [[key, direct] as [string, string]];
      if (Array.isArray(value)) {
        const values = value.map(savedSearchText).filter((item): item is string => Boolean(item));
        return values.length ? [[key, values.join(", ")] as [string, string]] : [];
      }
      return [];
    })
    .slice(0, 8);
}

export function WatchlistSection({ userId }: { userId?: string | number }) {
  const { copy, currentLang } = useLiveCopy();
  const accountId = canonicalAccountId(userId);
  const query = useMySavedSearches(0, 100, Boolean(accountId)) as unknown as QuerySnapshot;
  const labels = watchlistSectionCopy[currentLang];
  const [filter, setFilter] = useState<"all" | "notify-off" | "notify-on">("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState<"name" | "newest" | "oldest">("newest");
  const searches = useMemo(() => {
    const data = query.data as { items?: SavedSearch[] } | undefined;
    return Array.isArray(data?.items) ? data.items : [];
  }, [query.data]);
  const filteredSearches = useMemo(
    () => sortSavedSearches(filterSavedSearches(searches, filter, searchText), sort),
    [filter, searchText, searches, sort],
  );
  const totalPages = Math.max(1, Math.ceil(filteredSearches.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filteredSearches.slice(safePage * pageSize, (safePage + 1) * pageSize);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [filter, searchText, sort]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  if (!accountId) return missingAccount(copy);
  const state = queryState(query, copy, searches.length === 0, copy.empty.watchlist);
  if (state) return state;

  return (
    <div className="grid gap-5">
      <Surface className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative block">
          <span className="sr-only">{labels.search}</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            size={18}
          />
          <input
            className="min-h-11 w-full rounded-md border border-border-default bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-focus-ring md:w-80"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={labels.search}
            value={searchText}
          />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <AppSelect
            className="w-full sm:w-52"
            aria-label={labels.filter}
            value={filter}
            options={[
              { value: "all", label: labels.all },
              { value: "notify-on", label: labels.notifyOn },
              { value: "notify-off", label: labels.notifyOff },
            ]}
            onChange={(val) => {
              setFilter(val as "all" | "notify-off" | "notify-on");
              setPage(0);
            }}
          />
          <AppSelect
            className="w-full sm:w-40"
            aria-label={labels.sort}
            value={sort}
            options={[
              { value: "newest", label: labels.newest },
              { value: "oldest", label: labels.oldest },
              { value: "name", label: labels.byName },
            ]}
            onChange={(val) => {
              setSort(val as "name" | "newest" | "oldest");
              setPage(0);
            }}
          />
        </div>
      </Surface>

      {filteredSearches.length === 0 ? (
        <StatePanel
          description={labels.filteredEmptyBody}
          title={labels.filteredEmptyTitle}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {pageItems.map((search, index) => {
        const id = search.savedSearchId ?? search.id ?? index + 1;
        const title = savedSearchText(search.name ?? search.title) ?? `${copy.watchlist} #${id}`;
        const keyword = savedSearchText(search.query ?? search.keyword ?? search.searchTerm);
        const filters = savedSearchFilters(search);
        const createdAt = savedSearchText(search.createdAt);

        return (
          <Surface className="flex min-h-48 flex-col" key={String(id)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-gold-text">
                  {copy.watchlist}
                </p>
                <h3 className="mt-2 text-lg font-extrabold text-brand-navy-900">{title}</h3>
              </div>
              <Heart aria-hidden="true" className="shrink-0 text-brand-champagne-600" size={22} />
            </div>
            {keyword ? <p className="mt-3 text-sm text-text-secondary">{keyword}</p> : null}
            {filters.length ? (
              <dl className="mt-4 grid gap-2 border-t border-border-default pt-4 text-sm">
                {filters.map(([label, value]) => (
                  <div className="flex justify-between gap-3" key={label}>
                    <dt className="text-text-secondary">{label}</dt>
                    <dd className="text-right font-bold text-brand-navy-900">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {createdAt ? (
              <p className="mt-auto pt-5 text-xs text-text-secondary">
                {copy.date}: {formatDate(createdAt, currentLang)}
              </p>
            ) : null}
          </Surface>
        );
      })}
      </div>

      {filteredSearches.length ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <PageSizeSelect disabled={query.isLoading} value={pageSize} onChange={(size) => { setPageSize(size); setPage(0); }} />
          <button
            aria-label={copy.previousPage}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default bg-white text-brand-navy-900 transition-colors hover:bg-surface-muted disabled:text-text-secondary disabled:opacity-45"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={19} />
          </button>
          <span className="min-w-14 text-center text-sm font-extrabold tabular-nums text-brand-navy-900">
            {safePage + 1} / {totalPages}
          </span>
          <button
            aria-label={copy.nextPage}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default bg-white text-brand-navy-900 transition-colors hover:bg-surface-muted disabled:text-text-secondary disabled:opacity-45"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            type="button"
          >
            <ChevronRight aria-hidden="true" size={19} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

const watchlistSectionCopy: Record<Lang, {
  all: string;
  byName: string;
  filter: string;
  filteredEmptyBody: string;
  filteredEmptyTitle: string;
  newest: string;
  notifyOff: string;
  notifyOn: string;
  oldest: string;
  search: string;
  sort: string;
}> = {
  en: {
    all: "All",
    byName: "By name",
    filter: "Filter saved searches",
    filteredEmptyBody: "Try changing the search text or selected notification state.",
    filteredEmptyTitle: "No saved searches match this view",
    newest: "Newest",
    notifyOff: "Notifications off",
    notifyOn: "Notifications on",
    oldest: "Oldest",
    search: "Search...",
    sort: "Sort saved searches",
  },
  ru: {
    all: "Все",
    byName: "По названию",
    filter: "Фильтр сохранённых поисков",
    filteredEmptyBody: "Попробуйте изменить поиск или выбранное состояние уведомлений.",
    filteredEmptyTitle: "Нет сохранённых поисков для этого представления",
    newest: "Сначала новые",
    notifyOff: "Уведомления выключены",
    notifyOn: "Уведомления включены",
    oldest: "Сначала старые",
    search: "Поиск...",
    sort: "Сортировка сохранённых поисков",
  },
  uz: {
    all: "Barchasi",
    byName: "Nomi bo‘yicha",
    filter: "Saqlangan qidiruvlarni filterlash",
    filteredEmptyBody: "Qidiruv matni yoki bildirishnoma holatini o‘zgartirib ko‘ring.",
    filteredEmptyTitle: "Bu ko‘rinishda saqlangan qidiruv topilmadi",
    newest: "Eng yangi",
    notifyOff: "Xabarnoma o‘chiq",
    notifyOn: "Xabarnoma yoqilgan",
    oldest: "Eng eski",
    search: "Qidirish...",
    sort: "Saqlangan qidiruvlarni saralash",
  },
};

function savedSearchCreatedAt(search: SavedSearch): number {
  const createdAt = savedSearchText(search.createdAt);
  const timestamp = createdAt ? Date.parse(createdAt) : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function savedSearchTitle(search: SavedSearch): string {
  return savedSearchText(search.name ?? search.title) ?? "";
}

function filterSavedSearches(
  searches: readonly SavedSearch[],
  filter: "all" | "notify-off" | "notify-on",
  searchText: string,
): SavedSearch[] {
  const keyword = searchText.trim().toLowerCase();
  return searches.filter((search) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "notify-on" && search.notify === true) ||
      (filter === "notify-off" && search.notify !== true);
    if (!matchesFilter) return false;
    if (!keyword) return true;

    return [
      savedSearchTitle(search),
      savedSearchText(search.query ?? search.keyword ?? search.searchTerm),
      savedSearchText(search.createdAt),
      ...savedSearchFilters(search).flatMap(([label, value]) => [label, value]),
    ]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(keyword));
  });
}

function sortSavedSearches(
  searches: readonly SavedSearch[],
  sort: "name" | "newest" | "oldest",
): SavedSearch[] {
  return [...searches].sort((left, right) => {
    if (sort === "name") {
      return savedSearchTitle(left).localeCompare(savedSearchTitle(right));
    }
    const leftDate = savedSearchCreatedAt(left);
    const rightDate = savedSearchCreatedAt(right);
    return sort === "oldest" ? leftDate - rightDate : rightDate - leftDate;
  });
}

export function BidsSection({ userId }: { userId?: string | number }) {
  const { copy, currentLang } = useLiveCopy();
  const accountId = canonicalAccountId(userId);
  const bidsQuery = useAllBidByBidderId(accountId) as unknown as QuerySnapshot;
  const depositsQuery = useUserDeposits(accountId) as unknown as QuerySnapshot;
  const labels = bidSectionCopy[currentLang];
  const [filter, setFilter] = useState<"active" | "all" | "lost" | "won">("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"bid-desc" | "count-desc" | "newest" | "oldest">("newest");
  const bids = useMemo(() => listFromUnknown(bidsQuery.data) as UserBidRecord[], [bidsQuery.data]);
  const deposits = useMemo(
    () => listFromUnknown(depositsQuery.data) as UserDepositRecord[],
    [depositsQuery.data],
  );
  const summaries = useMemo(() => buildBidSummaries(bids, deposits), [bids, deposits]);
  const filteredSummaries = useMemo(
    () => sortBidSummaries(filterBidSummaries(summaries, filter, search), sort),
    [filter, search, sort, summaries],
  );
  const totalPages = Math.max(1, Math.ceil(filteredSummaries.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filteredSummaries.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const totals = useMemo(
    () => filteredSummaries.reduce(
      (total, summary) => ({
        auctions: total.auctions + 1,
        bids: total.bids + summary.bidCount,
        bidTotal: total.bidTotal + summary.bidTotal,
        depositTotal: total.depositTotal + summary.depositTotal,
        wins: total.wins + (summary.outcome === "won" ? 1 : 0),
      }),
      { auctions: 0, bids: 0, bidTotal: 0, depositTotal: 0, wins: 0 },
    ),
    [filteredSummaries],
  );
  const currency: AuctionCurrency = filteredSummaries[0]?.currency || summaries[0]?.currency || "UZS";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [filter, search, sort]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  if (!accountId) return missingAccount(copy);

  if (bidsQuery.isLoading || depositsQuery.isLoading) {
    return <DashboardTableSkeleton columns={5} label={copy.loadingTitle} />;
  }

  const state = queryState(
    {
      isLoading: Boolean(bidsQuery.isLoading || depositsQuery.isLoading),
      isError: Boolean(bidsQuery.isError || depositsQuery.isError),
      refetch: () => {
        bidsQuery.refetch?.();
        depositsQuery.refetch?.();
      },
    },
    copy,
    summaries.length === 0,
    copy.empty.bids,
  );
  if (state) return state;

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <BidMetric label={labels.auctions} locale={currentLang} value={totals.auctions} />
        <BidMetric label={labels.bids} locale={currentLang} value={totals.bids} />
        <BidMetric
          currency={currency}
          label={labels.bidSpend}
          locale={currentLang}
          value={totals.bidTotal}
        />
        <BidMetric
          currency={currency}
          label={labels.depositSpend}
          locale={currentLang}
          value={totals.depositTotal}
        />
        <BidMetric label={labels.wins} locale={currentLang} value={totals.wins} />
      </div>

      <Surface className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative block">
          <span className="sr-only">{labels.search}</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            size={18}
          />
          <input
            className="min-h-11 w-full rounded-md border border-border-default bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-focus-ring md:w-80"
            onChange={(event) => setSearch(event.target.value)}
            placeholder={labels.search}
            value={search}
          />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <AppSelect
            className="w-full sm:w-52"
            aria-label={labels.filter}
            value={filter}
            options={[
              { value: "all", label: labels.all },
              { value: "active", label: labels.active },
              { value: "won", label: labels.won },
              { value: "lost", label: labels.lost },
            ]}
            onChange={(val) => {
              setFilter(val as "active" | "all" | "lost" | "won");
              setPage(0);
            }}
          />
          <AppSelect
            className="w-full sm:w-40"
            aria-label={labels.sort}
            value={sort}
            options={[
              { value: "newest", label: labels.newest },
              { value: "oldest", label: labels.oldest },
              { value: "bid-desc", label: labels.biggestBid },
              { value: "count-desc", label: labels.mostBids },
            ]}
            onChange={(val) => {
              setSort(val as "bid-desc" | "count-desc" | "newest" | "oldest");
              setPage(0);
            }}
          />
        </div>
      </Surface>

      {filteredSummaries.length === 0 ? (
        <EmptyState
          icon={<Gavel size={28} />}
          title={
            currentLang === "ru"
              ? "Вы ещё не делали ставок"
              : currentLang === "uz"
                ? "Siz hali taklif kiritmadingiz"
                : "You haven't placed any bids yet"
          }
          description={
            currentLang === "ru"
              ? "Участвуйте в активных аукционах, чтобы выигрывать автомобили"
              : currentLang === "uz"
                ? "Avtomobillarni yutib olish uchun faol auksionlarda qatnashing"
                : "Participate in active auctions to win vehicles"
          }
          actionLabel={
            currentLang === "ru"
              ? "Смотреть активные аукционы"
              : currentLang === "uz"
                ? "Faol auksionlarni ko'rish"
                : "Browse Active Auctions"
          }
          actionHref="/auctions"
        />
      ) : null}

      {filteredSummaries.length > 0 ? (
      <Surface className="overflow-x-auto" padding="none">
        <table aria-label={copy.bids} className="w-full min-w-[56rem] border-collapse">
          <thead className="bg-surface-muted text-left text-xs font-extrabold uppercase tracking-[0.1em] text-text-secondary">
            <tr>
              <th className="px-5 py-3" scope="col">{labels.bids}</th>
              <th className="px-5 py-3" scope="col">{labels.bidSpend}</th>
              <th className="px-5 py-3" scope="col">{labels.depositSpend}</th>
              <th className="px-5 py-3" scope="col">{labels.maxBid}</th>
              <th className="px-5 py-3" scope="col">{labels.lastBid}</th>
              <th className="px-5 py-3" scope="col">{labels.result}</th>
              <th className="px-5 py-3" scope="col">{copy.viewAuction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {pageItems.map((summary) => (
              <tr className="align-top" key={summary.auctionId}>
                <td className="px-5 py-4 tabular-nums">{summary.bidCount}</td>
                <td className="px-5 py-4 font-bold tabular-nums">
                  {formatAuctionPrice(summary.bidTotal, { currency: summary.currency })}
                </td>
                <td className="px-5 py-4 font-bold tabular-nums">
                  {summary.depositTotal > 0
                    ? formatAuctionPrice(summary.depositTotal, { currency: summary.currency })
                    : "—"}
                </td>
                <td className="px-5 py-4 font-bold tabular-nums">
                  {formatAuctionPrice(summary.maxBid, { currency: summary.currency })}
                </td>
                <td className="px-5 py-4 text-sm text-text-secondary">
                  {formatDate(summary.latestBidAt, currentLang)}
                </td>
                <td className="px-5 py-4">
                  {summary.outcome ? (
                    <StatusBadge tone={summary.outcome === "won" ? "success" : "neutral"}>
                      {summary.outcome === "won" ? copy.bidWon : copy.bidLost}
                    </StatusBadge>
                  ) : (
                    <StatusBadge tone="info">
                      {summary.latestStatus || labels.active}
                    </StatusBadge>
                  )}
                </td>
                <td className="px-5 py-4">
                  <Link
                    className="inline-flex min-h-10 items-center justify-center rounded-md bg-brand-navy-900 px-4 text-sm font-extrabold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    href={auctionDetailHref(summary.auctionId)}
                  >
                    {copy.viewAuction}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Surface>
      ) : null}

      {filteredSummaries.length ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
            <PageSizeSelect disabled={bidsQuery.isLoading || depositsQuery.isLoading} value={pageSize} onChange={(size) => { setPageSize(size); setPage(0); }} />
            <button
              aria-label={copy.previousPage}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default bg-white text-brand-navy-900 transition-colors hover:bg-surface-muted disabled:text-text-secondary disabled:opacity-45"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={19} />
            </button>
            <span className="min-w-14 text-center text-sm font-extrabold tabular-nums text-brand-navy-900">
              {safePage + 1} / {totalPages}
            </span>
            <button
              aria-label={copy.nextPage}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-default bg-white text-brand-navy-900 transition-colors hover:bg-surface-muted disabled:text-text-secondary disabled:opacity-45"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
              type="button"
            >
              <ChevronRight aria-hidden="true" size={19} />
            </button>
        </div>
      ) : null}
    </div>
  );
}

function BidMetric({
  currency,
  label,
  locale,
  value,
}: {
  currency?: AuctionCurrency;
  label: string;
  locale: Lang;
  value: number;
}) {
  return (
    <Surface className="min-h-28">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-text-secondary">
        {label}
      </p>
      <AnimatedNumber
        className="mt-3 text-2xl font-extrabold tabular-nums text-brand-navy-900"
        duration={1.4}
        end={value}
        formattingFn={(amount) =>
          currency
            ? formatAuctionPrice(amount, { currency })
            : new Intl.NumberFormat(localeTags[locale], {
                maximumFractionDigits: 0,
              }).format(Math.round(amount))
        }
      />
    </Surface>
  );
}

const bidSectionCopy: Record<Lang, {
  active: string;
  all: string;
  auction: string;
  auctions: string;
  bids: string;
  bidSpend: string;
  biggestBid: string;
  depositSpend: string;
  filter: string;
  filteredEmptyBody: string;
  filteredEmptyTitle: string;
  lastBid: string;
  lost: string;
  maxBid: string;
  pagination: string;
  result: string;
  search: string;
  sort: string;
  newest: string;
  oldest: string;
  mostBids: string;
  won: string;
  wins: string;
}> = {
  en: {
    active: "Participating",
    all: "All results",
    auction: "Auction",
    auctions: "Auctions joined",
    bids: "Bids placed",
    bidSpend: "Bid amount total",
    biggestBid: "Highest bid",
    depositSpend: "Deposit total",
    filter: "Filter bids",
    filteredEmptyBody: "Try changing the search text or selected result.",
    filteredEmptyTitle: "No bids match this view",
    lastBid: "Last bid",
    lost: "Not won",
    maxBid: "Highest bid",
    pagination: "Page {page} of {pages} · {total} auctions",
    result: "Result",
    search: "Search by status or amount",
    sort: "Sort bids",
    newest: "Newest",
    oldest: "Oldest",
    mostBids: "Most bids",
    won: "Won",
    wins: "Won auctions",
  },
  ru: {
    active: "Участвуете",
    all: "Все результаты",
    auction: "Аукцион",
    auctions: "Аукционы с участием",
    bids: "Ставки",
    bidSpend: "Сумма ставок",
    biggestBid: "Крупная ставка",
    depositSpend: "Сумма депозитов",
    filter: "Фильтр ставок",
    filteredEmptyBody: "Попробуйте изменить поиск или выбранный результат.",
    filteredEmptyTitle: "Нет ставок для этого представления",
    lastBid: "Последняя ставка",
    lost: "Не выиграно",
    maxBid: "Максимальная ставка",
    pagination: "Страница {page} из {pages} · аукционов: {total}",
    result: "Результат",
    search: "Поиск по статусу или сумме",
    sort: "Сортировка ставок",
    newest: "Сначала новые",
    oldest: "Сначала старые",
    mostBids: "Больше ставок",
    won: "Выиграно",
    wins: "Выигранные аукционы",
  },
  uz: {
    active: "Ishtirok etyapsiz",
    all: "Barcha natijalar",
    auction: "Auksion",
    auctions: "Ishtirok etgan auksionlar",
    bids: "Berilgan takliflar",
    bidSpend: "Takliflar summasi",
    biggestBid: "Eng katta bid",
    depositSpend: "Depozit summasi",
    filter: "Takliflarni filterlash",
    filteredEmptyBody: "Qidiruv matni yoki tanlangan natijani o‘zgartirib ko‘ring.",
    filteredEmptyTitle: "Bu ko‘rinishda taklif topilmadi",
    lastBid: "Oxirgi taklif",
    lost: "Yutqazilgan",
    maxBid: "Eng yuqori taklif",
    pagination: "{page}/{pages}-sahifa · {total} ta auksion",
    result: "Natija",
    search: "Status yoki summa bo‘yicha qidirish",
    sort: "Takliflarni saralash",
    newest: "Eng yangi",
    oldest: "Eng eski",
    mostBids: "Eng ko‘p bid",
    won: "Yutilgan",
    wins: "Yutgan auksionlar",
  },
};

function listFromUnknown(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = recordFromUnknown(value);
  if (!record) return [];
  for (const key of ["data", "list", "items", "content", "elements"]) {
    const list = listFromUnknown(record[key]);
    if (list.length) return list;
  }
  const meta = recordFromUnknown(record.meta);
  if (meta) return listFromUnknown(meta.list ?? meta.elements);
  return [];
}

function numericAmount(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const number = Number(value.replace(/\s/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function bidAuctionId(bid: UserBidRecord): string {
  return String(bid.auctionId ?? "").trim();
}

function depositAuctionId(deposit: UserDepositRecord): string {
  return String(deposit.auctionId ?? deposit.lotId ?? "").trim();
}

function depositAmount(deposit: UserDepositRecord): number {
  return numericAmount(
    deposit.amount ??
      deposit.depositAmount ??
      deposit.price ??
      deposit.sum,
  );
}

function normalizeBidOutcome(status: unknown): BidOutcome | null {
  const normalized = String(status ?? "").trim().toUpperCase();
  if (!normalized) return null;
  if (
    normalized.includes("WIN") ||
    normalized === "WON" ||
    normalized === "HIGHEST" ||
    normalized === "LEADING"
  ) {
    return "won";
  }
  if (
    normalized.includes("OUTBID") ||
    normalized.includes("LOST") ||
    normalized.includes("LOSE")
  ) {
    return "lost";
  }
  return null;
}

function normalizeBidCurrency(value: unknown): AuctionCurrency {
  const currency = String(value || "").trim().toUpperCase();
  return currency === "USD" || currency === "UZS" ? currency : "UZS";
}

function filterBidSummaries(
  summaries: readonly AuctionBidSummary[],
  filter: "active" | "all" | "lost" | "won",
  search: string,
): AuctionBidSummary[] {
  const keyword = search.trim().toLowerCase();
  return summaries.filter((summary) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && summary.outcome === null) ||
      summary.outcome === filter;
    if (!matchesFilter) return false;
    if (!keyword) return true;

    return [
      summary.latestStatus,
      summary.outcome,
      summary.bidCount,
      summary.bidTotal,
      summary.depositTotal,
      summary.maxBid,
      summary.latestBidAt,
    ]
      .filter((value) => value !== null && value !== undefined)
      .some((value) => String(value).toLowerCase().includes(keyword));
  });
}

function bidSummaryTime(summary: AuctionBidSummary): number {
  const timestamp = summary.latestBidAt ? Date.parse(summary.latestBidAt) : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortBidSummaries(
  summaries: readonly AuctionBidSummary[],
  sort: "bid-desc" | "count-desc" | "newest" | "oldest",
): AuctionBidSummary[] {
  return [...summaries].sort((left, right) => {
    if (sort === "bid-desc") return right.maxBid - left.maxBid;
    if (sort === "count-desc") return right.bidCount - left.bidCount;
    const leftTime = bidSummaryTime(left);
    const rightTime = bidSummaryTime(right);
    return sort === "oldest"
      ? leftTime - rightTime || Number(left.auctionId) - Number(right.auctionId)
      : rightTime - leftTime || Number(right.auctionId) - Number(left.auctionId);
  });
}

function buildBidSummaries(
  bids: readonly UserBidRecord[],
  deposits: readonly UserDepositRecord[],
): AuctionBidSummary[] {
  const depositTotals = new Map<string, number>();
  deposits.forEach((deposit) => {
    const auctionId = depositAuctionId(deposit);
    if (!auctionId) return;
    depositTotals.set(auctionId, (depositTotals.get(auctionId) ?? 0) + depositAmount(deposit));
  });

  const summaries = new Map<string, AuctionBidSummary>();
  bids.forEach((bid) => {
    const auctionId = bidAuctionId(bid);
    if (!auctionId) return;
    const amount = numericAmount(bid.bidAmount);
    const current = summaries.get(auctionId) ?? {
      auctionId,
      bidCount: 0,
      bidTotal: 0,
      currency: normalizeBidCurrency(bid.currency),
      depositTotal: depositTotals.get(auctionId) ?? 0,
      latestBidAt: null,
      latestStatus: null,
      maxBid: 0,
      outcome: null,
    };
    current.bidCount += 1;
    current.bidTotal += amount;
    current.maxBid = Math.max(current.maxBid, amount);
    if (bid.currency) current.currency = normalizeBidCurrency(bid.currency);

    const bidTime = typeof bid.bidTime === "string" ? bid.bidTime : null;
    if (
      bidTime &&
      (!current.latestBidAt || Date.parse(bidTime) >= Date.parse(current.latestBidAt))
    ) {
      current.latestBidAt = bidTime;
      current.latestStatus = String(bid.bidStatus || "").trim() || null;
    }

    const outcome = normalizeBidOutcome(bid.bidStatus);
    current.outcome = outcome === "won" ? "won" : current.outcome ?? outcome;
    summaries.set(auctionId, current);
  });

  depositTotals.forEach((depositTotal, auctionId) => {
    if (summaries.has(auctionId)) return;
    summaries.set(auctionId, {
      auctionId,
      bidCount: 0,
      bidTotal: 0,
      currency: "UZS",
      depositTotal,
      latestBidAt: null,
      latestStatus: null,
      maxBid: 0,
      outcome: null,
    });
  });

  return [...summaries.values()].sort((a, b) => {
    const left = a.latestBidAt ? Date.parse(a.latestBidAt) : 0;
    const right = b.latestBidAt ? Date.parse(b.latestBidAt) : 0;
    return right - left || Number(b.auctionId) - Number(a.auctionId);
  });
}

// ==================== SELLER VEHICLES (Auction feed) ====================

interface SellerVehicleRecord {
  vehicle: Vehicle;
}

export interface SellerAuctionSummary {
  auctionId?: string | number;
  id?: string | number;
  vehicleId?: string | number;
  status?: string;
  dealStatus?: string;
  winnerId?: string | number;
  buyerId?: string | number;
  sold?: boolean;
  currentPrice?: number;
  startPrice?: number;
  reservePrice?: number;
  currency?: string;
  incrementType?: string;
  incrementValue?: number;
  depositPercent?: number;
  startTime?: string;
  endTime?: string;
  vehicle?: Partial<Vehicle> & { vehicleId?: string | number };
}

const sellerAuctionTones: Record<string, StatusBadgeTone> = {
  CANCELED: "danger",
  DRAFT: "neutral",
  FINISHED: "neutral",
  LIVE: "success",
  SCHEDULED: "info",
};

interface SellerMutation {
  isPending?: boolean;
  mutate: (
    payload: unknown,
    options: { onError: (error: unknown) => void; onSuccess: (response?: unknown) => void },
  ) => void;
}

function recordFromUnknown(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

// Narrows an unknown value coming back from the API into a Vehicle, using
// vehicleId as the minimal shape check.
function asVehicle(value: unknown): Vehicle | null {
  const record = recordFromUnknown(value);
  if (!record) return null;
  const vehicleId = Number(record.vehicleId);
  if (!Number.isFinite(vehicleId) || vehicleId <= 0) return null;
  return record as unknown as Vehicle;
}

// Replaces rawLotRecord(): unwraps a single-vehicle API response
// (useVehicleDetail's query.data), which may come back as an object or,
// defensively, as a one-item array.
function rawVehicleRecord(value: unknown): Vehicle | null {
  if (Array.isArray(value)) return asVehicle(value[0]);
  return asVehicle(value);
}

function auctionListFromResponse(value: unknown): SellerAuctionSummary[] {
  const items = recordFromUnknown(value)?.items;
  return Array.isArray(items) ? (items as SellerAuctionSummary[]) : [];
}

function vehicleSellerId(vehicle: Vehicle): string {
  return canonicalAccountId(vehicle.sellerId ?? vehicle.ownerId ?? vehicle.userId);
}

function normalizeSellerAuctionRecords(list: unknown): SellerVehicleRecord[] {
  if (!Array.isArray(list)) return [];
  const vehicles = new Map<number, SellerVehicleRecord>();
  for (const value of list) {
    const auction = recordFromUnknown(value);
    const vehicle = asVehicle(auction?.vehicle);
    if (vehicle) vehicles.set(vehicle.vehicleId, { vehicle });
  }
  return [...vehicles.values()];
}

function vehicleTitle(vehicle: Vehicle, fallbackLabel: string): string {
  const parts = [vehicle.year ? String(vehicle.year) : "", vehicle.makeName, vehicle.modelName]
    .map((part) => (part ?? "").trim())
    .filter(Boolean);
  return parts.length ? parts.join(" ") : `${fallbackLabel} #${vehicle.vehicleId}`;
}

function vehicleImageUrl(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  const image = recordFromUnknown(value);
  for (const key of ["imageUrl", "fileUrl", "url", "path"]) {
    const candidate = image?.[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return null;
}

function vehicleDocumentUrl(value: unknown): string | null {
  const document = recordFromUnknown(value);
  for (const key of ["downloadUrl", "fileUrl", "url", "path"]) {
    const candidate = document?.[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return null;
}

function vehicleDocumentName(value: unknown, fallback: string): string {
  const document = recordFromUnknown(value);
  for (const key of ["fileName", "name", "docType", "type"]) {
    const candidate = document?.[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return fallback;
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function paginationSummary(template: string, shown: number, total: number): string {
  return template
    .replace("{shown}", String(shown))
    .replace("{total}", String(total));
}

function SellerVehiclesLoadingGrid({ label }: { label: string }) {
  return (
    <div
      aria-label={label}
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <Surface
          className="flex min-h-[34rem] flex-col overflow-hidden shadow-[0_12px_30px_rgba(7,31,68,0.07)]"
          key={index}
          padding="none"
        >
          <div className="min-h-56 animate-pulse bg-surface-muted" />
          <div className="flex flex-1 flex-col p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
            <div className="mt-3 h-7 w-3/4 animate-pulse rounded bg-surface-muted" />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="h-4 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 animate-pulse rounded bg-surface-muted" />
            </div>
            <div className="mt-5 space-y-2 border-t border-border-default pt-4">
              <div className="h-4 w-1/2 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
            </div>
            <div className="mt-auto pt-6">
              <div className="h-11 w-full animate-pulse rounded-md bg-surface-muted" />
            </div>
          </div>
        </Surface>
      ))}
    </div>
  );
}

function ArchiveConfirmModal({
  body,
  cancelLabel,
  confirmDisabled = false,
  confirmLabel,
  onCancel,
  onConfirm,
  title,
  titleId,
}: {
  body: string;
  cancelLabel: string;
  confirmDisabled?: boolean;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  titleId: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        aria-label={cancelLabel}
        className="absolute inset-0 cursor-default bg-brand-navy-950/55 backdrop-blur-[2px]"
        onClick={onCancel}
        type="button"
      />
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-lg border border-semantic-danger/30 bg-white p-6 shadow-2xl outline-none"
        ref={dialogRef}
        role="alertdialog"
        tabIndex={-1}
      >
        <h4 className="text-xl font-extrabold text-brand-navy-900" id={titleId}>{title}</h4>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{body}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onCancel} variant="ghost">{cancelLabel}</Button>
          <Button disabled={confirmDisabled} onClick={onConfirm} variant="danger">{confirmLabel}</Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SellerVehicleCard({
  auction,
  onOpenAuction,
  record,
  showAuctionAction,
}: {
  auction?: SellerAuctionSummary;
  onOpenAuction: (vehicle: Vehicle, auction?: SellerAuctionSummary) => void;
  record: SellerVehicleRecord;
  showAuctionAction: boolean;
}) {
  const { copy, currentLang } = useLiveCopy();
  const sellerCopy = sellerCopyByLocale[currentLang];
  const { vehicle } = record;
  const title = vehicleTitle(vehicle, copy.vehicles);
  const images = Array.isArray(vehicle.imageUrls) && vehicle.imageUrls.length
    ? vehicle.imageUrls
    : Array.isArray(vehicle.images) ? vehicle.images : [];
  const documents = Array.isArray(vehicle.documents) ? vehicle.documents : [];
  const carouselImages = [...images]
    .sort((left, right) => {
      const leftPrimary = typeof left === "object" && left !== null && "isPrimary" in left
        ? Boolean(left.isPrimary)
        : false;
      const rightPrimary = typeof right === "object" && right !== null && "isPrimary" in right
        ? Boolean(right.isPrimary)
        : false;
      return Number(rightPrimary) - Number(leftPrimary);
    })
    .flatMap((image) => {
      const url = vehicleImageUrl(image);
      return url ? [{ image, url }] : [];
    });
  const activeImage = carouselImages[0]?.url || null;
  const canCreateAuction = showAuctionAction && (auction ? canRelistAuction(auction) : true);

  return (
    <Surface className="flex min-h-[34rem] flex-col overflow-hidden shadow-[0_12px_30px_rgba(7,31,68,0.07)]" padding="none">
      <div
        className="relative min-h-56 border-b border-border-default bg-[#f4f1eb]"
      >
        {auction ? <div className="absolute right-4 top-4 z-20 rounded-md bg-white/95 px-3 py-2 text-right shadow-md"><StatusBadge tone={sellerAuctionTones[String(auction.status ?? "").toUpperCase()] ?? "neutral"}>{translateBackendValue(auction.status, currentLang)}</StatusBadge>{auction.startTime ? <p className="mt-1 text-xs font-bold text-brand-navy-900">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(auction.startTime))}</p> : null}</div> : null}
        {activeImage ? (
          <div className="relative h-full min-h-56 overflow-hidden">
          <div
            aria-label={`${title} · ${sellerCopy.images}`}
            className="vehicle-carousel-image min-h-56 bg-cover bg-center"
            key={activeImage}
            role="img"
            style={{ backgroundImage: `url(${JSON.stringify(activeImage)})` }}
          />
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <div
              aria-label={`${title} · ${sellerCopy.images}`}
              className="size-28 rounded-full border border-brand-champagne-500 bg-contain bg-center bg-no-repeat"
              role="img"
              style={{ backgroundImage: "url('/icon.png')" }}
            />
            <p className="mt-3 rounded-md bg-white px-3 py-1 text-xs font-bold text-text-secondary">{copy.notProvided}</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-gold-text">LOT #{vehicle.vehicleId}</p>
        <h3 className="mt-2 text-xl font-extrabold text-brand-navy-900">{title}</h3>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-text-secondary">
          {vehicle.year ? (
            <div className="flex items-center gap-2"><CalendarDays aria-hidden="true" size={16} /><dt className="sr-only">{sellerCopy.year}</dt><dd>{vehicle.year}</dd></div>
          ) : null}
          {vehicle.mileage !== undefined ? (
            <div className="flex items-center gap-2"><Gauge aria-hidden="true" size={16} /><dt className="sr-only">{sellerCopy.mileage}</dt><dd>{vehicle.mileage.toLocaleString()} km</dd></div>
          ) : null}
          {vehicle.region ? (
            <div className="flex items-center gap-2"><MapPin aria-hidden="true" size={16} /><dt className="sr-only">{sellerCopy.region}</dt><dd>{vehicle.region}</dd></div>
          ) : null}
          {vehicle.fuelType ? (
            <div className="flex items-center gap-2"><Fuel aria-hidden="true" size={16} /><dt className="sr-only">{sellerCopy.fuelType}</dt><dd>{translateBackendValue(vehicle.fuelType, currentLang)}</dd></div>
          ) : null}
          {documents.length ? (
            <div className="col-span-2 flex items-start gap-2">
              <FileText aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
              <div>
                <dt>{sellerCopy.documents}: {documents.length}</dt>
                <dd>
                  <ul className="mt-1 space-y-1">
                    {documents.map((document, index) => {
                      const url = vehicleDocumentUrl(document);
                      if (!url) return null;
                      return (
                        <li key={String(document.documentId ?? document.id ?? index)}>
                          <a className="font-bold text-brand-navy-900 underline underline-offset-4" download href={url} rel="noreferrer" target="_blank">
                            {vehicleDocumentName(document, `${sellerCopy.documents} ${index + 1}`)} · {sellerCopy.download}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </dd>
              </div>
            </div>
          ) : null}
        </dl>

        <dl className="mt-5 space-y-2 border-t border-border-default pt-4 text-sm text-text-secondary">
          {vehicle.color ? (
            <div className="flex gap-1"><dt className="font-bold text-text-primary">{sellerCopy.color}:</dt><dd>{vehicle.color}</dd></div>
          ) : null}
          {vehicle.vin ? (
            <div className="flex min-w-0 gap-1"><dt className="shrink-0 font-bold text-text-primary">{sellerCopy.vin}:</dt><dd className="truncate">{vehicle.vin}</dd></div>
          ) : null}
          {vehicle.description ? (
                     <div className="flex min-w-0 gap-1"><dt className="shrink-0 font-bold text-text-primary">{sellerCopy.description}:</dt><dd className="truncate">{vehicle.description}</dd></div>

          ) : null}
        </dl>

        <div className="mt-auto grid gap-2 pt-6">
          <Link
            aria-label={`${sellerCopy.edit} ${title}: ${copy.viewDetails}`}
            className="inline-flex min-h-11 w-full items-center capitalize justify-center rounded-md border border-border-default bg-white px-4 text-sm font-extrabold text-brand-navy-900 transition-colors hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            href={`/dashboard/vehicles/${vehicle.vehicleId}`}
          >
            {copy.viewDetails}
          </Link>
          {canCreateAuction ? (
            <button
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-champagne-500 px-4 text-sm font-extrabold text-brand-navy-950 transition-colors hover:bg-brand-champagne-600"
              onClick={() => onOpenAuction(vehicle, auction)}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={17} />
              {auction ? ({ uz: "Qayta auksionga qo‘yish", en: "Relist for auction", ru: "Выставить повторно" } as const)[currentLang] : ({ uz: "Auksion yaratish", en: "Create auction", ru: "Создать аукцион" } as const)[currentLang]}
            </button>
          ) : null}
        </div>
      </div>
    </Surface>
  );
}

export function SellerVehiclesSection({
  auctionByVehicleId,
  userId,
}: {
  auctionByVehicleId?: ReadonlyMap<string, SellerAuctionSummary>;
  userId?: string | number;
}) {
  const { copy, currentLang } = useLiveCopy();
  const accountId = canonicalAccountId(userId);
  const sellerCopy = sellerCopyByLocale[currentLang];
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedSearch = searchQuery.trim();
  const debouncedSearch = useDebounce(normalizedSearch, 350);
  const query = useAuctionFeed({
    page,
    search: debouncedSearch,
    sellerId: accountId,
    size: pageSize,
  }) as unknown as QuerySnapshot;
  const [auctionTarget, setAuctionTarget] = useState<{ auction?: SellerAuctionSummary; vehicle: Vehicle } | null>(null);
  const auctions = useMemo(() => auctionListFromResponse(query.data), [query.data]);
  const records = useMemo(
    () => normalizeSellerAuctionRecords(auctions)
      .filter((record) => {
        const ownerId = vehicleSellerId(record.vehicle);
        return !ownerId || ownerId === accountId;
      }),
    [accountId, auctions],
  );
  const meta = recordFromUnknown(query.data)?.meta as { pages?: unknown; elements?: unknown } | undefined;
  const totalPagesRaw = Number(meta?.pages ?? 1);
  const totalPages = Number.isFinite(totalPagesRaw) && totalPagesRaw > 0 ? totalPagesRaw : 1;
  const totalElementsRaw = Number(meta?.elements ?? records.length);
  const totalElements = Number.isFinite(totalElementsRaw) && totalElementsRaw >= 0
    ? totalElementsRaw
    : records.length;
  const auctionsByVehicle = useMemo(() => {
    const result = new Map<string, SellerAuctionSummary>();
    const vehicleIds = new Set(auctions.map((auction) => String(auction.vehicleId ?? auction.vehicle?.vehicleId ?? "").trim()).filter(Boolean));
    for (const vehicleId of vehicleIds) {
      const auction = selectVehicleAuction(auctions, vehicleId);
      if (auction) result.set(vehicleId, auction);
    }
    return result;
  }, [auctions]);

  if (!accountId) return missingAccount(copy);
  const hasBackendFilters = normalizedSearch.length > 0;
  const state = queryState(
    query,
    copy,
    records.length === 0 && !hasBackendFilters,
    copy.empty.vehicles,
  );
  if (state && !query.isLoading) return state;

  return (
    <div className="space-y-7">
      <Surface className="space-y-4 overflow-hidden border-brand-champagne-500/35 bg-[linear-gradient(135deg,rgba(244,208,111,0.12),rgba(255,255,255,0.96)_42%,rgba(7,31,68,0.03))]">
        <div className="flex flex-wrap items-center gap-3">
            <label className="relative block w-full lg:w-[24rem]">
              <span className="sr-only">{sellerCopy.search}</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                size={16}
              />
              <input
                aria-label={sellerCopy.search}
                className="min-h-11 w-full rounded-md border border-border-default bg-white pl-9 pr-3 text-sm text-brand-navy-900 shadow-sm outline-none transition focus:border-brand-navy-700 focus:ring-2 focus:ring-brand-champagne-500/35"
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(0);
                }}
                placeholder={sellerCopy.search}
                type="search"
                value={searchQuery}
              />
            </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/70 pt-4 lg:border-t-0 lg:pt-0">
          <p className="w-full text-sm font-bold text-text-secondary lg:ml-auto lg:w-auto">
            {paginationSummary(
              sellerCopy.paginationSummary,
              records.length,
              totalElements,
            )}
          </p>
        </div>
      </Surface>

      {query.isLoading ? <SellerVehiclesLoadingGrid label={translateUiText("loadingVehicles", currentLang)} /> : null}
      {!query.isLoading && !records.length ? (
        <StatePanel
          icon={<CarFront size={32} />}
          title={sellerCopy.emptyFilteredVehicles[0]}
          description={sellerCopy.emptyFilteredVehicles[1]}
        />
      ) : null}
      {!query.isLoading && records.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {records.map((record) => {
            const key = String(record.vehicle.vehicleId);
            return (
              <SellerVehicleCard
                auction={auctionByVehicleId?.get(key) ?? auctionsByVehicle.get(key)}
                key={key}
                onOpenAuction={(vehicle, auction) => setAuctionTarget({ auction, vehicle })}
                record={record}
                showAuctionAction
              />
            );
          })}
        </div>
      ) : null}
      {!query.isLoading && records.length ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <PageSizeSelect disabled={query.isLoading} value={pageSize} onChange={(size) => { setPageSize(size); setPage(0); }} />
          <button
            aria-label={sellerCopy.previousPage}
            className="rounded-md border border-border-default bg-white p-2 text-brand-navy-900 disabled:opacity-40"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <span className="text-sm font-bold text-brand-navy-900">
            {sellerCopy.page} {page + 1} / {totalPages}
          </span>
          <button
            aria-label={sellerCopy.nextPage}
            className="rounded-md border border-border-default bg-white p-2 text-brand-navy-900 disabled:opacity-40"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            type="button"
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
      ) : null}
      {auctionTarget ? <VehicleAuctionModal auction={auctionTarget.auction as DashboardAuction | undefined} onClose={() => setAuctionTarget(null)} vehicle={auctionTarget.vehicle as VehicleOption}/> : null}
    </div>
  );
}

export function SellerVehicleDetailSection({
  auction,
  auctionLoading = false,
  userId,
  vehicleId,
}: {
  auction?: SellerAuctionSummary;
  auctionLoading?: boolean;
  userId?: string | number;
  vehicleId: string;
}) {
  const router = useRouter();
  const { copy, currentLang } = useLiveCopy();
  const accountId = canonicalAccountId(userId);
  const sellerCopy = sellerCopyByLocale[currentLang];
  const nestedVehicle = asVehicle(auction?.vehicle);
  const query = useVehicleDetail(auctionLoading || nestedVehicle ? null : vehicleId) as unknown as QuerySnapshot;
  const updateVehicle = useUpdateVehicle() as unknown as SellerMutation;
  const deleteImage = useDeleteVehicleImage() as unknown as SellerMutation;
  const setPrimaryImage = useSetPrimaryVehicleImage() as unknown as SellerMutation;
  const vehicle = nestedVehicle ?? rawVehicleRecord(query.data);
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; tone: "error" | "success" } | null>(null);
  const [draft, setDraft] = useState({ bodyType: "", color: "", conditionGrade: "", description: "", drivetrain: "", engineVolume: "", fuelType: "", makeId: "", mileage: "", modelId: "", region: "", transmission: "", vin: "", year: "" });
  const makesQuery = useVehicleMakes();
  const modelsQuery = useVehicleModels(draft.makeId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | number | null>(null);
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const title = vehicle ? vehicleTitle(vehicle, copy.vehicles) : "";
  const detailImageSource = Array.isArray(vehicle?.imageUrls) && vehicle.imageUrls.length
    ? vehicle.imageUrls
    : Array.isArray(vehicle?.images) ? vehicle.images : [];
  const detailImages = [...detailImageSource]
    .sort((left, right) => Number(Boolean(recordFromUnknown(right)?.isPrimary)) - Number(Boolean(recordFromUnknown(left)?.isPrimary)))
    .flatMap((image) => {
      const url = vehicleImageUrl(image);
      return url ? [{ image, url }] : [];
    });
  const documents = Array.isArray(vehicle?.documents) ? vehicle.documents : [];
  const visibleImageIndex = detailImages.length ? activeImageIndex % detailImages.length : 0;
  const activeImage = detailImages[visibleImageIndex];
  const activeImageRecord = recordFromUnknown(activeImage?.image);
  const activeImageIdValue = activeImageRecord?.imageId ?? activeImageRecord?.id;
  const activeImageId = typeof activeImageIdValue === "string" || typeof activeImageIdValue === "number"
    ? activeImageIdValue
    : null;
  const activeImageIsPrimary = Boolean(activeImageRecord?.isPrimary);
  const auctionPrice = auction?.currentPrice ?? auction?.startPrice;
  const auctionDetailsCopy = {
    uz: { auction: "Auksion ma’lumotlari", back: "Qaytish", createAuction: "Auksion yaratish", relistAuction: "Qayta auksionga qo‘yish", currentPrice: "Joriy narx", deposit: "Depozit", end: "Tugash vaqti", increment: "Narx qadami", noAuction: "Bu avtomobil uchun auksion hali yaratilmagan.", reservePrice: "Rezerv narx", start: "Boshlanish vaqti", startPrice: "Boshlang‘ich narx", status: "Holat", vehicle: "Avtomobil ma’lumotlari" },
    en: { auction: "Auction information", back: "Back", createAuction: "Create auction", relistAuction: "Relist for auction", currentPrice: "Current price", deposit: "Deposit", end: "End time", increment: "Bid increment", noAuction: "No auction has been created for this vehicle yet.", reservePrice: "Reserve price", start: "Start time", startPrice: "Start price", status: "Status", vehicle: "Vehicle information" },
    ru: { auction: "Информация об аукционе", back: "Вернуться", createAuction: "Создать аукцион", relistAuction: "Выставить повторно", currentPrice: "Текущая цена", deposit: "Депозит", end: "Окончание", increment: "Шаг ставки", noAuction: "Для этого автомобиля аукцион ещё не создан.", reservePrice: "Резервная цена", start: "Начало", startPrice: "Стартовая цена", status: "Статус", vehicle: "Информация об автомобиле" },
  }[currentLang];
  const formatAuctionMoney = (value?: number) => value == null
    ? "—"
    : new Intl.NumberFormat(undefined, { currency: auction?.currency ?? "UZS", maximumFractionDigits: 2, style: "currency" }).format(value);
  const formatAuctionDate = (value?: string) => !value || Number.isNaN(Date.parse(value))
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

  useEffect(() => {
    if (carouselPaused || detailImages.length < 2 || prefersReducedMotion()) return;
    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % detailImages.length);
    }, 4_500);
    return () => window.clearInterval(interval);
  }, [carouselPaused, detailImages.length]);

  if (!accountId) return missingAccount(copy);
  if (auctionLoading) return <AuctionDetailSkeleton label={copy.loadingTitle} />;
  if (query.isLoading) return <AuctionDetailSkeleton label={copy.loadingTitle} />;
  const state = queryState(query, copy, vehicle === null, copy.empty.vehicles);
  if (state) return state;
  if (!vehicle) return null;
  const ownerId = vehicleSellerId(vehicle);
  if (ownerId && ownerId !== accountId) {
    return (
      <StatePanel
        description={sellerCopy.ownershipBody}
        icon={<ShieldAlert size={32} />}
        title={sellerCopy.ownershipTitle}
      />
    );
  }

  const canCreateAuction = auction ? canRelistAuction(auction) : true;

  const submitUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericYear = Number(draft.year);
    if (!draft.description.trim() || !Number.isFinite(numericYear) || numericYear < 1900) return;
    setFeedback(null);
    updateVehicle.mutate(
      {
        form: {
          bodyType: draft.bodyType,
          color: draft.color.trim(),
          conditionGrade: draft.conditionGrade,
          description: draft.description.trim(),
          drivetrain: draft.drivetrain,
          engineVolume: draft.engineVolume,
          fuelType: draft.fuelType,
          makeId: draft.makeId,
          mileage: draft.mileage,
          modelId: draft.modelId,
          region: draft.region.trim(),
          transmission: draft.transmission,
          vin: draft.vin.trim(),
          year: numericYear,
        },
        id: vehicle.vehicleId,
      },
      {
        onError: (error) => setFeedback({ message: apiErrorMessage(error, sellerCopy.updateError), tone: "error" }),
        onSuccess: (response) => {
          const confirmed = mutationWasConfirmed(response);
          setFeedback({
            message: confirmed ? sellerCopy.updated : sellerCopy.updateError,
            tone: confirmed ? "success" : "error",
          });
          if (confirmed) setEditing(false);
        },
      },
    );
  };

  const makePrimaryImage = () => {
    if (activeImageId === undefined || activeImageId === null) return;
    setFeedback(null);
    setPrimaryImage.mutate({ imageId: activeImageId, vehicleId: vehicle.vehicleId }, {
      onError: () => setFeedback({ message: sellerCopy.imageActionError, tone: "error" }),
      onSuccess: () => setFeedback({ message: sellerCopy.imageUpdated, tone: "success" }),
    });
  };

  const confirmDeleteImage = () => {
    if (deletingImageId === null) return;
    deleteImage.mutate({ imageId: deletingImageId, vehicleId: vehicle.vehicleId }, {
      onError: () => setFeedback({ message: sellerCopy.imageActionError, tone: "error" }),
      onSuccess: () => {
        setActiveImageIndex(0);
        setFeedback({ message: sellerCopy.imageUpdated, tone: "success" });
      },
    });
    setDeletingImageId(null);
  };

  return (
    <div>
      <button
        className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-border-default bg-surface-primary px-4 text-sm font-bold text-brand-navy-900 transition-colors hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        onClick={() => router.push("/dashboard/vehicles")}
        type="button"
      >
        <ArrowLeft aria-hidden="true" size={18}/>
        {auctionDetailsCopy.back}
      </button>
      <Surface>
      {feedback ? (
        <p className={feedback.tone === "success" ? "mb-4 text-sm font-bold text-semantic-success" : "mb-4 text-sm font-bold text-semantic-danger"} role={feedback.tone === "success" ? "status" : "alert"}>
          {feedback.message}
        </p>
      ) : null}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-gold-text">
            Id:#{vehicle.vehicleId}
          </p>
          <h2 className="mt-3 text-2xl font-extrabold text-brand-navy-900">{title}</h2>
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
            {/* {vehicle.color ? (
              // <div><dt className="sr-only">{sellerCopy.color}</dt><dd>{vehicle.color}</dd></div>
            ) : null} */}
            {vehicle.region ? (
              <div><dt className="sr-only">{sellerCopy.region}</dt><dd>{vehicle.region}</dd></div>
            ) : null}
            {vehicle.vin ? (
              <div><dt className="sr-only">{sellerCopy.vin}</dt><dd>{vehicle.vin}</dd></div>
            ) : null}
          </dl>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <section
          aria-label={sellerCopy.images}
          className="relative min-h-72 overflow-hidden rounded-lg border border-border-default bg-[#f4f1eb]"
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCarouselPaused(false);
          }}
          onFocusCapture={() => setCarouselPaused(true)}
          onMouseEnter={() => setCarouselPaused(true)}
          onMouseLeave={() => setCarouselPaused(false)}
        >
          {activeImageId !== undefined && activeImageId !== null ? (
            <div className="absolute right-3 top-3 z-20 flex gap-2">
              <button aria-label={sellerCopy.setPrimaryImage} className="flex size-11 items-center justify-center rounded-full bg-white/95 text-brand-navy-900 shadow-md disabled:opacity-50" disabled={activeImageIsPrimary || setPrimaryImage.isPending} onClick={makePrimaryImage} type="button"><Star aria-hidden="true" fill={activeImageIsPrimary ? "currentColor" : "none"} size={20}/></button>
              <button aria-label={sellerCopy.deleteImage} className="flex size-11 items-center justify-center rounded-full bg-white/95 text-semantic-danger shadow-md disabled:opacity-50" disabled={Boolean(deleteImage.isPending)} onClick={() => setDeletingImageId(activeImageId)} type="button"><Trash2 aria-hidden="true" size={20}/></button>
            </div>
          ) : null}
          {activeImage ? (
            <>
              <div
                aria-label={`${title} · ${sellerCopy.images} ${visibleImageIndex + 1}`}
                className="vehicle-carousel-image min-h-72 bg-contain bg-center bg-no-repeat sm:min-h-96"
                key={activeImage.url}
                role="img"
                style={{ backgroundImage: `url(${JSON.stringify(activeImage.url)})` }}
              />
              {detailImages.length > 1 ? (
                <>
                  <button
                    aria-label={sellerCopy.previousImage}
                    className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-navy-900/85 text-white shadow-md"
                    onClick={() => setActiveImageIndex((current) => (current - 1 + detailImages.length) % detailImages.length)}
                    type="button"
                  >
                    <ChevronLeft aria-hidden="true" size={22} />
                  </button>
                  <button
                    aria-label={sellerCopy.nextImage}
                    className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-navy-900/85 text-white shadow-md"
                    onClick={() => setActiveImageIndex((current) => (current + 1) % detailImages.length)}
                    type="button"
                  >
                    <ChevronRight aria-hidden="true" size={22} />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-brand-navy-900/85 px-3 py-1 text-xs font-bold text-white">
                    {visibleImageIndex + 1} / {detailImages.length}
                  </span>
                </>
              ) : null}
            </>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center sm:min-h-96">
              <CarFront aria-hidden="true" className="text-brand-champagne-600" size={64} />
              <p className="mt-3 text-sm font-bold text-text-secondary">{copy.notProvided}</p>
            </div>
          )}
        </section>

        <aside className="rounded-lg border border-brand-champagne-500/45 bg-brand-champagne-50 p-5" aria-labelledby="vehicle-auction-title">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-extrabold text-brand-navy-900" id="vehicle-auction-title">{auctionDetailsCopy.auction}</h3>
            {auction ? <StatusBadge tone={sellerAuctionTones[String(auction.status ?? "").toUpperCase()] ?? "neutral"}>{translateBackendValue(auction.status, currentLang)}</StatusBadge> : null}
          </div>
          {auction ? (
            <>
              <dl className="mt-5 grid gap-3 text-sm">
                {[
                  [auctionDetailsCopy.currentPrice, formatAuctionMoney(auctionPrice)],
                  [auctionDetailsCopy.startPrice, formatAuctionMoney(auction.startPrice)],
                  [auctionDetailsCopy.reservePrice, formatAuctionMoney(auction.reservePrice)],
                  [auctionDetailsCopy.increment, auction.incrementValue == null ? "—" : `${auction.incrementValue} ${translateBackendValue(auction.incrementType, currentLang, "")}`.trim()],
                  [auctionDetailsCopy.deposit, auction.depositPercent == null ? "—" : `${auction.depositPercent}%`],
                  [auctionDetailsCopy.start, formatAuctionDate(auction.startTime)],
                  [auctionDetailsCopy.end, formatAuctionDate(auction.endTime)],
                ].map(([label, value]) => (
                  <div className="flex justify-between gap-4 border-b border-brand-champagne-500/35 pb-2 last:border-0" key={String(label)}>
                    <dt className="text-text-secondary">{label}</dt>
                    <dd className="min-w-0 break-words text-right font-bold text-brand-navy-900">{String(value)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5">
                <Link
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-navy-900 px-4 text-sm font-extrabold text-white transition-colors hover:bg-brand-navy-800"
                  href={`/auctions/${vehicleId}`}
                >
                  {copy.viewAuction}
                </Link>
              </div>
            </>
          ) : <p className="mt-4 text-sm leading-6 text-text-secondary">{auctionDetailsCopy.noAuction}</p>}
          {canCreateAuction ? (
            <button
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-champagne-500 px-4 text-sm font-extrabold text-brand-navy-950 transition-colors hover:bg-brand-champagne-600"
              onClick={() => setAuctionModalOpen(true)}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={17} />
              {auction ? auctionDetailsCopy.relistAuction : auctionDetailsCopy.createAuction}
            </button>
          ) : null}
        </aside>
      </div>

      <section className="mt-6 rounded-lg border border-border-default bg-surface-muted p-5" aria-labelledby="vehicle-information-title">
        <h3 className="text-lg font-extrabold text-brand-navy-900" id="vehicle-information-title">{auctionDetailsCopy.vehicle}</h3>
        <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          {[
            [sellerCopy.year, vehicle.year],
            [sellerCopy.mileage, vehicle.mileage !== undefined ? `${vehicle.mileage.toLocaleString()} km` : null],
            [sellerCopy.engineVolume, vehicle.engineVolume],
            [sellerCopy.fuelType, translateBackendValue(vehicle.fuelType, currentLang, "")],
            [sellerCopy.transmission, translateBackendValue(vehicle.transmission, currentLang, "")],
            [sellerCopy.drivetrain, translateBackendValue(vehicle.drivetrain, currentLang, "")],
            [sellerCopy.bodyType, translateBackendValue(vehicle.bodyType, currentLang, "")],
            [sellerCopy.conditionGrade, translateBackendValue(vehicle.conditionGrade, currentLang, "")],
            [sellerCopy.color, vehicle.color],
            [sellerCopy.region, vehicle.region],
            [sellerCopy.vin, vehicle.vin],
          ].map(([label, value]) => value !== undefined && value !== null && value !== "" ? (
            <div className="flex justify-between gap-4 border-b border-border-default pb-2" key={String(label)}>
              <dt className="text-text-secondary">{label}</dt>
              <dd className="min-w-0 break-words text-right font-bold text-brand-navy-900">{String(value)}</dd>
            </div>
          ) : null)}
        </dl>
      </section>

      {documents.length ? (
        <section className="mt-6 rounded-lg border border-border-default p-5" aria-labelledby="vehicle-documents-title">
          <h3 className="font-extrabold text-brand-navy-900" id="vehicle-documents-title">
            {sellerCopy.documents}: {documents.length}
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {documents.map((document, index) => {
              const url = vehicleDocumentUrl(document);
              const name = vehicleDocumentName(document, `${sellerCopy.documents} ${index + 1}`);
              return (
                <li key={String(document.documentId ?? document.id ?? index)}>
                  {url ? (
                    <a className="flex min-h-11 items-center gap-2 rounded-md bg-surface-muted px-4 text-sm font-bold text-brand-navy-900 underline-offset-4 hover:underline" download href={url} rel="noreferrer" target="_blank">
                      <FileText aria-hidden="true" size={17} /> {name} · {sellerCopy.download}
                    </a>
                  ) : (
                    <span className="flex min-h-11 items-center gap-2 rounded-md bg-surface-muted px-4 text-sm text-text-secondary">
                      <FileText aria-hidden="true" size={17} /> {name}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {vehicle.description ? (
        <p className="mt-4 text-sm leading-6 text-text-secondary">{vehicle.description}</p>
      ) : null}

      {editing ? (
        <form className="mt-6 grid gap-4 rounded-md border border-border-default bg-surface-muted p-4 sm:grid-cols-2" onSubmit={submitUpdate}>
          <div className="text-sm font-bold text-brand-navy-900">{sellerCopy.make}<AppSelect className="mt-2" onChange={(val) => setDraft((current) => ({ ...current, makeId: String(val), modelId: "" }))} options={[{ value: "", label: "—" }, ...(makesQuery.data ?? []).map((item) => ({ value: item.id, label: item.name }))] } value={draft.makeId} /></div>
          <div className="text-sm font-bold text-brand-navy-900">{sellerCopy.model}<AppSelect className="mt-2" disabled={!draft.makeId || modelsQuery.isLoading} onChange={(val) => setDraft((current) => ({ ...current, modelId: String(val) }))} options={[{ value: "", label: "—" }, ...(modelsQuery.data ?? []).map((item) => ({ value: item.id, label: item.name }))] } value={draft.modelId} /></div>
          {[
            ["year", sellerCopy.year, "number"], ["vin", sellerCopy.vin, "text"], ["mileage", sellerCopy.mileage, "number"], ["engineVolume", sellerCopy.engineVolume, "number"], ["color", sellerCopy.color, "text"], ["region", sellerCopy.region, "text"],
          ].map(([name, label, type]) => <label className="text-sm font-bold text-brand-navy-900" key={name}>{label}<input className="mt-2 min-h-12 w-full rounded-md border border-border-default bg-white px-4 font-normal outline-none focus:border-focus-ring" min={type === "number" ? "0" : undefined} onChange={(event) => setDraft((current) => ({ ...current, [name]: event.target.value }))} required type={type} value={draft[name as keyof typeof draft]}/></label>)}
          {[
            ["fuelType", sellerCopy.fuelType, ["PETROL", "DIESEL", "GAS", "HYBRID", "ELECTRIC"]],
            ["transmission", sellerCopy.transmission, ["MANUAL", "AUTOMATIC", "CVT", "ROBOT"]],
            ["drivetrain", sellerCopy.drivetrain, ["FWD", "RWD", "AWD"]],
            ["bodyType", sellerCopy.bodyType, ["SEDAN", "SUV", "HATCHBACK", "WAGON", "COUPE", "PICKUP", "VAN"]],
            ["conditionGrade", sellerCopy.conditionGrade, ["EXCELLENT", "GOOD", "DAMAGED", "NOT_RUNNING"]],
          ].map(([name, label, options]) => <div className="text-sm font-bold text-brand-navy-900" key={String(name)}>{String(label)}<AppSelect className="mt-2" onChange={(val) => setDraft((current) => ({ ...current, [String(name)]: String(val) }))} options={(options as string[]).map((opt) => ({ value: opt, label: opt }))} value={draft[name as keyof typeof draft]} /></div>)}
          <label className="text-sm font-bold text-brand-navy-900 sm:col-span-2">{sellerCopy.description}<textarea className="mt-2 min-h-24 w-full rounded-md border border-border-default bg-white px-4 py-3 font-normal outline-none focus:border-focus-ring" onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} required value={draft.description}/></label>
          <div className="flex items-end gap-2">
            <Button disabled={Boolean(updateVehicle.isPending)} type="submit">{sellerCopy.save}</Button>
            <Button onClick={() => setEditing(false)} variant="ghost">{sellerCopy.cancel}</Button>
          </div>
        </form>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          aria-label={sellerCopy.editTitle}
          onClick={() => {
            router.push(`/dashboard/vehicles/new?edit=${encodeURIComponent(String(vehicle.vehicleId))}`);
          }}
          variant="outline"
        >
          {sellerCopy.editTitle}
        </Button>
      </div>

      {deletingImageId !== null ? <ArchiveConfirmModal body={sellerCopy.deleteImageBody} cancelLabel={sellerCopy.cancel} confirmLabel={sellerCopy.deleteImage} onCancel={() => setDeletingImageId(null)} onConfirm={confirmDeleteImage} title={sellerCopy.deleteImageTitle} titleId={`detail-delete-image-${vehicle.vehicleId}`} /> : null}
      </Surface>
      {auctionModalOpen ? <VehicleAuctionModal auction={auction as DashboardAuction | undefined} onClose={() => setAuctionModalOpen(false)} vehicle={vehicle as VehicleOption}/> : null}
    </div>
  );
}

// ==================== PAYMENTS / NOTIFICATIONS / PROFILE ====================
export function transactionType(value: unknown): string {
  return typeof value === "string" && value.trim()
    ? value.trim().toUpperCase()
    : "UNKNOWN";
}

export function confirmedCurrency(value: unknown): "USD" | "UZS" | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return normalized === "USD" || normalized === "UZS" ? normalized : null;
}

export function formatAmount(
  value: unknown,
  locale: Lang,
  currency: "USD" | "UZS" | null,
  currencyUnknown: string,
): string {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "—";
  const formatted = new Intl.NumberFormat(localeTags[locale], {
    maximumFractionDigits: 2,
    minimumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(amount);
  return currency ? `${currency} ${formatted}` : `${formatted} · ${currencyUnknown}`;
}

export function formatDate(value: unknown, locale: Lang): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return "—";
  return new Intl.DateTimeFormat(localeTags[locale], {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PaymentsSection({ userId }: { userId?: string | number }) {
  const { copy, currentLang } = useLiveCopy();
  const accountId = canonicalAccountId(userId);
  const query = useMyPayments(accountId, 0, 20) as unknown as QuerySnapshot;
  const page = query.data as { list?: TransactionRecord[] } | undefined;
  const rows = Array.isArray(page?.list) ? page.list : [];

  if (!accountId) return missingAccount(copy);
  const state = queryState(query, copy, rows.length === 0, copy.empty.payments);
  if (state) return state;

  return (
    <Surface className="overflow-x-auto" padding="none">
      <table aria-label={copy.payments} className="w-full min-w-[42rem] border-collapse">
        <thead className="bg-surface-muted text-left text-xs font-extrabold uppercase tracking-[0.1em] text-text-secondary">
          <tr>
            <th className="px-5 py-3" scope="col">{copy.reference}</th> 
            <th className="px-5 py-3" scope="col">{copy.type}</th>
            <th className="px-5 py-3" scope="col">{copy.amount}</th>
            <th className="px-5 py-3" scope="col">{copy.date}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default">
          {rows.map((row, index) => {
            const type = transactionType(row.paymentType ?? row.transactionType ?? row.type ?? row.paymentMethod);
            const currency = confirmedCurrency(row.currency);
            return (
              <tr key={String(row.paymentId ?? row.id ?? index)}>
                <td className="px-5 py-4 font-bold">{String(row.paymentId ?? row.id ?? index + 1)}</td>
                <td className="px-5 py-4">
                  {copy.transactionTypes[type] ?? (type === "UNKNOWN" ? copy.transactionTypes.UNKNOWN : type)}
                </td>
                <td className="px-5 py-4 font-extrabold tabular-nums">
                  {formatAmount(row.amount, currentLang, currency, copy.currencyUnknown)}
                </td>
                <td className="px-5 py-4 text-sm text-text-secondary">
                  {formatDate(row.createdAt ?? row.paidAt ?? row.paymentTime ?? row.transactionTime, currentLang)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Surface>
  );
}

function asNotificationRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function notificationText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function parseNotificationJson(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "string" || !value.trim().startsWith("{")) return null;
  try {
    return asNotificationRecord(JSON.parse(value));
  } catch {
    return null;
  }
}

function notificationMetadata(record: Record<string, unknown>): Record<string, unknown> {
  const nested = [
    record.metadata,
    record.meta,
    record.payload,
    record.data,
    record.details,
    record.extra,
  ]
    .map((value) => asNotificationRecord(value) ?? parseNotificationJson(value))
    .filter((value): value is Record<string, unknown> => Boolean(value));

  return Object.assign({}, ...nested, record);
}

function findNotificationValue(
  record: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  const meta = notificationMetadata(record);
  for (const key of keys) {
    const direct = notificationText(meta[key]);
    if (direct) return direct;
  }
  for (const value of Object.values(meta)) {
    const child = asNotificationRecord(value) ?? parseNotificationJson(value);
    if (!child) continue;
    const found = findNotificationValue(child, keys);
    if (found) return found;
  }
  return null;
}

function notificationFilters(record: Record<string, unknown>): Record<string, unknown> | null {
  const meta = notificationMetadata(record);
  const filters =
    asNotificationRecord(meta.filters) ??
    parseNotificationJson(meta.filters) ??
    asNotificationRecord(meta.criteria) ??
    parseNotificationJson(meta.criteria);
  if (filters) return filters;
  const filterKeys = ["make", "model", "year", "yearFrom", "yearTo", "region", "priceFrom", "priceTo", "status", "query", "keyword", "searchTerm"];
  const picked = Object.fromEntries(
    filterKeys.flatMap((key) => {
      const value = notificationText(meta[key]);
      return value ? [[key, value]] : [];
    }),
  );
  return Object.keys(picked).length ? picked : null;
}

function auctionNotificationHref(record: Record<string, unknown>): string | null {
  const auctionId = findNotificationValue(record, ["auctionId", "auction_id", "lotId", "lot_id"]);
  if (!auctionId) return null;
  const searchableText = [
    notificationText(record.type),
    notificationText(record.notificationType),
    notificationText(record.category),
    notificationText(record.title),
    notificationText(record.body),
  ].join(" ").toLowerCase();
  const isStartMessage = /start|started|live|boshl|начал|старт|идет|идёт/.test(searchableText);
  return isStartMessage ? auctionLiveHref(auctionId) : auctionDetailHref(auctionId);
}

function savedSearchNotificationHref(record: Record<string, unknown>): string | null {
  const filters = notificationFilters(record);
  if (filters) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      const textValue = notificationText(value);
      if (textValue) params.set(key, textValue);
    }
    const query = params.toString();
    if (query) return `/auctions?${query}`;
  }
  const savedSearchId = findNotificationValue(record, ["savedSearchId", "searchId", "saved_search_id"]);
  return savedSearchId ? "/dashboard/watchlist" : null;
}

function notificationLink(record: Record<string, unknown>, copy: CabinetLiveCopy): { href: string; label: string } | null {
  const auctionHref = auctionNotificationHref(record);
  if (auctionHref) return { href: auctionHref, label: copy.viewAuction };

  const searchableText = [
    notificationText(record.type),
    notificationText(record.notificationType),
    notificationText(record.category),
    notificationText(record.title),
    notificationText(record.body),
  ].join(" ").toLowerCase();
  const savedSearchHref =
    /saved.?search|search.?save|saqlangan qidiruv|qidiruv|сохран/.test(searchableText)
      ? savedSearchNotificationHref(record)
      : null;
  return savedSearchHref ? { href: savedSearchHref, label: copy.notificationLink } : null;
}

function humanizeNotificationKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function notificationMetaEntries(record: Record<string, unknown>, copy: CabinetLiveCopy): Array<[string, string]> {
  const meta = notificationMetadata(record);
  const hidden = new Set(["body", "createdAt", "id", "isRead", "meta", "metadata", "payload", "title"]);
  return Object.entries(meta).flatMap(([key, value]) => {
    if (hidden.has(key)) return [];
    if (value === null || value === undefined || value === "") return [];
    const child = asNotificationRecord(value) ?? parseNotificationJson(value);
    if (child) {
      return Object.entries(child).flatMap(([childKey, childValue]) => {
        const textValue = notificationText(childValue);
        return textValue ? [[humanizeNotificationKey(childKey), textValue] as [string, string]] : [];
      });
    }
    const textValue = notificationText(value);
    return textValue ? [[humanizeNotificationKey(key), textValue] as [string, string]] : [];
  }).filter(
    ([label], index, entries) => entries.findIndex(([candidate]) => candidate === label) === index,
  ).slice(0, 12).concat([["Status", record.isRead === true ? copy.notificationsHistory : copy.notificationsNew]]);
}

function notificationRecords(value: unknown, copy?: CabinetLiveCopy): NotificationRecord[] {
  const source =
    typeof value === "object" && value !== null && "data" in value
      ? (value as { data?: unknown }).data
      : value;
  if (!Array.isArray(source)) return [];
  return source.flatMap((candidate, index) => {
    if (typeof candidate !== "object" || candidate === null) return [];
    const record = candidate as Record<string, unknown>;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const body = typeof record.body === "string" ? record.body.trim() : "";
    if (!title && !body) return [];
    const relatedLink = copy ? notificationLink(record, copy) : null;
    const readId = notificationText(record.id ?? record.notificationId ?? record.notifId);
    return [{
      body,
      createdAt: typeof record.createdAt === "string" ? record.createdAt : null,
      id: readId ?? `${title}-${index}`,
      isRead: record.isRead === true,
      linkHref: relatedLink?.href ?? null,
      linkLabel: relatedLink?.label ?? null,
      meta: copy ? notificationMetaEntries(record, copy) : [],
      raw: record,
      readId,
      title: title || body,
    }];
  });
}

function sortNotificationsByNewest(notifications: readonly NotificationRecord[]): NotificationRecord[] {
  return [...notifications].sort((left, right) => {
    const leftTime = left.createdAt ? Date.parse(left.createdAt) : 0;
    const rightTime = right.createdAt ? Date.parse(right.createdAt) : 0;
    return rightTime - leftTime;
  });
}

function NotificationList({
  copy,
  currentLang,
  notifications,
  onOpen,
}: {
  copy: CabinetLiveCopy;
  currentLang: Lang;
  notifications: readonly NotificationRecord[];
  onOpen: (notification: NotificationRecord) => void;
}) {
  return (
    <ul className="space-y-3" aria-label={copy.notifications}>
      {notifications.map((notification) => (
        <li key={notification.id}>
          <Surface className={notification.isRead ? "" : "border-brand-champagne-500/55"}>
            <div className="flex items-start gap-3">
              <Bell aria-hidden="true" className="mt-0.5 shrink-0 text-brand-gold-text" size={20} />
              <button
                className="min-w-0 flex-1 text-left focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
                onClick={() => onOpen(notification)}
                type="button"
              >
                <h2 className="font-extrabold text-brand-navy-900">{notification.title}</h2>
                {notification.body && notification.body !== notification.title ? (
                  <p className="mt-1 text-sm leading-6 text-text-secondary">{notification.body}</p>
                ) : null}
                {notification.createdAt ? (
                  <time className="mt-2 block text-xs font-bold text-text-secondary" dateTime={notification.createdAt}>
                    {formatDate(notification.createdAt, currentLang)}
                  </time>
                ) : null}
              </button>
            </div>
          </Surface>
        </li>
      ))}
    </ul>
  );
}

function NotificationDetailModal({
  copy,
  currentLang,
  notification,
  onClose,
}: {
  copy: CabinetLiveCopy;
  currentLang: Lang;
  notification: NotificationRecord | null;
  onClose: () => void;
}) {
  if (!notification) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy-950/65 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-labelledby="notification-detail-title"
        aria-modal="true"
        className="my-6 w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-gold-text">
              {copy.notificationDetails}
            </p>
            <h2 id="notification-detail-title" className="mt-2 text-2xl font-extrabold text-brand-navy-900">
              {notification.title}
            </h2>
          </div>
          <button
            aria-label={copy.closeDetails}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        {notification.body ? (
          <p className="mt-4 text-sm leading-6 text-text-secondary">{notification.body}</p>
        ) : null}

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border-default bg-surface-canvas p-3">
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-secondary">{copy.reference}</dt>
            <dd className="mt-1 break-all text-sm font-bold text-brand-navy-900">#{notification.id}</dd>
          </div>
          {notification.createdAt ? (
            <div className="rounded-md border border-border-default bg-surface-canvas p-3">
              <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-secondary">{copy.date}</dt>
              <dd className="mt-1 text-sm font-bold text-brand-navy-900">
                {formatDate(notification.createdAt, currentLang)}
              </dd>
            </div>
          ) : null}
          {notification.meta.map(([label, value]) => (
            <div className="rounded-md border border-border-default bg-surface-canvas p-3" key={`${label}-${value}`}>
              <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-secondary">{label}</dt>
              <dd className="mt-1 break-words text-sm font-bold text-brand-navy-900">{value}</dd>
            </div>
          ))}
        </dl>

        {notification.linkHref ? (
          <div className="mt-6 flex justify-end">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-navy-900 px-5 text-sm font-extrabold text-white transition-colors hover:bg-brand-navy-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              href={notification.linkHref}
              onClick={onClose}
            >
              {notification.linkLabel ?? copy.notificationLink}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function NotificationsSection({ initialNotificationId = "", userId }: { initialNotificationId?: string; userId?: string | number }) {
  const { copy, currentLang } = useLiveCopy();
  const { connected, connectionState, publish, subscribe } = useSocket();
  const accountId = canonicalAccountId(userId);
  const historyQuery = useNotificationsByUserId(accountId) as unknown as QuerySnapshot;
  const refetchHistory = historyQuery.refetch;
  const activeScope = useRef(accountId);
  const [tab, setTab] = useState<"new" | "history">("new");
  const [historyPage, setHistoryPage] = useState(0);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(initialNotificationId || null);
  const autoOpenedNotification = useRef("");
  const [stream, setStream] = useState<{
    accountId: string;
    error: boolean;
    notifications: NotificationRecord[];
  }>(() => ({ accountId, error: false, notifications: [] }));
  const historyNotifications = notificationRecords(historyQuery.data, copy);
  const liveNotifications = stream.accountId === accountId ? stream.notifications : [];
  const notifications = [...historyNotifications, ...liveNotifications].filter(
    (notification, index, combined) =>
      combined.findIndex((item) => item.id === notification.id) === index,
  );
  const sortedNotifications = sortNotificationsByNewest(notifications);
  const selectedNotification = selectedNotificationId
    ? sortedNotifications.find((notification) => notification.id === selectedNotificationId) ?? null
    : null;
  const newNotifications = sortedNotifications.slice(0, 10);
  const totalHistoryPages = Math.max(1, Math.ceil(sortedNotifications.length / historyPageSize));
  const safeHistoryPage = Math.max(0, Math.min(historyPage, totalHistoryPages - 1));
  const historyItems = sortedNotifications.slice(
    safeHistoryPage * historyPageSize,
    safeHistoryPage * historyPageSize + historyPageSize,
  );
  const streamError = stream.accountId === accountId && stream.error;

  function openNotification(notification: NotificationRecord) {
    setSelectedNotificationId(notification.id);
    if (!notification.isRead && notification.readId) {
      void markNotifAsRead(accountId)
        .then(() => refetchHistory?.())
        .catch(() => undefined);
    }
  }

  useEffect(() => {
    if (!initialNotificationId || autoOpenedNotification.current === initialNotificationId) return;
    const notification = sortedNotifications.find((item) => item.id === initialNotificationId);
    if (!notification) return;
    autoOpenedNotification.current = initialNotificationId;
    if (!notification.isRead && notification.readId) {
      void markNotifAsRead(accountId)
        .then(() => refetchHistory?.())
        .catch(() => undefined);
    }
  }, [initialNotificationId, refetchHistory, sortedNotifications, accountId]);

  useEffect(() => {
    activeScope.current = accountId;
  }, [accountId]);

  useEffect(() => {
    if (!connected || !accountId) return;
    const subscribedAccountId = accountId;
    const subscription = subscribe(
      `/topic/notification/getAllNotifications/${subscribedAccountId}`,
      (message: { body?: string }) => {
        if (activeScope.current !== subscribedAccountId) return;
        try {
          const next = notificationRecords(JSON.parse(message.body ?? "null"), copy);
          setStream((current) => {
            if (activeScope.current !== subscribedAccountId) return current;
            const currentNotifications =
              current.accountId === subscribedAccountId ? current.notifications : [];
            const combined = [...next, ...currentNotifications];
            return {
              accountId: subscribedAccountId,
              error: false,
              notifications: combined.filter(
                (notification, index) =>
                  combined.findIndex((item) => item.id === notification.id) === index,
              ),
            };
          });
        } catch {
          setStream({ accountId: subscribedAccountId, error: true, notifications: [] });
        }
      },
    );
    publish({ destination: `/app/notification/getAllNotifications/${subscribedAccountId}` });
    return () => subscription?.unsubscribe?.();
  }, [accountId, connected, copy, publish, subscribe]);

  if (!accountId) return missingAccount(copy);
  if (historyQuery.isLoading && notifications.length === 0) {
    return <TabsAndListSkeleton label={copy.loadingTitle} rows={7} tabs={2} />;
  }
  if ((historyQuery.isError || streamError) && notifications.length === 0) {
    return <StatePanel icon={<ShieldAlert size={32} />} title={copy.errorTitle} description={copy.errorBody} />;
  }
  if (!connected && connectionState !== "connected" && historyQuery.data === undefined) {
    const stateKey =
      connectionState === "offline"
        ? "offline"
        : connectionState === "unavailable"
          ? "unavailable"
          : "connecting";
    const [title, description] = copy.notificationStates[stateKey];
    return <StatePanel icon={<Bell size={32} />} title={title} description={description} />;
  }
  if (notifications.length === 0) {
    return <StatePanel title={copy.empty.notifications[0]} description={copy.empty.notifications[1]} />;
  }

  return (
    <div className="space-y-4">
      <Surface className="space-y-4 border-brand-champagne-500/35 bg-[linear-gradient(135deg,rgba(244,208,111,0.12),rgba(255,255,255,0.96)_42%,rgba(7,31,68,0.03))]">
        <div className="flex flex-wrap items-center gap-6 border-b border-border-default" role="tablist">
          <button
            aria-selected={tab === "new"}
            className={`-mb-px min-h-11 border-b-2 px-1 text-sm font-extrabold transition-colors ${
              tab === "new"
                ? "border-brand-navy-900 text-brand-navy-900"
                : "border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary"
            }`}
            onClick={() => setTab("new")}
            role="tab"
            type="button"
          >
            {copy.notificationsNew}
          </button>
          <button
            aria-selected={tab === "history"}
            className={`-mb-px min-h-11 border-b-2 px-1 text-sm font-extrabold transition-colors ${
              tab === "history"
                ? "border-brand-navy-900 text-brand-navy-900"
                : "border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary"
            }`}
            onClick={() => {
              setTab("history");
              setHistoryPage(0);
            }}
            role="tab"
            type="button"
          >
            {copy.notificationsHistory}
          </button>
        </div>
        {tab === "new" ? <p className="text-sm font-bold text-text-secondary">{copy.notificationsLatest}</p> : null}
      </Surface>

      {tab === "new" ? (
        <NotificationList copy={copy} currentLang={currentLang} notifications={newNotifications} onOpen={openNotification} />
      ) : (
        <div className="space-y-4">
          <NotificationList copy={copy} currentLang={currentLang} notifications={historyItems} onOpen={openNotification} />
          <div className="flex flex-wrap items-center justify-end gap-3">
              <PageSizeSelect disabled={historyQuery.isLoading} value={historyPageSize} onChange={(size) => { setHistoryPageSize(size); setHistoryPage(0); }} />
              <button
                aria-label={copy.previousPage}
                className="rounded-md border border-border-default bg-white p-2 text-brand-navy-900 disabled:opacity-40"
                disabled={safeHistoryPage === 0}
                onClick={() => setHistoryPage((current) => Math.max(0, current - 1))}
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={18} />
              </button>
              <span className="text-sm font-bold text-brand-navy-900">
                {copy.page} {safeHistoryPage + 1} / {totalHistoryPages}
              </span>
              <button
                aria-label={copy.nextPage}
                className="rounded-md border border-border-default bg-white p-2 text-brand-navy-900 disabled:opacity-40"
                disabled={safeHistoryPage >= totalHistoryPages - 1}
                onClick={() => setHistoryPage((current) => Math.min(totalHistoryPages - 1, current + 1))}
                type="button"
              >
                <ChevronRight aria-hidden="true" size={18} />
              </button>
          </div>
        </div>
      )}
      <NotificationDetailModal
        copy={copy}
        currentLang={currentLang}
        notification={selectedNotification}
        onClose={() => setSelectedNotificationId(null)}
      />
    </div>
  );
}

interface ConnectedMutation {
  isPending?: boolean;
  mutate: (
    payload: Record<string, unknown>,
    options: {
      onError: (error?: unknown) => void;
      onSuccess: (response?: unknown) => void;
    },
  ) => void;
}

interface CabinetIdentityItem {
  id?: string | number;
  identityId?: string | number;
  provider?: string;
  identifier?: string;
}

interface AsyncMutationLike {
  isPending?: boolean;
  mutateAsync: (payload: Record<string, unknown>) => Promise<unknown>;
}

interface HttpErrorLike {
  status?: number;
  message?: string;
  raw?: {
    status?: string;
    errorCode?: string;
    config?: { data?: string };
  };
}

function mutationWasConfirmed(response: unknown): boolean {
  if (!response) return false;
  if (typeof response === "object") {
    const record = response as Record<string, unknown>;
    if (typeof record.status === "number" && record.status >= 200 && record.status < 300) {
      return true;
    }
  }
  let candidate: unknown = response;
  for (let depth = 0; depth < 3; depth += 1) {
    if (typeof candidate !== "object" || candidate === null) return false;
    const record = candidate as Record<string, unknown>;
    if (typeof record.status === "string") {
      const s = record.status.trim().toUpperCase();
      return s === "OK" || s === "SUCCESS" || s === "CREATED";
    }
    if (typeof record.status === "number" && record.status >= 200 && record.status < 300) {
      return true;
    }
    candidate = record.data;
  }
  return true;
}

const getBackendErrorText = (msg: string, lang: string): string => {
  const m = msg?.toUpperCase() || "";
  const dict: Record<string, Record<string, string>> = {
    "uz": {
      "PASSWORD MUST BE AT LEAST 8 CHARACTERS": "Parol kamida 8 ta belgidan iborat bo'lishi kerak",
      "CODE IS ERROR": "Kiritilgan kod noto'g'ri",
      "USER NOT FOUND": "Foydalanuvchi topilmadi",
      "INVALID PASSWORD": "Parol noto'g'ri",
      "INVALID_PASSWORD": "Parol noto'g'ri",
      "INTERNAL_ERROR": "Xatolik yuz berdi",
    },
    "ru": {
      "PASSWORD MUST BE AT LEAST 8 CHARACTERS": "Пароль должен содержать не менее 8 символов",
      "CODE IS ERROR": "Введенный код неверный",
      "USER NOT FOUND": "Пользователь не найден",
      "INVALID PASSWORD": "Неверный пароль",
      "INVALID_PASSWORD": "Неверный пароль",
      "INTERNAL_ERROR": "Произошла ошибка",
    },
    "en": {
      "PASSWORD MUST BE AT LEAST 8 CHARACTERS": "Password must be at least 8 characters long",
      "CODE IS ERROR": "Code is incorrect",
      "USER NOT FOUND": "User not found",
      "INVALID PASSWORD": "Invalid password",
      "INVALID_PASSWORD": "Invalid password",
      "INTERNAL_ERROR": "An error occurred",
    }
  };
  return dict[lang]?.[m] || msg;
};

export function CabinetIdentitiesSection() {
  const { copy } = useLiveCopy();
  const { data: identities = [], refetch } = useGetIdentities();
  const typedIdentities = identities as CabinetIdentityItem[];
  const linkGoogle = useLinkGoogleIdentity() as unknown as AsyncMutationLike;
  const linkTelegram = useLinkTelegramIdentity() as unknown as AsyncMutationLike;
  const [mergeData, setMergeData] = useState<{ provider: string, payload: Record<string, unknown>, errorMessage?: string } | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error", message: string } | null>(null);

  const hasGoogle = typedIdentities.some((i) => i.provider === "GOOGLE");
  const hasTelegram = typedIdentities.some((i) => i.provider === "TELEGRAM");

  const handleGoogle = async () => {
    try {
      setFeedback(null);
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await linkGoogle.mutateAsync({ idToken });
      setFeedback({ tone: "success", message: copy.linkAccountSuccess });
      refetch();
    } catch (error: unknown) {
      const err = error as HttpErrorLike;
      if (err?.status === 409 || err?.raw?.status === "CONFLICT" || err?.raw?.errorCode === "CONFLICT") {
         const payloadIdToken = err?.raw?.config?.data ? JSON.parse(err.raw.config.data).idToken : "";
         const errorMessage = err?.message || copy.linkAccountConflict;
         setMergeData({ provider: 'google', payload: { idToken: payloadIdToken }, errorMessage });
      } else {
         setFeedback({ tone: "error", message: err?.message || copy.linkAccountError });
      }
    }
  };

  const handleTelegram = async () => {
    try {
      setFeedback(null);
      const loaded = await loadTelegramScript();
      if (!loaded) return;
      (window as Window & { Telegram?: { Login?: { auth: (config: { bot_id: string; request_access: string }, cb: (user: unknown) => void) => void } } }).Telegram?.Login?.auth(
          { bot_id: "8885467089", request_access: "write" },
          async (user: unknown) => {
              if (!user) return;
              try {
                await linkTelegram.mutateAsync(user as Record<string, unknown>);
                setFeedback({ tone: "success", message: copy.linkAccountSuccess });
                refetch();
              } catch (error: unknown) {
                const err = error as HttpErrorLike;
                if (err?.status === 409 || err?.raw?.status === "CONFLICT" || err?.raw?.errorCode === "CONFLICT") {
                   const errorMessage = err?.message || copy.linkAccountConflict;
                   setMergeData({ provider: 'telegram', payload: user as Record<string, unknown>, errorMessage });
                } else {
                   setFeedback({ tone: "error", message: err?.message || copy.linkAccountError });
                }
              }
          }
      );
    } catch (error: unknown) {
       const err = error as HttpErrorLike;
       setFeedback({ tone: "error", message: err?.message || copy.linkAccountError });
    }
  };

  const confirmMerge = async () => {
    if (!mergeData) return;
    try {
      if (mergeData.provider === 'google') {
        await linkGoogle.mutateAsync({ ...mergeData.payload, confirmMerge: true });
      } else {
        await linkTelegram.mutateAsync({ ...mergeData.payload, confirmMerge: true });
      }
      setFeedback({ tone: "success", message: copy.linkAccountSuccess });
      refetch();
      setMergeData(null);
    } catch (error: unknown) {
      const err = error as HttpErrorLike;
      setFeedback({ tone: "error", message: err?.message || copy.linkAccountError });
      setMergeData(null);
    }
  };

  return (
    <div className="mt-8 space-y-4 pt-8 border-t border-border-default">
      <div>
        <h3 className="text-lg font-bold">{copy.connectedAccounts}</h3>
        <p className="text-sm text-text-secondary">{copy.connectedAccountsBody}</p>
      </div>
      <div className="space-y-3">
        {typedIdentities.length > 0 ? typedIdentities.map((id, index: number) => (
           <div key={id.identityId ?? id.id ?? `${id.provider}-${index}`} className="flex items-center justify-between rounded-md border border-border-default bg-surface-primary p-4">
              <div className="flex items-center gap-3">
                 {id.provider === "GOOGLE" ? <GoogleColorIcon /> : id.provider === "TELEGRAM" ? <TelegramIcon className="w-5 h-5 text-[#54A9EB]" /> : <div className="w-5 h-5 bg-surface-muted rounded-full" />}
                 <div>
                    <p className="text-sm font-bold">{id.provider}</p>
                    <p className="text-xs text-text-secondary">{id.identifier}</p>
                 </div>
              </div>
              <StatusBadge tone="success">{copy.linked}</StatusBadge>
           </div>
        )) : null}
      </div>
      
      <div className="flex gap-4 pt-4">
        {!hasGoogle && (
           <Button onClick={handleGoogle} disabled={linkGoogle.isPending} className="flex-1 bg-surface-primary border text-brand-navy-900 border-border-default hover:bg-surface-muted">
             <GoogleColorIcon /> Google
           </Button>
        )}
        {!hasTelegram && (
           <Button onClick={handleTelegram} disabled={linkTelegram.isPending} className="flex-1 bg-[#54A9EB] text-white hover:bg-[#4396D7]">
             <TelegramIcon className="w-5 h-5 text-white" /> Telegram
           </Button>
        )}
      </div>

      {feedback && (
         <p className={feedback.tone === "success" ? "text-sm text-semantic-success font-bold mt-2" : "text-sm text-semantic-danger font-bold mt-2"}>
            {feedback.message}
         </p>
      )}

      {mergeData && (
        <ConfirmModal
           open={true}
           title="Hisobni birlashtirish"
           description={mergeData.errorMessage || "Ushbu ijtimoiy tarmoq akkaunti boshqa profilga ulangan. Uni ushbu profilga o'tkazishni tasdiqlaysizmi?"}
           confirmText="Ha, tasdiqlayman"
           cancelText="Bekor qilish"
           loading={linkGoogle.isPending || linkTelegram.isPending}
           onConfirm={confirmMerge}
           onCancel={() => setMergeData(null)}
        />
      )}
    </div>
  );
}

export function ProfileSection({ user }: { user: CabinetUser }) {
  const { copy, currentLang } = useLiveCopy();
  const { data: identities = [] } = useGetIdentities();
  const hasEmailProvider = (identities as CabinetIdentityItem[]).some((i) => i.provider === "EMAIL");
  const updateUser = useUpdateUser() as unknown as ConnectedMutation;
  const updateEmail = useUpdateEmail() as unknown as ConnectedMutation;
  const verifyEmail = useUpdateEmailVerify() as unknown as ConnectedMutation;
  const updatePassword = useUpdatePasswordWithOld() as unknown as ConnectedMutation;
  const verifyPassword = useUpdatePasswordVerify() as unknown as ConnectedMutation;
const [draft, setDraft] = useState(() => ({
  firstname: user.firstname ?? user.firstName ?? "",
  lastname: user.lastname ?? user.lastName ?? "",
  orgInn: user.orgInn ?? user.orgTaxId ?? "",
  orgName: user.orgName ?? "",
  type: user.type ?? user.userType ?? "INDIVIDUAL",
}));
  const [emailDraft, setEmailDraft] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [passwordDraft, setPasswordDraft] = useState({ newPassword: "", oldPassword: "" });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [verification, setVerification] = useState<"email" | "password" | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [profileFeedback, setProfileFeedback] = useState<{ message: string; tone: "error" | "success" } | null>(null);
  const [emailFeedback, setEmailFeedback] = useState<{ message: string; tone: "error" | "success" } | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{ message: string; tone: "error" | "success" } | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{ message: string; tone: "error" | "success" } | null>(null);
  const currentEmail = verifiedEmail ?? user.email ?? "";

  const isProfileChanged =
    draft.firstname !== (user.firstname ?? user.firstName ?? "") ||
    draft.lastname !== (user.lastname ?? user.lastName ?? "") ||
    draft.orgInn !== (user.orgInn ?? user.orgTaxId ?? "") ||
    draft.orgName !== (user.orgName ?? "") ||
    draft.type !== (user.type ?? user.userType ?? "INDIVIDUAL");

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (user.id === undefined) return;
    setProfileFeedback(null);
    const firstnamePayload = draft.firstname.trim() || user.firstName || user.firstname || "";
    const lastnamePayload = draft.lastname.trim() || user.lastName || user.lastname || "";

    const orgInnPayload = draft.type === "ORGANIZATION" ? draft.orgInn.trim() || user.orgInn || user.orgTaxId || "" : "";
    const orgNamePayload = draft.type === "ORGANIZATION" ? draft.orgName.trim() || user.orgName || user.orgName || "" : "";

    updateUser.mutate(
      {
        id: user.id,
        firstname: firstnamePayload,
        lastname: lastnamePayload,
        type: draft.type,
        orgName: orgNamePayload,
        orgInn: orgInnPayload,
      },
      {
        onError: () => setProfileFeedback({ message: copy.profileError, tone: "error" }),
        onSuccess: (response) => setProfileFeedback(
          mutationWasConfirmed(response)
            ? { message: copy.profileSaved, tone: "success" }
            : { message: copy.profileError, tone: "error" },
        ),
      },
    );
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newEmail = emailDraft.trim();
    if (!currentEmail || !newEmail) return;
    setEmailFeedback(null);
    updateEmail.mutate(
      { email: currentEmail, newEmail },
      {
        onError: () => setEmailFeedback({ message: copy.emailRequestError, tone: "error" }),
        onSuccess: (response) => {
          if (!mutationWasConfirmed(response)) {
            setEmailFeedback({ message: copy.emailRequestError, tone: "error" });
            return;
          }
          setVerificationCode("");
          setVerification("email");
          setEmailFeedback({ message: copy.emailCodeSent, tone: "success" });
        },
      },
    );
  }

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentEmail || !passwordDraft.newPassword || !passwordDraft.oldPassword) return;
    setPasswordFeedback(null);
    updatePassword.mutate(
      {
        email: currentEmail,
        newPassword: passwordDraft.newPassword,
        oldPassword: passwordDraft.oldPassword,
      },
      {
        onError: (err: unknown) => {
          const msg = (err as { message?: string })?.message;
          const translated = getBackendErrorText(msg ?? "", currentLang) || copy.passwordRequestError;
          setPasswordFeedback({ message: translated, tone: "error" });
        },
        onSuccess: (response: unknown) => {
          if (!mutationWasConfirmed(response)) {
            const res = response as { data?: { message?: string }; message?: string };
            const msg = res?.data?.message || res?.message;
            const translated = getBackendErrorText(msg ?? "", currentLang) || copy.passwordRequestError;
            setPasswordFeedback({ message: translated, tone: "error" });
            return;
          }
          setVerificationCode("");
          setVerification("password");
          setPasswordFeedback({ message: copy.passwordCodeSent, tone: "success" });
        },
      },
    );
  }

  function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verification || !verificationCode.trim() || !currentEmail) return;
    const mutation = verification === "email" ? verifyEmail : verifyPassword;
    const payload = verification === "email"
      ? { oldEmail: currentEmail, newEmail: emailDraft.trim(), code: verificationCode.trim() }
      : { email: currentEmail, password: passwordDraft.newPassword, code: verificationCode.trim() };
    const successMessage = verification === "email" ? copy.emailChanged : copy.passwordChanged;
    setVerificationFeedback(null);
    mutation.mutate(payload, {
      onError: (err: unknown) => {
        const msg = (err as { message?: string })?.message;
        const translated = getBackendErrorText(msg ?? "", currentLang) || copy.verificationError;
        setVerificationFeedback({ message: translated, tone: "error" });
      },
      onSuccess: (response: unknown) => {
        if (!mutationWasConfirmed(response)) {
          const res = response as { data?: { message?: string }; message?: string };
          const msg = res?.data?.message || res?.message;
          const translated = getBackendErrorText(msg ?? "", currentLang) || copy.verificationError;
          setVerificationFeedback({ message: translated, tone: "error" });
          return;
        }
        setVerification(null);
        setVerificationCode("");
        setPasswordDraft({ newPassword: "", oldPassword: "" });
        if (verification === "email") {
          const nextEmail = emailDraft.trim();
          setVerifiedEmail(nextEmail);
          setEmailDraft("");
          setVerificationFeedback({ message: successMessage, tone: "success" });
        } else {
          setPasswordFeedback({ message: successMessage, tone: "success" });
        }
      },
    });
  }

  const fieldClassName = "mt-2 min-h-12 w-full rounded-md border border-border-default px-4 font-normal outline-none focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25";

  return (
    <div className="space-y-5">
      <Surface>
        <form className="space-y-5" onSubmit={submitProfile}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold">
              {copy.firstName}
              <input
                className={fieldClassName}
                onChange={(event) => setDraft((current) => ({ ...current, firstname: event.target.value }))}
                value={draft.firstname}
              />
            </label>
            <label className="text-sm font-bold">
              {copy.lastName}
              <input
                className={fieldClassName}
                onChange={(event) => setDraft((current) => ({ ...current, lastname: event.target.value }))}
                value={draft.lastname}
              />
            </label>
            <div className="text-sm font-bold">
              {copy.type}
              <AppSelect
                className="mt-2"
                value={draft.type}
                onChange={(val) => setDraft((current) => ({ ...current, type: String(val) }))}
                options={[
                  { value: "INDIVIDUAL", label: copy.individual },
                  { value: "ORGANIZATION", label: copy.organization },
                ]}
              />
            </div>
            <label className="text-sm font-bold">
              {copy.email}
              <input
                className={`${fieldClassName} bg-surface-muted text-text-secondary`}
                disabled
                type="email"
                value={currentEmail}
              />
            </label>
            {draft.type === "ORGANIZATION" ? (
              <>
                <label className="text-sm font-bold">
                  {copy.organizationName}
                  <input
                    className={fieldClassName}
                    onChange={(event) => setDraft((current) => ({ ...current, orgName: event.target.value }))}
                    value={draft.orgName}
                  />
                </label>
                <label className="text-sm font-bold">
                  {copy.organizationInn}
                  <input
                    className={fieldClassName}
                    inputMode="numeric"
                    maxLength={9}
                    onChange={(event) => setDraft((current) => ({
                      ...current,
                      orgInn: event.target.value.replace(/\D/g, ""),
                    }))}
                    value={draft.orgInn}
                  />
                </label>
              </>
            ) : null}
          </div>
          {profileFeedback ? (
            <p
              className={profileFeedback.tone === "success" ? "text-sm font-bold text-semantic-success" : "text-sm font-bold text-semantic-danger"}
              role={profileFeedback.tone === "success" ? "status" : "alert"}
            >
              {profileFeedback.message}
            </p>
          ) : null}
          <Button disabled={user.id === undefined || Boolean(updateUser.isPending) || !isProfileChanged} type="submit">
            <CircleUserRound aria-hidden="true" size={17} />
            {updateUser.isPending ? copy.saving : copy.saveProfile}
          </Button>
        </form>
      </Surface>

      <div className="grid gap-5 lg:grid-cols-2">
        <Surface>
          <h2 className="text-xl font-extrabold text-brand-navy-900">{copy.emailChange}</h2>
          <form className="mt-5 space-y-5" onSubmit={submitEmail}>
            <label className="text-sm font-bold">
              {copy.newEmail}
              <input
                autoComplete="email"
                className={fieldClassName}
                onChange={(event) => setEmailDraft(event.target.value)}
                type="email"
                value={emailDraft}
              />
            </label>
            <Button
              disabled={!currentEmail || !emailDraft.trim() || Boolean(updateEmail.isPending)}
              type="submit"
              className="mt-3"
            >
              {updateEmail.isPending ? copy.saving : copy.sendVerificationCode}
            </Button>
            {emailFeedback ? (
              <p
                className={emailFeedback.tone === "success" ? "text-sm font-bold text-semantic-success mt-2" : "text-sm font-bold text-semantic-danger mt-2"}
                role={emailFeedback.tone === "success" ? "status" : "alert"}
              >
                {emailFeedback.message}
              </p>
            ) : null}
          </form>
        </Surface>

        {hasEmailProvider ? (
          <Surface>
            <h2 className="text-xl font-extrabold text-brand-navy-900">{copy.passwordChange}</h2>
            <form className="mt-5 space-y-5" onSubmit={submitPassword}>
              <label className="block text-sm font-bold">
                {copy.currentPassword}
                <div className="relative mt-1">
                  <input
                    autoComplete="current-password"
                    className={`${fieldClassName} pr-10`}
                    onChange={(event) => setPasswordDraft((current) => ({ ...current, oldPassword: event.target.value }))}
                    type={showOldPassword ? "text" : "password"}
                    value={passwordDraft.oldPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary focus:outline-none"
                    aria-label={showOldPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            <label className="block text-sm font-bold">
              {copy.newPassword}
              <div className="relative mt-1">
                <input
                  autoComplete="new-password"
                  className={`${fieldClassName} pr-10`}
                  onChange={(event) => setPasswordDraft((current) => ({ ...current, newPassword: event.target.value }))}
                  type={showNewPassword ? "text" : "password"}
                  value={passwordDraft.newPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary focus:outline-none"
                  aria-label={showNewPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <Button
            className="mt-3"
              disabled={
                !currentEmail ||
                !passwordDraft.newPassword ||
                !passwordDraft.oldPassword ||
                Boolean(updatePassword.isPending)
              }
              type="submit"
            >
              {updatePassword.isPending ? copy.saving : copy.updatePassword}
            </Button>
            {passwordFeedback ? (
              <p
                className={passwordFeedback.tone === "success" ? "text-sm font-bold text-semantic-success mt-2" : "text-sm font-bold text-semantic-danger mt-2"}
                role={passwordFeedback.tone === "success" ? "status" : "alert"}
              >
                {passwordFeedback.message}
              </p>
            ) : null}
          </form>
        </Surface>
        ) : null}
      </div>

      {verification ? (
        <Surface>
          <form className="space-y-5" onSubmit={submitVerification}>
            <label className="text-sm font-bold">
              {copy.verificationCode}
              <input
                autoComplete="one-time-code"
                className={fieldClassName}
                inputMode="numeric"
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))}
                value={verificationCode}
              />
            </label>
            <Button
              disabled={
                !verificationCode.trim() ||
                Boolean(verification === "email" ? verifyEmail.isPending : verifyPassword.isPending)
              }
              type="submit"
            >
              {copy.verify}
            </Button>
            {verificationFeedback ? (
              <p
                className={verificationFeedback.tone === "success" ? "text-sm font-bold text-semantic-success mt-2" : "text-sm font-bold text-semantic-danger mt-2"}
                role={verificationFeedback.tone === "success" ? "status" : "alert"}
              >
                {verificationFeedback.message}
              </p>
            ) : null}
          </form>
        </Surface>
      ) : null}

      <CabinetIdentitiesSection />
      <CabinetSecuritySection />
    </div>
  );
}
