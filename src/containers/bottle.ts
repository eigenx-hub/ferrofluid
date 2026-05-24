import { ContainerDef, FluidRegion, evenSpacing } from './types';

export const bottle: ContainerDef = {
  id: 'bottle',
  label: 'Glass Bottle',

  getSampleXPositions: (count) => evenSpacing(count),

  getFluidRegion(cW, cH): FluidRegion {
    const bodyW = Math.min(cW * 0.38, 220);
    const bodyH = cH * 0.62;
    const x = (cW - bodyW) / 2;
    const y = cH * 0.22;
    return { x, y, w: bodyW, h: bodyH };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const neckW = r.w * 0.35;
    const neckH = r.h * 0.18;
    const neckX = r.x + (r.w - neckW) / 2;
    const shoulder = 24;

    ctx.save();
    ctx.beginPath();
    // Bottom
    ctx.moveTo(r.x, r.y + r.h);
    ctx.lineTo(r.x + r.w, r.y + r.h);
    // Right body → shoulder → neck
    ctx.lineTo(r.x + r.w, r.y + neckH + shoulder);
    ctx.quadraticCurveTo(r.x + r.w, r.y + neckH, neckX + neckW, r.y + neckH);
    ctx.lineTo(neckX + neckW, r.y - 12); // mouth
    ctx.lineTo(neckX, r.y - 12);
    ctx.lineTo(neckX, r.y + neckH);
    ctx.quadraticCurveTo(r.x, r.y + neckH, r.x, r.y + neckH + shoulder);
    ctx.lineTo(r.x, r.y + r.h);
    ctx.closePath();

    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glass sheen
    ctx.beginPath();
    ctx.moveTo(r.x + 8, r.y + neckH + shoulder + 10);
    ctx.lineTo(r.x + 8, r.y + r.h - 20);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  },
};
