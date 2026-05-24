export interface Vec2 {
  x: number;
  y: number;
}

/**
 * 2D top-down height field. All values in normalized [0,1] space.
 * heights[j * gridSize + i]: fluid surface height at grid cell (i,j)
 *   0 = no fluid (bottom), 1 = max possible height
 * mask[j * gridSize + i]: 1 = inside container, 0 = outside
 * restHeight: calm surface level = fillLevel
 * cursor: normalized [0,1]x[0,1] position, or null
 */
export interface PhysicsState {
  readonly heights: Float32Array;
  readonly velocities: Float32Array;
  readonly restHeight: number;
  readonly cursor: Vec2 | null;
  readonly mode: 'attract' | 'repel';
  readonly mask: Uint8Array;
  readonly gridSize: number;
}

export interface PhysicsConfig {
  readonly gridSize: number;
  readonly fieldStrength: number;
  readonly viscosity: number;     // damping per second
  readonly surfaceTension: number;
  readonly gravity: number;
  readonly fillLevel: number;
  readonly subSteps: number;      // physics sub-steps per frame for stability
}

export const DEFAULT_CONFIG: PhysicsConfig = {
  gridSize: 96,
  fieldStrength: 0.14,
  viscosity: 2.0,
  surfaceTension: 30,
  gravity: 8,
  fillLevel: 0.35,
  subSteps: 8,
};
