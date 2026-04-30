import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO = 'https://cdn.prod.website-files.com/689d83f5d16d2f6bbd9b510a/699504ed2529fa33566c3560_2.png';

const faviconHTML = (size) => `<!DOCTYPE html><html><head><style>
html,body{margin:0;padding:0;width:${size}px;height:${size}px;background:#0A0A0C;display:flex;align-items:center;justify-content:center}
img{width:${Math.floor(size*0.78)}px;height:${Math.floor(size*0.78)}px;object-fit:contain;filter:drop-shadow(0 0 0 #D4A017)}
.frame{width:100%;height:100%;background:linear-gradient(135deg,#0A0A0C 0%,#18181B 100%);display:flex;align-items:center;justify-content:center;border-radius:${Math.floor(size*0.18)}px}
</style></head><body><div class="frame"><img src="${LOGO}"></div></body></html>`;

const ogHTML = `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;font-family:'DM Sans',sans-serif;background:#0A0A0C;color:#FAFAFA;overflow:hidden}
.bg{position:absolute;inset:0;background:
  radial-gradient(circle at 85% 20%, rgba(212,160,23,0.22) 0%, transparent 45%),
  radial-gradient(circle at 10% 90%, rgba(26,74,46,0.18) 0%, transparent 50%),
  linear-gradient(135deg,#0A0A0C 0%,#111113 100%);
}
.grain{position:absolute;inset:0;opacity:0.04;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.frame{position:absolute;inset:32px;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;align-items:center;gap:20px}
.logo{width:96px;height:96px;object-fit:contain}
.brand-text{display:flex;flex-direction:column;gap:4px}
.brand-name{font-family:'Anton',sans-serif;font-size:34px;letter-spacing:0.06em;line-height:1}
.brand-loc{font-size:13px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#D4A017}
.headline{font-family:'Anton',sans-serif;font-size:88px;line-height:0.96;letter-spacing:0.02em;max-width:1000px}
.headline em{font-style:normal;color:#D4A017}
.bottom{display:flex;align-items:flex-end;justify-content:space-between;gap:32px}
.tagline{font-size:22px;color:rgba(255,255,255,0.72);max-width:680px;line-height:1.5}
.url-pill{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;background:#D4A017;color:#0A0A0C;font-weight:700;font-size:18px;border-radius:100px;letter-spacing:0.02em;white-space:nowrap}
.dot{width:8px;height:8px;border-radius:50%;background:#0A0A0C}
.gold-bar{position:absolute;top:32px;left:25%;right:25%;height:1px;background:linear-gradient(90deg,transparent,rgba(212,160,23,0.5),transparent)}
</style></head><body>
<div class="bg"></div>
<div class="grain"></div>
<div class="frame">
  <div class="gold-bar"></div>
  <div class="top">
    <img class="logo" src="${LOGO}">
    <div class="brand-text">
      <div class="brand-name">Wright Excavation</div>
      <div class="brand-loc">Bend, Oregon</div>
    </div>
  </div>
  <div class="headline">Excavation That Keeps Your <em>Schedule Intact</em></div>
  <div class="bottom">
    <div class="tagline">Site prep, grading, foundation excavation, trenching, and land clearing for builders across Central Oregon.</div>
    <div class="url-pill"><span class="dot"></span>wrightexcavationusa.com</div>
  </div>
</div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  // Favicons
  for (const size of [32, 180, 512]) {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.setContent(faviconHTML(size), { waitUntil: 'networkidle0' });
    const out = size === 32 ? 'favicon-32.png' : size === 180 ? 'apple-touch-icon.png' : 'icon-512.png';
    await page.screenshot({ path: out, omitBackground: false });
    console.log('wrote', out);
    await page.close();
  }

  // OG image
  const og = await browser.newPage();
  await og.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await og.setContent(ogHTML, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await og.screenshot({ path: 'og-image.png' });
  console.log('wrote og-image.png');
  await browser.close();
})();
