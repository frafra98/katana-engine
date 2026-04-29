// ============================================
// Check if a material has any texture map
// ============================================
export function materialHasTexture(mat: any): boolean {
  return !!(
    mat.map ||
    mat.normalMap ||
    mat.roughnessMap ||
    mat.metalnessMap ||
    mat.aoMap ||
    mat.emissiveMap ||
    mat.alphaMap ||
    mat.displacementMap
  );
}
