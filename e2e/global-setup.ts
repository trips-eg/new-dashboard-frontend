import { chromium, type FullConfig } from '@playwright/test';
import * as fs from 'fs';

/** Signs in once per account through the real login page and keeps the session for the tests. */
export const ACCOUNTS = {
  admin: { user: process.env['DASHBOARD_ADMIN_USER'], password: process.env['DASHBOARD_ADMIN_PASSWORD'] },
  vendor: { user: process.env['DASHBOARD_VENDOR_USER'], password: process.env['DASHBOARD_VENDOR_PASSWORD'] }
};

export const statePath = (role: string) => `.auth/${role}.json`;

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL!;
  fs.mkdirSync('.auth', { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const [role, account] of Object.entries(ACCOUNTS)) {
    if (!account.user || !account.password) {
      fs.rmSync(statePath(role), { force: true });
      continue;
    }
    const page = await browser.newPage();
    await page.goto(`${baseURL}/login`);
    await page.locator('input[formcontrolname="username"]').fill(account.user);
    await page.locator('input[formcontrolname="password"]').fill(account.password);
    // Remember me keeps the session in localStorage, which storageState saves (sessionStorage it doesn't)
    await page.locator('#rememberMe').check();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 });
    await page.context().storageState({ path: statePath(role) });
    await page.close();
  }
  await browser.close();
}
