import { create } from "zustand";
import { WINDOW_DEFAULTS } from '../components/threejs-ui/config/ui-config';

export interface UITheme {
  uiColor: string;
  secondaryColor: string;
  primaryColor: string;
  blur: number;
  opacity: number;
  borderRadius: number;
}

interface ThemeStore {
  theme: UITheme;
  updateTheme: (updates: Partial<UITheme>) => void;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: {
    uiColor: WINDOW_DEFAULTS.uiColor,
    secondaryColor: WINDOW_DEFAULTS.secondaryColor,
    primaryColor: WINDOW_DEFAULTS.primaryColor,
    blur: WINDOW_DEFAULTS.blur,
    opacity: WINDOW_DEFAULTS.opacity,
    borderRadius: WINDOW_DEFAULTS.borderRadius,
  },

  updateTheme: (updates) => {
    set((state) => ({
      theme: {
        ...state.theme,
        ...updates,
      },
    }));
  },

  resetTheme: () => {
    set({
      theme: {
        uiColor: WINDOW_DEFAULTS.uiColor,
        secondaryColor: WINDOW_DEFAULTS.secondaryColor,
        primaryColor: WINDOW_DEFAULTS.primaryColor,
        blur: WINDOW_DEFAULTS.blur,
        opacity: WINDOW_DEFAULTS.opacity,
        borderRadius: WINDOW_DEFAULTS.borderRadius,
      },
    });
  },
}));