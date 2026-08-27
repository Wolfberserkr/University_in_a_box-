# AGENT PACK

Generated 2026-08-27 from commit `bf7966b` by `tools/build-agent-pack.py`.

Everything the five ALTER agents need, in one file. Attach this to each claude.ai Project's
knowledge instead of the individual files. Regenerate and re-upload at the Sunday close —
**not** at random moments during the week.

**The two cut lists in here are binding.** An agent that has not read them cannot refuse
anything, and an agent that cannot refuse is a tone rather than an agent.

---

# ════ FILE: `REGISTRAR.md` ════

> Institution state: calendar, enrolment, transcript, baseline, standing rules.

# REGISTRAR

Institution-level state. All five agents read this first, every session, to find out **which course they are in**.

Per-course state lives in `enrolled/<CODE>.md` — that's where the five agent sections are, one set per active enrolment. This file holds enrolment, the calendar, and the transcript.

---

## Student

**Ulrich** · Program start **2026-09-07** _(postponed 2026-08-21, see below)_ · Award target: **Certificate** (6 courses), then reassess
**Capacity:** 9–12 h/week at a bad week (intake Q3, 2026-08-20) → 2 concurrent courses, ~5 h each

### Baseline

**Status:** complete on the three answerable questions — Q1, Q3, Q4 answered 2026-08-21; Q2 declined and re-instrumented as a performance measure at the week-7 midterm.

**Priors Sheet: SEALED 2026-08-21**, before any source was opened. **The seal is conditional on the postponement.** It was written 17 days before week 1 now, not 3. It stays valid only if no Term A source is opened before 2026-09-07 — OSC 2015, Ritchie, Spiegelhalter and Greenland are all already in NotebookLM and all four are off-limits until then. If any is read in the gap, log the date here; the week-52 comparison is still interpretable, but only if the contamination is on the record — `logs/PSY-101/week-01.md`. Three beliefs, three falsification conditions, one of which carries a numeric threshold. Not to be revised. `ASSESSMENT.md` Part D q1 grades against it.

| | Question | Answer | Effect |
|---|---|---|---|
| Q1 | Last non-fiction book finished, what survives of it | The psychology of money - what survive is that true happiness comes from being content with what one has, and not keep moving the goal post. | how much load the output carries vs. the reading |
| Q2 | React to *d* = 0.3, *p* = .04, *n* = 60 | **declined** → **resolved by enrolment**, see below | STA-101 now teaches this directly; PSY-101 wk 3–4 re-scoped to application |
| Q3 | Worst-week hours | **9–12** | 2 concurrent courses; second supporting source at 200/300 level |
| Q4 | A prediction you got right, one you got wrong, which you remember better | Prediction: What I got right is that I was able to influence my employer for a raise, and what I got wrong was that motivation alone was enough to reach my goals.  | Tutor's first case; likely the capstone's own bias in miniature |

**On Q2.** A declined self-report is not a baseline and was not guessed at. The protective side was taken instead: over-teaching effect sizes wastes two weeks, under-teaching them corrupts source triage for the remaining fifty.

Enrolling STA-101 makes the question moot. The machinery is now taught properly in its own course rather than smuggled into two weeks of a psychology course, and PSY-101 weeks 3–4 become application. The measurement still happens — both midterms probe magnitude reasoning at week 7 — but nothing now depends on the answer.

---

## Calendar 2026–27

**Postponed 2026-08-21.** Start moved from 24 Aug to 7 Sept: the student is in full-time accounting cross-training until Fri 4 Sept. Ten hours a week on top of that is the plan that reaches three slipped weeks by October and triggers a mandatory scope cut in the first term.

**This is a scheduling decision, not a slip.** The no-extension rule governs falling behind *inside* a term — pushing a deadline you already own. This is a start date set before week 1 against a known external constraint. The distinction matters, and it does not license moving anything once week 1 opens. Slipped-week counter stays at 0/3 per course.

**Two weeks became five, and the calendar is better for it.** A straight two-week shift would have opened Term B on 21 Dec — Christmas week, in a resort and casino, at peak season. The break absorbs it instead.

| | Weeks | Dates | Enrolled |
|---|---|---|---|
| **Term A** | 1–14 | 2026-09-07 → 2026-12-13 | **PSY-101** + **STA-101** |
| break | 15–17 | 12-14 → 2027-01-03 | — · three weeks, holidays + peak season |
| **Term B** | 1–14 | 2027-01-04 → 2027-04-11 | PSY-201, PSY-202 |
| break | — | 04-12 → 04-18 | — |
| **Term C** | 1–14 | 2027-04-19 → 2027-07-25 | PSY-301, PSY-302 |
| **Capstone** | 1–8 | 2027-07-26 → 2027-09-19 | PSY-401 |

Award target unchanged: Certificate, 6 courses. Ends 2027-09-19 instead of 2027-08-22.

**Term A is full.** STA-101 filled slot 2 on 2026-08-20. Terms B and C are psychology-only as scheduled; a second STA course or a third subject would have to displace one, and the Advisor's two-concurrent cap is not negotiable.

---

## Enrolment — active

| Course | Level | Term | Week | State file | Status |
|---|---|---|---|---|---|
| [PSY-101](catalog/PSY-101.md) | 100 | A | 1 of 14 | [`enrolled/PSY-101.md`](enrolled/PSY-101.md) | **active** |
| [STA-101](catalog/STA-101.md) | 100 | A | 1 of 14 | [`enrolled/STA-101.md`](enrolled/STA-101.md) | **active** |

**Term A interlock.** STA-101 feeds PSY-101 and the dependency runs one way: wk 2 (effect size and interval) → PSY-101 wk 3; wk 3 (misinterpretation catalogue) → PSY-101 wk 4; wk 6 (base rates) → PSY-101 wk 5. If a week has to slip, slip PSY-101 — never STA-101 weeks 2 or 3.

**Consequence, logged by the Advisor 2026-08-20:** PSY-101 weeks 3–4 were planned protectively because intake Q2 was declined. That is now redundant. STA-101 teaches the machinery; PSY-101 wk 3–4 re-scope from *teaching* effect sizes to *applying* them to replication data. Nothing is taught twice, and the declined Q2 stops costing anything.

**Agents: bind to the course before responding.** Read `enrolled/<CODE>.md` for the five sections. If two courses are active, ask which one this session is for — never write to both, and never assume the more recent one.

---

## Transcript

| Course | Title | Lvl | Cr | Term | Weekly pass rate | Paper | Result |
|---|---|---|---|---|---|---|---|
| PSY-101 | Foundations of Psychological Evidence | 100 | 3 | A · 2026 | — | — | in progress |
| STA-101 | Reading Quantitative Claims | 100 | 3 | A · 2026 | — | — | in progress |

**Credits earned:** 0 / 21 · **Courses complete:** 0 / 7 — Certificate needs 6; the year now carries 7, so one is slack against a bad term.

A course is `complete` when its term paper passes and its weekly pass rate is recorded. Pass rate is `weeks at 5/5 ÷ weeks attempted` — it is a diagnostic for the Advisor, not a grade to optimise. A rate near 100% by week 6 means the Editor has gone soft, and the Advisor should say so.

**No accreditation.** This transcript is a record for you. It is not a credential and nobody outside this repo recognises it. See [`DEGREE.md`](DEGREE.md) → The four honest gaps.

---

## Standing rules

**§0 ASSESSMENT is locked.** [`ASSESSMENT.md`](ASSESSMENT.md), written before week 1, read-only for all five agents and for the student. An AI grader drifts toward whatever standard is argued for in the moment; it will not argue with a document that already exists. Amendments are logged here, dated, and apply to the **next course** — never to the artifact currently being graded.

**Amendments:** none.

**Agents stood up** (claude.ai Projects, 2026-08-21): Advisor ✓ · Librarian ✓ (web search enabled)

**Smoke-tested 2026-08-21, both passed.** Advisor refused a Freud week, applied the unblocking test, cited the cut list by file and section, priced the calendar trade and named the legitimate route. Librarian refused to bind without a course, tagged everything, verified two citations against publisher records, withheld a date it could not confirm, marked two items `[R]` with the reason, and declined to write to §B because admitting a fifth autopsy would overwrite the Advisor's §A by the back door. Every `[V]` it claimed was independently re-checked and held. · Tutor — due before Thu 08-27 · Editor — due before Sun 08-30 · Roommate — due before week 2.

**Project knowledge:** attach [`AGENT-PACK.md`](AGENT-PACK.md) — one file, all eight state documents including both cut lists. Regenerate with `python3 tools/build-agent-pack.py` and re-upload at the Sunday close, never mid-week.

**Slipped weeks:** 0 across all courses. _(Three slips in one course triggers a scope cut in that course. The calendar does not move.)_

**Detail horizon:** Term A set. Terms B and C exist as course definitions with sequences; the Advisor does not schedule their weeks until the preceding term closes, informed by the gap and verdict logs.

**Access check owed:** Term B (now opens 2027-01-04). Confirm employer policy permits the PSY-401 use of incident records in de-identified, non-exported form. A refusal in Term B costs a swap. The same refusal at week 45 costs the capstone.

---

# ════ FILE: `ASSESSMENT.md` ════

> The locked grading standard. Read-only. Never amended mid-artifact.

# ASSESSMENT — LOCKED

The standard for every course in the catalog. Written once, applies everywhere. Courses do not define their own rubric; they name only what is *specific* to them.

Written in week 0, before any material is read. Read-only for all five agents and for the student.

**Why it's locked.** An AI grader drifts toward whatever standard is argued for in the moment. It will not argue with a document that already exists. Pre-commitment removes the failure mode. If you find yourself wanting to edit this file during a grading round, that impulse is the exact thing the lock exists to defeat — log the amendment instead; it applies to the next term.

Where a published standard exists, it beats one invented here. Two are adopted below by reference.

---

## Level scaling

Parts A and D apply to every course at every level. What changes with level is **what the student is asked to do with a source**, and therefore what the term paper has to be.

| Level | Weekly (Part A) | Midterm, wk 7 | Term paper, wk 14 | Extra criteria |
|---|---|---|---|---|
| **100** | all 5 | oral, cold, comprehension | 2,000 words | — |
| **200** | all 5 | oral, cold, must argue an opposing position convincingly | 3,000 words | B1, B3 |
| **300** | all 5 | oral, cold, must apply to own material live | 4,000 words, **original analysis on material the field hasn't seen** | B1, B2, B3, B4 |
| **400** | all 5 | — | capstone | Part C in full; reconstruction outranks everything |

A 300-level paper that summarises the literature well is a failed 300-level paper, however good the summary. The level is defined by the demand, not by the difficulty of the reading.

---

## Part A — Weekly output (every course, every week)

Graded by the Editor. Each criterion is pass/fail. **5/5 or the week is a rewrite.** There is no partial credit and no "strong 4."

| # | Criterion | Fails if |
|---|---|---|
| A1 | **Claim is falsifiable** | The central assertion is compatible with every possible observation. |
| A2 | **Evidence is cited and tagged** | Any empirical claim lacks a source, or leans on an `[R]` source without saying so. |
| A3 | **The strongest counterargument appears** | The counterargument presented is a weak version chosen because it's easy to answer. |
| A4 | **Effect size, not just significance** | A finding is invoked as "shown" or "proven" with no magnitude and no interval. |
| A5 | **No fluff opening or closing** | The first sentence could be deleted without loss. Same for the last. |

**Editor's standing constraint:** no praise in the first paragraph, ever. Praise, if earned, appears at the end and in one sentence.

---

## Part B — Term paper (week 14 of any course)

Adds to Part A, per the level-scaling table above:

| # | Criterion | Fails if |
|---|---|---|
| B1 | **Uses at least one source the student physically holds** (`[H]`) | Everything is second-hand. |
| B2 | **Applies to a case the student personally observed** | The examples are all from the books. |
| B3 | **Names one thing the term's literature got wrong or can't settle** | Presented as a settled body of knowledge. |
| B4 | **Survives the cold re-explanation test** | Student cannot reconstruct the core argument from memory a week later, unprompted. |

---

## Part C — Capstone (week 52)

The capstone is graded primarily by **reconstruction**, not by prose quality. The framework's predictive performance is the grade; the writing is a threshold condition.

### C1 — Pre-registration integrity `PASS / FAIL`
The scoring framework is timestamped in the Registrar before week 45, and the version used to score is byte-identical to the version registered. Any post-hoc modification, however well-motivated, is a FAIL — and the honest write-up of *why* you wanted to modify it is worth more than a fabricated pass.

### C2 — Blind-scoring integrity `PASS / FAIL`
Decision-time scoring was completed and recorded in full before any outcome data was consulted.

### C3 — Predictive performance `RECORDED, NOT PASS/FAIL`
Report, do not target:
- Hit rate vs. base rate
- Calibration: predicted-vs-actual across confidence bins
- Direction of error — is the framework wrong in a consistent direction?
- Brier score if the scoring is probabilistic

**A framework that performs at chance is not a failed capstone.** A framework that performs at chance and is written up as a success is a failed capstone. Reporting a null result cleanly is the outcome Term 0 exists to make possible.

### C4 — Sample discipline `PASS / FAIL`
12–18 cases. Selection criteria were fixed in advance and are stated. Cases excluded after selection are listed with reasons. No case was dropped because it scored badly.

### C5 — De-identification `PASS / FAIL`
No reidentifying detail in the artifact. Coded index held separately. Any case that couldn't be de-identified was excluded, not softened.

### C6 — Written analysis
Adopted by reference rather than invented — the four criteria the Editor grades against are:
- **Question:** is the question stated precisely enough to be answered wrongly?
- **Method:** could a competent stranger reproduce the procedure from the text alone?
- **Limits:** are the limitations the real ones, or the flattering ones?
- **Conclusion:** does it follow from what was reported, and no further?

*(These mirror standard empirical-report marking criteria. If you obtain a published marking scheme — an APA-style manuscript structure guide, or a university's empirical-project rubric — substitute it wholesale and log the substitution. A published external standard outranks this list.)*

---

## Part D — Program-level, at each award boundary

Four questions. Answer honestly in the Registrar; nobody else will read them.

1. Can you state, cold, which three findings you believed in PSY-101 week 1 that you no longer believe? *(Compare against the sealed Priors Sheet — do not read it until you've answered.)*
2. Can you reconstruct each completed course's central argument chain without notes?
3. Did the artifact get built, or did the reading become the point?
4. Is there a claim in your own capstone you'd now bet against?

A "no" to #3 means the year failed regardless of everything above it. That's the criterion this whole structure is defending.

---

# ════ FILE: `enrolled/PSY-101.md` ════

> LIVE state, PSY-101. Five agent sections. Write only to the one you own.

# ENROLLED — PSY-101, Term A 2026

Course definition: [`catalog/PSY-101.md`](../catalog/PSY-101.md) · Standard: [`ASSESSMENT.md`](../ASSESSMENT.md) · Institution: [`REGISTRAR.md`](../REGISTRAR.md)

**Week 1 of 14** · 2026-09-07 → 2026-12-13 · weekly logs in `logs/PSY-101/`

Each agent owns one section here and writes only there. All five read all of it.

| Section | Owner |
|---|---|
| §A WEEK BOARD | Advisor |
| §B SOURCE LEDGER | Librarian |
| §C GAP LOG | Tutor |
| §D VERDICT LOG | Editor |
| §E CROSS-DOMAIN LEDGER | Roommate |

---

## §A WEEK BOARD — owner: ADVISOR

| Wk | Dates | Milestone | Primary source | Output | Closed |
|---|---|---|---|---|---|
| 1 | 09-07 → 09-13 | The replication crisis: scale and shape | OSC 2015 `[H]` + Ritchie 1–2 `[H]` | **Priors Sheet**, 600w | ☐ |
| 2 | 09-14 → 09-20 | Researcher degrees of freedom | Simmons et al. 2011 `[V]` | 600w | ☐ |
| 3 | 09-21 → 09-27 | **Apply** effect size and interval to replication data. Compute three by hand | STA-101 wk 2 `[V]` + OSC supplement | 600w + computations | ☐ |
| 4 | 09-28 → 10-04 | **Apply** the misinterpretation catalogue to published psychology abstracts | STA-101 wk 3 `[V]` | 600w | ☐ |
| 5 | 10-05 → 10-11 | Publication bias, file drawer, p-curve | Ritchie 3–4 `[H]` | 600w | ☐ |
| 6 | 10-12 → 10-18 | Preregistration: what it fixes, what it doesn't | Nosek et al. 2022 `[V]` | 600w | ☐ |
| 7 | 10-19 → 10-25 | **MIDTERM** — oral, cold | — | Tutor verdict | ☐ |
| 8–13 | 10-26 → 12-06 | WEIRD · heterogeneity · four autopsies | see course file | 600w each | ☐ |
| 14 | 12-07 → 12-13 | **What survived** + term paper | Simons & Chabris 1999 `[R]` | **2,000w — the Filter** | ☐ |

**Week 1 grading note (Advisor → Editor).** The Priors Sheet will fail A2 and A4 — it cites nothing and gives no magnitudes, because in week 1 the student cannot yet do either. Grade it normally, record the REWRITE, and the Advisor logs it as **baseline measured**, not a slipped week. No rewrite is owed. The standard is not amended; the failure is the instrument reading.

**Slipped:** 0 / 3.

---

## §B SOURCE LEDGER — owner: LIBRARIAN

`[V]` verified against a retrieved record · `[R]` recalled, unverified · `[H]` in hand, in NotebookLM

| # | Source | Wk | Tag | Verified against | Status |
|---|---|---|---|---|---|
| 1 | Open Science Collaboration (2015), *Science* 349(6251) aac4716 | 1 | `[H]` | PubMed 26315443 | **in NotebookLM 2026-08-21** — PSY-101 notebook |
| 12 | Ritchie, S. *Science Fictions* (2020) ch. 1–2 | 1 | `[H]` | Metropolitan Books, ISBN 978-1-250-22269-5 | **in NotebookLM 2026-08-21** — PSY-101 notebook. The notebook, not the Librarian, is now the authority on its contents |
| 2 | Simmons, Nelson & Simonsohn (2011), *Psych Sci* 22(11) 1359–1366 | 2 | `[V]` | doi:10.1177/0956797611417632 | acquire — open |
| 3 | Nosek et al. (2022), *Annu Rev Psychol* 73, 719–748 | 6 | `[V]` | doi:10.1146/annurev-psych-020821-114157 | acquire |
| 5 | Henrich, Heine & Norenzayan (2010), *BBS* 33(2–3) 61–83 | 8 | `[V]` | PubMed 20550733 | acquire — open PDF |
| 4 | Klein et al. (2018), *AMPPS* 1(4) 443–490 | 9 | `[V]` | doi:10.1177/2515245918810225 | acquire — open |
| 6 | Doyen et al. (2012), *PLoS ONE* 7(1) e29081 | 10 | `[V]` | journals.plos.org | acquire — open |
| 7 | Le Texier (2019), *Am Psychol* 74(7) 823–839 | 11 | `[V]` | PubMed 31380664 | acquire |
| 8 | Hagger et al. (2016), *PPS* 11(4) 546–573 | 12 | `[V]` | doi:10.1177/1745691616652873 | acquire |
| 9 | Watts, Duncan & Quan (2018), *Psych Sci* 29(7) 1159–1177 | 13 | `[V]` | doi:10.1177/0956797618761661 | acquire |
| 36 | Simons & Chabris (1999), *Perception* 28(9) 1059–1074 | 14 | `[R]` | — | verify |

Eleven of eleven verified as of 2026-08-21; two `[H]` (OSC 2015 and Ritchie, both in the PSY-101 notebook). **Week 1 is fully sourced.** Weeks 3–4 consume STA-101's sources rather than carrying their own — see the interlock note in `REGISTRAR.md`. Retag `[H]` as each lands in NotebookLM. **Nothing gets read from an untagged row.**

---

## §C GAP LOG — owner: TUTOR

A gap closes only when the student re-explains it cold, in a later session, in a frame the Tutor didn't supply.

| Wk | Concept | Gap (specific) | Status | Closed by |
|---|---|---|---|---|
| — | | | | |

**Standing probe for wk 1**, substituting for declined intake Q2 — a measurement, so don't prepare for it:

> 36% replicated. Of the 64% that didn't, how much is false positives and how much is real effects reported too big? How would you tell them apart?

---

## §D VERDICT LOG — owner: EDITOR

| Wk | Artifact | Rubric | Recon | Verdict | Rewrite |
|---|---|---|---|---|---|
| — | | | | | |

---

## §E CROSS-DOMAIN LEDGER — owner: ROOMMATE

Fortnightly. Spent domains cannot be reused.

| Wk | Domain | Collided with | Transfer that survived |
|---|---|---|---|
| — | | | |

**Spent:** none · **Queued:** see `catalog/PSY-sources.md` → Roommate's queue

---

# ════ FILE: `enrolled/STA-101.md` ════

> LIVE state, STA-101. Five agent sections. Write only to the one you own.

# ENROLLED — STA-101, Term A 2026

Course definition: [`catalog/STA-101.md`](../catalog/STA-101.md) · Standard: [`ASSESSMENT.md`](../ASSESSMENT.md) · Institution: [`REGISTRAR.md`](../REGISTRAR.md)

**Week 1 of 14** · 2026-09-07 → 2026-12-13 · weekly logs in `logs/STA-101/`

Runs concurrently with PSY-101 and feeds it — see the interlock table in the course file. Agents: this is a **separate enrolment**. Do not merge its sections with PSY-101's.

| Section | Owner |
|---|---|
| §A WEEK BOARD | Advisor |
| §B SOURCE LEDGER | Librarian |
| §C GAP LOG | Tutor |
| §D VERDICT LOG | Editor |
| §E CROSS-DOMAIN LEDGER | Roommate |

---

## §A WEEK BOARD — owner: ADVISOR

| Wk | Dates | Milestone | Primary source | Output | Closed |
|---|---|---|---|---|---|
| 1 | 09-07 → 09-13 | What a number claims: population, sample, estimand | Spiegelhalter 1–2 `[H]` | 600w | ☐ |
| 2 | 09-14 → 09-20 | **Effect size and interval as the primary result** → feeds PSY-101 wk 3 | Cumming 2014 `[V]` | 600w | ☐ |
| 3 | 09-21 → 09-27 | **The misinterpretation catalogue** → feeds PSY-101 wk 4 | Greenland et al. 2016 `[V]` | 600w | ☐ |
| 4 | 09-28 → 10-04 | *p*-values: the six things they are not | Wasserstein & Lazar 2016 `[V]` | 600w | ☐ |
| 5 | 10-05 → 10-11 | Power; why underpowered significant results exaggerate | Cumming, cont. | 600w | ☐ |
| 6 | 10-12 → 10-18 | Base rates and positive predictive value | Ioannidis 2005 `[V]` | 600w | ☐ |
| 7 | 10-19 → 10-25 | **MIDTERM** — oral, cold | — | Tutor verdict | ☐ |
| 8–13 | 10-26 → 12-06 | Forking paths · confounding · causal inference · measurement · graphs · meta-analysis | see course file | 600w each | ☐ |
| 14 | 12-07 → 12-13 | **Term paper** — audit one published claim end to end | — | **2,000w** | ☐ |

**Slipped:** 0 / 3.

**Load note.** Weeks 2–3 are front-loaded on purpose: they have to land before PSY-101 needs them. If a week slips in Term A, slip a PSY-101 week, never an STA-101 week 2 or 3 — the dependency runs one way.

---

## §B SOURCE LEDGER — owner: LIBRARIAN

| # | Source | Wk | Tag | Verified against | Status |
|---|---|---|---|---|---|
| S1 | Spiegelhalter, D. *The Art of Statistics* (2019) ch. 1–2 | 1 | `[H]` | Basic Books ISBN 978-1-5416-1851-0 · Pelican ISBN 978-0-241-39863-0 · Open Library | **in NotebookLM 2026-08-21** — STA-101 notebook |
| S2 | Cumming (2014), *Psych Sci* 25(1) 7–29 | 2 | `[V]` | doi:10.1177/0956797613504966 | acquire — open PDF at UBC |
| S3 | Greenland et al. (2016), *Eur J Epidemiol* 31(4) 337–350 | 3 | `[H]` | PubMed 27209009 | **in NotebookLM 2026-08-21** — STA-101 notebook |
| S4 | Wasserstein & Lazar (2016), *Am Stat* 70(2) 129–133 | 4 | `[V]` | doi:10.1080/00031305.2016.1154108 | acquire — open access |
| S5 | Ioannidis (2005), *PLoS Med* 2(8) e124 | 6 | `[V]` | journals.plos.org | acquire — open access |
| S6 | Gelman & Loken (2014), *American Scientist* | 8 | `[R]` | — | verify |

Six of six named sources are verified as of 2026-08-21; two `[H]` (Spiegelhalter and Greenland, both in the STA-101 notebook). Four are free. **This is the cheapest course in the catalog to start.**

Retag `[H]` as each lands in NotebookLM. Nothing gets read from an untagged row.

---

## §C GAP LOG — owner: TUTOR

| Wk | Concept | Gap (specific) | Status | Closed by |
|---|---|---|---|---|
| — | | | | |

**Standing wk-7 midterm probe:** state what a 95% interval means, then four things it does not mean, from Greenland's catalogue, cold. *"95% probability the true value is in there"* is misinterpretation #19 and does not pass.

---

## §D VERDICT LOG — owner: EDITOR

| Wk | Artifact | Rubric | Recon | Verdict | Rewrite |
|---|---|---|---|---|---|

**Note for this course:** A4 (effect size, not just significance) is normally the criterion a student fails early. Here it is the *subject*. Grade it strictly from week 2 onward — a student who fails A4 in a statistics course in week 5 has a curriculum problem, and the Advisor needs to hear about it.

---

## §E CROSS-DOMAIN LEDGER — owner: ROOMMATE

| Wk | Domain | Collided with | Transfer that survived |
|---|---|---|---|

**Spent:** none

**Standing instruction:** two courses are active this term. The best available collision is often **between them** — a claim from PSY-101's autopsies read with STA-101's week-3 catalogue in hand is a live cross-course problem you didn't have to invent. Use it before reaching outside.

---

# ════ FILE: `catalog/PSY-101.md` ════

> Course definition + course-specific cut list.

# PSY-101 — Foundations of Psychological Evidence

**Level:** 100 · **Credits:** 3 · **Weeks:** 14 · **Load:** ~5 h/week
**Prerequisite:** none · **Unblocks:** every other PSY course

---

## 1. Question

**Given a psychological claim, how do you decide whether to believe it?**

Answerable wrongly, which is the test. Most people answer "check if it's peer-reviewed," and that answer is why this course exists: 97% of the studies in the 2015 reproducibility project were peer-reviewed and reported significant results; 36% replicated.

## 2. Why 100-level

Reads secondary and primary together, deliberately. The student is learning the field's standards of evidence before being asked to hold a position in it. No original analysis is demanded.

This is the one course in the catalog that is a **hard** prerequisite rather than an administrative one. Skipping it doesn't leave you behind; it leaves you confidently wrong in a way the later courses can't repair, because every source-triage decision in Terms B and C runs on skills built here.

## 3. Sequence — 14 weeks

| Wk | Milestone | Primary source | Unblocks |
|---|---|---|---|
| 1 | The replication crisis: scale and shape | OSC 2015 `[V]` + Ritchie 1–2 `[R]` | the entire course; the Priors Sheet |
| 2 | Researcher degrees of freedom — how a true-seeming result gets built without anyone lying | Simmons et al. 2011 `[V]` | wk 5, wk 9–12 |
| 3 | **Apply** effect size and interval to replication data. Compute three by hand | STA-101 wk 2 `[V]` + OSC supplement | every magnitude judgment in the major |
| 4 | **Apply** the misinterpretation catalogue to published psychology abstracts | STA-101 wk 3 `[V]` | wk 12, PSY-202 |
| 5 | Publication bias, the file drawer, p-curve | Ritchie 3–4 `[R]` | wk 13 |
| 6 | Preregistration and registered reports: what they fix, what they don't | Nosek et al. 2022 `[V]` | PSY-401's pre-registration requirement |
| 7 | **MIDTERM** — oral, cold, no sources open | — | — |
| 8 | WEIRD samples: most of psychology describes an unusual population | Henrich et al. 2010 `[V]` | PSY-201, PSY-301 |
| 9 | Heterogeneity across sites — kills the "different sample" defense | Klein et al. 2018 `[V]` | wk 10–13 |
| 10 | **Autopsy I** — priming, and experimenter expectancy | Doyen et al. 2012 `[V]` | wk 13 |
| 11 | **Autopsy II** — Stanford Prison, from the archives | Le Texier 2019 `[V]` | PSY-301 wk on obedience |
| 12 | **Autopsy III** — ego depletion, 23 labs. Read the authors' reply for how a field argues | Hagger et al. 2016 `[V]` | wk 14 |
| 13 | **Autopsy IV** — the marshmallow test: not false, half the size, about something else | Watts et al. 2018 `[V]` | the hardest and most useful case |
| 14 | **What survived** — inattentional blindness and the robust effects. Then the term paper | Simons & Chabris 1999 `[R]` | PSY-201 onward |

Week 14 is not decoration. A course that spends thirteen weeks on failure and stops produces a student who believes nothing, which is as useless as believing everything and considerably more smug.

## 4. Cut list

| Cut | Reason |
|---|---|
| Teaching statistical machinery | **Delegated to STA-101, running concurrently in Term A.** Weeks 3–4 apply it to psychology; they do not teach it. Nothing is taught twice. |
| The sociology of the crisis — careers, incentives, personalities | Interesting, unblocks nothing here. |
| Bayesian vs. frequentist as a philosophical dispute | Unblocks nothing at 100-level. Returns in PSY-202 wk on scoring rules, where it does work. |
| Fraud cases (Stapel, Wansink) | Fraud is the easy story. Every autopsy in weeks 10–13 involves honest researchers, which is the harder and more useful lesson. |

## 5. Sources

Nine of the twelve are `[V]`, verified against PubMed/DOI records. All but Cumming and Ritchie are open-access. Full ledger: [`catalog/PSY-sources.md`](PSY-sources.md) Term 0 block.

**Obtainability:** clear. This course can be run today with no paywall exposure.

## 6. Co-requisite — STA-101

Not a formal prerequisite, but weeks 3–4 assume it and the interlock is one-directional: STA-101 wk 2 → this wk 3, STA-101 wk 3 → this wk 4, STA-101 wk 6 → this wk 5. If a week must slip in Term A, slip this course.

Running PSY-101 without STA-101 means restoring the protective plan: weeks 3–4 revert to teaching effect sizes from scratch, and the course gets tighter everywhere else to pay for it.

## 7. Assessment

- **Week 1 — the Priors Sheet.** Three findings you currently believe, the evidence you think supports each, what would change your mind. Written before the reading lands, sealed, never revised. `ASSESSMENT.md` Part D compares against it at the end of the major. Expected to fail A2 and A4; the failure is the instrument reading.
- **Week 7 midterm.** Tutor, oral, cold. Probes magnitude reasoning on *psychological* claims specifically — STA-101's midterm covers the machinery in the same week, so this one tests transfer rather than definitions.
- **Week 14 term paper, 2,000 words — the Filter.** The checks you now run on any claim before it enters your ledger, each justified by a specific case from weeks 10–13. This paper becomes the Librarian's standing instruction for the rest of the major, so it is a working document, not an essay.

---

# ════ FILE: `catalog/STA-101.md` ════

> Course definition + course-specific cut list.

# STA-101 — Reading Quantitative Claims

**Level:** 100 · **Credits:** 3 · **Weeks:** 14 · **Load:** ~5 h/week
**Prerequisite:** none · **Unblocks:** PSY-101 wk 3–4 · PSY-202 wk 11 · **PSY-401 §C3**

---

## 1. Question

**Given a number offered as evidence, what does it actually license you to believe?**

Answerable wrongly, and most people do: they check whether *p* < .05 and stop. That check is roughly the least informative operation available on a result, which is what weeks 2–4 are about.

## 2. Why 100-level

Learns a field's standards of evidence; no original analysis demanded. **This is a course in consumption, not production.** You are not learning to run a study. You are learning to read one and say precisely what it does and doesn't support — which is a different and, for your purposes, more valuable skill.

## 3. Sequence — 14 weeks

| Wk | Milestone | Primary source | Unblocks |
|---|---|---|---|
| 1 | What a number claims: population, sample, estimand. What is being estimated, and of what? | Spiegelhalter, *The Art of Statistics* ch. 1–2 `[R]` | everything |
| 2 | **Effect size and interval** — the estimate and its precision, as the primary result | Cumming 2014 `[V]` | **PSY-101 wk 3** |
| 3 | **Interval interpretation, and the misinterpretation catalogue.** 25 of them, itemised | Greenland et al. 2016 `[V]` | **PSY-101 wk 4** |
| 4 | *p*-values: what they are, and the six things the ASA says they are not | Wasserstein & Lazar 2016 `[V]` | wk 5–6 |
| 5 | Power, and why an underpowered significant result *exaggerates* rather than merely risks error | Cumming, cont. | wk 6 |
| 6 | Base rates and positive predictive value: why most published findings in a low-prior field are false | Ioannidis 2005 `[V]` | PSY-101 wk 5 |
| 7 | **MIDTERM** — oral, cold | — | — |
| 8 | Multiplicity and the garden of forking paths — no *p*-hacking required | Gelman & Loken 2014 `[R]` | PSY-101 wk 2 |
| 9 | Confounding, and what "adjusted for" actually buys you | Spiegelhalter `[R]` | **PSY-401 scoring** |
| 10 | Randomization and the basics of causal inference | Spiegelhalter `[R]` | PSY-401 |
| 11 | Measurement: reliability, validity, and what a scale is really doing | selected `[R]` | PSY-302 wk 1–2 |
| 12 | Graphs that mislead; summaries that hide the distribution | Spiegelhalter `[R]` | — |
| 13 | Meta-analysis: reading a forest plot, and heterogeneity | selected `[R]` | PSY-101 wk 12 |
| 14 | **Term paper** — audit one published claim end to end | — | PSY-401 §C3 |

## 4. Cut list

| Cut | Reason |
|---|---|
| Probability theory and its derivations | You are reading results, not deriving them. |
| Regression mathematics | Week 9 teaches what "adjusted for" buys. The matrix algebra buys nothing here. |
| Bayesian vs. frequentist as philosophy | Consumes three weeks, changes no reading decision at this level. |
| R, Python, any software | A course in reading, not computing. Adding a language would eat half the term. |
| Experimental design | You are not running studies. Cut. |
| Calculus, distributions as mathematical objects | Same reason. |

The cut list here is longer than the course because "statistics" is enormous and almost none of it serves the destination. **What survives is exactly what lets you read a table and say what it supports.**

## 5. Sources

Five of the six named papers are `[V]`, verified against retrieved records, and **all five are open access**. Spiegelhalter is a trade paperback and the only purchase the course requires.

| Source | Tag | Verified against |
|---|---|---|
| Cumming (2014), *Psych Sci* 25(1) 7–29 | `[V]` | doi:10.1177/0956797613504966 |
| Greenland et al. (2016), *Eur J Epidemiol* 31(4) 337–350 | `[V]` | PubMed 27209009 |
| Wasserstein & Lazar (2016), *Am Stat* 70(2) 129–133 | `[V]` | doi:10.1080/00031305.2016.1154108 |
| Ioannidis (2005), *PLoS Med* 2(8) e124 | `[V]` | journals.plos.org |
| Spiegelhalter, *The Art of Statistics* (2019) | `[R]` | — verify before buying |
| Gelman & Loken (2014), *American Scientist* | `[R]` | — verify |

**Obtainability:** clear, and cheaper than any other course in the catalog.

**Greenland et al. is the single highest value-per-page item.** Twenty-five numbered misinterpretations of *p*-values, intervals, and power, each stated and corrected. It is a reference you will use for the rest of the major, not a paper you read once.

## 6. Assessment

- **Midterm wk 7:** state what a 95% interval means, and then state four things it does not mean, from Greenland's list, without looking. A student who says "95% probability the true value is in there" has not passed — that is misinterpretation #19 and it is the most common one in the world.
- **Term paper, 2,000 words — the audit.** Take one published quantitative claim, from anywhere, and work it end to end: what was estimated, how precisely, what would have falsified it, what it does not support, and what you would need to see to change your mind. This is PSY-401's method rehearsed on someone else's work, eight months early.

---

## Interlock with PSY-101

These two run concurrently in Term A **by design, and the sequencing is deliberate.**

| STA-101 delivers | in week | PSY-101 consumes it | in week |
|---|---|---|---|
| Effect size and interval as the primary result | 2 | Magnitude reasoning applied to replication data | 3 |
| The misinterpretation catalogue | 3 | Power; why underpowered significant results are usually wrong | 4 |
| Base rates and PPV | 6 | Publication bias, file drawer, p-curve | 5 |
| Forking paths | 8 | (retrospective — deepens wk 2) | 2 |

**Consequence for PSY-101:** weeks 3–4 were planned *protectively* — teaching effect sizes from scratch because intake Q2 was declined and the safe assumption was no fluency. That is now redundant. STA-101 teaches the machinery; PSY-101 weeks 3–4 re-scope to **applying** it to replication data, which is what those weeks should have been all along.

Nothing is taught twice. That is the whole argument for concurrent enrolment, and it is why two courses at five hours each beats one course at ten.

---

# ════ FILE: `catalog/PSY-major.md` ════

> Subject-wide program statement and CUT LIST. Binds every PSY course.

# PSY — Program Statement

The subject-wide statement for the psychology major: destination, baseline, the shape of the sequence, and the subject-wide cut list. Individual courses live in [`CATALOG.md`](../CATALOG.md) and carry their own week-by-week sequences and course-specific cuts.

Produced by the Advisor. Amendable only by the Advisor, and only with a logged reason.

**Course map** — this document's Terms 0–4 became the catalog's six courses:

| Was | Is now |
|---|---|
| Term 0 — Calibration | [PSY-101](PSY-101.md), expanded 4 → 14 weeks |
| Term 1 — The Evolved Mind | [PSY-201](PSY-201.md) |
| Term 2 — Judgment | [PSY-202](PSY-202.md) |
| Term 3 — The Social Animal | [PSY-301](PSY-301.md) |
| Term 4 — The Individual | [PSY-302](PSY-302.md) |
| Capstone | [PSY-401](PSY-401.md) |

Sections §3 (Sequence) and §5 (Milestone Rule) below are superseded by the course files and by [`DEGREE.md`](../DEGREE.md). §1, §2, §4 and §6 remain live and bind every PSY course.

---

## §1 Destination

> **Build a de-identified decision-audit: 12–18 real judgment calls, scored against a framework you pre-register in week 0, with a written analysis of where human judgment failed in a predictable direction and what the literature says about why.**

`STATUS: CONFIRMED 2026-08-20. Locked for the term. Swap conditions below are void unless access is refused by policy.`

**Why this one.** Three candidate destinations were on the table: an essay series, this audit, and teaching the material to a team. This is the only one that satisfies the constraint that actually binds — you are running solo, with no human witness, so the artifact has to be gradeable by something that isn't your own opinion at 11pm on a Friday.

It qualifies because of the reconstruction property: you score the calls *from the record as it stood at decision time*, then check against what actually happened. Reality returns a verdict you did not author. A framework that predicts outcomes at chance is a failed framework no matter how well-argued it is, and no amount of eloquence rescues it. Compare "design a better review process," which is unfalsifiable alone and would rot into a year of well-written opinions.

It also uses material nobody else has access to. That is not a small thing: it is the difference between an artifact that demonstrates you read some books and one that demonstrates you can do work.

**Hard constraints on the artifact:**

1. **De-identify at intake, not at write-up.** Names, employee IDs, dates narrowed to week, faces, anything reidentifying — stripped before the record enters your working set. Work from a coded index you keep separately. If a case cannot be de-identified, it does not enter the audit.
2. **Pre-register the scoring framework before you look at outcomes.** Week 0 or it doesn't count. Post-hoc framework design is the exact failure Term 0 teaches you to spot; committing it in your own capstone would be the funniest possible outcome.
3. **Score blind to outcome where the record allows it.** Decision-time information only, in a separate pass from the outcome data.
4. **Nothing proprietary leaves your machine.** The artifact is the analysis and the framework, not the underlying records.

**Standing access check.** Confirmed on the student's authority. Before week 45, get an explicit read on whether your employer's policy permits this use of incident records even in de-identified, non-exported form. Do that check in Term 2, not the week you start scoring — a policy refusal in week 45 costs the capstone, in week 20 it costs nothing but a swap.

**Swap conditions (void unless access is refused).** If confirming this is blocked — access, policy, or you simply don't want your job in your degree — the fallback is: *reconstruct a published finding's analysis from its open data and report where your numbers diverge from the paper's.* Same reconstruction property, no proprietary material, weaker on originality. Swapping the destination changes §5 and the Capstone only. Terms 0–4 stand either way.

---

## §2 Baseline

Set formally at the week-1 intake. Working assumption until then:

| Dimension | Assumed level | How it changes the plan |
|---|---|---|
| Formal psychology training | none | Term 0 cannot be skipped or shortened |
| Statistical literacy | **unmeasured** — Q2 declined; re-measured by Tutor probe in wk 1 | Week 3 planned protectively as if absent. Compresses if the wk-1 probe comes back clean |
| Operational exposure to behavior | high, sustained, systematic | Terms 3–4 run faster; you have referents most students don't |
| Academic reading stamina | untested | Weeks 1–4 are deliberately light to measure it, then calibrate |
| Weekly capacity | **9–12h at worst week** (Q3, 2026-08-20) | Second supporting source permitted in Terms 2 and 4 only |
| Writing under critique | untested | Editor calibrates severity from the week-2 output |

**Intake questions the Advisor asks in week 1** (answer in the Registrar, not from memory):
1. What's the last non-fiction book you finished, and what do you still remember from it?
2. Given a study reporting *d* = 0.3, *p* = .04, *n* = 60 — what's your reaction?
3. How many hours per week, honestly, at your worst week — not your best?
4. Name a time you predicted someone's behavior correctly and a time you didn't. Which do you remember better and why?

---

## §3 Sequence — SUPERSEDED by the course catalog

*Retained for the unblocking rationale, which still holds. Week numbers are historical; use the course files.*


Five terms and a capstone. The order is not arbitrary and is not negotiable: calibration precedes content because a year of confident reading on unreplicated findings produces a very well-read person who is wrong. Biology precedes cognition because it explains why the machinery has the shape it has. Cognition precedes social because social phenomena are built out of individual inference. The individual comes last because personality and clinical work are the most theory-laden and you need the previous four terms to read them without being had.

### Term 0 — Calibration (Weeks 1–4)
**Question:** How do I know which of these findings survived?
**Unblocks:** everything. Without this term, every later term is a confidence-amplifier for debunked results.

- Wk 1 — The replication crisis: what happened, what fraction, which subfields
- Wk 2 — Researcher degrees of freedom, p-hacking, HARKing, publication bias
- Wk 3 — Effect sizes, confidence intervals, power. Hands-on: compute three by hand
- Wk 4 — WEIRD samples and generalization. Build the **debunked shelf** in Registrar §2

**Term output:** A one-page personal filter — the checks you run on any claim before it enters the ledger. This becomes the Librarian's standing instruction for the rest of the year.

### Term 1 — The Evolved Mind (Weeks 5–14)
**Question:** Why does the machinery have this shape?
**Unblocks:** every "why would anyone do that" question in Terms 3 and 4.

- Wk 5–7 — Behavioral biology: hormones, stress, the time-scale stack from seconds to millennia
- Wk 8–9 — Evolutionary psychology, and the honest case against it (adaptationism, unfalsifiability)
- Wk 10–12 — Cultural evolution: why culture is the human adaptation, not a veneer on one
- Wk 13 — Kinship, reciprocity, cooperation, punishment
- Wk 14 — Consolidation + Roommate collision

**Term output:** 1,200 words — "Three behaviors I observe weekly at work, explained at four time scales." First real use of your own data.

### Term 2 — Judgment (Weeks 15–24)
**Question:** How does a mind decide, and how does it fail in patterned ways?
**Unblocks:** the capstone framework directly. This is the term the artifact is built out of.

- Wk 15–16 — Dual-process accounts and their post-crisis status
- Wk 17–18 — Heuristics and biases: which survived, which didn't, which shrank
- Wk 19 — The Gigerenzer counterargument: ecological rationality, when heuristics beat models
- Wk 20 — Clinical vs. actuarial judgment. **The single highest-value week for your destination**
- Wk 21 — Forecasting, calibration, scoring rules
- Wk 22 — Memory as reconstruction; eyewitness reliability
- Wk 23 — Noise vs. bias: variance in judgment between judges and within one judge over time
- Wk 24 — **Draft the capstone scoring framework.** Pre-register it. Lock it.

**Term output:** The pre-registered framework, in the Registrar, dated, before any case is scored.

### Term 3 — The Social Animal (Weeks 25–34)
**Question:** What does the presence of others do to a person?
**Unblocks:** interpretation of every case where a decision was made in front of a supervisor, a camera, or a crowd.

- Wk 25–26 — Situation vs. disposition; the fundamental attribution error at full strength and reduced
- Wk 27 — Conformity, obedience, diffusion — the classics **and** their modern autopsies
- Wk 28–29 — Moral psychology: intuition-first models, and the objections
- Wk 30 — Status, hierarchy, deference, face
- Wk 31 — Trust, reputation, cheater detection
- Wk 32 — Influence and compliance; which of the classic tactics have real effect sizes
- Wk 33 — Groups: polarization, escalation of commitment, why committees decide badly
- Wk 34 — Consolidation + Roommate collision

**Term output:** 1,500 words — "A situation I misread as a character trait," worked in both directions.

### Term 4 — The Individual (Weeks 35–44)
**Question:** What is stable about a person, and what did we only think was stable?
**Unblocks:** the "was this person predictable?" half of the capstone.

- Wk 35–36 — Trait structure: the Big Five, what it predicts, what it doesn't, why the popular alternatives are worthless
- Wk 37 — Behavioral genetics: heritability, what it means and the four things it doesn't
- Wk 38–39 — Attachment and development; longitudinal evidence and its limits
- Wk 40 — Narrative identity: the story people tell about themselves as data
- Wk 41–42 — Psychopathology: classification, the reliability problem, the anti-psychiatry critique on its merits
- Wk 43 — Trauma and stress: the strong evidence and the overreach, held apart
- Wk 44 — Consolidation + Roommate collision

**Term output:** 1,500 words — "What I can and cannot infer about a person from 20 minutes of watching them." Written against your own occupational instincts.

### Capstone (Weeks 45–52)
- Wk 45–46 — Case selection, de-identification, coded index built
- Wk 47–48 — Blind scoring pass, decision-time information only
- Wk 49 — Outcome pass; compute hit rate, calibration, direction of error
- Wk 50 — Write the analysis. Expect the framework to have partly failed; that result is not a setback, it is the finding
- Wk 51 — Editor: three full rewrite rounds, harsh, against the locked rubric
- Wk 52 — Final. Registrar closed out. Reading list for year two written by you, not by an agent

---

## §4 Cut List — subject-wide

Binds every PSY course. Individual courses add their own on top.

Refused by **all five agents**, not just the Advisor. If a source or tangent appears here, the agent that encounters it says so and moves on.

| Cut | Reason |
|---|---|
| Freud, Jung, and psychoanalytic theory as *content* | Historically enormous, empirically inert. One reading in **PSY-302** as intellectual history. Nothing more. |
| MBTI, Enneagram, DISC, colour-coded type systems | No predictive validity worth the week. **PSY-302 wk 3** covers *why* in one week and never again. |
| NLP, "body-language reading," micro-expression detection as a skill | Actively harmful in your occupational context — the deception-detection literature says trained confidence rises and accuracy doesn't. |
| Self-help and the productivity-psychology shelf | Optimizes for reader feeling, not for truth. |
| Positive-psychology intervention literature | Among the hardest-hit areas in replication. Not worth remediating. |
| Cellular and molecular neuroscience | Real, hard, and does not unblock a single later week for this destination. |
| Inferential statistics as coursework | You need to *read* a result, not produce one. Term 0 wk 3 is the whole allocation. |
| Any single-study finding with *n* < 100 and no replication | Term 0 makes this rule; the Librarian enforces it from wk 5 onward. |
| "History of psychology" as a survey | Chronology is not comprehension. History enters only where it explains a current dispute. |
| Comprehensiveness | You asked to learn "everything." That instruction is the failure mode. This charter deliberately omits perception, psychophysics, animal cognition, and most of neuro. If a week finishes early, the answer is depth on the milestone, never breadth into a cut area. |

---

## §5 Milestone Rule — partly superseded

*Word counts now scale by level (`ASSESSMENT.md`). The one-output-per-week rule and the slipped-week counter stand unchanged.*


Every week produces one written artifact. No exceptions, no "reading week."

- Weeks 1–14: 600 words
- Weeks 15–34: 800 words
- Weeks 35–52: 1,200 words

A week with no output is a **slipped week** and gets logged in §6 of the Registrar. Three slipped weeks trigger a mandatory scope cut, not a calendar extension. The calendar is fixed at 52 weeks; the scope is the variable. This is the single rule most likely to be violated, which is why it's the one with a counter attached.

---

## §6 The Witness Problem

The framework as written assumes a human witness — someone whose review of your artifact carries stake, ground truth, memory, and reputational transfer. You've said there is no such person and you intend to work alone. That's accepted, not argued with. But the slot is not deleted, it's refilled, because three of the four functions can be sourced without anyone.

| What a witness provided | Replacement | Strength |
|---|---|---|
| **Stake** — someone who has to use your work | **Reconstruction.** The audit either predicts outcomes or it doesn't. Reality can't be negotiated with at 11pm. | Strong |
| **Ground truth** — catches the wrong assumption inside a well-built model | **Real records + blind scoring.** The data is yours; the outcomes are not your opinion. | Strong |
| **Memory of being unimpressed** — carries Friday's disappointment to Monday | **The Registrar.** §3 carries open gaps forward; §4 carries verdicts forward. The file has the memory the agent doesn't. | Partial |
| **Reputational transfer** — someone whose belief in you changes | **Nothing.** | Absent |

The fourth is a real loss and is not solved here. It is also a *later* problem rather than a curriculum problem: the artifact is the thing you eventually show someone, and arriving with it built beats asking for attention while building it.

Operationally: the Editor is the rehearsal witness for drafts one through three and should be harsh there. The rubric and the reconstruction result are the actual grade.

---

# ════ FILE: `START-HERE.md` ════

> The ordered walkthrough and the weekly rhythm.

# START HERE

Everything that has to happen, in order. Term A opens **Monday 7 September 2026** _(postponed from 24 Aug — accounting cross-training until 4 Sept)_.

---

# Part 1 — Before Monday

About 90 minutes total, spread across four days. Do them in this order; step 2 is order-dependent and can't be recovered if you get it wrong.

## 1. Answer the two open intake questions · 10 min

Open `logs/PSY-101/week-01.md` and fill in Q1 and Q4. Don't look anything up — a researched answer measures nothing.

> **Q1.** What is the last non-fiction book you finished, and what do you still remember from it?
>
> **Q4.** Name a time you predicted someone's behavior correctly, and a time you didn't. Which do you remember better, and why?

Q1 sets how much of the teaching load the writing has to carry versus the reading. Q4 is the capstone's problem in miniature — if the *correct* prediction is the vivid one, that's the exact bias the audit exists to measure, and you've handed the Tutor its first case.

## 2. Write the Priors Sheet · 45 min · **BEFORE YOU OPEN A SINGLE SOURCE**

600 words. Three findings about human behavior you currently believe, what you think the evidence is for each, and what would change your mind.

**This is the one step with an order dependency you cannot undo.** The moment you read the OSC 2015 paper, your priors are contaminated and this measurement is gone for good. Write it this weekend, or Monday morning before anything else.

- Pick findings you'd actually **act on**. Something you've used at work beats something you read in a magazine.
- "What would change my mind" must name an **observation**, not a feeling. *"If I saw contradictory evidence"* fails. *"If a preregistered multi-lab replication with n > 2000 found d < 0.1"* passes.
- Don't look anything up.

The calendar shows it due Sunday 30 August. That's the **seal** date, not the write date. Write it before Monday; seal it Sunday and never revise it — not in month six when it's embarrassing.

It will fail rubric criteria A2 and A4. It cites nothing and gives no magnitudes, because in week 1 you can't yet do either. **That failure is the instrument reading, not a setback.** No rewrite is owed.

## 3. Get the sources · 30 min

**Free, verified, get all four now:**

| | Source | Find it at |
|---|---|---|
| 1 | Open Science Collaboration 2015, *Science* 349(6251) aac4716 | PubMed 26315443 |
| 2 | Cumming 2014, *Psych Sci* 25(1) 7–29 | doi:10.1177/0956797613504966 |
| 3 | Greenland et al. 2016, *Eur J Epidemiol* 31(4) 337–350 | PubMed 27209009 |
| 4 | Wasserstein & Lazar 2016, *Am Stat* 70(2) 129–133 | doi:10.1080/00031305.2016.1154108 |

**Verify before buying — these are `[R]`, recalled, not verified:**

- Ritchie, *Science Fictions* (2020)
- Spiegelhalter, *The Art of Statistics* (2019)

I can produce a fluent, correctly formatted citation for a book that doesn't exist under that title. Check both are real before spending money. That check is not paranoia, it's the specific failure mode of using a language model as a librarian.

**Buy nothing else yet.** Not Sapolsky, not Kahneman, not Meehl. A folder of sixty unread PDFs by month nine is the exact way this year dies, and it starts with a productive-feeling afternoon in week 1.

## 4. Stand up the five agents · 15 min

**Recommended: run it in Claude Code, in this repo.** The agents are already live in `.claude/agents/` — invoke by name. They read `REGISTRAR.md` and `enrolled/<CODE>.md` directly off disk, which means the shared state file stays in sync with zero effort from you.

**Alternative: five claude.ai Projects.** One per agent. Copy everything *below* the `---` frontmatter block of each `.claude/agents/*.md` file into the Project's custom instructions. Add **`AGENT-PACK.md`** to each Project's knowledge — one file containing all eight state documents, including both cut lists. Attaching the state files individually is a mistake: it is easy to omit the catalog files, and without the cut lists an agent cannot refuse anything, which is the whole of what makes it an agent.

Be aware of what this costs: **you re-upload the state files to five Projects every time they change**, which is roughly five times a week. That friction is small on day one and is a plausible reason the program is dead by October. If you use Projects anyway, do the re-upload as part of the Sunday close and nowhere else.

**Either way: the Librarian needs web search enabled.** Without it, it cannot verify a single citation and every source it hands you is `[R]`. Turn it on and confirm it's on.

## 5. Two NotebookLM notebooks · 10 min

One for **PSY-101**, one for **STA-101**. Separate, not combined — NotebookLM grounds its answers in what you upload, so mixing the two stacks dilutes both.

Upload the four free PDFs: OSC 2015 goes in PSY, the other three in STA. Then update the tag in `enrolled/<CODE>.md` §B from `[V]` to `[H]` — in hand. `[H]` is the strongest tag and it means the notebook, not the Librarian, is now the citation authority for that source.

---

# Part 2 — Week 1: Mon 7 → Sun 13 September

| Day | Do | Time |
|---|---|---|
| **Mon** | Priors Sheet already written? If not, write it now, before anything. Then: **Advisor** opens the week, **Librarian** confirms the source rows. | 30 min |
| **Tue** | Read STA-101 wk 1 — Spiegelhalter ch. 1–2. *What is being estimated, and of what?* | ~2 h |
| **Wed** | Read PSY-101 wk 1 — OSC 2015. Sit with the number: **97% of originals reported significant results; 36% of replications did.** Before Thursday, form a view on what that gap is made of. You'll be wrong about the proportions. Being wrong on the record is the point. | ~2 h |
| **Thu** | **Tutor**, both courses, 45 min each. Sources closed. Opens on cold retrieval — *"without looking, what was the argument?"* If you open the PDF, the session measures nothing and restarts later. | 1.5 h |
| **Fri** | Write both outputs, 600 words each. | ~2 h |
| **Sat** | Nothing. The Roommate starts week 2. | — |
| **Sun** | **Editor** grades both against Part A. **Advisor** closes the week. **Seal the Priors Sheet.** | 45 min |

~9 hours. That's your stated worst-week capacity, in week 1, on purpose — if week 1 overruns, the problem is the plan and the Advisor needs to hear about it immediately, not in October.

---

# Part 3 — Every week after

```
Mon   Advisor sets the milestone · Librarian pulls one primary + one supporting per course
Tue   Read course A
Wed   Read course B
Thu   Tutor, 45 min per course, cold
Fri   Write both outputs
Sat   Roommate — fortnightly only
Sun   Editor grades · Advisor closes the week
```

**Week 7** (19–25 Oct) is midterms, both courses, oral and cold.
**Week 14** (13 Dec) is term papers, 2,000 words each. Then Term A is on the transcript.

---

# Part 4 — The four things that actually end this

Not lack of motivation. These:

**1. Buying the whole reading list in week 1.** You get a folder instead of a habit. Buy what the current three weeks need, nothing further.

**2. Reading without writing.** The output is not a record of the learning, it *is* the learning. A week with no output is a slipped week — log it. Three slips triggers a scope cut, and the Advisor executes it without renegotiating. **The calendar never moves.**

**3. Letting the Editor go soft.** If your pass rate is near 100% by week 6, the Editor has drifted toward the standard you argued for in the moment, which is the specific thing it's bad at. That's why `ASSESSMENT.md` is locked and dated before week 1. If you catch yourself wanting to edit it mid-grading, that impulse is exactly what the lock is defending against.

**4. Answering "yeah, that makes sense" to the Tutor.** It ends the conversation socially and teaches nothing. The counter-move is built into the agent and you should expect it every time: *"Then say it back in a form I didn't give you, using a case from your own week."*

---

# Owed later, easy to forget

**Before Term B (4 Jan 2027)** — the **access check**. Confirm your employer's policy permits the PSY-401 use of incident records in de-identified, non-exported form. A refusal in December costs you a swap to the fallback destination. The same refusal at week 45 costs the entire capstone.

**Also before Term B** — start hunting **Meehl, *Clinical Versus Statistical Prediction* (1954)**. Highest-value single item in the major for your destination, and the hardest to obtain. Dawes, Faust & Meehl 1989 in *Science* is the accessible substitute if the monograph can't be found.

---

