const { test, expect } = require("@playwright/test");

test("read Apocalypse Early Warning System dashboard values", async ({
  page,
}) => {
  await page.goto("https://ews.kylemcdonald.net/");

  // Emergency level (e.g. "Emergency level 1 of 5")
  const emergencyLevelBtn = page.locator(
    "button[aria-label^='Emergency level']",
  );
  await expect(emergencyLevelBtn).toBeVisible();
  const emergencyLevel = await emergencyLevelBtn.getAttribute("aria-label");
  console.log("Emergency level:", emergencyLevel);

  // Planes airborne, e.g. "276/31,738 planes airborne"
  const planesAirborne = page.locator(
    "body > div:nth-child(1) > main:nth-child(2) > section:nth-child(2) > div:nth-child(2) > section:nth-child(1) > div:nth-child(2) > p:nth-child(1)",
  );
  await expect(planesAirborne).toBeVisible();
  const planesAirborneText = await planesAirborne.innerText();
  console.log("Planes airborne:", planesAirborneText);

  // Max people airborne, e.g. "3,434 max people airborne"
  const maxPeopleAirborne = page.locator(
    "p[title='Known capacities for 218 of 276 airborne aircraft; missing capacities are scaled by the known average.'] strong",
  );
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

  const summary = {
    emergencyLevel,
    planesAirborne: planesAirborneText,
    maxPeopleAirborne: maxPeopleAirborneText,
    deviation: deviationText,
    lastUpdate: lastUpdateText,
  };
  console.log("EWS snapshot:", summary);
});
