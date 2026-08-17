"""Generoi neljan paketin kansikuvat covers.json:sta.

Vanhat kannet olivat kertaluontoisia kuvia, joihin teksti oli poltettu. Siksi
niissa luki yha vaara sivumaara ja poistuva koodi pitkaan sen jalkeen kun
paketti itse oli korjattu: tekstihaku ei loyda virhetta JPEGin sisalta.

Vaatii paikallisen palvelimen portissa 8899 (fontit ja sivu ladataan sielta).
"""
import json, os, subprocess, urllib.parse, io
from PIL import Image

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = json.load(open(os.path.join(HERE, "covers.json"), encoding="utf-8"))["covers"]

# Ilman tata skripti kirjoitti kerran Chromen "site can't be reached" -sivun
# neljan kannen paalle, koska palvelin oli sammunut. Tarkista ensin.
import urllib.request
try:
    probe = urllib.request.urlopen(
        "http://localhost:8899/_spec-check/cover-template.html", timeout=5).read().decode("utf-8", "replace")
    if "Cover template" not in probe:
        raise SystemExit("palvelin vastaa mutta ei anna pohjaa, keskeytetaan")
except Exception as e:
    raise SystemExit("palvelin ei vastaa portissa 8899 (%s). Kaynnista se ensin." % repr(e)[:60])
OUT = os.path.join(ROOT, "resources", "covers")
TMP = os.environ.get("TEMP", ".")

for slug, d in DATA.items():
    payload = urllib.parse.quote(json.dumps(d, ensure_ascii=False))
    url = "http://localhost:8899/_spec-check/cover-template.html?d=" + payload
    raw = os.path.join(TMP, "cov_%s.png" % slug)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    "--force-device-scale-factor=2", "--window-size=640,480",
                    "--virtual-time-budget=6000", "--screenshot=" + raw, url],
                   capture_output=True, timeout=90)
    im = Image.open(raw).convert("RGB")
    if im.size != (1280, 960):
        print("  %-26s ODOTTAMATON KOKO %s" % (slug, im.size)); continue
    # tumma vihrea tausta on kannen tuntomerkki; virhesivu on valkoinen
    r, g, b = im.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    if not (g > r and g > b and r < 120):
        print("  %-26s EI NAYTA KANNELTA (keskivari %s), ohitetaan" % (slug, (r, g, b))); continue
    im.resize((640, 480), Image.LANCZOS).save(
        os.path.join(OUT, slug + ".jpg"), quality=88, optimize=True)
    print("  %-26s ok" % slug)
print("valmis")
