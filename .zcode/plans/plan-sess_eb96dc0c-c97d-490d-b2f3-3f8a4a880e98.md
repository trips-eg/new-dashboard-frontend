# Custom Trips Feature — Implementation Plan

## Step 0 — Verify against the live API spec
Fetch `https://web-api.trips.eg/swagger/v1/swagger.json` via curl and extract the `CustomTripSetting` / `VendorTripRequests` paths + all `CustomTrip*` / `VendorTrip*` schemas. Verify: exact endpoint routes, DTO field names/casing, and the pagination total field (`count` vs `itemsCount` — the md doc and existing pages disagree; service will read `res.data.count ?? res.data.itemsCount ?? res.data.totalCount` defensively). Adjust models below to match the real spec before writing components.

## 1. Enums (new file `src/app/shared/Enums/custom-trip.ts`)
All values confirmed from backend screenshots; label maps use the backend `DisplayName` strings (En + Ar) exactly:

- **`CustomTripType`**: InsideEgypt=1 (Inside Egypt / داخل مصر), OutsideEgypt=2 (Outside Egypt / خارج مصر)
- **`CustomTripRequestStatus`**: Submitted=1 (تم التقديم), ReceivingOffers=2 (تلقى العروض), Expired=3 — displays as "Closed" / مغلق, Cancelled=4 (ملغي), OfferSelected=5 (تم اختيار عرض), Booked=6 (تم الحجز)
- **`VendorTripOfferStatus`**: Pending=1 (قيد الانتظار), Accepted=2 (مقبول), Rejected=3 (مرفوض), Selected=4 (محدد)
- **`OfferPaymentType`**: Deposit=1 (Deposit / عربون), FullPayment=2 (Full Payment / دفع كامل)

Each enum gets En/Ar label maps + PrimeNG severity map for badges (request: Submitted→info, ReceivingOffers→primary, Expired→secondary, Cancelled→danger, OfferSelected→warning, Booked→success; offer: Pending→warning, Accepted→success, Rejected→danger, Selected→info).

## 2. Models (new file `src/app/shared/model/icustom-trip.ts`)
Interfaces matching the verified spec: `ICustomTripSetting`, `IVendorTripRequest`, `IVendorTripRequestDetails` (+childrenAges), `ICreateVendorTripOffer`, `IAdminVendorOffer`, `IAdminCustomTripRequest` (customer info, statusName/tripTypeName, remainingSeconds, viewsCount, offersCount, offers[]), `IPaginated<T> { pageIndex, pageSize, count, data }`.

## 3. Service & endpoints
**`helpers.ts`** — add `APIs.customTrips`: `CustomTripSetting/GetCustomTripSettings`, `CustomTripSetting/UpdateCustomTripSettings`, `VendorTripRequests/all-requests`, `VendorTripRequests/{id}` (GET), `VendorTripRequests/Offers`, `VendorTripRequests/my-submitted-offers`, `VendorTripRequests/admin/all-requests` (routes double-checked in step 0).

**`src/app/shared/services/custom-trips.service.ts`** — modeled on `coupons.service.ts`: `inject(ApiCallerService)`, thin Observable-returning methods. Admin offer submission reuses existing `VendorService.getAllVendors()` for the vendor selector.

## 4. Pages (under `src/app/demo/pages/custom-trips/`)

**a. `custom-trip-settings/`** (admin) — modeled on `coupon-settings`: FormArray of setting rows (nameEn/nameAr label + numeric "days" input, min validation), single Save → `UpdateCustomTripSettings([{id, value}])`, toast + reload.

**b. `vendor-trip-requests/`** (vendor) — lazy `p-table` (coupons-list skeleton): toolbar search + Destination text filter + CustomTripType dropdown (2 options). Columns: destination, trip type badge, travel date (`date: 'mediumDate'`), days, adults/children, flight/visa indicators, **countdown** column, my-offer status badge + price. Row click → details dialog.

**c. `vendor-request-dialog/`** — `DynamicDialog` (like `CouponDetailsComponent`): full request details incl. childrenAges, flight/visa/notes, countdown; **offer form** (reactive): price (required), paymentType radio (عربون Deposit / دفع كامل Full Payment), depositAmount (required, shown only when Deposit), vendorNotes → `POST /Offers` → toast → close + list refresh. Opened by an **admin** (`ConfigureService.userRoles()` check): adds mandatory vendor dropdown from `VendorService`.

**d. `vendor-my-offers/`** (vendor) — same list skeleton against `my-submitted-offers`; emphasizes myOffer* columns (price, paymentType, deposit, offer status badge).

**e. `admin-trip-requests/`** (admin) — lazy `p-table` with row expansion: customer name/phone, destination, trip type, travel date, pax, request status badge, viewsCount/offersCount chips, countdown. Expanded row renders nested `offers[]` inner table (vendor logo+name, price, paymentTypeName, depositAmount, statusName badge, submitted date) + "Add offer on behalf of vendor" button opening the dialog in admin mode.

**f. `shared/countdown-timer/`** — standalone component: inputs `expiresAt` (vendor, ISO date diff vs client now) or `remainingSeconds` (admin), ticks via `setInterval` (cleared in `ngOnDestroy`), shows `HH:MM:SS`, "Expired" styling when zero or `isAcceptingOffers === false`.

## 5. Wiring (modified files)
- **`app-routing.module.ts`** — 4 flat lazy routes: `custom-trip-settings`, `custom-trip-requests`, `custom-trip-my-offers`, `admin-custom-trip-requests`.
- **`navigation.ts`** — "Custom Trips" collapse after Travels, children: Trip Requests (`/custom-trip-requests`), My Offers (`/custom-trip-my-offers`), All Requests (`/admin-custom-trip-requests`), Settings (`/custom-trip-settings`); all `permissions: []`, icon `fa-suitcase-rolling`.
- **`src/assets/i18n/en.json` + `ar.json`** — all new page-level labels; enum labels come from the enum label maps (backend DisplayNames).

## 6. Key technical notes
- These endpoints use their **own payload shape** `{ pageIndex, pageSize, Destination, TripType }` — NOT `TableRequestBuilder` (that's for BaseSearchCriteria backends). Response read as `res.data.data` with defensive total (`count ?? itemsCount`).
- Vendor list / my-submitted-offers return ints for status/tripType → resolved via local enum maps; admin DTOs prefer API-provided `statusName`/`tripTypeName` when present.
- Auth token header comes free via `ApiCallerService` (reads `localStorage.token`).

## 7. Verification
- `ng build` to confirm everything compiles; fix any type/template errors.
- Manual smoke-test checklist for you against the real backend (settings save, lists load, offer submit).

## Optional side-fix
Rename `.agents/mcp_config.json` → `.agents/mcp.json` so ZCode auto-loads your openapi MCP server next session (verify under Settings → MCP).