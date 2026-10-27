import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm-global/lib/node_modules/playwright-core');
const ROOT = '/Users/soumyachakraborty/Documents/05-Learning/Study Notes/Academic Study Notes';

(async () => {
  const browser = await pw.chromium.launch({
    executablePath: '/Users/soumyachakraborty/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text()); });
  await page.goto('file://' + ROOT + '/PPS/pps_index.html');
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log('scrollWidth at 390:', sw);
  if (sw > 390) {
    const offenders = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.right > 390.5 || r.left < -0.5) {
          const cs = getComputedStyle(el);
          out.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || undefined,
            cls: (el.className || '').toString().slice(0, 80),
            left: +r.left.toFixed(2), right: +r.right.toFixed(2),
            borderL: cs.borderLeftWidth, borderR: cs.borderRightWidth,
            ml: cs.marginLeft, mr: cs.marginRight, bw: cs.boxSizing
          });
        }
      }
      // keep the leaf-most offenders only (drop ancestors of listed offenders)
      return out;
    });
    console.log(JSON.stringify(offenders, null, 1));
  }
  await browser.close();
})();
