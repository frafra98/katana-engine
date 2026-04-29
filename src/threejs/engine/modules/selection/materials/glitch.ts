// ============================================
// Glitch material colour swap

import { logDebug } from '../../../../../utils/debug/logger';
import { selectionColor } from '../SelectionSystem';

// ============================================
export function applyGlitch(mat: any) {
  if (!mat || mat.userData?.glitchSelectionApplied) return;

  // Save the original color exactly once, before we overwrite it
  if (mat.uniforms?.uColor?.value) {
    mat.userData.originalGlitchColor = mat.uniforms.uColor.value.clone();
  }

  mat.userData.glitchSelectionApplied = true;
  mat.uniforms?.uColor?.value?.set(selectionColor);
  logDebug('Applied selection color to glitch material:', mat);
}

export function removeGlitch(mat: any) {
  if (!mat || !mat.userData?.glitchSelectionApplied) return;

  if (mat.userData.originalGlitchColor && mat.uniforms?.uColor?.value) {
    mat.uniforms.uColor.value.set(mat.userData.originalGlitchColor);
  }

  delete mat.userData.glitchSelectionApplied;
  delete mat.userData.originalGlitchColor;
  logDebug('Reset selection color on glitch material:', mat);
}
