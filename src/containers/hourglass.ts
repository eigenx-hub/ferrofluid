import { ContainerDef, FluidRegion } from './types';

/** Two circles touching at center — figure-8 shape from above. */
function hourglassMask(N: number): Uint8Array {
  const mask = new Uint8Array(N * N);
  const r = 0.26;
  const topCY = 0.27, botCY = 0.73;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1) - 0.5;
      const y = j / (N - 1);
      const inTop = x * x + (y - topCY) * (y - topCY) <= r * r;
      const inBot = x * x + (y - botCY) * (y - botCY) <= r * r;
      if (inTop || inBot) mask[j * N + i] = 1;
    }
  }
  return mask;
}

export const hourglass: ContainerDef = {
  id: 'hourglass',
  label: 'Hourglass',

  getMask: hourglassMask,

  getFluidRegion(cW, cH): FluidRegion {
    const size = Math.min(cW * 0.55, cH * 0.82, 460);
    return { x: (cW - size) / 2, y: (cH - size) / 2, w: size, h: size };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const cx = r.x + r.w / 2;
    const rad = r.w * 0.26;
    const topCY = r.y + r.h * 0.27;
    const botCY = r.y + r.h * 0.73;
    ctx.save();
    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, topCY, rad + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, botCY, rad + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
