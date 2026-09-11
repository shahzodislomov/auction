/**
 * AUCTION v2 Cars Enums and Specifications Constants
 */

export const FUEL_TYPES = {
  GASOLINE: 'GASOLINE',
  DIESEL: 'DIESEL',
  ELECTRIC: 'ELECTRIC',
  HYBRID: 'HYBRID',
  PLUG_IN_HYBRID: 'PLUG_IN_HYBRID',
  LPG_CNG: 'LPG_CNG',
};

export const FUEL_TYPE_LABELS = {
  GASOLINE: { uz: 'Benzin', ru: 'Бензин', en: 'Gasoline' },
  DIESEL: { uz: 'Dizel', ru: 'Дизель', en: 'Diesel' },
  ELECTRIC: { uz: 'Elektr', ru: 'Электро', en: 'Electric' },
  HYBRID: { uz: 'Gibrid', ru: 'Гибрид', en: 'Hybrid' },
  PLUG_IN_HYBRID: { uz: 'Plug-in Gibrid', ru: 'Plug-in гибрид', en: 'Plug-in Hybrid' },
  LPG_CNG: { uz: 'Gaz (Metan/Propan)', ru: 'Газ (Метан/Пропан)', en: 'LPG/CNG Gas' },
};

export const TRANSMISSION_TYPES = {
  AUTOMATIC: 'AUTOMATIC',
  MANUAL: 'MANUAL',
  ROBOT: 'ROBOT',
  CVT: 'CVT',
};

export const TRANSMISSION_TYPE_LABELS = {
  AUTOMATIC: { uz: 'Avtomat', ru: 'Автомат', en: 'Automatic' },
  MANUAL: { uz: 'Mexanika', ru: 'Механика', en: 'Manual' },
  ROBOT: { uz: 'Robot', ru: 'Робот', en: 'Robotic' },
  CVT: { uz: 'Variator (CVT)', ru: 'Вариатор (CVT)', en: 'CVT' },
};

export const DRIVETRAIN_TYPES = {
  FWD: 'FWD',
  RWD: 'RWD',
  AWD: 'AWD',
  FOUR_WD: 'FOUR_WD',
};

export const DRIVETRAIN_TYPE_LABELS = {
  FWD: { uz: 'Old tortuvchi (FWD)', ru: 'Передний привод (FWD)', en: 'Front-Wheel Drive' },
  RWD: { uz: 'Orqa tortuvchi (RWD)', ru: 'Задний привод (RWD)', en: 'Rear-Wheel Drive' },
  AWD: { uz: 'To\'liq tortuvchi (AWD)', ru: 'Полный привод (AWD)', en: 'All-Wheel Drive' },
  FOUR_WD: { uz: '4x4 (4WD)', ru: 'Полный привод 4x4', en: '4WD' },
};

export const BODY_TYPES = {
  SEDAN: 'SEDAN',
  SUV: 'SUV',
  CROSSOVER: 'CROSSOVER',
  HATCHBACK: 'HATCHBACK',
  COUPE: 'COUPE',
  CONVERTIBLE: 'CONVERTIBLE',
  MINIVAN: 'MINIVAN',
  PICKUP: 'PICKUP',
  WAGON: 'WAGON',
};

export const BODY_TYPE_LABELS = {
  SEDAN: { uz: 'Sedan', ru: 'Седан', en: 'Sedan' },
  SUV: { uz: 'SUV', ru: 'Внедорожник', en: 'SUV' },
  CROSSOVER: { uz: 'Krossover', ru: 'Кроссовер', en: 'Crossover' },
  HATCHBACK: { uz: 'Xetchbek', ru: 'Хэтчбек', en: 'Hatchback' },
  COUPE: { uz: 'Kupe', ru: 'Купе', en: 'Coupe' },
  MINIVAN: { uz: 'Miniven', ru: 'Минивэн', en: 'Minivan' },
  PICKUP: { uz: 'Pikap', ru: 'Пикап', en: 'Pickup' },
  WAGON: { uz: 'Universal', ru: 'Универсал', en: 'Wagon' },
};

export const CONDITION_GRADES = {
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  NEEDS_REPAIR: 'NEEDS_REPAIR',
  SALVAGE: 'SALVAGE',
};

export const CONDITION_GRADE_LABELS = {
  EXCELLENT: { uz: "A'lo darajada", ru: 'Отличное', en: 'Excellent' },
  GOOD: { uz: 'Yaxshi', ru: 'Хорошее', en: 'Good' },
  FAIR: { uz: 'Qoniqarli', ru: 'Удовлетворительное', en: 'Fair' },
  NEEDS_REPAIR: { uz: "Ta'mir talab", ru: 'Требует ремонта', en: 'Needs Repair' },
  SALVAGE: { uz: 'Avariya holatida', ru: 'Аварийное', en: 'Salvage' },
};

export const PHOTO_LIMITS = {
  MIN_REQUIRED: 5,
  MAX_ALLOWED: 30,
};
