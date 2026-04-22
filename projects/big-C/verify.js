

const { chromium } = require('playwright');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const PORT = 8765;
const ROOT = __dirname;

const mime = {
  '.html':'text/html','.js':'text/javascript','.css':'text/css',
  '.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png',
  '.glb':'model/gltf-binary','.svg':'image/svg+xml','.json':'application/json',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end(urlPath); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {'Content-Type': mime[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin':'*'});
    res.end(data);
  });
});

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  console.log(`server: http://localhost:${PORT}/`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader'],   
  });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();

  page.on('pageerror', (e) => console.log('[err]', e.message));

  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });

  try {
    await page.waitForFunction(() => window.__bigC_modelLoaded === true, { timeout: 20000 });
    console.log('model loaded.');
  } catch {
    console.log('model load timeout; state:', await page.evaluate(() => window.__bigC_modelLoaded));
  }

  await page.waitForTimeout(1000);

await page.evaluate(() => {
    if (window.__bigC_renderOnce) window.__bigC_renderOnce();
    window.__bigC_paused = true;
  });
  await page.waitForTimeout(200);

  const outPath = path.join(ROOT, 'verify_screenshot.png');
  await page.screenshot({ path: outPath, fullPage: false, animations: 'disabled', timeout: 20000 });
  console.log(`screenshot saved → ${outPath}`);

  const diag = await page.evaluate(() => ({
    title:        document.title,
    skyBandRect:  document.querySelector('.sky-band')?.getBoundingClientRect(),
    canvasRect:   document.querySelector('#canvas-container canvas')?.getBoundingClientRect(),
    clickerRect:  document.querySelector('#scroll-clicker')?.getBoundingClientRect(),
    modelLoaded:  window.__bigC_modelLoaded,
    modelBBox:    window.__bigC_bbox,
    pivotRotY:    window.__bigC_pivotInfo?.rotation?.y,
    bgMarqueeLines: document.querySelectorAll('#bg-marquee-content span').length,
  }));
  console.log('diagnostic:', JSON.stringify(diag, null, 2));

  await browser.close();
  server.close();
  server.closeAllConnections?.();
  console.log('done.');
  process.exit(0);
})();
