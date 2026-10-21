// JON framing probe: after the entry camera move settles, how far do head and hands travel on screen?
import { open, wait, browser, shotInfo } from './common.mjs';
const mobile = process.argv[2] === 'mobile';
const { p, errs } = await open('', mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {});
await p.evaluate(() => { window.__site.jon.status.debug = true; document.getElementById('about').scrollIntoView(); });
await p.waitForFunction(() => window.__site.jon.status.ready, null, { timeout: 150000 });
const A = () => p.evaluate(() => { const s = window.__site.jon.status; const a = s.armScreen || []; return { w: s.waving, hand: s.handScreen, head: s.headScreen, lh: (a[4] || [])[1], sway: s.rootSway }; });
const xs = [], hs = [], ls = []; let shot = null, sway = null, waved = false;
for (let i = 0; i < 50; i++) {
  const s = await A(); sway = s.sway; if (s.w) waved = true;
  if (i >= 8) { if (s.hand) xs.push(s.hand[0]); if (s.head) hs.push(s.head[0]); if (s.lh != null) ls.push(s.lh); }
  if (s.w && !shot && i > 12) shot = await shotInfo(p, '#jon-view', { cols: 40, rows: 30 });
  await wait(600);
}
const r = a => a.length ? [Math.min(...a), Math.max(...a)].map(v => +v.toFixed(3)) : null;
console.log(JSON.stringify({ mobile, sway, waved, rightHandX: r(xs), headX: r(hs), leftHandX: r(ls), errs }));
if (shot) console.log(shot.ascii);
await browser.close();
