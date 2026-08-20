# REGISTRAR

Institution-level state. All five agents read this first, every session, to find out **which course they are in**.

Per-course state lives in `enrolled/<CODE>.md` — that's where the five agent sections are, one set per active enrolment. This file holds enrolment, the calendar, and the transcript.

---

## Student

**Ulrich** · Program start **2026-08-24** · Award target: **Certificate** (6 courses), then reassess
**Capacity:** 9–12 h/week at a bad week (intake Q3, 2026-08-20) → 2 concurrent courses, ~5 h each

### Baseline

| | Question | Answer | Effect |
|---|---|---|---|
| Q1 | Last non-fiction book finished, what survives of it | _open_ | how much load the output carries vs. the reading |
| Q2 | React to *d* = 0.3, *p* = .04, *n* = 60 | **declined** → re-measured at PSY-101 wk 7 midterm | PSY-101 wk 3–4 planned protectively: assume no effect-size fluency |
| Q3 | Worst-week hours | **9–12** | 2 concurrent courses; second supporting source at 200/300 level |
| Q4 | A prediction you got right, one you got wrong, which you remember better | _open_ | Tutor's first case; likely the capstone's own bias in miniature |

**On Q2.** A declined self-report is not a baseline and won't be guessed at. Costs are asymmetric — over-teaching effect sizes wastes two weeks, under-teaching them corrupts source triage for the remaining fifty — so the protective side is taken and the measurement moves from self-report to performance. The PSY-101 midterm probes magnitude directly and cannot be bluffed. If it comes back clean, weeks 3–4 compress.

---

## Calendar 2026–27

| | Weeks | Dates | Enrolled |
|---|---|---|---|
| **Term A** | 1–14 | 2026-08-24 → 2026-11-29 | **PSY-101** + _[slot open]_ |
| break | 15 | 11-30 → 12-06 | — |
| **Term B** | 16–29 | 12-07 → 2027-03-14 | PSY-201, PSY-202 |
| break | 30 | 03-15 → 03-21 | — |
| **Term C** | 31–44 | 03-22 → 2027-06-27 | PSY-301, PSY-302 |
| **Capstone** | 45–52 | 06-28 → 2027-08-22 | PSY-401 |

**Term A slot 2 is open.** PSY-101 has to run alone on the psychology side — everything else depends on it. See [`CATALOG.md`](CATALOG.md) → Open slots. Naming a second subject fills it; leaving it empty is also a decision, and it costs the cross-subject requirement at Degree level.

---

## Enrolment — active

| Course | Level | Term | Week | State file | Status |
|---|---|---|---|---|---|
| [PSY-101](catalog/PSY-101.md) | 100 | A | 1 of 14 | [`enrolled/PSY-101.md`](enrolled/PSY-101.md) | **active** |
| _[slot 2]_ | — | A | — | — | unfilled |

**Agents: bind to the course before responding.** Read `enrolled/<CODE>.md` for the five sections. If two courses are active, ask which one this session is for — never write to both, and never assume the more recent one.

---

## Transcript

| Course | Title | Lvl | Cr | Term | Weekly pass rate | Paper | Result |
|---|---|---|---|---|---|---|---|
| PSY-101 | Foundations of Psychological Evidence | 100 | 3 | A · 2026 | — | — | in progress |

**Credits earned:** 0 / 18 (Certificate) · **Courses complete:** 0 / 6

A course is `complete` when its term paper passes and its weekly pass rate is recorded. Pass rate is `weeks at 5/5 ÷ weeks attempted` — it is a diagnostic for the Advisor, not a grade to optimise. A rate near 100% by week 6 means the Editor has gone soft, and the Advisor should say so.

**No accreditation.** This transcript is a record for you. It is not a credential and nobody outside this repo recognises it. See [`DEGREE.md`](DEGREE.md) → The four honest gaps.

---

## Standing rules

**§0 ASSESSMENT is locked.** [`ASSESSMENT.md`](ASSESSMENT.md), written before week 1, read-only for all five agents and for the student. An AI grader drifts toward whatever standard is argued for in the moment; it will not argue with a document that already exists. Amendments are logged here, dated, and apply to the **next course** — never to the artifact currently being graded.

**Amendments:** none.

**Slipped weeks:** 0 across all courses. _(Three slips in one course triggers a scope cut in that course. The calendar does not move.)_

**Detail horizon:** Term A set. Terms B and C exist as course definitions with sequences; the Advisor does not schedule their weeks until the preceding term closes, informed by the gap and verdict logs.

**Access check owed:** Term B. Confirm employer policy permits the PSY-401 use of incident records in de-identified, non-exported form. A refusal in Term B costs a swap. The same refusal at week 45 costs the capstone.
