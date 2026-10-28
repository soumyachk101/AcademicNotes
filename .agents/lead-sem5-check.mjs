import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const b = await pw.chromium.launch();
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
await pg.goto('file://' + process.cwd() + '/Semester_5/index.html', { waitUntil: 'load' });
const r = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
  hasExamPrep: !![...document.querySelectorAll('*')].find(e => e.textContent.includes('Exam Prep') && e.children.length < 4) }));
console.log('Sem5 overflow:', r.sw - r.cw, 'hasExamPrep:', r.hasExamPrep);
await b.close();
