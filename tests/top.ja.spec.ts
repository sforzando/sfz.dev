import { expect, test } from "@playwright/test"

test("top ja", async ({ page }) => {
  await page.goto("/ja/")
  await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })

  const menuButton = page.locator("#menu-button")
  if (await menuButton.isVisible()) {
    await menuButton.click()
  }
  await page.getByRole("button", { name: "JA" }).first().click()
  await page.getByRole("link", { name: "English" }).click()
  await expect(page).not.toHaveURL(/\/ja\//)
})
