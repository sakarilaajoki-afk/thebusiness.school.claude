#!/usr/bin/env node
'use strict';
/*
 * Builds the lesson maps (assets/lesson-maps/lessonmap-<id>.pdf + .jpg) from
 * maps.js and the game's own topic and lesson names.
 *
 *   node _spec-check/lesson-maps/build.js --game <game checkout> [--out assets/lesson-maps] [--only <id>]
 *
 * <game checkout> is a checkout of the released game (bs-multiplayer main):
 * the names come from its lib/motor-topic-cards.js (topicChoices, lessonChoices),
 * the same functions the set-up card's Topic and Lesson selects use.
 * Needs Playwright (Chromium) and the Inter font installed.
 */
const fs = require('fs');
const path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const GAME = path.resolve(arg('--game', ''));
const OUT = path.resolve(arg('--out', path.join(__dirname, '../../assets/lesson-maps')));
const ONLY = arg('--only', '');
const MIN_SCALE = Number(arg('--min-scale', '0.85'));
if (!fs.existsSync(path.join(GAME, 'lib/motor-topic-cards.js'))) { console.error('--game <checkout of the game> is required'); process.exit(2); }
const Cards = require(path.join(GAME, 'lib/motor-topic-cards.js'));
const MAPS = require('./maps.js');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function parse(map) {
  const board = Cards.BOARDS.find((b) => b.id === map.board);
  if (!board) throw new Error(`${map.id}: no board ${map.board}`);
  const topics = new Map(Cards.topicChoices(board.course || '', board.id).map((t) => [t.id, t.title]));
  const used = new Map();
  const rows = [];
  for (const line of map.rows.split('\n').map((l) => l.trim()).filter(Boolean)) {
    if (line.startsWith('#')) { rows.push({ group: line.slice(1).trim() }); continue; }
    const [code, title, list] = line.split('|').map((s) => s.trim());
    const entries = list === '-' ? [] : list.split(',').map((s) => s.trim()).map((e) => {
      const m = /^(?:(\S+)\s+)?([a-z-]+)(?::([\d+]+))?$/.exec(e);
      if (!m) throw new Error(`${map.id}: bad entry "${e}"`);
      const [, ecode, topic, nums] = m;
      if (!topics.has(topic)) throw new Error(`${map.id}: ${topic} is not a topic of ${board.id}`);
      const all = Cards.lessonChoices(topic, board.level);
      const pick = nums ? nums.split('+').map(Number) : all.map((l) => l.lesson);
      const lessons = pick.map((n) => {
        const l = all.find((x) => x.lesson === n);
        if (!l) throw new Error(`${map.id}: ${topic} has no lesson ${n}`);
        const k = `${topic}:${n}`; if (used.has(k)) throw new Error(`${map.id}: ${k} twice`); used.set(k, code);
        return l;
      });
      return { code: ecode || '', topic, name: topics.get(topic), lessons, part: !!nums };
    });
    rows.push({ code, title, entries });
  }
  /* every topic and lesson the board offers is on its map, once */
  for (const [t] of topics) for (const l of Cards.lessonChoices(t, board.level)) {
    if (!used.has(`${t}:${l.lesson}`)) throw new Error(`${map.id}: ${t} lesson ${l.lesson} is not on the map`);
  }
  return { board, rows, topics: topics.size, lessons: used.size, none: rows.filter((r) => r.entries && !r.entries.length).length };
}

function html(map, data, scale, stacked) {
  const body = data.rows.map((r) => {
    if (r.group) return `<tr class="grp"><th colspan="3">${esc(r.group)}</th></tr>`;
    const right = r.entries.length ? r.entries.map((e) => `<div class="tp"><div class="tn"><span class="ar"></span>${e.code ? `<span class="ec">${esc(e.code)}</span>` : ''}<span class="tl"><b>${esc(e.name)}</b>${e.lessons.map((l) => `<span class="l"><span class="n">${l.lesson}</span>${esc(l.title)}</span>`).join('')}</span></div></div>`).join('')
      : '<span class="none">No game lesson</span>';
    return `<tr class="${r.entries.length ? '' : 'off'}"><td class="c">${esc(r.code)}</td><td class="t">${esc(r.title)}</td><td class="g">${right}</td></tr>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Lesson map ${esc(map.title)}</title><style>
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:794px;height:1123px;background:#fff}
body{font-family:Inter,system-ui,sans-serif;color:#16233f;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:794px;height:1123px;padding:40px 44px 0;overflow:hidden}
.in{transform-origin:0 0;transform:scale(${scale});width:${(706 / scale).toFixed(1)}px}
.kick{font-size:13px;font-weight:700;letter-spacing:.16em;color:#5d6b82;text-transform:uppercase}
h1{font-size:27px;line-height:1.15;font-weight:700;margin:8px 0 8px;letter-spacing:-.01em}
.sub{font-size:14px;color:#40506e;line-height:1.45;padding-bottom:13px;border-bottom:2px solid #16233f}
.sub .ar{margin-right:6px}
.sub .none{margin:0 4px 0 0;padding:1px 7px;font-size:12px}
table{width:100%;border-collapse:collapse;margin-top:10px}
thead th{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#5d6b82;font-weight:600;text-align:left;padding:4px 0 7px}
tr.grp th{background:#16233f;color:#fff;font-size:14.5px;font-weight:700;text-align:left;padding:6px 12px}
td{border-bottom:1px solid #d6dce6;vertical-align:middle;padding:4px 0;font-size:13.5px}
td.c{width:52px;padding-left:12px;color:#5d6b82;font-weight:700;font-size:13px;white-space:nowrap}
body.nocode td.c{display:none}
body.nocode td.t{width:300px;padding-left:12px}
td.t{width:205px;padding-right:12px;font-weight:600;line-height:1.25}
td.g{padding-left:14px;border-left:0;position:relative}
td.g::before{content:"";position:absolute;left:0;top:6px;bottom:6px;border-left:2px solid #0a6b73}
tr.off td.g::before{border-left:2px solid #c3cad6}
tr.off td.t,tr.off td.c{color:#7a869a;font-weight:500}
.tp{padding:1px 0}
.tp+.tp{margin-top:2px}
.tn{font-size:13.5px;line-height:1.35;display:flex;align-items:baseline;gap:6px}
.ar{display:inline-block;width:0;height:0;border-left:8px solid #0a6b73;border-top:5px solid transparent;border-bottom:5px solid transparent;flex:0 0 auto;transform:translateY(-1px)}
.ec{color:#5d6b82;font-weight:600;font-size:12.5px}
.tn b{font-weight:600;margin-right:10px}
.tl{display:inline}
body.stacked .tl b{display:block}
body.stacked .tl .l{display:inline-block;margin-top:1px}
.tl .l{margin-right:9px;color:#40506e;font-size:12.5px}
.ls{display:flex;flex-wrap:wrap;gap:1px 12px;margin:2px 0 0 14px;font-size:12.5px;color:#40506e;line-height:1.35}
.l{white-space:nowrap}
.n{display:inline-block;min-width:14px;height:14px;border-radius:7px;background:#e3f1f1;color:#0a6b73;font-weight:700;font-size:10px;line-height:14px;text-align:center;margin-right:4px;transform:translateY(-1px)}
.none{display:inline-block;background:#eef1f5;border:1px dashed #9aa5b8;color:#4a5568;font-weight:600;font-size:12.5px;padding:2px 9px;border-radius:4px}
.foot{position:absolute;left:44px;right:44px;bottom:30px;display:flex;justify-content:space-between;font-size:12.5px;color:#40506e;font-weight:600}
</style></head><body class="${data.rows.some((r) => r.code) ? '' : 'nocode'} ${stacked ? 'stacked' : ''}"><div class="page"><div class="in">
<div class="kick">UK Motor Trade</div>
<h1>Lesson map: ${esc(map.title)}</h1>
<p class="sub"><span class="ar"></span>A game topic. Play it whole, or one numbered lesson.<br><span class="none">No game lesson</span> The game does not teach this part.</p>
<table><thead><tr><th colspan="2">${esc(map.head)}</th><th style="padding-left:14px">Game lessons</th></tr></thead><tbody>${body}</tbody></table>
</div><div class="foot"><span>${esc(map.foot)}</span><span>play.thebusiness.school</span></div></div></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  const report = [];
  for (const map of MAPS) {
    if (ONLY && map.id !== ONLY) continue;
    const data = parse(map);
    /* the largest scale (to 0.01) at which the map fits one A4 page */
    let stacked = true;
    const fits = async (sc) => {
      await page.setContent(html(map, data, sc, stacked), { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      return (await page.evaluate(() => document.querySelector('.in').getBoundingClientRect().bottom)) <= 1123 - 60;
    };
    let lo = MIN_SCALE, hi = 1, scale = 1;
    if (!(await fits(1))) stacked = false;
    if (!(await fits(1))) {
      if (!(await fits(lo))) throw new Error(`${map.id}: does not fit one page at scale ${lo}`);
      while (hi - lo > 0.005) { const mid = (lo + hi) / 2; if (await fits(mid)) lo = mid; else hi = mid; }
      scale = Math.floor(lo * 100) / 100; await fits(scale);
    }
    const base = path.join(OUT, `lessonmap-${map.id}`);
    await page.pdf({ path: `${base}.pdf`, format: 'A4', printBackground: true, pageRanges: '1' });
    await page.screenshot({ path: `${base}.jpg`, type: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: 794, height: 1123 } });
    report.push(`${map.id}: ${data.topics} topics, ${data.lessons} lessons, ${data.none} areas with no game lesson, scale ${scale}${stacked ? ', lessons under each topic' : ', lessons beside each topic'}`);
  }
  await browser.close();
  console.log(report.join('\n'));
})().catch((e) => { console.error(e.message || e); process.exit(1); });
