# VELOCITY

VELOCITY is a browser-based 3D arcade racing game built with JavaScript and Three.js. It combines a custom low-poly sports car, a closed race circuit, arcade driving physics, a chase camera, and a polished in-game HUD.

This project is structured as a complete browser game starter with a modular game architecture and supporting public assets ready for expansion.

## Highlights

- 3D low-poly sports car with steering animation and suspended body motion
- Closed racing circuit with barriers, grass, trees, and track markings
- Drift-friendly arcade physics with grip, handbrake slide, and track-boundary clamping
- Dynamic chase camera with smoothing and speed-responsive framing
- Proper start menu with car and track selection before the race begins
- Three distinct car builds with unique proportions, liveries, and aero details
- A green, flowing Classic circuit and a winding red-rock Canyon route
- Lap tracking with individual lap times shown at the end of each race
- Original engine loop and race sound effects for countdown, lap completion, collision, and finish
- Multiple selectable performance presets and circuit variants
- Responsive HUD with speed, gear, lap data, and race info
- Public asset folders for audio, models, textures, and branding assets

## Controls

| Input | Action |
|---|---|
| `W` / `Arrow Up` | Accelerate |
| `S` / `Arrow Down` | Brake / reverse |
| `A` / `Arrow Left` | Steer left |
| `D` / `Arrow Right` | Steer right |
| `Space` | Handbrake / drift |

## Project structure

```text
velocity/
├── index.html
├── package.json
├── README.md
├── public/
│   ├── audio/
│   │   ├── README.md
│   │   ├── collision.wav
│   │   ├── countdown.wav
│   │   ├── engine-loop.wav
│   │   ├── finish-fanfare.wav
│   │   └── lap-chime.wav
│   ├── favicon.svg
│   ├── icons.svg
│   ├── models/
│   │   └── README.md
│   ├── textures/
│   │   └── README.md
│   └── ...
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── javascript.svg
│   │   └── vite.svg
│   ├── audio/
│   │   └── SoundManager.js
│   ├── game/
│   │   ├── Camera.js
│   │   ├── Car.js
│   │   ├── Game.js
│   │   ├── Physics.js
│   │   └── Track.js
│   ├── ui/
│   │   └── HUD.js
│   ├── main.js
│   ├── style.css
│   └── ...
└── dist/
```

## Getting started

### Prerequisites

- Node.js 18+
- npm
- Git

### Install

```bash
git clone https://github.com/krista9669/velocity.git
cd velocity
npm install
```

### Run locally

```bash
npm run dev
```

Then open the local Vite URL in your browser, typically:

```text
http://localhost:5173
```

### Production build

```bash
npm run build
npm run preview
```

## Upgrade notes

This release focuses on a more complete arcade racing flow with a polished menu and progression loop:

- proper start menu with vehicle and circuit selection
- lap tracking with per-race lap times
- original engine and race sound assets with speed-responsive playback
- multiple car handling presets and alternate track variants
- refined HUD and game overlay flow
- improved lighting and visual feedback on the car body
- modular track and vehicle systems for easier expansion
- public asset folders prepared for sounds, models, and textures
- better local dev hosting settings for browser testing

## Tech stack

- JavaScript (ES modules)
- Three.js
- Vite
- HTML5 and CSS3

## Roadmap

- [x] Race scene and rendering pipeline
- [x] Low-poly car model and wheel animation
- [x] Track generation and barriers
- [x] Vehicle movement and grip handling
- [x] Drift / handbrake behavior
- [x] Chasing camera and race HUD
- [x] Multiple circuits
- [x] Car selection
- [x] Lap timers and race results
- [x] Sound and engine effects
- [ ] Additional environmental props and art assets