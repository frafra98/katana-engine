import * as THREE from 'three';

export const ambientLightDefaults = {
  colour: '#ffffff',
  intensity: 1.0,
};

export const ambientLightControls = [
  {
    key: 'ambientLightColour',
    group: 'Scene',
    name: 'Ambient Colour',
    type: 'color',
  },
  {
    key: 'ambientLightIntensity',
    group: 'Scene',
    name: 'Ambient Intensity',
    type: 'range',
    min: 0,
    max: 2,
    step: 0.01,
  },
] as const;

export function createAmbientLight() {

  const ambientLight = new THREE.AmbientLight(
    ambientLightDefaults.colour,
    ambientLightDefaults.intensity
  );

  return ambientLight;
}
