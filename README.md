# VELOCITY

**A 3D Arcade Racing Game for the Browser**

VELOCITY is a browser-based 3D racing game developed using JavaScript and Three.js. It features a custom low-poly sports car, a procedurally generated racing circuit, arcade-style vehicle handling and a dynamic third-person camera.

The project explores real-time 3D rendering, vehicle movement, interactive game systems and modular game architecture within a browser environment.

---

## Overview

VELOCITY brings together custom 3D geometry, vehicle control systems and real-time rendering to create an interactive racing experience.

The game is built around a closed racing circuit where players can accelerate, brake, steer and drift while navigating the track.

## Features

- **3D Environment:** Custom racing circuit with asphalt surfaces, road boundaries, safety barriers and environmental scenery.
- **Vehicle Design:** Custom-built low-poly sports car featuring bodywork, cabin, alloy wheels, lighting and aerodynamic details.
- **Vehicle Physics:** Arcade-style acceleration, braking, reverse movement, steering, tire grip and speed regulation.
- **Drifting System:** Handbrake-based handling with reduced lateral grip.
- **Dynamic Camera:** Third-person chase camera with smooth tracking and speed-responsive positioning.
- **Race Management:** Countdown sequence, race timer, track progress and finish detection.
- **Game Interface:** Interactive HUD displaying speed, gear, race information and keyboard controls.
- **Rendering:** Real-time 3D graphics with directional lighting, shadows, tone mapping and atmospheric fog.

## Technology Stack

| Technology | Application |
|---|---|
| JavaScript (ES6+) | Core game logic and application development |
| Three.js | 3D rendering, geometry and scene management |
| Vite | Development environment and production build |
| HTML5 | Application structure |
| CSS3 | Interface styling |
| Rapier 3D | Physics library dependency |

## Controls

| Input | Action |
|---|---|
| `W` / `Arrow Up` | Accelerate |
| `S` / `Arrow Down` | Brake / Reverse |
| `A` / `Arrow Left` | Steer left |
| `D` / `Arrow Right` | Steer right |
| `Space` | Handbrake / Drift |

## Project Structure

```text
velocity/
├── public/
│   ├── audio/
│   ├── models/
│   └── textures/
│
├── src/
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
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/krista9669/velocity.git
```

**2. Navigate to the project directory**

```bash
cd velocity
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the application**

Navigate to the local URL displayed by Vite:

```text
http://localhost:5173
```

### Production Build

Generate an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Architecture

The application follows a modular architecture that separates rendering, vehicle systems, track generation, game state management and user interface logic.

| Module | Responsibility |
|---|---|
| `Game.js` | Coordinates scene initialization, rendering, game states and the main animation loop. |
| `Car.js` | Constructs the vehicle model and manages wheel rotation, steering and visual effects. |
| `Physics.js` | Implements vehicle movement, acceleration, braking, steering, drifting and track boundary handling. |
| `Track.js` | Generates track geometry, road surfaces, safety barriers and environmental elements. |
| `Camera.js` | Manages the third-person chase camera and dynamic camera positioning. |
| `HUD.js` | Handles the game interface, countdown, speedometer, timer and race results. |
| `main.js` | Application entry point. |

## Development Roadmap

- [x] Three.js scene initialization and rendering pipeline
- [x] Custom low-poly vehicle model
- [x] Procedurally generated racing circuit
- [x] Keyboard-based vehicle controls
- [x] Arcade-style vehicle movement and handling
- [x] Handbrake drifting mechanics
- [x] Third-person chase camera
- [x] Race countdown and timer
- [ ] Dynamic braking and reverse-light effects
- [ ] Enhanced suspension and vehicle feedback
- [ ] Additional racing circuits
- [ ] Multiple selectable vehicles
- [ ] Lap records and best-time tracking
- [ ] Engine audio and environmental sound effects
- [ ] Further graphical and performance improvements