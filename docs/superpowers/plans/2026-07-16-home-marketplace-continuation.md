# Home Marketplace Continuation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete home spec §6.1 below the first viewport using only the already-normalized live auction array, while hiding unavailable marketplace evidence.

**Architecture:** `ChampagneHome` remains the only data integration point and passes its normalized `VehicleAuction[]` into `HomeSections`. `HomeSections` performs small deterministic selections, reuses `AuctionCard` for actionable ending-soon lots, and delegates text-first final-price evidence to a focused presentational component. The existing `TrustLedger` becomes the labeled neutral how-it-works workflow; a static seller invitation links to the implemented `/sell` route.

**Tech Stack:** Next.js 16, React 19, TypeScript, React Intl, Tailwind CSS, Vitest, Testing Library.

## Global Constraints

- Use the existing normalized homepage auction array as the only marketplace data source.
- Never render development fixtures in production.
- Render ending-soon and finished-price sections only when qualifying real records exist.
- Finished evidence requires status `sold` or `ended` and a finite, nonnegative `finalPrice`.
- Do not invent counts, trust statistics, inspection results, or sale outcomes.
- Preserve responsive layout, keyboard-visible links, semantic headings, and the Champagne Ledger design language.
- Do not edit `LiveAuctionRoom`, `VehicleWizard`, `AuctionCard`, or `AuctionDetail`.
- Do not commit changes.

---

### Task 1: Lock homepage evidence behavior with failing tests

**Files:**
- Modify: `src/components/marketing/ChampagneHome.test.tsx`

**Interfaces:**
- Consumes: API-shaped legacy lots returned by the mocked `useInitialLots()` hook.
- Produces: regression coverage for visible ending-soon/final-price evidence and absent production evidence.

- [ ] **Step 1: Make the mocked lot feed configurable**

Replace the single fixed mock result with `testState.lots`, reset to the existing active lot in `beforeEach`, and return `data: testState.lots` from `useInitialLots`.

- [ ] **Step 2: Add a mixed-feed test**

Supply an active featured lot, one `ENDING_SOON` lot, one `SOLD` lot with `finalPrice`, one `FINISHED` lot with `finalPrice`, and one closed lot without `finalPrice`. Assert:

```tsx
expect(screen.getByRole("heading", { name: "Ending soon" })).toBeVisible();
expect(screen.getByRole("heading", { name: "Finished auction evidence" })).toBeVisible();
expect(screen.getByText("UZS 705,000,000")).toBeVisible();
expect(screen.queryByText("Closed without evidence")).not.toBeInTheDocument();
expect(screen.getByRole("link", { name: /start selling/i })).toHaveAttribute("href", "/sell");
```

- [ ] **Step 3: Add a production absence test**

Supply only an active lot and closed records without a verified `finalPrice`. Assert the ending-soon and finished-evidence headings are absent, while the neutral `How it works` heading and `/sell` invitation remain.

- [ ] **Step 4: Run the focused test and verify RED**

Run: `npm test -- --run src/components/marketing/ChampagneHome.test.tsx`

Expected: the new tests fail because `ChampagneHome` does not pass all auctions and `HomeSections` does not render the continuation sections.

---

### Task 2: Implement conditional continuation sections

**Files:**
- Create: `src/components/marketing/FinishedAuctionEvidence.tsx`
- Modify: `src/components/marketing/ChampagneHome.tsx`
- Modify: `src/components/marketing/HomeSections.tsx`
- Modify: `src/components/marketing/TrustLedger.tsx`
- Modify: `src/locales/champagne.ts`

**Interfaces:**
- Consumes: `auctions: readonly VehicleAuction[]` in `HomeSectionsProps`.
- Produces: `FinishedAuctionEvidence({ auctions }: { auctions: readonly VehicleAuction[] })` and conditional homepage sections.

- [ ] **Step 1: Pass normalized auctions into `HomeSections`**

Add `auctions={auctions}` beside the existing featured auction and query state props.

- [ ] **Step 2: Select evidence without fallback data**

Inside `HomeSections`, derive:

```tsx
const endingSoon = auctions
  .filter((auction) => auction.status === "ending-soon")
  .sort((a, b) => Date.parse(a.endTime ?? "") - Date.parse(b.endTime ?? ""))
  .slice(0, 3);
const finished = auctions
  .filter((auction) =>
    (auction.status === "sold" || auction.status === "ended") &&
    auction.finalPrice !== null &&
    Number.isFinite(auction.finalPrice) &&
    auction.finalPrice >= 0,
  )
  .slice(0, 3);
```

Render an `AuctionCard` grid only when `endingSoon.length > 0`, and `FinishedAuctionEvidence` only when `finished.length > 0`.

- [ ] **Step 3: Build text-first finished evidence**

Render each verified record as an article with localized title, lot number, `lot.finalPrice`, `formatAuctionPrice(finalPrice, { currency, locale })`, and a link to `/auctions/${id}`. Do not render an image, seller verification, inspection claim, or inferred closing date.

- [ ] **Step 4: Label neutral workflow and add seller invitation**

Give `TrustLedger` an `id="how-it-works"`, an accessible heading using `home.howItWorksTitle`, and neutral supporting copy. Add a navy invitation surface with `home.sellTitle`, `home.sellDescription`, and a labeled `/sell` link.

- [ ] **Step 5: Add localized copy in UZ/RU/EN**

Add exact keys for ending-soon, finished evidence, how-it-works, and seller invitation to all three locale maps without assurance or market-size claims.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `npm test -- --run src/components/marketing/ChampagneHome.test.tsx src/components/marketing/TrustLedger.test.tsx`

Expected: both test files pass with zero failures.

- [ ] **Step 7: Run scoped quality gates**

Run:

```bash
npx eslint src/components/marketing/ChampagneHome.tsx src/components/marketing/HomeSections.tsx src/components/marketing/FinishedAuctionEvidence.tsx src/components/marketing/TrustLedger.tsx src/components/marketing/ChampagneHome.test.tsx src/locales/champagne.ts
npm run typecheck
```

Expected: both commands exit 0.
