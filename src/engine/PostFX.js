import * as THREE from 'three/webgpu';
import {
  Fn, vec2, vec4,
  uniform, pass,
  screenUV, time, hash, mix,
} from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

export default class PostFX {
  constructor() {
    this.pipeline  = null;
    // Scroll velocity 0–1, updated from WorldEngine.setScrollVelocity().
    this._velocity = uniform(0.0);
  }

  // Call after renderer, scene, and camera exist.
  init(renderer, scene, camera) {
    this._renderer = renderer; // kept for explicit setRenderTarget(null) before each render

    // RenderPipeline was renamed from PostProcessing in Three.js r183.
    const Pipeline = THREE.RenderPipeline ?? THREE.PostProcessing;
    this.pipeline = new Pipeline(renderer);

    // Disable the built-in renderOutput() wrapper — our CanvasTexture is
    // already in sRGB and does not need a second colour-space conversion.
    this.pipeline.outputColorTransform = false;

    const scenePass  = pass(scene, camera);
    const sceneColor = scenePass.getTextureNode('output');

    // ── Effect 1: Chromatic aberration (velocity-driven) ─────────────────────
    // At rest: invisible. At full scroll speed: ±0.005 UV RGB separation.
    const caNode = Fn(() => {
      const offset = this._velocity.mul(0.002);
      const r = sceneColor.sample(screenUV.add(vec2(offset, 0.0))).r;
      const g = sceneColor.g;  // green channel sampled at default screenUV
      const b = sceneColor.sample(screenUV.sub(vec2(offset, 0.0))).b;
      return vec4(r, g, b, 1.0);
    })();

    // Blend from unshifted to CA linearly with velocity.
    const withCA = mix(sceneColor, caNode, this._velocity.saturate());

    // ── Effect 2: Bloom ───────────────────────────────────────────────────────
    // Affects only the brightest parts — horizon glow, light sources.
    const bloomPass = bloom(withCA);
    bloomPass.threshold.value = 0.85;
    bloomPass.strength.value  = 0.2;
    bloomPass.radius.value    = 0.3;

    // ── Effect 3: Film grain + final compose ─────────────────────────────────
    // Grain seeds on screen position × time — unique per pixel, per frame.
    const compose = Fn(() => {
      const col  = withCA.add(bloomPass).toVar();
      const seed = screenUV.dot(vec2(127.1, 311.7)).add(time.mul(53.1));
      const grain = hash(seed).mul(2.0).sub(1.0).mul(0.025);
      col.rgb.addAssign(grain);
      return col;
    });

    this.pipeline.outputNode = compose();
  }

  // Called every frame from WorldEngine — drives chromatic aberration intensity.
  setScrollVelocity(velocity) {
    this._velocity.value = velocity;
  }

  render() {
    // Explicitly reset to the display buffer before the pipeline renders.
    // PassNode leaves the renderer's render target pointed at its internal
    // texture after it runs; without this the quad writes there instead of screen.
    this._renderer.setRenderTarget(null);
    this.pipeline.render();
  }

  // RenderPipeline auto-resizes its internal targets when renderer.setSize() is called.
  resize(_w, _h) {}
}
