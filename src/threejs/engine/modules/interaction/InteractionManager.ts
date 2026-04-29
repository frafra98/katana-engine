import * as THREE from 'three';
import { RaycastSystem } from './RaycastSystem';
import { logDebug } from '../../../../utils/debug/logger';

export interface IInteractive {
  getInteractiveRoot(): THREE.Object3D;
}

export class InteractionManager {
  
  private raycastSystem: RaycastSystem;
  private interactiveObjects: IInteractive[] = [];
  private objectToInteractive: Map<THREE.Object3D, IInteractive> = new Map();

  private hovered: IInteractive | null = null;
  private selected: IInteractive | null = null;

  public onLeave?: (object: IInteractive | null) => void;
  public onHover?: (object: IInteractive | null) => void;
  public onSelect?: (object: IInteractive | null) => void;
  public onDeselect?: (object: IInteractive | null) => void; // <-- added

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this.raycastSystem = new RaycastSystem(renderer, camera);
  }

  public get selectedObject(): IInteractive | null {
    return this.selected;
  }

  public intersectPlane(plane: THREE.Plane, target: THREE.Vector3): THREE.Vector3 | null {
    return this.raycastSystem.intersectPlane(plane, target);
  }

  public setInteractiveObjects(objects: IInteractive[]) {
    this.interactiveObjects = objects;
    this.objectToInteractive.clear();
    
    objects.forEach((obj) => {
      this.objectToInteractive.set(obj.getInteractiveRoot(), obj);
    });
    
    logDebug('set inter objs: ', objects);
  }

  public addInteractiveObject(object: IInteractive) {
    logDebug('added new inter obj: ', object);

    this.interactiveObjects.push(object);
    this.objectToInteractive.set(object.getInteractiveRoot(), object);
  }

  public handleClick(event: MouseEvent) {
    const threeMeshes = this.interactiveObjects.map((obj) =>
      obj.getInteractiveRoot()
    );

    const intersects = this.raycastSystem.intersect(event, threeMeshes);

    const hitMesh = intersects.length > 0 ? intersects[0].object : null;
    const interactive = this.resolveInteractive(hitMesh);

    // --- Deselect previous selection if necessary ---
    if (this.selected && this.selected !== interactive) {
      logDebug('onDeselect:', this.selected);
      this.onDeselect?.(this.selected);
    }

    if (interactive) {
      this.selected = interactive;
      logDebug('Selected:', interactive);
      this.onSelect?.(interactive);
    } else {
      // No object clicked → clear selection
      if (this.selected) {
        logDebug('onDeselect:', this.selected);
        this.onDeselect?.(this.selected);
        this.selected = null;
      }
    }
  }

  public handlePointerMove(event: MouseEvent) {
    const threeMeshes = this.interactiveObjects.map((obj) =>
      obj.getInteractiveRoot()
    );

    const intersects = this.raycastSystem.intersect(event, threeMeshes);

    const hitMesh = intersects.length > 0 ? intersects[0].object : null;
    const interactive = this.resolveInteractive(hitMesh);

    if (interactive !== this.hovered) {
      // Call onLeave for the previously hovered entity
      if (this.hovered) {
        logDebug('onLeave: ', this.hovered);
        this.onLeave?.(this.hovered);
      }

      this.hovered = interactive;
      logDebug('onHover: ', interactive);
      this.onHover?.(interactive);
    }
  }
  
  public isHoveredEntity(interactive: IInteractive | null): boolean {
    return this.hovered === interactive;
  }

  // Resolve THREE.Object3D to IInteractive by traversing up the hierarchy
  private resolveInteractive(object: THREE.Object3D | null): IInteractive | null {
    let current = object;

    while (current) {
      const interactive = this.objectToInteractive.get(current);
      if (interactive) {
        return interactive;
      }
      current = current.parent;
    }

    return null;
  }
}