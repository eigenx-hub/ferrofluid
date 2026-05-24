import { ContainerDef, FluidRegion, evenSpacing } from './types';

export const masonJar: ContainerDef = {
  id: 'masonJar',
  label: 'Mason Jar',

  getSampleXPositions: (count) => evenSpacing(count),

  getFluidRegion(cW, cH): FluidRegion {
    const w = Math.min(cW * 0.42, 240);
    const h = cH * 0.58;
    const x = (cW - w) / 2;
    const y = cH * 0.22;
    return { x, y, w, h };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const lidH = 18;
    const neckInset = 10;

    ctx.save();
    // Body
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + r.h);
    ctx.lineTo(r.x + r.w, r.y + r.h);
    ctx.lineTo(r.x + r.w, r.y + lidH);
    ctx.lineTo(r.x + r.w - neckInset, r.y + lidH);
    ctx.lineTo(r.x + r.w - neckInset, r.y);
    ctx.lineTo(r.x + neckInset, r.y);
    ctx.lineTo(r.x + neckInset, r.y + lidH);
    ctx.lineTo(r.x, r.y + lidH);
    ctx.lineTo(r.x, r.y + r.h);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(160,210,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lid band
    ctx.beginPath();
    ctx.rect(r.x - 4, r.y - 4, r.w + 8, lidH + 4);
    ctx.strokeStyle = 'rgba(160,210,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Horizontal ridges
    for (let i = 1; i <= 3; i++) {
      const ry = r.y + lidH + r.h * (i / 4);
      ctx.beginPath();
      ctx.moveTo(r.x, ry);
      ctx.lineTo(r.x + r.w, ry);
      ctx.strokeStyle = 'rgba(160,210,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  },
};
