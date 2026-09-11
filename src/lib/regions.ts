export type CanonicalRegion = {
  id: string;
  uz: string;
  ru: string;
  en: string;
  aliases: string[];
};

export const UZBEKISTAN_REGIONS: readonly CanonicalRegion[] = [
  {
    id: "1",
    uz: "Qoraqalpog‘iston Respublikasi",
    ru: "Республика Каракалпакстан",
    en: "Republic of Karakalpakstan",
    aliases: [
      "qoraqalpogiston respublikasi",
      "qoraqalpog'iston respublikasi",
      "qoraqalpogiston",
      "qoraqalpog'iston",
      "республика каракалпакстан",
      "каракалпакстан",
      "republic of karakalpakstan",
      "karakalpakstan",
    ],
  },
  {
    id: "2",
    uz: "Andijon viloyati",
    ru: "Андижанская область",
    en: "Andijan Region",
    aliases: [
      "andijon viloyati",
      "andijon",
      "андижанская область",
      "андижан",
      "andijan region",
      "andijan",
    ],
  },
  {
    id: "3",
    uz: "Buxoro viloyati",
    ru: "Бухарская область",
    en: "Bukhara Region",
    aliases: [
      "buxoro viloyati",
      "buxoro",
      "бухарская область",
      "бухара",
      "bukhara region",
      "bukhara",
    ],
  },
  {
    id: "4",
    uz: "Jizzax viloyati",
    ru: "Джизакская область",
    en: "Jizzakh Region",
    aliases: [
      "jizzax viloyati",
      "jizzax",
      "джизакская область",
      "джизак",
      "jizzakh region",
      "jizzakh",
    ],
  },
  {
    id: "5",
    uz: "Qashqadaryo viloyati",
    ru: "Кашкадарьинская область",
    en: "Kashkadarya Region",
    aliases: [
      "qashqadaryo viloyati",
      "qashqadaryo",
      "кашкадарьинская область",
      "кашкадарья",
      "kashkadarya region",
      "kashkadarya",
    ],
  },
  {
    id: "6",
    uz: "Navoiy viloyati",
    ru: "Навоийская область",
    en: "Navoiy Region",
    aliases: [
      "navoiy viloyati",
      "navoiy",
      "навоийская область",
      "навои",
      "navoiy region",
      "navoi",
    ],
  },
  {
    id: "7",
    uz: "Namangan viloyati",
    ru: "Наманганская область",
    en: "Namangan Region",
    aliases: [
      "namangan viloyati",
      "namangan",
      "наманганская область",
      "наманган",
      "namangan region",
    ],
  },
  {
    id: "8",
    uz: "Samarqand viloyati",
    ru: "Самаркандская область",
    en: "Samarkand Region",
    aliases: [
      "samarqand viloyati",
      "samarqand",
      "самаркандская область",
      "самарканд",
      "samarkand region",
      "samarkand",
    ],
  },
  {
    id: "9",
    uz: "Surxandaryo viloyati",
    ru: "Сурхандарьинская область",
    en: "Surkhandarya Region",
    aliases: [
      "surxandaryo viloyati",
      "surxandaryo",
      "сурхандарьинская область",
      "сурхандарья",
      "surkhandarya region",
    ],
  },
  {
    id: "10",
    uz: "Sirdaryo viloyati",
    ru: "Сырдарьинская область",
    en: "Sirdaryo Region",
    aliases: [
      "sirdaryo viloyati",
      "sirdaryo",
      "сырдарьинская область",
      "сырдарья",
      "sirdaryo region",
    ],
  },
  {
    id: "11",
    uz: "Toshkent viloyati",
    ru: "Ташкентская область",
    en: "Tashkent Region",
    aliases: [
      "toshkent viloyati",
      "ташкентская область",
      "tashkent region",
    ],
  },
  {
    id: "12",
    uz: "Farg‘ona viloyati",
    ru: "Ферганская область",
    en: "Fergana Region",
    aliases: [
      "fargona viloyati",
      "farg'ona viloyati",
      "farg‘ona viloyati",
      "fargona",
      "farg'ona",
      "farg‘ona",
      "ферганская область",
      "фергана",
      "fergana region",
      "fergana",
    ],
  },
  {
    id: "13",
    uz: "Xorazm viloyati",
    ru: "Хорезмская область",
    en: "Khorezm Region",
    aliases: [
      "xorazm viloyati",
      "xorazm",
      "хорезмская область",
      "хорезм",
      "khorezm region",
      "khorezm",
    ],
  },
  {
    id: "14",
    uz: "Toshkent shahri",
    ru: "Город Ташкент",
    en: "Tashkent City",
    aliases: [
      "toshkent",
      "tashkent",
      "ташкент",
      "город ташкент",
      "тошкент",
      "toshkent shahri",
      "тошкент шаҳри",
      "tashkent city",
      "toshkent sh",
      "toshkent sh.",
      "г ташкент",
      "г. ташкент",
    ],
  },
];

function normalizeString(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’‘ʻ`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function findCanonicalRegion(input: unknown): CanonicalRegion | null {
  if (!input) return null;
  const raw = String(input).trim();
  if (
    !raw ||
    raw.toLowerCase() === "string" ||
    raw.toLowerCase() === "null" ||
    raw.toLowerCase() === "undefined" ||
    raw.toLowerCase() === "none" ||
    raw === "-"
  ) {
    return null;
  }

  // Check by ID
  const byId = UZBEKISTAN_REGIONS.find((r) => r.id === raw);
  if (byId) return byId;

  const normalized = normalizeString(raw);

  // Check Toshkent viloyati explicitly before Toshkent city
  if (
    normalized === "toshkent viloyati" ||
    normalized === "ташкентская область" ||
    normalized === "tashkent region" ||
    normalized === "toshkent vil" ||
    normalized === "тошкент вилояти"
  ) {
    return UZBEKISTAN_REGIONS.find((r) => r.id === "11") ?? null;
  }

  // Check exact match on localized names
  for (const region of UZBEKISTAN_REGIONS) {
    if (
      normalizeString(region.uz) === normalized ||
      normalizeString(region.ru) === normalized ||
      normalizeString(region.en) === normalized
    ) {
      return region;
    }
  }

  // Check aliases
  for (const region of UZBEKISTAN_REGIONS) {
    if (region.aliases.some((alias) => normalizeString(alias) === normalized)) {
      return region;
    }
  }

  return null;
}

export function getCanonicalRegionOptions(
  locale: "uz" | "ru" | "en" = "uz",
): Array<{ value: string; label: string }> {
  return UZBEKISTAN_REGIONS.map((region) => {
    const label =
      locale === "ru" ? region.ru : locale === "en" ? region.en : region.uz;
    return {
      value: region.uz,
      label,
    };
  });
}
