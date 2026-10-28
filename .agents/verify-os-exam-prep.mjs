// S5 OS exam-prep page verification (agent tooling, gitignored).
// Loads os_exam_prep.html at 1440x900 and 390x844: zero console errors, no
// horizontal overflow, all relative links resolve. Screenshots desktop.
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');

const ROOT = '/Users/soumyachakraborty/Documents/05-Learning/Study Notes/Academic Study Notes';
const PAGE = 'Semester_5/os/os_exam_prep.html';
const VIEWS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await pw.chromium.launch();
for (const v of VIEWS) {
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

  await page.goto('file://' + path.join(ROOT, PAGE), { waitUntil: 'load' });
  await page.waitForTimeout(400);

  // Relative links must resolve on disk
  const pageDir = path.dirname(path.join(ROOT, PAGE));
  const hrefs = await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href')));
  const fs = require('node:fs');
  const badLinks = hrefs.filter(h => h && !/^https?:|^#|^mailto:/i.test(h) && !fs.existsSync(path.resolve(pageDir, h.split('#')[0])));

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    qaCards: document.querySelectorAll('.qa-card').length,
    modules: document.querySelectorAll('.module-section').length,
    examNotes: document.querySelectorAll('.exam-note').length,
  }));

  if (v.name === 'desktop') {
    await page.screenshot({ path: path.join(ROOT, '.agents/screenshots/os-exam-prep-desktop.png'), fullPage: false });
  }

  const overflow = metrics.scrollWidth > metrics.clientWidth;
  const ok = !overflow && consoleErrors.length === 0 && badLinks.length === 0;
  console.log(`${ok ? 'PASS' : 'FAIL'} [${v.name} ${v.width}x${v.height}] ${PAGE}`);
  console.log(`  overflow: scrollW=${metrics.scrollWidth} clientW=${metrics.clientWidth} ${overflow ? '(OVERFLOW)' : '(ok)'}`);
  console.log(`  consoleErrors: ${consoleErrors.length} ${consoleErrors.slice(0, 3).join(' | ')}`);
  console.log(`  badLinks: ${badLinks.length} ${badLinks.slice(0, 5).join(' | ')}`);
  console.log(`  qaCards=${metrics.qaCards} modules=${metrics.modules} examNotes=${metrics.examNotes}`);
  await ctx.close();
}
await browser.close();
