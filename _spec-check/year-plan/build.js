#!/usr/bin/env node
'use strict';
/*
 * Builds the year plans (assets/year-plans/yearplan-<id>.pdf + .jpg): each
 * course's game lessons month by month over its two school years.
 *
 *   node _spec-check/year-plan/build.js --game <game checkout> [--out assets/year-plans] [--only <id>]
 *
 * <game checkout> is a checkout of the released game (bs-multiplayer main):
 * topic and lesson names come from its lib/motor-topic-cards.js (topicChoices,
 * lessonChoices), the same functions as the set-up card's Topic and Lesson
 * selects. Which row of the specification each lesson belongs to comes from
 * the lesson maps (../lesson-maps/maps.js); the teaching order and lengths
 * from plans.js. Fails if any topic or lesson the course offers is missing
 * from the plan, or is on it twice.
 * Needs Playwright (Chromium) and the Inter font installed.
 */
const fs = require('fs');
const path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const GAME = path.resolve(arg('--game', ''));
const OUT = path.resolve(arg('--out', path.join(__dirname, '../../assets/year-plans')));
const ONLY = arg('--only', '');
const CHECK = process.argv.includes('--check');
if (!fs.existsSync(path.join(GAME, 'lib/motor-topic-cards.js'))) { console.error('--game <checkout of the game> is required'); process.exit(2); }
const Cards = require(path.join(GAME, 'lib/motor-topic-cards.js'));
const MAPS = require('../lesson-maps/maps.js');
const PLANS = require('./plans.js');

/* Teaching weeks per month (about 38 a year, holidays out). Year 2 teaches
   to March; April to June is revision and exams. */
const YEAR1 = [['Sep', 4], ['Oct', 3], ['Nov', 4], ['Dec', 3], ['Jan', 4], ['Feb', 3], ['Mar', 4], ['Apr', 2], ['May', 4], ['Jun', 4], ['Jul', 3]];
const YEAR2 = [['Sep', 4], ['Oct', 3], ['Nov', 4], ['Dec', 3], ['Jan', 4], ['Feb', 3], ['Mar', 4]];
const weeks = (ms) => ms.reduce((s, m) => s + m[1], 0);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* the lesson map's rows, with their game topics and lessons (as lesson-maps/build.js) */
function mapRows(map) {
  const board = Cards.BOARDS.find((b) => b.id === map.board);
  if (!board) throw new Error(`${map.id}: no board ${map.board}`);
  const topics = new Map(Cards.topicChoices(board.course || '', board.id).map((t) => [t.id, t.title]));
  const rows = []; let group = '';
  const seen = new Set();
  for (const line of map.rows.split('\n').map((l) => l.trim()).filter(Boolean)) {
    if (line.startsWith('#')) { group = line.slice(1).trim(); continue; }
    const [code, title, list] = line.split('|').map((s) => s.trim());
    const entries = list === '-' ? [] : list.split(',').map((s) => s.trim()).map((e) => {
      const m = /^(?:(\S+)\s+)?([a-z-]+)(?::([\d+]+))?$/.exec(e);
      if (!m) throw new Error(`${map.id}: bad entry "${e}"`);
      const [, ecode, topic, nums] = m;
      if (!topics.has(topic)) throw new Error(`${map.id}: ${topic} is not a topic of ${board.id}`);
      const all = Cards.lessonChoices(topic, board.level);
      const pick = nums ? nums.split('+').map(Number) : all.map((l) => l.lesson);
      const lessons = pick.map((n) => { const l = all.find((x) => x.lesson === n); if (!l) throw new Error(`${map.id}: ${topic} has no lesson ${n}`); return l; });
      return { code: ecode || '', topic, name: topics.get(topic), lessons };
    });
    let key = code;
    if (/^[A-Z]$/.test(code)) key = (/\d+/.exec(group) || [''])[0] + code;
    if (!code) key = `r${rows.length + 1}`;
    if (seen.has(key)) throw new Error(`${map.id}: row key ${key} twice`);
    seen.add(key);
    /* a BTEC learning aim is long: a month with no game lesson names its unit */
    rows.push({ key, title, entries, dim: /^[A-Z]$/.test(code) && group ? group : title });
  }
  return { board, topics, rows };
}

/* areas in teaching order -> each game entry and each area placed on the course's weeks */
function place(plan, data) {
  const byKey = new Map(data.rows.map((r) => [r.key, r]));
  const lines = plan.areas ? plan.areas.split('\n').map((l) => l.trim()).filter(Boolean)
    : data.rows.map((r) => `${r.key} | 1`);
  const years = [[]];
  for (const line of lines) {
    if (/^# *Year 2$/i.test(line)) { years.push([]); continue; }
    const [key, spec] = line.split('|').map((s) => s.trim());
    const row = byKey.get(key);
    if (!row) throw new Error(`${plan.id}: no map row ${key}`);
    byKey.delete(key);
    const subs = /^\d+(\.\d+)?$/.test(spec) ? null : spec.split(/\s+/).map((s) => { const [c, w] = s.split(':'); return { code: c, w: w ? Number(w) : 1 }; });
    years[years.length - 1].push({ row, w: subs ? subs.reduce((a, s) => a + s.w, 0) : Number(spec), subs });
  }
  if (byKey.size) throw new Error(`${plan.id}: map rows not in the plan: ${[...byKey.keys()].join(', ')}`);
  /* the weeks each year's areas fill */
  const spans = years.length === 2 ? [[0, weeks(YEAR1)], [weeks(YEAR1), weeks(YEAR1) + weeks(YEAR2)]] : [[0, weeks(YEAR1) + weeks(YEAR2)]];
  const items = []; const areas = [];
  years.forEach((list, yi) => {
    const [a, b] = spans[yi]; const total = list.reduce((s, x) => s + x.w, 0);
    let t = a;
    for (const ar of list) {
      const len = (b - a) * ar.w / total; const start = t; t += len;
      areas.push({ row: ar.row, start, end: t });
      /* slots: a sub-section (by the entry's code) or the whole area */
      const slots = new Map();
      for (const e of ar.row.entries) {
        let s0 = start; let s1 = start + len;
        if (ar.subs && e.code) {
          const i = ar.subs.findIndex((s) => s.code === e.code);
          if (i < 0) throw new Error(`${plan.id}: ${e.code} is not a sub-section of ${ar.row.key}`);
          const before = ar.subs.slice(0, i).reduce((s, x) => s + x.w, 0);
          s0 = start + len * before / ar.w; s1 = s0 + len * ar.subs[i].w / ar.w;
        }
        const k = `${s0}`; if (!slots.has(k)) slots.set(k, { s0, s1, list: [] });
        slots.get(k).list.push(e);
      }
      for (const { s0, s1, list } of slots.values()) list.forEach((e, i) => items.push({ e, mid: s0 + (s1 - s0) * (i + 0.5) / list.length }));
    }
  });
  /* weeks -> months */
  const months = [...YEAR1.map(([m, w]) => ({ year: 1, m, w })), ...YEAR2.map(([m, w]) => ({ year: 2, m, w }))];
  let t = 0; for (const mo of months) { mo.start = t; t += mo.w; mo.end = t; mo.topics = []; mo.areas = []; }
  for (const { e, mid } of items.sort((x, y) => x.mid - y.mid)) {
    const mo = months.find((x) => mid >= x.start && mid < x.end);
    let tp = mo.topics.find((x) => x.topic === e.topic);
    if (!tp) mo.topics.push(tp = { topic: e.topic, name: e.name, lessons: [] });
    tp.lessons.push(...e.lessons);
    tp.lessons.sort((x, y) => x.lesson - y.lesson);
  }
  /* the areas taught in each month, the longest first */
  const overlap = (a, mo) => Math.min(a.end, mo.end) - Math.max(a.start, mo.start);
  for (const mo of months) mo.areas = areas.filter((a) => overlap(a, mo) > 0).sort((x, y) => overlap(y, mo) - overlap(x, mo)).map((a) => a.row);
  /* every topic and lesson the board offers is on the plan, once */
  const count = new Map();
  for (const mo of months) for (const tp of mo.topics) for (const l of tp.lessons) { const k = `${tp.topic}:${l.lesson}`; count.set(k, (count.get(k) || 0) + 1); }
  for (const [tid] of data.topics) for (const l of Cards.lessonChoices(tid, data.board.level)) {
    const n = count.get(`${tid}:${l.lesson}`) || 0;
    if (n !== 1) throw new Error(`${plan.id}: ${tid} lesson ${l.lesson} is on the plan ${n} times`);
  }
  if (count.size !== [...data.topics.keys()].reduce((s, tid) => s + Cards.lessonChoices(tid, data.board.level).length, 0)) throw new Error(`${plan.id}: a lesson the course does not offer`);
  return { months, lessons: count.size, topics: data.topics.size };
}

function cell(mo, i, all) {
  /* a month with no game lesson names its area once, not again in the months after */
  const prev = i > 0 && !all[i - 1].topics.length ? all[i - 1].areas[0] : null;
  const dim = mo.areas[0] && (!prev || prev.dim !== mo.areas[0].dim) ? `<div class="ot">${esc(mo.areas[0].dim)}</div>` : '';
  const body = mo.topics.length
    ? mo.topics.map((t) => `<div class="tp"><div class="tn"><span class="ar"></span><b>${esc(t.name)}</b></div>${t.lessons.map((l) => `<div class="l"><span class="n">${l.lesson}</span>${esc(l.title)}</div>`).join('')}</div>`).join('')
    : `<div class="off">${dim}<span class="none">No game lesson</span></div>`;
  return `<div class="mo${mo.topics.length ? '' : ' empty'}"><div class="mn">${mo.m}</div>${body}</div>`;
}

function html(map, plan, res, scale) {
  const y1 = res.months.filter((m) => m.year === 1); const y2 = res.months.filter((m) => m.year === 2);
  return `<!doctype html><html><head><meta charset="utf-8"><title>Year plan ${esc(map.title)}</title><style>
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:794px;height:1123px;background:#fff}
body{font-family:Inter,system-ui,sans-serif;color:#16233f;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:794px;height:1123px;padding:36px 40px 0;overflow:hidden}
.in{transform-origin:0 0;transform:scale(${scale});width:${(714 / scale).toFixed(1)}px}
.kick{font-size:13px;font-weight:700;letter-spacing:.16em;color:#0a6b73;text-transform:uppercase}
h1{font-size:26px;line-height:1.15;font-weight:700;margin:6px 0 4px;letter-spacing:-.01em}
.src{font-size:13px;color:#40506e;padding-bottom:12px;border-bottom:2px solid #16233f}
.yr{display:flex;align-items:baseline;gap:10px;margin:12px 0 6px;font-size:15px;font-weight:700}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.mo{background:#f3f6f9;border:1px solid #dfe5ec;border-radius:9px;padding:7px 8px 8px}
.mn{font-size:17px;font-weight:700;margin-bottom:3px}
.tp{border-left:3px solid #0a6b73;background:#fff;border-radius:0 6px 6px 0;padding:3px 6px 4px;margin-top:4px}
.tn{display:flex;align-items:baseline;gap:6px;font-size:13px;line-height:1.25}
.tn b{font-weight:650}
.ar{flex:0 0 auto;width:0;height:0;border-left:7px solid #0a6b73;border-top:4.5px solid transparent;border-bottom:4.5px solid transparent;transform:translateY(-1px)}
.l{display:flex;align-items:baseline;gap:5px;font-size:12px;line-height:1.25;color:#40506e;margin-top:1px}
.n{flex:0 0 auto;display:inline-block;width:15px;height:15px;border-radius:8px;background:#e3f1f1;color:#0a6b73;font-weight:700;font-size:10px;line-height:15px;text-align:center}
.off .ot{font-size:12.5px;color:#7a869a;line-height:1.3;margin-bottom:5px}
.none{display:inline-block;background:#eef1f5;border:1px dashed #9aa5b8;color:#4a5568;font-weight:600;font-size:11.5px;padding:2px 8px;border-radius:4px}
.dark{background:#0e2038;border-color:#0e2038;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.dark .big{font-size:46px;font-weight:700;color:#5fd6c8;line-height:1}
.dark .cap{font-size:15px;font-weight:600;margin-top:6px}
.foot{position:absolute;left:40px;right:40px;bottom:26px;display:flex;justify-content:space-between;font-size:12.5px;color:#40506e;font-weight:600}
</style></head><body><div class="page"><div class="in">
<div class="kick">UK Motor Trade · Year plan</div>
<h1>${esc(map.title)}</h1>
<p class="src">${esc(plan.order)}</p>
<div class="yr">Year 1</div>
<div class="grid">${y1.map(cell).join('')}<div class="mo dark"><div class="big">${res.lessons}</div><div class="cap">game lessons</div></div></div>
<div class="yr">Year 2</div>
<div class="grid">${y2.map(cell).join('')}<div class="mo dark"><div class="cap">Apr to Jun</div><div class="cap">Revision and exams</div></div></div>
</div><div class="foot"><span>Months are a guide: use each lesson when you teach its topic.</span><span>play.thebusiness.school</span></div></div></body></html>`;
}

(async () => {
  const jobs = [];
  for (const plan of PLANS) {
    if (ONLY && plan.id !== ONLY) continue;
    const map = MAPS.find((m) => m.id === plan.id);
    if (!map) throw new Error(`${plan.id}: no lesson map`);
    jobs.push({ plan, map, res: place(plan, mapRows(map)) });
  }
  const missing = MAPS.filter((m) => !PLANS.some((p) => p.id === m.id)).map((m) => m.id);
  if (missing.length) throw new Error(`no year plan for ${missing.join(', ')}`);
  if (CHECK) { for (const j of jobs) console.log(`${j.plan.id}: ${j.res.topics} topics, ${j.res.lessons} lessons, OK`); return; }
  let chromium;
  try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  const report = [];
  for (const { plan, map, res } of jobs) {
    const fits = async (sc) => {
      await page.setContent(html(map, plan, res, sc), { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      return (await page.evaluate(() => document.querySelector('.in').getBoundingClientRect().bottom)) <= 1123 - 56;
    };
    /* the largest scale (to 0.01, at most 1.15) at which the plan fills one A4 page */
    let lo = 0.6; let hi = 1.15;
    if (!(await fits(lo))) throw new Error(`${plan.id}: does not fit one page`);
    if (await fits(hi)) lo = hi;
    while (hi - lo > 0.005) { const mid = (lo + hi) / 2; if (await fits(mid)) lo = mid; else hi = mid; }
    const scale = Math.floor(lo * 100) / 100; await fits(scale);
    const base = path.join(OUT, `yearplan-${plan.id}`);
    await page.pdf({ path: `${base}.pdf`, format: 'A4', printBackground: true, pageRanges: '1' });
    await page.screenshot({ path: `${base}.jpg`, type: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: 794, height: 1123 } });
    report.push(`${plan.id}: ${res.topics} topics, ${res.lessons} lessons, scale ${scale}`);
  }
  await browser.close();
  console.log(report.join('\n'));
})().catch((e) => { console.error(e.message || e); process.exit(1); });
