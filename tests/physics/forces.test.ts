import { describe, it, expect } from 'vitest';
import { applyMagnetic, applySurfaceTension, applyGravity, applyDamping } from '../../src/physics/forces';
import { PhysicsState, PhysicsConfig, DEFAULT_CONFIG } from '../../src/physics/types';

function makeState(overrides: Partial<PhysicsState> = {}): PhysicsState {
  const n = 8;
  return {
    heights: new Float32Array(n).fill(0.5),
    velocities: new Float32Array(n).fill(0),
    restHeight: 0.5,
    cursor: null,
    mode: 'attract',
    ...overrides,
  };
}

function makeConfig(overrides: Partial<PhysicsConfig> = {}): PhysicsConfig {
  return { ...DEFAULT_CONFIG, spikeCount: 8, ...overrides };
}

// --- applyMagnetic ---

describe('applyMagnetic', () => {
  it('does nothing when cursor is null', () => {
    const state = makeState({ cursor: null });
    const forces = new Float32Array(8);
    applyMagnetic(state, makeConfig(), forces);
    expect(Array.from(forces).every((f) => f === 0)).toBe(true);
  });

  it('attract mode: force pulls surfaces toward cursor above them', () => {
    // Cursor above fluid surface (y=0.9 when surface is at 0.5)
    // → dirY = (0.9 - 0.5)/dist > 0 → positive force (height increases)
    const state = makeState({ cursor: { x: 0.5, y: 0.9 }, mode: 'attract' });
    const forces = new Float32Array(8);
    applyMagnetic(state, makeConfig({ fieldStrength: 0.1 }), forces);
    // Central spike (closest to cursor x=0.5) should have largest positive force
    const centerIdx = 3; // i=3 → x = 3/7 ≈ 0.43
    expect(forces[centerIdx]).toBeGreaterThan(0);
  });

  it('repel mode: force pushes surfaces away from cursor above them', () => {
    const state = makeState({ cursor: { x: 0.5, y: 0.9 }, mode: 'repel' });
    const forces = new Float32Array(8);
    applyMagnetic(state, makeConfig({ fieldStrength: 0.1 }), forces);
    const centerIdx = 3;
    expect(forces[centerIdx]).toBeLessThan(0);
  });

  it('field strength = 0 produces no force', () => {
    const state = makeState({ cursor: { x: 0.5, y: 0.8 }, mode: 'attract' });
    const forces = new Float32Array(8);
    applyMagnetic(state, makeConfig({ fieldStrength: 0 }), forces);
    expect(Array.from(forces).every((f) => f === 0)).toBe(true);
  });

  it('force is stronger for nearer sample points', () => {
    const state = makeState({ cursor: { x: 0, y: 0.8 }, mode: 'attract' }); // cursor at left
    const forces = new Float32Array(8);
    applyMagnetic(state, makeConfig({ fieldStrength: 0.1 }), forces);
    // i=0 is closest to cursor x=0, should have greater magnitude than i=7
    expect(Math.abs(forces[0]!)).toBeGreaterThan(Math.abs(forces[7]!));
  });

  it('does not crash when cursor is exactly on a sample point (zero-distance clamp)', () => {
    const heights = new Float32Array(8).fill(0.5);
    // cursor at exact sample point 0: x=0/7=0, y=0.5
    const state = makeState({ cursor: { x: 0, y: 0.5 }, mode: 'attract', heights });
    const forces = new Float32Array(8);
    expect(() => applyMagnetic(state, makeConfig(), forces)).not.toThrow();
    expect(isFinite(forces[0]!)).toBe(true);
  });

  it('accumulates into existing forces (does not zero them out)', () => {
    const state = makeState({ cursor: { x: 0.5, y: 0.9 }, mode: 'attract' });
    const forces = new Float32Array(8).fill(1); // pre-existing force = 1
    applyMagnetic(state, makeConfig({ fieldStrength: 0.1 }), forces);
    // All forces should still be >= 1 (accumulated, not replaced)
    expect(forces[0]! >= 1).toBe(true);
  });
});

// --- applySurfaceTension ---

describe('applySurfaceTension', () => {
  it('produces zero force when all heights are equal (flat surface)', () => {
    const heights = new Float32Array(8).fill(0.5);
    const forces = new Float32Array(8);
    applySurfaceTension(heights, 50, forces);
    expect(Array.from(forces).every((f) => Math.abs(f) < 1e-7)).toBe(true);
  });

  it('smooths a sharp spike: high point gets downward force, neighbors get upward', () => {
    const heights = new Float32Array([0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5]);
    const forces = new Float32Array(8);
    applySurfaceTension(heights, 50, forces);
    expect(forces[3]!).toBeLessThan(0); // spike pulled down
    expect(forces[2]!).toBeGreaterThan(0); // left neighbor pulled up
    expect(forces[4]!).toBeGreaterThan(0); // right neighbor pulled up
  });

  it('wraps correctly at boundaries (circular array)', () => {
    // Spike at index 0, with neighbor at index 7 wrapping around
    const heights = new Float32Array([1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
    const forces = new Float32Array(8);
    applySurfaceTension(heights, 10, forces);
    expect(forces[0]!).toBeLessThan(0);
    expect(forces[7]!).toBeGreaterThan(0); // right-wrap neighbor
    expect(forces[1]!).toBeGreaterThan(0); // right neighbor
  });

  it('does nothing for n < 2', () => {
    const heights = new Float32Array([0.7]);
    const forces = new Float32Array(1);
    applySurfaceTension(heights, 50, forces);
    expect(forces[0]).toBe(0);
  });
});

// --- applyGravity ---

describe('applyGravity', () => {
  it('produces zero force when heights equal restHeight', () => {
    const heights = new Float32Array(4).fill(0.5);
    const forces = new Float32Array(4);
    applyGravity(heights, 0.5, 10, forces);
    expect(Array.from(forces).every((f) => f === 0)).toBe(true);
  });

  it('pulls elevated heights downward', () => {
    const heights = new Float32Array([0.8, 0.5, 0.5, 0.5]);
    const forces = new Float32Array(4);
    applyGravity(heights, 0.5, 10, forces);
    expect(forces[0]!).toBeLessThan(0); // 0.8 > 0.5 → pulled down
  });

  it('pushes suppressed heights upward', () => {
    const heights = new Float32Array([0.2, 0.5, 0.5, 0.5]);
    const forces = new Float32Array(4);
    applyGravity(heights, 0.5, 10, forces);
    expect(forces[0]!).toBeGreaterThan(0); // 0.2 < 0.5 → pushed up
  });

  it('force magnitude scales with displacement', () => {
    const heights = new Float32Array([0.9, 0.6]);
    const forces = new Float32Array(2);
    applyGravity(heights, 0.5, 10, forces);
    // |0.9 - 0.5| = 0.4 > |0.6 - 0.5| = 0.1
    expect(Math.abs(forces[0]!)).toBeGreaterThan(Math.abs(forces[1]!));
  });
});

// --- applyDamping ---

describe('applyDamping', () => {
  it('reduces velocities by the viscosity factor', () => {
    const velocities = new Float32Array([1, 2, -3]);
    applyDamping(velocities, 2, 0.5); // factor = 1 - 2*0.5 = 0
    expect(velocities[0]).toBeCloseTo(0);
    expect(velocities[1]).toBeCloseTo(0);
    expect(velocities[2]).toBeCloseTo(0);
  });

  it('does not invert velocities when viscosity * dt > 1 (clamped to 0)', () => {
    const velocities = new Float32Array([1, -1]);
    applyDamping(velocities, 10, 1); // would give factor = -9 without clamp
    expect(velocities[0]).toBeGreaterThanOrEqual(0);
    expect(velocities[1]).toBeLessThanOrEqual(0);
  });

  it('zero viscosity: velocities unchanged', () => {
    const velocities = new Float32Array([2, -4, 1]);
    applyDamping(velocities, 0, 0.016);
    expect(velocities[0]).toBeCloseTo(2);
    expect(velocities[1]).toBeCloseTo(-4);
  });
});
