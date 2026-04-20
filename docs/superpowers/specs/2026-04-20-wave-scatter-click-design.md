# Wave Scatter Click Effect — Design Spec

**Date**: 2026-04-20
**Branch**: feature/congo-migration
**File**: `assets/js/background-waves.ts`

## Overview

Add a click/touch interaction to the Three.js wave background: clicking scatters nearby mesh vertices outward in XYZ space using distance-based falloff, then they return to their wave-animated positions via overdamped spring physics. Inspired by the Vanta.js Birds scatter effect.

## Goals

- Click (or tap) anywhere on the wave mesh causes vertices to scatter
- Scattering is strongest near the click point, weakest far away (exponential falloff)
- Vertices return smoothly to their wave-animated positions automatically
- All timing/intensity is tunable via named constants at the top of the file
- No regressions to existing wave animation, camera, or resize behavior

## Data Model Changes

### New module-level state (added alongside existing arrays)

```typescript
let originalX: Float32Array    // base grid X per vertex (needed for wave math after scatter)
let originalZ: Float32Array    // base grid Z per vertex
let scatterVel: Float32Array   // XYZ velocity per vertex (size: vertexCount * 3)
let scatterOffset: Float32Array // XYZ displacement from base position (size: vertexCount * 3)
```

**Why originalX/Z?** The existing `updateWaves()` reads `positionData[i*3]` and `[i*3+2]` to compute wave phase. After scatter, those values are displaced — reading them would corrupt the wave shape. Storing the immutable grid positions separately keeps wave math correct.

### New constants

```typescript
const SCATTER_RADIUS   = 200    // influence radius in mesh-local units (~8 cells)
const SCATTER_IMPULSE  = 80     // peak velocity at click center
const SCATTER_SPRING_K = 0.018  // spring stiffness (safe range: 0.01–0.03)
const SCATTER_DAMPING  = 0.88   // per-frame velocity multiplier (0.9 = slow, 0.8 = fast)
```

## Algorithm

### 1. Click → 3D position (Raycasting)

```text
handleClick(event):
  mouse = NDC coordinates from clientX/Y
  raycaster.setFromCamera(mouse, camera)
  hits = raycaster.intersectObject(waveMesh)
  if no hits: return              // click missed the mesh — ignore silently
  local = waveMesh.worldToLocal(hits[0].point)
  applyScatter(local)
```

Touchstart reuses the same path via `event.touches[0]`.

### 2. applyScatter — impart outward velocity

```text
applyScatter(localPoint):
  for each vertex i:
    dx = originalX[i] - localPoint.x
    dz = originalZ[i] - localPoint.z
    dist = hypot(dx, dz)
    falloff = exp(-dist / SCATTER_RADIUS)
    if falloff < 0.002: skip      // negligible — skip for performance
    nx = dx / dist  (or 0 if dist == 0)
    nz = dz / dist
    impulse = SCATTER_IMPULSE * falloff
    scatterVel[i*3]   += nx * impulse        // outward X
    scatterVel[i*3+1] += impulse * 0.6       // upward bias
    scatterVel[i*3+2] += nz * impulse        // outward Z
```

The upward Y bias (0.6×) gives an "eruption" quality on top of the XZ spread. `THREE.DoubleSide` is already set on the material, so polygons that flip during scatter remain visible.

### 3. updateScatter — per-frame spring physics (called inside updateWaves)

```text
updateScatter():
  for each vertex i:
    // spring restoring force toward offset = 0
    scatterVel[i*3]   += -scatterOffset[i*3]   * SCATTER_SPRING_K
    scatterVel[i*3+1] += -scatterOffset[i*3+1] * SCATTER_SPRING_K
    scatterVel[i*3+2] += -scatterOffset[i*3+2] * SCATTER_SPRING_K
    // damping
    scatterVel[i*3]   *= SCATTER_DAMPING
    scatterVel[i*3+1] *= SCATTER_DAMPING
    scatterVel[i*3+2] *= SCATTER_DAMPING
    // integrate
    scatterOffset[i*3]   += scatterVel[i*3]
    scatterOffset[i*3+1] += scatterVel[i*3+1]
    scatterOffset[i*3+2] += scatterVel[i*3+2]
```

The spring target is always `offset = 0`, which corresponds to the current wave-animated position. Because SCATTER_SPRING_K is small and SCATTER_DAMPING is high, the system is overdamped — no oscillation, just smooth exponential return.

### 4. updateWaves — final position assembly

Replace the current direct positionData writes with:

```text
positionData[i*3]   = originalX[i] + scatterOffset[i*3]
positionData[i*3+1] = (originalY[i] + trochoidDelta * WAVE_HEIGHT) + scatterOffset[i*3+1]
positionData[i*3+2] = originalZ[i] + scatterOffset[i*3+2]
```

Wave phase is computed using `originalX[i]` and `originalZ[i]` (not the displaced positions).

## Changes Summary

| Location | Change |
|---|---|
| Constants block | Add 4 `SCATTER_*` constants |
| Module state | Add `originalX`, `originalZ`, `scatterVel`, `scatterOffset` |
| `buildGeometry()` | Store `originalX` and `originalZ` alongside existing `originalY` |
| `buildGeometry()` | Initialize `scatterVel` and `scatterOffset` as zero-filled Float32Arrays |
| `updateWaves()` | Use `originalX/Z` for wave phase; add scatter offset to final position; call `updateScatter()` |
| `init()` | Add `click` and `touchstart` event listeners |
| New functions | `applyScatter(localPoint)`, `updateScatter()`, `handleClick(event)` |
| `onResize()` | No changes needed — resize only updates camera and mesh scale, vertex count is unchanged |

## Out of Scope

- Color changes on scatter (keep material color static for now)
- Multi-touch with multiple simultaneous scatter points
- Scatter on scroll or keyboard events
