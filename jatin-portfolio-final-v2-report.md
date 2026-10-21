# jatin-portfolio-final-v2.html: corrections report

This is the review candidate for the "final portfolio corrections" brief.

| | |
|---|---|
| Built from | `jatin-portfolio-final.html` (v1), which is unchanged, along with every earlier file |
| Branch | `claude/busy-volta-5rtmib` |
| Production | Not touched. No Git history was rewritten and no R2 object was modified. |
| Companion files | `jatin-final-asset-request.md` (asset checklist) and `qa/v2/*.mjs` (the browser QA scripts used below) |

## 0. Skill and plugin invocation log (Skill tool, actual calls)

| Skill (exact identifier) | When | How it was applied |
|---|---|---|
| `threejs-skills-main:threejs-loaders` | This brief, step 0 | GLB loading and progress, a single-download rig, glTF parsing for diagnosis |
| `threejs-skills-main:threejs-interaction` | This brief, step 0 | Pointer → normalised device coordinates for gaze, OrbitControls limits, touch handling |
| `rampstack-skills:qa-testing` | This brief, step 0 | Tiered QA, real-browser evidence, and stating gaps instead of guessing |
| `rampstack-skills:performance-optimization` | This brief, step 0 | One 17 MB rig instead of three, lazy init, no per-frame canvas work in Worlds |
| `genjutsu:cast` | This brief, step 0 | Read its pipeline. The interaction thesis for this pass is "the work is shown truthfully, and JON greets you once, then watches you". I did not run its preview gate because the brief forbids stopping for approval, and I added no dependency. |
| `rampstack-skills:code-review-web` | This brief, mid-implementation | A self-review that found and fixed two bugs (§1 slow-network stale frame; §7 CV preflight) |
| `threejs-skills-main:threejs-animation` | This brief, while debugging the wave | Action weights and crossfades, LoopRepeat ×2 + clampWhenFinished, the 'finished' event |
| `rampstack-skills:creative-direction`, `rampstack-skills:art-direction`, `taste-skill:taste-skill` (design-taste-frontend), `anthropic-skills:gsap-core`, `gsap-skills:gsap-scrolltrigger`, `gsap-skills:gsap-timeline`, `gsap-skills:gsap-performance`, `motion-design-skill-main:motion-design`, `threejs-skills-main:threejs-lighting`, `threejs-skills-main:threejs-materials`, `rampstack-skills:media-asset-management`, `rampstack-skills:accessibility-audit`, `ui-ux-pro-max:ui-ux-pro-max` | Earlier in this same session (the v1 build); not re-invoked for v2 | Their guidance still governs v2: the locked palette and type, expo-out entrances, transform/opacity-only motion, lazy media, keyboard and ARIA patterns. **I'm stating this rather than claiming fresh calls.** |

## 1. World video ghosting: diagnosis and correction

**Cause.** v1 never showed the world videos directly. Every animation frame it drew the hidden `<video>` onto a canvas with `ctx.globalAlpha = 0.2`. That is an exponential moving average of past frames.

The previews are encoded at **6.25 fps** (measured 6.45 unique frames/s in Chrome). So each new source frame faded in over about 10 display frames, on top of the previous one: a visible double image.

Two other effects made it worse:
- On a world switch, the old world kept bleeding into the new one.
- A sine "zoom drift" of ±1.8 % moved the stage under the smear.

**Measured in real Chrome with `?diag=worlds&blend=1`, which re-enables the v1 path:**
- The blended canvas differed from the true current video frame by a **mean of 14.1/255 per channel** (max 17.2). That is the ghost residue.
- After a switch, the canvas still carried the previous world: the difference against the new world went 28.5 → 20.7 → 11.8 over ~0.4 s.

**Correction (v2 default):**
- The previews are plain `<video>` layers with `object-fit: cover`. There is no canvas, no blending and no drift.
- Mouse parallax only (no zoom/scale): about 14 px of travel and ~1.2° of tilt.
- **A world switch:** dip to black (0.3 s) → swap only after the target video presents *its own* first frame (`requestVideoFrameCallback`, checked against its current `src`) → lift (0.65 s).
  - The dip trace shows the swap happening exactly at full black (`dip=1.00`).
  - If the video is late, the dip lifts onto that world's poster, never onto the previous world's video.

**Diagnostic mode:**
- `?diag=worlds` adds a panel showing the mode, the source file, measured cadence, decoded/dropped frames, slot state and a per-switch timing log.
- `&blend=1` re-enables the v1 path, and `&split=1` shows v1 on the right half for side-by-side comparison.

**Real Chrome results (v2):**
- **Forward and back** (02→03→04→05→04→03→02→01→05→01): all 10 landed on the correct file and kept playing.
- **Triple-click** (02, 03, 04 at 220 ms intervals): landed on 04.
- **First frame after switch:** 309–529 ms.
- **Frames dropped:** 0.

**Not claimed:** smooth 60 fps. The sources are 6.25 fps, so v2 shows them truthfully and the motion steps visibly. A 24–30 fps re-export is requested in the asset checklist (item 5); the originals are untouched.

## 2. JON moved into About

- **Removed:** the standalone Character chapter (`#character`). The JON GLBs and the character reel are kept: the reel now sits at the end of About as "Character & 3D".
- **Desktop:** JON fills a sticky left half (full viewport height) while the editorial column scrolls on the right.
- **Mobile:** JON gets a framed band of `min(80svh, 108vw)` above the text.
- **The editorial column contains:**
  - name and role
  - the "Building cinematic worlds." statement
  - 7+ years
  - the biography
  - a Creative AI block (ComfyUI, ControlNet, IP-Adapter; Flux · Wan · LTX, all from V5)
  - 9 disciplines
  - all 13 applications
  - CTA: email, LinkedIn, CV
- **Navigation is renumbered** in the index, HUD and section numbers: 01 Worlds · 02 Before/After · 03 Commercial CGI · 04 ComfyUI · 05 AI Systems · 06 Archive · 07 About & JON · 08 Contact.
- ScrollTrigger order follows the DOM.

## 3. JON's eyes

**Cause, found by parsing all three GLBs:**
- In `JON wave.glb`, each eye has two primitives: "Tiny Sclera" (white, 335 vertices) plus "Material" (black, 33 vertices). The second one is the pupil.
- In `JON Idel.glb` and `JON stand.glb`, the export merged them into **one** 368-vertex primitive that uses only the white sclera material. That is why the eyes rendered white.
- It is not caused by morph targets, alphaTest, render order or visibility.

**How the pupil was located:**
- I matched the merged meshes' triangles against the Wave pupil. Exactly **48 triangles per eye** are the pupil.
- They are the front cap of the eyeball: depth below 3.6 % of the eye's size, while the sclera starts at 6.6 %.

**Fix:**
- v2 loads the Wave file for all states (§4), so pupils are authored.
- A generic runtime repair also regroups those 48 front triangles onto a black pupil material for any eye mesh that lacks a pupil primitive.

**Rendered evidence (real Chrome, ASCII renders taken from screenshots):**
- **In the harness:** Idle-raw shows solid white eyes (`%%@@%%%`). Idle-repaired and Stand-repaired show a dark pupil in both eyes, matching the Wave reference.
- **On the v2 page:** the pupil metric is the fraction of dark pixels inside each eye's centre disc; a white, pupil-less eye scores 0.

| State | Desktop (left, right eye) | Mobile (left, right eye) | How measured |
|---|---|---|---|
| Idle | 0.23–0.28, 0.29–0.32 (6 frames) | 0.25–0.30, 0.32–0.33 | `qa/v2/eyesync.mjs`: eye positions and WebGL pixels read in the same rendered frame |
| Stand | 0.29–0.30, 0.30–0.34 (3 frames) | 0.31, 0.34 | Same; also 0.25/0.24 in the screenshot-based run |
| Wave | 0.24–0.25, 0.26–0.27 | 0.32, 0.33 | Screenshot crop taken while the eyes were still (drift ≤ 0.003) |

Every sample in every state shows a pupil.

**Gaze:** eyes and head follow the cursor. Target vs eye direction (yaw, pitch):
- centre −5,9 / −4,5
- left −6,3 / −6,−1
- down −4,−24 / −3,−28
- right/up are clamped (eyes ±23°, head ±49°)

Both eyes aim at a point on the camera plane, so they converge only slightly and never cross. On first arrival JON looks at the camera for ~3 s.

## 4. JON's animations

**Why Wave did not wave:** `JON wave.glb` contains 16 clips. v1 picked the longest Mixamo clip, which was `Armature|mixamo.com|Layer0_Armature.001`: **the 10.6 s idle**. The real wave is `Armature|mixamo.com|Layer0.001` (1.47 s: right arm 27°, hand 20°).

**v2 architecture:** one rig (the Wave GLB, a single 17 MB download instead of up to three), three states, crossfades between all of them.

- **Idle:** the authored 10.6 s idle, plus a subtle breathing layer and cursor gaze. The clip moved the hips ~40 cm sideways, so its horizontal travel is damped to 20 %. The vertical axis is found from the rig, not assumed.
- **Wave:** the authored wave, ×2, with crossfades of 0.45 s in and 0.6 s out back to Idle or Stand. JON greets you once automatically when About first comes into view.
  - **Measured:** wave weight 1.0. The elbow drops (y ≈ 0.88) while the wrist rises back to shoulder height (y ≈ 0.63–0.68) and sweeps x 0.08 → 0.28 → 0.08. It is an authored "low wave", not a raised-arm wave.
- **Stand:** `JON stand.glb` is an **A-pose** with no body animation, so v2 does not use it. Stand is a held pose taken from frame 0 of the authored idle, plus slower breathing and a calmer gaze.

**Controls:** Idle, Stand, Wave. Nothing is unfinished.

## 5. Hero typography (video, scrub and timing untouched)

- Name set on one line on desktop: Cormorant Garamond 300, `clamp(3.5rem, 9.4vw, 10.5rem)`, −0.04em. Words never break mid-name.
- Role written as a sentence in Cormorant 400 at 1.2–1.65rem, `text-wrap: balance`, max 34ch.
- One small DM Mono label (0.76rem, 0.18em letter-spacing). It was 0.68rem / 0.3em.
- The "7+ years of production" aside uses a hairline rule, a large numeral and italic text instead of tiny mono.
- A soft radial darkening behind the type for contrast over the footage.
- Mask reveal of the name (word by word), then tag, role and aside.
- **Mobile:** the identity block sits higher so it clears the Scroll hint.
- **Measured in Chrome:** fonts loaded (Cormorant ✓, DM Mono ✓), name renders at 135 px on one line at 1440 px wide, Sequence 1 at 25/50/90 % scroll → 2.0/4.0/7.2 s (identical to v1).

## 6. Asset audit

See `jatin-final-asset-request.md`: one consolidated checklist.
- **Required:** CV and 3 ComfyUI outputs.
- **Recommended:** five 24–30 fps world re-exports and three lighter commercial previews.
- **Optional:** an extra JON gesture and an OG JPEG.

The ComfyUI frames and the CV button now detect their uploads automatically.

## 7. Brand links

- Removed the Instagram (`imaginators.studio`) and YouTube (`@imaginatorsstudio`) links. No occurrence of "imaginators" remains in v2.
- The footer now carries Email, LinkedIn and a CV link. The CV link stays hidden until `cv/jatin-shinde-cv.pdf` exists.
- The CV check is a plain GET aborted after the headers. A `Range` header was dropped because it could trigger a CORS preflight.

## 8. Browser QA (real Google Chrome 155 in a Vercel Sandbox, real R2 media)

| Area | Result |
|---|---|
| Worlds | Pass (see §1) |
| Sequence 1 | Unchanged timing |
| Hero | Fonts loaded; one-line name |
| JON | Loads in 2.0–3.2 s; 65 joints; 2 eyes; pupils verified in Stand and Wave on desktop and mobile; greeting wave; manual wave from Stand returns to Stand; Idle/Stand crossfade |
| About layout | Sticky on desktop; stacked on mobile; no horizontal overflow at 390 px |
| CV | 404 on R2 → "CV — available soon" (disabled) |
| Console | One expected error: the 404 for the CV probe |

Before/After, Commercial, ComfyUI, AI Systems and Archive code was not changed in v2. Their real-Chrome results are in the v1 report (all 11 films, 28 Before/After images, 57 archive items, viewer controls, 0 failed requests).

## 9. Known limitations

- **Frame rate of the worlds:** these are 6.25 fps sources. Clean, but not smooth until re-exported.
- **Visual evidence format:** the sandbox renders with SwiftShader at a few fps, and screenshots could not be copied out of it as images. Evidence is therefore numbers plus ASCII renders taken from real screenshots. **A final look in a desktop browser by you is still the decisive visual check.**
- **Wave framing:** at the far end of each wave stroke, JON's wrist crosses the left edge of the chest-up frame by about 6 % for a moment. The head stays within x 0.37–0.52 on both desktop and mobile; it moved across 0.18–0.74 before the root sway was damped.
- **The authored wave is a low wave:** a higher wave needs a new export (asset checklist item 9).
- **Stand:** derived from the idle's first frame, because `JON stand.glb` is an A-pose.
