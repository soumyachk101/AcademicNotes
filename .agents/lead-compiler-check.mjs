import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const b = await pw.chromium.launch();
for (const [w,h,label] of [[1440,900,'desktop'],[390,844,'mobile']]) {
  const pg = await b.newPage({ viewport: { width: w, height: h } });
  const errs=[];
  pg.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,100)); });
  await pg.goto('file://' + process.cwd() + '/Semester_5/compiler/compiler_exam_prep.html', { waitUntil: 'load' });
  const m = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    mods: document.querySelectorAll('.module-section').length,
    cards: document.querySelectorAll('.qa-card').length,
    toclinks: document.querySelectorAll('a[href^="#module-"]').length,
    tablescroll: document.querySelectorAll('.table-scroll').length }));
  await pg.evaluate(() => document.querySelector('#module-6').scrollIntoView());
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: `.agents/screenshots/compiler-prep-${label}.png` });
  console.log(label, m, '| overflow:', m.sw-m.cw, '| console:', errs.length ? errs.slice(0,3) : 'none');
  await pg.close();
}
await b.close();
