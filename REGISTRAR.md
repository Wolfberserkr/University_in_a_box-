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
**Program start:** _[set on week 1 kickoff]_
**Week now:** 0 (setup)

---

## §0 RUBRIC — LOCKED

Written before week 1. Read-only for all five agents and for the student.
Full text: [`curriculum/RUBRIC.md`](curriculum/RUBRIC.md).

The lock exists because pre-commitment removes the thing an AI grader is worst at. An AI will drift toward whatever standard is argued for in the moment; it will not argue with a document that already exists. If the rubric needs to change, that is a formal amendment: log it here with a date and a reason, and it applies to the *next* term, never the current artifact.

**Amendments:** none.

---

## §1 CHARTER — owner: ADVISOR

Full text: [`curriculum/CHARTER.md`](curriculum/CHARTER.md).

- **Destination:** A de-identified decision-audit of real incident reports — 12–18 documented judgment calls, each scored against a pre-registered framework, with a written analysis of where human judgment failed predictably and what the literature says about why. `STATUS: PROPOSED — confirm or swap in week 1.`
- **Baseline:** self-assessed at week 1 intake. Assume no formal psychology training; assume strong operational exposure to human behavior under observation; assume some quantitative comfort.
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
| — | _(seeded from `curriculum/READING-LIST.md` at week 1)_ | | | | |

**Retired / debunked shelf** — sources kept deliberately as objects of study, never as evidence:

| Source | Why it's here |
|---|---|
| _(Term 0 populates this)_ | |

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

| Week | Term | Milestone | Primary source | Output due | Closed |
|---|---|---|---|---|---|
| 0 | setup | Rubric locked, Charter confirmed, first 4 sources in hand | — | — | ☐ |
| 1 | 0 | _(set at kickoff)_ | | | ☐ |

**Sequence changes this term:** none.
**Weeks slipped:** 0. _(Advisor: at 3 slipped weeks, cut scope — do not extend the calendar.)_
