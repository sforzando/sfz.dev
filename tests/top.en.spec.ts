import { test, expect } from "@playwright/test"

test("top", async ({ page }) => {
  await page.goto("/")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
})
