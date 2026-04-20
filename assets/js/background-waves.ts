import * as THREE from "three"

// ── Grid dimensions ────────────────────────────────────────────────────────────
const CELL_SIZE = 24
// COLUMNS and ROWS are computed at init from CELL_SIZE and the frustum — see computeGridDimensions()

// ── Wave appearance ────────────────────────────────────────────────────────────
const WAVE_COLOR = 0x005577
const WAVE_SHININESS = 30
const WAVE_HEIGHT = 20
const WAVE_SPEED = 1
const WAVE_SPEED_SQRT = Math.sqrt(WAVE_SPEED) // precomputed — used every frame per vertex
const VERTEX_Y_NOISE = 5
const MESH_ROTATION_Y = Math.PI / 8 // avoids axis-aligned rows
const MESH_COVERAGE_MARGIN = 1.1 // extra room for wave crests above Y=0

// ── Scatter interaction ────────────────────────────────────────────────────────
const SCATTER_RADIUS = 200 // influence radius in mesh-local units (~8 cell widths)
const SCATTER_IMPULSE = 80 // peak outward speed at click center
const SCATTER_SPRING_K = 0.018 // spring stiffness — raise to snap back faster (safe: 0.01–0.03)
const SCATTER_DAMPING = 0.88 // per-frame velocity multiplier — lower returns faster

// ── Camera ─────────────────────────────────────────────────────────────────────
const CAMERA_FOV = 35
const CAMERA_NEAR = 50
const CAMERA_FAR = 10_000
const CAMERA_LERP_FACTOR = 0.02

// ── Mouse / touch influence on camera ──────────────────────────────────────────
const MOUSE_INFLUENCE_X = 100
const MOUSE_INFLUENCE_Y = 100
const MOUSE_INFLUENCE_Z = 50

// ── Module state ───────────────────────────────────────────────────────────────
let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let waveMesh: THREE.Mesh
let positionData: Float32Array
let originalY: Float32Array
let originalX: Float32Array
let originalZ: Float32Array
let scatterVel: Float32Array
let scatterOffset: Float32Array
let positionAttr: THREE.BufferAttribute
let gridColumns: number
let gridRows: number

const lookTarget = new THREE.Vector3()
const cameraGoal = { x: 0, y: 0, z: 0 }
const cameraRest = { x: 0, y: 0, z: 0, locked: false }
const raycaster = new THREE.Raycaster()

let animationTime = 0
let previousFrameTime = 0

// ── Helpers ────────────────────────────────────────────────────────────────────

function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomInt(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min))
}

// Clamps to 16:9 equivalent so ultra-wide viewports don't push the camera
// excessively far in X, which would make triangles appear too large.
function refWidth(): number {
  return Math.min(window.innerWidth, window.innerHeight * (16 / 9))
}

function buildCameraSetup(): {
  position: THREE.Vector3
  target: THREE.Vector3
} {
  const ref = refWidth()
  const H = window.innerHeight
  return {
    position: new THREE.Vector3(ref / 3, H / 3, ref / 4),
    target: new THREE.Vector3(ref / 4, -H / 4, ref / 6),
  }
}

// Projects each frustum corner onto Y=0 and returns the max half-extents in
// mesh-local XZ space. Shared by computeGridDimensions and computeMeshScale.
function frustumLocalHalfExtents(): { x: number; z: number } {
  const ref = refWidth()
  const H = window.innerHeight
  const aspect = window.innerWidth / H

  const camX = ref / 3
  const camY = H / 3
  const camZ = ref / 4
  const forward = new THREE.Vector3(
    ref / 4 - camX,
    -H / 4 - camY,
    ref / 6 - camZ
  ).normalize()
  const right = new THREE.Vector3()
    .crossVectors(forward, new THREE.Vector3(0, 1, 0))
    .normalize()
  const up = new THREE.Vector3().crossVectors(right, forward).normalize()

  const vHalf = Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180)
  const hHalf = vHalf * aspect
  const cosR = Math.cos(MESH_ROTATION_Y)
  const sinR = Math.sin(MESH_ROTATION_Y)

  let maxX = 0
  let maxZ = 0
  for (const [dh, dv] of [
    [hHalf, vHalf],
    [-hHalf, vHalf],
    [hHalf, -vHalf],
    [-hHalf, -vHalf],
  ] as [number, number][]) {
    const dir = forward
      .clone()
      .addScaledVector(right, dh)
      .addScaledVector(up, dv)
    if (dir.y >= 0) continue
    const t = -camY / dir.y
    const wx = camX + t * dir.x
    const wz = camZ + t * dir.z
    // Inverse Y rotation (transpose of rotation matrix)
    maxX = Math.max(maxX, Math.abs(wx * cosR - wz * sinR))
    maxZ = Math.max(maxZ, Math.abs(wx * sinR + wz * cosR))
  }

  return { x: maxX, z: maxZ }
}

function computeGridDimensions(): { columns: number; rows: number } {
  const { x, z } = frustumLocalHalfExtents()
  return {
    columns: Math.ceil((2 * x) / CELL_SIZE),
    rows: Math.ceil((2 * z) / CELL_SIZE),
  }
}

function computeMeshScale(): number {
  const { x, z } = frustumLocalHalfExtents()
  const gridHalfX = (gridColumns * CELL_SIZE) / 2
  const gridHalfZ = (gridRows * CELL_SIZE) / 2
  return Math.max(1, x / gridHalfX, z / gridHalfZ) * MESH_COVERAGE_MARGIN
}

// ── Geometry ───────────────────────────────────────────────────────────────────

function buildGeometry(columns: number, rows: number): THREE.BufferGeometry {
  const stride = rows + 1 // vertices per column
  const vertexCount = (columns + 1) * stride
  positionData = new Float32Array(vertexCount * 3)
  originalY = new Float32Array(vertexCount)
  originalX = new Float32Array(vertexCount)
  originalZ = new Float32Array(vertexCount)
  scatterVel = new Float32Array(vertexCount * 3) // zero-filled — no scatter at start
  scatterOffset = new Float32Array(vertexCount * 3)

  for (let col = 0; col <= columns; col++) {
    for (let row = 0; row <= rows; row++) {
      const i = col * stride + row
      const x = (col - columns * 0.5) * CELL_SIZE
      const y = randomFloat(0, VERTEX_Y_NOISE) - VERTEX_Y_NOISE / 2
      const z = (rows * 0.5 - row) * CELL_SIZE

      positionData[i * 3] = x
      positionData[i * 3 + 1] = y
      positionData[i * 3 + 2] = z
      originalY[i] = y
      originalX[i] = x
      originalZ[i] = z
    }
  }

  positionAttr = new THREE.BufferAttribute(positionData, 3)
  positionAttr.setUsage(THREE.DynamicDrawUsage) // buffer is mutated every frame

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", positionAttr)

  const indexData = new Uint32Array(columns * rows * 6)
  let ii = 0
  for (let col = 1; col <= columns; col++) {
    for (let row = 1; row <= rows; row++) {
      const topLeft = (col - 1) * stride + (row - 1)
      const topRight = col * stride + (row - 1)
      const bottomLeft = (col - 1) * stride + row
      const bottomRight = col * stride + row

      if (randomInt(0, 1) === 0) {
        indexData[ii++] = topLeft
        indexData[ii++] = topRight
        indexData[ii++] = bottomLeft
        indexData[ii++] = topRight
        indexData[ii++] = bottomLeft
        indexData[ii++] = bottomRight
      } else {
        indexData[ii++] = topLeft
        indexData[ii++] = topRight
        indexData[ii++] = bottomRight
        indexData[ii++] = topLeft
        indexData[ii++] = bottomLeft
        indexData[ii++] = bottomRight
      }
    }
  }
  geometry.setIndex(new THREE.BufferAttribute(indexData, 1))

  return geometry
}

// ── Initialization ─────────────────────────────────────────────────────────────

function init(): void {
  const container = document.createElement("div")
  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    zIndex: "0",
    pointerEvents: "none",
  })
  document.body.insertBefore(container, document.body.firstChild)

  // z-index:1 + position:relative lifts page content above the fixed canvas
  // without changing existing layout.
  const contentWrapper = document.createElement("div")
  Object.assign(contentWrapper.style, { position: "relative", zIndex: "1" })
  while (document.body.children.length > 1) {
    contentWrapper.appendChild(document.body.children[1])
  }
  document.body.appendChild(contentWrapper)

  const computedBg = getComputedStyle(document.body).backgroundColor
  // Congo's dark theme sets background via Tailwind on <body>; the computed value
  // may be transparent until CSS loads, so fall back to the expected dark shade.
  const themeBackground =
    computedBg === "rgba(0, 0, 0, 0)" || computedBg === "transparent"
      ? "#1e293b"
      : computedBg
  document.body.style.backgroundColor = "transparent"
  document.documentElement.style.backgroundColor = "transparent"

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  })
  renderer.setClearColor(new THREE.Color(themeBackground))
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()

  const { position, target } = buildCameraSetup()
  lookTarget.copy(target)
  cameraGoal.x = position.x
  cameraGoal.y = position.y
  cameraGoal.z = position.z
  cameraRest.x = position.x
  cameraRest.y = position.y
  cameraRest.z = position.z

  camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_NEAR,
    CAMERA_FAR
  )
  camera.position.copy(position)
  scene.add(camera)

  const { columns, rows } = computeGridDimensions()
  gridColumns = columns
  gridRows = rows
  const geometry = buildGeometry(columns, rows)

  const material = new THREE.MeshPhongMaterial({
    color: WAVE_COLOR,
    shininess: WAVE_SHININESS,
    flatShading: true,
    side: THREE.DoubleSide,
  })

  waveMesh = new THREE.Mesh(geometry, material)
  waveMesh.rotation.y = MESH_ROTATION_Y
  waveMesh.scale.set(computeMeshScale(), 1, computeMeshScale())
  scene.add(waveMesh)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  // DirectionalLight has no distance decay. Three.js r152+ changed PointLight.decay
  // to 2 (physically-based), making distant point lights effectively invisible.
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
  dirLight.position.set(-200, 300, 200)
  scene.add(dirLight)

  window.addEventListener("resize", onResize)
  window.addEventListener("mousemove", handleMouseMove)
  window.addEventListener("scroll", handleScroll)
  window.addEventListener("click", handleClick)
  window.addEventListener("touchstart", handleTouchStart, { passive: true })
  window.addEventListener("touchmove", handleTouch, { passive: true })
}

// ── Wave animation ─────────────────────────────────────────────────────────────

function updateScatter(): void {
  for (let i = 0; i < originalY.length; i++) {
    // spring restoring force: pulls offset toward zero (wave-animated base position)
    scatterVel[i * 3] += -scatterOffset[i * 3] * SCATTER_SPRING_K
    scatterVel[i * 3 + 1] += -scatterOffset[i * 3 + 1] * SCATTER_SPRING_K
    scatterVel[i * 3 + 2] += -scatterOffset[i * 3 + 2] * SCATTER_SPRING_K

    scatterVel[i * 3] *= SCATTER_DAMPING
    scatterVel[i * 3 + 1] *= SCATTER_DAMPING
    scatterVel[i * 3 + 2] *= SCATTER_DAMPING

    scatterOffset[i * 3] += scatterVel[i * 3]
    scatterOffset[i * 3 + 1] += scatterVel[i * 3 + 1]
    scatterOffset[i * 3 + 2] += scatterVel[i * 3 + 2]
  }
}

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

    positionData[i * 3] = x + scatterOffset[i * 3]
    positionData[i * 3 + 1] =
      originalY[i] + trochoidDelta * WAVE_HEIGHT + scatterOffset[i * 3 + 1]
    positionData[i * 3 + 2] = z + scatterOffset[i * 3 + 2]
  }

  positionAttr.needsUpdate = true
  // flatShading: true computes face normals from dFdx/dFdy in the fragment shader;
  // the normal buffer is unused and recomputing it every frame is wasted work.
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

  camera.lookAt(lookTarget)
}

function animate(): void {
  requestAnimationFrame(animate)

  // Normalize to 60fps ticks so wave speed is frame-rate independent
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
    event.clientY / window.innerHeight
  )
}

function handleScroll(): void {
  applyMousePosition(0.5, 0.5) // re-centre so camera stays coherent after page scroll
}

function handleTouch(event: TouchEvent): void {
  if (event.touches.length !== 1) return
  applyMousePosition(
    event.touches[0].clientX / window.innerWidth,
    event.touches[0].clientY / window.innerHeight
  )
}

function applyScatter(localPoint: THREE.Vector3): void {
  for (let i = 0; i < originalY.length; i++) {
    const dx = originalX[i] - localPoint.x
    const dz = originalZ[i] - localPoint.z
    const dist = Math.hypot(dx, dz)
    const falloff = Math.exp(-dist / SCATTER_RADIUS)
    if (falloff < 0.002) continue // negligible contribution — skip

    const nx = dist > 0 ? dx / dist : 0
    const nz = dist > 0 ? dz / dist : 0
    const impulse = SCATTER_IMPULSE * falloff

    scatterVel[i * 3] += nx * impulse
    scatterVel[i * 3 + 1] += impulse * 0.6 // upward bias for eruption quality
    scatterVel[i * 3 + 2] += nz * impulse
  }
}

function handleClickAt(clientX: number, clientY: number): void {
  const mouse = new THREE.Vector2(
    (clientX / window.innerWidth) * 2 - 1,
    -(clientY / window.innerHeight) * 2 + 1
  )
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObject(waveMesh)
  if (hits.length === 0) return // click missed the mesh — ignore
  applyScatter(waveMesh.worldToLocal(hits[0].point.clone()))
}

function handleClick(event: MouseEvent): void {
  handleClickAt(event.clientX, event.clientY)
}

function handleTouchStart(event: TouchEvent): void {
  if (event.touches.length !== 1) return
  handleTouch(event) // existing camera-position behavior
  handleClickAt(event.touches[0].clientX, event.touches[0].clientY)
}

function onResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)

  const xzScale = computeMeshScale()
  waveMesh.scale.set(xzScale, 1, xzScale)

  const { position, target } = buildCameraSetup()
  lookTarget.copy(target)
  cameraGoal.x = position.x
  cameraGoal.y = position.y
  cameraGoal.z = position.z
  cameraRest.x = position.x
  cameraRest.y = position.y
  cameraRest.z = position.z
  cameraRest.locked = false
}

// ── Entry point ────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  init()
  animate()
})
