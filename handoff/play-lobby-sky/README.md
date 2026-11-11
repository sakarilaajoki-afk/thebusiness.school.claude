# Play lobby sky: handoff for the game repo (bs-multiplayer)

Status: a tested proposal. Nothing here is live. The owner wants the Claude session that can write to
`bs-multiplayer` to look at it, judge the risks and decide whether to ship it.

## What it is

A photographic earth behind the three screens a class sees before the game starts, with the existing
content on white panels in front of it. `shots/` shows the result on the real game markup.

Screens it styles: `#screen-login` (entry, Teacher access, license key, Set up the lesson, Enter Game PIN,
name), `#screen-host-lobby` (PIN and waiting room), `#screen-waiting` (student "You're in").

Screens it must never touch: `#screen-game`, `#screen-teacher`, `#screen-quiz`, `#screen-end`,
`#screen-demo`, the setup overlays, and anything inside the Teacher Demo.

## Files

- `lobby-sky.css`: every rule is scoped under `html.tbs-sky`, so it does nothing until that class is set.
- `earth-bg.jpg`: 1920x1080, 130 KB, a still image. No video, no canvas, no script cost.
- `tbs-logo.png`: the TBS Education logo used on thebusiness.school, replacing the header tile.
- `shots/`: screenshots of the real game with the CSS applied.

Suggested home in the game repo: `images/lobby-sky/` for the two images (the CSS already points there),
and the CSS loaded after `styles.css`.

## The guard (required)

Put this in `<head>` of `index.html`, before the stylesheet:

```html
<script>if(window.top===window&&!/[?&]preview=/.test(location.search))document.documentElement.classList.add('tbs-sky');</script>
```

Why: `demo/group-classroom/` loads the real `index.html` in a frame as `/?preview=create&topic=...`.
Without the guard the sky appeared inside the Teacher Demo (seen in testing). With it, the demo is
unchanged (`shots/demo1.jpg`, `shots/demo3.jpg`).

## How it was tested, and what was not

Tested: bs-multiplayer at HEAD 68b6f39, served locally, headless Chromium at 1600x900, backend calls
stubbed with 503. Panels were shown with the game's own `_sfShow(...)` and
`_sfOpenTeacherSessionSettings(...)`; the lobby and waiting screens were shown by setting their
`display`. Lobby names were inserted with the same markup `app.js` writes.

Not tested, so check before shipping:

1. A real session end to end (teacher creates, students join, Start Session, return to lesson).
2. Chromebook, iPad and narrow widths. Only 1600x900 was rendered.
3. Set up the lesson with taller content. The white panel is a fixed-size `::before`
   (max 1290x770). With a topic lesson, topic cards, the long-game rows or the teacher guide open, the
   form may be taller than the panel and text would then sit on the dark sky. Safer: give the page a
   real white wrapper, or make the panel follow the content height.
4. The lobby rules use `#screen-host-lobby > div:nth-child(1..3)`. That depends on the current child
   order. Other children of that screen (mode toggle, loaders, countdown) were not exercised. Adding
   classes to those three blocks in `index.html` would be more robust than `nth-child`.
5. `#screen-login:has(#sf-pt-session-settings:not([style*="display: none"])) .login-header` hides the
   header while Set up the lesson is open. `:has()` needs a recent browser; on an old one the header
   stays visible behind the panel. A class toggled in `_sfShow` would be sturdier.
6. Dark and light themes. `styles.css` defines `--void` twice; only the default page state was rendered.
7. The "device too small" panel (`#sf-pdevice`), the long-game panel (`#sf-ps-lg`), error states,
   toasts and the session-start modal over the new background.
8. Other countries (`/us`, `/fi`, `/au`, `/ie`) share `index.html`. Decide whether they get the sky too.
9. Text contrast of every line that sits directly on the sky (footer lines, hero subtitle).

## Image sources (confirm before publishing)

- Earth surface: NASA Blue Marble, public domain.
- Clouds and star field: taken from the example assets of the `three-globe` npm package (MIT). Their
  original source was not verified. If that is not good enough, re-render with a NASA cloud map and no
  star texture, or ask the owner.

## Decisions for the owner, not for code

- The lobby's Start Session button and several headings use a different display font from the rest.
  Left as is.
- A slowly turning earth (video) was discussed. Recommendation: ship the still first. If a video is
  added later, keep this image as the poster and fallback.
