import { describe, it, expect } from 'vitest';
import { stepPhysics, createInitialState } from '../../src/physics/step';
import { applySurfaceTension } from '../../src/physics/forces';
import { PhysicsConfig, DEFAULT_CONFIG } from '../../src/physics/types';

const fullMask = (N: number) => new Uint8Array(N * N).fill(1);

function cfg(N: number, overrides: Partial<PhysicsConfig> = {}): PhysicsConfig {
  return { ...DEFAULT_CONFIG, gridSize: N, subSteps: 1, ...overrides };
}

describe('2D physics edge cases', () => {
  it('gridSize = 1: step does not crash', () => {
    const mask = new Uint8Array([1]);
    const state = createInitialState(1, 0.5, mask);
    expect(() => stepPhysics({ ...state, cursor: { x: 0.5, y: 0.5 } }, cfg(1), 0.016)).not.toThrow();
  });

  it('gridSize = 2: surface tension 4-neighbor wrap does not crash', () => {
    const mask = fullMask(2);
    const heights = new Float32Array([0.3, 0.7, 0.5, 0.9]);
    const forces = new Float32Array(4);
    expect(() => applySurfaceTension(heights, mask, 2, 10, forces)).not.toThrow();
    expect(Array.from(forces).every(isFinite)).toBe(true);
  });

  it('cursor outside container bounds (x < 0): no crash, heights are finite', () => {
    const N = 8;
    const state = { ...createInitialState(N, 0.5, fullMask(N)), cursor: { x: -1, y: 0.5 } };
    const next = stepPhysics(state, cfg(N), 0.016);
    expect(Array.from(next.heights).every(isFinite)).toBe(true);
  });

  it('cursor outside container bounds (x > 1): no crash, heights are finite', () => {
    const N = 8;
    const state = { ...createInitialState(N, 0.5, fullMask(N)), cursor: { x: 2, y: 0.5 } };
    const next = stepPhysics(state, cfg(N), 0.016);
    expect(Array.from(next.heights).every(isFinite)).toBe(true);
  });

  it('fillLevel = 0: heights stay at/near 0', () => {
    const N = 8;
    let state = createInitialState(N, 0, fullMask(N));
    const config = cfg(N, { fillLevel: 0, fieldStrength: 0, gravity: 20, viscosity: 5 });
    for (let i = 0; i < 100; i++) state = stepPhysics(state, config, 0.016);
    for (const h of state.heights) expect(h).toBeCloseTo(0, 1);
  });

  it('fillLevel = 1.0: heights stay at/near 1', () => {
    const N = 8;
    let state = createInitialState(N, 1, fullMask(N));
    const config = cfg(N, { fillLevel: 1, fieldStrength: 0, gravity: 20, viscosity: 5 });
    for (let i = 0; i < 100; i++) state = stepPhysics(state, config, 0.016);
    for (const h of state.heights) expect(h).toBeCloseTo(1, 1);
  });

  it('extreme fieldStrength: heights clamped to [0,1]', () => {
    const N = 16;
    let state = { ...createInitialState(N, 0.5, fullMask(N)), cursor: { x: 0.5, y: 0.5 }, mode: 'attract' as const };
    const config = cfg(N, { fieldStrength: 500, viscosity: 0, surfaceTension: 0, gravity: 0 });
    for (let i = 0; i < 60; i++) state = stepPhysics(state, config, 0.016);
    for (const h of state.heights) {
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(1);
    }
  });

  it('all-zero mask: step is a no-op for heights', () => {
    const N = 8;
    const mask = new Uint8Array(N * N); // all outside
    let state = createInitialState(N, 0.5, mask);
    state = { ...state, cursor: { x: 0.5, y: 0.5 } };
    const next = stepPhysics(state, cfg(N, { fieldStrength: 1 }), 0.016);
    expect(Array.from(next.heights).every((h) => h === 0)).toBe(true);
  });

  it('large grid (128×128): 60 ticks complete in reasonable time', () => {
    const N = 128;
    let state = { ...createInitialState(N, 0.5, fullMask(N)), cursor: { x: 0.5, y: 0.5 } };
    const config = cfg(N, { subSteps: 1 });
    const start = Date.now();
    for (let i = 0; i < 60; i++) state = stepPhysics(state, config, 0.016);
    expect(Date.now() - start).toBeLessThan(2000);
  });
});
