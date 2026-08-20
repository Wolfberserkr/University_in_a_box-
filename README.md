# University in a Box — the ALTER Framework

A one-person university: a course catalog, credit accounting, concurrent enrolment, levels, a transcript — run by five agents against a shared registrar.

**Start here:** [`DEGREE.md`](DEGREE.md) — how it works and what it honestly isn't · [`CATALOG.md`](CATALOG.md) — courses, and the open slot · [`REGISTRAR.md`](REGISTRAR.md) — current enrolment

---

## Faculty and institution

The ALTER framework describes five **roles**. It does not describe an institution — which is why five good system prompts and one destination produce a thesis rather than a university.

So the two layers are kept separate. **ALTER is the faculty**, and it runs *each course*. The catalog, levels, prerequisites, credit accounting, and transcript are the **institution**, and they're what let you take Statistics and Psychology in the same term and have it mean something.

| Letter | Agent | Owns, per enrolled course | Refuses to |
|---|---|---|---|
| **A** | [Advisor](.claude/agents/advisor.md) | §A Week Board · plus catalog and calendar | add "foundational" material that unblocks no later week; enrol a third concurrent course |
| **L** | [Librarian](.claude/agents/librarian.md) | §B Source Ledger | present a recalled citation as a verified one |
| **T** | [Tutor](.claude/agents/tutor.md) | §C Gap Log · runs the week-7 midterm | accept "yeah, that makes sense" |
| **E** | [Editor](.claude/agents/editor.md) | §D Verdict Log | open with praise, or grade against anything but the locked standard |
| **R** | [Roommate](.claude/agents/roommate.md) | §E Cross-Domain Ledger | reach for a domain already spent |

Each agent file is a complete system prompt. Two ways to run them:

- **Claude Code:** live as subagents in `.claude/agents/`. Invoke by name.
- **claude.ai Projects:** copy everything *below the `---` frontmatter* into a Project's custom instructions. One Project per agent, and put `REGISTRAR.md` plus the active `enrolled/<CODE>.md` in each Project's knowledge.

Every agent binds to a course before it does anything: registrar → active enrolment → course file. That's what stops five agents from becoming five disconnected chat windows.

## Layout

```
DEGREE.md            credit math, 52-week calendar, levels, awards, the four honest gaps
CATALOG.md           course index, open slots, how to add a subject
ASSESSMENT.md        the standard. Locked before week 1. Level-scaled. Read-only
REGISTRAR.md         enrolment, calendar, transcript, baseline
catalog/             course definitions — inert, reusable
  _TEMPLATE.md       how to add a subject
  PSY-101 … PSY-401  the psychology major, six courses
  PSY-major.md       subject-wide program statement and cut list
  PSY-sources.md     the source stack, [V]/[R]/[H] tagged
enrolled/            live per-course state, five agent sections each
logs/<CODE>/         weekly outputs and Editor verdicts
```

## Cadence, per course

```
Mon  Advisor    reads last week's gaps + verdicts, sets the milestone
Mon  Librarian  pulls one primary + one supporting, tags them, logs to §B
Tue-Thu         you read. Nobody talks to you.
Thu  Tutor      45-min oral exam, cold; writes gaps to §C
Fri             you write the week's output
Fri  Editor     grades vs ASSESSMENT.md; verdict to §D
Sat  Roommate   fortnightly; one cross-domain collision, logged to §E
Sun  Advisor    closes the week
```

Week 7 is the midterm. Week 14 is the term paper. Then the course is on the transcript and a new one starts.

## The honest flags

**The Librarian is the weakest of the five**, and not because of the prompt. Curation is recall, and language models produce confident, well-formed citations for papers that don't exist. Run it with search enabled, or work from PDFs already in NotebookLM. In `catalog/PSY-sources.md`, 9 items are `[V]` — checked against a retrieved record — and the rest are `[R]`. That ratio is the point, not an apology.

**This is not accredited and the transcript is not a credential.** [`DEGREE.md`](DEGREE.md) closes with four gaps that aren't papered over: no credential, no peers, no library or lab access, and no teacher who has been wrong in public about the material and remembers how it felt.

**Six courses a year, not forty.** The credit math is in `DEGREE.md` and it's done honestly: ~70 hours per course after stripping the overhead a university makes you pay and you don't. At 9–12 hours a week that's a quarter-time student who cut all the padding — a real thing to be, and not a degree in a year.
