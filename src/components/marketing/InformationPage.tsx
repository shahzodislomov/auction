"use client";

import {
  BookOpenCheck,
  Building2,
  CircleHelp,
  Headphones,
  LockKeyhole,
} from "lucide-react";
import type { ReactNode } from "react";

import { Surface } from "@/components/ui/Surface";
import { useTask6Copy } from "@/locales/task6";

export type InformationPageKind = "about" | "faq" | "privacy" | "support";

export interface InformationPageProps {
  kind: InformationPageKind;
  children?: ReactNode;
}

const icons = {
  about: Building2,
  faq: CircleHelp,
  privacy: LockKeyhole,
  support: Headphones,
};

export function InformationPage({ children, kind }: InformationPageProps) {
  const copy = useTask6Copy();
  const content = copy.info[kind];
  const Icon = icons[kind];

  return (
    <article>
      <header className="border-b border-brand-navy-800 bg-brand-navy-900 px-[var(--content-gutter)] py-12 text-white md:py-16">
        <div className="mx-auto max-w-6xl">
          <span className="flex size-12 items-center justify-center rounded-lg border border-brand-champagne-500/40 bg-brand-navy-800 text-brand-champagne-500">
            <Icon aria-hidden="true" size={24} strokeWidth={1.8} />
          </span>
          <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-brand-champagne-500">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold leading-tight md:text-5xl">
            {content.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/75 md:text-lg">
            {content.intro}
          </p>
        </div>
      </header>

      <div className="px-[var(--content-gutter)] py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          {content.sections.length > 0 ? (
            <div className="grid gap-px overflow-hidden rounded-lg border border-border-default bg-border-default md:grid-cols-3">
              {content.sections.map((section, index) => (
                <section
                  key={section.title}
                  className="bg-surface-primary p-6 md:p-8"
                >
                  <span className="text-sm font-bold tabular-nums text-brand-gold-text">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-5 text-xl font-bold text-text-primary">
                    {section.title}
                  </h2>
                  <p className="mt-3 leading-7 text-text-secondary">{section.body}</p>
                </section>
              ))}
            </div>
          ) : null}

          {kind === "faq" ? (
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <section>
                <div className="flex items-center gap-3">
                  <BookOpenCheck className="text-brand-gold-text" aria-hidden="true" size={22} />
                  <h2 className="text-2xl font-bold text-text-primary">
                    {copy.info.howStepsTitle}
                  </h2>
                </div>
                <ol className="mt-6 overflow-hidden rounded-lg border border-border-default bg-surface-primary">
                  {copy.info.howSteps.map((step) => (
                    <li key={step.title} className="border-b border-border-default p-5 last:border-b-0 md:p-6">
                      <h3 className="font-bold text-text-primary">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">{step.body}</p>
                    </li>
                  ))}
                </ol>
              </section>
              <section>
                <h2 className="text-2xl font-bold text-text-primary">{copy.info.faqTitle}</h2>
                <div className="mt-6 space-y-3">
                  {copy.info.faqs.map((faq, index) => (
                    <details
                      key={faq.title}
                      className="group rounded-lg border border-border-default bg-surface-primary p-5 open:border-brand-champagne-600"
                      open={index === 0}
                    >
                      <summary className="cursor-pointer list-none pr-8 font-bold text-text-primary focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus-ring">
                        {faq.title}
                      </summary>
                      <p className="mt-4 border-t border-border-default pt-4 leading-7 text-text-secondary">
                        {faq.body}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {children ? <div className={content.sections.length ? "mt-10" : ""}>{children}</div> : null}

          {kind !== "faq" && !children && content.sections.length === 0 ? (
            <Surface className="mx-auto max-w-3xl text-center">
              <h2 className="text-xl font-bold text-text-primary">TezAuksion</h2>
              <p className="mt-2 text-text-secondary">Champagne Ledger</p>
            </Surface>
          ) : null}
        </div>
      </div>
    </article>
  );
}
