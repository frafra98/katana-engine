import * as THREE from 'three';

/**
 * Creates a random icosphere mesh for testing
 */
export function createRandomIcosphere(
  position: { x: number; y: number; z: number } | undefined = undefined
): THREE.Mesh {
  // Geometry: radius 1, detail 2 (more triangles)
  const geometry = new THREE.IcosahedronGeometry(0.1, 2);

  // Material: random color
  const glitchMaterial = new THREE.ShaderMaterial({
      wireframe: true,
      transparent: true,
      userData: {
        isGlitchMaterial: true, // Custom flag for identification
      },
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x00ffff) },
        uGlitchIntensity: { value: 0.4 },
      },
  
      vertexShader: `
        uniform float uTime;
        uniform float uGlitchIntensity;
        
        varying float vNoise;
    
        // simple hash
        float hash(vec3 p){
          return fract(sin(dot(p ,vec3(127.1,311.7,74.7))) * 43758.5453);
        }
    
        void main() {
    
          vec3 pos = position;
    
          float glitch = step(0.85, hash(vec3(pos.y * 10.0, floor(uTime * 6.0), pos.x)));
    
          pos += normal * glitch * uGlitchIntensity;
    
          vNoise = hash(pos + uTime);
    
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
        }
      `,
  
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
    
        varying float vNoise;
    
        void main(){
    
          float scan = sin(gl_FragCoord.y * 0.1 + uTime * 8.0) * 0.1;
    
          vec3 col = uColor;
    
          // glitch color shift
          col.r += vNoise * 0.4;
          col.b += scan;
    
          float flicker = step(0.97, fract(sin(uTime*20.0)*43758.5453));
    
          col += flicker * 0.5;
    
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

  const mesh = new THREE.Mesh(geometry, glitchMaterial);

  if (position === undefined) {
    // Random position in scene for testing
    mesh.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 5 + 2,
      (Math.random() - 0.5) * 10
    );

    // Rotate randomly
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
  } else {
    mesh.position.set(position.x, position.y + 0.15, position.z);
  }
  // Make it interactive for your InteractionManager
  mesh.userData.interactiveRoot = mesh;

  return mesh;
}

