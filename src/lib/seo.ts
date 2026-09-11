import type { Metadata } from "next";
import { siteConfig } from "./site";

export const brandedKeywords = [
  "TezAuksion",
  "Tez Auksion",
  "Auction Uzbekistan",
  "Online Auction Uzbekistan",
  "Auksion",
  "Elektron Auksion",
  "Mashina auksioni",
  "Avto auksion",
  "Car Auction Uzbekistan",
  "Moto Auction",
  "Uy sotish",
  "Ko'chmas mulk",
  "Real Estate Auction",
  "Elektronika auksioni",
  "Texnika sotish",
  "Online bidding",
  "Online Auction",
  "Tenzorsoft",
  "Auction Platform",
  "Buy and Sell",
  "Auction Marketplace",
  "Uzbekistan Marketplace",
  "Auction Cars",
  "Auction Houses",
  "Second Hand Auction",
];

function toAbsoluteUrl(path = "/") {
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${siteConfig.url}${normalizedPath}`;
}

type PageMetadataInput = {
	title: string;
	description: string;
	path?: string;
	images?: string[];
	keywords?: string[];
	noIndex?: boolean;
};

export function buildRootMetadata(): Metadata {
	const rootUrl = siteConfig.isPlaceholderDomain
		? undefined
		: new URL(siteConfig.url);
	const canonicalUrl = siteConfig.isPlaceholderDomain
		? undefined
		: toAbsoluteUrl("/");
	const ogImages = [toAbsoluteUrl("/brand.png")];

	return {
		metadataBase: rootUrl,
		title: {
			default: siteConfig.name,
			template: `%s | ${siteConfig.fullName}`,
		},
		description: siteConfig.description,
		applicationName: siteConfig.fullName,
		authors: [{ name: siteConfig.fullName, url: siteConfig.url }],
		creator: siteConfig.fullName,
		publisher: siteConfig.fullName,
		keywords: [...brandedKeywords],
		icons: {
			icon: [{ url: "/brand.png", type: "image/png", sizes: "500x500" }],
			shortcut: ["/brand.png"],
			apple: [{ url: "/brand.png", type: "image/png", sizes: "500x500" }],
		},
		alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
		openGraph: {
			type: "website",
			url: canonicalUrl,
			title: siteConfig.name,
			description: siteConfig.description,
			siteName: siteConfig.fullName,
			images: ogImages,
		},
		twitter: {
			card: "summary_large_image",
			title: siteConfig.name,
			description: siteConfig.description,
			images: ogImages,
		},
		verification: siteConfig.googleSiteVerification
			? { google: siteConfig.googleSiteVerification }
			: undefined,
	};
}

export function buildPageMetadata({
	title,
	description,
	path = "/",
	images,
	keywords = [],
	noIndex = false,
}: PageMetadataInput): Metadata {
	const canonical = toAbsoluteUrl(path);
	const imageList = images?.length
		? images.map(toAbsoluteUrl)
		: [toAbsoluteUrl("/brand.png")];

	return {
		title,
		description,
		keywords: [...brandedKeywords, ...keywords],
		alternates: {
			canonical,
		},
		icons: {
			icon: [
				{ url: "/favicon.ico" },
				{ url: "/icon.png", type: "image/png", sizes: "512x512" },
			],
			apple: [{ url: "/icon.png", sizes: "180x180", type: "image/png" }],
			shortcut: ["/icon.png"],
		},
		openGraph: {
			type: "website",
			url: canonical,
			title,
			description,
			siteName: siteConfig.fullName,
			images: imageList,
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: imageList,
		},
		robots: noIndex
			? { index: false, follow: false }
			: { index: true, follow: true },
	};
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: "TezAuksion",
    description: siteConfig.description,

    inLanguage: [
      "uz",
      "ru",
      "en",
    ],

    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },

    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: "Tenzorsoft",
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand.png`,
    email: siteConfig.email,
    telephone: siteConfig.phone,
 contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: siteConfig.phone,
      email: siteConfig.email,
      availableLanguage: [
        "uz",
        "ru",
        "en",
      ],
    },
    sameAs: [
      siteConfig.telegram,
      siteConfig.instagram,
      siteConfig.linkedin,
      siteConfig.github,
    ],
  };
}
export function buildHomeWebPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteConfig.url}/#homepage`,
    url: siteConfig.url,

    name: "TezAuksion",

    description: siteConfig.description,

    isPartOf: {
      "@id": `${siteConfig.url}/#website`,
    },

    about: {
      "@id": `${siteConfig.url}/#organization`,
    },

    primaryImageOfPage: `${siteConfig.url}/brand.png`,
   
}
  };
export function buildAuctionServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",

    serviceType: "Online Auction",

    provider: {
      "@id": `${siteConfig.url}/#organization`,
    },

    areaServed: {
      "@type": "Country",
      name: "Uzbekistan",
    },

    availableLanguage: [
      "Uzbek",
      "Russian",
      "English",
    ],

    description:
      "Online auction platform for buying and selling vehicles, motorcycles, real estate, electronics, equipment and other goods.",

    url: siteConfig.url,
  };
}

export function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",

    mainEntity: [
      {
        "@type": "Question",
        name: "What is TezAuksion?",

        acceptedAnswer: {
          "@type": "Answer",
          text: "TezAuksion is an online auction platform developed by Tenzorsoft where users can buy and sell products through transparent bidding.",
        },
      },

      {
        "@type": "Question",
        name: "What products can be sold?",

        acceptedAnswer: {
          "@type": "Answer",
          text: "Cars, motorcycles, trucks, apartments, houses, land, electronics, industrial equipment, furniture and many other categories.",
        },
      },

      {
        "@type": "Question",
        name: "Can anyone create an auction?",

        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. After registration users can submit products for auction. Listings are reviewed by moderators before publication.",
        },
      },

      {
        "@type": "Question",
        name: "Which languages are supported?",

        acceptedAnswer: {
          "@type": "Answer",
          text: "Uzbek, Russian and English.",
        },
      },
    ],
  };
}


export { toAbsoluteUrl };