import * as THREE from 'three';

export class RaycastSystem {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  constructor(
    private renderer: THREE.WebGLRenderer,
    private camera: THREE.Camera
  ) {}

  public intersect(
    event: MouseEvent,
    interactiveObjects: THREE.Object3D[]
  ): THREE.Intersection[] {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.raycaster.params.Line.threshold = 0.05; // or 0.1 depending on scale
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    return this.raycaster.intersectObjects(interactiveObjects, true);
  }

  public intersectPlane(plane: THREE.Plane, target: THREE.Vector3) {
    return this.raycaster.ray.intersectPlane(plane, target);
  }
}
