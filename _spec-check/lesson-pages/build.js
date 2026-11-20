#!/usr/bin/env node
'use strict';
/*
 * The topic-lesson parts of the UK pages, read from the released game.
 *
 *   node _spec-check/lesson-pages/build.js --game <game checkout>
 *
 * <game checkout> is a checkout of the released game (bs-multiplayer main).
 * - curriculum-mapping/index.html: "Topics and their lessons" for 1BS0, 9BS0 and
 *   BTEC National (topicChoices, lessonChoices, and each lesson's Pearson
 *   reference from handoff/TUNNIT-JAKO-*.md; a tick only where the handoff
 *   marks it "checked against Pearson PDF").
 * - topic-tasks/index.html: the Cash flow GCSE example (Whole topic + its lessons).
 * - teacher-guides/lesson-guides.json: checked against the game (every lesson
 *   the course offers has its PDF, with the game's title); nothing is written.
 */
const fs = require('fs');
const path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const GAME = path.resolve(arg('--game', ''));
const SITE = path.resolve(__dirname, '../..');
if (!fs.existsSync(path.join(GAME, 'lib/motor-topic-cards.js'))) { console.error('--game <checkout of the game> is required'); process.exit(2); }
const Cards = require(path.join(GAME, 'lib/motor-topic-cards.js'));
const specs = require('./specs.js')(GAME, Cards);

const BOARDS = [
  { board: 'edexcel-gcse-1bs0', ref: '1BS0', name: 'Pearson Edexcel GCSE Business (1BS0)' },
  { board: 'edexcel-a-level-9bs0', ref: '9BS0', name: 'Pearson Edexcel A Level Business (9BS0)' },
  { board: 'pearson-btec-l3-business', ref: 'BTEC', name: 'Pearson BTEC Level 3 National Extended Certificate in Business (601/7159/5)' },
];
/* the site's course ids for the game's boards (lesson-guides.json) */
const SITE_COURSE = { 'pearson-ial-business': 'edexcel-ial-business', 'pearson-igcse-4bs1': 'edexcel-igcse-4bs1', 'pearson-btec-l2-business': 'btec-tech-award-enterprise', 'pearson-btec-l3-business': 'btec-l3-extended-certificate' };

const boardOf = (id) => { const b = Cards.BOARDS.find((x) => x.id === id); if (!b) throw new Error(`no board ${id}`); return b; };
const topicsOf = (b) => Cards.topicChoices(b.course || '', b.id);

function replaceBetween(file, begin, end, text) {
  const p = path.join(SITE, file);
  const s = fs.readFileSync(p, 'utf8');
  const i = s.indexOf(begin); const j = s.indexOf(end);
  if (i < 0 || j < i) throw new Error(`${file}: markers not found`);
  const out = s.slice(0, i + begin.length) + text + s.slice(j);
  if (out !== s) fs.writeFileSync(p, out);
  return out !== s;
}

/* 1. curriculum mapping */
const report = [];
const boards = BOARDS.map(({ board, ref, name }) => {
  const b = boardOf(board);
  let lessons = 0; let coded = 0; let ticked = 0;
  const topics = topicsOf(b).map((t) => ({
    name: t.title,
    lessons: Cards.lessonChoices(t.id, b.level).map((l) => {
      lessons++;
      const refs = specs.filter((r) => r.board === ref && r.topic === t.id && r.level === b.level && r.lesson === l.lesson);
      const codes = [...new Set(refs.flatMap((r) => r.codes))];
      const checked = refs.length > 0 && refs.every((r) => r.checked);
      if (codes.length) coded++;
      if (codes.length && checked) ticked++;
      const code = codes.length ? `${ref === 'BTEC' ? '' : ref + ' '}${codes.join(', ')}${checked ? ' ✓' : ''}` : '';
      return { n: l.lesson, title: l.title, code };
    }),
  }));
  report.push(`${ref}: ${topics.length} topics, ${lessons} lessons, ${coded} with a Pearson reference (${ticked} ticked)`);
  return { name, count: `${topics.length} topics · ${lessons} lessons`, topics };
});
const js = JSON.stringify(boards, null, 0).replace(/\},\{"name"/g, '},\n        {"name"');
const changed1 = replaceBetween('curriculum-mapping/index.html', 'Do not edit by hand. */\n', '      /* LESSONS:END */',
  `      lessonBoards: ${js},\n`);

/* 2. topic tasks example: Cash flow, GCSE */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ex = Cards.lessonChoices('cash-flow', 'gcse-level-2');
const exHtml = `\n      <div class="row"><b>${esc(Cards.TITLES['cash-flow'])}, GCSE</b><span>Whole topic</span>${ex.map((l) => `<span><i>${l.lesson}</i>${esc(l.title)}</span>`).join('')}</div>\n      `;
const changed2 = replaceBetween('topic-tasks/index.html', '<!-- lesson-example:begin (made by _spec-check/lesson-pages/build.js from the game) -->', '<!-- lesson-example:end -->', exHtml);

/* 3. teacher guides: every lesson of every course in lesson-guides.json, with the game's title */
const LG = JSON.parse(fs.readFileSync(path.join(SITE, 'teacher-guides/lesson-guides.json'), 'utf8')).lessons;
const courses = new Set(LG.map((l) => l.courseId));
let problems = 0;
for (const b of Cards.BOARDS) {
  const course = SITE_COURSE[b.id] || b.id;
  if (!courses.has(course)) { report.push(`teacher guides: no lesson PDFs for ${b.id}`); continue; }
  for (const t of topicsOf(b)) for (const l of Cards.lessonChoices(t.id, b.level)) {
    const g = LG.find((x) => x.courseId === course && x.topicId === t.id && x.lesson === l.lesson);
    if (!g) { problems++; report.push(`teacher guides: ${course} ${t.id} lesson ${l.lesson} has no PDF`); continue; }
    if (g.title !== l.title) { problems++; report.push(`teacher guides: ${course} ${t.id} ${l.lesson} "${g.title}" vs game "${l.title}"`); }
    if (!fs.existsSync(path.join(SITE, 'teacher-guides/pdf', g.file))) { problems++; report.push(`teacher guides: missing ${g.file}`); }
  }
}
report.push(`teacher guides: ${LG.length} lesson PDFs, ${problems} problems`);
report.push(`curriculum-mapping ${changed1 ? 'updated' : 'unchanged'}, topic-tasks ${changed2 ? 'updated' : 'unchanged'}`);
console.log(report.join('\n'));
process.exit(problems ? 1 : 0);
