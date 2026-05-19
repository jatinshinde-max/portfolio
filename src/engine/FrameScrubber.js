import Preloader from '../utils/Preloader.js';

export default class FrameScrubber {
  constructor(worldEngine, worldsConfig) {
    this.worldEngine   = worldEngine;
    this.worldsConfig  = worldsConfig;

    this.activeWorldIndex    = 0;
    this.activePreloader     = null;
    this.lastDisplayedIndex  = -1;
    this.displayIndex        = 0;

    // Background-loaded next world so the transition can be instant.
    // Never more than one nextPreloader alive at a time.
    this.nextPreloader     = null;
    this.nextWorldIndex    = -1;
    this.isPreloadingNext  = false;
  }

  // ─── world loading ────────────────────────────────────────────────────────

  async switchWorld(worldIndex, onProgress) {
    // If next world was already preloaded in the background, swap for free.
    if (this.nextPreloader && this.nextWorldIndex === worldIndex) {
      if (this.activePreloader) this.activePreloader.dispose();

      this.activePreloader    = this.nextPreloader;
      this.nextPreloader      = null;
      this.nextWorldIndex     = -1;
      this.activeWorldIndex   = worldIndex;
      this.displayIndex       = 0;
      this.lastDisplayedIndex = -1;
      this.lastProgress       = -1;

      const { frameCount } = this.worldsConfig[worldIndex];
      console.log(`[FrameScrubber] World ${worldIndex} swapped instantly: ${frameCount} frames`);
      return;
    }

    // Cold load — clean up any background preloader first.
    if (this.nextPreloader) {
      this.nextPreloader.dispose();
      this.nextPreloader    = null;
      this.isPreloadingNext = false;
    }
    this.nextWorldIndex = -1;

    if (this.activePreloader) this.activePreloader.dispose();

    const { framesPath, frameCount } = this.worldsConfig[worldIndex];
    const preloader = new Preloader(framesPath, frameCount);
    await preloader.preloadAll(onProgress);

    this.activePreloader    = preloader;
    this.activeWorldIndex   = worldIndex;
    this.displayIndex       = 0;
    this.lastDisplayedIndex = -1;
    this.lastProgress       = -1;

    console.log(`[FrameScrubber] World ${worldIndex} loaded: ${frameCount} frames`);
  }

  // Preloads the next world silently in the background.
  // Call this when scroll is ~80% through the current world.
  // A subsequent switchWorld(worldIndex) will resolve immediately.
  async preloadNextWorld(worldIndex, onProgress) {
    if (this.isPreloadingNext) return;   // a background load is already running
    if (this.nextPreloader) return;      // already preloaded and waiting
    if (this.nextWorldIndex === worldIndex) return; // same world, do nothing

    this.isPreloadingNext = true;
    this.nextWorldIndex   = worldIndex;

    const { framesPath, frameCount } = this.worldsConfig[worldIndex];
    const preloader = new Preloader(framesPath, frameCount);
    await preloader.preloadAll(onProgress);

    // Guard against the target having changed while we were loading.
    if (this.nextWorldIndex === worldIndex) {
      this.nextPreloader    = preloader;
      this.isPreloadingNext = false;
      console.log(`[FrameScrubber] World ${worldIndex} preloaded: ${frameCount} frames`);
    } else {
      preloader.dispose();
      this.isPreloadingNext = false;
    }
  }

  // ─── frame display ────────────────────────────────────────────────────────

  // progress: 0.0 → 1.0, driven by ScrollEngine every frame.
  setProgress(progress) {
    if (!this.activePreloader || this.activePreloader.loadedCount === 0) return;

    const { frameCount } = this.worldsConfig[this.activeWorldIndex];
    const maxIndex       = Math.min(this.activePreloader.loadedCount - 1, frameCount - 1);

    const frameIndex = Math.round(progress * maxIndex);
    if (frameIndex === this.lastDisplayedIndex) return;

    const frame = this.activePreloader.getFrame(frameIndex);
    if (!frame) return;
    this.worldEngine.displayFrame(frame);
    this.lastDisplayedIndex = frameIndex;
  }

  // ─── cleanup ──────────────────────────────────────────────────────────────

  dispose() {
    if (this.activePreloader) {
      this.activePreloader.dispose();
      this.activePreloader = null;
    }
    if (this.nextPreloader) {
      this.nextPreloader.dispose();
      this.nextPreloader = null;
    }
  }
}
