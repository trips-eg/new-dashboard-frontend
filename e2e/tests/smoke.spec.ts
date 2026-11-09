import { test, expect, Page } from '@playwright/test';

const authenticated = Boolean(process.env.E2E_USER && process.env.E2E_PASSWORD);

async function expectPageRendered(page: Page, path: string) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const response = await page.goto(path);
  expect(response?.status(), `${path} returned ${response?.status()}`).toBeLessThan(500);
  await expect(page.locator('app-root')).not.toBeEmpty();
  expect(errors, `JS errors on ${path}: ${errors.join(' | ')}`).toHaveLength(0);
}

test.describe('Public screens', () => {
  test('login page renders the form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[formControlName="username"]')).toBeVisible();
    await expect(page.locator('input[formControlName="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('unauthenticated user is sent to login', async ({ browser }) => {
    const context = await browser.newContext(); // no stored session
    const page = await context.newPage();
    await page.goto('/customers');
    await expect(page).toHaveURL(/login/);
    await context.close();
  });
});

test.describe('Admin screens', () => {
  test.skip(!authenticated, 'E2E_USER / E2E_PASSWORD not set');

  for (const path of ['/default', '/customers', '/users', '/hotels', '/outing-list', '/all-reservations']) {
    test(`admin: ${path} renders`, async ({ page }) => {
      await expectPageRendered(page, path);
    });
  }
});

test.describe('Vendor screens', () => {
  test.skip(!authenticated, 'E2E_USER / E2E_PASSWORD not set');

  test('vendors list renders', async ({ page }) => {
    await expectPageRendered(page, '/vendors');
  });

  test('vendor add/edit form renders', async ({ page }) => {
    await expectPageRendered(page, '/vendors-add-edit');
  });
});

test.describe('Scanner screen', () => {
  test.skip(!authenticated, 'E2E_USER / E2E_PASSWORD not set');

  test('scanner page loads with a (fake) camera', async ({ page }) => {
    await expectPageRendered(page, '/scanner');
    // The QR scanner component mounts a <video> element once the camera is granted.
    await expect(page.locator('video, ngx-scanner-qrcode')).toBeVisible({ timeout: 15_000 });
  });
});
