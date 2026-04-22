# The Business School — SEO Roadmap

**Domain:** thebusiness.school
**GitHub:** github.com/sakarilaajoki-afk/thebusiness.school.claude
**Target audience:** UK A-Level Business Studies teachers (Sixth Form, Year 12–13)
**Timeline:** 6 weeks → 6 months
**Owner:** Sakari Laajoki (non-technical). Claude edits locally, Sakari pushes.
**Last updated:** 2026-04-22

---

## Current state (baseline audit — 22 April 2026)

What's live on `thebusiness.school` today:

| Check | Status | Note |
|---|---|---|
| Title tag | ✅ OK | "The Business School — Live Business Simulation for Classrooms" (60 chars) |
| Meta description | ⚠️ TOO LONG | ~370 chars — Google truncates at ~160 |
| Canonical URL | ❌ Missing | |
| Open Graph tags | ❌ Missing | LinkedIn / Facebook shares look broken |
| Twitter Card tags | ❌ Missing | |
| Schema.org JSON-LD | ❌ Missing | No `Organization`, `EducationalOrganization`, `Course` |
| robots.txt | ❌ 404 | |
| sitemap.xml | ⚠️ Returns 200 but not a real sitemap | SPA fallback |
| Blog / content hub | ❌ None | |
| Image alt tags | ❓ To verify | |
| Mobile responsive | ❓ To verify | |
| Core Web Vitals | ❓ To verify via Lighthouse | |

**Verdict:** Fixing the 6 red ❌ items alone should lift search visibility 20–40% in 4–8 weeks (structured data + meta + sitemap = big quick wins).

---

## The 6-week plan

### Week 1 (22–28 April) — Technical SEO foundation ✅ DONE

**Goal:** every page crawlable, indexable, share-friendly.

- [x] Audit baseline (done 22 Apr)
- [x] Add canonical + OG + Twitter Card tags to `index.html`
- [x] Add Schema.org JSON-LD: `EducationalOrganization` + `Course` + `WebSite`
- [x] Tighten meta description to 150–160 chars with clear CTA
- [x] Create `robots.txt` (allow all, point to sitemap)
- [x] Create `sitemap.xml` (homepage + resources + privacy + terms)
- [x] Connect GitHub repo → Netlify for auto-deploy
- [ ] Submit sitemap to Google Search Console + Bing Webmaster Tools → see `GSC_SETUP.md`
- [ ] Run Lighthouse, record baseline scores

**Deliverable:** ✅ Live on thebusiness.school. Sakari to do GSC + Lighthouse as follow-ups.

---

### Week 2 (29 Apr – 5 May) — Blog infrastructure + post #1 ✅ DONE (shipped early)

**Goal:** content engine ready, first post live.

- [x] Create `/blog/` section: index page + template
- [x] Write & publish Post #1 — **"A Free Edexcel A-Level Business Simulation — Map to Theme 1 & 4 in 60 Minutes"**
  - Target keyword: *A-Level Business Studies simulation Edexcel*
  - ~1,900 words, British English
  - `BlogPosting` + `BreadcrumbList` schema, internal link to demo
- [x] Add breadcrumbs + `BreadcrumbList` schema
- [x] Update sitemap.xml with new URLs

**Deliverable:** ✅ Post #1 live at /blog/edexcel-a-level-business-simulation/. Sakari to request indexing in GSC once verified.

---

### Week 3 (6–12 May) — Post #2 + on-page polish ✅ DONE (shipped early)

- [x] Write & publish Post #2 — **"How to Teach Price Elasticity of Demand in 20 Minutes — A Sixth Form Activity"**
  - Target keyword: *teach price elasticity of demand UK classroom*
  - `BlogPosting` + `BreadcrumbList` + `HowTo` schema (3 schemas for rich results)
  - Internal link to Post #1; reverse link added to Post #1
- [x] Add FAQ section on homepage with `FAQPage` schema
- [ ] Add "For Teachers" landing page with specific AQA / Edexcel / OCR spec links (moved to Week 4)
- [ ] Image alt tags audit across the site (moved to Week 5)

**Deliverable:** ✅ 2 posts live, internal linking live, FAQ + HowTo schemas eligible for rich snippets.

---

### Week 4 (13–19 May) — Posts #3 + #4, backlink outreach

- [ ] Post #3 — **"Interactive Resources Mapped to AQA Business 3.5 — What Works in Sixth Form"** (target: *AQA Business Studies 3.5 resources interactive*)
- [ ] Post #4 — **"Business Simulation for Year 12 — Why They Work Better Than Worksheets"** (target: *business simulation for Year 12*)
- [ ] Upload first free lesson plan PDF to TES (tes.com/user/TBSakari) → first backlink
- [ ] Upload free resource to Twinkl → second backlink
- [ ] Pitch tutor2u guest post

**Deliverable:** 4 posts, 2+ backlinks in flight.

---

### Week 5 (20–26 May) — Posts #5 + #6, performance pass

- [ ] Post #5 — **"10 Free Business Studies Resources UK Teachers Are Using in 2026"** (target: *free business studies teacher resources UK*)
- [ ] Post #6 — **"5 Revision Games That Stick Before A-Level Business Exams"** (target: *A-Level Business Studies revision games*)
- [ ] Core Web Vitals pass: compress images, lazy-load, font subsetting, LCP < 2.5s
- [ ] Internal linking audit — every post links to 2–3 others + demo

**Deliverable:** Lighthouse mobile > 90, 6 posts live.

---

### Week 6 (27 May – 2 June) — Posts #7 + #8, analytics + review

- [ ] Post #7 — **"Running a Sixth Form Enterprise Day — A 60-Minute Plan You Can Steal"** (target: *Sixth Form enterprise day activities*)
- [ ] Post #8 — **"Teaching VAT to Sixth Formers Without the Glazed-Eye Look"** (target: *teach VAT classroom Sixth Form*)
- [ ] Install privacy-friendly analytics (Plausible / Fathom — GDPR-compliant, no cookie banner needed)
- [ ] Month-1 SEO review: rankings, GSC impressions, which posts ranking, which gaps

**Deliverable:** 8-post content foundation, analytics live, first GSC review.

---

## Months 2–6 — Growth phase

### Content cadence
- 1 new blog post per week (52 posts/year target; realistic 20–30)
- Each post targets one long-tail keyword from the UK A-Level Business space
- Seasonal hooks: exam season (May–June), new term (Sep), mock season (Jan)

### Backlinks — target 10–20 high-quality
- TES lesson plans (3–5 uploads)
- tutor2u guest blog (1–2)
- Twinkl resources (2–3)
- Schools Week / TES News press release after pilot data
- Edutopia contribution article
- Product Hunt launch (tech backlinks)

### Technical
- Month 2: add search to blog
- Month 3: add RSS feed + email capture (teacher newsletter, consent-based)
- Month 4: case study page template after first pilots
- Month 5: internationalisation — subpages for UAE + Australia markets

### Success metrics (6-month horizon)
- 500–1,500 monthly organic visitors
- 10–20 high-quality backlinks
- 5–10 posts ranking top-10 for long-tail keyword
- 50–150 demo sign-ups via organic search
- 3+ UK Sixth Form colleges using TBS in live teaching

---

## How we work

1. **Claude edits locally** in this repo folder.
2. **Sakari pushes** via git (see `PUSH_INSTRUCTIONS.md`).
3. **Netlify auto-deploys** on push to `main` (once connected — see `NETLIFY_SETUP.md`).
4. **One focused deliverable at a time.** No 4-option menus.

---

## Definitely NOT in scope
- Muhammad's game repo (separate contract — don't touch)
- Paid ads
- Full brand redesign
- GA4 / tracking cookies without Sakari's consent (GDPR)
- Social posts / emails to contact list without approval

---

## TL;DR Suomeksi

6 viikon SEO-suunnitelma thebusiness.school-sivulle. Tällä viikolla korjataan tekniset perusasiat (meta, schema, sitemap, robots.txt, Netlify-yhteys). Seuraavat 5 viikkoa: yksi blogipostaus viikossa UK A-Level -opettajille + linkinrakennus TESiin, tutor2u:hun, Twinkliin. Tavoite 6 kk päästä: 500–1500 kävijää/kk orgaanisesta haussa, 3+ Sixth Form -koulua käyttämässä TBS:ää.
