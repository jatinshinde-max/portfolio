# jatin-portfolio-final.html — delivery report

Personal portfolio of **Jatin Shinde** (CGI & VFX artist, **7+ years**). Foundation: `portfolio-full-preview-v5-corrected.html` (unchanged). Branch `claude/busy-volta-5rtmib`. No original V5/V2/V3 file, R2 asset, Git history or production deployment was modified.

## 1. Skills / plugins actually invoked (Skill tool)

| Identifier | Result → contribution |
|---|---|
| `rampstack-skills:creative-direction` | Loaded (earlier in session) → 4-axis brief: editorial-restrained, resonant, peer relationship |
| `rampstack-skills:art-direction` | Loaded → section-by-section treatment, variant planning (portrait vs 16:9 films) |
| `taste-skill:taste-skill` | Loaded → dials 8/7/3, no card grids/glass/AI-purple, one locked accent (#e8d5b0) |
| `anthropic-skills:gsap-core`, `gsap-skills:gsap-scrolltrigger` | Loaded → pins, scrub, `matchMedia`-style reduced-motion branches, snap config |
| `motion-design-skill-main:motion-design` | Loaded → Premium personality: expo.out entrances, power2.in exits ~35% shorter, staggers < 500 ms |
| `gsap-skills:gsap-timeline`, `gsap-skills:gsap-performance` | Loaded → timeline sequencing (viewer, ending credits), transform/opacity only, lerped RAF loops |
| `threejs-skills-main:threejs-lighting` / `-animation` / `-materials` | Loaded → key/rim/fill/kick + RoomEnvironment IBL, single-clip mixer, alphaTest instead of BLEND |
| `rampstack-skills:media-asset-management` | Loaded → lazy media, poster/size audit, asset checklist below |
| `rampstack-skills:accessibility-audit` | Loaded → skip link, dialog focus trap, slider roles, keyboard paths, reduced motion |
| `ui-ux-pro-max:ui-ux-pro-max` | Loaded + ran `search.py --design-system` and `--domain ux`. Adopted: lazy video, stop off-screen media, focus states, breakpoints. **Rejected** its indigo/green palette, Inter and "instant transitions" (conflict with locked brief) |
| Genjutsu | **Not invoked** — it generates AI media; the brief forbids invented media |
| Browser QA | Real Google Chrome 155 in a Vercel Sandbox (this container's egress policy blocks R2) + local headless shell |

## 2. Section changes

| # | Section | What changed |
|---|---|---|
| A | Sequence 1 | Scrub code copied **verbatim** (CHASE 1.0 / FINE .05 / MAX_RATE 3.5 / BACK_INT 42). New identity typography only. |
| B | Worlds | Root cause found: previews are encoded at **6.25 fps**. Canvas frame-blending + 60 fps drift/parallax, double-buffered videos with next-world preload, fixed poster paths (`assets/frames-webp/*` was 404; two "frame_0001" files are 28 MB / 107 MB animated WebPs). |
| C | Before/After | Queued, decode-gated group transitions (no overlapping timelines, layout swaps while hidden, scroll hysteresis). 4-panel grid + all 14 pairs kept. Keyboard sliders. |
| D | Commercial CGI | Pinned "screening procession": focused film plays muted loop, others dim; kinetic number/title; per-film real metadata; viewer with play/pause, scrub, sound, prev/next, keyboard. Pepsi framed 16:9. Mobile: snap-scroll strip. |
| E | ComfyUI | Pinned graph theatre: 3 workflows, node sequence (labels kept from V5), edges draw with a data pulse, captions per beat, labeled output placeholders. |
| F | AI Systems | Three distinct compositions: brief → 4-channel generator (typed output); proportional scene timeline with playhead; shot list ↔ contact sheet + loupe. Demo content kept as fictional. |
| G | Character / JON | Reel: real Pause/Play (reel has no audio track). JON: BLEND body material → opaque + alphaTest; eye material metallic fix; plays only the body clip (V5 played all 7 clips at once); auto up/forward normalisation; chest-up framing; front entry move; cursor gaze for eyes + head. |
| H | Archive | Inline drift wall: 44 concept videos + 13 renders, filters, lazy play/pause, viewer with prev/next. |
| I | About | 7+ counter, bio/disciplines (V5 text), 13 applications table, generative stack line. |
| J | Contact + ending | Large email with copy, LinkedIn, scroll-driven credits "Fin." and return-to-start curtain. |

## 3. Media verification (curl + ffmpeg from Vercel Sandbox)

All returned **200** with CORS `*` on GET; all MP4s are faststart.

| Asset | Result |
|---|---|
| 11 commercial films | OK. 608×1080 ×6, Pepsi 1920×1080 (16:9), 911 1080×1920 (113 MB, audio), Moisturizer & RR Ad 2160×3840 (audio), Reel 720×1280 (audio) |
| Concept videos | 44/44 OK (H13, H17, H28, V3 do not exist) |
| Renders | 13/13 OK (01–13) |
| Before/After | 28/28 OK |
| World previews | 5/5 OK, 1080p **6.25 fps**, 12–57 MB |
| Sequence1, character reel, 3 JON GLBs | OK |
| `cv/jatin-shinde-cv.pdf` | **404** |

## 4. Browser QA evidence (real Chrome, real R2 media)

- Loader cleared 2.3 s; Sequence1 at 25/50/90 % scroll → 2.0 / 4.0 / 7.2 s of 8 s.
- Worlds: canvas live, Ashfall playing, world 02 preloaded, Helios + Aurum switch (preloaded buffer reused).
- Before/After: 28 images decoded at 1600 px, drag → 20 %, rapid 5-jump scroll settles on set 4, back to 3→2→1 all opaque.
- Commercial: previews playing for films 01, 04, 08 (911), 11. **Viewer, all 11 films**: playing within 1.4–2.1 s; portrait frames 400×711, Pepsi 1264×711; 4 audio films unmuted with decoded audio bytes > 0, 7 show "No audio track"; mute toggle, scrub to 50 %, pause/play, close (video removed, focus restored), reopen.
- ComfyUI 01→02→03 with captions; AI: all 4 posts typed, playhead SC 04 at 5 s, storyboard hover sync.
- JON: 65 joints, 2 eyes in Idle/Wave/Stand; Stand = authored held pose (file contains no body animation). Gaze measured (yaw, pitch): target vs eyes — center 0,8 / 0,4; left −12,7 / −12,3; right 36,7 / 34,−2; up 6,21 / 7,17; down −6,−18 / −6,−22.
- Archive: 10 concept clips playing on view, 13/13 renders, image + video viewer.
- About 7 / 13 apps; return-to-start → scrollY 0.
- **0 console errors, 0 failed requests** (desktop); mobile 390×844: Sequence1 plays, worlds live, commercial snap + tap viewer, JON loads, **no horizontal overflow** in any section.

## 5. Asset requirements checklist

| Needed | Path to upload (R2) | Spec |
|---|---|---|
| CV PDF | `cv/jatin-shinde-cv.pdf` | PDF, ≤ 5 MB — enables the disabled "CV" button |
| ComfyUI output 01 | `comfyui/wf-01-infinitetalk-output.mp4` | MP4 H.264, 9:16 or 1:1, ≤ 12 MB |
| ComfyUI output 02 | `comfyui/wf-02-trellis-turntable.mp4` (+ optional `.glb`) | MP4 16:9 ≤ 12 MB; GLB ≤ 15 MB |
| ComfyUI output 03 | `comfyui/wf-03-minimax-longvideo.mp4` | MP4 16:9, ≤ 25 MB |
| Smoother worlds (recommended) | re-export `world-previews/world-0N-preview.mp4` | 24–30 fps, 1080p, ~6–8 Mbps, faststart |
| Lighter film previews (recommended) | 1080p copies of 911 / Moisturizer / RR Ad | ≤ 15 MB each (originals 113 / 58 / 39 MB) |
| Optional | Real body animation for "Stand" | Stand GLB currently has only a held pose |

## 6. Known limitations

- Visual review is still needed: screenshots could not be transferred out of the sandbox, so composition/material quality was verified numerically and by state, not by eye.
- Headless sandbox rendering is software (SwiftShader); its 22 fps is not representative of real devices.
- Worlds stay 6.25 fps sources; blending smooths but cannot add true frames until re-exported.
- Footer still links the Instagram/YouTube handles you set earlier (`imaginators.studio`); change if you want only personal links.
