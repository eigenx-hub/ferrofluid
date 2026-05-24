export interface FluidRegion {
  x: number; // canvas px: left edge of fluid region
  y: number; // canvas px: top edge
  w: number; // canvas px: width
  h: number; // canvas px: height (= w for square grid)
}

export interface ContainerDef {
  readonly id: string;
  readonly label: string;

  /**
   * Returns a Uint8Array of size N*N where 1 = inside container, 0 = outside.
   * Used by physics to constrain forces and by renderer to clip drawing.
   * Pure function — no DOM, fully testable.
   */
  getMask(N: number): Uint8Array;

  /** The square canvas region where the fluid grid is drawn. */
  getFluidRegion(canvasW: number, canvasH: number): FluidRegion;

  /** Draws the container outline (rim, walls) on ctx. */
  drawOutline(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number): void;
}

/** Fills a circle mask centered at (0.5, 0.5) with given normalized radius. */
export function circleMask(N: number, radius = 0.48): Uint8Array {
  const mask = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1) - 0.5;
      const y = j / (N - 1) - 0.5;
      if (x * x + y * y <= radius * radius) mask[j * N + i] = 1;
    }
  }
  return mask;
}

/** Fills an ellipse mask centered at (0.5, 0.5). */
export function ellipseMask(N: number, rx: number, ry: number): Uint8Array {
  const mask = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = (i / (N - 1) - 0.5) / rx;
      const y = (j / (N - 1) - 0.5) / ry;
      if (x * x + y * y <= 1) mask[j * N + i] = 1;
    }
  }
  return mask;
}

/** Fills a rectangle mask. x0,y0,x1,y1 in normalized [0,1]. */
export function rectMask(N: number, x0 = 0.05, y0 = 0.05, x1 = 0.95, y1 = 0.95): Uint8Array {
  const mask = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const y = j / (N - 1);
      if (x >= x0 && x <= x1 && y >= y0 && y <= y1) mask[j * N + i] = 1;
    }
  }
  return mask;
}
