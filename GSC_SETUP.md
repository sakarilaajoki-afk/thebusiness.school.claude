# Google Search Console + Bing Webmaster Tools — setup

**Goal:** let Google and Bing know the site exists, submit the sitemap, start tracking rankings.

**Time needed:** 10 minutes. One-time.

---

## Part 1 — Google Search Console (the important one)

### 1. Open Search Console
Go to [search.google.com/search-console](https://search.google.com/search-console) and sign in with the Google account you want to own the site's search data (Sakari → use sakari.laajoki@gmail.com).

### 2. Add the property
Click **"Add property"** (top-left dropdown).

You'll see two options:
- **Domain** — covers http + https + all subdomains. Requires DNS verification.
- **URL prefix** — only covers `https://thebusiness.school/`. Easier to verify.

**Pick: Domain property** → enter `thebusiness.school` (no https://, no slash).

### 3. Verify ownership via DNS

Search Console shows you a TXT record like:
```
google-site-verification=abc123xyz...
```

**Where to add it:**

Your domain is likely managed through one of these — check your email for the registrar:
- **Namecheap** → Domain list → Manage → Advanced DNS → Add new record → TXT Record → Host: `@` → Value: (paste the Google string) → Save
- **GoDaddy** → My Products → DNS → Add record → Type: TXT → Name: `@` → Value: (paste) → Save
- **Cloudflare** → the domain → DNS → Records → Add record → Type: TXT → Name: `@` (or `thebusiness.school`) → Content: (paste) → Save
- **Netlify DNS** (if you're using Netlify for DNS too) → Sites → Domain management → DNS settings → Add new record → TXT → Name: (leave blank or `@`) → Value: (paste)

Save. Wait 2–5 minutes. Go back to Search Console → click **"Verify"**.

> ⏳ If verification fails, wait 30 minutes and try again — DNS propagation can be slow.

### 4. Submit the sitemap

Once verified:

1. Left sidebar → **Sitemaps**
2. Under "Add a new sitemap", type: `sitemap.xml`
3. Click **"Submit"**

Status should show **"Success"** within a few minutes. Google will start crawling the URLs.

### 5. Check indexing (do this weekly at first)

Left sidebar → **URL Inspection** → paste `https://thebusiness.school/` → see if it's "URL is on Google".

If not: click **"Request Indexing"** — Google queues it for priority crawl.

---

## Part 2 — Bing Webmaster Tools (5-minute bonus)

Bing also powers DuckDuckGo and Yahoo — covers ~10% of UK search.

1. Go to [bing.com/webmasters](https://www.bing.com/webmasters)
2. Sign in
3. Click **"Import from Google Search Console"** — this auto-imports the property (saves DNS hassle)
4. Submit the sitemap: `https://thebusiness.school/sitemap.xml`

Done.

---

## Part 3 — what to watch (monthly check, 10 min)

Once a month, open Search Console and check:

1. **Performance** tab → are impressions growing? Click queries to see which keywords you're appearing for.
2. **Pages** (under Indexing) → are all pages indexed? Any errors?
3. **Experience → Core Web Vitals** → mobile scores.

Tell Claude the numbers each month and we'll adapt the roadmap.

---

### Suomeksi

1. Mene [search.google.com/search-console](https://search.google.com/search-console), lisää property `thebusiness.school` (Domain)
2. Kopioi TXT-record, lisää se domain-rekisteröijän (todennäköisesti Namecheap/Cloudflare/Netlify) DNS-asetuksiin, odota 5 min, klikkaa Verify
3. Vasemman palkin Sitemaps → lisää `sitemap.xml` → Submit
4. Bing: [bing.com/webmasters](https://www.bing.com/webmasters) → Import from Google → valmis
5. Katso kerran kuussa: Performance-välilehti, Pages-välilehti, Core Web Vitals

Jos et tiedä missä domain on rekisteröity, katso sähköpostista "domain" tai "renewal" -avainsanoilla.
