import { expect, test } from "@playwright/test"

test.describe("tags en", () => {
  test("tag term list", async ({ page }) => {
    await page.goto("/tags/works/")
    await expect(page.locator("article").first()).toBeVisible()
    await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
  })

  test("tag cloud visible on tag page", async ({ page }) => {
    await page.goto("/tags/works/")
    await expect(page.locator("#tag-cloud")).toBeVisible()
    await expect(page.locator("#tag-cloud a").first()).toBeVisible()
    await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
  })

  test("active tag is highlighted", async ({ page }) => {
    await page.goto("/tags/works/")
    await page.waitForTimeout(300)
    const activeTag = page.locator("#tag-cloud a:not(.tag-cloud-float)")
    await expect(activeTag).toBeVisible()
    const text = await activeTag.textContent()
    expect(text?.toLowerCase()).toBe("works")
  })

  test("non-active tag links navigate correctly", async ({ page }) => {
    await page.goto("/tags/works/")
    const floatingTag = page.locator("#tag-cloud a.tag-cloud-float").first()
    await expect(floatingTag).toBeVisible()
    const href = await floatingTag.getAttribute("href")
    if (!href) throw new Error("floating tag has no href")
    await page.goto(href)
    expect(page.url()).toContain(href)
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
    await page.goto("/tags/works/")
    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
  })

  test("tag cloud container stays within viewport", async ({ page }) => {
    await page.goto("/tags/works/")
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
