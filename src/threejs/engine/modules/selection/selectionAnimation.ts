// ============================================
// Pulse animation parameters
// ============================================
const PULSE_PERIOD = 1.0;
const PULSE_MIN_INTENSITY = 0.0;
const PULSE_MAX_INTENSITY = 1.0;
const PULSE_GAP = 0.8; // seconds of pause between pulses

// ============================================
// Pulse animation loop
// Drives all three material paths from one rAF loop
// ============================================

export function startPulseAnimation(cachedState: any) {
  if (cachedState.pulseAnimationId !== null) return;

  const startTime = performance.now();

  function animate(currentTime: number) {
    const elapsedTime = (currentTime - startTime) / 1000;

    const TOTAL_CYCLE = PULSE_PERIOD + PULSE_GAP;
    const cycleTime = elapsedTime % TOTAL_CYCLE;

    let intensity: number;

    if (cycleTime <= PULSE_PERIOD) {
      // Active pulse phase
      const cycleProgress = cycleTime / PULSE_PERIOD;

      intensity =
        PULSE_MIN_INTENSITY +
        ((PULSE_MAX_INTENSITY - PULSE_MIN_INTENSITY) *
          (Math.sin(cycleProgress * Math.PI * 2 - Math.PI / 2) + 1)) /
          2;
    } else {
      // Gap phase → no glow
      intensity = PULSE_MIN_INTENSITY;
    }

    cachedState.activeMeshes.forEach((mesh: any) => {
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((mat: any) => {
        if (mat.userData?.fresnelUniforms?.uFresnelIntensity !== undefined) {
          mat.userData.fresnelUniforms.uFresnelIntensity.value = intensity;
        } else if (mat.userData?.emissiveApplied) {
          mat.emissiveIntensity = intensity;
        }
      });
    });

    if (cachedState.activeMeshes.size > 0) {
      cachedState.pulseAnimationId = requestAnimationFrame(animate);
    } else {
      cachedState.pulseAnimationId = null;
    }
  }

  cachedState.pulseAnimationId = requestAnimationFrame(animate);
}
