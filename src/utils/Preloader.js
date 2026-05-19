const CHUNK  = 5; // parallel fetches per batch
const STRIDE = 5; // load every 5th frame file: frame_0001, frame_0006, frame_0011…

export default class Preloader {
  constructor(framesPath, frameCount) {
    this.framesPath  = framesPath;
    this.frameCount  = frameCount;
    this.totalFrames = Math.ceil(frameCount / STRIDE); // actual frames we will load
    this.frames      = new Map();
    this.isLoading   = false;
    this.loadedCount = 0;
  }

  // Loads [count] sequential slots beginning at [startSeqIdx].
  // Each seq index i maps to file frame_(i*STRIDE + 1).webp
  async preloadChunk(startSeqIdx, count) {
    const end      = Math.min(startSeqIdx + count, this.totalFrames);
    const promises = [];

    for (let i = startSeqIdx; i < end; i++) {
      const fileNum     = i * STRIDE + 1;
      const frameNumber = String(fileNum).padStart(4, '0');
      const url         = `${this.framesPath}frame_${frameNumber}.webp`;

      if (i === startSeqIdx) console.log('🔍 Fetching:', url);

      const p = fetch(url)
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

  // Loads every 5th frame in CHUNK-sized parallel batches with 50ms between each.
  // onProgress(ratio) where ratio is 0.0 → 1.0.
  async preloadAll(onProgress) {
    this.isLoading   = true;
    this.loadedCount = 0;

    for (let start = 0; start < this.totalFrames; start += CHUNK) {
      await this.preloadChunk(start, CHUNK);
      if (typeof onProgress === 'function') {
        onProgress(this.loadedCount / this.totalFrames);
      }
      await new Promise(r => setTimeout(r, 50));
    }

    this.isLoading = false;
  }

  // Returns the ImageBitmap at sequential index (0-based), or null if not yet loaded.
  getFrame(index) {
    return this.frames.get(index) ?? null;
  }

  // Frees GPU memory for all decoded bitmaps.
  dispose() {
    this.frames.forEach(bitmap => bitmap.close());
    this.frames.clear();
    this.loadedCount = 0;
  }
}
