// ============================================
// Fresnel shader injection (textured materials)

import { selectionColor } from '../SelectionSystem';

// ============================================
export function applyFresnel(material: any) {
  if (!material || material.userData?.fresnelApplied) return;

  material.userData.fresnelApplied = true;

  material.onBeforeCompile = (shader: any) => {
    shader.uniforms.uFresnelColor = { value: selectionColor };
    shader.uniforms.uFresnelPower = { value: 0.5 };
    shader.uniforms.uFresnelIntensity = { value: 0.0 };

    shader.fragmentShader = shader.fragmentShader.replace(
      'uniform vec3 diffuse;',
      `
            uniform vec3 diffuse;
            uniform vec3 uFresnelColor;
            uniform float uFresnelPower;
            uniform float uFresnelIntensity;
          `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `
            #include <emissivemap_fragment>
    
            #ifndef FLAT_SHADED
              float fresnel = pow(1.0 - max(0.0, dot(normalize(vNormal), normalize(vViewPosition))), uFresnelPower);
              vec3 fresnelGlow = uFresnelColor * fresnel * uFresnelIntensity;
              totalEmissiveRadiance += fresnelGlow;
            #endif
          `
    );

    material.userData.fresnelUniforms = shader.uniforms;
  };

  material.needsUpdate = true;
}
