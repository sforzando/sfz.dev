import { expect, test } from "@playwright/test"
import { waitForVisibleImages } from "./helpers"

test("teams ja", async ({ page }) => {
  await page.goto("/ja/teams/")
  await waitForVisibleImages(page)
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
  await expect(page.getByText("鈴木")).toBeVisible()
  await expect(page.getByText("坂井")).toBeVisible()
  await expect(page.getByText("村上")).toBeVisible()
  await expect(page.getByText("Morinaga")).toBeVisible()
  await expect(page.getByText("Kurozumi")).toBeVisible()
})
