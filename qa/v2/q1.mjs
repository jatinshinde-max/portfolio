import fs from 'node:fs';
import { browser, open, wait } from './common.mjs';
const out = {};
{
  const { ctx, p, errs, fails } = await open('?diag=worlds');
  out.fonts = await p.evaluate(async () => { await document.fonts.ready; return { cormorant: document.fonts.check('300 40px "Cormorant Garamond"'), dmMono: document.fonts.check('400 12px "DM Mono"') }; });
  out.hero = await p.evaluate(() => { const r = s => { const b = document.querySelector(s).getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; }; const n = document.querySelector('.seq1-name'); return { name: r('.seq1-name'), role: r('.seq1-role'), aside: r('.seq1-aside'), hint: r('#seq1-hint'), nameFont: getComputedStyle(n).fontFamily.split(',')[0] + ' ' + getComputedStyle(n).fontWeight + ' ' + getComputedStyle(n).fontSize, lines: Math.round(n.getBoundingClientRect().height / parseFloat(getComputedStyle(n).lineHeight)) }; });
  const seq = [];
  for (const f of [.25, .5, .9]) { await p.evaluate(f => { const w = document.getElementById('seq1-wrap'); scrollTo(0, w.offsetTop + (w.offsetHeight - innerHeight) * f); }, f); await wait(2500); seq.push(await p.evaluate(() => +document.getElementById('seq1-video').currentTime.toFixed(2))); }
  out.seq1 = seq;
  await p.evaluate(() => document.getElementById('worlds').scrollIntoView());
  await p.waitForFunction(() => window.__site.worlds.state().live, null, { timeout: 30000 }).catch(() => {});
  await wait(3000);
  const st = () => p.evaluate(() => { const s = window.__site.worlds.state(); const v = [...document.querySelectorAll('.w-vid')]; const on = v.find(x => x.classList.contains('on')); return { cur: s.cur, live: s.live, canvas: !!document.getElementById('w-canvas'), canvasShown: document.getElementById('w-canvas') ? getComputedStyle(document.getElementById('w-canvas')).display : 'none', onSrc: on ? on.currentSrc.split('/').pop() : null, onT: on ? +on.currentTime.toFixed(2) : null, onPaused: on ? on.paused : null, onZ: on ? getComputedStyle(on).zIndex : null, others: v.filter(x => x !== on).map(x => ({ src: x.currentSrc.split('/').pop(), paused: x.paused, z: getComputedStyle(x).zIndex })), diag: document.querySelector('#w-diag pre').textContent.split('\n') }; });
  out.w0 = await st();
  const sw = [];
  for (const k of [1, 2, 3, 4, 3, 2, 1, 0, 4, 0]) { await p.click(`.w-btn[data-w="${k}"]`); await wait(4200); const s = await st(); sw.push({ to: k, cur: s.cur, onSrc: s.onSrc, onT: s.onT, paused: s.onPaused, match: s.onSrc === `world-0${k + 1}-preview.mp4` }); }
  out.switches = sw;
  for (const k of [1, 2, 3]) { await p.click(`.w-btn[data-w="${k}"]`); await wait(220); }
  await wait(5000);
  { const s = await st(); out.rapid = { cur: s.cur, onSrc: s.onSrc, match: s.onSrc === 'world-04-preview.mp4', paused: s.onPaused }; }
  await wait(2500);
  out.after = await st();
  out.dipTrace = await p.evaluate(async () => { const d = document.getElementById('w-dip'); const t = []; document.querySelector('.w-btn[data-w="0"]').click(); const t0 = performance.now(); for (let i = 0; i < 22; i++) { await new Promise(r => setTimeout(r, 90)); const vs = [...document.querySelectorAll('.w-vid')].map(v => v.classList.contains('on') ? v.currentSrc.split('/').pop().slice(0, 8) : '-'); t.push(Math.round(performance.now() - t0) + ' dip=' + (+getComputedStyle(d).opacity).toFixed(2) + ' on=' + vs.join('|')); } return t; });
  out.errs = errs; out.fails = fails.slice(0, 6);
  await ctx.close();
}
{
  const { ctx, p } = await open('?diag=worlds&blend=1');
  await p.evaluate(() => document.getElementById('worlds').scrollIntoView());
  await p.waitForFunction(() => window.__site.worlds.state().live, null, { timeout: 30000 }).catch(() => {});
  await wait(4000);
  out.legacyLag = await p.evaluate(async () => {
    const cv = document.getElementById('w-canvas'); const v = [...document.querySelectorAll('.w-vid')].find(x => x.classList.contains('on'));
    const W = 96, H = 54; const a = document.createElement('canvas'); a.width = W; a.height = H; const ax = a.getContext('2d', { willReadFrequently: true });
    const b = document.createElement('canvas'); b.width = W; b.height = H; const bx = b.getContext('2d', { willReadFrequently: true });
    const res = [];
    for (let i = 0; i < 40; i++) {
      await new Promise(r => requestAnimationFrame(() => r()));
      ax.drawImage(cv, 0, 0, W, H);
      const vw = v.videoWidth, vh = v.videoHeight, s = Math.max(cv.width / vw, cv.height / vh), sw = cv.width / s, sh = cv.height / s; bx.drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, W, H);
      const A = ax.getImageData(0, 0, W, H).data, Bd = bx.getImageData(0, 0, W, H).data; let d = 0;
      for (let k = 0; k < A.length; k += 4) d += Math.abs(A[k] - Bd[k]) + Math.abs(A[k + 1] - Bd[k + 1]) + Math.abs(A[k + 2] - Bd[k + 2]);
      res.push(+(d / (W * H * 3)).toFixed(2));
    }
    return { perFrame: res, max: Math.max(...res), mean: +(res.reduce((x, y) => x + y, 0) / res.length).toFixed(2) };
  });
  out.legacySwitchMix = await p.evaluate(async () => {
    const cv = document.getElementById('w-canvas'); const W = 96, H = 54; const a = document.createElement('canvas'); a.width = W; a.height = H; const ax = a.getContext('2d', { willReadFrequently: true });
    const vids = [...document.querySelectorAll('.w-vid')];
    document.querySelector('.w-btn[data-w="2"]').click();
    await new Promise(r => setTimeout(r, 1200));
    const v = vids.find(x => x.classList.contains('on'));
    const b = document.createElement('canvas'); b.width = W; b.height = H; const bx = b.getContext('2d', { willReadFrequently: true });
    const res = [];
    for (let i = 0; i < 6; i++) { await new Promise(r => setTimeout(r, 60)); ax.drawImage(cv, 0, 0, W, H); const vw = v.videoWidth, vh = v.videoHeight, s = Math.max(cv.width / vw, cv.height / vh), sw = cv.width / s, sh = cv.height / s; bx.drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, W, H); const A = ax.getImageData(0, 0, W, H).data, Bd = bx.getImageData(0, 0, W, H).data; let d = 0; for (let k = 0; k < A.length; k += 4) d += Math.abs(A[k] - Bd[k]); res.push(+(d / (W * H)).toFixed(1)); }
    return { onSrc: v.currentSrc.split('/').pop(), canvasVsNewWorldDiff: res };
  });
  await ctx.close();
}
fs.writeFileSync('q1.json', JSON.stringify(out));
console.log('Q1DONE');
await browser.close();
