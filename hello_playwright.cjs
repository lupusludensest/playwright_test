const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://www.wikipedia.org/');
    
    // Click on the English link
    await page.getByRole('link', { name: 'English 6,949,000+ articles' }).click();

    // Wait for the "49th imam" link to be visible before clicking
    await page.waitForSelector('text=49th imam'); // Adjust this selector as needed
    await page.getByRole('link', { name: '49th imam' }).click();

    // Click on "Administration"
    await page.getByRole('link', { name: 'Administration' }).click();

    // Click on "Delegations"
    await page.getByRole('link', { name: 'Delegations' }).click();

    // Click on "Wikipedia The Free"
    await page.getByRole('link', { name: 'Wikipedia The Free' }).click();

    // Search for "Stalin"
    await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('Stalin');
    await page.keyboard.press('Enter');

    // Click on the heading for "Joseph Stalin"
    await page.getByRole('heading', { name: 'Joseph Stalin' }).click();

    // Right-click on the span within the heading to open the context menu
    await page.getByRole('heading', { name: 'Joseph Stalin' }).locator('span').click({ button: 'right' });

    // Ensure the span is visible
    const spanVisible = await page.getByRole('heading', { name: 'Joseph Stalin' }).locator('span').isVisible();
    if (spanVisible) {
      console.log('The span is visible.');
    } else {
      console.log('The span is not visible.');
    }
  } catch (error) {
    console.error(`Error occurred on page ${page.url()} at ${new Date().toISOString()}:`, error);
  } finally {
    await context.close();
    await browser.close();
  }
})();