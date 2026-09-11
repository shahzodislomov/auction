import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/"],
			},
		],
		sitemap: siteConfig.isPlaceholderDomain
			? undefined
			: `${siteConfig.url}/sitemap.xml`,
		host: siteConfig.isPlaceholderDomain
			? undefined
			: new URL(siteConfig.url).host,
	};
}