

const { chromium } = require('playwright');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const PORT = 8767;
const ROOT = __dirname;

const mime = {
  '.html':'text/html','.js':'text/javascript','.css':'text/css',
  '.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end(urlPath); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      
      'Accept-Ranges': 'bytes',
    });
    res.end(data);
  });
});

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  console.log(`server: http://localhost:${PORT}/`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--autoplay-policy=no-user-gesture-required'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  page.on('console',   (m) => console.log(`[page ${m.type()}]`, m.text()));
  page.on('pageerror', (e) => console.log('[err]', e.message));

  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });

try {
    await page.waitForFunction(
      () => document.getElementById('canvas').classList.contains('ready'),
      { timeout: 10000 }
    );
    console.log('canvas marked ready — video is playing.');
  } catch {
    console.log('canvas did not become ready in time.');
  }

const diag = await page.evaluate(() => {
    const v = document.getElementById('source');
    const c = document.getElementById('canvas');
    const e = document.getElementById('error');
    return {
      videoReadyState: v?.readyState,       
      videoDuration:   v?.duration,
      videoPaused:     v?.paused,
      videoCurrentTime:v?.currentTime,
      canvasReady:     c?.classList.contains('ready'),
      canvasSize:      { w: c?.width, h: c?.height },
      errorShown:      e?.classList.contains('show'),
    };
  });
  console.log('diagnostic:', JSON.stringify(diag, null, 2));

await page.waitForTimeout(1000);

  const outPath = path.join(ROOT, 'verify_screenshot.png');
  await page.screenshot({ path: outPath, fullPage: false, animations: 'disabled', timeout: 15000 });
  console.log(`screenshot saved → ${outPath}`);

  await browser.close();
  server.close();
  server.closeAllConnections?.();
  process.exit(0);
})();
