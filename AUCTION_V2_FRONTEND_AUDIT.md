# AUCTION v2 Cars Technical Specification Frontend Audit

Source of truth: `Technical_Specification_AUCTION_v2_Cars.docx` extracted from `/home/tenzorsoft/Downloads/Telegram Desktop/Technical_Specification_AUCTION_v2_Cars.docx`.

Repository audited: `/home/tenzorsoft/auction-front` on branch `codex`.

Audit date: 2026-07-15.

Important scope note: this repository is a frontend repository. Backend database schema, backend-only bidding consistency, payment gateway callbacks, mobile app, Telegram bot, and infrastructure requirements are marked as `N/A Outside the responsibility of this repository` or `❓ Cannot verify from this repository` unless frontend code provides direct evidence.

## Requirement Matrix

| ID | DOCX section | Requirement | Status | Existing implementation | Evidence | What is missing | What must be changed | Frontend work | Backend work | Files likely affected | Complexity | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R001 | 1.1, 1.3, 2 | Platform specialized exclusively for cars; non-vehicle lots removed | 🔄 Implemented using the old v1 architecture and requires refactoring | UI and API surface still use generic lots and categories; home/marketplace still mention non-car categories | `src/queries/lots.jsx`, `src/queries/lot-types.jsx`, `src/app/(_components)/Auctions.jsx`, `src/app/page.tsx` | Vehicle-only domain language and routes are absent | Replace generic lot concepts with vehicle + auction concepts; remove non-car categories | Rename/rework UI copy, routes, cards, forms, query keys, and filters around vehicles/auctions | Provide v2 vehicle/auction APIs if not already present | `src/queries/*`, `src/components/Lots/*`, `src/app/(_components)/Auctions.jsx`, new `src/queries/vehicles.*`, `src/queries/auctions.*` | XL | Critical |
| R002 | 2, DB changes | Remove `lot_types` dictionary from v2 | 🔄 Implemented using the old v1 architecture and requires refactoring | Active frontend manages lot types, subtypes, and dynamic attributes | `src/queries/lot-types.jsx`, `src/queries/subtypes.jsx`, `src/queries/attributes.jsx`, `src/app/(_components)/Admin/lot-types/ManageLotTypes.jsx` | v2 make/model dictionaries replace lot types | Remove/admin-hide lot type tooling after vehicle dictionaries exist | Add make/model dictionary UI and migrate consumers away from `lotTypeId`, subcategories, attributes | Backend must expose makes/models and migration path | Admin lot-type folder, create/edit lot forms, listing detail/cards | XL | Critical |
| R003 | 2, DB changes | Split generic `lots` into `vehicles` and `auctions` | 🔄 Implemented using the old v1 architecture and requires refactoring | All core queries use `/lot/...`; bidding uses `lotId` | `src/queries/lots.jsx`, `src/queries/bid.jsx`, `src/components/Lots/id/index.jsx`, `src/app/(_components)/Bid/Bidding.jsx` | No frontend vehicle/auction type separation | Introduce separate vehicle profile and auction session models | Create typed query modules and adapt components to `vehicleId` / `auctionId` | Backend must expose separate vehicle and auction contracts | `src/queries/lots.jsx`, `src/queries/bid.jsx`, `src/components/Lots/*`, `src/app/(page)/lots/*` | XL | Critical |
| R004 | 3 | Guest can browse public listings and finished results; cannot bid | 🟡 Partially implemented | Public `/auctions` and `/lots/[id]`; bidding route redirects unauthenticated users | `src/app/(page)/auctions/page.tsx`, `src/components/Lots/id/index.jsx`, `src/hooks/authRedirect.js`, `src/app/(_components)/Bid/Bidding.jsx` | Finished-auction archive and explicit guest restrictions are incomplete | Reuse public routes; add finished archive and v2 bidding gating | Add archive route/filter and clearer unauthenticated bid/deposit handling | Backend archive endpoint needed | Marketplace/listing/bidding pages | M | High |
| R005 | 3 | Buyer role: verified user can deposit and bid | 🟡 Partially implemented | Buyer/seller roles exist; deposit and bid buttons exist | `src/app/(_components)/cabinet/Dashboard.jsx`, `src/components/Lots/id/index.jsx`, `src/app/(_components)/Bid/Bidding.jsx` | KYC APPROVED gating is absent | Extend role checks to KYC + deposit status | Add KYC state checks, disabled states, explanations | Backend must return KYC/deposit eligibility | Dashboard, lot detail, bidding components | L | Critical |
| R006 | 3 | Seller role: verified user can create vehicle listings and auctions | 🟡 Partially implemented | Seller role gates old lot creation | `src/components/Lots/create/Createlot.jsx` | KYC gating and vehicle listing wizard absent | Reuse role pattern but replace old lot form | Add vehicle + auction wizard after v2 APIs exist | Backend vehicle/auction create endpoints | Create/edit lot form, cabinet seller pages | XL | Critical |
| R007 | 3, 4.11 | Dealer role with enhanced verification, bulk tools, API access | ❌ Not implemented | Admin/user roles list only ADMIN, BUYER, SELLER | `src/components/UsersTable.jsx`, `src/constants/index.jsx`, `src/app/(_components)/cabinet/Dashboard.jsx` | DEALER role UI, bulk import, API key management, commission tiers absent | Add dealer role support after backend contracts | Add dealer cabinet/admin tools | Backend dealer profile/API key/import/tier APIs | User role UI, admin, cabinet | L | High |
| R008 | 3, 4.12 | Moderator role for KYC/listings/documents/disputes/risk | ❌ Not implemented | Admin-only panel exists; no moderator role or queues | `src/app/(_components)/Admin/Admin.jsx`, `src/components/UsersTable.jsx` | MODERATOR role and moderation work queues missing | Add moderator role and scoped panel | Add routes/components for queues | Backend moderator permissions and queue endpoints | Admin sidebar, users, new moderation pages | L | High |
| R009 | 3, 4.12 | Administrator full access | 🟡 Partially implemented | Admin role gates `/admin`; admin can view users/lots/bids/transactions | `src/app/(_components)/Admin/Admin.jsx`, `src/components/UsersTable.jsx` | Many v2 admin capabilities absent | Reuse admin shell; add v2 pages | Add missing reference, finance, moderation, audit pages | Backend endpoints required | Admin components | L | High |
| R010 | 4.1 | Registration by phone or email + password | 🟡 Partially implemented | Form collects phone, email, password; request uses `/auth/registerByEmail` | `src/app/(_components)/auth/Register.jsx`, `src/queries/index.jsx` | Phone-based registration path cannot be verified; phone is submitted with email registration payload | Keep form, align API names/contracts | Add phone/email mode if backend supports both | Backend auth endpoints | Register component, auth queries | M | High |
| R011 | 4.1 | OTP confirmation via SMS/e-mail | 🟡 Partially implemented | OTP modal and resend exist; endpoints are email-named | `src/app/(_components)/auth/Register.jsx`, `src/components/OTPinput.jsx`, `src/queries/index.jsx` | SMS OTP cannot be verified | Reuse OTP component; extend channel support | Add SMS/e-mail channel UI if needed | Backend SMS OTP endpoint | Auth components/queries | M | High |
| R012 | 4.1 | Individual KYC: first name, last name, DOB, ID document upload | ❌ Not implemented | First/last name exist; no DOB or ID document upload | `src/app/(_components)/auth/Register.jsx`, `src/app/(_components)/cabinet/Profile.jsx` | DOB, passport/ID upload, KYC submission UI absent | Extend profile into KYC flow | Add KYC document upload and status pages | Backend KYC document APIs | Profile, new KYC components/queries | L | Critical |
| R013 | 4.1 | Organization KYC: company name, legal address, tax ID, contact person, registration certificate | 🟡 Partially implemented | Profile has user type, orgName, orgInn | `src/app/(_components)/cabinet/Profile.jsx` | Legal address, contact person mapping, certificate upload, KYC status absent | Extend organization profile/KYC | Add organization KYC fields and document upload | Backend organization KYC APIs | Profile, KYC queries | L | Critical |
| R014 | 4.1 | KYC statuses NOT_SUBMITTED -> PENDING -> APPROVED/REJECTED with reason | ❌ Not implemented | No active KYC status UI; inactive user check hook is commented out/nonfunctional | `src/hooks/checkUserStatus.jsx`, `src/context/UserContext.jsx` | KYC status display/reason and workflow absent | Add KYC state to user context | Display status/reason and route gates | Backend must return statuses/reasons | User context, profile, gates | M | Critical |
| R015 | 4.1 | Selling and bidding require APPROVED KYC | ❌ Not implemented | Selling checks SELLER role only; bidding checks auth only | `src/components/Lots/create/Createlot.jsx`, `src/app/(_components)/Bid/Bidding.jsx`, `src/components/Lots/id/index.jsx` | KYC gating absent | Add eligibility guards | Disable/create clear CTA to submit KYC | Backend eligibility/KYC status | Create lot, lot detail, bidding | M | Critical |
| R016 | 4.1 | Terms/public offer acceptance at registration and re-acceptance history | 🟡 Partially implemented | Registration has privacy agreement checkbox | `src/app/(_components)/auth/Register.jsx`, `src/app/(_components)/auth/Privacy.jsx` | ToS/public offer versioning and re-acceptance absent | Replace generic checkbox with versioned agreement flow | Add ToS version fetch/accept UI | Backend agreement_acceptances APIs | Register, profile/settings | M | High |
| R017 | 4.1 | Roles many-to-many and permissions | 🟡 Partially implemented | User roles are arrays; admin can add/remove role IDs; cabinet can switch buyer/seller | `src/components/UsersTable.jsx`, `src/app/(_components)/cabinet/Dashboard.jsx` | DEALER/MODERATOR missing; permissions are ad hoc in components | Reuse role array, centralize permissions | Add role constants and route guards | Backend role definitions | Constants, guards, admin/cabinet | M | High |
| R018 | 4.1 | Account blocking by admin | ✅ Implemented | Admin user table has block action calling `/user/block/{userId}` | `src/components/UsersTable.jsx`, `src/queries/users.jsx` | Active blocked-session enforcement is weak | Keep endpoint; restore active-user handling | Add blocked state feedback/logout | Backend block semantics already implied | UsersTable, UserContext/check hook | S | Medium |
| R019 | 4.1 | Session management | 🟡 Partially implemented | Token stored in localStorage; user fetched by token; logout clears token | `src/context/UserContext.jsx`, `src/api/api.js` | Refresh token/session list not visible | Refactor auth storage once backend contract exists | Add refresh/session management UI if required | Backend refresh/session APIs | Auth context/API client | M | Medium |
| R020 | 4.1 | Optional 2FA TOTP | ❌ Not implemented | No TOTP setup/verify UI found | `src/app/(_components)/auth/*`, `src/app/(_components)/cabinet/Profile.jsx` | TOTP setup, recovery, verification absent | Add only if backend supports it | Add profile 2FA section and login step | Backend TOTP APIs | Profile/login/auth queries | M | Low |
| R021 | 4.1 | JWT access + refresh tokens | 🟡 Partially implemented | Bearer token added from localStorage | `src/api/api.js`, `src/context/UserContext.jsx` | Refresh token flow not implemented | Extend API interceptor/auth context | Add refresh/retry and secure expiry handling | Backend refresh endpoint | API client, UserContext | M | High |
| R022 | 4.1 | Rate limiting on auth endpoints | N/A Outside the responsibility of this repository | Frontend cannot enforce server rate limits | `src/queries/index.jsx` | Backend behavior cannot be verified | No frontend change except error handling | Show rate-limit messages if returned | Backend must enforce | Auth components | S | Medium |
| R023 | 4.2, DB 4 | Admin dictionaries: vehicle makes | ❌ Not implemented | Lot-type admin exists instead | `src/app/(_components)/Admin/lot-types/*`, `src/queries/lot-types.jsx` | Make dictionary UI/API absent | Replace lot-type UI with make management | Add make table/create/edit/delete | Backend make endpoints | Admin reference data | M | Critical |
| R024 | 4.2, DB 4 | Admin dictionaries: vehicle models belong to make | ❌ Not implemented | Subtypes belong to lot types, not models to makes | `src/queries/subtypes.jsx`, `src/app/(_components)/Admin/lot-types/sub-types/*` | Model dictionary UI/API absent | Replace subtype UI with model management | Add model CRUD filtered by make | Backend model endpoints | Admin reference data | M | Critical |
| R025 | 4.2 | Admin dictionaries: regions | 🟡 Partially implemented | Region/district read endpoints used in forms | `src/queries/region.jsx`, `src/components/Lots/create/Createlot.jsx` | Admin CRUD for regions not present | Reuse region reads; add admin management if required | Add region reference UI | Backend region CRUD | Admin reference data | M | Medium |
| R026 | 4.2 | Vehicle make field | ❌ Not implemented | Old `lotTypeId` selected; no make field | `src/components/Lots/create/Createlot.jsx` | Make selection absent | Replace lotType with make/model | Add make select | Backend make list | Create/edit/detail/cards | M | Critical |
| R027 | 4.2 | Vehicle model field | ❌ Not implemented | Subcategory selected; no model field | `src/components/EditLotForm.jsx` | Model selection absent | Replace subcategory with model | Add dependent model select | Backend model list | Create/edit/detail/cards | M | Critical |
| R028 | 4.2 | Vehicle year field | ❌ Not implemented | No year input/display | `src/components/Lots/create/Createlot.jsx`, `src/components/Lots/id/index.jsx` | Year missing everywhere | Add vehicle year to model | Add input, validation, display/filter | Backend vehicle year | Vehicle forms/cards | S | Critical |
| R029 | 4.2 | VIN input | ❌ Not implemented | No VIN field found | `rg vin` produced no source VIN usage | VIN missing | Add VIN field | Add VIN input in KYC/listing wizard | Backend VIN field | Vehicle forms | M | Critical |
| R030 | 4.2 | VIN length 17 validation | ❌ Not implemented | No VIN validation | No VIN source usage | Validation missing | Add client validation with server validation | Implement 17-char format validation | Backend authoritative validation | Vehicle form validation | S | Critical |
| R031 | 4.2 | VIN checksum validation | ❓ Cannot verify from this repository | No frontend VIN validation exists | No VIN source usage | Backend checksum cannot be verified | Add frontend pre-check if desired, rely on backend | Optional checksum helper and error UI | Backend must enforce | Vehicle form/util | M | High |
| R032 | 4.2 | VIN decode auto-fills make/model/year/engine | ❌ Not implemented | No VIN decode UI/API usage | No VIN source usage | VIN decode absent | Add VIN decode flow after endpoint exists | Trigger decode and populate fields | Backend/proxy VIN decode API | Vehicle form/query | M | High |
| R033 | 4.2 | Duplicate VIN prevention across active listings | ❓ Cannot verify from this repository | No VIN feature exists | No VIN source usage | Backend duplicate enforcement cannot be verified | Add duplicate error handling | Show server validation error | Backend must enforce uniqueness | Vehicle form | S | Critical |
| R034 | 4.2 | Mileage in km | ❌ Not implemented | No mileage input/display | `src/components/Lots/create/Createlot.jsx`, `src/components/Lots/id/index.jsx` | Mileage missing | Add field | Add input/display/filter | Backend vehicle mileage | Vehicle form/cards/filters | S | Critical |
| R035 | 4.2 | Engine volume | ❌ Not implemented | No engine volume input/display | `src/components/Lots/create/Createlot.jsx` | Engine volume missing | Add field | Add numeric input and display | Backend field | Vehicle form/detail | S | Critical |
| R036 | 4.2 | Fuel type enum | ❌ Not implemented | No fuel type select | `src/components/Lots/create/Createlot.jsx` | Fuel type missing | Add enum select | Add filter/display | Backend enum | Vehicle form/filters | S | Critical |
| R037 | 4.2 | Transmission enum | ❌ Not implemented | No transmission select | `src/components/Lots/create/Createlot.jsx` | Transmission missing | Add enum select | Add filter/display | Backend enum | Vehicle form/filters | S | Critical |
| R038 | 4.2 | Drivetrain enum | ❌ Not implemented | No drivetrain select | `src/components/Lots/create/Createlot.jsx` | Drivetrain missing | Add enum select | Add filter/display | Backend enum | Vehicle form/detail | S | High |
| R039 | 4.2 | Body type | ❌ Not implemented | Generic dynamic attributes may hold arbitrary body-like data, but no required field | `src/components/Lots/create/Createlot.jsx`, `src/components/EditLotForm.jsx` | Structured body type missing | Replace dynamic attribute reliance | Add enum/select and filters | Backend body type | Vehicle form/filters | S | High |
| R040 | 4.2 | Color | ❌ Not implemented | No color field | `src/components/Lots/create/Createlot.jsx` | Color missing | Add field | Add input/select/display | Backend field | Vehicle form/detail | S | Medium |
| R041 | 4.2 | Condition grade enum | ❌ Not implemented | No condition grade | `src/components/Lots/create/Createlot.jsx` | Condition missing | Add enum select | Add display/filter | Backend enum | Vehicle form/filters | S | High |
| R042 | 4.2 | Region/city | 🟡 Partially implemented | Region/district selected and displayed | `src/queries/region.jsx`, `src/components/Lots/create/Createlot.jsx`, `src/components/Lots/id/index.jsx` | City naming/model alignment unclear; admin CRUD missing | Reuse for vehicle region/city | Map to v2 region/city fields | Backend region/city model | Vehicle form/detail/filters | S | Medium |
| R043 | 4.2 | Free-text description | ✅ Implemented | Description input and display exist | `src/components/Lots/create/Createlot.jsx`, `src/components/Lots/id/index.jsx` | Needs vehicle model naming | Reuse | Rename in vehicle form | Backend field | Vehicle form/detail | S | Medium |
| R044 | 4.2 | Photos minimum 5 | 🟡 Partially implemented | Create form requires 4 images despite text saying at least 4 | `src/components/Lots/create/Createlot.jsx` | Minimum must be 5 | Adjust validation/copy | Set min to 5 | Backend should validate | Create/edit upload | S | High |
| R045 | 4.2 | Photos maximum 30 | 🟡 Partially implemented | Create form caps at 10 images | `src/components/Lots/create/Createlot.jsx` | Max must be 30 | Increase UI cap after backend support | Allow 30 with UX | Backend max/limits | Create/edit upload/gallery | S | Medium |
| R046 | 4.2 | One primary photo | ❌ Not implemented | First image is implicitly displayed; no primary flag UI | `src/components/Lots/id/index.jsx`, `src/components/ImageUploadModal.jsx` | Primary selection absent | Add primary marker/order management | Add primary photo control | Backend `is_primary` support | Image upload/gallery/forms | M | High |
| R047 | 4.2 | Recommended photo set guidance | ❌ Not implemented | No vehicle-specific photo checklist | `src/components/Lots/create/Createlot.jsx` | Exterior/interior/odometer/damage guidance absent | Add vehicle photo checklist | UI guidance and slots | Backend optional metadata | Vehicle image wizard | S | Medium |
| R048 | 4.2 | Vehicle title/registration certificate document | ❌ Not implemented | No vehicle document upload UI | No `vehicle_documents` or document upload references beyond images | Document upload missing | Add vehicle document section | Upload/view status | Backend document APIs | Vehicle form/admin moderation | L | Critical |
| R049 | 4.2 | Customs clearance document | ❌ Not implemented | No document upload UI | Same as R048 | Missing | Add optional customs document upload | Upload/view status | Backend document APIs | Vehicle form/admin moderation | M | High |
| R050 | 4.2 | Inspection report optional | ❌ Not implemented | No document upload UI | Same as R048 | Missing | Add optional inspection upload | Upload/view status | Backend document APIs | Vehicle form/admin moderation | M | Medium |
| R051 | 4.2, 4.12 | Moderator verifies documents before auction approval | ❌ Not implemented | Admin approves whole lot, not individual docs | `src/app/(_components)/Admin/ApproveModal.jsx`, `src/queries/lots.jsx` | Per-document verification absent | Add document moderation workflow | Admin doc viewer/status actions | Backend doc status APIs | Admin moderation | L | Critical |
| R052 | 4.2 | Listing Q&A: buyers ask public questions, seller answers | 🟡 Partially implemented | Comment section supports comments and seller replies | `src/components/Lots/Comments.jsx`, `src/queries/comments.jsx` | It is review/comment-like, not moderated listing Q&A with PENDING/PUBLISHED/REJECTED | Refactor/reuse UI as listing questions | Add question/answer statuses and moderation | Backend listing_questions APIs | Listing detail/admin moderation | M | Medium |
| R053 | 4.2 | Questions moderated before publication | ❌ Not implemented | Comments post directly through `/comment/create`; no moderation queue | `src/queries/comments.jsx`, `src/components/Lots/Comments.jsx` | Moderation statuses absent | Add moderation queue | Hide pending questions until approved | Backend question moderation APIs | Comments/Q&A/Admin | M | Medium |
| R054 | 4.2 | Listing statuses DRAFT -> PENDING_REVIEW -> APPROVED/REJECTED -> PUBLISHED -> SOLD/ARCHIVED | 🟡 Partially implemented | Uses `lotStatus` and `isApproved`; statuses include PENDING, ACTIVE, FINISHED, CANCELED, DELETED | `src/components/Lots/id/index.jsx`, `src/app/(_components)/Admin/ManageLots.jsx`, `src/app/(_components)/cabinet/Mylots.jsx` | v2 lifecycle names and distinction between listing and auction statuses absent | Refactor status model | Map status badges/actions to v2 listing statuses | Backend status model | Cards/admin/cabinet/detail | M | Critical |
| R055 | 4.3 | Auction linked to exactly one vehicle | ❓ Cannot verify from this repository | Frontend only knows lot with bidding fields | `src/queries/lots.jsx`, `src/app/(_components)/Bid/Bidding.jsx` | Vehicle-auction relation absent in frontend contract | Await backend v2 contract | Use `auction.vehicle`/IDs | Backend relationship | Query/types/pages | M | Critical |
| R056 | 4.3 | Auction start price | ✅ Implemented | Start price input/display exists | `src/components/Lots/create/Createlot.jsx`, `src/components/Lots/id/index.jsx` | It is still on generic lot and UZS-only | Reuse field under auction model | Move to auction form | Backend auction field | Auction form/cards | S | High |
| R057 | 4.3 | Optional reserve price | ❌ Not implemented | No reserve price field/display | `src/components/Lots/create/Createlot.jsx` | Reserve price absent | Add auction field | Add optional hidden minimum input | Backend reserve support | Auction wizard/admin | S | High |
| R058 | 4.3 | Settlement currency USD or UZS | ❌ Not implemented | UZS hardcoded in forms, cards, bidding, transactions | `src/components/Lots/create/Createlot.jsx`, `src/components/Lots/id/index.jsx`, `src/app/(_components)/Bid/Bidding.jsx`, `src/app/(_components)/cabinet/Transactions.jsx` | Currency selector and USD support absent | Replace hardcoded UZS | Add currency-aware formatting | Backend currency fields/rates | Shared money formatting, forms/cards | M | Critical |
| R059 | 4.3 | Fixed increment | ✅ Implemented | `incrementType` supports `FIXED`; UI calculates fixed next bid | `src/components/Lots/create/Createlot.jsx`, `src/app/(_components)/Bid/Bidding.jsx` | Still lot-based and UZS-only | Reuse under auction model | Move to auction query/form | Backend auction increment fields | Auction form/bidding | S | High |
| R060 | 4.3 | Percentage increment | 🟡 Partially implemented | `incrementType` supports `PERCENTAGE`; UI computes percentage | `src/components/Lots/create/Createlot.jsx`, `src/app/(_components)/Bid/Bidding.jsx` | Currency rounding rules not implemented; one formula uses `lot.currentPrice` inconsistently | Reuse concept but server should be authoritative | Display server-provided min next bid | Backend min bid/rounding | Bidding UI | M | High |
| R061 | 4.3 | Deposit percentage per auction | 🟡 Partially implemented | Deposit is hardcoded to 1% of start price in UI text | `src/components/Lots/id/index.jsx` | Configurable per-auction percentage absent | Add deposit percent field/display | Use backend-provided deposit amount | Backend deposit percent | Auction form/detail | M | Critical |
| R062 | 4.3 | Auction start and end time | 🟡 Partially implemented | Start time input; end time displayed from backend | `src/components/Lots/create/Createlot.jsx`, `src/components/Lots/id/index.jsx` | End time input/config is absent in create form | Add auction duration/end-time field | Add start/end controls | Backend auction schedule | Auction form/detail | M | High |
| R063 | 4.3 | Auction lifecycle DRAFT -> PENDING_REVIEW -> SCHEDULED -> LIVE -> FINISHED/CANCELED | 🟡 Partially implemented | Old statuses PENDING/ACTIVE/FINISHED/CANCELED displayed | `src/app/(_components)/cabinet/MyAuctions.jsx`, `src/components/Lots/LotCard.jsx` | v2 lifecycle absent | Refactor status mapping | Update badges/tabs/actions | Backend lifecycle | Cards/admin/cabinet | M | High |
| R064 | 4.3 | Minimum next bid fixed formula | 🟡 Partially implemented | Client computes `latestBid + incrementValue` | `src/app/(_components)/Bid/Bidding.jsx` | Server-provided minimum and currency rounding absent | Use server-calculated minimum | Display and submit exact server min | Backend bid validation/min-next endpoint | Bidding UI | M | High |
| R065 | 4.3 | Minimum next bid percentage formula and rounding USD/UZS | 🟡 Partially implemented | Client computes percentage but no rounding rules | `src/app/(_components)/Bid/Bidding.jsx` | USD=1, UZS=1000 rounding missing | Replace with backend min-next | Add currency-aware display | Backend rounding authoritative | Bidding UI | M | High |
| R066 | 4.3 | Real-time bidding via STOMP channel per auction | 🟡 Partially implemented | STOMP subscriptions exist per lot for bids and lot data | `src/hooks/useStomp.js`, `src/app/(_components)/Bid/Bidding.jsx` | Uses localhost WS URL and lot channels, not auction channels | Reuse STOMP hook, configure endpoint/env, rename channels | Add env-based socket URL and auction topics | Backend auction STOMP topics | `useStomp`, bidding/detail/notifications | M | Critical |
| R067 | 4.3 | Broadcast new bids/current price/countdown to all subscribers | 🟡 Partially implemented | Highest bid and bid list are broadcast; countdown is computed locally | `src/app/(_components)/Bid/Bidding.jsx`, `src/components/Lots/id/index.jsx` | Server-authoritative countdown/current price events not clearly handled | Extend event payload handling | Render current price/countdown from server | Backend event payloads | Bidding/detail | M | High |
| R068 | 4.3 | Polling fallback for degraded WebSocket | ❌ Not implemented | HTTP query hooks exist but active bidding fetches are commented out; no fallback logic | `src/app/(_components)/Bid/Bidding.jsx`, `src/queries/bid.jsx` | Fallback absent | Add connection-state fallback | Poll bid/auction endpoints when STOMP disconnected | Backend REST endpoints | Bidding/detail | M | High |
| R069 | 4.3 | Anti-sniping configurable extension | ❓ Cannot verify from this repository | UI resets countdown to last bid + 10 minutes locally | `src/app/(_components)/Bid/Bidding.jsx` | Server anti-sniping state not exposed; local behavior differs from DOCX default 2 min | Remove local assumption | Display backend `end_time` updates | Backend anti-sniping engine | Bidding/detail | M | Critical |
| R070 | 4.3 | Auto-bid/proxy bidding | ❌ Not implemented | No auto-bid UI/API usage | No `auto_bid` source usage | Auto-bid absent | Add auto-bid setting UI after backend | Add max amount form/status/cancel | Backend auto-bid APIs | Bidding page | L | High |
| R071 | 4.3 | Deposit required before first bid | 🟡 Partially implemented | Lot detail requires deposit before watch/bidding button; bidding route only checks auth | `src/components/Lots/id/index.jsx`, `src/app/(_components)/Bid/Bidding.jsx` | Bidding route does not verify deposit; KYC missing | Add eligibility check | Block bid route/actions without deposit | Backend eligibility endpoint | Lot detail/bidding | M | Critical |
| R072 | 4.3 | Deposit blocked during auction | ❓ Cannot verify from this repository | Frontend posts `/deposit/depositToLot` and shows deposited state | `src/queries/deposit.jsx`, `src/components/Lots/id/index.jsx` | Blocking behavior is backend-only | Add status display if returned | Show BLOCKED status | Backend deposit state | Deposit/detail/transactions | S | High |
| R073 | 4.3 | Losing bidder refund | ❓ Cannot verify from this repository | Transactions show REFUND type if backend returns it | `src/app/(_components)/cabinet/Transactions.jsx` | Automatic refund cannot be verified | Add refund status visibility | Display refund ledger entries | Backend refund logic | Transactions/notifications | S | High |
| R074 | 4.3 | Winner deposit applied to final payment | ❓ Cannot verify from this repository | No final payment/deal UI | `src/app/(_components)/cabinet/Transactions.jsx` | Application behavior cannot be verified | Add deal/payment status UI | Show applied deposit in deal | Backend final payment/deposit application | Deal/payment pages | M | High |
| R075 | 4.3 | Deposit forfeited on winner non-payment | ❓ Cannot verify from this repository | No non-payment/deal UI | No source evidence | Backend behavior cannot be verified | Add status visibility | Show FORFEITED transaction/deal state | Backend forfeiture logic | Deal/payment pages | M | High |
| R076 | 4.3 | Bid retraction not allowed to bidders | ❓ Cannot verify from this repository | No bidder retraction UI exists | `src/app/(_components)/Bid/Bidding.jsx` | Backend rule cannot be verified | No bidder UI needed | Keep no retract action | Backend enforce no retract | Bidding/admin | S | Medium |
| R077 | 4.3, 4.12 | Moderator may void bid with reason and audit log | ❌ Not implemented | Admin bid table is read-only | `src/app/(_components)/Admin/ManageBids.jsx` | Void action, reason modal, recalculation/audit absent | Add admin/moderator void flow | Add void bid action with reason | Backend void/recalculate/audit | Admin ManageBids | M | High |
| R078 | 4.3 | Bid serialization/optimistic locking/server timestamps | N/A Outside the responsibility of this repository | Frontend posts bids to backend | `src/app/(_components)/Bid/Bidding.jsx` | Backend consistency cannot be verified | No frontend authority | Display server timestamp/errors | Backend bidding engine | Bidding UI | S | Critical |
| R079 | 4.3 | Bid below minimum rejected server-side | ❓ Cannot verify from this repository | UI posts bid amount; server response BAD_REQUEST displayed | `src/app/(_components)/Bid/Bidding.jsx` | Backend validation cannot be verified | Add server error handling | Display min bid errors | Backend validation | Bidding UI | S | Critical |
| R080 | 4.3 | Completion winner if reserve met; no winner if reserve not met | ❓ Cannot verify from this repository | Winning lots query exists; no reserve UI | `src/queries/lots.jsx`, `src/app/(_components)/cabinet/myauctions/Winning.jsx` | Reserve logic cannot be verified | Add outcome display | Show winner/no-reserve result | Backend completion logic | Finished/auction detail | M | High |
| R081 | 4.4 | USD and UZS UI with indicative equivalent via CBU rate | ❌ Not implemented | UZS hardcoded; no exchange rate query | Money displays in many files; no `exchange_rates` source usage | Currency conversion absent | Add shared money/currency support | Add rate query/equivalent display | Backend CBU rate endpoint | Money components/queries | M | Critical |
| R082 | 4.4 | Payme gateway | ❓ Cannot verify from this repository | No gateway UI except balance/transactions | `src/app/(_components)/cabinet/UserDashboard.jsx`, `src/queries/transaction.jsx` | Payme flow absent in frontend | Add payment method UI if backend exists | Gateway checkout flow | Backend Payme | Payments pages | M | High |
| R083 | 4.4 | Click gateway | ❓ Cannot verify from this repository | Same as R082 | Same as R082 | Click flow absent | Add payment method UI | Gateway checkout flow | Backend Click | Payments pages | M | High |
| R084 | 4.4 | Uzum Bank gateway | ❓ Cannot verify from this repository | Same as R082 | Same as R082 | Uzum flow absent | Add payment method UI | Gateway checkout flow | Backend Uzum | Payments pages | M | High |
| R085 | 4.4 | Visa/Mastercard international acquiring for USD | ❓ Cannot verify from this repository | No USD/card checkout UI | Money hardcoded UZS | USD card flow absent | Add USD payment flow | Checkout UI | Backend card acquiring | Payments pages | M | High |
| R086 | 4.4 | Bank transfer with invoice for legal entities | ❌ Not implemented | Organization profile exists; no invoice checkout | `src/app/(_components)/cabinet/Profile.jsx`, `src/app/(_components)/cabinet/Transactions.jsx` | Bank transfer/invoice UI absent | Add invoice/payment method pages | Legal entity invoice flow | Backend invoice/bank transfer | Payments/deals | L | High |
| R087 | 4.4 | Payment types DEPOSIT, FINAL_PAYMENT, FEE, REFUND | 🟡 Partially implemented | UI displays DEPOSIT, REFUND, PAYMENT, FINAL | `src/app/(_components)/cabinet/Transactions.jsx` | FEE and FINAL_PAYMENT naming absent | Align transaction type mapping | Update type enum labels/icons | Backend transaction types | Transactions/admin finance | S | Medium |
| R088 | 4.4 | Payment statuses PENDING/SUCCESS/FAILED/REFUNDED/CANCELED | ❌ Not implemented | Transaction UI does not display status | `src/app/(_components)/cabinet/Transactions.jsx`, `src/app/(_components)/Admin/PaymentHistory.jsx` | Status display absent | Add status column/badges | Render payment status | Backend returns status | Transaction pages | S | Medium |
| R089 | 4.4 | Gateway callbacks idempotent; ledger stored | N/A Outside the responsibility of this repository | Frontend cannot verify callbacks/ledger | `src/queries/transaction.jsx` | Backend-only | No frontend change except display | None | Backend payment ledger | N/A | M | Critical |
| R090 | 4.4 | Commission configurable, dealer tiers, FEE transactions | ❌ Not implemented | No commission settings UI | Admin lacks commission settings | Missing | Add admin settings/dealer tier UI | Commission config pages | Backend commission APIs | Admin finance/dealer | L | High |
| R091 | 4.4 | Invoices for legal entities, fiscal receipts, monthly statements | ❌ Not implemented | No invoices/statements UI; receipt icon is inert | `src/app/(_components)/cabinet/Transactions.jsx` | Invoice download, receipts, statements absent | Add document links/pages | Invoices/statements UI | Backend invoice/receipt files | Transactions/seller cabinet | L | High |
| R092 | 4.5 | Purchase contract auto-generated on winning | ❌ Not implemented | No contract UI/API usage | No `contract` source usage | Missing | Add post-sale deal/contract pages | Show/download/sign/upload contract | Backend contracts | Deal pages | L | High |
| R093 | 4.5 | Contract e-sign or scan upload | ❌ Not implemented | No contract upload/sign UI | No source evidence | Missing | Add contract action flow | Upload/sign controls | Backend signing/upload | Deal pages | L | Medium |
| R094 | 4.5 | Deal statuses FINISHED -> CONTRACT_SIGNED -> PAID -> HANDED_OVER -> CLOSED | ❌ Not implemented | No deal status model in UI | No `deal_status` source usage | Missing | Add deal model/pages | Deal timeline/status components | Backend deal state | Seller/buyer cabinet | L | High |
| R095 | 4.5 | Buyer confirms vehicle receipt | ❌ Not implemented | No handover UI | No source evidence | Missing | Add handover step | Buyer confirmation action | Backend handover API | Deal pages | M | High |
| R096 | 4.5 | Seller confirms transfer | ❌ Not implemented | No handover UI | No source evidence | Missing | Add handover step | Seller confirmation action | Backend handover API | Deal pages | M | High |
| R097 | 4.5 | Disputes within X days after handover | ❌ Not implemented | No dispute UI/API usage | No `dispute` source usage | Missing | Add dispute flow | Open dispute form/status | Backend disputes | Deal/admin moderation | L | High |
| R098 | 4.5 | Dispute moderation and outcomes affect payments/ratings | ❌ Not implemented | No dispute moderation | Admin lacks disputes | Missing | Add admin dispute queue | Moderator review UI | Backend dispute outcomes | Admin/deal pages | L | High |
| R099 | 4.5 | Winner default deposit forfeiture and second-chance offer | ❌ Not implemented | No default/second-chance UI | No `second_chance` source usage | Missing | Add deal default and offer screens | Show accept/decline 48h offer | Backend second-chance logic | Deal/notification pages | L | High |
| R100 | 4.5 | Seller can relist in one click | ❌ Not implemented | Seller can edit/delete old lots; no relist action | `src/app/(_components)/cabinet/Mylots.jsx` | Relist action absent | Add relist based on finished/no-winner state | Add relist button/modal | Backend relist endpoint | Mylots/deal pages | M | Medium |
| R101 | 4.5 | Ratings/reviews after deal closes | 🟡 Partially implemented | Listing comments with positive/negative/neutral exist; seller replies | `src/components/Lots/Comments.jsx` | Not tied to closed deals; not 1-5 mutual buyer/seller reviews | Refactor/add review model | Add post-deal rating form and public profile aggregate | Backend reviews | Deal/profile/detail | M | High |
| R102 | 4.5 | Aggregate rating and completed deals on public profile | 🟡 Partially implemented | Some cards display hardcoded/default seller rating; user spec mentions stats not shown | `src/components/Lots/LotCardList.jsx`, `src/components/Lots/LotCardGrid.jsx` | Public profile page and real aggregate display absent | Add public profile | Display `rating/deals_count` from API | Backend profile/rating fields | User profile/cards | M | Medium |
| R103 | 4.6 | Shill-bidding detection risk flags | N/A Outside the responsibility of this repository | Detection is backend-only; no risk queue UI | No `risk` source usage | Backend cannot be verified | Add moderator queue when backend exists | Show risk flags and actions | Backend risk engine | Admin moderation | L | High |
| R104 | 4.6 | Blacklist by ID document/phone/tax ID | ❓ Cannot verify from this repository | Admin can block users only | `src/components/UsersTable.jsx` | Blacklist management UI absent; backend unknown | Add blacklist UI if backend supports | Admin blacklist actions | Backend blacklist | Admin users/risk | M | High |
| R105 | 4.6 | Velocity limits and step-up verification | N/A Outside the responsibility of this repository | Frontend uses generated deviceId for auth | `src/app/(_components)/auth/Register.jsx`, `src/app/(_components)/auth/Login.jsx` | Server enforcement cannot be verified | Add error handling/challenges | Step-up prompt if returned | Backend rate/risk controls | Auth/bidding/listing forms | M | Medium |
| R106 | 4.6 | Anti-fraud decisions logged in audit log | N/A Outside the responsibility of this repository | No audit log UI | No `audit` source usage | Backend audit cannot be verified | Add audit viewer separately | Admin audit viewer | Backend audit log | Admin | M | High |
| R107 | 4.7 | Search filter by make | ❌ Not implemented | Search/filter controls are static; no make filter | `src/app/(_components)/Auctions.jsx` | Make filter absent | Add functional filters | Make select tied to query params/API | Backend search filters | Auctions page/query | M | High |
| R108 | 4.7 | Search filter by model | ❌ Not implemented | No model filter | `src/app/(_components)/Auctions.jsx` | Model filter absent | Add dependent model filter | Functional model filtering | Backend search filters | Auctions page/query | M | High |
| R109 | 4.7 | Search filter by year range | ❌ Not implemented | No year range filter | `src/app/(_components)/Auctions.jsx` | Year range absent | Add range controls | Query param + API call | Backend search filters | Auctions page/query | M | Medium |
| R110 | 4.7 | Search filter by price range | 🟡 Partially implemented | Price range inputs are visible but not wired to API | `src/app/(_components)/Auctions.jsx` | Functional filtering absent | Wire to query/API | Add state/query params | Backend search filters | Auctions page/query | M | High |
| R111 | 4.7 | Search filter by mileage range | ❌ Not implemented | No mileage filter | `src/app/(_components)/Auctions.jsx` | Missing | Add range controls | Query/API integration | Backend search filters | Auctions page/query | M | Medium |
| R112 | 4.7 | Search filter by fuel type | ❌ Not implemented | No fuel filter | `src/app/(_components)/Auctions.jsx` | Missing | Add select | Query/API integration | Backend search filters | Auctions page/query | S | Medium |
| R113 | 4.7 | Search filter by transmission | ❌ Not implemented | No transmission filter | `src/app/(_components)/Auctions.jsx` | Missing | Add select | Query/API integration | Backend search filters | Auctions page/query | S | Medium |
| R114 | 4.7 | Search filter by body type | ❌ Not implemented | No body type filter | `src/app/(_components)/Auctions.jsx` | Missing | Add select | Query/API integration | Backend search filters | Auctions page/query | S | Medium |
| R115 | 4.7 | Search filter by condition | ❌ Not implemented | No condition filter | `src/app/(_components)/Auctions.jsx` | Missing | Add select | Query/API integration | Backend search filters | Auctions page/query | S | Medium |
| R116 | 4.7 | Search filter by region | 🟡 Partially implemented | Static region select exists in filter panel | `src/app/(_components)/Auctions.jsx` | Not wired to backend or actual region dictionary | Wire to region data/API | Add region state/query | Backend search filters | Auctions page/query | M | Medium |
| R117 | 4.7 | Search filter by currency | ❌ Not implemented | UZS hardcoded | `src/app/(_components)/Auctions.jsx` | Currency filter absent | Add currency filter | Query/API integration | Backend search filters | Auctions page/query | S | High |
| R118 | 4.7 | Sort by price/end time/newest | 🟡 Partially implemented | Sort dropdown visible but not wired | `src/app/(_components)/Auctions.jsx` | Functional sorting absent | Wire sort to API/query params | Implement sort state | Backend sort params | Auctions page/query | M | High |
| R119 | 4.7 | Full-text search over title/description | 🟡 Partially implemented | Search query hooks exist but are only used in legacy commented `src/pages/Auctions.jsx`; active input is not wired | `src/queries/search.jsx`, `src/app/(_components)/Auctions.jsx`, `src/pages/Auctions.jsx` | Active marketplace search absent | Reuse/refactor search query | Wire active search input | Backend `/lot/search` or v2 search | Auctions page/query | M | High |
| R120 | 4.7 | Favorites/watchlist follow auctions | 🟡 Partially implemented | Like/unlike lots and liked lots cabinet exist | `src/queries/lots.jsx`, `src/components/Lots/LotCard.jsx`, `src/app/(_components)/cabinet/Likes.jsx` | Uses lot likes, not auction favorites; alert semantics unclear | Refactor to favorites/watchlist | Rename and use `auctionId` | Backend favorites API | Cards/detail/cabinet | M | Medium |
| R121 | 4.7 | Favorites outbid and ending-soon alerts | ❓ Cannot verify from this repository | Notifications modal displays backend notifications; no watchlist alert preferences | `src/app/(_components)/cabinet/NotificationsModal.jsx` | Backend event creation cannot be verified | Add notification preferences if needed | Show alerts by event type | Backend notification events | Notifications/favorites | M | Medium |
| R122 | 4.7 | Saved searches with notifications for matching listings | 🟡 Partially implemented | `NoResults` can call `/lot/setNotify`; active search UI does not use it | `src/components/Lots/NoResults.jsx`, `src/queries/search.jsx` | Stored filter sets UI absent; only search-key notify helper | Build saved-search UI | Save filters, list/edit/delete notify | Backend saved_searches APIs | Auctions/cabinet | M | Medium |
| R123 | 4.7 | Notification channel: mobile push FCM | ✅ Implemented | FCM token generation, service worker, foreground/background hooks exist | `src/firebase.js`, `src/lib/firebase.js`, `public/firebase-messaging-sw.js`, `src/queries/notifications.jsx` | Event coverage depends on backend | Keep and centralize config | Move keys/env later | Backend sends FCM events | Firebase files/notifications | M | Medium |
| R124 | 4.7 | Notification channel: Telegram | N/A Outside the responsibility of this repository | No Telegram frontend integration expected | No source evidence | Bot/backend requirement | No frontend work unless account binding web UI added | Optional account binding UI | Telegram bot/backend | N/A | M | Medium |
| R125 | 4.7 | Notification channel: email | ❓ Cannot verify from this repository | OTP email endpoints exist | `src/queries/index.jsx` | Event emails cannot be verified | Add preferences if required | Notification settings | Backend email sending | Profile/settings | M | Medium |
| R126 | 4.7 | Notification channel: SMS for OTP/critical events | ❓ Cannot verify from this repository | Phone captured; no SMS endpoint visible | `src/app/(_components)/auth/Register.jsx` | SMS cannot be verified | Add SMS channel UI/errors | OTP channel support | Backend SMS | Auth/settings | M | Medium |
| R127 | 4.7 | Notification events outbid/starting/ending/won/lost/payment/KYC/moderation/deal/dispute/new match | 🟡 Partially implemented | Generic notification modal receives title/body over STOMP | `src/app/(_components)/cabinet/NotificationsModal.jsx` | Event-specific UI/actions and many event flows absent | Add event-aware rendering and deep links | Render event types/actions | Backend event payloads | Notifications | M | High |
| R128 | 4.8 | SEO-first website with SSR/indexable listing pages | 🟡 Partially implemented | Next App Router exists, but main pages are client components and data fetched client-side | `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/(page)/lots/[id]/page.tsx` | Listing metadata/server rendering absent | Convert public pages to SSR/server data where possible | Add server metadata/data fetching | Backend public API must be cacheable | App routes/layout | L | High |
| R129 | 4.8 | `sitemap.xml` | ❌ Not implemented | No sitemap file/route found | `public/robots.txt`, `rg sitemap` | Missing | Add sitemap route | Generate static/dynamic sitemap | Backend listing feed helpful | `src/app/sitemap.ts` | S | High |
| R130 | 4.8 | schema.org Vehicle/Offer structured data | ❌ Not implemented | No structured data found | `rg schema` | Missing | Add JSON-LD to vehicle/auction pages | Generate Vehicle/Offer JSON-LD | Backend fields needed | Listing route/detail | M | High |
| R131 | 4.8 | Open Graph tags | 🟡 Partially implemented | Global metadata only title/description/icons | `src/app/layout.tsx` | Per-listing OG image/title absent | Add dynamic metadata | Implement `generateMetadata` for listing pages | Backend public listing data | Layout/listing page | M | Medium |
| R132 | 4.8 | UZ/RU/EN language versions with hreflang | 🟡 Partially implemented | UZ/RU/EN messages and language switch exist | `src/locales/index.js`, `src/locales/*.jsx`, `src/components/Header/LangSwitch.jsx` | No localized routes/hreflang metadata; provider defaults to UZ ignoring stored language | Add localized routing/metadata | Persist language and emit hreflang | Backend localized content if needed | Layout/providers/routes | L | Medium |
| R133 | 4.8 | Full buyer functionality: search and filters | 🟡 Partially implemented | Marketplace exists but filters/search not wired | `src/app/(_components)/Auctions.jsx` | Vehicle filters absent | Implement functional search/filter | Query params + API integration | Backend search | Auctions page | M | High |
| R134 | 4.8 | Auction card with photo gallery | ✅ Implemented | Lot detail has image gallery/fullscreen | `src/components/Lots/id/index.jsx` | Needs vehicle fields/primary photo | Reuse gallery | Adapt to vehicle images | Backend vehicle images | Detail/card components | S | Medium |
| R135 | 4.8 | Auction card with live bidding widget | 🟡 Partially implemented | Separate bidding page and detail counts; no integrated live widget on public card | `src/app/(_components)/Bid/Bidding.jsx`, `src/components/Lots/id/index.jsx` | Public detail does not embed full live bid widget | Reuse bidding logic | Add live widget to auction detail | Backend auction events | Detail/bidding components | M | High |
| R136 | 4.8 | Deposits and payments on public web | 🟡 Partially implemented | Deposit from lot detail; transactions list | `src/components/Lots/id/index.jsx`, `src/app/(_components)/cabinet/Transactions.jsx` | Payment checkout/final payment absent | Add payment flows | Deposit/payment UI | Backend payment APIs | Lot detail/deals/payments | L | Critical |
| R137 | 4.8 | Profile and KYC on public web | 🟡 Partially implemented | Profile edit exists; KYC absent | `src/app/(_components)/cabinet/Profile.jsx` | KYC missing | Add KYC center | Document upload/status | Backend KYC | Profile/cabinet | L | Critical |
| R138 | 4.8 | Seller cabinet listing creation wizard | 🟡 Partially implemented | Old one-page lot create form exists | `src/components/Lots/create/Createlot.jsx` | Vehicle wizard and docs absent | Refactor into wizard | Multi-step vehicle + auction form | Backend vehicle/auction endpoints | Seller cabinet/create | XL | Critical |
| R139 | 4.8 | Seller auction tracking | 🟡 Partially implemented | My lots show status/stats | `src/app/(_components)/cabinet/Mylots.jsx` | v2 auction tracking and deals absent | Reuse stats/cards | Add auction lifecycle/deal state | Backend v2 auction data | Seller cabinet | M | High |
| R140 | 4.8 | Seller deals | ❌ Not implemented | No deals pages | Dashboard switch lacks deals | Missing | Add deals module | Deal list/detail | Backend deals | Cabinet | L | High |
| R141 | 4.8 | Seller sales history | ❌ Not implemented | No sales history page | Cabinet menu lacks sales history | Missing | Add history page | Sold/closed deal listing | Backend sales history | Cabinet | M | Medium |
| R142 | 4.8 | Seller invoices and statements | ❌ Not implemented | No invoice/statement pages | `src/app/(_components)/cabinet/Transactions.jsx` | Missing | Add finance documents | Download/view documents | Backend invoices/statements | Cabinet finance | L | Medium |
| R143 | 4.8 | Finished-auction archive with sale results | ❌ Not implemented | No public archive page/filter; finished user tab only partial | `src/app/(_components)/Auctions.jsx`, `src/app/(_components)/cabinet/myauctions/Finished.jsx` | Public archive missing | Add archive route/list | Show sale prices/results | Backend finished auction search | Public marketplace | M | High |
| R144 | 4.9 | Telegram account binding deep link | N/A Outside the responsibility of this repository | Telegram bot requirement | No frontend evidence | Not web repo unless web binding UI desired | No frontend requirement by default | Optional display binding status | Bot/backend | N/A | M | Medium |
| R145 | 4.9 | Telegram browse/search/auction card | N/A Outside the responsibility of this repository | Bot requirement | No frontend evidence | Not frontend repo | None | None | Bot/backend | N/A | M | Medium |
| R146 | 4.9 | Telegram notifications and quick bid | N/A Outside the responsibility of this repository | Bot requirement | No frontend evidence | Not frontend repo | None | None | Bot/backend | N/A | L | Medium |
| R147 | 4.10 | Flutter iOS/Android app | N/A Outside the responsibility of this repository | This is web frontend | `package.json` Next/React dependencies | Mobile app not in repo | None | None | Mobile/backend APIs | N/A | XL | Medium |
| R148 | 4.11 | Dealer role assigned by admin after enhanced verification | ❌ Not implemented | Admin role list lacks DEALER | `src/components/UsersTable.jsx` | Dealer role and enhanced verification absent | Add role and verification UI | Admin dealer approval | Backend dealer role/profile | Admin users/dealer | M | High |
| R149 | 4.11 | Bulk listing import CSV/XLSX | ❌ Not implemented | No bulk import UI | No `csv`, `xlsx`, `bulk` source usage | Missing | Add dealer import flow | Upload/map/validate import | Backend bulk import | Dealer cabinet/admin | L | Medium |
| R150 | 4.11 | Batch auction scheduling | ❌ Not implemented | No batch scheduling | No source evidence | Missing | Add batch scheduling UI | Multi-select schedule tools | Backend batch endpoints | Dealer cabinet | L | Medium |
| R151 | 4.11 | Dealer REST API keys and OpenAPI | ❌ Not implemented | No API key UI | No `api_key` source usage | Missing | Add API key management page | View/create/revoke keys | Backend API keys/OpenAPI | Dealer cabinet/admin | M | Medium |
| R152 | 4.11 | Commission tiers and monthly consolidated invoicing | ❌ Not implemented | No dealer tier/invoice UI | Admin/cabinet finance lacks dealer tier | Missing | Add dealer finance tools | Tier and invoice display | Backend dealer tiers/invoices | Admin/dealer cabinet | L | Medium |
| R153 | 4.12 | Admin KYC moderation queue | ❌ Not implemented | Users table lacks KYC review | `src/app/(_components)/Admin/Users.jsx`, `src/components/UsersTable.jsx` | Queue/review docs absent | Add KYC queue | Review/approve/reject with reason | Backend KYC moderation | Admin | L | Critical |
| R154 | 4.12 | Admin vehicle listing/document moderation queue | 🟡 Partially implemented | Lot approval modal exists for old lots/images | `src/app/(_components)/Admin/ManageLots.jsx`, `src/app/(_components)/Admin/ApproveModal.jsx` | Vehicle docs/statuses missing | Refactor to vehicle listing/document queues | Show structured fields/docs/actions | Backend vehicle moderation | Admin moderation | L | Critical |
| R155 | 4.12 | Admin listing Q&A moderation queue | ❌ Not implemented | No Q&A moderation | Comments post directly | Missing | Add queue | Approve/reject questions | Backend listing_questions | Admin moderation | M | Medium |
| R156 | 4.12 | Admin auction moderation queue | 🟡 Partially implemented | Old lot approval covers listing/auction together | `src/app/(_components)/Admin/ManageLots.jsx` | Auction-specific approval absent | Separate listing and auction moderation | Auction schedule/terms approval | Backend auction moderation | Admin | L | High |
| R157 | 4.12 | Admin disputes queue | ❌ Not implemented | No disputes | No source evidence | Missing | Add disputes page | Review/resolve disputes | Backend disputes | Admin | L | High |
| R158 | 4.12 | Admin risk flags queue | ❌ Not implemented | No risk flags | No source evidence | Missing | Add risk queue | Review/dismiss flags | Backend risk flags | Admin | L | High |
| R159 | 4.12 | Reference data: makes/models/regions | 🟡 Partially implemented | Regions read-only; old lot types/subtypes managed | `src/queries/region.jsx`, `src/app/(_components)/Admin/lot-types/*` | Makes/models absent | Replace old reference pages | Add v2 reference pages | Backend refs | Admin | L | Critical |
| R160 | 4.12 | Reference data: commission %, dealer tiers | ❌ Not implemented | No settings | Admin lacks settings | Missing | Add platform settings UI | Commission/tier forms | Backend settings | Admin settings | M | High |
| R161 | 4.12 | Reference data: default deposit %, anti-sniping params | ❌ Not implemented | Deposit hardcoded 1%; no settings | `src/components/Lots/id/index.jsx` | Settings absent | Add settings display/edit | Admin settings pages | Backend settings | Admin/settings/auction form | M | High |
| R162 | 4.12 | Reference data: exchange rates | ❌ Not implemented | No exchange rate query/UI | No `exchange_rates` usage | Missing | Add exchange rate settings/read display | Admin/public rate UI | Backend rates | Admin/money display | M | Medium |
| R163 | 4.12 | Reference data: contract templates | ❌ Not implemented | No templates | No source evidence | Missing | Add template admin | Upload/edit/select template | Backend templates | Admin/contracts | M | Medium |
| R164 | 4.12 | Reference data: ToS versions | ❌ Not implemented | Privacy page and checkbox only | `src/app/(_components)/auth/Privacy.jsx`, `src/app/(_components)/auth/Register.jsx` | ToS version admin absent | Add ToS version management | Admin content/settings | Backend agreement versions | Admin/auth | M | Medium |
| R165 | 4.12 | User search | 🟡 Partially implemented | Client-side user search by first name/email | `src/components/UsersTable.jsx` | Server-side/paginated search unknown | Extend if needed | Add API-backed search | Backend user search | Admin users | S | Medium |
| R166 | 4.12 | User block/unblock | ✅ Implemented | Block action exists | `src/components/UsersTable.jsx`, `src/queries/users.jsx` | Label always says Block; unblock semantics depend on backend toggle | Polish UI | Show current active status/action label | Backend toggle or explicit endpoints | Admin users | S | Medium |
| R167 | 4.12 | Blacklist management | ❌ Not implemented | No blacklist UI | Admin users | Missing | Add blacklist tools | Manage blacklist identifiers | Backend blacklist | Admin users/risk | M | High |
| R168 | 4.12 | Role assignment including DEALER | 🟡 Partially implemented | Admin assigns ADMIN/BUYER/SELLER only | `src/components/UsersTable.jsx` | DEALER/MODERATOR absent | Extend role list from backend | Dynamic roles UI | Backend roles | Admin users | S | High |
| R169 | 4.12 | KYC review in user management | ❌ Not implemented | No KYC review fields/actions | `src/components/UsersTable.jsx` | Missing | Add KYC review modal | Review docs/status/reason | Backend KYC review | Admin users | L | Critical |
| R170 | 4.12 | Auction cancel | ❌ Not implemented | Admin can delete lots; no cancel auction action | `src/app/(_components)/Admin/ManageLots.jsx` | Cancel action missing | Add auction management actions | Cancel modal with reason | Backend auction cancel | Admin auctions | M | High |
| R171 | 4.12 | Force-finish auction | ❌ Not implemented | No force-finish | `src/app/(_components)/Admin/ManageLots.jsx` | Missing | Add action | Force finish modal/reason | Backend force finish | Admin auctions | M | Medium |
| R172 | 4.12 | Adjust auction end time | ❌ Not implemented | No admin adjust end time | `src/app/(_components)/Admin/ManageLots.jsx` | Missing | Add action | Date/time adjust modal | Backend adjust endpoint | Admin auctions | M | Medium |
| R173 | 4.12 | All admin auction actions with audit trail | ❓ Cannot verify from this repository | Some admin actions exist; audit viewer absent | Admin query files | Backend audit unknown | Add reason capture and audit links | Show reason fields, audit ids | Backend audit log | Admin | M | High |
| R174 | 4.12 | Financial reports deposits/payments/commissions/refunds/invoices | 🟡 Partially implemented | Payment history table shows id/user/amount/date only | `src/app/(_components)/Admin/PaymentHistory.jsx` | Deposits/commissions/refunds/invoices/export/status absent | Expand finance admin | Add filters/columns/reports | Backend reports | Admin finance | L | High |
| R175 | 4.12 | Export financial reports to XLSX/CSV | ❌ Not implemented | No export buttons | `src/app/(_components)/Admin/PaymentHistory.jsx` | Missing | Add export actions | Download/export UI | Backend or client export | Admin finance | M | Medium |
| R176 | 4.12, 5 | Audit log viewer | ❌ Not implemented | No audit log UI | No `audit` source usage | Missing | Add audit page | Table/filter/detail | Backend audit API | Admin | M | High |
| R177 | 5 | React/Next.js with SSR public web | 🟡 Partially implemented | Next 16 app, but public pages are client components | `package.json`, `src/app/page.tsx`, `src/app/(page)/lots/[id]/page.tsx` | SSR for listing/SEO not realized | Convert public data pages to server rendering | Use server components/metadata | Backend public endpoints | App routes | L | High |
| R178 | 5 | Web admin panel React | ✅ Implemented | Admin panel exists | `src/app/(page)/admin/page.tsx`, `src/app/(_components)/Admin/Admin.jsx` | Needs v2 feature expansion | Reuse shell | Add v2 pages | Backend endpoints | Admin | M | Medium |
| R179 | 5 | S3-compatible object storage for photos/documents | ❓ Cannot verify from this repository | Frontend uploads image files to backend and displays URLs | `src/queries/lots.jsx`, `src/components/ImageUploadModal.jsx` | Storage backend/CDN cannot be verified; documents absent | No direct frontend storage change | Continue multipart uploads | Backend storage | Upload components | S | Medium |
| R180 | 5 | Performance: 1,000 concurrent users per auction, bid latency <500ms, search <1s | N/A Outside the responsibility of this repository | Frontend has no load tests | No test files | Backend/infrastructure performance cannot be verified | Add client perf hygiene later | Efficient subscriptions/polling | Backend/load tests | Bidding/search | M | High |
| R181 | 5 | Scalability: stateless API, Redis pub/sub fan-out | N/A Outside the responsibility of this repository | Frontend only connects to STOMP | `src/hooks/useStomp.js` | Infra/backend cannot be verified | No frontend change except stable reconnect/fallback | None | Backend/DevOps | N/A | High |
| R182 | 5 | Media pipeline CDN thumbnails WebP EXIF stripping watermark | ❓ Cannot verify from this repository | Frontend crops images client-side and displays URLs | `src/utils/imageCropper.jsx`, `src/components/ImageUploadModal.jsx` | Backend media processing cannot be verified | Add thumbnail/primary display if available | Use returned variants | Backend media pipeline | Upload/gallery | M | Medium |
| R183 | 5 | Security OWASP/TLS/password hashing/rate limiting/data protection | ❓ Cannot verify from this repository | Frontend stores JWT in localStorage and hardcodes config | `src/api/api.js`, `src/context/UserContext.jsx`, `src/firebase.js` | Backend security cannot be verified; frontend has token/config concerns | Refactor config and auth handling | Env config, safer token handling if feasible | Backend security | API/auth/firebase config | M | High |
| R184 | 5 | Availability/backups/PITR | N/A Outside the responsibility of this repository | Infra requirement | No evidence in frontend | Not frontend responsibility | None | None | DevOps/backend | N/A | Medium |
| R185 | 5 | Observability Prometheus/Grafana/logging/Sentry/alerting | N/A Outside the responsibility of this repository | No Sentry or frontend observability found | `package.json` lacks Sentry | Mostly infra/backend; optional frontend error tracking absent | Add frontend error tracking only if desired | Sentry/browser telemetry | DevOps/backend | Config/providers | M | Medium |
| R186 | 5 | Git-based CI/CD, tests, DB migrations, staging, rolling/blue-green | N/A Outside the responsibility of this repository | Dockerfile exists; no CI files found | `Dockerfile`, `rg --files` no `.github`/GitLab CI shown in listed files | CI/CD cannot be verified here | Add frontend CI if in repo scope | Build/test pipeline config | DevOps/backend migrations | CI files | M | Medium |
| R187 | 5 | Versioned REST `/api/v1`, OpenAPI/Swagger | ❓ Cannot verify from this repository | Frontend calls unversioned endpoints like `/lot/all` | `src/queries/lots.jsx`, `src/queries/index.jsx` | Versioned API not used | Update API client once backend versioned endpoints exist | Switch query URLs to `/api/v1` contract | Backend versioned API/OpenAPI | `src/queries/*` | L | High |
| R188 | 5 | Append-only audit log for critical actions | N/A Outside the responsibility of this repository | No audit viewer; write behavior backend-only | No `audit` usage | Backend cannot be verified | Add viewer/action reason UI | Display logs | Backend audit log | Admin | M | High |
| R189 | 5 | Localization UZ/RU/EN interfaces | 🟡 Partially implemented | Locale objects for UZ/RU/EN and switcher exist | `src/locales/*.jsx`, `src/components/Header/LangSwitch.jsx`, `src/app/providers.tsx` | Many active marketplace strings are hardcoded Uzbek; saved language not initialized in provider | Continue using react-intl, remove hardcoded copy | Internationalize all visible text and persist locale | Backend localized dictionaries if needed | Most components/locales | L | Medium |
| R190 | 6 | Phase 1 database migration v1 lots to v2 vehicles/auctions | N/A Outside the responsibility of this repository | Frontend still depends on v1 entities | `src/queries/lots.jsx` | Backend/database migration outside repo | Coordinate after backend migration | Add compatibility/adapters if gradual migration | Backend migration | Queries/types | XL | Critical |
| R191 | 6 | Phase 6 unit tests for bidding logic and core flows | ❌ Not implemented | No tests found | `rg --files -g '*test*' -g '*spec*'` returned none | Frontend tests absent | Add tests as refactors occur | Component/query utility tests | Backend tests separate | New test files | M | Medium |
| R192 | General technical | Build scripts and app architecture | 🟡 Partially implemented | Scripts are `next dev/build/start`; README still includes CRA docs; duplicate legacy `src/pages` tree remains | `package.json`, `README.md`, `src/pages/*`, `next.config.ts` | Dead/legacy code and docs create confusion | Clean after migration plan | Remove unused legacy tree when safe | None | README, `src/pages`, app routes | M | Medium |
| R193 | General technical | API base URL environment usage | ❌ Not implemented | API base URL is hardcoded; `.env` only has `VITE_SOCKET_URL`, not used by Next code | `src/api/api.js`, `.env` key names | Missing env-based config | Use `NEXT_PUBLIC_API_URL` | Central config module | Deployment env vars | API client/config | S | High |
| R194 | General technical | WebSocket environment usage | ❌ Not implemented | STOMP URL hardcoded to `http://localhost:8989/ws` | `src/hooks/useStomp.js` | Production socket URL broken unless localhost is intended | Use env-configured socket URL | `NEXT_PUBLIC_SOCKET_URL` | Deployment env vars | `useStomp` | S | Critical |
| R195 | General technical | Active admin compile safety | ❌ Not implemented | Active admin sidebar and ModerateContent call `useNavigate()` without import/definition | `src/app/(_components)/Admin/Sidebar.jsx`, `src/app/(_components)/Admin/ModerateContent.jsx` | Build/runtime failure likely | Replace with Next router | Use `useRouter()` | None | Admin sidebar/moderate content | S | Critical |

## 1. Executive Summary

The project is still substantially a generic auction platform, not a vehicle-only AUCTION v2 implementation. The strongest evidence is the active use of `Lot`, `lotType`, `subType`, dynamic `attributes`, generic categories, and `/lot/...` APIs throughout the query layer, seller forms, listing detail, admin pages, and cards.

The current implementation partially matches the DOCX in broad platform shape: it has authentication, roles, public marketplace pages, seller/admin cabinets, image upload/cropping, deposits, favorites/likes, transactions, notifications, and WebSocket bidding. However, those features are mostly built around the old v1 generic lot model.

The main architectural gap is the missing v2 domain split:

- Target: `Vehicle` contains structured car data and documents.
- Target: `Auction` contains trading parameters, bidding, deposits, reserve/currency/increments, lifecycle, and post-sale deal state.
- Current: one generic `lot` object mixes title, description, type/category, dynamic attributes, images, auction timing, start price, increment, approval, and bidding.

The strongest implemented features that can be reused are:

- Next.js App Router shell and public routes.
- JWT bearer API client and user context.
- Email/password registration/login with OTP-style verification.
- Google login and Firebase Cloud Messaging setup.
- Image upload/cropping/gallery/fullscreen viewing.
- STOMP WebSocket subscription pattern for live bids and notifications.
- Admin shell with users/lots/bids/transactions sections.
- Seller cabinet with lot management and stats.
- UZ/RU/EN locale infrastructure.

The riskiest missing features are:

- Structured vehicle catalog and VIN workflow.
- KYC document upload/review and KYC gating for selling/bidding.
- v2 auction contract with USD/UZS, reserve price, deposit percent, anti-sniping, auto-bid, server authoritative min-bid/countdown.
- Real payment checkout/final payment/invoices/statements.
- Post-sale contracts, handover, disputes, second-chance offers, and deal statuses.
- Admin moderation queues and audit log.
- SEO requirements: SSR listing data, sitemap, structured Vehicle/Offer data, per-listing metadata, hreflang.

## 2. Existing Features That Can Be Reused

| Feature | Why reusable | Evidence | Notes |
|---|---|---|---|
| Next App Router routes | Active web route tree already exists | `src/app/(page)/*/page.tsx`, `next.config.ts` | Public pages need SSR/metadata refactor, but routing shell is usable |
| Auth UI and OTP modal | Email/password, phone field, OTP modal and resend flow exist | `src/app/(_components)/auth/Register.jsx`, `src/app/(_components)/auth/Login.jsx`, `src/queries/index.jsx` | Needs KYC, ToS versioning, refresh tokens, and phone/SMS alignment |
| User context | Central current-user fetch/login/logout pattern exists | `src/context/UserContext.jsx` | Should be extended with KYC/dealer/moderator fields |
| Role gating pattern | Admin and seller checks exist | `src/app/(_components)/Admin/Admin.jsx`, `src/components/Lots/create/Createlot.jsx` | Needs centralized permissions and KYC eligibility |
| Image upload/crop/gallery | Reusable for vehicle photos | `src/components/ImageUploadModal.jsx`, `src/utils/imageCropper.jsx`, `src/components/Lots/id/index.jsx` | Must add min 5/max 30 and primary photo |
| STOMP hook | Reusable WebSocket client pattern | `src/hooks/useStomp.js` | Must move URL to env and switch lot topics to auction topics |
| Bidding UI skeleton | Has live highest bid, bid list, bid modal | `src/app/(_components)/Bid/Bidding.jsx` | Must become server-authoritative and auction-based |
| Favorites/likes UI | Watchlist-like behavior exists | `src/queries/lots.jsx`, `src/app/(_components)/cabinet/Likes.jsx` | Rename/refactor to auction favorites/watchlist |
| Notifications UI | FCM and STOMP notification surfaces exist | `src/firebase.js`, `src/lib/firebase.js`, `public/firebase-messaging-sw.js`, `src/app/(_components)/cabinet/NotificationsModal.jsx` | Needs event-aware payloads/actions |
| Admin shell | Navigation and guarded admin layout exist | `src/app/(_components)/Admin/Admin.jsx` | Needs v2 modules and compile fixes |
| Cabinet shell | Buyer/seller dashboard navigation exists | `src/app/(_components)/cabinet/Dashboard.jsx` | Needs KYC, deals, invoices, saved searches |
| Localization infrastructure | UZ/RU/EN message objects and switcher exist | `src/locales/*.jsx`, `src/locales/index.js`, `src/components/Header/LangSwitch.jsx` | Many hardcoded strings remain |

## 3. Features That Need Refactoring

| Feature | Current implementation | Required target implementation | Migration risk |
|---|---|---|---|
| Generic lots | `/lot/...` APIs and `lot` objects drive marketplace, detail, seller, admin, bidding | `Vehicle` + `Auction` entities with separate APIs and UI contracts | XL: affects almost every domain component |
| Lot types/subtypes/attributes | Admin manages `lot-type`, `subType`, `attribute`; seller selects `lotTypeId` and dynamic attributes | Admin manages vehicle makes/models and fixed vehicle enums/fields | XL: must replace dynamic form generation with structured vehicle form |
| Seller create/edit | One-page lot form with title, price, increment, region, lot type, 4-10 images | Vehicle listing wizard plus auction parameter step and document uploads | XL: dependent on backend v2 APIs |
| Bidding | STOMP topics use `lotId`; local min bid/countdown calculations; localhost socket | Auction-scoped STOMP/REST with server-authoritative min bid, current price, countdown, anti-sniping | L: real-time behavior and API contract change |
| Deposit | Hardcoded 1% UI estimate, `/deposit/depositToLot` | Auction deposit percent and status model BLOCKED/REFUNDED/APPLIED/FORFEITED | M: backend state drives UI |
| Admin moderation | Old lot approval/decline modal | Separate KYC, vehicle docs/listings, auctions, Q&A, disputes, risk queues | L: multiple new admin modules |
| Favorites | Like/unlike lots | Watch auction favorites with alert semantics | M: can reuse UI but contract changes |
| Comments/reviews | Generic comments with positive/negative/neutral and seller replies | Listing Q&A with moderation plus post-deal 1-5 mutual reviews | M: split into two features |
| Localization | Mixed `react-intl` plus many hardcoded Uzbek strings | Full UZ/RU/EN coverage and hreflang-ready routes/metadata | L: broad text cleanup |
| Config | Hardcoded API/socket/Firebase/Google config | Environment-driven config suitable for staging/prod | M: must coordinate deploy envs |
| Legacy routes | `src/pages` React Router tree remains alongside App Router | Remove after verifying all functionality has App Router equivalent | M: gradual cleanup possible |

### Old Generic Lot Structures Still Existing

- Query modules: `src/queries/lots.jsx`, `src/queries/lot-types.jsx`, `src/queries/subtypes.jsx`, `src/queries/attributes.jsx`, `src/queries/bid.jsx`, `src/queries/deposit.jsx`, `src/queries/search.jsx`.
- Seller forms: `src/components/Lots/create/Createlot.jsx`, `src/components/EditLotForm.jsx`.
- Public screens: `src/app/page.tsx`, `src/app/(_components)/Auctions.jsx`, `src/components/Lots/*`, `src/components/Lots/id/index.jsx`.
- Bidding: `src/app/(_components)/Bid/Bidding.jsx`.
- Cabinet: `src/app/(_components)/cabinet/Mylots.jsx`, `src/app/(_components)/cabinet/MyAuctions.jsx`, `src/app/(_components)/cabinet/Likes.jsx`.
- Admin: `src/app/(_components)/Admin/ManageLots.jsx`, `src/app/(_components)/Admin/ApproveModal.jsx`, `src/app/(_components)/Admin/ManageBids.jsx`, `src/app/(_components)/Admin/lot-types/*`.
- Legacy duplicate tree: `src/pages/**`.

### What Can Be Reused

- App Router route shells and cabinet/admin layouts.
- Image upload/gallery/crop utilities.
- STOMP client pattern and notification modal pattern.
- Existing card/list/detail visual components after their data contract is replaced.
- Admin table patterns and modal patterns.
- User context, auth pages, and locale provider pattern.

### What Must Be Refactored

- All `lotId` domain APIs and components to `vehicleId`/`auctionId`.
- All `lotType`/`subType`/`attributes` UI to make/model and fixed vehicle fields.
- Money formatting and currency display.
- Bidding countdown/minimum bid logic.
- Admin moderation model.
- Seller create/edit flow.

### What Must Be Removed

- User-facing non-vehicle categories and mock data references: electronics, real estate, jewelry, furniture, antiques, home goods, art, collectibles.
- Lot type/subtype/dynamic attribute management after v2 make/model replacement is ready.
- Legacy `src/pages` tree after verifying no runtime imports depend on it.
- CRA README sections once Next-only setup is confirmed.

### Gradual Migration Possibility

A gradual migration is possible if backend exposes compatibility endpoints or parallel v2 endpoints. Recommended strategy:

1. Add v2 query modules and lightweight domain adapters without deleting v1 UI.
2. Convert public marketplace/detail to read v2 auction/vehicle data first.
3. Convert seller creation to v2 vehicle + auction wizard.
4. Convert bidding to auctionId and server min-bid/countdown.
5. Convert admin moderation and reference data.
6. Remove lot types/subtypes/attributes and legacy `src/pages` only after all routes are v2.

This avoids breaking current public browsing while the backend catches up.

## 4. Completely Missing Features

### Frontend

- Structured vehicle create/edit form: make, model, year, VIN, mileage, engine, fuel, transmission, drivetrain, body, color, condition.
- VIN input validation, VIN decode, duplicate VIN error handling.
- Vehicle document upload/status UI.
- Primary photo selection and 5-30 photo limits.
- Vehicle-only search filters and functional query-param filtering.
- Saved searches list/edit/delete.
- KYC center for individuals and organizations.
- Deal pages: contracts, payments, handover, disputes, second-chance, reviews.
- Dealer cabinet: bulk import, API keys, tiers, consolidated invoices.
- Admin queues: KYC, documents, Q&A, auctions, disputes, risk flags, audit log.
- SEO: sitemap, structured data, per-listing metadata, hreflang/localized routes.
- Polling fallback for WebSocket bidding.
- Auto-bid UI.
- Reserve price and currency-aware auction parameters.

### Backend

Cannot be verified from this repository unless matching APIs already exist elsewhere:

- v2 database schema and migration.
- VIN checksum/decode/duplicate enforcement.
- Auction lifecycle, anti-sniping, auto-bid, bid serialization, min-bid validation.
- Deposit blocking/refund/application/forfeiture.
- Payment gateways, idempotent callbacks, ledger, commission, invoices, receipts.
- Contract generation/signing, handover, disputes, second-chance offers, review aggregation.
- Anti-fraud detection, blacklist, velocity limits, audit log.
- Versioned `/api/v1` OpenAPI contract.

### Mobile

- Flutter iOS/Android app and all mobile buyer/seller/KYC/push flows.

### Telegram

- Bot account binding.
- Bot browsing/search/auction cards.
- Bot notifications and confirmed quick bidding.

### DevOps/Infrastructure

- CI/CD evidence.
- Staging/rolling or blue-green deployment evidence.
- Monitoring/logging/alerting evidence.
- CDN/media processing evidence.
- Backups/PITR evidence.
- Load/security testing evidence.

## 5. Dependency Order

1. Backend v2 API contract and frontend domain model definitions.
2. Environment/config cleanup for API and WebSocket URLs.
3. Vehicle reference dictionaries: makes, models, regions, enums.
4. Vehicle read model and public marketplace cards/detail using v2 data.
5. Vehicle search/filter/sort query contract.
6. Seller vehicle listing wizard with photos and documents.
7. Admin vehicle/document moderation and listing lifecycle.
8. Auction model: reserve, currency, increment, deposit percent, start/end time.
9. Auction detail/bidding route migration from `lotId` to `auctionId`.
10. Server-authoritative min-next-bid, countdown, WebSocket topics, and polling fallback.
11. KYC profile/document flow.
12. Enforce KYC + deposit eligibility before seller create and buyer bid.
13. Payments and deposit status visibility.
14. Final payment/invoices/statements.
15. Contracts and deal timeline.
16. Handover confirmations.
17. Disputes.
18. Winner default, forfeiture, second-chance offers.
19. Reviews and public profile ratings.
20. Favorites/watchlist event alerts.
21. Saved searches and matching notifications.
22. Dealer tools.
23. Admin audit log/risk flags/blacklist.
24. SEO/hreflang/sitemap/structured data after public v2 data is stable.
25. Remove old v1 lot-type/subtype/attribute UI and legacy `src/pages` tree.

## 6. Recommended Prompt Plan

| # | Prompt title | Purpose | Exact scope | Dependencies | Type | Complexity | Files/areas likely affected |
|---|---|---|---|---|---|---|---|
| 1 | Stabilize configuration and build blockers | Make current app reliably configurable and buildable before v2 refactors | Env-driven API/socket config; fix `useNavigate` in active App Router components; no domain changes | None | Frontend-only | M | `src/api/api.js`, `src/hooks/useStomp.js`, admin sidebar/moderate content, env docs |
| 2 | Add v2 domain contract layer | Introduce vehicle/auction types and query modules without switching UI | Add `vehicles` and `auctions` query modules/types/adapters matching backend contract | Backend API contract needed | Frontend + backend support | M | `src/queries`, new domain files |
| 3 | Replace public marketplace data model | Make `/auctions` and cards consume v2 auction/vehicle data | Cards/list/detail read structured vehicle + auction fields; remove non-vehicle categories from active UI | Prompt 2 | Frontend + backend support | L | `src/app/(_components)/Auctions.jsx`, `src/components/Lots/*` |
| 4 | Vehicle reference data admin | Replace lot-type admin with make/model/region/enums references | Admin CRUD for makes/models; hide old lot-type menu only after replacement | Prompt 2, backend refs | Frontend + backend support | L | `src/app/(_components)/Admin/*`, `src/queries` |
| 5 | Vehicle listing wizard | Replace old create lot form with multi-step vehicle + auction draft wizard | Structured vehicle fields, VIN UI, photos 5-30 primary, documents, auction params | Prompts 2 and 4, backend create endpoints | Frontend + backend support | XL | `src/components/Lots/create/Createlot.jsx`, new wizard components |
| 6 | Vehicle detail page | Show complete vehicle profile and document statuses | Structured fields, seller info, photo gallery, Q&A placeholder only if API exists | Prompt 3 | Frontend + backend support | M | `src/components/Lots/id/index.jsx` |
| 7 | Auction bidding v2 | Move bidding from lotId to auctionId | Server min-next-bid, currency, STOMP auction topics, polling fallback | Prompts 2, 3, backend bidding | Frontend + backend support | L | `src/app/(_components)/Bid/Bidding.jsx`, `src/hooks/useStomp.js` |
| 8 | KYC center | Add buyer/seller organization/individual KYC workflow | Document upload, status/reason display, profile fields | Backend KYC APIs | Frontend + backend support | L | `src/app/(_components)/cabinet/Profile.jsx`, new KYC components |
| 9 | KYC and deposit eligibility gates | Enforce approved KYC and deposit before bidding/selling | Route/action gates, disabled states, explanatory CTAs | Prompts 5, 7, 8 | Frontend + backend support | M | Create/detail/bidding/dashboard |
| 10 | Admin moderation queues | Add KYC, vehicle docs/listings, auction, Q&A queues | Queue tables, review modals, reasons | Prompts 4,5,8 | Frontend + backend support | XL | Admin components |
| 11 | Currency and exchange rates | Implement USD/UZS display and CBU equivalent | Shared money formatter, currency filters, rate query | Backend rates and v2 currency fields | Frontend + backend support | M | Money displays/forms/filters |
| 12 | Payments and invoices | Add deposit/final payment checkout and invoices/statements | Payment method selection, status badges, invoice downloads | Payments backend | Frontend + backend support | L | Transactions, deal/payment pages |
| 13 | Post-sale deals | Add contracts, payment, handover, dispute, default/second-chance timeline | Buyer/seller deal pages and admin dispute queue | Payments/contracts backend | Frontend + backend support | XL | Cabinet/admin new deal modules |
| 14 | Reviews and public profiles | Add post-deal mutual rating and public seller profile | 1-5 review form, aggregate profile display | Deal closure backend | Frontend + backend support | M | Deal/profile/cards |
| 15 | Saved searches and watchlist notifications | Implement saved filter sets and auction watchlist events | Save/edit/delete searches; notification preferences/deep links | Search/notification backend | Frontend + backend support | M | Auctions, cabinet, notifications |
| 16 | Dealer tools | Add dealer role, bulk import, API keys, tiers | Admin dealer assignment and dealer cabinet pages | Dealer backend | Frontend + backend support | L | Users/admin/cabinet |
| 17 | SEO public marketplace | Add sitemap, structured data, dynamic metadata, hreflang | Public pages only, no UX rewrite | Stable v2 public data | Frontend + backend support | L | App routes/layout/sitemap |
| 18 | Remove v1 architecture | Delete/hide old lot types/subtypes/attributes/pages | Safe cleanup after v2 replacement | Prompts 3-17 | Frontend-only | L | `src/pages`, lot-type admin, old query modules |

## 7. First Five Recommended Prompts

### Prompt 1: Stabilize Configuration and Current Build Blockers

Use the repository audit in `AUCTION_V2_FRONTEND_AUDIT.md` as context. Do not implement any AUCTION v2 domain functionality yet.

Purpose: make the current Next app safer to configure and remove obvious active App Router build/runtime blockers before deeper refactors.

Scope:

- Replace hardcoded API base URL in `src/api/api.js` with a Next-compatible environment variable, for example `NEXT_PUBLIC_API_URL`, while preserving the current production URL as a documented fallback only if the repository pattern requires it.
- Replace hardcoded WebSocket URL in `src/hooks/useStomp.js` with a Next-compatible environment variable, for example `NEXT_PUBLIC_SOCKET_URL`.
- Fix active App Router components that call `useNavigate()` without definition/import by using `useRouter()` from `next/navigation`.
- Do not touch vehicle/auction business logic.
- Do not remove old lot-type or lot APIs in this prompt.
- Do not introduce fake endpoints or placeholder APIs.

Acceptance criteria:

- Existing API calls still use the same path suffixes.
- WebSocket hook still returns a STOMP client and keeps reconnect behavior.
- Admin sidebar and moderate content no longer reference undefined `useNavigate`.
- No unrelated UI redesign.
- Run available validation: `npm run build` if feasible; otherwise report the exact blocker. Also run any lint/typecheck script that exists. If no test script exists, state that clearly.
- Completion report must list changed files and remaining blockers.

Dependencies: none.

Type: frontend-only.

Estimated complexity: M.

Likely files: `src/api/api.js`, `src/hooks/useStomp.js`, `src/app/(_components)/Admin/Sidebar.jsx`, `src/app/(_components)/Admin/ModerateContent.jsx`, possibly README/env documentation.

### Prompt 2: Add Vehicle and Auction Contract Layer Without Switching UI

Use the repository audit in `AUCTION_V2_FRONTEND_AUDIT.md` as context. Preserve all currently working generic lot functionality.

Purpose: prepare a typed v2 frontend contract layer for Vehicle and Auction without rewriting screens yet.

Scope:

- Add new query/domain modules for v2 `vehicles` and `auctions`.
- Model only fields present in the DOCX and confirmed backend API contract. If backend endpoints are missing or unknown, stop and report the missing contract instead of inventing paths.
- Keep existing `src/queries/lots.jsx`, `bid.jsx`, `deposit.jsx`, `lot-types.jsx`, `subtypes.jsx`, and `attributes.jsx` intact.
- Add shared constants/enums for vehicle fuel type, transmission, drivetrain, condition grade, auction increment type, currency, listing status, and auction status only if they are used by the new contract layer.
- Do not wire UI to fake data.

Acceptance criteria:

- Existing pages continue to import old query modules unchanged.
- New modules compile and expose clear query/mutation functions for confirmed endpoints only.
- No placeholder endpoints, no mock responses, no static vehicle sample data.
- Run `npm run build` or the closest available validation and report results.
- Completion report must list changed files, added exports, and backend blockers.

Dependencies: confirmed backend v2 API contract or explicit endpoint list.

Type: requires backend support.

Estimated complexity: M.

Likely files: new `src/queries/vehicles.*`, new `src/queries/auctions.*`, maybe new `src/constants/vehicle.*` and `src/constants/auction.*`.

### Prompt 3: Convert Public Marketplace Cards to Vehicle-Only v2 Data

Use the repository audit in `AUCTION_V2_FRONTEND_AUDIT.md` as context. Preserve current browsing and favorites behavior where possible.

Purpose: move public marketplace display away from generic categories and toward vehicle-only auction cards.

Scope:

- Update active `/auctions` page and card/list components to consume confirmed v2 auction/vehicle data from the contract layer.
- Remove user-facing non-vehicle categories such as electronics, jewelry, antiques, real estate, furniture, home goods, and art from active UI.
- Display vehicle make, model, year, mileage, region/city, primary image, start/current price, currency, auction status, and end time if available from backend.
- Keep the old route paths temporarily if changing routes would break existing navigation; document any route naming debt.
- Do not implement seller create/edit, bidding refactor, KYC, payments, or admin changes in this prompt.
- Do not use fake vehicle data.

Acceptance criteria:

- `/auctions` renders vehicle-only cards from backend data.
- Grid/list views still work.
- If favorites are still backed by old lot endpoints, preserve behavior and clearly label the remaining migration blocker in the report.
- Static non-vehicle marketplace categories are removed from active render paths.
- Run `npm run build` or report exact blockers.
- Completion report must list changed files and any backend field gaps.

Dependencies: Prompt 2 and backend v2 list endpoint.

Type: requires backend support.

Estimated complexity: L.

Likely files: `src/app/(_components)/Auctions.jsx`, `src/components/Lots/LotCard.jsx`, `src/components/Lots/LotCardGrid.jsx`, `src/components/Lots/LotCardList.jsx`, `src/components/Lots/TrendingLotCard.jsx`, `src/components/Lots/Upcoming/*`.

### Prompt 4: Replace Lot-Type Admin With Vehicle Make/Model Reference Admin

Use the repository audit in `AUCTION_V2_FRONTEND_AUDIT.md` as context. Do not delete old lot-type code until the replacement is working and reviewed.

Purpose: create v2 admin reference management for vehicle makes and models, replacing the old conceptual dependency on lot types/subtypes.

Scope:

- Add admin UI for vehicle makes and models using confirmed backend endpoints.
- Models must belong to a make.
- Keep region read behavior unchanged unless backend provides admin region CRUD and the task explicitly includes it.
- Update admin navigation to expose vehicle reference data.
- Do not remove old `lot-types` files in this prompt; hide or separate navigation only if the new pages are complete.
- Do not create fake reference data or local-only dictionaries.

Acceptance criteria:

- Admin can list, create, edit, and delete/deactivate makes if backend supports those actions.
- Admin can list, create, edit, and delete/deactivate models under a selected make if backend supports those actions.
- UI handles loading, empty, and backend validation error states.
- Existing admin users/lots/bids/transactions pages remain accessible.
- Run `npm run build` or report exact blockers.
- Completion report must list changed files and backend actions that were not available.

Dependencies: Prompt 2 and backend make/model endpoints.

Type: requires backend support.

Estimated complexity: L.

Likely files: `src/app/(_components)/Admin/Admin.jsx`, `src/app/(_components)/Admin/Sidebar.jsx`, new admin reference components, new or existing v2 query modules.

### Prompt 5: Build Vehicle Listing and Auction Draft Wizard

Use the repository audit in `AUCTION_V2_FRONTEND_AUDIT.md` as context. Preserve existing seller access patterns and do not rewrite unrelated cabinet pages.

Purpose: replace the old generic `Createlot` form with a v2 vehicle-only listing wizard once backend vehicle/auction draft APIs exist.

Scope:

- Implement a multi-step seller wizard for:
  - vehicle profile: make, model, year, VIN, mileage, engine volume, fuel type, transmission, drivetrain, body type, color, condition grade, region/city, description;
  - VIN validation: 17 characters client-side; if backend VIN decode endpoint exists, call it and auto-fill fields; if it does not exist, report the blocker and do not fake decode;
  - photos: minimum 5, maximum 30, primary photo selection;
  - documents: title/registration certificate, customs clearance, optional inspection report, with upload/status UI only against confirmed endpoints;
  - auction draft parameters: start price, optional reserve price, currency USD/UZS, increment type/value, deposit percent, start/end time.
- Preserve role gating, but do not claim KYC enforcement unless Prompt 8/9 or backend eligibility already exists.
- Do not use old `lotTypeId`, subcategories, or dynamic attributes in the new wizard.
- Do not remove old edit/list pages unless they are replaced in scope and accepted.

Acceptance criteria:

- Seller can complete the wizard only with valid required fields.
- VIN field enforces 17-character validation and displays backend duplicate/decode errors if returned.
- Photo count and primary photo rules are enforced in UI.
- Document upload controls are shown only when backed by real endpoints.
- Auction fields support USD/UZS and fixed/percentage increments.
- No fake data, no placeholder APIs.
- Run `npm run build` or report exact blockers.
- Completion report must list changed files, backend blockers, and remaining old-v1 dependencies.

Dependencies: Prompts 2 and 4; backend vehicle, image, document, and auction draft endpoints.

Type: requires backend support.

Estimated complexity: XL.

Likely files: `src/components/Lots/create/Createlot.jsx`, `src/app/(_components)/cabinet/Dashboard.jsx`, image upload utilities, new wizard components, vehicle/auction query modules.
