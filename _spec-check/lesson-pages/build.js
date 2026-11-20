#!/usr/bin/env node
'use strict';
/*
 * The topic-lesson parts of the UK pages, read from the released game.
 *
 *   node _spec-check/lesson-pages/build.js --game <game checkout>
 *
 * <game checkout> is a checkout of the released game (bs-multiplayer main).
 * - curriculum-mapping/index.html: "Topics and their lessons" for every UK course
 *   (COURSES): the game's topicChoices and lessonChoices, each lesson with its
 *   specification point (specs.js) and a tick where that point was checked
 *   against the board's PDF. Fails if a lesson the course offers has no row in
 *   the game's lesson split, or does not reach the page.
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
const specs = require('./specs.js')(GAME, Cards, require('../lesson-maps/maps.js'));

/* Order: GCSE and IGCSE, A level and IAL, BTEC, IB. id = the lesson map's id;
   board = the game's board; spec = the code prefix and the handoff's name. */
const COURSES = [
  { id: 'edexcel-gcse-1bs0', board: 'edexcel-gcse-1bs0', spec: '1BS0' },
  { id: 'aqa-gcse-8132', board: 'aqa-gcse-8132', spec: '8132' },
  { id: 'ocr-gcse-j204', board: 'ocr-gcse-j204', spec: 'J204' },
  { id: 'cambridge-igcse-0264', board: 'cambridge-igcse-0264', spec: '0264', name: 'Cambridge IGCSE Business (0264)' },
  { id: 'cambridge-igcse-0450', board: 'cambridge-igcse-0264', spec: '0450', name: 'Cambridge IGCSE Business Studies (0450)' },
  { id: 'edexcel-igcse-4bs1', board: 'pearson-igcse-4bs1', spec: '4BS1' },
  { id: 'edexcel-a-level-9bs0', board: 'edexcel-a-level-9bs0', spec: '9BS0' },
  { id: 'aqa-a-level-7132', board: 'aqa-a-level-7132', spec: '7132' },
  { id: 'aqa-a-level-7138', board: 'aqa-a-level-7138', spec: '7138', name: 'AQA A-level Business (7138)' },
  /* the game's one OCR A level course; the points are H436's */
  { id: 'ocr-a-level-h436', board: 'ocr-a-level-h436', spec: 'H436' },
  { id: 'edexcel-ial-business', board: 'pearson-ial-business', spec: 'IAL' },
  { id: 'btec-tech-award-enterprise', board: 'pearson-btec-l2-business', spec: 'TA', name: 'Pearson BTEC Tech Award in Enterprise', prefix: '' },
  { id: 'btec-l3-national', board: 'pearson-btec-l3-business', spec: 'BTEC', name: 'Pearson BTEC Level 3 National Extended Certificate in Business (601/7159/5)', prefix: '' },
  { id: 'ib-business-hl', board: 'ib-business-hl', spec: 'IB', name: 'IB Business Management HL', note: 'IB codes from the public subject outline.' },
  { id: 'ib-business-sl', board: 'ib-business-sl', spec: 'IB', name: 'IB Business Management SL', note: 'IB codes from the public subject outline.' },
];
/* the site's course ids for the game's boards (lesson-guides.json) */
const SITE_COURSE = { 'pearson-ial-business': 'edexcel-ial-business', 'pearson-igcse-4bs1': 'edexcel-igcse-4bs1', 'pearson-btec-l2-business': 'btec-tech-award-enterprise', 'pearson-btec-l3-business': 'btec-l3-extended-certificate' };

const boardOf = (id) => { const b = Cards.BOARDS.find((x) => x.id === id); if (!b) throw new Error(`no board ${id}`); return b; };
const topicsOf = (b) => Cards.topicChoices(b.course || '', b.id);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function replaceBetween(file, begin, end, text) {
  const p = path.join(SITE, file);
  const s = fs.readFileSync(p, 'utf8');
  const i = s.indexOf(begin); const j = s.indexOf(end, i + begin.length);
  if (i < 0 || j < i) throw new Error(`${file}: markers not found`);
  const out = s.slice(0, i + begin.length) + text + s.slice(j);
  if (out !== s) fs.writeFileSync(p, out);
  return out !== s;
}

/* 1. curriculum mapping */
const report = [];
const missing = [];
const boards = COURSES.map((c) => {
  const b = boardOf(c.board);
  const prefix = c.prefix !== undefined ? c.prefix : `${c.spec} `;
  let lessons = 0; let coded = 0; let ticked = 0; let fromMap = 0;
  const topics = topicsOf(b).map((t) => ({
    name: t.title,
    lessons: Cards.lessonChoices(t.id, b.level).map((l) => {
      lessons++;
      if (!specs.hasRow(t.id, b.level, l.lesson)) missing.push(`${c.id}: ${t.id} lesson ${l.lesson} "${l.title}" is not in the lesson split`);
      const r = specs.lookup(c.id, c.spec, t.id, b.level, l.lesson);
      if (r.codes.length) coded++;
      if (r.codes.length && r.checked) ticked++;
      if (r.from === 'map') fromMap++;
      const code = r.codes.length ? `${prefix}${r.codes.join(', ')}${r.checked ? ' ✓' : ''}` : '';
      return { n: l.lesson, title: l.title, code };
    }),
  }));
  report.push(`${c.id}: ${topics.length} topics, ${lessons} lessons, ${coded} with a point (${ticked} ✓, ${fromMap} from the lesson map)`);
  return { id: c.id, name: c.name || b.label, count: `${topics.length} topics · ${lessons} lessons`, note: c.note || '', topics };
});
const js = JSON.stringify(boards, null, 0).replace(/\},\{"(name|id)"/g, '},\n        {"$1"');
const changed1 = replaceBetween('curriculum-mapping/index.html', 'Do not edit by hand. */\n', '      /* LESSONS:END */',
  `      lessonBoards: ${js},\n`);
const options = `<option value="">All courses</option>${COURSES.map((c, i) => `<option value="${c.id}">${esc(boards[i].name)}</option>`).join('')}`;
const changed1b = replaceBetween('curriculum-mapping/index.html', '<select id="cm-course" class="cm-sel" aria-label="Your course">', '</select>', options);
/* every lesson of every course reached the page */
{
  const page = fs.readFileSync(path.join(SITE, 'curriculum-mapping/index.html'), 'utf8');
  const m = /lessonBoards: (\[[\s\S]*?\]),\n      \/\* LESSONS:END/.exec(page);
  const onPage = JSON.parse(m[1]);
  for (const c of COURSES) {
    const b = boardOf(c.board); const p = onPage.find((x) => x.id === c.id);
    for (const t of topicsOf(b)) for (const l of Cards.lessonChoices(t.id, b.level)) {
      const pt = p && p.topics.find((x) => x.name === t.title);
      if (!pt || !pt.lessons.some((x) => x.n === l.lesson && x.title === l.title)) missing.push(`${c.id}: ${t.id} lesson ${l.lesson} is not on the page`);
    }
  }
}
report.push(...missing);

/* 2. topic tasks example: Cash flow, GCSE */
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
report.push(`curriculum-mapping ${changed1 || changed1b ? 'updated' : 'unchanged'}, topic-tasks ${changed2 ? 'updated' : 'unchanged'}`);
console.log(report.join('\n'));
if (missing.length) console.error(`${missing.length} lessons missing: the page is not complete`);
process.exit(problems || missing.length ? 1 : 0);
