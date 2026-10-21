// Pupil check synchronised to the render: read the eye positions and the WebGL pixels in the same
// animation frame (after the site's render), so a moving head cannot shift the sample.
import { open, wait, browser } from './common.mjs';
const mobile = process.argv[2] === 'mobile';
const { p, errs } = await open('', mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {});
await p.evaluate(() => { window.__site.jon.status.debug = true; document.getElementById('about').scrollIntoView(); });
await p.waitForFunction(() => window.__site.jon.status.ready, null, { timeout: 150000 });
await p.waitForFunction(() => window.__site.jon.status.waves > 0 && !window.__site.jon.status.waving, null, { timeout: 120000 });
const sample = () => p.evaluate(() => new Promise(res => requestAnimationFrame(() => {
  const s = window.__site.jon.status, cv = document.getElementById('jon-canvas'), e = s.eyeScreen;
  const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(cv, 0, 0);
  const sp = Math.hypot((e[1][0] - e[0][0]) * cv.width, (e[1][1] - e[0][1]) * cv.height), r = Math.max(2, sp * .16);
  const eyes = e.map(([ex, ey]) => { const d = x.getImageData(Math.round(ex * cv.width - r), Math.round(ey * cv.height - r), Math.round(2 * r), Math.round(2 * r)).data; let dark = 0, white = 0, n = 0; for (let k = 0; k < d.length; k += 4) { if (!d[k + 3]) continue; const l = 0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]; n++; if (l < 45) dark++; if (l > 150) white++; } return { dark: +(dark / n).toFixed(2), white: +(white / n).toFixed(2) }; });
  res({ mode: s.mode, label: document.getElementById('jon-clip-lbl').textContent, eyes });
})));
const out = { mobile, idle: [], stand: [] };
for (let i = 0; i < 6; i++) { out.idle.push(await sample()); await wait(900); }
await p.click('.jon-ctrl [data-mode="stand"]'); await wait(4000);
for (let i = 0; i < 3; i++) { out.stand.push(await sample()); await wait(900); }
out.errs = errs;
console.log(JSON.stringify(out));
await browser.close();
