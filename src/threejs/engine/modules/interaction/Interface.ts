import type { Object3D } from 'three';

export interface IInteractive {
  getInteractiveRoot(): Object3D;
  onSelect?(): void;
  onDeselect?(): void;
  onHover?(): void;
  onLeave?(): void;
}