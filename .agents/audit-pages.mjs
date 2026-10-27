import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const pw = require('/Users/soumyachakraborty/.npm-global/lib/node_modules/playwright-core');

const ROOT = '/Users/soumyachakraborty/Documents/05-Learning/Study Notes/Academic Study Notes';
const SHOT_DIR = path.join(ROOT, '.agents/screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const PAGES = [
  'Semester_4/index.html',
  'Semester_5/index.html',
  'PPS/pps_index.html',
  'Semester_4/architecture/pipelining.html',
  'Semester_4/algorithms/algorithms_index.html',
  'Semester_4/automata/toc_important_qa.html',
  'Semester_4/environment/Environmental_Sciences.html',
  'Semester_5/os/os_study_notes.html',
  'Semester_5/compiler/compiler_study_notes.html',
  'Semester_5/dbms/dbms_study_notes.html',
  'Semester_5/ai/ai_important_qa.html',
  'Semester_5/se/se_index.html',
];

const VIEWPORTS = { desktop: { w: 1440, h: 900 }, mobile: { w: 390, h: 844 } };

function safeName(rel) {
  return rel.replace(/^Semester_4\//, 's4_').replace(/^Semester_5\//, 's5_')
    .replace(/^PPS\//, 'pps_').replace(/[\\/]/g, '__').replace(/\.html$/, '');
}

async function auditPage(browser, rel) {
  const filePath = path.join(ROOT, rel);
  const url = 'file://' + filePath;
  const out = { page: rel, consoleErrors: [], consoleWarnings: [], failedRequests: [],
                brokenLinks: [], design: {}, overflow: {}, layout: {}, screenshot: null };

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', m => {
    if (m.type() === 'error') out.consoleErrors.push(m.text().slice(0, 300));
    else if (m.type() === 'warning') out.consoleWarnings.push(m.text().slice(0, 300));
  });
  page.on('requestfailed', r => out.failedRequests.push(`${r.url().split('file://').pop()}: ${r.failure()?.errorText}`));
  page.on('response', r => { if (r.status() >= 400) out.failedRequests.push(`${r.url().split('file://').pop()}: HTTP ${r.status()}`); });

  await page.goto(url, { waitUntil: 'load', timeout: 30000 }).catch(e => out.consoleErrors.push('NAV: ' + e.message));
  await page.waitForTimeout(1200); // settle: scroll reveal, font load attempts

  // Design + layout eval
  out.design = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    const root = getComputedStyle(document.documentElement);
    const varOf = n => root.getPropertyValue(n).trim();
    // effective page background: walk from body up
    let el = document.body, bg = getComputedStyle(el).backgroundColor;
    while (el && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
      el = el === document.body ? document.documentElement : el.parentElement;
      if (!el) break;
      bg = getComputedStyle(el).backgroundColor;
    }
    const overflowers = [];
    document.querySelectorAll('.diagram-container').forEach((d, i) => {
      if (d.scrollWidth > d.clientWidth + 1 || d.scrollHeight > d.clientHeight + 1)
        overflowers.push({ i, sw: d.scrollWidth, cw: d.clientWidth, sh: d.scrollHeight, ch: d.clientHeight });
    });
    const wideTables = [...document.querySelectorAll('table')]
      .filter(t => t.scrollWidth > document.documentElement.clientWidth + 2)
      .map(t => ({ scrollW: t.scrollWidth, cw: document.documentElement.clientWidth }));
    const cards = [...document.querySelectorAll('.qa-card, .card, .subject-card, .sheet')]
      .slice(0, 40).map(c => getComputedStyle(c).backgroundColor);
    const accentEls = [...document.querySelectorAll('a, button, .badge, .chip, .tab')].slice(0, 300);
    const colorCounts = {};
    accentEls.forEach(e => {
      const s = getComputedStyle(e);
      [s.color, s.backgroundColor, s.borderTopColor].forEach(c => {
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') colorCounts[c] = (colorCounts[c] || 0) + 1;
      });
    });
    const top = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);
    return {
      bodyFont: cs.fontFamily, bodyBg: bg,
      accentVar: varOf('--accent'), accentBrightVar: varOf('--accent-bright'),
      fontSansVar: varOf('--font-sans'), fontDisplayVar: varOf('--font-display'), fontBodyVar: varOf('--font-body'),
      cardBgs: [...new Set(cards)],
      topColors: top,
      diagramOverflows: overflowers, wideTables,
      hankenLoaded: document.fonts ? document.fonts.check('16px "Hanken Grotesk"') : null,
      jetLoaded: document.fonts ? document.fonts.check('14px "JetBrains Mono"') : null,
      loadedFontCount: document.fonts ? document.fonts.size : null,
    };
  });

  // Desktop screenshot (viewport shot, top of page)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  out.overflow.desktop = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  out.brokenLinks = (await page.evaluate(() => {
    return [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h =>
      h && !h.startsWith('http') && !h.startsWith('mailto:') && !h.startsWith('tel:') && h !== '');
  })).map(h => {
    const target = path.resolve(path.dirname(filePath), h.split('#')[0]);
    return { href: h, target: target.replace(ROOT + '/', ''), exists: target ? fs.existsSync(target) : false };
  }).filter(l => !l.exists);
  const shot = path.join(SHOT_DIR, safeName(rel) + '.png');
  await page.screenshot({ path: shot }).catch(e => out.screenshot = 'ERR: ' + e.message);
  out.screenshot = shot;
  await ctx.close();

  // Mobile overflow
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await ctx2.newPage();
  await p2.goto(url, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
  await p2.waitForTimeout(800);
  out.overflow.mobile = await p2.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  await ctx2.close();
  return out;
}

const CHROME = process.env.CHROME_PATH || '/Users/soumyachakraborty/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await pw.chromium.launch({ headless: true, executablePath: fs.existsSync(CHROME) ? CHROME : process.env.CHROME_PATH });
const results = [];
for (const rel of PAGES) {
  results.push(await auditPage(browser, rel));
  console.log('done', rel);
}
await browser.close();
fs.writeFileSync(path.join(ROOT, '.agents/audit-results.json'), JSON.stringify(results, null, 2));
console.log('WROTE .agents/audit-results.json');
