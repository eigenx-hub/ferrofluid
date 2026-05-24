import { describe, it, expect } from 'vitest';
import { getGradientColor, lerp, clamp, rgbToHex, hexToRgb } from '../../src/rendering/colors';
import type { RGB } from '../../src/rendering/colors';

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];
const RED: RGB = [255, 0, 0];
const BLUE: RGB = [0, 0, 255];

describe('getGradientColor', () => {
  it('distance = 0 returns exactly nearColor', () => {
    const c = getGradientColor(0, 100, WHITE, BLACK);
    expect(c).toEqual(WHITE);
  });

  it('distance = maxDistance returns exactly farColor', () => {
    const c = getGradientColor(100, 100, WHITE, BLACK);
    expect(c).toEqual(BLACK);
  });

  it('distance = maxDistance / 2 returns midpoint color', () => {
    const c = getGradientColor(50, 100, WHITE, BLACK);
    expect(c[0]).toBeCloseTo(127, -1);
    expect(c[1]).toBeCloseTo(127, -1);
    expect(c[2]).toBeCloseTo(127, -1);
  });

  it('nearColor === farColor returns same color regardless of distance', () => {
    const c0 = getGradientColor(0, 100, RED, RED);
    const c50 = getGradientColor(50, 100, RED, RED);
    const c100 = getGradientColor(100, 100, RED, RED);
    expect(c0).toEqual(RED);
    expect(c50).toEqual(RED);
    expect(c100).toEqual(RED);
  });

  it('distance > maxDistance clamps to farColor', () => {
    const c = getGradientColor(200, 100, WHITE, BLACK);
    expect(c).toEqual(BLACK);
  });

  it('distance < 0 clamps to nearColor', () => {
    const c = getGradientColor(-10, 100, WHITE, BLACK);
    expect(c).toEqual(WHITE);
  });

  it('interpolates each channel independently', () => {
    const c = getGradientColor(50, 100, RED, BLUE);
    expect(c[0]).toBeCloseTo(127, -1); // red channel
    expect(c[1]).toBeCloseTo(0, 0);   // green channel
    expect(c[2]).toBeCloseTo(127, -1); // blue channel
  });

  it('returns integer RGB values', () => {
    const c = getGradientColor(33, 100, WHITE, BLACK);
    expect(c[0]).toBe(Math.round(c[0]));
    expect(c[1]).toBe(Math.round(c[1]));
    expect(c[2]).toBe(Math.round(c[2]));
  });
});

describe('lerp', () => {
  it('t=0 returns a', () => expect(lerp(10, 20, 0)).toBe(10));
  it('t=1 returns b', () => expect(lerp(10, 20, 1)).toBe(20));
  it('t=0.5 returns midpoint', () => expect(lerp(0, 100, 0.5)).toBe(50));
});

describe('clamp', () => {
  it('clamps below min', () => expect(clamp(-5, 0, 1)).toBe(0));
  it('clamps above max', () => expect(clamp(5, 0, 1)).toBe(1));
  it('passes through in-range values', () => expect(clamp(0.5, 0, 1)).toBe(0.5));
});

describe('rgbToHex / hexToRgb round-trip', () => {
  it('round-trips white', () => {
    expect(hexToRgb(rgbToHex(WHITE))).toEqual(WHITE);
  });
  it('round-trips black', () => {
    expect(hexToRgb(rgbToHex(BLACK))).toEqual(BLACK);
  });
  it('round-trips arbitrary color', () => {
    const color: RGB = [123, 45, 200];
    expect(hexToRgb(rgbToHex(color))).toEqual(color);
  });
  it('hexToRgb handles # prefix', () => {
    expect(hexToRgb('#ff0000')).toEqual(RED);
  });
});
