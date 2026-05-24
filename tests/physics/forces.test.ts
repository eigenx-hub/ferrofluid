import { describe, it, expect } from 'vitest';
import { applyMagnetic, applySurfaceTension, applyGravity, applyDamping } from '../../src/physics/forces';
import { PhysicsState, PhysicsConfig, DEFAULT_CONFIG } from '../../src/physics/types';

const N = 8;

function fullMask(n = N): Uint8Array {
  return new Uint8Array(n * n).fill(1);
}

function makeState(overrides: Partial<PhysicsState> = {}): PhysicsState {
  const mask = fullMask();
  return {
    heights: new Float32Array(N * N).fill(0.5),
    velocities: new Float32Array(N * N).fill(0),
    restHeight: 0.5,
    cursor: null,
    mode: 'attract',
    mask,
    gridSize: N,
    ...overrides,
  };
}

function makeConfig(overrides: Partial<PhysicsConfig> = {}): PhysicsConfig {
  return { ...DEFAULT_CONFIG, gridSize: N, subSteps: 1, ...overrides };
}

// --- applyMagnetic ---

describe('applyMagnetic', () => {
  it('does nothing when cursor is null', () => {
    const state = makeState({ cursor: null });
    const forces = new Float32Array(N * N);
    applyMagnetic(state, makeConfig(), forces);
    expect(Array.from(forces).every((f) => f === 0)).toBe(true);
  });

  it('attract: cells near cursor get positive (upward) force', () => {
    // Cursor at center top (x=0.5, y=0.1) — close to top row cells
    const state = makeState({ cursor: { x: 0.5, y: 0.1 }, mode: 'attract' });
    const forces = new Float32Array(N * N);
    applyMagnetic(state, makeConfig({ fieldStrength: 0.1 }), forces);
    // Some cells should have positive force
    expect(Array.from(forces).some((f) => f > 0)).toBe(true);
    // Farthest cell (bottom-left) should have less force than nearest (top-center)
    const nearIdx = 0 * N + Math.round(0.5 * (N - 1)); // row 0, col ~4
    const farIdx = (N - 1) * N + 0; // bottom-left
    expect(forces[nearIdx]!).toBeGreaterThan(forces[farIdx]!);
  });

  it('repel: force signs are reversed vs attract', () => {
    const cursor = { x: 0.5, y: 0.5 };
    const stateA = makeState({ cursor, mode: 'attract' });
    const stateR = makeState({ cursor, mode: 'repel' });
    const fA = new Float32Array(N * N);
    const fR = new Float32Array(N * N);
    applyMagnetic(stateA, makeConfig({ fieldStrength: 0.1 }), fA);
    applyMagnetic(stateR, makeConfig({ fieldStrength: 0.1 }), fR);
    for (let i = 0; i < N * N; i++) {
      expect(fA[i]! + fR[i]!).toBeCloseTo(0, 10);
    }
  });

  it('field strength = 0: no force applied', () => {
    const state = makeState({ cursor: { x: 0.5, y: 0.5 } });
    const forces = new Float32Array(N * N);
    applyMagnetic(state, makeConfig({ fieldStrength: 0 }), forces);
    expect(Array.from(forces).every((f) => f === 0)).toBe(true);
  });

  it('does not crash when cursor exactly on a cell (zero-distance clamp)', () => {
    // Cursor exactly at cell (4,4): x=4/7, y=4/7
    const state = makeState({ cursor: { x: 4 / 7, y: 4 / 7 }, mode: 'attract' });
    const forces = new Float32Array(N * N);
    expect(() => applyMagnetic(state, makeConfig(), forces)).not.toThrow();
    expect(Array.from(forces).every(isFinite)).toBe(true);
  });

  it('cells outside mask receive no force', () => {
    const mask = new Uint8Array(N * N); // all zeros
    mask[4 * N + 4] = 1; // only center cell
    const state = makeState({ cursor: { x: 0, y: 0 }, mode: 'attract', mask, gridSize: N });
    const forces = new Float32Array(N * N);
    applyMagnetic(state, makeConfig({ fieldStrength: 0.1 }), forces);
    for (let idx = 0; idx < N * N; idx++) {
      if (!mask[idx]) expect(forces[idx]).toBe(0);
    }
  });
});

// --- applySurfaceTension ---

describe('applySurfaceTension', () => {
  it('produces no force on a flat surface', () => {
    const heights = new Float32Array(N * N).fill(0.5);
    const mask = fullMask();
    const forces = new Float32Array(N * N);
    applySurfaceTension(heights, mask, N, 50, forces);
    expect(Array.from(forces).every((f) => Math.abs(f) < 1e-6)).toBe(true);
  });

  it('spike at center gets downward force, neighbors get upward force', () => {
    const heights = new Float32Array(N * N).fill(0.5);
    const idx = 4 * N + 4;
    heights[idx] = 1.0; // sharp spike at center
    const mask = fullMask();
    const forces = new Float32Array(N * N);
    applySurfaceTension(heights, mask, N, 50, forces);
    expect(forces[idx]!).toBeLessThan(0);
    expect(forces[4 * N + 3]!).toBeGreaterThan(0); // left neighbor
    expect(forces[4 * N + 5]!).toBeGreaterThan(0); // right neighbor
  });

  it('Neumann BC: boundary cells use own height for out-of-mask neighbors', () => {
    const heights = new Float32Array(N * N).fill(0.5);
    const mask = new Uint8Array(N * N);
    mask[0] = 1; // only top-left cell is inside mask
    const forces = new Float32Array(N * N);
    applySurfaceTension(heights, mask, N, 50, forces);
    // Cell 0: neighbors [−1], [1], [−N], [N] — all outside mask → same h → force = 0
    expect(forces[0]).toBeCloseTo(0);
  });
});

// --- applyGravity ---

describe('applyGravity', () => {
  it('produces zero force when heights equal restHeight', () => {
    const heights = new Float32Array(N * N).fill(0.5);
    const mask = fullMask();
    const forces = new Float32Array(N * N);
    applyGravity(heights, mask, 0.5, 10, forces);
    expect(Array.from(forces).every((f) => f === 0)).toBe(true);
  });

  it('elevated heights get negative (downward) force', () => {
    const heights = new Float32Array(N * N).fill(0.5);
    heights[0] = 0.9;
    const mask = fullMask();
    const forces = new Float32Array(N * N);
    applyGravity(heights, mask, 0.5, 10, forces);
    expect(forces[0]!).toBeLessThan(0);
  });

  it('suppressed heights get positive (upward) force', () => {
    const heights = new Float32Array(N * N).fill(0.5);
    heights[0] = 0.1;
    const mask = fullMask();
    const forces = new Float32Array(N * N);
    applyGravity(heights, mask, 0.5, 10, forces);
    expect(forces[0]!).toBeGreaterThan(0);
  });

  it('cells outside mask receive no force', () => {
    const heights = new Float32Array(4).fill(0.9);
    const mask = new Uint8Array(4); // all zeros
    const forces = new Float32Array(4);
    applyGravity(heights, mask, 0.5, 10, forces);
    expect(Array.from(forces).every((f) => f === 0)).toBe(true);
  });
});

// --- applyDamping ---

describe('applyDamping', () => {
  it('reduces velocity by expected factor', () => {
    const velocities = new Float32Array([1, 2]);
    const mask = new Uint8Array([1, 1]);
    applyDamping(velocities, mask, 2, 0.5); // factor = 1 - 2*0.5 = 0
    expect(velocities[0]).toBeCloseTo(0);
    expect(velocities[1]).toBeCloseTo(0);
  });

  it('does not invert velocity when viscosity * dt > 1 (clamped factor)', () => {
    const velocities = new Float32Array([1, -1]);
    const mask = new Uint8Array([1, 1]);
    applyDamping(velocities, mask, 10, 1);
    expect(velocities[0]).toBeGreaterThanOrEqual(0);
    expect(velocities[1]).toBeLessThanOrEqual(0);
  });

  it('skips cells outside mask', () => {
    const velocities = new Float32Array([5, 5]);
    const mask = new Uint8Array([1, 0]);
    applyDamping(velocities, mask, 100, 1);
    expect(velocities[0]).toBeCloseTo(0); // inside mask, damped
    expect(velocities[1]).toBe(5); // outside mask, untouched
  });
});
