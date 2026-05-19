export default class Preloader {
  constructor(framesPath, frameCount) {
    this.framesPath = framesPath;
    this.frameCount = frameCount;
    this.frames = new Map();
    this.isLoading = false;
    this.loadedCount = 0;
  }

  // Loads [count] frames beginning at [startIndex] in parallel.
  // Frames that fail are skipped with a warning — never throws.
  async preloadChunk(startIndex, count) {
    const end = Math.min(startIndex + count, this.frameCount);
    const promises = [];

    for (let i = startIndex; i < end; i++) {
      const frameNumber = String(i + 1).padStart(4, '0');
      const url = `${this.framesPath}frame_${frameNumber}.webp`;

      if (i === startIndex) console.log('🔍 Fetching:', url);

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
          console.log('❌ Failed:', url, err.message);
          console.warn(`[Preloader] frame ${i + 1} skipped — ${err.message}`);
        });

      promises.push(p);
    }

    await Promise.all(promises);
  }

  // Loads the full sequence in 5-frame chunks with a 50ms pause between each.
  // Throttles simultaneous connections so the server isn't overwhelmed.
  // onProgress(ratio) where ratio is 0.0 → 1.0.
  async preloadAll(onProgress) {
    this.isLoading = true;
    this.loadedCount = 0;

    const CHUNK = 5;

    for (let start = 0; start < this.frameCount; start += CHUNK) {
      await this.preloadChunk(start, CHUNK);
      if (typeof onProgress === 'function') {
        onProgress(this.loadedCount / this.frameCount);
      }
      await new Promise(r => setTimeout(r, 50));
    }

    this.isLoading = false;
  }

  // Returns the ImageBitmap at [index] (0-based), or null if not yet loaded.
  getFrame(index) {
    return this.frames.get(index) ?? null;
  }

  // Frees GPU memory for all decoded bitmaps and clears the map.
  dispose() {
    this.frames.forEach(bitmap => bitmap.close());
    this.frames.clear();
    this.loadedCount = 0;
  }
}
