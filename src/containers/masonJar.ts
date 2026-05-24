import { ContainerDef, FluidRegion, circleMask } from './types';

export const masonJar: ContainerDef = {
  id: 'masonJar',
  label: 'Mason Jar',

  getMask: (N) => circleMask(N, 0.45),

  getFluidRegion(cW, cH): FluidRegion {
    const size = Math.min(cW * 0.60, cH * 0.68, 420);
    return { x: (cW - size) / 2, y: (cH - size) / 2, w: size, h: size };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = r.w / 2;
    ctx.save();
    // Main rim
    ctx.beginPath();
    ctx.arc(cx, cy, rad + 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(160,210,255,0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Lid ring
    ctx.beginPath();
    ctx.arc(cx, cy, rad + 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(160,210,255,0.25)';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  },
};
