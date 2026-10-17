import type { Page } from "@playwright/test"

// Congo marks content images loading="lazy", and the load event that page.goto
// waits for does not cover them. Without this a screenshot can catch a
// half-painted page, and running --update-snapshots in that state bakes the
// missing image into the reference: the posts detail snapshot was corrupted
// exactly this way, then failed every run afterwards.
//
// Only images intersecting the viewport are awaited, matching what
// page.screenshot() captures. Waiting on every image never settles in WebKit,
// where lazy images below the fold stay unloaded until scrolled.
export const waitForVisibleImages = (page: Page) =>
  page.waitForFunction(() =>
    Array.from(document.images)
      .filter((img) => {
        const box = img.getBoundingClientRect()
        return box.top < window.innerHeight && box.bottom > 0
      })
      .every((img) => img.complete)
  )
