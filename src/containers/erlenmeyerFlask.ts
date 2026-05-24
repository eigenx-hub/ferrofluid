import { ContainerDef, FluidRegion, ellipseMask } from './types';

export const erlenmeyerFlask: ContainerDef = {
  id: 'erlenmeyerFlask',
  label: 'Erlenmeyer Flask',

  // Top-down: wide oval base
  getMask: (N) => ellipseMask(N, 0.47, 0.42),

  getFluidRegion(cW, cH): FluidRegion {
    const w = Math.min(cW * 0.62, 440);
    const h = w * 0.9;
    return { x: (cW - w) / 2, y: (cH - h) / 2, w, h };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, r.w / 2 + 4, r.h / 2 + 4, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  },
};
