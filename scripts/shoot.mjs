// Usage: node scripts/shoot.mjs <outdir> [widths...] [--full] [--page=index.html] [--reduce]
import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
const { chromium } = pw;
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join, resolve } from 'path';
import { mkdirSync } from 'fs';

const args = process.argv.slice(2);
const out = resolve(args[0] || 'screenshots/tmp');
const flags = args.filter(a => a.startsWith('--'));
const widths = args.slice(1).filter(a => !a.startsWith('--')).map(Number);
const full = flags.includes('--full');
const reduce = flags.includes('--reduce');
const page = (flags.find(f => f.startsWith('--page=')) || '--page=index.html').split('=')[1];
const heights = { 390: 844, 768: 1024, 1024: 768, 1280: 800, 1440: 900, 1920: 1080 };
mkdirSync(out, { recursive: true });

const rootDir = resolve('.');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(req.url.split('?')[0]);
    const f = join(rootDir, p === '/' ? 'index.html' : p);
    const b = await readFile(f);
    res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' });
    res.end(b);
  } catch { res.writeHead(404); res.end('nf'); }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch();
for (const w of (widths.length ? widths : [1440])) {
  const h = heights[w] || 900;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w <= 430 ? 3 : 1, reducedMotion: reduce ? 'reduce' : 'no-preference', hasTouch: w <= 430, isMobile: w <= 430 });
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  pg.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await pg.goto(`http://localhost:${port}/${page}`, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(600);
  const overflow = await pg.evaluate(() => {
    const dw = document.documentElement.clientWidth;
    const offenders = [];
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && (r.right > dw + 1 || r.left < -1)) {
        // ignore elements inside intentional scroll rails / clipped containers
        let p = el.parentElement, clipped = false;
        while (p && p !== document.body) {
          const cs = getComputedStyle(p);
          if (/(auto|scroll|hidden|clip)/.test(cs.overflowX)) { clipped = true; break; }
          p = p.parentElement;
        }
        if (!clipped) offenders.push(el.tagName.toLowerCase() + '.' + [...el.classList].join('.') + ` [${Math.round(r.left)},${Math.round(r.right)}]`);
      }
    });
    return { scrollW: document.documentElement.scrollWidth, clientW: dw, offenders: offenders.slice(0, 15) };
  });
  const name = `${page.replace('.html','')}-${w}${full ? '-full' : ''}${reduce ? '-reduced' : ''}`;
  if (full) {
    // trigger lazy reveals
    await pg.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto'; for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 90)); } window.scrollTo({ top: 0, behavior: 'instant' }); });
    await pg.waitForTimeout(700);
    await pg.addStyleTag({ content: '[data-dock]{display:none!important}' });
  }
  await pg.screenshot({ path: join(out, name + '.png'), fullPage: full });
  console.log(JSON.stringify({ w, name, overflow, errors }));
  await ctx.close();
}
await browser.close();
server.close();
