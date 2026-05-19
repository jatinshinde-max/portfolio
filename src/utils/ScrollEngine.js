import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const WORLD_COUNT    = 5;
const SECTION_HEIGHT = '400vh';

export default class ScrollEngine {
  constructor({ onWorldChange, onProgress, onVelocity }) {
    this.onWorldChange = onWorldChange;
    this.onProgress    = onProgress;
    this.onVelocity    = onVelocity;

    this.triggers         = [];
    this.previousProgress = 0;
    this.smoothVelocity   = 0;
    this.lastTime         = 0;
    this._ready           = false;
  }

  init() {
    gsap.registerPlugin(ScrollTrigger);
    this.lastTime = performance.now();

    // ── Build DOM ────────────────────────────────────────────────────────────
    const wrapper = document.createElement('div');
    wrapper.id = 'worlds-wrapper';
    wrapper.style.position = 'relative';

    for (let i = 0; i < WORLD_COUNT; i++) {
      const section = document.createElement('div');
      section.id = `world-section-${i}`;
      section.style.height   = SECTION_HEIGHT;
      section.style.position = 'relative';
      wrapper.appendChild(section);
    }

    document.getElementById('scroll-container').appendChild(wrapper);

    // ── ScrollTriggers — onUpdate only, no onEnter/onEnterBack ──────────────
    // World changes are detected by tracking which section is active during
    // real scroll movement. onEnter fires spuriously on init; onUpdate does not.
    let lastReportedWorld = 0; // world 0 pre-loaded — skip its first fire

    for (let i = 0; i < WORLD_COUNT; i++) {
      const section = document.getElementById(`world-section-${i}`);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   3,

        onUpdate: (self) => {
          if (!this._ready) return;

          if (i !== lastReportedWorld) {
            lastReportedWorld = i;
            this.onWorldChange(i);
          }

          const now   = performance.now();
          const delta = now - this.lastTime;
          if (delta > 0) {
            const rawVelocity = Math.abs(self.progress - this.previousProgress) / (delta / 1000);
            this.smoothVelocity += (Math.min(rawVelocity / 0.5, 1.0) - this.smoothVelocity) * 0.12;
            this.onVelocity(this.smoothVelocity);
          }

          this.onProgress(i, self.progress);
          this.previousProgress = self.progress;
          this.lastTime = now;
        },
      });

      this.triggers.push(trigger);
    }

    // 500ms window for ScrollTrigger to fire all init-time events silently
    setTimeout(() => { this._ready = true; }, 500);
  }

  scrollToWorld(worldIndex) {
    const target = document.getElementById(`world-section-${worldIndex}`);
    target.scrollIntoView({ behavior: 'smooth' });
  }

  destroy() {
    this.triggers.forEach(t => t.kill());
    this.triggers = [];
  }
}
