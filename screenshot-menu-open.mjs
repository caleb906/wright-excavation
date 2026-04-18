import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || 'menu-open';
const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-'));
let max = 0; for (const f of existing) { const m = f.match(/^screenshot-(\d+)/); if (m) max = Math.max(max, +m[1]); }
const out = path.join(dir, `screenshot-${max+1}-${label}.png`);
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  // Open the menu via JS (not real click)
  await page.evaluate(() => {
    if (typeof openMenu === 'function') openMenu();
  });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: out, fullPage: false });
  console.log('Saved ' + out);
  await browser.close();
})();
