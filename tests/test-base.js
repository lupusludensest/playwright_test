const base = require('@playwright/test');

const test = base.test.extend({
  page: async ({ page }, use) => {
    await use(page);
    
    // Graceful close: ensure test fully completes before cleanup
    try {
      if (!page.isClosed()) {
        await page.close();
      }
    } catch (err) {
      // Ignore close errors if page is already closed or context is gone
      if (!err.message.includes('closed')) {
        throw err;
      }
    }
  },
});

module.exports = {
  test,
  expect: base.expect,
};
