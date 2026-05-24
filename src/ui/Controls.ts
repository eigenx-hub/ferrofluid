import { PhysicsConfig } from '../physics/types';
import { ColorConfig, hexToRgb, rgbToHex } from '../rendering/colors';
import { PRESETS } from './Presets';

interface AppState {
  physicsConfig: PhysicsConfig;
  colorConfig: ColorConfig;
  mode: 'attract' | 'repel';
}

type OnChange = (state: AppState) => void;

function slider(
  label: string,
  min: number,
  max: number,
  value: number,
  step: number,
  onChange: (v: number) => void
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'control-row';
  const lbl = document.createElement('label');
  const span = document.createElement('span');
  const decimals = step < 0.01 ? 3 : step < 1 ? 2 : 0;
  span.textContent = value.toFixed(decimals);
  lbl.textContent = label + ' ';
  lbl.appendChild(span);
  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.addEventListener('input', () => {
    const v = parseFloat(input.value);
    span.textContent = v.toFixed(decimals);
    onChange(v);
  });
  row.appendChild(lbl);
  row.appendChild(input);
  return row;
}

function colorPicker(
  label: string,
  value: [number, number, number],
  onChange: (c: [number, number, number]) => void
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'color-row';
  const input = document.createElement('input');
  input.type = 'color';
  input.value = rgbToHex(value);
  input.addEventListener('input', () => onChange(hexToRgb(input.value)));
  const lbl = document.createElement('span');
  lbl.textContent = label;
  row.appendChild(input);
  row.appendChild(lbl);
  return row;
}

function section(title: string): HTMLElement {
  const el = document.createElement('div');
  const lbl = document.createElement('div');
  lbl.className = 'section-label';
  lbl.textContent = title;
  el.appendChild(lbl);
  return el;
}

export function buildControls(sidebar: HTMLElement, initial: AppState, onChange: OnChange): void {
  let state: AppState = { ...initial };
  const emit = () => onChange({ ...state });

  const h1 = document.createElement('h1');
  h1.textContent = 'Ferrofluid';
  sidebar.appendChild(h1);

  // Mode
  const modeSection = section('Magnet Mode');
  const toggleRow = document.createElement('div');
  toggleRow.className = 'toggle-row';
  const attractBtn = document.createElement('button');
  attractBtn.className = 'toggle-btn active';
  attractBtn.textContent = 'Attract (A)';
  const repelBtn = document.createElement('button');
  repelBtn.className = 'toggle-btn';
  repelBtn.textContent = 'Repel (R)';
  attractBtn.addEventListener('click', () => {
    state = { ...state, mode: 'attract' };
    attractBtn.classList.add('active'); repelBtn.classList.remove('active'); emit();
  });
  repelBtn.addEventListener('click', () => {
    state = { ...state, mode: 'repel' };
    repelBtn.classList.add('active'); attractBtn.classList.remove('active'); emit();
  });
  toggleRow.appendChild(attractBtn);
  toggleRow.appendChild(repelBtn);
  modeSection.appendChild(toggleRow);
  sidebar.appendChild(modeSection);

  // Magnet
  const magnetSection = section('Magnet');
  magnetSection.appendChild(slider('Field Strength', 0.02, 0.6, state.physicsConfig.fieldStrength, 0.01, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, fieldStrength: v } }; emit();
  }));
  magnetSection.appendChild(slider('Depth Behind Fluid', 0.05, 0.8, state.physicsConfig.magnetDepth, 0.01, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, magnetDepth: v } }; emit();
  }));
  sidebar.appendChild(magnetSection);

  // Fluid
  const fluidSection = section('Fluid');
  fluidSection.appendChild(slider('Viscosity', 0.1, 8, state.physicsConfig.viscosity, 0.1, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, viscosity: v } }; emit();
  }));
  fluidSection.appendChild(slider('Surface Tension', 0.2, 10, state.physicsConfig.surfaceTension, 0.1, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, surfaceTension: v } }; emit();
  }));
  fluidSection.appendChild(slider('Gravity', 0.5, 20, state.physicsConfig.gravity, 0.5, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, gravity: v } }; emit();
  }));
  fluidSection.appendChild(slider('Fill Level', 0.05, 0.75, state.physicsConfig.fillLevel, 0.01, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, fillLevel: v } }; emit();
  }));
  fluidSection.appendChild(slider('Grid Resolution', 48, 160, state.physicsConfig.gridSize, 16, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, gridSize: Math.round(v) } }; emit();
  }));
  sidebar.appendChild(fluidSection);

  // Colors
  const colorSection = section('Colors');
  colorSection.appendChild(colorPicker('Spike tips', state.colorConfig.nearColor, (c) => {
    state = { ...state, colorConfig: { ...state.colorConfig, nearColor: c } }; emit();
  }));
  colorSection.appendChild(colorPicker('Fluid base', state.colorConfig.farColor, (c) => {
    state = { ...state, colorConfig: { ...state.colorConfig, farColor: c } }; emit();
  }));
  colorSection.appendChild(colorPicker('Background', state.colorConfig.bgColor, (c) => {
    state = { ...state, colorConfig: { ...state.colorConfig, bgColor: c } }; emit();
  }));
  sidebar.appendChild(colorSection);

  // Presets
  const presetSection = section('Presets');
  const grid = document.createElement('div');
  grid.className = 'preset-grid';
  PRESETS.forEach((p) => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = p.label;
    btn.addEventListener('click', () => {
      state = { ...state, physicsConfig: { ...state.physicsConfig, ...p.physics }, colorConfig: p.colors };
      emit();
    });
    grid.appendChild(btn);
  });
  presetSection.appendChild(grid);
  sidebar.appendChild(presetSection);
}
