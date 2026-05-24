import { describe, it, expect } from 'vitest';
import { CONTAINERS } from '../../src/containers';

describe('container getSampleXPositions', () => {
  for (const container of CONTAINERS) {
    describe(container.label, () => {
      it('returns exactly count positions', () => {
        expect(container.getSampleXPositions(64)).toHaveLength(64);
        expect(container.getSampleXPositions(1)).toHaveLength(1);
        expect(container.getSampleXPositions(2)).toHaveLength(2);
        expect(container.getSampleXPositions(128)).toHaveLength(128);
      });

      it('all positions are finite numbers in [0, 1]', () => {
        const pts = container.getSampleXPositions(32);
        for (const x of pts) {
          expect(isFinite(x)).toBe(true);
          expect(x).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(1);
        }
      });

      it('count = 1: returns [0.5] (center)', () => {
        expect(container.getSampleXPositions(1)).toEqual([0.5]);
      });

      it('count = 2: returns [0, 1] (endpoints)', () => {
        const pts = container.getSampleXPositions(2);
        expect(pts[0]).toBeCloseTo(0);
        expect(pts[1]).toBeCloseTo(1);
      });

      it('positions are monotonically non-decreasing', () => {
        const pts = container.getSampleXPositions(32);
        for (let i = 1; i < pts.length; i++) {
          expect(pts[i]!).toBeGreaterThanOrEqual(pts[i - 1]!);
        }
      });
    });
  }
});
