// ============================================
// Emissive pulse (untextured standard materials)

import { selectionColor } from '../SelectionSystem';

// ============================================
export function applyEmissive(mat: any) {
  if (!mat || mat.userData?.emissiveApplied) return;

  mat.userData.emissiveApplied = true;
  mat.userData.originalEmissive = mat.emissive?.clone?.() ?? null;
  mat.userData.originalEmissiveIntensity = mat.emissiveIntensity ?? 1.0;

  if (mat.emissive) {
    mat.emissive.copy(selectionColor);
  }
  // Start from zero so the pulse always ramps up cleanly on enter
  mat.emissiveIntensity = 0.0;
}

export function removeEmissive(mat: any) {
  if (!mat || !mat.userData?.emissiveApplied) return;

  if (mat.emissive && mat.userData.originalEmissive) {
    mat.emissive.copy(mat.userData.originalEmissive);
  }
  mat.emissiveIntensity = mat.userData.originalEmissiveIntensity ?? 1.0;

  delete mat.userData.emissiveApplied;
  delete mat.userData.originalEmissive;
  delete mat.userData.originalEmissiveIntensity;
}
