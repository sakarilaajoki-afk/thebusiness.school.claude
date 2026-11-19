#!/usr/bin/env node
'use strict';
/*
 * Pictures of the teacher's set-up card (Class, Topic + Lesson, How long), taken
 * from the game itself: starts the game locally from a checkout (the game's own
 * browser-test helpers, an in-memory database with a demo licence), logs in as a
 * teacher and photographs the card.
 *
 *   node _spec-check/setup-card/shoot.js --game <checkout of the released game> --out <dir>
 *
 * Writes, at 1280x720 (x2):
 *   setup-whole-topic.png   GCSE Business, Cash flow, Whole topic
 *   setup-one-lesson.png    GCSE Business, Cash flow, lesson 2
 *   setup-board.png         AQA GCSE Business (8132), Cash flow, Whole topic
 *   setup-card-*.png        the same, cropped to the card
 */
const fs = require('fs');
const path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const GAME = path.resolve(arg('--game', ''));
const OUT = path.resolve(arg('--out', '.'));
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
(async () => {
  const H = require(path.join(GAME, 'test/helpers/one-way-in.js'));
  const B = require(path.join(GAME, 'test/helpers/one-way-in-browser.js'));
  const db = H.newDatabase();
  db.addLicense({ key: 'TBS-DEMO-0000', max_sessions: 50, sessions_used: 0, expires_at: '2099-12-31' });
  const site = await B.startSite(db);
  const base = site.base;
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const shots = [
    ['setup-whole-topic', 'gcse|', 'cash-flow', ''],
    ['setup-one-lesson', 'gcse|', 'cash-flow', '2'],
    ['setup-board', 'gcse|aqa-gcse-8132', 'cash-flow', ''],
  ];
  for (const [name, cls, topic, lesson] of shots) {
    const p = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
    await p.route('**/*', (r) => (r.request().url().startsWith(base) || /^(data|blob):/.test(r.request().url())) ? r.continue() : r.abort());
    await p.goto(base + '/'); await p.locator('#loading').waitFor({ state: 'hidden' }).catch(() => {}); await p.waitForTimeout(1200);
    await p.locator('[onclick="sfPickTeacher()"]').click();
    await p.locator('#sf-license-key').fill('TBS-DEMO-0000'); await p.locator('#sf-license-btn').click();
    await p.locator('#sf-pt-session-settings').waitFor({ state: 'visible' }); await p.waitForTimeout(1500);
    await p.selectOption('#sf-session-class', cls); await p.waitForTimeout(600);
    await p.selectOption('#sf-session-topic-cards', topic); await p.waitForTimeout(600);
    if (lesson) await p.selectOption('#sf-session-topic-lesson', lesson);
    await p.waitForTimeout(800); await p.mouse.move(1, 1);
    const text = await p.evaluate(() => document.body.innerText);
    if (/STEP \d+ OF \d+|Arrow keys move between steps/.test(text)) throw new Error('old tutorial popup on screen');
    await p.screenshot({ path: path.join(OUT, `${name}.png`) });
    await p.locator('#sf-pt-session-settings').screenshot({ path: path.join(OUT, `setup-card-${name.replace('setup-', '')}.png`) });
    console.log(name, await p.evaluate(() => [document.getElementById('sf-session-class').selectedOptions[0]?.textContent,
      document.getElementById('sf-session-topic-cards').selectedOptions[0]?.textContent,
      document.getElementById('sf-session-topic-lesson').selectedOptions[0]?.textContent].join(' | ')));
    await p.close();
  }
  await browser.close();
  await (site.close ? site.close() : null);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
