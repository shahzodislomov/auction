"use client";

import { CarFront, CheckCircle2, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Surface } from "@/components/ui/Surface";
import { useTask6Copy } from "@/locales/task6";

export interface AuthShellProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  intro?: string;
  mode?: "login" | "register" | "reset";
}

export function AuthShell({ children, eyebrow, intro, mode, title }: AuthShellProps) {
  const copy = useTask6Copy();
  const resolved =
    mode === "register"
      ? {
          eyebrow: copy.auth.registerEyebrow,
          intro: copy.auth.registerIntro,
          title: copy.auth.registerTitle,
        }
      : mode === "reset"
        ? {
            eyebrow: copy.auth.resetEyebrow,
            intro: copy.auth.resetIntro,
            title: copy.auth.resetTitle,
          }
        : {
            eyebrow: copy.auth.loginEyebrow,
            intro: copy.auth.loginIntro,
            title: copy.auth.loginTitle,
          };

  return (
    <section className="px-[var(--content-gutter)] py-8 md:py-12 lg:py-16">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-xl border border-border-default bg-surface-primary lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative overflow-hidden bg-brand-navy-900 p-6 text-white md:p-10 lg:p-12">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 size-56 rounded-full border border-brand-champagne-500/30"
          />
          <div className="relative flex h-full flex-col">
            <span className="inline-flex size-12 items-center justify-center rounded-lg border border-brand-champagne-500/40 bg-brand-navy-800 text-brand-champagne-500">
              <CarFront aria-hidden="true" size={24} strokeWidth={1.8} />
            </span>
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.16em] text-brand-champagne-500">
              {copy.auth.brandKicker}
            </p>
            <h2 className="mt-3 max-w-lg font-display text-2xl font-bold leading-tight md:text-3xl">
              {copy.auth.brandTitle}
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-white/75">
              {copy.auth.brandText}
            </p>
            <ul className="mt-8 space-y-4" aria-label={copy.auth.brandKicker}>
              {copy.auth.brandPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm leading-6">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-brand-champagne-500"
                    size={18}
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto hidden pt-10 text-sm text-white/65 lg:flex lg:items-center lg:gap-3">
              <ShieldCheck aria-hidden="true" size={19} />
              <span>TezAuksion · Champagne Ledger</span>
            </div>
          </div>
        </aside>

        <div className="flex items-center p-4 sm:p-6 md:p-10 lg:p-12">
          <Surface className="w-full border-0" padding="none">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-gold-text">
              {eyebrow ?? resolved.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-text-primary md:text-3xl">
              {title ?? resolved.title}
            </h1>
            <p className="mt-3 max-w-xl leading-7 text-text-secondary">
              {intro ?? resolved.intro}
            </p>
            <div className="mt-7">{children}</div>
          </Surface>
        </div>
      </div>
    </section>
  );
}
