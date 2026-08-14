import { expect, test } from "@playwright/test"
import { waitForVisibleImages } from "./helpers"

test.describe("posts en", () => {
  test("list", async ({ page }) => {
    await page.goto("/posts/")
    await waitForVisibleImages(page)
    await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
    await expect(page.locator("article").first()).toBeVisible()
  })

  test("detail", async ({ page }) => {
    await page.goto("/posts/dummy_0000/")
    await waitForVisibleImages(page)
    await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
    await expect(page.locator("h1")).toBeVisible()
  })

  test("tag cloud is visible", async ({ page }) => {
    await page.goto("/posts/")
    const cloud = page.locator("#tag-cloud")
    await expect(cloud).toBeVisible()
    await expect(cloud.locator("a").first()).toBeVisible()
  })

  test("tag cloud link navigates to tag page", async ({ page }) => {
    await page.goto("/posts/")
    const firstTag = page.locator("#tag-cloud a").first()
    const href = await firstTag.getAttribute("href")
    expect(href).toMatch(/^\/tags\//)
    if (href) {
      await page.goto(href)
      await expect(page).toHaveURL(/\/tags\//)
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
    await page.goto("/posts/")
    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
  })

  test("tag cloud container stays within viewport", async ({ page }) => {
    await page.goto("/posts/")
    await page.waitForTimeout(300)
    const overflow = await page.evaluate(() => {
      const cloud = document.getElementById("tag-cloud")
      if (!cloud) return -1
      const rect = cloud.getBoundingClientRect()
      const internalScroll = cloud.scrollWidth - cloud.clientWidth
      const externalOverflow = Math.max(
        0,
        rect.right - document.documentElement.clientWidth
      )
      return internalScroll + externalOverflow
    })
    expect(overflow).toBe(0)
  })
})
