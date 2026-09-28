# 📘 Technical & Architectural Documentation: Vendor Settlements System

**Project:** Trips Dashboard — Vendor Settlements & Financial Reconciliation System  
**Version:** 2.0.0  
**Status:** Production Ready  
**Date:** August 2026  

---

## 1. 🎯 Executive Summary & Architectural Overview

The **Vendor Settlements System** introduces a dedicated financial reconciliation and payout engine for the Trips.eg dashboard. Previously, operational reservations and financial payouts were coupled, causing cognitive overload and risk of accounting errors. 

### Key Architectural Pillars:
1. **Separation of Concerns:** 
   - **Operational Reservations:** Manage customer bookings, seat allocation, passenger names, booking documents, and operational cancellations/refunds.
   - **Financial Settlements:** Track vendor entitlements, payment milestones, partial disbursements, ledger history, and batch payout execution.
2. **Dedicated Settlements Hub (`/vendor-settlements`):** Full standalone portal in the main sidebar for finance teams and admins.
3. **Contextual Vendor Hub (`/vendor-details/:id`):** Embedded sub-hub inside the vendor profile isolating that specific vendor's ledger.
4. **Multi-Sector Compatibility:** Unified handling across **Travels/Trips**, **Hotels/Rooms**, **Outings**, and **Manasik/Umrah**.

---

## 2. 🏛️ Core Features & Capabilities

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             VENDOR SETTLEMENTS CENTER                                    │
├────────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ 🔵 Total Entitlements      │ 🟢 Total Settled to Date    │ 🟠 Outstanding Due Balance    │
│    548,200.00 EGP          │    412,500.00 EGP           │    135,700.00 EGP             │
└────────────────────────────┴─────────────────────────────┴───────────────────────────────┘
  [ 🧭 Travels / Trips ]  [ 🏨 Rooms / Hotels ]  [ 🎟️ Outings ]  [ 🕋 Manasik / Umrah ]
  [ 🔘 Active Dues & Settlements ]  [ 📜 Settlement & Payout Transactions History ]
```

### A. Live Financial KPI Cards
Aggregates live server data into 4 metrics:
* **Total Entitlements:** Total gross profit owed to vendor across loaded bookings ($\sum \text{vendorCalculatedAmount}$).
* **Total Settled to Date:** Cumulative amount paid out ($\sum \text{vendorSettledAmount}$).
* **Outstanding Due Balance:** Remaining net payable balance ($\sum (\text{vendorCalculatedAmount} - \text{vendorSettledAmount})$).
* **Pending Settlements:** Real-time count of bookings requiring payment attention.

### B. Interactive Settlement Modal (`MarkVendorSettledDialogComponent`)
* **Dual-Layer Progress Bar:** Visualizes already settled percentage vs new projected percentage after input.
* **Quick Percentage Chips:** One-click presets (`25%`, `50%`, `75%`, `Full Remaining Amount (100%)`).
* **Live Calculation Breakdown:** Displays remaining amount dynamically before confirmation.

### C. Floating Batch Settlement Bar
* Multi-select checkboxes across due reservations.
* Sticky bottom action bar with live aggregated payout sum (`"X reservations selected | Total Payout: Y EGP"`).
* One-click sequential batch settlement with automatic confirmation and error tolerance.

### D. Settlement & Payout Transactions History (`CompaniesWallet`)
* Dedicated ledger tab tracking bank disbursements, receipts, and user audit logs.
* Direct integration with `CompaniesWallet/GetAllCompanyWallet`.
* Interactive receipt image previews via PrimeNG `<p-image>`.

---

## 3. 🌐 API Integration Map

| Sector / Action | Backend Endpoint | Request Payload | Response Key Fields |
| :--- | :--- | :--- | :--- |
| **Travels / Trips** | `POST /api/Travels/GetTravelReservationForVendor` | `{ pageIndex, pageSize, search, CompanyId }` | `vendorCalculatedAmount`, `vendorSettledAmount`, `vendorSettlementStatus` |
| **Rooms / Hotels** | `POST /api/Rooms/GetRoomReservationForVendor` | `{ pageIndex, pageSize, search, CompanyId }` | `vendorCalculatedAmount`, `vendorSettledAmount`, `allowedToSettlement` |
| **Outings** | `POST /api/Outing/GetOutingReservationForVendor` | `{ pageIndex, pageSize, search, CompanyId }` | `vendorProfitAfterCoupon`, `vendorSettlementStatus` |
| **Manasik / Umrah** | `POST /api/Manasik/GetManasikReservationForVendor` | `{ pageIndex, pageSize, search, CompanyId }` | `hajj.manasikType`, `vendorCalculatedAmount` |
| **Settle Trip Payout** | `POST /api/Travels/MarkTripVendorSettled` | `{ reservationId, settledAmount }` | `vendorSettlementStatus`, `vendorSettledAmount` |
| **Settle Outing Payout**| `POST /api/Outing/MarkOutingVendorSettled` | `{ reservationId, settledAmount }` | `vendorSettlementStatus`, `vendorSettledAmount` |
| **Settle Manasik** | `POST /api/Manasik/MarkManasikVendorSettled` | `{ reservationId, settledAmount }` | `vendorSettlementStatus`, `vendorSettledAmount` |
| **Wallet History** | `POST /api/CompaniesWallet/GetAllCompanyWallet` | `{ pageIndex, pageSize, search, CompanyId }` | `amountIn`, `amountOut`, `totalAmount`, `imageUrl` |

---

## 4. 🗂️ Modified & Created Files Reference

1. **[vendor-settlements.component.ts](file:///e:/work/trips_frontend/trips_dashboard/src/app/demo/pages/settings/vendors/vendor-settlements/vendor-settlements.component.ts):** Master controller for global and embedded settlements.
2. **[vendor-settlements.component.html](file:///e:/work/trips_frontend/trips_dashboard/src/app/demo/pages/settings/vendors/vendor-settlements/vendor-settlements.component.html):** Dual-mode interface (Active Dues + History Ledger).
3. **[vendor-settlements.component.scss](file:///e:/work/trips_frontend/trips_dashboard/src/app/demo/pages/settings/vendors/vendor-settlements/vendor-settlements.component.scss):** Elevated KPI card styles and high-contrast sector badges.
4. **[mark-vendor-settled-dialog.component.ts & .html](file:///e:/work/trips_frontend/trips_dashboard/src/app/shared/components/mark-vendor-settled-dialog/):** Interactive modal with percentage presets and progress visualization.
5. **[app-routing.module.ts](file:///e:/work/trips_frontend/trips_dashboard/src/app/app-routing.module.ts):** Registered `/vendor-settlements` route.
6. **[navigation.ts](file:///e:/work/trips_frontend/trips_dashboard/src/app/theme/layout/admin/navigation/navigation.ts):** Sidebar navigation item with icon `fas fa-file-invoice-dollar`.
7. **[travel-booking-info](file:///e:/work/trips_frontend/trips_dashboard/src/app/shared/tables-booking-info/travel-booking-info/), [room-booking-info](file:///e:/work/trips_frontend/trips_dashboard/src/app/shared/tables-booking-info/room-booking-info/), [outing-booking-info](file:///e:/work/trips_frontend/trips_dashboard/src/app/shared/tables-booking-info/outing-booking-info/), [manasik-booking-info](file:///e:/work/trips_frontend/trips_dashboard/src/app/shared/tables-booking-info/manasik-booking-info/):** Updated headers and `<p-tag>` badges.
8. **[en.json](file:///e:/work/trips_frontend/trips_dashboard/src/assets/i18n/en.json) & [ar.json](file:///e:/work/trips_frontend/trips_dashboard/src/assets/i18n/ar.json):** Full English & Arabic localization dictionary.
