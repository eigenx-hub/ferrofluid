import { ContainerDef, FluidRegion, circleMask } from './types';

export const bottle: ContainerDef = {
  id: 'bottle',
  label: 'Glass Bottle',

  getMask: (N) => circleMask(N, 0.47),

  getFluidRegion(cW, cH): FluidRegion {
    const size = Math.min(cW * 0.58, cH * 0.72, 420);
    return { x: (cW - size) / 2, y: (cH - size) / 2, w: size, h: size };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = r.w / 2;
    ctx.save();
    // Outer rim
    ctx.beginPath();
    ctx.arc(cx, cy, rad + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Inner glass reflection arc
    ctx.beginPath();
    ctx.arc(cx, cy, rad - 6, Math.PI * 1.1, Math.PI * 1.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  },
};
