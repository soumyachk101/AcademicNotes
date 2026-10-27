// Landing-page verification for index.html (agent tooling, gitignored).
// Loads file:// at 1440x900 and 390x844: console errors, failed resources,
// horizontal overflow, relative-link resolution. Screenshots to .agents/screenshots/.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');

const ROOT = '/Users/soumyachakraborty/Documents/05-Learning/Study Notes/Academic Study Notes';
const PAGE = path.join(ROOT, 'index.html');
const SHOT_DIR = path.join(ROOT, '.agents', 'screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, shot: path.join(SHOT_DIR, 'landing-desktop.png') },
  mobile: { width: 390, height: 844, shot: path.join(SHOT_DIR, 'landing-mobile.png') },
};

let failures = 0;

async function checkViewport(browser, name, vp) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('requestfailed', r => failedRequests.push(`${r.url()} :: ${r.failure() ? r.failure().errorText : 'failed'}`));
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

  await page.goto('file://' + PAGE, { waitUntil: 'load' });

  const brokenLinksDisk = [];
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth,
             overflow: doc.scrollWidth > doc.clientWidth + 1 };
  });

  const errors = consoleErrors.length ? consoleErrors : null;
  const failed = failedRequests.length ? failedRequests : null;

  // disk link check (in node, reliable)
  {
    const html = fs.readFileSync(PAGE, 'utf8');
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
    const unique = [...new Set(hrefs)];
    for (const h of unique) {
      if (h.startsWith('#') || h.startsWith('http') || h.startsWith('data:')) continue;
      if (!fs.existsSync(path.join(ROOT, h))) brokenLinksDisk.push(h);
    }
  }

  const problems = [];
  if (errors) problems.push(`console errors: ${JSON.stringify(errors)}`);
  if (failed) problems.push(`failed requests: ${JSON.stringify(failed)}`);
  if (overflow.overflow) problems.push(`horizontal overflow: scrollW ${overflow.scrollWidth} > clientW ${overflow.clientWidth}`);
  if (brokenLinksDisk.length) problems.push(`broken relative links: ${JSON.stringify(brokenLinksDisk)}`);

  await page.screenshot({ path: vp.shot, fullPage: false });

  console.log(`[${name}] ${problems.length ? 'FAIL' : 'OK'}  viewport=${vp.width}x${vp.height}`);
  problems.forEach(p => console.log(`    - ${p}`));
  if (problems.length) failures++;
  await ctx.close();
}

const browser = await pw.chromium.launch();
for (const [name, vp] of Object.entries(VIEWPORTS)) {
  await checkViewport(browser, name, vp);
}
await browser.close();

// Palette inventory: hex values in current index.html (must stay #14B3AD only)
const html = fs.readFileSync(PAGE, 'utf8');
const hexes = [...new Set([...html.matchAll(/#([0-9a-fA-F]{3,8})\b/g)].map(m => '#' + m[1].toUpperCase()))];
console.log(`[palette] hex tokens in index.html: ${JSON.stringify(hexes)}`);
if (hexes.some(h => h !== '#14B3AD')) {
  console.log('    - NEW COLOR HEX DETECTED (outside existing #14B3AD inventory)');
  failures++;
}

// Id uniqueness
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
console.log(`[ids] ${dupes.length ? 'DUPLICATES: ' + JSON.stringify(dupes) : 'unique (' + ids.length + ')'}`);
if (dupes.length) failures++;

console.log(failures ? `\nRESULT: FAIL (${failures} issue groups)` : '\nRESULT: ALL CLEAN');
process.exit(failures ? 1 : 0);
