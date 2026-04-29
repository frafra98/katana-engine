import type { Object3D } from 'three';

// Core engine object (always present)
export interface IEngineObject {
  update?(deltaTime: number, engineState: any): void;
  getMesh(): Object3D;
  destroy(): void;
}

export interface IKatanaObject extends Object3D {
  userData: {
    object: Object3D;
    interactiveRoot: Object3D;
    update(delta: number, elapsed?: number): void;
  };
}