# Push Instructions — for Sakari

**Context:** Claude edits files locally. You push to GitHub. Netlify auto-deploys.

You only need **3 commands**. Copy-paste them in a terminal opened in this folder.

---

## The 3 commands

Open a terminal (PowerShell or Git Bash) in this folder:
`C:\Users\sakar\OneDrive\Tiedostot\Claude\Projects\rahoitus haku\thebusiness.school.claude`

Then run:

```bash
git add .
git commit -m "Describe the change in 1 line"
git push
```

That's it. Netlify takes over from there.

---

## What each line does

- `git add .` — tell git about every changed file.
- `git commit -m "..."` — save a snapshot with a 1-line description.
- `git push` — send it to GitHub. Netlify picks it up and deploys.

---

## First-time push only

If this is the very first push and you get an error like "no upstream branch", run this instead of `git push`:

```bash
git push -u origin main
```

(The `-u origin main` part is only needed once. After that, plain `git push` works forever.)

---

## Verifying the deploy

1. Go to [app.netlify.com](https://app.netlify.com) → your site → **Deploys**
2. Top of the list: you should see the new deploy building (yellow) → then green tick
3. Open [thebusiness.school](https://thebusiness.school) in a **fresh tab** and hit **Ctrl+F5** to bypass cache

---

## If something looks wrong

1. Don't panic. GitHub has your previous versions.
2. In Netlify → **Deploys** → find the last green deploy before the broken one → click **"Publish deploy"**. Instant rollback.
3. Tell Claude what happened. We'll figure out the fix.

---

## Commit message style

Good: `Add schema.org structured data to homepage`
Good: `Fix typo in blog post #1`
Good: `Update meta description on homepage`

Bad: `changes` / `fix` / `update` — they tell you nothing in 6 months.

---

### Suomeksi

3 komentoa terminaalissa tässä kansiossa:
```
git add .
git commit -m "Lyhyt kuvaus muutoksesta"
git push
```
Sen jälkeen Netlify deployaa itse. Ensimmäisellä kerralla `git push -u origin main`. Jos jokin menee rikki: Netlify → Deploys → vanha vihreä → "Publish deploy". Rollback.
