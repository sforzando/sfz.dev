import { expect, test } from "@playwright/test"

test.describe("background waves animation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:1313/")
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
      if (msg.type() === "error") errors.push(msg.text())
    })
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto("http://localhost:1313/")
    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
  })

  test("canvas fills the viewport", async ({ page }) => {
    const canvas = page.locator("canvas").first()
    const box = await canvas.boundingBox()
    const viewportSize = page.viewportSize()
    expect(box?.width).toBeCloseTo(viewportSize?.width, -1)
    expect(box?.height).toBeCloseTo(viewportSize?.height, -1)
  })

  test("click triggers scatter with no JavaScript errors", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    page.on("pageerror", (err) => errors.push(err.message))

    await page.goto("http://localhost:1313/")
    await page.waitForTimeout(300)

    const canvas = page.locator("canvas").first()
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.waitForTimeout(500)

    await page.mouse.click(
      box!.x + box!.width * 0.3,
      box!.y + box!.height * 0.4
    )
    await page.mouse.click(
      box!.x + box!.width * 0.7,
      box!.y + box!.height * 0.6
    )
    await page.waitForTimeout(500)

    expect(errors).toHaveLength(0)
  })
})
