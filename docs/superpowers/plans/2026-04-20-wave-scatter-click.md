# Wave Scatter Click Effect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add click/touchstart interaction to `assets/js/background-waves.ts` so that clicking the wave background scatters nearby mesh vertices outward in XYZ space via distance-based falloff, then they return to their wave-animated positions using overdamped spring physics.

**Architecture:** Add four new `Float32Array` module-level arrays (`originalX`, `originalZ`, `scatterVel`, `scatterOffset`) and four tuning constants (`SCATTER_RADIUS`, `SCATTER_IMPULSE`, `SCATTER_SPRING_K`, `SCATTER_DAMPING`). A `Raycaster` maps click coordinates to mesh-local 3D space; `applyScatter()` imparts outward velocity scaled by `exp(-dist / SCATTER_RADIUS)`; `updateScatter()` runs the spring physics every frame inside `updateWaves()`.

**Tech Stack:** TypeScript, Three.js (already in use), Playwright (regression tests)

---

## Task 1: Add constants and extend `buildGeometry()` to store base XZ + init scatter arrays

**Files:**

- Modify: `assets/js/background-waves.ts:3-45` (constants + module state)
- Modify: `assets/js/background-waves.ts:140-195` (`buildGeometry`)

- [ ] **Step 1: Add 4 scatter constants after the existing wave-appearance block (around line 15)**

  In `assets/js/background-waves.ts`, find the comment `// ── Wave appearance` block (lines 7–15) and add immediately after `MESH_COVERAGE_MARGIN`:

  ```typescript
  // ── Scatter interaction ────────────────────────────────────────────────────────
  const SCATTER_RADIUS   = 200    // influence radius in mesh-local units (~8 cell widths)
  const SCATTER_IMPULSE  = 80     // peak outward speed at click center
  const SCATTER_SPRING_K = 0.018  // spring stiffness — raise to snap back faster (safe: 0.01–0.03)
  const SCATTER_DAMPING  = 0.88   // per-frame velocity multiplier — lower returns faster
  ```

- [ ] **Step 2: Declare 4 new module-level variables after `positionAttr`**

  Find the `// ── Module state` block (around line 29). After the existing `let positionAttr` and `originalY` declarations, add:

  ```typescript
  let originalX: Float32Array
  let originalZ: Float32Array
  let scatterVel: Float32Array
  let scatterOffset: Float32Array
  ```

- [ ] **Step 3: Populate `originalX`/`originalZ` inside the vertex loop in `buildGeometry()`**

  Find the inner loop in `buildGeometry()` (around line 146). After `originalY[i] = y`, add:

  ```typescript
  originalX[i] = x
  originalZ[i] = z
  ```

  The full vertex allocation block at the top of `buildGeometry()` should become:

  ```typescript
  function buildGeometry(columns: number, rows: number): THREE.BufferGeometry {
    const stride = rows + 1
    const vertexCount = (columns + 1) * stride
    positionData = new Float32Array(vertexCount * 3)
    originalY    = new Float32Array(vertexCount)
    originalX    = new Float32Array(vertexCount)
    originalZ    = new Float32Array(vertexCount)
    scatterVel    = new Float32Array(vertexCount * 3)  // zero-filled — no scatter at start
    scatterOffset = new Float32Array(vertexCount * 3)

    for (let col = 0; col <= columns; col++) {
      for (let row = 0; row <= rows; row++) {
        const i = col * stride + row
        const x = (col - columns * 0.5) * CELL_SIZE
        const y = randomFloat(0, VERTEX_Y_NOISE) - VERTEX_Y_NOISE / 2
        const z = (rows * 0.5 - row) * CELL_SIZE

        positionData[i * 3]     = x
        positionData[i * 3 + 1] = y
        positionData[i * 3 + 2] = z
        originalY[i] = y
        originalX[i] = x
        originalZ[i] = z
      }
    }
    // ... rest of function unchanged ...
  ```

- [ ] **Step 4: Verify TypeScript compiles with no errors**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no output (clean compile).

- [ ] **Step 5: Commit**

  ```bash
  git add assets/js/background-waves.ts
  git commit -m "feat: add scatter constants and base XZ storage in buildGeometry"
  ```

---

## Task 2: Fix `updateWaves()` to use `originalX`/`originalZ` and write scatter offsets to final positions

**Files:**

- Modify: `assets/js/background-waves.ts:295-318` (`updateWaves`)

- [ ] **Step 1: Replace the `updateWaves()` function body**

  Current `updateWaves()` reads `positionData[i*3]` and `[i*3+2]` for wave phase — these will be corrupted by scatter. Replace the entire function:

  ```typescript
  function updateWaves(): void {
    const vertexCount = originalY.length

    updateScatter()

    for (let i = 0; i < vertexCount; i++) {
      const x = originalX[i]
      const z = originalZ[i]

      // Trochoid wave equation (ported from Vanta Waves)
      const crossChop = WAVE_SPEED_SQRT * Math.cos(-x - z * 0.7)
      const delta = Math.sin(
        WAVE_SPEED * animationTime * 0.02 -
          WAVE_SPEED * x * 0.025 +
          WAVE_SPEED * z * 0.015 +
          crossChop
      )
      const trochoidDelta = (delta + 1) ** 2 / 4

      positionData[i * 3]     = x                                                + scatterOffset[i * 3]
      positionData[i * 3 + 1] = originalY[i] + trochoidDelta * WAVE_HEIGHT + scatterOffset[i * 3 + 1]
      positionData[i * 3 + 2] = z                                                + scatterOffset[i * 3 + 2]
    }

    positionAttr.needsUpdate = true
    // flatShading: true computes face normals from dFdx/dFdy in the fragment shader;
    // the normal buffer is unused and recomputing it every frame is wasted work.
  }
  ```

  Note: `updateScatter()` is called first (it will be defined in Task 3 — TypeScript hoists function declarations, so order in file does not matter).

- [ ] **Step 2: Verify TypeScript compiles with no errors**

  ```bash
  npx tsc --noEmit
  ```

  Expected: error about `updateScatter` not found — that is expected until Task 3.

- [ ] **Step 3: Commit**

  ```bash
  git add assets/js/background-waves.ts
  git commit -m "feat: use originalX/Z in wave phase math and write scatter offsets to positionData"
  ```

---

## Task 3: Add `updateScatter()` — per-frame spring physics

**Files:**

- Modify: `assets/js/background-waves.ts` (new function, add in the `// ── Wave animation` section)

- [ ] **Step 1: Add `updateScatter()` directly above `updateWaves()`**

  In the file, find the `// ── Wave animation` comment. Insert the new function between that comment and `updateWaves()`:

  ```typescript
  function updateScatter(): void {
    for (let i = 0; i < originalY.length; i++) {
      // spring restoring force: pulls offset toward zero (wave-animated base position)
      scatterVel[i * 3]     += -scatterOffset[i * 3]     * SCATTER_SPRING_K
      scatterVel[i * 3 + 1] += -scatterOffset[i * 3 + 1] * SCATTER_SPRING_K
      scatterVel[i * 3 + 2] += -scatterOffset[i * 3 + 2] * SCATTER_SPRING_K

      scatterVel[i * 3]     *= SCATTER_DAMPING
      scatterVel[i * 3 + 1] *= SCATTER_DAMPING
      scatterVel[i * 3 + 2] *= SCATTER_DAMPING

      scatterOffset[i * 3]     += scatterVel[i * 3]
      scatterOffset[i * 3 + 1] += scatterVel[i * 3 + 1]
      scatterOffset[i * 3 + 2] += scatterVel[i * 3 + 2]
    }
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles clean**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no output.

- [ ] **Step 3: Start dev server and visually check the wave still renders normally (no click yet)**

  ```bash
  task start
  ```

  Open `http://localhost:1313/`. The wave should look identical to before — scatter arrays are all zeros so nothing changes visually.

- [ ] **Step 4: Commit**

  ```bash
  git add assets/js/background-waves.ts
  git commit -m "feat: add updateScatter spring physics (no-op until applyScatter is called)"
  ```

---

## Task 4: Add `applyScatter()`, `handleClickAt()`, `handleClick()`, `handleTouchStart()` and wire event listeners

**Files:**

- Modify: `assets/js/background-waves.ts` (new functions + `init()` changes)

- [ ] **Step 1: Add a module-level Raycaster (avoids allocating one per click)**

  In the `// ── Module state` block, after the existing declarations, add:

  ```typescript
  const raycaster = new THREE.Raycaster()
  ```

- [ ] **Step 2: Add `applyScatter()` in the `// ── Controls` section (after `onResize`)**

  ```typescript
  function applyScatter(localPoint: THREE.Vector3): void {
    for (let i = 0; i < originalY.length; i++) {
      const dx = originalX[i] - localPoint.x
      const dz = originalZ[i] - localPoint.z
      const dist = Math.hypot(dx, dz)
      const falloff = Math.exp(-dist / SCATTER_RADIUS)
      if (falloff < 0.002) continue  // negligible contribution — skip

      const nx = dist > 0 ? dx / dist : 0
      const nz = dist > 0 ? dz / dist : 0
      const impulse = SCATTER_IMPULSE * falloff

      scatterVel[i * 3]     += nx * impulse
      scatterVel[i * 3 + 1] += impulse * 0.6  // upward bias for eruption quality
      scatterVel[i * 3 + 2] += nz * impulse
    }
  }
  ```

- [ ] **Step 3: Add `handleClickAt()`, `handleClick()`, and `handleTouchStart()` after `applyScatter()`**

  ```typescript
  function handleClickAt(clientX: number, clientY: number): void {
    const mouse = new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    )
    raycaster.setFromCamera(mouse, camera)
    const hits = raycaster.intersectObject(waveMesh)
    if (hits.length === 0) return  // click missed the mesh — ignore
    applyScatter(waveMesh.worldToLocal(hits[0].point.clone()))
  }

  function handleClick(event: MouseEvent): void {
    handleClickAt(event.clientX, event.clientY)
  }

  function handleTouchStart(event: TouchEvent): void {
    handleTouch(event)  // existing camera-position behavior
    if (event.touches.length !== 1) return
    handleClickAt(event.touches[0].clientX, event.touches[0].clientY)
  }
  ```

- [ ] **Step 4: Update event listener registration in `init()`**

  Find the event listener block at the end of `init()` (around line 286–291):

  ```typescript
  // Before (existing):
  window.addEventListener("resize", onResize)
  window.addEventListener("mousemove", handleMouseMove)
  window.addEventListener("scroll", handleScroll)
  window.addEventListener("touchstart", handleTouch, { passive: true })
  window.addEventListener("touchmove", handleTouch, { passive: true })
  ```

  Replace with:

  ```typescript
  // After:
  window.addEventListener("resize", onResize)
  window.addEventListener("mousemove", handleMouseMove)
  window.addEventListener("scroll", handleScroll)
  window.addEventListener("click", handleClick)
  window.addEventListener("touchstart", handleTouchStart, { passive: true })
  window.addEventListener("touchmove", handleTouch, { passive: true })
  ```

  (Only `touchstart` handler changes from `handleTouch` to `handleTouchStart`.)

- [ ] **Step 5: Verify TypeScript compiles clean**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no output.

- [ ] **Step 6: Commit**

  ```bash
  git add assets/js/background-waves.ts
  git commit -m "feat: add click/touch scatter interaction using raycasting and spring physics"
  ```

---

## Task 5: Manual visual test + Playwright regression

**Files:**

- Test: `background-waves.spec.ts` (add click scatter test)

- [ ] **Step 1: Start dev server and manually test the click effect**

  ```bash
  task start
  ```

  Open `http://localhost:1313/`. Click anywhere on the wave. Expected behavior:
  - Vertices near cursor fly outward in all 3 directions instantly
  - They drift back to wave position over ~2 seconds
  - Multiple rapid clicks accumulate (velocities add up)
  - Touch on mobile: same scatter effect + camera follows finger (both work together)

- [ ] **Step 2: Tune constants if needed**

  In `assets/js/background-waves.ts`, the four `SCATTER_*` constants are at the top. Common adjustments:
  - Scatter too small → increase `SCATTER_IMPULSE` (try 120) or `SCATTER_RADIUS` (try 300)
  - Returns too fast → increase `SCATTER_DAMPING` (try 0.92) or decrease `SCATTER_SPRING_K` (try 0.010)
  - Oscillates (bounces) → decrease `SCATTER_SPRING_K` below 0.015, or decrease `SCATTER_DAMPING` below 0.85
  - Scatter too flat (not enough height) → increase the Y-bias multiplier from `0.6` to `0.9` in `applyScatter()`

- [ ] **Step 3: Add a Playwright test for click scatter (no JS errors)**

  Find `background-waves.spec.ts` and add this test inside the existing `test.describe` block:

  ```typescript
  test("click triggers scatter with no JavaScript errors", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    page.on("pageerror", (err) => errors.push(err.message))

    await page.goto("http://localhost:1313/")
    await page.waitForTimeout(300)

    // click the center of the canvas
    const canvas = page.locator("canvas").first()
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.waitForTimeout(500)

    // rapid multi-click should also be stable
    await page.mouse.click(box!.x + box!.width * 0.3, box!.y + box!.height * 0.4)
    await page.mouse.click(box!.x + box!.width * 0.7, box!.y + box!.height * 0.6)
    await page.waitForTimeout(500)

    expect(errors).toHaveLength(0)
  })
  ```

- [ ] **Step 4: Run Playwright tests (requires dev server running)**

  In a separate terminal, ensure `task start` is running, then:

  ```bash
  npx playwright test background-waves.spec.ts --headed
  ```

  Expected: all 4 tests pass (3 existing + 1 new).

- [ ] **Step 5: Commit**

  ```bash
  git add background-waves.spec.ts
  git commit -m "test: add click scatter Playwright regression test"
  ```
