# DEGREE — structure, credit, and what this is not

## What was missing

The ALTER framework describes five **roles**. It does not describe an **institution**. That distinction is the whole of your question.

A university gives a student two separable things:

1. **Faculty** — an advisor, a librarian, a tutor, an editor, and a corridor full of people studying something else. That is exactly ALTER, and the framework as you wrote it is a good decomposition of it.
2. **An institution** — a course catalog, prerequisites, levels, credit accounting, concurrent enrolment, terms that start and end, assessment separated from teaching, and a transcript.

The first build gave you all of (1) and none of (2). Five excellent staff members and no registrar, no catalog, no levels, no second subject. Which is why it came out as a thesis: with only one course defined, the faculty had only one thing to do.

This file is the institution. ALTER stays exactly as written — it is now the engine that runs **each course**, rather than the whole school.

---

## Credit accounting

The standard: one US semester credit ≈ 45 hours of total student work. A 3-credit course ≈ 135 hours. A bachelor's degree = 120 credits ≈ **5,400 hours**.

Your capacity, from intake Q3: **9–12 hours/week at a bad week**. Call it 10 × 48 working weeks = **480 hours/year**. A full-time student does roughly 1,800. So at face value a degree takes you eleven years, and anyone who tells you otherwise is selling something.

But face value is wrong, because a large fraction of those 135 hours is institutional overhead you don't carry:

| University hour | Do you pay it? |
|---|---|
| Lectures that restate the assigned reading | No |
| Commuting, timetabling, room changes | No |
| Group projects with coordination costs | No |
| Courses taken because they're required, not wanted | No — the cut list handles this |
| Assessment padding: exams testing recall you'd never need | No |
| **Reading the primary sources** | **Yes** |
| **Writing to a standard** | **Yes** |
| **Being examined by someone who won't accept a bluff** | **Yes** |

The irreducible core of a social-science course is roughly 800–1,200 pages read, 5,000 words written, and defended. Done seriously, that is **~70 hours**, not 135.

**So: 70 hours per course, 6 courses per year.** Two concurrent, three terms. That is a quarter-time student who has cut all the padding — which is a real and defensible thing to be, and it is not the same as claiming a degree in a year.

---

## Calendar — 52 weeks

| | Weeks | Load |
|---|---|---|
| **Term A** | 1–14 | 2 courses concurrent, ~5 h/week each |
| break | 15 | nothing. Actually nothing |
| **Term B** | 16–29 | 2 courses |
| break | 30 | — |
| **Term C** | 31–44 | 2 courses |
| **Capstone / examination period** | 45–52 | 1 course, intensive, alone |

Two concurrent is the cap and it is not a suggestion. Three concurrent at 10 hours a week produces three shallow courses, and shallow is the one failure this whole structure exists to prevent.

---

## Levels

Levels are not difficulty labels. They are defined by **what the student is asked to do with a source**.

| Level | The student's relationship to the material | Assessment |
|---|---|---|
| **100** | Reads secondary and primary together. Learns the field's standards of evidence. | Weekly outputs · midterm oral · 2,000-word term paper |
| **200** | Reads primary sources as the default. Can state a finding's magnitude and its boundary. | + one primary-source-only block · 3,000-word paper |
| **300** | Reads the disputes, not the settlements. Applies findings to data the field hasn't seen. | + original analysis on own material · 4,000-word paper |
| **400** | Produces something that could be wrong in public. | Capstone, graded by reconstruction |

A course is 100-level because of what it demands, not because it comes first.

---

## Awards

No accreditation. Nobody outside this repo recognises any of it. Named anyway, because a program with no completion states is a program you drift out of in month nine.

| Award | Courses | Time at 6/yr | Requires |
|---|---|---|---|
| **Certificate** | 6 | 1 year | ≥1 at 300-level, ≥1 subject to 300 |
| **Major** | 12 | 2 years | a 400-level capstone in one subject |
| **Degree** | 24 | 4 years | two subjects to 300, one capstone, one cross-subject course |

**Transcript** lives in `REGISTRAR.md`. It records courses, rubric pass rates, and capstone reconstruction results. It is a record for you, not a credential for anyone else.

---

## The four honest gaps

The witness problem is handled in `catalog/PSY-major.md` §6. These four are not, and I'm not going to pretend otherwise.

1. **Credential.** A university's output is partly a signal other people accept. This produces artifacts instead. Artifacts are worth more than a transcript in some rooms and worth nothing in the rooms that filter on degrees. That trade is real and it is yours to make.
2. **Peers.** No cohort, nobody a year ahead, nobody to be quietly outperformed by. The Roommate simulates the corridor conversation, not the competition.
3. **Library and lab.** Paywalls are real. Some courses are simply not runnable without institutional access, and any course whose sources you can't obtain gets cut at the catalog stage rather than faked at week 6.
4. **Being taught by someone who did the research.** A tutor with total recall of the literature is not a tutor who has been wrong in public about it and remembers how that felt.
