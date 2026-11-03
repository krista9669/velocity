
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
function createTrees(sceneGroup) {
  const treeCount = 36;

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
    const angle = (i / treeCount) * Math.PI * 2;

    const radiusX = 94 + (i % 3) * 7;
    const radiusZ = 94 + (i % 4) * 6;

    const x = Math.cos(angle) * radiusX;
    const z = Math.sin(angle) * radiusZ;

    const scale = 0.8 + (i % 5) * 0.12;

    dummy.position.set(x, 0.7, z);
    dummy.scale.setScalar(scale);
    dummy.rotation.y = angle;
    dummy.updateMatrix();

    trunks.setMatrixAt(i, dummy.matrix);

    dummy.position.set(x, 4.2 * scale, z);
    dummy.scale.setScalar(scale);
    dummy.rotation.y = angle * 1.7;
    dummy.updateMatrix();

    leaves.setMatrixAt(i, dummy.matrix);
  }

  trunks.castShadow = true;
  leaves.castShadow = true;

  sceneGroup.add(trunks, leaves);
}

export function createTrack(scene) {
  const trackGroup = new THREE.Group();

  // Closed elliptical racing circuit.
  const points = [
    new THREE.Vector3(0, 0, 65),
    new THREE.Vector3(32, 0, 56),
    new THREE.Vector3(57, 0, 30),
    new THREE.Vector3(65, 0, 0),
    new THREE.Vector3(57, 0, -30),
    new THREE.Vector3(32, 0, -56),
    new THREE.Vector3(0, 0, -65),
    new THREE.Vector3(-32, 0, -56),
    new THREE.Vector3(-57, 0, -30),
    new THREE.Vector3(-65, 0, 0),
    new THREE.Vector3(-57, 0, 30),
    new THREE.Vector3(-32, 0, 56),
  ];

  const curve = new THREE.CatmullRomCurve3(
    points,
    true,
    'catmullrom',
    0.5
  );

  // Materials.
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x303640,
    roughness: 0.92,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  const shoulderMaterial = new THREE.MeshStandardMaterial({
    color: 0x555b63,
    roughness: 1,
    side: THREE.DoubleSide,
  });

  const barrierMaterial = new THREE.MeshStandardMaterial({
    color: 0xd9dce0,
    roughness: 0.7,
    metalness: 0.05,
  });

  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x56844f,
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
    color: 0xf2f2f2,
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

  // Low-poly scenery.
  createTrees(trackGroup);

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
  };
}