import { ContainerDef, FluidRegion, evenSpacing } from './types';

export const testTube: ContainerDef = {
  id: 'testTube',
  label: 'Test Tube',

  getSampleXPositions: (count) => evenSpacing(count),

  getFluidRegion(cW, cH): FluidRegion {
    const w = Math.min(cW * 0.16, 80);
    const h = cH * 0.68;
    const x = (cW - w) / 2;
    const y = cH * 0.1;
    return { x, y, w, h };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const rad = r.w / 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x, r.y + r.h - rad);
    ctx.arc(r.x + rad, r.y + r.h - rad, rad, Math.PI, 0, false);
    ctx.lineTo(r.x + r.w, r.y);

    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sheen
    ctx.beginPath();
    ctx.moveTo(r.x + 5, r.y + 10);
    ctx.lineTo(r.x + 5, r.y + r.h - rad - 10);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  },
};
