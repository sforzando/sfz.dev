import { expect, test } from "@playwright/test"

test("top", async ({ page, isMobile }) => {
  await page.goto("/")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })

  if (isMobile) {
    await page.locator("#menu-button").click()
  }
  await page.getByRole("button", { name: "EN" }).click()
  await page.getByRole("link", { name: "日本語" }).click()
  await expect(page).toHaveURL(/\/ja\//)
})
