import { expect, test } from "@playwright/test"

test("teams ja", async ({ page }) => {
  await page.goto("/ja/teams/")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
  await expect(page.getByText("鈴木")).toBeVisible()
})
