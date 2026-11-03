import { expect, test } from '@playwright/test';

test('toggles a todo complete and back with the keyboard, keeping focus', async ({
  page,
}) => {
  await page.goto('/');
  const title = page.getByRole('textbox', { name: 'Title' });
  await title.fill('Buy milk');
  await title.press('Enter');

  const row = page.getByRole('listitem').filter({ hasText: 'Buy milk' });
  const checkbox = page.getByRole('checkbox', { name: 'Buy milk' });
  await expect(row).toContainText('Not completed');

  await checkbox.focus();
  await page.keyboard.press('Space');

  await expect(row).toContainText('Completed');
  await expect(row).not.toContainText('Not completed');
  await expect(checkbox).toBeChecked();
  await expect(checkbox).toBeFocused();

  await page.keyboard.press('Space');

  await expect(row).toContainText('Not completed');
  await expect(checkbox).not.toBeChecked();
  await expect(checkbox).toBeFocused();
});
