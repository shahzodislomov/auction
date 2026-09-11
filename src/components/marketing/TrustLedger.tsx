"use client";

import { ChartNoAxesCombined, Gavel, ShieldCheck, Users } from "lucide-react";
import { useIntl } from "react-intl";

const evidence = [
  {
    Icon: ShieldCheck,
    title: "home.evidence.inspectionTitle",
    text: "home.evidence.inspectionText",
  },
  {
    Icon: Gavel,
    title: "home.evidence.auctionTitle",
    text: "home.evidence.auctionText",
  },
  {
    Icon: Users,
    title: "home.evidence.buyersTitle",
    text: "home.evidence.buyersText",
  },
  {
    Icon: ChartNoAxesCombined,
    title: "home.evidence.marketTitle",
    text: "home.evidence.marketText",
  },
] as const;

export function TrustLedger() {
  const intl = useIntl();

  return (
    <section aria-labelledby="how-it-works-heading" className="mt-12" id="how-it-works">
      <div className="max-w-2xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-gold-text">
          {intl.formatMessage({ id: "home.howItWorksEyebrow" })}
        </p>
        <h2
          className="mt-2 font-display text-2xl font-bold tracking-[-0.025em] text-brand-navy-900 md:text-3xl"
          id="how-it-works-heading"
        >
          {intl.formatMessage({ id: "home.howItWorksTitle" })}
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary md:text-base">
          {intl.formatMessage({ id: "home.howItWorksDescription" })}
        </p>
      </div>
      <div className="mt-5 grid border border-border-default bg-white md:grid-cols-2 xl:grid-cols-4 rounded-xl">
        {evidence.map(({ Icon, text, title }, index) => (
          <div
            key={title}
            className={`flex items-start gap-4 px-6 py-4 ${index > 0 ? "border-t border-border-default md:border-l md:border-t-0 md:[&:nth-child(3)]:border-l-0 md:[&:nth-child(3)]:border-t xl:[&:nth-child(3)]:border-l xl:[&:nth-child(3)]:border-t-0" : ""}`}
          >
            <Icon
              aria-hidden="true"
              className="mt-0.5 h-7 w-7 shrink-0 text-brand-navy-900"
            />
            <div>
              <h3 className="text-sm font-extrabold text-brand-navy-900">
                {intl.formatMessage({ id: title })}
              </h3>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                {intl.formatMessage({ id: text })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
