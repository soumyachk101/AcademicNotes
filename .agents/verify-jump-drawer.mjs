// Verify .jump-drawer overflow fix in Semester_4/architecture/pipelining.html.
// Loads file:// at 1440x900: checks scrollWidth == clientWidth, drawer open/close, console errors.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm-global/lib/node_modules/playwright-core');

const ROOT = '/Users/soumyachakraborty/Documents/05-Learning/Study Notes/Academic Study Notes';
const PAGE = 'file://' + ROOT + '/Semester_4/architecture/pipelining.html';

const browser = await pw.chromium.launch({
  executablePath: '/Users/soumyachakraborty/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

await page.goto(PAGE, { waitUntil: 'load' });
await page.waitForTimeout(800); // let notes.js inject the drawer

const metrics = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  bodyScrollWidth: document.body.scrollWidth,
}));

// Drawer element state (closed)
const closed = await page.evaluate(() => {
  const d = document.querySelector('.jump-drawer');
  if (!d) return { exists: false };
  const cs = getComputedStyle(d);
  const r = d.getBoundingClientRect();
  return {
    exists: true,
    transform: cs.transform,
    visibility: cs.visibility,
    rectLeft: r.left,
    rectRight: r.right,
    viewport: window.innerWidth,
  };
});

// Click toggle to open
await page.click('.drawer-toggle');
await page.waitForTimeout(400);
const open = await page.evaluate(() => {
  const d = document.querySelector('.jump-drawer');
  const cs = getComputedStyle(d);
  const r = d.getBoundingClientRect();
  return {
    hasOpenClass: d.classList.contains('open'),
    transform: cs.transform,
    visibility: cs.visibility,
    rectLeft: r.left,
    rectRight: r.right,
    viewport: window.innerWidth,
  };
});

// Close again (outside click) to confirm close path
await page.mouse.click(200, 400);
await page.waitForTimeout(400);
const reopened = await page.evaluate(() => {
  const d = document.querySelector('.jump-drawer');
  return { hasOpenClass: d.classList.contains('open') };
});

console.log(JSON.stringify({ metrics, closed, open, reopened, consoleErrors }, null, 2));

const overflowOK = metrics.scrollWidth <= metrics.clientWidth;
const openOK = open.hasOpenClass && open.rectRight <= open.viewport && open.visibility === 'visible';
const closeOK = reopened.hasOpenClass === false;
console.log(`\nOVERFLOW: ${overflowOK ? 'PASS' : 'FAIL'} (scrollWidth ${metrics.scrollWidth} vs clientWidth ${metrics.clientWidth})`);
console.log(`OPEN: ${openOK ? 'PASS' : 'FAIL'} — ${openOK ? 'drawer opens and is visible in-viewport' : JSON.stringify(open)}`);
console.log(`CLOSE: ${closeOK ? 'PASS' : 'FAIL'} — outside click closes drawer`);
console.log(`CONSOLE: ${consoleErrors.length === 0 ? 'PASS (zero errors)' : 'FAIL: ' + consoleErrors.join(' | ')}`);

await browser.close();
