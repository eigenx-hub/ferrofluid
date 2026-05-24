import { describe, it, expect } from 'vitest';
import { stepPhysics, createInitialState } from '../../src/physics/step';
import { applySurfaceTension } from '../../src/physics/forces';
import { PhysicsConfig, DEFAULT_CONFIG } from '../../src/physics/types';

function cfg(overrides: Partial<PhysicsConfig> = {}): PhysicsConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

describe('edge cases', () => {
  it('spikeCount = 1: step does not crash', () => {
    const state = createInitialState(1, 0.5);
    expect(() => stepPhysics({ ...state, cursor: { x: 0.5, y: 0.8 } }, cfg({ spikeCount: 1 }), 0.016)).not.toThrow();
  });

  it('spikeCount = 2: surface tension wrap-around does not crash', () => {
    const heights = new Float32Array([0.3, 0.7]);
    const forces = new Float32Array(2);
    expect(() => applySurfaceTension(heights, 50, forces)).not.toThrow();
    expect(isFinite(forces[0]!)).toBe(true);
    expect(isFinite(forces[1]!)).toBe(true);
  });

  it('cursor outside container bounds (x < 0): no crash, force is finite', () => {
    const state = createInitialState(8, 0.5);
    const perturbed = { ...state, cursor: { x: -0.5, y: 0.8 }, mode: 'attract' as const };
    expect(() => stepPhysics(perturbed, cfg({ spikeCount: 8 }), 0.016)).not.toThrow();
    const next = stepPhysics(perturbed, cfg({ spikeCount: 8 }), 0.016);
    for (let i = 0; i < next.heights.length; i++) {
      expect(isFinite(next.heights[i]!)).toBe(true);
    }
  });

  it('cursor outside container bounds (x > 1): no crash, force is finite', () => {
    const state = createInitialState(8, 0.5);
    const perturbed = { ...state, cursor: { x: 1.5, y: 0.5 } };
    const next = stepPhysics(perturbed, cfg({ spikeCount: 8 }), 0.016);
    for (let i = 0; i < next.heights.length; i++) {
      expect(isFinite(next.heights[i]!)).toBe(true);
    }
  });

  it('fillLevel = 0: restHeight = 0, fluid hugs bottom', () => {
    let state = createInitialState(8, 0);
    const config = cfg({ spikeCount: 8, fillLevel: 0, fieldStrength: 0, gravity: 20, viscosity: 5 });
    for (let i = 0; i < 100; i++) state = stepPhysics(state, config, 0.016);
    for (let i = 0; i < state.heights.length; i++) {
      expect(state.heights[i]!).toBeCloseTo(0, 1);
    }
  });

  it('fillLevel = 1.0: restHeight = 1, fluid fills container', () => {
    let state = createInitialState(8, 1);
    const config = cfg({ spikeCount: 8, fillLevel: 1, fieldStrength: 0, gravity: 20, viscosity: 5 });
    for (let i = 0; i < 100; i++) state = stepPhysics(state, config, 0.016);
    for (let i = 0; i < state.heights.length; i++) {
      expect(state.heights[i]!).toBeCloseTo(1, 1);
    }
  });

  it('extreme fieldStrength: heights are always clamped to [0,1]', () => {
    let state = createInitialState(16, 0.5);
    state = { ...state, cursor: { x: 0.5, y: 0.99 }, mode: 'attract' };
    const config = cfg({ spikeCount: 16, fieldStrength: 100, viscosity: 0, surfaceTension: 0, gravity: 0 });
    for (let i = 0; i < 60; i++) state = stepPhysics(state, config, 0.016);
    for (let i = 0; i < state.heights.length; i++) {
      expect(state.heights[i]!).toBeGreaterThanOrEqual(0);
      expect(state.heights[i]!).toBeLessThanOrEqual(1);
    }
  });

  it('viscosity = 1.0 with large dt: velocities clamped to >= 0 factor', () => {
    let state = createInitialState(8, 0.5);
    state = { ...state, cursor: { x: 0.5, y: 0.8 }, mode: 'attract' };
    const config = cfg({ spikeCount: 8, viscosity: 1.0, fieldStrength: 0.1 });
    // Should not throw or produce NaN
    expect(() => {
      state = stepPhysics(state, config, 2.0); // very large dt
    }).not.toThrow();
    for (let i = 0; i < state.velocities.length; i++) {
      expect(isFinite(state.velocities[i]!)).toBe(true);
    }
  });

  it('large spikeCount (256): no performance crash within reasonable time', () => {
    let state = createInitialState(256, 0.5);
    state = { ...state, cursor: { x: 0.5, y: 0.8 } };
    const config = cfg({ spikeCount: 256 });
    const start = Date.now();
    for (let i = 0; i < 60; i++) state = stepPhysics(state, config, 0.016);
    expect(Date.now() - start).toBeLessThan(500); // 60 ticks in under 500ms
  });
});
