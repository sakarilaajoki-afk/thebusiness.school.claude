# -*- coding: utf-8 -*-
"""Check the two published packs back against the board PDFs, claim by claim.

Reads the SHIPPED pdf, not the draft HTML, so what is checked is what a teacher
downloads. A quote must appear in the board document character for character
after whitespace and quote-mark normalisation. A number must appear in the pack
AND in the board document in the stated context.

Exit code is non-zero if anything fails.
"""
import io, os, re, sys, unicodedata
import fitz

BOARD = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'board')
SITE = r'C:\Users\sakar\OneDrive\Tiedostot\Claude\Projects\rahoitus haku\thebusiness.school.claude'

PACKS = {
    'BUS': os.path.join(SITE, 'resources', 'a-level-business-7138-switchover',
                        'A-Level-Business-7138-The-Switchover-Pack.pdf'),
    'ECO': os.path.join(SITE, 'resources', 'a-level-economics-first-term-survival-pack',
                        'A-Level-Economics-The-First-Term-Survival-Pack.pdf'),
}

SOURCES = {
    '7138': 'aqa-7137-7138-spec.pdf',
    '7132': 'aqa-7131-7132-spec.pdf',
    '7132p1': 'aqa-71321-ms-jun23.pdf',
    '7132p2': 'aqa-71322-ms-jun23.pdf',
    '7132p3': 'aqa-71323-ms-jun23.pdf',
    '7136': 'aqa-7135-7136-spec.pdf',
    '7136p1': 'aqa-71361-ms-jun23.pdf',
    '9ec0': 'edx-9ec0-gsg.pdf',
}


def norm(s):
    s = unicodedata.normalize('NFKC', s)
    s = (s.replace(u'\u2019', "'").replace(u'\u2018', "'")
          .replace(u'\u201c', '"').replace(u'\u201d', '"')
          .replace(u'\u2013', '-').replace(u'\u2014', '-')
          .replace(u'\u00a0', ' ').replace(u'\u2022', '.'))
    s = re.sub(r'\s+', ' ', s).strip()
    # AQA's PDF line-wraps inside "May/ June"; Pearson's bullets extract as "\u2022 "
    return s.replace('/ ', '/').replace('. .', '.')


def text(path):
    d = fitz.open(path)
    t = norm(' '.join(p.get_text() for p in d))
    d.close()
    return t


print('reading documents...')
pack = {k: text(v) for k, v in PACKS.items()}
src = {k: text(os.path.join(BOARD, v)) for k, v in SOURCES.items()}

fails, checks = [], 0


def quote(pack_key, src_key, fragment, label):
    """The pack prints this; the board document must contain it verbatim."""
    global checks
    checks += 1
    f = norm(fragment)
    in_pack = f in pack[pack_key]
    in_src = f in src[src_key]
    if not (in_pack and in_src):
        fails.append('%s QUOTE %s | in pack: %s | in %s: %s | "%s"'
                     % (pack_key, label, in_pack, src_key, in_src, f[:80]))


def fact(pack_key, src_key, pack_str, src_str, label):
    """The pack states this; the board document states that."""
    global checks
    checks += 1
    p, s = norm(pack_str), norm(src_str)
    in_pack = p in pack[pack_key]
    in_src = s in src[src_key]
    if not (in_pack and in_src):
        fails.append('%s FACT  %s | in pack: %s | in %s: %s | pack="%s" src="%s"'
                     % (pack_key, label, in_pack, src_key, in_src, p[:60], s[:60]))


def absent(pack_key, fragment, label):
    global checks
    checks += 1
    if norm(fragment) in pack[pack_key]:
        fails.append('%s ABSENT %s | pack still contains "%s"' % (pack_key, label, fragment))


# ------------------------------------------------------------------ BUSINESS
print('checking the Business pack against AQA 7137/7138, 7132 and three 2023 mark schemes')

quote('BUS', '7138', 'Assessments and certification for the AS specification are available for the '
      'first time in May/June 2027', 'AS first assessment')
quote('BUS', '7138', 'Assessments and certification for the A-level specification are available '
      'for the first time in May/June 2028', 'A-level first assessment')

fact('BUS', '7138', 'Two case studies, each followed by five compulsory questions worth 45 marks in total',
     'Two case studies. Each case study will be followed by five compulsory questions worth 45 marks in total',
     'A-level question count')
fact('BUS', '7138', 'Two case studies, each followed by six compulsory questions worth 40 marks in total',
     'Two case studies. Each case study will be followed by six compulsory questions worth 40 marks in total',
     'AS question count')
fact('BUS', '7138', 'Total scaled mark 270', 'Total scaled mark: 270', 'A-level scaled total')
fact('BUS', '7138', 'Total scaled mark 160', 'Total scaled mark: 160', 'AS scaled total')
fact('BUS', '7138', '8.14 8.14 8.89 8.14', 'AO1 8.14 8.14 8.14 24.44', 'per-paper AO')
fact('BUS', '7138', '24.44 24.44 26.66 24.44', 'AO3 8.89 8.89 8.89 26.66', 'overall AO')
fact('BUS', '7138', 'AO1 32.5, AO2 27.5, AO3 20, AO4 20', 'AO1 16.25 16.25 32.5', 'AS AO')

fact('BUS', '7138', 'Knowledge and understanding only.', 'Define* Knowledge and understanding only. (AO1) 2', 'Define 2')
fact('BUS', '7138', 'Demonstrate knowledge and understanding of a business term or concept in the context of the case study material provided.',
     'Demonstrate knowledge and understanding of a business term/concept in the context of the case study material provided. (AO1 and AO2) 4', 'Explain 4')
fact('BUS', '7138', 'Analyse an issue in the context of the case study material provided.',
     'Analyse an issue in the context of the case study material provided. (AO1, AO2, AO3) 6', 'Analyse 6')
fact('BUS', '7138', 'This question type requires a judgement.',
     'This question type requires a judgement. (AO1, AO2, AO3, AO4) 9', 'Assess 9')
fact('BUS', '7138', 'Evaluate 15', 'and make a judgement of which the business should choose. (AO1, AO2, AO3, AO4) 15', 'Evaluate 15')
fact('BUS', '7138', 'used in AS assessment only', '*used in AS assessment only', 'AS-only footnote')

quote('BUS', '7138', 'Learners that make use of relevant theories, concepts, models and frameworks in '
      'their responses, that are not the direct focus of a question are making use of sophisticated concepts.',
      'sophisticated concepts definition')
fact('BUS', '7138', 'all 15 mark questions award the use of sophisticated concepts',
     'All 15-mark questions award the use of sophisticated concepts (Annex 8). Accurate use will be credited.',
     'sophisticated concepts credited')
fact('BUS', '7138', 'identified as a typical characteristic of a Level 5 response',
     'identified as a typical characteristic of a Level 5 response', 'Level 5')
fact('BUS', '7138', 'where the use of sophisticated concepts is demonstrated in any response, the impact on the quality of analysis will be recognised',
     'where the use of sophisticated concepts is demonstrated in any response, the impact on the quality of analysis will be recognised',
     'not gated to top band')
fact('BUS', '7138', 'a 15 mark question numbered 2.5',
     'One 15-mark question in paper 3 (e.g. SAMs Question 2.5)', 'SAMs 2.5 is 15 marks')

fact('BUS', '7138', 'synopticity is especially relevant in AS paper 2 and A-level paper 3',
     'This is especially relevant in AS paper 2 and A-level paper 3', 'synoptic')

# 7138 unit titles, as printed in the pack
for code, title in [('3.1.4', 'Financial management'), ('3.2.3', 'Managing business culture'),
                    ('3.3.3', 'Strategy'), ('3.3.4', 'Change'),
                    ('3.3', 'Business and society, business and the external environment, and business strategy')]:
    fact('BUS', '7138', title, title, '7138 title %s' % code)

# 7132 section titles
for title in ['Managers, leadership and decision making', 'Operational management',
              'Human resource management', 'Choosing strategic direction']:
    fact('BUS', '7132', title, title, '7132 title')

# 7132 June 2023 tariffs actually seen in those mark schemes
for key, tariffs in [('7132p1', [4, 9, 25]), ('7132p2', [3, 4, 6, 9, 16]), ('7132p3', [12, 16, 20, 24])]:
    checks += 1
    seen = sorted(set(int(m) for m in re.findall(r'\[(\d{1,2}) marks?\]', src[key])))
    if seen != sorted(tariffs):
        fails.append('BUS TARIFF %s | pack says %s | mark scheme has %s' % (key, tariffs, seen))

fact('BUS', '7138', 'the whole of Unit 3.3',
     '3.3 Unit: Business and society, business and the external environment, and business strategy (A-level only)',
     'Unit 3.3 is A-level only')
absent('BUS', 'it is 3.3.3, 3.3.4 and 3.2.3, spread through two units', 'the old wrong A-level-only claim')
absent('BUS', 'the A-level only material sits inside them rather than after them', 'the old wrong block claim')
absent('BUS', 'stand-alone', 'unsourced "stand-alone qualification"')
absent('BUS', 'Total scaled mark 140', 'the old wrong AS total')
absent('BUS', 'Specimen papers are the source', 'the claim that SAMs are unpublished')

# ----------------------------------------------------------------- ECONOMICS
print('checking the Economics pack against AQA 7135/7136, its 2023 mark scheme and Pearson 9EC0')

fact('ECO', '7136', '80 marks', 'written exam: 2 hours . 80 marks . 33.3% of A-level', 'AQA paper format')
fact('ECO', '9ec0', '100 marks', 'each comprising 100 marks and 2 hours in duration', 'Edexcel paper format')
fact('ECO', '9ec0', 'one extended open-response question, one from two',
     'Section C: One extended open-response question. Students select one from a choice of two.', 'Edexcel Section C')
fact('ECO', '7136', 'Total scaled mark 240', 'Total scaled mark: 240', 'AQA scaled total')
fact('ECO', '7136', 'A multiple choice, 30 marks. B case study, 50 marks.',
     'Section A: multiple choice questions worth 30 marks . Section B: case study questions requiring written answers, worth 50 marks',
     'AQA Paper 3 sections')
fact('ECO', '7136', '5 to 8 7 to 10 9 to 11 7 to 10', 'AO1 5-8 5-8 7-10 20-23', 'AQA AO ranges')
fact('ECO', '7136', '20 to 23 26 to 29 26 to 29 22 to 25', 'AO4 7-10 7-10 5-8 22-25', 'AQA AO overall')

quote('ECO', '7136', 'The assessment of quantitative skills will include at least Level 2 mathematical '
      'skills as a minimum of 20% of the overall A-level marks.', 'AQA 20%')
for skill in ['calculate, use and understand ratios and fractions',
              'understand and use the terms mean, median and relevant quantiles',
              'calculate cost, revenue and profit (marginal, average, totals)',
              'make calculations to convert from money to real terms',
              'interpret, apply and analyse information in written, graphical and numerical forms']:
    quote('ECO', '7136', skill, 'quant skill')

quote('ECO', '7136p1', 'includes supported evaluation throughout the response and in a final conclusion.',
      '25-mark top band')
quote('ECO', '7136p1', 'A good response provides an answer that:', '15-mark top band opening')
quote('ECO', '7136p1', 'includes well-focused analysis with clear, logical chains of reasoning.',
      'chains of reasoning')
quote('ECO', '7136p1', 'includes some reasonable, supported evaluation.', '25-mark level 4')
fact('ECO', '7136p1', 'Total for this context: 40 marks', 'Total for this context: 40 marks', 'context total')
fact('ECO', '7136p1', 'Total for this essay: 40 marks', 'Total for this essay: 40 marks', 'essay total')

# the 15-mark grid must not mention evaluation: check the grid page itself
checks += 1
d = fitz.open(os.path.join(BOARD, SOURCES['7136p1']))
grid15 = norm(d[15].get_text())
d.close()
if 'evaluat' in grid15.lower():
    fails.append('ECO CLAIM | the 15-mark grid page DOES mention evaluation, the pack says it does not')

quote('ECO', '9ec0', 'with a minimum of 20% of the total marks across the A level', 'Edexcel 20%')
quote('ECO', '9ec0', 'and evaluation which is supported by chains of reasoning, in context and balanced.',
      'Assess wording')
quote('ECO', '9ec0', 'and evaluation which is supported by relevant reasoning, in context and balanced.',
      'Discuss wording')
quote('ECO', '9ec0', 'with critical awareness and informed judgements.', 'To what extent wording')

absent('ECO', 'are both unchanged for a course starting', 'the unsourced Pearson currency claim')
# Pearson's two pages say different things, and the pack quotes both
checks += 1
for q in ['learners beginning the course in September 2026 will continue to follow the current established specification',
          'we are now considering the implications for A level Economics. We will keep you informed of any further developments.']:
    if norm(q) not in pack['ECO']:
        fails.append('ECO QUOTE Pearson currency | pack is missing "%s"' % q[:60])

# ------------------------------------------------------------- the arithmetic
print('checking the arithmetic printed in the Economics baseline test')
ARITH = [
    ('Q1 ratio 3:5 of 4800', 4800 * 5 / 8.0, 3000),
    ('Q2 2.40 to 2.61', round((2.61 - 2.40) / 2.40 * 100, 1), 8.8),
    ('Q3 mean', sum([310, 290, 470, 305, 300]) / 5.0, 335),
    ('Q3 median', sorted([310, 290, 470, 305, 300])[2], 305),
    ('Q4 104.2 to 101.9', round((101.9 - 104.2) / 104.2 * 100, 1), -2.2),
    ('Q5 index 1.41/1.25', round(1.41 / 1.25 * 100, 2), 112.80),
    ('Q6 revenue', 200 * 26, 5200),
    ('Q6 profit', 200 * 26 - 3600, 1600),
    ('Q6 average cost', 3600 / 200.0, 18),
    ('Q6 marginal cost', 3617 - 3600, 17),
    ('Q7 real wage', round(546 / 1.07, 2), 510.28),
    ('Q7 real change', round((546 / 1.07 - 520) / 520 * 100, 1), -1.9),
    ('Q8 PED', round((120 / 800.0) / (-0.50 / 5.00), 1), -1.5),
    ('Q8 new revenue', round(4.5 * 920, 0), 4140),
    ('Q9 as a percentage', round(0.3 / 4.1 * 100, 1), 7.3),
]
for label, got, printed in ARITH:
    checks += 1
    if abs(got - printed) > 1e-9:
        fails.append('ECO MATHS %s | computed %s | pack prints %s' % (label, got, printed))

# and the two totals quoted on the twenty per cent page
for label, got, printed in [('20% of AQA 240', 0.20 * 240, 48), ('20% of Edexcel 300', 0.20 * 300, 60)]:
    checks += 1
    if abs(got - printed) > 1e-9:
        fails.append('ECO MATHS %s | computed %s | pack prints %s' % (label, got, printed))

# the 45-mark deduction on Business page 6
checks += 1
from itertools import combinations_with_replacement as cwr
sets45 = [c for c in cwr([6, 9, 15], 5) if sum(c) == 45]
with15 = [c for c in sets45 if 15 in c]
if sorted(sets45) != [(6, 6, 9, 9, 15), (9, 9, 9, 9, 9)] or with15 != [(6, 6, 9, 9, 15)]:
    fails.append('BUS MATHS 45-mark deduction | sets=%s | with a 15=%s' % (sets45, with15))

# ------------------------------------------------------------------- verdict
print()
print('%d checks run' % checks)
if fails:
    print('%d FAILED:' % len(fails))
    for f in fails:
        print('  ' + f)
    sys.exit(1)
print('all passed')
