import { test, expect } from "@playwright/test"

test("top-en-dark", async ({ page }) => {
  await page.goto("/")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
})
