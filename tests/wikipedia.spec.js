const { test, expect } = require('./test-base');

test('search Wikipedia for Stalin', async ({ page }) => {
  await page.goto('https://www.wikipedia.org/');
  await page.getByRole('link', { name: /English/ }).click();

  await page
    .getByRole('searchbox', { name: 'Search Wikipedia' })
    .first()
    .fill('Stalin');
  await page.keyboard.press('Enter');

  const heading = page.getByRole('heading', { name: 'Joseph Stalin' });
  await expect(heading).toBeVisible();
});