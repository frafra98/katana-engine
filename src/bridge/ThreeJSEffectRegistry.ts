import { useParamStore } from '../stores/paramsStore';
import type { UIControl } from '../types/UITypes';

export type EffectHandler = (value: UIControl['value']) => void;

export interface KatanaWindow {
  id: string;
  title: string;
  position: { x: number; y: number };
  content: UIControl[];
  size?: { width: number; height: number };
  isMinimized?: boolean;
  zIndex?: number;
}

class ThreeJSEffectRegistry {
  private handlers = new Map<string, EffectHandler>();
  private windows = new Map<string, KatanaWindow>();

  /**
   * Register a single control effect
   */
  register(key: string, handler: EffectHandler): () => void {
    this.handlers.set(key, handler);

    // Apply immediately so initial Three.js state matches the store
    const currentValue = useParamStore.getState().getParam(key);

    if (currentValue !== undefined) {
      handler(currentValue);
    }

    // Return unregister fn for easy cleanup
    return () => this.handlers.delete(key);
  }

  /**
   * Register a window and all its controls
   */
  registerWindow(window: KatanaWindow): () => void {
    this.windows.set(window.id, window);

    // Register all controls within the window
    window.content.forEach((control) => {
      if (control.param && control.effect) {
        this.register(control.param, control.effect);
      }
    });

    // Return unregister fn for easy cleanup
    return () => {
      // Unregister all controls in the window
      window.content.forEach((control) => {
        if (control.param) {
          this.handlers.delete(control.param);
        }
      });
      this.windows.delete(window.id);
    };
  }

  /**
   * Register multiple windows at once
   */
  registerWindows(windows: KatanaWindow[]): () => void {
    const unsubscribers = windows.map((window) => this.registerWindow(window));

    // Return a single unsubscriber that removes all
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }

  /**
   * Apply an effect handler to a control value
   */
  apply(key: string, value: UIControl['value']) {
    this.handlers.get(key)?.(value);
  }

  /**
   * Check if a handler exists for a key
   */
  has(key: string) {
    return this.handlers.has(key);
  }

  /**
   * Get a registered window
   */
  getWindow(id: string): KatanaWindow | undefined {
    return this.windows.get(id);
  }

  /**
   * Get all registered windows
   */
  getAllWindows(): KatanaWindow[] {
    return Array.from(this.windows.values());
  }

  /**
   * Remove a window and its controls
   */
  unregisterWindow(id: string): boolean {
    const window = this.windows.get(id);
    if (!window) return false;

    window.content.forEach((control) => {
      if (control.param) {
        this.handlers.delete(control.param);
      }
    });

    return this.windows.delete(id);
  }

  /**
   * Clear all handlers and windows
   */
  clear() {
    this.handlers.clear();
    this.windows.clear();
  }
}

// Singleton — import this wherever you need to register effects
export const threeJSEffects = new ThreeJSEffectRegistry();
