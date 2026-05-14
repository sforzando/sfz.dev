import { expect, test } from "@playwright/test"

test.describe("background waves animation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("canvas element is present and visible", async ({ page }) => {
    const canvas = page.locator("canvas").first()
    await expect(canvas).toBeVisible()
    const box = await canvas.boundingBox()
    expect(box?.width).toBeGreaterThan(0)
    expect(box?.height).toBeGreaterThan(0)
  })

  test("no JavaScript errors during animation", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (
        msg.type() === "error" &&
        !msg.text().startsWith("Subresource Integrity:")
      )
        errors.push(msg.text())
    })
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto("/")
    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
  })

  test("canvas fills the viewport", async ({ page }) => {
    const canvas = page.locator("canvas").first()
    const box = await canvas.boundingBox()
    const { clientWidth, clientHeight } = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
    }))
    // Canvas must cover at least the CSS viewport; on high-DPR mobile it may be
    // larger (device-pixel-wide) so we only assert a floor, not an exact match.
    expect(box?.width).toBeGreaterThanOrEqual(clientWidth - 5)
    expect(box?.height).toBeGreaterThanOrEqual(clientHeight - 5)
  })

  test("click triggers scatter with no JavaScript errors", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    page.on("pageerror", (err) => errors.push(err.message))

    await page.goto("/")
    await page.waitForTimeout(300)

    const canvas = page.locator("canvas").first()
    const box = await canvas.boundingBox()
    if (!box) return
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(500)

    await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.4)
    await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.6)
    await page.waitForTimeout(500)

    const filteredErrors = errors.filter(
      (e) => !e.startsWith("Subresource Integrity:")
    )
    expect(filteredErrors).toHaveLength(0)
  })
})
