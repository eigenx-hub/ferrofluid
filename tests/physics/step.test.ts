import { describe, it, expect } from 'vitest';
import { stepPhysics, createInitialState } from '../../src/physics/step';
import { PhysicsConfig, DEFAULT_CONFIG } from '../../src/physics/types';

function cfg(overrides: Partial<PhysicsConfig> = {}): PhysicsConfig {
  return { ...DEFAULT_CONFIG, spikeCount: 8, ...overrides };
}

describe('createInitialState', () => {
  it('initializes all heights to fillLevel', () => {
    const state = createInitialState(16, 0.4);
    expect(Array.from(state.heights).every((h) => h === 0.4)).toBe(true);
  });

  it('initializes all velocities to 0', () => {
    const state = createInitialState(16, 0.4);
    expect(Array.from(state.velocities).every((v) => v === 0)).toBe(true);
  });

  it('sets restHeight to fillLevel', () => {
    const state = createInitialState(8, 0.7);
    expect(state.restHeight).toBe(0.7);
  });

  it('defaults cursor to null', () => {
    expect(createInitialState(8, 0.5).cursor).toBeNull();
  });

  it('respects mode parameter', () => {
    expect(createInitialState(8, 0.5, 'repel').mode).toBe('repel');
  });
});

describe('stepPhysics', () => {
  it('returns a new state object (immutability)', () => {
    const state = createInitialState(8, 0.5);
    const next = stepPhysics(state, cfg(), 0.016);
    expect(next).not.toBe(state);
    expect(next.heights).not.toBe(state.heights);
    expect(next.velocities).not.toBe(state.velocities);
  });

  it('returns the same state when dt = 0', () => {
    const state = createInitialState(8, 0.5);
    const next = stepPhysics(state, cfg(), 0);
    expect(next).toBe(state);
  });

  it('with no cursor, heights converge back to restHeight over many ticks', () => {
    let state = createInitialState(8, 0.5);
    // Perturb one spike
    const h = new Float32Array(state.heights);
    h[3] = 0.9;
    state = { ...state, heights: h };

    const config = cfg({ gravity: 15, viscosity: 4, surfaceTension: 100, fieldStrength: 0 });
    for (let i = 0; i < 300; i++) {
      state = stepPhysics(state, config, 0.016);
    }
    // After 300 ticks (~5s), spike should have largely settled
    expect(Math.abs(state.heights[3]! - 0.5)).toBeLessThan(0.05);
  });

  it('attract mode: spike nearest cursor grows after several ticks', () => {
    let state = createInitialState(8, 0.4);
    state = { ...state, cursor: { x: 0.5, y: 0.9 }, mode: 'attract' };
    const config = cfg({ fieldStrength: 0.15, viscosity: 0.5, surfaceTension: 10, gravity: 2 });

    const initHeight = state.heights[4]!;
    for (let i = 0; i < 20; i++) {
      state = stepPhysics(state, config, 0.016);
    }
    expect(state.heights[4]!).toBeGreaterThan(initHeight);
  });

  it('repel mode: spike nearest cursor shrinks after several ticks', () => {
    let state = createInitialState(8, 0.6);
    state = { ...state, cursor: { x: 0.5, y: 0.9 }, mode: 'repel' };
    const config = cfg({ fieldStrength: 0.15, viscosity: 0.5, surfaceTension: 10, gravity: 2 });

    const initHeight = state.heights[4]!;
    for (let i = 0; i < 20; i++) {
      state = stepPhysics(state, config, 0.016);
    }
    expect(state.heights[4]!).toBeLessThan(initHeight);
  });

  it('heights stay within [0, 1] bounds regardless of extreme inputs', () => {
    let state = createInitialState(8, 0.5);
    state = { ...state, cursor: { x: 0.5, y: 0.999 }, mode: 'attract' };
    const config = cfg({ fieldStrength: 10, viscosity: 0, surfaceTension: 0, gravity: 0 });

    for (let i = 0; i < 100; i++) {
      state = stepPhysics(state, config, 0.016);
    }
    for (let i = 0; i < state.heights.length; i++) {
      expect(state.heights[i]!).toBeGreaterThanOrEqual(0);
      expect(state.heights[i]!).toBeLessThanOrEqual(1);
    }
  });

  it('fillLevel change updates restHeight in returned state', () => {
    const state = createInitialState(8, 0.4);
    const next = stepPhysics(state, cfg({ fillLevel: 0.7 }), 0.016);
    expect(next.restHeight).toBe(0.7);
  });
});
