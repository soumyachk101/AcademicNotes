import { chromium } from 'playwright';
const root = process.cwd() + '/';
const pages = ['index.html','Semester_5/index.html','Semester_5/ai/ai_index.html','Semester_5/ai/ai_important_qa.html','Semester_5/compiler/compiler_index.html','Semester_5/compiler/compiler_important_qa.html','Semester_5/constitution/constitution_index.html','Semester_5/constitution/constitution_important_qa.html'];
const b = await chromium.launch();
for (const p of pages) {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,120)); });
  const bodyFont = await pg.evaluate(async () => {
    try { await document.fonts.ready; } catch {}
    return getComputedStyle(document.body).fontFamily;
  });
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto('file://' + root + p, { waitUntil: 'load' });
  const dw = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const d = await pg.goto('file://' + root + p, { waitUntil: 'load' }).catch(e=>e);
  console.log(p, '| bodyFont:', bodyFont.slice(0,40), '| mobile overflow px:', dw, '| console errors:', errs.length ? errs.slice(0,2) : 'none');
  await pg.close(); await m.close();
}
// landing screenshots
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
await pg.goto('file://' + root + 'index.html', { waitUntil: 'load' });
await pg.screenshot({ path: '.agents/screenshots/landing-desktop.png', fullPage: true });
await pg.setViewportSize({ width: 390, height: 844 });
await pg.goto('file://' + root + 'index.html', { waitUntil: 'load' });
await pg.screenshot({ path: '.agents/screenshots/landing-mobile.png', fullPage: true });
await b.close();
console.log('done');
