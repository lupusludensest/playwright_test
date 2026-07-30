const { test, expect } = require('@playwright/test');

test('search Wikipedia for Stalin', async ({ page }) => {
  await page.goto('https://www.wikipedia.org/');
  await page.getByRole('link', { name: /English/ }).click();

  // Wikipedia has two matching searchboxes on the page (a sticky header
  // one appears once you scroll), so we grab the first visible match
  // instead of letting Playwright fail on ambiguity.
  await page.getByRole('searchbox', { name: 'Search Wikipedia' }).first().fill('Stalin');
  await page.keyboard.press('Enter');

  const heading = page.getByRole('heading', { name: 'Joseph Stalin' });
  await expect(heading).toBeVisible();
});