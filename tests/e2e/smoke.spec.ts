import { _electron as electron, expect, test } from '@playwright/test';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('boots the file manager and switches shells', async () => {
  test.setTimeout(90_000);

  const userDataDir = await mkdtemp(join(tmpdir(), 'morphfinder-e2e-'));
  const application = await electron.launch({
    args: [
      `--user-data-dir=${userDataDir}`,
      '--disable-gpu',
      'out/main/index.js',
    ],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    },
    timeout: 60_000,
  });

  application.process()?.stdout?.on('data', (chunk) => {
    console.log(`[electron stdout] ${chunk.toString()}`);
  });
  application.process()?.stderr?.on('data', (chunk) => {
    console.error(`[electron stderr] ${chunk.toString()}`);
  });

  try {
    const window = await application.firstWindow();
    window.on('console', (message) => {
      console.log(`[renderer ${message.type()}] ${message.text()}`);
    });
    window.on('pageerror', (error) => {
      console.error(`[renderer error] ${error.message}`);
    });

    await window.waitForLoadState('domcontentloaded');

    const onboardingClose = window.getByTitle('Close');
    if (await onboardingClose.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await onboardingClose.click();
    }

    const shell = window.getByTestId('morph-shell');
    await expect(shell).toBeVisible({ timeout: 30_000 });
    await expect(shell).toHaveAttribute('data-shell', /finder|explorer|dolphin/);

    await window.getByRole('button', { name: 'Switch shell' }).click();
    await window.getByRole('menuitemradio', { name: 'Explorer' }).click();
    await expect(shell).toHaveAttribute('data-shell', 'explorer');
  } finally {
    await application.close();
  }
});
