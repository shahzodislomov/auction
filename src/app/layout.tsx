import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";

import "./globals.css";

import { AppShell } from "@/components/layout/AppShell";
import { resolveRootLocale } from "@/lib/i18n/serverLocale";
import { buildRootMetadata } from "@/lib/seo";

import Providers from "./providers";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = buildRootMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLocale = await resolveRootLocale();

  return (
    <html
      lang={initialLocale}
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${unbounded.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Providers initialLocale={initialLocale}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
