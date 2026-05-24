import { ContainerDef, FluidRegion, rectMask } from './types';

export const openPool: ContainerDef = {
  id: 'openPool',
  label: 'Open Pool',

  getMask: (N) => rectMask(N, 0.0, 0.0, 1.0, 1.0),

  getFluidRegion(canvasW, canvasH): FluidRegion {
    const pad = 20;
    return { x: pad, y: pad, w: canvasW - pad * 2, h: canvasH - pad * 2 };
  },

  drawOutline(_ctx, _cW, _cH) {},
};
