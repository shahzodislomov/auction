import type { Lang } from "@/context/LangSwitch";

export type UiTextKey =
  | "breadcrumb"
  | "close"
  | "collapseMenu"
  | "expandMenu"
  | "fieldInformation"
  | "language"
  | "loadingAuctions"
  | "loadingVehicles"
  | "nextPage"
  | "nextImage"
  | "previousImage"
  | "previousPage";

const uiText: Record<Lang, Record<UiTextKey, string>> = {
  uz: {
    breadcrumb: "Navigatsiya yo‘li",
    close: "Yopish",
    collapseMenu: "Menyuni yopish",
    expandMenu: "Menyuni ochish",
    fieldInformation: "Maydon haqida ma’lumot",
    language: "Til",
    loadingAuctions: "Auksionlar yuklanmoqda",
    loadingVehicles: "Avtomobillar yuklanmoqda",
    nextPage: "Keyingi sahifa",
    nextImage: "Keyingi rasm",
    previousImage: "Oldingi rasm",
    previousPage: "Oldingi sahifa",
  },
  en: {
    breadcrumb: "Breadcrumb",
    close: "Close",
    collapseMenu: "Collapse menu",
    expandMenu: "Expand menu",
    fieldInformation: "Field information",
    language: "Language",
    loadingAuctions: "Loading auctions",
    loadingVehicles: "Loading vehicles",
    nextPage: "Next page",
    nextImage: "Next image",
    previousImage: "Previous image",
    previousPage: "Previous page",
  },
  ru: {
    breadcrumb: "Навигационная цепочка",
    close: "Закрыть",
    collapseMenu: "Свернуть меню",
    expandMenu: "Развернуть меню",
    fieldInformation: "Информация о поле",
    language: "Язык",
    loadingAuctions: "Загрузка аукционов",
    loadingVehicles: "Загрузка автомобилей",
    nextPage: "Следующая страница",
    nextImage: "Следующее изображение",
    previousImage: "Предыдущее изображение",
    previousPage: "Предыдущая страница",
  },
};

export function translateUiText(key: UiTextKey, lang: Lang): string {
  return uiText[lang][key];
}
