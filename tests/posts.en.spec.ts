import { expect, test } from "@playwright/test"

test("posts en", async ({ page }) => {
  await page.goto("/posts/")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
  await expect(page.locator("article").first()).toBeVisible()
})
