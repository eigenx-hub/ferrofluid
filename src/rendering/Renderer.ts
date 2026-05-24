import { PhysicsState } from '../physics/types';
import { ContainerDef } from '../containers/types';
import { ColorConfig, rgbToString } from './colors';
import { drawFluid } from './drawFluid';

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  get canvas(): HTMLCanvasElement {
    return this.ctx.canvas;
  }

  render(
    state: PhysicsState,
    container: ContainerDef,
    colors: ColorConfig
  ): void {
    const { ctx } = this;
    const { width: cW, height: cH } = ctx.canvas;

    ctx.fillStyle = rgbToString(colors.bgColor);
    ctx.fillRect(0, 0, cW, cH);

    const region = container.getFluidRegion(cW, cH);
    drawFluid(ctx, state, region, colors);
    container.drawOutline(ctx, cW, cH);
  }

  /**
   * Converts canvas mouse position to normalized physics coords [0,1]×[0,1].
   * (0,0) = top-left of fluid region, (1,1) = bottom-right.
   */
  toPhysicsCoords(
    mouseX: number,
    mouseY: number,
    container: ContainerDef
  ): { x: number; y: number } {
    const { width: cW, height: cH } = this.ctx.canvas;
    const r = container.getFluidRegion(cW, cH);
    return {
      x: (mouseX - r.x) / r.w,
      y: (mouseY - r.y) / r.h,
    };
  }

  resize(width: number, height: number): void {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
  }
}
