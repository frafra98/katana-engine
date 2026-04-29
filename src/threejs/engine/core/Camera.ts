import { OrthographicCamera, PerspectiveCamera } from 'three';

type CameraType = 'perspective' | 'orthographic';

interface CameraSettings {
  type?: CameraType;
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  position?: { x: number; y: number; z: number };

  // only for orthographic
  frustumSize?: number;
}

export class Camera {
  public threeCamera: PerspectiveCamera | OrthographicCamera;

  constructor(settings: CameraSettings = {}) {
    this.threeCamera = this.createCamera(settings);
  }

  private createCamera(settings: CameraSettings) {
    const {
      type = 'perspective',
      fov = 75,
      aspect = window.innerWidth / window.innerHeight,
      near = 0.01,
      far = 1000,
      position = { x: 0, y: 0, z: 10 },
      frustumSize = 10,
    } = settings;

    let camera: PerspectiveCamera | OrthographicCamera;

    if (type === 'perspective') {
      camera = new PerspectiveCamera(fov, aspect, near, far);
    } else {
      const halfHeight = frustumSize / 2;
      const halfWidth = halfHeight * aspect;

      camera = new OrthographicCamera(
        -halfWidth,
        halfWidth,
        halfHeight,
        -halfHeight,
        near,
        far
      );
    }

    camera.position.set(position.x, position.y, position.z);

    return camera;
  }

  public setCamera(settings: CameraSettings) {
    const oldCamera = this.threeCamera;

    this.threeCamera = this.createCamera(settings);

    // Optional: preserve position if not provided
    if (!settings.position) {
      this.threeCamera.position.copy(oldCamera.position);
    }

    // Optional: preserve rotation
    this.threeCamera.rotation.copy(oldCamera.rotation);
  }

  public updateAspect(settings: CameraSettings) {
    if (this.threeCamera instanceof PerspectiveCamera) {
      this.threeCamera.aspect = settings.aspect!;
      this.threeCamera.updateProjectionMatrix();
    }
  }
}
