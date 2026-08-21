/* University in a Box — curriculum data for Term A 2026.
 *
 * Transcribed from the repo. Do not invent rows here.
 *   REGISTRAR.md              calendar, student, standing rules
 *   START-HERE.md             the before-Monday steps and the weekly rhythm
 *   ASSESSMENT.md             Part A, locked
 *   enrolled/PSY-101.md       §A week board, §B source ledger
 *   enrolled/STA-101.md       §A week board, §B source ledger
 *   catalog/PSY-101.md        weeks 8-13 detail (the board defers to the course file)
 *   catalog/STA-101.md        weeks 8-13 detail
 *
 * Tags are load-bearing: R = recalled, V = verified, H = in hand.
 * PSY-101 weeks 3-4 and ledger row 13 follow the corrected board (repo commit 20e4321):
 * those weeks consume STA-101's sources and Cumming moved to the STA-101 ledger.
 */
window.UNIBOX = {

  meta: {
    student: "Ulrich",
    programStart: "2026-08-24",
    award: "Certificate (6 courses), then reassess",
    capacity: "9–12 h/week at a bad week → 2 concurrent courses, ~5 h each",
    term: {
      name: "Term A",
      year: "2026",
      start: "2026-08-24",
      end: "2026-11-29",
      weeks: 14,
      enrolled: ["PSY-101", "STA-101"]
    },
    afterTerm: [
      { label: "Break — week 15", detail: "2026-11-30 → 2026-12-06. Nothing. Actually nothing." },
      { label: "Term B opens", detail: "2026-12-07 → 2027-03-14 · PSY-201, PSY-202" }
    ],
    owedLater: [
      {
        title: "Access check — before Term B (7 Dec)",
        body: "Confirm your employer's policy permits the PSY-401 use of incident records in de-identified, non-exported form. A refusal in December costs a swap to the fallback destination. The same refusal at week 45 costs the entire capstone."
      },
      {
        title: "Start hunting Meehl (1954) — before Term B",
        body: "Clinical Versus Statistical Prediction. Highest-value single item in the major for your destination, and the hardest to obtain. Dawes, Faust & Meehl 1989 in Science is the accessible substitute if the monograph can't be found."
      }
    ]
  },

  /* Part 3 of START-HERE — every week after week 1.
     courseA is read Tuesday, courseB Wednesday; week 1 sets that order (Tue STA, Wed PSY). */
  rhythm: {
    courseA: "STA-101",
    courseB: "PSY-101",
    days: [
      { day: "Mon", label: "Week opens",   detail: "Advisor sets the milestone · Librarian pulls one primary + one supporting per course.", time: "30 min" },
      { day: "Tue", label: "Read course A", detail: "STA-101 — this week's primary source.", time: "~2 h" },
      { day: "Wed", label: "Read course B", detail: "PSY-101 — this week's primary source.", time: "~2 h" },
      { day: "Thu", label: "Tutor — oral, cold", detail: "45 min per course. Sources closed. Opens on cold retrieval: “without looking, what was the argument?” If you open the PDF, the session measures nothing and restarts later.", time: "1.5 h" },
      { day: "Fri", label: "Write both outputs", detail: "600 words each, unless the week board says otherwise.", time: "~2 h" },
      { day: "Sat", label: "Roommate — fortnightly only", detail: "One cross-domain collision, logged to §E. Even weeks only; the Roommate starts week 2.", time: "—" },
      { day: "Sun", label: "Editor grades · Advisor closes the week", detail: "Both outputs graded against ASSESSMENT.md Part A. 5/5 or rewrite.", time: "45 min" }
    ]
  },

  /* Part 2 of START-HERE — week 1 has its own day plan and it overrides the rhythm. */
  week1: [
    { day: "Mon", label: "Priors Sheet first, if it isn't written", detail: "If the Priors Sheet is not already written, write it now, before anything else. Then: Advisor opens the week, Librarian confirms the source rows.", time: "30 min" },
    { day: "Tue", label: "Read STA-101 wk 1 — Spiegelhalter ch. 1–2", detail: "What is being estimated, and of what?", time: "~2 h" },
    { day: "Wed", label: "Read PSY-101 wk 1 — OSC 2015", detail: "Sit with the number: 97% of originals reported significant results; 36% of replications did. Before Thursday, form a view on what that gap is made of. You'll be wrong about the proportions. Being wrong on the record is the point.", time: "~2 h" },
    { day: "Thu", label: "Tutor, both courses, 45 min each — sources closed", detail: "Standing probe, standing in for the declined intake Q2: of the 64% that didn't replicate, how much is false positives and how much is real effects reported too big? How would you tell them apart?", time: "1.5 h" },
    { day: "Fri", label: "Write both outputs", detail: "600 words each. PSY-101's output this week is the Priors Sheet.", time: "~2 h" },
    { day: "Sat", label: "Nothing", detail: "The Roommate starts week 2.", time: "—" },
    { day: "Sun", label: "Editor grades · Advisor closes · seal the Priors Sheet", detail: "Sunday is the seal date, not the write date. Seal it and never revise it.", time: "45 min" }
  ],

  /* START-HERE Part 1 — about 90 minutes total, spread across four days, in this order. */
  setup: [
    {
      n: 1,
      title: "Answer the two open intake questions",
      time: "10 min",
      where: "logs/PSY-101/week-01.md",
      body: "Fill in Q1 and Q4. Don't look anything up — a researched answer measures nothing.",
      points: [
        "Q1. What is the last non-fiction book you finished, and what do you still remember from it?",
        "Q4. Name a time you predicted someone's behavior correctly, and a time you didn't. Which do you remember better, and why?",
        "Q1 sets how much of the teaching load the writing has to carry versus the reading. Q4 is the capstone's problem in miniature."
      ]
    },
    {
      n: 2,
      title: "Write the Priors Sheet",
      time: "45 min",
      where: "logs/PSY-101/week-01.md → Part B",
      orderDependent: true,
      warning: "BEFORE YOU OPEN A SINGLE SOURCE. This is the one step with an order dependency you cannot undo. The moment you read OSC 2015, your priors are contaminated and this measurement is gone for good.",
      body: "600 words. Three findings about human behavior you currently believe, what you think the evidence is for each, and what would change your mind.",
      points: [
        "Pick findings you'd actually act on. Something you've used at work beats something you read in a magazine.",
        "“What would change my mind” must name an observation, not a feeling. “If I saw contradictory evidence” fails. “If a preregistered multi-lab replication with n > 2000 found d < 0.1” passes.",
        "Don't look anything up.",
        "The calendar shows it due Sunday 30 August. That is the seal date, not the write date. Write it before Monday; seal it Sunday and never revise it — not in month six when it's embarrassing.",
        "It will fail rubric criteria A2 and A4. That failure is the instrument reading, not a setback. No rewrite is owed."
      ]
    },
    {
      n: 3,
      title: "Get the sources",
      time: "30 min",
      body: "Four free and verified — get all four now. Two are recalled, not verified: check they exist before spending money.",
      points: [
        "Free, verified: OSC 2015, Science 349(6251) aac4716 — PubMed 26315443",
        "Free, verified: Cumming 2014, Psych Sci 25(1) 7–29 — doi:10.1177/0956797613504966",
        "Free, verified: Greenland et al. 2016, Eur J Epidemiol 31(4) 337–350 — PubMed 27209009",
        "Free, verified: Wasserstein & Lazar 2016, Am Stat 70(2) 129–133 — doi:10.1080/00031305.2016.1154108",
        "Both books VERIFIED 2026-08-21 and safe to buy: Ritchie, Science Fictions (2020), Metropolitan Books, ISBN 978-1-250-22269-5 · Spiegelhalter, The Art of Statistics (2019), Basic Books ISBN 978-1-5416-1851-0, or UK Pelican ISBN 978-0-241-39863-0 (subtitled Learning from Data — same book).",
        "Buy nothing else yet. Not Sapolsky, not Kahneman, not Meehl. A folder of sixty unread PDFs by month nine starts with a productive-feeling afternoon in week 1."
      ]
    },
    {
      n: 4,
      title: "Stand up the five agents",
      time: "15 min",
      body: "Recommended: run them in Claude Code, in this repo. They are already live in .claude/agents/ and read REGISTRAR.md and enrolled/<CODE>.md off disk, so the shared state stays in sync with zero effort.",
      points: [
        "Alternative: five claude.ai Projects, one per agent. Copy everything below the frontmatter of each .claude/agents/*.md into the Project's custom instructions, and add REGISTRAR.md plus the active enrolled/<CODE>.md to each Project's knowledge.",
        "Projects cost you a re-upload of the state files to five Projects every time they change — about five times a week. That friction is a plausible reason the program is dead by October. If you use Projects, re-upload as part of the Sunday close and nowhere else.",
        "Either way: the Librarian needs web search enabled. Without it, it cannot verify a single citation and every source it hands you is [R]. Turn it on and confirm it is on."
      ]
    },
    {
      n: 5,
      title: "Two NotebookLM notebooks",
      time: "10 min",
      body: "One for PSY-101, one for STA-101. Separate, not combined — NotebookLM grounds its answers in what you upload, so mixing the two stacks dilutes both.",
      points: [
        "Upload the four free PDFs: OSC 2015 goes in PSY, the other three in STA.",
        "Then retag those rows in enrolled/<CODE>.md §B from [V] to [H] — and in the ledger below.",
        "[H] is the strongest tag: the notebook, not the Librarian, is now the citation authority for that source."
      ]
    }
  ],

  courses: [
    {
      code: "PSY-101",
      title: "Foundations of Psychological Evidence",
      level: 100,
      credits: 3,
      load: "~5 h/week",
      question: "Given a psychological claim, how do you decide whether to believe it?",
      readDay: "Wed",
      weeks: [
        { n: 1,  start: "2026-08-24", end: "2026-08-30",
          milestone: "The replication crisis: scale and shape",
          sources: [{ text: "OSC 2015", tag: "H" }, { text: "Ritchie 1–2", tag: "H" }],
          output: "Priors Sheet, 600w",
          note: "Advisor → Editor: the Priors Sheet will fail A2 and A4 — it cites nothing and gives no magnitudes, because in week 1 you cannot yet do either. Grade it normally, record the REWRITE, log it as baseline measured, not a slipped week. No rewrite is owed." },
        { n: 2,  start: "2026-08-31", end: "2026-09-06",
          milestone: "Researcher degrees of freedom",
          sources: [{ text: "Simmons et al. 2011", tag: "V" }],
          output: "600w" },
        { n: 3,  start: "2026-09-07", end: "2026-09-13",
          milestone: "Apply effect size and interval to replication data. Compute three by hand",
          sources: [{ text: "STA-101 wk 2", tag: "V" }, { text: "OSC 2015 supplement", tag: null }],
          output: "600w + computations",
          note: "Consumes STA-101 wk 2. This week applies the machinery; it does not teach it — STA-101 does that, and nothing is taught twice." },
        { n: 4,  start: "2026-09-14", end: "2026-09-20",
          milestone: "Apply the misinterpretation catalogue to published psychology abstracts",
          sources: [{ text: "STA-101 wk 3", tag: "V" }],
          output: "600w",
          note: "Consumes STA-101 wk 3, Greenland's twenty-five misinterpretations, applied to psychology abstracts." },
        { n: 5,  start: "2026-09-21", end: "2026-09-27",
          milestone: "Publication bias, file drawer, p-curve",
          sources: [{ text: "Ritchie 3–4", tag: "H" }],
          output: "600w",
          note: "Consumes STA-101 wk 6, base rates and PPV." },
        { n: 6,  start: "2026-09-28", end: "2026-10-04",
          milestone: "Preregistration: what it fixes, what it doesn't",
          sources: [{ text: "Nosek et al. 2022", tag: "V" }],
          output: "600w" },
        { n: 7,  start: "2026-10-05", end: "2026-10-11",
          milestone: "MIDTERM — oral, cold",
          midterm: true,
          sources: [{ text: "—", tag: null }],
          output: "Tutor verdict",
          note: "No sources open. Probes magnitude reasoning on psychological claims specifically — STA-101's midterm covers the machinery the same week, so this one tests transfer rather than definitions." },
        { n: 8,  start: "2026-10-12", end: "2026-10-18",
          milestone: "WEIRD samples: most of psychology describes an unusual population",
          sources: [{ text: "Henrich et al. 2010", tag: "V" }],
          output: "600w", fromCatalog: true },
        { n: 9,  start: "2026-10-19", end: "2026-10-25",
          milestone: "Heterogeneity across sites — kills the “different sample” defense",
          sources: [{ text: "Klein et al. 2018", tag: "V" }],
          output: "600w", fromCatalog: true },
        { n: 10, start: "2026-10-26", end: "2026-11-01",
          milestone: "Autopsy I — priming, and experimenter expectancy",
          sources: [{ text: "Doyen et al. 2012", tag: "V" }],
          output: "600w", fromCatalog: true },
        { n: 11, start: "2026-11-02", end: "2026-11-08",
          milestone: "Autopsy II — Stanford Prison, from the archives",
          sources: [{ text: "Le Texier 2019", tag: "V" }],
          output: "600w", fromCatalog: true },
        { n: 12, start: "2026-11-09", end: "2026-11-15",
          milestone: "Autopsy III — ego depletion, 23 labs. Read the authors' reply for how a field argues",
          sources: [{ text: "Hagger et al. 2016", tag: "V" }],
          output: "600w", fromCatalog: true },
        { n: 13, start: "2026-11-16", end: "2026-11-22",
          milestone: "Autopsy IV — the marshmallow test: not false, half the size, about something else",
          sources: [{ text: "Watts et al. 2018", tag: "V" }],
          output: "600w", fromCatalog: true },
        { n: 14, start: "2026-11-23", end: "2026-11-29",
          milestone: "What survived + term paper",
          paper: true,
          sources: [{ text: "Simons & Chabris 1999", tag: "R" }],
          output: "2,000w — the Filter",
          note: "The checks you now run on any claim before it enters your ledger, each justified by a specific case from weeks 10–13. This paper becomes the Librarian's standing instruction for the rest of the major, so it is a working document, not an essay." }
      ],
      ledger: [
        { id: "1",  source: "Open Science Collaboration (2015), Science 349(6251) aac4716", wk: "1",   tag: "V", verified: "PubMed 26315443", status: "acquire — open" },
        { id: "12", source: "Ritchie, Science Fictions (2020) ch. 1–2", wk: "1",  tag: "H", verified: "Metropolitan Books, ISBN 978-1-250-22269-5", status: "in NotebookLM — PSY-101" },
        { id: "2",  source: "Simmons, Nelson & Simonsohn (2011), Psych Sci 22(11) 1359–1366", wk: "2", tag: "V", verified: "doi:10.1177/0956797611417632", status: "acquire — open" },
        { id: "3",  source: "Nosek et al. (2022), Annu Rev Psychol 73, 719–748", wk: "6", tag: "V", verified: "doi:10.1146/annurev-psych-020821-114157", status: "acquire" },
        { id: "5",  source: "Henrich, Heine & Norenzayan (2010), BBS 33(2–3) 61–83", wk: "8", tag: "V", verified: "PubMed 20550733", status: "acquire — open PDF" },
        { id: "4",  source: "Klein et al. (2018), AMPPS 1(4) 443–490", wk: "9", tag: "V", verified: "doi:10.1177/2515245918810225", status: "acquire — open" },
        { id: "6",  source: "Doyen et al. (2012), PLoS ONE 7(1) e29081", wk: "10", tag: "V", verified: "journals.plos.org", status: "acquire — open" },
        { id: "7",  source: "Le Texier (2019), Am Psychol 74(7) 823–839", wk: "11", tag: "V", verified: "PubMed 31380664", status: "acquire" },
        { id: "8",  source: "Hagger et al. (2016), PPS 11(4) 546–573", wk: "12", tag: "V", verified: "doi:10.1177/1745691616652873", status: "acquire" },
        { id: "9",  source: "Watts, Duncan & Quan (2018), Psych Sci 29(7) 1159–1177", wk: "13", tag: "V", verified: "doi:10.1177/0956797618761661", status: "acquire" },
        { id: "36", source: "Simons & Chabris (1999), Perception 28(9) 1059–1074", wk: "14", tag: "R", verified: "—", status: "verify" }
      ],
      ledgerNote: "Ten of eleven [V] as filed. Weeks 3–4 consume STA-101's sources rather than carrying their own — see the interlock note in REGISTRAR.md. Retag [H] as each lands in NotebookLM. Nothing gets read from an untagged row."
    },

    {
      code: "STA-101",
      title: "Reading Quantitative Claims",
      level: 100,
      credits: 3,
      load: "~5 h/week",
      question: "Given a number offered as evidence, what does it actually license you to believe?",
      readDay: "Tue",
      weeks: [
        { n: 1,  start: "2026-08-24", end: "2026-08-30",
          milestone: "What a number claims: population, sample, estimand",
          sources: [{ text: "Spiegelhalter 1–2", tag: "V" }],
          output: "600w" },
        { n: 2,  start: "2026-08-31", end: "2026-09-06",
          milestone: "Effect size and interval as the primary result → feeds PSY-101 wk 3",
          sources: [{ text: "Cumming 2014", tag: "V" }],
          output: "600w",
          note: "Front-loaded on purpose. If a week has to slip in Term A, slip a PSY-101 week — never STA-101 week 2 or 3. The dependency runs one way." },
        { n: 3,  start: "2026-09-07", end: "2026-09-13",
          milestone: "The misinterpretation catalogue → feeds PSY-101 wk 4",
          sources: [{ text: "Greenland et al. 2016", tag: "V" }],
          output: "600w",
          note: "Twenty-five numbered misinterpretations, each stated and corrected. Highest value-per-page item in the term; a reference for the rest of the major, not a paper you read once." },
        { n: 4,  start: "2026-09-14", end: "2026-09-20",
          milestone: "p-values: the six things they are not",
          sources: [{ text: "Wasserstein & Lazar 2016", tag: "V" }],
          output: "600w" },
        { n: 5,  start: "2026-09-21", end: "2026-09-27",
          milestone: "Power; why underpowered significant results exaggerate",
          sources: [{ text: "Cumming 2014, cont.", tag: "V" }],
          output: "600w" },
        { n: 6,  start: "2026-09-28", end: "2026-10-04",
          milestone: "Base rates and positive predictive value",
          sources: [{ text: "Ioannidis 2005", tag: "V" }],
          output: "600w" },
        { n: 7,  start: "2026-10-05", end: "2026-10-11",
          milestone: "MIDTERM — oral, cold",
          midterm: true,
          sources: [{ text: "—", tag: null }],
          output: "Tutor verdict",
          note: "State what a 95% interval means, then four things it does not mean, from Greenland's catalogue, cold. “95% probability the true value is in there” is misinterpretation #19 and does not pass." },
        { n: 8,  start: "2026-10-12", end: "2026-10-18",
          milestone: "Multiplicity and the garden of forking paths — no p-hacking required",
          sources: [{ text: "Gelman & Loken 2014", tag: "R" }],
          output: "600w", fromCatalog: true },
        { n: 9,  start: "2026-10-19", end: "2026-10-25",
          milestone: "Confounding, and what “adjusted for” actually buys you",
          sources: [{ text: "Spiegelhalter", tag: "V" }],
          output: "600w", fromCatalog: true },
        { n: 10, start: "2026-10-26", end: "2026-11-01",
          milestone: "Randomization and the basics of causal inference",
          sources: [{ text: "Spiegelhalter", tag: "V" }],
          output: "600w", fromCatalog: true },
        { n: 11, start: "2026-11-02", end: "2026-11-08",
          milestone: "Measurement: reliability, validity, and what a scale is really doing",
          sources: [{ text: "selected", tag: "R" }],
          output: "600w", fromCatalog: true },
        { n: 12, start: "2026-11-09", end: "2026-11-15",
          milestone: "Graphs that mislead; summaries that hide the distribution",
          sources: [{ text: "Spiegelhalter", tag: "V" }],
          output: "600w", fromCatalog: true },
        { n: 13, start: "2026-11-16", end: "2026-11-22",
          milestone: "Meta-analysis: reading a forest plot, and heterogeneity",
          sources: [{ text: "selected", tag: "R" }],
          output: "600w", fromCatalog: true },
        { n: 14, start: "2026-11-23", end: "2026-11-29",
          milestone: "Term paper — audit one published claim end to end",
          paper: true,
          sources: [{ text: "—", tag: null }],
          output: "2,000w",
          note: "What was estimated, how precisely, what would have falsified it, what it does not support, and what you would need to see to change your mind. PSY-401's method rehearsed on someone else's work, eight months early." }
      ],
      ledger: [
        { id: "S1", source: "Spiegelhalter, The Art of Statistics (2019) ch. 1–2", wk: "1", tag: "V", verified: "Basic Books ISBN 978-1-5416-1851-0 · Pelican 978-0-241-39863-0", status: "exists — safe to buy — only purchase required" },
        { id: "S2", source: "Cumming (2014), Psych Sci 25(1) 7–29", wk: "2", tag: "V", verified: "doi:10.1177/0956797613504966", status: "acquire — open PDF at UBC" },
        { id: "S3", source: "Greenland et al. (2016), Eur J Epidemiol 31(4) 337–350", wk: "3", tag: "V", verified: "PubMed 27209009", status: "acquire — open access" },
        { id: "S4", source: "Wasserstein & Lazar (2016), Am Stat 70(2) 129–133", wk: "4", tag: "V", verified: "doi:10.1080/00031305.2016.1154108", status: "acquire — open access" },
        { id: "S5", source: "Ioannidis (2005), PLoS Med 2(8) e124", wk: "6", tag: "V", verified: "journals.plos.org", status: "acquire — open access" },
        { id: "S6", source: "Gelman & Loken (2014), American Scientist", wk: "8", tag: "R", verified: "—", status: "verify" }
      ],
      ledgerNote: "Five of six named sources are [V] as filed and four are free. The cheapest course in the catalog to start."
    }
  ],

  tagLegend: [
    { tag: "R", name: "recalled", body: "Recalled and unverified. Nothing gets read from an untagged row, and an [R] source leaned on in writing must say so — that is rubric A2." },
    { tag: "V", name: "verified", body: "Verified against a retrieved record — a PubMed ID, a DOI, a publisher page." },
    { tag: "H", name: "in hand", body: "In hand and uploaded to NotebookLM. The strongest tag: the notebook, not the Librarian, is now the citation authority for that source." },
    { tag: "?", name: "no tag on the board", body: "Not a repo tag — this page marks a source the week board names without one. The Librarian owes that row a tag, and nothing gets read from an untagged row." }
  ],

  rubric: {
    title: "ASSESSMENT.md — Part A, weekly output",
    lock: "Locked. Written in week 0, before any material was read. Read-only for all five agents and for the student. If you find yourself wanting to edit it during a grading round, that impulse is the exact thing the lock exists to defeat — log the amendment instead; it applies to the next term.",
    verdict: "Each criterion is pass/fail. 5/5 or the week is a rewrite. There is no partial credit and no “strong 4.”",
    criteria: [
      { id: "A1", name: "Claim is falsifiable", fails: "The central assertion is compatible with every possible observation." },
      { id: "A2", name: "Evidence is cited and tagged", fails: "Any empirical claim lacks a source, or leans on an [R] source without saying so." },
      { id: "A3", name: "The strongest counterargument appears", fails: "The counterargument presented is a weak version chosen because it's easy to answer." },
      { id: "A4", name: "Effect size, not just significance", fails: "A finding is invoked as “shown” or “proven” with no magnitude and no interval." },
      { id: "A5", name: "No fluff opening or closing", fails: "The first sentence could be deleted without loss. Same for the last." }
    ],
    editorConstraint: "Editor's standing constraint: no praise in the first paragraph, ever. Praise, if earned, appears at the end and in one sentence.",
    exceptions: [
      "Week 1, PSY-101: the Priors Sheet is expected to fail A2 and A4. Record the REWRITE; the Advisor logs it as baseline measured, not a slipped week. No rewrite is owed.",
      "STA-101: A4 is normally the criterion a student fails early. Here it is the subject. Graded strictly from week 2 onward."
    ]
  },

  slipRule: {
    limit: 3,
    short: "A week with no output is a slipped week. Three slips in one course triggers a scope cut in that course.",
    long: "Three slips triggers a scope cut, and the Advisor executes it without renegotiating. The calendar never moves.",
    interlock: "If a week has to slip in Term A, slip PSY-101 — never STA-101 weeks 2 or 3. The dependency runs one way."
  },

  enders: [
    { title: "Buying the whole reading list in week 1", body: "You get a folder instead of a habit. Buy what the current three weeks need, nothing further." },
    { title: "Reading without writing", body: "The output is not a record of the learning, it is the learning. A week with no output is a slipped week — log it. Three slips triggers a scope cut, and the calendar never moves." },
    { title: "Letting the Editor go soft", body: "If your pass rate is near 100% by week 6, the Editor has drifted toward the standard you argued for in the moment. That is why ASSESSMENT.md is locked and dated before week 1." },
    { title: "Answering “yeah, that makes sense” to the Tutor", body: "It ends the conversation socially and teaches nothing. Expect the counter-move every time: “Then say it back in a form I didn't give you, using a case from your own week.”" }
  ]
};
