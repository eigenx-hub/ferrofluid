import { PhysicsConfig } from '../physics/types';
import { ColorConfig, hexToRgb, rgbToHex } from '../rendering/colors';
import { ContainerDef, CONTAINERS } from '../containers';
import { PRESETS } from './Presets';

interface AppState {
  physicsConfig: PhysicsConfig;
  colorConfig: ColorConfig;
  container: ContainerDef;
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
  span.textContent = value.toFixed(step < 0.01 ? 3 : step < 1 ? 2 : 0);
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
    span.textContent = v.toFixed(step < 0.01 ? 3 : step < 1 ? 2 : 0);
    onChange(v);
  });
  row.appendChild(lbl);
  row.appendChild(input);
  return row;
}

function colorRow(
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
  attractBtn.textContent = 'Attract';
  const repelBtn = document.createElement('button');
  repelBtn.className = 'toggle-btn';
  repelBtn.textContent = 'Repel';
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

  // Container
  const containerSection = section('Container');
  const sel = document.createElement('select');
  CONTAINERS.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.label;
    if (c.id === state.container.id) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    const found = CONTAINERS.find((c) => c.id === sel.value);
    if (found) { state = { ...state, container: found }; emit(); }
  });
  containerSection.appendChild(sel);
  sidebar.appendChild(containerSection);

  // Physics
  const physSection = section('Physics');
  physSection.appendChild(slider('Field Strength', 0.01, 0.4, state.physicsConfig.fieldStrength, 0.005, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, fieldStrength: v } }; emit();
  }));
  physSection.appendChild(slider('Viscosity', 0.2, 10, state.physicsConfig.viscosity, 0.1, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, viscosity: v } }; emit();
  }));
  physSection.appendChild(slider('Surface Tension', 2, 120, state.physicsConfig.surfaceTension, 2, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, surfaceTension: v } }; emit();
  }));
  physSection.appendChild(slider('Gravity', 1, 30, state.physicsConfig.gravity, 0.5, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, gravity: v } }; emit();
  }));
  physSection.appendChild(slider('Fill Level', 0.05, 0.8, state.physicsConfig.fillLevel, 0.01, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, fillLevel: v } }; emit();
  }));
  physSection.appendChild(slider('Grid Resolution', 32, 128, state.physicsConfig.gridSize, 16, (v) => {
    state = { ...state, physicsConfig: { ...state.physicsConfig, gridSize: Math.round(v) } }; emit();
  }));
  sidebar.appendChild(physSection);

  // Colors
  const colorSection = section('Colors');
  colorSection.appendChild(colorRow('Spike color (near)', state.colorConfig.nearColor, (c) => {
    state = { ...state, colorConfig: { ...state.colorConfig, nearColor: c } }; emit();
  }));
  colorSection.appendChild(colorRow('Base color (far)', state.colorConfig.farColor, (c) => {
    state = { ...state, colorConfig: { ...state.colorConfig, farColor: c } }; emit();
  }));
  colorSection.appendChild(colorRow('Background', state.colorConfig.bgColor, (c) => {
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
