# REGISTRAR

Shared state for the ALTER program. All five agents read this file in full before responding.
Each agent writes **only** to the section it owns. Appending to another agent's section is a protocol violation — flag it and stop.

| Section | Owner | Everyone else |
|---|---|---|
| §0 RUBRIC | **nobody** — locked | read-only, permanently |
| §1 CHARTER | Advisor | read |
| §2 SOURCE LEDGER | Librarian | read |
| §3 GAP LOG | Tutor | read |
| §4 VERDICT LOG | Editor | read |
| §5 CROSS-DOMAIN LEDGER | Roommate | read |
| §6 WEEK BOARD | Advisor | read |

**Student:** Ulrich
**Program start:** 2026-08-24 (Mon) · **Ends:** 2027-08-22 (Sun) · 52 weeks, fixed
**Week now:** 1 — Term 0, Calibration
**Destination status:** CONFIRMED 2026-08-20
**Baseline status:** partial. Q3 answered · Q2 unanswered, deferred to observed measurement · Q1 and Q4 open

| | Question | Answer | Effect on plan |
|---|---|---|---|
| Q1 | Last non-fiction book finished, and what survives of it | _open_ | sets how much load the weekly output carries vs. the reading |
| Q2 | React to *d* = 0.3, *p* = .04, *n* = 60 | **declined** → re-measured by Tutor, wk 1 | week 3 provisionally planned at the **protective** setting: assume no effect-size fluency |
| Q3 | Worst-week hours | **9–12** | second supporting source allowed in Terms 2 and 4 only |
| Q4 | A prediction you got right, one you got wrong, which you remember better | _open_ | supplies the Tutor's first case; likely the capstone's own bias in miniature |

**Advisor note on Q2.** A declined self-report is not a baseline, and guessing one would violate the rule that opens the Advisor's brief. Two consequences, both deliberate:

1. **Week 3 is planned protectively** — as if effect-size fluency is absent. Over-teaching week 3 costs one week. Under-teaching it corrupts every source-triage decision for the remaining 49, because the *n* < 100 rule and the debunked shelf both run on reading magnitudes. Asymmetric costs, so take the cheap side.
2. **The measurement moves from self-report to performance.** The week-1 Tutor session opens cold on OSC 2015 and probes magnitude directly — *"36% replicated. Of the 64% that didn't, how many were false positives and how many were real effects reported too big? How would you tell?"* That question cannot be answered fluently without the concept, and it cannot be bluffed. It is a better instrument than the question I asked. If it comes back clean, week 3 compresses and Term 0 ends a week early.

---

## §0 RUBRIC — LOCKED

Written before week 1. Read-only for all five agents and for the student.
Full text: [`curriculum/RUBRIC.md`](curriculum/RUBRIC.md).

The lock exists because pre-commitment removes the thing an AI grader is worst at. An AI will drift toward whatever standard is argued for in the moment; it will not argue with a document that already exists. If the rubric needs to change, that is a formal amendment: log it here with a date and a reason, and it applies to the *next* term, never the current artifact.

**Amendments:** none.

---

## §1 CHARTER — owner: ADVISOR

Full text: [`curriculum/CHARTER.md`](curriculum/CHARTER.md).

- **Destination:** A de-identified decision-audit of real incident reports — 12–18 documented judgment calls, each scored against a pre-registered framework, with a written analysis of where human judgment failed predictably and what the literature says about why. **`CONFIRMED 2026-08-20`**
- **Access check owed:** Term 2. Confirm employer policy permits this use of incident records in de-identified, non-exported form. A refusal in week 45 costs the capstone; in week 20 it costs a swap and nothing else.
- **Baseline:** intake issued 2026-08-20. Answers logged in `logs/week-01.md`. Sections below fill as answers arrive — the Advisor does not set weeks 5+ in detail until the baseline is real.
- **Terms:** 0 (Calibration) → 1 (Evolved Mind) → 2 (Judgment) → 3 (Social Animal) → 4 (Individual) → Capstone.
- **Cut list:** see Charter §4. The cut list is load-bearing. Anything on it is refused by every agent, not just the Advisor.

---

## §2 SOURCE LEDGER — owner: LIBRARIAN

Every source that enters the program gets a row here before it gets read. Tag discipline:

- `[V]` — **verified this session** against an authoritative record (publisher page, PubMed, DOI resolver, library catalog). The record was actually retrieved, not remembered.
- `[R]` — **recalled**. Plausible, unverified, possibly wrong in title, author, year, or existence.
- `[H]` — **in hand**. The student holds the PDF/book and has uploaded it to NotebookLM. Strongest tag; supersedes [V].

| # | Source | Term | Tag | Verified against | Status |
|---|---|---|---|---|---|
| 1 | Open Science Collaboration (2015), *Science* 349(6251) aac4716 | 0 · wk1 | `[V]` | PubMed 26315443 | acquire — open access |
| 12 | Ritchie, *Science Fictions* (2020), ch. 1–2 | 0 · wk1 | `[R]` | — | **verify before buying** |
| 2 | Simmons, Nelson & Simonsohn (2011), *Psych Sci* 22(11) 1359–1366 | 0 · wk2 | `[V]` | doi:10.1177/0956797611417632 | acquire |
| 13 | Cumming, *Understanding The New Statistics* (2012), ch. 1–3 only | 0 · wk3 | `[R]` | — | **verify before buying** |
| 5 | Henrich, Heine & Norenzayan (2010), *BBS* 33(2–3) 61–83 | 0 · wk4 | `[V]` | PubMed 20550733 | acquire — open PDF at UBC |
| 4 | Klein et al. (2018), *AMPPS* 1(4) 443–490 | 0 · wk4 | `[V]` | doi:10.1177/2515245918810225 | acquire — open access |

*Librarian: retag `[H]` as each lands in NotebookLM. Nothing gets read from an untagged row.*

**Retired / debunked shelf** — sources kept deliberately as objects of study, never as evidence:

| Source | Why it's here | Week |
|---|---|---|
| Doyen et al. (2012) `[V]` — elderly priming | The failure *and* the experimenter-expectancy demonstration that explains the original | 4 |
| Le Texier (2019) `[V]` — Stanford Prison | From the archives, not a re-analysis. Guards were coached | 4 |
| Hagger et al. (2016) `[V]` — ego depletion | 23 labs, no effect. Read Baumeister & Vohs's reply in the same issue for how a field argues | 4 |
| Watts, Duncan & Quan (2018) `[V]` — marshmallow | **Most instructive item here:** not "false," but half the size and about something else | 4 |
| Ranehill et al. (2015) `[R]` — power posing | Plus Carney's public withdrawal of support for her own finding | 4 |
| Rosenhan (1973) `[R]` + Cahalan (2019) | A famous study and its own debunking, one week | 4 |

---

## §3 GAP LOG — owner: TUTOR

A gap is closed only by the student re-explaining it cold in a later session, not by the Tutor explaining it well.

| Week | Concept | Gap (specific) | Status | Closed by |
|---|---|---|---|---|
| — | | | | |

**Open gaps carried forward:** none yet.

---

## §4 VERDICT LOG — owner: EDITOR

Grading is against §0 RUBRIC and against reconstruction tests only. There is no human witness in this program; see Charter §6 for what replaced one.

| Week | Artifact | Rubric score | Reconstruction check | Verdict | Rewrite required |
|---|---|---|---|---|---|
| — | | | | | |

---

## §5 CROSS-DOMAIN LEDGER — owner: ROOMMATE

Spent domains cannot be reused. This is what stops the Roommate from saying "jazz" every second week.

| Week | Domain used | Collided with | Transfer that survived scrutiny |
|---|---|---|---|
| — | | | |

**Spent:** _(none)_
**Queued:** _(Roommate proposes at week 1)_

---

## §6 WEEK BOARD — owner: ADVISOR

| Week | Dates | Term | Milestone | Primary source | Output due | Closed |
|---|---|---|---|---|---|---|
| 0 | –08-23 | setup | Rubric locked · Charter confirmed · intake issued | — | — | ☑ |
| 1 | 08-24 → 08-30 | 0 | The replication crisis: what happened, what fraction, which subfields | OSC 2015 `[V]` + Ritchie ch. 1–2 `[R]` | Sun 08-30, 600w — **Priors Sheet** | ☐ |
| 2 | 08-31 → 09-06 | 0 | Researcher degrees of freedom: how a true-seeming result gets manufactured without anyone lying | Simmons et al. 2011 `[V]` | Sun 09-06, 600w | ☐ |
| 3 | 09-07 → 09-13 | 0 | Effect size, interval, power. **Compute three by hand** · scoped from the wk-1 Tutor reading, not from self-report | Cumming ch. 1–3 `[R]` | Sun 09-13, 600w + the three computations | ☐ |
| 4 | 09-14 → 09-20 | 0 | WEIRD samples · build the debunked shelf in §2 | Henrich et al. 2010 `[V]` + Many Labs 2 `[V]` | Sun 09-20, 600w — **the personal filter** | ☐ |

**Week 1 output — the Priors Sheet.** Three findings about human behavior you currently believe, the evidence you think supports each, and what would change your mind. 600 words, written *before* the reading lands, sealed in `logs/week-01.md`.

This is deliberate: Rubric Part D, question 1 asks in week 52 which three findings you believed in week 1 and no longer do. That question is unanswerable unless week 1 wrote the answer down before it knew better. Do not revise this file after week 1 closes — an amended priors sheet is worth nothing.

**Week 1 grading note (Advisor → Editor).** The Priors Sheet will fail A2 and A4 — it cites nothing and gives no effect sizes, because in week 1 the student cannot yet do either. Grade it normally and record the REWRITE. The Advisor logs it as **baseline measured**, not as a slipped week, and no rewrite is required. The rubric is not amended; the failure is the instrument reading.

**Sequence changes this term:** none.
**Weeks slipped:** 0. _(Advisor: at 3 slipped weeks, cut scope — do not extend the calendar.)_
**Detail horizon:** weeks 1–4 set. Weeks 5–14 stay as questions until the week-4 close, per the Advisor's one-term-ahead rule.

**Capacity allowance (from Q3 = 9–12h).** Terms 2 and 4 may carry a second supporting source per week — those two terms only, because they are what the capstone is built out of. Terms 1 and 3 stay at one primary + one supporting regardless of spare hours. Spare capacity goes to the written output and the Tutor session, never to a third source. This is recorded as an allowance, not a reading list; the sources get named at each term boundary.
