import { ContainerDef, FluidRegion, evenSpacing } from './types';

/**
 * Klein bottle: rendered as its classic 3D-projected cross-section.
 * The self-intersecting tube passes through itself; fluid pools in the
 * visible lower basin. The upper loop is drawn "through" the lower tube
 * using dashed lines to indicate it passes behind.
 */
export const kleinBottle: ContainerDef = {
  id: 'kleinBottle',
  label: 'Klein Bottle',

  getSampleXPositions: (count) => evenSpacing(count),

  getFluidRegion(cW, cH): FluidRegion {
    const w = Math.min(cW * 0.38, 210);
    const h = cH * 0.26;
    const x = (cW - w) / 2;
    const y = cH * 0.6;
    return { x, y, w, h };
  },

  drawOutline(ctx, cW, cH) {
    const r = this.getFluidRegion(cW, cH);
    const cx = r.x + r.w / 2;
    const basinTop = r.y;
    const basinBot = r.y + r.h;

    // Tube radius for drawing
    const tubeW = r.w * 0.38;
    const tubeH = r.h * 0.7;

    // Upper loop top center
    const loopCY = r.y - r.h * 1.1;
    const loopRX = r.w * 0.38;
    const loopRY = r.h * 0.55;

    ctx.save();
    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.lineWidth = 2;

    // --- Lower basin (fluid lives here) ---
    ctx.beginPath();
    ctx.moveTo(r.x, basinBot);
    ctx.lineTo(r.x + r.w, basinBot);
    ctx.lineTo(r.x + r.w, basinTop);
    // Right side curves inward to tube
    ctx.bezierCurveTo(
      r.x + r.w, basinTop - 10,
      cx + tubeW / 2, basinTop - 20,
      cx + tubeW / 2, basinTop - 30
    );
    ctx.moveTo(cx - tubeW / 2, basinTop - 30);
    ctx.bezierCurveTo(
      cx - tubeW / 2, basinTop - 20,
      r.x, basinTop - 10,
      r.x, basinTop
    );
    ctx.stroke();

    // --- Tube rising from basin ---
    ctx.beginPath();
    ctx.moveTo(cx - tubeW / 2, basinTop - 30);
    ctx.lineTo(cx - tubeW / 2, loopCY + loopRY);
    ctx.moveTo(cx + tubeW / 2, basinTop - 30);
    ctx.lineTo(cx + tubeW / 2, loopCY + loopRY);
    ctx.stroke();

    // --- Upper loop (ellipse) ---
    ctx.beginPath();
    ctx.ellipse(cx, loopCY, loopRX, loopRY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // --- Self-intersection (tube passes through loop — dashed) ---
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(160,210,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(cx - tubeW / 2, loopCY - loopRY * 0.15);
    ctx.lineTo(cx - tubeW / 2, loopCY + loopRY * 0.15);
    ctx.moveTo(cx + tubeW / 2, loopCY - loopRY * 0.15);
    ctx.lineTo(cx + tubeW / 2, loopCY + loopRY * 0.15);
    ctx.stroke();
    ctx.restore();

    // Sheen on basin
    ctx.beginPath();
    ctx.moveTo(r.x + 6, basinTop + 8);
    ctx.lineTo(r.x + 6, basinBot - 12);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  },
};
