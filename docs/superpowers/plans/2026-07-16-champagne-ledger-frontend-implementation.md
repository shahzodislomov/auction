# Champagne Ledger Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the complete TezAuksion frontend as the approved cars-only Champagne Ledger product while preserving every currently connected auction, authentication, cabinet, and administration operation.

**Architecture:** The active Next.js 16 App Router receives a shared design system, normalized `VehicleAuction` view model, explicit capability policy, and separate public/cabinet/admin shells. Existing query modules and endpoints remain the API boundary; canonical car-auction pages consume adapters that reject non-car inventory, while v2-only operations render honest unavailable states in production and development fixtures only outside production.

**Tech Stack:** Next.js 16.2.10, React 19.2.4, TypeScript 5.9.3, Tailwind CSS 4, MUI 9, React Intl 10, TanStack Query 5, Lucide React, Framer Motion, STOMP, Vitest, Testing Library, jsdom.

## Global Constraints

- Match the selected source visual at `docs/superpowers/specs/assets/tezauksion-champagne-ledger-home-reference.png` at its 1487×1058 desktop viewport.
- Use `#081B3D` for primary navy, `#0C2A56` for navy hover, `#D8B58C` for champagne action fill, `#C9A16F` for champagne hover, `#F8F6F2` for canvas, `#526077` for secondary text, and `#8A5C1F` for focus rings.
- Champagne controls use navy text; never use white text on champagne.
- Use Unbounded only for short display moments and Manrope for product UI, with Latin and Cyrillic subsets.
- The product is cars-only. Do not relabel generic non-car `Lot` records as vehicles.
- Preserve current REST endpoints, STOMP destinations, token storage, OTP, Google login, likes, deposits, comments, bidding, seller listing, user administration, and catalog administration behavior.
- Production defaults v2-only features to `unavailable`; fixture-backed `demo` state is permitted only when `process.env.NODE_ENV !== "production"`.
- Never simulate completed payments, KYC decisions, contracts, disputes, or moderation mutations.
- Every redesigned user-facing string exists in Uzbek, Russian, and English.
- Use Tailwind for layout, themed MUI only for behavior-rich primitives, and Lucide for structural icons.
- Use supplied logo assets without redrawing, recoloring, or changing proportions.
- No raw hex values in product components; consume semantic CSS or MUI theme tokens.
- New routes are `.tsx` App Router pages. Legacy CRA files under `src/pages`, `src/App.jsx`, and `src/index.js` remain untouched.
- Minimum control target is 44×44px; keyboard focus is always visible; color is never the only status signal.
- Every task that adds or changes production behavior follows red-green-refactor and commits independently. Package/configuration work and byte-for-byte binary asset installation use explicit command verification because they are the TDD workflow's named exceptions.

---

## File Structure

The implementation creates these boundaries:

```text
public/
  vehicles/champagne-ledger-hero-suv.png
  vehicles/champagne-ledger-featured-suv.png
src/
  app/
    (page)/auctions/[id]/page.tsx
    (page)/auctions/[id]/live/page.tsx
    (page)/sold/page.tsx
    (page)/support/page.tsx
    (page)/forgot-password/page.tsx
    (page)/privacy/page.tsx
    (page)/dashboard/[...section]/page.tsx
    (page)/admin/[...section]/page.tsx
  components/
    ui/
    layout/
    marketing/
    auction/
    auth/
    vehicle/
    cabinet/
    admin/
    feedback/
  design-system/
    tokens.css
    theme.ts
  lib/
    auction/
    capabilities/
    fixtures/
    formatting/
    routing/
  test/
    setup.ts
    render.tsx
```

Route files remain thin composition layers. Product behavior lives in focused components and pure domain utilities. Existing files under `src/queries`, `src/context`, `src/api`, and `src/hooks` remain the integration layer and are changed only where Next 16 or TanStack Query 5 compatibility requires it.

The nine tasks are independent review gates inside one coordinated program: foundation (Tasks 1–3), public buyer journey (Tasks 4–6), cabinet (Task 7), administration (Task 8), and integration/QA (Task 9). Each gate leaves a buildable product surface and can be rejected without invalidating an approved neighboring surface.

---

### Task 1: Repair the Toolchain and Install Visual Assets

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `public/vehicles/champagne-ledger-hero-suv.png`
- Create: `public/vehicles/champagne-ledger-featured-suv.png`

**Interfaces:**
- Produces: `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` commands used by all remaining tasks.
- Produces: stable local asset URLs `/vehicles/champagne-ledger-hero-suv.png` and `/vehicles/champagne-ledger-featured-suv.png`.

- [ ] **Step 1: Correct package scripts and add the test dependencies**

Set the scripts to this exact shape:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Run:

```bash
npm install --legacy-peer-deps --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Expected: `package-lock.json` becomes synchronized with `package.json`, Next 16 is installed, and the six test packages appear under `devDependencies`.

- [ ] **Step 2: Add the Vitest browser-like environment**

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    passWithNoTests: true,
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

- [ ] **Step 3: Install the generated vehicle assets**

Copy the already generated source files without altering the originals:

```text
/Users/abdurahmoniy/.codex/generated_images/019f693d-ce10-77d0-866a-3231910171b6/exec-5d4539f3-1cc4-4b30-8463-34ad2ecb2ed5.png
→ public/vehicles/champagne-ledger-hero-suv.png

/Users/abdurahmoniy/.codex/generated_images/019f693d-ce10-77d0-866a-3231910171b6/exec-6b8b0101-bcef-4fd5-8e4a-495e15de33b9.png
→ public/vehicles/champagne-ledger-featured-suv.png
```

Expected dimensions: hero 1448×1086 and featured 1672×941.

- [ ] **Step 4: Verify the repaired baseline**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: the empty Vitest suite exits successfully, TypeScript and ESLint expose only pre-existing active-tree findings to be resolved in Task 2, and Next finds its binary. Record every baseline failure verbatim in the task report; do not hide it with ignore rules.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts public/vehicles
git commit -m "chore: establish Champagne Ledger frontend tooling"
```

---

### Task 2: Build the Design System, Localization Runtime, and Shared Shell

**Files:**
- Create: `src/design-system/tokens.css`
- Create: `src/design-system/theme.ts`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/StatusBadge.tsx`
- Create: `src/components/ui/Surface.tsx`
- Create: `src/components/feedback/StatePanel.tsx`
- Create: `src/components/layout/PublicHeader.tsx`
- Create: `src/components/layout/PublicFooter.tsx`
- Create: `src/components/layout/MobileNavigation.tsx`
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/locales/champagne.ts`
- Create: `src/test/render.tsx`
- Create: `src/components/layout/AppShell.test.tsx`
- Create: `src/components/ui/Button.test.tsx`
- Modify: `src/locales/index.js`
- Modify: `src/app/providers.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `public/manifest.json`
- Modify: `eslint.config.mjs`
- Replace: `src/app/globals.css`

**Interfaces:**
- Produces: `champagneTheme`, `Button`, `StatusBadge`, `Surface`, `StatePanel`, and `AppShell` used by every screen.
- Produces: locale persistence key `tezauksion.locale` and merged `champagneMessages` with equal UZ/RU/EN keys.
- Produces: `renderWithAppProviders(ui, options?)` for every component test.

- [ ] **Step 1: Write failing shell and control tests**

Create tests that assert:

```tsx
it("renders the complete public navigation and marks the current route", () => {
  renderWithAppProviders(<AppShell pathname="/auctions"><div>content</div></AppShell>);
  expect(screen.getByRole("link", { name: /auksionlar/i })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("link", { name: /avtomobil sotish/i })).toHaveAttribute("href", "/sell");
});

it("keeps champagne buttons readable and keyboard focusable", () => {
  render(<Button>Qidirish</Button>);
  expect(screen.getByRole("button", { name: "Qidirish" })).toHaveClass("text-brand-navy-900");
});
```

Every test file imports `describe`, `expect`, `it`, and `vi` from `vitest` as needed rather than relying on ambient test globals.

Run:

```bash
npm test -- src/components/layout/AppShell.test.tsx src/components/ui/Button.test.tsx
```

Expected: FAIL because the new modules do not exist.

- [ ] **Step 2: Implement tokens and theme**

Define all approved brand, semantic, typography, spacing, radius, shadow, and motion values in `tokens.css`; map the same values into `champagneTheme` in `theme.ts`. `globals.css` imports Tailwind and `tokens.css`, applies Manrope to `body`, sets canvas/nav spacing, provides skip-link behavior, reserves safe-area space, and removes the prior automatic dark-mode branch.

The root layout uses:

```ts
import { Manrope, Unbounded } from "next/font/google";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
});
```

- [ ] **Step 3: Implement locale persistence and the shell**

Merge `champagneMessages.uz`, `.ru`, and `.en` into the existing locale maps. `Providers` restores `tezauksion.locale`, persists changes to both local storage and a same-site locale cookie, accepts `?lang=uz|ru|en` as an explicit override, synchronizes `document.documentElement.lang`, applies `ThemeProvider` plus `CssBaseline`, and retains Google OAuth, QueryClient, AlertProvider, and UserProvider in their existing order.

`AppShell` renders skip link, `PublicHeader`, main content, `PublicFooter`, and `MobileNavigation`. Header behavior includes functional desktop/mobile menus, logo, auctions, sold archive, how-it-works, sell, search, locale, account, and logout through `UserContext`.

Create `src/test/render.tsx` with a fresh QueryClient, `IntlProvider`, the Champagne MUI theme, and this public interface:

```ts
export function renderWithAppProviders(
  ui: React.ReactElement,
  options?: { locale?: "uz" | "ru" | "en" },
): ReturnType<typeof render>;
```

Update `public/manifest.json` so installed icons reference `/icon.png` and `/brand.png`, not the React starter artwork. Extend ESLint's global ignores only for confirmed dead CRA entrypoints: `src/pages/**`, `src/App.jsx`, and `src/index.js`.

- [ ] **Step 4: Pass focused and global checks**

Run:

```bash
npm test -- src/components/layout/AppShell.test.tsx src/components/ui/Button.test.tsx
npm run typecheck
npx eslint src/design-system src/components/ui src/components/feedback src/components/layout src/locales/champagne.ts src/test/render.tsx src/app/providers.tsx src/app/layout.tsx
```

Expected: focused tests PASS and every Task 2 file has no type or lint errors. Run `npm run lint` once to record the reduced repository baseline; pre-existing files are corrected as their owning tasks replace them, and the complete repository gate becomes blocking in Task 9. Do not disable rules for shared active files.

- [ ] **Step 5: Commit**

```bash
git add src/design-system src/components/ui src/components/feedback src/components/layout src/locales src/test/render.tsx src/app/providers.tsx src/app/layout.tsx src/app/globals.css public/manifest.json eslint.config.mjs
git commit -m "feat: add Champagne Ledger design system and shell"
```

---

### Task 3: Add the Vehicle Auction Domain, Capability Policy, and Development Data

**Files:**
- Create: `src/lib/auction/types.ts`
- Create: `src/lib/auction/adaptLegacyLot.ts`
- Create: `src/lib/auction/selectVehicleAuctions.ts`
- Create: `src/lib/auction/bidding.ts`
- Create: `src/lib/capabilities/policy.ts`
- Create: `src/lib/fixtures/vehicleAuctions.ts`
- Create: `src/lib/formatting/auction.ts`
- Create: `src/lib/auction/adaptLegacyLot.test.ts`
- Create: `src/lib/auction/bidding.test.ts`
- Create: `src/lib/capabilities/policy.test.ts`

**Interfaces:**
- Produces: `VehicleAuction`, `AuctionStatus`, `AuctionCapability`, and `LegacyLot` types.
- Produces: `adaptLegacyLot(lot): VehicleAuction | null` and `selectVehicleAuctions(lots): VehicleAuction[]`.
- Produces: `BidRule`, `getNextBid(rule, highestBid?)`, `formatAuctionPrice`, `formatMileage`, and `getCapabilityState`.
- Produces: `demoVehicleAuctions`, imported only through a development guard.

- [ ] **Step 1: Write failing adapter, bid, and capability tests**

Cover these exact behaviors:

```ts
expect(adaptLegacyLot({ id: 7, lotType: { name: "ELECTRONICS" } })).toBeNull();
expect(adaptLegacyLot({ id: 8, lotType: { name: { en: "CAR", uz: "AVTOMOBIL" } }, title: "Tahoe" })?.id).toBe("8");
expect(getNextBid({ startPrice: 100, incrementType: "FIXED", incrementValue: 20 }, 140)).toBe(160);
expect(getNextBid({ startPrice: 100, incrementType: "PERCENTAGE", incrementValue: 10 }, 200)).toBe(220);
expect(getCapabilityState("kyc", { nodeEnv: "production", liveCapabilities: [] })).toBe("unavailable");
expect(getCapabilityState("kyc", { nodeEnv: "development", liveCapabilities: [] })).toBe("demo");
```

Run:

```bash
npm test -- src/lib/auction src/lib/capabilities
```

Expected: FAIL because the domain modules do not exist.

- [ ] **Step 2: Implement normalized types and safe adaptation**

`VehicleAuction` includes identity, status, localized title, make/model/year, pricing, increment, dates, mileage, fuel, transmission, drivetrain, region, condition, seller, inspection, documents, images, counts, and capabilities. `BidRule` is `Pick<VehicleAuction, "startPrice" | "incrementType" | "incrementValue">`. Unknown source values become `null` or `"unknown"`; the adapter never fabricates facts. Recognize a car only when a normalized category token equals `CAR`, `AUTO`, `AUTOMOBILE`, `AVTOMOBIL`, or `АВТОМОБИЛЬ`.

- [ ] **Step 3: Implement the capability guard and dev fixtures**

Use this invariant:

```ts
export function getCapabilityState(
  capability: AuctionCapability,
  options: { nodeEnv: string; liveCapabilities: readonly AuctionCapability[] },
): "live" | "demo" | "unavailable" {
  if (options.liveCapabilities.includes(capability)) return "live";
  return options.nodeEnv === "production" ? "unavailable" : "demo";
}
```

Fixtures contain realistic but explicitly development-only vehicles, including lot `10245` matching the selected reference. No production component imports fixtures directly; it calls a selector that receives `allowDemo`.

- [ ] **Step 4: Verify domain behavior**

Run:

```bash
npm test -- src/lib/auction src/lib/capabilities
npm run typecheck
npx eslint src/lib
```

Expected: all domain tests PASS and no implicit `any` leaks into new TypeScript files.

- [ ] **Step 5: Commit**

```bash
git add src/lib
git commit -m "feat: normalize vehicle auction frontend data"
```

---

### Task 4: Recreate the Champagne Ledger Home and Auction Discovery

**Files:**
- Create: `src/components/marketing/HeroSearch.tsx`
- Create: `src/components/marketing/FeaturedAuction.tsx`
- Create: `src/components/marketing/TrustLedger.tsx`
- Create: `src/components/marketing/HomeSections.tsx`
- Create: `src/components/marketing/ChampagneHome.tsx`
- Create: `src/components/auction/VehicleImage.tsx`
- Create: `src/components/auction/AuctionCard.tsx`
- Create: `src/components/auction/AuctionFilters.tsx`
- Create: `src/components/auction/AuctionDiscovery.tsx`
- Create: `src/components/marketing/ChampagneHome.test.tsx`
- Create: `src/components/auction/AuctionDiscovery.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/(page)/auctions/page.tsx`

**Interfaces:**
- Consumes: `AppShell`, `VehicleAuction`, adapters, capability selector, `useInitialLots`, and `useAllLotsAvailable`.
- Produces: functional home search query and auctions filter query using `make`, `model`, `year`, `region`, `status`, and `sort` URL parameters.

- [ ] **Step 1: Write failing home and discovery interaction tests**

Tests must assert the visible reference hierarchy and behavior:

```tsx
expect(screen.getByRole("heading", { name: /ishonchli avtomobil auksionlari/i })).toBeVisible();
expect(screen.getByRole("img", { name: /navy premium suv/i })).toHaveAttribute("src", expect.stringContaining("champagne-ledger-hero-suv"));
await user.selectOptions(screen.getByLabelText(/marka/i), "Chevrolet");
await user.click(screen.getByRole("button", { name: /qidirish/i }));
expect(push).toHaveBeenCalledWith(expect.stringContaining("/auctions?make=Chevrolet"));
```

Discovery tests verify that filter changes update the URL, the result count changes, non-car inputs never render, mobile filter controls are labeled, and sold cards do not show a bid CTA.

Run:

```bash
npm test -- src/components/marketing/ChampagneHome.test.tsx src/components/auction/AuctionDiscovery.test.tsx
```

Expected: FAIL because the components do not exist.

- [ ] **Step 2: Implement the reference-matched home composition**

At 1487×1058, match the reference proportions: 94px navy header, hero split near 56/44, left content padding near 54px, hero heading near 52px, structured four-field search, 44px trust row, featured auction ledger, and bottom evidence strip. Use the generated hero and featured images with `next/image`, measured `sizes`, and stable aspect-ratio containers. Use qualitative trust labels when real statistics are absent.

All primary controls work: search navigates, account navigates, featured entry opens the detail/live route according to status, save uses the existing like mutation when authenticated, and asks for login otherwise. `VehicleImage` uses `next/image` for local or explicitly trusted assets; API images from unconfirmed hosts use a semantic native `img` with fixed aspect ratio, width, height, lazy loading, and safe fallback so the configuration never permits an arbitrary remote optimizer host.

- [ ] **Step 3: Implement responsive discovery**

Desktop uses a 280px filter rail and two/three-column result grid. Mobile uses a modal filter sheet, persistent sort, applied chips, 44px controls, and one-column cards. Real API data wins; development fixtures appear only when the selector receives `allowDemo: true`.

- [ ] **Step 4: Run focused checks and capture the first implementation screenshot**

Run:

```bash
npm test -- src/components/marketing/ChampagneHome.test.tsx src/components/auction/AuctionDiscovery.test.tsx
npm run typecheck
npx eslint src/components/marketing src/components/auction src/app/page.tsx 'src/app/(page)/auctions/page.tsx'
```

Expected: tests PASS. Start `npm run dev`, open `/` in the in-app Browser at 1487×1058, and save the first screenshot under `.superpowers/artifacts/task-4-home.png` for the task report; this is evidence, not final design QA.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing src/components/auction src/app/page.tsx 'src/app/(page)/auctions/page.tsx'
git commit -m "feat: rebuild public auction discovery experience"
```

---

### Task 5: Build Auction Detail, Live Bidding, Sold Archive, and Compatibility Routes

**Files:**
- Create: `src/components/auction/AuctionGallery.tsx`
- Create: `src/components/auction/AuctionFacts.tsx`
- Create: `src/components/auction/ParticipationPanel.tsx`
- Create: `src/components/auction/BidLedger.tsx`
- Create: `src/components/auction/LiveAuctionRoom.tsx`
- Create: `src/components/auction/AuctionDetail.tsx`
- Create: `src/components/auction/AuctionDetail.test.tsx`
- Create: `src/components/auction/LiveAuctionRoom.test.tsx`
- Create: `src/lib/routing/legacyAuctionRedirect.ts`
- Create: `src/lib/routing/legacyAuctionRedirect.test.ts`
- Create: `src/lib/seo/auctionMetadata.ts`
- Create: `src/lib/seo/auctionMetadata.test.ts`
- Create: `.env.example`
- Create: `src/app/(page)/auctions/[id]/page.tsx`
- Create: `src/app/(page)/auctions/[id]/live/page.tsx`
- Create: `src/app/(page)/sold/page.tsx`
- Modify: `src/app/(page)/lots/[id]/page.tsx`
- Modify: `src/app/(page)/lots/bidding/[id]/page.tsx`
- Modify: `src/api/api.js`
- Modify: `src/hooks/useStomp.js`

**Interfaces:**
- Consumes: `useLot`, `useLotCounts`, `useLikedLots`, `useLikeLotMutation`, `useUserDeposits`, `useDepositToLotMutation`, comment hooks, `useSocket`, and `api`.
- Produces: canonical `/auctions/[id]` and `/auctions/[id]/live` experiences and query-preserving legacy redirects.
- Produces: `buildAuctionMetadata(auction, locale)` and `buildVehicleStructuredData(auction)` using verified fields only.

- [ ] **Step 1: Write failing route, detail, and bidding tests**

Cover exact behavior:

```ts
expect(buildAuctionRedirect("42", { ref: "watchlist" }, false)).toBe("/auctions/42?ref=watchlist");
expect(buildAuctionRedirect("42", {}, true)).toBe("/auctions/42/live");
```

Component tests verify gallery keyboard controls, state-derived CTA, exact next bid, confirmation before deposit/bid, disabled submitting state, `leading`/`outbid`/`reconnecting` copy, and bid-ledger timestamps.

Run:

```bash
npm test -- src/components/auction/AuctionDetail.test.tsx src/components/auction/LiveAuctionRoom.test.tsx src/lib/routing/legacyAuctionRedirect.test.ts src/lib/seo/auctionMetadata.test.ts
```

The SEO test asserts that missing VIN, inspection, seller-verification, and price values do not appear in metadata or JSON-LD.

Expected: FAIL because the new modules do not exist.

- [ ] **Step 2: Implement detail and participation behavior**

Use REST `useLot(id)` as the initial source and update from the existing lot/count STOMP destinations when connected. Preserve view tracking, like, 1% deposit, seller detail, comments, and authentication gating. The sticky participation panel changes its one primary action among verify, deposit, enter live room, view result, and continue deal.

- [ ] **Step 3: Implement live bidding without changing backend contracts**

Preserve these destinations and endpoint:

```text
/topic/lots/{lotId}
/topic/lots/getLotCounts
/topic/bids/getHighestBid/{lotId}
/topic/bids/getAllBidsByLotId/{lotId}
POST /bids/create?bidderId={userId}&lotId={lotId}
```

`api.js` reads `NEXT_PUBLIC_API_URL`, retains `https://api.tezauksion.uz/` as its default, and reads local storage only behind a `typeof window !== "undefined"` guard. `useStomp.js` reads `NEXT_PUBLIC_WS_URL` and falls back to `http://localhost:8989/ws` only in local development. Without a production WebSocket URL the live room reports transport unavailable and uses REST polling where supported. It exposes connected, reconnecting, polling fallback, and offline states while keeping server time authoritative. A failed bid leaves the entered amount and states whether money moved. `.env.example` documents both public variables without credentials.

- [ ] **Step 4: Implement archive and compatibility**

`/sold` uses finished vehicle records and sale price/date. Legacy route pages await Next 16 `params` and `searchParams`, call `buildAuctionRedirect`, and use `redirect()` so IDs and query parameters survive.

`auctionMetadata.ts` builds canonical, Open Graph, `schema.org` Vehicle/Offer, and UZ/RU/EN alternate metadata from verified non-null fields only. Tests prove unknown VIN, seller verification, inspection, and price values are omitted. Locale alternatives use `?lang=uz`, `?lang=ru`, and `?lang=en`, matching the provider override and locale cookie.

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm test -- src/components/auction src/lib/routing src/lib/seo
npm run typecheck
npx eslint src/components/auction src/lib/routing src/lib/seo src/api/api.js src/hooks/useStomp.js 'src/app/(page)/auctions' 'src/app/(page)/sold' 'src/app/(page)/lots'
```

Expected: PASS with no changed endpoint or STOMP destination.

```bash
git add src/components/auction src/lib/routing src/lib/seo src/api/api.js src/hooks/useStomp.js .env.example 'src/app/(page)/auctions' 'src/app/(page)/sold' 'src/app/(page)/lots'
git commit -m "feat: redesign vehicle auction participation and bidding"
```

---

### Task 6: Redesign Authentication, Public Information, Support, and Seller Intake

**Files:**
- Create: `src/components/auth/AuthShell.tsx`
- Create: `src/components/auth/EmailAuthForm.tsx`
- Create: `src/components/auth/OtpStep.tsx`
- Create: `src/components/auth/AuthExperience.test.tsx`
- Create: `src/components/marketing/InformationPage.tsx`
- Create: `src/components/vehicle/VehicleWizard.tsx`
- Create: `src/components/vehicle/VehicleWizard.test.tsx`
- Create: `src/app/(page)/forgot-password/page.tsx`
- Create: `src/app/(page)/privacy/page.tsx`
- Create: `src/app/(page)/support/page.tsx`
- Modify: `src/app/(page)/login/page.tsx`
- Modify: `src/app/(page)/register/page.tsx`
- Modify: `src/app/(page)/sell/page.tsx`
- Modify: `src/app/(page)/about/page.tsx`
- Modify: `src/app/(page)/faq/page.tsx`

**Interfaces:**
- Consumes: existing login/register/verify/resend hooks, Google login behavior, `UserContext.login`, support hooks, lot creation hooks, and capability policy.
- Produces: responsive account flows and resumable seven-stage seller wizard.

- [ ] **Step 1: Write failing authentication and wizard tests**

Authentication tests assert email/password labels, individual/organization registration choice, six-digit OTP paste, resend timer, terms acceptance, `UserContext.login` after success, and return-to-task navigation. Wizard tests assert seven named stages, validation adjacent to the field, back/next behavior, saved local draft, 5–30 image guidance, and production-disabled submission when the vehicle-document capability is unavailable.

Run:

```bash
npm test -- src/components/auth/AuthExperience.test.tsx src/components/vehicle/VehicleWizard.test.tsx
```

Expected: FAIL because the new modules do not exist.

- [ ] **Step 2: Implement connected auth flows**

Use existing mutation payloads and OTP endpoints. On successful login or verified registration, call `UserContext.login(token)` instead of writing only to storage. Preserve Google OAuth and FCM registration behavior. Errors name the field or operation and do not clear valid input.

- [ ] **Step 3: Implement public information and support**

About, FAQ/how-it-works, privacy, and support use one Champagne Ledger information template with page-specific copy in all locales. Support sends through existing hooks when available and shows an honest unavailable panel otherwise.

- [ ] **Step 4: Implement the seller wizard**

The stages are VIN/identity, technical facts, condition/damage, photos, documents, auction terms, review. Current generic lot creation remains available only where its live fields map safely; v2 documents/KYC/auction terms show capability status and cannot report a successful production submission without endpoints.

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm test -- src/components/auth src/components/vehicle
npm run typecheck
npx eslint src/components/auth src/components/vehicle src/components/marketing/InformationPage.tsx 'src/app/(page)/login' 'src/app/(page)/register' 'src/app/(page)/forgot-password' 'src/app/(page)/privacy' 'src/app/(page)/support' 'src/app/(page)/sell' 'src/app/(page)/about' 'src/app/(page)/faq'
```

Expected: PASS and every new string has three translations.

```bash
git add src/components/auth src/components/marketing/InformationPage.tsx src/components/vehicle 'src/app/(page)/login' 'src/app/(page)/register' 'src/app/(page)/forgot-password' 'src/app/(page)/privacy' 'src/app/(page)/support' 'src/app/(page)/sell' 'src/app/(page)/about' 'src/app/(page)/faq'
git commit -m "feat: redesign account and seller intake journeys"
```

---

### Task 7: Build the Buyer, Seller, and Dealer Cabinet

**Files:**
- Create: `src/components/cabinet/CabinetShell.tsx`
- Create: `src/components/cabinet/CabinetOverview.tsx`
- Create: `src/components/cabinet/CabinetLedger.tsx`
- Create: `src/components/cabinet/VehicleWorkspace.tsx`
- Create: `src/components/cabinet/DealTimeline.tsx`
- Create: `src/components/cabinet/KycPanel.tsx`
- Create: `src/components/cabinet/DealerPanel.tsx`
- Create: `src/components/cabinet/CabinetRouter.tsx`
- Create: `src/components/cabinet/CabinetRouter.test.tsx`
- Create: `src/app/(page)/dashboard/[...section]/page.tsx`
- Modify: `src/app/(page)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `UserContext`, likes, participated/winning lots, seller lots, transactions, notification stream, user update hooks, and capability policy.
- Produces: route-driven cabinet sections for watchlist, bids, vehicles, vehicle create/detail, deals, payments, notifications, KYC, profile, and dealer.

- [ ] **Step 1: Write failing cabinet route and state tests**

Use a table of section arrays and expected headings:

```ts
const routes = [
  [[], "Kabinet"],
  [["watchlist"], "Saqlanganlar"],
  [["bids"], "Takliflarim"],
  [["vehicles"], "Avtomobillarim"],
  [["vehicles", "new"], "Avtomobil qo‘shish"],
  [["deals"], "Bitimlar"],
  [["payments"], "To‘lovlar"],
  [["notifications"], "Bildirishnomalar"],
  [["kyc"], "Shaxsni tasdiqlash"],
  [["profile"], "Profil"],
  [["dealer"], "Diler markazi"],
];
```

Also assert role-aware navigation, mobile section tabs, loading/empty/error states, and no money/KYC completion claim for unavailable capabilities.

Run:

```bash
npm test -- src/components/cabinet/CabinetRouter.test.tsx
```

Expected: FAIL because the cabinet router does not exist.

- [ ] **Step 2: Implement the route-driven shell and connected ledgers**

Use a persistent desktop rail, content header, mobile bottom destinations, and section tabs. Normalize existing hook responses through the vehicle adapter. Watchlist, bids, vehicles, payments, notifications, and profile preserve their current live hooks and mutations.

- [ ] **Step 3: Implement v2 capability-aware surfaces**

Deals show contract/payment/handover/review-dispute timeline. KYC shows identity/document/review/result stages. Dealer shows verification, bulk import entry, API status, tier, and statements. In production, absent endpoints render `StatePanel` with `unavailable` and a recovery explanation; their primary mutation controls remain disabled.

- [ ] **Step 4: Verify all canonical cabinet routes**

Run:

```bash
npm test -- src/components/cabinet/CabinetRouter.test.tsx
npm run typecheck
npx eslint src/components/cabinet 'src/app/(page)/dashboard'
```

Expected: PASS. Start the development server and verify `/dashboard`, `/dashboard/watchlist`, `/dashboard/bids`, `/dashboard/vehicles/new`, `/dashboard/vehicles/10245`, `/dashboard/deals`, `/dashboard/payments`, `/dashboard/notifications`, `/dashboard/kyc`, `/dashboard/profile`, and `/dashboard/dealer` return rendered pages rather than 404.

- [ ] **Step 5: Commit**

```bash
git add src/components/cabinet 'src/app/(page)/dashboard'
git commit -m "feat: rebuild buyer seller and dealer cabinet"
```

---

### Task 8: Build the Admin and Moderation Workspace

**Files:**
- Create: `src/components/admin/AdminShell.tsx`
- Create: `src/components/admin/AdminOverview.tsx`
- Create: `src/components/admin/OperationalTable.tsx`
- Create: `src/components/admin/DecisionPanel.tsx`
- Create: `src/components/admin/AdminRouter.tsx`
- Create: `src/components/admin/AdminRouter.test.tsx`
- Create: `src/app/(page)/admin/[...section]/page.tsx`
- Modify: `src/app/(page)/admin/page.tsx`
- Modify: active files under `src/app/(_components)/Admin/` only when a live operation is reused rather than replaced.

**Interfaces:**
- Consumes: current statistics, users, roles, balance, blocking, lot approval, bids, transactions, catalog, banner, and notification hooks.
- Produces: route-driven admin sections for moderation, users, vehicles, auctions, finance, reference data, disputes, risk, and audit.

- [ ] **Step 1: Write failing admin routing and decision tests**

Test the route-to-section table and these behaviors: stable left rail, sortable/filterable table, mobile list fallback, reason required for rejection/block/risk/dispute decisions, confirmation naming the audit effect, and capability-aware unavailable states.

Run:

```bash
npm test -- src/components/admin/AdminRouter.test.tsx
```

Expected: FAIL because the admin components do not exist.

- [ ] **Step 2: Implement connected operational modules**

Overview renders real queue/statistic values only when supplied. Users preserve role, balance, block, and notification actions. Vehicles/auctions preserve approve/decline/delete. Finance preserves bid/transaction records. Reference data preserves lot type/subtype/attribute/option and banner administration inside a labeled legacy-compatibility panel rather than the primary cars-only navigation. TanStack Query 5 calls use object signatures and object-form `invalidateQueries({ queryKey })`.

- [ ] **Step 3: Implement v2 moderation modules safely**

Moderation, disputes, risk, and audit use the shared operational table and source-plus-decision layout. Without endpoints they remain readable, filterable demo surfaces only outside production and explicit unavailable surfaces in production. No production decision button reports success without a mutation response.

- [ ] **Step 4: Verify all canonical admin routes**

Run:

```bash
npm test -- src/components/admin/AdminRouter.test.tsx
npm run typecheck
npx eslint src/components/admin 'src/app/(page)/admin'
```

Expected: PASS. Verify `/admin`, `/admin/moderation`, `/admin/users`, `/admin/vehicles`, `/admin/auctions`, `/admin/finance`, `/admin/reference-data`, `/admin/disputes`, `/admin/risk`, and `/admin/audit` render without 404.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin 'src/app/(page)/admin' 'src/app/(_components)/Admin'
git commit -m "feat: rebuild administration and moderation workspace"
```

---

### Task 9: Integrate, Remove Active-Tree Drift, and Pass Full Design QA

**Files:**
- Modify: active App Router, query, context, hook, component, locale, and config files required by failing checks
- Create: `design-qa.md`
- Create: `.superpowers/artifacts/champagne-home-1487x1058.png`
- Create: `.superpowers/artifacts/champagne-home-mobile-375x812.png`

**Interfaces:**
- Consumes: every previous task.
- Produces: buildable, route-complete, browser-verified Champagne Ledger frontend and the required visual comparison record.

- [ ] **Step 1: Run the complete automated suite**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: all commands exit 0 with no ignored active-tree errors. When a defect appears, write a failing regression test that reproduces it before changing production code.

Use `rg` imports to prove old files are unreferenced before adding a confirmed inactive path to ESLint's global ignores. Never ignore a shared active file or a finding introduced by this redesign.

- [ ] **Step 2: Run route and interaction smoke checks**

Start the production server and verify every canonical route from the approved spec plus `/lots/10245` and `/lots/bidding/10245`. In the in-app Browser, test home search, locale switching, mobile menu, auctions filtering, auction save, detail gallery, deposit confirmation, live bid confirmation, auth field validation, seller wizard navigation, cabinet navigation, and admin navigation. Check the browser console after each core journey and resolve all errors.

- [ ] **Step 3: Run responsive and accessibility checks**

Inspect 375, 768, 1024, 1440, and 1487px widths. Verify no horizontal overflow, 44px targets, skip link, focus order, dialog focus restoration, inline form errors, reduced motion, table headers, mobile table alternatives, safe-area spacing, and UZ/RU/EN label expansion.

Record a representative mobile performance trace for `/` and `/auctions`. Confirm stable reserved image/layout geometry, no recurring main-thread work from countdowns or socket reconnects, LCP under 2.5 seconds, and CLS under 0.1 in the documented local test environment. Server concurrency and bid latency remain backend verification responsibilities.

- [ ] **Step 4: Run the blocking visual comparison loop**

Capture `/` at 1487×1058 in the same default Uzbek state as the source. Put the source image and implementation capture together in one comparison input. Evaluate fonts/typography, spacing/layout rhythm, colors/tokens, image quality, copy, icons, and primary interaction affordances. Write findings to `design-qa.md`, fix every P0/P1/P2, recapture at the identical viewport, and repeat until the file ends with:

```text
final result: passed
```

The report records source path, implementation screenshot path, viewport, state, full-view evidence, focused-region evidence, comparison history, interactions tested, and console result.

- [ ] **Step 5: Verify the final diff and commit**

Run:

```bash
git diff --check
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: all exit 0 and `design-qa.md` says `final result: passed`.

```bash
git add src public package.json package-lock.json next.config.ts design-qa.md .superpowers/artifacts
git commit -m "test: verify Champagne Ledger frontend redesign"
```

---

## Final Review Gate

After Task 9, generate a whole-branch review package from the branch start commit to `HEAD`. Dispatch the final reviewer using the `superpowers:requesting-code-review` template. Fix every Critical and Important finding through the same failing-test-first workflow, regenerate the package, and repeat review until both spec compliance and code quality are approved. Then run `superpowers:verification-before-completion` and `superpowers:finishing-a-development-branch` before handoff.
