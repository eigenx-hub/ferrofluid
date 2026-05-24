import { PhysicsState, PhysicsConfig } from './types';

const MIN_DIST = 0.005;

/**
 * Applies magnetic force from cursor into `forces` array (in-place accumulation).
 * Each sample point is at (xi, heights[i]) in normalized space.
 * Force acts vertically: attract pulls height toward cursor, repel pushes away.
 */
export function applyMagnetic(
  state: PhysicsState,
  config: PhysicsConfig,
  forces: Float32Array
): void {
  if (!state.cursor) return;
  const { heights, cursor, mode } = state;
  const { fieldStrength, spikeCount } = config;
  const sign = mode === 'attract' ? 1 : -1;

  for (let i = 0; i < spikeCount; i++) {
    const xi = spikeCount === 1 ? 0.5 : i / (spikeCount - 1);
    const dx = xi - cursor.x;
    const dy = heights[i]! - cursor.y;
    const dist = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DIST);
    const forceMag = fieldStrength / (dist * dist);
    // Vertical component of force toward/away from cursor
    const dirY = (cursor.y - heights[i]!) / dist;
    forces[i]! += sign * forceMag * dirY;
  }
}

/**
 * Laplacian smoothing — pulls adjacent samples toward a common height.
 * Wraps at boundaries (treats array as circular).
 */
export function applySurfaceTension(
  heights: Float32Array,
  surfaceTension: number,
  forces: Float32Array
): void {
  const n = heights.length;
  if (n < 2) return;
  for (let i = 0; i < n; i++) {
    const left = heights[(i - 1 + n) % n]!;
    const right = heights[(i + 1) % n]!;
    forces[i]! += surfaceTension * (left + right - 2 * heights[i]!);
  }
}

/**
 * Restoring force toward restHeight — acts like gravity pulling spikes back down.
 */
export function applyGravity(
  heights: Float32Array,
  restHeight: number,
  gravity: number,
  forces: Float32Array
): void {
  for (let i = 0; i < heights.length; i++) {
    forces[i]! += -gravity * (heights[i]! - restHeight);
  }
}

/**
 * Exponential velocity damping. Applied after integration.
 */
export function applyDamping(
  velocities: Float32Array,
  viscosity: number,
  dt: number
): void {
  const factor = Math.max(0, 1 - viscosity * dt);
  for (let i = 0; i < velocities.length; i++) {
    velocities[i]! *= factor;
  }
}
