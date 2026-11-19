'use strict';
/*
 * Reads the game's lesson split (handoff/TUNNIT-JAKO-20261118.md, -ERA3.md,
 * -ERA4.md) and returns, for each topic, level and lesson, the Pearson 1BS0,
 * 9BS0 and BTEC National references in it, with whether the handoff marks
 * the reference "checked against Pearson PDF".
 */
const fs = require('fs');
const path = require('path');

const FILES = ['TUNNIT-JAKO-20261118.md', 'TUNNIT-JAKO-ERA3.md', 'TUNNIT-JAKO-ERA4.md'];
/* Corrections in handoff/PEARSON-BTEC-TARKISTUS-20261119.md that the tables do not carry. */
const EXTRA = [
  { topic: 'cash-flow', level: 'a-level-3', lesson: 1, board: '9BS0', codes: ['2.1.4'], checked: true },
  { topic: 'stakeholders-ethics', level: 'gcse-level-2', lesson: 1, board: '1BS0', codes: ['1.5.1'], checked: true },
];

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

function refOf(seg) {
  const checked = /checked against Pearson PDF/.test(seg);
  const head = seg.split('(')[0];
  let m;
  if ((m = /^1BS0\b/.exec(head))) return { board: '1BS0', codes: head.match(/\b\d\.\d(?:\.\d)?\b/g) || [], checked };
  if ((m = /^9BS0\b/.exec(head))) return { board: '9BS0', codes: head.match(/\b\d\.\d(?:\.\d)?\b/g) || [], checked };
  if (/^BTEC\b/.test(head) && !/Tech Award/.test(head)) {
    const h = head.replace(/^BTEC\s+(L3\s+)?/, '');
    let code = '';
    if ((m = /^Unit\s+(\d)\s+([A-G]\d?)/.exec(h))) code = `U${m[1]}.${m[2]}`;
    else if ((m = /^(U\d(?:\.[A-G]\d(?:\/[A-G]?\d)*)?)(?:\s+([A-G])\b)?/.exec(h))) code = m[1] + (m[2] ? `.${m[2]}` : '');
    return code ? { board: 'BTEC', codes: [code], checked } : null;
  }
  return null;
}

module.exports = function readSpecs(game, Cards) {
  const titles = new Map(Object.entries(Cards.TITLES).map(([id, t]) => [t.toLowerCase(), id]));
  const alias = { 'market share': 'market-share', 'leadership and management': 'leadership' };
  const rows = [];
  for (const f of FILES) {
    let topic = null;
    for (const line of fs.readFileSync(path.join(game, 'handoff', f), 'utf8').split('\n')) {
      const h = /^##\s+(.+?)\s*(\(.*\))?$/.exec(line);
      if (h) { const k = h[1].toLowerCase(); topic = titles.get(k) || alias[k] || null; continue; }
      const r = /^\|\s*(GCSE|A level)\s*\|\s*(\d)\s+([^|]+?)\s*\|\s*(.+?)\s*\|\s*$/.exec(line);
      if (!r || !topic) continue;
      const level = r[1] === 'GCSE' ? 'gcse-level-2' : 'a-level-3';
      for (const seg of segments(r[4])) {
        const ref = refOf(seg);
        if (ref && ref.codes.length) rows.push({ topic, level, lesson: Number(r[2]), handoffTitle: r[3], ...ref });
      }
    }
  }
  /* a correction replaces the table's own reference for that lesson and board */
  const key = (r) => [r.topic, r.level, r.lesson, r.board].join('|');
  const fixed = new Set(EXTRA.map(key));
  return rows.filter((r) => !fixed.has(key(r))).concat(EXTRA);
};
