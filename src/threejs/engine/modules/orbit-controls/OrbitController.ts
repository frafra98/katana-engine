import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Camera, WebGLRenderer } from 'three';

export function createOrbitControls (
  camera: Camera,
  renderer: WebGLRenderer
) {
  const controls = new OrbitControls(camera, renderer.domElement);

  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableDamping = true;
  controls.screenSpacePanning = true;

  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.5;
  controls.maxPolarAngle = Math.PI / 2.0;
  controls.minPolarAngle = 1;
  controls.minDistance = 1;
  controls.maxDistance = 550;

  controls.target.set(0, 0, 0);

  return controls;
};