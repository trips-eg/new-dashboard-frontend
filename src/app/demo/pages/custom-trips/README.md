# 🧳 Custom Trips Marketplace — Technical & Operational Documentation

## 1. Overview & Architecture

The **Custom Trips Marketplace** is an enterprise B2B module within the Trips Dashboard. It allows travelers to request tailored itineraries (domestic or international) and enables approved vendors to submit competitive quotes during an active bidding window. Platform administrators monitor request activity, analyze vendor pricing spreads, and facilitate direct communications with travelers.

### Core Portals & Capabilities
- **Admin Operations Hub:** Centralized oversight, financial metrics (lowest/average/highest bids), customer profile bento cards, and 1-click WhatsApp/phone communication.
- **Vendor Marketplace:** Real-time stream of incoming traveler requests with live countdowns and one-click quote submission.
- **Vendor Bid Tracker:** Private portfolio management for vendors to track offer statuses and gross bidding pipeline volume.
- **Platform Settings Engine:** Reactive duration steppers and quick-preset duration pills governing request expiration windows.

---

## 2. Directory Structure

```
src/app/
├── shared/
│   ├── Enums/custom-trip.ts                    # Status enums, bilingual labels, PrimeNG tag severities, helpers
│   ├── model/icustom-trip.ts                   # DTO contracts, query filters, and pagination envelopes
│   ├── model/helpers.ts                        # APIs.customTrips endpoint registry
│   └── services/custom-trips.service.ts        # Centralized HTTP service (7 API endpoints)
├── theme/layout/admin/navigation/navigation.ts # Menu tree with RBAC flags (vendorOnly / adminOnly)
└── demo/pages/custom-trips/
    ├── README.md                               # This documentation file
    ├── admin-trip-requests/                    # Admin portal, KPI cards & expandable dossier
    │   ├── admin-trip-requests.component.html
    │   ├── admin-trip-requests.component.ts
    │   └── admin-trip-requests.component.scss
    ├── vendor-trip-requests/                   # Vendor request feed & bidding table
    │   ├── vendor-trip-requests.component.html
    │   ├── vendor-trip-requests.component.ts
    │   └── vendor-trip-requests.component.scss
    ├── vendor-my-offers/                       # Vendor bid tracking & volume KPIs
    │   ├── vendor-my-offers.component.html
    │   ├── vendor-my-offers.component.ts
    │   └── vendor-my-offers.component.scss
    ├── vendor-request-dialog/                  # PrimeNG DynamicDialog for offer submission
    │   ├── vendor-request-dialog.component.html
    │   ├── vendor-request-dialog.component.ts
    │   └── vendor-request-dialog.component.scss
    ├── custom-trip-settings/                   # Duration stepper & quick presets
    │   ├── custom-trip-settings.component.html
    │   ├── custom-trip-settings.component.ts
    │   └── custom-trip-settings.component.scss
    └── shared/
        └── countdown-timer/                    # Reusable real-time UTC countdown engine
            ├── countdown-timer.component.html
            ├── countdown-timer.component.ts
            └── countdown-timer.component.scss
```

---

## 3. Role-Based Access Control (RBAC) & Routing

Access control is enforced at both the navigation level and the component lifecycle:

| Route | Role Permitted | Nav Flag | Guard / Redirect Rule |
|---|---|:---:|---|
| `/admin-custom-trip-requests` | Admin / Ops | `adminOnly: true` | If user has `Vendor.*` role, redirected to `/unauthorized`. |
| `/custom-trip-settings` | Admin / Ops | `adminOnly: true` | If user has `Vendor.*` role, redirected to `/unauthorized`. |
| `/custom-trip-requests` | Vendors | `vendorOnly: true` | If user is NOT vendor, redirected to `/admin-custom-trip-requests`. |
| `/custom-trip-my-offers` | Vendors | `vendorOnly: true` | If user is NOT vendor, redirected to `/admin-custom-trip-requests`. |

### Impersonation & Admin Quoting:
Inside `VendorRequestDialogComponent`, when opened with `data: { isAdmin: true }`, an additional vendor dropdown is dynamically populated via `VendorService`, allowing operations staff to manually record or submit quotes on behalf of any registered vendor.

---

## 4. Component Details & Features

### 4.1 Admin Operations Hub (`/admin-custom-trip-requests`)
- **KPI Metrics:** Total Requests, Active Bidding Windows, Offers Received, and Platform Views.
- **Scroll Trap Elimination:** Total column widths restricted to ~65rem (~1040px) with 35% reduced cell padding to fit standard 1080p desktop viewports without horizontal scrolling.
- **Debounced Search & Filters:** 400ms RxJS debounce on destination query, trip type selector, request status, and flight/visa requirement filter toggles.
- **Master-Detail Dossier (`pTemplate="rowexpansion"`):**
  - **Banner:** Request ID (`#TR-{id}`), view counter, offer count, live countdown timer, and formatted deadline date.
  - **Left Bento Card:** Traveler initials avatar, phone call link, 1-click WhatsApp link (`https://wa.me/` with automated Egyptian/international country code sanitization), 2x2 travel specs, children ages chips, and quote notes.
  - **Right Vendor Hub:** Financial spread metrics (Lowest Quote, Average Quote, Highest Quote), nested offers table with "Best Rate" badge, vendor logo fallback, and expandable proposal notes drawer.

### 4.2 Vendor Marketplace Portal (`/custom-trip-requests`)
- **Opportunity Feed:** Displays client travel dates, duration, passenger breakdown, and flight/visa requirements.
- **Adaptive Actions:**
  - `Submit Offer` (Active window, no offer submitted yet).
  - `View Offer` (Vendor has already placed a bid).
  - `Offer Window Closed` (Countdown reached zero).

### 4.3 Vendor "My Offers" Tracker (`/custom-trip-my-offers`)
- **Portfolio KPIs:** Total Bids Submitted, Pending Review, Accepted Bids, and Total Bidding Volume in EGP.
- **Bid History Table:** Detailed breakdown of quoted price, payment terms (Deposit vs. Full Payment), deposit amount, and status badges.

### 4.4 Offer Proposal Dialog (`VendorRequestDialogComponent`)
- **PrimeNG DynamicDialog:** Shared component for both vendors and admins.
- **Reactive Form Schema:**
  - `price`: Number input (`Validators.required`, `Validators.min(1)`).
  - `paymentType`: Radio / dropdown (`Deposit` or `FullPayment`).
  - `depositAmount`: Conditional validation (required when `Deposit` is selected).
  - `vendorNotes`: Optional proposal description.
- **Cross-Field Custom Validator (`depositValidator`):** Enforces that `depositAmount <= price`.

### 4.5 System Settings Engine (`/custom-trip-settings`)
- **Reactive FormArray:** Binds to backend entities and prepares payload updates (`ICustomTripSettingUpdate[]`).
- **Tactile Numeric Stepper:** Custom minus/plus stepper (`.duration-stepper-box`) with unit badge (`Days`) and minimum validation.
- **Quick-Preset Duration Pills:** One-click duration presets (`1, 3, 5, 7, 14, 30 Days`).
- **Framework Alignment:** Replaced all deprecated PrimeFlex classes with Bootstrap 5 utilities (`row g-3`, `d-flex`, `fw-bold`, `text-dark`).

### 4.6 Shared Real-Time Countdown Engine (`CountdownTimerComponent`)
- **.NET Timestamp Parsing Engine:** Resolves cross-browser date parsing bugs caused by .NET 7-digit microsecond strings (`.2660402`) by regex truncating to 3-digit milliseconds and enforcing UTC (`Z`).
- **Dual Fallback Logic:** Prioritizes future `offerWindowExpiresAt`, falling back to `remainingSeconds`.
- **Urgency Visuals & Memory Safety:**
  - Active: Normal badge.
  - Urgent: Red highlight when `< 24 hours` remain.
  - Expired: Secondary closed badge.
  - Automatic `clearInterval` on component destruction.

---

## 5. API Endpoints & Data Contracts

All endpoints are registered in `src/app/shared/model/helpers.ts` under `APIs.customTrips`:

| Endpoint Key | Route URL | Method | Purpose |
|---|---|:---:|---|
| `getSettings` | `CustomTripSetting/GetCustomTripSettings` | `GET` | Fetches system duration settings |
| `updateSettings` | `CustomTripSetting/UpdateCustomTripSettings` | `POST` | Updates duration settings array |
| `allRequests` | `VendorTripRequests/all-requests` | `POST` | Vendor requests query feed |
| `requestById` | `VendorTripRequests/{id}` | `GET` | Fetches single request specification |
| `submitOffer` | `VendorTripRequests/Offers` | `POST` | Submits a new vendor proposal |
| `mySubmittedOffers` | `VendorTripRequests/my-submitted-offers` | `POST` | Fetches vendor's own bids |
| `adminAllRequests` | `VendorTripRequests/admin/all-requests` | `POST` | Admin master requests query feed |

---

## 6. Internationalization (i18n) & Bidirectional Layout

- **Language Keys:** Complete dictionaries maintained in `src/assets/i18n/en.json` and `src/assets/i18n/ar.json`.
- **Bidirectional Symmetry:** Uses CSS logical properties (`border-inline-start`, `ms-auto`, `me-1`, `text-start`) ensuring optimal rendering in both LTR (English) and RTL (Arabic) modes.

---

## 7. Verification & Build Commands

To ensure full type-safety and bundle integrity:

```bash
# Build verification
npm run build

# Start local development server
npm start
```
