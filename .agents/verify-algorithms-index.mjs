import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm-global/lib/node_modules/playwright-core');

const ROOT = '/Users/soumyachakraborty/Documents/05-Learning/Study Notes/Academic Study Notes';
const SHOT_DIR = path.join(ROOT, '.agents/screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const PAGE = path.join(ROOT, 'Semester_4/algorithms/algorithms_index.html');

const browser = await pw.chromium.launch({
  executablePath: '/Users/soumyachakraborty/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'
});
const results = {};

async function run(viewport, key) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => failed.push(r.url() + ' ' + (r.failure()?.errorText || '')));
  await page.goto('file://' + PAGE, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const check = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const card = document.querySelector('.chapter-card');
    const cs = el => getComputedStyle(el);
    return {
      h1Font: h1 ? cs(h1).fontFamily : null,
      cardBg: card ? cs(card).backgroundColor : null,
      cardBorder: card ? cs(card).borderRadius : null,
      bodyBg: cs(document.body).backgroundColor,
      cardCount: document.querySelectorAll('.chapter-card').length
    };
  });
  results[key] = { ...check, consoleErrors: errors, failedResources: failed };
  if (key === 'desktop') {
    await page.screenshot({ path: path.join(SHOT_DIR, 'algorithms-index-desktop.png') });
  }
  await ctx.close();
}

await run({ width: 1440, height: 900 }, 'desktop');
await run({ width: 390, height: 844 }, 'mobile');
await browser.close();
console.log(JSON.stringify(results, null, 2));
