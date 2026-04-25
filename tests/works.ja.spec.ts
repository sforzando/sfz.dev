import { expect, test } from "@playwright/test"

test("works ja", async ({ page }) => {
  await page.goto("/ja/works/")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
  await expect(page.locator("h1")).toContainText("Works")
})
