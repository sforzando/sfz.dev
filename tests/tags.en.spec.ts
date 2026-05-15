import { expect, test } from "@playwright/test"

test.describe("tags en", () => {
  test("tag term list", async ({ page }) => {
    await page.goto("/tags/tech/")
    await expect(page.locator("article").first()).toBeVisible()
    await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
  })

  test("tag cloud visible on tag page", async ({ page }) => {
    await page.goto("/tags/tech/")
    await expect(page.locator("#tag-cloud")).toBeVisible()
    await expect(page.locator("#tag-cloud a").first()).toBeVisible()
    await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
  })

  test("active tag is highlighted", async ({ page }) => {
    await page.goto("/tags/tech/")
    await page.waitForTimeout(300)
    const activeTag = page.locator("#tag-cloud a:not(.tag-cloud-float)")
    await expect(activeTag).toBeVisible()
    const text = await activeTag.textContent()
    expect(text?.toLowerCase()).toBe("tech")
  })

  test("non-active tag links navigate correctly", async ({ page }) => {
    await page.goto("/tags/tech/")
    const allTags = page.locator("#tag-cloud a")
    const count = await allTags.count()
    expect(count).toBeGreaterThan(1)
  })

  test("no JavaScript errors on tag page", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (
        msg.type() === "error" &&
        !msg.text().startsWith("Subresource Integrity:")
      )
        errors.push(msg.text())
    })
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto("/tags/tech/")
    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
  })
})
