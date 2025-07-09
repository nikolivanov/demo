import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HAND_CONNECTIONS } from './constants.js';

export let handSkeleton;

const SHOW_HAND_MODEL = false;

let scene;
let camera;
let renderer;
let controls;
let handModel;
export const landmarkMeshes = [];
export const landmarkData = [];
export const landmarkLines = [];
export let ringMesh;
let showLandmarks = false;

export function getShowLandmarks() {
  return showLandmarks;
}

export function setShowLandmarks(value) {
  showLandmarks = value;
  landmarkMeshes.forEach((m) => (m.visible = value));
  landmarkLines.forEach((l) => (l.visible = value));
}

export function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 0, 2);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(0, 1, 1);
  scene.add(dirLight);

  let loadPromise = Promise.resolve();
  if (SHOW_HAND_MODEL) {
    const loader = new GLTFLoader();
    loadPromise = new Promise((resolve) => {
      loader.load('./model/Hand_R.gltf', (gltf) => {
        handModel = gltf.scene;
        handModel.traverse((o) => (o.renderOrder = 0));
        scene.add(handModel);

        const skinned = handModel.getObjectByProperty('isSkinnedMesh', true);
        if (skinned) {
          handSkeleton = skinned.skeleton;
          // prepareSkeleton(handSkeleton);
        }

        resolve();
      });
    });
  }

  const geom = new THREE.SphereGeometry(0.01, 16, 16);
  const mat = new THREE.MeshStandardMaterial({ color: 0xff5500, depthTest: false, depthWrite: false });
  for (let i = 0; i < 21; i++) {
    const mesh = new THREE.Mesh(geom, mat);
    mesh.visible = showLandmarks;
    mesh.renderOrder = 1;
    scene.add(mesh);
    landmarkMeshes.push(mesh);
    landmarkData.push(new THREE.Vector3());
  }

  const lineMat = new THREE.LineBasicMaterial({ color: 0x00ff00, depthTest: false, depthWrite: false });
  HAND_CONNECTIONS.forEach(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(geo, lineMat);
    line.visible = showLandmarks;
    line.renderOrder = 1;
    scene.add(line);
    landmarkLines.push(line);
  });

  ringMesh = new THREE.Group();
  ringMesh.renderOrder = 1;
  ringMesh.scale.setScalar(0.003); // scale down the ring ~100 times
  scene.add(ringMesh);

  // create a simple torus geometry as a placeholder for the ring
  const torus = new THREE.TorusGeometry(0.1, 0.03, 16, 100);
  const torusMat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
  const torusMesh = new THREE.Mesh(torus, torusMat);
  torusMesh.rotation.z = -Math.PI / 2;
  ringMesh.add(torusMesh);


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.zoomSpeed = 1.0;
  controls.enablePan = true;
  controls.panSpeed = 0.8;
  controls.minDistance = 0.5;
  controls.maxDistance = 10;
  controls.target.set(0, 0, 0);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return loadPromise;
}

export function animate() {
  requestAnimationFrame(animate);
  controls.update();

  renderer.render(scene, camera);
}
