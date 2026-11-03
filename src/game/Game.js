
import * as THREE from 'three';

import { createTrack } from './Track.js';
import { Car } from './Car.js';
import { Physics } from './Physics.js';
import { ChaseCamera } from './Camera.js';
import { HUD } from '../ui/HUD.js';

export class Game {
  constructor(container) {
    this.container = container;
    this.isDisposed = false;

    // Scene.
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x91c9e8);
    this.scene.fog = new THREE.Fog(0x91c9e8, 180, 450);

    // Camera.
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    this.camera = new THREE.PerspectiveCamera(
      65,
      width / height,
      0.1,
      1000
    );

    // Renderer.
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

    // Lighting and environment.
    this.setupLighting();

    // Track.
    this.track = createTrack(this.scene);

    // Car.
    this.car = new Car(
      this.scene,
      this.track.startPosition.clone()
    );

    const tangent = this.track.startTangent;

    this.car.setRotation(
      Math.atan2(-tangent.x, -tangent.z)
    );

    // Physics and camera.
    this.physics = new Physics(this.track);
    this.chaseCamera = new ChaseCamera(this.camera);

    // Game state.
    this.state = 'ready';
    this.countdownRemaining = 0;
    this.raceTime = 0;
    this.previousProgress = 0;

    // HUD.
    this.hud = new HUD(container, {
      onStart: () => this.startRace(),
      onRestart: () => this.restartRace(),
    });

    // Animation.
    this.clock = new THREE.Clock();

    this.handleResize = this.handleResize.bind(this);
    this.handleVisibilityChange =
      this.handleVisibilityChange.bind(this);

    window.addEventListener('resize', this.handleResize);

    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );

    this.animate();
  }

  setupLighting() {
    // Soft overall illumination.
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      0.8
    );

    this.scene.add(ambientLight);

    // Sky and ground illumination.
    const hemisphereLight = new THREE.HemisphereLight(
      0xd9efff,
      0x53634a,
      1.1
    );

    this.scene.add(hemisphereLight);

    // Main sunlight.
    this.sunlight = new THREE.DirectionalLight(
      0xffffff,
      2.5
    );

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

    // Soft fill light to prevent overly dark surfaces.
    const fillLight = new THREE.DirectionalLight(
      0xc5dcff,
      0.55
    );

    fillLight.position.set(45, 35, -55);

    this.scene.add(fillLight);
  }

  startRace() {
    if (this.state !== 'ready') return;

    this.state = 'countdown';
    this.countdownRemaining = 3;
    this.raceTime = 0;

    this.previousProgress =
      this.physics.getTrackProgress(
        this.car.group.position
      );

    this.hud.showCountdown(3);
  }

  restartRace() {
    // Reset physics.
    this.physics.velocity.set(0, 0, 0);
    this.physics.speed = 0;
    this.physics.currentSteering = 0;
    this.physics.steeringInput = 0;
    this.physics.isColliding = false;
    this.physics.keys.clear();

    // Reset car position and orientation.
    this.car.setPosition(
      this.track.startPosition.clone()
    );

    this.car.group.rotation.set(0, 0, 0);

    const tangent = this.track.startTangent;

    this.car.setRotation(
      Math.atan2(-tangent.x, -tangent.z)
    );

    // Reset visual car effects.
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

    // Reset camera.
    this.chaseCamera.initialized = false;
    this.chaseCamera.currentSpeed = 0;
    this.chaseCamera.steeringEffect = 0;

    // Reset race.
    this.raceTime = 0;
    this.countdownRemaining = 0;
    this.previousProgress = 0;

    this.state = 'ready';

    this.clock.getDelta();

    this.hud.showStart();
  }

  finishRace() {
    if (this.state !== 'racing') return;

    this.state = 'finished';

    this.hud.showResults(this.raceTime);
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
    // Avoid a large delta-time jump when returning to the game.
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

    // Countdown.
    if (this.state === 'countdown') {
      this.countdownRemaining -= deltaTime;

      const number = Math.ceil(
        this.countdownRemaining
      );

      if (number > 0) {
        this.hud.showCountdown(number);
      } else {
        this.state = 'racing';
        this.hud.hideCountdown();
      }
    }

    // Active race.
    if (this.state === 'racing') {
      this.raceTime += deltaTime;

      driving = this.physics.update(
        this.car,
        deltaTime
      );

      // Detect crossing the start/finish line.
      const crossedFinish =
        this.previousProgress > 0.85 &&
        driving.progress < 0.15;

      if (crossedFinish && this.raceTime > 8) {
        this.finishRace();
      }

      this.previousProgress = driving.progress;
    }

    // Update car visuals.
    this.car.update(
      deltaTime,
      driving.speed,
      driving.steering
    );

    // Update camera.
    this.chaseCamera.update(
      this.car,
      deltaTime
    );

    // Update HUD.
    this.hud.update(
      driving.speed,
      this.physics.maxSpeed,
      this.raceTime,
      driving.progress,
      this.state
    );

    // Render.
    this.renderer.render(
      this.scene,
      this.camera
    );
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
    this.hud.dispose();
    this.car.dispose();

    // Dispose track resources.
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

    // Dispose scene lighting resources.
    this.renderer.dispose();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(
        this.renderer.domElement
      );
    }
  }
}