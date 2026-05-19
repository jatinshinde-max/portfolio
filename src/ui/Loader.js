export default class Loader {
  constructor(onComplete) {
    this.onComplete  = onComplete;
    this._el         = null;
    this._counters   = null; // both curtain halves
    this._fills      = null;
  }

  init() {
    const el = document.createElement('div');
    el.id = 'loader';

    // Two curtain panels, each carrying a full copy of the stage content.
    // overflow:hidden on each panel clips its half — top panel shows the upper
    // portion of the centered content, bottom panel shows the lower portion.
    // When exiting, top slides up, bottom slides down — a physical curtain split.
    el.innerHTML = `
      <div class="loader-curtain loader-curtain--top">
        <div class="loader-stage">
          <div class="loader-counter">00</div>
          <div class="loader-bar"><div class="loader-bar-fill"></div></div>
          <div class="loader-label">Initialising Worlds</div>
        </div>
      </div>
      <div class="loader-curtain loader-curtain--bottom" aria-hidden="true">
        <div class="loader-stage">
          <div class="loader-counter">00</div>
          <div class="loader-bar"><div class="loader-bar-fill"></div></div>
          <div class="loader-label">Initialising Worlds</div>
        </div>
      </div>
    `;

    document.body.appendChild(el);
    this._el       = el;
    this._top      = el.querySelector('.loader-curtain--top');
    this._bottom   = el.querySelector('.loader-curtain--bottom');
    this._counters = el.querySelectorAll('.loader-counter');
    this._fills    = el.querySelectorAll('.loader-bar-fill');
  }

  // progress: 0.0 → 1.0  — called by Preloader.preloadAll onProgress
  setProgress(progress) {
    const pct     = Math.min(100, Math.floor(progress * 100));
    const display = pct === 100 ? '100' : String(pct).padStart(2, '0');

    this._counters.forEach(el => { el.textContent  = display; });
    this._fills.forEach(el    => { el.style.width   = `${pct}%`; });
  }

  // Called when all frames are loaded and the site is ready to show.
  complete() {
    console.log('Loader complete() called');
    this.setProgress(1.0); // guarantee counter reads 100

    // Hold at 100 for 400ms, then pull the curtains via inline styles.
    // Inline transforms are used (not a CSS class) so the transition fires
    // reliably regardless of browser paint timing.
    setTimeout(() => {
      this._top.style.transform    = 'translateY(-100%)';
      this._bottom.style.transform = 'translateY(100%)';

      // 1000ms animation + 400ms hold = 1400ms total before DOM removal
      setTimeout(() => {
        this._el.remove();
        this.onComplete();
      }, 1000);
    }, 400);
  }
}
