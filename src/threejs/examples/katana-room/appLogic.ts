/**
 * KATANA ROOM SETUP - TYPESCRIPT FIXES
 *
 * Optimized Three.js scene setup with modular architecture
 * Focus: Performance, readability, maintainability
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { gsap } from 'gsap';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import { logDebug } from '../../../utils/debug/logger';
import { AssetLoader } from '../../engine/core/AssetLoader';
import { UpdatablesManager } from '../../engine/core/UpdatablesManager';
import { InteractiveKatanaObject } from '../../engine/modules/interaction/InteractiveEntity';
import type { Engine } from '../../engine/core/Engine';
import type { InteractionManager } from '../../engine/modules/interaction/InteractionManager';
import type { UIControl } from '../../../types/UITypes';
import { UI } from '../../../hooks/useWindows';

import { createRandomIcosphere } from './meshes/createHoloSphere';
import { createAmbientLight } from './lighting/ambientLightDefaults';
import { createShinyMaterial } from './shaders/shinyShader';
import { useCoinStore } from '../../../stores/coinStore';
import { createOrbitControls } from '../../engine/modules/orbit-controls/OrbitController';
import { setupSceneControlWindow } from './scene/createSceneControls';
import { engineSettings } from '../../engine/config/engineSettings';

// ============================================================================
// TYPE DEFINITIONS & CONSTANTS
// ============================================================================

type AnimationAxis = 'x' | 'y' | 'z';

interface RotationConfig {
  axis: 'x' | 'y';
  divisor: number;
}

interface ShadowConfig {
  mapSize: number;
  cameraNear: number;
  cameraFar: number;
  bias: number;
  normalBias: number;
  radius: number;
}

interface WindowIds {
  sphere: string | null;
  sceneLights: string | null;
}

interface CameraConfig {
  offsetDistance: number;
  verticalOffset: number;
  animationDuration: number;
}

// Object type flags for efficient filtering
const SHADOW_CASTING_OBJECTS = [
  'book',
  'drawer',
  'chair',
  'crate',
  'mug',
  'desk_furniture',
  'cube_shelves',
  'furniture_door',
] as const;

const DOOR_ROTATION_CONFIG: Record<string, RotationConfig> = {
  '000': { axis: 'y', divisor: -1.8 },
  '001': { axis: 'y', divisor: 2.2 },
  '002': { axis: 'y', divisor: -2.2 },
  '003': { axis: 'y', divisor: 1.5 },
};

const DESK_LIGHT_SHADOW_CONFIG: ShadowConfig = {
  mapSize: 512,
  cameraNear: 0.5,
  cameraFar: 50,
  bias: -0.0005,
  normalBias: 0.002,
  radius: 20,
};

const MAIN_LIGHT_SHADOW_CONFIG: ShadowConfig = {
  mapSize: 1024,
  cameraNear: 0.5,
  cameraFar: 10,
  bias: -0.0005,
  normalBias: 0.04,
  radius: 1.5,
};

const MAIN_LIGHT_DEFAULTS = {
  color: '#FFFFFF',
  intensity: 7,
  angle: Math.PI / 4,
} as const;

// ============================================================================
// UI CONTROL MANAGEMENT
// ============================================================================

/**
 * Centralized UI control registry for all interactive elements
 */
class UIControlRegistry {
  private neonControls: UIControl[] = [];
  private sceneLightControls: UIControl[] = [];

  addNeonControls(controls: UIControl[]): void {
    this.neonControls.push(...controls);
  }

  addSceneLightControls(controls: UIControl[]): void {
    this.sceneLightControls.push(...controls);
  }

  getNeonControls(): UIControl[] {
    return this.neonControls;
  }

  getSceneLightControls(): UIControl[] {
    return this.sceneLightControls;
  }

  hasNeonControls(): boolean {
    return this.neonControls.length > 0;
  }

  hasSceneLightControls(): boolean {
    return this.sceneLightControls.length > 0;
  }
}

const uiRegistry = new UIControlRegistry();
const windowIds: WindowIds = {
  sphere: null,
  sceneLights: null,
};

// ============================================================================
// SHARED UTILITIES
// ============================================================================

/**
 * Utility function to check if an object is a light
 */
function isLight(obj: THREE.Object3D): obj is THREE.SpotLight {
  return (obj as THREE.SpotLight).isLight === true;
}

/**
 * Toggles the visibility and shadow casting of a light
 */
function toggleLight(light: THREE.Light): void {
  light.visible = !light.visible;
  light.castShadow = light.visible;
}

/**
 * Applies shadow configuration to a light
 */
function applyShadowConfig(light: THREE.SpotLight, config: ShadowConfig): void {
  light.shadow.mapSize.set(config.mapSize, config.mapSize);
  light.shadow.camera.near = config.cameraNear;
  light.shadow.camera.far = config.cameraFar;
  light.shadow.bias = config.bias;
  light.shadow.normalBias = config.normalBias;
  light.shadow.radius = config.radius;
}

// ============================================================================
// HOLOGRAPHIC SPHERE SETUP
// ============================================================================

/**
 * Custom uniform typing for the glitch shader
 */
interface GlitchUniforms {
  uTime: { value: number };
  uGlitchIntensity: { value: number };
  uColor: { value: THREE.Color };
}

/**
 * Sets up the holographic sphere with glitch shader and interactive controls
 */
function setupHoloSphere(
  engine: Engine,
  im: InteractionManager,
  coneMesh: THREE.Object3D,
  position?: { x: number; y: number; z: number }
): void {
  const sphere = createRandomIcosphere(position);

  const glitchMaterial = sphere.material as THREE.ShaderMaterial & {
    uniforms: GlitchUniforms;
  };

  engine.scene.add(sphere);

  let shaderTimeMul = 1;
  let currentColor = '#66FF00';
  let targetColor = '#000000';

  const sphereObject = new InteractiveKatanaObject(sphere);

  sphereObject.setOnUpdate((_deltaTime: number, elapsed: number) => {
    glitchMaterial.uniforms.uTime.value = elapsed * shaderTimeMul;

    if (currentColor !== targetColor) {
      const hexColor =
        '#' + glitchMaterial.uniforms.uColor.value.getHexString();

      if (windowIds.sphere) {
        UI.updateWindow(windowIds.sphere, { primaryColor: hexColor });
      }

      currentColor = targetColor;
    }


  });

  let isWindowClosed = false;

  sphereObject.setOnSelect(() => {
    isWindowClosed = !isWindowClosed;

    if (windowIds.sphere) {
      UI.minimizeWindow(windowIds.sphere, isWindowClosed);
    }
  });

  im.addInteractiveObject(sphereObject);
  UpdatablesManager.addUpdatableObject(sphereObject);

  const controls: UIControl[] = [
    {
      param: 'shader.intensity',
      name: 'Glitch Intensity',
      type: 'slider',
      group: 'Holographic Sphere',
      min: 0,
      max: 0.14,
      step: 0.01,
      value: 0.08,
      effect: (value: number) => {
        glitchMaterial.uniforms.uGlitchIntensity.value = value;
      },
    },
    {
      param: 'shader.time',
      name: 'Glitch Time Multiplier',
      type: 'slider',
      group: 'Holographic Sphere',
      min: 0,
      max: 10,
      step: 0.01,
      value: 2,
      effect: (value: number) => {
        shaderTimeMul = value;
      },
    },
    {
      param: 'shader.color',
      name: 'Shader Color',
      group: 'Holographic Sphere',
      type: 'color',
      value: '#66FF00',
      effect: (value: string) => {
        targetColor = value;

        glitchMaterial.uniforms.uColor.value.set(value);

        // Safely handle mesh material
        const mesh = coneMesh as THREE.Mesh;

        if (
          mesh.material &&
          mesh.material instanceof THREE.MeshStandardMaterial
        ) {
          mesh.material.color.set(value);
          mesh.material.emissive.set(value);
        }
      },
    },
  ];

  uiRegistry.addNeonControls(controls);
}

// ============================================================================
// NEON TEXT SETUP
// ============================================================================

/**
 * Sets up neon text with emissive material controls
 */
function setupNeonText(
  im: InteractionManager,
  neonTextGroup: THREE.Group
): void {
  const child = neonTextGroup.children[1];

  if (!(child instanceof THREE.Mesh)) {
    throw new Error('Expected neonTextGroup.children[1] to be a THREE.Mesh');
  }

  const neonMesh = child;

  let currentColor = '#FF7300';
  let targetColor = '#000000';

  const neonObject = new InteractiveKatanaObject(neonMesh);

  neonObject.setOnUpdate(() => {
    const material = neonMesh.material;

    if (
      currentColor !== targetColor &&
      material instanceof THREE.MeshStandardMaterial
    ) {
      const hexColor = '#' + material.color.getHexString();

      if (windowIds.sphere) {
        UI.updateWindow(windowIds.sphere, { primaryColor: hexColor });
      }

      currentColor = targetColor;
    }
  });

  let isWindowClosed = false;

  neonObject.setOnSelect(() => {
    isWindowClosed = !isWindowClosed;

    if (windowIds.sphere) {
      UI.minimizeWindow(windowIds.sphere, isWindowClosed);
    }
  });

  im.addInteractiveObject(neonObject);
  UpdatablesManager.addUpdatableObject(neonObject);

  const controls: UIControl[] = [
    {
      param: 'neon.color',
      name: 'Neon Color',
      group: 'Neon Text',
      type: 'color',
      value: '#FF7300',
      effect: (value: string) => {
        targetColor = value;

        const material = neonMesh.material;

        if (material instanceof THREE.MeshStandardMaterial) {
          material.color.set(value);
          material.emissive.set(value);
        }
      },
    },
    {
      param: 'neon.intensity',
      name: 'Neon Intensity',
      type: 'slider',
      group: 'Neon Text',
      min: 0,
      max: 4,
      step: 0.01,
      value: 2,
      effect: (value: number) => {
        const material = neonMesh.material;

        if (material instanceof THREE.MeshStandardMaterial) {
          material.emissiveIntensity = value;
        }
      },
    },
  ];

  uiRegistry.addNeonControls(controls);
}

// ============================================================================
// MAIN LIGHT SETUP
// ============================================================================

/**
 * Sets up the main light with shadow configuration
 */
function setupMainLight(mainLight: THREE.Light): void {
  mainLight.castShadow = true;

  const controls: UIControl[] = [
    {
      param: 'mainlight.color',
      name: 'Light Color',
      group: 'Light Settings',
      type: 'color',
      value: MAIN_LIGHT_DEFAULTS.color,
      effect: (value: string) => {
        mainLight.color.set(value);
      },
    },
    {
      param: 'mainlight.intensity',
      name: 'Main Light Intensity',
      type: 'slider',
      group: 'Light Settings',
      min: 0,
      max: 40,
      step: 0.01,
      value: MAIN_LIGHT_DEFAULTS.intensity,
      effect: (value: number) => {
        mainLight.intensity = value;
      },
    },
  ];

  uiRegistry.addSceneLightControls(controls);
}

// ============================================================================
// AMBIENT LIGHT SETUP
// ============================================================================

/**
 * Configures ambient lighting for the scene
 */
function setupAmbientLight(engine: Engine): void {
  const ambientLight = createAmbientLight();
  engine.scene.add(ambientLight);

  const controls: UIControl[] = [
    {
      param: 'ambient.intensity',
      name: 'Ambient Intensity',
      type: 'slider',
      group: 'Ambient Settings',
      min: 0,
      max: 10,
      step: 0.01,
      value: ambientLight.intensity,
      effect: (value: number) => {
        ambientLight.intensity = value;
      },
    },
    {
      param: 'ambient.color',
      name: 'Ambient Color',
      group: 'Ambient Settings',
      type: 'color',
      value: `#${ambientLight.color.getHexString()}`,
      effect: (value: string) => {
        ambientLight.color.set(value);
      },
    },
  ];

  uiRegistry.addSceneLightControls(controls);
}

// ============================================================================
// INTERACTIVE OBJECTS - DESK LIGHT
// ============================================================================

/**
 * Sets up desk light toggle functionality
 */
function setupDeskLight(
  im: InteractionManager,
  deskLightController: THREE.Object3D
): void {
  const light = deskLightController.children.find(isLight);

  if (!light) return;

  const lightObject = new InteractiveKatanaObject(deskLightController);

  lightObject.setOnSelect(() => {
    toggleLight(light);
  });

  toggleLight(light);

  im.addInteractiveObject(lightObject);
  UpdatablesManager.addUpdatableObject(lightObject);
}

// ============================================================================
// INTERACTIVE OBJECTS - FURNITURE ANIMATIONS
// ============================================================================

/**
 * Configuration for chair spinning animation
 */
function setupChairAnimation(
  im: InteractionManager,
  chairController: THREE.Object3D
): void {
  const chairTop = chairController.children.find((child) =>
    child.name.includes('chair_top')
  );

  if (!chairTop) return;

  const chairObject = new InteractiveKatanaObject(chairController);
  let isAnimating = false;

  chairObject.setOnSelect(() => {
    if (isAnimating) return;
    isAnimating = true;

    const timeline = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
      },
    });

    const startRotation = chairTop.rotation.y;

    timeline
      .to(chairTop.rotation, {
        y: startRotation - 0.5,
        duration: 0.65,
        ease: 'power1.out',
      })
      .to(
        chairTop.rotation,
        {
          y: startRotation + Math.PI * 15,
          duration: 5.6,
          ease: 'power4.out',
        },
        '>'
      );
  });

  im.addInteractiveObject(chairObject);
  UpdatablesManager.addUpdatableObject(chairObject);
}

// ============================================================================
// INTERACTIVE OBJECTS - DRAWERS & SHELVES
// ============================================================================

/**
 * Sets up shelf book animation with hover and select states
 *
 * Behavior:
 * - Hover: pulls book forward slightly (0.08 units)
 * - Select: pins book open further forward (0.2 units) - disables leave animation
 * - Leave: returns book to base position (unless just selected)
 */
function setupShelfBook(
  im: InteractionManager,
  bookObject: THREE.Object3D
): void {
  const basePosition = bookObject.position.clone();
  const interactiveObject = new InteractiveKatanaObject(bookObject);

  let currentTween: gsap.core.Tween | null = null;
  let wasSelected = false;

  interactiveObject.setOnHover(() => {
    if (currentTween) currentTween.kill();

    currentTween = gsap.to(bookObject.position, {
      x: basePosition.x - 0.08,
      y: basePosition.y,
      z: basePosition.z,
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        currentTween = null;
      },
    });
  });

  interactiveObject.setOnSelect(() => {
    if (currentTween) currentTween.kill();
    wasSelected = true;

    currentTween = gsap.to(bookObject.position, {
      x: basePosition.x - 0.2,
      y: basePosition.y,
      z: basePosition.z,
      duration: 0.9,
      ease: 'power2.out',
      onComplete: () => {
        currentTween = null;
      },
    });
  });

  interactiveObject.setOnLeave(() => {
    if (wasSelected) {
      wasSelected = false;
      return;
    }

    if (currentTween) currentTween.kill();

    currentTween = gsap.to(bookObject.position, {
      x: basePosition.x,
      y: basePosition.y,
      z: basePosition.z,
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        currentTween = null;
      },
    });
  });

  im.addInteractiveObject(interactiveObject);
  UpdatablesManager.addUpdatableObject(interactiveObject);
}

/**
 * Sets up drawer animation (pull-out motion)
 */
function setupDrawer(
  im: InteractionManager,
  drawerObject: THREE.Object3D
): void {
  const basePosition = drawerObject.position.clone();
  const interactiveObject = new InteractiveKatanaObject(drawerObject);

  let isHovered = false;
  let isPinned = false;

  const openDrawer = () => {
    gsap.killTweensOf(drawerObject.position);

    gsap.to(drawerObject.position, {
      x: basePosition.x + 0.35,
      duration: 0.52,
      ease: 'power2.out',
    });
  };

  const closeDrawer = () => {
    gsap.killTweensOf(drawerObject.position);

    gsap.to(drawerObject.position, {
      x: basePosition.x,
      duration: 0.52,
      ease: 'power2.out',
    });
  };

  const updateState = () => {
    if (isHovered || isPinned) {
      openDrawer();
    } else {
      closeDrawer();
    }
  };

  interactiveObject.setOnHover(() => {
    isHovered = true;
    updateState();
  });

  interactiveObject.setOnLeave(() => {
    isHovered = false;
    updateState();
  });

  interactiveObject.setOnSelect(() => {
    isPinned = !isPinned;
    updateState();
  });

  im.addInteractiveObject(interactiveObject);
  UpdatablesManager.addUpdatableObject(interactiveObject);
}

// ============================================================================
// INTERACTIVE OBJECTS - ROTATION ANIMATIONS
// ============================================================================

/**
 * Sets up chest lid animation (rotation)
 */
function setupChestLid(
  im: InteractionManager,
  chestLidObject: THREE.Object3D
): void {
  const chestParent = chestLidObject.parent;
  if (!chestParent) return;

  const interactiveObject = new InteractiveKatanaObject(chestParent);
  let isAnimating = false;
  let isOpen = false;

  interactiveObject.setOnSelect(() => {
    if (isAnimating) return;

    const targetRotation =
      chestLidObject.rotation.z + (isOpen ? -Math.PI / 2 : Math.PI / 2);

    isAnimating = true;

    gsap.to(chestLidObject.rotation, {
      z: targetRotation,
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        isAnimating = false;
        isOpen = !isOpen;
      },
    });
  });

  im.addInteractiveObject(interactiveObject);
  UpdatablesManager.addUpdatableObject(interactiveObject);
}

/**
 * Sets up door animation with configurable rotation
 */
function setupDoor(im: InteractionManager, doorObject: THREE.Object3D): void {
  const interactiveObject = new InteractiveKatanaObject(doorObject);
  let isAnimating = false;
  let isOpen = false;

  let config = DOOR_ROTATION_CONFIG['000'];
  for (const [key, value] of Object.entries(DOOR_ROTATION_CONFIG)) {
    if (doorObject.name.includes(key)) {
      config = value;
      break;
    }
  }

  interactiveObject.setOnSelect(() => {
    if (isAnimating) return;

    const rotationAmount = Math.PI / config.divisor;
    const targetRotation =
      config.axis === 'y'
        ? doorObject.rotation.y + (isOpen ? rotationAmount : -rotationAmount)
        : doorObject.rotation.x + (isOpen ? rotationAmount : -rotationAmount);

    isAnimating = true;

    const rotationTarget: Partial<Record<AnimationAxis, number>> = {
      [config.axis]: targetRotation,
    };
    gsap.to(doorObject.rotation, {
      ...rotationTarget,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        isAnimating = false;
        isOpen = !isOpen;
      },
    });
  });

  im.addInteractiveObject(interactiveObject);
  UpdatablesManager.addUpdatableObject(interactiveObject);
}

// ============================================================================
// SHADOW CONFIGURATION
// ============================================================================

/**
 * Creates shadow controls UI for main light
 */
function createMainLightShadowControls(light: THREE.SpotLight): UIControl[] {
  return [
    {
      param: 'mainlight.shadow.mapSize',
      name: 'Shadow Map Size',
      type: 'slider',
      group: 'Main Light Shadow',
      min: 256,
      max: 4096,
      step: 256,
      value: light.shadow.mapSize.width,
      effect: (value: number) => {
        light.shadow.mapSize.set(value, value);
        if (light.shadow.map) {
          light.shadow.map.dispose();
          light.shadow.map = null;
        }
        light.shadow.needsUpdate = true;
      },
    },
    {
      param: 'mainlight.shadow.camera.near',
      name: 'Shadow Camera Near',
      type: 'slider',
      group: 'Main Light Shadow',
      min: 0.1,
      max: 10,
      step: 0.1,
      value: light.shadow.camera.near,
      effect: (value: number) => {
        light.shadow.camera.near = value;
        light.shadow.camera.updateProjectionMatrix();
      },
    },
    {
      param: 'mainlight.shadow.camera.far',
      name: 'Shadow Camera Far',
      type: 'slider',
      group: 'Main Light Shadow',
      min: 1,
      max: 20,
      step: 0.5,
      value: light.shadow.camera.far,
      effect: (value: number) => {
        light.shadow.camera.far = value;
        light.shadow.camera.updateProjectionMatrix();
      },
    },
    {
      param: 'mainlight.shadow.bias',
      name: 'Shadow Bias',
      type: 'slider',
      group: 'Main Light Shadow',
      min: -0.01,
      max: 0.01,
      step: 0.0001,
      value: light.shadow.bias,
      effect: (value: number) => {
        light.shadow.bias = value;
      },
    },
    {
      param: 'mainlight.shadow.normalBias',
      name: 'Shadow Normal Bias',
      type: 'slider',
      group: 'Main Light Shadow',
      min: -0.1,
      max: 0.1,
      step: 0.0001,
      value: light.shadow.normalBias,
      effect: (value: number) => {
        light.shadow.normalBias = value;
      },
    },
    {
      param: 'mainlight.shadow.radius',
      name: 'Shadow Radius',
      type: 'slider',
      group: 'Main Light Shadow',
      min: 0,
      max: 20,
      step: 0.5,
      value: light.shadow.radius,
      effect: (value: number) => {
        light.shadow.radius = value;
      },
    },
    {
      param: 'mainlight.angle',
      name: 'Light Angle',
      type: 'slider',
      group: 'Main Light Settings',
      min: 0,
      max: Math.PI / 2,
      step: 0.01,
      value: (light as THREE.SpotLight).angle || 0,
      effect: (value: number) => {
        const spotLight = light as THREE.SpotLight;
        if (spotLight.angle !== undefined) {
          spotLight.angle = value;
        }
      },
    },
  ];
}

// ============================================================================
// SCENE TRAVERSAL & SETUP
// ============================================================================

/**
 * Processes lights in the scene and configures shadow properties
 */
function setUpLight(light: THREE.Object3D<THREE.Object3DEventMap>): void {
  if (!isLight(light)) return;
  light.castShadow = true;
  logDebug('🔷 Found light, setting up shadow properties', light.name);

  if (light.name.includes('desk_light')) {
    applyShadowConfig(light, DESK_LIGHT_SHADOW_CONFIG);
  }

  if (light.name.includes('main_light')) {
    applyShadowConfig(light, MAIN_LIGHT_SHADOW_CONFIG);
    const shadowControls = createMainLightShadowControls(light);
    uiRegistry.addSceneLightControls(shadowControls);
  }
}

const shinyMaterial = createShinyMaterial();

/**
 * Setup treasure with shiny material
 */
function setupChestTreasure(child: THREE.Object3D): void {
  const treasure = child as THREE.Mesh;
  treasure.material = shinyMaterial;

  const interactiveTreasure = new InteractiveKatanaObject(treasure);

  interactiveTreasure.setOnUpdate((delta: number) => {
    (shinyMaterial.uniforms as any).uTime.value += delta;
  });

  UpdatablesManager.addUpdatableObject(interactiveTreasure);
}

/**
 * Setup coin with rotation and collection
 */
function setupCoin(im: InteractionManager, child: THREE.Object3D): void {
  const coin = child as THREE.Mesh;
  coin.material = shinyMaterial;

  const iCoin = new InteractiveKatanaObject(coin);

  iCoin.setOnUpdate((delta: number) => {
    coin.rotation.y += delta * 1.95;
  });

  iCoin.setOnSelect(() => {
    coin.parent?.remove(coin);
    useCoinStore.getState().increment();
  });

  im.addInteractiveObject(iCoin);
  UpdatablesManager.addUpdatableObject(iCoin);
}

/**
 * Sets up laptop with CSS3D renderer
 */
function setupLaptop(
  engine: Engine,
  im: InteractionManager,
  child: THREE.Group
): void {
  const screen = child.children.find((c) => c.name.includes('screen'));
  if (!screen) return;

  const interactiveLaptop = new InteractiveKatanaObject(child);
  const camera = engine.camera.threeCamera;

  const CAMERA_CONFIG: CameraConfig = {
    offsetDistance: 0.5,
    verticalOffset: -0.12,
    animationDuration: 1.5,
  };

  const screenPosition = new THREE.Vector3();
  screen.getWorldPosition(screenPosition);

  const calculateCameraPosition = (offsetDist: number): THREE.Vector3 => {
    const direction = screenPosition.clone().sub(camera.position).normalize();
    const targetPos = screenPosition
      .clone()
      .add(direction.multiplyScalar(-offsetDist));
    targetPos.y += CAMERA_CONFIG.verticalOffset;
    return targetPos;
  };

  const cameraTargetPos = calculateCameraPosition(CAMERA_CONFIG.offsetDistance);

  const targetQuaternion = new THREE.Quaternion();
  const tempCamera = camera.clone();
  tempCamera.position.copy(cameraTargetPos);
  tempCamera.lookAt(screenPosition);
  targetQuaternion.copy(tempCamera.quaternion);

  const element = document.createElement('div');
  element.style.background = 'rgb(56, 56, 56)';
  element.style.transformStyle = 'preserve-3d';

  const box = new THREE.Box3().setFromObject(screen);
  const size = new THREE.Vector3();
  box.getSize(size);

  const SCALE_FACTOR = 3048;
  element.style.width = `${size.x * SCALE_FACTOR * 1.7}px`;
  element.style.height = `${size.y * SCALE_FACTOR}px`;

  const iframe = document.createElement('iframe');
  iframe.src = 'https://frakon.vercel.app/';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';

  element.appendChild(iframe);

  document.body.appendChild(element);
  element.style.visibility = 'hidden';
  element.style.position = 'absolute';
  element.style.pointerEvents = 'none';

  const cssObject = new CSS3DObject(element);
  screen.add(cssObject);

  cssObject.position.set(0, 0, 0);
  cssObject.rotation.set(0, 1.55, 0);
  cssObject.scale.set(1.5 / SCALE_FACTOR, 1 / SCALE_FACTOR, 1 / SCALE_FACTOR);

  element.style.visibility = 'visible';

  let isCloseToLaptop = false;

  interactiveLaptop.setOnDeselect(() => {
    isCloseToLaptop = false;
  });

  interactiveLaptop.setOnSelect(() => {
    gsap.to(camera.position, {
      duration: CAMERA_CONFIG.animationDuration,
      x: cameraTargetPos.x,
      y: cameraTargetPos.y,
      z: cameraTargetPos.z,
      ease: 'power2.inOut',
      onComplete: () => {
        isCloseToLaptop = true;
      },
    });

    gsap.to(camera.quaternion, {
      duration: CAMERA_CONFIG.animationDuration,
      x: targetQuaternion.x,
      y: targetQuaternion.y,
      z: targetQuaternion.z,
      w: targetQuaternion.w,
      ease: 'power2.inOut',
    });
  });

  interactiveLaptop.setOnUpdate(() => {
    const rect = element.getBoundingClientRect();
    if (rect.height === 0 || rect.width === 0) return;
    if (!Number.isFinite(rect.x) || !Number.isFinite(rect.y)) return;

    const visible = isCloseToLaptop;
    element.style.opacity = visible ? '1' : '0';
    element.style.pointerEvents = visible ? 'auto' : 'none';
    element.style.visibility = visible ? 'visible' : 'hidden';
    iframe.style.opacity = visible ? '1' : '0';
  });

  im.addInteractiveObject(interactiveLaptop);
  UpdatablesManager.addUpdatableObject(interactiveLaptop);
}

/**
 * Main scene traversal function - processes all model children recursively
 */
function setupSceneAndInteractions(
  model: THREE.Object3D,
  engine: Engine,
  im: InteractionManager
): void {
  for (const child of model.children) {
    logDebug('🔮 Traversing model:', child.name);
    
    // Apply shadows to relevant objects
    setupShadows(child);

    // Configure lights and add to UI controls
    setUpLight(child);

    // Set up interactivity for specific objects based on naming conventions
    setupSceneObjectInteractivity(child, engine, im);

    // Recursively process child objects
    if (child.children.length > 0) {
      setupSceneAndInteractions(child, engine, im);
    }
  }
}

// ============================================================================
// MAIN SETUP FUNCTION
// ============================================================================

/**
 * Main entry point - initializes the Katana room with all assets and interactions
 */
export async function setUpKatanaRoom(
  engine: Engine,
  im: InteractionManager,
  onProgress?: (p: number) => void
): Promise<THREE.Object3D> {
  // Add ambient light to scene
  setupAmbientLight(engine);

  // Add orbit controls with deferred initialization for performance
  const orbitCtrls = initOrbitControls(engine);
  if (orbitCtrls !== undefined) engine.controls = orbitCtrls;

  // Load model and traverse scene to set up interactions and properties
  const loader = new AssetLoader();
  return loader.init('katana_room/katana_room.glb', onProgress).then((model) => {
    logDebug('>>> Katana room model loaded', model);

    const roomObject = new InteractiveKatanaObject(model);
    roomObject.setOnUpdate(() => {
      // Placeholder for any global room updates
    });
    UpdatablesManager.addUpdatableObject(roomObject);

    setupSceneAndInteractions(model, engine, im);

    // Setup UI windows for controls
    setUpUIWindows(engine);

    return model;
  });
}

// ==========================================================================
// ORBIT CONTROLS INITIALIZATION
// ==========================================================================
function initOrbitControls(engine: Engine) {
  // Defer OrbitControls initialization with reduced sensitivity
  requestIdleCallback(
    () => {
      // ORIGINAL CODE:
      const controls = createOrbitControls(
        engine.camera.threeCamera,
        engine.renderer.threeRenderer
      );
      controls.enablePan = true;
      controls.enableDamping = false;

      return controls;
    },
    { timeout: 500 }
  );
}
function setUpUIWindows(engine: Engine) {
  if (uiRegistry.hasNeonControls()) {
    windowIds.sphere = UI.addWindow({
      title: 'Emissive Objects',
      position: { x: 0, y: 0 },
      content: uiRegistry.getNeonControls(),
      size: { width: 200, height: 700 },
      isMinimized: true,
    });
  }

  if (uiRegistry.hasSceneLightControls()) {
    windowIds.sceneLights = UI.addWindow({
      title: 'Scene Lights',
      position: { x: 0, y: 770 },
      content: uiRegistry.getSceneLightControls(),
      size: { width: 200, height: 340 },
      isMinimized: false,
    });
  }

  // Add Scene Controls UI
  setupSceneControlWindow(engine, engineSettings.renderSettings);
}
function setupShadows(child: THREE.Object3D<THREE.Object3DEventMap>) {
  if (child.name?.toLowerCase().includes('room')) {
    child.receiveShadow = true;
  }

  for (const shadowObj of SHADOW_CASTING_OBJECTS) {
    if (child.name?.toLowerCase().includes(shadowObj)) {
      child.castShadow = true;
      child.receiveShadow = true;
      break;
    }
  }
}

function setupSceneObjectInteractivity(
  child: THREE.Object3D<THREE.Object3DEventMap>,
  engine: Engine,
  im: InteractionManager
) {
  if (child.isObject3D) {
    if (child.name.includes('main_light') && isLight(child)) {
      setupMainLight(child);
    }

    if (child.name.includes('desk_light_controller')) {
      setupDeskLight(im, child);
    }

    if (child.name.includes('chair_controller')) {
      setupChairAnimation(im, child);
    }

    if (child.name.includes('neon_text')) {
      logDebug('Found neon text', child);
      setupNeonText(im, child as THREE.Group);
    }

    if (child.name.includes('laptop')) {
      setupLaptop(engine, im, child as THREE.Group);
    }

    if (child.name.includes('holo_base')) {
      const holoCone = child.children.find((c) => c.name.includes('holo_cone'));
      logDebug('Found holo_base, setting up holo sphere', holoCone);

      if (holoCone) {
        setupHoloSphere(engine, im, holoCone, {
          x: child.position.x,
          y: child.position.y + 0.12,
          z: child.position.z,
        });
      }
    }

    if (child.name.includes('shelf_book')) {
      setupShelfBook(im, child);
    }

    if (child.name.toLowerCase().includes('drawer')) {
      setupDrawer(im, child);
    }

    if (child.name.includes('dungeon_chest_top')) {
      setupChestLid(im, child);
    }

    if (child.name.includes('treasure')) {
      setupChestTreasure(child);
    }

    if (child.name.includes('coin')) {
      setupCoin(im, child);
    }

    if (child.name.includes('furniture_door')) {
      setupDoor(im, child);
    }
  }
}
