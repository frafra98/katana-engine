import { startPulseAnimation } from './selectionAnimation';
import { applyEmissive, removeEmissive } from './materials/emissive';
import { applyFresnel } from './materials/fresnel';
import { applyGlitch, removeGlitch } from './materials/glitch';
import { materialHasTexture } from './materials/utils';
import type { OutlinePass } from 'three/examples/jsm/Addons.js';
import { Color } from 'three';

export const selectionColor = new Color(0x00aaff);

type AnyMesh = any;
type AnyObject = any;

interface CachedState {
  outlinePass: OutlinePass | null;
  materialMap: WeakMap<AnyMesh, any>;
  activeMeshes: Set<AnyMesh>;
  pulseAnimationId: number | null;
}

export class SelectionSystem {
  private cachedState: CachedState = {
    outlinePass: null,
    materialMap: new WeakMap(),
    activeMeshes: new Set(),
    pulseAnimationId: null,
  };

  // =========================
  // PUBLIC API
  // =========================

  public select(obj: AnyObject) {
    if (!obj) return;

    const meshes = this.getAllMeshes(obj);

    meshes.forEach((mesh: AnyMesh) => {
      const isGlitch = !!mesh.material?.userData?.isGlitchMaterial;

      if (!this.cachedState.materialMap.has(mesh)) {
        if (this.cachedState.outlinePass && obj) {
          this.cachedState.outlinePass.selectedObjects = this.getAllMeshes(obj);
        }

        if (isGlitch) {
          this.cachedState.materialMap.set(mesh, null);
        } else {
          this.cachedState.materialMap.set(mesh, mesh.material);

          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m: any) => m.clone());
          } else {
            mesh.material = mesh.material.clone();
          }
        }
      }

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((mat: any) => {
        if (isGlitch) {
          applyGlitch(mat);
        } else if (materialHasTexture(mat)) {
          applyFresnel(mat);
        } else {
          applyEmissive(mat);
        }
      });

      this.cachedState.activeMeshes.add(mesh);
    });

    startPulseAnimation(this.cachedState);
  }

  public deselect(obj: AnyObject) {
    if (!obj) return;

    const meshes = this.getAllMeshes(obj);

    meshes.forEach((mesh: AnyMesh) => {
      const isGlitch = !!mesh.material?.userData?.isGlitchMaterial;

      if (this.cachedState.outlinePass && obj) {
        this.cachedState.outlinePass.selectedObjects = [];
      }

      if (isGlitch) {
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];

        materials.forEach((mat: any) => removeGlitch(mat));

        this.cachedState.materialMap.delete(mesh);
      } else {
        const original = this.cachedState.materialMap.get(mesh);

        if (original !== undefined && original !== null) {
          mesh.material = original;
          this.cachedState.materialMap.delete(mesh);
        } else {
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];

          materials.forEach((mat: any) => removeEmissive(mat));
        }
      }

      this.cachedState.activeMeshes.delete(mesh);
    });
  }

  public getState() {
    return this.cachedState;
  }

  // =========================
  // PRIVATE HELPERS
  // =========================

  private getAllMeshes(obj: AnyObject): AnyMesh[] {
    const meshes: AnyMesh[] = [];

    if (obj.isMesh) meshes.push(obj);

    if (obj.children?.length > 0) {
      obj.children.forEach((child: AnyObject) => {
        meshes.push(...this.getAllMeshes(child));
      });
    }

    return meshes;
  }
}
