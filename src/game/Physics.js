
import * as THREE from 'three';

export class Physics {
  constructor(track) {
    this.track = track;

    // Vehicle performance.
    this.maxSpeed = 38;
    this.maxReverseSpeed = 10;

    this.acceleration = 17;
    this.braking = 32;
    this.reverseAcceleration = 9;
    this.rollingResistance = 1.15;

    // Handling.
    this.turnSpeed = 1.65;
    this.grip = 8;
    this.driftGrip = 1.8;

    // Vehicle state.
    this.speed = 0;
    this.steeringInput = 0;
    this.currentSteering = 0;
    this.isColliding = false;
    this.isHandbraking = false;

    this.velocity = new THREE.Vector3();

    this.roadLimit = track.roadWidth / 2 - 1.4;

    // Reusable direction vectors.
    this.forward = new THREE.Vector3();
    this.right = new THREE.Vector3();

    // Precalculate track samples for boundary detection.
    this.trackSamples = [];

    const sampleCount = 800;

    for (let i = 0; i < sampleCount; i++) {
      const t = i / sampleCount;

      this.trackSamples.push({
        position: track.curve.getPointAt(t),
        tangent: track.curve.getTangentAt(t).normalize(),
        progress: t,
      });
    }

    // Input.
    this.keys = new Set();

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase();

    const controlledKeys = [
      'arrowup',
      'arrowdown',
      'arrowleft',
      'arrowright',
      ' ',
    ];

    if (controlledKeys.includes(key)) {
      event.preventDefault();
    }

    this.keys.add(key);
  }

  handleKeyUp(event) {
    this.keys.delete(event.key.toLowerCase());
  }

  handleBlur() {
    this.keys.clear();
    this.currentSteering = 0;
    this.steeringInput = 0;
  }

  isPressed(...keys) {
    return keys.some(key => this.keys.has(key));
  }

  findNearestTrackPoint(position) {
    let nearest = null;
    let minDistance = Infinity;

    for (const sample of this.trackSamples) {
      const dx = position.x - sample.position.x;
      const dz = position.z - sample.position.z;

      const distance = dx * dx + dz * dz;

      if (distance < minDistance) {
        minDistance = distance;
        nearest = sample;
      }
    }

    return nearest;
  }

  getTrackProgress(position) {
    const nearest = this.findNearestTrackPoint(position);

    return nearest ? nearest.progress : 0;
  }

  enforceBoundaries(car) {
    const position = car.group.position;
    const nearest = this.findNearestTrackPoint(position);

    this.isColliding = false;

    if (!nearest) return;

    const tangent = nearest.tangent;

    const sideX = -tangent.z;
    const sideZ = tangent.x;

    const dx = position.x - nearest.position.x;
    const dz = position.z - nearest.position.z;

    const lateralDistance =
      dx * sideX + dz * sideZ;

    if (Math.abs(lateralDistance) <= this.roadLimit) {
      return;
    }

    this.isColliding = true;

    // Clamp the vehicle back inside the road.
    const clampedDistance = THREE.MathUtils.clamp(
      lateralDistance,
      -this.roadLimit,
      this.roadLimit
    );

    position.x =
      nearest.position.x + sideX * clampedDistance;

    position.z =
      nearest.position.z + sideZ * clampedDistance;

    // Remove velocity pushing the car outside the road.
    const outwardSpeed =
      this.velocity.x * sideX +
      this.velocity.z * sideZ;

    if (
      Math.sign(outwardSpeed) ===
      Math.sign(lateralDistance)
    ) {
      this.velocity.x -= outwardSpeed * sideX;
      this.velocity.z -= outwardSpeed * sideZ;

      // A softer collision response.
      this.velocity.multiplyScalar(0.88);
    }
  }

  updateDirections(car) {
    const rotation = car.group.rotation.y;

    this.forward.set(
      -Math.sin(rotation),
      0,
      -Math.cos(rotation)
    );

    this.right.set(
      Math.cos(rotation),
      0,
      -Math.sin(rotation)
    );
  }

  applyAcceleration(forwardSpeed, throttle, brake, dt) {
    if (throttle && !brake) {
      if (forwardSpeed < -0.5) {
        // Accelerating while reversing first slows the car.
        this.velocity.addScaledVector(
          this.forward,
          this.braking * dt
        );
      } else if (forwardSpeed < this.maxSpeed) {
        this.velocity.addScaledVector(
          this.forward,
          this.acceleration * dt
        );
      }
    }

    if (brake && !throttle) {
      if (forwardSpeed > 0.5) {
        // Brake while moving forward.
        this.velocity.addScaledVector(
          this.forward,
          -this.braking * dt
        );
      } else if (forwardSpeed > -this.maxReverseSpeed) {
        // Reverse once the vehicle has nearly stopped.
        this.velocity.addScaledVector(
          this.forward,
          -this.reverseAcceleration * dt
        );
      }
    }
  }

  applySteering(car, forwardSpeed, handbrake, dt) {
    const left = this.isPressed('a', 'arrowleft');
    const right = this.isPressed('d', 'arrowright');

    const targetSteering =
      (right ? 1 : 0) - (left ? 1 : 0);

    const steeringSmoothing =
      1 - Math.exp(-8 * dt);

    this.currentSteering +=
      (targetSteering - this.currentSteering) *
      steeringSmoothing;

    this.steeringInput = this.currentSteering;

    const speedFactor = THREE.MathUtils.clamp(
      Math.abs(forwardSpeed) / 12,
      0,
      1
    );

    if (Math.abs(forwardSpeed) > 0.25) {
      const steeringDirection = Math.sign(forwardSpeed);

      // Reduce steering sensitivity slightly at high speeds.
      const speedSteering = THREE.MathUtils.lerp(
        0.85,
        0.55,
        speedFactor
      );

      const driftMultiplier = handbrake ? 1.3 : 1;

      const steeringAmount =
        this.currentSteering *
        this.turnSpeed *
        speedSteering *
        driftMultiplier *
        steeringDirection *
        dt;

      car.group.rotation.y -= steeringAmount;
    }
  }

  applyGrip(handbrake, dt) {
    const lateralSpeed = this.velocity.dot(this.right);

    const activeGrip = handbrake
      ? this.driftGrip
      : this.grip;

    const gripAmount = Math.min(
      1,
      activeGrip * dt
    );

    this.velocity.addScaledVector(
      this.right,
      -lateralSpeed * gripAmount
    );
  }

  applyResistance(throttle, brake, handbrake, dt) {
    if (!throttle && !brake) {
      this.velocity.multiplyScalar(
        Math.exp(-this.rollingResistance * dt)
      );
    }

    if (handbrake) {
      this.velocity.multiplyScalar(
        Math.exp(-0.9 * dt)
      );
    }

    // Prevent extremely small residual movement.
    if (this.velocity.lengthSq() < 0.0025) {
      this.velocity.set(0, 0, 0);
    }
  }

  enforceSpeedLimits() {
    const forwardSpeed = this.velocity.dot(this.forward);

    if (forwardSpeed > this.maxSpeed) {
      this.velocity.addScaledVector(
        this.forward,
        this.maxSpeed - forwardSpeed
      );
    }

    if (forwardSpeed < -this.maxReverseSpeed) {
      this.velocity.addScaledVector(
        this.forward,
        -this.maxReverseSpeed - forwardSpeed
      );
    }
  }

  update(car, deltaTime) {
    const dt = Math.min(deltaTime, 0.04);

    // Read controls.
    const throttle = this.isPressed('w', 'arrowup');
    const brake = this.isPressed('s', 'arrowdown');
    const handbrake = this.isPressed(' ');

    this.isHandbraking = handbrake;

    // Calculate current vehicle directions.
    this.updateDirections(car);

    let forwardSpeed = this.velocity.dot(this.forward);

    // Acceleration, braking and reverse.
    this.applyAcceleration(
      forwardSpeed,
      throttle,
      brake,
      dt
    );

    // Recalculate speed after acceleration.
    forwardSpeed = this.velocity.dot(this.forward);

    // Steering.
    this.applySteering(
      car,
      forwardSpeed,
      handbrake,
      dt
    );

    // Steering changes vehicle orientation.
    this.updateDirections(car);

    // Tire grip and drifting.
    this.applyGrip(handbrake, dt);

    // Rolling resistance and handbrake drag.
    this.applyResistance(
      throttle,
      brake,
      handbrake,
      dt
    );

    // Enforce forward and reverse speed limits.
    this.enforceSpeedLimits();

    // Move vehicle.
    car.group.position.addScaledVector(
      this.velocity,
      dt
    );

    // Keep vehicle on the circuit.
    this.enforceBoundaries(car);

    // Update signed forward speed.
    this.updateDirections(car);

    this.speed = this.velocity.dot(this.forward);

    return {
      speed: this.speed,
      steering: this.currentSteering,
      colliding: this.isColliding,
      handbrake: this.isHandbraking,
      braking: brake,
      throttle,
      progress: this.getTrackProgress(
        car.group.position
      ),
    };
  }

  dispose() {
    window.removeEventListener(
      'keydown',
      this.handleKeyDown
    );

    window.removeEventListener(
      'keyup',
      this.handleKeyUp
    );

    window.removeEventListener(
      'blur',
      this.handleBlur
    );

    this.keys.clear();
  }
}