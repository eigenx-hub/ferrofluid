import { ContainerDef, FluidRegion } from './types';

/**
 * Klein bottle top-down: the projected cross-section looks like a circle
 * with a smaller interior circle connected by a channel — fluid can be
 * "inside" the outer ring and the inner pocket simultaneously.
 */
function kleinMask(N: number): Uint8Array {
  const mask = new Uint8Array(N * N);
  const outerR = 0.46;
  const innerR = 0.18;
  const channelW = 0.06;

  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1) - 0.5;
      const y = j / (N - 1) - 0.5;
      const dist = Math.sqrt(x * x + y * y);
      // Annular ring
      const inRing = dist >= innerR + channelW && dist <= outerR;
      // Inner pocket
      const inPocket = dist <= innerR;
      // Channel connecting inner to outer (vertical strip on right side)
      const inChannel = x >= 0.12 && Math.abs(y) <= channelW && dist <= outerR;
      if (inRing || inPocket || inChannel) mask[j * N + i] = 1;
    }
  }
  return mask;
}

export const kleinBottle: ContainerDef = {
  id: 'kleinBottle',
  label: 'Klein Bottle',

  getMask: kleinMask,

  getFluidRegion(cW, cH): FluidRegion {
    const size = Math.min(cW * 0.62, cH * 0.72, 440);
    return { x: (cW - size) / 2, y: (cH - size) / 2, w: size, h: size };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const outerRad = r.w * 0.46;
    const innerRad = r.w * 0.18;

    ctx.save();
    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2;
    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerRad + 4, 0, Math.PI * 2);
    ctx.stroke();
    // Inner pocket ring
    ctx.beginPath();
    ctx.arc(cx, cy, innerRad + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(160,210,255,0.35)';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },
};
