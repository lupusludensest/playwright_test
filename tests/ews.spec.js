const { test, expect } = require("@playwright/test");

const parseNumber = (text) => Number(text.replace(/[^0-9]/g, ""));

const parsePlanesAirborne = (text) => {
  const match = text.match(/^(\d+)[^\d]+/);
  return match ? Number(match[1].replace(/,/g, "")) : parseNumber(text);
};

const formatAverage = (value) => Number(value.toFixed(1));

test.afterEach(async ({ page }) => {
  if (!page.isClosed()) {
    await page.close();
  }
});

test("read Apocalypse Early Warning System dashboard values", async ({
  page,
}) => {
  await page.goto("https://ews.kylemcdonald.net/", { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('p.summary-count-line, .summary-text-block', { timeout: 15000 });

  // Emergency level (e.g. "Emergency level 1 of 5")
  const emergencyLevelBtn = page.getByRole('button', { name: /Emergency level/i });
  await expect(emergencyLevelBtn).toBeVisible();
  const emergencyLevel = await emergencyLevelBtn.getAttribute("aria-label");
  console.log("Emergency level:", emergencyLevel);

  // Planes airborne, e.g. "364/31,738 planes airborne"
  const planesAirborne = page.getByText(/planes airborne/i).first();
  await expect(planesAirborne).toBeVisible();
  const planesAirborneText = await planesAirborne.innerText();
  console.log("Planes airborne:", planesAirborneText);

  // Max people airborne, e.g. "4,036 max people airborne"
  const maxPeopleAirborne = page.getByText(/max people airborne/i).first();
  await expect(maxPeopleAirborne).toBeVisible();
  const maxPeopleAirborneText = await maxPeopleAirborne.innerText();
  console.log("Max people airborne:", maxPeopleAirborneText);

  const deviation = page.locator("p").filter({ hasText: "Deviation:" });
  await expect(deviation).toBeVisible();
  const deviationText = await deviation.innerText();
  console.log("Deviation:", deviationText);

  const lastUpdate = page.locator("p").filter({ hasText: "Last Update:" });
  await expect(lastUpdate).toBeVisible();
  const lastUpdateText = await lastUpdate.innerText();
  console.log("Last update:", lastUpdateText);

  const planesAirborneCount = parsePlanesAirborne(planesAirborneText);
  const maxPeopleAirborneCount = parseNumber(maxPeopleAirborneText);
  const averagePeoplePerJet = formatAverage(maxPeopleAirborneCount / planesAirborneCount);

  const summary = {
    emergencyLevel,
    planesAirborne: planesAirborneText,
    maxPeopleAirborne: maxPeopleAirborneText,
    averagePeoplePerJet,
    deviation: deviationText,
    lastUpdate: lastUpdateText,
  };
  console.log("EWS snapshot:", summary);
});
