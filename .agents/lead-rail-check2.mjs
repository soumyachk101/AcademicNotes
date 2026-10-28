import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const b = await pw.chromium.launch();
let pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
await pg.goto('file://' + process.cwd() + '/Semester_5/os/os_exam_prep.html', { waitUntil: 'load' });
await pg.click('.exam-rail-links a[href="#module-2"]');
await pg.waitForTimeout(900);
console.log('module-2 top:', await pg.evaluate(() => document.querySelector('#module-2').getBoundingClientRect().top),
  'scrollY:', await pg.evaluate(() => window.scrollY),
  'behavior:', await pg.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior));
// test hash links from chips on mobile too
let m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto('file://' + process.cwd() + '/Semester_5/os/os_exam_prep.html', { waitUntil: 'load' });
await m.click('.exam-chips a[href="#module-6"]');
await m.waitForTimeout(900);
console.log('mobile module-6 top:', await m.evaluate(() => document.querySelector('#module-6').getBoundingClientRect().top));
await b.close();
