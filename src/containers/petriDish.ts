import { ContainerDef, FluidRegion, circleMask } from './types';

export const petriDish: ContainerDef = {
  id: 'petriDish',
  label: 'Petri Dish',

  getMask: (N) => circleMask(N, 0.48),

  getFluidRegion(cW, cH): FluidRegion {
    const size = Math.min(cW * 0.78, cH * 0.78, 520);
    return { x: (cW - size) / 2, y: (cH - size) / 2, w: size, h: size };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = r.w / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rad + 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(160,210,255,0.45)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, rad + 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(160,210,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Sheen
    ctx.beginPath();
    ctx.arc(cx, cy, rad - 8, Math.PI * 1.05, Math.PI * 1.55);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  },
};
