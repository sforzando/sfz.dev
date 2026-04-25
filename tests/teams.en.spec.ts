import { expect, test } from "@playwright/test"

test("teams en", async ({ page }) => {
  await page.goto("/teams/")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
  await expect(page.getByText("Shin'ichiro")).toBeVisible()
})
