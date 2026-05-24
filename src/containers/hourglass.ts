import { ContainerDef, FluidRegion, evenSpacing } from './types';

export const hourglass: ContainerDef = {
  id: 'hourglass',
  label: 'Hourglass',

  getSampleXPositions: (count) => evenSpacing(count),

  // Fluid region covers the bottom chamber only
  getFluidRegion(cW, cH): FluidRegion {
    const w = Math.min(cW * 0.44, 250);
    const h = cH * 0.34;
    const x = (cW - w) / 2;
    const y = cH * 0.52;
    return { x, y, w, h };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const cx = r.x + r.w / 2;
    const midY = r.y;              // center pinch point
    const topY = r.y - r.h;       // top of upper chamber
    const pinchW = 8;

    ctx.save();
    ctx.beginPath();
    // Bottom chamber (where fluid is)
    ctx.moveTo(r.x, r.y + r.h);
    ctx.lineTo(r.x + r.w, r.y + r.h);
    ctx.lineTo(cx + pinchW, midY);
    // Upper chamber (empty)
    ctx.lineTo(r.x + r.w, topY);
    ctx.lineTo(r.x, topY);
    ctx.lineTo(cx - pinchW, midY);
    ctx.lineTo(r.x, r.y + r.h);
    ctx.closePath();

    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pinch sheen
    ctx.beginPath();
    ctx.moveTo(cx - pinchW - 2, midY - 4);
    ctx.lineTo(cx + pinchW + 2, midY - 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  },
};
