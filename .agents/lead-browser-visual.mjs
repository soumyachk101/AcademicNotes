import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const b = await pw.chromium.launch();
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
const pages = ['index.html','Semester_5/index.html','Semester_4/index.html','PPS/pps_index.html','Semester_5/os/os_exam_prep.html','Semester_4/algorithms/algorithms_index.html','Semester_5/os/os_index.html','Semester_4/architecture/pipelining.html'];
for (const p of pages) {
  await pg.goto('file://' + process.cwd() + '/' + p, { waitUntil: 'load' });
  await pg.waitForTimeout(300);
  const bg = await pg.evaluate(() => getComputedStyle(document.body).backgroundColor + ' / ' + getComputedStyle(document.body).fontFamily.slice(0,30));
  await pg.screenshot({ path: `.agents/screenshots/browser-check-${p.replace(/[\/.]/g,'_')}.png` });
  console.log(p, '->', bg);
}
await b.close();
