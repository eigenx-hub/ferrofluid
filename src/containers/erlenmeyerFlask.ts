import { ContainerDef, FluidRegion, evenSpacing } from './types';

export const erlenmeyerFlask: ContainerDef = {
  id: 'erlenmeyerFlask',
  label: 'Erlenmeyer Flask',

  getSampleXPositions: (count) => evenSpacing(count),

  getFluidRegion(cW, cH): FluidRegion {
    const w = Math.min(cW * 0.46, 260);
    const h = cH * 0.55;
    const x = (cW - w) / 2;
    const y = cH * 0.25;
    return { x, y, w, h };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const neckW = r.w * 0.28;
    const neckH = r.h * 0.3;
    const neckX = r.x + (r.w - neckW) / 2;
    const cx = r.x + r.w / 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + r.h);
    ctx.lineTo(r.x + r.w, r.y + r.h);
    // Tapered sides converge to neck
    ctx.quadraticCurveTo(r.x + r.w, r.y + r.h * 0.4, neckX + neckW, r.y + neckH);
    ctx.lineTo(neckX + neckW, r.y);
    ctx.lineTo(neckX, r.y);
    ctx.lineTo(neckX, r.y + neckH);
    ctx.quadraticCurveTo(r.x, r.y + r.h * 0.4, r.x, r.y + r.h);
    ctx.closePath();

    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center sheen
    ctx.beginPath();
    ctx.moveTo(cx - 4, r.y + neckH + 10);
    ctx.lineTo(cx - 10, r.y + r.h - 20);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  },
};
