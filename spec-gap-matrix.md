# Auction TZ v2.0 Atomic Gap Matrix

Source of requirements: `C:/Users/user/Downloads/Telegram Desktop/Technical_Specification_AUCTION_v2_Cars.docx`

Scope of evidence: repository code only.

Status legend: `✅ Implemented` / `🟡 Partially implemented` / `❌ Not implemented` / `❓ Cannot determine`

| Requirement | Status | Evidence | Missing Code | Required Backend Changes | Required Frontend Changes | Complexity | Priority |
|---|---|---|---|---|---|---|---|
| Registration by phone | ❌ | [src/pages/auth/Register.jsx](C:/Users/user/auction-front/src/pages/auth/Register.jsx) | UI collects phone but register mutation posts to `/auth/registerByEmail`; no phone registration flow | Add phone-based registration endpoint and OTP path | Add phone registration submission path and validation UX | M | High |
| Registration by e-mail + password | ✅ | [src/pages/auth/Register.jsx](C:/Users/user/auction-front/src/pages/auth/Register.jsx), [src/queries/index.jsx](C:/Users/user/auction-front/src/queries/index.jsx) | None in repo for basic flow | Keep/align API with v2 | Minor copy/polish only | S | High |
| OTP confirmation via e-mail/SMS | 🟡 | [src/pages/auth/Register.jsx](C:/Users/user/auction-front/src/pages/auth/Register.jsx), [src/pages/auth/Login.jsx](C:/Users/user/auction-front/src/pages/auth/Login.jsx), [src/components/OTPinput.jsx](C:/Users/user/auction-front/src/components/OTPinput.jsx) | No SMS-specific flow proven | Add SMS OTP support and event handling if required | Add channel-aware UX and resend messaging | M | High |
| Individual first name capture | ✅ | [src/pages/auth/Register.jsx](C:/Users/user/auction-front/src/pages/auth/Register.jsx) | None | None | None | S | Medium |
| Individual last name capture | ✅ | [src/pages/auth/Register.jsx](C:/Users/user/auction-front/src/pages/auth/Register.jsx) | None | None | None | S | Medium |
| Individual date of birth capture | ❌ | [src/pages/auth/Register.jsx](C:/Users/user/auction-front/src/pages/auth/Register.jsx) | No DOB field | Add DOB field to user model/API | Add DOB input and validation | S | High |
| Individual ID document upload for KYC | ❌ | [src/pages/auth/Register.jsx](C:/Users/user/auction-front/src/pages/auth/Register.jsx), [src/pages/cabinet/Profile.jsx](C:/Users/user/auction-front/src/pages/cabinet/Profile.jsx) | No KYC document upload UI | Add user document storage/review APIs | Add upload flow and status UI | M | High |
| Organization company name capture | 🟡 | [src/pages/cabinet/Profile.jsx](C:/Users/user/auction-front/src/pages/cabinet/Profile.jsx) | Not collected in registration flow | Add org onboarding fields in registration API | Add org registration path, not only profile edit | M | High |
| Organization legal address capture | ❌ | [src/pages/cabinet/Profile.jsx](C:/Users/user/auction-front/src/pages/cabinet/Profile.jsx) | No legal address field | Add legal address model/API | Add input in org forms | S | High |
| Organization tax ID capture | 🟡 | [src/pages/cabinet/Profile.jsx](C:/Users/user/auction-front/src/pages/cabinet/Profile.jsx) | Only editable as `orgInn`; not part of registration/KYC workflow | Add registration + verification storage | Add registration and KYC UI | M | High |
| Organization contact person capture | 🟡 | [src/pages/auth/Register.jsx](C:/Users/user/auction-front/src/pages/auth/Register.jsx), [src/pages/cabinet/Profile.jsx](C:/Users/user/auction-front/src/pages/cabinet/Profile.jsx) | No explicit org contact-person workflow | Add org-type specific user model semantics | Add org form UX | S | Medium |
| Organization registration certificate upload | ❌ | [src/pages/cabinet/Profile.jsx](C:/Users/user/auction-front/src/pages/cabinet/Profile.jsx) | No file upload | Add document upload/review APIs | Add certificate upload/status UI | M | High |
| KYC status NOT_SUBMITTED | ❌ | repo search; no KYC code | No status display or storage use | Add KYC state machine | Add status badges/gating | M | High |
| KYC status PENDING | ❌ | repo search; no KYC code | No status display or storage use | Add KYC state machine | Add status badges/gating | M | High |
| KYC status APPROVED | ❌ | repo search; no KYC code | No status display or storage use | Add KYC state machine | Add status badges/gating | M | High |
| KYC status REJECTED with reason | ❌ | repo search; no KYC code | No rejection reason UI | Add review reason model/API | Add rejection reason display/resubmit flow | M | High |
| Selling requires approved KYC | ❌ | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | Seller access gated only by role, not KYC | Enforce KYC before listing creation | Show KYC blockers/CTA | M | High |
| Bidding requires approved KYC | ❌ | [src/components/Lots/id/index.jsx](C:/Users/user/auction-front/src/components/Lots/id/index.jsx), [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | Deposit/bid flows do not check KYC | Enforce KYC before deposit/bid | Show KYC blockers/CTA | M | High |
| Terms of Service acceptance at registration | 🟡 | [src/pages/auth/Register.jsx](C:/Users/user/auction-front/src/pages/auth/Register.jsx), [src/pages/auth/Privacy.jsx](C:/Users/user/auction-front/src/pages/auth/Privacy.jsx) | Checkbox exists but no versioned ToS/public offer acceptance storage evidence | Add agreement acceptance persistence/versioning | Surface actual ToS/public offer docs and version text | M | High |
| Public offer acceptance at registration | ❌ | [src/pages/auth/Register.jsx](C:/Users/user/auction-front/src/pages/auth/Register.jsx) | No public-offer acceptance flow | Add offer agreement persistence | Add separate offer consent UI | S | Medium |
| Re-acceptance on new agreement versions | ❌ | repo search; no versioned acceptance | No acceptance history/version prompts | Add agreement versioning and enforcement | Add re-consent modal/page | M | Medium |
| Acceptance history stored | ❌ | repo search; no acceptance history | No stored acceptance use | Add agreement_acceptances APIs/schema | Add history/admin/user visibility as needed | M | Medium |
| Many-to-many user roles | 🟡 | [src/components/UsersTable.jsx](C:/Users/user/auction-front/src/components/UsersTable.jsx), [src/pages/cabinet/Dashboard.jsx](C:/Users/user/auction-front/src/pages/cabinet/Dashboard.jsx) | UI only uses buyer/seller/admin patterns | Ensure full role matrix on backend | Expand UI for moderator/dealer multi-role management | M | Medium |
| Account blocking by admin | ✅ | [src/queries/users.jsx](C:/Users/user/auction-front/src/queries/users.jsx), [src/components/UsersTable.jsx](C:/Users/user/auction-front/src/components/UsersTable.jsx) | No unblock flow found | Add unblock if missing | Add unblock action/status clarity | S | Medium |
| Session management | ❌ | [src/context/UserContext.jsx](C:/Users/user/auction-front/src/context/UserContext.jsx) | Only basic token login/logout | Add refresh tokens, session listing/revocation | Add session settings UI | M | Medium |
| Optional 2FA (TOTP) | ❌ | repo search; no 2FA/TOTP | No 2FA setup/verify UI | Add TOTP backend | Add setup, QR, verify, recovery UI | M | Medium |
| JWT access tokens | 🟡 | [src/api/api.js](C:/Users/user/auction-front/src/api/api.js), [src/context/UserContext.jsx](C:/Users/user/auction-front/src/context/UserContext.jsx) | Token usage exists; token issuance details not in repo | Confirm JWT issuance/claims | Minimal frontend changes | S | Medium |
| Refresh tokens | ❌ | [src/api/api.js](C:/Users/user/auction-front/src/api/api.js) | No refresh flow or storage | Add refresh-token auth flow | Add interceptor/token renewal/logout handling | M | High |
| Rate limiting on auth endpoints | ❓ | repo has no backend auth implementation | No evidence in frontend | Add auth rate limiting | Optional error-state UX | S | Medium |
| Admin-managed vehicle makes | ❌ | [src/queries/lot-types.jsx](C:/Users/user/auction-front/src/queries/lot-types.jsx), [src/pages/Admin/lot-types/ManageLotTypes.jsx](C:/Users/user/auction-front/src/pages/Admin/lot-types/ManageLotTypes.jsx) | Repo uses generic lot types, not vehicle makes | Replace lot-type dictionaries with makes/models | Replace admin lot-type pages with make/model pages | L | High |
| Admin-managed vehicle models | ❌ | same as above | No make->model structure for cars | Add model dictionary APIs | Add model management UX | L | High |
| Admin-managed regions | 🟡 | [src/queries/region.jsx](C:/Users/user/auction-front/src/queries/region.jsx) | Regions fetched, but not clearly admin-managed in repo | Add region management if absent | Add region admin screens if needed | M | Medium |
| Vehicle make field | ❌ | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | No dedicated make field | Add vehicle schema/API | Add make selector | M | High |
| Vehicle model field | ❌ | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | No dedicated model field | Add vehicle schema/API | Add model selector | M | High |
| Vehicle year field | ❌ | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | No year field | Add vehicle schema/API | Add year input | S | High |
| Vehicle VIN field | ❌ | same | No VIN field | Add VIN schema/API | Add VIN input/validation UI | M | High |
| VIN uniqueness | ❌ | same | No duplicate VIN handling | Enforce unique VIN on backend | Surface duplicate VIN errors | M | High |
| VIN checksum validation | ❌ | same | No checksum logic | Add VIN validation service | Add client validation hints | M | Medium |
| Vehicle mileage field | ❌ | same | No mileage field | Add vehicle schema/API | Add mileage input | S | High |
| Vehicle engine volume field | ❌ | same | No engine volume field | Add vehicle schema/API | Add engine volume input | S | Medium |
| Vehicle fuel type field | ❌ | same | No fuel-type field | Add enum/API | Add selector | S | Medium |
| Vehicle transmission field | ❌ | same | No transmission field | Add enum/API | Add selector | S | Medium |
| Vehicle drivetrain field | ❌ | same | No drivetrain field | Add enum/API | Add selector | S | Medium |
| Vehicle body type field | ❌ | same | No body-type field | Add enum/API | Add selector | S | Medium |
| Vehicle color field | ❌ | same | No color field | Add schema/API | Add color input | S | Low |
| Vehicle condition grade field | ❌ | same | No condition-grade field | Add enum/API | Add selector | S | Medium |
| Vehicle region/city field | 🟡 | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | Region/district exist, but not car-specific profile completeness | Align backend vehicle schema | Adjust labels/data mapping | S | Medium |
| Vehicle free-text description | ✅ | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | None | None | None | S | Medium |
| VIN decode integration | ❌ | repo search; no VIN decode | No VIN decode logic | Add VIN decode integration/API | Add autofill UX | M | Medium |
| Reject duplicate VIN across active listings | ❌ | repo search; no VIN logic | No duplicate active-listing checks | Add backend validation | Show validation error | M | High |
| Minimum 5 photos | ❌ | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | Code requires 4 images | Enforce 5-photo minimum | Update validation/copy | S | Medium |
| Maximum 30 photos | ❌ | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | Code limits to 10 images | Expand upload limits | Update uploader and gallery UX | M | Medium |
| Primary photo flag | ❌ | [src/components/Lots/id/index.jsx](C:/Users/user/auction-front/src/components/Lots/id/index.jsx) | No primary-photo management | Add primary image field | Add reorder/primary picker | M | Medium |
| Title/registration document upload | ❌ | repo search; no vehicle doc upload | Missing upload flow | Add document storage APIs | Add document upload UI | M | High |
| Customs clearance document upload | ❌ | repo search; no vehicle doc upload | Missing upload flow | Add document storage APIs | Add document upload UI | M | Medium |
| Inspection report upload (optional) | ❌ | repo search; no vehicle doc upload | Missing upload flow | Add optional document APIs | Add optional upload UI | M | Medium |
| Moderator verifies vehicle documents before approval | ❌ | [src/pages/Admin/ManageLots.jsx](C:/Users/user/auction-front/src/pages/Admin/ManageLots.jsx) | Approval exists without document review subsystem | Add document review workflow | Add document review/admin queue UI | M | High |
| Public buyer questions on listing | 🟡 | [src/components/Lots/Comments.jsx](C:/Users/user/auction-front/src/components/Lots/Comments.jsx) | Generic comments exist, not clearly question/answer model | Add listing_questions semantics if absent | Separate questions from reviews/comments in UI | M | Medium |
| Seller answers listing questions | 🟡 | [src/components/Lots/Comments.jsx](C:/Users/user/auction-front/src/components/Lots/Comments.jsx) | Seller can reply, but generic comment replies only | Add explicit Q&A answer model | Add question/answer presentation | S | Medium |
| Question moderation before publication | ❌ | [src/components/Lots/Comments.jsx](C:/Users/user/auction-front/src/components/Lots/Comments.jsx) | No moderation state in UI | Add moderation state/API | Add admin queue/status display | M | Medium |
| Listing status DRAFT | ❌ | [src/pages/Admin/ManageLots.jsx](C:/Users/user/auction-front/src/pages/Admin/ManageLots.jsx) | Uses legacy statuses | Add v2 listing statuses | Update badges/filters | M | High |
| Listing status PENDING_REVIEW | ❌ | same | Legacy statuses only | Add v2 listing statuses | Update badges/filters | M | High |
| Listing status APPROVED | 🟡 | [src/queries/lots.jsx](C:/Users/user/auction-front/src/queries/lots.jsx) | Approval exists but not on vehicle listing model | Align vehicle status model | Rename/map statuses in UI | M | High |
| Listing status REJECTED | 🟡 | [src/queries/lots.jsx](C:/Users/user/auction-front/src/queries/lots.jsx) | Declined lots exist but no rejection-reason flow | Add reason storage | Show rejection reasons | M | Medium |
| Listing status PUBLISHED | ❌ | [src/pages/Admin/ManageLots.jsx](C:/Users/user/auction-front/src/pages/Admin/ManageLots.jsx) | No published vehicle status | Add status mapping | Update UI filters/badges | S | Medium |
| Listing status SOLD | ❌ | [src/pages/cabinet/myauctions/Winning.jsx](C:/Users/user/auction-front/src/pages/cabinet/myauctions/Winning.jsx) | No explicit sold listing status | Add sold lifecycle | Add seller history UX | M | Medium |
| Listing status ARCHIVED | ❌ | repo search | No archive status/UI | Add archive support | Add archive pages/filters | M | Low |
| Auction linked to exactly one vehicle | ❌ | [src/queries/lots.jsx](C:/Users/user/auction-front/src/queries/lots.jsx) | Repo uses generic lot entity | Split lot into vehicle + auction models | Refactor UI data model | L | High |
| Auction start price | ✅ | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx), [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | None | None | None | S | High |
| Auction reserve price | ❌ | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | No reserve-price field | Add reserve price support | Add input/help text | S | High |
| Settlement currency USD or UZS | ❌ | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx), [src/components/Lots/id/index.jsx](C:/Users/user/auction-front/src/components/Lots/id/index.jsx) | UI assumes UZS only | Add currency field and calculations | Add currency display/switching | M | High |
| Increment type | ✅ | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | None | None | None | S | High |
| Increment value | ✅ | same | None | None | None | S | High |
| Deposit percentage per auction | ❌ | [src/components/Lots/id/index.jsx](C:/Users/user/auction-front/src/components/Lots/id/index.jsx) | Deposit hardcoded to 1% in UI | Add configurable deposit percent | Display configured percent | S | High |
| Auction start time | ✅ | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | None | None | None | S | High |
| Auction end time | 🟡 | [src/components/Lots/id/index.jsx](C:/Users/user/auction-front/src/components/Lots/id/index.jsx), [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | Display exists, but end-time adjustment logic mismatches spec | Add authoritative end-time management | Align countdown logic | M | High |
| Auction lifecycle DRAFT | ❌ | [src/pages/Admin/ManageLots.jsx](C:/Users/user/auction-front/src/pages/Admin/ManageLots.jsx) | No v2 lifecycle | Add status model | Update tabs/badges/actions | M | High |
| Auction lifecycle PENDING_REVIEW | ❌ | same | No v2 lifecycle | Add status model | Update tabs/badges/actions | M | High |
| Auction lifecycle SCHEDULED | ❌ | same | No scheduled state | Add status model | Update scheduling UX | M | High |
| Auction lifecycle LIVE | 🟡 | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | Uses `ACTIVE`, not explicit v2 lifecycle | Align lifecycle naming | Align badges/routes | S | High |
| Auction lifecycle FINISHED | 🟡 | [src/pages/cabinet/myauctions/Finished.jsx](C:/Users/user/auction-front/src/pages/cabinet/myauctions/Finished.jsx) | Placeholder screen only | Add finished lifecycle handling | Implement finished states archive UX | M | Medium |
| Auction lifecycle CANCELED | 🟡 | [src/pages/cabinet/myauctions/Canceled.jsx](C:/Users/user/auction-front/src/pages/cabinet/myauctions/Canceled.jsx) | Placeholder only | Add cancel flow/audit | Implement cancel views | M | Medium |
| Minimum next bid for FIXED increments | 🟡 | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | Client computes local suggestion only | Enforce server-side rules | Show backend min-bid and validation states | M | High |
| Minimum next bid for PERCENTAGE increments | 🟡 | same | No currency-specific rounding rules | Add rounding/validation backend | Show rounded amount correctly | M | High |
| USD rounding rule to 1 | ❌ | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | No USD handling | Add rounding rules | Add currency-aware formatting | S | Medium |
| UZS rounding rule to 1,000 | ❌ | same | No UZS rounding rule enforcement shown | Add rounding rules | Show rounded amount correctly | S | Medium |
| WebSocket channel per auction | 🟡 | [src/hooks/useStomp.js](C:/Users/user/auction-front/src/hooks/useStomp.js), [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | Auction uses lot topics, not spec naming | Align backend channels/data contracts | Make endpoint/topic config env-driven | M | High |
| Broadcast new bids to all subscribers | ✅ | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | None in client | None | None | S | High |
| Broadcast current price to all subscribers | ✅ | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | None in client | None | None | S | High |
| Broadcast countdown to all subscribers | 🟡 | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | Client derives countdown locally, not from server | Add server-driven countdown/end-time updates | Consume authoritative countdown data | M | High |
| Polling fallback for degraded connections | ❌ | [src/hooks/useStomp.js](C:/Users/user/auction-front/src/hooks/useStomp.js) | No fallback mechanism | Add fallback endpoints/strategy | Add reconnect + polling fallback | M | Medium |
| Anti-sniping extension within last N minutes | ❌ | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | Local timer reset is not anti-sniping implementation | Add anti-sniping logic and fields | Show extension updates/original end time | M | High |
| Anti-sniping default N=2 | ❌ | same | No config use | Add config | Display config if needed | S | Medium |
| Anti-sniping extends by M minutes | ❌ | same | No extension logic | Add extension logic | Reflect updated end time | M | High |
| Anti-sniping default M=2 | ❌ | same | No config use | Add config | None/minor | S | Medium |
| Anti-sniping max extensions cap | ❌ | same | No cap logic | Add cap logic | Show cap/extension count if needed | M | Medium |
| Preserve original_end_time | ❌ | same | No original end-time display or field usage | Add field support | Display original vs extended end time | S | Low |
| Auto-bid maximum amount input | ❌ | repo search; no auto-bid | No UI | Add auto-bid model/APIs | Add auto-bid controls | M | High |
| Auto-bid outbids competitors by minimum increment | ❌ | repo search; no auto-bid | No UI | Add proxy bidding engine | Add bid history labeling | L | High |
| Auto-bid tie resolved by earlier auto-bid | ❌ | repo search; no auto-bid | No UI | Add engine tie rules | Optional UX messaging | M | Medium |
| Deposit required before first bid | ✅ | [src/components/Lots/id/index.jsx](C:/Users/user/auction-front/src/components/Lots/id/index.jsx) | None for basic gating | None | None | S | High |
| Deposit amount = deposit % × start price | 🟡 | [src/components/Lots/id/index.jsx](C:/Users/user/auction-front/src/components/Lots/id/index.jsx) | Uses hardcoded 1% | Add configurable percentage | Read and display auction percentage | S | High |
| Default deposit 1% | 🟡 | same | Hardcoded rather than configurable default | Add default config backend | Read config from API | S | Medium |
| Deposit blocked during auction | ❓ | frontend only shows deposit action | No status lifecycle evidence in repo | Add blocked/applied/refund lifecycle | Show status/balance states | M | Medium |
| Automatic refund to losing bidders | ❌ | [src/pages/cabinet/Transactions.jsx](C:/Users/user/auction-front/src/pages/cabinet/Transactions.jsx) | No auction-linked refund flow | Add refund jobs/ledger | Show refund statuses | M | High |
| Apply winner deposit to final payment | ❌ | same | No final-payment flow | Add settlement logic | Show applied deposit breakdown | M | High |
| Forfeit winner deposit after payment-window default | ❌ | same | No payment-window/default logic | Add default rules | Show default/forfeit statuses | M | High |
| Payment window default 3 business days | ❌ | repo search | No timing/default flow | Add payment window config | Show countdown/status | M | Medium |
| Bid retraction disallowed for bidders | ✅ | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | No user retract UI | Backend should still enforce | None | S | Medium |
| Moderator may void bid with reason | ❌ | [src/pages/Admin/ManageBids.jsx](C:/Users/user/auction-front/src/pages/Admin/ManageBids.jsx) | Bids view only; no void action or reason entry | Add void-bid API/audit | Add admin action modal | M | High |
| Recalculate current price after voided bid | ❌ | same | No such flow | Add recalculation logic | Refresh live UI after void | M | High |
| Bids serialized per auction | ❓ | frontend cannot prove | No backend evidence | Add serialization/locking | No major frontend change | M | High |
| Server-side timestamps authoritative | ❓ | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | Uses `bidTime` from backend, but repo cannot prove authority | Ensure server timestamps | Minor UI label/copy only | S | Medium |
| Reject bids below minimum next bid | 🟡 | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | UI suggests minimum, but enforcement only inferred from API responses | Enforce validation | Show exact error state | S | High |
| Highest bid wins if reserve met | ❌ | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | No reserve-price concept | Add reserve-price close logic | Show reserve-met state | M | High |
| No winner if reserve not met | ❌ | same | No reserve handling | Add reserve-not-met logic | Show no-winner outcome | M | Medium |
| Notify winner at auction completion | 🟡 | [src/pages/cabinet/NotificationsModal.jsx](C:/Users/user/auction-front/src/pages/cabinet/NotificationsModal.jsx) | Notification system exists but no winner-specific frontend evidence | Emit winner events | Add winner event presentation | S | Medium |
| Notify seller at auction completion | 🟡 | same | Same gap | Emit seller completion events | Add seller event presentation | S | Medium |
| Seller may relist if reserve not met | ❌ | [src/pages/cabinet/Mylots.jsx](C:/Users/user/auction-front/src/pages/cabinet/Mylots.jsx) | No one-click relist flow | Add relist API | Add relist action | S | Medium |
| UI shows indicative cross-currency equivalent | ❌ | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | UZS-only display | Add exchange-rate API usage | Add indicative equivalent UI | M | High |
| Payme integration | 🟡 | [src/pages/cabinet/UserDashboard.jsx](C:/Users/user/auction-front/src/pages/cabinet/UserDashboard.jsx) | Only outbound link to Payme | Add actual gateway integration | Add payment session/status UX | M | High |
| Click integration | ❌ | repo search | No Click code | Add gateway integration | Add payment option UI | M | Medium |
| Uzum Bank integration | ❌ | repo search | No Uzum code | Add gateway integration | Add payment option UI | M | Medium |
| Visa/Mastercard USD acquiring | ❌ | repo search | No card acquiring code | Add international acquiring | Add card payment UI | M | Medium |
| Bank transfer with invoice for legal entities | ❌ | repo search | No bank transfer/invoice flow | Add invoice/bank-transfer backend | Add legal-entity payment UX | M | High |
| Payment type DEPOSIT | 🟡 | [src/pages/cabinet/Transactions.jsx](C:/Users/user/auction-front/src/pages/cabinet/Transactions.jsx) | Uses transaction types, not full payment model | Align payment types | Update labels/mapping | S | Medium |
| Payment type FINAL_PAYMENT | ❌ | same | No final-payment type in UI | Add payment model | Add final-payment display | S | Medium |
| Payment type FEE | ❌ | same | No fee type in UI | Add fee model | Add fee display | S | Medium |
| Payment type REFUND | 🟡 | [src/pages/cabinet/Transactions.jsx](C:/Users/user/auction-front/src/pages/cabinet/Transactions.jsx) | Refund exists as transaction label only | Align payment model | Update labels/mapping | S | Medium |
| Payment status PENDING | ❌ | [src/pages/cabinet/Transactions.jsx](C:/Users/user/auction-front/src/pages/cabinet/Transactions.jsx) | No payment status display | Add status model | Add status badges | S | Medium |
| Payment status SUCCESS | ❌ | same | No payment status display | Add status model | Add status badges | S | Medium |
| Payment status FAILED | ❌ | same | No payment status display | Add status model | Add status badges | S | Medium |
| Payment status REFUNDED | ❌ | same | No payment status display | Add status model | Add status badges | S | Medium |
| Payment status CANCELED | ❌ | same | No payment status display | Add status model | Add status badges | S | Medium |
| Idempotent gateway callbacks | ❓ | no backend code | Cannot prove | Add idempotency keys/callback protection | No major frontend changes | M | Medium |
| Every transaction stored in ledger | ❓ | [src/queries/transaction.jsx](C:/Users/user/auction-front/src/queries/transaction.jsx) | Transaction list exists but ledger guarantees not provable | Add ledger model | Optional ledger views | M | Medium |
| Configurable commission | ❌ | repo search | No commission UI | Add commission config | Add admin and settlement displays | M | Medium |
| Dealer commission tiers | ❌ | repo search | No dealer tier UI | Add dealer tier model | Add tier displays/admin tools | M | Medium |
| Record commissions as FEE transactions | ❌ | [src/pages/cabinet/Transactions.jsx](C:/Users/user/auction-front/src/pages/cabinet/Transactions.jsx) | No fee transaction type | Add fee transaction flow | Show fees in history | S | Medium |
| Generate invoices for legal entities | ❌ | repo search | No invoice code | Add invoice generation/storage | Add invoice pages/downloads | M | High |
| Fiscal receipts | ❌ | repo search | No fiscalization code | Add fiscal receipt integration | Add receipt visibility | M | Medium |
| Monthly statements in seller cabinet | ❌ | [src/pages/cabinet/Transactions.jsx](C:/Users/user/auction-front/src/pages/cabinet/Transactions.jsx) | No statement screens | Add statement generation | Add statements page/download UX | M | Medium |
| Auto-generated sale contract | ❌ | repo search | No contract code | Add contract templating/generation | Add contract review/download UI | M | High |
| Electronic signature for contract | ❌ | repo search | No signing flow | Add e-sign support | Add sign flow | L | Medium |
| Upload signed contract scan | ❌ | repo search | No upload flow | Add contract file upload | Add contract upload UI | M | Medium |
| Deal status CONTRACT_SIGNED | ❌ | repo search | No deal status flow | Add deal status model | Add post-sale status UI | M | High |
| Deal status PAID | ❌ | repo search | No deal status flow | Add deal status model | Add post-sale status UI | M | High |
| Deal status HANDED_OVER | ❌ | repo search | No deal status flow | Add deal status model | Add handover confirmation UI | M | Medium |
| Deal status CLOSED | ❌ | repo search | No deal status flow | Add deal status model | Add close status UI | M | Medium |
| Buyer handover confirmation | ❌ | repo search | No handover UI | Add confirmation API | Add buyer confirmation screen | M | Medium |
| Seller handover confirmation | ❌ | repo search | No handover UI | Add confirmation API | Add seller confirmation screen | M | Medium |
| Dispute opening within X days | ❌ | repo search | No dispute flow | Add dispute model/rules | Add dispute form/status UI | M | High |
| Dispute status OPEN | ❌ | repo search | No dispute flow | Add dispute statuses | Add status UI | S | Medium |
| Dispute status IN_REVIEW | ❌ | repo search | No dispute flow | Add dispute statuses | Add status UI | S | Medium |
| Dispute status RESOLVED_REFUND | ❌ | repo search | No dispute flow | Add dispute statuses | Add status UI | S | Medium |
| Dispute status RESOLVED_PARTIAL | ❌ | repo search | No dispute flow | Add dispute statuses | Add status UI | S | Medium |
| Dispute status REJECTED | ❌ | repo search | No dispute flow | Add dispute statuses | Add status UI | S | Medium |
| Moderator-handled disputes | ❌ | [src/pages/Admin/Admin.jsx](C:/Users/user/auction-front/src/pages/Admin/Admin.jsx) | No dispute admin queue | Add moderator dispute workflows | Add dispute admin pages | M | High |
| Winner default triggers deposit forfeiture | ❌ | repo search | No winner-default logic | Add default handling | Add default notifications/status | M | High |
| Second-chance offer to next highest bidder | ❌ | repo search | No second-chance flow | Add offer generation/acceptance logic | Add offer UX | M | Medium |
| Second-chance validity 48 hours | ❌ | repo search | No timed offer flow | Add expiry logic | Add countdown/status UI | M | Low |
| One-click relist after default | ❌ | [src/pages/cabinet/Mylots.jsx](C:/Users/user/auction-front/src/pages/cabinet/Mylots.jsx) | No relist action | Add relist support | Add relist CTA | S | Medium |
| Buyer rates seller after closed deal | ❌ | [src/components/Lots/Comments.jsx](C:/Users/user/auction-front/src/components/Lots/Comments.jsx) | Generic comments are not deal reviews | Add review model/rules | Add post-deal rating form | M | Medium |
| Seller rates buyer after closed deal | ❌ | same | Same | Add review model/rules | Add post-deal rating form | M | Medium |
| 1–5 rating value | ❌ | same | No star-rating flow | Add numeric review support | Add star selector | S | Medium |
| Review comment | 🟡 | [src/components/Lots/Comments.jsx](C:/Users/user/auction-front/src/components/Lots/Comments.jsx) | Comments exist but not tied to deal reviews | Add review entity | Add review-specific UI | M | Medium |
| Public aggregate rating on profile | ❌ | [src/pages/cabinet/Profile.jsx](C:/Users/user/auction-front/src/pages/cabinet/Profile.jsx) | No rating display | Add aggregate fields/API | Add public profile/rating UI | M | Medium |
| Completed deals count on public profile | ❌ | same | No public profile/deals count | Add aggregate fields/API | Add public profile UI | M | Low |
| Shill-bidding detection | ❌ | repo search | No anti-fraud code | Add risk engine | Optional admin visualization | L | Medium |
| Risk flags for seller-linked accounts | ❌ | repo search | No anti-fraud code | Add device/IP/payment correlation | Add moderator flag UI | L | Medium |
| Risk flags for circular bidding | ❌ | repo search | No anti-fraud code | Add pattern detection | Add moderator flag UI | L | Medium |
| Risk flags for systematic bid-and-default | ❌ | repo search | No anti-fraud code | Add pattern detection | Add moderator flag UI | L | Medium |
| Moderator risk queue | ❌ | [src/pages/Admin/Admin.jsx](C:/Users/user/auction-front/src/pages/Admin/Admin.jsx) | No risk-flag screen | Add risk queue APIs | Add admin page | M | Medium |
| Blacklist by ID document number | ❌ | repo search | No blacklist code | Add blacklist model | Add admin UI | M | Medium |
| Blacklist by phone | ❌ | repo search | No blacklist code | Add blacklist model | Add admin UI | M | Medium |
| Blacklist by tax ID | ❌ | repo search | No blacklist code | Add blacklist model | Add admin UI | M | Medium |
| Velocity limits on registrations | ❓ | no backend code | Cannot prove | Add rate-limit rules | Optional error UX | S | Medium |
| Velocity limits on bids | ❓ | no backend code | Cannot prove | Add rate-limit rules | Optional error UX | S | Medium |
| Velocity limits on listings | ❓ | no backend code | Cannot prove | Add rate-limit rules | Optional error UX | S | Low |
| Step-up verification for high-value auctions | ❌ | repo search | No step-up flow | Add risk/verification rules | Add extra verification UX | M | Low |
| Audit log for anti-fraud decisions | ❌ | repo search | No audit log | Add audit logging | Add viewer if needed | M | Low |
| Search filter by make | ❌ | [src/queries/search.jsx](C:/Users/user/auction-front/src/queries/search.jsx), [src/pages/Auctions.jsx](C:/Users/user/auction-front/src/pages/Auctions.jsx) | Search is keyword-based, not vehicle-specific filters | Add filtered search API | Add make filter UI | M | High |
| Search filter by model | ❌ | same | No model filter | Add filtered search API | Add model filter UI | M | High |
| Search filter by year range | ❌ | same | No year filter | Add filtered search API | Add year-range UI | S | Medium |
| Search filter by price range | ❌ | same | No price-range filter | Add filtered search API | Add price-range UI | S | Medium |
| Search filter by mileage range | ❌ | same | No mileage filter | Add filtered search API | Add mileage-range UI | S | Medium |
| Search filter by fuel type | ❌ | same | No fuel-type filter | Add filtered search API | Add fuel selector | S | Medium |
| Search filter by transmission | ❌ | same | No transmission filter | Add filtered search API | Add transmission selector | S | Medium |
| Search filter by body type | ❌ | same | No body-type filter | Add filtered search API | Add body-type selector | S | Medium |
| Search filter by condition | ❌ | same | No condition filter | Add filtered search API | Add condition selector | S | Medium |
| Search filter by region | 🟡 | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | Region exists in creation, but search filters not evidenced | Add region filter support | Add region filter UI | S | Medium |
| Search filter by currency | ❌ | same | No currency filter | Add currency-aware search | Add currency filter UI | S | Low |
| Sort by price | ❌ | [src/pages/Auctions.jsx](C:/Users/user/auction-front/src/pages/Auctions.jsx) | No explicit sort evidence found | Add sort params | Add sort controls | S | Medium |
| Sort by end time | ❌ | same | No explicit sort evidence found | Add sort params | Add sort controls | S | Medium |
| Sort by newest | ❌ | same | No explicit sort evidence found | Add sort params | Add sort controls | S | Medium |
| Full-text search over title | 🟡 | [src/queries/search.jsx](C:/Users/user/auction-front/src/queries/search.jsx) | Keyword search exists, exact fields unknown | Ensure title indexing | Improve search UX | S | Medium |
| Full-text search over description | ❓ | [src/queries/search.jsx](C:/Users/user/auction-front/src/queries/search.jsx) | Search endpoint exists, field coverage not provable | Ensure description indexing | None/minor | S | Low |
| Favorites/watchlist follow specific auctions | 🟡 | [src/queries/lots.jsx](C:/Users/user/auction-front/src/queries/lots.jsx), [src/pages/cabinet/Likes.jsx](C:/Users/user/auction-front/src/pages/cabinet/Likes.jsx) | Likes exist but terminology/semantics are generic | Align favorites model | Rename UX and add watchlist semantics | S | Medium |
| Outbid alerts for favorites | ❌ | [src/pages/cabinet/NotificationsModal.jsx](C:/Users/user/auction-front/src/pages/cabinet/NotificationsModal.jsx) | Notification system exists but no outbid-specific evidence | Emit outbid events | Add alert copy/preferences | S | Medium |
| Ending-soon alerts for favorites | ❌ | same | No ending-soon evidence | Emit scheduled alerts | Add alert copy/preferences | S | Low |
| Saved filter sets | ❌ | [src/queries/search.jsx](C:/Users/user/auction-front/src/queries/search.jsx) | Only history/notify by search key | Add saved_searches model/API | Add saved-search management UI | M | Medium |
| Notifications for new matching listings | 🟡 | [src/queries/search.jsx](C:/Users/user/auction-front/src/queries/search.jsx) | `setNotify` exists but saved-search feature is incomplete | Add matching-listing notification logic | Add saved-search alert UI | M | Medium |
| Mobile push notifications (FCM) | ✅ | [src/firebase.js](C:/Users/user/auction-front/src/firebase.js), [public/firebase-messaging-sw.js](C:/Users/user/auction-front/public/firebase-messaging-sw.js) | Browser/web push only, but FCM exists | None for base capability | Improve permission/error UX | S | High |
| Telegram notifications channel | ❌ | repo search | No Telegram code | Add Telegram notifier | Add settings/binding UI | M | Medium |
| E-mail notifications channel | ❌ | repo search | No email-notification UI/evidence | Add mail event delivery | Add preferences UI if needed | M | Medium |
| SMS notifications channel | ❌ | repo search | No SMS-notification evidence | Add SMS event delivery | Add preferences UI if needed | M | Low |
| Outbid event notifications | ❌ | [src/pages/cabinet/NotificationsModal.jsx](C:/Users/user/auction-front/src/pages/cabinet/NotificationsModal.jsx) | Generic notifications only | Add event emission | Add event-specific text/links | S | Medium |
| Auction starting-soon notifications | ❌ | same | No event evidence | Add scheduler/events | Add event-specific text/links | S | Low |
| Auction ending-soon notifications | ❌ | same | No event evidence | Add scheduler/events | Add event-specific text/links | S | Low |
| Auction won notifications | ❌ | same | No event evidence | Add winner events | Add event-specific text/links | S | Medium |
| Auction lost notifications | ❌ | same | No event evidence | Add loser events | Add event-specific text/links | S | Low |
| Payment status notifications | ❌ | same | No event evidence | Add payment events | Add payment notification UX | S | Medium |
| KYC result notifications | ❌ | same | No KYC system | Add KYC events | Add KYC result UX | S | Medium |
| Moderation result notifications | ❌ | same | No specific moderation events | Add moderation events | Add moderation notification UX | S | Medium |
| Post-sale step notifications | ❌ | same | No post-sale system | Add deal events | Add post-sale notification UX | M | Medium |
| New listing notifications for saved searches | 🟡 | [src/queries/search.jsx](C:/Users/user/auction-front/src/queries/search.jsx) | `setNotify` suggests support but no full feature | Add matching alert backend | Add saved-search UI | M | Medium |
| SEO-first public website | 🟡 | [next.config.ts](C:/Users/user/auction-front/next.config.ts), [src/app/layout.tsx](C:/Users/user/auction-front/src/app/layout.tsx) | Next.js app exists but large parts still CSR/legacy | Keep SSR-compatible API/data flows | Refactor pages to app-router SSR where needed | L | High |
| Indexable listing pages | 🟡 | [src/app/(page)/lots/[id]/page.tsx](C:/Users/user/auction-front/src/app/(page)/lots/[id]/page.tsx), [src/components/Lots/id/index.jsx](C:/Users/user/auction-front/src/components/Lots/id/index.jsx) | Page exists, but dynamic metadata/structured SEO absent | Add SEO data endpoints if needed | Add generateMetadata/SSR data | M | High |
| Indexable auction pages | 🟡 | [src/app/(page)/lots/bidding/[id]/page.tsx](C:/Users/user/auction-front/src/app/(page)/lots/bidding/[id]/page.tsx) | Page exists, but SEO treatment absent | Add data endpoints if needed | Add page metadata/SSR strategy | M | Medium |
| `sitemap.xml` | ❌ | repo search; no sitemap file | Missing file/route | Add sitemap generation if dynamic | Add Next sitemap route | S | High |
| `schema.org` Vehicle structured data | ❌ | repo search | No structured data | Provide structured auction/vehicle fields | Inject JSON-LD | S | Medium |
| `schema.org` Offer structured data | ❌ | repo search | No structured data | Provide structured auction fields | Inject JSON-LD | S | Medium |
| Open Graph tags | 🟡 | [src/app/layout.tsx](C:/Users/user/auction-front/src/app/layout.tsx) | Basic metadata only; no OG per listing | Add per-page metadata inputs | Add OG metadata generation | S | Medium |
| UZ language version | ✅ | [src/locales/uz.jsx](C:/Users/user/auction-front/src/locales/uz.jsx), [src/locales/uz/translation.json](C:/Users/user/auction-front/src/locales/uz/translation.json) | None | None | None | S | High |
| RU language version | ✅ | [src/locales/ru.jsx](C:/Users/user/auction-front/src/locales/ru.jsx), [src/locales/ru/translation.json](C:/Users/user/auction-front/src/locales/ru/translation.json) | None | None | None | S | High |
| EN language version | ✅ | [src/locales/en.jsx](C:/Users/user/auction-front/src/locales/en.jsx), [src/locales/en/translation.json](C:/Users/user/auction-front/src/locales/en/translation.json) | None | None | None | S | High |
| `hreflang` support | ❌ | [src/app/layout.tsx](C:/Users/user/auction-front/src/app/layout.tsx) | No hreflang metadata | None/minor backend | Add locale routing + hreflang metadata | M | Medium |
| Buyer search and filters on public site | 🟡 | [src/pages/Auctions.jsx](C:/Users/user/auction-front/src/pages/Auctions.jsx), [src/queries/search.jsx](C:/Users/user/auction-front/src/queries/search.jsx) | Search exists, filters incomplete | Add vehicle filter APIs | Add full filter panel | M | High |
| Auction card with photo gallery | ✅ | [src/components/Lots/id/index.jsx](C:/Users/user/auction-front/src/components/Lots/id/index.jsx) | None | None | None | S | High |
| Live bidding widget | ✅ | [src/pages/Bid/Bidding.jsx](C:/Users/user/auction-front/src/pages/Bid/Bidding.jsx) | None for base widget | None | None | S | High |
| Buyer deposits on public site | ✅ | [src/components/Lots/id/index.jsx](C:/Users/user/auction-front/src/components/Lots/id/index.jsx) | None for base flow | None | None | S | High |
| Buyer payments on public site | 🟡 | [src/pages/cabinet/UserDashboard.jsx](C:/Users/user/auction-front/src/pages/cabinet/UserDashboard.jsx) | Wallet top-up only, no checkout/final payment flow | Add payment/checkout APIs | Add payment screens | M | High |
| Profile and KYC on public site | 🟡 | [src/pages/cabinet/Profile.jsx](C:/Users/user/auction-front/src/pages/cabinet/Profile.jsx) | Profile exists, KYC missing | Add KYC APIs | Add KYC screens | M | High |
| Seller listing creation wizard | 🟡 | [src/components/Lots/create/Createlot.jsx](C:/Users/user/auction-front/src/components/Lots/create/Createlot.jsx) | Wizard exists for generic lots, not vehicle-specific flow | Add vehicle/auction APIs | Refactor to car-specific multi-step wizard | L | High |
| Seller auction tracking | 🟡 | [src/pages/cabinet/MyAuctions.jsx](C:/Users/user/auction-front/src/pages/cabinet/MyAuctions.jsx) | Basic auction views exist | Add richer auction/deal status APIs | Expand status/action views | M | Medium |
| Seller deals view | ❌ | repo search | No deal management screens | Add deal APIs | Add deals page | M | Medium |
| Seller sales history | ❌ | [src/pages/cabinet/MyAuctions.jsx](C:/Users/user/auction-front/src/pages/cabinet/MyAuctions.jsx) | No dedicated sales history | Add history APIs | Add history UI | M | Low |
| Seller invoices view | ❌ | repo search | No invoice page | Add invoice APIs | Add invoice UI | M | Medium |
| Seller statements view | ❌ | repo search | No statement page | Add statement APIs | Add statements UI | M | Low |
| Public finished-auction archive | ❌ | repo search | No archive page | Add archive endpoints | Add archive pages | M | Medium |
| Public sale price history | ❌ | repo search | No price-history page | Add sale-history endpoints | Add public history UI | M | Medium |
| Telegram account binding by deep-link code | ❌ | repo search | No Telegram code | Add binding flow | Add bind/manage UI | M | Medium |
| Telegram browse active auctions | ❌ | repo search | No Telegram code | Add bot browse APIs | N/A in web except settings/docs | M | Low |
| Telegram auction card with photos/current price | ❌ | repo search | No Telegram code | Add bot formatting APIs | N/A in web except settings/docs | M | Low |
| Telegram receive all notification events | ❌ | repo search | No Telegram code | Add Telegram notifier | Add notification settings UI | M | Medium |
| Telegram quick bid placement with confirmation | ❌ | repo search | No Telegram code | Add bot bid APIs | N/A in web except docs/settings | L | Low |
| Single Flutter codebase for iOS/Android | ❌ | repo search | No mobile code in repo | Separate mobile codebase/service contract | None in web repo directly | L | Low |
| Mobile search flow support | ❓ | [src/api/api.js](C:/Users/user/auction-front/src/api/api.js) | Shared API may support it, but repo cannot prove | Ensure API parity | None in this repo | M | Low |
| Mobile live bidding support | ❓ | same | Repo cannot prove mobile support | Ensure API/WebSocket parity | None in this repo | M | Low |
| Mobile deposits/payments support | ❓ | same | Repo cannot prove mobile support | Ensure API parity | None in this repo | M | Low |
| Mobile seller listing creation | ❓ | same | Repo cannot prove mobile support | Ensure API parity | None in this repo | M | Low |
| Mobile document upload | ❓ | same | Repo cannot prove mobile support | Ensure API parity | None in this repo | M | Low |
| Mobile auction status tracking | ❓ | same | Repo cannot prove mobile support | Ensure API parity | None in this repo | M | Low |
| Mobile post-sale steps | ❌ | repo search | No post-sale backend evidence | Add deal APIs | None in this repo | M | Low |
| Mobile profile/KYC upload | ❌ | repo search | KYC backend missing | Add KYC APIs | None in this repo | M | Low |
| Mobile push notifications | ❓ | [src/firebase.js](C:/Users/user/auction-front/src/firebase.js) | Web FCM exists, mobile app not in repo | Add cross-client notification backend | None in this repo | M | Low |
| Mobile UZ/RU/EN localization | ❓ | [src/locales](C:/Users/user/auction-front/src/locales) | Web locales exist; mobile app not in repo | Ensure API locale support | None in this repo | S | Low |
| DEALER role assigned by admin | ❌ | [src/components/UsersTable.jsx](C:/Users/user/auction-front/src/components/UsersTable.jsx) | Only buyer/seller/admin patterns visible | Add dealer role support | Add dealer assignment UI | M | Medium |
| Dealer enhanced verification | ❌ | repo search | No dealer verification | Add dealer verification workflow | Add dealer review UI | M | Medium |
| Dealer bulk listing CSV import | ❌ | repo search | No import code | Add CSV import APIs | Add import UI | M | Medium |
| Dealer bulk listing XLSX import | ❌ | repo search | No import code | Add XLSX import APIs | Add import UI | M | Medium |
| Dealer batch auction scheduling | ❌ | repo search | No batch tools | Add batch scheduling APIs | Add bulk scheduling UX | M | Medium |
| Dealer REST API keys | ❌ | repo search | No API key UI | Add API key issuance/rotation | Add dealer API settings page | M | Medium |
| Dealer API create listings | ❌ | repo search | No dealer API docs/tools | Add endpoints | Add docs/settings pages | M | Low |
| Dealer API read auction status and bids | ❌ | repo search | No dealer API docs/tools | Add endpoints | Add docs/settings pages | M | Low |
| OpenAPI documentation for dealer API | ❌ | repo search | No OpenAPI files | Add OpenAPI generation | Link docs from admin/dealer UI | M | Medium |
| Dealer monthly consolidated invoicing | ❌ | repo search | No dealer billing | Add invoicing logic | Add invoice pages | M | Low |
| Admin KYC moderation queue | ❌ | [src/pages/Admin/Admin.jsx](C:/Users/user/auction-front/src/pages/Admin/Admin.jsx) | No KYC queue | Add KYC review APIs | Add queue page | M | High |
| Admin vehicle listing moderation queue | 🟡 | [src/pages/Admin/ManageLots.jsx](C:/Users/user/auction-front/src/pages/Admin/ManageLots.jsx) | Generic lot moderation exists | Align to vehicle listing model | Refactor queue screens | M | High |
| Admin vehicle document moderation queue | ❌ | same | No vehicle document queue | Add doc review APIs | Add queue page | M | High |
| Admin listing Q&A moderation queue | ❌ | [src/components/Lots/Comments.jsx](C:/Users/user/auction-front/src/components/Lots/Comments.jsx) | No moderation queue | Add moderation statuses | Add queue page | M | Medium |
| Admin auctions moderation queue | 🟡 | [src/pages/Admin/ManageLots.jsx](C:/Users/user/auction-front/src/pages/Admin/ManageLots.jsx) | Generic lot approval exists | Align to auction queue | Adjust admin screens | M | Medium |
| Admin disputes queue | ❌ | [src/pages/Admin/Admin.jsx](C:/Users/user/auction-front/src/pages/Admin/Admin.jsx) | No disputes admin page | Add dispute APIs | Add page | M | Medium |
| Admin risk flags queue | ❌ | same | No risk admin page | Add risk APIs | Add page | M | Medium |
| Admin manage makes/models | ❌ | [src/pages/Admin/lot-types/ManageLotTypes.jsx](C:/Users/user/auction-front/src/pages/Admin/lot-types/ManageLotTypes.jsx) | Lot types/subtypes/attributes are legacy | Add make/model APIs | Replace lot-type admin pages | L | High |
| Admin manage commission percent | ❌ | repo search | No commission config | Add settings API | Add settings UI | S | Medium |
| Admin manage dealer tiers | ❌ | repo search | No dealer tier config | Add settings API | Add settings UI | S | Medium |
| Admin manage default deposit percent | ❌ | repo search | No config UI | Add settings API | Add settings UI | S | Medium |
| Admin manage anti-sniping parameters | ❌ | repo search | No config UI | Add settings API | Add settings UI | S | Medium |
| Admin manage exchange rates | ❌ | repo search | No exchange-rate UI | Add rates API | Add admin page | M | Medium |
| Admin manage contract templates | ❌ | repo search | No template UI | Add contract template API | Add admin page | M | Low |
| Admin manage ToS versions | ❌ | repo search | No agreement-version UI | Add agreement version API | Add admin page | M | Low |
| Admin user search | ✅ | [src/pages/Admin/Users.jsx](C:/Users/user/auction-front/src/pages/Admin/Users.jsx), [src/components/UsersTable.jsx](C:/Users/user/auction-front/src/components/UsersTable.jsx) | None for basic listing/search table | None/minor | Minor table improvements | S | Medium |
| Admin block/unblock user | 🟡 | [src/queries/users.jsx](C:/Users/user/auction-front/src/queries/users.jsx) | Block exists; unblock not found | Add unblock if absent | Add unblock button/status | S | Medium |
| Admin blacklist management | ❌ | repo search | No blacklist UI | Add blacklist APIs | Add admin page | M | Medium |
| Admin role assignment incl. DEALER | ❌ | [src/components/UsersTable.jsx](C:/Users/user/auction-front/src/components/UsersTable.jsx) | No dealer role in UI | Add dealer role support | Add dealer role assignment | S | Medium |
| Admin KYC review action | ❌ | repo search | No KYC admin screens | Add KYC review APIs | Add review modals | M | High |
| Admin cancel auction | ❌ | [src/pages/Admin/ManageLots.jsx](C:/Users/user/auction-front/src/pages/Admin/ManageLots.jsx) | Delete exists, not cancel auction | Add cancel endpoint/audit | Add cancel action | M | Medium |
| Admin force-finish auction | ❌ | same | No force-finish action | Add endpoint/audit | Add action/modal | M | Medium |
| Admin void bids | ❌ | [src/pages/Admin/ManageBids.jsx](C:/Users/user/auction-front/src/pages/Admin/ManageBids.jsx) | View-only page | Add void endpoint/audit | Add action/modal | M | Medium |
| Admin adjust end time | ❌ | [src/pages/Admin/ManageLots.jsx](C:/Users/user/auction-front/src/pages/Admin/ManageLots.jsx) | No end-time adjustment UI | Add endpoint/audit | Add action/modal | M | Low |
| Audit trail on admin auction actions | ❌ | repo search | No audit viewer/logging evidence | Add audit logging | Add viewer/audit references | M | Medium |
| Financial reports for deposits | ❌ | [src/pages/Admin/PaymentHistory.jsx](C:/Users/user/auction-front/src/pages/Admin/PaymentHistory.jsx) | Generic transaction table only | Add deposit reporting APIs | Add report filters/exports | M | Medium |
| Financial reports for payments | 🟡 | [src/pages/Admin/PaymentHistory.jsx](C:/Users/user/auction-front/src/pages/Admin/PaymentHistory.jsx) | Only basic table | Add richer reporting APIs | Add filters/exports/statuses | M | Medium |
| Financial reports for commissions | ❌ | same | No commission dimension | Add commission reporting | Add commission report UI | M | Medium |
| Financial reports for refunds | ❌ | same | No refund-specific reporting UI | Add refund reporting | Add refund report UI | M | Medium |
| Financial reports for invoices | ❌ | same | No invoice reporting | Add invoice reporting | Add invoice report UI | M | Low |
| Export reports to XLSX | ❌ | repo search | No export code | Add export endpoints or data serializers | Add export button | M | Low |
| Export reports to CSV | ❌ | repo search | No export code | Add export endpoints or data serializers | Add export button | S | Low |
| Audit log viewer | ❌ | repo search | No audit UI | Add audit-log APIs | Add viewer page | M | Medium |
| React/Next.js SSR public web stack | 🟡 | [package.json](C:/Users/user/auction-front/package.json), [next.config.ts](C:/Users/user/auction-front/next.config.ts), [src/app](C:/Users/user/auction-front/src/app) | Mixed legacy router and Next app; not fully SSR-driven | Align API/data for SSR | Consolidate app router pages | L | High |
| Web admin panel in React | ✅ | [src/pages/Admin/Admin.jsx](C:/Users/user/auction-front/src/pages/Admin/Admin.jsx) | None | None | None | S | Medium |
| S3-compatible object storage for media | ❓ | repo has no backend storage code | Cannot prove | Add media storage implementation | Minor upload response handling | M | Medium |
| Support 1,000 concurrent users per live auction | ❓ | repo has no load/perf evidence | Cannot prove | Add scalable infra/backend | No direct frontend change | L | Medium |
| Bid latency under 500ms | ❓ | no performance instrumentation | Cannot prove | Optimize backend/WebSocket infra | Optional optimistic UI/metrics | L | Medium |
| Search response under 1s | ❓ | no performance instrumentation | Cannot prove | Optimize search backend | Optional loading UX | M | Low |
| Stateless API behind load balancer | ❓ | no backend repo | Cannot prove | Add deployment architecture | None in frontend | L | Low |
| WebSocket fan-out via Redis pub/sub | ❓ | no backend repo | Cannot prove | Add Redis fan-out | None in frontend | L | Low |
| Horizontal scaling of read paths | ❓ | no backend repo | Cannot prove | Add architecture support | None in frontend | L | Low |
| CDN delivery of images | ❓ | image URLs may be remote, but not provable as CDN pipeline | No explicit CDN/media pipeline code | Add CDN/media delivery | Ensure responsive image use | M | Low |
| Automatic thumbnails | ❌ | [src/components/Lots/id/index.jsx](C:/Users/user/auction-front/src/components/Lots/id/index.jsx) | No media pipeline evidence | Add thumbnail generation | Use thumbnail URLs in lists | M | Low |
| WebP conversion | ❌ | repo search | No pipeline evidence | Add conversion | Consume optimized assets | M | Low |
| EXIF stripping | ❌ | repo search | No pipeline evidence | Add media sanitation | None | S | Low |
| Optional watermarking | ❌ | repo search | No pipeline evidence | Add watermarking | Toggle/presentation if needed | M | Low |
| OWASP ASVS baseline | ❓ | no security validation artifacts | Cannot prove | Add security controls/review | Minor frontend hardening | L | Medium |
| Passwords hashed with bcrypt/argon2 | ❓ | no backend auth code | Cannot prove | Add secure hashing | None | S | High |
| TLS for all traffic | ❓ | [src/api/api.js](C:/Users/user/auction-front/src/api/api.js) | API base URL is HTTPS, but ws hook uses localhost HTTP | Ensure HTTPS/WSS everywhere | Use env-based HTTPS/WSS config | S | Medium |
| Rate limiting | ❓ | no backend code | Cannot prove | Add rate limiting | Handle 429 UI | S | Medium |
| Personal data processed per legislation | ❓ | [src/pages/auth/Privacy.jsx](C:/Users/user/auction-front/src/pages/auth/Privacy.jsx) | Privacy page exists, compliance not provable | Add compliance controls | Add consent/data rights UX if needed | L | Low |
| 99.5% monthly uptime | ❓ | no ops artifacts | Cannot prove | Add ops/SRE work | None | L | Low |
| Daily backups with PITR | ❓ | no ops artifacts | Cannot prove | Add backup strategy | None | M | Low |
| Prometheus metrics | ❌ | repo search | No metrics artifacts | Add metrics | Optional ops dashboards links | M | Low |
| Grafana dashboards | ❌ | repo search | No dashboards | Add dashboards | None | M | Low |
| Centralized structured logging | ❌ | repo search | No logging stack artifacts | Add logging pipeline | None | M | Low |
| Sentry error tracking | ❌ | repo search | No Sentry code | Add Sentry | Add frontend Sentry client if desired | S | Low |
| Alerts for payment gateway failures | ❌ | repo search | No alerting artifacts | Add alerting | None | M | Low |
| Alerts for bid latency spikes | ❌ | repo search | No alerting artifacts | Add alerting | None | M | Low |
| Alerts for WebSocket disconnect storms | ❌ | repo search | No alerting artifacts | Add alerting | Add client telemetry if desired | M | Low |
| Git-based CI/CD | ❌ | repo search | No CI config | Add pipeline | None | M | Low |
| Automated tests in CI | ❌ | repo search; no tests | No tests/config | Add test suite and CI | Add component/integration tests | L | Medium |
| DB migrations via Flyway/Liquibase | ❌ | repo search | No migrations | Add migration tooling | None | M | Medium |
| Separate staging environment | ❓ | no deployment artifacts | Cannot prove | Add env/deploy setup | Add env config handling | M | Low |
| Rolling or blue-green deployments | ❓ | no deployment artifacts | Cannot prove | Add deploy strategy | None | M | Low |
| Versioned REST `/api/v1` | ❌ | [src/api/api.js](C:/Users/user/auction-front/src/api/api.js), [src/queries](C:/Users/user/auction-front/src/queries) | Endpoints are unversioned | Add versioned API routes | Update client endpoints | M | High |
| OpenAPI/Swagger docs | ❌ | repo search | No docs files | Add spec generation | Link docs in admin/dealer UI | M | Medium |
| Same API serves web/mobile/Telegram/dealer | ❓ | this repo only shows web usage | Cannot prove | Consolidate API contracts | None in repo | L | Low |
| Append-only audit log for bids | ❌ | repo search | No audit log | Add audit logging | Add viewer if needed | M | Medium |
| Append-only audit log for payments | ❌ | repo search | No audit log | Add audit logging | Add viewer if needed | M | Medium |
| Append-only audit log for moderation decisions | ❌ | repo search | No audit log | Add audit logging | Add viewer if needed | M | Medium |
| Append-only audit log for anti-fraud decisions | ❌ | repo search | No audit log | Add audit logging | Add viewer if needed | M | Low |
| Append-only audit log for admin changes | ❌ | repo search | No audit log | Add audit logging | Add viewer if needed | M | Medium |

