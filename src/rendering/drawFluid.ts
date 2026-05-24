import { PhysicsState } from '../physics/types';
import { FluidRegion } from '../containers/types';
import { ColorConfig, rgbToString } from './colors';

/**
 * Draws the fluid body and spike surface into ctx.
 * Uses a radial gradient anchored to the cursor for distance-based coloring.
 */
export function drawFluid(
  ctx: CanvasRenderingContext2D,
  state: PhysicsState,
  region: FluidRegion,
  colors: ColorConfig
): void {
  const { heights, cursor } = state;
  const n = heights.length;
  if (n === 0) return;

  // Canvas coords for each surface sample point
  const pts: { x: number; y: number }[] = Array.from({ length: n }, (_, i) => ({
    x: region.x + (n === 1 ? 0.5 : i / (n - 1)) * region.w,
    y: region.y + region.h * (1 - heights[i]!),
  }));

  // Build smooth surface path using quadratic bezier midpoints
  ctx.save();

  // Clip to fluid region so spikes never overflow the container
  ctx.beginPath();
  ctx.rect(region.x, region.y, region.w, region.h);
  ctx.clip();

  // Radial gradient centered on cursor (or region center when no cursor)
  const cursorCanvasX = cursor
    ? region.x + cursor.x * region.w
    : region.x + region.w / 2;
  const cursorCanvasY = cursor
    ? region.y + region.h * (1 - cursor.y)
    : region.y + region.h * 0.5;
  const maxRadius = Math.sqrt(region.w ** 2 + region.h ** 2);
  const grad = ctx.createRadialGradient(
    cursorCanvasX, cursorCanvasY, 0,
    cursorCanvasX, cursorCanvasY, maxRadius
  );
  grad.addColorStop(0, rgbToString(colors.nearColor, 1));
  grad.addColorStop(1, rgbToString(colors.farColor, 1));

  // Surface path
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 0; i < n - 1; i++) {
    const mid = { x: (pts[i]!.x + pts[i + 1]!.x) / 2, y: (pts[i]!.y + pts[i + 1]!.y) / 2 };
    ctx.quadraticCurveTo(pts[i]!.x, pts[i]!.y, mid.x, mid.y);
  }
  ctx.lineTo(pts[n - 1]!.x, pts[n - 1]!.y);

  // Close path along the container bottom
  ctx.lineTo(region.x + region.w, region.y + region.h);
  ctx.lineTo(region.x, region.y + region.h);
  ctx.closePath();

  ctx.fillStyle = grad;
  ctx.fill();

  // Spike tip glow (shadowBlur on a second pass of just the surface line)
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 0; i < n - 1; i++) {
    const mid = { x: (pts[i]!.x + pts[i + 1]!.x) / 2, y: (pts[i]!.y + pts[i + 1]!.y) / 2 };
    ctx.quadraticCurveTo(pts[i]!.x, pts[i]!.y, mid.x, mid.y);
  }
  ctx.lineTo(pts[n - 1]!.x, pts[n - 1]!.y);
  ctx.shadowColor = rgbToString(colors.nearColor, 0.7);
  ctx.shadowBlur = 12;
  ctx.strokeStyle = rgbToString(colors.nearColor, 0.6);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}
