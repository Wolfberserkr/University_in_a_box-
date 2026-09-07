# site/ — source for the published site

The pages in `docs/` are built from here. Nothing in `src/` transcribes curriculum
by hand: `tools/build-site-data.py` reads the repository's Markdown and writes
`src/data/curriculum.json`, and the components render that.

```
npm install          once
npm run dev          regenerate the data, then Vite's dev server
npm run build        regenerate the data, then build into ../docs
npm run data         regenerate src/data/curriculum.json only
```

`npm run build` is the only command that matters. It empties `docs/` and rewrites
it, so commit `docs/` after building — GitHub Pages serves that folder directly.

## Why it is built the way it is

**Relative base, hash routing, one classic script.** The page has to work opened
straight off disk as well as from Pages — a study record you can only read when a
server is up is a study record you stop reading. So: `base: './'`, `#/route` in
place of history routing, and the bundle emitted as a single classic script
because ES modules are blocked under `file://`.

**The repository is the source of truth.** Change a week board in
`enrolled/PSY-101.md` and the site follows on the next build. There is no second,
disagreeing record to keep in sync by hand, which is the failure the old
hand-transcribed `data.js` was heading for.

**Personal work is not read in.** The parser deliberately skips the Priors Sheet,
the intake answers and the weekly outputs in `logs/`. The site records that they
exist and are sealed; it publishes none of them.

## Layout

```
src/lib/markdown.jsx   a small Markdown renderer for the repo's own prose
src/lib/calendar.js    term/week/day arithmetic from today's date
src/lib/store.js       progress state, localStorage, the v1 migration
src/lib/metrics.js     pass rate, slips, ledger health - all defined by the repo
src/lib/patch.js       the Sunday close: state → Markdown edits for the repo
src/lib/briefs.js      per-week agent briefs, already bound to a course
src/pages/             one file per route
```
