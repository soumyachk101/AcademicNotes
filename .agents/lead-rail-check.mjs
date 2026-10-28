import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const b = await pw.chromium.launch();
// desktop: scroll to module-4, verify rail stays visible
let pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
let errs = [];
pg.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,100)); });
await pg.goto('file://' + process.cwd() + '/Semester_5/os/os_exam_prep.html', { waitUntil: 'load' });
await pg.evaluate(() => document.querySelector('#module-4').scrollIntoView());
await pg.waitForTimeout(400);
const rail = await pg.evaluate(() => {
  const r = document.querySelector('.exam-rail');
  const rr = r.getBoundingClientRect();
  return { visible: rr.top > 0 && rr.bottom < 900, top: rr.top, w: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
});
await pg.screenshot({ path: '.agents/screenshots/rail-module4.png' });
console.log('desktop rail visible at module-4:', JSON.stringify(rail), 'overflow:', rail.w - rail.cw, 'console:', errs.length ? errs : 'none');
// click rail link, check it navigates
await pg.click('.exam-rail-links a[href="#module-2"]');
await pg.waitForTimeout(500);
console.log('after click, module-2 near top:', await pg.evaluate(() => Math.abs(document.querySelector('#module-2').getBoundingClientRect().top - 90) < 80));
// mobile: chips
let m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto('file://' + process.cwd() + '/Semester_5/os/os_exam_prep.html', { waitUntil: 'load' });
await m.evaluate(() => document.querySelector('#module-5').scrollIntoView());
await m.waitForTimeout(400);
const chips = await m.evaluate(() => {
  const c = document.querySelector('.exam-chips');
  const cs = getComputedStyle(c);
  const r = c.getBoundingClientRect();
  return { display: cs.display, sticky: cs.position, top: r.top, w: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
});
console.log('mobile chips:', JSON.stringify(chips), 'overflow:', chips.w - chips.cw);
await m.screenshot({ path: '.agents/screenshots/chips-module5.png' });
await b.close();
