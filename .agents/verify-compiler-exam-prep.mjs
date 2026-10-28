import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const b = await pw.chromium.launch();
for (const [w, h, label] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const pg = await b.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)); });
  await pg.goto('file://' + process.cwd() + '/Semester_5/compiler/compiler_exam_prep.html', { waitUntil: 'load' });
  const m = await pg.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
    mods: [...document.querySelectorAll('.module-section')].map(s => s.id),
    cards: [...document.querySelectorAll('.qa-card')].map(c => c.id),
    rail: !!document.querySelector('.exam-rail') && getComputedStyle(document.querySelector('.exam-rail')).display !== 'none',
    chips: !!document.querySelector('.exam-chips') && getComputedStyle(document.querySelector('.exam-chips')).display !== 'none',
  }));
  const bad = await pg.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].filter(a => {
    const id = a.getAttribute('href').slice(1);
    return id && !document.getElementById(id);
  }).map(a => a.href));
  const target = await pg.evaluate(() => { document.querySelector('a[href="#module-1"]')?.click(); return location.hash; });
  await pg.screenshot({ path: label === 'desktop' ? '.agents/screenshots/compiler-exam-prep-desktop.png' : '.agents/screenshots/compiler-exam-prep-mobile.png', fullPage: label === 'mobile' });
  console.log(label, JSON.stringify(m), '| overflow:', m.sw > m.cw ? m.sw - m.cw + 'px' : 'none', '| bad anchors:', bad.length ? bad.slice(0, 5) : 'none', '| hash nav:', target, '| console:', errs.length ? errs.slice(0, 3) : 'none');
  await pg.close();
}
await b.close();
