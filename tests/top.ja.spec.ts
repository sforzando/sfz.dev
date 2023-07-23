import { test, expect } from "@playwright/test"

test("top-ja-dark", async ({ page }) => {
  await page.goto("/ja")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
})
