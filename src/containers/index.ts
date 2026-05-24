import { bottle } from './bottle';
import { petriDish } from './petriDish';
import { beaker } from './beaker';
import { erlenmeyerFlask } from './erlenmeyerFlask';
import { testTube } from './testTube';
import { masonJar } from './masonJar';
import { wineGlass } from './wineGlass';
import { hourglass } from './hourglass';
import { kleinBottle } from './kleinBottle';
import { openPool } from './openPool';
import type { ContainerDef } from './types';

export type { ContainerDef, FluidRegion } from './types';

export const CONTAINERS: ContainerDef[] = [
  bottle,
  petriDish,
  beaker,
  erlenmeyerFlask,
  testTube,
  masonJar,
  wineGlass,
  hourglass,
  kleinBottle,
  openPool,
];

export {
  bottle,
  petriDish,
  beaker,
  erlenmeyerFlask,
  testTube,
  masonJar,
  wineGlass,
  hourglass,
  kleinBottle,
  openPool,
};
