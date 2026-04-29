import { useWindowStore, type KatanaWindow } from '../stores/windowStore';
import type { UIControl } from '../types/UITypes';

type CreateWindow = Omit<KatanaWindow, "id" | "zIndex">;

export const UI = {
  addWindow(config: CreateWindow) {
    return useWindowStore.getState().addWindow(config);
  },

  addContent(id: string, controls: UIControl[]) {
    useWindowStore.getState().updateWindowContent(id, controls);
  },  
  
  updateWindow(id: string, updates: Partial<KatanaWindow>) {
    useWindowStore.getState().updateWindow(id, updates);
  },

  removeWindow(id: string) {
    useWindowStore.getState().removeWindow(id);
  },

  moveWindow(id: string, position: { x: number; y: number }) {
    useWindowStore.getState().moveWindow(id, position);
  },

  minimizeWindow(id: string, isMinimized: boolean) {
    useWindowStore.getState().minimizeWindow(id, isMinimized);
  },

  bringToFront(id: string) {
    useWindowStore.getState().bringToFront(id);
  },

  clear() {
    useWindowStore.getState().clearAllWindows();
  }
};