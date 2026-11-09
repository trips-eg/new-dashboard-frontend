# Phase 3 — new home screen + admin-managed home content (spec)

Owner request (2026-11-07): start phase 3, and the admin must be able to change, from the dashboard, the trust block's
data and colors and **any icon on the home screen**. Admin screens go in BOTH the Angular dashboard and Trips Partners.

Branches:
- Backend `feature/redesign-home`, based on `fix/payments-refunds-scanner`, which is based on production `v2026.11.06-staff-round4`.
- App `feature/redesign-home`, based on `feature/redesign-foundation`.
- Angular `feature/home-content`, based on `fix/auth-guard-401`.
- Partners `feature/home-content`, based on `ci/ios-testflight-codemagic`, the newest line.

## 1. Data (one additive migration `AppContentSettings`)
Table `AppContentSettings`: `Id` int, `Key` nvarchar(100) **unique**, `Value` nvarchar(max) (JSON), `Version` int, `UpdatedAt` datetime2, `UpdatedByUserId` int?.
Keys used now: `home.trust`, `home.icons`. Later phases add `home.hero`.

## 2. Contract — read (mobile-api, anonymous, cached 2 min server side, `Cache-Control: public, max-age=120`)
`GET /api/HomeContent` → `ApiResponse<HomeContentDto>`:
```json
{
  "version": 7,
  "trust": {
    "isVisible": true,
    "kicker": "احجز وانت مطمّن",
    "title": "آلاف المسافرين بيثقوا في Trips",
    "backgroundColor": "#1E4FA3", "textColor": "#FFFFFF", "accentColor": "#FFC24B",
    "stats": [
      { "key": "companies", "label": "شركة موثّقة", "value": "+134", "mode": "auto",
        "iconKey": "building", "iconUrl": null, "color": "#157A47", "tint": "#E8F5EE" },
      { "key": "downloads", "label": "تحميل", "value": "+100K", "mode": "manual", "iconKey": "download", "iconUrl": null, "color": "#1E4FA3", "tint": "#EAF1FB" },
      { "key": "customers", "label": "عميل سافر معانا", "value": "+50K", "mode": "auto", "iconKey": "users", "iconUrl": null, "color": "#C2410C", "tint": "#FFF3EA" }
    ],
    "badges": [ { "text": "دفع آمن", "iconKey": "lock", "iconUrl": null },
                { "text": "سياسة إلغاء واضحة", "iconKey": "refresh", "iconUrl": null },
                { "text": "دعم كل يوم", "iconKey": "chat", "iconUrl": null } ]
  },
  "icons": { "service.travel": null, "service.outing": "/images/HomeContent/ab12.svg", "...": null }
}
```
- `mode: "auto"` ⇒ the server fills `value` with a live count (rounded, formatted "+N" / "+N K"):
  `companies` = vendors not blocked/deleted with at least one active product; `customers` = distinct users with a Completed booking;
  `products` = active trips + outings + Hajj/Umrah. `downloads` is manual only. `mode: "manual"` ⇒ the stored `value` is shown.
- A null icon URL means "use the app's built-in icon". Icon URLs are relative to the image host like other images.
- When nothing is stored yet, the endpoint returns the defaults above (the app also embeds the same defaults offline).

### Icon slots (registry in the backend, returned by the admin endpoint with Arabic labels)
`service.travel`, `service.outing`, `service.hajj` (the 3 main sections), `wallet`, `wallet.topup`,
`section.outCategories`, `section.deals`, `section.cities`, `section.stars`, `section.cheapOutings`, `section.trust`, `section.companies`,
`section.weekTrips`, `section.coupons`, `trust.stat.companies`, `trust.stat.downloads`, `trust.stat.customers`,
`trust.badge.1..3`, `nav.home`, `nav.bookings`, `nav.trip`, `nav.favorites`, `nav.account`, `search`, `notifications`, `menu`.
(Outing category tiles and cities already have their own images in the outing-category data; the admin changes those in the categories screen.)

## 3. Contract — admin (web-api, new permission module `HomeContent` ⇒ `Permissions.HomeContent.View/Edit/...`; Admin.Super gets it on startup)
- `GET /api/staff/home-content` → `{ trust, icons, iconSlots: [{ key, labelAr, group }], autoValues: { companies, customers, products }, version }`
- `PUT /api/staff/home-content/trust` body = trust object; validation: colors `#RRGGBB`, 1–4 stats, 0–3 badges, texts ≤ 60 chars.
- `POST /api/staff/home-content/icons/{slot}` multipart file (svg/png/webp, ≤ 200 KB; SVG sanitized: no `<script>`, no `on*=`, no external `href`) → stored under `images/HomeContent/`; returns the URL.
- `DELETE /api/staff/home-content/icons/{slot}` → back to the default.
- Every save bumps `Version` and clears the mobile cache. Keep an audit log entry (who, when, what key) using the existing logging approach.

## 4. Best-selling outings
`GET /api/MobileOutings/GetAllOutings` (POST body, existing): new optional `SortBy = "bestSelling"` ⇒ order by count of Completed/InstaCompleted
outing reservations in the last 90 days (then newest). Existing sorting untouched. `MaxPrice` (already there) gives "أقل من 500".

## 5. App — new home screen (uses phase 2 widgets)
Order as in the approved mockup `Main.dc.html`:
1. Hero art + top bar (menu, logo, notifications).
2. The 3 sections, exactly like today: the parallelogram card with the same svg icons. An admin icon replaces the built-in one.
3. Greeting + headline + search bar + quick chips.
4. Wallet strip (wallet + welcome bonus, "اشحن").
5. "تخرج فين" category tiles (outing categories API).
6. Deals (sidebars / trip stars).
7. Cities.
8. Stars of the day (TripStar API).
9. Outings tabs "أقل من 500" / "الأكثر مبيعاً".
10. Trust block (HomeContent).
11. Top companies (company sidebar).
12. Trips of the week.
13. Active coupons.
14. Payment logos.
15. Bottom nav.
- Data only from existing APIs and the new HomeContent; no fake numbers.
- Sections load independently, each with its own skeleton and its own retry. A failed section hides itself, and the rest of the home still works.
- `HomeContent` is cached on the device. The cached copy shows at once and refreshes in the background when `version` changes.
- Performance: measure before/after on the same device/emulator profile (time to first content, number of API calls on home open, MB downloaded); avoid duplicate calls; images use `?w=` sizes.
- Old home kept behind a remote/local flag for rollback (`useNewHome`, default true in debug, true in release only after approval).

## 5b. Responsiveness
Widths 320–600 and text ×1.0–×1.3 without overflow (widget tests).

## 6. Admin UIs (Angular + Partners)
Screen "محتوى الرئيسية": edit trust kicker/title/colors (color picker + hex), stats (label, mode auto/manual, value, icon, colors), badges;
icon slots grid grouped (sections, trust, nav, top bar) with current icon, upload, reset; live phone preview of the trust block and the 3 sections; save shows success/error.
Permission-gated (`Permissions.HomeContent.View/Edit`).

## 7. Tests
- Backend xUnit: defaults when empty; auto values; save/version bump; validation errors; SVG sanitizer rejects script; permission required; bestSelling order.
- App widget tests: home renders with mocked APIs, a failing section doesn't break others, admin icon URL replaces default, cached config used offline.
- Angular: service + component unit tests for the editor (save payload, validation).
- Partners: widget test for the editor + API client test with fake http.
