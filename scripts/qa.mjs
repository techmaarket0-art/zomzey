// QA harness: overflow sweep, axe accessibility, keyboard order, reduced motion, perf, console errors.
// Usage: npm run qa   (expects `npm run dev` on :4310, or pass a base URL / BASE_URL)
import { createRequire } from 'module';
import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
const base = process.argv[2] || process.env.BASE_URL || 'http://localhost:4310/';
const axePath = 'node_modules/axe-core/axe.min.js';
const axeSrc = existsSync(axePath) ? readFileSync(axePath, 'utf8') : null;
const report = { base, when: new Date().toISOString(), overflow: [], axe: [], keyboard: null, reducedMotion: null, perf: [], console: [] };

const browser = await pw.chromium.launch();

// 1 · Overflow sweep across widths (both pages)
for (const page of ['index.html', 'styleguide.html']) {
  for (const w of [320, 360, 390, 414, 600, 768, 900, 1024, 1180, 1280, 1366, 1440, 1680, 1920, 2560]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, isMobile: w <= 430, hasTouch: w <= 430 });
    const p = await ctx.newPage();
    p.on('pageerror', e => report.console.push(`${page}@${w} pageerror: ${e.message}`));
    p.on('console', m => { if (['error', 'warning'].includes(m.type())) report.console.push(`${page}@${w} ${m.type()}: ${m.text()}`); });
    await p.goto(base + page, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    const r = await p.evaluate(async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      let max = 0;
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); max = Math.max(max, document.documentElement.scrollWidth); }
      // clipped text check: elements whose content is wider than their box without being a scroller
      const clipped = [];
      document.querySelectorAll('h1,h2,h3,p,a,button,dd,dt,li,span.tag,span.status').forEach(el => {
        if (el.closest('[aria-hidden="true"]') || el.closest('.sr-only')) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        if (el.scrollWidth > el.clientWidth + 2 && /(hidden|clip)/.test(cs.overflowX) && cs.textOverflow !== 'ellipsis') clipped.push(el.tagName + '.' + el.className + ': ' + el.textContent.trim().slice(0, 40));
      });
      return { scrollW: max, clientW: document.documentElement.clientWidth, clipped: clipped.slice(0, 5) };
    });
    report.overflow.push({ page, w, ok: r.scrollW <= r.clientW, ...r });
    await ctx.close();
  }
}

// 2 · axe-core
if (axeSrc) {
  for (const [page, w] of [['index.html', 1440], ['index.html', 390], ['styleguide.html', 1440]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(base + page, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto'; for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    await p.addScriptTag({ content: axeSrc });
    const res = await p.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
      return { violations: r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes.slice(0, 3).map(n => n.target.join(' ')) })), passes: r.passes.length, incomplete: r.incomplete.length };
    });
    report.axe.push({ page, w, ...res });
    await ctx.close();
  }
} else report.axe.push({ skipped: 'axe-core not installed — run npm install' });

// 3 · Keyboard order (first 24 stops) + visible focus check
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(base, { waitUntil: 'networkidle' });
  const stops = [];
  for (let i = 0; i < 24; i++) {
    await p.keyboard.press('Tab');
    stops.push(await p.evaluate(() => {
      const el = document.activeElement;
      const cs = getComputedStyle(el);
      const label = (el.getAttribute('aria-label') || el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 36);
      const visible = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 || cs.boxShadow !== 'none';
      return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} "${label}" focusRing=${visible}`;
    }));
  }
  // Escape closes menus, arrow keys move between intent tabs
  await p.focus('#tab-need');
  await p.keyboard.press('ArrowRight');
  const arrow = await p.evaluate(() => ({ active: document.activeElement.id, selected: document.querySelector('#tab-earn').getAttribute('aria-selected'), earnHidden: document.querySelector('#panel-earn').hidden }));
  report.keyboard = { stops, intentArrowKeys: arrow };
  await ctx.close();
}

// 4 · Reduced motion
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const dots = [...document.querySelectorAll('.stage__lines .dot')].map(d => d.getAttribute('opacity'));
    const stamp = getComputedStyle(document.querySelector('.stamp')).opacity;
    const reveal = [...document.querySelectorAll('[data-reveal]')].length;
    const anims = document.getAnimations().filter(a => a.playState === 'running').length;
    return { dotsVisible: dots.filter(o => o !== '0').length, stampOpacity: stamp, revealTargets: reveal, runningAnimations: anims };
  });
  report.reducedMotion = r;
  await ctx.close();
}

// 5 · Performance (cold load, no cache, local server)
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  let bytes = 0; const reqs = [];
  cdp.on('Network.loadingFinished', e => { bytes += e.encodedDataLength; });
  p.on('request', r => reqs.push(r.url().replace(base, '')));
  await p.addInitScript(() => {
    window.__lcp = 0; window.__cls = 0;
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  await p.goto(base, { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  const m = await p.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0];
    return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(4), domNodes: document.getElementsByTagName('*').length };
  });
  report.perf.push({ viewport: `${w}x${h}`, transferKB: Math.round(bytes / 1024), requests: reqs.length, ...m });
  await ctx.close();
}

await browser.close();
mkdirSync('docs', { recursive: true });
writeFileSync('docs/qa-results.json', JSON.stringify(report, null, 2));
const fails = report.overflow.filter(o => !o.ok);
console.log(`Overflow: ${report.overflow.length - fails.length}/${report.overflow.length} widths clean` + (fails.length ? ' — FAIL: ' + fails.map(f => f.page + '@' + f.w).join(', ') : ''));
const clippedAny = report.overflow.filter(o => o.clipped.length);
console.log(`Clipped text: ${clippedAny.length ? JSON.stringify(clippedAny.map(c => [c.page, c.w, c.clipped])) : 'none'}`);
report.axe.forEach(a => console.log(a.skipped ? `axe: ${a.skipped}` : `axe ${a.page}@${a.w}: ${a.violations.length} violations, ${a.passes} passes${a.violations.length ? ' → ' + a.violations.map(v => `${v.id}(${v.impact},${v.nodes})`).join(' ') : ''}`));
console.log('Keyboard:', JSON.stringify(report.keyboard, null, 1));
console.log('Reduced motion:', JSON.stringify(report.reducedMotion));
report.perf.forEach(p => console.log('Perf:', JSON.stringify(p)));
console.log(`Console errors/warnings: ${report.console.length ? report.console.join('\n') : 'none'}`);
