const { test, expect } = require('@playwright/test');

test('read Apocalypse Early Warning System dashboard values', async ({ page }) => {
  await page.goto('https://ews.kylemcdonald.net/');

  // NOTE: these are nth-child based selectors copied from the live DOM.
  // They are fragile — if the site's layout changes, these will break.
  // If that happens, re-inspect the page and update the selectors below.

  // Emergency level (e.g. "Emergency level 1 of 5")
  const emergencyLevelBtn = page.locator("button[aria-label^='Emergency level']");
  await expect(emergencyLevelBtn).toBeVisible();
  const emergencyLevel = await emergencyLevelBtn.getAttribute('aria-label');
  console.log('Emergency level:', emergencyLevel);

  // Planes airborne, e.g. "276/31,738 planes airborne"
  const planesAirborne = page.locator(
    'body > div:nth-child(1) > main:nth-child(2) > section:nth-child(2) > div:nth-child(2) > section:nth-child(1) > div:nth-child(2) > p:nth-child(1) > strong:nth-child(2)'
  );
  await expect(planesAirborne).toBeVisible();
  const planesAirborneText = await planesAirborne.innerText();
  console.log('Planes airborne:', planesAirborneText);

  // Max people airborne, e.g. "3,434 max people airborne"
  const maxPeopleAirborne = page.locator(
    "p[title='Known capacities for 218 of 276 airborne aircraft; missing capacities are scaled by the known average.'] strong"
  );
  await expect(maxPeopleAirborne).toBeVisible();
  const maxPeopleAirborneText = await maxPeopleAirborne.innerText();
  console.log('Max people airborne:', maxPeopleAirborneText);

  // Deviation, e.g. "-49 (-1.5σ)"
  const deviation = page.locator('p:nth-child(3) strong:nth-child(1)');
  await expect(deviation).toBeVisible();
  const deviationText = await deviation.innerText();
  console.log('Deviation:', deviationText);

  // Last update timestamp, e.g. "Jul 29, 9:30 PM EDT"
  const lastUpdate = page.locator('p:nth-child(4) strong:nth-child(1)');
  await expect(lastUpdate).toBeVisible();
  const lastUpdateText = await lastUpdate.innerText();
  console.log('Last update:', lastUpdateText);

  // Optional: bundle everything into one object for easy reuse/logging
  const summary = {
    emergencyLevel,
    planesAirborne: planesAirborneText,
    maxPeopleAirborne: maxPeopleAirborneText,
    deviation: deviationText,
    lastUpdate: lastUpdateText,
  };
  console.log('EWS snapshot:', summary);
});