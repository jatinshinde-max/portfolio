# Portfolio — Claude Master Context

## About Me
CGI & VFX Artist. I lead graphic designers and video editors.
My expertise is merging creative vision with technical execution
to produce compelling visual content — environments, characters, VFX.

Tools: After Effects, Premier Pro, Photoshop, Illustrator, Audition,
Corel Draw, Lightroom, Blender, Unreal Engine 5, Substance 3D Painter,
Character Creator 4, Marvelous Designer, DaVinci Resolve.

## What This Site Is
Not a portfolio. An experience.

Visitors travel through 5 worlds I built in Unreal Engine 5.
Each world is a cinematic environment — 1000+ rendered JPEG frames
converted to WebP image sequences. Scroll controls the camera (frame scrubbing).
The work reveals itself as the visitor moves through each world.

The tone and ambition come from 5 reference sites combined:
- brand.ivress.co.jp: narrative-first, no UI chrome, WebGPU+TSL, world as story
- storytelling.noomoagency.com: scroll-driven chapters with 3D integration
- aboutluca.com: transitions far beyond BARBA.js — WebGL membrane-feel
- hubtown.co.in: cinematic scroll + subtle mouse parallax perspective shift
- mango-media.eu: experimental energy, unexpected moments, art-code surprises

## Project Location
Root: D:\portfolio\

## The 5 Worlds
(Genre/name TBD — update this when you decide)
1. World 01 → D:\portfolio\assets\frames-webp\world-01\
2. World 02 → D:\portfolio\assets\frames-webp\world-02\
3. World 03 → D:\portfolio\assets\frames-webp\world-03\
4. World 04 → D:\portfolio\assets\frames-webp\world-04\
5. World 05 → D:\portfolio\assets\frames-webp\world-05\

Frame pattern: frame_%04d.webp (frame_0001.webp, frame_0002.webp...)
Approximate frames per world: ~250 (sampled from 1000+ JPEGs, every 4th)

## Asset Paths
- WebP frames:  D:\portfolio\assets\frames-webp\world-0N\
- Raw JPEGs:    D:\portfolio\assets\frames-jpeg\world-0N\ (source only, not served)
- Models:       D:\portfolio\assets\models\
- Textures:     D:\portfolio\assets\textures\
- Audio:        D:\portfolio\assets\audio\

## Tech Stack (Final — Do Not Change Without Discussion)
- Three.js with WebGPU Renderer (WebGL fallback for older browsers)
- TSL (Three.js Shading Language) for all shaders — no raw GLSL strings
- GSAP + ScrollTrigger — scroll position → frame index mapping
- BARBA.js — page transitions with WebGL enhancement
- Vanilla JS ES Modules — no framework (React/Vue = unnecessary overhead)
- WebP image sequences for environments
- Web Audio API for ambient sound per world

## Features from Each Reference (Must Implement)
FROM IVRESS:
- Narrative-first — world tells a story, UI gets out of the way
- WebGPU renderer with TSL shaders
- Near-zero UI chrome — no standard navbar, no hero text over image

FROM NOOMO:
- Scroll-driven chapter structure (each world = one chapter)
- 3D elements that exist INSIDE the story, not floating on top of it
- Gamification or interaction layer within each world chapter

FROM ABOUTLUCA:
- Page transitions that feel like passing through a membrane
- WebGL post-processing effects on UI elements (not just the canvas)
- Seamless routing — zero browser reload feeling

FROM HUBTOWN:
- Mouse parallax — as mouse moves, camera perspective shifts subtly (2–4°)
- The world has depth — not flat. Mouse reveals the Z-axis.
- Cinematic scroll with slight camera lag (not instant)

FROM MANGO:
- At least one moment per world that is unexpected / stops the visitor
- Something that makes them go "wait, what just happened"
- Art-code: shader surprise, typography glitch, interaction twist

## Design Rules (Non-Negotiable)
- Very dark. Near-black backgrounds always. Never white sections.
- No standard navbar. Navigation is contextual or hidden.
- No card grids. No glassmorphism. No gradient text. No generic purple.
- Scroll = camera movement through the world, not page scrolling.
- Typography: large, light-weight (100–300 weight), editorial/cinematic.
- Sparse UI — the environments speak, not the text.
- Custom cursor — default cursor hidden on desktop.
- Loader is a designed experience — the first impression.
- Mouse parallax on the canvas (hubtown-style, subtle).
- Every world chapter has one "Mango moment" — something unexpected.

## Typography (Decided)
- Display/Hero font: 'Cormorant Garamond' weight 200–300
- UI/Labels font: 'DM Mono' weight 300–400
- Both from Google Fonts — import in index.html
- Labels: ALL CAPS, letter-spacing 0.25–0.4em
- Headings: sentence case, letter-spacing -0.02em (tight)

## World Accent Colors
Not assigned yet. Will be determined after worlds are named.

When ready, tell Claude Code:
"Look at the first 10 frames of world-0N. What is the dominant
accent color — the color that defines the mood of this environment?
Suggest a hex value and add it to worlds.config.js and CLAUDE.md."

Claude Code will analyze your actual UE5 frames and suggest colors
that genuinely match each world's visual character rather than
arbitrary placeholder values.

## Installed Skills
- webgpu-threejs-tsl    → GPU rendering, TSL shaders, post-FX pipeline
- threejs-fundamentals  → scene setup, camera, renderer, resize
- threejs-animation     → camera animation, keyframes, AnimationMixer
- threejs-loaders       → GLTF, texture, image loading, LoadingManager
- blender-toolkit       → Blender automation via WebSocket
- generate-3d-model     → image → GLB via Fal.ai
- impeccable            → design enforcement, taste layer, anti-AI-slop
- ui-ux-pro-max         → design system database, Python CLI
- frontend-design       → production frontend code with aesthetic
- find-skills           → discover new skills
- skill-creator         → create/modify custom skills
- unity-development     → Unity C# (not needed for this project)
- supabase-postgres     → backend DB (not needed yet)

## File Structure
D:\portfolio\
├── CLAUDE.md           ← this file (read every session)
├── PRODUCT.md          ← creative vision document
├── DESIGN.md           ← design tokens (generated by impeccable/ui-ux-pro-max)
├── index.html
├── package.json
├── vercel.json         ← deployment config (created in Phase 9)
├── src\
│   ├── engine\
│   │   ├── WorldEngine.js      ← Three.js scene + WebGPU renderer
│   │   ├── FrameScrubber.js    ← image sequence → canvas texture
│   │   ├── MouseParallax.js    ← hubtown-style mouse depth shift
│   │   └── PostFX.js           ← TSL post-processing pipeline
│   ├── ui\
│   │   ├── Cursor.js           ← custom cursor
│   │   ├── Loader.js           ← loading screen with designed animation
│   │   ├── HUD.js              ← fixed overlay UI
│   │   └── ContentPanels.js    ← per-world project panels
│   ├── worlds\
│   │   ├── worlds.config.js    ← all 5 worlds data
│   │   ├── WorldTransition.js  ← WebGL transition between worlds
│   │   └── MangoMoments.js     ← surprise interactions per world
│   └── utils\
│       ├── ScrollEngine.js     ← GSAP ScrollTrigger orchestration
│       ├── Preloader.js        ← ImageBitmap chunk loading
│       └── AudioManager.js     ← Web Audio API
├── styles\
│   ├── base.css        ← reset, CSS vars, fonts
│   ├── loader.css
│   ├── hud.css
│   └── panels.css
├── assets\
│   ├── frames-webp\    ← world-01 through world-05
│   ├── models\
│   ├── textures\
│   └── audio\
└── public\
    ├── favicon.ico
    └── og-image.jpg    ← social share image (one of your best UE5 frames)

## Session Log (Update After Every Session)
- [18/05/2026] Folder structure created, assets organized, guide written
- [18/05/2026] Phase 3.1: PostFX built (bloom, grain, aberration)
- [18/05/2026] Phase 3: PostFX removed — UE5 frames don't need it
- [18/05/2026] Engine fixed: fullscreen cover, 2K canvas,
  overscan for parallax, correct aspect ratio
- [18/05/2026] Phase 4.1: Loader built — DM Mono counter,
  curtain reveal, connects to real frame loading progress
- [18/05/2026] Phase 4.2: Cursor built — dot + ring,
  blend-mode difference, hover states
- [18/05/2026] Phase 4.3: HUD built — name, nav, world number,
  world title center, progress dots, scroll hint
- [18/05/2026] Phase 4.4: ContentPanels built — 5 world chapters,
  about, contact. Committed 0bf0de2.
- [19/05/2026] Phase 5: WorldTransition built — black crossfade 0.6s in /
  200ms hold / 0.8s out. Rift effect attempted and removed (artifacts).
- [19/05/2026] All 5 worlds reconverted to 1920x1080 WebP. Canvas updated
  to native resolution. Preloader STRIDE=5 (every 5th frame, ~191 requests).
- [19/05/2026] Frames uploaded to Cloudflare R2 CDN. framesPath updated
  in worlds.config.js. vercel.json cache headers added.
- [19/05/2026] Site deployed to portfolio-p9cf.vercel.app
- [19/05/2026] Quality pass: vignette, HUD spacing, scrub weight,
  loader counter size, panels breathing room.
- [19/05/2026] Architecture fixed: scrollEngine.init() moved into
  loader onComplete — ScrollTrigger only fires after curtain exits.
  currentWorldIndex guard prevents duplicate world loads. Only world-01
  loads on init; others load on-demand. Committed c22adb8.
- [19/05/2026] index.html rewritten as self-contained single-file app:
  inline CSS design tokens, inline ES module script, importmap Three.js CDN.
  Barlow Condensed / Barlow / Barlow Semi Condensed font system.
  Native scroll engine replaces GSAP ScrollTrigger.
- [20/05/2026] World names set: Ashfall / Luminara / Verdant / Helios / Aurum.
  WORLDS array and HUD updated in index.html and worlds.config.js.
- [20/05/2026] Character showreel section added (split-screen video + text,
  play button unmutes, IntersectionObserver muted autoplay). R2 path:
  showreel/character-reel.mp4.
- [20/05/2026] Ads/commercial horizontal drag carousel added (9 portrait MP4
  cards, hover play/pause, drag-to-scroll). R2 paths: gallery/ads/*.mp4.
- [20/05/2026] Gallery category filters added (All / Renders / Character /
  Abstract). 220ms fade-out → display:none swap → reveal re-enter animation.
- [20/05/2026] Gallery wired to real R2 assets: 14 render WebP images
  (gallery/renders/01-14.webp), 8 abstract MP4 videos
  (gallery/abstract/*.mp4). 3-col uniform grid, aspect-ratio 4/3 cells.
  Clay toggle feature removed. IntersectionObserver (threshold 0.3) drives
  abstract video play/pause.
- [ ] Next: Phase 6 — Audio (AudioManager.js) or Mango Moments