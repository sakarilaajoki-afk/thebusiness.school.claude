'use strict';
/*
 * Specification points for each game lesson, per course.
 *
 * Source 1, the game's lesson split (handoff/TUNNIT-JAKO-20261118.md, -ERA3.md,
 * -ERA4.md): each lesson row lists the points of AQA 8132/7132, OCR J204/H436,
 * Cambridge 0450/0264, Pearson 1BS0/9BS0/4BS1, BTEC and IB. These were read from
 * the boards' official PDFs (AQA, OCR, Cambridge 18-19.11.2026; Pearson and BTEC
 * 19.11.2026, handoff/PEARSON-BTEC-TARKISTUS-20261119.md), so they carry a tick.
 * IB has no official guide here (IB-REPO): its points never carry a tick.
 *
 * Source 2, only where source 1 has no point for that course and lesson: the
 * row of the course's lesson map (_spec-check/lesson-maps/maps.js). No tick,
 * except a Pearson code the check lists as matching the PDF. Map rows that the
 * handoff found wrong are not used (MAP_WRONG).
 */
const fs = require('fs');
const path = require('path');

const FILES = ['TUNNIT-JAKO-20261118.md', 'TUNNIT-JAKO-ERA3.md', 'TUNNIT-JAKO-ERA4.md'];
const CHECK = 'PEARSON-BTEC-TARKISTUS-20261119.md';
const GCSE = 'gcse-level-2';
const ALEVEL = 'a-level-3';

/* Corrections in PEARSON-BTEC-TARKISTUS-20261119.md that the tables do not carry
   (they replace the table's own points for that lesson and specification). */
const EXTRA = [
  { topic: 'cash-flow', level: ALEVEL, lesson: 1, spec: '9BS0', codes: ['2.1.4'] },
  { topic: 'stakeholders-ethics', level: GCSE, lesson: 1, spec: '1BS0', codes: ['1.5.1'] },
  /* "1BS0: Stakeholders and ethics ... (etiikka on 2.1.4)" */
  { topic: 'stakeholders-ethics', level: GCSE, lesson: 2, spec: '1BS0', codes: ['2.1.4'] },
  /* Tech Award: the economy and its regulations are Component 1 C1 PEST, C2 is SWOT */
  { topic: 'external-environment', level: GCSE, lesson: 2, spec: 'TA', codes: ['Component 1 C1'] },
];

/* Lesson-map rows the handoff found wrong (course, topic, lesson or 0 for all). */
const MAP_WRONG = [
  ['edexcel-igcse-4bs1', 'stakeholders-ethics', 0], /* 4BS1 1.2 is Types of organisations */
  ['edexcel-igcse-4bs1', 'growth-scale', 1], /* 4BS1 has no methods of growth */
  ['edexcel-gcse-1bs0', 'stakeholders-ethics', 2], /* ethics is 1BS0 2.1.4 */
];

const CODE = /\b\d\.\d+(?:\.\d+)?\b/g;

/* split at top-level ';' (not inside brackets) */
function segments(s) {
  const out = []; let depth = 0; let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ';' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/* the text of a segment without quotations and brackets */
function bare(seg) {
  let s = seg.replace(/"[^"]*"/g, ' ');
  let prev;
  do { prev = s; s = s.replace(/\([^()]*\)/g, ' '); } while (s !== prev);
  return s.replace(/\s+/g, ' ').trim();
}

/*
 * One segment -> [{ spec, codes }]. ctx carries the board of the previous
 * segment (a segment that starts with a code continues it) and, per topic,
 * the Cambridge syllabus last named (an unnamed "CAM 5.2.1" is that one).
 */
function refsOf(seg, level, ctx) {
  if (/\bin passing\b/.test(seg)) return []; /* named, but not taught there */
  let h = bare(seg);
  if (/^\d\.\d/.test(h) && ctx.prev) h = `${ctx.prev} ${h}`;
  let m;
  const out = [];
  const push = (spec, codes) => { if (codes.length) out.push({ spec, codes }); };
  if ((m = /^(1BS0|9BS0|4BS1|IAL)\b(.*)$/.exec(h))) { ctx.prev = m[1]; push(m[1], m[2].match(CODE) || []); return out; }
  if ((m = /^AQA(?:\s+(8132|7132|7138))?\b(.*)$/.exec(h))) {
    const spec = m[1] || (level === GCSE ? '8132' : '7132'); ctx.prev = `AQA ${spec}`;
    push(spec, m[2].match(CODE) || []); return out;
  }
  if ((m = /^(?:OCR\s+)?(J204|H436|H431)\b(.*)$/.exec(h)) || (m = /^OCR()\b(.*)$/.exec(h))) {
    const spec = m[1] || (level === GCSE ? 'J204' : 'H436'); ctx.prev = spec;
    if (spec !== 'H431') push(spec, m[2].match(CODE) || []); /* H431 rows quote the spec, no numbers */
    return out;
  }
  if (/^CAM\b/.test(h) || /^(0450|0264)\b/.test(h)) {
    ctx.prev = 'CAM';
    const got = { '0450': [], '0264': [] };
    let cur = ctx.cam || ['0450']; let first = null;
    for (const tok of h.replace(/^CAM\s*/, '').split(/[\s,]+/)) {
      if (/^(0450|0264)(\/(0450|0264))?$/.test(tok)) { cur = tok.split('/'); if (!first) first = [cur[0]]; continue; }
      if (/^\d\.\d+(\.\d+)?$/.test(tok)) cur.forEach((x) => got[x].push(tok));
    }
    if (first) ctx.cam = first;
    push('0450', got['0450']); push('0264', got['0264']);
    return out;
  }
  if (/^(BTEC\s+)?Tech Award\b/.test(h)) {
    ctx.prev = 'TA';
    const t = h.replace(/^(BTEC\s+)?Tech Award\s+/, '');
    if ((m = /^(?:Component\s+|C)(\d)\s+([A-C]\d?)\b/.exec(t))) push('TA', [`Component ${m[1]} ${m[2]}`]);
    else if ((m = /^(\d)\.([A-C]\d?)\b/.exec(t))) push('TA', [`Component ${m[1]} ${m[2]}`]);
    return out;
  }
  if (/^BTEC\b/.test(h)) {
    ctx.prev = 'BTEC';
    const t = h.replace(/^BTEC\s+(L3\s+)?/, '');
    let code = '';
    if ((m = /^Unit\s+(\d)\s+([A-G]\d?)/.exec(t))) code = `U${m[1]}.${m[2]}`;
    else if ((m = /^(U\d(?:\.[A-G]\d(?:\/[A-G]?\d)*)?)(?:\s+([A-G])\b)?/.exec(t))) code = m[1] + (m[2] ? `.${m[2]}` : '');
    if (code) push('BTEC', [code]);
    return out;
  }
  if ((m = /^IB\b(.*)$/.exec(h))) { ctx.prev = 'IB'; push('IB', m[1].match(CODE) || []); return out; }
  ctx.prev = null;
  return out;
}

/* "1BS0 1.2.3, 1.4.1–1.4.5; 9BS0 ...; 4BS1 2.2–2.5" -> Set of "1BS0 1.2.3", ... */
function checkedPearson(text) {
  const m = /Muut koodit täsmäävät PDF:ään \(([^)]*)\)/.exec(text);
  const out = new Set();
  if (!m) return out;
  for (const part of m[1].split(';')) {
    const p = /^\s*(\w+)\s+(.*)$/.exec(part);
    if (!p) continue;
    for (const item of p[2].split(',').map((s) => s.trim())) {
      const r = /^([\d.]+)\.(\d+)\s*[–-]\s*([\d.]+)\.(\d+)$/.exec(item);
      if (r && r[1] === r[3]) for (let i = Number(r[2]); i <= Number(r[4]); i++) out.add(`${p[1]} ${r[1]}.${i}`);
      else if (/^[\d.]+$/.test(item)) out.add(`${p[1]} ${item}`);
    }
  }
  return out;
}

/* course id -> Map("topic:lesson" -> code) from the lesson map rows */
function mapCodes(maps, Cards) {
  const out = new Map();
  for (const map of maps) {
    const board = Cards.BOARDS.find((b) => b.id === map.board);
    if (!board) continue;
    const codes = new Map();
    let group = '';
    for (const line of map.rows.split('\n').map((l) => l.trim()).filter(Boolean)) {
      if (line.startsWith('#')) { group = line.slice(1).trim(); continue; }
      const [code, , list] = line.split('|').map((s) => s.trim());
      if (list === '-') continue;
      for (const e of list.split(',').map((s) => s.trim())) {
        const m = /^(?:(\S+)\s+)?([a-z-]+)(?::([\d+]+))?$/.exec(e);
        if (!m) continue;
        let c = m[1] || code;
        if (!c) continue;
        const comp = /^Component\s+(\d)/.exec(group); const unit = /^Unit\s+(\d)/.exec(group);
        if (/^[A-G]$/.test(c) && comp) c = `Component ${comp[1]} ${c}`;
        else if (/^[A-G]$/.test(c) && unit) c = `U${unit[1]}.${c}`;
        else if (/^Unit\s/.test(c)) continue;
        const all = Cards.lessonChoices(m[2], board.level).map((l) => l.lesson);
        for (const n of m[3] ? m[3].split('+').map(Number) : all) codes.set(`${m[2]}:${n}`, c);
      }
    }
    out.set(map.id, codes);
  }
  return out;
}

module.exports = function readSpecs(game, Cards, maps) {
  const titles = new Map(Object.entries(Cards.TITLES).map(([id, t]) => [t.toLowerCase(), id]));
  const alias = { 'market share': 'market-share', 'leadership and management': 'leadership' };
  const rows = []; /* { topic, level, lesson, title, spec, codes } */
  const lessonRows = new Set(); /* "topic|level|lesson" that the split has a row for */
  for (const f of FILES) {
    let topic = null; let ctx = {};
    for (const line of fs.readFileSync(path.join(game, 'handoff', f), 'utf8').split('\n')) {
      const h = /^##\s+(.+?)\s*(\(.*\))?$/.exec(line);
      if (h) { const k = h[1].toLowerCase(); topic = titles.get(k) || alias[k] || null; ctx = {}; continue; }
      const r = /^\|\s*(GCSE|A level)\s*\|\s*(\d)\s+([^|]+?)\s*\|\s*(.+?)\s*\|\s*$/.exec(line);
      if (!r || !topic) continue;
      const level = r[1] === 'GCSE' ? GCSE : ALEVEL;
      lessonRows.add([topic, level, Number(r[2])].join('|'));
      ctx.prev = null;
      for (const seg of segments(r[4])) {
        for (const ref of refsOf(seg, level, ctx)) rows.push({ topic, level, lesson: Number(r[2]), title: r[3], ...ref });
      }
    }
  }
  const key = (r) => [r.topic, r.level, r.lesson, r.spec].join('|');
  const fixed = new Set(EXTRA.map(key));
  const all = rows.filter((r) => !fixed.has(key(r))).concat(EXTRA);
  const verified = checkedPearson(fs.readFileSync(path.join(game, 'handoff', CHECK), 'utf8'));
  const fromMap = mapCodes(maps, Cards);

  /* -> { codes, checked, from: 'split' | 'map' | '' } */
  function lookup(course, spec, topic, level, lesson) {
    const codes = [...new Set(all.filter((r) => r.spec === spec && r.topic === topic && r.level === level && r.lesson === lesson).flatMap((r) => r.codes))];
    if (codes.length) return { codes, checked: spec !== 'IB', from: 'split' };
    const wrong = MAP_WRONG.some(([c, t, n]) => c === course && t === topic && (!n || n === lesson));
    const m = !wrong && fromMap.get(course) && fromMap.get(course).get(`${topic}:${lesson}`);
    if (m) return { codes: [m], checked: verified.has(`${spec} ${m}`), from: 'map' };
    return { codes: [], checked: false, from: '' };
  }
  return { lookup, hasRow: (topic, level, lesson) => lessonRows.has([topic, level, lesson].join('|')), rows: all };
};
