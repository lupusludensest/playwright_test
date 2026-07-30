// playwright.config.cjs
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  workers: 4,
  use: {
    headless: false,
  },
});