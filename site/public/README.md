# docs/ — the published site

Built output. Do not edit anything in this folder by hand: it is overwritten by
`npm run build` in `site/`, which regenerates the curriculum data from the
repository's Markdown first. The source is `site/`; the record is the repository.

The site answers two questions. **What do I do right now** — it works the current
week out from today's date and shows the day's work for both courses. And **is
this year actually happening** — a dashboard carrying the weekly pass rate, the
slipped-week counter against the scope-cut trigger, source-ledger health by tag,
open gaps, and credits against the Certificate.

```
docs/index.html      page skeleton
docs/assets/         one CSS-carrying script bundle, content-hashed
docs/README.md       this file (from site/public/)
docs/.nojekyll       stops Pages running Jekyll over the output
```

It works opened straight off disk (`file://`) and served from GitHub Pages
identically — no build step to view it, no network requests, no dependencies at
runtime.

## Rebuilding

```
cd site
npm install        # once
npm run build      # regenerates the data, rebuilds into docs/
```

Then commit `docs/`. Everything the site shows comes from
`tools/build-site-data.py` reading `REGISTRAR.md`, `DEGREE.md`, `CATALOG.md`,
`ASSESSMENT.md`, `START-HERE.md`, `catalog/*.md`, `enrolled/*.md` and
`.claude/agents/*.md`. Edit those files, rebuild, and the site follows. Do not
edit curriculum into the site — that is how a page becomes a second, disagreeing
record.

## Enable GitHub Pages

1. Push the branch holding this folder.
2. Repository → **Settings** → **Pages**.
3. **Build and deployment** → **Source**: *Deploy from a branch*.
4. **Branch**: the branch with this folder, folder **`/docs`**. Save.
5. Wait for the first build, then open `https://<your-user>.github.io/<repo>/`.

There is nothing to compile on the server and no workflow to configure.

## Your progress

Ticks, closed weeks, rubric marks, logged gaps and tag changes are stored in this
browser's `localStorage` under `uib.v2` — per browser, per device, never uploaded
anywhere. Progress from the previous single-page reader (`uib.termA.v1`) is
migrated automatically the first time the site loads.

That store is a working buffer, not the record. **Your data → Sunday close** turns
it into a Markdown patch: for every change, the line as the site last read it out
of the repository and the line it should become. Paste it into the files, or hand
the block to Claude Code in this repository. Then re-run the build so the site
reads the new files instead of remembering the old ones.

A cleared cache erases the buffer, so use **Export JSON** after the Sunday close
and keep the file somewhere that is not a browser cache. **Import JSON** restores
it, including onto a different device. If storage is blocked — private windows,
cookie-blocking settings — the site says so in a banner and still renders
correctly; it just stops remembering.

## What is deliberately not here

The Priors Sheet, the intake answers and the weekly outputs. They live in
`logs/` and `REGISTRAR.md` and the parser does not read them. The site records
that they exist and are sealed, and publishes none of them.
