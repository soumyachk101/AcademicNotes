// S5 wide-table mobile-overflow verification (agent tooling, gitignored).
// Loads os/dbms/compiler study notes at 390x844: scrollWidth <= 390, zero
// console errors, and spot-checks that one .table-scroll scrolls horizontally.
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');

const ROOT = '/Users/soumyachakraborty/Documents/05-Learning/Study Notes/Academic Study Notes';
const PAGES = [
  'Semester_5/os/os_study_notes.html',
  'Semester_5/dbms/dbms_study_notes.html',
  'Semester_5/compiler/compiler_study_notes.html',
];

const browser = await pw.chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });

for (const rel of PAGES) {
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

  await page.goto('file://' + path.join(ROOT, rel), { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    wrapped: document.querySelectorAll('.table-scroll').length,
  }));

  // Spot-check: scroll the widest .table-scroll to x=200 and confirm content moved
  const scroll = await page.evaluate(() => {
    const els = [...document.querySelectorAll('.table-scroll')];
    if (!els.length) return { testable: false };
    let target = els[0], max = 0;
    for (const el of els) {
      if (el.scrollWidth - el.clientWidth > max) { max = el.scrollWidth - el.clientWidth; target = el; }
    }
    if (max < 10) return { testable: false, reason: 'no wide table' };
    const table = target.querySelector('table');
    const before = table.getBoundingClientRect().left;
    target.scrollTo({ left: 200 });
    const after = table.getBoundingClientRect().left;
    return { testable: true, sl: target.scrollLeft, moved: after < before, delta: before - after };
  });

  const ok = metrics.scrollWidth <= metrics.clientWidth && consoleErrors.length === 0;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${rel}\n  scrollWidth=${metrics.scrollWidth} (limit ${metrics.clientWidth}) wrapped=${metrics.wrapped}\n  consoleErrors=${consoleErrors.length} ${consoleErrors.slice(0, 3).join(' | ')}\n  scroll-check: ${JSON.stringify(scroll)}`);
  await page.close();
}
await browser.close();
