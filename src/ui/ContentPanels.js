import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ─── Static content ───────────────────────────────────────────────────────────

const TOOLS = [
  'Unreal Engine 5',
  'Blender',
  'Substance 3D Painter',
  'Character Creator 4',
  'Marvelous Designer',
  'After Effects',
  'DaVinci Resolve',
  'Premiere Pro',
  'Photoshop',
  'Illustrator',
  'Lightroom',
  'Audition',
  'Corel Draw',
];

const BIO_PARAS = [
  `CGI & VFX artist specialising in cinematic environments, character work, and visual
   storytelling. I lead creative teams — directing graphic designers and video editors
   toward work that holds its own against the best in the field.`,
  `Five worlds. Each one built from scratch inside Unreal Engine 5, textured in
   Substance 3D Painter, characters assembled in Character Creator 4 and Marvelous
   Designer — then composited, graded, and sequenced into the experience you just
   scrolled through.`,
];

// ─── Public entry point ───────────────────────────────────────────────────────

export function buildContentPanels(worlds) {
  gsap.registerPlugin(ScrollTrigger);

  const container = document.getElementById('scroll-container');
  const root = document.createElement('div');
  root.id = 'content-panels';

  worlds.forEach((world, i) => root.appendChild(_worldChapter(world, i)));
  root.appendChild(_aboutSection());
  root.appendChild(_contactSection());

  container.appendChild(root);

  // Defer until layout is painted so ScrollTrigger measurements are accurate
  requestAnimationFrame(() => _initReveals());
}

// ─── Section builders ─────────────────────────────────────────────────────────

function _worldChapter(world, index) {
  const section = document.createElement('section');
  section.className = 'cp-world';
  section.dataset.world = index;

  const projectsHTML = world.projects.map((p, i) => `
    <div class="cp-project" data-cursor="hover">
      <span class="cp-project-num">0${i + 1}</span>
      <div class="cp-project-body">
        <div class="cp-project-title">${p.title}</div>
        <div class="cp-project-type">${p.type}</div>
      </div>
    </div>
    <div class="cp-sep"></div>
  `).join('');

  section.innerHTML = `
    <div class="cp-inner">
      <div class="cp-world-meta">
        <span class="cp-eyebrow" style="color:${world.accentColor}">${world.chapter}&nbsp;&nbsp;/&nbsp;&nbsp;${world.name}</span>
      </div>
      <div class="cp-world-header">
        <h2 class="cp-headline">${world.title.replace(/\n/g, '<br>')}</h2>
        <p class="cp-body">${world.subtitle}</p>
      </div>
      <div class="cp-projects">
        <div class="cp-sep"></div>
        ${projectsHTML}
      </div>
    </div>
  `;

  // Hover: title shifts right + accent color, JS-set per world
  section.querySelectorAll('.cp-project').forEach(el => {
    const titleEl = el.querySelector('.cp-project-title');
    el.addEventListener('mouseenter', () => {
      titleEl.style.color = world.accentColor;
    });
    el.addEventListener('mouseleave', () => {
      titleEl.style.color = '';
    });
  });

  return section;
}

function _aboutSection() {
  const section = document.createElement('section');
  section.className = 'cp-about';

  const parasHTML = BIO_PARAS.map(p =>
    `<p class="cp-body">${p.replace(/\s+/g, ' ').trim()}</p>`
  ).join('');

  const toolsHTML = TOOLS.map(t => `
    <div class="cp-tool">
      <span class="cp-tool-dot"></span>
      <span class="cp-tool-name">${t}</span>
    </div>
  `).join('');

  section.innerHTML = `
    <div class="cp-inner cp-about-inner">
      <div class="cp-about-bio">
        <span class="cp-eyebrow">The Work</span>
        <h2 class="cp-headline cp-headline--md">The Eye,<br>The Hand,<br>The Build.</h2>
        ${parasHTML}
      </div>
      <div class="cp-about-tools">
        <span class="cp-eyebrow">Tools</span>
        <div class="cp-tools-list">${toolsHTML}</div>
      </div>
    </div>
  `;

  return section;
}

function _contactSection() {
  const section = document.createElement('section');
  section.className = 'cp-contact';

  section.innerHTML = `
    <div class="cp-inner cp-contact-inner">
      <h2 class="cp-contact-headline">Let's Build<br>a World.</h2>
      <a
        href="mailto:jatinshinde118@gmail.com"
        class="cp-contact-cta"
        data-cursor="hover"
      >jatinshinde118@gmail.com</a>
    </div>
  `;

  return section;
}

// ─── ScrollTrigger reveals ────────────────────────────────────────────────────

function _initReveals() {
  const ease = 'power2.out';

  // World chapter headers — fade + rise as a unit
  document.querySelectorAll('.cp-world-meta, .cp-world-header').forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 44, duration: 1.0, ease,
      scrollTrigger: { trigger: el, start: 'top 84%', toggleActions: 'play none none none' },
    });
  });

  // Project rows — stagger slide from left
  document.querySelectorAll('.cp-world').forEach(section => {
    const seps     = section.querySelectorAll('.cp-sep');
    const projects = section.querySelectorAll('.cp-project');

    gsap.from([...seps], {
      scaleX: 0, transformOrigin: 'left center',
      duration: 0.9, ease, stagger: 0.07,
      scrollTrigger: { trigger: section.querySelector('.cp-projects'), start: 'top 82%', toggleActions: 'play none none none' },
    });

    gsap.from([...projects], {
      opacity: 0, x: -20, duration: 0.7, ease, stagger: 0.1,
      scrollTrigger: { trigger: section.querySelector('.cp-projects'), start: 'top 78%', toggleActions: 'play none none none' },
    });
  });

  // About columns — each fades independently
  ['cp-about-bio', 'cp-about-tools'].forEach(cls => {
    const el = document.querySelector(`.${cls}`);
    if (!el) return;
    gsap.from(el, {
      opacity: 0, y: 40, duration: 1.0, ease,
      scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' },
    });
  });

  // Tool items — tight stagger
  gsap.from('.cp-tool', {
    opacity: 0, x: -14, duration: 0.45, ease, stagger: 0.04,
    scrollTrigger: { trigger: '.cp-tools-list', start: 'top 80%', toggleActions: 'play none none none' },
  });

  // Contact headline — slower, more weight
  gsap.from('.cp-contact-headline', {
    opacity: 0, y: 64, duration: 1.3, ease,
    scrollTrigger: { trigger: '.cp-contact', start: 'top 72%', toggleActions: 'play none none none' },
  });

  gsap.from('.cp-contact-cta', {
    opacity: 0, y: 24, duration: 0.9, ease, delay: 0.25,
    scrollTrigger: { trigger: '.cp-contact', start: 'top 68%', toggleActions: 'play none none none' },
  });
}
