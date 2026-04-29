import * as THREE from 'three';

export const engineSettings = {
  renderSettings: {
    renderScale: 1.0,
    shadowMap: {
      enabled: true,
      type: THREE.PCFShadowMap,
    },
    toneMapping: THREE.ACESFilmicToneMapping,

    get width() {
      return window.innerWidth;
    },
    get height() {
      return window.innerHeight;
    },
    get aspect() {
      return window.innerWidth / window.innerHeight;
    },
    get sizeVec2() {
      return new THREE.Vector2(window.innerWidth, window.innerHeight);
    },
  },

  cameraSettings: {
    fov: 60,
    get aspect() {
      return engineSettings.renderSettings.aspect;
    },
    near: 0.01,
    far: 50,
    position: { x: 3.5, y: 3.5, z: 3.5 },
    type: 'perspective',
  } as const,

  // Ortographic camera settings
  // cameraSettings: {
  //   fov: 75,
  //   get aspect() {
  //     return engineSettings.renderSettings.aspect;
  //   },
  //   near: 0.01,
  //   far: 1000,
  //   position: { x: 40, y: 40, z: 40 },
  //   type: 'orthographic',
  //   frustumSize: 8,
  // } as const,

  PostProcessing: {
    bloomSettings: {
      bloom: true,
      get resolution() {
        return new THREE.Vector2(
          engineSettings.renderSettings.width * 0.15,
          engineSettings.renderSettings.height * 0.15
        );
      },
      strength: 0.35,
      radius: 0.25,
      threshold: 0.5,
    },

    outlineSettings: {
      outline: false,
      edgeStrength: 1.0,
      edgeGlow: 0.85,
      edgeThickness: 0.25,
      visibleEdgeColor: new THREE.Color(0x00aaff),
      hiddenEdgeColor: new THREE.Color(0x0000ff),
      pulsePeriod: 2,
    },
  },
};
