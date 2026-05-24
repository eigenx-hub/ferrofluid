import { PhysicsState, PhysicsConfig } from './types';

/**
 * Vertical component of the field from a magnetic monopole at depth D below
 * the fluid surface. F(r) = D / (r² + D²)^(3/2).
 *
 * Unlike the 2D 1/r² model this is always finite (no singularity), has a
 * smooth dome shape, and spreads force over a radius ≈ D — which is what
 * drives the ring of Rosensweig spikes seen in real ferrofluid photos.
 */
export function applyMagnetic(
  state: PhysicsState,
  config: PhysicsConfig,
  forces: Float32Array
): void {
  if (!state.cursor) return;
  const { mask, cursor, mode, gridSize } = state;
  const { fieldStrength, magnetDepth } = config;
  const sign = mode === 'attract' ? 1 : -1;
  const N = gridSize;
  const D2 = magnetDepth * magnetDepth;

  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const idx = j * N + i;
      if (!mask[idx]) continue;
      const dx = i / (N - 1) - cursor.x;
      const dy = j / (N - 1) - cursor.y;
      const r2 = dx * dx + dy * dy;
      // Vertical monopole field: depth / (r² + depth²)^(3/2)
      const denom = Math.pow(r2 + D2, 1.5);
      forces[idx]! += sign * fieldStrength * magnetDepth / denom;
    }
  }
}

/**
 * 2D Laplacian (4-neighbor) with Neumann BC at mask edges.
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
 * Restoring force toward restHeight.
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
 * Exponential velocity damping, clamped so factor never goes negative.
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
