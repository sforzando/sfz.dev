import { expect, test } from "@playwright/test"

test("contact ja", async ({ page }) => {
  await page.goto("/ja/contact/")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
  await expect(page.locator('form[name="contact"]')).toBeVisible()
})
