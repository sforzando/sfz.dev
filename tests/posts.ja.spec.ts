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

  test("tag cloud is visible", async ({ page }) => {
    await page.goto("/ja/posts/")
    const cloud = page.locator("#tag-cloud")
    await expect(cloud).toBeVisible()
    await expect(cloud.locator("a").first()).toBeVisible()
  })

  test("tag cloud link navigates to tag page", async ({ page }) => {
    await page.goto("/ja/posts/")
    const firstTag = page.locator("#tag-cloud a").first()
    const href = await firstTag.getAttribute("href")
    expect(href).toMatch(/^\/ja\/tags\//)
    if (href) {
      await page.goto(href)
      await expect(page).toHaveURL(/\/ja\/tags\//)
    }
  })

  test("tag cloud has no JavaScript errors", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (
        msg.type() === "error" &&
        !msg.text().startsWith("Subresource Integrity:")
      )
        errors.push(msg.text())
    })
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto("/ja/posts/")
    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
  })
})
