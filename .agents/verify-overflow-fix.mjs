import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm-global/lib/node_modules/playwright-core');
const ROOT = '/Users/soumyachakraborty/Documents/05-Learning/Study Notes/Academic Study Notes';
const EXE = '/Users/soumyachakraborty/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const PAGES = [
  'PPS/pps_index.html',
  'Semester_4/environment/Environmental_Sciences.html',
];
const VIEWPORTS = { mobile: { w: 390, h: 844 }, desktop: { w: 1440, h: 900 } };

(async () => {
  const browser = await pw.chromium.launch({ executablePath: EXE });
  let failures = 0;
  for (const rel of PAGES) {
    for (const [name, vp] of Object.entries(VIEWPORTS)) {
      const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto('file://' + ROOT + '/' + rel);
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.evaluate(() => document.fonts.ready).catch(() => {});
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      const extra = name === 'desktop'
        ? await page.evaluate(() => {
            // regression check: grids still lay out at desktop width
            const out = {};
            for (const sel of ['.chapters-grid', '.folio-page']) {
              const el = document.querySelector(sel);
              if (!el) { out[sel] = 'not-found'; continue; }
              const r = el.getBoundingClientRect();
              out[sel] = { w: Math.round(r.width), cols: getComputedStyle(el).gridTemplateColumns || null };
            }
            return out;
          })
        : null;
      const ok = sw <= vp.w;
      if (!ok) failures++;
      console.log(`${ok ? 'PASS' : 'FAIL'} ${rel} @${vp.w}px scrollWidth=${sw} consoleErrors=${errors.length}${errors.length ? ' -> ' + errors.join(' | ') : ''}${extra ? ' ' + JSON.stringify(extra) : ''}`);
      await page.close();
    }
  }
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
