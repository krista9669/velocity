
import * as THREE from 'three';

import { createTrack } from './Track.js';
import { Car } from './Car.js';
import { Physics, CAR_PRESETS } from './Physics.js';
import { ChaseCamera } from './Camera.js';
import { HUD } from '../ui/HUD.js';
import { SoundManager } from '../audio/SoundManager.js';

export class Game {
  constructor(container) {
    this.container = container;
    this.isDisposed = false;
    this.selectedCar = 'vortex';
    this.selectedTrack = 'classic';
    this.totalLaps = 2;
    this.currentLap = 1;
    this.completedLaps = 0;
    this.lapTimes = [];
    this.sound = new SoundManager();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x91c9e8);
    this.scene.fog = new THREE.Fog(0x91c9e8, 180, 450);

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    this.camera = new THREE.PerspectiveCamera(
      65,
      width / height,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x91c9e8);

    container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.buildWorld();

    this.state = 'ready';
    this.countdownRemaining = 0;
    this.raceTime = 0;
    this.previousProgress = 0;
    this.lastCountdownValue = 0;
    this.lastLapTime = 0;
    this.lapStartTime = 0;

    this.hud = new HUD(container, {
      onStart: () => this.startRace(),
      onRestart: () => this.restartRace(),
      onCarSelect: car => this.selectCar(car),
      onTrackSelect: track => this.selectTrack(track),
    });

    this.hud.setMenuSelection(this.selectedCar, this.selectedTrack);
    this.hud.showMenu();

    this.clock = new THREE.Clock();

    this.handleResize = this.handleResize.bind(this);
    this.handleVisibilityChange =
      this.handleVisibilityChange.bind(this);

    window.addEventListener('resize', this.handleResize);
    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );

    this.sound.init();
    this.animate();
  }

  buildWorld() {
    this.track = createTrack(this.scene, this.selectedTrack);

    this.car = new Car(
      this.scene,
      this.track.startPosition.clone(),
      this.selectedCar
    );

    const tangent = this.track.startTangent;

    this.car.setRotation(
      Math.atan2(-tangent.x, -tangent.z)
    );

    this.physics = new Physics(
      this.track,
      this.selectedCar
    );

    this.chaseCamera = new ChaseCamera(this.camera);
  }

  selectCar(carName) {
    if (!CAR_PRESETS[carName]) return;

    this.selectedCar = carName;
    this.hud.setMenuSelection(
      this.selectedCar,
      this.selectedTrack
    );

    if (this.state === 'ready') {
      this.rebuildWorld();
    }
  }

  selectTrack(trackName) {
    if (!['classic', 'canyon'].includes(trackName)) return;

    this.selectedTrack = trackName;
    this.hud.setMenuSelection(
      this.selectedCar,
      this.selectedTrack
    );

    if (this.state === 'ready') {
      this.rebuildWorld();
    }
  }

  rebuildWorld() {
    if (this.track?.group) {
      this.scene.remove(this.track.group);
      this.track.group.traverse(object => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach(material => material.dispose());
        }
      });
    }

    if (this.car) {
      this.car.dispose();
    }

    if (this.physics) {
      this.physics.dispose();
    }

    this.buildWorld();

    if (this.hud) {
      this.hud.setMenuSelection(
        this.selectedCar,
        this.selectedTrack
      );
    }

    this.resetRaceState();
  }

  resetRaceState() {
    this.raceTime = 0;
    this.countdownRemaining = 0;
    this.previousProgress = 0;
    this.currentLap = 1;
    this.completedLaps = 0;
    this.lapTimes = [];
    this.lastCountdownValue = 0;
    this.lapStartTime = 0;

    this.state = 'ready';

    if (this.physics && this.car) {
      this.physics.velocity.set(0, 0, 0);
      this.physics.speed = 0;
      this.physics.currentSteering = 0;
      this.physics.steeringInput = 0;
      this.physics.isColliding = false;
      this.physics.keys.clear();

      this.car.setPosition(
        this.track.startPosition.clone()
      );

      this.car.group.rotation.set(0, 0, 0);
      const tangent = this.track.startTangent;
      this.car.setRotation(
        Math.atan2(-tangent.x, -tangent.z)
      );

      this.car.steeringAngle = 0;
      this.car.bodyRoll = 0;
      this.car.bodyPitch = 0;
      this.car.suspensionTime = 0;
      this.car.bodyGroup.rotation.set(0, 0, 0);
      this.car.bodyGroup.position.set(0, 0, 0);

      this.car.wheels.forEach(wheel => {
        wheel.steeringPivot.rotation.set(0, 0, 0);
        wheel.spinGroup.rotation.set(0, 0, 0);
      });
    }

    this.chaseCamera.initialized = false;
    this.chaseCamera.currentSpeed = 0;
    this.chaseCamera.steeringEffect = 0;

    this.clock.getDelta();
    this.hud.showMenu();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(
      0xd9efff,
      0x53634a,
      1.1
    );
    this.scene.add(hemisphereLight);

    this.sunlight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.sunlight.position.set(-45, 90, 55);
    this.sunlight.castShadow = true;
    this.sunlight.shadow.mapSize.set(2048, 2048);
    this.sunlight.shadow.camera.left = -120;
    this.sunlight.shadow.camera.right = 120;
    this.sunlight.shadow.camera.top = 120;
    this.sunlight.shadow.camera.bottom = -120;
    this.sunlight.shadow.camera.near = 1;
    this.sunlight.shadow.camera.far = 250;
    this.sunlight.shadow.bias = -0.00015;
    this.sunlight.shadow.normalBias = 0.03;
    this.sunlight.target.position.set(0, 0, 0);
    this.scene.add(this.sunlight);
    this.scene.add(this.sunlight.target);

    const fillLight = new THREE.DirectionalLight(0xc5dcff, 0.55);
    fillLight.position.set(45, 35, -55);
    this.scene.add(fillLight);
  }

  startRace() {
    if (this.state !== 'ready') return;

    this.sound.ensureReady();
    this.state = 'countdown';
    this.countdownRemaining = 3;
    this.raceTime = 0;
    this.lapTimes = [];
    this.completedLaps = 0;
    this.currentLap = 1;
    this.lapStartTime = 0;
    this.previousProgress =
      this.physics.getTrackProgress(
        this.car.group.position
      );

    this.hud.showCountdown(3);
    this.lastCountdownValue = 3;
  }

  restartRace() {
    this.resetRaceState();
  }

  finishRace() {
    if (this.state !== 'racing') return;

    this.state = 'finished';
    this.sound.playFinishTone();

    this.hud.showResults(
      this.raceTime,
      this.lapTimes,
      this.selectedCar,
      this.selectedTrack
    );
  }

  handleResize() {
    if (this.isDisposed) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    if (!width || !height) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );
  }

  handleVisibilityChange() {
    this.clock.getDelta();
  }

  animate() {
    if (this.isDisposed) return;

    this.animationId = requestAnimationFrame(
      () => this.animate()
    );

    const deltaTime = Math.min(
      this.clock.getDelta(),
      0.04
    );

    let driving = {
      speed: this.physics.speed,
      steering: 0,
      colliding: false,
      progress: this.physics.getTrackProgress(
        this.car.group.position
      ),
    };

    if (this.state === 'countdown') {
      this.countdownRemaining -= deltaTime;
      const number = Math.ceil(this.countdownRemaining);

      if (number > 0 && number !== this.lastCountdownValue) {
        this.lastCountdownValue = number;
        this.sound.playCountdownTone(number);
      }

      if (number > 0) {
        this.hud.showCountdown(number);
      } else {
        this.state = 'racing';
        this.hud.hideCountdown();
        this.sound.playCountdownTone(1);
      }
    }

    if (this.state === 'racing') {
      this.raceTime += deltaTime;

      driving = this.physics.update(
        this.car,
        deltaTime
      );

      if (this.physics.isColliding && this.physics.speed > 3) {
        this.sound.playCollisionTone();
      }

      const crossedFinish =
        this.previousProgress > 0.85 &&
        driving.progress < 0.15;

      if (crossedFinish && this.raceTime > 8) {
        const lapTime = this.raceTime - this.lapStartTime;
        this.lapTimes.push(lapTime);
        this.completedLaps += 1;
        this.currentLap = this.completedLaps + 1;
        this.sound.playLapTone();
        this.lapStartTime = this.raceTime;

        if (this.completedLaps >= this.totalLaps) {
          this.finishRace();
        }
      }

      this.previousProgress = driving.progress;
    }

    this.car.update(
      deltaTime,
      driving.speed,
      driving.steering
    );

    this.chaseCamera.update(
      this.car,
      deltaTime
    );

    this.sound.setEngineState(
      Math.abs(driving.speed),
      this.state === 'racing' && this.physics.isPressed('w', 'arrowup'),
      this.state === 'racing' || this.state === 'countdown'
    );

    this.hud.update(
      driving.speed,
      this.physics.maxSpeed,
      this.raceTime,
      driving.progress,
      this.state,
      this.currentLap,
      this.totalLaps,
      this.completedLaps
    );

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.isDisposed) return;

    this.isDisposed = true;
    cancelAnimationFrame(this.animationId);

    window.removeEventListener(
      'resize',
      this.handleResize
    );

    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );

    this.physics.dispose();
    this.sound.dispose();
    this.hud.dispose();
    this.car.dispose();

    this.track.group.traverse(object => {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach(material => {
          material.dispose();
        });
      }
    });

    this.renderer.dispose();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(
        this.renderer.domElement
      );
    }
  }
}