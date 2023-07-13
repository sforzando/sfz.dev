import { test, expect } from "@playwright/test"

test("top", async ({ page }) => {
  // Go to Base URL
  await page.goto("/")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
})
