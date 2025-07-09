import * as THREE from 'three';
import { landmarkMeshes, landmarkData, handSkeleton, landmarkLines, ringMesh } from './scene.js';
import { WORLD_SCALE, HAND_CONNECTIONS } from './constants.js';
import { applyHandPose } from './pose.js';

export function initMediaPipe() {
  const videoElement = document.getElementById('input_video');
  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });
  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.9,
    minTrackingConfidence: 0.9
  });
  hands.onResults(onResults);

  const cameraFeed = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });
  cameraFeed.start();
}

function onResults(results) {
  const worldLandmarks = results.multiHandWorldLandmarks?.[0];
  if (!worldLandmarks) return;

  // Map raw landmarks to THREE.Vector3 positions
  const positions = worldLandmarks.map(w =>
    new THREE.Vector3(w.x * WORLD_SCALE, w.y * WORLD_SCALE, w.z * WORLD_SCALE)
  );

  // Directly assign positions to meshes and data
  positions.forEach((pos, i) => {
    landmarkMeshes[i].position.copy(pos);
    landmarkData[i].copy(pos);
  });

  // Apply hand pose to skeleton
  if (handSkeleton) {
    applyHandPose(handSkeleton, landmarkData);
  }

  // Update landmark connecting lines
  landmarkLines.forEach((line, idx) => {
    const [a, b] = HAND_CONNECTIONS[idx];
    line.geometry.setFromPoints([
      landmarkMeshes[a].position,
      landmarkMeshes[b].position
    ]);
    line.geometry.attributes.position.needsUpdate = true;
  });

  // Position and orient ring mesh at the midpoint of landmarks 13 and 14
  const p13 = landmarkMeshes[13].position;
  const p14 = landmarkMeshes[14].position;
  const mid = p13.clone().add(p14).multiplyScalar(0.5);
  ringMesh.position.copy(mid);

  const axisZ = p14.clone().sub(p13);
  const sideRef = landmarkMeshes[9].position.clone().sub(p13);
  if (axisZ.lengthSq() > 1e-6 && sideRef.lengthSq() > 1e-6) {
    const z = axisZ.clone().normalize();
    const side = sideRef.clone().normalize();
    const x = side.clone().cross(z).normalize();
    const y = z.clone().cross(x).normalize();
    const m = new THREE.Matrix4().makeBasis(x, y, z);
    const q = new THREE.Quaternion().setFromRotationMatrix(m);
    ringMesh.quaternion.copy(q);
  }
}
