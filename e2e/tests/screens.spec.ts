import { expect, test, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { statePath } from '../global-setup';

/**
 * Opens every screen of the dashboard and checks, on each:
 * - it stays on its address (no bounce to the login page or a "not found" page),
 * - no JavaScript error and no API answer of 500 or more,
 * - no broken image, and no untranslated key (APP.*, WEB.*) on the page,
 * - on a phone: no sideways scroll.
 * A full-page screenshot of each screen lands in test-results/screens/ for a person to look at.
 *
 * The screens come from the route files themselves, so a new screen is checked without touching this file.
 */

const API = (process.env['DASHBOARD_API_URL'] ?? 'http://localhost:5022/api/').replace(/\/?$/, '/');
const SKIP = new Set(['', '**', 'login', 'register', 'forgot-password', 'reset-password']);
/** Screens that send this account somewhere else on purpose (the old vendor pages, for an admin). */
const REDIRECTS: Record<string, Record<string, string>> = {
  admin: { 'custom-trip-requests': 'admin-custom-trip-requests', 'custom-trip-my-offers': 'admin-custom-trip-requests' },
  vendor: {}
};

function routesFrom(file: string): { path: string; redirect: boolean }[] {
  const text = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'app', file), 'utf8');
  return [...text.matchAll(/\{\s*path:\s*'([^']*)'([^}]*)/g)].map((m) => ({ path: m[1], redirect: m[2].includes('redirectTo') }));
}

const all = [...routesFrom('staff/staff.routes.ts'), ...routesFrom('app-routing.module.ts')].filter(
  (r) => !r.redirect && !SKIP.has(r.path) && !r.path.includes(':')
);
const unique = [...new Map(all.map((r) => [r.path, r])).values()].map((r) => r.path);
const VENDOR_SHARED = ['default', 'analytics/overview'];
/** Screens whose address takes a value (a/products/:type): the values the app links to. */
const WITH_VALUES = ['a/products/trips', 'a/products/outings', 'a/products/hajj'];
const SCREENS = {
  admin: [...unique.filter((p) => !p.startsWith('v/')), ...WITH_VALUES],
  vendor: [...unique.filter((p) => p.startsWith('v/')), ...VENDOR_SHARED]
};

/** Detail screens need a real id: the first row of the matching list. */
const DETAILS: { role: 'admin' | 'vendor'; list: string; route: (row: any) => string }[] = [
  { role: 'admin', list: 'staff/bookings/list', route: (r) => `a/bookings/${r.id}` },
  { role: 'vendor', list: 'staff/bookings/list', route: (r) => `v/bookings/${r.id}` },
  { role: 'admin', list: 'staff/lists/customers', route: (r) => `a/more/customers/${r.id}` },
  { role: 'admin', list: 'staff/lists/vendors', route: (r) => `a/more/vendors/${r.id}` },
  { role: 'admin', list: 'staff/custom-requests/search', route: (r) => `a/more/custom-requests/${r.id}` },
  { role: 'admin', list: 'staff/emails', route: (r) => `a/more/emails/${r.logId}` },
  { role: 'admin', list: 'staff/lists/trips', route: (r) => `a/products/trips/${r.id}` },
  { role: 'admin', list: 'staff/lists/outings', route: (r) => `a/products/outings/${r.id}` }
];

async function tokenOf(page: Page) {
  return page.evaluate(() => localStorage.getItem('token'));
}

async function checkScreen(page: Page, route: string, screenshotName: string, isPhone: boolean, landsOn = route) {
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(`JavaScript error: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 500 && r.url().startsWith(API)) problems.push(`API ${r.status()}: ${r.request().method()} ${r.url().replace(API, '/')}`);
  });

  await page.goto('/' + route);
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => problems.push('still loading after 30 s'));
  await page.waitForTimeout(500);

  const where = new URL(page.url()).pathname.replace(/^\//, '');
  if (where.startsWith('login')) problems.push('sent back to the login page');
  if (where !== landsOn && !where.startsWith(landsOn)) problems.push(`ended up on /${where}`);

  const found = await page.evaluate(() => {
    const visible = (el: Element) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const broken = [...document.images]
      .filter((img) => img.currentSrc && visible(img) && img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc);
    const keys = (document.body.innerText.match(/\b(APP|WEB|AUTH_UI|COMMON)\.[A-Za-z0-9_.]+/g) ?? []).slice(0, 5);
    const notFound = /\b404\b|page not found|الصفحة مش موجودة/i.test(document.body.innerText) && document.body.innerText.length < 400;
    return { broken: [...new Set(broken)], keys, notFound, wide: document.documentElement.scrollWidth - window.innerWidth };
  });
  for (const src of found.broken) problems.push(`broken image: ${src}`);
  if (found.keys.length) problems.push(`untranslated: ${found.keys.join(', ')}`);
  if (found.notFound) problems.push('shows a "not found" page');
  if (isPhone && found.wide > 2) problems.push(`scrolls sideways by ${found.wide}px on a phone`);

  fs.mkdirSync(path.dirname(screenshotName), { recursive: true });
  await page.screenshot({ path: screenshotName, fullPage: true });
  expect(problems, problems.join('\n')).toEqual([]);
}

for (const role of ['admin', 'vendor'] as const) {
  test.describe(role, () => {
    test.skip(() => !fs.existsSync(statePath(role)), `no ${role} account (set DASHBOARD_${role.toUpperCase()}_USER/_PASSWORD)`);
    test.use({ storageState: statePath(role) });

    for (const route of SCREENS[role]) {
      test(`/${route}`, async ({ page }, info) => {
        const file = `test-results/screens/${info.project.name}/${role}/${route.replace(/\//g, '_') || 'home'}.png`;
        await checkScreen(page, route, file, info.project.name === 'phone', REDIRECTS[role][route]);
      });
    }

    for (const d of DETAILS.filter((x) => x.role === role)) {
      test(`details from ${d.list}`, async ({ page, request }, info) => {
        await page.goto('/default');
        const token = await tokenOf(page);
        const answer = await request.post(API + d.list, {
          headers: { Authorization: `Bearer ${token}` },
          data: { filters: [], sort: [], pageIndex: 1, pageSize: 1 }
        });
        expect(answer.status()).toBe(200);
        const body = await answer.json();
        const rows = body?.data?.page?.data ?? body?.data?.data ?? [];
        test.skip(rows.length === 0, `${d.list} is empty`);
        const route = d.route(rows[0]);
        const file = `test-results/screens/${info.project.name}/${role}/${route.replace(/\//g, '_')}.png`;
        await checkScreen(page, route, file, info.project.name === 'phone');
      });
    }
  });
}
