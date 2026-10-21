import { chromium } from 'playwright-core';
export const B = 'http://127.0.0.1:8080/v2.html';
export const wait = ms => new Promise(r => setTimeout(r, ms));
export const browser = await chromium.launch({ executablePath: '/opt/google/chrome/chrome', headless: false, args: ['--headless=new', '--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
export async function open(q = '', vp = { width: 1440, height: 900 }, extra = {}, setup = null) {
  const ctx = await browser.newContext({ viewport: vp, ...extra });
  if (setup) await setup(ctx);
  const p = await ctx.newPage(); const errs = [], fails = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('requestfailed', r => { const t = (r.failure() || {}).errorText || ''; if (!/ERR_ABORTED/.test(t)) fails.push(r.url().slice(-70) + ' ' + t); });
  await p.goto(B + q, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => getComputedStyle(document.getElementById('loader')).display === 'none', null, { timeout: 25000 });
  return { ctx, p, errs, fails };
}
// Screenshot an element, then in-page: ASCII render of a crop + pupil darkness metric.
export async function shotInfo(p, sel, { crop = [0, 0, 1, 1], cols = 48, rows = 24, eyes = null } = {}) {
  const buf = await p.locator(sel).screenshot({ type: 'png' });
  return p.evaluate(async ([b64, crop, cols, rows, eyes]) => {
    const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0);
    const [cx0, cy0, cw, ch] = [crop[0] * im.width, crop[1] * im.height, crop[2] * im.width, crop[3] * im.height];
    const t = document.createElement('canvas'); t.width = cols; t.height = rows; const tx = t.getContext('2d'); tx.drawImage(c, cx0, cy0, cw, ch, 0, 0, cols, rows);
    const d = tx.getImageData(0, 0, cols, rows).data, ramp = ' .:-=+*#%@'; let o = '';
    for (let y = 0; y < rows; y++) { for (let i = 0; i < cols; i++) { const k = (y * cols + i) * 4; const l = (0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]) / 255; o += ramp[Math.min(9, Math.floor(l * 10))]; } o += '\n'; }
    let pupil = null;
    if (eyes) {
      const sp = Math.hypot((eyes[1][0] - eyes[0][0]) * im.width, (eyes[1][1] - eyes[0][1]) * im.height);
      pupil = eyes.map(([ex, ey]) => {
        const r = Math.max(2, sp * .16), px = ex * im.width, py = ey * im.height; let dark = 0, white = 0, n = 0, minL = 255;
        const dd = x.getImageData(Math.round(px - r), Math.round(py - r), Math.round(2 * r), Math.round(2 * r)).data;
        for (let k = 0; k < dd.length; k += 4) { const l = 0.299 * dd[k] + 0.587 * dd[k + 1] + 0.114 * dd[k + 2]; n++; if (l < 45) dark++; if (l > 150) white++; minL = Math.min(minL, l); }
        return { rPx: +r.toFixed(1), dark: +(dark / n).toFixed(2), white: +(white / n).toFixed(2), minL: Math.round(minL) };
      });
    }
    return { w: im.width, h: im.height, ascii: o, pupil };
  }, [buf.toString('base64'), crop, cols, rows, eyes]);
}
