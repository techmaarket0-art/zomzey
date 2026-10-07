// Interaction captures: mobile menu, brief bottom sheet, dock, earn intent, desktop tools menu, index selection, focus ring.
import { createRequire } from 'module';
import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
const out = process.argv[2] || 'screenshots/interactions';
const base = process.argv[3] || process.env.BASE_URL || 'http://localhost:4310/';
mkdirSync(out, { recursive: true });
const b = await pw.chromium.launch();
const errors = [];

// ---- mobile ----
const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const p = await m.newPage();
p.on('pageerror', e => errors.push(e.message));
await p.goto(base); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
await p.click('[data-menu-open]'); await p.waitForTimeout(450);
await p.screenshot({ path: `${out}/mobile-menu.png` });
await p.click('.sheet__close'); await p.waitForTimeout(200);
// earn intent
await p.click('#tab-earn'); await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/mobile-intent-earn.png` });
// dock while scrolling the board
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#opportunities').scrollIntoView(); window.scrollBy(0, 260); });
await p.waitForTimeout(700);
await p.screenshot({ path: `${out}/mobile-board-dock.png` });
// brief bottom sheet
await p.click('.board__item--feature [data-open-brief]'); await p.waitForTimeout(500);
await p.screenshot({ path: `${out}/mobile-brief-sheet.png` });
await p.keyboard.press('Escape'); await p.waitForTimeout(200);
// record chips mid-section
await p.evaluate(() => { document.querySelector('#protected').scrollIntoView(); window.scrollBy(0, -40); });
await p.waitForTimeout(800);
await p.screenshot({ path: `${out}/mobile-record-protected.png` });
// index choose music
await p.evaluate(() => { document.querySelector('#network').scrollIntoView(); window.scrollBy(0, 300); });
await p.click('[data-pio="music"]'); await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/mobile-index-music.png` });
await m.close();

// ---- desktop ----
const d = await b.newContext({ viewport: { width: 1440, height: 900 } });
const q = await d.newPage();
q.on('pageerror', e => errors.push(e.message));
await q.goto(base); await q.evaluate(() => document.fonts.ready); await q.waitForTimeout(500);
await q.click('[data-tools-toggle]'); await q.waitForTimeout(300);
await q.screenshot({ path: `${out}/desktop-tools-menu.png`, clip: { x: 0, y: 0, width: 1440, height: 520 } });
await q.keyboard.press('Escape');
// hover headline row "Pitch."
await q.hover('.hero__row[data-zone="pitch"] .hero__word'); await q.waitForTimeout(700);
await q.screenshot({ path: `${out}/desktop-hero-pitch-focus.png` });
await q.mouse.move(5, 890); await q.waitForTimeout(400);
// keyboard focus ring on intent tabs
await q.keyboard.press('Tab'); await q.keyboard.press('Tab'); 
for (let i = 0; i < 7; i++) await q.keyboard.press('Tab');
await q.waitForTimeout(200);
const focused = await q.evaluate(() => document.activeElement.outerHTML.slice(0, 120));
await q.screenshot({ path: `${out}/desktop-focus.png`, clip: { x: 0, y: 560, width: 760, height: 340 } });
// earn intent desktop
await q.click('#tab-earn'); await q.waitForTimeout(300);
await q.screenshot({ path: `${out}/desktop-intent-earn.png` });
// index select music
await q.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('.index__map').scrollIntoView({ block: 'center' }); });
await q.click('[data-pio="music"]'); await q.waitForTimeout(900);
await q.screenshot({ path: `${out}/desktop-index-music.png` });
// board filter + drawer
await q.evaluate(() => document.querySelector('#opportunities').scrollIntoView());
await q.click('[data-filter="books"]'); await q.waitForTimeout(500);
await q.screenshot({ path: `${out}/desktop-board-filter-books.png` });
await q.click('[data-filter="all"]'); await q.waitForTimeout(300);
await q.click('.board__item--feature [data-open-brief]'); await q.waitForTimeout(500);
await q.screenshot({ path: `${out}/desktop-brief-drawer.png` });
await d.close();
await b.close();
console.log(JSON.stringify({ errors, focused }));
