import { create } from "zustand";
import type { UIControl } from "../types/UITypes";
import { useParamStore } from './paramsStore';
import { threeJSEffects } from '../bridge/ThreeJSEffectRegistry';
import { WINDOW_DEFAULTS } from '../components/threejs-ui/config/ui-config';
import { logDebug } from '../utils/debug/logger';
import { useThemeStore } from './useThemeStore';

export interface KatanaWindow {
  id: string;
  title: string;
  position: { x: number; y: number };
  content: UIControl[];
  size: { width: number; height: number };
  isMinimized: boolean;
  zIndex: number;
  // Optional UI styling parameters (undefined = use theme store)
  uiColor?: string;
  secondaryColor?: string;
  primaryColor?: string;
  blur?: number;
  opacity?: number;
  borderRadius?: number;
  isCustomizable?: boolean;
}

interface WindowStore {
  windows: Record<string, KatanaWindow>;
  order: string[];
  nextZIndex: number;

  addWindow: (window: Omit<KatanaWindow, "id" | "zIndex">) => string;
  removeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<KatanaWindow>) => void;
  updateWindowContent: (id: string, controls: UIControl[]) => void;
  moveWindow: (id: string, position: { x: number; y: number }) => void;
  minimizeWindow: (id: string, isMinimized: boolean) => void;
  bringToFront: (id: string) => void;
  clearAllWindows: () => void;
}

// Helper function to get effective theme (window override or global theme)
// const getEffectiveTheme = (window: Partial<KatanaWindow>) => {
//   const globalTheme = useThemeStore.getState().theme;
  
//   return {
//     uiColor: window.uiColor ?? globalTheme.uiColor,
//     secondaryColor: window.secondaryColor ?? globalTheme.secondaryColor,
//     primaryColor: window.primaryColor ?? globalTheme.primaryColor,
//     blur: window.blur ?? globalTheme.blur,
//     opacity: window.opacity ?? globalTheme.opacity,
//     borderRadius: window.borderRadius ?? globalTheme.borderRadius,
//   };
// };

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: {},
  order: [],
  nextZIndex: 1,
  
  addWindow: (window) => {
    const id = window.title;
    const zIndex = get().nextZIndex;
    // const effectiveTheme = getEffectiveTheme(window);

    const newWindow: KatanaWindow = {
      ...window,
      id,
      zIndex,
      size: window.size ?? { width: 400, height: 300 },
      isMinimized: window.isMinimized ?? false,
      // Only store explicitly set values, rest come from theme at runtime
      uiColor: window.uiColor,
      secondaryColor: window.secondaryColor,
      primaryColor: window.primaryColor,
      blur: window.blur,
      opacity: window.opacity,
      borderRadius: window.borderRadius,
      isCustomizable: window.isCustomizable ?? WINDOW_DEFAULTS.isCustomizable,
    };

    // Register and subscribe to controls
    window.content.forEach((c) => {
      if (c.param == null) {
        c.param = `${id}.${c.name.replace(/\s+/g, "_")}`;
      }
      const paramStore = useParamStore.getState();
      paramStore.registerParam({
        id: c.param,
        value: c.value,
        type: c.type,
        min: (c as any).min,
        max: (c as any).max,
        step: (c as any).step,
      });
      if (c.effect) threeJSEffects.register(c.param, c.effect);
    });

    set((state) => ({
      windows: {
        ...state.windows,
        [id]: newWindow,
      },
      order: [...state.order, id],
      nextZIndex: state.nextZIndex + 1,
    }));
    
    return id;
  },

  removeWindow: (id) => {
    set((state) => {
      const nextWindows = { ...state.windows };
      delete nextWindows[id];

      return {
        windows: nextWindows,
        order: state.order.filter((w) => w !== id),
      };
    });
  },

  updateWindow: (id, updates) => {
    set((state) => {
      const window = state.windows[id];
      if (!window) return state;

      logDebug(updates);

      return {
        windows: {
          ...state.windows,
          [id]: {
            ...window,
            ...updates,
          },
        },
      };
    });
  },

  updateWindowContent: (id: string, newControls: UIControl[]) => {
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      
      newControls.forEach((c) => {
        if (c.param == null) {
          c.param = `${win.id}.${c.name.replace(/\s+/g, "_")}`;
        }
        const paramStore = useParamStore.getState();
        paramStore.registerParam({
          id: c.param,
          value: c.value,
          type: c.type,
          min: (c as any).min,
          max: (c as any).max,
          step: (c as any).step,
        });
        if (c.effect) threeJSEffects.register(c.param, c.effect);
      });
  
      return {
        windows: {
          ...state.windows,
          [id]: { ...win, content: [...win.content, ...newControls] },
        },
      };
    });
  },

  moveWindow: (id, position) => {
    set((state) => {
      const window = state.windows[id];
      if (!window) return state;

      return {
        windows: {
          ...state.windows,
          [id]: {
            ...window,
            position,
          },
        },
      };
    });
  },

  minimizeWindow: (id, isMinimized) => {
    set((state) => {
      const window = state.windows[id];
      if (!window) return state;

      return {
        windows: {
          ...state.windows,
          [id]: {
            ...window,
            isMinimized,
          },
        },
      };
    });
  },

  bringToFront: (id) => {
    const zIndex = get().nextZIndex;

    set((state) => {
      const window = state.windows[id];
      if (!window) return state;

      return {
        windows: {
          ...state.windows,
          [id]: {
            ...window,
            zIndex,
          },
        },
        nextZIndex: state.nextZIndex + 1,
      };
    });
  },

  clearAllWindows: () => {
    set({
      windows: {},
      order: [],
      nextZIndex: 1,
    });
  },
}));

// Export a helper to get effective theme for a window
export const getWindowEffectiveTheme = (window: KatanaWindow) => {
  const globalTheme = useThemeStore.getState().theme;
  
  return {
    uiColor: window.uiColor ?? globalTheme.uiColor,
    secondaryColor: window.secondaryColor ?? globalTheme.secondaryColor,
    primaryColor: window.primaryColor ?? globalTheme.primaryColor,
    blur: window.blur ?? globalTheme.blur,
    opacity: window.opacity ?? globalTheme.opacity,
    borderRadius: window.borderRadius ?? globalTheme.borderRadius,
  };
};
