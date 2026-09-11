"use client";

import { ArrowLeft, Gavel, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIntl } from "react-intl";

export default function NotFound() {
  const intl = useIntl();
  const router = useRouter();

  return (
    <section className="px-[var(--content-gutter)] py-12 md:py-20">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-border-default bg-surface-primary shadow-sticky lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex min-h-64 items-center justify-center bg-brand-navy-900 p-8 text-brand-champagne-500">
          <div className="text-center">
            <Gavel aria-hidden="true" className="mx-auto h-14 w-14" />
            <p className="mt-5 font-display text-6xl font-extrabold tracking-[-0.04em] text-white md:text-7xl">
              404
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-7 md:p-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-gold-text">
            {intl.formatMessage({ id: "notFound.eyebrow" })}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.03em] text-brand-navy-900 md:text-4xl">
            {intl.formatMessage({ id: "notFound.title" })}
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-text-secondary">
            {intl.formatMessage({ id: "notFound.description" })}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-brand-champagne-500 bg-brand-champagne-500 px-5 text-sm font-extrabold text-brand-navy-900 hover:border-brand-champagne-600 hover:bg-brand-champagne-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              <Home aria-hidden="true" className="h-5 w-5" />
              {intl.formatMessage({ id: "notFound.home" })}
            </Link>
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-border-default bg-white px-5 text-sm font-extrabold text-brand-navy-900 hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              onClick={() => router.back()}
            >
              <ArrowLeft aria-hidden="true" className="h-5 w-5" />
              {intl.formatMessage({ id: "notFound.back" })}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
