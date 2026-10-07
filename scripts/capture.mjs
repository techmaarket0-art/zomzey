// Final presentation captures → screenshots/
// Usage: npm run capture   (expects `npm run dev`; override with BASE_URL)
import { createRequire } from 'module';
import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
const base = process.env.BASE_URL || 'http://localhost:4310/';
const out = 'screenshots';
for (const d of [out, `${out}/responsive`, `${out}/sections`, `${out}/interactions`]) mkdirSync(d, { recursive: true });
const b = await pw.chromium.launch();

async function open(w, h, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: opts.dsf || 1, isMobile: !!opts.mobile, hasTouch: !!opts.mobile, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  await p.goto(base + (opts.page || ''), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(opts.wait ?? 900);
  return { ctx, p };
}
async function revealAll(p) {
  await p.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 70)); }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await p.waitForTimeout(900);
}
const hideDock = (p) => p.addStyleTag({ content: '[data-dock]{display:none!important}' });

// Desktop 1440
{
  const { ctx, p } = await open(1440, 900);
  await p.screenshot({ path: `${out}/desktop-1440-first-viewport.png` });
  await revealAll(p);
  await p.screenshot({ path: `${out}/desktop-1440-full.png`, fullPage: true });
  await p.addStyleTag({ content: '.site-header{position:static!important}' });
  for (const [sel, name] of [['#how', 'deal-record'], ['#network', 'network-index'], ['#opportunities', 'live-board'], ['#join', 'two-ways-in'], ['.finale', 'finale']]) {
    await p.locator(sel).screenshot({ path: `${out}/sections/desktop-${name}.png` });
  }
  await ctx.close();
}
// Mobile 390
{
  const { ctx, p } = await open(390, 844, { dsf: 3, mobile: true });
  await p.screenshot({ path: `${out}/mobile-390-first-viewport.png` });
  await ctx.close();
  const m = await open(390, 844, { dsf: 2, mobile: true });
  await revealAll(m.p); await hideDock(m.p);
  await m.p.screenshot({ path: `${out}/mobile-390-full.png`, fullPage: true });
  await m.ctx.close();
}
// Responsive first viewports
for (const [w, h] of [[768, 1024], [1024, 768], [1280, 800], [1920, 1080], [2560, 1440]]) {
  const { ctx, p } = await open(w, h);
  await p.screenshot({ path: `${out}/responsive/home-${w}x${h}.png` });
  await ctx.close();
}
{
  const { ctx, p } = await open(768, 1024);
  await revealAll(p); await hideDock(p);
  await p.screenshot({ path: `${out}/responsive/home-768-full.png`, fullPage: true });
  await ctx.close();
}
// Reduced motion
{
  const { ctx, p } = await open(1440, 900, { reduce: true });
  await p.screenshot({ path: `${out}/responsive/home-1440-reduced-motion.png` });
  await ctx.close();
}
// Style guide
{
  const { ctx, p } = await open(1440, 900, { page: 'styleguide.html' });
  await p.screenshot({ path: `${out}/styleguide-1440-full.png`, fullPage: true });
  await ctx.close();
  const m = await open(390, 844, { page: 'styleguide.html', dsf: 2, mobile: true });
  await m.p.screenshot({ path: `${out}/responsive/styleguide-390-full.png`, fullPage: true });
  await m.ctx.close();
}
// Interactions — mobile
{
  const { ctx, p } = await open(390, 844, { dsf: 3, mobile: true });
  const shot = (n) => p.screenshot({ path: `${out}/interactions/${n}.png` });
  await p.click('[data-menu-open]'); await p.waitForTimeout(450); await shot('mobile-menu-sheet');
  await p.click('.sheet--menu .sheet__close'); await p.waitForTimeout(250);
  await p.click('#tab-earn'); await p.waitForTimeout(300); await shot('mobile-intent-earn');
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#hero-title').scrollIntoView(); window.scrollBy(0, 560); });
  await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelector('.stage').scrollTo({ left: 310 })); await p.waitForTimeout(400); await shot('mobile-live-rail');
  await p.click('#tab-need');
  await p.evaluate(() => { document.querySelector('#pitched').scrollIntoView(); window.scrollBy(0, 160); }); await p.waitForTimeout(900); await shot('mobile-record-offers');
  await p.evaluate(() => { document.querySelector('#protected').scrollIntoView(); window.scrollBy(0, 330); }); await p.waitForTimeout(900); await shot('mobile-record-protected');
  await p.evaluate(() => { document.querySelector('#network').scrollIntoView(); window.scrollBy(0, 330); }); await p.waitForTimeout(300);
  await p.click('[data-pio="music"]'); await p.waitForTimeout(500); await shot('mobile-index-music');
  await p.evaluate(() => { document.querySelector('#opportunities').scrollIntoView(); window.scrollBy(0, 300); }); await p.waitForTimeout(700); await shot('mobile-board-dock');
  await p.click('.board__item--feature [data-open-brief]'); await p.waitForTimeout(600); await shot('mobile-brief-bottom-sheet');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  await p.evaluate(() => { document.querySelector('#join').scrollIntoView(); window.scrollBy(0, 120); }); await p.waitForTimeout(500);
  await p.click('[data-intent-toggle="earn"]'); await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelector('#door-earn').scrollIntoView(); window.scrollBy(0, -80); }); await p.waitForTimeout(400); await shot('mobile-door-earn');
  await ctx.close();
}
// Interactions — desktop
{
  const { ctx, p } = await open(1440, 900);
  const shot = (n, clip) => p.screenshot({ path: `${out}/interactions/${n}.png`, clip });
  await p.hover('.hero__row[data-zone="pitch"] .hero__word'); await p.waitForTimeout(800); await shot('desktop-hero-hover-pitch');
  await p.hover('.hero__row[data-zone="paid"] .hero__word'); await p.waitForTimeout(800); await shot('desktop-hero-hover-paid');
  await p.mouse.move(700, 880); await p.waitForTimeout(500);
  await p.click('[data-tools-toggle]'); await p.waitForTimeout(350); await shot('desktop-tools-menu', { x: 0, y: 0, width: 1440, height: 560 });
  await p.keyboard.press('Escape');
  await p.click('#tab-earn'); await p.waitForTimeout(350); await shot('desktop-intent-earn');
  await p.click('#tab-need'); await p.mouse.move(700, 880);
  await p.keyboard.press('Tab'); await p.waitForTimeout(150);
  await p.focus('[data-builder="need"] button[type="submit"]'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await p.waitForTimeout(200);
  await shot('desktop-keyboard-focus', { x: 0, y: 560, width: 760, height: 340 });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('.index__map').scrollIntoView({ block: 'center' }); });
  await p.click('[data-pio="food"]'); await p.waitForTimeout(1000); await shot('desktop-index-food');
  await p.evaluate(() => { document.querySelector('#opportunities').scrollIntoView(); window.scrollBy(0, -10); });
  await p.click('[data-filter="music"]'); await p.waitForTimeout(600); await shot('desktop-board-filter-music');
  await p.click('[data-filter="all"]'); await p.waitForTimeout(400);
  await p.click('.board__item--feature [data-open-brief]'); await p.waitForTimeout(600); await shot('desktop-brief-drawer');
  await p.keyboard.press('Escape');
  await p.evaluate(() => document.querySelector('#join').scrollIntoView()); await p.waitForTimeout(300);
  await p.fill('[data-starter-what]', 'A debut crime novel'); await p.locator('[data-calc-range]').fill('62'); await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelector('.doors__pair').scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(500);
  await shot('desktop-doors-tools');
  await ctx.close();
}
await b.close();
console.log('captured');
