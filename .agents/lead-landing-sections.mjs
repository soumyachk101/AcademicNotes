import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const b = await pw.chromium.launch();
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
await pg.goto('file:///Users/soumyachakraborty/Documents/05-Learning/Study Notes/Academic Study Notes/index.html', { waitUntil: 'load' });
await pg.waitForTimeout(400);
const sections = await pg.evaluate(() =>
  [...document.querySelectorAll('section, footer')].map(s => ({ id: s.id || s.className, top: s.getBoundingClientRect().top + window.scrollY, h: s.offsetHeight }))
);
const list = [{ id: 'hero', top: 0, h: sections[0].h }];
for (const s of sections) list.push({ id: s.id || s.className.split(' ')[0], top: s.top, h: s.h });
for (let i = 0; i < list.length; i++) {
  await pg.evaluate(t => window.scrollTo(0, t), list[i].top);
  await pg.waitForTimeout(120);
  await pg.screenshot({ path: `.agents/screenshots/lead-${list[i].id}-${i}.png`, clip: { x: 0, y: 0, width: 1440, height: Math.min(list[i].h + 80, 900) } });
}
await b.close();
console.log(JSON.stringify(list));
