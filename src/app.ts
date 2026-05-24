import { PhysicsConfig, DEFAULT_CONFIG } from './physics/types';
import { createInitialState, stepPhysics } from './physics/step';
import { PhysicsState } from './physics/types';
import { Renderer } from './rendering/Renderer';
import { ColorConfig, DEFAULT_COLOR_CONFIG } from './rendering/colors';
import { ContainerDef, CONTAINERS } from './containers';
import { buildControls } from './ui/Controls';

const MAX_DT = 1 / 30;

export function startApp(canvas: HTMLCanvasElement, sidebar: HTMLElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  const renderer = new Renderer(ctx);

  let physicsConfig: PhysicsConfig = { ...DEFAULT_CONFIG };
  let colorConfig: ColorConfig = { ...DEFAULT_COLOR_CONFIG };
  let container: ContainerDef = CONTAINERS[0]!;
  let mode: 'attract' | 'repel' = 'attract';
  let state: PhysicsState = createInitialState(physicsConfig.spikeCount, physicsConfig.fillLevel, mode);

  function resize(): void {
    const wrap = canvas.parentElement!;
    renderer.resize(wrap.clientWidth, wrap.clientHeight);
  }

  resize();
  window.addEventListener('resize', resize);

  // Build UI
  buildControls(sidebar, { physicsConfig, colorConfig, container, mode }, (next) => {
    const prevCount = physicsConfig.spikeCount;
    physicsConfig = next.physicsConfig;
    colorConfig = next.colorConfig;
    container = next.container;
    mode = next.mode;
    // Re-initialize state if spike count changed
    if (next.physicsConfig.spikeCount !== prevCount) {
      state = createInitialState(physicsConfig.spikeCount, physicsConfig.fillLevel, mode);
    } else {
      state = { ...state, mode, restHeight: physicsConfig.fillLevel };
    }
  });

  // Cursor tracking
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const norm = renderer.toPhysicsCoords(mx, my, container);
    state = { ...state, cursor: norm };
  });

  canvas.addEventListener('mouseleave', () => {
    state = { ...state, cursor: null };
  });

  // Touch support
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const rect = canvas.getBoundingClientRect();
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;
    state = { ...state, cursor: renderer.toPhysicsCoords(mx, my, container) };
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    state = { ...state, cursor: null };
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A') state = { ...state, mode: 'attract' };
    if (e.key === 'r' || e.key === 'R') state = { ...state, mode: 'repel' };
  });

  // Animation loop
  let lastTime = 0;
  function tick(time: number): void {
    const dt = Math.min((time - lastTime) / 1000, MAX_DT);
    lastTime = time;

    state = stepPhysics({ ...state, mode }, physicsConfig, dt);
    renderer.render(state, container, colorConfig);

    requestAnimationFrame(tick);
  }

  requestAnimationFrame((t) => { lastTime = t; requestAnimationFrame(tick); });
}
