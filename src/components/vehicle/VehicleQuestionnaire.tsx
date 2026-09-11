"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileCheck2,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";
import { useUserContext } from "@/context/UserContext";
import { useCreateAuctionWithVehicle } from "@/queries/auction-listings";
import {
  resolveCreatedVehicleId,
  useDecodeVin,
  useUploadVehicleAssets,
  useVehicleMakes,
  useVehicleModels,
} from "@/queries/vehicles";
import { getCanonicalRegionOptions } from "@/lib/regions";

const parseAuctionAmount = (value: string | number) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? Number(digits) : 0;
};

const formatAuctionAmount = (value: string | number) => {
  const num = typeof value === "string" ? parseAuctionAmount(value) : value;
  return new Intl.NumberFormat("uz-UZ").format(num || 0);
};

interface VehicleQuestionnaireProps {
  editVehicleId?: string;
  onSuccess?: () => void;
}

const questionnaireItems = [
  {
    name: "identity",
    title: "1. Avtomobil identifikatsiyasi",
    description: "VIN kodi, ishlab chiqarilgan yili, marka va modelini kiriting",
    required: true,
  },
  {
    name: "specs",
    title: "2. Texnik xususiyatlar",
    description: "Yoqilg'i turi, uzatmalar qutisi va privodni tanlang",
    required: true,
  },
  {
    name: "condition",
    title: "3. Holati va joylashuvi",
    description: "Avtomobil holati, tashqi rangi va hududini belgilang",
    required: true,
  },
  {
    name: "photos",
    title: "4. Avtomobil fotosuratlari",
    description: "Avtomobilning turli burchaklardan olingan sifatli rasmlarini yuklang (11-30 ta)",
    required: true,
  },
  {
    name: "documents",
    title: "5. Avtomobil hujjatlari",
    description: "Texnik pasport yoki boshqa egalik tasdiqlovchi hujjatlarni biriktiring",
    required: true,
  },
  {
    name: "terms",
    title: "6. Auksion narxi va shartlari",
    description: "Boshlang'ich narx, zaxira narxi va savdo qadamini belgilang",
    required: true,
  },
  {
    name: "schedule",
    title: "7. Auksion o'tkazilish vaqti",
    description: "Auksion boshlanish va tugash vaqtini belgilang",
    required: true,
  },
  {
    name: "review",
    title: "8. Tekshirish va tasdiqlash",
    description: "Kiritilgan barcha ma'lumotlarni tekshiring va auksionga chiqaring",
    required: false,
  },
] as const;

export function VehicleQuestionnaire({ editVehicleId, onSuccess }: VehicleQuestionnaireProps) {
  const router = useRouter();
  const { user } = useUserContext();

  // Form state
  const [vin, setVin] = useState("");
  const [makeId, setMakeId] = useState("");
  const [modelId, setModelId] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [mileage, setMileage] = useState("");
  const [fuel, setFuel] = useState("GASOLINE");
  const [transmission, setTransmission] = useState("AUTOMATIC");
  const [drivetrain, setDrivetrain] = useState("FWD");
  const [engineVolume, setEngineVolume] = useState("1.5");
  const [bodyType, setBodyType] = useState("SEDAN");
  const [conditionGrade, setConditionGrade] = useState("EXCELLENT");
  const [color, setColor] = useState("Oq");
  const [region, setRegion] = useState("Toshkent sh.");
  const [description, setDescription] = useState("");

  // Auction terms
  const [startPrice, setStartPrice] = useState("5000");
  const [reservePrice, setReservePrice] = useState("8000");
  const [currency, setCurrency] = useState<"USD" | "UZS">("USD");
  const [incrementType, setIncrementType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [incrementValue, setIncrementValue] = useState("100");
  const [depositPercent, setDepositPercent] = useState("5");

  // Schedule
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    return d.toISOString().slice(0, 16);
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 16);
  });

  // Images & documents
  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [docType, setDocType] = useState<"TITLE" | "CUSTOMS" | "INSPECTION">("TITLE");

  // Validation state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const getFieldClass = (field: string, extraClasses = "") => {
    const hasError = Boolean(fieldErrors[field]);
    return `w-full rounded-xl border ${
      hasError
        ? "border-semantic-danger bg-semantic-danger/[0.03] ring-2 ring-semantic-danger/20"
        : "border-border-default bg-surface-canvas focus:border-brand-navy-900 focus:ring-2 focus:ring-brand-navy-900/10"
    } px-3.5 py-2.5 text-sm font-semibold text-text-primary outline-none transition ${extraClasses}`;
  };

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Queries
  const makesQuery = useVehicleMakes();
  const modelsQuery = useVehicleModels(makeId || undefined);
  const decodeVinMutation = useDecodeVin();
  const createListing = useCreateAuctionWithVehicle();
  const uploadAssets = useUploadVehicleAssets();

  // Region options
  const regions = useMemo(() => getCanonicalRegionOptions("uz"), []);

  // Step Validation logic
  const validateStep = (stepName: string): boolean | string => {
    const nextErrors: Record<string, string> = {};
    let firstError: string | null = null;

    const addErr = (field: string, msg: string) => {
      nextErrors[field] = msg;
      if (!firstError) firstError = msg;
    };

    if (stepName === "identity") {
      const trimmedVin = vin.trim().toUpperCase();
      if (!trimmedVin) {
        addErr("vin", "VIN kodi kiritilishi shart");
      } else if (trimmedVin.length !== 17) {
        addErr("vin", "VIN kodi roppa-rosa 17 ta belgidan iborat bo'lishi kerak");
      } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(trimmedVin)) {
        addErr("vin", "VIN kodi noto'g'ri (I, O, Q harflari qatnashmasligi kerak)");
      }

      if (!makeId || Number(makeId) <= 0) {
        addErr("makeId", "Avtomobil markasini tanlang");
      }

      if (!modelId || Number(modelId) <= 0) {
        addErr("modelId", "Avtomobil modelini tanlang");
      }

      const y = Number(year);
      const currentYear = new Date().getFullYear();
      if (!y || !Number.isInteger(y) || y < 1950 || y > currentYear + 1) {
        addErr("year", "Ishlab chiqarilgan yilini to'g'ri tanlang");
      }
    } else if (stepName === "specs") {
      const m = Number(mileage);
      if (mileage.trim() === "" || !Number.isFinite(m) || m < 0) {
        addErr("mileage", "Bosib o'tilgan masofani (km) kiriting");
      }

      if (fuel !== "ELECTRIC") {
        const ev = Number(engineVolume);
        if (!Number.isFinite(ev) || ev <= 0 || ev > 20) {
          addErr("engineVolume", "Dvigatel hajmini to'g'ri kiriting (masalan: 1.5)");
        }
      }

      if (!fuel) addErr("fuel", "Yoqilg'i turini tanlang");
      if (!transmission) addErr("transmission", "Uzatmalar qutisini tanlang");
      if (!drivetrain) addErr("drivetrain", "Privodni tanlang");
    } else if (stepName === "condition") {
      if (!conditionGrade) {
        addErr("conditionGrade", "Avtomobil holatini tanlang");
      }
      if (!color.trim()) {
        addErr("color", "Kuzov rangini kiriting");
      }
      if (!region.trim()) {
        addErr("region", "Avtomobil joylashgan hududni tanlang");
      }
      if (!description.trim()) {
        addErr("description", "Avtomobil haqida qisqacha tavsif yozing");
      }
    } else if (stepName === "photos") {
      if (images.length < 11) {
        addErr("photos", "Auksionga chiqarish uchun kamida 11 ta fotosurat yuklashingiz shart");
      } else if (images.length > 30) {
        addErr("photos", "Maksimal 30 ta rasm yuklash mumkin");
      }
    } else if (stepName === "documents") {
      if (documents.length < 1) {
        addErr("documents", "Kamida 1 ta hujjat (texpasport yoki egalik hujjati) yuklashingiz shart");
      }
    } else if (stepName === "terms") {
      const start = parseAuctionAmount(startPrice);
      const reserve = parseAuctionAmount(reservePrice);
      const inc = parseAuctionAmount(incrementValue);
      const dep = Number(depositPercent);

      if (start <= 0) {
        addErr("startPrice", "Boshlang'ich narxni kiriting");
      }
      if (reservePrice.trim() !== "" && reserve < 0) {
        addErr("reservePrice", "Zaxira narxi musbat summa bo'lishi kerak");
      }
      if (reserve > 0 && reserve < start) {
        addErr("reservePrice", "Zaxira narx boshlang'ich narxdan kam bo'lmasligi kerak");
      }
      if (inc <= 0) {
        addErr("incrementValue", "Savdo qadamini to'g'ri kiriting");
      }
      if (depositPercent.trim() === "" || !Number.isFinite(dep) || dep < 0 || dep > 100) {
        addErr("depositPercent", "Depozit foizi 0 va 100 oralig'ida bo'lishi kerak");
      }
    } else if (stepName === "schedule") {
      if (!startTime) {
        addErr("startTime", "Auksion boshlanish vaqtini belgilang");
      }
      if (!endTime) {
        addErr("endTime", "Auksion tugash vaqtini belgilang");
      } else if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
        addErr("endTime", "Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak");
      }
    }

    setFieldErrors((prev) => ({ ...prev, ...nextErrors }));

    if (firstError) {
      toast.error(firstError);
      return firstError;
    }

    return true;
  };

  // Handle VIN decode
  const handleDecodeVin = () => {
    const trimmed = vin.trim().toUpperCase();
    if (trimmed.length !== 17) return;
    decodeVinMutation.mutate(trimmed, {
      onSuccess: (data) => {
        if (data.makeId) {
          setMakeId(String(data.makeId));
          clearFieldError("makeId");
        }
        if (data.modelId) {
          setModelId(String(data.modelId));
          clearFieldError("modelId");
        }
        if (data.year) {
          setYear(String(data.year));
          clearFieldError("year");
        }
      },
    });
  };

  // Handle Image Upload
  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setImages((prev) => {
      const updated = [...prev, ...newFiles].slice(0, 30);
      if (updated.length >= 11) {
        clearFieldError("photos");
      }
      return updated;
    });
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Document Upload
  const handleAddDocs = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setDocuments((prev) => {
      const updated = [...prev, ...newFiles];
      if (updated.length > 0) {
        clearFieldError("documents");
      }
      return updated;
    });
  };

  // Final Submit handler
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    // Validate every step before sending to backend
    const allSteps = ["identity", "specs", "condition", "photos", "documents", "terms", "schedule"];
    for (const step of allSteps) {
      const check = validateStep(step);
      if (check !== true) {
        setSubmitError(typeof check === "string" ? check : "Majburiy maydonlar to'ldirilmagan.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const vehiclePayload = {
        vin: vin.trim().toUpperCase(),
        makeId: Number(makeId) || 1,
        modelId: Number(modelId) || 1,
        year: Number(year) || new Date().getFullYear(),
        mileage: Number(mileage) || 0,
        fuelType: fuel,
        transmission,
        drivetrain,
        engineVolume: Number(engineVolume) || 1.5,
        bodyType,
        conditionGrade,
        color,
        region,
        description,
      };

      const auctionPayload = {
        startPrice: parseAuctionAmount(startPrice) || 1000,
        reservePrice: parseAuctionAmount(reservePrice) || 2000,
        currency,
        incrementType,
        incrementValue: parseAuctionAmount(incrementValue) || 100,
        depositPercent: Number(depositPercent) || 5,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };

      createListing.mutate(
        { vehicle: vehiclePayload, auction: auctionPayload },
        {
          onSuccess: (response) => {
            const vehicleId = resolveCreatedVehicleId(response);
            if (vehicleId && (images.length > 0 || documents.length > 0)) {
              uploadAssets.mutate(
                {
                  vehicleId,
                  images,
                  documents: documents.map((f) => ({
                    file: f,
                    docType,
                  })),
                },
                {
                  onSuccess: () => {
                    setIsSubmitting(false);
                    setSubmitSuccess(true);
                    toast.success("Auksion va avtomobil muvaffaqiyatli yaratildi!");
                    onSuccess?.();
                    setTimeout(() => {
                      router.push("/dashboard/vehicles");
                    }, 1200);
                  },
                  onError: (err: any) => {
                    setIsSubmitting(false);
                    const msg = err?.message || "Rasmlarni yuklashda xatolik yuz berdi";
                    setSubmitError(msg);
                    toast.error(msg);
                  },
                }
              );
            } else {
              setIsSubmitting(false);
              setSubmitSuccess(true);
              toast.success("Auksion muvaffaqiyatli yaratildi!");
              onSuccess?.();
              setTimeout(() => {
                router.push("/dashboard/vehicles");
              }, 1200);
            }
          },
          onError: (err: any) => {
            setIsSubmitting(false);
            const msg = err?.message || "Auksion yaratishda xatolik yuz berdi";
            setSubmitError(msg);
            toast.error(msg);
          },
        }
      );
    } catch (err: any) {
      setIsSubmitting(false);
      const msg = err?.message || "Kutilmagan xatolik yuz berdi";
      setSubmitError(msg);
      toast.error(msg);
    }
  };

  const selectedMakeName = useMemo(() => {
    return makesQuery.data?.find((m) => String(m.id) === String(makeId))?.name || makeId;
  }, [makesQuery.data, makeId]);

  const selectedModelName = useMemo(() => {
    return modelsQuery.data?.find((m) => String(m.id) === String(modelId))?.name || modelId;
  }, [modelsQuery.data, modelId]);

  return (
    <div
      data-testid="vehicle-wizard"
      className="mx-auto max-w-2xl px-4 py-4 pb-[calc(var(--mobile-nav-height,4.5rem)+env(safe-area-inset-bottom,0px)+3.5rem)] md:pb-8"
    >
      <div className="mb-4 text-center">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-brand-gold-text">
          TezAuksion Savdo Maydoni
        </span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-brand-navy-950">
          Avtomobilni Auksionga Qo‘yish
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-text-secondary">
          Har bir bosqichni to‘ldiring va avtomobilingizni savdoga chiqaring
        </p>
      </div>

      <div className="rounded-2xl border border-border-default/80 bg-white p-5 sm:p-7 shadow-sm">
        <Questionnaire
          className="w-full"
          defaultItem="identity"
          items={questionnaireItems}
          onValidate={validateStep}
          shortcuts="letters"
          onSubmit={handleSubmit}
        >
          <QuestionnaireProgress showPercentage />

          {/* 1. Identity */}
          <QuestionnaireItem name="identity" required>
            <QuestionnaireTitle>1. Avtomobil identifikatsiyasi</QuestionnaireTitle>
            <QuestionnaireDescription>
              Avtomobilning 17 belgili VIN raqami, ishlab chiqarilgan yili, marka va modelini kiriting
            </QuestionnaireDescription>
            <QuestionnaireError />

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  VIN kodi (17 ta belgi) <span className="text-semantic-danger">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    aria-label="VIN kodi"
                    className={getFieldClass(
                      "vin",
                      "font-mono uppercase placeholder:text-text-tertiary"
                    )}
                    maxLength={17}
                    placeholder="Masalan: KMHD841EAFA..."
                    value={vin}
                    onChange={(e) => {
                      setVin(e.target.value.toUpperCase());
                      clearFieldError("vin");
                    }}
                  />
                  <button
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-brand-navy-900 bg-brand-navy-900 px-4 text-xs font-bold text-white shadow-xs transition hover:bg-brand-navy-800 disabled:opacity-50"
                    disabled={vin.trim().length !== 17 || decodeVinMutation.isPending}
                    type="button"
                    onClick={handleDecodeVin}
                  >
                    {decodeVinMutation.isPending ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      "Aniqlash"
                    )}
                  </button>
                </div>
                {fieldErrors.vin && (
                  <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                    <span>•</span> {fieldErrors.vin}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Markasi <span className="text-semantic-danger">*</span>
                  </label>
                  <select
                    aria-label="Markasi"
                    className={getFieldClass("makeId")}
                    value={makeId}
                    onChange={(e) => {
                      setMakeId(e.target.value);
                      setModelId("");
                      clearFieldError("makeId");
                    }}
                  >
                    <option value="">Markani tanlang</option>
                    {makesQuery.data?.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.makeId && (
                    <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                      <span>•</span> {fieldErrors.makeId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Modeli <span className="text-semantic-danger">*</span>
                  </label>
                  <select
                    aria-label="Modeli"
                    className={getFieldClass("modelId")}
                    disabled={!makeId}
                    value={modelId}
                    onChange={(e) => {
                      setModelId(e.target.value);
                      clearFieldError("modelId");
                    }}
                  >
                    <option value="">Modelni tanlang</option>
                    {modelsQuery.data?.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.modelId && (
                    <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                      <span>•</span> {fieldErrors.modelId}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Ishlab chiqarilgan yili <span className="text-semantic-danger">*</span>
                </label>
                <select
                  aria-label="Ishlab chiqarilgan yili"
                  className={getFieldClass("year")}
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    clearFieldError("year");
                  }}
                >
                  {Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i)).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                {fieldErrors.year && (
                  <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                    <span>•</span> {fieldErrors.year}
                  </p>
                )}
              </div>
            </div>
          </QuestionnaireItem>

          {/* 2. Specs */}
          <QuestionnaireItem name="specs" required>
            <QuestionnaireTitle>2. Texnik xususiyatlar</QuestionnaireTitle>
            <QuestionnaireDescription>
              Avtomobilning yoqilg'i turi, uzatmalar qutisi va privodini tanlang
            </QuestionnaireDescription>
            <QuestionnaireError />

            <div className="mt-5 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Yoqilg'i turi <span className="text-semantic-danger">*</span>
                </label>
                <QuestionnaireChoices>
                  <QuestionnaireChoice
                    selected={fuel === "GASOLINE"}
                    value="GASOLINE"
                    onClick={() => {
                      setFuel("GASOLINE");
                      clearFieldError("fuel");
                    }}
                  >
                    <span className="font-bold">Benzin</span>
                  </QuestionnaireChoice>
                  <QuestionnaireChoice
                    selected={fuel === "DIESEL"}
                    value="DIESEL"
                    onClick={() => {
                      setFuel("DIESEL");
                      clearFieldError("fuel");
                    }}
                  >
                    <span className="font-bold">Dizel</span>
                  </QuestionnaireChoice>
                  <QuestionnaireChoice
                    selected={fuel === "ELECTRIC"}
                    value="ELECTRIC"
                    onClick={() => {
                      setFuel("ELECTRIC");
                      clearFieldError("fuel");
                    }}
                  >
                    <span className="font-bold">Elektr</span>
                  </QuestionnaireChoice>
                  <QuestionnaireChoice
                    selected={fuel === "HYBRID"}
                    value="HYBRID"
                    onClick={() => {
                      setFuel("HYBRID");
                      clearFieldError("fuel");
                    }}
                  >
                    <span className="font-bold">Gibrid</span>
                  </QuestionnaireChoice>
                </QuestionnaireChoices>
                {fieldErrors.fuel && (
                  <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                    <span>•</span> {fieldErrors.fuel}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Uzatmalar qutisi (Transmission) <span className="text-semantic-danger">*</span>
                </label>
                <QuestionnaireChoices>
                  <QuestionnaireChoice
                    selected={transmission === "AUTOMATIC"}
                    value="AUTOMATIC"
                    onClick={() => {
                      setTransmission("AUTOMATIC");
                      clearFieldError("transmission");
                    }}
                  >
                    <span className="font-bold">Avtomat</span>
                  </QuestionnaireChoice>
                  <QuestionnaireChoice
                    selected={transmission === "MANUAL"}
                    value="MANUAL"
                    onClick={() => {
                      setTransmission("MANUAL");
                      clearFieldError("transmission");
                    }}
                  >
                    <span className="font-bold">Mexanika</span>
                  </QuestionnaireChoice>
                </QuestionnaireChoices>
                {fieldErrors.transmission && (
                  <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                    <span>•</span> {fieldErrors.transmission}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Privod (Yetakchi g'ildiraklar) <span className="text-semantic-danger">*</span>
                </label>
                <QuestionnaireChoices>
                  <QuestionnaireChoice
                    selected={drivetrain === "FWD"}
                    value="FWD"
                    onClick={() => {
                      setDrivetrain("FWD");
                      clearFieldError("drivetrain");
                    }}
                  >
                    <span className="font-bold">Old privod (FWD)</span>
                  </QuestionnaireChoice>
                  <QuestionnaireChoice
                    selected={drivetrain === "RWD"}
                    value="RWD"
                    onClick={() => {
                      setDrivetrain("RWD");
                      clearFieldError("drivetrain");
                    }}
                  >
                    <span className="font-bold">Orqa privod (RWD)</span>
                  </QuestionnaireChoice>
                  <QuestionnaireChoice
                    selected={drivetrain === "AWD"}
                    value="AWD"
                    onClick={() => {
                      setDrivetrain("AWD");
                      clearFieldError("drivetrain");
                    }}
                  >
                    <span className="font-bold">To'liq privod (AWD/4x4)</span>
                  </QuestionnaireChoice>
                </QuestionnaireChoices>
                {fieldErrors.drivetrain && (
                  <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                    <span>•</span> {fieldErrors.drivetrain}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Yurgan masofa (km) <span className="text-semantic-danger">*</span>
                  </label>
                  <input
                    className={getFieldClass("mileage")}
                    placeholder="Masalan: 45000"
                    type="number"
                    value={mileage}
                    onChange={(e) => {
                      setMileage(e.target.value);
                      clearFieldError("mileage");
                    }}
                  />
                  {fieldErrors.mileage && (
                    <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                      <span>•</span> {fieldErrors.mileage}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Dvigatel hajmi (Litr) {fuel !== "ELECTRIC" && <span className="text-semantic-danger">*</span>}
                  </label>
                  <input
                    className={getFieldClass("engineVolume")}
                    disabled={fuel === "ELECTRIC"}
                    placeholder="Masalan: 1.5"
                    value={fuel === "ELECTRIC" ? "0" : engineVolume}
                    onChange={(e) => {
                      setEngineVolume(e.target.value);
                      clearFieldError("engineVolume");
                    }}
                  />
                  {fieldErrors.engineVolume && (
                    <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                      <span>•</span> {fieldErrors.engineVolume}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </QuestionnaireItem>

          {/* 3. Condition */}
          <QuestionnaireItem name="condition" required>
            <QuestionnaireTitle>3. Holati va joylashuvi</QuestionnaireTitle>
            <QuestionnaireDescription>
              Avtomobilning umumiy holati, rangi va qaysi hududda joylashganini belgilang
            </QuestionnaireDescription>
            <QuestionnaireError />

            <div className="mt-5 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Umumiy holati <span className="text-semantic-danger">*</span>
                </label>
                <QuestionnaireChoices>
                  <QuestionnaireChoice
                    selected={conditionGrade === "EXCELLENT"}
                    value="EXCELLENT"
                    onClick={() => {
                      setConditionGrade("EXCELLENT");
                      clearFieldError("conditionGrade");
                    }}
                  >
                    <span className="font-bold">A'lo holatda</span>
                    <span className="text-xs text-text-secondary">Deyarli yangi, hech qanday ta'mirtalab joyi yo'q</span>
                  </QuestionnaireChoice>
                  <QuestionnaireChoice
                    selected={conditionGrade === "GOOD"}
                    value="GOOD"
                    onClick={() => {
                      setConditionGrade("GOOD");
                      clearFieldError("conditionGrade");
                    }}
                  >
                    <span className="font-bold">Yaxshi holatda</span>
                    <span className="text-xs text-text-secondary">Muntazam foydalanilgan, texnik soz</span>
                  </QuestionnaireChoice>
                  <QuestionnaireChoice
                    selected={conditionGrade === "DAMAGED"}
                    value="DAMAGED"
                    onClick={() => {
                      setConditionGrade("DAMAGED");
                      clearFieldError("conditionGrade");
                    }}
                  >
                    <span className="font-bold">Shikastlangan</span>
                    <span className="text-xs text-text-secondary">Kuzov yoki dvigatelda nuqsonlar bor</span>
                  </QuestionnaireChoice>
                  <QuestionnaireChoice
                    selected={conditionGrade === "NOT_RUNNING"}
                    value="NOT_RUNNING"
                    onClick={() => {
                      setConditionGrade("NOT_RUNNING");
                      clearFieldError("conditionGrade");
                    }}
                  >
                    <span className="font-bold">Yurmaydi (Avariya holatida)</span>
                    <span className="text-xs text-text-secondary">Texnik ta'mirga muhtoj</span>
                  </QuestionnaireChoice>
                </QuestionnaireChoices>
                {fieldErrors.conditionGrade && (
                  <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                    <span>•</span> {fieldErrors.conditionGrade}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Kuzov rangi <span className="text-semantic-danger">*</span>
                  </label>
                  <input
                    className={getFieldClass("color")}
                    placeholder="Masalan: Oq, Qora, Mokriy asfalt"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      clearFieldError("color");
                    }}
                  />
                  {fieldErrors.color && (
                    <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                      <span>•</span> {fieldErrors.color}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Hudud (Viloyat / Shahar) <span className="text-semantic-danger">*</span>
                  </label>
                  <select
                    className={getFieldClass("region")}
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value);
                      clearFieldError("region");
                    }}
                  >
                    {regions.map((r) => (
                      <option key={r.value} value={r.label}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.region && (
                    <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                      <span>•</span> {fieldErrors.region}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Avtomobil haqida tavsif <span className="text-semantic-danger">*</span>
                </label>
                <textarea
                  className={getFieldClass(
                    "description",
                    "min-h-24 resize-none placeholder:text-text-tertiary"
                  )}
                  placeholder="Avtomobilning holati, o'ziga xos jihatlari va afzalliklari haqida yozing..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearFieldError("description");
                  }}
                />
                {fieldErrors.description && (
                  <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                    <span>•</span> {fieldErrors.description}
                  </p>
                )}
              </div>
            </div>
          </QuestionnaireItem>

          {/* 4. Photos */}
          <QuestionnaireItem name="photos" required>
            <QuestionnaireTitle>4. Avtomobil fotosuratlari</QuestionnaireTitle>
            <QuestionnaireDescription>
              Auksionda xaridorlar ishonchini oshirish uchun avtomobilning sifatli rasmlarini yuklang (kamida 11 ta, ko‘pi bilan 30 ta)
            </QuestionnaireDescription>
            <QuestionnaireError />

            <div className="mt-5 space-y-4">
              <label
                className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                  fieldErrors.photos
                    ? "border-semantic-danger bg-semantic-danger/[0.03]"
                    : "border-brand-navy-900/20 bg-brand-navy-900/[0.02] hover:border-brand-navy-900 hover:bg-brand-navy-900/[0.04]"
                }`}
              >
                <Camera className="size-8 text-brand-navy-900/60 mb-2" />
                <span className="text-sm font-bold text-brand-navy-900">
                  Rasmlarni tanlang yoki bu yerga tashlang
                </span>
                <span className="text-xs text-text-secondary mt-1">
                  PNG, JPG, WEBP (Maksimal 10MB har biri)
                </span>
                <input
                  accept="image/*"
                  className="sr-only"
                  multiple
                  type="file"
                  onChange={handleAddPhotos}
                />
              </label>

              {fieldErrors.photos && (
                <p className="text-xs font-bold text-semantic-danger flex items-center gap-1">
                  <span>•</span> {fieldErrors.photos}
                </p>
              )}

              <div className="flex items-center justify-between text-xs font-bold">
                <span className={images.length >= 11 ? "text-semantic-success" : "text-amber-600"}>
                  Yuklangan rasmlar: {images.length} / 30 {images.length < 11 && "(Kamida 11 ta talab qilinadi)"}
                </span>
                {images.length > 0 && (
                  <button
                    className="text-semantic-danger hover:underline"
                    type="button"
                    onClick={() => setImages([])}
                  >
                    Barchasini o'chirish
                  </button>
                )}
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-1">
                  {images.map((img, idx) => (
                    <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-border-default bg-surface-muted">
                      <img
                        alt={`Photo ${idx + 1}`}
                        className="h-full w-full object-cover"
                        src={URL.createObjectURL(img)}
                      />
                      <button
                        className="absolute top-1 right-1 size-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-80 hover:opacity-100"
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </QuestionnaireItem>

          {/* 5. Documents */}
          <QuestionnaireItem name="documents" required>
            <QuestionnaireTitle>5. Avtomobil hujjatlari</QuestionnaireTitle>
            <QuestionnaireDescription>
              Avtomobil texnik pasporti, bojxona deklaratsiyasi yoki texnik ko'rik hujjatlarini biriktiring (kamida 1 ta)
            </QuestionnaireDescription>
            <QuestionnaireError />

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Hujjat turi <span className="text-semantic-danger">*</span>
                </label>
                <select
                  className="w-full rounded-xl border border-border-default bg-surface-canvas px-3.5 py-2.5 text-sm font-semibold text-text-primary outline-none focus:border-brand-navy-900"
                  value={docType}
                  onChange={(e: any) => setDocType(e.target.value)}
                >
                  <option value="TITLE">Texnik pasport (Texpasport)</option>
                  <option value="CUSTOMS">Bojxona deklaratsiyasi</option>
                  <option value="INSPECTION">Texnik ko'rik hujjati</option>
                </select>
              </div>

              <label
                className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition ${
                  fieldErrors.documents
                    ? "border-semantic-danger bg-semantic-danger/[0.03]"
                    : "border-border-default bg-surface-canvas hover:border-brand-navy-900"
                }`}
              >
                <Upload className="size-6 text-text-secondary mb-1.5" />
                <span className="text-xs sm:text-sm font-bold text-brand-navy-900">
                  Hujjat faylini yuklash (PDF yoki Rasm)
                </span>
                <input
                  accept=".pdf,image/*"
                  className="sr-only"
                  multiple
                  type="file"
                  onChange={handleAddDocs}
                />
              </label>

              {fieldErrors.documents && (
                <p className="text-xs font-bold text-semantic-danger flex items-center gap-1">
                  <span>•</span> {fieldErrors.documents}
                </p>
              )}

              {documents.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-text-secondary">
                    Biriktirilgan hujjatlar ({documents.length}):
                  </span>
                  {documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-border-default bg-surface-muted/40 p-2.5 text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck2 className="size-4 text-brand-navy-900 shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                      <button
                        className="text-semantic-danger shrink-0 ml-2 hover:underline"
                        type="button"
                        onClick={() => setDocuments((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        O'chirish
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </QuestionnaireItem>

          {/* 6. Terms */}
          <QuestionnaireItem name="terms" required>
            <QuestionnaireTitle>6. Auksion narxi va shartlari</QuestionnaireTitle>
            <QuestionnaireDescription>
              Boshlang'ich narx, zaxira narxi va savdo qadamini belgilang
            </QuestionnaireDescription>
            <QuestionnaireError />

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Boshlang'ich narx ({currency}) <span className="text-semantic-danger">*</span>
                  </label>
                  <input
                    className={getFieldClass("startPrice")}
                    placeholder="5000"
                    value={startPrice}
                    onChange={(e) => {
                      setStartPrice(e.target.value);
                      clearFieldError("startPrice");
                    }}
                  />
                  {fieldErrors.startPrice && (
                    <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                      <span>•</span> {fieldErrors.startPrice}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Zaxira narxi (Minimal sotish narxi)
                  </label>
                  <input
                    className={getFieldClass("reservePrice")}
                    placeholder="8000"
                    value={reservePrice}
                    onChange={(e) => {
                      setReservePrice(e.target.value);
                      clearFieldError("reservePrice");
                    }}
                  />
                  {fieldErrors.reservePrice && (
                    <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                      <span>•</span> {fieldErrors.reservePrice}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Savdo qadami turi
                </label>
                <QuestionnaireChoices>
                  <QuestionnaireChoice
                    selected={incrementType === "FIXED"}
                    value="FIXED"
                    onClick={() => setIncrementType("FIXED")}
                  >
                    <span className="font-bold">Qat'iy summa bo'yicha</span>
                    <span className="text-xs text-text-secondary">Har bir stavka ma'lum summaga oshadi</span>
                  </QuestionnaireChoice>
                  <QuestionnaireChoice
                    selected={incrementType === "PERCENTAGE"}
                    value="PERCENTAGE"
                    onClick={() => setIncrementType("PERCENTAGE")}
                  >
                    <span className="font-bold">Foiz bo'yicha</span>
                    <span className="text-xs text-text-secondary">Har bir stavka ma'lum foizga oshadi</span>
                  </QuestionnaireChoice>
                </QuestionnaireChoices>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Qadam qiymati ({incrementType === "FIXED" ? currency : "%"}) <span className="text-semantic-danger">*</span>
                  </label>
                  <input
                    className={getFieldClass("incrementValue")}
                    value={incrementValue}
                    onChange={(e) => {
                      setIncrementValue(e.target.value);
                      clearFieldError("incrementValue");
                    }}
                  />
                  {fieldErrors.incrementValue && (
                    <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                      <span>•</span> {fieldErrors.incrementValue}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Garov summasi foizi (%) <span className="text-semantic-danger">*</span>
                  </label>
                  <input
                    className={getFieldClass("depositPercent")}
                    value={depositPercent}
                    onChange={(e) => {
                      setDepositPercent(e.target.value);
                      clearFieldError("depositPercent");
                    }}
                  />
                  {fieldErrors.depositPercent && (
                    <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                      <span>•</span> {fieldErrors.depositPercent}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </QuestionnaireItem>

          {/* 7. Schedule */}
          <QuestionnaireItem name="schedule" required>
            <QuestionnaireTitle>7. Auksion o'tkazilish vaqti</QuestionnaireTitle>
            <QuestionnaireDescription>
              Auksion savdolari qachon boshlanishi va qachon yakunlanishini belgilang
            </QuestionnaireDescription>
            <QuestionnaireError />

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Auksion boshlanish vaqti <span className="text-semantic-danger">*</span>
                </label>
                <input
                  className={getFieldClass("startTime")}
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    clearFieldError("startTime");
                  }}
                />
                {fieldErrors.startTime && (
                  <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                    <span>•</span> {fieldErrors.startTime}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Auksion tugash vaqti <span className="text-semantic-danger">*</span>
                </label>
                <input
                  className={getFieldClass("endTime")}
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    clearFieldError("endTime");
                  }}
                />
                {fieldErrors.endTime && (
                  <p className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1">
                    <span>•</span> {fieldErrors.endTime}
                  </p>
                )}
              </div>
            </div>
          </QuestionnaireItem>

          {/* 8. Review */}
          <QuestionnaireItem name="review" required={false}>
            <QuestionnaireTitle>8. Tekshirish va tasdiqlash</QuestionnaireTitle>
            <QuestionnaireDescription>
              Kiritilgan barcha ma'lumotlarni tekshiring va auksionga chiqaring
            </QuestionnaireDescription>
            <QuestionnaireError />

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-border-default divide-y divide-border-default text-xs sm:text-sm">
                <div className="flex justify-between p-3">
                  <span className="text-text-secondary font-medium">Avtomobil:</span>
                  <span className="font-bold text-brand-navy-950">
                    {selectedMakeName} {selectedModelName} ({year})
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-text-secondary font-medium">VIN kodi:</span>
                  <span className="font-mono font-bold text-brand-navy-950">{vin || "Ko'rsatilmadi"}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-text-secondary font-medium">Yoqilg'i & Uzatmalar:</span>
                  <span className="font-bold text-brand-navy-950">
                    {fuel}, {transmission}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-text-secondary font-medium">Holati & Rangi:</span>
                  <span className="font-bold text-brand-navy-950">
                    {conditionGrade}, {color}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-text-secondary font-medium">Rasmlar soni:</span>
                  <span className="font-bold text-brand-navy-950">{images.length} ta rasm</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-text-secondary font-medium">Boshlang'ich narx:</span>
                  <span className="font-extrabold text-brand-navy-950">
                    {formatAuctionAmount(startPrice)} {currency}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-text-secondary font-medium">Auksion muddati:</span>
                  <span className="font-semibold text-brand-navy-950">
                    {startTime.slice(0, 10)} dan {endTime.slice(0, 10)} gacha
                  </span>
                </div>
              </div>

              {submitError && (
                <div className="rounded-xl border border-semantic-danger/30 bg-semantic-danger/10 p-3.5 text-xs text-semantic-danger flex items-start gap-2.5">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="rounded-xl border border-semantic-success/30 bg-semantic-success/10 p-3.5 text-xs text-semantic-success flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <span>Auksion muvaffaqiyatli yaratildi! Avtomobillar ro'yxatiga yo'naltirilmoqda...</span>
                </div>
              )}
            </div>
          </QuestionnaireItem>

          <QuestionnaireActions>
            <QuestionnairePrevious>Oldingi</QuestionnairePrevious>
            <QuestionnaireNext>Keyingi</QuestionnaireNext>
            <QuestionnaireSubmit disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Yuborilmoqda...
                </span>
              ) : (
                "Auksionga yuborish"
              )}
            </QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      </div>
    </div>
  );
}

export default VehicleQuestionnaire;
