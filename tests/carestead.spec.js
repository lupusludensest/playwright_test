const { test, expect } = require('./test-base');

process.loadEnvFile?.();

const CARESTEAD_URL = process.env.CARESTEAD_BASE_URL;
const CARESTEAD_APP_URL = process.env.CARESTEAD_APP_URL;
const CARESTEAD_EMAIL = process.env.CARESTEAD_EMAIL;
const CARESTEAD_PASSWORD = process.env.CARESTEAD_PASSWORD;

test.describe('Carestead', () => {
  test('navigates through Products, Plans, and FAQ', async ({ page }) => {
    await page.goto(CARESTEAD_URL, { waitUntil: 'networkidle' });

    const navigation = page.locator('header');
    await navigation.getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL(/#products$/);
    await expect(page.getByRole('heading', { name: 'Six tools. One roof.' })).toBeVisible();

    await navigation.getByRole('link', { name: 'Plans' }).click();
    await expect(page).toHaveURL(/#pricing$/);
    await expect(page.getByRole('heading', { name: 'Free', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Team', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enterprise', exact: true })).toBeVisible();

    await navigation.getByRole('link', { name: 'FAQ' }).click();
    await expect(page).toHaveURL(/#faq$/);
    await expect(page.getByRole('heading', { name: 'The short answers.' })).toBeVisible();
  });

  test('opens every FAQ question and displays its answer', async ({ page }) => {
    await page.goto(CARESTEAD_URL, { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/Carestead/);
    await page.getByRole('link', { name: 'FAQ' }).click();
    await expect(page).toHaveURL(/#faq$/);
    await expect(page.getByRole('heading', { name: 'The short answers.' })).toBeVisible();

    const questions = page.locator('#faq details');
    await expect(questions).toHaveCount(14);

    for (let index = 0; index < await questions.count(); index += 1) {
      const question = questions.nth(index);
      if (!(await question.evaluate(element => element.open))) {
        await question.locator('summary').click();
      }

      await expect(question).toHaveJSProperty('open', true);
      const summaryText = await question.locator('summary').innerText();
      const questionText = await question.innerText();
      expect(questionText.length).toBeGreaterThan(summaryText.length);
    }
  });

  test('opens the Carestead sign-in page with the expected controls', async ({ page }) => {
    await page.goto(CARESTEAD_URL, { waitUntil: 'networkidle' });

    await Promise.all([
      page.waitForURL(`${CARESTEAD_APP_URL}/login`),
      page.getByRole('link', { name: 'Sign in' }).first().click(),
    ]);

    await expect(page).toHaveURL(`${CARESTEAD_APP_URL}/login`);
    await expect(page).toHaveTitle(/Carestead/);
    await expect(page.getByRole('heading', { name: 'Sign in to Carestead' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create account' })).toHaveAttribute('href', '/signup');
  });

  test('rejects the configured credentials and remains on sign-in', async ({ page }) => {
    await page.goto(`${CARESTEAD_APP_URL}/login`, { waitUntil: 'networkidle' });

    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    await emailInput.fill(CARESTEAD_EMAIL);
    await passwordInput.fill(CARESTEAD_PASSWORD);
    await expect(emailInput).toHaveValue(CARESTEAD_EMAIL);
    await expect(passwordInput).toHaveValue(CARESTEAD_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(`${CARESTEAD_APP_URL}/login`);
    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });

  test('confirms account creation is Google-only', async ({ page }) => {
    await page.goto(`${CARESTEAD_APP_URL}/login`, { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/signup$/);
    await expect(page).toHaveURL(`${CARESTEAD_APP_URL}/signup`);
    await expect(page.getByRole('heading', { name: 'Create your Carestead account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(page.locator('input')).toHaveCount(0);
    await expect(page.getByText(/Already have an account\? Sign in/)).toBeVisible();
  });

  test('opens the early-access form and validates required fields', async ({ page }) => {
    await page.goto(CARESTEAD_URL, { waitUntil: 'networkidle' });

    await expect(page).toHaveTitle(/Carestead/);
    await expect(page.getByRole('heading', { name: /Tend your whole flock/i })).toBeVisible();

    await page.getByRole('link', { name: 'Request early access' }).first().click();
    await expect(page).toHaveURL(/\/request-access$/);
    await expect(page.getByRole('heading', { name: 'Request early access' })).toBeVisible();

    const submitButton = page.getByRole('button', { name: 'Request early access' });
    await expect(submitButton).toBeEnabled();
    await expect(page.locator('[name="church_name"]')).toHaveAttribute('required', '');
    await expect(page.locator('[name="contact_name"]')).toHaveAttribute('required', '');
    await expect(page.locator('[name="contact_email"]')).toHaveAttribute('required', '');
    expect(await page.locator('form').evaluate(form => form.checkValidity())).toBeFalsy();

    await page.locator('[name="church_name"]').fill('Demo church');
    await page.locator('[name="contact_name"]').fill('Test User');
    await page.locator('[name="contact_email"]').fill('test@example.com');
    await page.locator('[name="contact_phone"]').fill('555-0100');
    await page.locator('[name="church_city"]').fill('Thousand Oaks');
    await page.locator('[name="church_size"]').fill('about 150 on a Sunday');
    await page.locator('[name="website_url"]').fill('https://example.com');

    await expect(submitButton).toBeEnabled();
  });
});
