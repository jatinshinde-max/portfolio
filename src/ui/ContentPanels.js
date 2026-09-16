import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Recruiter-facing capability groups. Keep this list focused on tools that are
// supported by work we can show in the portfolio rather than every app used.
const TOOL_GROUPS = [
  {
    label: 'Generative AI / Workflows',
    tools: ['ComfyUI', 'Wan Video', 'LTX Video', 'Flux', 'Qwen Image', 'SeedVR2'],
  },
  {
    label: '3D / Realtime',
    tools: ['Unreal Engine 5', 'Blender', 'Substance 3D Painter', 'Character Creator 4', 'Marvelous Designer'],
  },
  {
    label: 'VFX / Post',
    tools: ['After Effects', 'DaVinci Resolve', 'Premiere Pro', 'Photoshop'],
  },
];

const BIO_PARAS = [
  `Visual development, GenAI workflow, CGI and VFX artist building cinematic imagery and controlled production workflows across ComfyUI, Unreal Engine and Blender.`,
  `My work combines traditional 3D and post-production with generative image and video pipelines — with an emphasis on consistency, controllability, iteration and production-ready results.`,
];

export function buildContentPanels(worlds) {
  gsap.registerPlugin(ScrollTrigger);

  const container = document.getElementById('scroll-container');
  const root = document.createElement('div');
  root.id = 'content-panels';

  worlds.forEach((world, i) => root.appendChild(_worldChapter(world, i)));
  root.appendChild(_aboutSection());
  root.appendChild(_contactSection());

  container.appendChild(root);
  requestAnimationFrame(() => _initReveals());
}

function _worldChapter(world, index) {
  const section = document.createElement('section');
  section.className = 'cp-world';
  section.dataset.world = index;

  // Old config contains placeholder Project 01/02/03 entries. Do not expose
  // them publicly. New case studies will opt in with verified: true.
  const verifiedProjects = (world.projects || []).filter(project => project.verified === true);
  const projectsHTML = verifiedProjects.length
    ? `<div class="cp-projects">
        <div class="cp-sep"></div>
        ${verifiedProjects.map((p, i) => `
          <div class="cp-project" data-cursor="hover">
            <span class="cp-project-num">${String(i + 1).padStart(2, '0')}</span>
            <div class="cp-project-body">
              <div class="cp-project-title">${p.title}</div>
              <div class="cp-project-type">${p.type}</div>
            </div>
          </div>
          <div class="cp-sep"></div>
        `).join('')}
      </div>`
    : '';

  section.innerHTML = `
    <div class="cp-inner">
      <div class="cp-world-meta">
        <span class="cp-eyebrow" style="color:${world.accentColor}">${world.chapter}&nbsp;&nbsp;/&nbsp;&nbsp;${world.name}</span>
      </div>
      <div class="cp-world-header">
        <h2 class="cp-headline">${world.title.replace(/\n/g, '<br>')}</h2>
        <p class="cp-body">${world.subtitle}</p>
      </div>
      ${projectsHTML}
    </div>
  `;

  section.querySelectorAll('.cp-project').forEach(el => {
    const titleEl = el.querySelector('.cp-project-title');
    el.addEventListener('mouseenter', () => { titleEl.style.color = world.accentColor; });
    el.addEventListener('mouseleave', () => { titleEl.style.color = ''; });
  });

  return section;
}

function _aboutSection() {
  const section = document.createElement('section');
  section.className = 'cp-about';

  const parasHTML = BIO_PARAS.map(p => `<p class="cp-body">${p}</p>`).join('');
  const toolsHTML = TOOL_GROUPS.map(group => `
    <div class="cp-tool-group">
      <span class="cp-eyebrow">${group.label}</span>
      <div class="cp-tools-list">
        ${group.tools.map(t => `
          <div class="cp-tool">
            <span class="cp-tool-dot"></span>
            <span class="cp-tool-name">${t}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  section.innerHTML = `
    <div class="cp-inner cp-about-inner">
      <div class="cp-about-bio">
        <span class="cp-eyebrow">Profile</span>
        <h2 class="cp-headline cp-headline--md">Visual Development.<br>GenAI Workflows.<br>CGI & VFX.</h2>
        ${parasHTML}
      </div>
      <div class="cp-about-tools">
        <span class="cp-eyebrow">Production Stack</span>
        ${toolsHTML}
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
      <span class="cp-eyebrow">Open to international studio opportunities & relocation</span>
      <h2 class="cp-contact-headline">Build The<br>Next Frame.</h2>
      <a href="mailto:jatinshinde118@gmail.com" class="cp-contact-cta" data-cursor="hover">jatinshinde118@gmail.com</a>
    </div>
  `;

  return section;
}

function _initReveals() {
  const ease = 'power2.out';

  document.querySelectorAll('.cp-world-meta, .cp-world-header').forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 44, duration: 1.0, ease,
      scrollTrigger: { trigger: el, start: 'top 84%', toggleActions: 'play none none none' },
    });
  });

  document.querySelectorAll('.cp-world').forEach(section => {
    const projectRoot = section.querySelector('.cp-projects');
    if (!projectRoot) return;
    const seps = section.querySelectorAll('.cp-sep');
    const projects = section.querySelectorAll('.cp-project');

    gsap.from([...seps], {
      scaleX: 0, transformOrigin: 'left center', duration: 0.9, ease, stagger: 0.07,
      scrollTrigger: { trigger: projectRoot, start: 'top 82%', toggleActions: 'play none none none' },
    });

    gsap.from([...projects], {
      opacity: 0, x: -20, duration: 0.7, ease, stagger: 0.1,
      scrollTrigger: { trigger: projectRoot, start: 'top 78%', toggleActions: 'play none none none' },
    });
  });

  ['cp-about-bio', 'cp-about-tools'].forEach(cls => {
    const el = document.querySelector(`.${cls}`);
    if (!el) return;
    gsap.from(el, {
      opacity: 0, y: 40, duration: 1.0, ease,
      scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' },
    });
  });

  gsap.from('.cp-tool', {
    opacity: 0, x: -14, duration: 0.45, ease, stagger: 0.04,
    scrollTrigger: { trigger: '.cp-tools-list', start: 'top 80%', toggleActions: 'play none none none' },
  });

  gsap.from('.cp-contact-headline', {
    opacity: 0, y: 64, duration: 1.3, ease,
    scrollTrigger: { trigger: '.cp-contact', start: 'top 72%', toggleActions: 'play none none none' },
  });

  gsap.from('.cp-contact-cta', {
    opacity: 0, y: 24, duration: 0.9, ease, delay: 0.25,
    scrollTrigger: { trigger: '.cp-contact', start: 'top 68%', toggleActions: 'play none none none' },
  });
}
