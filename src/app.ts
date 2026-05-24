import { PhysicsConfig, DEFAULT_CONFIG } from './physics/types';
import { createInitialState, stepPhysics } from './physics/step';
import { PhysicsState } from './physics/types';
import { Renderer } from './rendering/Renderer';
import { ColorConfig, DEFAULT_COLOR_CONFIG } from './rendering/colors';
import { openPool } from './containers';
import { buildControls } from './ui/Controls';

const MAX_DT = 1 / 30;
const container = openPool;

export function startApp(canvas: HTMLCanvasElement, sidebar: HTMLElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  const renderer = new Renderer(ctx);

  let physicsConfig: PhysicsConfig = { ...DEFAULT_CONFIG };
  let colorConfig: ColorConfig = { ...DEFAULT_COLOR_CONFIG };
  let mode: 'attract' | 'repel' = 'attract';

  function freshState(): PhysicsState {
    return createInitialState(
      physicsConfig.gridSize,
      physicsConfig.fillLevel,
      container.getMask(physicsConfig.gridSize),
      mode
    );
  }

  let state: PhysicsState = freshState();

  function resize(): void {
    const wrap = canvas.parentElement!;
    renderer.resize(wrap.clientWidth, wrap.clientHeight);
  }
  resize();
  window.addEventListener('resize', resize);

  buildControls(sidebar, { physicsConfig, colorConfig, mode }, (next) => {
    const needsReset =
      next.physicsConfig.gridSize !== physicsConfig.gridSize ||
      next.physicsConfig.fillLevel !== physicsConfig.fillLevel;

    physicsConfig = next.physicsConfig;
    colorConfig = next.colorConfig;
    mode = next.mode;

    state = needsReset ? freshState() : { ...state, mode, restHeight: physicsConfig.fillLevel };
  });

  function updateCursor(clientX: number, clientY: number): void {
    const rect = canvas.getBoundingClientRect();
    state = { ...state, cursor: renderer.toPhysicsCoords(clientX - rect.left, clientY - rect.top, container) };
  }

  canvas.addEventListener('mousemove', (e) => updateCursor(e.clientX, e.clientY));
  canvas.addEventListener('mouseleave', () => { state = { ...state, cursor: null }; });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    if (t) updateCursor(t.clientX, t.clientY);
  }, { passive: false });
  canvas.addEventListener('touchend', () => { state = { ...state, cursor: null }; });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A') state = { ...state, mode: 'attract' };
    if (e.key === 'r' || e.key === 'R') state = { ...state, mode: 'repel' };
  });

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
