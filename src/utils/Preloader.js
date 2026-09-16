const CHUNK  = 8; // bounded parallel fetches per batch
const STRIDE = 5; // preserve current scrub density while reducing loader overhead

export default class Preloader {
  constructor(framesPath, frameCount) {
    this.framesPath  = framesPath;
    this.frameCount  = frameCount;
    this.totalFrames = Math.ceil(frameCount / STRIDE);
    this.frames      = new Map();
    this.isLoading   = false;
    this.loadedCount = 0;
  }

  async preloadChunk(startSeqIdx, count) {
    const end = Math.min(startSeqIdx + count, this.totalFrames);
    const promises = [];

    for (let i = startSeqIdx; i < end; i++) {
      const fileNum = i * STRIDE + 1;
      const frameNumber = String(fileNum).padStart(4, '0');
      const url = `${this.framesPath}frame_${frameNumber}.webp`;

      const p = fetch(url, { cache: 'force-cache' })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.blob();
        })
        .then(blob => createImageBitmap(blob))
        .then(bitmap => {
          this.frames.set(i, bitmap);
          this.loadedCount++;
        })
        .catch(err => {
          console.warn(`[Preloader] frame ${frameNumber} skipped — ${err.message}`);
        });

      promises.push(p);
    }

    await Promise.all(promises);
  }

  async preloadAll(onProgress) {
    this.isLoading = true;
    this.loadedCount = 0;

    for (let start = 0; start < this.totalFrames; start += CHUNK) {
      await this.preloadChunk(start, CHUNK);
      if (typeof onProgress === 'function') {
        onProgress(this.loadedCount / this.totalFrames);
      }
      // Yield to rendering without adding a fixed 50 ms delay to every batch.
      await new Promise(resolve => requestAnimationFrame(resolve));
    }

    this.isLoading = false;
  }

  getFrame(index) {
    return this.frames.get(index) ?? null;
  }

  dispose() {
    this.frames.forEach(bitmap => bitmap.close());
    this.frames.clear();
    this.loadedCount = 0;
  }
}
