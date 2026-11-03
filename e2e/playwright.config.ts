import { defineConfig } from '@playwright/test';

/**
 * Browser checks of the dashboard: every screen as the admin and as the vendor, on a desktop and a phone.
 * Runs against a dashboard that is already running (DASHBOARD_URL, default the local dev server).
 * Uses the Chrome installed on the machine, so nothing is downloaded.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 2,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }], ['html', { open: 'never', outputFolder: 'report' }]],
  globalSetup: './global-setup.ts',
  use: {
    baseURL: process.env['DASHBOARD_URL'] ?? 'http://localhost:4200',
    channel: 'chrome',
    locale: 'ar-EG',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1366, height: 800 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ]
});
