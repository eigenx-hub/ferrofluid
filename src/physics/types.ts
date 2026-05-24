export interface Vec2 {
  x: number;
  y: number;
}

/**
 * All values in normalized [0,1] space.
 * heights[i]: fluid surface at sample point i (0 = bottom of container, 1 = top)
 * restHeight: calm surface level; equals fillLevel
 * cursor: normalized position in physics space, or null when off-canvas
 */
export interface PhysicsState {
  readonly heights: Float32Array;
  readonly velocities: Float32Array;
  readonly restHeight: number;
  readonly cursor: Vec2 | null;
  readonly mode: 'attract' | 'repel';
}

export interface PhysicsConfig {
  readonly spikeCount: number;
  readonly fieldStrength: number;
  readonly viscosity: number;     // damping coefficient per second (0 = no damping, 1 = full)
  readonly surfaceTension: number;
  readonly gravity: number;
  readonly fillLevel: number;     // 0-1; also the restHeight
}

export const DEFAULT_CONFIG: PhysicsConfig = {
  spikeCount: 128,
  fieldStrength: 0.08,
  viscosity: 2.5,
  surfaceTension: 80,
  gravity: 12,
  fillLevel: 0.4,
};
