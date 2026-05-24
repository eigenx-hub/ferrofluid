import { describe, it, expect } from 'vitest';
import { applyMagnetic, applySurfaceTension, applyGravity, applyDamping } from '../../src/physics/forces';
import { PhysicsState, PhysicsConfig, DEFAULT_CONFIG } from '../../src/physics/types';

const N = 8;

function fullMask(n = N): Uint8Array {
  return new Uint8Array(n * n).fill(1);
}

function makeState(overrides: Partial<PhysicsState> = {}): PhysicsState {
  return {
    heights: new Float32Array(N * N).fill(0.5),
    velocities: new Float32Array(N * N).fill(0),
    restHeight: 0.5,
    cursor: null,
    mode: 'attract',
    mask: fullMask(),
    gridSize: N,
    ...overrides,
  };
}

function makeConfig(overrides: Partial<PhysicsConfig> = {}): PhysicsConfig {
  return { ...DEFAULT_CONFIG, gridSize: N, subSteps: 1, ...overrides };
}

// --- applyMagnetic (3D depth model) ---

describe('applyMagnetic', () => {
  it('does nothing when cursor is null', () => {
    const forces = new Float32Array(N * N);
    applyMagnetic(makeState({ cursor: null }), makeConfig(), forces);
    expect(Array.from(forces).every((f) => f === 0)).toBe(true);
  });

  it('attract: all inside-mask cells get positive force', () => {
    const state = makeState({ cursor: { x: 0.5, y: 0.5 }, mode: 'attract' });
    const forces = new Float32Array(N * N);
    applyMagnetic(state, makeConfig({ fieldStrength: 0.1, magnetDepth: 0.3 }), forces);
    // With the monopole model, force is always positive for attract
    for (let idx = 0; idx < N * N; idx++) {
      expect(forces[idx]!).toBeGreaterThanOrEqual(0);
    }
  });

  it('repel: all inside-mask cells get negative force', () => {
    const state = makeState({ cursor: { x: 0.5, y: 0.5 }, mode: 'repel' });
    const forces = new Float32Array(N * N);
    applyMagnetic(state, makeConfig({ fieldStrength: 0.1, magnetDepth: 0.3 }), forces);
    for (let idx = 0; idx < N * N; idx++) {
      expect(forces[idx]!).toBeLessThanOrEqual(0);
    }
  });

  it('force magnitude is finite even directly above cursor (no singularity)', () => {
    // With depth model, force at cursor position = fieldStrength / magnetDepth^2
    const state = makeState({ cursor: { x: 0, y: 0 }, mode: 'attract' });
    const forces = new Float32Array(N * N);
    applyMagnetic(state, makeConfig({ fieldStrength: 0.1, magnetDepth: 0.3 }), forces);
    expect(isFinite(forces[0]!)).toBe(true);
    expect(forces[0]!).toBeGreaterThan(0);
  });

  it('cell closest to cursor gets stronger force than distant cell', () => {
    const state = makeState({ cursor: { x: 0, y: 0 }, mode: 'attract' });
    const forces = new Float32Array(N * N);
    applyMagnetic(state, makeConfig({ fieldStrength: 0.1, magnetDepth: 0.3 }), forces);
    expect(forces[0]!).toBeGreaterThan(forces[N * N - 1]!);
  });

  it('field strength = 0 produces no force', () => {
    const state = makeState({ cursor: { x: 0.5, y: 0.5 } });
    const forces = new Float32Array(N * N);
    applyMagnetic(state, makeConfig({ fieldStrength: 0 }), forces);
    expect(Array.from(forces).every((f) => f === 0)).toBe(true);
  });

  it('attract and repel forces sum to zero (sign symmetry)', () => {
    const cursor = { x: 0.5, y: 0.5 };
    const fA = new Float32Array(N * N);
    const fR = new Float32Array(N * N);
    applyMagnetic(makeState({ cursor, mode: 'attract' }), makeConfig({ fieldStrength: 0.1 }), fA);
    applyMagnetic(makeState({ cursor, mode: 'repel' }), makeConfig({ fieldStrength: 0.1 }), fR);
    for (let i = 0; i < N * N; i++) {
      expect(fA[i]! + fR[i]!).toBeCloseTo(0, 10);
    }
  });

  it('cells outside mask receive no force', () => {
    const mask = new Uint8Array(N * N); // all outside
    mask[0] = 1;
    const state = makeState({ cursor: { x: 0.5, y: 0.5 }, mask, gridSize: N });
    const forces = new Float32Array(N * N);
    applyMagnetic(state, makeConfig({ fieldStrength: 0.1 }), forces);
    for (let idx = 1; idx < N * N; idx++) expect(forces[idx]).toBe(0);
  });

  it('larger magnetDepth spreads force more broadly', () => {
    const cursor = { x: 0.5, y: 0.5 };
    const farIdx = 0; // top-left corner
    const fShallow = new Float32Array(N * N);
    const fDeep = new Float32Array(N * N);
    applyMagnetic(makeState({ cursor }), makeConfig({ fieldStrength: 0.1, magnetDepth: 0.05 }), fShallow);
    applyMagnetic(makeState({ cursor }), makeConfig({ fieldStrength: 0.1, magnetDepth: 0.5 }), fDeep);
    // Deeper magnet spreads force to far corners more
    expect(fDeep[farIdx]!).toBeGreaterThan(fShallow[farIdx]!);
  });
});

// --- applySurfaceTension ---

describe('applySurfaceTension', () => {
  it('produces no force on a flat surface', () => {
    const heights = new Float32Array(N * N).fill(0.5);
    const forces = new Float32Array(N * N);
    applySurfaceTension(heights, fullMask(), N, 50, forces);
    expect(Array.from(forces).every((f) => Math.abs(f) < 1e-6)).toBe(true);
  });

  it('spike at center gets downward force, neighbors get upward force', () => {
    const heights = new Float32Array(N * N).fill(0.5);
    const idx = 4 * N + 4;
    heights[idx] = 1.0;
    const forces = new Float32Array(N * N);
    applySurfaceTension(heights, fullMask(), N, 50, forces);
    expect(forces[idx]!).toBeLessThan(0);
    expect(forces[4 * N + 3]!).toBeGreaterThan(0);
    expect(forces[4 * N + 5]!).toBeGreaterThan(0);
  });

  it('Neumann BC: isolated mask cell has zero surface tension force', () => {
    const heights = new Float32Array(N * N).fill(0.5);
    const mask = new Uint8Array(N * N);
    mask[0] = 1;
    const forces = new Float32Array(N * N);
    applySurfaceTension(heights, mask, N, 50, forces);
    expect(forces[0]).toBeCloseTo(0);
  });
});

// --- applyGravity ---

describe('applyGravity', () => {
  it('zero force when heights equal restHeight', () => {
    const heights = new Float32Array(N * N).fill(0.5);
    const forces = new Float32Array(N * N);
    applyGravity(heights, fullMask(), 0.5, 10, forces);
    expect(Array.from(forces).every((f) => f === 0)).toBe(true);
  });

  it('elevated height → negative force (pulled down)', () => {
    const heights = new Float32Array(N * N).fill(0.5);
    heights[0] = 0.9;
    const forces = new Float32Array(N * N);
    applyGravity(heights, fullMask(), 0.5, 10, forces);
    expect(forces[0]!).toBeLessThan(0);
  });

  it('suppressed height → positive force (pushed up)', () => {
    const heights = new Float32Array(N * N).fill(0.5);
    heights[0] = 0.1;
    const forces = new Float32Array(N * N);
    applyGravity(heights, fullMask(), 0.5, 10, forces);
    expect(forces[0]!).toBeGreaterThan(0);
  });
});

// --- applyDamping ---

describe('applyDamping', () => {
  it('reduces velocity by expected factor', () => {
    const velocities = new Float32Array([1, 2]);
    applyDamping(velocities, new Uint8Array([1, 1]), 2, 0.5);
    expect(velocities[0]).toBeCloseTo(0);
  });

  it('factor clamped at 0 — never inverts velocity', () => {
    const velocities = new Float32Array([1, -1]);
    applyDamping(velocities, new Uint8Array([1, 1]), 100, 1);
    expect(velocities[0]).toBeGreaterThanOrEqual(0);
    expect(velocities[1]).toBeLessThanOrEqual(0);
  });

  it('skips cells outside mask', () => {
    const velocities = new Float32Array([5, 5]);
    applyDamping(velocities, new Uint8Array([1, 0]), 100, 1);
    expect(velocities[0]).toBeCloseTo(0);
    expect(velocities[1]).toBe(5);
  });
});
