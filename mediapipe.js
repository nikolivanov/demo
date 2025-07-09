import { Hands } from './node_modules/@mediapipe/hands/hands.js';
import { Camera } from './node_modules/@mediapipe/camera_utils/camera_utils.js';
import { landmarkMeshes, landmarkLines, landmarkData, ringMesh } from './scene.js';
import { HAND_CONNECTIONS } from './constants.js';

export function initMediaPipe() {
  const videoElement = document.getElementById('input_video');
  const hands = new Hands({
    locateFile: (file) => `./node_modules/@mediapipe/hands/${file}`
  });
  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  hands.onResults(onResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({image: videoElement});
    },
    width: 640,
    height: 480
  });
  camera.start();
}

function onResults(results) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    return;
  }
  const landmarks = results.multiHandLandmarks[0];

  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    landmarkData[i].set(lm.x - 0.5, -lm.y + 0.5, -lm.z);
    landmarkMeshes[i].position.copy(landmarkData[i]);
  }

  HAND_CONNECTIONS.forEach(([a, b], idx) => {
    const line = landmarkLines[idx];
    line.geometry.setFromPoints([landmarkData[a], landmarkData[b]]);
  });

  ringMesh.position.copy(landmarkData[13]);
}
