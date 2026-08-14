import { expect, test } from "@playwright/test"
import { waitForVisibleImages } from "./helpers"

test.describe("works ja", () => {
  test("list", async ({ page }) => {
    await page.goto("/ja/works/")
    await waitForVisibleImages(page)
    await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
    await expect(page.locator("h1")).toContainText("Works")
  })

  test("detail", async ({ page }) => {
    await page.goto("/ja/works/dummy_0000/")
    await waitForVisibleImages(page)
    await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
    await expect(page.locator("h1")).toBeVisible()
  })
})
