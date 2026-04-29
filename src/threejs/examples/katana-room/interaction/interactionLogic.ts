import type { IInteractive } from '../../../engine/modules/interaction/Interface';
import { logDebug } from '../../../../utils/debug/logger';
import type { Engine } from '../../../engine/core/Engine';
import type { InteractionManager } from '../../../engine/modules/interaction/InteractionManager';
import type { OutlinePass } from 'three/examples/jsm/Addons.js';
import { UI } from '../../../../hooks/useWindows';
import { selectionColor, SelectionSystem } from '../../../engine/modules/selection/SelectionSystem';

// ============================================
// Call a lifecycle callback on an interactive
// ============================================
function callCallback(interactive: IInteractive | null, methodName: string) {
  if (!interactive) return;

  const handler = (interactive as any)[methodName];
  if (typeof handler === 'function') {
    try {
      handler.call(interactive);
    } catch (e) {
      logDebug(`Error calling ${methodName}:`, e);
    }
  }
}

// ============================================
// Main handler
// ============================================
export const interactionHandler = {
  setupInteractionCallbacks(im: InteractionManager, engine: Engine) {
    createSelectionSystemControls(engine);

    const selectionSystem = new SelectionSystem();
    const cachedState = selectionSystem.getState();

    cachedState.outlinePass = engine.composer?.getPass?.(
      'outline'
    ) as OutlinePass | null;
    logDebug(
      'OutlinePass reference set in interaction handler:',
      cachedState.outlinePass
    );

    // -------- Hover --------
    im.onHover = (interactive: IInteractive | null) => {
      const obj = interactive?.getInteractiveRoot?.() ?? null;

      if (obj) {
        document.body.style.cursor = 'pointer';
        selectionSystem.select(obj);
      }

      callCallback(interactive, 'onHover');
    };

    // -------- Leave --------
    im.onLeave = (interactive: IInteractive | null) => {
      const obj = interactive?.getInteractiveRoot?.() ?? null;

      document.body.style.cursor = 'default';
      if (obj) selectionSystem.deselect(obj);

      callCallback(interactive, 'onLeave');
    };

    // -------- Select --------
    im.onSelect = (interactive: IInteractive | null) => {
      const obj = interactive?.getInteractiveRoot?.() ?? null;

      // if (cachedState.outlinePass && obj) {
      //   cachedState.outlinePass.selectedObjects = getAllMeshes(obj);
      // }

      if (obj) {
        document.body.style.cursor = 'pointer';
        selectionSystem.select(obj);
      }

      callCallback(interactive, 'onSelect');
    };

    // -------- Deselect --------
    im.onDeselect = (interactive: IInteractive | null) => {
      const obj = interactive?.getInteractiveRoot?.() ?? null;

      if (cachedState.outlinePass) {
        cachedState.outlinePass.selectedObjects = [];
      }

      document.body.style.cursor = 'default';
      if (obj) selectionSystem.deselect(obj);

      callCallback(interactive, 'onDeselect');
      logDebug('Deselected:', interactive);
    };
  },
};

function createSelectionSystemControls(engine: Engine) {
  engine.mainWindowId &&
    UI.addContent(engine.mainWindowId, [
      {
        param: 'selection.color',
        name: 'Outline Color',
        group: 'Selection Settings',
        type: 'color',
        value: '#00aaff',
        effect: (val: string) => {
          selectionColor.set(val);
        },
      },
    ]);
}
