import { ContainerDef, FluidRegion, evenSpacing } from './types';

export const petriDish: ContainerDef = {
  id: 'petriDish',
  label: 'Petri Dish',

  getSampleXPositions: (count) => evenSpacing(count),

  getFluidRegion(cW, cH): FluidRegion {
    const w = Math.min(cW * 0.72, 480);
    const h = cH * 0.18;
    const x = (cW - w) / 2;
    const y = cH * 0.55;
    return { x, y, w, h };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const rim = 6;
    ctx.save();

    // Dish base
    ctx.beginPath();
    ctx.rect(r.x - rim, r.y - rim, r.w + rim * 2, r.h + rim * 2);
    ctx.strokeStyle = 'rgba(160,210,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner wall line
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  },
};
