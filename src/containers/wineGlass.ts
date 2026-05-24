import { ContainerDef, FluidRegion, circleMask } from './types';

export const wineGlass: ContainerDef = {
  id: 'wineGlass',
  label: 'Wine Glass',

  getMask: (N) => circleMask(N, 0.46),

  getFluidRegion(cW, cH): FluidRegion {
    const size = Math.min(cW * 0.55, cH * 0.65, 400);
    return { x: (cW - size) / 2, y: (cH - size) / 2, w: size, h: size };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = r.w / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rad + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Curved inner sheen (top-down bowl highlight)
    ctx.beginPath();
    ctx.arc(cx - rad * 0.25, cy - rad * 0.25, rad * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  },
};
