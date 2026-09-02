const { test, expect } = require('./test-base');

const ADDRESS = '2100 E Thousand Oaks Blvd, Thousand Oaks, CA 91362';
const BUSINESS_NAME = 'Demo bakery';

test.describe('License Finder', () => {
  test('happy path captures a business address and reaches the review screen', async ({ page }) => {
    await page.goto('https://license-finder.morebettercheddar.com/new', {
      waitUntil: 'networkidle',
    });

    await expect(page.getByRole('heading', { name: 'About your business' })).toBeVisible();

    const businessTypeButton = page.getByRole('button', { name: 'Sole proprietor' });
    await businessTypeButton.waitFor({ state: 'visible', timeout: 30000 });
    await businessTypeButton.click();

    await page.getByLabel('Business name (optional)').fill(BUSINESS_NAME);

    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeVisible({ timeout: 30000 });
    await expect(continueButton).toBeEnabled({ timeout: 30000 });
    await continueButton.click();

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

    const findLicensesButton = page.getByRole('button', { name: 'Find my licenses' });
    await expect(findLicensesButton).toBeVisible();
    await findLicensesButton.click();

    await expect(page).toHaveURL(/\/report\//);
    await expect(page.getByRole('heading', { name: 'Your license checklist' })).toBeVisible();
    await expect(page.getByText('2100 E THOUSAND OAKS BLVD, THOUSAND OAKS, CA, 91362')).toBeVisible();
    await expect(page.locator('body')).toContainText('Your license checklist');
  });

  test('downloads the generated PDF report', async ({ page }) => {
    await page.goto('https://license-finder.morebettercheddar.com/new', {
      waitUntil: 'domcontentloaded',
    });

    await page.getByRole('button', { name: 'Sole proprietor' }).click();
    await page.getByLabel('Business name (optional)').fill(BUSINESS_NAME);
    await page.getByRole('button', { name: 'Continue' }).click();

    const addressInput = page.getByLabel('Business address, location 1');
    await addressInput.fill(ADDRESS);
    await page.getByRole('button', { name: 'Check' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'What does your business do?' })).toBeVisible();
    await page.getByRole('button', { name: 'Bakery' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'A few more details' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'Review & find licenses' })).toBeVisible();
    await page.getByRole('button', { name: 'Find my licenses' }).click();
    await expect(page).toHaveURL(/\/report\//);

    const downloadLink = page.getByRole('link', { name: /download pdf/i });
    await expect(downloadLink).toBeVisible();

    const pdfUrl = new URL(await downloadLink.getAttribute('href'), page.url()).toString();
    const pdfResponse = await page.request.get(pdfUrl);
    expect(pdfResponse.ok()).toBeTruthy();
    expect(pdfResponse.headers()['content-type']).toContain('application/pdf');
    expect((await pdfResponse.body()).subarray(0, 5).toString()).toBe('%PDF-');
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

  test('rejects empty, malformed, long, and injection-like address inputs', async ({ page }) => {
    const cases = [
      { payload: '   ', expectedCheckDisabled: true },
      { payload: '', expectedCheckDisabled: true },
      { payload: 'invalid address', expectedCheckDisabled: false },
      { payload: '99999', expectedCheckDisabled: false },
      { payload: 'A'.repeat(500), expectedCheckDisabled: false },
      { payload: '<script>alert(1)</script>', expectedCheckDisabled: false },
      { payload: "' OR 1=1 --", expectedCheckDisabled: false },
      { payload: 'DROP TABLE users; --', expectedCheckDisabled: false },
    ];

    for (const { payload, expectedCheckDisabled } of cases) {
      await page.goto('https://license-finder.morebettercheddar.com/new', {
        waitUntil: 'domcontentloaded',
      });

      await page.getByRole('button', { name: 'Sole proprietor' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();

      const continueButton = page.getByRole('button', { name: 'Continue' });
      await expect(continueButton).toBeDisabled();

      const addressInput = page.getByLabel('Business address, location 1');
      await addressInput.fill(payload);

      const checkButton = page.getByRole('button', { name: 'Check' });
      if (expectedCheckDisabled) {
        await expect(checkButton).toBeDisabled();
      } else {
        await expect(checkButton).toBeEnabled();
        await checkButton.click();
        await expect(page.getByText('We found your city and county.')).not.toBeVisible();
      }

      await expect(continueButton).toBeDisabled();
    }
  });
});
