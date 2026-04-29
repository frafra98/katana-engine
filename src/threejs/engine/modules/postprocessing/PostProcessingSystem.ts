import type { Vector2, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';

type Pass = import('three/addons/postprocessing/Pass.js').Pass;

interface PostProcessingSettings {
  width: number;
  height: number;
  bloom?: {
    strength: number;
    radius: number;
    threshold: number;
    resolution: Vector2;
  };
  outlinePass?: any;
}

export class PostProcessingSystem {
  public composer: EffectComposer;
  public passes: Map<string, Pass> = new Map();

  constructor(
    private renderer: WebGLRenderer,
    private settings: PostProcessingSettings
  ) {
    this.composer = new EffectComposer(this.renderer);
  }

  public addPass(name: string, pass: Pass) {
    this.passes.set(name, pass);
    this.composer.addPass(pass);
  }

  public removePass(name: string) {
    const pass = this.passes.get(name);
    if (!pass) return;
    this.composer.passes = this.composer.passes.filter((p) => p !== pass);
    this.passes.delete(name);
  }

  public getPass<T extends Pass>(name: string): T | any {
    return this.passes.get(name) as T;
  }

  public render(deltaTime?: number) {
    if (deltaTime) this.composer.render(deltaTime);
    else this.composer.render();
  }

  public setSize(width: number, height: number) {
    if (!this.composer) return;
    this.composer.setSize(width, height);
  }

  public getWidth() {
    return this.settings.width;
  }
  public getHeight() {
    return this.settings.height;
  }
}
