import { expect, type Page, test } from "@playwright/test"

// Congo marks the works images loading="lazy", and the load event that
// page.goto waits for does not cover them. Without this the screenshot can
// catch a half-painted grid, which on portrait phone widths leaves ~30% of the
// pixels differing between runs.
//
// Only images intersecting the viewport are awaited, matching what
// page.screenshot() captures. Waiting on every image never settles in WebKit,
// where lazy images below the fold stay unloaded until scrolled.
const waitForVisibleImages = (page: Page) =>
  page.waitForFunction(() =>
    Array.from(document.images)
      .filter((img) => {
        const box = img.getBoundingClientRect()
        return box.top < window.innerHeight && box.bottom > 0
      })
      .every((img) => img.complete)
  )

test.describe("works en", () => {
  test("list", async ({ page }) => {
    await page.goto("/works/")
    await waitForVisibleImages(page)
    await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
    await expect(page.locator("h1")).toContainText("Works")
  })

  test("detail", async ({ page }) => {
    await page.goto("/works/dummy_0000/")
    await waitForVisibleImages(page)
    await expect(await page.screenshot()).toMatchSnapshot({ threshold: 0.3 })
    await expect(page.locator("h1")).toBeVisible()
  })
})
