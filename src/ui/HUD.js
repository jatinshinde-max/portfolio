export default class HUD {
  constructor() {
    this._el      = null;

    this._worldNumber = null;
    this._worldName   = null;
    this._dots        = [];
    this._scrollHint  = null;
    this._center      = null;
    this._chapter     = null;
    this._title       = null;
    this._subtitle    = null;

    this._scrollHintHidden = false;
  }

  // ─── public ──────────────────────────────────────────────────────────────────

  init(worldsConfig) {
    this._el = document.getElementById('hud');
    this._el.innerHTML = this._html(worldsConfig);

    this._worldNumber = this._el.querySelector('.hud-world-number');
    this._worldName   = this._el.querySelector('.hud-world-name');
    this._dots        = [...this._el.querySelectorAll('.hud-dot')];
    this._scrollHint  = this._el.querySelector('.hud-scroll-hint');
    this._center      = this._el.querySelector('.hud-center');
    this._chapter     = this._el.querySelector('.hud-center-chapter');
    this._title       = this._el.querySelector('.hud-center-title');
    this._subtitle    = this._el.querySelector('.hud-center-subtitle');

    this.updateWorld(0, worldsConfig[0]);

    // Fade the HUD in on the next paint
    requestAnimationFrame(() => this._el.classList.add('is-visible'));
  }

  updateWorld(worldIndex, config) {
    this._worldNumber.textContent = String(worldIndex + 1).padStart(2, '0');
    this._worldName.textContent   = config.name;
    this._worldName.style.color   = config.accentColor;

    this._dots.forEach((dot, i) =>
      dot.classList.toggle('is-active', i === worldIndex)
    );

    // Update center text — hide first to retrigger entrance animation
    this._center.classList.remove('is-visible');
    this._chapter.textContent  = config.chapter;
    this._chapter.style.color  = config.accentColor;
    this._title.innerHTML      = config.title.replace(/\n/g, '<br>');
    this._subtitle.textContent = config.subtitle;
  }

  // progress: 0.0 → 1.0 for the current world
  updateProgress(worldIndex, progress) {
    // Scroll hint: hide once, never return
    if (!this._scrollHintHidden && progress > 0.08) {
      this._scrollHintHidden = true;
      this._scrollHint.classList.add('is-hidden');
    }

    // Center title: visible between 18% and 42% of each world
    const show = progress > 0.18 && progress < 0.42;
    this._center.classList.toggle('is-visible', show);
  }

  destroy() {
    if (this._el) this._el.innerHTML = '';
    this._el = null;
  }

  // ─── private ─────────────────────────────────────────────────────────────────

  _html(worlds) {
    const dots = worlds.map((_, i) =>
      `<div class="hud-dot" data-world="${i}"></div>`
    ).join('');

    return `
      <div class="hud-name">
        <div class="hud-name-role">CGI &amp; VFX</div>
        <div class="hud-name-title">Jatin Shinde</div>
      </div>

      <nav class="hud-nav">
        <a class="hud-nav-link" data-cursor="hover">Worlds</a>
        <a class="hud-nav-link" data-cursor="hover">About</a>
        <a class="hud-nav-link" data-cursor="hover">Contact</a>
      </nav>

      <div class="hud-world-indicator">
        <div class="hud-world-number">01</div>
        <div class="hud-world-name"></div>
      </div>

      <div class="hud-scroll-hint">
        <span class="hud-scroll-label">Scroll</span>
        <div class="hud-scroll-line"></div>
      </div>

      <div class="hud-dots">${dots}</div>

      <div class="hud-center" aria-live="polite">
        <div class="hud-center-chapter"></div>
        <div class="hud-center-title"></div>
        <div class="hud-center-subtitle"></div>
      </div>
    `;
  }
}
