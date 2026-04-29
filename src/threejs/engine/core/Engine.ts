import { Renderer } from './Renderer';
import { Loop } from './Loop';
import { Scene } from './Scene';
import { Camera } from './Camera';
import { PostProcessingSystem } from '../modules/postprocessing/PostProcessingSystem';
import Stats from 'stats.js';
import { logDebug } from '../../../utils/debug/logger';
import {
  CSS3DRenderer,
  type OrbitControls,
} from 'three/examples/jsm/Addons.js';
import { PerspectiveCamera } from 'three';

export class Engine {
  public static instance: Engine | null = null;

  public renderer!: Renderer;
  public composer: PostProcessingSystem | undefined;
  public stats: Stats | undefined;
  public scene!: Scene;
  public camera!: Camera;
  public loop!: Loop;
  public mainWindowId: string | undefined;
  private modules = new Map<string, any>();
  controls: OrbitControls | undefined;
  cssRenderer: any;

  constructor() {
    if (Engine.instance) return Engine.instance;
    Engine.instance = this;
  }

  init(canvas: HTMLCanvasElement) {
    if (this.renderer) return; // prevent double init

    this.renderer = new Renderer(canvas);
    this.scene = new Scene();

    this.updateRendererSizes();
    this.loop = new Loop(this.update.bind(this));

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private updateRendererSizes() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update both renderers
    this.renderer.threeRenderer.setSize(width, height);
    if (this.cssRenderer) {
      this.cssRenderer.setSize(width, height);
    }

    // Update camera aspect ratio
    if (this.camera) {
      if (this.camera.threeCamera instanceof PerspectiveCamera)
        this.camera.threeCamera.aspect = width / height;
      this.camera.threeCamera.updateProjectionMatrix();
    }
  }

  public onWindowResize() {
    this.updateRendererSizes();
  }

  public setCamera(
    cameraSettings:
      | {
          fov: number;
          aspect: number;
          near: number;
          far: number;
          position: { x: number; y: number; z: number };
        }
      | undefined
  ) {
    this.camera = new Camera(cameraSettings);
  }

  private update(delta: number, elapsed: number) {
    if (this.stats) this.stats.begin();

    // Update scene first
    this.scene.update(delta, elapsed);

    // Controls (pass delta if supported)
    if (this.controls) this.controls.update(delta);

    // Render WebGL
    this.renderer.clear();
    if (this.composer) {
      this.composer.render();
    } else {
      // Pass the underlying three.js scene/camera
      this.renderer.render(this.scene, this.camera);
    }

    // Clear depth from WebGL before CSS3D overlay
    this.renderer.clearDepth();

    // Then render CSS3D on top of WebGL (use underlying three objects)
    if (this.cssRenderer && this.camera) {
      this.cssRenderer.render(this.scene.threeScene, this.camera.threeCamera);
    }

    if (this.stats) this.stats.end();
  }

  start() {
    this.loop.start();
  }

  dispose() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.loop.stop();
    this.renderer.dispose();
    if (this.cssRenderer) {
      this.cssRenderer.domElement.remove();
    }
  }

  addModule(arg0: any) {
    if ('dom' in arg0 && typeof arg0.update === 'function') {
      this.stats = arg0;
      this.modules.set('stats', arg0);
      logDebug('stats.js module added.');
    } else if (arg0 instanceof CSS3DRenderer) {
      this.cssRenderer = arg0;
      this.modules.set('cssRenderer', arg0);
      logDebug('CSS3DRenderer module added.');
      this.updateRendererSizes();
    } else if (arg0 instanceof PostProcessingSystem) {
      this.composer = arg0;
      this.modules.set('composer', arg0);
      logDebug('PostProcessing module added.');
    }
  }

  getModule(moduleName: string) {
    return this.modules.get(moduleName);
  }
}
