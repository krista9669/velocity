
import * as THREE from 'three';

const ROAD_WIDTH = 12;
const ROAD_SEGMENTS = 500;
const BARRIER_OFFSET = ROAD_WIDTH / 2 + 0.7;

const UP = new THREE.Vector3(0, 1, 0);

// Creates a strip of geometry following the track.
function createTrackStrip(curve, innerOffset, outerOffset, y, material) {
  const vertices = [];
  const indices = [];

  for (let i = 0; i <= ROAD_SEGMENTS; i++) {
    const t = i / ROAD_SEGMENTS;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    const side = new THREE.Vector3()
      .crossVectors(tangent, UP)
      .normalize();

    const inner = point.clone()
      .addScaledVector(side, innerOffset);

    const outer = point.clone()
      .addScaledVector(side, outerOffset);

    inner.y = y;
    outer.y = y;

    vertices.push(
      inner.x, inner.y, inner.z,
      outer.x, outer.y, outer.z
    );

    if (i < ROAD_SEGMENTS) {
      const a = i * 2;

      indices.push(
        a, a + 1, a + 2,
        a + 1, a + 3, a + 2
      );
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;

  return mesh;
}

// Creates a continuous line along one side of the circuit.
function createEdgeLine(curve, offset, material) {
  const points = [];

  for (let i = 0; i <= ROAD_SEGMENTS; i++) {
    const t = i / ROAD_SEGMENTS;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    const side = new THREE.Vector3()
      .crossVectors(tangent, UP)
      .normalize();

    point.addScaledVector(side, offset);
    point.y += 0.035;

    points.push(point);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return new THREE.Line(geometry, material);
}

// Adds lightweight support posts underneath the barriers.
function createBarrierSupports(curve, offset, sceneGroup) {
  const postGeometry = new THREE.BoxGeometry(0.18, 0.9, 0.18);

  const postMaterial = new THREE.MeshStandardMaterial({
    color: 0x777e88,
    roughness: 0.8,
  });

  const count = 50;

  const posts = new THREE.InstancedMesh(
    postGeometry,
    postMaterial,
    count
  );

  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    const side = new THREE.Vector3()
      .crossVectors(tangent, UP)
      .normalize();

    point.addScaledVector(side, offset);
    point.y = 0.25;

    dummy.position.copy(point);
    dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
    dummy.updateMatrix();

    posts.setMatrixAt(i, dummy.matrix);
  }

  posts.castShadow = true;
  posts.receiveShadow = true;

  sceneGroup.add(posts);
}

// Adds a simple low-poly tree environment.
function createTrees(sceneGroup, curve) {
  const treeCount = 48;

  const trunkGeometry = new THREE.CylinderGeometry(
    0.35,
    0.5,
    3,
    5
  );

  const leavesGeometry = new THREE.ConeGeometry(
    2.2,
    5,
    6
  );

  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x765039,
    roughness: 1,
  });

  const leavesMaterial = new THREE.MeshStandardMaterial({
    color: 0x326d3d,
    roughness: 1,
  });

  const trunks = new THREE.InstancedMesh(
    trunkGeometry,
    trunkMaterial,
    treeCount
  );

  const leaves = new THREE.InstancedMesh(
    leavesGeometry,
    leavesMaterial,
    treeCount
  );

  const dummy = new THREE.Object3D();

  for (let i = 0; i < treeCount; i++) {
    const t = i / treeCount;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const side = new THREE.Vector3()
      .crossVectors(tangent, UP)
      .normalize();
    const sideSign = i % 2 === 0 ? 1 : -1;
    point.addScaledVector(side, sideSign * (20 + (i % 4) * 5));

    const scale = 0.8 + (i % 5) * 0.12;
    const treeRotation = Math.atan2(tangent.x, tangent.z);

    dummy.position.set(point.x, 0.7, point.z);
    dummy.scale.setScalar(scale);
    dummy.rotation.y = treeRotation;
    dummy.updateMatrix();

    trunks.setMatrixAt(i, dummy.matrix);

    dummy.position.set(point.x, 4.2 * scale, point.z);
    dummy.scale.setScalar(scale);
    dummy.rotation.y = treeRotation * 1.7;
    dummy.updateMatrix();

    leaves.setMatrixAt(i, dummy.matrix);
  }

  trunks.castShadow = true;
  leaves.castShadow = true;

  sceneGroup.add(trunks, leaves);
}

function createCanyonScenery(sceneGroup, curve) {
  const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    flatShading: true,
  });
  const rockCount = 48;
  const rocks = new THREE.InstancedMesh(
    rockGeometry,
    rockMaterial,
    rockCount
  );
  const dummy = new THREE.Object3D();
  const rockColors = [0x9d5038, 0xb66b46, 0x7d4639, 0xc48153];

  for (let i = 0; i < rockCount; i++) {
    const trackIndex = Math.floor(i / 2);
    const t = trackIndex / (rockCount / 2);
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const side = new THREE.Vector3()
      .crossVectors(tangent, UP)
      .normalize();
    const direction = i % 2 === 0 ? 1 : -1;
    const distance = 17 + (trackIndex % 4) * 4;
    const height = 13 + (trackIndex % 5) * 5;

    point.addScaledVector(side, direction * distance);
    dummy.position.set(point.x, height * 0.38, point.z);
    dummy.scale.set(
      7 + (trackIndex % 3) * 3,
      height,
      9 + (trackIndex % 4) * 2
    );
    dummy.rotation.set(
      (trackIndex % 3) * 0.04,
      trackIndex * 1.7,
      ((trackIndex % 5) - 2) * 0.035
    );
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);
    rocks.setColorAt(i, new THREE.Color(rockColors[trackIndex % rockColors.length]));
  }

  rocks.castShadow = true;
  rocks.receiveShadow = true;
  sceneGroup.add(rocks);
}

export function createTrack(scene, trackName = 'classic') {
  const trackGroup = new THREE.Group();

  const trackVariants = {
    classic: [
      new THREE.Vector3(0, 0, 82),
      new THREE.Vector3(42, 0, 82),
      new THREE.Vector3(74, 0, 64),
      new THREE.Vector3(88, 0, 34),
      new THREE.Vector3(88, 0, -34),
      new THREE.Vector3(74, 0, -64),
      new THREE.Vector3(42, 0, -82),
      new THREE.Vector3(-42, 0, -82),
      new THREE.Vector3(-74, 0, -64),
      new THREE.Vector3(-88, 0, -34),
      new THREE.Vector3(-88, 0, 34),
      new THREE.Vector3(-74, 0, 64),
      new THREE.Vector3(-42, 0, 82),
    ],
    canyon: [
      new THREE.Vector3(0, 0, 78),
      new THREE.Vector3(48, 0, 72),
      new THREE.Vector3(78, 0, 48),
      new THREE.Vector3(70, 0, 20),
      new THREE.Vector3(42, 0, 8),
      new THREE.Vector3(28, 0, -14),
      new THREE.Vector3(58, 0, -42),
      new THREE.Vector3(48, 0, -72),
      new THREE.Vector3(16, 0, -82),
      new THREE.Vector3(-18, 0, -62),
      new THREE.Vector3(-56, 0, -78),
      new THREE.Vector3(-82, 0, -48),
      new THREE.Vector3(-64, 0, -16),
      new THREE.Vector3(-38, 0, 4),
      new THREE.Vector3(-46, 0, 34),
      new THREE.Vector3(-16, 0, 68),
    ],
  };

  const points = trackVariants[trackName] || trackVariants.classic;

  const curve = new THREE.CatmullRomCurve3(
    points,
    true,
    'catmullrom',
    0.5
  );

  // Materials.
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: trackName === 'canyon' ? 0x514746 : 0x303640,
    roughness: 0.92,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  const shoulderMaterial = new THREE.MeshStandardMaterial({
    color: trackName === 'canyon' ? 0x9a6146 : 0x555b63,
    roughness: 1,
    side: THREE.DoubleSide,
  });

  const barrierMaterial = new THREE.MeshStandardMaterial({
    color: trackName === 'canyon' ? 0xc2784c : 0xd9dce0,
    roughness: 0.7,
    metalness: 0.05,
  });

  const groundMaterial = new THREE.MeshStandardMaterial({
    color: trackName === 'canyon' ? 0xb88759 : 0x56844f,
    roughness: 1,
  });

  // Ground.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    groundMaterial
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.8;
  ground.receiveShadow = true;

  trackGroup.add(ground);

  // Main road geometry.
  const road = createTrackStrip(
    curve,
    ROAD_WIDTH / 2,
    -ROAD_WIDTH / 2,
    0,
    roadMaterial
  );

  road.castShadow = false;
  trackGroup.add(road);

  // Narrow paved shoulders outside both road edges.
  for (const direction of [-1, 1]) {
    const shoulder = createTrackStrip(
      curve,
      direction * (ROAD_WIDTH / 2),
      direction * (ROAD_WIDTH / 2 + 0.65),
      -0.015,
      shoulderMaterial
    );

    trackGroup.add(shoulder);
  }

  // Clean white road-edge markings.
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: trackName === 'canyon' ? 0xffc073 : 0xf2f2f2,
  });

  trackGroup.add(
    createEdgeLine(curve, ROAD_WIDTH / 2 - 0.12, edgeMaterial),
    createEdgeLine(curve, -ROAD_WIDTH / 2 + 0.12, edgeMaterial)
  );

  // Continuous safety barriers on both sides.
  for (const direction of [-1, 1]) {
    const barrierPoints = [];

    for (let i = 0; i <= ROAD_SEGMENTS; i++) {
      const t = i / ROAD_SEGMENTS;

      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();

      const side = new THREE.Vector3()
        .crossVectors(tangent, UP)
        .normalize();

      point.addScaledVector(
        side,
        direction * BARRIER_OFFSET
      );

      point.y = 0.7;

      barrierPoints.push(point);
    }

    const barrierCurve = new THREE.CatmullRomCurve3(
      barrierPoints,
      true
    );

    const barrierGeometry = new THREE.TubeGeometry(
      barrierCurve,
      ROAD_SEGMENTS,
      0.32,
      8,
      true
    );

    const barrier = new THREE.Mesh(
      barrierGeometry,
      barrierMaterial
    );

    barrier.castShadow = true;
    barrier.receiveShadow = true;

    trackGroup.add(barrier);

    createBarrierSupports(
      curve,
      direction * BARRIER_OFFSET,
      trackGroup
    );
  }

  if (trackName === 'canyon') {
    createCanyonScenery(trackGroup, curve);
  } else {
    createTrees(trackGroup, curve);
  }

  // Starting / finish line.
  const startPoint = curve.getPointAt(0);
  const startTangent = curve.getTangentAt(0).normalize();

  const startSide = new THREE.Vector3()
    .crossVectors(startTangent, UP)
    .normalize();

  const lineVertices = [
    startPoint.clone().addScaledVector(
      startSide,
      ROAD_WIDTH / 2
    ),
    startPoint.clone().addScaledVector(
      startSide,
      -ROAD_WIDTH / 2
    ),
  ];

  lineVertices.forEach(point => {
    point.y += 0.06;
  });

  const startLineGeometry = new THREE.BufferGeometry()
    .setFromPoints(lineVertices);

  const startLine = new THREE.Line(
    startLineGeometry,
    new THREE.LineBasicMaterial({
      color: 0xffffff,
    })
  );

  trackGroup.add(startLine);

  // Small white starting marker.
  const marker = new THREE.Mesh(
    new THREE.BoxGeometry(
      ROAD_WIDTH,
      0.12,
      0.35
    ),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
    })
  );

  marker.position.copy(startPoint);
  marker.position.y += 0.08;

  marker.rotation.y = Math.atan2(
    startTangent.x,
    startTangent.z
  );

  marker.receiveShadow = true;

  trackGroup.add(marker);

  scene.add(trackGroup);

  return {
    group: trackGroup,
    curve,
    roadWidth: ROAD_WIDTH,
    startPosition: startPoint.clone(),
    startTangent: startTangent.clone(),
    name: trackName,
  };
}