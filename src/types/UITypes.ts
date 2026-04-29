export interface UIControl {
  name: string;
  type: 'slider' | 'color' | 'toggle' | 'display'; // Union of actual types used
  value: string | number | boolean;
  min?: number;
  group?: string;
  max?: number;
  step?: number;

  // MAKE GET AND SET
  param: string;
  effect?: (value: any) => void;
}
