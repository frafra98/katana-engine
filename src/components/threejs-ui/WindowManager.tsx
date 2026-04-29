import {
  getWindowEffectiveTheme,
  useWindowStore,
} from '../../stores/windowStore';
import ControlsPanel from './BladeUI/BladeControlsPanel';
import BladeWindow from './BladeUI/BladeWindow';

export function WindowManager() {
  const windows = useWindowStore((s) => s.windows);
  const order = useWindowStore((s) => s.order);

  return (
    <>
      {order.map((id) => {
        const window = windows[id];
        if (!window) return null;
        const effectiveTheme = getWindowEffectiveTheme(window);

        return (
          <BladeWindow bWindow={window} key={id}>
            <ControlsPanel
              color={effectiveTheme.secondaryColor}
              primaryColor={effectiveTheme.primaryColor}
              controls={window.content}
            />
          </BladeWindow>
        );
      })}
    </>
  );
}
