"""Generoi jakokortit fb-cards.json:sta. Vaatii palvelimen portissa 8899."""
import json, os, subprocess, urllib.parse, urllib.request
from PIL import Image

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = json.load(open(os.path.join(HERE, "fb-cards.json"), encoding="utf-8"))["cards"]
TMP = os.environ.get("TEMP", ".")

try:
    if "FB card template" not in urllib.request.urlopen(
            "http://localhost:8899/_spec-check/fb-card-template.html", timeout=5).read().decode("utf-8", "replace"):
        raise SystemExit("palvelin vastaa mutta ei anna pohjaa")
except Exception as e:
    raise SystemExit("palvelin ei vastaa portissa 8899 (%s)" % repr(e)[:60])

for slug, d in DATA.items():
    url = ("http://localhost:8899/_spec-check/fb-card-template.html?d="
           + urllib.parse.quote(json.dumps(d, ensure_ascii=False)))
    raw = os.path.join(TMP, "fb_%s.png" % slug)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    "--force-device-scale-factor=2", "--window-size=1200,630",
                    "--virtual-time-budget=6000", "--screenshot=" + raw, url],
                   capture_output=True, timeout=90)
    im = Image.open(raw).convert("RGB")
    if im.size != (2400, 1260):
        print("  %-40s ODOTTAMATON KOKO %s" % (slug, im.size)); continue
    r, g, b = im.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    if not (b > r and b > g and r < 110):          # tumma navy, ei valkoinen virhesivu
        print("  %-40s EI NAYTA KORTILTA %s" % (slug, (r, g, b))); continue
    im.save(os.path.join(ROOT, "resources", slug, "fb-card.png"))
    print("  %-40s ok" % slug)
print("valmis")
