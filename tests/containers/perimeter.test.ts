import { describe, it, expect } from 'vitest';
import { openPool } from '../../src/containers';

describe('openPool getMask', () => {
  it('returns exactly N*N values for N=32', () => {
    const N = 32;
    expect(openPool.getMask(N)).toHaveLength(N * N);
  });

  it('returns exactly N*N values for N=64', () => {
    const N = 64;
    expect(openPool.getMask(N)).toHaveLength(N * N);
  });

  it('all values are 0 or 1', () => {
    const mask = openPool.getMask(32);
    for (const v of mask) {
      expect(v === 0 || v === 1).toBe(true);
    }
  });

  it('all cells are inside (open pool fills everything)', () => {
    const mask = openPool.getMask(32);
    expect(Array.from(mask).every((v) => v === 1)).toBe(true);
  });

  it('N=1: returns a 1-element array', () => {
    expect(openPool.getMask(1)).toHaveLength(1);
  });

  it('N=2: returns a 4-element array', () => {
    expect(openPool.getMask(2)).toHaveLength(4);
  });

  it('larger N has more inside cells than smaller N', () => {
    const m16 = Array.from(openPool.getMask(16)).filter(Boolean).length;
    const m32 = Array.from(openPool.getMask(32)).filter(Boolean).length;
    expect(m32).toBeGreaterThan(m16);
  });
});
