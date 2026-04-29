import * as THREE from 'three';
import type { IEngineObject } from './Types';

export class KatanaObject implements IEngineObject {
  private mesh: THREE.Object3D;
  private _updateFn?: (d: number, e: any) => void;

  constructor(mesh: THREE.Object3D, updateFn?: (d: number, e: any) => void) {
    this.mesh = mesh;
    if (updateFn) this._updateFn = updateFn;
  }

  // IEngineObject
  update(deltaTime: number, engineState: any): void {
    this._updateFn?.(deltaTime, engineState);
  }

  setOnUpdate(updateFn: (d: number, e: any) => void): void {
    this._updateFn = updateFn;
  }

  getMesh(): THREE.Object3D {
    return this.mesh;
  }

  setMesh(mesh: THREE.Object3D<THREE.Object3DEventMap>): void {
    this.mesh = mesh;
  }

  destroy(): void {
    // cleanup
  }
}
