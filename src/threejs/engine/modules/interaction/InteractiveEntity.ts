import * as THREE from 'three';
import type { IInteractive } from './Interface';
import { logDebug } from '../../../../utils/debug/logger';
import { KatanaObject } from '../../core/Entity';

export class InteractiveKatanaObject extends KatanaObject implements IInteractive {
  // Interaction Manager interface
  private interactiveRoot: THREE.Object3D;
  private _onSelectFn?: () => void;
  private _onHoverFn?: () => void;
  private _onLeaveFn?: () => void;
  private _onDeselectFn?: () => void;

  constructor(
    mesh: THREE.Object3D,
    updateFn?: (d: number, e: any) => void,
    interactiveRoot?: THREE.Object3D
  ) {
    super(mesh, updateFn);
    this.interactiveRoot = interactiveRoot || mesh;
  }

  // IInteractive
  getInteractiveRoot(): THREE.Object3D {
    return this.interactiveRoot;
  }

  setInteractiveRoot(obj: THREE.Object3D): void {
    this.interactiveRoot = obj;
  }

  // Setters for callbacks
  setOnSelect(fn: () => void): this {
    this._onSelectFn = fn;
    return this;
  }  
  
  setOnDeselect(fn: () => void): this {
    this._onDeselectFn = fn;
    return this;
  }

  setOnHover(fn: () => void): this {
    this._onHoverFn = fn;
    return this;
  }

  setOnLeave(fn: () => void): this {
    this._onLeaveFn = fn;
    return this;
  }

  // Callback methods (called by InteractionManager)
  onSelect(): void {
    logDebug('onSelect called.');
    this._onSelectFn?.();
  }

  onDeselect(): void {
    logDebug('onDeselect called.');
    this._onDeselectFn?.();
  }

  onHover(): void {
    logDebug('onHover called.');
    this._onHoverFn?.();
  }

  onLeave(): void {
    logDebug('onLeave called.');
    this._onLeaveFn?.();
  }
}
