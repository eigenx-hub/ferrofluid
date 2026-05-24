import { ContainerDef, FluidRegion, circleMask } from './types';

export const beaker: ContainerDef = {
  id: 'beaker',
  label: 'Beaker',

  getMask: (N) => circleMask(N, 0.46),

  getFluidRegion(cW, cH): FluidRegion {
    const size = Math.min(cW * 0.62, cH * 0.68, 440);
    return { x: (cW - size) / 2, y: (cH - size) / 2, w: size, h: size };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = r.w / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rad + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Graduation marks at 3, 6, 9 o'clock
    for (let a = 0; a < 3; a++) {
      const angle = (a / 3) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * (rad + 8), cy + Math.sin(angle) * (rad + 8));
      ctx.lineTo(cx + Math.cos(angle) * (rad + 16), cy + Math.sin(angle) * (rad + 16));
      ctx.strokeStyle = 'rgba(160,210,255,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  },
};
