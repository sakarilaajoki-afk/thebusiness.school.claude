# Netlify Setup — one-time connection

**Goal:** connect the GitHub repo to Netlify so every `git push` auto-deploys to `thebusiness.school`.

This is a **one-time setup**. After this, you never have to drag-and-drop files to Netlify again.

---

## Step-by-step

### 1. Log in to Netlify
Go to [app.netlify.com](https://app.netlify.com) and sign in.

### 2. Find the current site
Your current `thebusiness.school` site is already on Netlify somewhere. Click **"Sites"** in the left sidebar and find the one that has `thebusiness.school` as the custom domain.

> If you're not sure which site it is, click each one and check **"Domain management"** → look for `thebusiness.school`.

### 3. Connect it to GitHub

Inside that site:

1. Click **"Site configuration"** → **"Build & deploy"** → **"Continuous deployment"**
2. Under **"Build settings"**, click **"Link repository"** (or "Link to a different repository" if one's already linked)
3. Choose **GitHub**
4. Authorise Netlify to access your GitHub (one-time click-through)
5. Pick the repo: **`sakarilaajoki-afk/thebusiness.school.claude`**
6. Branch: **`main`**
7. Build command: **leave blank** (static site)
8. Publish directory: **`.`** (a single dot)
9. Click **"Save"** or **"Deploy site"**

### 4. Watch it deploy
You'll see "Deploy in progress" at the top. Wait 30–60 seconds. Green tick = live.

### 5. Verify
Open [thebusiness.school](https://thebusiness.school) in a new browser tab → refresh with **Ctrl+F5** → page should look identical to before but now loads from GitHub.

Then check these URLs work:
- `https://thebusiness.school/robots.txt` — should show plain text with "Sitemap: ..."
- `https://thebusiness.school/sitemap.xml` — should show XML
- `https://thebusiness.school/blog/` — should show the blog index

---

## If something breaks

- **Site shows a 404 or an old page:** in Netlify, go to **Deploys** → click the latest deploy → **"Publish deploy"** to force it.
- **Custom domain `thebusiness.school` isn't pointing to new deploy:** Site configuration → Domain management → verify the Netlify subdomain matches the site you just connected.
- **Panic:** in Netlify → **Deploys** → find the last known good deploy → **"Publish deploy"**. That rolls you back instantly. Nothing is lost on GitHub.

---

## After setup

From now on, every push to the `main` branch auto-deploys within ~60 seconds. No action from you.

See `PUSH_INSTRUCTIONS.md` for the push commands.

---

### Suomeksi lyhyesti

Kerran-tehtävä: kirjaudu Netlifyyn, etsi nykyinen `thebusiness.school`-sivu, yhdistä se GitHub-repoon `sakarilaajoki-afk/thebusiness.school.claude` (branch: main, build command: tyhjä, publish directory: `.`). Sen jälkeen joka `git push` tekee automaattisesti uuden deployn. Ei enää drag-and-droppia.
