import { PhysicsState, PhysicsConfig } from './types';

/**
 * Vertical component of a magnetic monopole at effective depth D_eff below
 * the surface.  F(r) = D_eff / (r² + D_eff²)^(3/2).
 *
 * Key physics: the magnet sits at a fixed position behind the glass.  As a
 * fluid column grows taller it moves *closer* to the magnet, so D_eff
 * decreases and the force grows — this is the positive-feedback loop that
 * drives the Rosensweig normal-field instability.  Taller spikes feel
 * stronger force and grow further; neighbouring valleys receive less force
 * and are pulled back by gravity, creating the characteristic spike pattern.
 *
 * D_eff = max(D * 0.25, D − dh)   where dh = h − restHeight.
 * The 0.25 floor prevents singularity and caps amplification at ~16 ×.
 */
export function applyMagnetic(
  state: PhysicsState,
  config: PhysicsConfig,
  forces: Float32Array
): void {
  if (!state.cursor) return;
  const { mask, cursor, mode, gridSize, heights, restHeight } = state;
  const { fieldStrength, magnetDepth } = config;
  const sign = mode === 'attract' ? 1 : -1;
  const N = gridSize;
  const minDepth = magnetDepth * 0.25;

  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const idx = j * N + i;
      if (!mask[idx]) continue;
      const dx = i / (N - 1) - cursor.x;
      const dy = j / (N - 1) - cursor.y;
      const r2 = dx * dx + dy * dy;

      // Effective depth: decreases as the surface rises toward the magnet.
      const dh = heights[idx]! - restHeight;
      const effDepth = Math.max(minDepth, magnetDepth - dh);
      forces[idx]! += sign * fieldStrength * effDepth / Math.pow(r2 + effDepth * effDepth, 1.5);
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
