# Ferrofluid

An interactive ferrofluid simulation that renders physically-inspired fluid dynamics in real time. The mouse acts as a magnetic source — attracting or repelling the fluid — while a suite of visual and physical parameters let you dial in exactly the look and behavior you want.

---

## Overview

Ferrofluid is a colloidal liquid that becomes strongly magnetized in the presence of a magnetic field, forming dramatic spike-like structures along field lines. This simulation captures that behavior using a particle/surface system driven by simplified magnetic force equations, rendered inside a variety of stylized containers.

---

## Planned Features

### Mouse Interaction
- **Attract mode** — cursor acts as a magnet pulling spikes and fluid mass toward it
- **Repel mode** — cursor pushes fluid away, creating a depression or "crater"
- **Toggle via keyboard shortcut or UI button** (e.g. `A` / `R` or a toggle switch)
- Interaction strength scales with cursor proximity using an inverse-square falloff
- Optional: click-and-hold to modulate field strength

### Container / Vessel Options
The simulation renders the fluid inside a bounded container. Planned vessel shapes:

| Container | Notes |
|-----------|-------|
| **Glass bottle** (default) | Tall cylindrical bottle with a narrow neck; fluid sits at the bottom |
| **Petri dish** | Wide, shallow — spreads fluid thin, emphasizes surface spikes |
| **Beaker** | Straight-walled lab glass; clean sight lines for watching bulk motion |
| **Erlenmeyer flask** | Tapered base, wide body; interesting meniscus behavior at the cone |
| **Test tube** | Narrow; fluid mostly vertical with confined spike columns |
| **Mason jar** | Chunky, familiar shape; slightly irregular silhouette |
| **Wine glass** | Curved bowl + stem; fluid dynamics at the curved wall |
| **Hourglass** | Fluid flows through the pinch point under gravity |
| **Open pool** | No walls — unbounded 2D top-down view, full spike field visible |

Container selection via a dropdown or icon-grid in the UI.

### Fluid Amount
- Slider controlling fill level (e.g. 10% – 90% of container volume)
- At low fill: isolated islands of fluid; at high fill: nearly full with small air gap at top
- Fluid volume affects how far spikes can travel and how they cluster

### Color Options
- **Fluid color** — color picker for the ferrofluid body (classic black, deep blue, iridescent, custom)
- **Background color** — solid color or gradient behind the container
- **Container tint** — glass tint/opacity so the vessel itself can be clear, amber, cobalt, etc.
- **Spike highlight color** — subtle specular highlight on spike tips
- **Preset themes**: Classic Black, Ocean, Lava, Neon, Phantom (dark purple/teal)

### Physical Parameters
- **Field strength** — global multiplier on magnetic force magnitude
- **Fluid viscosity** — how quickly spikes form and dissipate
- **Surface tension** — affects spike sharpness and base width
- **Spike count / resolution** — number of surface sample points (performance vs. detail trade-off)
- **Gravity** — can be reduced for a zero-g floating-blob aesthetic
- **Fluid density** — heavier fluid moves slower, lighter fluid sloshes more

### Rendering & Visual Options
- **Spike rendering mode**: smooth metaball surface vs. sharp polygon spikes vs. wireframe
- **Reflection / refraction** on the glass container
- **Bloom / glow** on spike tips for a dramatic effect
- **Ambient animation** — slow idle oscillation even without mouse movement
- **FPS cap** — for battery-constrained devices

---

## Technical Plan

### Architecture

```
src/
├── main.ts              # Entry point, canvas setup, animation loop
├── simulation/
│   ├── FluidSim.ts      # Core particle/field simulation
│   ├── MagneticField.ts # Mouse-driven magnetic force calculations
│   └── Surface.ts       # Spike surface extraction (marching squares or custom)
├── rendering/
│   ├── Renderer.ts      # WebGL / Canvas 2D abstraction
│   ├── ContainerMesh.ts # Container shape geometry
│   └── FluidRenderer.ts # Metaball / spike rendering
├── ui/
│   ├── Controls.ts      # Sliders, color pickers, toggles
│   └── Presets.ts       # Named parameter presets
└── containers/
    ├── Bottle.ts
    ├── PetriDish.ts
    ├── Beaker.ts
    └── ... (one file per vessel shape)
```

### Simulation Approach
The fluid surface is represented as a 1D array of height samples around the container perimeter (for 2D side-view) or a 2D grid of heights (for top-down view). Each sample point has a height value driven by:

1. **Magnetic force** from the mouse cursor (inverse-square law, direction depends on attract/repel mode)
2. **Surface tension** (Laplacian smoothing pulling adjacent samples toward a common height)
3. **Gravity** (restoring force pulling heights back to the rest level)
4. **Viscosity damping** (velocity decay each frame)

This is essentially a spring-mass wave simulation with an external magnetic forcing term.

### Tech Stack
- **Language**: TypeScript
- **Renderer**: WebGL 2 (primary) with Canvas 2D fallback
- **Build**: Vite
- **Target**: Browser-based (mobile-friendly, designed as a phone wallpaper / screensaver)

---

## Controls Reference (planned)

| Input | Action |
|-------|--------|
| Mouse move | Move magnetic source |
| `A` | Toggle attract mode |
| `R` | Toggle repel mode |
| `[` / `]` | Decrease / increase field strength |
| `C` | Cycle container shape |
| `T` | Cycle color theme |
| `Space` | Pause / resume |
| `F` | Toggle fullscreen |

---

## Getting Started (planned)

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Roadmap

- [ ] Core wave simulation with mouse attract/repel
- [ ] Basic bottle container with glass rendering
- [ ] Color picker and theme system
- [ ] Additional container shapes
- [ ] WebGL metaball rendering for smooth fluid surface
- [ ] Mobile touch support
- [ ] Exportable wallpaper / screensaver mode
- [ ] Audio reactivity (optional — spikes pulse to microphone input)
