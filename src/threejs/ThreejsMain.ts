import { Engine } from './engine/core/Engine';
import { InteractionManager } from './engine/modules/interaction/InteractionManager';
import { PostProcessingSystem } from './engine/modules/postprocessing/PostProcessingSystem';
import { initStats } from './engine/modules/stats/statsConfig';
import { Vector2 } from 'three';
import { useParamStore } from '../stores/paramsStore';
import { threeJSEffects } from '../bridge/ThreeJSEffectRegistry';
import { engineSettings } from './engine/config/engineSettings';
import * as THREE from 'three';

import {
  RenderPass,
  OutlinePass,
  UnrealBloomPass,
  ShaderPass,
  GammaCorrectionShader,
  FXAAShader,
  CSS3DRenderer,
} from 'three/examples/jsm/Addons.js';

// Your project imports (Example: loadKatanaRoomExample)
import { loadKatanaRoomExample } from './examples/katana-room';

export class ThreejsMain {
  public static instance: ThreejsMain;
  private engine!: Engine;
  private interactionManager!: InteractionManager;
  bridgeUnsubscribe: (() => void) | undefined;
  resizeTimeout: any;
  public ready!: Promise<void>;
  private resolveReady!: () => void;

  constructor(canvas: HTMLCanvasElement) {
    // Ensure singleton instance
    if (ThreejsMain.instance) {
      return ThreejsMain.instance;
    }

    // 👇 create promise
    this.ready = new Promise((resolve) => {
      this.resolveReady = resolve;
    });

    // init Katana Engine
    this.engine = new Engine();
    this.engine.setCamera(engineSettings.cameraSettings);
    this.engine.init(canvas);
    this.engine.start();

    // set up renderer
    this.setUpRenderer();

    // set up modules
    this.setUpStats();
    this.setUp3DRenderer();
    this.setUpInteractionManager();

    // start app
    this.init();

    // Subscribe to param changes for dynamic updates
    this.subscribe();

    // Ensure singleton instance is set
    ThreejsMain.instance = this;
  }

  setUp3DRenderer() {
    // Setup CSS3D Renderer properly
    const cssRenderer = new CSS3DRenderer();

    document.body.appendChild(cssRenderer.domElement);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.left = '0';
    cssRenderer.domElement.style.pointerEvents = 'none';
    cssRenderer.domElement.style.zIndex = '1'; // Ensure it's above WebGL renderer

    this.engine.addModule(cssRenderer);
  }

  subscribe() {
    let previousState = useParamStore.getState().params;

    useParamStore.subscribe((state) => {
      Object.entries(state.params).forEach(([key, param]) => {
        if (param !== previousState[key]) {
          if (threeJSEffects.has(key)) {
            threeJSEffects.apply(key, param.value);
          }
        }
      });
      previousState = state.params;
    });
  }

  async init() {
    try {
      await loadKatanaRoomExample(this.engine, this.interactionManager);
  
      requestAnimationFrame(() => {
        this.resolveReady();
      });
    } catch (err) {
      console.error('Threejs init failed:', err);
    }
  }
  setUpStats() {
    const stats = initStats();
    this.engine.addModule(stats);
  }

  // Custom methods
  setUpInteractionManager() {
    // Post-init set-up
    const threeRenderer = this.engine.renderer.threeRenderer;
    const threeCamera = this.engine.camera.threeCamera;

    // (Optional) Add Interaction Manager Module
    this.interactionManager = new InteractionManager(
      threeRenderer,
      threeCamera
    );
  }

  setUpRenderer() {
    const threeRenderer = this.engine.renderer.threeRenderer;

    // Post-init set-up
    const settings = {
      width: engineSettings.renderSettings.width,
      height: engineSettings.renderSettings.height,
      bloom: engineSettings.PostProcessing.bloomSettings,
      outlinePass: engineSettings.PostProcessing.outlineSettings,
    };

    const composer = new PostProcessingSystem(threeRenderer, settings);
    this.setUpPostFX(composer, settings);
    composer.composer.setPixelRatio(window.devicePixelRatio);

    this.engine.addModule(composer);

    // Renderer settings
    threeRenderer.shadowMap.enabled =
      engineSettings.renderSettings.shadowMap.enabled;

    threeRenderer.shadowMap.type = engineSettings.renderSettings.shadowMap.type;

    threeRenderer.toneMapping = engineSettings.renderSettings.toneMapping;
    threeRenderer.outputColorSpace = THREE.SRGBColorSpace;

    return composer;
  }

  setUpPostFX(
    composer: PostProcessingSystem,
    settings: { width: any; height: any; bloom: any; outlinePass: any }
  ) {
    const engine = this.engine;

    // Render pass
    const renderPass = new RenderPass(
      engine.scene.threeScene,
      engine.camera.threeCamera
    );
    composer.addPass('render', renderPass);

    // Outline pass (IF ENABLED IN ENGINE SETTINGS "engine_settings.ts")
    if (settings.outlinePass.outline) {
      const outlinePass = new OutlinePass(
        new Vector2(settings.width * 0.15, settings.height * 0.15),
        engine.scene.threeScene,
        engine.camera.threeCamera
      );

      const outlineSettings = settings.outlinePass;
      outlinePass.edgeStrength = outlineSettings.edgeStrength;
      outlinePass.edgeGlow = outlineSettings.edgeGlow;
      outlinePass.edgeThickness = outlineSettings.edgeThickness;
      outlinePass.hiddenEdgeColor.set(outlineSettings.hiddenEdgeColor);
      outlinePass.visibleEdgeColor.set(outlineSettings.visibleEdgeColor);
      outlinePass.pulsePeriod = outlineSettings.pulsePeriod;
      composer.addPass('outline', outlinePass);
    }

    // Bloom pass
    if (settings.bloom.bloom) {
      const bloomPass = new UnrealBloomPass(
        settings.bloom.resolution,
        settings.bloom.strength,
        settings.bloom.radius,
        settings.bloom.threshold
      );
      bloomPass.resolution = settings.bloom.resolution;
      composer.addPass('bloom', bloomPass);

      // FXAA (optional)
      const fxaaPass = new ShaderPass(FXAAShader);
      const pixelRatio = engine.renderer.threeRenderer.getPixelRatio();

      fxaaPass.uniforms['resolution'].value.set(
        1 / (settings.width * pixelRatio),
        1 / (settings.height * pixelRatio)
      );

      const size = new THREE.Vector2();
      this.engine.renderer.threeRenderer.getSize(size); // logical/CSS pixels
      const dpr = this.engine.renderer.threeRenderer.getPixelRatio();
      const renderW = size.x * dpr;
      const renderH = size.y * dpr;

      // Set initial values
      fxaaPass.uniforms.resolution.value.set(1 / renderW, 1 / renderH);
      composer.addPass('fxaa', fxaaPass);

      // Gamma correction
      const gammaPass = new ShaderPass(GammaCorrectionShader);
      composer.addPass('gamma', gammaPass);
    }
  }

  // ########################## Default methods #############################

  onWindowResize() {
    // Debounce resize event for better performance
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    if (this.engine) this.engine.onWindowResize();

    this.resizeTimeout = setTimeout(() => {
      if (this.engine.camera && this.engine.renderer) {
        // Update this.renderer and this.composer with reduced resolution
        const renderScale = engineSettings.renderSettings.renderScale;
        const width = engineSettings.renderSettings.width;
        const height = engineSettings.renderSettings.height;

        // Update engine camera
        this.engine.camera.updateAspect(engineSettings.cameraSettings);
        this.engine.renderer.threeRenderer.setSize(width, height);

        // If using composer, update composer size
        if (this.engine?.composer)
          this.engine.composer.setSize(
            width * renderScale,
            height * renderScale
          );
      }
    }, 150);
  }

  onMouseMove(event: MouseEvent) {
    this.interactionManager?.handlePointerMove(event);
  }
  
  onMouseClick(event: MouseEvent) {
    this.interactionManager?.handleClick(event);
  }
}
