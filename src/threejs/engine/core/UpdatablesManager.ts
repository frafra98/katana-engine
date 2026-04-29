import { logDebug } from '../../../utils/debug/logger';
import type { IEngineObject } from './Types';

export const DEFAULT_METHODS = { UPDATE_OBJECT: 'update' };

export const isUpdatable = (obj: any): obj is any => {
  return obj && obj._updateFn && typeof obj._updateFn === 'function';
};

export class UpdatablesManager {
  private static updatables: any[] = [];

  static addUpdatableObject(item: IEngineObject, hasKatanaChildren = false) {
    if (hasKatanaChildren && item.getMesh().children) {
      for (const c in item.getMesh().children) {
        const child = item.getMesh().children[c];
        if (isUpdatable(child)) {
          logDebug('Added KatanaObject Child: ', child);
          this.updatables.push(child);
        }
      }
    } else {
      if (isUpdatable(item)) {
        logDebug('Added KatanaObject: ', item);
        this.updatables.push(item);
      }
    }
  }

  static getUpdts() {
    return this.updatables;
  }
}
