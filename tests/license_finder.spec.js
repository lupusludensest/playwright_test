const { test, expect } = require('./test-base');

const ADDRESS = '2100 E Thousand Oaks Blvd, Thousand Oaks, CA 91362';
const BUSINESS_NAME = 'Demo bakery';

test.describe('License Finder', () => {
  test('happy path captures a business address and reaches the review screen', async ({ page }) => {
    await page.goto('https://license-finder.morebettercheddar.com/new', {
      waitUntil: 'domcontentloaded',
    });

    await expect(page.getByRole('heading', { name: 'About your business' })).toBeVisible();

    await page.getByRole('button', { name: 'Sole proprietor' }).click();
    await page.getByLabel('Business name (optional)').fill(BUSINESS_NAME);
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'Business location' })).toBeVisible();

    const addressInput = page.getByLabel('Business address, location 1');
    await addressInput.fill(ADDRESS);
    await page.getByRole('button', { name: 'Check' }).click();

    await expect(page.getByText('We found your city and county.')).toBeVisible();
    await expect(page.getByText('Thousand Oaks city')).toBeVisible();

    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'What does your business do?' })).toBeVisible();
    await page.getByRole('button', { name: 'Bakery' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'A few more details' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'Review & find licenses' })).toBeVisible();
    await expect(page.getByText('Sole proprietor')).toBeVisible();
    await expect(page.getByText('Bakery')).toBeVisible();
    await expect(page.getByText('2100 E THOUSAND OAKS BLVD, THOUSAND OAKS, CA, 91362')).toBeVisible();

    await page.getByRole('button', { name: 'Find my licenses' }).click();

    await expect(page.getByText('Finding licenses…')).toBeVisible();
  });

  test('negative path blocks progression until address is validated', async ({ page }) => {
    await page.goto('https://license-finder.morebettercheddar.com/new', {
      waitUntil: 'domcontentloaded',
    });

    await page.getByRole('button', { name: 'Sole proprietor' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    const addressInput = page.getByLabel('Business address, location 1');
    await addressInput.fill(ADDRESS);

    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();

    await page.getByRole('button', { name: 'Check' }).click();
    await expect(page.getByText('We found your city and county.')).toBeVisible();
    await expect(continueButton).toBeEnabled();
  });
});
