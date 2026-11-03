
import * as THREE from 'three';

export class ChaseCamera {
  constructor(camera) {
    this.camera = camera;

    // Base camera positioning.
    this.baseOffset = new THREE.Vector3(0, 6, 12);
    this.lookAhead = new THREE.Vector3(0, 1.3, -6);

    this.desiredPosition = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();

    this.previousCarPosition = new THREE.Vector3();
    this.carVelocity = new THREE.Vector3();

    this.forward = new THREE.Vector3();
    this.right = new THREE.Vector3();

    this.initialized = false;

    // Camera movement settings.
    this.followSpeed = 5;
    this.lookSpeed = 7;

    // Dynamic camera state.
    this.currentSpeed = 0;
    this.steeringEffect = 0;
    this.lastHeading = 0;
  }

  update(car, deltaTime) {
    const dt = Math.min(deltaTime, 0.05);

    const carPosition = car.group.position;
    const rotation = car.group.rotation.y;

    if (!this.initialized) {
      this.previousCarPosition.copy(carPosition);
      this.lastHeading = rotation;

      this.camera.position
        .copy(this.baseOffset)
        .applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          rotation
        )
        .add(carPosition);

      this.camera.lookAt(
        carPosition.x,
        carPosition.y + 1.3,
        carPosition.z
      );

      this.initialized = true;
    }

    // Estimate car velocity from movement.
    this.carVelocity
      .copy(carPosition)
      .sub(this.previousCarPosition)
      .divideScalar(Math.max(dt, 0.001));

    this.previousCarPosition.copy(carPosition);

    const actualSpeed = this.carVelocity.length();

    // Normalize speed for camera effects.
    const speedFactor = THREE.MathUtils.clamp(
      actualSpeed / 38,
      0,
      1
    );

    this.currentSpeed = THREE.MathUtils.damp(
      this.currentSpeed,
      speedFactor,
      3,
      dt
    );

    // Detect turning direction.
    let headingDifference = rotation - this.lastHeading;

    while (headingDifference > Math.PI) {
      headingDifference -= Math.PI * 2;
    }

    while (headingDifference < -Math.PI) {
      headingDifference += Math.PI * 2;
    }

    this.lastHeading = rotation;

    this.steeringEffect = THREE.MathUtils.damp(
      this.steeringEffect,
      THREE.MathUtils.clamp(headingDifference * 5, -1, 1),
      5,
      dt
    );

    // Dynamic camera distance and height.
    const dynamicOffset = this.baseOffset.clone();

    dynamicOffset.z += this.currentSpeed * 2.5;
    dynamicOffset.y -= this.currentSpeed * 0.8;
    dynamicOffset.x += this.steeringEffect * 0.65;

    // Rotate camera offset with the car.
    this.desiredPosition
      .copy(dynamicOffset)
      .applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        rotation
      )
      .add(carPosition);

    // Look farther ahead as the car gains speed.
    const dynamicLookAhead = this.lookAhead.clone();

    dynamicLookAhead.z -= this.currentSpeed * 3;

    dynamicLookAhead.x -= this.steeringEffect * 0.8;

    this.lookTarget
      .copy(dynamicLookAhead)
      .applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        rotation
      )
      .add(carPosition);

    // Smooth camera movement.
    const positionSmoothing =
      1 - Math.exp(-this.followSpeed * dt);

    const lookSmoothing =
      1 - Math.exp(-this.lookSpeed * dt);

    this.camera.position.lerp(
      this.desiredPosition,
      positionSmoothing
    );

    // Smoothly update camera direction.
    const currentTarget = this.camera.position.clone();
    currentTarget.add(
      this.camera.getWorldDirection(new THREE.Vector3())
        .multiplyScalar(10)
    );

    currentTarget.lerp(
      this.lookTarget,
      lookSmoothing
    );

    this.camera.lookAt(currentTarget);
  }
}