import { test, expect } from "@playwright/test"

test("top", async ({ page, isMobile }) => {
  // Go to https://sfz.dev/
  await page.goto("https://sfz.dev/")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })

  if (isMobile) {
    await page.locator("#menu-button").click()
    await page.locator("#menu-wrapper >> text=🇯🇵 To Jpn").click()
  } else {
    await page.locator("text=🇯🇵 To Jpn >> nth=0").click()
  }
  await expect(page).toHaveURL("https://sfz.dev/ja/")
})
