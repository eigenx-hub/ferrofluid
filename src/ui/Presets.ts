import { PhysicsConfig } from '../physics/types';
import { ColorConfig } from '../rendering/colors';

export interface Preset {
  label: string;
  physics: Partial<PhysicsConfig>;
  colors: ColorConfig;
}

export const PRESETS: Preset[] = [
  {
    label: 'Classic Black',
    physics: { fieldStrength: 0.08, viscosity: 2.5, surfaceTension: 80, gravity: 12 },
    colors: {
      nearColor: [80, 80, 90],
      farColor: [5, 5, 8],
      bgColor: [8, 8, 12],
      glassTint: [160, 210, 255],
      glassOpacity: 0.55,
    },
  },
  {
    label: 'Ocean',
    physics: { fieldStrength: 0.07, viscosity: 2.0, surfaceTension: 60, gravity: 10 },
    colors: {
      nearColor: [0, 200, 255],
      farColor: [0, 20, 60],
      bgColor: [2, 10, 28],
      glassTint: [100, 200, 255],
      glassOpacity: 0.5,
    },
  },
  {
    label: 'Lava',
    physics: { fieldStrength: 0.1, viscosity: 3.5, surfaceTension: 40, gravity: 8 },
    colors: {
      nearColor: [255, 120, 10],
      farColor: [20, 4, 0],
      bgColor: [10, 4, 2],
      glassTint: [255, 100, 30],
      glassOpacity: 0.4,
    },
  },
  {
    label: 'Neon',
    physics: { fieldStrength: 0.09, viscosity: 2.0, surfaceTension: 100, gravity: 14 },
    colors: {
      nearColor: [0, 255, 130],
      farColor: [60, 0, 120],
      bgColor: [6, 0, 14],
      glassTint: [180, 100, 255],
      glassOpacity: 0.5,
    },
  },
  {
    label: 'Phantom',
    physics: { fieldStrength: 0.085, viscosity: 2.8, surfaceTension: 70, gravity: 11 },
    colors: {
      nearColor: [0, 200, 200],
      farColor: [30, 0, 60],
      bgColor: [5, 2, 12],
      glassTint: [140, 100, 200],
      glassOpacity: 0.5,
    },
  },
];
