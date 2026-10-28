import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const b = await pw.chromium.launch();
const pages = ['index.html','Semester_5/os/os_exam_prep.html','Semester_5/index.html','Semester_4/index.html','PPS/pps_index.html','Semester_5/os/os_index.html','Semester_4/algorithms/algorithms_index.html'];
for (const p of pages) {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const failed = [];
  pg.on('requestfailed', r => failed.push(`${r.url().split('/').slice(-2).join('/')} :: ${r.failure()?.errorText}`));
  const errs = [];
  pg.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,120)); });
  await pg.goto('file://' + process.cwd() + '/' + p, { waitUntil: 'load' });
  const sheets = await pg.evaluate(() => document.styleSheets.length);
  const cssRules = await pg.evaluate(() => {
    let n = 0, broken = [];
    for (const s of document.styleSheets) {
      try { n += s.cssRules.length; } catch { broken.push(s.href || 'inline'); }
    }
    return { n, broken };
  });
  console.log(p, '| sheets:', sheets, '| rules:', cssRules.n, '| unparseable:', cssRules.broken, '| failed:', failed.length ? failed.slice(0,4) : 'none', '| console:', errs.length ? errs.slice(0,3) : 'none');
  await pg.close();
}
await b.close();
