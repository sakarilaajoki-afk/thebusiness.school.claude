'use strict';
/*
 * Year plans (assets/year-plans/yearplan-<id>.pdf and .jpg): when in the
 * school year each game lesson fits, month by month.
 *
 * Each plan reuses its lesson map (../lesson-maps/maps.js, same id): the map's
 * rows (specification areas) and the game topics and lessons on each row. The
 * plan only adds the teaching order and how long each area takes.
 *
 *   order   the one line on the page that names where the order comes from
 *   areas   the map's rows in teaching order, one per line:
 *             key | weight                     area of that relative length;
 *                                             its game topics spread evenly
 *             key | 3.1-3.5                    sub-sections 3.1 to 3.5, 1 each
 *             key | 3.1.1:4 3.1.2:4 ...        sub-sections with their hours
 *           A game topic with a code (e.g. "3.1.4 stakeholders-ethics:1" on
 *           the map) sits in its own sub-section.
 *           '# Year 2' starts Year 2 (where the source splits the years);
 *           without it the areas run on from Year 1 into Year 2.
 *           Omitted: the map's rows in map order, 1 each.
 *   key     the row's code; a letter code with its unit or component number
 *           (1A, 2C); a row with no code by its place (r1, r2, ...).
 *
 * Sources (scratchpad specs/, 18.11.2026):
 *   AQA 8132  scheme of work, two years: sections, years and suggested hours.
 *   AQA 7132  "How to co-teach AS and A-level": 3.1-3.6 in Year 12, 3.7-3.10
 *             in Year 13; sub-section counts from the specification.
 *   Pearson 9BS0 / IAL / AQA 7138: AS content (Themes/Units 1-2, 3.1-3.2) in
 *             Year 1, the rest in Year 2.
 *   BTEC      guided learning hours per component / unit, shared by its aims.
 *   AQA 7138  lengths as the matching 7132 sections.
 *   OCR H431  rows with a game topic 2, others 1 (no sub-sections to count).
 *   Others    specification order, sub-section counts as lengths.
 */
const range = (a, b, p) => Array.from({ length: b - a + 1 }, (_, i) => `${p}.${a + i}`).join(' ');
module.exports = [
  {
    id: 'aqa-gcse-8132', order: 'Order: AQA scheme of work (two years)',
    areas: `
3.1 | 3.1.1:4 3.1.2:4 3.1.3:3 3.1.4:2 3.1.5:2 3.1.6:4 3.1.7:4
3.2 | 3.2.1:3 3.2.2:5 3.2.3:4 3.2.4:4 3.2.5:2 3.2.6:2
3.4 | 3.4.1:4 3.4.2:4 3.4.3:5 3.4.4:2
# Year 2
3.3 | 3.3.1:5 3.3.2:6 3.3.3:5 3.3.4:3
3.5 | 3.5.1:1 3.5.2:2 3.5.3:6 3.5.4:16
3.6 | 3.6.1:3 3.6.2:3 3.6.3:4 3.6.4:5`,
  },
  {
    id: 'edexcel-gcse-1bs0', order: 'Order: Pearson specification order',
    areas: `
1.1 | 3
1.2 | 4
1.3 | 4
1.4 | 4
1.5 | 5
2.1 | 4
2.2 | 5
2.3 | 4
2.4 | 2
2.5 | 4`,
  },
  {
    id: 'aqa-a-level-7132', order: 'Order: AQA co-teaching guide (Year 12, Year 13), specification order',
    areas: `
3.1 | 3
3.2 | 3
3.3 | 4
3.4 | 5
3.5 | 4
3.6 | 5
# Year 2
3.7 | 8
3.8 | 2
3.9 | 4
3.10 | 4`,
  },
  {
    id: 'aqa-a-level-7138', order: 'Order: AQA specification order, AS units in Year 1',
    areas: `
3.1.1 | 3
3.1.2 | 3
3.1.3 | 4
3.1.4 | 4
3.2.1 | 6
3.2.2 | 5
3.2.3 | 2
# Year 2
3.3.1 | 2
3.3.2 | 6
3.3.3 | 6
3.3.4 | 4`,
  },
  {
    id: 'edexcel-a-level-9bs0', order: 'Order: Pearson specification order, AS themes in Year 1',
    areas: `
1.1 | 3
1.2 | 5
1.3 | 5
1.4 | 5
1.5 | 6
2.1 | 4
2.2 | 4
2.3 | 3
2.4 | 4
2.5 | 3
# Year 2
3.1 | 4
3.2 | 4
3.3 | 4
3.4 | 4
3.5 | 3
3.6 | 3
4.1 | 5
4.2 | 5
4.3 | 3
4.4 | 3`,
  },
  {
    id: 'edexcel-ial-business', order: 'Order: Pearson specification order, IAS units in Year 1',
    areas: `
1.3.1 | 3
1.3.2 | 5
1.3.3 | 5
1.3.4 | 5
1.3.5 | 6
2.3.1 | 4
2.3.2 | 4
2.3.3 | 3
2.3.4 | 4
2.3.5 | 3
# Year 2
3.3.1 | 4
3.3.2 | 4
3.3.3 | 4
3.3.4 | 4
3.3.5 | 3
3.3.6 | 3
4.3.1 | 5
4.3.2 | 5
4.3.3 | 3
4.3.4 | 3`,
  },
  {
    id: 'edexcel-igcse-4bs1', order: 'Order: Pearson specification order',
    areas: `
1 | ${range(1, 8, 1)}
2 | ${range(1, 5, 2)}
3 | ${range(1, 5, 3)}
4 | ${range(1, 3, 4)}
5 | ${range(1, 3, 5)}
App. 3 | 1`,
  },
  {
    id: 'btec-tech-award-enterprise', order: 'Order: Pearson specification order (components 1, 2, 3)',
    areas: `
1A | 12
1B | 12
1C | 12
2A | 12
2B | 12
2C | 12
3A | 16
3B | 16
3C | 16`,
  },
  {
    id: 'btec-l3-national', order: 'Order: Pearson specification order (units 1, 2, 3)',
    areas: `
1A | 18
1B | 18
1C | 18
1D | 18
1E | 18
2A | 20
2B | 20
2C | 20
3A | 20
3B | 20
3C | 20
3D | 20
3E | 20
3F | 20`,
  },
  {
    id: 'ocr-gcse-j204', order: 'Order: OCR specification order',
    areas: `
1 | ${range(1, 6, 1)}
2 | ${range(1, 4, 2)}
3 | ${range(1, 7, 3)}
4 | ${range(1, 6, 4)}
5 | ${range(1, 5, 5)}
6 | ${range(1, 3, 6)}
7 | 2`,
  },
  {
    id: 'ocr-a-level-h431', order: 'Order: OCR specification order',
    areas: `
r1 | 1
r2 | 2
r3 | 2
r4 | 1
r5 | 2
r6 | 2
r7 | 2
r8 | 1
r9 | 1
r10 | 2
r11 | 2
r12 | 2
r13 | 1
r14 | 1
r15 | 1
r16 | 2
r17 | 2
r18 | 1
r19 | 1
r20 | 1
r21 | 2
r22 | 1
r23 | 1
r24 | 1`,
  },
  {
    id: 'ocr-a-level-h436', order: 'Order: OCR specification order',
    areas: `
1 | ${range(1, 6, 1)}
2 | ${range(1, 7, 2)}
3 | ${range(1, 8, 3)}
4 | ${range(1, 7, 4)}
5 | ${range(1, 7, 5)}
6 | ${range(1, 3, 6)}
7 | ${range(1, 7, 7)}`,
  },
  {
    id: 'cambridge-igcse-0264', order: 'Order: Cambridge syllabus order',
    areas: `
1 | ${range(1, 5, 1)}
2 | ${range(1, 4, 2)}
3 | ${range(1, 4, 3)}
4 | ${range(1, 6, 4)}
5 | ${range(1, 5, 5)}
6 | ${range(1, 3, 6)}`,
  },
  {
    id: 'cambridge-igcse-0450', order: 'Order: Cambridge syllabus order',
    areas: `
1 | ${range(1, 5, 1)}
2 | ${range(1, 4, 2)}
3 | ${range(1, 4, 3)}
4 | ${range(1, 4, 4)}
5 | ${range(1, 5, 5)}
6 | ${range(1, 3, 6)}`,
  },
  {
    id: 'ib-business-hl', order: 'Order: IB guide order',
    areas: `
Unit 1 | ${range(1, 6, 1)}
Unit 2 | ${range(1, 6, 2)}
Unit 3 | ${range(1, 9, 3)}
Unit 4 | ${range(1, 6, 4)}
Unit 5 | ${range(1, 9, 5)}`,
  },
  {
    id: 'ib-business-sl', order: 'Order: IB guide order',
    areas: `
Unit 1 | ${range(1, 6, 1)}
Unit 2 | ${range(1, 5, 2)}
Unit 3 | ${range(1, 8, 3)}
Unit 4 | ${range(1, 5, 4)}
Unit 5 | ${range(1, 5, 5)}`,
  },
];
