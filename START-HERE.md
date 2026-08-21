# START HERE

Everything that has to happen, in order. Term A opens **Monday 24 August 2026**.

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

# Part 2 — Week 1: Mon 24 → Sun 30 August

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

**Week 7** (5–11 Oct) is midterms, both courses, oral and cold.
**Week 14** (29 Nov) is term papers, 2,000 words each. Then Term A is on the transcript.

---

# Part 4 — The four things that actually end this

Not lack of motivation. These:

**1. Buying the whole reading list in week 1.** You get a folder instead of a habit. Buy what the current three weeks need, nothing further.

**2. Reading without writing.** The output is not a record of the learning, it *is* the learning. A week with no output is a slipped week — log it. Three slips triggers a scope cut, and the Advisor executes it without renegotiating. **The calendar never moves.**

**3. Letting the Editor go soft.** If your pass rate is near 100% by week 6, the Editor has drifted toward the standard you argued for in the moment, which is the specific thing it's bad at. That's why `ASSESSMENT.md` is locked and dated before week 1. If you catch yourself wanting to edit it mid-grading, that impulse is exactly what the lock is defending against.

**4. Answering "yeah, that makes sense" to the Tutor.** It ends the conversation socially and teaches nothing. The counter-move is built into the agent and you should expect it every time: *"Then say it back in a form I didn't give you, using a case from your own week."*

---

# Owed later, easy to forget

**Before Term B (7 Dec)** — the **access check**. Confirm your employer's policy permits the PSY-401 use of incident records in de-identified, non-exported form. A refusal in December costs you a swap to the fallback destination. The same refusal at week 45 costs the entire capstone.

**Also before Term B** — start hunting **Meehl, *Clinical Versus Statistical Prediction* (1954)**. Highest-value single item in the major for your destination, and the hardest to obtain. Dawes, Faust & Meehl 1989 in *Science* is the accessible substitute if the monograph can't be found.
