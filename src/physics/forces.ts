import { PhysicsState, PhysicsConfig } from './types';

const MIN_DIST = 0.008;

/**
 * Applies magnetic force from cursor into `forces` (in-place accumulation).
 * Force is purely vertical (upward for attract, downward for repel).
 * Magnitude falls off as 1/dist^2 from cursor position in XY plane.
 */
export function applyMagnetic(
  state: PhysicsState,
  config: PhysicsConfig,
  forces: Float32Array
): void {
  if (!state.cursor) return;
  const { mask, cursor, mode, gridSize } = state;
  const { fieldStrength } = config;
  const sign = mode === 'attract' ? 1 : -1;
  const N = gridSize;

  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const idx = j * N + i;
      if (!mask[idx]) continue;
      const xi = i / (N - 1);
      const yj = j / (N - 1);
      const dx = xi - cursor.x;
      const dy = yj - cursor.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DIST);
      forces[idx]! += sign * fieldStrength / (dist * dist);
    }
  }
}

/**
 * 2D Laplacian (4-neighbor stencil) with Neumann boundary conditions at mask edges.
 * Neighbors outside the mask are treated as having the same height as the current cell.
 */
export function applySurfaceTension(
  heights: Float32Array,
  mask: Uint8Array,
  gridSize: number,
  surfaceTension: number,
  forces: Float32Array
): void {
  const N = gridSize;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const idx = j * N + i;
      if (!mask[idx]) continue;
      const h = heights[idx]!;
      const hl = (i > 0     && mask[idx - 1]) ? heights[idx - 1]! : h;
      const hr = (i < N - 1 && mask[idx + 1]) ? heights[idx + 1]! : h;
      const ht = (j > 0     && mask[idx - N]) ? heights[idx - N]! : h;
      const hb = (j < N - 1 && mask[idx + N]) ? heights[idx + N]! : h;
      forces[idx]! += surfaceTension * (hl + hr + ht + hb - 4 * h);
    }
  }
}

/**
 * Restoring force toward restHeight for all cells inside mask.
 */
export function applyGravity(
  heights: Float32Array,
  mask: Uint8Array,
  restHeight: number,
  gravity: number,
  forces: Float32Array
): void {
  for (let idx = 0; idx < heights.length; idx++) {
    if (!mask[idx]) continue;
    forces[idx]! += -gravity * (heights[idx]! - restHeight);
  }
}

/**
 * Exponential velocity damping. Clamped so factor never goes negative.
 */
export function applyDamping(
  velocities: Float32Array,
  mask: Uint8Array,
  viscosity: number,
  dt: number
): void {
  const factor = Math.max(0, 1 - viscosity * dt);
  for (let idx = 0; idx < velocities.length; idx++) {
    if (!mask[idx]) continue;
    velocities[idx]! *= factor;
  }
}
