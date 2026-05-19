import * as THREE from 'three/webgpu';

export default class WorldEngine {
  constructor(containerElement) {
    this.container = containerElement;

    this.renderer    = null;
    this.scene       = null;
    this.camera      = null;
    this.geometry    = null;
    this.material    = null;
    this.texture     = null;
    this.plane       = null;
    this.frameCanvas = null;
    this.frameCtx    = null;
  }

  async init() {
    this._setupScene();
    this._setupCamera();
    await this._setupRenderer();
    this._setupPlane();
  }

  // ─── private setup ────────────────────────────────────────────────────────

  _setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090810);
  }

  _setupCamera() {
    // FOV 75 — wide enough that a large plane fills the viewport with no gaps.
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    this.camera.position.z = 1;
  }

  async _setupRenderer() {
    const hasWebGPU = typeof navigator !== 'undefined' && !!navigator.gpu;

    this.renderer = new THREE.WebGPURenderer({
      antialias: true,
      alpha: false,
      forceWebGL: !hasWebGPU,
    });

    await this.renderer.init();

    console.log(
      `[WorldEngine] renderer: ${hasWebGPU ? 'WebGPU' : 'WebGL (fallback)'}`,
    );

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
  }

  _setupPlane() {
    this.frameCanvas = document.createElement('canvas');
    this.frameCanvas.width  = 1920;
    this.frameCanvas.height = 1080;
    this.frameCtx = this.frameCanvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.frameCanvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;

    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.MeshBasicMaterial({ map: this.texture });

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);

    this._updatePlaneScale();
  }

  // Scale the plane so frames fill the viewport like object-fit: cover.
  // Keeps native 16:9 aspect — crops edges, never stretches.
  _updatePlaneScale() {
    const distance    = 1;
    const vFov        = (this.camera.fov * Math.PI) / 180;
    const planeHeight = 2 * Math.tan(vFov / 2) * distance;
    const planeWidth  = planeHeight * this.camera.aspect;

    const frameAspect    = 1920 / 1080;
    const viewportAspect = window.innerWidth / window.innerHeight;

    let scaleX = 1, scaleY = 1;
    if (viewportAspect > frameAspect) {
      scaleY = viewportAspect / frameAspect;
    } else {
      scaleX = frameAspect / viewportAspect;
    }

    const overscan = 1.15; // absorbs max camera rotation from MouseParallax
    this.plane.scale.set(scaleX * planeWidth * overscan, scaleY * planeHeight * overscan, 1);
  }

  // ─── public API ───────────────────────────────────────────────────────────

  displayFrame(bitmap) {
    if (!bitmap) return;
    this.frameCtx.drawImage(bitmap, 0, 0, 1920, 1080);
    this.material.map.needsUpdate = true;
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    this._updatePlaneScale();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
    this.renderer.dispose();
  }
}
