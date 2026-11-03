
import * as THREE from 'three';

export class Car {
  constructor(scene, position = new THREE.Vector3()) {
    this.scene = scene;
    this.group = new THREE.Group();

    // Visual body is separate from the physics root.
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    this.wheels = [];
    this.frontWheels = [];

    this.steeringAngle = 0;
    this.wheelRadius = 0.48;

    this.suspensionTime = 0;
    this.bodyRoll = 0;
    this.bodyPitch = 0;

    this.createMaterials();
    this.createBody();
    this.createCabin();
    this.createWheels();
    this.createLights();
    this.createDetails();

    this.group.position.copy(position);
    this.group.position.y = 0.12;

    this.scene.add(this.group);
  }

  createMaterials() {
    this.materials = {
      body: new THREE.MeshStandardMaterial({
        color: 0xd92336,
        metalness: 0.55,
        roughness: 0.28,
      }),

      bodyDark: new THREE.MeshStandardMaterial({
        color: 0x921b29,
        metalness: 0.35,
        roughness: 0.35,
      }),

      dark: new THREE.MeshStandardMaterial({
        color: 0x111820,
        roughness: 0.48,
      }),

      glass: new THREE.MeshStandardMaterial({
        color: 0x142b3c,
        metalness: 0.45,
        roughness: 0.16,
      }),

      tire: new THREE.MeshStandardMaterial({
        color: 0x15171a,
        roughness: 0.95,
      }),

      rim: new THREE.MeshStandardMaterial({
        color: 0xbfc8d2,
        metalness: 0.85,
        roughness: 0.23,
      }),

      rimDark: new THREE.MeshStandardMaterial({
        color: 0x343b45,
        metalness: 0.7,
        roughness: 0.3,
      }),

      headlight: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xdceeff,
        emissiveIntensity: 1.8,
        roughness: 0.2,
      }),

      brakeLight: new THREE.MeshStandardMaterial({
        color: 0xff2424,
        emissive: 0xff0000,
        emissiveIntensity: 1.5,
        roughness: 0.25,
      }),

      trim: new THREE.MeshStandardMaterial({
        color: 0x303740,
        metalness: 0.55,
        roughness: 0.35,
      }),

      grille: new THREE.MeshStandardMaterial({
        color: 0x080b10,
        roughness: 0.9,
      }),
    };
  }

  createBox(width, height, depth, material, position, parent = this.bodyGroup) {
    const geometry = new THREE.BoxGeometry(
      width,
      height,
      depth
    );

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
  }

  createBody() {
    // Main chassis.
    this.createBox(
      1.9, 0.48, 4.2,
      this.materials.body,
      [0, 0.65, 0]
    );

    // Front hood.
    this.createBox(
      1.84, 0.24, 1.3,
      this.materials.body,
      [0, 0.96, -1.35]
    );

    // Rear engine cover.
    this.createBox(
      1.84, 0.24, 0.95,
      this.materials.body,
      [0, 0.94, 1.55]
    );

    // Front and rear lower bumpers.
    this.createBox(
      1.95, 0.2, 0.2,
      this.materials.dark,
      [0, 0.52, -2.12]
    );

    this.createBox(
      1.95, 0.2, 0.2,
      this.materials.dark,
      [0, 0.52, 2.12]
    );

    // Front splitter.
    this.createBox(
      2.05, 0.08, 0.4,
      this.materials.dark,
      [0, 0.43, -2.05]
    );

    // Lower side skirts.
    for (const side of [-1, 1]) {
      this.createBox(
        0.12, 0.18, 2.5,
        this.materials.dark,
        [side * 0.96, 0.48, 0]
      );
    }

    // Front grille.
    this.createBox(
      0.9, 0.22, 0.045,
      this.materials.grille,
      [0, 0.68, -2.225]
    );

    // Hood vents.
    for (const side of [-1, 1]) {
      this.createBox(
        0.35, 0.025, 0.55,
        this.materials.bodyDark,
        [side * 0.52, 1.09, -1.35]
      );
    }

    // Rear diffuser.
    this.createBox(
      1.5, 0.12, 0.3,
      this.materials.trim,
      [0, 0.43, 2.12]
    );
  }

  createCabin() {
    // Cabin base.
    this.createBox(
      1.55, 0.15, 1.85,
      this.materials.body,
      [0, 1.12, 0.05]
    );

    // Roof.
    this.createBox(
      1.45, 0.12, 1.15,
      this.materials.body,
      [0, 1.85, 0.15]
    );

    // Windshield.
    const windshield = this.createBox(
      1.35, 0.68, 0.07,
      this.materials.glass,
      [0, 1.49, -0.57]
    );

    windshield.rotation.x = -0.25;

    // Rear window.
    const rearWindow = this.createBox(
      1.35, 0.62, 0.07,
      this.materials.glass,
      [0, 1.48, 0.82]
    );

    rearWindow.rotation.x = 0.25;

    // Side windows.
    for (const side of [-1, 1]) {
      this.createBox(
        0.06, 0.48, 1.05,
        this.materials.glass,
        [side * 0.78, 1.48, 0.12]
      );

      // Window pillars.
      this.createBox(
        0.08, 0.55, 0.09,
        this.materials.bodyDark,
        [side * 0.76, 1.48, -0.52]
      );

      this.createBox(
        0.08, 0.55, 0.09,
        this.materials.bodyDark,
        [side * 0.76, 1.48, 0.78]
      );
    }

    // Roof detail.
    this.createBox(
      0.12, 0.025, 1.12,
      this.materials.bodyDark,
      [0, 1.92, 0.15]
    );
  }

  createWheels() {
    const positions = [
      [-1.02, 0.48, -1.35],
      [1.02, 0.48, -1.35],
      [-1.02, 0.48, 1.35],
      [1.02, 0.48, 1.35],
    ];

    positions.forEach(([x, y, z], index) => {
      const isFront = index < 2;

      // Steering pivot.
      const steeringPivot = new THREE.Group();

      steeringPivot.position.set(x, y, z);
      this.group.add(steeringPivot);

      // Independent wheel rotation.
      const spinGroup = new THREE.Group();
      steeringPivot.add(spinGroup);

      // Tire.
      const tire = new THREE.Mesh(
        new THREE.CylinderGeometry(
          this.wheelRadius,
          this.wheelRadius,
          0.3,
          20
        ),
        this.materials.tire
      );

      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      tire.receiveShadow = true;

      spinGroup.add(tire);

      // Main alloy rim.
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.29,
          0.29,
          0.315,
          16
        ),
        this.materials.rim
      );

      rim.rotation.z = Math.PI / 2;
      spinGroup.add(rim);

      // Dark inner rim.
      const innerRim = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.21,
          0.21,
          0.325,
          12
        ),
        this.materials.rimDark
      );

      innerRim.rotation.z = Math.PI / 2;
      spinGroup.add(innerRim);

      // Central hub.
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.1,
          0.1,
          0.34,
          12
        ),
        this.materials.dark
      );

      hub.rotation.z = Math.PI / 2;
      spinGroup.add(hub);

      // Alloy spokes on both sides of the wheel.
      for (const face of [-1, 1]) {
        for (let spoke = 0; spoke < 5; spoke++) {
          const angle = (spoke / 5) * Math.PI * 2;

          const spokeMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.035, 0.34, 0.075),
            this.materials.rim
          );

          spokeMesh.position.set(
            face * 0.17,
            Math.cos(angle) * 0.15,
            Math.sin(angle) * 0.15
          );

          spokeMesh.rotation.x = angle;
          spinGroup.add(spokeMesh);
        }
      }

      // Wheel references.
      const wheel = {
        steeringPivot,
        spinGroup,
        isFront,
      };

      this.wheels.push(wheel);

      if (isFront) {
        this.frontWheels.push(wheel);
      }
    });
  }

  createLights() {
    for (const side of [-1, 1]) {
      // Headlights.
      this.createBox(
        0.48, 0.14, 0.08,
        this.materials.headlight,
        [side * 0.58, 0.82, -2.13]
      );

      // Rear lights.
      this.createBox(
        0.48, 0.15, 0.08,
        this.materials.brakeLight,
        [side * 0.58, 0.85, 2.13]
      );

      // Side indicators.
      this.createBox(
        0.08, 0.1, 0.22,
        this.materials.headlight,
        [side * 0.97, 0.75, -1.25]
      );
    }
  }

  createDetails() {
    // Rear spoiler.
    this.createBox(
      1.85, 0.1, 0.28,
      this.materials.dark,
      [0, 1.3, 1.95]
    );

    // Spoiler supports.
    for (const side of [-1, 1]) {
      this.createBox(
        0.1, 0.38, 0.1,
        this.materials.dark,
        [side * 0.65, 1.12, 1.95]
      );

      // Side mirrors.
      this.createBox(
        0.22, 0.12, 0.2,
        this.materials.bodyDark,
        [side * 0.92, 1.5, -0.48]
      );

      // Mirror stems.
      this.createBox(
        0.06, 0.16, 0.08,
        this.materials.dark,
        [side * 0.85, 1.42, -0.48]
      );

      // Exhaust pipes.
      const exhaust = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 0.22, 10),
        this.materials.rimDark
      );

      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(side * 0.55, 0.48, 2.2);
      exhaust.castShadow = true;

      this.bodyGroup.add(exhaust);
    }

    // Rear light bar.
    this.createBox(
      1.45, 0.06, 0.06,
      this.materials.brakeLight,
      [0, 0.89, 2.18]
    );

    // Front lower air intakes.
    for (const side of [-1, 1]) {
      this.createBox(
        0.34, 0.12, 0.04,
        this.materials.dark,
        [side * 0.68, 0.57, -2.22]
      );
    }
  }

  setRotation(angle) {
    this.group.rotation.y = angle;
  }

  setPosition(position) {
    this.group.position.copy(position);
  }

  update(deltaTime, speed = 0, steering = 0) {
    const dt = Math.min(deltaTime, 0.05);

    // Smooth steering response.
    const targetAngle = THREE.MathUtils.clamp(
      steering * 0.36,
      -0.36,
      0.36
    );

    const steeringSmoothing = 1 - Math.exp(-14 * dt);

    this.steeringAngle +=
      (targetAngle - this.steeringAngle) * steeringSmoothing;

    // Only the front wheels steer.
    this.frontWheels.forEach(wheel => {
      wheel.steeringPivot.rotation.y = this.steeringAngle;
    });

    // All wheels spin around their axles.
    const wheelRotation = (speed * dt) / this.wheelRadius;

    this.wheels.forEach(wheel => {
      wheel.spinGroup.rotation.x += wheelRotation;
    });

    // Subtle body movement.
    const speedFactor = THREE.MathUtils.clamp(
      Math.abs(speed) / 38,
      0,
      1
    );

    this.suspensionTime += dt * (3 + speedFactor * 5);

    const suspensionBounce =
      Math.sin(this.suspensionTime) * 0.012 * speedFactor;

    const targetRoll = -steering * 0.055 * speedFactor;
    const targetPitch = THREE.MathUtils.clamp(
      -speed / 38,
      -1,
      1
    ) * 0.018;

    const bodySmoothing = 1 - Math.exp(-7 * dt);

    this.bodyRoll +=
      (targetRoll - this.bodyRoll) * bodySmoothing;

    this.bodyPitch +=
      (targetPitch - this.bodyPitch) * bodySmoothing;

    this.bodyGroup.rotation.z = this.bodyRoll;
    this.bodyGroup.rotation.x = this.bodyPitch;
    this.bodyGroup.position.y = suspensionBounce;
  }

  dispose() {
    this.scene.remove(this.group);

    this.group.traverse(object => {
      if (object.isMesh) {
        object.geometry.dispose();
      }
    });

    Object.values(this.materials).forEach(material => {
      material.dispose();
    });
  }
}