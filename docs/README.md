# docs/ — the Term A reader

A static page that answers one question in under three seconds: **what do I do right now?**

It computes the current week of Term A (2026-08-24 → 2026-11-29) from today's date, shows the day's work for both courses, and keeps the setup checklist, the fourteen week boards, the slipped-week counter and the source ledger in one place. Plain HTML, CSS and JavaScript — no build step, no dependencies, no network requests. It works opened straight off disk (`file://`) and served from GitHub Pages identically.

```
docs/index.html    page skeleton
docs/styles.css    light and dark, mobile first
docs/app.js        date logic, state, rendering
docs/data.js       the curriculum, transcribed from the repo
```

## Enable GitHub Pages

1. Push this branch to GitHub.
2. Repository → **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Set **Branch** to the branch holding this folder (`main`, usually) and the folder to **`/docs`**. Save.
5. Wait for the first build, then open `https://<your-user>.github.io/<repo>/`.

That is the whole deployment. There is nothing to compile and no workflow to configure.

## Updating the curriculum

Everything the page shows comes from `docs/data.js` — edit that one file and reload; nothing else needs to change. Keep it a faithful transcription of the repo files it names in its header comment (`REGISTRAR.md`, `ASSESSMENT.md`, `enrolled/PSY-101.md`, `enrolled/STA-101.md`, `catalog/*`), and keep the `[V]` / `[R]` / `[H]` tags exact — they are load-bearing, and rubric criterion A2 grades against them.

The repo is the source of truth. When a week board or a source ledger changes in `enrolled/<CODE>.md`, mirror it here; do not let this page become a second, disagreeing record.

## Your progress

Ticks, closed weeks and retagged sources are stored in this browser's `localStorage` under `uib.termA.v1` — per browser, per device, never uploaded anywhere. A cleared cache erases them, so use **Export JSON** at the bottom of the page after the Sunday close and keep the file somewhere that isn't a browser cache. **Import JSON** restores it, including onto a different device.

If storage is blocked (private windows, cookie-blocking settings), the page says so in a banner at the top and still renders correctly — it just stops remembering.
