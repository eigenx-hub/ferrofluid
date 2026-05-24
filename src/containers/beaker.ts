import { ContainerDef, FluidRegion, evenSpacing } from './types';

export const beaker: ContainerDef = {
  id: 'beaker',
  label: 'Beaker',

  getSampleXPositions: (count) => evenSpacing(count),

  getFluidRegion(cW, cH): FluidRegion {
    const w = Math.min(cW * 0.45, 260);
    const h = cH * 0.6;
    const x = (cW - w) / 2;
    const y = cH * 0.2;
    return { x, y, w, h };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const spoutW = 20;
    const spoutH = 12;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + r.h);
    ctx.lineTo(r.x + r.w, r.y + r.h);
    ctx.lineTo(r.x + r.w, r.y);
    // Spout notch on right
    ctx.lineTo(r.x + r.w + spoutW, r.y - spoutH);
    ctx.lineTo(r.x + r.w, r.y - spoutH * 0.6);
    ctx.lineTo(r.x, r.y);
    ctx.lineTo(r.x, r.y + r.h);
    ctx.closePath();

    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Graduation marks
    for (let i = 1; i <= 4; i++) {
      const gy = r.y + r.h * (i / 5);
      ctx.beginPath();
      ctx.moveTo(r.x + r.w - 14, gy);
      ctx.lineTo(r.x + r.w, gy);
      ctx.strokeStyle = 'rgba(160,210,255,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  },
};
