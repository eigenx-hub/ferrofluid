import { ContainerDef, FluidRegion, evenSpacing } from './types';

export const wineGlass: ContainerDef = {
  id: 'wineGlass',
  label: 'Wine Glass',

  getSampleXPositions: (count) => evenSpacing(count),

  getFluidRegion(cW, cH): FluidRegion {
    const w = Math.min(cW * 0.4, 220);
    const h = cH * 0.42;
    const x = (cW - w) / 2;
    const y = cH * 0.12;
    return { x, y, w, h };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const cx = r.x + r.w / 2;
    const stemH = cH * 0.24;
    const stemY = r.y + r.h;
    const baseW = r.w * 0.65;
    const stemW = 6;

    ctx.save();
    // Bowl: curved sides
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.bezierCurveTo(r.x - 10, r.y + r.h * 0.5, r.x, r.y + r.h, cx - stemW / 2, stemY);
    // Stem
    ctx.lineTo(cx - stemW / 2, stemY + stemH);
    // Base
    ctx.lineTo(cx - baseW / 2, stemY + stemH);
    ctx.lineTo(cx - baseW / 2, stemY + stemH + 8);
    ctx.lineTo(cx + baseW / 2, stemY + stemH + 8);
    ctx.lineTo(cx + baseW / 2, stemY + stemH);
    ctx.lineTo(cx + stemW / 2, stemY + stemH);
    // Other side up
    ctx.lineTo(cx + stemW / 2, stemY);
    ctx.bezierCurveTo(r.x + r.w, r.y + r.h, r.x + r.w + 10, r.y + r.h * 0.5, r.x + r.w, r.y);

    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bowl sheen
    ctx.beginPath();
    ctx.moveTo(r.x + 8, r.y + 10);
    ctx.bezierCurveTo(r.x + 4, r.y + r.h * 0.4, r.x + 6, r.y + r.h * 0.7, cx - 8, stemY - 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  },
};
