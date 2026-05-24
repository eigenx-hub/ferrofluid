import { ContainerDef, FluidRegion, ellipseMask } from './types';

export const testTube: ContainerDef = {
  id: 'testTube',
  label: 'Test Tube',

  // Very narrow, tall — top-down is a tiny ellipse
  getMask: (N) => ellipseMask(N, 0.22, 0.46),

  getFluidRegion(cW, cH): FluidRegion {
    const w = Math.min(cW * 0.3, 200);
    const h = Math.min(cH * 0.72, 480);
    return { x: (cW - w) / 2, y: (cH - h) / 2, w, h };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, r.w / 2 + 4, r.h / 2 + 4, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  },
};
