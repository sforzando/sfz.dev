import { test, expect } from "@playwright/test";

test("Visual Regression Test", async ({ page }) => {
  await page.goto("https://sfz.dev/");

  await expect(page).toHaveTitle(/sforzando/);
  await expect(await page.screenshot()).toMatchSnapshot({threshold: 0.2});
});
