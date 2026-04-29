import * as THREE from 'three';
import {
  GLTFLoader,
  type GLTF,
} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

export class AssetLoader {
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private cubeTextureLoader: THREE.CubeTextureLoader;
  private rgbeLoader: HDRLoader;
  private dracoLoader: DRACOLoader;
  private cache: Map<any, any>;
  private loadingManager: THREE.LoadingManager;
  private basePath: string;
  private animationMixers: Set<unknown>;

  constructor() {
    // Initialize loaders
    this.gltfLoader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.rgbeLoader = new HDRLoader();

    // Setup DRACO loader for compressed models
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath(
      'https://www.gstatic.com/draco/versioned/decoders/1.5.6/'
    );
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    // Cache for loaded assets
    this.cache = new Map();

    // Loading manager for tracking progress
    this.loadingManager = new THREE.LoadingManager();
    this.setupLoadingManager();

    // Default base path
    this.basePath = '';

    // Store animation mixers for all loaded models
    this.animationMixers = new Set();
  }

  /**
   * Setup loading manager with progress tracking
   */
  private setupLoadingManager() {
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(
        `Started loading: ${url}. Loaded ${itemsLoaded} of ${itemsTotal} files.`
      );
    };

    this.loadingManager.onLoad = () => {
      console.log('All assets loaded!');
    };

    this.loadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      console.log(`Loading progress: ${progress.toFixed(2)}%`);
    };

    this.loadingManager.onError = (url) => {
      console.error(`Error loading: ${url}`);
    };
  }

  /**
   * Set base path for all assets
   * @param {string} path - Base path for assets
   */
  public setBasePath(path: string) {
    this.basePath = path;
    this.gltfLoader.setPath(path);
    this.textureLoader.setPath(path);
    this.cubeTextureLoader.setPath(path);
  }

  /**
   * Initialize the asset loader with a GLTF model
   * @param {string} url - URL to GLTF/GLB file
   * @returns {Promise<THREE.Group>} - Promise that resolves with the model (compatible with Updatable)
   */
  public init(url: string, onProgress?: (progress: number) => void) {
    return this.loadGLTF(url, onProgress);
  }

  /**
   * Load a GLTF model
   * @param {string} url - URL to GLTF file
   * @returns {Promise<THREE.Group>} - Promise that resolves with the model wrapped for Updatable
   */
  public loadGLTF(url: string, onProgress?: (progress: number) => void) {
    const fullUrl = this.basePath + url;

    // Check cache first
    if (this.cache.has(fullUrl)) {
      return Promise.resolve(this.cloneModel(this.cache.get(fullUrl)));
    }

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        fullUrl,
        (gltf) => {
          // Process the loaded model
          const processedModel = this.processGLTF(gltf);
          this.cache.set(fullUrl, processedModel);

          // Return a clone of the model (to allow multiple instances)
          const modelInstance = this.cloneModel(processedModel);
          resolve(modelInstance);
        },
        (progress) => {
          console.log(
            `Loading model ${fullUrl}: ${(
              (progress.loaded / progress.total) *
              100
            ).toFixed(2)}%`
          );
          const percent = Math.round((progress.loaded / progress.total) * 100);
          onProgress?.(percent);
        },
        (error) => {
          console.error(`Error loading model ${fullUrl}:`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Load multiple GLTF models
   * @param {Array<string>} urls - Array of URLs to GLTF files
   * @returns {Promise<Array<THREE.Group>>} - Promise that resolves with array of models
   */
  public loadMultipleGLTF(urls: any[]) {
    const promises = urls.map((url: any) => this.loadGLTF(url));
    return Promise.all(promises);
  }

  /**
   * Process a loaded GLTF model
   * @param {Object} gltf - Loaded GLTF object
   * @returns {Object} - Processed model data
   */
  private processGLTF(gltf: GLTF) {
    const modelData = {
      scene: gltf.scene,
      animations: gltf.animations || [],
      materials: new Map(),
      skeleton: null,
    };

    // Setup shadows and collect materials
    gltf.scene.traverse((node: any | null) => {
      if (node.isMesh) {
        // Enable shadows
        node.castShadow = false;
        node.receiveShadow = false;

        // Store materials for potential later use
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach((mat: any, index: any) => {
              modelData.materials.set(`${node.uuid}_${index}`, mat);
            });
          } else {
            modelData.materials.set(node.uuid, node.material);
          }
        }
      }

      if (node.isSkeleton) {
        modelData.skeleton = node;
      }
    });

    return modelData;
  }

  /**
   * Clone a model to create a new instance
   * @param {Object} modelData - Original model data
   * @returns {THREE.Group} - Cloned model with animation capabilities
   */
  private cloneModel(modelData: {
    scene: any;
    animations: any;
    materials?: Map<any, any>;
    skeleton?: null;
  }) {
    // Clone the scene
    const clonedScene = modelData.scene.clone();

    // Create animation mixer if animations exist
    if (modelData.animations && modelData.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(clonedScene);

      // Store animations and mixer on the object
      clonedScene.userData = {
        mixer: mixer,
        animations: modelData.animations,
        animationsByName: {},
        currentActions: new Map(),
      };

      // Store animations by name
      modelData.animations.forEach((clip: { name: string | number }) => {
        clonedScene.userData.animationsByName[clip.name] = clip;
      });

      // Track this mixer for global updates
      this.animationMixers.add(mixer);
    }

    return clonedScene;
  }

  /**
   * Create a wrapper that makes the model compatible with your Updatable interface
   * @param {THREE.Group} model - The loaded model
   * @returns {Object} - Object that implements Updatable
   */
  public createUpdatable(model: {
    userData: { mixer: { update: (arg0: any) => void } };
  }) {
    return {
      object: model,
      update: (delta: any, _elapsed: any) => {
        if (model.userData?.mixer) {
          model.userData.mixer.update(delta);
        }
      },
    };
  }

  /**
   * Play an animation on a model
   * @param {THREE.Group} model - The model instance
   * @param {string} animationName - Name of animation to play
   * @param {Object} options - Animation options
   * @returns {THREE.AnimationAction} - Animation action
   */
  public playAnimation(
    model: {
      userData: {
        mixer: { clipAction: (arg0: any) => any };
        animationsByName: { [x: string]: any };
        currentActions: {
          get: (arg0: string) => any;
          set: (arg0: string, arg1: any) => void;
        };
      };
    },
    animationName: string | number,
    options:any = {}
  ) {
    if (!model.userData?.mixer || !model.userData?.animationsByName) {
      console.warn(`Model doesn't have animations or mixer`);
      return null;
    }

    const clip = model.userData.animationsByName[animationName];
    if (!clip) {
      console.warn(
        `Animation "${animationName}" not found. Available: ${Object.keys(
          model.userData.animationsByName
        ).join(', ')}`
      );
      return null;
    }

    // Stop current animation if specified
    if (options.stopCurrent) {
      this.stopAllAnimations(model);
    }

    const action = model.userData.mixer.clipAction(clip);

    // Apply options
    if (options.loop !== undefined) {
      action.loop = options.loop;
    }
    if (options.timeScale !== undefined) {
      action.timeScale = options.timeScale;
    }
    if (options.crossFadeDuration) {
      // Handle crossfade with previous animation
      const currentAction = model.userData.currentActions.get('current');
      if (currentAction && currentAction.isRunning()) {
        action.crossFadeFrom(currentAction, options.crossFadeDuration, true);
      }
    }

    action.play();
    model.userData.currentActions.set('current', action);

    return action;
  }

  /**
   * Stop all animations on a model
   * @param {THREE.Group} model - The model instance
   */
  public stopAllAnimations(model: any) {
    if (model.userData?.mixer) {
      model.userData.mixer.stopAllAction();
      model.userData.currentActions.clear();
    }
  }

  /**
   * Get animation names available on a model
   * @param {THREE.Group} model - The model instance
   * @returns {Array<string>} - Array of animation names
   */
  public getAnimationNames(model: { userData: { animationsByName: {} } }) {
    if (model.userData?.animationsByName) {
      return Object.keys(model.userData.animationsByName);
    }
    return [];
  }

  /**
   * Update all animation mixers (useful if you don't use per-model updates)
   * @param {number} deltaTime - Time delta for animation
   */
  public updateAllAnimations(deltaTime: any) {
    this.animationMixers.forEach((mixer:any) => {
      mixer.update(deltaTime);
    });
  }

  /**
   * Load a texture
   * @param {string} url - URL to texture file
   * @returns {Promise<THREE.Texture>} - Promise that resolves with loaded texture
   */
  public loadTexture(url: string) {
    const fullUrl = this.basePath + url;

    if (this.cache.has(fullUrl)) {
      return Promise.resolve(this.cache.get(fullUrl).clone());
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        fullUrl,
        (texture) => {
          this.cache.set(fullUrl, texture);
          resolve(texture.clone());
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  /**
   * Load an HDR environment map
   * @param {string} url - URL to HDR file
   * @returns {Promise<THREE.DataTexture>} - Promise that resolves with HDR texture
   */
  public loadHDR(url: string) {
    const fullUrl = this.basePath + url;

    return new Promise((resolve, reject) => {
      this.rgbeLoader.load(
        fullUrl,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          this.cache.set(fullUrl, texture);
          resolve(texture.clone());
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  /**
   * Load a cube texture
   * @param {Array<string>} urls - Array of 6 URLs for cube faces
   * @returns {Promise<THREE.CubeTexture>} - Promise that resolves with cube texture
   */
  public loadCubeTexture(urls: any[]) {
    const fullUrls = urls.map((url: string) => this.basePath + url);
    const cacheKey = fullUrls.join('|');

    if (this.cache.has(cacheKey)) {
      return Promise.resolve(this.cache.get(cacheKey).clone());
    }

    return new Promise((resolve, reject) => {
      this.cubeTextureLoader.load(
        fullUrls,
        (texture) => {
          this.cache.set(cacheKey, texture);
          resolve(texture.clone());
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  /**
   * Clear the asset cache
   * @param {string} key - Optional specific key to clear
   */
  public clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Dispose of all animation mixers and resources
   */
  public dispose() {
    this.animationMixers.forEach((mixer:any) => {
      mixer.stopAllAction();
    });
    this.animationMixers.clear();
    this.cache.clear();
    this.dracoLoader.dispose();
  }
}
