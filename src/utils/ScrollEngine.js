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
    this._ready           = false; // suppresses init-time onEnter fires
  }

  init() {
    gsap.registerPlugin(ScrollTrigger);

    // Seed lastTime so the first velocity delta isn't astronomically large.
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
    console.log('[ScrollEngine] scroll-container:', document.getElementById('scroll-container'));
    console.log('[ScrollEngine] world-section-0:', document.getElementById('world-section-0'));
    console.log('[ScrollEngine] sections created');

    // ── ScrollTriggers ───────────────────────────────────────────────────────
    for (let i = 0; i < WORLD_COUNT; i++) {
      const section = document.getElementById(`world-section-${i}`);
      console.log('[ScrollEngine] trigger created for world', i, section);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   3,

        onEnter:     () => { if (this._ready) this.onWorldChange(i); },
        onEnterBack: () => { if (this._ready) this.onWorldChange(i); },

        onUpdate: (self) => {
          const now   = performance.now();
          const delta = now - this.lastTime;

          if (delta > 0) {
            const rawVelocity = Math.abs(self.progress - this.previousProgress) / (delta / 1000);
            this.smoothVelocity += (Math.min(rawVelocity / 0.5, 1.0) - this.smoothVelocity) * 0.12;
            this.onVelocity(this.smoothVelocity);
          }

          // Store the target progress — rAF loop in main.js reads and lerps it.
          this.onProgress(i, self.progress);
          this.previousProgress = self.progress;
          this.lastTime = now;
        },
      });

      this.triggers.push(trigger);
    }
  }

  // Call after ScrollTrigger's init fires have settled (~100ms after init())
  activate() {
    this._ready = true;
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
