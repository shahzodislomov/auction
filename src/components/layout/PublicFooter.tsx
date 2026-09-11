"use client";

import Image from "next/image";
import Link from "next/link";
import { useIntl } from "react-intl";

const footerGroups = [
  {
    heading: "footer.explore",
    links: [
      { href: "/auctions", messageId: "footer.auctions" },
      { href: "/sold", messageId: "footer.sold" },
      { href: "/sell", messageId: "footer.sell" },
    ],
  },
  {
    heading: "footer.company",
    links: [
      { href: "/about", messageId: "footer.about" },
      { href: "/faq", messageId: "footer.howItWorks" },
      { href: "/privacy", messageId: "footer.privacy" },
    ],
  },
  {
    heading: "footer.help",
    links: [
      { href: "/faq", messageId: "footer.faq" },
      { href: "/support", messageId: "footer.support" },
    ],
  },
] as const;

export function PublicFooter({
  reserveCabinetMobileNav = false,
}: {
  reserveCabinetMobileNav?: boolean;
}) {
  const intl = useIntl();

  return (
    <footer className={`public-footer border-t border-border-default bg-surface-muted text-text-primary ${reserveCabinetMobileNav ? "cabinet-mobile-nav-clearance" : ""}`}>
      <div className="mx-auto grid max-w-[var(--content-max-width)] gap-10 px-[var(--content-gutter)] py-12 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <div className="max-w-sm">
        <div className="flex items-center">
       {/* <Image
                      src="/brand.png"
                      alt=""
                      width={80}
                      height={80}
                      className="h-11 w-11 object-contain xl:h-20 xl:w-20"
                      priority
                    /> */}
          <p className="font-display text-lg font-semibold text-brand-navy-900 tracking-wide">
            Tez<span className="text-brand-champagne-500">Auksion</span>
          </p>
          
        </div>
    
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {intl.formatMessage({ id: "footer.marketplace" })}
          </p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.heading}>
            <h2 className="text-sm font-extrabold text-brand-navy-900">
              {intl.formatMessage({ id: group.heading })}
            </h2>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={`${link.href}-${link.messageId}`}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center rounded-sm text-sm text-text-secondary hover:text-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                  >
                    {intl.formatMessage({ id: link.messageId })}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border-default">
        <p className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-gutter)] py-5 text-sm text-text-secondary">
          {intl.formatMessage(
            { id: "footer.copyright" },
            { year: new Date().getFullYear() },
          )}
        </p>
      </div>
    </footer>
  );
}
