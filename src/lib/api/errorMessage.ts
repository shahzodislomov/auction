export function translateBackendMessage(message: string, lang?: string): string {
  if (!lang) return message;
  const norm = message.trim().toLowerCase();
  const currentLang = lang.toLowerCase();

  // Auction start time validation
  if (
    norm.includes("start time must be at least") ||
    norm.includes("start time must be in the future") ||
    (norm.includes("auction start time") && norm.includes("minute"))
  ) {
    if (currentLang === "uz") return "Auksion boshlanish vaqti kamida 1 daqiqa kelajakda bo‘lishi kerak.";
    if (currentLang === "ru") return "Время начала аукциона должно быть как минимум на 1 минуту в будущем.";
    return "Auction start time must be at least 1 minute in the future.";
  }

  // Auction end time validation
  if (
    norm.includes("end time must be after start time") ||
    norm.includes("end time is invalid")
  ) {
    if (currentLang === "uz") return "Auksion tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak.";
    if (currentLang === "ru") return "Время окончания аукциона должно быть позже времени начала.";
    return "Auction end time must be after start time.";
  }

  // Reserve price validation
  if (
    norm.includes("reserve price must be") ||
    norm.includes("reserve price is invalid")
  ) {
    if (currentLang === "uz") return "Rezerv narx boshlang‘ich narxdan yuqori bo‘lishi kerak.";
    if (currentLang === "ru") return "Резервная цена должна быть выше стартовой цены.";
    return "Reserve price must be greater than start price.";
  }

  // Start price validation
  if (
    norm.includes("start price") &&
    (norm.includes("greater than") || norm.includes("positive"))
  ) {
    if (currentLang === "uz") return "Boshlang‘ich narx 0 dan katta bo‘lishi kerak.";
    if (currentLang === "ru") return "Стартовая цена должна быть больше 0.";
    return "Start price must be greater than 0.";
  }

  // VIN decode unavailable
  if (
    norm.includes("vin decode service is currently unavailable") ||
    norm.includes("vin decode service")
  ) {
    if (currentLang === "uz") return "VIN orqali avto-aniqlash xizmati vaqtinchalik ishlamayapti.";
    if (currentLang === "ru") return "Сервис автоопределения по VIN временно недоступен.";
    return "VIN decode service is currently unavailable.";
  }

  // Vehicle eligibility
  if (
    norm.includes("not eligible") ||
    norm.includes("cannot currently be created")
  ) {
    if (currentLang === "uz") return "Bu avtomobil uchun hozir auksion yaratib bo‘lmaydi.";
    if (currentLang === "ru") return "Для этого автомобиля сейчас нельзя создать аукцион.";
    return "A new auction cannot currently be created for this vehicle.";
  }

  return message;
}

export function apiErrorMessage(
  error: unknown,
  fallback: string,
  lang?: string,
): string {
  if (!error || typeof error !== "object") return fallback;

  const candidate = error as {
    message?: unknown;
    response?: {
      data?: {
        data?: { message?: unknown };
        error?: unknown;
        message?: unknown;
      };
    };
  };
  const backendMessage =
    candidate.response?.data?.message ??
    candidate.response?.data?.data?.message ??
    candidate.response?.data?.error;

  if (typeof backendMessage === "string" && backendMessage.trim()) {
    const raw = backendMessage.trim();
    return lang ? translateBackendMessage(raw, lang) : raw;
  }
  if (typeof candidate.message === "string" && candidate.message.trim()) {
    const raw = candidate.message.trim();
    return lang ? translateBackendMessage(raw, lang) : raw;
  }
  return fallback;
}
