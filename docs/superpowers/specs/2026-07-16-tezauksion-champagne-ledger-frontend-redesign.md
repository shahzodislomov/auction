# TezAuksion Champagne Ledger Frontend Redesign

**Date:** 2026-07-16

**Status:** Visual direction approved; implementation pending written-spec review
**Selected visual:** [Champagne Ledger homepage reference](./assets/tezauksion-champagne-ledger-home-reference.png)

## 1. Decision Summary

TezAuksion will become a cars-only auction experience based on the July 2026 TZ, using the selected **Champagne Ledger** visual direction: warm off-white canvas, deep navy structure and typography, restrained champagne actions, premium vehicle photography, fine dividers, and ledger-like information clarity.

This is a frontend-only redesign. Existing backend-connected workflows remain connected. TZ v2 workflows without backend support receive complete, responsive UI and explicit capability handling, but the production frontend must never simulate successful payments, KYC decisions, contracts, disputes, or other irreversible operations.

The redesign is one program with three coordinated product layers:

1. Public marketplace and live buyer journey.
2. Buyer, seller, and dealer cabinet.
3. Admin and moderation workspace.

All three layers share one design system, navigation model, data-normalization boundary, status language, and responsive behavior.

## 2. Product Outcomes

The redesign should help users:

- Find a relevant vehicle auction quickly by make, model, year, region, price, mileage, fuel, transmission, condition, or VIN.
- Trust the listing through inspection, document, seller, KYC, and auction-state signals.
- Understand the current bid, minimum next bid, deposit requirement, currency conversion, and remaining time without calculation.
- Enter and follow a live auction with reliable feedback for connection, outbid, winning, anti-sniping extension, and completion states.
- Create and track a vehicle listing through a guided seller workflow.
- Understand every post-sale step without losing context.
- Let administrators process queues and make auditable decisions efficiently.

Success means the product feels automotive, credible, calm, and specific to TezAuksion rather than like a generic marketplace template.

## 3. Scope

### 3.1 Included

- Global shell: responsive navigation, account menu, locale switcher, notifications, footer, loading, error, empty, unavailable, and confirmation states.
- Public pages: home, auction discovery, auction detail, live bidding, sold archive, sell-a-car, about, FAQ, privacy, authentication, and support.
- Buyer cabinet: overview, watchlist, bid activity, won/lost auctions, deposits, payments, notifications, KYC, profile, and post-sale steps.
- Seller cabinet: vehicles, listing creation/editing, media and documents, auction setup/tracking, deals, invoices/statements, and seller profile.
- Dealer UI: verification state, bulk-import entry point, API access status, tier and statement views.
- Admin/moderator UI: overview, KYC queue, vehicle/document moderation, auction controls, users, finance, reference data, disputes, risk flags, and audit log.
- Uzbek, Russian, and English UI with language-aware typography and metadata.
- Desktop, tablet, and mobile behavior.
- Compatibility redirects for existing public URLs.

### 3.2 Excluded

- Backend, database, WebSocket server, payment gateway, VIN decoder, Telegram bot, native mobile app, or infrastructure changes.
- Claiming unavailable v2 operations are completed in production.
- Logistics, insurance, delivery, or vehicle valuation, which the TZ explicitly excludes.
- Replacing the supplied logo or altering its proportions.
- A separate dark theme in this pass. Champagne Ledger is a light product system with intentional navy bands and dense navy work areas.

## 4. Design Language: Champagne Ledger

### 4.1 Brand Character

The interface combines three qualities:

- **Automotive precision:** clean crops, technical facts, strong number hierarchy.
- **Auction authority:** clear statuses, timestamps, auditability, and decisive actions.
- **Quiet premium:** warm canvas, champagne accents, restrained elevation, and generous space.

The interface avoids generic blue SaaS styling, crypto-dashboard aesthetics, excessive glass, ornamental luxury fashion, and card mosaics.

### 4.2 Color Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--brand-navy-950` | `#04122B` | Pressed state, deepest bands |
| `--brand-navy-900` | `#081B3D` | Primary brand, headings, global navigation |
| `--brand-navy-800` | `#0C2A56` | Hover and secondary navy surface |
| `--brand-champagne-500` | `#D8B58C` | Primary action fill and selected accents |
| `--brand-champagne-600` | `#C9A16F` | Champagne hover/pressed border |
| `--brand-gold-text` | `#775025` | Accessible accent text on light surfaces |
| `--surface-canvas` | `#F8F6F2` | Page background |
| `--surface-primary` | `#FFFFFF` | Forms, tables, and focused content |
| `--surface-muted` | `#F0ECE6` | Grouping and inactive rows |
| `--text-primary` | `#081B3D` | Primary text |
| `--text-secondary` | `#526077` | Supporting text |
| `--border-default` | `#D7D2CA` | Dividers and controls |
| `--focus-ring` | `#8A5C1F` | Accessible focus indication |

Semantic success, warning, information, and danger colors remain separate from the brand palette. Champagne never substitutes for an error, success, or live-state signal. White text is not used on champagne because it does not meet contrast requirements; champagne buttons use navy text.

### 4.3 Typography

- Display: **Unbounded**, used only for short brand moments and major section titles. It supports the Latin and Cyrillic scripts required by UZ/RU/EN.
- Product UI and body: **Manrope**, used for controls, body copy, tables, and dense cabinet/admin content.
- Prices, timers, VINs, lot numbers, and tabular data use tabular numerals.
- Body text is 16px by default, never below 14px for supporting UI.
- Marketing line length is capped near 65 characters. Dense operational text is grouped into labeled rows rather than long paragraphs.

### 4.4 Shape, Border, and Elevation

- Radius scale: 4px, 8px, and 12px. Pills are reserved for status and compact filters.
- One-pixel warm-gray dividers are the primary separation method.
- Shadows are reserved for overlays and sticky elements; normal content relies on spacing and borders.
- Cards are used only for standalone objects. Lists, filters, tables, and auction facts use grouped surfaces and row dividers.

### 4.5 Icons and Imagery

- Lucide outline icons with a consistent 1.75–2px stroke.
- No emoji as structural icons.
- Official logo assets are used without recoloring, warping, or redrawing.
- Vehicle imagery uses clean studio or restrained architectural settings, consistent aspect ratios, and visible full vehicle silhouettes where practical.
- API-provided vehicle images remain authoritative. Missing images use the existing real placeholder asset, not CSS drawings.
- Responsive images use `next/image` sizing and lazy loading below the first viewport; the live-auction hero image must not compete with price and connection updates for main-thread work.

### 4.6 Motion

- Micro-interactions: 160–240ms, transform/opacity only.
- Route/content transitions: short fade and 8–12px translate, no blocking overlays.
- Live price changes crossfade and briefly highlight the affected number without moving the layout.
- Countdown urgency changes label and border treatment; it does not flash.
- `prefers-reduced-motion` removes nonessential transitions and all stagger effects.

## 5. Information Architecture

### 5.1 Public Navigation

Desktop navigation:

- Auctions
- Sold archive
- How it works
- Sell a car
- Search
- UZ/RU/EN
- Account

Mobile navigation uses a compact header plus four top-level bottom destinations: Home, Auctions, Watchlist, and Account. Sell a car remains a labeled action rather than an unlabeled floating icon.

### 5.2 Route Model

Canonical frontend routes:

| Area | Routes |
| --- | --- |
| Public | `/`, `/auctions`, `/auctions/[id]`, `/auctions/[id]/live`, `/sold`, `/sell`, `/about`, `/faq`, `/support` |
| Auth/legal | `/login`, `/register`, `/forgot-password`, `/privacy` |
| Cabinet | `/dashboard`, `/dashboard/watchlist`, `/dashboard/bids`, `/dashboard/vehicles`, `/dashboard/vehicles/new`, `/dashboard/vehicles/[id]`, `/dashboard/deals`, `/dashboard/payments`, `/dashboard/notifications`, `/dashboard/kyc`, `/dashboard/profile`, `/dashboard/dealer` |
| Admin | `/admin`, `/admin/moderation`, `/admin/users`, `/admin/vehicles`, `/admin/auctions`, `/admin/finance`, `/admin/reference-data`, `/admin/disputes`, `/admin/risk`, `/admin/audit` |

Compatibility behavior:

- `/lots/[id]` redirects to `/auctions/[id]`.
- `/lots/bidding/[id]` redirects to `/auctions/[id]/live`.
- Redirects preserve the record ID and relevant query parameters; they do not alter backend endpoint paths or WebSocket destinations.
- Existing dashboard/admin link destinations are implemented or redirected so they no longer fall into the 404 route.

## 6. Core Screen Designs

### 6.1 Home

The selected Champagne Ledger reference controls the home screen.

- Navy global navigation.
- Split hero with a concise cars-only proposition, structured search, and premium vehicle image.
- One featured live-auction row with price, countdown, next bid, inspection/seller signals, and a single primary entry action.
- Slim trust/market evidence strip.
- Below the first viewport: ending soon, how it works, finished-auction price evidence, seller invitation, and restrained footer.

The home page does not advertise every TZ feature.
Trust figures, seller verification, inspection results, and finished-price evidence render only when supplied by a real API or clearly identified development fixture; the production UI never invents marketplace statistics or assurance claims.

### 6.2 Auction Discovery

- Search and result count remain visible above the results.
- Desktop uses a filter rail and two-column or three-column result grid depending on width.
- Mobile uses a filter sheet with applied-filter chips and a persistent sort control.
- Results expose only decision-critical facts: vehicle identity, image, location, inspection state, current/start price, countdown/status, mileage, year, and watchlist action.
- Sold results substitute sale price/date for live bidding information.

### 6.3 Auction Detail

The page is organized around a two-column desktop composition and a single-column mobile flow:

1. Gallery and inspection/document summary.
2. Vehicle identity and technical facts.
3. Sticky participation panel with price, next bid, deposit, countdown, and status.
4. Description, condition/damage disclosure, Q&A, seller profile, and related auctions.

The primary action changes by state: verify identity, pay deposit, enter live auction, view result, or continue post-sale.

### 6.4 Live Auction

- Current price and remaining time dominate.
- Bid entry always shows the exact minimum accepted amount and currency.
- Connection state is visible but quiet: live, reconnecting, or polling fallback.
- The user receives explicit outbid, leading, reserve-not-met, anti-sniping extension, finished, and rejected-bid feedback.
- Bid history is a grouped ledger with timestamps and anonymized bidders.
- Auto-bid UI appears only when the capability is enabled.
- Destructive or money-moving actions require confirmation and remain disabled during submission.

### 6.5 Authentication and KYC

- Registration separates individual and organization paths early.
- OTP uses six clear inputs with paste support and resend timing.
- KYC is a step flow: identity, document upload, review, result.
- Rejection states show the reason and exact recovery action.
- Terms/public-offer acceptance is explicit and versioned in the UI.

### 6.6 Seller Vehicle Wizard

The wizard has resumable stages:

1. VIN and vehicle identity.
2. Technical specification.
3. Condition and damage disclosure.
4. Photos and primary image.
5. Documents.
6. Auction terms.
7. Review and submit.

Each stage has visible labels, progress, save state, validation near fields, and a predictable back path. Missing backend capabilities disable submission in production while preserving the complete form design.

### 6.7 Cabinet

Desktop uses a persistent rail; mobile uses top-level bottom navigation and section tabs.

- Overview prioritizes actionable states rather than decorative charts.
- Watchlist and bids are auction-ledgers with status and next action.
- Vehicles group drafts, review, scheduled, live, sold, rejected, and archived states.
- Deals use a visible post-sale timeline: contract, payment, handover, review/dispute.
- Payments show deposit, refund, fee, and final-payment entries with downloadable records only when available.

### 6.8 Admin and Moderation

- Desktop-first operational shell with a stable left rail and content header.
- Overview shows queues, system exceptions, and finance totals without decorative chart overload.
- Queues use sortable, filterable tables with mobile card fallbacks.
- Review screens pair source material with a decision panel and require a reason for rejection, bid voiding, blacklist, risk, or dispute decisions.
- Every critical action exposes its audit consequence before confirmation.
- Risk, dispute, audit, dealer, and v2 moderation screens use capability-aware unavailable states when APIs do not exist.

## 7. Component and Code Architecture

The redesign targets the active Next.js App Router tree. Legacy CRA files under `src/pages`, `src/App.jsx`, and `src/index.js` are not design sources and are not edited unless verification proves removal is safe.

Proposed boundaries:

```text
src/
  app/                    route composition and metadata
  components/
    ui/                   branded wrappers for buttons, fields, dialog, table, status
    layout/               public shell, cabinet shell, admin shell, mobile navigation
    auction/              cards, gallery, facts, bid panel, ledger, countdown
    vehicle/              technical facts, media, documents, wizard sections
    marketing/            hero, trust strip, how-it-works, archive evidence
    cabinet/              buyer/seller/dealer compositions
    admin/                queues, decision panels, operational tables
    feedback/             loading, empty, error, unavailable, toast, confirmation
  design-system/          tokens, MUI theme, typography, motion
  lib/
    auction/              legacy-Lot to VehicleAuction view-model adapters
    capabilities/         live/demo/unavailable feature policy
    formatting/           UZS/USD, dates, mileage, VIN, timers
    fixtures/             development-only v2 data
```

Implementation rules:

- Tailwind handles layout and responsive composition.
- MUI is retained only for behavior-rich accessible primitives such as dialogs, menus, selects, tables, and date/time controls, all wrapped in the TezAuksion theme.
- Lucide replaces mixed MUI structural icons.
- Raw hex values are prohibited in product components; components consume semantic tokens.
- Large existing page files are split by product responsibility while preserving query hooks and user-context behavior.
- `next/link` and App Router navigation replace internal anchor tags and stale CRA routing.

## 8. Data and Capability Model

### 8.1 Existing Backend Data

Existing query hooks remain the integration boundary. A normalized frontend view model translates legacy generic `Lot` data into the vehicle-auction presentation without leaking legacy field names through the UI.

The adapter must tolerate incomplete records and produce explicit `unknown` values rather than invented vehicle facts.
The cars-only public experience must not relabel non-car legacy inventory as vehicles. When the current API returns mixed categories, the adapter includes confirmed car records and routes all other records to a safe empty or unsupported-category state until the backend provides a canonical vehicle type.

### 8.2 V2-Only Data

Every v2 feature declares one state:

- `live`: supported by the current API.
- `demo`: fixture-backed in local development only.
- `unavailable`: rendered with honest status and recovery guidance.

Production defaults to `unavailable` unless a real endpoint is configured. Demo mutations never write financial, KYC, identity, contract, dispute, or moderation outcomes to production storage.

### 8.3 Real-Time Behavior

- Preserve the current STOMP/WebSocket integration behind a single auction-live hook.
- Expose connected, reconnecting, polling, and offline states.
- Server timestamps remain authoritative.
- Layout reserves space for price and countdown changes so live updates do not shift surrounding content.

## 9. Localization

- Uzbek is the default locale; saved preference is restored on return.
- Root `lang`, localized metadata, and content update with the active locale.
- Public auction pages expose localized canonical metadata, Open Graph data, `hreflang`, and `schema.org` Vehicle/Offer markup only from verified listing fields.
- Every new product string is defined in UZ, RU, and EN before the screen is considered complete.
- Hard-coded user-facing Uzbek/English strings are migrated into the message catalog.
- Currency, date, time, plural, and number formatting uses the active locale.
- Layouts are tested with longer Russian labels and do not rely on truncation for primary actions.

## 10. Accessibility and Responsive Rules

- WCAG AA contrast for text and interactive controls.
- Minimum interactive target: 44x44px.
- Visible 2–4px focus ring using `--focus-ring`.
- Logical heading order and a skip-to-content link.
- All icon-only controls have accessible names.
- Form errors use inline text plus `aria-live` or `role="alert"`.
- Color is never the only status indicator.
- Dialog focus is trapped and restored; Escape closes non-destructive overlays.
- Tables have headers and sorting semantics; mobile renders a card/list alternative rather than forcing unreadable columns.
- Breakpoints are verified at 375, 768, 1024, and 1440px, plus mobile landscape.
- Fixed navigation reserves content space and respects mobile safe areas.

## 11. Error and Edge-State Design

Every data surface defines:

- Loading skeleton with reserved geometry.
- Empty state with one relevant next action.
- Recoverable request failure with retry.
- Authentication expiry with return-to-task behavior.
- Permission denial with role-aware explanation.
- Capability unavailable state for backend gaps.
- Offline/reconnecting state for live auctions.
- Validation errors adjacent to their fields.

Money, identity, and moderation failures state what happened, whether anything was charged or saved, and what the user can do next.

## 12. Verification Strategy

Implementation is not complete until:

- Dependencies install reproducibly from `package-lock.json`.
- The Next.js production build passes.
- ESLint passes using the Next 16-compatible invocation.
- Active routes and compatibility redirects resolve without 404s.
- Public buyer, seller cabinet, and admin journeys receive focused smoke checks.
- Home, discovery, detail, live auction, cabinet, and admin screens are reviewed at 375, 768, 1024, and 1440px.
- Keyboard navigation, focus order, form errors, modal focus, and reduced motion are verified.
- UZ, RU, and EN are checked for overflow and missing messages.
- A rendered implementation screenshot is compared directly with the selected Champagne Ledger reference at the same viewport, followed by a visible-difference correction pass.
- Representative public pages meet Core Web Vitals targets of LCP under 2.5 seconds and CLS under 0.1 in the agreed test environment; server concurrency and bid-latency targets remain backend verification responsibilities.

## 13. Implementation Sequence

1. **Foundation:** tokens, fonts, MUI theme, primitives, shells, navigation, localization repair, capability model.
2. **Public buyer journey:** home, discovery, auction detail, live bidding, sold archive, auth/legal/support.
3. **Cabinet and seller journey:** nested routes, overview, watchlist/bids, vehicles, wizard, deals, payments, KYC/profile.
4. **Admin and moderation:** nested routes, queues, tables, review/decision surfaces, capability-aware v2 modules.
5. **Integration and QA:** adapters, redirects, responsive pass, accessibility, build/lint, visual comparison, cleanup of confirmed-dead active-tree styles.

Each sequence reuses the same design tokens and primitives; no phase introduces a separate visual system.
Every sequence ends in a buildable, navigable frontend and leaves existing connected journeys usable before the next sequence begins.

## 14. Acceptance Criteria

- The visual system visibly matches Champagne Ledger and the supplied logo palette across every active route.
- The product is cars-only in navigation, content, filters, terminology, and imagery.
- Existing working backend flows remain usable.
- Missing v2 backend capabilities are honest, safe, and visually complete.
- All intended nested dashboard/admin routes resolve.
- Core interactions work with keyboard and touch.
- No primary flow relies on placeholder links, `href="#"`, dead buttons, or hover-only behavior.
- UZ, RU, and EN are complete for redesigned surfaces.
- No horizontal page overflow at supported breakpoints.
- Prices, timers, and statuses remain stable during live updates.
- Production build, lint, responsive checks, accessibility checks, and reference comparison pass.

## 15. Decision Log

- **Chosen direction:** Champagne Ledger, selected by the user on 2026-07-16.
- **Scope authority:** TZ v2 defines frontend information architecture; current backend defines which operations can be live.
- **Architecture:** incremental Next.js App Router redesign rather than framework replacement.
- **UI stack:** disciplined Tailwind layout plus themed MUI primitives; Lucide for structural icons.
- **Safety:** development fixtures are permitted for UI demonstration; production does not fake irreversible outcomes.
- **Compatibility:** legacy public lot URLs redirect to the new auction URLs.
