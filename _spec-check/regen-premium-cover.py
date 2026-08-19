"""Generoi IGCSE 0455 -premium-kannen. Vaatii palvelimen portissa 8899.

Vanha kansi lupasi 116 sivua (todellinen 120) ja "the eleven diagrams", kun
paketin oma naytesivu sanoo kolmetoista. Sivumaara on laskettu PDF:sta.
Kuvaajaluku on poistettu, koska sita ei ole pystytty ratkaisemaan.
"""
import json, os, subprocess, urllib.parse, urllib.request
from PIL import Image

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
TMP = os.environ.get("TEMP", ".")
DEST = os.path.join(ROOT, "resources", "igcse-economics-0455-complete-year", "IGCSE-0455-COVER.png")

D = {
 "eyebrow": "CAMBRIDGE IGCSE  |  ECONOMICS 0455",
 "title": "IGCSE ECONOMICS",
 "badge": "THE COMPLETE YEAR",
 "meta1": "FULL SYLLABUS  |  30 WEEKS  |  90 PLANNED HOURS",
 "meta2": "SIX ASSESSED UNITS  |  EVERY ANSWER INCLUDED",
 "bullets": [
   "60 taught lessons with tasks, data and full answers",
   "Six unit assessments, 270 marks, full mark schemes",
   "Six question banks running 30 practice hours",
   "30 retrieval quizzes, 150 questions with answers",
   "Written against the 2026 syllabus, with the 2027 to 2029 figures alongside",
   "PDF, editable Word and PowerPoint included"],
 "footline": "120 PAGES  |  PRINT AND TEACH  |  FREE SAMPLE BEFORE YOU BUY",
 "star1": ["THE", "PREMIUM", "PACK"],
 "star2": ["FULLY", "EDITABLE"],
}

try:
    if "Premium cover template" not in urllib.request.urlopen(
            "http://localhost:8899/_spec-check/premium-cover-template.html", timeout=5).read().decode("utf-8","replace"):
        raise SystemExit("palvelin ei anna pohjaa")
except Exception as e:
    raise SystemExit("palvelin ei vastaa portissa 8899 (%s)" % repr(e)[:60])

raw = os.path.join(TMP, "prem0455.png")
url = ("http://localhost:8899/_spec-check/premium-cover-template.html?d="
       + urllib.parse.quote(json.dumps(D, ensure_ascii=False)))
subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                "--force-device-scale-factor=2", "--window-size=1200,900",
                "--virtual-time-budget=6000", "--screenshot=" + raw, url],
               capture_output=True, timeout=90)
im = Image.open(raw).convert("RGB")
if im.size != (2400, 1800):
    raise SystemExit("odottamaton koko %s" % (im.size,))
r, g, b = im.resize((1,1), Image.LANCZOS).getpixel((0,0))
if r < 150:                                  # valkopohjainen kansi
    raise SystemExit("ei nayta kannelta, keskivari %s" % ((r,g,b),))
im.resize((1200, 900), Image.LANCZOS).save(DEST)
print("IGCSE-0455-COVER.png ok")
