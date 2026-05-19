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
  // ── 0. Pre-init shells (no side effects yet) ──────────────────────────────
  const cursor      = new Cursor();
  const hud         = new HUD();
  const transition  = new WorldTransition();

  // ── 1. Loader — covers everything until world-01 is ready ─────────────────
  const loader = new Loader(() => {
    // Fires after curtain fully exits (~1400ms after loader.complete())
    cursor.init();
    hud.init(worlds);
    buildContentPanels(worlds);
    transition.init();
    scrollEngine.init(); // ScrollTrigger created HERE — after loader is gone
    setTimeout(() => scrollEngine.activate(), 100); // allow init fires to settle
  });
  loader.init();

  // ── 2. Renderer ───────────────────────────────────────────────────────────
  const worldEngine = new WorldEngine(document.getElementById('canvas-container'));
  await worldEngine.init();

  // ── 3. Mouse parallax ─────────────────────────────────────────────────────
  const mouseParallax = new MouseParallax(worldEngine.camera, 2);
  mouseParallax.init();

  // ── 4. Frame scrubber — load ONLY world-01, driving the loader counter ────
  const frameScrubber = new FrameScrubber(worldEngine, worlds);
  await frameScrubber.switchWorld(0, (progress) => loader.setProgress(progress));

  // ── 5. Scroll engine — constructed here, initialised in onComplete ─────────
  let currentProgress = 0;

  const scrollEngine = new ScrollEngine({
    onWorldChange: (worldIndex) => {
      transition.trigger(() => {
        frameScrubber.switchWorld(worldIndex, () => {});
        hud.updateWorld(worldIndex, worlds[worldIndex]);
      });
    },
    onProgress: (worldIndex, progress) => {
      currentProgress = progress;
      hud.updateProgress(worldIndex, progress);
    },
    onVelocity: () => {},
  });

  // ── 6. Animation loop ─────────────────────────────────────────────────────
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
  window.addEventListener('resize', () => worldEngine.resize());

  // ── 8. Reveal — curtain splits, then onComplete fires scrollEngine.init() ─
  loader.complete();
}

document.addEventListener('DOMContentLoaded', init);
