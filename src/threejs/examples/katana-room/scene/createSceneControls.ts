import { UI } from '../../../../hooks/useWindows';
import type { Engine } from '../../../engine/core/Engine';
import { Color, FogExp2, Scene, type WebGLRenderer } from 'three';
import type { PostProcessingSystem } from '../../../engine/modules/postprocessing/PostProcessingSystem';

const sceneDefaults = {
  backgroundColour: '#000000',
  fogDensity: 0.01,
  fogColour: '#ff00ff',
};

export function setupSceneControlWindow(engine: Engine, renderSettings: any) {
  const renderer: WebGLRenderer = engine.renderer.threeRenderer;
  const scene: Scene = engine.scene.threeScene;
  const composer = engine.getModule('composer') as PostProcessingSystem;

  // --- Scene Setup ---
  scene.background = new Color(sceneDefaults.backgroundColour);
  engine.renderer.threeRenderer.setClearColor(sceneDefaults.backgroundColour);

  scene.fog = new FogExp2(
    new Color(sceneDefaults.fogColour),
    sceneDefaults.fogDensity
  );

  // --- Render Setup ---
  const baseWidth = renderSettings.width;
  const baseHeight = renderSettings.height;

  let renderScale = renderSettings.renderScale;

  // Initial size
  composer.setSize(baseWidth * renderScale, baseHeight * renderScale);  

  // --- Single Window ---
  const win = UI.addWindow({
    title: 'Scene Controls',
    position: { x: 0, y: 70 },
    content: [],
    size: {
      width: 200,
      height: 600,
    },
    isMinimized: false,
  });

  // --- Resolution / Render Scale ---
  UI.addContent(win, [
    {
      param: 'resolution',
      group: 'Render Settings',
      name: 'Resolution',
      type: 'slider',
      min: 0.01,
      max: 2.0,
      step: 0.01,
      value: renderScale,
      effect: (val: number) => {
        renderScale = val;

        const scaledW = baseWidth * renderScale;
        const scaledH = baseHeight * renderScale;

        renderer.setPixelRatio(
          Math.min(window.devicePixelRatio * renderScale, 2)
        );

        renderer.setSize(scaledW, scaledH, false);
        composer.setSize(scaledW, scaledH);
      },
    },
  ]);

  // --- Background Color ---
  UI.addContent(win, [
    {
      param: 'renderer.bgColor',
      name: 'Background Color',
      group: 'Scene',
      type: 'color',
      value: sceneDefaults.backgroundColour,
      effect: (val: string) => {
        if (scene.background instanceof Color) {
          scene.background.set(val);
        }
      },
    },
  ]);

  // --- Fog Density ---
  UI.addContent(win, [
    {
      param: 'scene.fogDensity',
      group: 'Scene',
      name: 'Fog Density',
      type: 'slider',
      min: 0.0,
      max: 1.0,
      step: 0.001,
      value: sceneDefaults.fogDensity,
      effect: (val: number) => {
        if (scene.fog instanceof FogExp2) {
          scene.fog.density = val;
        }
      },
    },
  ]);

  // --- Fog Color ---
  UI.addContent(win, [
    {
      param: 'scene.fogColour',
      group: 'Scene',
      name: 'Fog Colour',
      type: 'color',
      value: sceneDefaults.fogColour,
      effect: (val: string) => {
        if (scene.fog instanceof FogExp2) {
          scene.fog.color.set(val);
        }
      },
    },
  ]);

  

  engine.mainWindowId = win;
}