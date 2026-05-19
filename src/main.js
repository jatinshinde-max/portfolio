// Main orchestrator — imports and initializes all modules
import WorldEngine    from './engine/WorldEngine.js';
import MouseParallax  from './engine/MouseParallax.js';
import FrameScrubber  from './engine/FrameScrubber.js';
import ScrollEngine   from './utils/ScrollEngine.js';
import Loader         from './ui/Loader.js';
import Cursor         from './ui/Cursor.js';
import HUD            from './ui/HUD.js';
import { buildContentPanels } from './ui/ContentPanels.js';
import WorldTransition       from './worlds/WorldTransition.js';
import worlds                from './worlds/worlds.config.js';

async function init() {
  // ── 0. Loader — must be first: covers everything while assets load ─────────
  const cursor = new Cursor();
  const hud    = new HUD();
  const loader = new Loader(() => {
    // Both cursor and HUD appear only after the curtain fully exits
    cursor.init();
    hud.init(worlds);
    buildContentPanels(worlds);
  });
  loader.init();

  // ── 1. Renderer ───────────────────────────────────────────────────────────
  const worldEngine = new WorldEngine(document.getElementById('canvas-container'));
  await worldEngine.init();

  // ── 2. Mouse parallax ─────────────────────────────────────────────────────
  const mouseParallax = new MouseParallax(worldEngine.camera, 2);
  mouseParallax.init();

  // ── 3. Frame scrubber — preload world 0, driving the loader counter ───────
  const frameScrubber = new FrameScrubber(worldEngine, worlds);

  await frameScrubber.switchWorld(0, (progress) => {
    loader.setProgress(progress);
  });

  // ── 4. World transition overlay ───────────────────────────────────────────
  const transition = new WorldTransition();
  transition.init();

  // ── 5. Scroll engine ──────────────────────────────────────────────────────
  let currentProgress   = 0; // updated by ScrollTrigger; consumed by rAF
  let currentWorldIndex = 0; // world 0 already loaded — skip any duplicate fires for it

  const scrollEngine = new ScrollEngine({
    onWorldChange: (worldIndex) => {
      if (worldIndex === currentWorldIndex) return;
      currentWorldIndex = worldIndex;
      transition.trigger(() => {
        frameScrubber.switchWorld(worldIndex, () => {});
        hud.updateWorld(worldIndex, worlds[worldIndex]);
      });
    },
    onProgress: (worldIndex, progress) => {
      currentProgress = progress;
      hud.updateProgress(worldIndex, progress);
    },
    onVelocity: () => {}, // reserved for future use
  });

  console.log('[main] scroll-container:', document.getElementById('scroll-container'));
  console.log('[main] calling scrollEngine.init()');
  scrollEngine.init();

  // ── 6. Animation loop — frame scrubbing capped at 30fps to reduce GPU upload
  //       pressure from 4K→1080p canvas blits; renderer itself runs uncapped.
  let lastFrameTime = 0;
  function animate(ts) {
    requestAnimationFrame(animate);
    mouseParallax.update();
    if (ts - lastFrameTime > 40) { // ~25fps cap for texture uploads
      frameScrubber.setProgress(currentProgress);
      lastFrameTime = ts;
    }
    worldEngine.render();
  }
  animate(0);

  // ── 7. Resize ─────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    worldEngine.resize();
  });

  // ── 8. Curtain reveal — holds at 100, then splits and removes the loader ───
  loader.complete();
}

document.addEventListener('DOMContentLoaded', init);
