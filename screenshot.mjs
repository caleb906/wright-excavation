import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'temporary screenshots');

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const isMobile = process.argv.includes('--mobile');
const width = isMobile ? 390 : 1440;

// Find next available number
const existing = fs.readdirSync(screenshotDir).filter(f => f.startsWith('screenshot-'));
let maxNum = 0;
for (const f of existing) {
  const match = f.match(/^screenshot-(\d+)/);
  if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
}
const num = maxNum + 1;
const filename = label ? `screenshot-${num}-${label}.png` : `screenshot-${num}.png`;
const outputPath = path.join(screenshotDir, filename);

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Hide dev-toolbar overlay so it doesn't obscure footer in screenshots
  await page.addStyleTag({ content: '#hm-dev-toolbar, #hm-toggle { display: none !important; }' });

  // Scroll through the page to trigger IntersectionObserver reveals
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = 300;
      const total = document.body.scrollHeight;
      const timer = setInterval(() => {
        window.scrollTo(0, y);
        y += step;
        if (y >= total) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          setTimeout(resolve, 400);
        }
      }, 80);
    });
  });

  // Get full page height
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width, height: bodyHeight });
  await new Promise(r => setTimeout(r, 300));

  await page.screenshot({ path: outputPath, fullPage: true });
  console.log(`Screenshot saved: ${outputPath}`);
  await browser.close();
})();
