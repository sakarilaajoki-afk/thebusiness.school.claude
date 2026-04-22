# The Business School — Marketing Site

**Live site:** [thebusiness.school](https://thebusiness.school)
**Product:** Interactive live business simulation for A-Level, BTEC, IGCSE and university Business Studies classrooms. Students run virtual firms as C-suite executives in 60-minute sessions. No downloads, just a PIN code.
**Company:** TBS Education Ltd Oy (Finland)
**Owner:** Sakari Laajoki — [sakari.laajoki@gmail.com](mailto:sakari.laajoki@gmail.com)

---

## What's in this repo

This is the **marketing website** source for `thebusiness.school`. It's a deliberately-simple static site — no framework, no build step, just HTML + CSS + a bit of JSON-LD.

```
thebusiness.school.claude/
├── index.html              # Homepage
├── robots.txt              # Crawler directives
├── sitemap.xml             # Sitemap for search engines
├── netlify.toml            # Netlify config (headers, redirects)
├── assets/                 # Images, favicon, OG images
├── blog/                   # Blog posts (one folder per post)
│   └── index.html          # Blog index
├── resources/              # Free teacher resources (PDFs + landing pages)
├── SEO_ROADMAP.md          # 6-week SEO plan — THE master doc
├── NETLIFY_SETUP.md        # One-time Netlify connection guide
└── PUSH_INSTRUCTIONS.md    # How Sakari pushes changes
```

The **game app itself** lives in a separate repo (Muhammad's contract). Don't touch it.

---

## For Claude sessions picking this up

1. Read `SEO_ROADMAP.md` first — it's the plan.
2. Read `TBS_SEO_Brief_ForClaude.md` (in parent folder) for full context.
3. Ship **one deliverable at a time**. Commit, push, verify live.
4. British English. No hype ("revolutionary", "best ever" — UK teachers hate it).
5. Always include `BlogPosting` schema on new blog posts.

## For Sakari

- Changes land here locally → you run `git push` → Netlify auto-deploys.
- See `PUSH_INSTRUCTIONS.md` if you forget the commands.
- Once per month: check Google Search Console + glance at rankings.
