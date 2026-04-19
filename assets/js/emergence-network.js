import * as THREE from "three"

const PARTICLE_COUNT = 60
const MAX_CONNECTIONS = 200
const CONNECTION_DISTANCE = 180
const SPEED = 0.4

let scene, camera, renderer
const particleData = []
const mouse = new THREE.Vector2(0, 0)

function init() {
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  )
  camera.position.z = 500

  const pPositions = new Float32Array(PARTICLE_COUNT * 3)
  const pColors = new Float32Array(PARTICLE_COUNT * 3)

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3
    pPositions[i3] = (Math.random() - 0.5) * 900
    pPositions[i3 + 1] = (Math.random() - 0.5) * 500
    pPositions[i3 + 2] = (Math.random() - 0.5) * 100

    // Blue-purple-cyan range matching sforzando brand identity
    const color = new THREE.Color().setHSL(
      0.55 + Math.random() * 0.2,
      0.7,
      0.65
    )
    pColors[i3] = color.r
    pColors[i3 + 1] = color.g
    pColors[i3 + 2] = color.b

    particleData.push({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * SPEED,
        (Math.random() - 0.5) * SPEED,
        (Math.random() - 0.5) * SPEED * 0.2
      ),
      phase: Math.random() * Math.PI * 2,
    })
  }

  const pGeometry = new THREE.BufferGeometry()
  pGeometry.setAttribute("position", new THREE.BufferAttribute(pPositions, 3))
  pGeometry.setAttribute("color", new THREE.BufferAttribute(pColors, 3))
  const pMaterial = new THREE.PointsMaterial({
    size: 4,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
  })
  const pointsMesh = new THREE.Points(pGeometry, pMaterial)
  pointsMesh.name = "particles"
  scene.add(pointsMesh)

  // Pre-allocate connection line buffers to avoid per-frame allocations
  const lPositions = new Float32Array(MAX_CONNECTIONS * 6)
  const lColors = new Float32Array(MAX_CONNECTIONS * 6)
  const lGeometry = new THREE.BufferGeometry()
  lGeometry.setAttribute("position", new THREE.BufferAttribute(lPositions, 3))
  lGeometry.setAttribute("color", new THREE.BufferAttribute(lColors, 3))
  lGeometry.setDrawRange(0, 0)
  const lMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const linesMesh = new THREE.LineSegments(lGeometry, lMaterial)
  linesMesh.name = "connections"
  scene.add(linesMesh)

  window.addEventListener("resize", onResize)
  document.addEventListener("mousemove", onMouseMove)

  requestAnimationFrame(animate)
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
}

function animate() {
  requestAnimationFrame(animate)

  const time = performance.now() * 0.001
  const pointsMesh = scene.getObjectByName("particles")
  const linesMesh = scene.getObjectByName("connections")
  if (!pointsMesh || !linesMesh) return

  const pPos = pointsMesh.geometry.attributes.position.array
  const lPos = linesMesh.geometry.attributes.position.array
  const lCol = linesMesh.geometry.attributes.color.array

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3
    const d = particleData[i]

    // Layered sine waves for organic, emergent motion
    pPos[i3] += d.velocity.x + Math.sin(time * 0.3 + d.phase) * 0.08
    pPos[i3 + 1] += d.velocity.y + Math.cos(time * 0.2 + d.phase * 1.3) * 0.08
    pPos[i3 + 2] += d.velocity.z

    // Mouse attraction visualizes co-creation
    const mx = mouse.x * 450 - pPos[i3]
    const my = mouse.y * 250 - pPos[i3 + 1]
    if (mx * mx + my * my < 40000) {
      pPos[i3] += mx * 0.0015
      pPos[i3 + 1] += my * 0.0015
    }

    if (Math.abs(pPos[i3]) > 470) d.velocity.x *= -1
    if (Math.abs(pPos[i3 + 1]) > 270) d.velocity.y *= -1
    if (Math.abs(pPos[i3 + 2]) > 60) d.velocity.z *= -1
  }
  pointsMesh.geometry.attributes.position.needsUpdate = true

  let connectionCount = 0
  for (
    let i = 0;
    i < PARTICLE_COUNT && connectionCount < MAX_CONNECTIONS;
    i++
  ) {
    const i3 = i * 3
    for (
      let j = i + 1;
      j < PARTICLE_COUNT && connectionCount < MAX_CONNECTIONS;
      j++
    ) {
      const j3 = j * 3
      const dx = pPos[i3] - pPos[j3]
      const dy = pPos[i3 + 1] - pPos[j3 + 1]
      const dz = pPos[i3 + 2] - pPos[j3 + 2]
      const distSq = dx * dx + dy * dy + dz * dz

      if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
        const strength = 1 - Math.sqrt(distSq) / CONNECTION_DISTANCE
        const c = connectionCount * 6

        lPos[c] = pPos[i3]
        lPos[c + 1] = pPos[i3 + 1]
        lPos[c + 2] = pPos[i3 + 2]
        lPos[c + 3] = pPos[j3]
        lPos[c + 4] = pPos[j3 + 1]
        lPos[c + 5] = pPos[j3 + 2]

        // Connection color: blue→cyan as strength increases
        lCol[c] = 0.1 * strength
        lCol[c + 1] = 0.4 + 0.3 * strength
        lCol[c + 2] = 0.7 + 0.3 * strength
        lCol[c + 3] = lCol[c]
        lCol[c + 4] = lCol[c + 1]
        lCol[c + 5] = lCol[c + 2]

        connectionCount++
      }
    }
  }

  linesMesh.geometry.setDrawRange(0, connectionCount * 2)
  linesMesh.geometry.attributes.position.needsUpdate = true
  linesMesh.geometry.attributes.color.needsUpdate = true

  renderer.render(scene, camera)
}

document.addEventListener("DOMContentLoaded", init)
