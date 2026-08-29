const base = require('@playwright/test');

const test = base.test.extend({
  page: async ({ page }, use) => {
    await use(page);

    if (!page.isClosed()) {
      await page.close();
    }
  },
});

module.exports = {
  test,
  expect: base.expect,
};
