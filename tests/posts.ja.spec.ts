import { expect, test } from "@playwright/test"

test.describe("posts ja", () => {
  test("list", async ({ page }) => {
    await page.goto("/ja/posts/")
    await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
    await expect(page.locator("article").first()).toBeVisible()
  })

  test("detail", async ({ page }) => {
    await page.goto("/ja/posts/dummy_0000/")
    await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
    await expect(page.locator("h1")).toBeVisible()
  })
})
