# Background Waves Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Vanta.js "Waves" effect to `assets/js/background-waves.ts`, a self-contained TypeScript ES module using Three.js v0.184.0, replacing the current `emergence-network.js` particle animation.

**Architecture:** Single TypeScript module with module-level state. `buildGeometry()` creates the wave mesh once; `animate()` mutates the same `Float32Array` each frame via the trochoid wave equation (ported from Vanta). Mouse and touch events update a camera goal; `updateCamera()` lerps the camera toward the goal each frame.

**Tech Stack:** TypeScript 6.0.3, Three.js 0.184.0 (`@types/three` for declarations), Hugo esbuild for TS transpilation, Playwright for integration tests.

---

## Task 1: Update dependencies and TypeScript configuration

**Files:**

- Modify: `package.json`
- Create: `tsconfig.json`
- Delete: `assets/jsconfig.json`

- [ ] **Step 1: Update package.json**

Replace the `typescript` version and add `@types/three` devDependency. The `three` package at 0.184.0 ships no `.d.ts` files, so `@types/three` is required.

```json
{
  "devDependencies": {
    "@biomejs/biome": "2.4.12",
    "@playwright/test": "^1.59.1",
    "@types/three": "^0.184.0",
    "dotenv": "^17.4.2",
    "lefthook": "^2.1.6",
    "prettier": "^3.8.3",
    "prettier-plugin-go-template": "^0.0.15",
    "typescript": "^6.0.3"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json` at project root**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "lib": ["ES2020", "DOM"]
  },
  "include": ["assets/js/**/*.ts", "tests/**/*.ts", "playwright.config.ts"]
}
```

`"moduleResolution": "bundler"` matches how Hugo's esbuild resolves modules.
`"noEmit": true` — esbuild handles transpilation; `tsc` is used only for type checking.

- [ ] **Step 3: Delete `assets/jsconfig.json`**

```bash
rm assets/jsconfig.json
```

This file was a workaround for IDE resolution of `three` in `.js` files. It is superseded by `tsconfig.json` + `@types/three`.

- [ ] **Step 4: Install updated dependencies**

```bash
npm install
```

Expected: no errors. `node_modules/@types/three` directory now exists.

- [ ] **Step 5: Verify type checker runs (nothing to check yet)**

```bash
npx tsc --noEmit
```

Expected: exits 0 with no output (no `.ts` files in scope yet).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json
git add -u assets/jsconfig.json
git commit -m "chore: upgrade to TypeScript 6.0.3 and add @types/three"
```

---

## Task 2: Stub `background-waves.ts` and update Hugo integration

**Files:**

- Create: `assets/js/background-waves.ts` (stub)
- Modify: `layouts/partials/extend-head.html`
- Delete: `assets/js/emergence-network.js`

- [ ] **Step 1: Create stub `assets/js/background-waves.ts`**

```typescript
// Stub — full implementation in subsequent tasks
export {}
```

The stub exports nothing and creates no DOM elements. This allows Hugo to build while the test is written against the unfulfilled expectation.

- [ ] **Step 2: Update `layouts/partials/extend-head.html`**

Replace the entire file with:

```html
{{/* Background wave animation — Vanta Waves ported to Three.js */}}
{{ $js := resources.Get "js/background-waves.ts" | js.Build (dict "minify" hugo.IsProduction) | resources.Fingerprint "sha512" }}
<script
  defer
  type="text/javascript"
  src="{{ $js.RelPermalink }}"
  integrity="{{ $js.Data.Integrity }}"
></script>
```

- [ ] **Step 3: Delete `assets/js/emergence-network.js`**

```bash
rm assets/js/emergence-network.js
```

- [ ] **Step 4: Verify Hugo builds**

```bash
task start
```

Open `http://localhost:1313/` — no canvas, no animation (stub is empty). No Hugo build errors.

- [ ] **Step 5: Commit**

```bash
git add assets/js/background-waves.ts layouts/partials/extend-head.html
git add -u assets/js/emergence-network.js
git commit -m "chore: replace emergence-network.js stub with background-waves.ts skeleton"
```

---

## Task 3: Write failing Playwright test

**Files:**

- Create: `tests/background-waves.spec.ts`

- [ ] **Step 1: Create `tests/background-waves.spec.ts`**

```typescript
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
    expect(box?.width).toBeCloseTo(viewportSize!.width, -1)
    expect(box?.height).toBeCloseTo(viewportSize!.height, -1)
  })
})
```

- [ ] **Step 2: Run the test — verify it fails**

```bash
npx playwright test tests/background-waves.spec.ts --project=chromium
```

Expected: all 3 tests FAIL — "canvas element is present and visible" fails because the stub creates no canvas element.

- [ ] **Step 3: Commit**

```bash
git add tests/background-waves.spec.ts
git commit -m "test: add failing Playwright tests for background waves canvas"
```

---

## Task 4: Implement `background-waves.ts`

**Files:**

- Modify: `assets/js/background-waves.ts`

Write the full implementation in one focused pass. The file has five sections: constants, module state, geometry builder, animation functions, and event wiring.

- [ ] **Step 1: Write the complete `assets/js/background-waves.ts`**

```typescript
import * as THREE from "three"

// ── Grid dimensions ────────────────────────────────────────────────────────────
const COLUMNS = 100        // horizontal cells (vertices = COLUMNS + 1)
const ROWS = 80            // vertical cells   (vertices = ROWS + 1)
const CELL_SIZE = 18       // world-space units between adjacent vertices

// ── Wave appearance ────────────────────────────────────────────────────────────
const WAVE_COLOR = 0x005577
const WAVE_SHININESS = 30
const WAVE_HEIGHT = 15     // maximum crest height above resting Y
const WAVE_SPEED = 1       // multiplier on propagation rate
const VERTEX_Y_NOISE = 4   // random initial Y variation per vertex (choppiness)

// ── Camera ─────────────────────────────────────────────────────────────────────
const CAMERA_FOV = 35
const CAMERA_NEAR = 50
const CAMERA_FAR = 10_000
const CAMERA_START = new THREE.Vector3(250, 200, 400)
const LOOK_TARGET = new THREE.Vector3(150, -30, 200)
const CAMERA_LERP_FACTOR = 0.02   // fraction of distance closed per frame

// ── Mouse / touch influence on camera ──────────────────────────────────────────
const MOUSE_INFLUENCE_X = 100    // horizontal camera shift when cursor is at edge
const MOUSE_INFLUENCE_Y = 100    // vertical camera shift when cursor is at edge
const MOUSE_INFLUENCE_Z = 50     // depth camera shift when cursor is at edge

// ── Module state ───────────────────────────────────────────────────────────────
let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let waveMesh: THREE.Mesh
let positionData: Float32Array   // raw position buffer — mutated each frame
let originalY: Float32Array      // resting Y per vertex — written once at init
let positionAttr: THREE.BufferAttribute

// Camera lerp goal, updated by mouse/touch handlers
const cameraGoal = { x: CAMERA_START.x, y: CAMERA_START.y, z: CAMERA_START.z }

// Camera resting position, captured on first mouse/touch interaction
const cameraRest = {
  x: CAMERA_START.x,
  y: CAMERA_START.y,
  z: CAMERA_START.z,
  locked: false,
}

// 60fps-normalised animation timer (same scheme as Vanta)
let animationTime = 0
let previousFrameTime = 0

// ── Helpers ────────────────────────────────────────────────────────────────────

function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomInt(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min))
}

// ── Geometry ───────────────────────────────────────────────────────────────────

function buildGeometry(): THREE.BufferGeometry {
  const vertexCount = (COLUMNS + 1) * (ROWS + 1)
  positionData = new Float32Array(vertexCount * 3)
  originalY = new Float32Array(vertexCount)

  // Build vertex grid; store index in a 2-D lookup for triangle assembly
  const vertexGrid: number[][] = []
  let vertexIndex = 0

  for (let col = 0; col <= COLUMNS; col++) {
    vertexGrid[col] = []
    for (let row = 0; row <= ROWS; row++) {
      const x = (col - COLUMNS * 0.5) * CELL_SIZE
      const y = randomFloat(0, VERTEX_Y_NOISE) - 10
      const z = (ROWS * 0.5 - row) * CELL_SIZE

      positionData[vertexIndex * 3] = x
      positionData[vertexIndex * 3 + 1] = y
      positionData[vertexIndex * 3 + 2] = z
      originalY[vertexIndex] = y

      vertexGrid[col][row] = vertexIndex
      vertexIndex++
    }
  }

  // Mark as dynamic so WebGL knows the buffer will be updated frequently
  positionAttr = new THREE.BufferAttribute(positionData, 3)
  positionAttr.setUsage(THREE.DynamicDrawUsage)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", positionAttr)

  // Build triangle index list — each quad uses a randomly chosen diagonal
  const indices: number[] = []
  for (let col = 1; col <= COLUMNS; col++) {
    for (let row = 1; row <= ROWS; row++) {
      const topLeft = vertexGrid[col - 1][row - 1]
      const topRight = vertexGrid[col][row - 1]
      const bottomLeft = vertexGrid[col - 1][row]
      const bottomRight = vertexGrid[col][row]

      if (randomInt(0, 1) === 0) {
        indices.push(topLeft, topRight, bottomLeft)
        indices.push(topRight, bottomLeft, bottomRight)
      } else {
        indices.push(topLeft, topRight, bottomRight)
        indices.push(topLeft, bottomLeft, bottomRight)
      }
    }
  }
  geometry.setIndex(indices)

  return geometry
}

// ── Initialisation ─────────────────────────────────────────────────────────────

function init(): void {
  // Full-screen fixed container sits behind all page content
  const container = document.createElement("div")
  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    zIndex: "-50",
    pointerEvents: "none",
  })
  document.body.insertBefore(container, document.body.firstChild)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_NEAR,
    CAMERA_FAR,
  )
  camera.position.copy(CAMERA_START)
  scene.add(camera)

  const geometry = buildGeometry()

  const material = new THREE.MeshPhongMaterial({
    color: WAVE_COLOR,
    shininess: WAVE_SHININESS,
    flatShading: true,
    side: THREE.DoubleSide,
  })

  waveMesh = new THREE.Mesh(geometry, material)
  scene.add(waveMesh)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 0.9)
  pointLight.position.set(-100, 250, -100)
  scene.add(pointLight)

  window.addEventListener("resize", onResize)
  window.addEventListener("mousemove", handleMouseMove)
  window.addEventListener("scroll", handleScroll)
  window.addEventListener("touchstart", handleTouch, { passive: true })
  window.addEventListener("touchmove", handleTouch, { passive: true })
}

// ── Wave animation ─────────────────────────────────────────────────────────────

function updateWaves(): void {
  const vertexCount = originalY.length

  for (let i = 0; i < vertexCount; i++) {
    const x = positionData[i * 3]
    const z = positionData[i * 3 + 2]

    // Trochoid wave equation (ported from Vanta Waves)
    const crossChop = Math.sqrt(WAVE_SPEED) * Math.cos(-x - z * 0.7)
    const delta = Math.sin(
      WAVE_SPEED * animationTime * 0.02
      - WAVE_SPEED * x * 0.025
      + WAVE_SPEED * z * 0.015
      + crossChop,
    )
    const trochoidDelta = (delta + 1) ** 2 / 4

    positionData[i * 3 + 1] = originalY[i] + trochoidDelta * WAVE_HEIGHT
  }

  positionAttr.needsUpdate = true
  waveMesh.geometry.computeVertexNormals()
}

// ── Camera animation ───────────────────────────────────────────────────────────

function updateCamera(): void {
  const pos = camera.position

  if (Math.abs(cameraGoal.x - pos.x) > 0.01) {
    pos.x += (cameraGoal.x - pos.x) * CAMERA_LERP_FACTOR
  }
  if (Math.abs(cameraGoal.y - pos.y) > 0.01) {
    pos.y += (cameraGoal.y - pos.y) * CAMERA_LERP_FACTOR
  }
  if (Math.abs(cameraGoal.z - pos.z) > 0.01) {
    pos.z += (cameraGoal.z - pos.z) * CAMERA_LERP_FACTOR
  }

  camera.lookAt(LOOK_TARGET)
}

function animate(): void {
  requestAnimationFrame(animate)

  // Advance animation time normalised to 60fps ticks (matches Vanta behaviour)
  const now = performance.now()
  if (previousFrameTime > 0) {
    const rawTicks = (now - previousFrameTime) / (1000 / 60)
    animationTime += Math.max(0.2, Math.min(rawTicks, 5))
  }
  previousFrameTime = now

  updateWaves()
  updateCamera()
  renderer.render(scene, camera)
}

// ── Controls ───────────────────────────────────────────────────────────────────

function applyMousePosition(xNorm: number, yNorm: number): void {
  // Capture the camera's resting position on the first interaction
  if (!cameraRest.locked) {
    cameraRest.x = camera.position.x
    cameraRest.y = camera.position.y
    cameraRest.z = camera.position.z
    cameraRest.locked = true
  }

  cameraGoal.x = cameraRest.x + (xNorm - 0.5) * MOUSE_INFLUENCE_X
  cameraGoal.y = cameraRest.y + (yNorm - 0.5) * -MOUSE_INFLUENCE_Y
  cameraGoal.z = cameraRest.z + (xNorm - 0.5) * -MOUSE_INFLUENCE_Z
}

function handleMouseMove(event: MouseEvent): void {
  applyMousePosition(
    event.clientX / window.innerWidth,
    event.clientY / window.innerHeight,
  )
}

function handleScroll(): void {
  // Re-centre camera goal on scroll so it stays coherent when page position changes
  applyMousePosition(0.5, 0.5)
}

function handleTouch(event: TouchEvent): void {
  if (event.touches.length !== 1) return
  applyMousePosition(
    event.touches[0].clientX / window.innerWidth,
    event.touches[0].clientY / window.innerHeight,
  )
}

function onResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// ── Entry point ────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  init()
  animate()
})
```

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit
```

Expected: exits 0 with no errors.

- [ ] **Step 3: Verify Hugo builds and page loads**

Open `http://localhost:1313/` — a `<canvas>` element should now be visible as a full-screen background with an animated dark-blue wave surface.

- [ ] **Step 4: Commit**

```bash
git add assets/js/background-waves.ts
git commit -m "feat: port Vanta Waves to Three.js 0.184.0 as background-waves.ts"
```

---

### Task 5: Run tests and verify

**Files:** (none modified)

- [ ] **Step 1: Run the Playwright test suite for background waves**

```bash
npx playwright test tests/background-waves.spec.ts --project=chromium
```

Expected: all 3 tests PASS.

```text
✓ background waves animation › canvas element is present and visible
✓ background waves animation › no JavaScript errors during animation
✓ background waves animation › canvas fills the viewport
```

- [ ] **Step 2: Run the full test suite to check for regressions**

```bash
npx playwright test --project=chromium
```

Expected: all tests pass. The `tests/top.en.spec.ts` snapshot test targets `https://sfz.dev/` (the live site) and is unaffected by local changes — it should still pass.

- [ ] **Step 3: Final type check**

```bash
npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add tests/background-waves.spec.ts
git commit -m "test: verify background waves canvas renders without errors"
```
