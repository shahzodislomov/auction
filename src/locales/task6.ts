import { useContext } from "react";

import { LangSwitch, type Lang } from "@/context/LangSwitch";

export interface InformationSection {
  title: string;
  body: string;
}

export interface InformationContent {
  eyebrow: string;
  title: string;
  intro: string;
  sections: readonly InformationSection[];
}

interface Task6Copy {
  auth: {
    brandKicker: string;
    brandTitle: string;
    brandText: string;
    brandPoints: readonly string[];
    loginEyebrow: string;
    loginTitle: string;
    loginIntro: string;
    registerEyebrow: string;
    registerTitle: string;
    registerIntro: string;
    individual: string;
    organization: string;
    accountType: string;
    organizationNote: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
    showPassword: string;
    hidePassword: string;
    acceptTerms: string;
    termsLink: string;
    consentVersion: string;
    publicOfferUnavailable: string;
    socialAuthUnavailable: string;
    login: string;
    createAccount: string;
    working: string;
    or: string;
    forgotPrompt: string;
    forgotLink: string;
    noAccount: string;
    registerLink: string;
    registrationUnavailable: string;
    hasAccount: string;
    loginLink: string;
    returnToTask: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordLength: string;
    firstNameRequired: string;
    lastNameRequired: string;
    phoneRequired: string;
    phoneInvalid: string;
    passwordsMismatch: string;
    termsRequired: string;
    loginError: string;
    registerError: string;
    verifyError: string;
    missingDevice: string;
    googleDomainError: string;
    googlePopupClosed: string;
    googlePopupBlocked: string;
    googleServerError: string;
    withTelegram: string;
    telegramDomainError: string;
    telegramPopupClosed: string;
    telegramServerError: string;
    otpTitle: string;
    otpIntro: string;
    otpDigit: string;
    verifyCode: string;
    resendCode: string;
    resendIn: string;
    secondsShort: string;
    codeRequired: string;
    resendLimitReached: string;
    backToForm: string;
    resetEyebrow: string;
    resetTitle: string;
    resetIntro: string;
    newPassword: string;
    sendCode: string;
    resetSuccess: string;
  };
  wizard: {
    eyebrow: string;
    title: string;
    intro: string;
    stages: readonly string[];
    step: string;
    of: string;
    draftSaved: string;
    draftSessionOnly: string;
    draftStorageUnavailable: string;
    draftHint: string;
    back: string;
    next: string;
    submit: string;
    submitting: string;
    demoAction: string;
    vin: string;
    make: string;
    model: string;
    year: string;
    mileage: string;
    fuel: string;
    transmission: string;
    drivetrain: string;
    engineVolume: string;
    bodyType: string;
    color: string;
    conditionGrade: string;
    region: string;
    description: string;
    condition: string;
    damage: string;
    photoLabel: string;
    photoGuidance: string;
    photoApiLimit: string;
    documentLabel: string;
    documentType: string;
    documentGuidance: string;
    documentUnavailable: string;
    documentDemo: string;
    startPrice: string;
    increment: string;
    startTime: string;
    auctionTermsNote: string;
    reviewIntro: string;
    identitySummary: string;
    technicalSummary: string;
    conditionSummary: string;
    mediaSummary: string;
    auctionSummary: string;
    unavailableTitle: string;
    unavailableBody: string;
    demoTitle: string;
    demoBody: string;
    submitSuccess: string;
    submitError: string;
    vinError: string;
    vinFormatError: string;
    engineVolumeError: string;
    vinHint: string;
    engineVolumeHint: string;
    mileageHint: string;
    makeError: string;
    modelError: string;
    yearError: string;
    mileageError: string;
    conditionError: string;
    requiredError: string;
    selectPlaceholder: string;
    selectMakeFirst: string;
    lookupLoading: string;
    lookupError: string;
    photoError: string;
    startPriceError: string;
    incrementError: string;
    startTimeError: string;
    loginRequired: string;
    sellerIdentityRequired: string;
    sellerRoleRequired: string;
    legacyPhotoLimit: string;
    notProvided: string;
    kycRequiredTitle: string;
    kycRequiredDescription: string;
    kycRequiredAction: string;
    kycRequiredCancel: string;
    optionLabels: Readonly<Record<string, string>>;
    documentTypeLabels: Readonly<Record<string, string>>;
  };
  info: {
    about: InformationContent;
    faq: InformationContent;
    privacy: InformationContent;
    support: InformationContent;
    howStepsTitle: string;
    howSteps: readonly InformationSection[];
    faqTitle: string;
    faqs: readonly InformationSection[];
    supportFormTitle: string;
    supportFormIntro: string;
    supportSubject: string;
    supportMessage: string;
    supportSend: string;
    supportSending: string;
    supportSent: string;
    supportError: string;
    supportLogin: string;
    supportUnavailable: string;
    supportSubjectRequired: string;
    supportMessageRequired: string;
  };
}

export const task6Messages: Record<Lang, Task6Copy> = {
  en: {
    auth: {
      brandKicker: "A clear route to every auction",
      brandTitle: "Your TezAuksion account keeps the ledger connected.",
      brandText:
        "Save vehicles, follow bids, and return to a seller draft without losing context.",
      brandPoints: [
        "One account for buying and selling",
        "Visible verification and auction status",
        "Secure email and device confirmation",
      ],
      loginEyebrow: "Account access",
      loginTitle: "Welcome back",
      loginIntro: "Log in to continue your auction task.",
      registerEyebrow: "Create an account",
      registerTitle: "Start with the right account",
      registerIntro:
        "Create a personal account now. Organization verification remains a separate capability-aware step.",
      individual: "Individual",
      organization: "Organization",
      accountType: "Account type",
      organizationNote:
        "Organization verification is not connected yet. This creates the primary contact’s personal account only.",
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone number",
      email: "Email address",
      password: "Password",
      confirmPassword: "Confirm password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      acceptTerms: "Versioned Terms of Service and public-offer acceptance (required).",
      termsLink: "Read the non-contractual Privacy summary",
      consentVersion: "Privacy summary UI version: 2026-07-16 · Effective: 16 July 2026",
      publicOfferUnavailable:
        "The versioned Terms of Service, public-offer document, and acceptance record are not connected. Account creation is unavailable.",
      socialAuthUnavailable:
        "Google account access is unavailable until the service confirms it cannot create an unaccepted account.",
      login: "Log in",
      createAccount: "Create account",
      working: "Please wait",
      or: "or",
      forgotPrompt: "Forgot your password?",
      forgotLink: "Reset it",
      noAccount: "New to TezAuksion?",
      registerLink: "Create an account",
      registrationUnavailable: "New account registration is currently unavailable.",
      hasAccount: "Already registered?",
      loginLink: "Log in",
      returnToTask: "After authentication, you will return to {path}.",
      emailRequired: "Enter your email address.",
      emailInvalid: "Enter a valid email address.",
      passwordRequired: "Enter your password.",
      passwordLength: "Use at least 8 characters.",
      firstNameRequired: "Enter your first name.",
      lastNameRequired: "Enter your last name.",
      phoneRequired: "Enter your phone number.",
      phoneInvalid: "Enter the 9 digits after +998.",
      passwordsMismatch: "The passwords do not match.",
      termsRequired: "Acknowledge the identified Privacy summary before creating an account.",
      loginError: "Login failed. Check the email and password, then try again.",
      registerError: "Registration failed. Review the fields and try again.",
      verifyError: "The verification code was not accepted. Check it and try again.",
      missingDevice: "Device confirmation is still loading. Try again in a moment.",
      googleDomainError: "Google sign-in is temporarily unavailable for domain {domain}. Please log in using email.",
      googlePopupClosed: "Google sign-in was canceled (window closed).",
      googlePopupBlocked: "Pop-up window was blocked by browser. Please allow pop-up windows.",
      googleServerError: "Server error: {message}",
      withTelegram: "Continue with Telegram",
      telegramDomainError: "Telegram sign-in is temporarily unavailable for domain {domain}.",
      telegramPopupClosed: "Telegram sign-in was canceled (window closed).",
      telegramServerError: "Server error: {message}",
      otpTitle: "Confirm your email",
      otpIntro: "Enter the five-digit code sent to {email}.",
      otpDigit: "Verification digit {number}",
      verifyCode: "Verify code",
      resendCode: "Resend code",
      resendIn: "Resend code in {seconds}{suffix}",
      secondsShort: "s",
      codeRequired: "Enter the 5-digit code.",
      resendLimitReached: "Maximum resend attempts reached (3/3).",
      backToForm: "Back to account details",
      resetEyebrow: "Account recovery",
      resetTitle: "Reset your password",
      resetIntro: "We will send a verification code to your account email.",
      newPassword: "New password",
      sendCode: "Send verification code",
      resetSuccess: "Password updated. You can now log in.",
    },
    wizard: {
      eyebrow: "Seller intake",
      title: "Prepare your vehicle for auction",
      intro:
        "Work through eight clear stages. Text fields are saved on this device as a local draft.",
      stages: [
        "VIN & identity",
        "Technical facts",
        "Condition & description",
        "Photos",
        "Documents",
        "Auction terms",
        "Auction schedule",
        "Review",
      ],
      step: "Step",
      of: "of",
      draftSaved: "Draft saved locally",
      draftSessionOnly: "Changes stay in this session until you sign in.",
      draftStorageUnavailable:
        "Local draft storage is unavailable; changes remain in this session.",
      draftHint: "Files are not stored in the browser draft for your privacy.",
      back: "Back",
      next: "Next step",
      submit: "Submit vehicle",
      submitting: "Submitting vehicle",
      demoAction: "Keep as local draft",
      vin: "VIN",
      make: "Make",
      model: "Model",
      year: "Year",
      mileage: "Mileage (km)",
      fuel: "Fuel",
      transmission: "Transmission",
      drivetrain: "Drivetrain",
      engineVolume: "Engine volume (L)",
      bodyType: "Body type",
      color: "Color",
      conditionGrade: "Condition grade",
      region: "Region",
      description: "Description",
      condition: "Vehicle condition",
      damage: "Known damage and repairs",
      photoLabel: "Vehicle photos",
      photoGuidance: "Add 5–30 clear vehicle images. The first image becomes the primary view.",
      photoApiLimit:
        "The complete draft supports 30 images. The connected legacy create endpoint can submit up to 10 until the vehicle media API is available.",
      documentLabel: "Ownership and vehicle documents",
      documentType: "Document type",
      documentGuidance:
        "Add files for document review. They are sent with the vehicle and are never persisted in the local browser draft.",
      documentUnavailable:
        "Document verification is not connected in production. Files cannot be submitted yet.",
      documentDemo:
        "Document review is a local interface preview. No verification decision will be recorded.",
      startPrice: "Starting price (UZS)",
      increment: "Bid increment",
      startTime: "Preferred auction start",
      auctionTermsNote:
        "Final auction terms and approval remain subject to moderation. This screen does not create a contract.",
      reviewIntro: "Review the facts below before attempting submission.",
      identitySummary: "Vehicle identity",
      technicalSummary: "Technical facts",
      conditionSummary: "Condition disclosure",
      mediaSummary: "Media and documents",
      auctionSummary: "Auction request",
      unavailableTitle: "Production submission is unavailable",
      unavailableBody:
        "Vehicle document verification is not connected, so this draft cannot report a successful production submission.",
      demoTitle: "Demo workflow",
      demoBody:
        "This environment keeps the complete wizard visible, but submission only saves the local draft.",
      submitSuccess: "Vehicle lot created and sent for the existing moderation flow.",
      submitError: "The vehicle could not be submitted. Your draft is still saved locally.",
      vinError: "Enter a 17-character VIN.",
      vinFormatError: "VIN must contain 17 valid alphanumeric characters.",
      engineVolumeError: "Enter a valid engine volume (e.g. 2.0).",
      vinHint: "e.g., 1HGCR2F83HA000000",
      engineVolumeHint: "e.g., 2.4",
      mileageHint: "e.g., 85000",
      makeError: "Enter a positive make ID.",
      modelError: "Enter a positive model ID.",
      yearError: "Enter a year between 1950 and the next calendar year.",
      mileageError: "Enter a valid mileage.",
      conditionError: "Describe the vehicle condition.",
      requiredError: "This field is required.",
      selectPlaceholder: "Select an option",
      selectMakeFirst: "Select a make first",
      lookupLoading: "Loading...",
      lookupError: "Options could not be loaded. Try again.",
      photoError: "Add at least 5 and no more than 30 images.",
      startPriceError: "Enter a starting price greater than zero.",
      incrementError: "Enter a bid n greater than zero.",
      startTimeError: "Choose an auction start time.",
      loginRequired: "Log in before submitting this vehicle draft.",
      sellerIdentityRequired: "Your account identity is unavailable. Sign in again before submitting.",
      sellerRoleRequired:
        "An account is required to create vehicle lots.",
      legacyPhotoLimit:
        "This draft keeps all selected photos, but the connected legacy endpoint accepts at most 10 photos. Reduce the selection to submit now.",
      notProvided: "Not provided",
      kycRequiredTitle: "Verify your identity",
      kycRequiredDescription: "Identity verification is required before you can create a vehicle listing. Please complete the KYC process to continue.",
      kycRequiredAction: "Verify identity",
      kycRequiredCancel: "Not now",
      optionLabels: {
        PETROL: "Petrol", DIESEL: "Diesel", GAS: "Gas", HYBRID: "Hybrid", ELECTRIC: "Electric",
        MANUAL: "Manual", AUTOMATIC: "Automatic", CVT: "CVT", ROBOT: "Robotized",
        FWD: "Front-wheel drive", RWD: "Rear-wheel drive", AWD: "All-wheel drive",
        SEDAN: "Sedan", SUV: "SUV", HATCHBACK: "Hatchback", COUPE: "Coupe", CONVERTIBLE: "Convertible", WAGON: "Station wagon", MINIVAN: "Minivan", PICKUP: "Pickup",
        EXCELLENT: "Excellent", GOOD: "Good", DAMAGED: "Damaged", NOT_RUNNING: "Not running",
        WHITE: "White", BLACK: "Black", SILVER: "Silver", GRAY: "Grey", RED: "Red", BLUE: "Blue", GREEN: "Green", BROWN: "Brown", BEIGE: "Beige", YELLOW: "Yellow",
      },
      documentTypeLabels: { TITLE: "Ownership / registration document", CUSTOMS: "Customs document", INSPECTION: "Inspection document" },
    },
    info: {
      about: {
        eyebrow: "About TezAuksion",
        title: "A calmer, clearer vehicle auction marketplace",
        intro:
          "TezAuksion brings vehicle identity, auction status, and next actions into one precise ledger-like experience.",
        sections: [
          {
            title: "Built around vehicles",
            body: "Search, listing, condition, and bidding language is designed around cars rather than generic marketplace inventory.",
          },
          {
            title: "Truth before theatre",
            body: "Connected operations remain live. Features awaiting backend support are labelled as demo or unavailable instead of reporting invented outcomes.",
          },
          {
            title: "One shared record",
            body: "Buyers and sellers can return to the same vehicle and understand its facts, auction state, and next required action.",
          },
        ],
      },
      faq: {
        eyebrow: "How it works",
        title: "From vehicle discovery to a clear auction result",
        intro:
          "Every step states what is known, what is required, and which operation is currently available.",
        sections: [],
      },
      privacy: {
        eyebrow: "Privacy",
        title: "How account and auction information is handled",
        intro:
          "This frontend summary is not a complete legal privacy notice. Contact support for the current governing policy before submitting sensitive information.",
        sections: [
          {
            title: "Information we collect",
            body: "Account contact details, device confirmation data, vehicle facts, media, and activity required to provide the requested service may be processed.",
          },
          {
            title: "How information is used",
            body: "Current screens send information to connected services for authentication, auction participation, moderation, security, and support. This interface does not document every server-side use.",
          },
          {
            title: "Sharing and retention",
            body: "This frontend does not expose a verified processor list or retention schedule. Ask support for the current policy and responsible contact.",
          },
          {
            title: "Your choices",
            body: "Support can receive privacy questions, but this interface does not provide a verified access or correction workflow. Browser-saved seller drafts can be removed from this device.",
          },
          {
            title: "Security",
            body: "Email and device confirmation protect account access. Never share a verification code with another person.",
          },
        ],
      },
      support: {
        eyebrow: "Support",
        title: "Tell us where the auction journey stopped",
        intro:
          "Include the lot number or vehicle identity and the action you were trying to complete. Do not include passwords or verification codes.",
        sections: [],
      },
      howStepsTitle: "The auction path",
      howSteps: [
        { title: "1. Find a vehicle", body: "Search the facts supplied with each listing and compare the auction state." },
        { title: "2. Prepare to bid", body: "Log in and complete only the checks required by the live capability." },
        { title: "3. Follow the auction", body: "See the current price, minimum next bid, timer, and connection state." },
        { title: "4. Complete the result", body: "Follow the connected payment and post-sale steps shown for the winning record." },
      ],
      faqTitle: "Frequently asked questions",
      faqs: [
        { title: "Can I inspect a vehicle before bidding?", body: "Use only the inspection and seller information shown on the listing. Contact support when a connected viewing option is not present." },
        { title: "Why is an action unavailable?", body: "Some v2 operations do not yet have production endpoints. The interface keeps them visible but prevents a false success state." },
        { title: "Can I save a seller form?", body: "Yes. Text fields in the seven-stage seller form are saved locally on the current device. Uploaded files are not stored in that draft." },
        { title: "What happens when a bid fails?", body: "The auction room keeps your entered amount and explains whether the bid was rejected or the connection needs recovery." },
      ],
      supportFormTitle: "Send a support request",
      supportFormIntro: "Authenticated requests use the existing support messaging service.",
      supportSubject: "Subject",
      supportMessage: "Message",
      supportSend: "Send request",
      supportSending: "Sending request",
      supportSent: "Your request was sent to support.",
      supportError: "The request could not be sent. Your message remains in the form.",
      supportLogin: "Log in to send a request through the connected support service.",
      supportUnavailable: "Live support messaging is unavailable in this environment.",
      supportSubjectRequired: "Enter a short subject.",
      supportMessageRequired: "Describe what happened and how we can help.",
    },
  },
  uz: {
    auth: {
      brandKicker: "Har bir auksionga aniq yo‘l",
      brandTitle: "TezAuksion hisobingiz barcha yozuvlarni bog‘lab turadi.",
      brandText: "Avtomobillarni saqlang, takliflarni kuzating va sotuvchi qoralamasiga kontekstni yo‘qotmasdan qayting.",
      brandPoints: ["Xarid va sotuv uchun bitta hisob", "Tasdiqlash va auksion holati ko‘rinadi", "Email va qurilma orqali xavfsiz tasdiqlash"],
      loginEyebrow: "Hisobga kirish", loginTitle: "Xush kelibsiz", loginIntro: "Auksion vazifangizni davom ettirish uchun kiring.",
      registerEyebrow: "Hisob yaratish", registerTitle: "To‘g‘ri hisob turidan boshlang", registerIntro: "Hozir shaxsiy hisob yarating. Tashkilotni tasdiqlash alohida imkoniyat bosqichi bo‘lib qoladi.",
      individual: "Jismoniy shaxs", organization: "Tashkilot", accountType: "Hisob turi", organizationNote: "Tashkilotni tasdiqlash hali ulanmagan. Hozir faqat asosiy aloqa shaxsining shaxsiy hisobi yaratiladi.",
      firstName: "Ism", lastName: "Familiya", phone: "Telefon raqami", email: "Email manzil", password: "Parol", confirmPassword: "Parolni tasdiqlang", showPassword: "Parolni ko‘rsatish", hidePassword: "Parolni yashirish",
      acceptTerms: "Versiyalangan foydalanish shartlari va public-offer roziligi (majburiy).", termsLink: "Shartnoma hisoblanmaydigan Maxfiylik xulosasini o‘qish", consentVersion: "Maxfiylik xulosasi UI versiyasi: 2026-07-16 · Kuchga kirgan sana: 16 iyul 2026", publicOfferUnavailable: "Versiyalangan foydalanish shartlari, public-offer hujjati va rozilik yozuvi ulanmagan. Hisob yaratish mavjud emas.", socialAuthUnavailable: "Xizmat roziliksiz yangi hisob yaratmasligini tasdiqlamaguncha Google orqali kirish mavjud emas.", login: "Kirish", createAccount: "Hisob yaratish", working: "Kuting", or: "yoki",
      forgotPrompt: "Parolni unutdingizmi?", forgotLink: "Tiklash", noAccount: "TezAuksionda yangimisiz?", registerLink: "Hisob yaratish", registrationUnavailable: "Yangi hisoblarni ro‘yxatdan o‘tkazish hozircha mavjud emas.", hasAccount: "Avval ro‘yxatdan o‘tganmisiz?", loginLink: "Kirish", returnToTask: "Tasdiqlashdan so‘ng {path} sahifasiga qaytasiz.",
      emailRequired: "Email manzilni kiriting.", emailInvalid: "To‘g‘ri email manzilni kiriting.", passwordRequired: "Parolni kiriting.", passwordLength: "Kamida 8 ta belgidan foydalaning.", firstNameRequired: "Ismingizni kiriting.", lastNameRequired: "Familiyangizni kiriting.", phoneRequired: "Telefon raqamini kiriting.", phoneInvalid: "+998 dan keyingi 9 ta raqamni kiriting.", passwordsMismatch: "Parollar mos kelmadi.", termsRequired: "Hisob yaratishdan oldin ko‘rsatilgan Maxfiylik xulosasini tasdiqlang.",
      loginError: "Kirish amalga oshmadi. Email va parolni tekshirib qayta urinib ko‘ring.", registerError: "Ro‘yxatdan o‘tish amalga oshmadi. Maydonlarni tekshiring.", verifyError: "Tasdiqlash kodi qabul qilinmadi. Kodni tekshiring.", missingDevice: "Qurilma tasdiqlanishi yuklanmoqda. Birozdan keyin urinib ko‘ring.",
      googleDomainError: "{domain} domeni uchun Google orqali kirish vaqtincha mavjud emas. Email orqali kiring.", googlePopupClosed: "Google orqali kirish bekor qilindi (oyna yopildi).", googlePopupBlocked: "Qalqib chiquvchi oyna brauzer tomonidan bloklandi. Qalqib chiquvchi oynalarga ruxsat bering.", googleServerError: "Server xatoligi: {message}",
      withTelegram: "Telegram orqali davom eting", telegramDomainError: "{domain} domeni uchun Telegram orqali kirish vaqtincha mavjud emas.", telegramPopupClosed: "Telegram orqali kirish bekor qilindi (oyna yopildi).", telegramServerError: "Server xatoligi: {message}",
      otpTitle: "Emailni tasdiqlang", otpIntro: "{email} manziliga yuborilgan besh xonali kodni kiriting.", otpDigit: "Tasdiqlash raqami {number}", verifyCode: "Kodni tasdiqlash", resendCode: "Kodni qayta yuborish", resendIn: "Kodni {seconds}{suffix} dan keyin yuborish", secondsShort: "s", codeRequired: "Besh raqamning barchasini kiriting.", resendLimitReached: "Qayta yuborish urunishlari chekloviga etildi (3/3).", backToForm: "Hisob ma’lumotlariga qaytish",
      resetEyebrow: "Hisobni tiklash", resetTitle: "Parolni qayta tiklash", resetIntro: "Hisob emailingizga tasdiqlash kodini yuboramiz.", newPassword: "Yangi parol", sendCode: "Tasdiqlash kodini yuborish", resetSuccess: "Parol yangilandi. Endi hisobga kirishingiz mumkin.",
    },
    wizard: {
      eyebrow: "Sotuvchi arizasi", title: "Avtomobilni auksionga tayyorlang", intro: "Sakkiz aniq bosqichdan o‘ting. Matnli maydonlar ushbu qurilmada qoralama sifatida saqlanadi.",
      stages: ["VIN va identifikatsiya", "Texnik ma’lumotlar", "Holat va tavsif", "Suratlar", "Hujjatlar", "Auksion shartlari", "Auksion vaqti", "Ko‘rib chiqish"],
      step: "Bosqich", of: "/", draftSaved: "Qoralama qurilmada saqlandi", draftSessionOnly: "Kirishgacha o‘zgarishlar faqat shu seansda qoladi.", draftStorageUnavailable: "Mahalliy qoralama xotirasi mavjud emas; o‘zgarishlar shu seansda qoladi.", draftHint: "Maxfiyligingiz uchun fayllar brauzer qoralamasida saqlanmaydi.", back: "Orqaga", next: "Keyingi bosqich", submit: "Avtomobilni yuborish", submitting: "Avtomobil yuborilmoqda", demoAction: "Mahalliy qoralama sifatida saqlash",
      vin: "VIN", make: "Marka", model: "Model", year: "Yil", mileage: "Yurgan masofa (km)", fuel: "Yoqilg‘i", transmission: "Uzatmalar qutisi", drivetrain: "Tortish turi", engineVolume: "Dvigatel hajmi (L)", bodyType: "Kuzov turi", color: "Rang", conditionGrade: "Holat darajasi", region: "Hudud", description: "Tavsif", condition: "Avtomobil holati", damage: "Ma’lum shikast va ta’mirlar",
      photoLabel: "Avtomobil suratlari", photoGuidance: "Avtomobilning 5–30 ta aniq suratini qo‘shing. Birinchi surat asosiy ko‘rinish bo‘ladi.", photoApiLimit: "To‘liq qoralama 30 tagacha suratni saqlaydi. Avtomobil media API tayyor bo‘lguncha amaldagi legacy yaratish endpointi 10 tagacha suratni yubora oladi.",
      documentLabel: "Egalik va avtomobil hujjatlari", documentType: "Hujjat turi", documentGuidance: "Hujjatlarni ko‘rib chiqish uchun fayllarni qo‘shing. Ular avtomobil bilan yuboriladi va brauzerdagi mahalliy qoralamada saqlanmaydi.", documentUnavailable: "Hujjatlarni tekshirish production muhitida ulanmagan. Fayllarni hozir yuborib bo‘lmaydi.", documentDemo: "Hujjatlarni ko‘rib chiqish faqat mahalliy interfeys namunasidir. Qaror yozib olinmaydi.",
      startPrice: "Boshlang‘ich narx (UZS)", increment: "Taklif qadami", startTime: "Istalgan auksion boshlanishi", auctionTermsNote: "Yakuniy shartlar moderatsiya tasdig‘iga bog‘liq. Bu ekran shartnoma yaratmaydi.", reviewIntro: "Yuborishdan oldin quyidagi ma’lumotlarni tekshiring.", identitySummary: "Avtomobil identifikatsiyasi", technicalSummary: "Texnik ma’lumotlar", conditionSummary: "Holat ma’lumoti", mediaSummary: "Media va hujjatlar", auctionSummary: "Auksion so‘rovi",
      unavailableTitle: "Production yuborish mavjud emas", unavailableBody: "Avtomobil hujjatlarini tekshirish ulanmagan, shuning uchun qoralama muvaffaqiyatli yuborilgan deb ko‘rsatilmaydi.", demoTitle: "Demo jarayon", demoBody: "Bu muhit to‘liq ustani ko‘rsatadi, ammo yuborish faqat mahalliy qoralamani saqlaydi.", submitSuccess: "Avtomobil loti yaratildi va amaldagi moderatsiya oqimiga yuborildi.", submitError: "Avtomobil yuborilmadi. Qoralamangiz mahalliy saqlangan.",
      vinError: "17 belgili VIN kiriting.", vinFormatError: "VIN 17 ta to'g'ri harf va raqamdan iborat bo'lishi kerak.", engineVolumeError: "Dvigatel hajmini to'g'ri kiriting (masalan, 2.0).", vinHint: "masalan, 1HGCR2F83HA000000", engineVolumeHint: "masalan, 2.4", mileageHint: "masalan, 85000", makeError: "Avtomobil markasini tanlang.", modelError: "Avtomobil modelini tanlang.", yearError: "1950 va kelasi yil oralig‘idagi yilni kiriting.", mileageError: "To‘g‘ri yurgan masofani kiriting.", conditionError: "Avtomobil holatini tavsiflang.", requiredError: "Bu maydonni to‘ldiring.", selectPlaceholder: "Tanlang", selectMakeFirst: "Avval markani tanlang", lookupLoading: "Yuklanmoqda...", lookupError: "Ro‘yxatni yuklab bo‘lmadi. Qayta urinib ko‘ring.", photoError: "Kamida 5 va ko‘pi bilan 30 ta surat qo‘shing.", startPriceError: "Noldan katta boshlang‘ich narx kiriting.", incrementError: "Noldan katta taklif qadamini kiriting.", startTimeError: "Auksion boshlanish vaqtini tanlang.", loginRequired: "Avtomobil qoralamasini yuborishdan oldin hisobga kiring.", sellerIdentityRequired: "Hisob identifikatori mavjud emas. Yuborishdan oldin qayta kiring.", sellerRoleRequired: "Avtomobil lotini yaratish uchun hisobga kirishingiz kerak.", legacyPhotoLimit: "Qoralama tanlangan barcha suratlarni saqlaydi, ammo ulangan legacy endpoint ko‘pi bilan 10 ta suratni qabul qiladi. Hozir yuborish uchun tanlovni kamaytiring.", notProvided: "Kiritilmagan",
      kycRequiredTitle: "Shaxsingizni tasdiqlang", kycRequiredDescription: "Avtomobil e'lonini yaratishdan oldin shaxsingizni tasdiqlash talab qilinadi. Davom etish uchun KYC jarayonini yakunlang.", kycRequiredAction: "Shaxsni tasdiqlash", kycRequiredCancel: "Hozir emas",
      optionLabels: {
        PETROL: "Benzin", DIESEL: "Dizel", GAS: "Gaz", HYBRID: "Gibrid", ELECTRIC: "Elektr",
        MANUAL: "Mexanik", AUTOMATIC: "Avtomatik", CVT: "Variator", ROBOT: "Robot",
        FWD: "Old tortish", RWD: "Orqa tortish", AWD: "To‘liq tortish",
        SEDAN: "Sedan", SUV: "Yo‘ltanlamas", HATCHBACK: "Xetchbek", COUPE: "Kupe", CONVERTIBLE: "Kabriolet", WAGON: "Universal", MINIVAN: "Miniven", PICKUP: "Pikap",
        EXCELLENT: "A’lo", GOOD: "Yaxshi", DAMAGED: "Shikastlangan", NOT_RUNNING: "Yurmaydi",
        WHITE: "Oq", BLACK: "Qora", SILVER: "Kumush", GRAY: "Kulrang", RED: "Qizil", BLUE: "Ko‘k", GREEN: "Yashil", BROWN: "Jigarrang", BEIGE: "Bej", YELLOW: "Sariq",
      },
      documentTypeLabels: { TITLE: "Egalik / ro‘yxatdan o‘tganlik hujjati", CUSTOMS: "Bojxona hujjati", INSPECTION: "Texnik ko‘rik hujjati" },
    },
    info: {
      about: {
        eyebrow: "TezAuksion haqida", title: "Xotirjam va aniq avtomobil auksion bozori", intro: "TezAuksion avtomobil identifikatsiyasi, auksion holati va keyingi amallarni bir aniq reyestr ko‘rinishiga birlashtiradi.", sections: [
          { title: "Avtomobillar uchun yaratilgan", body: "Qidiruv, e’lon, holat va savdo tili umumiy tovarlar emas, aynan avtomobillar uchun tuzilgan." },
          { title: "Ko‘rinishdan oldin haqiqat", body: "Ulangan amallar jonli qoladi. Backend kutayotgan imkoniyatlar soxta natija o‘rniga demo yoki mavjud emas deb belgilanadi." },
          { title: "Bitta umumiy yozuv", body: "Xaridor va sotuvchi bir avtomobil yozuviga qaytib, faktlar, savdo holati va keyingi amalni ko‘ra oladi." },
        ]
      },
      faq: { eyebrow: "Qanday ishlaydi", title: "Avtomobil topishdan aniq auksion natijasigacha", intro: "Har bosqich nimalar ma’lum, nimalar talab qilinadi va qaysi amal mavjudligini ko‘rsatadi.", sections: [] },
      privacy: {
        eyebrow: "Maxfiylik", title: "Hisob va auksion ma’lumotlari qanday ishlatiladi", intro: "Bu frontend xulosasi to‘liq yuridik maxfiylik bildirishnomasi emas. Maxfiy ma’lumot yuborishdan oldin amaldagi siyosatni yordam xizmatidan so‘rang.", sections: [
          { title: "Yig‘iladigan ma’lumotlar", body: "Hisob aloqalari, qurilma tasdiqlash ma’lumoti, avtomobil faktlari, media va xizmat uchun zarur faollik qayta ishlanishi mumkin." },
          { title: "Ma’lumotlardan foydalanish", body: "Amaldagi ekranlar autentifikatsiya, savdo, moderatsiya, xavfsizlik va yordam uchun ulangan xizmatlarga ma’lumot yuboradi. Interfeys serverdagi barcha foydalanishni hujjatlashtirmaydi." },
          { title: "Ulashish va saqlash", body: "Bu frontend tasdiqlangan provayderlar ro‘yxati yoki saqlash muddatini ko‘rsatmaydi. Amaldagi siyosat va mas’ul kontaktni yordam xizmatidan so‘rang." },
          { title: "Sizning tanlovingiz", body: "Yordam xizmati maxfiylik savollarini qabul qilishi mumkin, ammo bu interfeys tasdiqlangan kirish yoki tuzatish jarayonini bermaydi. Brauzer qoralamasini shu qurilmadan o‘chirishingiz mumkin." },
          { title: "Xavfsizlik", body: "Email va qurilma tasdig‘i hisobni himoya qiladi. Tasdiqlash kodini hech kimga bermang." },
        ]
      },
      support: { eyebrow: "Yordam", title: "Auksion jarayoni qayerda to‘xtaganini ayting", intro: "Lot raqami yoki avtomobilni va bajarmoqchi bo‘lgan amalingizni yozing. Parol yoki tasdiqlash kodini yubormang.", sections: [] },
      howStepsTitle: "Auksion yo‘li", howSteps: [
        { title: "1. Avtomobil toping", body: "Har bir e’londa taqdim etilgan faktlarni qidiring va auksion holatini solishtiring." },
        { title: "2. Taklifga tayyorlaning", body: "Hisobga kiring va faqat jonli imkoniyat talab qilgan tekshiruvlarni bajaring." },
        { title: "3. Auksionni kuzating", body: "Joriy narx, keyingi minimal taklif, taymer va ulanish holatini ko‘ring." },
        { title: "4. Natijani yakunlang", body: "G‘olib yozuvida ko‘rsatilgan ulangan to‘lov va sotuvdan keyingi bosqichlarni bajaring." },
      ],
      faqTitle: "Ko‘p so‘raladigan savollar", faqs: [
        { title: "Taklifdan oldin avtomobilni ko‘rish mumkinmi?", body: "Faqat e’londagi tekshiruv va sotuvchi ma’lumotiga tayaning. Ko‘rish imkoniyati bo‘lmasa yordamga murojaat qiling." },
        { title: "Nega ayrim amal mavjud emas?", body: "Ba’zi v2 amallarida production endpoint yo‘q. Interfeys ularni ko‘rsatadi, ammo soxta muvaffaqiyatni bloklaydi." },
        { title: "Sotuvchi formasini saqlash mumkinmi?", body: "Ha. Yetti bosqichli formadagi matn maydonlari shu qurilmada saqlanadi. Fayllar saqlanmaydi." },
        { title: "Taklif xato bo‘lsa nima bo‘ladi?", body: "Auksion xonasi summani saqlab, rad etilish yoki ulanishni tiklash kerakligini tushuntiradi." },
      ],
      supportFormTitle: "Yordam so‘rovini yuborish", supportFormIntro: "Hisobga kirilgan so‘rovlar mavjud yordam xabar tizimidan foydalanadi.", supportSubject: "Mavzu", supportMessage: "Xabar", supportSend: "So‘rov yuborish", supportSending: "So‘rov yuborilmoqda", supportSent: "So‘rovingiz yordam xizmatiga yuborildi.", supportError: "So‘rov yuborilmadi. Xabar formadan o‘chmadi.", supportLogin: "Ulangan yordam xizmatiga so‘rov yuborish uchun hisobga kiring.", supportUnavailable: "Bu muhitda jonli yordam xabarlari mavjud emas.", supportSubjectRequired: "Qisqa mavzu kiriting.", supportMessageRequired: "Nima bo‘lganini va qanday yordam kerakligini yozing.",
    },
  },
  ru: {
    auth: {
      brandKicker: "Понятный путь к каждому аукциону", brandTitle: "Аккаунт TezAuksion связывает всю историю действий.", brandText: "Сохраняйте автомобили, следите за ставками и возвращайтесь к черновику продавца без потери контекста.", brandPoints: ["Один аккаунт для покупки и продажи", "Понятные статусы проверки и аукциона", "Безопасное подтверждение email и устройства"],
      loginEyebrow: "Доступ к аккаунту", loginTitle: "С возвращением", loginIntro: "Войдите, чтобы продолжить задачу на аукционе.", registerEyebrow: "Создание аккаунта", registerTitle: "Начните с подходящего типа аккаунта", registerIntro: "Сейчас создаётся личный аккаунт. Проверка организации остаётся отдельным этапом с учётом доступности.",
      individual: "Физическое лицо", organization: "Организация", accountType: "Тип аккаунта", organizationNote: "Проверка организаций пока не подключена. Будет создан только личный аккаунт основного контактного лица.",
      firstName: "Имя", lastName: "Фамилия", phone: "Номер телефона", email: "Адрес электронной почты", password: "Пароль", confirmPassword: "Подтвердите пароль", showPassword: "Показать пароль", hidePassword: "Скрыть пароль", acceptTerms: "Принятие версионированных Условий использования и public-offer (обязательно).", termsLink: "Прочитать резюме конфиденциальности, не являющееся договором", consentVersion: "Версия резюме конфиденциальности в интерфейсе: 2026-07-16 · Действует с: 16 июля 2026", publicOfferUnavailable: "Версионированные Условия использования, документ public-offer и запись о принятии не подключены. Создание аккаунта недоступно.", socialAuthUnavailable: "Вход через Google недоступен, пока сервис не подтвердит, что не создаёт аккаунт без принятия документов.", login: "Войти", createAccount: "Создать аккаунт", working: "Подождите", or: "или",
      forgotPrompt: "Забыли пароль?", forgotLink: "Восстановить", noAccount: "Впервые в TezAuksion?", registerLink: "Создать аккаунт", registrationUnavailable: "Регистрация новых аккаунтов сейчас недоступна.", hasAccount: "Уже зарегистрированы?", loginLink: "Войти", returnToTask: "После подтверждения вы вернётесь на {path}.",
      emailRequired: "Введите адрес электронной почты.", emailInvalid: "Введите корректный адрес электронной почты.", passwordRequired: "Введите пароль.", passwordLength: "Используйте не менее 8 символов.", firstNameRequired: "Введите имя.", lastNameRequired: "Введите фамилию.", phoneRequired: "Введите номер телефона.", phoneInvalid: "Введите 9 цифр после +998.", passwordsMismatch: "Пароли не совпадают.", termsRequired: "Подтвердите указанное резюме конфиденциальности перед созданием аккаунта.", loginError: "Не удалось войти. Проверьте email и пароль.", registerError: "Не удалось зарегистрироваться. Проверьте поля.", verifyError: "Код подтверждения не принят. Проверьте код.", missingDevice: "Подтверждение устройства ещё загружается. Повторите через мгновение.",
      googleDomainError: "Авторизация через Google временно недоступна для домена {domain}. Воспользуйтесь входом по Email.", googlePopupClosed: "Вход через Google отменён (окно закрыто).", googlePopupBlocked: "Всплывающее окно заблокировано браузером. Разрешите всплывающие окна.", googleServerError: "Ошибка сервера: {message}",
      withTelegram: "Продолжить с Telegram", telegramDomainError: "Авторизация через Telegram временно недоступна для домена {domain}.", telegramPopupClosed: "Вход через Telegram отменён (окно закрыто).", telegramServerError: "Ошибка сервера: {message}",
      otpTitle: "Подтвердите email", otpIntro: "Введите пятизначный код, отправленный на {email}.", otpDigit: "Цифра подтверждения {number}", verifyCode: "Подтвердить код", resendCode: "Отправить код повторно", resendIn: "Повторная отправка через {seconds}{suffix}", secondsShort: "с", codeRequired: "Введите все пять цифр.", resendLimitReached: "Достигнут лимит повторных отправок (3/3).", backToForm: "Вернуться к данным аккаунта",
      resetEyebrow: "Восстановление аккаунта", resetTitle: "Сбросить пароль", resetIntro: "Мы отправим код подтверждения на email аккаунта.", newPassword: "Новый пароль", sendCode: "Отправить код подтверждения", resetSuccess: "Пароль обновлён. Теперь можно войти.",
    },
    wizard: {
      eyebrow: "Анкета продавца", title: "Подготовьте автомобиль к аукциону", intro: "Пройдите восемь понятных этапов. Текстовые поля сохраняются локально на этом устройстве.", stages: ["VIN и идентификация", "Технические данные", "Состояние и описание", "Фотографии", "Документы", "Условия аукциона", "Расписание аукциона", "Проверка"], step: "Шаг", of: "из", draftSaved: "Черновик сохранён локально", draftSessionOnly: "До входа изменения сохраняются только в этой сессии.", draftStorageUnavailable: "Локальное хранилище черновика недоступно; изменения останутся в этой сессии.", draftHint: "Для конфиденциальности файлы не сохраняются в черновике браузера.", back: "Назад", next: "Следующий шаг", submit: "Отправить автомобиль", submitting: "Автомобиль отправляется", demoAction: "Оставить локальным черновиком",
      vin: "VIN", make: "Марка", model: "Модель", year: "Год", mileage: "Пробег (км)", fuel: "Топливо", transmission: "Коробка передач", drivetrain: "Привод", engineVolume: "Объём двигателя (л)", bodyType: "Тип кузова", color: "Цвет", conditionGrade: "Оценка состояния", region: "Регион", description: "Описание", condition: "Состояние автомобиля", damage: "Известные повреждения и ремонт",
      photoLabel: "Фотографии автомобиля", photoGuidance: "Добавьте 5–30 чётких фотографий автомобиля. Первое фото станет основным.", photoApiLimit: "Полный черновик поддерживает до 30 фото. Подключённый legacy endpoint создания отправляет до 10 фото, пока API медиа автомобиля недоступен.", documentLabel: "Документы на автомобиль и право собственности", documentType: "Тип документа", documentGuidance: "Добавьте файлы для проверки документов. Они отправляются вместе с автомобилем и не сохраняются в локальном черновике браузера.", documentUnavailable: "Проверка документов не подключена в production. Файлы пока нельзя отправить.", documentDemo: "Проверка документов — локальный предварительный интерфейс. Решение не будет записано.",
      startPrice: "Стартовая цена (UZS)", increment: "Шаг ставки", startTime: "Желаемое начало аукциона", auctionTermsNote: "Окончательные условия требуют модерации. Этот экран не создаёт договор.", reviewIntro: "Проверьте данные перед попыткой отправки.", identitySummary: "Идентификация автомобиля", technicalSummary: "Технические данные", conditionSummary: "Описание состояния", mediaSummary: "Медиа и документы", auctionSummary: "Заявка на аукцион",
      unavailableTitle: "Отправка в production недоступна", unavailableBody: "Проверка документов автомобиля не подключена, поэтому черновик не может показать ложный успех отправки.", demoTitle: "Демо-процесс", demoBody: "В этом окружении доступен весь мастер, но отправка лишь сохраняет локальный черновик.", submitSuccess: "Лот автомобиля создан и отправлен в существующий процесс модерации.", submitError: "Не удалось отправить автомобиль. Черновик сохранён локально.",
      vinError: "Введите VIN из 17 символов.", vinFormatError: "VIN должен состоять из 17 символов (буквы и цифры).", engineVolumeError: "Укажите корректный объем двигателя (например, 2.0).", vinHint: "например, 1HGCR2F83HA000000", engineVolumeHint: "например, 2.4", mileageHint: "например, 85000", makeError: "Выберите марку автомобиля.", modelError: "Выберите модель автомобиля.", yearError: "Введите год от 1950 до следующего календарного года.", mileageError: "Введите корректный пробег.", conditionError: "Опишите состояние автомобиля.", requiredError: "Заполните это поле.", selectPlaceholder: "Выберите", selectMakeFirst: "Сначала выберите марку", lookupLoading: "Загрузка...", lookupError: "Не удалось загрузить список. Повторите попытку.", photoError: "Добавьте от 5 до 30 фотографий.", startPriceError: "Введите стартовую цену больше нуля.", incrementError: "Введите шаг ставки больше нуля.", startTimeError: "Выберите время начала аукциона.", loginRequired: "Войдите перед отправкой черновика автомобиля.", sellerIdentityRequired: "Идентификатор аккаунта недоступен. Войдите снова перед отправкой.", sellerRoleRequired: "Для создания автомобильных лотов требуется войти в аккаунт.", legacyPhotoLimit: "Черновик сохраняет все выбранные фото, но подключённый legacy endpoint принимает не более 10. Уменьшите выбор, чтобы отправить сейчас.", notProvided: "Не указано",
      kycRequiredTitle: "Подтвердите личность", kycRequiredDescription: "Перед созданием объявления необходимо пройти верификацию личности. Завершите процесс KYC, чтобы продолжить.", kycRequiredAction: "Подтвердить личность", kycRequiredCancel: "Не сейчас",
      optionLabels: {
        PETROL: "Бензин", DIESEL: "Дизель", GAS: "Газ", HYBRID: "Гибрид", ELECTRIC: "Электрический",
        MANUAL: "Механическая", AUTOMATIC: "Автоматическая", CVT: "Вариатор", ROBOT: "Роботизированная",
        FWD: "Передний привод", RWD: "Задний привод", AWD: "Полный привод",
        SEDAN: "Седан", SUV: "Внедорожник", HATCHBACK: "Хэтчбек", COUPE: "Купе", CONVERTIBLE: "Кабриолет", WAGON: "Универсал", MINIVAN: "Минивэн", PICKUP: "Пикап",
        EXCELLENT: "Отличное", GOOD: "Хорошее", DAMAGED: "Повреждённое", NOT_RUNNING: "Не на ходу",
        WHITE: "Белый", BLACK: "Чёрный", SILVER: "Серебристый", GRAY: "Серый", RED: "Красный", BLUE: "Синий", GREEN: "Зелёный", BROWN: "Коричневый", BEIGE: "Бежевый", YELLOW: "Жёлтый",
      },
      documentTypeLabels: { TITLE: "Документ собственности / регистрации", CUSTOMS: "Таможенный документ", INSPECTION: "Документ техосмотра" },
    },
    info: {
      about: {
        eyebrow: "О TezAuksion", title: "Более спокойный и понятный рынок автомобильных аукционов", intro: "TezAuksion объединяет идентификацию автомобиля, статус аукциона и следующие действия в одном точном реестре.", sections: [
          { title: "Создано вокруг автомобилей", body: "Поиск, объявления, состояние и торги используют автомобильную, а не универсальную терминологию." },
          { title: "Достоверность важнее эффекта", body: "Подключённые операции остаются активными. Функции без backend помечаются как демо или недоступные и не создают вымышленных результатов." },
          { title: "Одна общая запись", body: "Покупатель и продавец возвращаются к одной записи автомобиля и видят факты, статус и следующий шаг." },
        ]
      },
      faq: { eyebrow: "Как это работает", title: "От поиска автомобиля до понятного результата аукциона", intro: "Каждый этап показывает, что известно, что требуется и какая операция сейчас доступна.", sections: [] },
      privacy: {
        eyebrow: "Конфиденциальность", title: "Как обрабатываются данные аккаунта и аукциона", intro: "Это краткое описание интерфейса не является полной юридической политикой. До передачи чувствительных данных запросите действующую политику у поддержки.", sections: [
          { title: "Какие данные собираются", body: "Могут обрабатываться контактные данные, подтверждение устройства, факты об автомобиле, медиа и действия, необходимые для услуги." },
          { title: "Как используются данные", body: "Текущие экраны передают данные подключённым сервисам для входа, торгов, модерации, безопасности и поддержки. Интерфейс не описывает все серверные способы использования." },
          { title: "Передача и хранение", body: "Этот frontend не показывает подтверждённый список обработчиков или сроки хранения. Запросите у поддержки действующую политику и ответственный контакт." },
          { title: "Ваш выбор", body: "Поддержка может принять вопрос о конфиденциальности, но интерфейс не предоставляет подтверждённый процесс доступа или исправления. Черновик продавца можно удалить с устройства." },
          { title: "Безопасность", body: "Подтверждение email и устройства защищает аккаунт. Никому не сообщайте код подтверждения." },
        ]
      },
      support: { eyebrow: "Поддержка", title: "Расскажите, где остановился путь по аукциону", intro: "Укажите номер лота или автомобиль и действие, которое пытались выполнить. Не сообщайте пароль или код подтверждения.", sections: [] },
      howStepsTitle: "Путь аукциона", howSteps: [
        { title: "1. Найдите автомобиль", body: "Изучите сведения, указанные в объявлении, и сравните состояние аукциона." },
        { title: "2. Подготовьтесь к ставке", body: "Войдите и пройдите только проверки, необходимые для подключённой возможности." },
        { title: "3. Следите за аукционом", body: "Смотрите текущую цену, минимальную следующую ставку, таймер и соединение." },
        { title: "4. Завершите результат", body: "Следуйте подключённым шагам оплаты и после продажи в записи победителя." },
      ],
      faqTitle: "Частые вопросы", faqs: [
        { title: "Можно осмотреть автомобиль до ставки?", body: "Используйте только данные осмотра и продавца в объявлении. Обратитесь в поддержку, если подключённого просмотра нет." },
        { title: "Почему действие недоступно?", body: "Для некоторых операций v2 нет production endpoint. Интерфейс показывает их, но блокирует ложный успех." },
        { title: "Можно сохранить форму продавца?", body: "Да. Текстовые поля семи этапов сохраняются на этом устройстве. Загруженные файлы не сохраняются." },
        { title: "Что происходит при ошибке ставки?", body: "Аукционная комната сохраняет сумму и объясняет причину отказа или необходимость восстановить соединение." },
      ],
      supportFormTitle: "Отправить запрос в поддержку", supportFormIntro: "Запросы авторизованных пользователей используют существующую систему сообщений поддержки.", supportSubject: "Тема", supportMessage: "Сообщение", supportSend: "Отправить запрос", supportSending: "Запрос отправляется", supportSent: "Запрос отправлен в поддержку.", supportError: "Не удалось отправить запрос. Текст остался в форме.", supportLogin: "Войдите, чтобы отправить запрос через подключённую поддержку.", supportUnavailable: "Сообщения поддержки недоступны в этом окружении.", supportSubjectRequired: "Введите краткую тему.", supportMessageRequired: "Опишите проблему и необходимую помощь.",
    },
  },
};

export function useTask6Copy(): Task6Copy {
  const { currentLang } = useContext(LangSwitch);
  return task6Messages[currentLang];
}