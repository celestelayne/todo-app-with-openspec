import { expect, test } from '@playwright/test';

test('renders the app', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('answers API requests from the mock layer without a backend', async ({
  page,
}) => {
  await page.goto('/');
  // The app renders only after the mock worker has started.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const body = await page.evaluate(async () => {
    const response = await fetch('http://localhost:3000/health');
    return response.json();
  });

  expect(body).toEqual({ status: 'ok' });
});
