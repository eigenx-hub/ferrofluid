export interface FluidRegion {
  x: number; // canvas px: left edge of fluid inner region
  y: number; // canvas px: top edge (at 100% fill)
  w: number; // canvas px: width
  h: number; // canvas px: height
}

export interface ContainerDef {
  readonly id: string;
  readonly label: string;

  /**
   * Returns normalized x-positions [0,1] for N sample points.
   * Pure function — no DOM, fully testable.
   */
  getSampleXPositions(count: number): number[];

  /**
   * The inner fluid volume in canvas pixels.
   * Fill level determines where the calm surface sits within this region.
   */
  getFluidRegion(canvasW: number, canvasH: number): FluidRegion;

  /** Draws the container silhouette on ctx. */
  drawOutline(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number): void;
}

/** Shared helper: evenly spaced x-positions in [0,1]. */
export function evenSpacing(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0.5];
  return Array.from({ length: count }, (_, i) => i / (count - 1));
}
