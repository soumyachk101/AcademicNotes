// Verify widened OS pages: side gaps at 1920px, no overflow at 390px, zero console errors.
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');

const ROOT = '/Users/soumyachakraborty/Documents/05-Learning/Study Notes/Academic Study Notes';
const PAGES = [
  { name: 'os_exam_prep', file: 'Semester_5/os/os_exam_prep.html', sel: '.layout' },
  { name: 'os_index', file: 'Semester_5/os/os_index.html', sel: 'main.sheet, .sheet' },
  { name: 'os_study_notes', file: 'Semester_5/os/os_study_notes.html', sel: '.sheet' },
  { name: 'os_important_qa', file: 'Semester_5/os/os_important_qa.html', sel: '.layout' },
];

const browser = await pw.chromium.launch();
for (const p of PAGES) {
  for (const [w, h, tag] of [[1920, 1080, 'wide'], [390, 844, 'mobile']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    await page.goto('file://' + path.join(ROOT, p.file), { waitUntil: 'load' });
    await page.waitForTimeout(400);

    const m = await page.evaluate(({ sel }) => {
      const els = [...document.querySelectorAll(sel)];
      const el = els.find(e => e.offsetWidth > 0) || els[0];
      const vw = window.innerWidth;
      const leftGap = (vw - el.offsetWidth) / 2;
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        elWidth: el ? el.offsetWidth : null,
        leftGap: el ? (vw - el.offsetWidth) / 2 : null,
      };
    }, { sel: p.sel });

    let extra = '';
    if (tag === 'wide') {
      await page.screenshot({ path: path.join(ROOT, `.agents/screenshots/os-wide-${p.name}.png`), fullPage: false });
      extra = ` elW=${m.elWidth} leftGap=${m.leftGap.toFixed(0)}px`;
      console.log(`${m.leftGap <= 120 && m.scrollWidth <= m.clientWidth ? 'PASS' : 'FAIL'} [${p.name} 1920px] gap=${m.leftGap.toFixed(0)}px${extra} overflow=${m.scrollWidth > m.clientWidth} consoleErr=${errors.length}`);
    } else {
      console.log(`${m.scrollWidth <= m.clientWidth ? 'PASS' : 'FAIL'} [${p.name} 390px] scrollW=${m.scrollWidth} clientW=${m.clientWidth} consoleErr=${errors.length}`);
    }
    await ctx.close();
  }
}
await browser.close();
