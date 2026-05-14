// ── Constants ──────────────────────────────────────────────────────────────────
const FONT_MIN = 14 // px for tags with fewest articles
const FONT_MAX = 34 // px for most-popular non-pinned tags
const FONT_PINNED = 42 // px for pinned center tags — always larger than FONT_MAX
const FONT_ACTIVE_BONUS = 12 // additional px on top of base size for the active tag
const MARGIN = 0.1 // fraction of half-dimension kept clear at each edge
const GLOW_ACTIVE = 2 // px text-shadow blur for the active tag (primary color via currentColor)

// ── Helpers ────────────────────────────────────────────────────────────────────
// Inject shine CSS once.
// Uses background-clip:text so the gradient paints inside character shapes only —
// no rectangular glow artifact, and no overflow:hidden needed on the tag element.
function injectShineStyle(): void {
  if (document.getElementById("tag-cloud-shine-style")) return
  const style = document.createElement("style")
  style.id = "tag-cloud-shine-style"
  style.textContent = `
@keyframes tag-cloud-shine {
  from { background-position: 100% center; }
  to   { background-position:   0% center; }
}

/* Silver metallic sweep for regular (white) tags */
.tag-cloud-shine-regular {
  background: linear-gradient(
    105deg,
    #606060 0%, #b0b0b0 38%, #ffffff 50%, #b0b0b0 62%, #606060 100%
  ) no-repeat;
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: tag-cloud-shine 1.4s linear infinite alternate;
}

/* Primary-color metallic sweep for the active tag — currentColor resolves to primary */
.tag-cloud-shine-active {
  background: linear-gradient(
    105deg,
    currentColor 0%, currentColor 38%,
    rgba(255,255,255,0.95) 50%,
    currentColor 62%, currentColor 100%
  ) no-repeat;
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: tag-cloud-shine 1.4s linear infinite alternate;
}
`
  document.head.appendChild(style)
}

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
// Priority: pinned tags first, then by count descending.
// Golden angle (~137.5°) distributes points without angular clustering.
function radialPositions(
  tags: Array<{ name: string; count: number }>,
  containerW: number,
  containerH: number,
  pinnedTags: string[]
): Array<{ baseX: number; baseY: number }> {
  const safeW = (containerW / 2) * (1 - 2 * MARGIN)
  const safeH = (containerH / 2) * (1 - 2 * MARGIN)
  const n = tags.length
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  const ranked = tags
    .map((t, i) => ({
      i,
      pinned: pinnedTags.includes(t.name.toLowerCase()),
      count: t.count,
    }))
    .sort((a, b) => {
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

// ── Init ───────────────────────────────────────────────────────────────────────
function initTagCloud(): void {
  injectShineStyle()

  const container = document.getElementById("tag-cloud")
  if (!container) return

  const raw = container.dataset.tags
  if (!raw) return

  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed) || parsed.length === 0) return
  const data = parsed as Array<{ name: string; count: number; url: string }>

  const activeTag = (container.dataset.activeTag ?? "").toLowerCase()

  // pinnedCenterTags is configured in config/_default/params.toml [tagCloud]
  const rawPinned = container.dataset.pinnedTags
  const pinnedTags: string[] = rawPinned
    ? (JSON.parse(rawPinned) as string[]).map((s) => s.toLowerCase())
    : []

  const counts = data.map((d) => d.count)
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)

  const containerW = container.offsetWidth
  const containerH = container.offsetHeight
  if (containerW === 0 || containerH === 0) return

  const positions = radialPositions(data, containerW, containerH, pinnedTags)

  container.style.position = "relative"

  for (const [i, d] of data.entries()) {
    const isActive = d.name.toLowerCase() === activeTag
    const isPinned = pinnedTags.includes(d.name.toLowerCase())
    const el = document.createElement("a")
    el.href = d.url
    el.textContent = d.name
    el.style.cssText = [
      "position:absolute",
      "top:50%",
      "left:50%",
      "white-space:nowrap",
      "cursor:pointer",
      "text-decoration:none",
      `font-weight:${isActive ? 700 : isPinned ? 600 : 500}`,
      "line-height:1.2",
      "transition:color 0.15s",
      "color:inherit",
    ].join(";")
    el.style.fontSize = `${tagFontSize(d.count, minCount, maxCount, isPinned, isActive).toFixed(1)}px`
    el.style.transform = `translate(calc(-50% + ${positions[i].baseX.toFixed(1)}px), calc(-50% + ${positions[i].baseY.toFixed(1)}px))`

    if (isActive) {
      el.className = "text-primary-500 dark:text-primary-400"
      el.style.textShadow = `0 0 ${GLOW_ACTIVE}px currentColor, 0 0 ${GLOW_ACTIVE * 2}px currentColor`
    } else {
      el.className = "hover:text-primary-600 dark:hover:text-primary-400"
    }

    // Metallic text shine: background-clip:text confines the sweep to character shapes,
    // avoiding the rectangular glow artifact of overlay approaches.
    const shineClass = isActive
      ? "tag-cloud-shine-active"
      : "tag-cloud-shine-regular"

    el.addEventListener("mouseenter", () => {
      el.classList.add(shineClass)
    })

    el.addEventListener("mouseleave", () => {
      el.classList.remove(shineClass)
    })

    container.appendChild(el)
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTagCloud)
} else {
  initTagCloud()
}
