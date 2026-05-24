import { describe, it, expect } from 'vitest';
import { stepPhysics, createInitialState } from '../../src/physics/step';
import { PhysicsConfig, DEFAULT_CONFIG } from '../../src/physics/types';

const N = 8;
const fullMask = new Uint8Array(N * N).fill(1);

function cfg(overrides: Partial<PhysicsConfig> = {}): PhysicsConfig {
  return { ...DEFAULT_CONFIG, gridSize: N, subSteps: 1, ...overrides };
}

describe('createInitialState', () => {
  it('initializes heights inside mask to fillLevel', () => {
    const state = createInitialState(N, 0.4, fullMask);
    for (let i = 0; i < N * N; i++) {
      expect(Math.abs(state.heights[i]! - 0.4)).toBeLessThan(1e-6);
    }
  });

  it('initializes heights outside mask to 0', () => {
    const halfMask = new Uint8Array(N * N); // all outside
    const state = createInitialState(N, 0.5, halfMask);
    expect(Array.from(state.heights).every((h) => h === 0)).toBe(true);
  });

  it('initializes all velocities to 0', () => {
    const state = createInitialState(N, 0.4, fullMask);
    expect(Array.from(state.velocities).every((v) => v === 0)).toBe(true);
  });

  it('sets restHeight to fillLevel', () => {
    expect(createInitialState(N, 0.7, fullMask).restHeight).toBe(0.7);
  });

  it('defaults cursor to null', () => {
    expect(createInitialState(N, 0.5, fullMask).cursor).toBeNull();
  });
});

describe('stepPhysics', () => {
  it('returns a new state object (immutability)', () => {
    const state = createInitialState(N, 0.5, fullMask);
    const next = stepPhysics(state, cfg(), 0.016);
    expect(next).not.toBe(state);
    expect(next.heights).not.toBe(state.heights);
    expect(next.velocities).not.toBe(state.velocities);
  });

  it('returns the same state reference when dt = 0', () => {
    const state = createInitialState(N, 0.5, fullMask);
    const next = stepPhysics(state, cfg(), 0);
    expect(next).toBe(state);
  });

  it('with no cursor, a perturbed spike converges toward restHeight', () => {
    let state = createInitialState(N, 0.5, fullMask);
    const heights = new Float32Array(state.heights);
    heights[4 * N + 4] = 0.9; // single spike at center
    state = { ...state, heights };

    const config = cfg({ gravity: 15, viscosity: 5, surfaceTension: 0.5, fieldStrength: 0, fillLevel: 0.5 });
    for (let i = 0; i < 400; i++) state = stepPhysics(state, config, 0.016);
    expect(Math.abs(state.heights[4 * N + 4]! - 0.5)).toBeLessThan(0.05);
  });

  it('attract: spike grows near cursor after several ticks', () => {
    const cursor = { x: 0.5, y: 0.5 };
    let state = { ...createInitialState(N, 0.3, fullMask), cursor, mode: 'attract' as const };
    const config = cfg({ fieldStrength: 0.2, viscosity: 0.3, surfaceTension: 0.2, gravity: 1, fillLevel: 0.3 });
    const initH = state.heights[4 * N + 4]!;
    for (let i = 0; i < 30; i++) state = stepPhysics(state, config, 0.016);
    expect(state.heights[4 * N + 4]!).toBeGreaterThan(initH);
  });

  it('repel: height drops near cursor after several ticks', () => {
    const cursor = { x: 0.5, y: 0.5 };
    let state = { ...createInitialState(N, 0.6, fullMask), cursor, mode: 'repel' as const };
    const config = cfg({ fieldStrength: 0.2, viscosity: 0.3, surfaceTension: 0.2, gravity: 1, fillLevel: 0.6 });
    const initH = state.heights[4 * N + 4]!;
    for (let i = 0; i < 30; i++) state = stepPhysics(state, config, 0.016);
    expect(state.heights[4 * N + 4]!).toBeLessThan(initH);
  });

  it('heights always stay within [0, 1]', () => {
    let state = { ...createInitialState(N, 0.5, fullMask), cursor: { x: 0.5, y: 0.5 }, mode: 'attract' as const };
    const config = cfg({ fieldStrength: 50, viscosity: 0, surfaceTension: 0, gravity: 0 });
    for (let i = 0; i < 100; i++) state = stepPhysics(state, config, 0.016);
    for (const h of state.heights) {
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(1);
    }
  });

  it('fillLevel change updates restHeight in returned state', () => {
    const state = createInitialState(N, 0.4, fullMask);
    const next = stepPhysics(state, cfg({ fillLevel: 0.7 }), 0.016);
    expect(next.restHeight).toBe(0.7);
  });

  it('sub-stepping: multiple subSteps produces same direction of change as 1 subStep', () => {
    const cursor = { x: 0.5, y: 0.5 };
    const base = { ...createInitialState(N, 0.4, fullMask), cursor, mode: 'attract' as const };
    const config1 = cfg({ fieldStrength: 0.1, subSteps: 1, fillLevel: 0.4 });
    const config4 = cfg({ fieldStrength: 0.1, subSteps: 4, fillLevel: 0.4 });
    const s1 = stepPhysics(base, config1, 0.016);
    const s4 = stepPhysics(base, config4, 0.016);
    const centerIdx = 4 * N + 4;
    // Both should increase height near cursor
    expect(s1.heights[centerIdx]!).toBeGreaterThan(base.heights[centerIdx]!);
    expect(s4.heights[centerIdx]!).toBeGreaterThan(base.heights[centerIdx]!);
  });
});
