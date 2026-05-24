import { PhysicsState, PhysicsConfig } from './types';
import { applyMagnetic, applySurfaceTension, applyGravity, applyDamping } from './forces';

/**
 * Advances physics by dt seconds. Returns a new PhysicsState (immutable).
 */
export function stepPhysics(
  state: PhysicsState,
  config: PhysicsConfig,
  dt: number
): PhysicsState {
  if (dt <= 0) return state;

  const { spikeCount, surfaceTension, gravity, fillLevel } = config;
  const forces = new Float32Array(spikeCount);

  applyMagnetic(state, config, forces);
  applySurfaceTension(state.heights, surfaceTension, forces);
  applyGravity(state.heights, fillLevel, gravity, forces);

  const newHeights = new Float32Array(state.heights);
  const newVelocities = new Float32Array(state.velocities);

  for (let i = 0; i < spikeCount; i++) {
    newVelocities[i]! += forces[i]! * dt;
    newHeights[i]! += newVelocities[i]! * dt;
    newHeights[i]! = Math.max(0, Math.min(1, newHeights[i]!));
  }

  applyDamping(newVelocities, config.viscosity, dt);

  return {
    ...state,
    heights: newHeights,
    velocities: newVelocities,
    restHeight: fillLevel,
  };
}

export function createInitialState(
  spikeCount: number,
  fillLevel: number,
  mode: 'attract' | 'repel' = 'attract'
): PhysicsState {
  return {
    heights: new Float32Array(spikeCount).fill(fillLevel),
    velocities: new Float32Array(spikeCount).fill(0),
    restHeight: fillLevel,
    cursor: null,
    mode,
  };
}
