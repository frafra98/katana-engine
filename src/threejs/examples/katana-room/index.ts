import { useLoadingStore } from '../../../stores/loadingScreenStore';
import type { Engine } from '../../engine/core/Engine';
import type { InteractionManager } from '../../engine/modules/interaction/InteractionManager';
import { setUpKatanaRoom } from './appLogic';
import { interactionHandler } from './interaction/interactionLogic';

// Main function to set up the Katana Room scene
export async function loadKatanaRoomExample(
  engine: Engine,
  im: InteractionManager,
) {
  const setProgress = useLoadingStore.getState().setProgress;
  const start = useLoadingStore.getState().start;
  const finish = useLoadingStore.getState().finish;

  start();

  
  // 1. Import 3D model
  const rc = await setUpKatanaRoom(engine, im, (p) => {
    setProgress(p);
  });

  // 2. Add the room to the scene
  engine.scene.add(rc);

  // 3. Setup interaction callbacks after the scene is initialized
  interactionHandler.setupInteractionCallbacks(im, engine);

  finish();
}
