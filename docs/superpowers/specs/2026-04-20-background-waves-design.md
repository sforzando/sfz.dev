# Background Waves: Vanta Waves Port to Three.js 0.184.0

## Overview

Port the Vanta.js "Waves" effect to a self-contained TypeScript ES module using Three.js v0.184.0. Replaces the existing `emergence-network.js` particle animation.

## File Changes

| Action | Path |
|--------|------|
| Create | `assets/js/background-waves.ts` |
| Create | `tsconfig.json` (project root) |
| Delete | `assets/js/emergence-network.js` |
| Delete | `assets/jsconfig.json` (replaced by tsconfig.json + @types/three) |
| Update | `layouts/partials/extend-head.html` (reference new file) |
| Update | `package.json` (TypeScript 6.0.3, add `@types/three`) |

## Architecture

Single self-contained ES module — no class inheritance, no external Vanta dependency. Follows the same structural pattern as the existing `extend-head.html` integration.

```plain
background-waves.ts
  ├── Constants (color, waveHeight, waveSpeed, grid size)
  ├── init()        — scene, camera, geometry, lights, renderer
  ├── animate()     — wave equation + camera lerp + render
  ├── onMouseMove() — camera target update from normalized coords
  ├── onResize()    — camera aspect + renderer size
  └── Event listeners: DOMContentLoaded, resize, mousemove, scroll, touchstart, touchmove
```

## Geometry

- `BufferGeometry` with 101×81 vertex grid (`ww=100`, `hh=80`)
- Cell size: 18 units
- Y positions initialized with random noise: `rn(0, 4) - 10`
- Random triangulation per cell: diagonal direction chosen with `ri(0,1)` each init
- Index array built from `setIndex()`

## Material & Lighting

- `MeshPhongMaterial`: `color: 0x005577`, `shininess: 30`, `flatShading: true`, `side: DoubleSide`
- `AmbientLight(0xffffff, 0.9)`
- `PointLight(0xffffff, 0.9)` at `(-100, 250, -100)`
- `DynamicDrawUsage` set once at init on the position attribute (not per-frame)

## Camera

- `PerspectiveCamera(35, aspect, 50, 10000)`
- Initial position: `(250, 200, 400)`, look target: `(150, -30, 200)`
- Mouse moves camera target smoothly via lerp (factor 0.02 per frame)

## Wave Equation (per vertex, per frame)

```plain
crossChop    = sqrt(waveSpeed) * cos(-x - z * 0.7)
delta        = sin(waveSpeed * t * 0.02 - waveSpeed * x * 0.025 + waveSpeed * z * 0.015 + crossChop)
trochoidY    = (delta + 1)^2 / 4
vertex.y     = originalY + trochoidY * waveHeight
```

`computeVertexNormals()` called each frame after position update.

## Controls

| Control | Events | Action |
|---------|--------|--------|
| mouseControls | `mousemove`, `scroll` | `onMouseMove(xNorm, yNorm)` |
| touchControls | `touchstart`, `touchmove` | Same as mouse |
| gyroControls | — | Not implemented |

Mouse/touch coordinates normalized to `[0, 1]` relative to viewport before being passed to `onMouseMove`.

Camera position target:

```plain
tx = ox + (x - 0.5) * 100
ty = oy + (y - 0.5) * -100
tz = oz + (x - 0.5) * -50
```

## TypeScript

- TypeScript 6.0.3 (`package.json` updated)
- `@types/three` added as devDependency
- Strict typing for Three.js objects, no use of `any`

## Hugo Integration

`layouts/partials/extend-head.html`:

```html
{{ $js := resources.Get "js/background-waves.ts" | js.Build (dict "minify" hugo.IsProduction) | resources.Fingerprint "sha512" }}
<script defer type="text/javascript" src="{{ $js.RelPermalink }}" integrity="{{ $js.Data.Integrity }}"></script>
```

Hugo's `js.Build` handles TypeScript transpilation natively via esbuild.

## Porting Principles

Faithful port of behavior, not of style. Where Vanta's code is cryptic, terse, or hard to maintain, improve it:

- Descriptive names for variables and functions
- Extract magic numbers into named constants
- Prefer clarity over brevity in loop bodies
- TypeScript types make intent explicit — use them fully

## Inlined Helpers from Vanta

Vanta's `helpers.js` functions are inlined with readable names:

- `randomFloat(min, max)` → `min + Math.random() * (max - min)`
- `randomInt(min, max)` → `Math.round(min + Math.random() * (max - min))`

## Out of Scope

- Wireframe mode (commented out in original Vanta source, not implemented)
- gyroControls
- Configurable options UI
