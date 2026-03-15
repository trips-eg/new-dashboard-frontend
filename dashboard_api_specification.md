# 🏠 Dashboard API Specification — Trips Platform

Complete API data requirements for building a **professional, UX-rich** admin and vendor dashboard.

---

## Your Business Modules

Based on the full codebase analysis, your platform handles:

| Module | Description |
|--------|-------------|
| **Travels** | Trip packages with program steps |
| **Hotels / Rooms** | Hotel rooms with features, types, groups |
| **Outings** | Events/activities with tickets, branches, schedules |
| **Hajj / Umrah (Manasik)** | Religious pilgrimage packages |
| **Customers** | End-user mobile app users |
| **Vendors** | Companies that provide services |
| **Coupons** | Discount codes |
| **Transactions** | Wallet transactions & charges |
| **Sales Agencies** | External sales partners |

---

## API 1: `GET Dashboard/GetAdminDashboard`

> **Who sees this:** Admin only  
> **When called:** On admin home page load  
> **Purpose:** High-level overview of the entire platform

### Response Shape

```json
{
  "success": true,
  "data": {

    // ─── OVERVIEW COUNTERS ─────────────────────────────
    "totalCustomers": 1520,
    "totalVendors": 34,
    "totalActiveVendors": 28,
    "totalSalesAgencies": 12,

    // ─── RESERVATION COUNTERS (All Time) ───────────────
    "totalReservations": 8430,
    "totalTravelReservations": 3200,
    "totalRoomReservations": 2800,
    "totalOutingReservations": 1500,
    "totalManasikReservations": 930,

    // ─── RESERVATION STATUS BREAKDOWN ──────────────────
    "reservationsByStatus": {
      "pending": 120,
      "confirmed": 340,
      "completed": 7500,
      "cancelled": 280,
      "refunded": 190
    },

    // ─── FINANCIAL SUMMARY (All Time) ──────────────────
    "totalRevenue": 2500000.00,
    "totalTripsProfit": 375000.00,
    "totalVendorPayouts": 2125000.00,
    "totalRefundsAmount": 95000.00,
    "totalCouponsDiscount": 42000.00,
    "totalSalesTax": 187500.00,
    "totalCommissionVat": 56250.00,
    "outstandingVendorBalance": 180000.00,

    // ─── TODAY'S SNAPSHOT ──────────────────────────────
    "today": {
      "newReservations": 18,
      "newCustomers": 7,
      "todayRevenue": 12500.00,
      "todayRefunds": 2,
      "todayProfit": 1875.00
    },

    // ─── THIS MONTH SNAPSHOT ───────────────────────────
    "thisMonth": {
      "totalReservations": 380,
      "totalRevenue": 195000.00,
      "totalProfit": 29250.00,
      "newCustomers": 85,
      "totalRefunds": 22,
      "refundsAmount": 11000.00
    },

    // ─── RECENT RESERVATIONS (Latest 5-10) ─────────────
    "recentReservations": [
      {
        "id": 4523,
        "reference": "TRP-2026-4523",
        "customerName": "Ahmed Mohamed",
        "moduleType": "travel",
        "itemName": "Cairo - Istanbul 5 Days",
        "vendorName": "NileTours",
        "amount": 3500.00,
        "status": "confirmed",
        "createdAt": "2026-02-17T14:30:00Z"
      }
    ],

    // ─── TOP PERFORMING VENDORS (Top 5) ────────────────
    "topVendors": [
      {
        "vendorId": 12,
        "vendorName": "NileTours",
        "totalReservations": 820,
        "totalRevenue": 450000.00,
        "rating": 4.7
      }
    ],

    // ─── TOP BOOKED ITEMS (Top 5 per module) ───────────
    "topTravels": [
      {
        "id": 101,
        "name": "Cairo - Istanbul 5 Days",
        "totalBookings": 145,
        "revenue": 72500.00
      }
    ],
    "topRooms": [
      {
        "id": 201,
        "name": "Deluxe Suite - Grand Hotel",
        "totalBookings": 230,
        "revenue": 115000.00
      }
    ],
    "topOutings": [
      {
        "id": 301,
        "name": "Desert Safari Adventure",
        "totalBookings": 180,
        "revenue": 54000.00
      }
    ],

    // ─── MONTHLY REVENUE CHART (Last 12 Months) ───────
    "monthlyRevenue": [
      { "month": "2025-03", "revenue": 180000.00, "profit": 27000.00, "reservations": 310 },
      { "month": "2025-04", "revenue": 195000.00, "profit": 29250.00, "reservations": 340 }
    ],

    // ─── REVENUE BY MODULE (Pie Chart) ─────────────────
    "revenueByModule": {
      "travel": 950000.00,
      "room": 820000.00,
      "outing": 430000.00,
      "manasik": 300000.00
    },

    // ─── PENDING ACTIONS / ALERTS ──────────────────────
    "alerts": {
      "pendingRefunds": 5,
      "expiringContracts": 2,
      "lowTicketOutings": 3,
      "pendingVendorPayments": 8
    }
  }
}
```

---

## API 2: `GET Dashboard/GetVendorDashboard`

> **Who sees this:** Vendor users  
> **When called:** On vendor home page load  
> **Purpose:** Vendor's own performance overview

### Response Shape

```json
{
  "success": true,
  "data": {

    // ─── VENDOR INFO ───────────────────────────────────
    "vendorId": 12,
    "vendorName": "NileTours",
    "logoUrl": "/uploads/vendors/niletours.png",
    "email": "info@niletours.com",
    "phone": "+201234567890",

    // ─── COMMISSION RATES ──────────────────────────────
    "hotelCommissionRate": 15.0,
    "travelCommissionRate": 12.0,
    "outingCommissionRate": 10.0,
    "manasikCommissionRate": 10.0,

    // ─── ACTIVE LISTINGS ───────────────────────────────
    "activeTravels": 15,
    "activeRooms": 42,
    "activeOutings": 8,
    "activeManasik": 3,

    // ─── OVERALL STATS ─────────────────────────────────
    "totalReservations": 820,
    "totalRevenue": 450000.00,
    "totalVendorProfit": 382500.00,
    "totalTripsCommission": 67500.00,
    "totalRefunds": 35,
    "totalRefundsAmount": 17500.00,
    "walletBalance": 45000.00,
    "totalPaid": 320000.00,
    "pendingPayment": 62500.00,

    // ─── RESERVATION STATUS ────────────────────────────
    "reservationsByStatus": {
      "pending": 15,
      "confirmed": 45,
      "completed": 720,
      "cancelled": 25,
      "refunded": 15
    },

    // ─── TODAY'S SNAPSHOT ──────────────────────────────
    "today": {
      "newReservations": 5,
      "todayRevenue": 7500.00,
      "todayVendorProfit": 6375.00
    },

    // ─── THIS MONTH ────────────────────────────────────
    "thisMonth": {
      "totalReservations": 65,
      "totalRevenue": 48000.00,
      "totalVendorProfit": 40800.00,
      "totalRefunds": 3
    },

    // ─── RECENT RESERVATIONS (Latest 5-10) ─────────────
    "recentReservations": [
      {
        "id": 4523,
        "reference": "TRP-2026-4523",
        "customerName": "Ahmed Mohamed",
        "moduleType": "travel",
        "itemName": "Cairo - Istanbul 5 Days",
        "amount": 3500.00,
        "vendorAmount": 2975.00,
        "status": "confirmed",
        "createdAt": "2026-02-17T14:30:00Z"
      }
    ],

    // ─── MONTHLY REVENUE CHART (Last 6 months) ────────
    "monthlyRevenue": [
      { "month": "2025-09", "revenue": 42000.00, "vendorProfit": 35700.00, "reservations": 58 }
    ],

    // ─── TOP ITEMS ─────────────────────────────────────
    "topItems": [
      {
        "id": 101,
        "name": "Cairo - Istanbul 5 Days",
        "moduleType": "travel",
        "totalBookings": 45,
        "revenue": 22500.00
      }
    ],

    // ─── ALERTS ────────────────────────────────────────
    "alerts": {
      "pendingReservations": 15,
      "upcomingDepartures": 8,
      "lowTicketOutings": 2,
      "pendingPaymentFromTrips": 62500.00
    }
  }
}
```

---

## API 3: `POST Dashboard/GetDashboardByDateRange`

> **Who sees this:** Admin + Vendor  
> **When called:** When user filters by date range  
> **Purpose:** Detailed statistics filtered by date, per module

### Request Body

```json
{
  "from": "2026-01-01",
  "to": "2026-02-17",
  "companyId": null,          // null = all vendors (admin), or specific vendor ID
  "moduleType": "all"         // "all" | "travel" | "room" | "outing" | "manasik"
}
```

### Response Shape

```json
{
  "success": true,
  "data": {
    "travel": {
      "totalReservations": 120,
      "totalRevenue": 84000.00,
      "totalVendorProfit": 71400.00,
      "totalTripsProfit": 12600.00,
      "totalSalesTax": 6300.00,
      "totalCommissionVat": 1890.00,
      "totalCouponsValue": 3200.00,
      "totalRefunds": 8,
      "totalRefundsAmount": 4000.00,
      "byStatus": {
        "pending": 10,
        "confirmed": 25,
        "completed": 75,
        "cancelled": 5,
        "refunded": 5
      }
    },
    "room": {
      "totalReservations": 95,
      "totalRevenue": 71000.00,
      "totalVendorProfit": 60350.00,
      "totalTripsProfit": 10650.00,
      "totalSalesTax": 5325.00,
      "totalCommissionVat": 1597.50,
      "totalCouponsValue": 2800.00,
      "totalRefunds": 6,
      "totalRefundsAmount": 3000.00,
      "byStatus": {
        "pending": 8,
        "confirmed": 20,
        "completed": 60,
        "cancelled": 4,
        "refunded": 3
      }
    },
    "outing": {
      "totalReservations": 65,
      "totalRevenue": 32500.00,
      "totalVendorProfit": 27625.00,
      "totalTripsProfit": 4875.00,
      "totalSalesTax": 2437.50,
      "totalCommissionVat": 731.25,
      "totalCouponsValue": 1500.00,
      "totalRefunds": 4,
      "totalRefundsAmount": 2000.00,
      "totalUsedTickets": 180,
      "totalUnusedTickets": 45,
      "byStatus": {
        "pending": 5,
        "confirmed": 12,
        "completed": 42,
        "cancelled": 3,
        "refunded": 3
      }
    },
    "manasik": {
      "totalReservations": 40,
      "totalRevenue": 120000.00,
      "totalVendorProfit": 102000.00,
      "totalTripsProfit": 18000.00,
      "totalSalesTax": 9000.00,
      "totalCommissionVat": 2700.00,
      "totalCouponsValue": 5000.00,
      "totalRefunds": 2,
      "totalRefundsAmount": 6000.00,
      "byStatus": {
        "pending": 3,
        "confirmed": 8,
        "completed": 25,
        "cancelled": 2,
        "refunded": 2
      }
    },

    // ─── COMBINED TOTALS ───────────────────────────────
    "combined": {
      "totalReservations": 320,
      "totalRevenue": 307500.00,
      "totalTripsProfit": 46125.00,
      "totalVendorProfit": 261375.00,
      "totalSalesTax": 23062.50,
      "totalRefundsAmount": 15000.00
    },

    // ─── DAILY CHART DATA (for line charts) ────────────
    "dailyTrend": [
      { "date": "2026-02-01", "reservations": 12, "revenue": 8500.00 },
      { "date": "2026-02-02", "reservations": 15, "revenue": 11200.00 }
    ]
  }
}
```

---

## Summary: What to Ask Your Backend Team

### New API Endpoints Needed

| # | Endpoint | Method | For |
|---|----------|--------|-----|
| 1 | `Dashboard/GetAdminDashboard` | GET | Admin home page — all platform KPIs |
| 2 | `Dashboard/GetVendorDashboard` | GET | Vendor home page — their own KPIs |
| 3 | `Dashboard/GetDashboardByDateRange` | POST | Date-filtered detailed stats for both roles |

### Key Data Categories

| Category | Admin | Vendor | Fields |
|----------|:-----:|:------:|--------|
| **Counters** | ✅ | ✅ | Total reservations, customers, vendors, active listings |
| **Financial Summary** | ✅ | ✅ | Revenue, profit, tax, commission VAT, coupons, refunds |
| **Status Breakdown** | ✅ | ✅ | Pending, confirmed, completed, cancelled, refunded counts |
| **Today Snapshot** | ✅ | ✅ | Today's reservations, revenue, profit, new customers |
| **Month Snapshot** | ✅ | ✅ | This month's totals |
| **Recent Reservations** | ✅ | ✅ | Latest 5-10 bookings with details |
| **Top Items** | ✅ | ✅ | Best-selling travels, rooms, outings |
| **Top Vendors** | ✅ | ❌ | Best-performing vendors (admin only) |
| **Chart Data** | ✅ | ✅ | Monthly/daily revenue trends |
| **Revenue by Module** | ✅ | ✅ | Pie chart data (travel vs room vs outing vs manasik) |
| **Alerts** | ✅ | ✅ | Pending refunds, expiring contracts, low tickets |
| **Wallet / Payments** | ❌ | ✅ | Wallet balance, paid, pending payment |
| **Commission Rates** | ❌ | ✅ | Hotel, travel, outing, manasik commission % |

> [!TIP]
> The admin endpoint returns **platform-wide** data. The vendor endpoint auto-filters to the **logged-in vendor's** data using the auth token.
