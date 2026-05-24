import { describe, it, expect } from 'vitest';
import { CONTAINERS } from '../../src/containers';

describe('container getMask', () => {
  for (const container of CONTAINERS) {
    describe(container.label, () => {
      it('returns exactly N*N values for N=32', () => {
        const N = 32;
        expect(container.getMask(N)).toHaveLength(N * N);
      });

      it('returns exactly N*N values for N=64', () => {
        const N = 64;
        expect(container.getMask(N)).toHaveLength(N * N);
      });

      it('all values are 0 or 1', () => {
        const mask = container.getMask(32);
        for (const v of mask) {
          expect(v === 0 || v === 1).toBe(true);
        }
      });

      it('at least some cells are inside (mask has 1s)', () => {
        const mask = container.getMask(32);
        expect(Array.from(mask).some((v) => v === 1)).toBe(true);
      });

      it('not all cells are inside (mask has 0s for most shapes)', () => {
        // Open pool fills most cells, but others should have a boundary
        if (container.id === 'openPool') return;
        const mask = container.getMask(32);
        expect(Array.from(mask).some((v) => v === 0)).toBe(true);
      });

      it('N=1: returns a 1-element array', () => {
        expect(container.getMask(1)).toHaveLength(1);
      });

      it('N=2: returns a 4-element array', () => {
        expect(container.getMask(2)).toHaveLength(4);
      });

      it('larger N has more inside cells than smaller N (scales consistently)', () => {
        const m16 = Array.from(container.getMask(16)).filter(Boolean).length;
        const m32 = Array.from(container.getMask(32)).filter(Boolean).length;
        expect(m32).toBeGreaterThan(m16);
      });
    });
  }
});
