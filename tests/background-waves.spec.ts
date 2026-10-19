import { expect, type Page, test } from "@playwright/test"

// The renderer uses preserveDrawingBuffer, so toDataURL reflects the last
// rendered frame; comparing two captures tells whether the loop is running.
async function captureCanvas(page: Page): Promise<string> {
  return page
    .locator("canvas")
    .first()
    .evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())
}

async function waitForFrameChange(page: Page): Promise<boolean> {
  const before = await captureCanvas(page)
  await page.waitForTimeout(500)
  return before !== (await captureCanvas(page))
}

// A blank canvas holds only the clear color; the shaded mesh adds many more.
async function countDistinctColors(page: Page): Promise<number> {
  return page
    .locator("canvas")
    .first()
    .evaluate((canvas: HTMLCanvasElement) => {
      const sample = document.createElement("canvas")
      sample.width = 64
      sample.height = 64
      const context = sample.getContext("2d")
      if (!context) return 0
      context.drawImage(canvas, 0, 0, sample.width, sample.height)
      const { data } = context.getImageData(0, 0, sample.width, sample.height)
      const colors = new Set<number>()
      for (let i = 0; i < data.length; i += 4) {
        colors.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2])
      }
      return colors.size
    })
}

test.describe("background waves animation", () => {
  // playwright.config.ts defaults to reduce; these cases exercise the motion itself
  test.use({ contextOptions: { reducedMotion: "no-preference" } })

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

  test("frames keep changing", async ({ page }) => {
    expect(await waitForFrameChange(page)).toBe(true)
  })

  test("stops when reduced motion is turned on while browsing", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    expect(await waitForFrameChange(page)).toBe(false)
  })
})

test.describe("background waves under reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } })

  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("draws a still frame instead of a blank canvas", async ({ page }) => {
    expect(await countDistinctColors(page)).toBeGreaterThan(10)
  })

  test("does not keep animating", async ({ page }) => {
    expect(await waitForFrameChange(page)).toBe(false)
  })

  test("resumes when reduced motion is turned off while browsing", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    expect(await waitForFrameChange(page)).toBe(true)
  })
})
