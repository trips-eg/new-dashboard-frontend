import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';

const authFile = 'results/.auth/admin.json';

// Logs in once with the staging test account and stores the session for the other tests.
// Without E2E_USER / E2E_PASSWORD it saves an empty state and the authenticated tests skip themselves.
setup('authenticate', async ({ page }) => {
  fs.mkdirSync('results/.auth', { recursive: true });
  const user = process.env.E2E_USER;
  const password = process.env.E2E_PASSWORD;

  await page.goto('/login');
  await expect(page.locator('input[formControlName="username"]')).toBeVisible();

  if (!user || !password) {
    await page.context().storageState({ path: authFile });
    return;
  }

  await page.fill('input[formControlName="username"]', user);
  await page.fill('input[formControlName="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
  await page.context().storageState({ path: authFile });
});
