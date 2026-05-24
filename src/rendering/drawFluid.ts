import { PhysicsState } from '../physics/types';
import { FluidRegion } from '../containers/types';
import { ColorConfig } from './colors';

// Light direction — upper-left, angled down. Normalized.
const LX = 0.35, LY = -0.55, LZ = 0.76;
const L_LEN = Math.sqrt(LX * LX + LY * LY + LZ * LZ);
const lightX = LX / L_LEN, lightY = LY / L_LEN, lightZ = LZ / L_LEN;

let offscreen: HTMLCanvasElement | null = null;
let offCtx: CanvasRenderingContext2D | null = null;

function getOffscreen(N: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  if (!offscreen) {
    offscreen = document.createElement('canvas');
    offCtx = offscreen.getContext('2d')!;
  }
  if (offscreen.width !== N || offscreen.height !== N) {
    offscreen.width = N;
    offscreen.height = N;
  }
  return [offscreen, offCtx!];
}

/**
 * Renders the 2D ferrofluid height field using normal-map shading.
 *
 * Steps:
 *  1. For each grid cell, compute surface normal from finite differences.
 *  2. Apply Phong lighting (ambient + diffuse + specular).
 *  3. Base color comes from the height-based gradient.
 *  4. Write to an N×N ImageData, then scale to the fluid region on the main canvas.
 */
export function drawFluid(
  ctx: CanvasRenderingContext2D,
  state: PhysicsState,
  region: FluidRegion,
  colors: ColorConfig
): void {
  const { heights, mask, gridSize, restHeight } = state;
  const N = gridSize;
  const [off, oCtx] = getOffscreen(N);

  const imgData = oCtx.createImageData(N, N);
  const data = imgData.data;

  const { nearColor, farColor } = colors;
  // heightScale controls how "tall" the normals appear — higher = sharper spikes
  const heightScale = 12;
  const specPow = 28;
  const ambient = 0.12;

  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const idx = j * N + i;
      const pixBase = idx * 4;

      if (!mask[idx]) {
        data[pixBase + 3] = 0; // transparent outside container
        continue;
      }

      const h = heights[idx]!;

      // Height-based gradient: spike tip → nearColor, flat fluid → farColor
      const t = Math.max(0, 1 - h / Math.max(restHeight * 1.6, 0.01));
      const baseR = nearColor[0] + (farColor[0] - nearColor[0]) * t;
      const baseG = nearColor[1] + (farColor[1] - nearColor[1]) * t;
      const baseB = nearColor[2] + (farColor[2] - nearColor[2]) * t;

      // Surface normal via central differences (Neumann BC: same h outside mask)
      const il = Math.max(0, i - 1), ir = Math.min(N - 1, i + 1);
      const jt = Math.max(0, j - 1), jb = Math.min(N - 1, j + 1);
      const hl = mask[j * N + il] ? heights[j * N + il]! : h;
      const hr = mask[j * N + ir] ? heights[j * N + ir]! : h;
      const ht = mask[jt * N + i] ? heights[jt * N + i]! : h;
      const hb = mask[jb * N + i] ? heights[jb * N + i]! : h;

      const nx = -(hr - hl) * heightScale;
      const ny = -(hb - ht) * heightScale;
      const nz = 1.0;
      const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const nnx = nx / nLen, nny = ny / nLen, nnz = nz / nLen;

      // Diffuse
      const diffuse = Math.max(0, nnx * lightX + nny * lightY + nnz * lightZ);

      // Phong specular — view direction is (0, 0, 1)
      const dotNL = nnx * lightX + nny * lightY + nnz * lightZ;
      const rz = 2 * dotNL * nnz - lightZ;
      const specular = Math.pow(Math.max(0, rz), specPow);

      const brightness = ambient + diffuse * 0.7;

      data[pixBase + 0] = Math.min(255, baseR * brightness + specular * 255) | 0;
      data[pixBase + 1] = Math.min(255, baseG * brightness + specular * 245) | 0;
      data[pixBase + 2] = Math.min(255, baseB * brightness + specular * 255) | 0;
      data[pixBase + 3] = 255;
    }
  }

  oCtx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(off, region.x, region.y, region.w, region.h);
  ctx.restore();
}
