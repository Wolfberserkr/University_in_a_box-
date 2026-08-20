# CATALOG

Courses are **reusable definitions**. Enrolling copies a course into `enrolled/<CODE>.md` where the five agents write its live state. A course in the catalog is inert; an enrolment is alive.

Structure and credit rules: [`DEGREE.md`](DEGREE.md). Assessment standard, all courses: [`ASSESSMENT.md`](ASSESSMENT.md).

---

## Psychology — PSY

Program statement: [`catalog/PSY-major.md`](catalog/PSY-major.md) · Source stack: [`catalog/PSY-sources.md`](catalog/PSY-sources.md)

| Code | Title | Lvl | Cr | Prerequisite | Unblocks |
|---|---|---|---|---|---|
| [PSY-101](catalog/PSY-101.md) | Foundations of Psychological Evidence | 100 | 3 | — | everything |
| [PSY-201](catalog/PSY-201.md) | The Evolved Mind | 200 | 3 | PSY-101 | 301, 302 |
| [PSY-202](catalog/PSY-202.md) | Judgment and Decision | 200 | 3 | PSY-101 | 401 |
| [PSY-301](catalog/PSY-301.md) | The Social Animal | 300 | 3 | PSY-201 or 202 | 401 |
| [PSY-302](catalog/PSY-302.md) | Personality and the Individual | 300 | 3 | PSY-201 | 401 |
| [PSY-401](catalog/PSY-401.md) | Capstone — The Decision Audit | 400 | 3 | 202 + 301 + 302 | — |

**PSY-101 is a genuine prerequisite, not a formality.** Reading the rest without it produces a well-read person who is confidently wrong, because the findings that made it into the popular literature are disproportionately the ones that didn't survive replication.

---

## Statistics — STA

| Code | Title | Lvl | Cr | Prerequisite | Unblocks |
|---|---|---|---|---|---|
| [STA-101](catalog/STA-101.md) | Reading Quantitative Claims | 100 | 3 | — | PSY-101 wk 3–4 · PSY-202 wk 11 · **PSY-401 §C3** |

A course in **consumption, not production** — you are not learning to run a study, you are learning to read one and say precisely what it does and doesn't support. Five of its six sources are `[V]` and four are free, making it the cheapest course in the catalog to start.

---

## Enrolment

| Term | Slot 1 | Slot 2 |
|---|---|---|
| **A** · wk 1–14 | PSY-101 | **STA-101** ✓ |
| **B** · wk 16–29 | PSY-201 | PSY-202 |
| **C** · wk 31–44 | PSY-301 | PSY-302 |
| **Capstone** · wk 45–52 | PSY-401 | — |

Seven courses across the year against a six-course Certificate — one course of slack against a bad term.

**Term A interlocks one way:** STA-101 wk 2 → PSY-101 wk 3, STA-101 wk 3 → PSY-101 wk 4, STA-101 wk 6 → PSY-101 wk 5. If something has to slip, slip PSY-101.

**Later slots**, when Terms B and C come up for scheduling — each would displace a psychology course, since two concurrent is the cap:

| Subject | Would open with | Why it pairs |
|---|---|---|
| **Economics** | ECO-101 — Scarcity, Incentives, Markets | Behavioral econ is half of PSY-202 already; this supplies the other half's foundations. |
| **Philosophy of Mind** | PHI-101 — Persons, Minds, and Explanation | Attacks what psychology assumes rather than what it finds. |
| **History** | HIS-101 — Evidence, Sources, and Argument | A wholly different discipline of evidence. Best pure Roommate effect. |
| **Accounting / Finance** | ACC-101 — The Double-Entry System | The dry-domain pick, and closest to the work you actually do. |

Or name something not on this list. The catalog is a directory, not a fixed set.

---

## Adding a subject

Use [`catalog/_TEMPLATE.md`](catalog/_TEMPLATE.md). A course enters the catalog only when all six fields are filled — most importantly:

- **Sources obtainable.** If the reading is behind a paywall you can't clear, the course is cut at the catalog stage, not faked at week 6.
- **Unblocks.** Name the later course or artifact this makes possible. A course that unblocks nothing is a hobby, and the Advisor will refuse it.
