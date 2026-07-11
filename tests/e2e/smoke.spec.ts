import { _electron as electron, expect, test } from '@playwright/test';

test('boots the file manager and switches shells', async () => {
  const application = await electron.launch({ args: ['out/main/index.js'], env: { ...process.env, NODE_ENV: 'test' } });
  try {
    const window = await application.firstWindow();
    const shell = window.getByTestId('morph-shell');
    await expect(shell).toBeVisible();
    await expect(shell).toHaveAttribute('data-shell', /finder|explorer|dolphin/);

    await window.getByRole('button', { name: 'Switch shell' }).click();
    await window.getByRole('menuitemradio', { name: 'Explorer' }).click();
    await expect(shell).toHaveAttribute('data-shell', 'explorer');
  } finally {
    await application.close();
  }
});
