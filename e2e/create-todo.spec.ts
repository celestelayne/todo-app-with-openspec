import { expect, test } from '@playwright/test';

test('creates a todo with the keyboard and shows it at the top of the list', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('No todos yet')).toBeVisible();

  const title = page.getByRole('textbox', { name: 'Title' });
  await title.fill('First');
  await title.press('Enter');
  await expect(page.getByRole('listitem')).toHaveCount(1);

  await title.fill('Second');
  await title.press('Enter');

  const items = page.getByRole('listitem');
  await expect(items).toHaveCount(2);
  await expect(items.first()).toContainText('Second');
  await expect(items.first()).toContainText('Not completed');
  await expect(title).toHaveValue('');
});

test('shows a validation message for an empty title', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add todo' }).click();

  await expect(page.getByText('Enter a title')).toBeVisible();
});
