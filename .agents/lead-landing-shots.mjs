import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const b = await pw.chromium.launch();
for (const [w,h,name] of [[1440,900,'full'],[390,844,'mobile']]) {
  const pg = await b.newPage({ viewport: { width: w, height: h } });
  await pg.goto('file:///Users/soumyachakraborty/Documents/05-Learning/Study Notes/Academic Study Notes/index.html', { waitUntil: 'load' });
  await pg.waitForTimeout(600);
  await pg.screenshot({ path: `.agents/screenshots/lead-landing-${name}.png`, fullPage: name === 'full' });
  await pg.close();
}
await b.close();
console.log('done');
