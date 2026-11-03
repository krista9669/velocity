
import * as THREE from 'three';

const CAR_STYLES = {
  vortex: {
    bodyColor: 0xd92336,
    bodyDarkColor: 0x921b29,
    accentColor: 0xff523f,
    bodyScale: [1, 1, 1],
    roofScale: [1, 1, 1],
    wheelTrack: 1,
    wheelBase: 1,
    wheelRadius: 0.48,
    spoilerWidth: 1.85,
    spoilerY: 1.3,
    spoilerSupportHeight: 0.38,
  },
  thunder: {
    bodyColor: 0xffa51e,
    bodyDarkColor: 0xa94e12,
    accentColor: 0xffe26b,
    bodyScale: [1.08, 1.08, 1.04],
    roofScale: [1.08, 1.12, 1.04],
    wheelTrack: 1.08,
    wheelBase: 1.04,
    wheelRadius: 0.52,
    spoilerWidth: 2.05,
    spoilerY: 1.34,
    spoilerSupportHeight: 0.34,
  },
  apex: {
    bodyColor: 0x16c6d5,
    bodyDarkColor: 0x087687,
    accentColor: 0x8cfff3,
    bodyScale: [0.94, 0.78, 1.14],
    roofScale: [0.82, 0.7, 1.08],
    wheelTrack: 0.98,
    wheelBase: 1.1,
    wheelRadius: 0.44,
    spoilerWidth: 2.15,
    spoilerY: 1.53,
    spoilerSupportHeight: 0.58,
  },
};

export class Car {
  constructor(scene, position = new THREE.Vector3(), carName = 'vortex') {
    this.scene = scene;
    this.style = CAR_STYLES[carName] || CAR_STYLES.vortex;
    this.group = new THREE.Group();

    // Visual body is separate from the physics root.
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    this.wheels = [];
    this.frontWheels = [];
    this.headlights = [];
    this.brakeLights = [];

    this.steeringAngle = 0;
    this.wheelRadius = this.style.wheelRadius;
    this.bodyGroup.scale.set(...this.style.bodyScale);

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
        color: this.style.bodyColor,
        metalness: 0.55,
        roughness: 0.28,
      }),

      bodyDark: new THREE.MeshStandardMaterial({
        color: this.style.bodyDarkColor,
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

      accent: new THREE.MeshStandardMaterial({
        color: this.style.accentColor,
        metalness: 0.42,
        roughness: 0.32,
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
    const isApex = this.style === CAR_STYLES.apex;

    // Main chassis.
    this.createBox(
      isApex ? 1.72 : 1.9, 0.48, isApex ? 4.35 : 4.2,
      this.materials.body,
      [0, 0.65, 0]
    );

    // Front hood.
    this.createBox(
      isApex ? 1.35 : 1.84,
      isApex ? 0.16 : 0.24,
      isApex ? 1.55 : 1.3,
      this.materials.body,
      [0, isApex ? 0.91 : 0.96, isApex ? -1.38 : -1.35]
    );

    if (isApex) {
      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.78, 1.55, 4),
        this.materials.body
      );
      nose.rotation.x = -Math.PI / 2;
      nose.position.set(0, 0.74, -1.8);
      nose.castShadow = true;
      nose.receiveShadow = true;
      this.bodyGroup.add(nose);
    }

    // Rear engine cover.
    this.createBox(
      1.84, 0.24, 0.95,
      this.materials.body,
      [0, 0.94, 1.55]
    );

    // Front and rear lower bumpers.
    this.createBox(
      isApex ? 1.5 : 1.95, 0.2, 0.2,
      this.materials.dark,
      [0, 0.52, isApex ? -2.28 : -2.12]
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
    const isApex = this.style === CAR_STYLES.apex;

    // Cabin base.
    this.createBox(
      isApex ? 1.12 : 1.55,
      0.15,
      isApex ? 1.45 : 1.85,
      this.materials.body,
      [0, isApex ? 1.02 : 1.12, isApex ? 0.18 : 0.05]
    );

    // Roof.
    const roof = this.createBox(
      isApex ? 0.92 : 1.45,
      0.12,
      isApex ? 0.95 : 1.15,
      this.materials.body,
      [0, isApex ? 1.53 : 1.85, 0.15]
    );
    roof.scale.set(...this.style.roofScale);

    // Windshield.
    const windshield = this.createBox(
      isApex ? 0.84 : 1.35,
      isApex ? 0.43 : 0.68,
      0.07,
      this.materials.glass,
      [0, isApex ? 1.29 : 1.49, isApex ? -0.38 : -0.57]
    );

    windshield.rotation.x = -0.25;

    // Rear window.
    const rearWindow = this.createBox(
      isApex ? 0.84 : 1.35,
      isApex ? 0.4 : 0.62,
      0.07,
      this.materials.glass,
      [0, isApex ? 1.28 : 1.48, isApex ? 0.69 : 0.82]
    );

    rearWindow.rotation.x = 0.25;

    // Side windows.
    for (const side of [-1, 1]) {
      this.createBox(
        isApex ? 0.045 : 0.06,
        isApex ? 0.34 : 0.48,
        isApex ? 0.82 : 1.05,
        this.materials.glass,
        [side * (isApex ? 0.55 : 0.78), isApex ? 1.27 : 1.48, 0.12]
      );

      // Window pillars.
      this.createBox(
        0.08, isApex ? 0.38 : 0.55, 0.09,
        this.materials.bodyDark,
        [side * (isApex ? 0.54 : 0.76), isApex ? 1.28 : 1.48, isApex ? -0.34 : -0.52]
      );

      this.createBox(
        0.08, isApex ? 0.38 : 0.55, 0.09,
        this.materials.bodyDark,
        [side * (isApex ? 0.54 : 0.76), isApex ? 1.28 : 1.48, isApex ? 0.69 : 0.78]
      );
    }

    // Roof detail.
    this.createBox(
      0.12, 0.025, isApex ? 0.9 : 1.12,
      this.materials.bodyDark,
      [0, isApex ? 1.6 : 1.92, 0.15]
    );
  }

  createWheels() {
    const positions = [
      [-1.02 * this.style.wheelTrack, 0.48, -1.35 * this.style.wheelBase],
      [1.02 * this.style.wheelTrack, 0.48, -1.35 * this.style.wheelBase],
      [-1.02 * this.style.wheelTrack, 0.48, 1.35 * this.style.wheelBase],
      [1.02 * this.style.wheelTrack, 0.48, 1.35 * this.style.wheelBase],
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
      const headlight = this.createBox(
        0.48, 0.14, 0.08,
        this.materials.headlight,
        [side * 0.58, 0.82, -2.13]
      );
      this.headlights.push(headlight);

      // Rear lights.
      const brakeLight = this.createBox(
        0.48, 0.15, 0.08,
        this.materials.brakeLight,
        [side * 0.58, 0.85, 2.13]
      );
      this.brakeLights.push(brakeLight);

      // Side indicators.
      this.createBox(
        0.08, 0.1, 0.22,
        this.materials.headlight,
        [side * 0.97, 0.75, -1.25]
      );
    }
  }

  createDetails() {
    const spoilerY = this.style.spoilerY;
    const supportHeight = this.style.spoilerSupportHeight;

    this.createBox(
      this.style.spoilerWidth, 0.1, 0.28,
      this.materials.dark,
      [0, spoilerY, 1.95]
    );

    for (const side of [-1, 1]) {
      this.createBox(
        0.1, supportHeight, 0.1,
        this.materials.dark,
        [side * 0.65, spoilerY - supportHeight / 2 + 0.04, 1.95]
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

    if (this.style === CAR_STYLES.thunder) {
      for (const side of [-1, 1]) {
        this.createBox(
          0.14, 0.025, 0.9,
          this.materials.accent,
          [side * 0.28, 1.095, -1.35]
        );
        this.createBox(
          0.28, 0.25, 1.2,
          this.materials.bodyDark,
          [side * 0.84, 0.88, -1.15]
        );
      }
    } else if (this.style === CAR_STYLES.apex) {
      this.createBox(
        0.18, 0.035, 1.5,
        this.materials.accent,
        [0, 1.065, -1.3]
      );
      this.createBox(
        2.2, 0.08, 0.42,
        this.materials.accent,
        [0, 0.43, -2.13]
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

    const headlightIntensity = 1.2 + Math.min(Math.abs(speed) / 40, 1) * 1.6;
    this.headlights.forEach(light => {
      light.material.emissiveIntensity = headlightIntensity;
    });

    const brakeIntensity = speed < -0.5
      ? 3.2
      : 0.8 + Math.max(0, 18 - Math.abs(speed)) * 0.08;

    this.brakeLights.forEach(light => {
      light.material.emissiveIntensity = brakeIntensity;
    });

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