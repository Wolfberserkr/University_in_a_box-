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
