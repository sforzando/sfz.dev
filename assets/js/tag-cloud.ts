// ── Constants ──────────────────────────────────────────────────────────────────
// ── Helpers ────────────────────────────────────────────────────────────────────
// Inject float animation CSS once.
// translate (individual CSS property) composes on top of the inline transform,
// so the positioning transform is unaffected.
function injectTagCloudStyle(): void {
  if (document.getElementById("tag-cloud-style")) return
  const style = document.createElement("style")
  style.id = "tag-cloud-style"
  style.textContent = `
@keyframes tag-cloud-float {
  0%, 100% { translate: 0 0; }
  50%       { translate: 0 -4px; }
}

.tag-cloud-float {
  animation: tag-cloud-float var(--float-dur) ease-in-out infinite;
  animation-delay: var(--float-del);
}
`
  document.head.appendChild(style)
}

const FONT_MIN = 16 // px for tags with fewest articles
const FONT_MAX = 34 // px for most-popular non-pinned tags
const FONT_PINNED = 42 // px for pinned center tags — always larger than FONT_MAX
const FONT_ACTIVE_BONUS = 12 // additional px on top of base size for the active tag
const MARGIN = 0.1 // fraction of half-dimension kept clear at each edge

function tagFontSize(
  count: number,
  minCount: number,
  maxCount: number,
  isPinned: boolean,
  isActive: boolean
): number {
  const base =
    maxCount === minCount
      ? (FONT_MIN + FONT_MAX) / 2
      : FONT_MIN +
        ((count - minCount) / (maxCount - minCount)) * (FONT_MAX - FONT_MIN)
  let size = isPinned ? Math.max(base, FONT_PINNED) : base
  if (isActive) size += FONT_ACTIVE_BONUS
  return size
}

// Golden-angle radial layout: most important tags near center, least important at edges.
// Priority: active tag first, then pinned tags, then by count descending.
// Golden angle (~137.5°) distributes points without angular clustering.
function radialPositions(
  tags: Array<{ name: string; count: number }>,
  containerW: number,
  containerH: number,
  pinnedTags: string[],
  activeTag: string
): Array<{ baseX: number; baseY: number }> {
  const safeW = (containerW / 2) * (1 - 2 * MARGIN)
  const safeH = (containerH / 2) * (1 - 2 * MARGIN)
  const n = tags.length
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  const ranked = tags
    .map((t, i) => ({
      i,
      active: t.name.toLowerCase() === activeTag,
      pinned: pinnedTags.includes(t.name.toLowerCase()),
      count: t.count,
    }))
    .sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.count - a.count
    })

  const positions = new Array<{ baseX: number; baseY: number }>(n)
  ranked.forEach(({ i }, rank) => {
    // rank 0 at center; rank 1+ start at MIN_R to keep the large center tag from overlapping neighbors
    const MIN_R = 0.55
    const r =
      rank === 0
        ? 0
        : MIN_R + (1 - MIN_R) * Math.sqrt((rank - 1) / Math.max(n - 2, 1))
    const angle = rank * goldenAngle
    positions[i] = {
      baseX: Math.cos(angle) * r * safeW,
      baseY: Math.sin(angle) * r * safeH,
    }
  })
  return positions
}

type TagData = { name: string; count: number; url: string }

// ── Render ─────────────────────────────────────────────────────────────────────
// Extracted so ResizeObserver can re-invoke without re-parsing data attributes.
function renderTagCloud(
  container: HTMLElement,
  data: TagData[],
  activeTag: string,
  pinnedTags: string[]
): void {
  container.replaceChildren()

  // clientWidth excludes scrollbar width — more accurate than offsetWidth here
  const containerW = container.clientWidth
  const containerH = container.clientHeight
  if (containerW === 0 || containerH === 0) return

  const safeHalfW = (containerW / 2) * (1 - 2 * MARGIN)
  const safeHalfH = (containerH / 2) * (1 - 2 * MARGIN)

  const counts = data.map((d) => d.count)
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)

  const positions = radialPositions(
    data,
    containerW,
    containerH,
    pinnedTags,
    activeTag
  )

  for (const [i, d] of data.entries()) {
    const isActive = d.name.toLowerCase() === activeTag
    const isPinned = pinnedTags.includes(d.name.toLowerCase())
    const el = document.createElement("a")
    el.href = d.url
    el.textContent = d.name

    // Clamp each tag's center offset to the safe area so no tag can escape the
    // container boundary regardless of GPU compositor clipping behavior.
    const clampedX = Math.max(
      -safeHalfW,
      Math.min(safeHalfW, positions[i].baseX)
    )
    const clampedY = Math.max(
      -safeHalfH,
      Math.min(safeHalfH, positions[i].baseY)
    )

    // Baking scale() into the same transform property as the positioning translate
    // ensures transform-origin: 50% 50% resolves to the element's visual center,
    // so hover scale always expands from the tag's midpoint without shifting it.
    const baseTransform = `translate(calc(-50% + ${clampedX.toFixed(1)}px), calc(-50% + ${clampedY.toFixed(1)}px))`

    el.style.cssText = [
      "position:absolute",
      "top:50%",
      "left:50%",
      "white-space:nowrap",
      "cursor:pointer",
      "text-decoration:none",
      `font-weight:${isActive ? 700 : isPinned ? 600 : 500}`,
      "line-height:1.2",
      "transition:color 0.15s, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      "color:inherit",
    ].join(";")
    const baseFontSize = tagFontSize(
      d.count,
      minCount,
      maxCount,
      isPinned,
      isActive
    )
    // Active tag sits at center (offsetX≈0) with white-space:nowrap, so its full
    // text width must fit within the container. Cap using ~0.58× char-width ratio
    // for the sans-serif font; floor at FONT_MIN so it never becomes illegible.
    const fontSize = isActive
      ? Math.max(
          FONT_MIN,
          Math.min(baseFontSize, (containerW * 0.88) / (d.name.length * 0.58))
        )
      : baseFontSize
    el.style.fontSize = `${fontSize.toFixed(1)}px`
    el.style.transform = baseTransform

    if (isActive) {
      el.style.filter = "drop-shadow(3px 3px 0 #687987)"
    } else {
      el.className =
        "hover:text-primary-600 dark:hover:text-primary-400 tag-cloud-float"
      // Stagger duration and phase per tag so they drift independently.
      // Negative delay starts each tag partway through its cycle on load.
      el.style.setProperty("--float-dur", `${2.6 + (i % 5) * 0.35}s`)
      el.style.setProperty("--float-del", `-${(i * 1.1) % 3}s`)
    }

    el.addEventListener("mouseenter", () => {
      el.style.transform = `${baseTransform} scale(1.12)`
    })

    el.addEventListener("mouseleave", () => {
      el.style.transform = baseTransform
    })

    container.appendChild(el)
  }
}

// ── Init ───────────────────────────────────────────────────────────────────────
function initTagCloud(): void {
  injectTagCloudStyle()

  const container = document.getElementById("tag-cloud")
  if (!container) return

  const raw = container.dataset.tags
  if (!raw) return

  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed) || parsed.length === 0) return
  const data = parsed as TagData[]

  const activeTag = (container.dataset.activeTag ?? "").toLowerCase()

  // pinnedCenterTags is configured in config/_default/params.toml [tagCloud]
  const rawPinned = container.dataset.pinnedTags
  const pinnedTags: string[] = rawPinned
    ? (JSON.parse(rawPinned) as string[]).map((s) => s.toLowerCase())
    : []

  renderTagCloud(container, data, activeTag, pinnedTags)

  // Re-render on container resize to handle orientation changes and layout shifts.
  const observer = new ResizeObserver(() => {
    renderTagCloud(container, data, activeTag, pinnedTags)
  })
  observer.observe(container)
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTagCloud)
} else {
  initTagCloud()
}
