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
    physics: { fieldStrength: 0.22, viscosity: 1.2, surfaceTension: 3.5, gravity: 5, magnetDepth: 0.28 },
    colors: {
      nearColor: [70, 70, 80],
      farColor: [4, 4, 8],
      bgColor: [8, 8, 12],
      glassTint: [160, 210, 255],
      glassOpacity: 0.55,
    },
  },
  {
    label: 'Ocean',
    physics: { fieldStrength: 0.18, viscosity: 1.0, surfaceTension: 3.0, gravity: 4, magnetDepth: 0.32 },
    colors: {
      nearColor: [0, 210, 255],
      farColor: [0, 18, 55],
      bgColor: [2, 10, 28],
      glassTint: [100, 200, 255],
      glassOpacity: 0.5,
    },
  },
  {
    label: 'Lava',
    physics: { fieldStrength: 0.28, viscosity: 1.8, surfaceTension: 4.5, gravity: 6, magnetDepth: 0.22 },
    colors: {
      nearColor: [255, 130, 10],
      farColor: [18, 3, 0],
      bgColor: [10, 4, 2],
      glassTint: [255, 100, 30],
      glassOpacity: 0.4,
    },
  },
  {
    label: 'Neon',
    physics: { fieldStrength: 0.20, viscosity: 0.9, surfaceTension: 2.8, gravity: 4, magnetDepth: 0.30 },
    colors: {
      nearColor: [0, 255, 140],
      farColor: [50, 0, 100],
      bgColor: [5, 0, 14],
      glassTint: [180, 100, 255],
      glassOpacity: 0.5,
    },
  },
  {
    label: 'Phantom',
    physics: { fieldStrength: 0.24, viscosity: 1.4, surfaceTension: 3.8, gravity: 5, magnetDepth: 0.26 },
    colors: {
      nearColor: [0, 210, 200],
      farColor: [25, 0, 55],
      bgColor: [4, 2, 12],
      glassTint: [140, 100, 200],
      glassOpacity: 0.5,
    },
  },
];
