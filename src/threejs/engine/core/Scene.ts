import * as THREE from 'three';
import { logDebug } from '../../../utils/debug/logger';
import { UpdatablesManager } from './UpdatablesManager';
import type { IKatanaObject } from './Types';

export class Scene {
  public threeScene: THREE.Scene;

  constructor() {
    this.threeScene = new THREE.Scene();
  }

  add(item: IKatanaObject | THREE.Object3D) {
    logDebug('item added: ', item);

    if (item.userData.object) this.threeScene.add(item.userData.object);
    else this.threeScene.add(item);
  }

  update(delta: number, elapsed: number | undefined) {
    for (const item of UpdatablesManager.getUpdts()) {
      item.update(delta, elapsed);
    }
  }
}
