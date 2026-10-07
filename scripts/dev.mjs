// Zero-dependency static dev server for the ZOMZEY homepage concept.
// Usage: npm run dev            → http://localhost:4310 (or the next free port)
//        PORT=8080 npm run dev  → force a specific starting port
import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { extname, join, normalize, resolve } from 'path';

const root = resolve('.');
const startPort = Number(process.env.PORT) || 4310;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = normalize(join(root, p));
    if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
  }
});

// If the port is taken (e.g. by another project's dev server), try the next one.
function listen(port, triesLeft = 20) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && triesLeft > 0) {
      console.log(`  Port ${port} is busy — trying ${port + 1}…`);
      listen(port + 1, triesLeft - 1);
    } else { throw err; }
  });
  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\n  ZOMZEY dev server\n  → Homepage:    ${url}/\n  → Style guide: ${url}/styleguide.html\n  → Board:       ${url}/board.html\n`);
  });
}
listen(startPort);
