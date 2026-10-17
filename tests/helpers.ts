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
//
// Linux WebKit in CI also sometimes never requested a lazy image that sat in
// the viewport (teams page traces showed the fourth avatar unrequested for
// the whole timeout). Rather than rewriting loading attributes, which would
// hide what a reader actually gets, the page is scrolled through the way a
// reader would, so every lazy image goes through the browser's own
// intersection checks before the wait starts.
export const waitForVisibleImages = async (page: Page) => {
  await scrollThroughPage(page)
  await page.waitForFunction(() =>
    Array.from(document.images)
      .filter((img) => {
        const box = img.getBoundingClientRect()
        return box.top < window.innerHeight && box.bottom > 0
      })
      .every((img) => img.complete)
  )
}

// mouse.wheel is unsupported in mobile WebKit, so scrolling goes through
// window.scrollTo, which still fires the scroll events lazy loading reacts to.
// The site sets scroll-behavior: smooth, and WebKit animated the return to
// the top despite reducedMotion, so screenshots landed mid-scroll; each jump
// is therefore forced instant. Two animation frames per step give layout
// and intersection checks a chance to run before moving on.
const scrollThroughPage = (page: Page) =>
  page.evaluate(async () => {
    const settle = () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
    const step = window.innerHeight
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" })
      await settle()
    }
    window.scrollTo({ top: 0, behavior: "instant" })
    await settle()
  })
