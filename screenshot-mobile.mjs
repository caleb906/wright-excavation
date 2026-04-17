import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || 'mobile';
const existing = fs.readdirSync(screenshotDir).filter(f => f.startsWith('screenshot-'));
let maxNum = 0;
for (const f of existing) { const m = f.match(/^screenshot-(\d+)/); if (m) maxNum = Math.max(maxNum, parseInt(m[1])); }
const num = maxNum + 1;
const outputPath = path.join(screenshotDir, `screenshot-${num}-${label}.png`);
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = 200;
      const total = document.body.scrollHeight;
      const t = setInterval(() => {
        window.scrollTo(0, y); y += step;
        if (y >= total) { clearInterval(t); window.scrollTo(0, 0); setTimeout(resolve, 300); }
      }, 60);
    });
  });
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 390, height: bodyHeight, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: outputPath, fullPage: true });
  console.log(`Saved: ${outputPath}`);
  await browser.close();
})();
