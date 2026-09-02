const { test, expect } = require('./test-base');

test('search Wikipedia for Stalin', async ({ page }) => {
  await page.goto('https://www.wikipedia.org/', { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: /English/ }).click();

  const searchInput = page
    .getByRole('searchbox', { name: 'Search Wikipedia' })
    .first();

  await searchInput.waitFor({ state: 'visible', timeout: 30000 });
  await searchInput.fill('Stalin');
  await page.keyboard.press('Enter');

  const heading = page.getByRole('heading', { name: 'Joseph Stalin' });
  await expect(heading).toBeVisible();
});