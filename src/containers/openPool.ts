import { ContainerDef, FluidRegion, rectMask } from './types';

export const openPool: ContainerDef = {
  id: 'openPool',
  label: 'Open Pool',

  getMask: (N) => rectMask(N, 0.02, 0.02, 0.98, 0.98),

  getFluidRegion(cW, cH): FluidRegion {
    const pad = 50;
    return { x: pad, y: pad, w: cW - pad * 2, h: cH - pad * 2 };
  },

  drawOutline(_ctx, _cW, _cH) {},
};
