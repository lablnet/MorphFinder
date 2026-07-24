import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI === 'true' ? 1 : 0,
  reporter: process.env.CI === 'true' ? 'github' : 'list',
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
