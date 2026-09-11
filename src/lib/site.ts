const defaultSiteUrl = "https://tezauksion.uz/";

function normalizeSiteUrl(value: string) {
	const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
	return withProtocol.replace(/\/+$/, "");
}

function resolveSiteUrl() {
	const candidates = [
		process.env.NEXT_PUBLIC_SITE_URL,
		process.env.SITE_URL,
		process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
		process.env.VERCEL_URL,
	].filter(Boolean) as string[];

	if (candidates.length === 0) {
		return defaultSiteUrl;
	}

	return normalizeSiteUrl(candidates[0]);
}

const normalizedSiteUrl = resolveSiteUrl();
export const siteConfig = {
  name: "TezAuksion",

  fullName: "TezAuksion",

  companyName: "Tenzorsoft",

  description:
    "TezAuksion — Tenzorsoft tomonidan yaratilgan O'zbekistondagi zamonaviy onlayn auksion platformasi. Avtomobillar, mototsikllar, ko'chmas mulk, elektronika, texnika va boshqa mahsulotlarni xavfsiz auksion orqali soting yoki xarid qiling.",

  url: normalizedSiteUrl,

  isPlaceholderDomain: normalizedSiteUrl === defaultSiteUrl,

  email: "support@tenzorsoft.uz",

  phone: "+998 XX XXX XX XX",

  github: "https://github.com/Tenzorsoft",

  linkedin: "https://linkedin.com/company/tenzorsoft",

  instagram: "https://instagram.com/tenzorsoft",

  telegram: "https://t.me/tenzorsoft",

  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
};