/**
 * Default values for KatanaWindow UI styling parameters
 */
export const WINDOW_DEFAULTS = {
  uiColor: '#1e1e1e',
  secondaryColor: '#444444',
  primaryColor: '#ee3300',
  blur: 10,
  opacity: 0.5,
  borderRadius: 8,
  isCustomizable: false,
  minWidth: 200,
  minHeight: 150,
} as const;

/**
 * Type to ensure type safety when using defaults
 */
export type WindowDefaults = typeof WINDOW_DEFAULTS;