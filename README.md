# VELOCITY

### A 3D Arcade Racing Game Built with Three.js

<p align="center">
  <strong>Choose your car. Pick your circuit. Race at full speed.</strong>
</p>

<p align="center">
  A browser-based racing experience featuring custom vehicles, arcade-style physics, multiple racing environments, dynamic camera movement, and immersive audio.
</p>

<p align="center">
  <a href="https://github.com/krista9669/velocity">Repository</a> •
  <a href="#features">Features</a> •
  <a href="#controls">Controls</a> •
  <a href="#getting-started">Getting Started</a>
</p>

<p align="center">
  <img src="images/car%20in%20canyon.png" alt="VELOCITY - Racing through the Canyon Circuit" width="100%">
</p>

---

## Overview

**VELOCITY** is a browser-based 3D arcade racing game developed using JavaScript, Three.js, and Vite.

The project explores the development of an interactive racing experience without relying on a traditional game engine. It brings together procedural 3D modelling, custom vehicle physics, circuit generation, race management, camera control, and audio into a modular game architecture.

Players can choose between three vehicles, select from two racing environments, and compete in two-lap races while monitoring their speed, lap progress, and race times.

The focus is on creating an accessible arcade racing experience with responsive driving mechanics, distinctive vehicle handling, and a stylised low-poly visual environment.

## Inspiration

VELOCITY was inspired by **[PolyTrack](https://www.kodub.com/apps/polytrack)**, a minimalist low-poly racing game that demonstrates how simple geometric visuals, responsive controls, and thoughtfully designed racing circuits can create an engaging gameplay experience.

PolyTrack influenced the visual direction and overall arcade racing concept of VELOCITY.

Building on that inspiration, VELOCITY explores its own implementation through:

- Procedurally constructed 3D vehicles.
- Multiple selectable cars with individual handling configurations.
- Independently generated racing environments.
- A custom arcade-style vehicle physics system.
- Dynamic third-person camera behaviour.
- Race progression, lap timing, and results.
- Integrated engine audio and racing sound effects.

VELOCITY is an independently developed project with its own codebase, vehicle designs, track implementations, and gameplay systems.

**Original inspiration:** [PolyTrack](https://www.kodub.com/apps/polytrack)

---

## Features

### 1. Vehicle Selection

VELOCITY features three selectable vehicles, each with a distinct visual design and performance configuration.

| Vehicle | Description |
|---|---|
| Vortex | A balanced sports car designed for general-purpose racing. |
| Thunder | A performance-oriented vehicle with its own handling configuration. |
| Apex | A high-performance vehicle with a distinct speed and acceleration profile. |

The vehicles are constructed programmatically using Three.js geometries and materials.

Vehicle components include:

- Main body and cabin.
- Wheels and rims.
- Headlights and brake lights.
- Side mirrors.
- Rear spoiler.
- Animated wheels and visual body movement.

Each vehicle uses configurable physics parameters, allowing different handling characteristics while sharing the same underlying physics system.

### 2. Multiple Racing Environments

VELOCITY currently features two selectable racing circuits.

**Classic Circuit**

A traditional racing environment featuring a closed circuit, road surfaces, safety barriers, road markings, and low-poly vegetation.

**Canyon Circuit**

A visually distinct racing environment surrounded by stylised canyon and rock formations, providing a different atmosphere and racing experience.

Both environments use Three.js geometry and curve-based track construction.

### 3. Custom Arcade Vehicle Physics

The vehicle physics system is implemented in JavaScript using Three.js vector mathematics.

Instead of relying on a full rigid-body physics simulation, VELOCITY uses a custom arcade-style approach to provide direct control over vehicle movement and handling.

The physics system handles:

- Forward acceleration.
- Braking and reverse movement.
- Steering and steering interpolation.
- Velocity-based vehicle movement.
- Lateral grip and resistance.
- Handbrake-based drifting.
- Vehicle-specific handling configurations.
- Track boundary detection and correction.

Vehicle movement is calculated using velocity, orientation, player input, and configurable handling parameters.

### 4. Drifting and Steering

VELOCITY includes handbrake-based drifting mechanics.

During normal driving, the vehicle uses higher lateral grip to maintain stability. Activating the handbrake reduces lateral grip, allowing the car to slide through corners.

Steering input is smoothed to avoid abrupt changes in direction and provide more controllable vehicle movement.

The combination of steering, velocity, grip, and handbrake behaviour creates an arcade-style driving experience.

### 5. Dynamic Chase Camera

A third-person chase camera follows the player's vehicle throughout the race.

Camera behaviour includes:

- Smooth camera position interpolation.
- Speed-responsive camera positioning.
- Steering-related camera movement.
- Continuous vehicle tracking.
- Dynamic viewing distance based on movement.

The camera maintains visibility of the vehicle while providing a useful view of the circuit ahead.

### 6. Race Management System

The game implements a structured race lifecycle.

| Game State | Functionality |
|---|---|
| Ready | Displays the start menu and selection options. |
| Countdown | Initiates the race with a countdown sequence. |
| Racing | Updates vehicle physics, lap progression, race time, and HUD. |
| Finished | Displays race results and recorded lap times. |

Each race consists of two laps.

The game tracks circuit progress and detects start/finish crossings to update lap information and calculate lap times.

### 7. Audio System

VELOCITY includes a dedicated audio manager for engine audio and race sound effects.

The audio system supports:

- Engine loop with speed-responsive playback.
- Countdown sound.
- Lap completion sound.
- Collision sound.
- Race finish sound.

Audio playback is integrated with the game lifecycle and player interactions to accommodate browser audio restrictions.

### 8. Heads-Up Display

The in-game HUD provides real-time information about the vehicle and current race.

It includes:

- Vehicle speed in km/h.
- Gear indicator.
- Race timer.
- Current lap and total laps.
- Track progress.
- Countdown display.
- Vehicle selection interface.
- Circuit selection interface.
- Race completion screen.
- Individual lap times.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| JavaScript (ES Modules) | Core application and game logic |
| Three.js | 3D rendering, geometry, materials, lighting, and camera |
| Vite | Development server and production build tooling |
| HTML5 | Application structure |
| CSS3 | HUD, menus, and interface styling |
| Web Audio / HTML Audio | Engine audio and racing sound effects |

### Core Dependencies

- `three` — 3D rendering and mathematical utilities.
- `vite` — Development server and production build tooling.

**Physics implementation:** Custom arcade-style vehicle physics using Three.js vector mathematics. Rapier is not currently used as the active physics engine.

---

## Controls

| Key | Action |
|---|---|
| `W` / `Arrow Up` | Accelerate |
| `S` / `Arrow Down` | Brake / Reverse |
| `A` / `Arrow Left` | Steer left |
| `D` / `Arrow Right` | Steer right |
| `Space` | Handbrake / Drift |

**Driving tip:** Approach corners at a manageable speed, steer into the turn, and use the handbrake to initiate a slide.

---

## Architecture

VELOCITY follows a modular architecture that separates vehicle simulation, track construction, camera control, audio, rendering, and user interface logic.

### Project Structure

```text
velocity/
│
├── images/
│   └── car in canyon.png
│
├── public/
│   ├── audio/
│   ├── models/
│   └── textures/
│
├── src/
│   ├── audio/
│   │   └── SoundManager.js
│   │
│   ├── game/
│   │   ├── Camera.js
│   │   ├── Car.js
│   │   ├── Game.js
│   │   ├── Physics.js
│   │   └── Track.js
│   │
│   ├── ui/
│   │   └── HUD.js
│   │
│   ├── main.js
│   └── style.css
│
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

### Core Modules

| Module | Responsibility |
|---|---|
| `main.js` | Application entry point and game initialisation. |
| `Game.js` | Coordinates the scene, game loop, race states, vehicle selection, circuit selection, and race progression. |
| `Car.js` | Procedural vehicle construction, visual components, wheel animation, and body movement. |
| `Physics.js` | Acceleration, braking, steering, drifting, velocity, and track boundary handling. |
| `Track.js` | Circuit generation, road geometry, barriers, and environmental scenery. |
| `Camera.js` | Dynamic third-person chase camera. |
| `HUD.js` | Menus, selection interfaces, countdown, race information, and results. |
| `SoundManager.js` | Engine audio and race sound effects. |
| `style.css` | Game interface, menus, HUD, and visual styling. |

---

## Technical Implementation

### 1. Procedural Track Generation

The racing circuits are constructed using closed Catmull-Rom curves.

These curves define the central path of each circuit and provide the foundation for road and surrounding environment generation.

The track generation process involves:

1. Defining control points for the circuit.
2. Constructing a closed spline through the points.
3. Sampling positions and tangents along the curve.
4. Generating road geometry using the sampled positions.
5. Adding road markings, shoulders, and safety barriers.
6. Constructing the surrounding environment.

This approach allows racing environments to be generated programmatically instead of relying entirely on prebuilt track models.

### 2. Vehicle Movement and Physics

The physics system maintains the vehicle's velocity using Three.js vector operations.

During each simulation update:

1. Player input is collected.
2. Acceleration or braking is applied.
3. Forward and lateral movement are calculated.
4. Steering changes the vehicle's orientation.
5. Grip and resistance affect lateral movement.
6. Handbrake input modifies grip for drifting.
7. Track boundaries are checked and corrected.
8. The updated vehicle state is returned to the game system.

Vehicle-specific physics configurations allow different cars to share the same underlying simulation while retaining distinct handling characteristics.

### 3. Rendering Pipeline

The game uses the Three.js WebGL renderer to draw the racing environment.

The rendering setup includes:

- Perspective camera.
- Antialiasing.
- ACES Filmic tone mapping.
- sRGB output colour space.
- Directional lighting.
- Ambient and hemisphere lighting.
- Shadow rendering.
- Distance-based fog.
- Device pixel ratio handling.

### 4. Game Loop

The game loop is driven by `requestAnimationFrame`.

Each frame coordinates the simulation and rendering systems.

```text
Player Input
     |
     v
Vehicle Physics
     |
     v
Vehicle Animation
     |
     v
Track Progress and Lap Detection
     |
     v
Race State and HUD
     |
     v
Audio Updates
     |
     v
Camera Update
     |
     v
Three.js Rendering
```

Frame delta time is used to keep movement calculations consistent across different frame rates.

### 5. Race Progression and Lap Timing

The race system tracks the vehicle's progress along the circuit.

Track progress and start/finish crossing detection are used to manage lap progression.

Lap timing is calculated during active racing and recorded when the player completes a lap.

When the final lap is completed, the race transitions to the finished state and displays the results.

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 18 or later.
- npm.
- Git.
- A modern browser with WebGL support.

### 1. Clone the Repository

```bash
git clone https://github.com/krista9669/velocity.git
cd velocity
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Open the local URL provided by Vite, usually:

```text
http://localhost:5173
```

### 4. Build for Production

```bash
npm run build
```

### 5. Preview the Production Build

```bash
npm run preview
```

---

## Development Roadmap

VELOCITY is an evolving project. Potential improvements include:

### Gameplay
- [ ] Additional racing circuits and environments.
- [ ] More vehicle models and customisation options.
- [ ] Additional race modes and time trials.
- [ ] Persistent lap records and personal bests.

### Physics and Handling
- [ ] More advanced vehicle suspension.
- [ ] Improved collision response.
- [ ] More detailed drifting and tyre behaviour.
- [ ] Expanded vehicle performance tuning.

### Visuals and Audio
- [ ] Improved drifting and collision particle effects.
- [ ] Additional environmental details.
- [ ] More camera perspectives.
- [ ] Expanded engine and environmental sound effects.

### Platform and Experience
- [ ] Mobile-friendly driving controls.
- [ ] Gamepad support.
- [ ] Performance optimisation for lower-end devices.
- [ ] Additional accessibility and gameplay settings.
