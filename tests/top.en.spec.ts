import { expect, test } from "@playwright/test"

test("top en", async ({ page }) => {
  await page.goto("/")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })

  const menuButton = page.locator("#menu-button")
  if (await menuButton.isVisible()) {
    await menuButton.click()
  }
  await page.getByRole("button", { name: "EN" }).first().click()
  await page.waitForTimeout(300)
  await page.getByRole("link", { name: "日本語" }).first().click()
  await expect(page).toHaveURL(/\/ja\//)
})
