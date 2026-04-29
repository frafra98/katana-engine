import * as THREE from 'three';

export function createShinyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#b89600') },    
      uGlowColor: { value: new THREE.Color('#e6c85c') },
      uGlowIntensity: { value: 0.2 },
      uShineIntensity: { value: 0.6 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vNormal = normalize(normalMatrix * normal);

        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vec3 cameraDir = normalize(cameraPosition - worldPos.xyz);
        vViewDir = cameraDir;

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uGlowColor;
      uniform float uGlowIntensity;
      uniform float uShineIntensity;

      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        // Fresnel (edge glow)
        float fresnel = pow(1.0 - dot(vNormal, vViewDir), 3.0);

        // Moving shine
        float shine = sin(uTime * 3.0 + vNormal.y * 10.0) * 0.5 + 0.5;
        shine = pow(shine, 8.0);

        vec3 color = uColor;

        // Add glow + shine
        color += uGlowColor * fresnel * uGlowIntensity;
        color += vec3(1.0) * shine * uShineIntensity;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}
