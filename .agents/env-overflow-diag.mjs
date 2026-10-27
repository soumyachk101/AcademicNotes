import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm-global/lib/node_modules/playwright-core');
const ROOT = '/Users/soumyachakraborty/Documents/05-Learning/Study Notes/Academic Study Notes';
const EXE = '/Users/soumyachakraborty/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
(async () => {
  const browser = await pw.chromium.launch({ executablePath: EXE });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('file://' + ROOT + '/Semester_4/environment/Environmental_Sciences.html');
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  const info = await page.evaluate(() => {
    const host = document.querySelector('.folio-page');
    // elements whose text/content pushes scrollWidth of host: find children whose bounding box extends beyond host's content right edge
    const hostR = host.getBoundingClientRect();
    const hostCS = getComputedStyle(host);
    const hostRight = hostR.right; // include border
    const out = [];
    for (const el of host.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const sel = el.tagName.toLowerCase() + (el.id ? '#'+el.id : '') + (String(el.className).trim() ? '.' + String(el.className).trim().split(/\s+/)[0] : '');
      // text node overflow: element with white-space nowrap or non-wrappable long content
      const txt = el.textContent || '';
      const noWs = cs.whiteSpace === 'nowrap' || (cs.whiteSpace !== 'normal' && txt.length > 40);
      if (noWs && txt.trim().length > 30) {
        out.push({ kind: 'nowrap-text', sel, len: txt.trim().length, right: +r.right.toFixed(1), text: txt.trim().slice(0, 50) });
      }
      // position: elements with right > host's right edge
      if (r.right > hostRight + 0.5) out.push({ kind: 'beyond-host', sel, right: +r.right.toFixed(1), hostRight: +hostRight.toFixed(1), pos: cs.position });
    }
    // also check pre/code long lines via Range
    const out2 = [];
    const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const t = n.textContent.trim();
      if (t.length === 0) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      // get rects of lines; find any single word wider than container
      let words = t.split(/\s+/).filter(w => w.length > 25);
      for (const w of words) out2.push({ word: w, len: w.length });
      const rects = range.getClientRects();
      for (const rc of rects) {
        if (rc.right > hostRight + 0.5) out2.push({ kind: 'text-rect-beyond', right: +rc.right.toFixed(1), hostRight: +hostRight.toFixed(1), text: t.slice(0, 60), parent: n.parentElement.tagName.toLowerCase() });
      }
    }
    return { out, out2: out2.slice(0, 40) };
  });
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})();
