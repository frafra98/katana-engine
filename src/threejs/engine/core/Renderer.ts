import { WebGLRenderer } from 'three';
import type { Scene } from './Scene';
import type { Camera } from './Camera';

export class Renderer {
  clear() {
    this.threeRenderer.clear();
  }
  public threeRenderer: WebGLRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.threeRenderer = new WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'highp',
    });
    this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
    this.threeRenderer.setPixelRatio(window.devicePixelRatio);
  }

  render(scene: Scene, camera: Camera) {
    this.threeRenderer.render(scene.threeScene, camera.threeCamera);
  }

  clearDepth() {
    this.threeRenderer.clearDepth();
  }

  setSize(w: number, h: number) {
    this.threeRenderer.setSize(w, h);
  }

  setPixelRatio(dpr: number) {
    this.threeRenderer.setPixelRatio(dpr);
  }

  dispose() {
    this.threeRenderer.dispose();
  }
}
