export type RGB = [number, number, number];

export interface ColorConfig {
  nearColor: RGB;   // fluid color closest to cursor
  farColor: RGB;    // fluid color farthest from cursor
  bgColor: RGB;     // canvas background
  glassTint: RGB;   // container outline tint
  glassOpacity: number; // 0-1
}

export const DEFAULT_COLOR_CONFIG: ColorConfig = {
  nearColor: [30, 180, 255],
  farColor: [5, 5, 20],
  bgColor: [8, 8, 15],
  glassTint: [160, 210, 255],
  glassOpacity: 0.55,
};

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Returns the interpolated RGB color at a given distance from the cursor.
 * distance=0 → nearColor, distance=maxDist → farColor.
 */
export function getGradientColor(
  distance: number,
  maxDistance: number,
  nearColor: RGB,
  farColor: RGB
): RGB {
  const t = clamp(distance / maxDistance, 0, 1);
  return [
    Math.round(lerp(nearColor[0], farColor[0], t)),
    Math.round(lerp(nearColor[1], farColor[1], t)),
    Math.round(lerp(nearColor[2], farColor[2], t)),
  ];
}

export function rgbToString(c: RGB, alpha = 1): string {
  return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
}

export function rgbToHex(c: RGB): string {
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}
