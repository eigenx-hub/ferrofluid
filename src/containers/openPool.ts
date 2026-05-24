import { ContainerDef, FluidRegion, evenSpacing } from './types';

export const openPool: ContainerDef = {
  id: 'openPool',
  label: 'Open Pool',

  getSampleXPositions: (count) => evenSpacing(count),

  getFluidRegion(cW, cH): FluidRegion {
    const pad = 60;
    return { x: pad, y: pad, w: cW - pad * 2, h: cH - pad * 2 };
  },

  // No container outline — fluid is unbounded
  drawOutline(_ctx, _cW, _cH) {},
};
