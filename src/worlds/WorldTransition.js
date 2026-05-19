export default class WorldTransition {
  constructor() {
    this._el          = null;
    this._running     = false;
    this._isFirstLoad = true;
  }

  init() {
    this._el = document.createElement('div');
    Object.assign(this._el.style, {
      position:        'fixed',
      inset:           '0',
      zIndex:          '500',
      pointerEvents:   'none',
      backgroundColor: '#090810',
      opacity:         '0',
    });
    document.body.appendChild(this._el);
  }

  // onMidpoint: called at peak black — swap world frames here
  trigger(onMidpoint) {
    if (this._isFirstLoad) { this._isFirstLoad = false; onMidpoint(); return; }
    if (this._running) return;
    this._running = true;

    // Fade in: 0.6s ease-in
    this._el.style.transition = 'opacity 0.6s ease-in';
    this._el.style.opacity    = '1';

    setTimeout(() => {
      // Hold at peak black, then swap
      onMidpoint();

      // Fade out: 0.8s ease-out after 200ms hold
      setTimeout(() => {
        this._el.style.transition = 'opacity 0.8s ease-out';
        this._el.style.opacity    = '0';

        setTimeout(() => {
          this._running = false;
        }, 800);
      }, 200);
    }, 600);
  }
}
