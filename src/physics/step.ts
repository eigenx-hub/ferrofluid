import { PhysicsState, PhysicsConfig } from './types';
import { applyMagnetic, applySurfaceTension, applyGravity, applyDamping } from './forces';

/**
 * Advances physics by dt seconds using sub-stepping for numerical stability.
 * Returns a new PhysicsState (immutable).
 */
export function stepPhysics(
  state: PhysicsState,
  config: PhysicsConfig,
  dt: number
): PhysicsState {
  if (dt <= 0) return state;

  const { subSteps, surfaceTension, gravity, fillLevel } = config;
  const subDt = dt / subSteps;

  let heights = new Float32Array(state.heights);
  let velocities = new Float32Array(state.velocities);
  const { mask, gridSize } = state;

  for (let step = 0; step < subSteps; step++) {
    const forces = new Float32Array(gridSize * gridSize);

    applyMagnetic({ ...state, heights, velocities }, config, forces);
    applySurfaceTension(heights, mask, gridSize, surfaceTension, forces);
    applyGravity(heights, mask, fillLevel, gravity, forces);

    for (let idx = 0; idx < gridSize * gridSize; idx++) {
      if (!mask[idx]) continue;
      velocities[idx]! += forces[idx]! * subDt;
      heights[idx]! += velocities[idx]! * subDt;
      heights[idx]! = Math.max(0, Math.min(1, heights[idx]!));
    }

    applyDamping(velocities, mask, config.viscosity, subDt);
  }

  return {
    ...state,
    heights,
    velocities,
    restHeight: fillLevel,
  };
}

export function createInitialState(
  gridSize: number,
  fillLevel: number,
  mask: Uint8Array,
  mode: 'attract' | 'repel' = 'attract'
): PhysicsState {
  const n = gridSize * gridSize;
  const heights = new Float32Array(n);
  for (let idx = 0; idx < n; idx++) {
    if (mask[idx]) {
      // Tiny random noise seeds the Rosensweig instability
      heights[idx] = fillLevel + (Math.random() - 0.5) * 0.008;
    }
  }
  return {
    heights,
    velocities: new Float32Array(n),
    restHeight: fillLevel,
    cursor: null,
    mode,
    mask,
    gridSize,
  };
}
