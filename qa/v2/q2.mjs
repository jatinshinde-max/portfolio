// JON in About: per-state renders (ASCII from real screenshots), pupil metric, wave arm, gaze.
import fs from 'node:fs';
import { browser, open, wait, shotInfo } from './common.mjs';
const vp = process.argv[2] === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const extra = process.argv[2] === 'mobile' ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {};
const out = { vp }; const txt = [];
const { ctx, p, errs, fails } = await open('', vp, extra);
await p.evaluate(() => { window.__site.jon.status.debug = true; document.getElementById('about').scrollIntoView(); });
const t0 = Date.now();
await p.waitForFunction(() => window.__site.jon.status.ready || window.__site.jon.status.error, null, { timeout: 150000 });
out.loadMs = Date.now() - t0;
const S = () => p.evaluate(() => { const s = window.__site.jon.status; return { weights: s.weights, mt: s.mixerTime, mode: s.mode, waving: s.waving, waves: s.waves, label: document.getElementById('jon-clip-lbl').textContent, hand: s.handScreen, head: s.headScreen, eyes: s.eyeScreen, target: s.target, headDir: s.headDir, eyeDir: s.eyeDir }; });
out.ready = await p.evaluate(() => { const s = window.__site.jon.status; return { rig: s.rig, clips: s.clips, eyes: s.eyes, pupilsRepaired: s.pupilsRepaired, blendFixed: s.blendFixed, error: s.error }; });
// greeting wave timeline (auto on first arrival)
const tl = [];
for (let i = 0; i < 70; i++) { const s = await S(); if (i > 8 && !s.waving && s.waves) break; tl.push([Date.now() - t0, s.waving ? 'W' : '-', s.label, s.hand && s.hand.join(','), s.head && s.head.join(','), s.mt, JSON.stringify(s.weights)]); if (i === 14 || i === 18) { const r = await shotInfo(p, '#jon-view', { cols: 40, rows: 30 }); txt.push(`== greeting wave t=${Date.now() - t0}ms label=${s.label} hand=${s.hand} ==\n` + r.ascii); } await wait(200); }
out.greeting = tl;
await wait(2500);
async function eyesShot(tag) {
  // Software GL renders a few fps here, so only accept a screenshot taken while the eyes did not move.
  let s, e, r, drift = 1, tries = 0;
  do {
    s = await S(); e = s.eyes; if (!e || e.length < 2) return null;
    const mx = (e[0][0] + e[1][0]) / 2, my = (e[0][1] + e[1][1]) / 2, sp = Math.abs(e[1][0] - e[0][0]);
    r = await shotInfo(p, '#jon-view', { crop: [mx - sp * 1.6, my - sp * .45, sp * 3.2, sp * .9], cols: 64, rows: 14, eyes: e });
    const e2 = (await S()).eyes; drift = Math.max(...e2.flat().map((v, i) => Math.abs(v - e.flat()[i])));
    if (drift > .004) await wait(1500);
  } while (drift > .004 && ++tries < 6);
  const sp = Math.abs(e[1][0] - e[0][0]);
  txt.push(`== eyes ${tag} (spacing ${(sp * r.w).toFixed(0)}px, drift ${drift.toFixed(4)}, pupil metric ${JSON.stringify(r.pupil)}) ==\n` + r.ascii);
  const f = await shotInfo(p, '#jon-view', { cols: 40, rows: 30 });
  txt.push(`== frame ${tag} label=${s.label} ==\n` + f.ascii);
  return { pupil: r.pupil, drift: +drift.toFixed(4), spacingPx: Math.round(sp * r.w), head: s.head, eyes: e, label: s.label, weights: s.weights };
}
out.idle = await eyesShot('idle');
const box = await p.locator('#jon-view').boundingBox();
const gz = {};
for (const [k, x, y] of [['center', .5, .3], ['left', -.4, .3], ['right', 1.4, .3], ['up', .5, -.3], ['down', .5, 1.1]]) {
  await p.mouse.move(box.x + box.width * x, box.y + box.height * y, { steps: 6 }); await wait(1800);
  const s = await S(); gz[k] = { target: s.target, head: s.headDir, eye: s.eyeDir };
  if (k === 'left' || k === 'up') out['eyes_' + k] = await eyesShot('gaze-' + k);
}
out.gaze = gz;
await p.mouse.move(box.x + box.width * .5, box.y + box.height * .3, { steps: 4 });
await p.click('.jon-ctrl [data-mode="stand"]'); await wait(2500);
out.stand = await eyesShot('stand');
const wv = [];
await p.click('.jon-ctrl [data-act="wave"]');
for (let i = 0; i < 90; i++) { const s = await S(); wv.push([i * 400, s.waving ? 'W' : '-', s.label, s.hand && s.hand.join(','), s.mt, JSON.stringify(s.weights)]); if (i === 8) { out.waveEyes = await eyesShot('wave-from-stand'); const f = await shotInfo(p, '#jon-view', { cols: 40, rows: 30 }); txt.push(`== wave-from-stand frame mt=${s.mt} w=${JSON.stringify(s.weights)} hand=${s.hand} ==\n` + f.ascii); } if (!s.waving && i > 3) break; await wait(400); }
out.waveFromStand = wv;
out.afterWave = await S();
await p.click('.jon-ctrl [data-mode="idle"]'); await wait(2000);
out.idleAgain = await S();
out.layout = await p.evaluate(() => { const r = s => { const b = document.querySelector(s).getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; }; return { view: r('#jon-view'), text: r('.ab-text'), ctrl: r('.jon-ctrl'), overflowX: document.documentElement.scrollWidth - innerWidth, sticky: getComputedStyle(document.querySelector('.ab-figure')).position }; });
out.cv = await p.evaluate(() => ({ ...window.__site.cv, btn: (document.getElementById('cv-btn') || {}).textContent || [...document.querySelectorAll('.ab-cta a')].map(a => a.textContent).join('|') }));
out.errs = errs; out.fails = fails.slice(0, 6);
const tag = process.argv[2] || 'desk';
fs.writeFileSync(`q2-${tag}.json`, JSON.stringify(out)); fs.writeFileSync(`q2-${tag}.txt`, txt.join('\n'));
console.log('Q2DONE');
await ctx.close(); await browser.close();
