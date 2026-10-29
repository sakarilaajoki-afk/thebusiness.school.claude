# Switch-on: topic cards (draft, 29.10.2026)

Nothing here is live. Do this in one commit, only when topic cards and the 8-hour game are released together and the owner says so.

## Files
| Draft | Replaces / goes to |
|---|---|
| `_draft-topics/trial/index.html` | `trial/index.html` (copy; delete the `noindex` meta; form, field names and script unchanged) |
| `_draft-topics/trial/thanks/index.html` | `trial/thanks/index.html` (three lines: no "2 November", no "per seat") |
| `_draft-topics/home-topics-block.html` | Insert into `index.html` before the comment `<!-- HOW TO USE IT`. Swap the image `src` to the re-shot picture. |
| `_draft-topics/topic-cards/index.html` | New page `topic-cards/index.html` (delete `noindex`; swap placeholder image paths). It replaces the old `topic-lessons/` page, which stays off. |

Also in the same commit:
1. Delete `_draft-topics/` and the `/_draft-topics/*` rule in `netlify.toml`.
2. Add `/topic-cards/` to `sitemap.xml`.
3. Delete `assets/tbs-web/topic/*` (old per-pupil topic lesson pictures, nothing uses them).
4. `/pricing/` is not touched.

## Old topic-lessons page: decision
Do not bring it back. It described one lesson per topic with each pupil running their own firm, a spec point on screen, "Business Week" links, "early access for pilot schools" and its own form. None of that is the product now. The new page is `/topic-cards/`, same look, and its buttons go to the one form at `/trial/` (`/trial/?want=licence` for the licence).

## Gallery order (home)
Re-shoot all pictures from the published game, then:
entry, lobby, setup (now shows board, level, topic), place, reveal, role, deal, **topic card**, **card result**, extra, fleet, stock, marketing, staff, loans, investments, sabotage, teacher (Live and Cards tabs), **teacher dashboard**, podium.
Captions: setup "You pick the class, the lesson length and the topic." / card "Each firm gets a deal card. The firm works out the numbers together." / result "A wrong answer shows the working." / dashboard "Every firm, every card, and the most common mistake."

## Pictures needed (all from the published game, none before release)
| File | Size | Used on |
|---|---|---|
| `assets/tbs-web/uk/uk-g-topic-card.jpg` pupil card, Cash flow, firm panel "3 of 4 agreed" | 1600x900 | home block, topic-cards page, gallery, og:image of topic-cards |
| `assets/tbs-web/uk/uk-g-topic-result.jpg` wrong answer with the working | 1600x900 | gallery |
| `assets/tbs-web/uk/uk-g-topic-dashboard.jpg` teacher Cards tab, 6 firms, 3 cards, most common mistakes | 1600x900 | topic-cards page, gallery |
| `assets/tbs-web/uk/uk-g-setup.jpg` setup with board, level, topic | 1600x900 | gallery |
| `assets/tbs-web/uk/uk-g-teacher.jpg` teacher page with Live and Cards tabs | 1600x900 | gallery |
| every other `uk-g-*.jpg`, film posters, `og-simulation.png` (1200x630) | as now | re-shoot if the screen changed (owner rule: one release) |
| US, AU, FI galleries and film covers | as now | same day, same rule |

Placeholders in `_draft-topics/assets/` (1366x768, from the build screenshots) must not ship.
Before release: view every page at 1280 and 390 wide.
