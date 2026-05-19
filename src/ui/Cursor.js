export default class Cursor {
  constructor() {
    this.dot    = null;
    this.ring   = null;

    // Mouse position — dot snaps here instantly
    this.mouseX = -200;
    this.mouseY = -200;

    // Ring position — lerped toward mouse each rAF
    this.ringX  = -200;
    this.ringY  = -200;

    this._rafId   = null;
    this._visible = false;

    this._onMouseMove  = this._onMouseMove.bind(this);
    this._onMouseDown  = this._onMouseDown.bind(this);
    this._onMouseUp    = this._onMouseUp.bind(this);
    this._onMouseOver  = this._onMouseOver.bind(this);
    this._onMouseOut   = this._onMouseOut.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onMouseEnter = this._onMouseEnter.bind(this);
  }

  init() {
    if ('ontouchstart' in window) return; // touch devices — skip

    this.dot  = this._make('cursor-dot');
    this.ring = this._make('cursor-ring');
    document.body.appendChild(this.dot);
    document.body.appendChild(this.ring);

    window.addEventListener('mousemove',  this._onMouseMove);
    window.addEventListener('mousedown',  this._onMouseDown);
    window.addEventListener('mouseup',    this._onMouseUp);
    document.addEventListener('mouseover', this._onMouseOver);
    document.addEventListener('mouseout',  this._onMouseOut);
    document.documentElement.addEventListener('mouseleave', this._onMouseLeave);
    document.documentElement.addEventListener('mouseenter', this._onMouseEnter);

    this._tick();
  }

  // ─── private ────────────────────────────────────────────────────────────────

  _make(id) {
    const el = document.createElement('div');
    el.id = id;
    return el;
  }

  _isInteractive(el) {
    return !!el.closest('a, button, .project-card, [data-cursor="hover"]');
  }

  _onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    if (!this._visible) {
      // Snap ring to mouse on first move so it doesn't fly in from off-screen
      this.ringX    = e.clientX;
      this.ringY    = e.clientY;
      this._visible = true;
      this.dot.classList.add('is-visible');
      this.ring.classList.add('is-visible');
    }
  }

  _onMouseDown() {
    this.dot.classList.remove('is-hover');
    this.ring.classList.remove('is-hover');
    this.dot.classList.add('is-down');
    this.ring.classList.add('is-down');
  }

  _onMouseUp() {
    this.dot.classList.remove('is-down');
    this.ring.classList.remove('is-down');
  }

  _onMouseOver(e) {
    if (this._isInteractive(e.target)) {
      this.dot.classList.add('is-hover');
      this.ring.classList.add('is-hover');
    }
  }

  _onMouseOut(e) {
    if (this._isInteractive(e.target)) {
      this.dot.classList.remove('is-hover');
      this.ring.classList.remove('is-hover');
    }
  }

  _onMouseLeave() {
    this.dot.classList.add('is-offscreen');
    this.ring.classList.add('is-offscreen');
  }

  _onMouseEnter() {
    this.dot.classList.remove('is-offscreen');
    this.ring.classList.remove('is-offscreen');
  }

  _tick() {
    // Dot — zero lag, exact mouse position
    this.dot.style.left = this.mouseX + 'px';
    this.dot.style.top  = this.mouseY + 'px';

    // Ring — lerped at 0.10 for magnetic/liquid feel
    this.ringX += (this.mouseX - this.ringX) * 0.1;
    this.ringY += (this.mouseY - this.ringY) * 0.1;
    this.ring.style.left = this.ringX + 'px';
    this.ring.style.top  = this.ringY + 'px';

    this._rafId = requestAnimationFrame(() => this._tick());
  }

  // ─── public ─────────────────────────────────────────────────────────────────

  destroy() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    window.removeEventListener('mousemove',  this._onMouseMove);
    window.removeEventListener('mousedown',  this._onMouseDown);
    window.removeEventListener('mouseup',    this._onMouseUp);
    document.removeEventListener('mouseover', this._onMouseOver);
    document.removeEventListener('mouseout',  this._onMouseOut);
    document.documentElement.removeEventListener('mouseleave', this._onMouseLeave);
    document.documentElement.removeEventListener('mouseenter', this._onMouseEnter);
    this.dot?.remove();
    this.ring?.remove();
  }
}
