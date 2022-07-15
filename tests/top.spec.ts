import { test, expect } from "@playwright/test"

test("top", async ({ page }) => {
  // Go to https://sfz.dev/
  await page.goto("https://sfz.dev/")

  // Click text=🇯🇵 To Jpn >> nth=0
  await page.locator("text=🇯🇵 To Jpn").first().click()
  await expect(page).toHaveURL("https://sfz.dev/ja/")
})
