"""
Korjaa AQA GCSE Business 8132 Paper 2 -korttipakan tekniikkakortit 13, 14, 15 ja 16
AQA:n omia pisteytysohjeita vasten.

Lahteet, avattu 13.8.2026:
  AQA 8132/2 mark scheme June 2023 ja June 2022, AQA 8132/1 mark scheme June 2023
    9 pisteen kysymys  = "Recommend ... Give reasons for your answer."
                         AO2 3 + AO3 6. Taso 3 (7-9) vaatii "a focused conclusion
                         that is fully justified". Johtopaatos on siis pakollinen.
    12 pisteen kysymys = "Analyse the effect of each of these two options ...
                         Evaluate which ..."  AO1 3 + AO2 3 + AO3 6.
    6 pisteen kysymys  = "Analyse ..."  AO2 3 + AO3 3, ei johtopaatosta.

Vanha versio vaitti 9 pisteen kysymysta Analyseksi ja kielsi johtopaatoksen.
Se olisi kattanyt vastauksen tasolle 2 eli 6 pisteeseen yhdeksasta.

Alkuperainen PDF on tehty ReportLabilla eika lahdetta ole tallessa, joten tama
paikkaa vain vaarat tekstit paikallaan. Muut 12 korttia ja taitto sailyvat.
Aja taman kansion juuresta:  python fix-technique-cards.py
"""
import fitz, shutil

SRC   = "AQA-GCSE-Business-8132-Paper-2-Flashcards.pdf"
INK   = (26/255, 26/255, 26/255)
BOLD, PLAIN = "hebo", "helv"
def L(top, size=10.0):          # bbox-ylareunasta perusviivalle
    return top + (10.7 if size == 10.0 else 12.3)

# Poistettavat tekstit. Kortti 14:n kursiivi 'discriminator' poistetaan
# suorakulmiolla, koska sama sana esiintyy myos kortissa 16 joka on oikein.
KILL_TEXT = [
    (6, "What does the examiner award marks for on a 9-mark Analyse"),
    (6, "question?"),
    (6, "What does the examiner award marks for on a 12-mark Justify or"),
    (6, "Recommend question?"),
    (7, "AO1 (2 marks)"), (7, "state the relevant theory or formula in one sentence."),
    (7, "AO2 (3 marks)"), (7, "apply it using "), (7, " specific facts from the stimulus."),
    (7, "AO3 (4 marks)"), (7, "develop two chains of reasoning, one for and one against,"),
    (7, "finishing each with 'this matters because...'."),
    (7, "Do not write a conclusion."), (7, " Judgement is not required"),
    (7, "time spent on one"), (7, "loses marks elsewhere."),
    (7, "state the decision and the relevant theory."),
    (7, "apply both options to the business using three specific facts."),
    (7, "AO3 (7 marks)"),
    (7, "balanced analysis of both options + identify a "),
    (7, "reach a justified judgement + name what would change your mind."),
    (7, "develop two chains of reasoning, balanced. No judgement needed."),
    (7, "Justify / Recommend"),
    (7, "analyse both sides + pick one + say why + say what"),
    (7, "would change your mind."),
]
# kortin 14 kursiivi 'discriminator' ja sita seuraava ' +'
KILL_RECT = [(7, fitz.Rect(722.0, 386.0, 795.0, 398.0)),
             (7, fitz.Rect(448.4, 155.5, 812.0, 168.5)),   # kortti 16 rivi 6
             (7, fitz.Rect(183.0, 362.0, 205.0, 374.0))]   # kortin 13 kursiivi 'two'
# orpo erotinviiva, jolle ei enaa tule riviä
WHITEOUT  = [(7, fitz.Rect(287.0, 417.5, 296.5, 423.5)),
             (7, fitz.Rect(145.8, 143.0, 153.2, 148.0))]   # kortti 15: vanha erotinviiva

WRITE = [
    # ---- Kortti 13, kysymys: 9 pisteen kysymys on Recommend
    (6,  41.1, L(74.3,11.5), BOLD, 11.5, "What does the examiner award marks for on the 9-mark"),
    (6,  41.1, L(88.8,11.5), BOLD, 11.5, "Recommend question?"),
    # ---- Kortti 14, kysymys: 12 pisteen kysymys on Analyse + Evaluate
    (6, 439.4, L(74.3,11.5), BOLD, 11.5, "What does the examiner award marks for on the 12-mark"),
    (6, 439.4, L(88.8,11.5), BOLD, 11.5, "Analyse and Evaluate question?"),

    # ---- Kortti 13, vastaus: AO2 3 + AO3 6, johtopaatos pakollinen
    (7,  41.1, L(349.4), BOLD, 10.0, "AO2 (3 marks)"),
    (7, 124.5, L(349.4), PLAIN,10.0, "apply to the firm in the case, using its own figures."),
    (7,  41.1, L(366.4), BOLD, 10.0, "AO3 (6 marks)"),
    (7, 124.5, L(366.4), PLAIN,10.0, "developed chains of analysis, then a conclusion."),
    (7,  41.1, L(383.4), BOLD, 10.0, "Level 3 needs"),
    (7, 124.5, L(383.4), PLAIN,10.0, "a focused conclusion that is fully justified."),
    (7,  41.1, L(396.3), PLAIN,10.0, "Without one the answer is capped at 6 of 9."),

    # ---- Kortti 14, vastaus: AO1 3 + AO2 3 + AO3 6
    (7, 439.4, L(349.4), BOLD, 10.0, "AO1 (3 marks)"),
    (7, 522.7, L(349.4), PLAIN,10.0, "state the decision and the relevant theory."),
    (7, 439.4, L(366.4), BOLD, 10.0, "AO2 (3 marks)"),
    (7, 522.7, L(366.4), PLAIN,10.0, "apply both options to the firm using its own figures."),
    (7, 439.4, L(383.4), BOLD, 10.0, "AO3 (6 marks)"),
    (7, 522.7, L(383.4), PLAIN,10.0, "analyse both options, then evaluate which has"),
    (7, 439.4, L(396.3), PLAIN,10.0, "more impact. Level 4 wants one integrated judgement."),

    # ---- Kortti 15: Analyse on 6 pistetta, Recommend on 9 pistetta
    (7,  95.0, L(121.4), PLAIN,10.0, "the 6-mark question. Two developed chains. No judgement."),
    (7,  41.1, L(138.4), BOLD, 10.0, "Recommend (9 marks)"),
    (7,  41.1, L(151.4), PLAIN,10.0, "with a justified conclusion."),

    # ---- Kortti 16, kohta 6 kaannetaan toisin pain
    (7, 447.7, L(159.4), PLAIN,10.0, " Finish the 9-mark Recommend with a justified conclusion."),
]

d = fitz.open(SRC)
n = 0
for pno, needle in KILL_TEXT:
    for r in d[pno].search_for(needle):
        d[pno].add_redact_annot(r + (-0.6, -1.6, 0.6, 1.6)); n += 1
for pno, r in KILL_RECT:
    d[pno].add_redact_annot(r); n += 1
for pno in (6, 7):
    try:
        d[pno].apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE,
                                graphics=fitz.PDF_REDACT_LINE_ART_NONE)
    except TypeError:
        d[pno].apply_redactions()
for pno, r in WHITEOUT:
    d[pno].draw_rect(r, color=None, fill=(1, 1, 1))
for pno, x, y, font, size, txt in WRITE:
    d[pno].insert_text((x, y), txt, fontname=font, fontsize=size, color=INK)

# Kortti 15, Recommend-rivi: erotinviiva ja teksti otsikon leveyden mukaan
lbl = "Recommend (9 marks)"
w   = fitz.get_text_length(lbl, fontname=BOLD, fontsize=10.0)
dx  = 41.1 + w + 5.7
d[7].draw_line((dx, 145.5), (dx + 4.2, 145.5), color=INK, width=0.7)
d[7].insert_text((dx + 9.8, L(138.4)), "analyse, pick one, say why, and finish",
                 fontname=PLAIN, fontsize=10.0, color=INK)

TMP = SRC + ".tmp"
d.save(TMP, deflate=True, garbage=3); d.close()
shutil.move(TMP, SRC)
print(f"poistettu {n} aluetta, kirjoitettu {len(WRITE)} rivia")
