/* University in a Box — Term A reader.
   Vanilla JS, no dependencies, no network. State lives in localStorage and every
   access is wrapped in try/catch: if storage is unavailable, full, or holds a value
   that cannot be read, the page still renders and says which of those happened. */
(function () {
  "use strict";

  var D = window.UNIBOX;
  if (!D) { return; }

  var KEY = "uib.termA.v1";
  var SALVAGE_KEY = "uib.termA.v1.unreadable";
  var MS_DAY = 86400000;
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var MON_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var DAYS_LONG = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  /* ---------------------------------------------------------------- dates */

  function parseYMD(s) {
    var p = String(s).split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  /* Whole-day index, immune to DST and timezone drift. */
  function dayIndex(d) {
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / MS_DAY);
  }
  function startOfToday() {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  function fmtLong(d) {
    return DAYS_LONG[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }
  function fmtNoDay(d) { return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); }
  function fmtShort(d) { return d.getDate() + " " + MON_SHORT[d.getMonth()]; }
  function fmtRange(a, b) { return fmtShort(parseYMD(a)) + " – " + fmtShort(parseYMD(b)); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  var TERM_START = parseYMD(D.meta.term.start);
  var TERM_END = parseYMD(D.meta.term.end);
  var TERM_START_I = dayIndex(TERM_START);
  var TERM_END_I = dayIndex(TERM_END);

  var previewDate = null; /* Date or null — never persisted */

  function refDate() { return previewDate || startOfToday(); }
  function weekNumberFor(d) { return Math.floor((dayIndex(d) - TERM_START_I) / 7) + 1; }
  function reduceMotion() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (e) { return false; }
  }

  /* -------------------------------------------------------------- storage
     Three failure modes, three messages:
       "unavailable" — localStorage cannot be used at all
       "unreadable"  — a value is stored but could not be parsed; it is copied to
                       SALVAGE_KEY and never overwritten in place
       "full"        — a write was refused (quota or a mid-session block)          */

  var storage = { writable: false, problem: null, salvaged: false, raw: null };

  function probeStorage() {
    try {
      var t = "__uib_probe__";
      window.localStorage.setItem(t, "1");
      window.localStorage.removeItem(t);
      return true;
    } catch (e) { return false; }
  }

  function defaults() {
    var s = { v: 1, setup: {}, closed: {}, tags: {}, verified: {}, updated: null };
    D.courses.forEach(function (c) {
      c.ledger.forEach(function (row) { s.tags[c.code + "|" + row.id] = row.tag; });
    });
    return s;
  }

  function sanitize(raw) {
    var base = defaults();
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) { return null; }
    var out = { v: 1, setup: {}, closed: {}, tags: base.tags, verified: {}, updated: null };
    if (raw.setup && typeof raw.setup === "object") {
      D.setup.forEach(function (step) {
        if (raw.setup[step.n] === true) { out.setup[step.n] = true; }
      });
    }
    if (raw.closed && typeof raw.closed === "object") {
      D.courses.forEach(function (c) {
        c.weeks.forEach(function (w) {
          var k = c.code + "|" + w.n;
          if (raw.closed[k] === true) { out.closed[k] = true; }
        });
      });
    }
    D.courses.forEach(function (c) {
      c.ledger.forEach(function (row) {
        var k = c.code + "|" + row.id;
        if (raw.tags && typeof raw.tags === "object") {
          var t = raw.tags[k];
          if (t === "R" || t === "V" || t === "H") { out.tags[k] = t; }
        }
        if (raw.verified && typeof raw.verified === "object") {
          var v = raw.verified[k];
          if (typeof v === "string" && v.trim()) { out.verified[k] = v.trim().slice(0, 200); }
        }
      });
    });
    if (typeof raw.updated === "string") { out.updated = raw.updated; }
    return out;
  }

  function load() {
    if (!storage.writable) { storage.problem = "unavailable"; return defaults(); }
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); }
    catch (e) { storage.problem = "unavailable"; storage.writable = false; return defaults(); }
    if (!raw) { return defaults(); }

    var parsed = null, clean = null;
    try { parsed = JSON.parse(raw); clean = sanitize(parsed); }
    catch (e) { clean = null; }

    if (clean) { return clean; }

    /* Unreadable. Keep the original for salvage; do not write over it. */
    storage.problem = "unreadable";
    storage.raw = raw;
    try {
      window.localStorage.setItem(SALVAGE_KEY, raw);
      storage.salvaged = true;
    } catch (e) { storage.salvaged = false; }
    return defaults();
  }

  function save() {
    if (!storage.writable) { renderStorageBanner(); return; }
    state.updated = new Date().toISOString();
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      if (storage.problem === "full") { storage.problem = null; renderStorageBanner(); }
    } catch (e) {
      storage.problem = "full";
      renderStorageBanner();
    }
  }

  function renderStorageBanner() {
    var b = $("storage-warning");
    if (!b) { return; }
    clear(b);
    if (!storage.problem) { b.hidden = true; return; }
    b.hidden = false;

    if (storage.problem === "unavailable") {
      b.appendChild(el("strong", null, "This browser will not save your progress."));
      b.appendChild(el("span", null, "Local storage is switched off or blocked here — a private window and blocked site data both do this. Everything on the page still works, but every tick disappears when you close the tab. Use Export before you leave, and keep the file."));
      return;
    }
    if (storage.problem === "full") {
      b.appendChild(el("strong", null, "That change was not saved — the browser refused to write."));
      b.appendChild(el("span", null, "Storage is full or was blocked mid-session. Nothing you have ticked since is stored. Export now, then clear space and import the file back."));
      return;
    }
    /* unreadable */
    b.appendChild(el("strong", null, "Your saved progress could not be read."));
    b.appendChild(el("span", null, storage.salvaged
      ? "Saving works fine — the value stored here was not valid, so the page has loaded an empty term instead. The original was left untouched and copied to the key “" + SALVAGE_KEY + "”. Recover what you can before you tick anything: from here on, new ticks save over the empty term, not over that copy."
      : "Saving works fine — the value stored here was not valid, so the page has loaded an empty term instead. The copy for salvage could not be written, so recover the original now, before you tick anything."));
    if (storage.raw) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-quiet";
      btn.textContent = "Show the unreadable data";
      btn.addEventListener("click", function () {
        openIO(storage.raw, "The unreadable value, exactly as stored — copy it somewhere safe");
        status("This is the raw value that could not be read. Loading it back will fail; keep it if it holds anything you need.");
      });
      b.appendChild(btn);
    }
  }

  var state = defaults();

  /* ------------------------------------------------------------- dom help */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text !== undefined && text !== null) { n.textContent = text; }
    return n;
  }
  var liveTimer = null;
  function announce(msg) {
    var n = $("live-note");
    if (!n) { return; }
    if (liveTimer) { clearTimeout(liveTimer); }
    n.textContent = "";
    liveTimer = setTimeout(function () { n.textContent = msg; }, 60);
  }

  function clear(node) { while (node && node.firstChild) { node.removeChild(node.firstChild); } }
  function $(id) { return document.getElementById(id); }

  function tagLabel(t) { return "[" + t + "]"; }
  function tagClass(t) {
    var key = (t === "?" ) ? "none" : String(t).toLowerCase();
    return "tag tag-" + key;
  }
  function tagChip(t) {
    var n = el("span", tagClass(t), tagLabel(t));
    if (t === "?") { n.title = "No tag on the board — nothing gets read from an untagged row."; }
    return n;
  }

  /* Renders "OSC 2015 [V] + Ritchie 1–2 [R]" with real tag chips.
     A source the board names without a tag is marked [?] rather than shown bare. */
  function sourceLine(sources) {
    var frag = document.createDocumentFragment();
    (sources || []).forEach(function (s, i) {
      if (i) { frag.appendChild(document.createTextNode(" + ")); }
      frag.appendChild(document.createTextNode(s.text));
      if (s.text === "—") { return; }
      frag.appendChild(document.createTextNode(" "));
      frag.appendChild(tagChip(s.tag || "?"));
    });
    return frag;
  }

  function courseByCode(code) {
    for (var i = 0; i < D.courses.length; i++) {
      if (D.courses[i].code === code) { return D.courses[i]; }
    }
    return null;
  }
  function weekOf(course, n) {
    for (var i = 0; i < course.weeks.length; i++) {
      if (course.weeks[i].n === n) { return course.weeks[i]; }
    }
    return null;
  }

  /* ------------------------------------------------------------ slip math */

  function isClosed(code, n) { return state.closed[code + "|" + n] === true; }

  function slipsFor(course, ref) {
    var today = dayIndex(ref);
    var n = 0;
    course.weeks.forEach(function (w) {
      if (dayIndex(parseYMD(w.end)) < today && !isClosed(course.code, w.n)) { n++; }
    });
    return n;
  }
  function closedCount(course) {
    var n = 0;
    course.weeks.forEach(function (w) { if (isClosed(course.code, w.n)) { n++; } });
    return n;
  }
  function closedHere(weekNo) {
    var n = 0;
    D.courses.forEach(function (c) { if (isClosed(c.code, weekNo)) { n++; } });
    return n;
  }
  function tagOf(code, id, filed) { return state.tags[code + "|" + id] || filed; }
  function hCount() {
    var n = 0, total = 0;
    D.courses.forEach(function (c) {
      c.ledger.forEach(function (row) {
        total++;
        if (tagOf(c.code, row.id, row.tag) === "H") { n++; }
      });
    });
    return { h: n, total: total };
  }
  function setupDone() {
    var n = 0;
    D.setup.forEach(function (s) { if (state.setup[s.n]) { n++; } });
    return n;
  }
  function priorsWritten() { return state.setup[2] === true; }

  /* =================================================== A · the NOW panel */

  function taskItem(title, body, src, kind) {
    var li = el("li", kind ? "task-" + kind : null);
    li.appendChild(el("span", "now-task-title", title));
    if (body) { li.appendChild(el("span", "now-task-body", body)); }
    if (src) {
      var s = el("span", "now-task-src");
      s.appendChild(document.createTextNode(src.label));
      s.appendChild(document.createTextNode(" "));
      s.appendChild(sourceLine(src.sources));
      li.appendChild(s);
    }
    return li;
  }

  function nowChips(weekNo, ref, time) {
    var strip = el("div", "now-strip");
    if (time && time !== "—") { strip.appendChild(el("span", "chip chip-time", "Today · " + time)); }
    if (weekNo >= 1 && weekNo <= D.meta.term.weeks) {
      strip.appendChild(el("span", "chip chip-accent", "Week " + weekNo + " of " + D.meta.term.weeks));
      var w = weekOf(D.courses[0], weekNo);
      if (w) { strip.appendChild(el("span", "chip", "Closes Sun " + fmtShort(parseYMD(w.end)))); }
      if (w && w.midterm) { strip.appendChild(el("span", "chip chip-accent", "Midterm week")); }
      if (w && w.paper) { strip.appendChild(el("span", "chip chip-accent", "Term paper week")); }
    }
    /* Slips are counted per course, because the rule is per course. */
    var any = false;
    D.courses.forEach(function (c) {
      var n = slipsFor(c, ref);
      if (n > 0) {
        any = true;
        strip.appendChild(el("span", n >= D.slipRule.limit ? "chip chip-accent" : "chip",
          n >= D.slipRule.limit
            ? c.code + " · scope cut triggered · " + plural(n, "slipped week", "slipped weeks")
            : c.code + " · " + n + " of " + D.slipRule.limit + " slipped"));
      }
    });
    if (!any) { strip.appendChild(el("span", "chip", "No slipped weeks")); }
    var hc = hCount();
    strip.appendChild(el("span", "chip", hc.h + " of " + hc.total + " sources in hand [H]"));
    return strip;
  }

  /* Returns {head, sub, items, time} for a day inside the term.
     Every branch that sets head also sets sub — they are one sentence in two sizes. */
  function planForDay(weekNo, dow) {
    var isW1 = weekNo === 1;
    var days = isW1 ? D.week1 : D.rhythm.days;
    var idx = (dow + 6) % 7;              /* Mon = 0 … Sun = 6 */
    var entry = days[idx] || days[0];
    var A = courseByCode(D.rhythm.courseA);
    var B = courseByCode(D.rhythm.courseB);
    var wA = weekOf(A, weekNo), wB = weekOf(B, weekNo);
    var items = [];
    var head, sub, time = entry.time;

    function hasSource(w) {
      return !!w && (w.sources || []).some(function (s) { return s.text && s.text !== "—"; });
    }
    function readItem(course, w) {
      if (!hasSource(w)) {
        return taskItem(course.code + " · " + course.title, w.milestone + " — no new source this week.");
      }
      return taskItem(course.code + " · " + course.title, w.milestone,
        { label: "Primary:", sources: w.sources });
    }
    function outputItem(course, w) {
      if (hasSource(w)) {
        return taskItem(course.code + " — " + w.output, w.milestone, { label: "From:", sources: w.sources });
      }
      return taskItem(course.code + " — " + w.output, w.milestone);
    }
    function priorsBlock() {
      return taskItem("Write the Priors Sheet — 45 minutes, before any source",
        "600 words: three findings about human behavior you currently believe, what you think the evidence is for each, and what would change your mind. Name an observation, not a feeling. Don't look anything up. Then tick step 2 below and today's reading opens.",
        null, "block");
    }

    /* The one irreversible step outranks the calendar for the whole of week 1. */
    var priorsBlocks = isW1 && !priorsWritten();

    if (priorsBlocks && (idx === 0 || idx === 1 || idx === 2)) {
      head = "Write the Priors Sheet first";
      sub = "Step 2 of the setup is not ticked, so the week's reading is held. The moment you open OSC 2015 or Spiegelhalter your priors are contaminated and this measurement is gone for good — it is the one step in the year with an order dependency you cannot undo.";
      time = "45 min";
      items.push(priorsBlock());
      items.push(taskItem("Today's reading is held",
        (idx === 0 ? "Week 1 opens once it is written" : (idx === 1 ? A.code + "'s week 1 reading opens once it is written" : B.code + "'s week 1 reading opens once it is written"))
        + ". Forty-five minutes now buys back the whole measurement; the reading is still a " + entry.time + " job afterwards and the week has room for both."));
      if (idx === 0) {
        items.push(taskItem("Then, and only then", "Advisor opens the week; Librarian confirms the source rows."));
      }
      return { head: head, sub: sub, items: items, time: time };
    }

    if (idx === 0) {                       /* Monday */
      head = "Set week " + weekNo + "'s milestone";
      sub = isW1 ? entry.detail
        : "Advisor reads last week's gaps and verdicts and sets the milestone; Librarian pulls one primary and one supporting per course and tags them. Nothing else is owed today.";
      items.push(taskItem("Advisor", "Sets this week's milestone from last week's gaps and verdicts."));
      items.push(taskItem("Librarian", "Confirms one primary + one supporting per course, tagged."));
      if (wA) { items.push(readItem(A, wA)); }
      if (wB) { items.push(readItem(B, wB)); }

    } else if (idx === 1 || idx === 2) {   /* Tuesday · Wednesday — the reading days */
      var course = (idx === 1) ? A : B;
      var wk = (idx === 1) ? wA : wB;
      if (hasSource(wk)) {
        head = "Read " + course.code;
        sub = isW1 ? entry.detail
          : "One primary, one supporting, and stop. Three good sources for one week is how a folder of unread PDFs starts.";
        items.push(readItem(course, wk));
        if (wk.note) { items.push(taskItem("Note", wk.note)); }
        items.push(taskItem("Output due Friday", wk.output));
      } else if (wk && wk.midterm) {
        head = "Midterm week — no new reading";
        sub = "Thursday is oral and cold, both courses. What helps is recall practice — saying the argument out loud without the paper — not re-reading it.";
        time = "—";
        items.push(taskItem(course.code, "Midterm on Thursday. No source this week, and no written output is owed."));
      } else {
        head = "Term paper week — writing, not reading";
        sub = "2,000 words per course, due Sunday. When they pass, Term A goes on the transcript.";
        items.push(taskItem(course.code + " — " + (wk ? wk.output : ""), wk ? wk.milestone : ""));
        if (wk && wk.note) { items.push(taskItem("Note", wk.note)); }
      }

    } else if (idx === 3) {                /* Thursday */
      var mid = !!(wA && wA.midterm);
      head = mid ? "Midterm — oral, cold" : "Tutor — both courses, cold";
      sub = mid
        ? "Both courses examined orally, 45 minutes each, sources closed. This week's artifact is the Tutor's verdict; no 600 words are owed."
        : "45 minutes per course, sources closed. Opens on cold retrieval: “without looking, what was the argument?”";
      items.push(taskItem("Sources closed", "No PDF, no notes, no NotebookLM. The Tutor writes what you could not reconstruct to §C as a gap, and a gap closes only when you re-explain it cold in a later week."));
      if (wA) { items.push(taskItem(A.code, wA.milestone + (mid && wA.note ? " — " + wA.note : ""))); }
      if (wB) { items.push(taskItem(B.code, wB.milestone + (mid && wB.note ? " — " + wB.note : ""))); }
      items.push(taskItem("Do not say “yeah, that makes sense”", "It ends the conversation socially and teaches nothing. Expect: “then say it back in a form I didn't give you, using a case from your own week.”"));

    } else if (idx === 4) {                /* Friday */
      if (wA && wA.midterm) {
        head = "Midterm week — nothing to write";
        sub = "This week's artifact is yesterday's Tutor verdict, not 600 words. Gaps go to §C, verdicts to §D, and the week still has to be closed on Sunday.";
        time = "—";
        items.push(taskItem("No written output is owed", "Both courses were examined orally and cold yesterday."));
      } else {
        head = "Write both outputs";
        sub = (wA ? A.code + " " + wA.output : "") + " · " + (wB ? B.code + " " + wB.output : "") +
          ". Graded Sunday against Part A — 5/5 or rewrite.";
        if (wB) { items.push(outputItem(B, wB)); }
        if (wA) { items.push(outputItem(A, wA)); }
        items.push(taskItem("Rubric", "Five pass/fail criteria, no partial credit. The rubric is further down this page."));
      }

    } else if (idx === 5) {                /* Saturday */
      var fortnight = (weekNo % 2 === 0);
      head = fortnight ? "Roommate — one collision" : "Nothing scheduled";
      if (fortnight) {
        sub = "One cross-domain collision, logged to §E. Spent domains cannot be reused.";
        items.push(taskItem("Cross-domain collision", "Two courses are active — the best available collision is often between them: a claim from PSY-101 read with STA-101's catalogue in hand is a live cross-course problem you didn't have to invent."));
      } else {
        sub = "The Roommate runs fortnightly, on even weeks. This is week " + weekNo + ", so nothing is owed today.";
        time = "—";
        items.push(taskItem("Rest", "Nothing is owed. The next Roommate session is week " + (weekNo + 1) + "."));
      }

    } else {                               /* Sunday */
      head = "Grade, then close week " + weekNo;
      if (wA && wA.midterm) {
        sub = "The Tutor's verdicts are this week's record — no weekly output was owed. Then the Advisor closes the week.";
      } else if (wA && wA.paper) {
        sub = "Both term papers graded, both weeks closed, and the pass rates recorded in REGISTRAR.md. Then Term A is on the transcript.";
      } else {
        sub = "Editor grades both outputs against ASSESSMENT.md Part A — 5/5 or the week is a rewrite. Then the Advisor closes the week.";
      }
      items.push(taskItem("Editor", (wA && wA.midterm)
        ? "Records the Tutor's midterm verdicts. No weekly output is owed this week."
        : "Grades both outputs against ASSESSMENT.md Part A. No praise in the first paragraph, ever."));
      items.push(taskItem("Advisor", "Closes the week. Tick both boxes on the board below once it is graded."));
      if (isW1) { items.push(taskItem("Seal the Priors Sheet", "Today is the seal date, not the write date. Seal it and never revise it — not in month six when it's embarrassing.")); }
      D.courses.forEach(function (c) {
        if (!isClosed(c.code, weekNo)) {
          items.push(taskItem(c.code + " — still open", "Week " + weekNo + " is not closed yet."));
        }
      });
    }

    /* Week 1 after the reading days: the Priors Sheet is late, and says so. */
    if (priorsBlocks && idx > 2) {
      items.unshift(taskItem("The Priors Sheet is still unwritten",
        "It had to be written before any source was opened, and week 1 closes Sunday. Write it now, seal it Sunday, and tick step 2 — an amended priors sheet is worth exactly nothing.",
        null, "block"));
    }
    return { head: head, sub: sub, items: items, time: time };
  }

  var rhythmOpen = false;   /* survives re-renders */

  function rhythmBlock(weekNo, dow) {
    var wrap = el("details", "rhythm");
    wrap.open = rhythmOpen;
    wrap.addEventListener("toggle", function () { rhythmOpen = wrap.open; });
    var days = (weekNo === 1) ? D.week1 : D.rhythm.days;
    wrap.appendChild(el("summary", null, weekNo === 1 ? "Week 1, day by day" : "The week, day by day"));
    var ul = el("ul", "rhythm-list");
    var todayIdx = (dow + 6) % 7;
    days.forEach(function (d, i) {
      var li = el("li", i === todayIdx ? "is-today" : null);
      li.appendChild(el("span", "day-tag", d.day));
      var body = el("div");
      body.appendChild(el("span", "rhythm-what", d.label));
      if (d.time && d.time !== "—") {
        body.appendChild(document.createTextNode(" "));
        body.appendChild(el("span", "fine", "· " + d.time));
      }
      body.appendChild(el("span", "rhythm-detail", d.detail));
      li.appendChild(body);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    return wrap;
  }

  function phaseFor(refI) {
    if (refI < TERM_START_I) { return "pre"; }
    if (refI > TERM_END_I) { return "post"; }
    return "term";
  }

  function renderNow() {
    var host = $("now-body");
    if (!host) { return; }
    clear(host);

    var ref = refDate();
    var refI = dayIndex(ref);
    var phase = phaseFor(refI);

    host.appendChild(el("p", "now-date", (previewDate ? "Previewing · " : "") + fmtLong(ref)));

    if (phase === "pre") {
      var days = TERM_START_I - refI;
      var written = priorsWritten();
      host.appendChild(el("h2", "now-head",
        written ? (days === 1 ? "Term A opens tomorrow" : "Term A opens in " + plural(days, "day", "days"))
                : "Write the Priors Sheet"));
      host.appendChild(el("p", "now-sub", written
        ? "Monday " + fmtNoDay(TERM_START) + ". The setup steps are what's owed until then."
        : "Before Monday " + fmtNoDay(TERM_START) + ", and before you open a single source — it is the one step in the year with an order dependency you cannot undo. 45 minutes, 600 words."));

      var strip = el("div", "now-strip");
      strip.appendChild(el("span", "chip chip-accent", plural(days, "day", "days") + " to Term A"));
      strip.appendChild(el("span", "chip", setupDone() + " of " + D.setup.length + " setup steps done"));
      strip.appendChild(el("span", written ? "chip" : "chip chip-accent",
        written ? "Priors Sheet written" : "Priors Sheet not written"));
      host.appendChild(strip);

      var ul = el("ul", "now-tasks");
      var open = D.setup.filter(function (s) { return !state.setup[s.n]; });
      if (open.length === 0) {
        ul.appendChild(taskItem("Setup complete", "All five steps ticked. Week 1 opens Monday: read STA-101 Tuesday, PSY-101 Wednesday, Tutor both courses cold Thursday, write Friday, grade and seal the Priors Sheet Sunday."));
      } else {
        open.forEach(function (s) {
          ul.appendChild(taskItem(
            s.n + ". " + s.title + " · " + s.time,
            (s.orderDependent ? "Order-dependent, cannot be undone. " : "") + s.body,
            null, s.orderDependent ? "block" : null
          ));
        });
      }
      host.appendChild(ul);
      host.appendChild(el("p", "meta", "Week 1: Tue read STA-101 (Spiegelhalter 1–2), Wed read PSY-101 (OSC 2015), Thu Tutor both courses cold, Fri write both outputs, Sun grade and seal."));
      return;
    }

    if (phase === "post") {
      host.appendChild(el("h2", "now-head", "Term A is closed"));
      var since = refI - TERM_END_I;
      host.appendChild(el("p", "now-sub",
        "The term ended " + fmtNoDay(TERM_END) + ", " + plural(since, "day", "days") + " ago. A course is complete when its term paper passes and its weekly pass rate is recorded in REGISTRAR.md."));

      var strip2 = el("div", "now-strip");
      D.courses.forEach(function (c) {
        strip2.appendChild(el("span", "chip", c.code + " · " + closedCount(c) + "/" + c.weeks.length + " weeks closed"));
      });
      var hc2 = hCount();
      strip2.appendChild(el("span", "chip", hc2.h + " of " + hc2.total + " sources [H]"));
      host.appendChild(strip2);

      var ul2 = el("ul", "now-tasks");
      D.courses.forEach(function (c) {
        ul2.appendChild(taskItem(c.code + " — " + plural(slipsFor(c, ref), "slipped week", "slipped weeks"),
          "Record the weekly pass rate (weeks at 5/5 ÷ weeks attempted) in the transcript. A rate near 100% means the Editor went soft, and the Advisor should say so."));
      });
      (D.meta.afterTerm || []).forEach(function (a) { ul2.appendChild(taskItem(a.label, a.detail)); });
      (D.meta.owedLater || []).forEach(function (o) { ul2.appendChild(taskItem(o.title, o.body)); });
      host.appendChild(ul2);
      return;
    }

    /* inside the term */
    var weekNo = weekNumberFor(ref);
    if (weekNo > D.meta.term.weeks) { weekNo = D.meta.term.weeks; }
    var dow = ref.getDay();
    var plan = planForDay(weekNo, dow);

    host.appendChild(el("h2", "now-head", plan.head));
    if (plan.sub) { host.appendChild(el("p", "now-sub", plan.sub)); }
    host.appendChild(nowChips(weekNo, ref, plan.time));

    var list = el("ul", "now-tasks");
    plan.items.forEach(function (i) { list.appendChild(i); });
    host.appendChild(list);

    var behind = [];
    D.courses.forEach(function (c) {
      c.weeks.forEach(function (w) {
        if (dayIndex(parseYMD(w.end)) < refI && !isClosed(c.code, w.n)) {
          behind.push(c.code + " wk " + w.n);
        }
      });
    });
    if (behind.length) {
      var shown = behind.slice(0, 4).join(", ");
      if (behind.length > 4) { shown += " and " + (behind.length - 4) + " more"; }
      var warn = el("p", "meta");
      warn.appendChild(el("strong", null, "Open behind you: "));
      warn.appendChild(document.createTextNode(shown + ". Each counts as a slipped week until it is closed."));
      host.appendChild(warn);
    }

    var jump = document.createElement("button");
    jump.type = "button";
    jump.className = "btn btn-quiet jump";
    jump.textContent = "Open week " + weekNo + " on the board ↓";
    jump.addEventListener("click", function () {
      for (var i = 0; i < weekNodes.length; i++) {
        if (weekNodes[i].n === weekNo) {
          weekNodes[i].det.open = true;
          if (weekNodes[i].det.scrollIntoView) {
            weekNodes[i].det.scrollIntoView(reduceMotion() ? true : { behavior: "smooth", block: "start" });
          }
          if (weekNodes[i].sum && weekNodes[i].sum.focus) { weekNodes[i].sum.focus(); }
          break;
        }
      }
    });
    host.appendChild(jump);
    host.appendChild(rhythmBlock(weekNo, dow));
  }

  /* ================================================== D · slipped counter */

  function renderSlips() {
    var host = $("slips-body");
    if (!host) { return; }
    clear(host);
    var ref = refDate();
    var refI = dayIndex(ref);
    var firstEnd = dayIndex(parseYMD(D.courses[0].weeks[0].end));

    if (refI <= firstEnd) {
      /* Nothing can have slipped yet — do not fill the screen with two zeroes. */
      var p0 = el("p", "slip-rule");
      p0.appendChild(document.createTextNode("Nothing can have slipped yet. The counter starts when week 1 ends on "
        + fmtNoDay(parseYMD(D.courses[0].weeks[0].end)) + ". "));
      p0.appendChild(el("strong", null, "Three slips in one course triggers a mandatory scope cut in that course, and the calendar does not move."));
      host.appendChild(p0);
      return;
    }

    var hot = D.courses.filter(function (c) { return slipsFor(c, ref) >= D.slipRule.limit; });
    if (hot.length) {
      var alarm = el("div", "slip-alarm");
      alarm.appendChild(el("strong", null, "Scope cut triggered — " + hot.map(function (c) { return c.code; }).join(" and ")));
      alarm.appendChild(document.createTextNode(
        D.slipRule.limit + " slipped weeks in a course triggers a mandatory scope cut in that course. The Advisor executes it without renegotiating, and the calendar does not move. " + D.slipRule.interlock));
      host.appendChild(alarm);
    }

    var grid = el("div", "slip-grid");
    D.courses.forEach(function (c) {
      var n = slipsFor(c, ref);
      var card = el("div", "slip-card" + (n >= D.slipRule.limit ? " is-hot" : ""));
      card.appendChild(el("span", "kicker", c.code));
      card.appendChild(el("span", "slip-count", String(n)));
      card.appendChild(el("span", "slip-of", "of " + D.slipRule.limit + " slipped · " + closedCount(c) + "/" + c.weeks.length + " weeks closed"));
      grid.appendChild(card);
    });
    host.appendChild(grid);

    var rule = el("p", "slip-rule");
    rule.appendChild(document.createTextNode("A week whose Sunday has passed and is still unclosed is a slipped week. "));
    rule.appendChild(el("strong", null, "Three slips in one course triggers a mandatory scope cut in that course, and the calendar does not move."));
    rule.appendChild(document.createTextNode(" " + D.slipRule.interlock));
    host.appendChild(rule);

    host.appendChild(el("p", "fine", "Week 1 exception, logged by the Advisor: the Priors Sheet is expected to fail A2 and A4. That is recorded as baseline measured, not as a slipped week."));
  }

  /* ==================================================== B · setup checklist */

  function renderSetup() {
    var list = $("setup-list");
    if (!list) { return; }
    clear(list);

    D.setup.forEach(function (step) {
      var li = el("li", "check-item" + (state.setup[step.n] ? " is-done" : ""));
      var row = el("div", "check-row");

      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = "setup-" + step.n;
      cb.checked = !!state.setup[step.n];
      cb.addEventListener("change", function () {
        if (cb.checked) { state.setup[step.n] = true; } else { delete state.setup[step.n]; }
        li.className = "check-item" + (cb.checked ? " is-done" : "");
        save();
        refreshDynamic();
        announce("Setup step " + step.n + (cb.checked ? " done. " : " un-ticked. ") +
          setupDone() + " of " + D.setup.length + " complete.");
      });
      row.appendChild(cb);

      var body = el("div");
      var lab = document.createElement("label");
      lab.className = "check-label";
      lab.setAttribute("for", cb.id);
      lab.appendChild(el("span", "check-title", step.n + ". " + step.title));
      lab.appendChild(el("span", "check-time", step.time));
      body.appendChild(lab);

      if (step.orderDependent) {
        body.appendChild(el("span", "order-flag", "Order-dependent · cannot be undone"));
        body.appendChild(el("p", "order-warning", step.warning));
      }
      if (step.where) { body.appendChild(el("p", "check-where", step.where)); }
      body.appendChild(el("p", "check-body", step.body));
      if (step.points && step.points.length) {
        var ul = el("ul", "check-points");
        step.points.forEach(function (pt) { ul.appendChild(el("li", null, pt)); });
        body.appendChild(ul);
      }
      row.appendChild(body);
      li.appendChild(row);
      list.appendChild(li);
    });
    renderSetupProgress();
  }

  function renderSetupProgress() {
    var p = $("setup-progress");
    if (!p) { return; }
    p.textContent = setupDone() + " of " + D.setup.length + " done" +
      (priorsWritten() ? "" : " · the Priors Sheet is still unwritten");
  }

  /* ========================================================= C · the weeks */

  var weekNodes = [];

  function weekCourseBlock(course, w) {
    var box = el("div", "week-course");
    box.appendChild(el("span", "wc-code", course.code));
    box.appendChild(el("span", "wc-milestone", w.milestone));

    var src = el("p", "wc-line");
    src.appendChild(el("span", "lbl", "Primary"));
    src.appendChild(sourceLine(w.sources));
    box.appendChild(src);

    var out = el("p", "wc-line");
    out.appendChild(el("span", "lbl", "Output"));
    out.appendChild(document.createTextNode(w.output));
    box.appendChild(out);

    if (w.note) { box.appendChild(el("p", "wc-note", w.note)); }
    if (w.fromCatalog) { box.appendChild(el("p", "wc-src", "detail transcribed from catalog/" + course.code + ".md §3")); }

    var label = document.createElement("label");
    label.className = "wc-close";
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = isClosed(course.code, w.n);
    cb.addEventListener("change", function () {
      var k = course.code + "|" + w.n;
      if (cb.checked) { state.closed[k] = true; } else { delete state.closed[k]; }
      save();
      refreshDynamic();
      var sl = slipsFor(course, refDate());
      announce(course.code + " week " + w.n + (cb.checked ? " closed. " : " reopened. ") +
        closedCount(course) + " of " + course.weeks.length + " weeks closed" +
        (sl > 0 ? ", " + plural(sl, "slipped week", "slipped weeks") : "") + ".");
    });
    label.appendChild(cb);
    label.appendChild(document.createTextNode("Close " + course.code + " week " + w.n));
    box.appendChild(label);
    return { node: box, label: label };
  }

  function renderWeeks() {
    var host = $("weeks-list");
    if (!host) { return; }
    clear(host);
    weekNodes = [];

    D.courses[0].weeks.forEach(function (bw) {
      var det = el("details", "week");
      var sum = el("summary");
      sum.appendChild(el("span", "week-num", "Wk " + bw.n));

      var mid = el("div");
      mid.appendChild(el("span", "week-dates", fmtRange(bw.start, bw.end)));
      if (bw.midterm) {
        mid.appendChild(el("span", "week-title", "Midterm — oral, cold, both courses"));
      } else if (bw.paper) {
        mid.appendChild(el("span", "week-title", "Term papers — 2,000 words each course"));
      } else {
        D.courses.forEach(function (c) {
          var w = weekOf(c, bw.n);
          if (!w) { return; }
          var line = el("span", "week-line");
          line.appendChild(el("span", "wc-code", c.code.split("-")[0]));
          line.appendChild(el("span", "week-title", w.milestone));
          mid.appendChild(line);
        });
      }
      sum.appendChild(mid);

      var right = el("span", "week-right");
      var status = el("span", "week-status", "");
      right.appendChild(status);
      right.appendChild(el("span", "caret", "▸"));
      sum.appendChild(right);
      det.appendChild(sum);

      var body = el("div", "week-body");
      var labels = {};
      D.courses.forEach(function (c) {
        var w = weekOf(c, bw.n);
        if (w) {
          var block = weekCourseBlock(c, w);
          labels[c.code] = block.label;
          body.appendChild(block.node);
        }
      });
      det.appendChild(body);
      host.appendChild(det);

      weekNodes.push({ n: bw.n, det: det, sum: sum, status: status, start: bw.start, end: bw.end, labels: labels });
    });
    updateWeekStates(true);
  }

  function updateWeekStates(openCurrent) {
    var ref = refDate();
    var refI = dayIndex(ref);
    var current = weekNumberFor(ref);

    weekNodes.forEach(function (node) {
      var endI = dayIndex(parseYMD(node.end));
      var startI = dayIndex(parseYMD(node.start));
      var slipped = [];
      D.courses.forEach(function (c) {
        var late = (endI < refI && !isClosed(c.code, node.n));
        if (late) { slipped.push(c.code); }
        var lab = node.labels && node.labels[c.code];
        if (lab) { lab.className = "wc-close" + (late ? " is-slipped" : ""); }
      });

      var closedN = closedHere(node.n);
      var isCurrent = (refI >= startI && refI <= endI);
      var cls = "week";
      var text;

      if (slipped.length) {
        cls += " is-slipped";
        text = slipped.length > 1 ? "Slipped ×" + slipped.length : "Slipped · " + slipped[0].split("-")[0];
      } else if (closedN === D.courses.length) {
        cls += " is-done";
        text = "Closed";
      } else if (isCurrent) {
        text = closedN > 0 ? "This week · " + closedN + "/" + D.courses.length : "This week";
      } else {
        text = "Ahead";   /* not slipped, not fully closed, not current → still to come */
      }
      if (isCurrent) { cls += " is-now"; }
      node.det.className = cls;
      node.status.textContent = text;

      if (openCurrent && node.n === current && isCurrent) { node.det.open = true; }
    });
  }

  /* ====================================================== E · source ledger */

  function renderLegend() {
    var host = $("legend");
    if (!host) { return; }
    clear(host);
    D.tagLegend.forEach(function (l) {
      var row = el("div");
      var dt = el("dt");
      dt.appendChild(tagChip(l.tag));
      var dd = el("dd");
      dd.appendChild(el("b", null, l.name + ". "));
      dd.appendChild(document.createTextNode(l.body));
      row.appendChild(dt);
      row.appendChild(dd);
      host.appendChild(row);
    });
  }

  /* Tag moves the page will make:
       [R] → [V]  only with a verification record typed in, because that is the
                  claim the tag makes and A2 grades against it
       [V] → [H]  the documented move, once it is in NotebookLM
       [H] → back to whatever it was verified as                              */
  function renderLedger() {
    var host = $("ledger-list");
    if (!host) { return; }
    clear(host);

    D.courses.forEach(function (c) {
      var sec = el("div", "ledger-course");
      sec.appendChild(el("h3", null, c.code + " — " + c.title));
      sec.appendChild(el("p", "fine", c.ledgerNote));

      var ul = el("ul", "ledger-list-rows");
      c.ledger.forEach(function (row) {
        var key = c.code + "|" + row.id;
        var li = el("li", "ledger-row");

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tag-btn";
        var chipHost = el("span");
        btn.appendChild(chipHost);

        var body = el("div");
        body.appendChild(el("span", "ledger-src", row.source));
        var meta = el("span", "ledger-meta");
        body.appendChild(meta);
        body.appendChild(el("span", "ledger-id", "row " + row.id + " · filed as " + tagLabel(row.tag)));
        var formHost = el("div");
        body.appendChild(formHost);

        function verifiedText() { return state.verified[key] || row.verified; }
        function paint() {
          var t = tagOf(c.code, row.id, row.tag);
          clear(chipHost);
          chipHost.appendChild(tagChip(t));
          var v = verifiedText();
          meta.textContent = "Week " + row.wk + " · " + row.status + (v && v !== "—" ? " · verified against " + v : "");
          btn.setAttribute("aria-label", row.source + " — tagged " + tagLabel(t) + ". " +
            (t === "R" ? "Activate to record a verification and set [V]."
             : t === "V" ? "Activate to mark it in hand in NotebookLM, [H]."
             : "Activate to drop it back from [H]."));
        }
        paint();

        function closeForm() { clear(formHost); }

        btn.addEventListener("click", function () {
          var t = tagOf(c.code, row.id, row.tag);
          if (t === "V") {
            state.tags[key] = "H";
            paint(); save(); renderHCount(); renderNow();
            announce(row.source + " marked in hand. " + hCount().h + " of " + hCount().total + " sources in hand.");
            return;
          }
          if (t === "H") {
            state.tags[key] = (state.verified[key] || (row.verified && row.verified !== "—")) ? "V" : "R";
            paint(); save(); renderHCount(); renderNow();
            return;
          }
          /* [R] → [V] needs the record it claims to have. */
          if (formHost.firstChild) { closeForm(); return; }
          var form = el("div", "verify");
          var lid = "verify-" + c.code + "-" + row.id;
          var lab = document.createElement("label");
          lab.setAttribute("for", lid);
          lab.textContent = "Verified against what? A PubMed ID, a DOI, an ISBN, a publisher page — the record you actually retrieved.";
          var inp = document.createElement("input");
          inp.type = "text";
          inp.id = lid;
          inp.placeholder = "e.g. PubMed 26315443";
          var msg = el("p", "verify-msg", "");
          var ok = document.createElement("button");
          ok.type = "button";
          ok.className = "btn";
          ok.textContent = "Record and set [V]";
          ok.addEventListener("click", function () {
            var v = inp.value.trim();
            if (!v) {
              msg.textContent = "A tag with nothing behind it is an [R] in disguise. Name the record, or leave it [R].";
              inp.focus();
              return;
            }
            state.verified[key] = v.slice(0, 200);
            state.tags[key] = "V";
            closeForm(); paint(); save(); renderHCount(); renderNow();
          });
          var no = document.createElement("button");
          no.type = "button";
          no.className = "btn btn-quiet";
          no.textContent = "Cancel";
          no.addEventListener("click", function () { closeForm(); btn.focus(); });
          var rowBtns = el("div", "btn-row");
          rowBtns.appendChild(ok);
          rowBtns.appendChild(no);
          form.appendChild(lab);
          form.appendChild(inp);
          form.appendChild(msg);
          form.appendChild(rowBtns);
          formHost.appendChild(form);
          inp.focus();
        });

        li.appendChild(btn);
        li.appendChild(body);
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      host.appendChild(sec);
    });
    renderHCount();
  }

  function renderHCount() {
    var p = $("h-count");
    if (!p) { return; }
    clear(p);
    p.className = "meta h-count";
    var c = hCount();
    p.appendChild(el("strong", null, c.h + " of " + c.total));
    p.appendChild(document.createTextNode(" sources are [H] — in hand and in NotebookLM."));
  }

  /* ========================================================== F · rubric */

  function renderRubric() {
    var host = $("rubric-body");
    if (!host) { return; }
    clear(host);
    var R = D.rubric;

    host.appendChild(el("p", "prose", R.title + ". Graded by the Editor, every course, every week."));
    host.appendChild(el("p", "rubric-verdict", R.verdict));

    var ul = el("ul", "criteria");
    R.criteria.forEach(function (c) {
      var li = el("li", "criterion");
      li.appendChild(el("span", "cid", c.id));
      var body = el("div");
      body.appendChild(el("span", "cname", c.name));
      var f = el("span", "cfail");
      f.appendChild(el("b", null, "Fails if "));
      f.appendChild(document.createTextNode(c.fails));
      body.appendChild(f);
      li.appendChild(body);
      ul.appendChild(li);
    });
    host.appendChild(ul);

    host.appendChild(el("p", "prose", R.editorConstraint));
    var exc = el("ul", "check-points");
    R.exceptions.forEach(function (e) { exc.appendChild(el("li", null, e)); });
    host.appendChild(exc);
    host.appendChild(el("p", "fine", R.lock));
  }

  /* ------------------------------------------------------ enders and owed */

  function renderStatic() {
    var e = $("enders-list");
    if (e) {
      clear(e);
      D.enders.forEach(function (x) {
        var li = el("li");
        li.appendChild(el("b", null, x.title + ". "));
        li.appendChild(el("span", null, x.body));
        e.appendChild(li);
      });
    }
    var o = $("owed-list");
    if (o) {
      clear(o);
      (D.meta.owedLater || []).forEach(function (x) {
        var d = el("div", "owed-item");
        d.appendChild(el("h3", null, x.title));
        d.appendChild(el("p", null, x.body));
        o.appendChild(d);
      });
    }
    var meta = $("mast-meta");
    if (meta) {
      meta.textContent = D.meta.term.enrolled.join(" + ") + " · " +
        fmtShort(TERM_START) + " – " + fmtShort(TERM_END) + " 2026 · " + D.meta.term.weeks + " weeks";
    }
  }

  /* ------------------------------------------------------- export / import */

  function status(msg) {
    var s = $("data-status");
    if (s) { s.textContent = msg; }
  }

  function openIO(text, label) {
    var box = $("data-io");
    var ta = $("io-text");
    var lb = $("io-label");
    if (!box || !ta) { return; }
    box.hidden = false;
    if (lb) { lb.textContent = label; }
    ta.value = text;
    ta.focus();
    try { ta.setSelectionRange(0, text.length); } catch (e) { /* ignore */ }
  }

  function wireIO() {
    var exp = $("export-btn");
    if (exp) {
      exp.addEventListener("click", function () {
        var json = JSON.stringify(state, null, 2);
        openIO(json, "Your progress — copy this and keep it somewhere that isn't a browser cache");
        var saved = false;
        try {
          var blob = new Blob([json], { type: "application/json" });
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = "university-in-a-box-termA.json";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
          saved = true;
        } catch (e) { saved = false; }
        status(saved ? "Exported. If no file arrived, copy the text above instead."
                     : "Copy the text above — this browser blocked the download.");
      });
    }
    var imp = $("import-toggle");
    if (imp) {
      imp.addEventListener("click", function () {
        openIO("", "Paste exported JSON here, then load it");
        status("Paste a previous export, then press Load this data. It replaces what is in this browser.");
      });
    }
    var apply = $("import-apply");
    if (apply) {
      apply.addEventListener("click", function () {
        var ta = $("io-text");
        if (!ta || !ta.value.trim()) { status("Nothing to load — the box is empty."); return; }
        var parsed, clean;
        try { parsed = JSON.parse(ta.value); } catch (e) { status("That is not valid JSON. Nothing was changed."); return; }
        clean = sanitize(parsed);
        if (!clean) { status("That JSON is not a progress file. Nothing was changed."); return; }
        state = clean;
        save();
        renderSetup();
        renderWeeks();
        renderLedger();
        refreshDynamic();
        status("Loaded. " + setupDone() + " setup steps, " +
          D.courses.map(function (c) { return c.code + " " + closedCount(c) + " weeks closed"; }).join(", ") + ".");
      });
    }
    var close = $("io-close");
    if (close) { close.addEventListener("click", function () { $("data-io").hidden = true; status(""); }); }

    var reset = $("reset-btn");
    if (reset) {
      var armed = false, timer = null;
      reset.addEventListener("click", function () {
        if (!armed) {
          armed = true;
          reset.textContent = "Click again to erase everything";
          status("This clears every tick, closed week and tag in this browser. Export first if you want it back.");
          timer = setTimeout(function () {
            armed = false;
            reset.textContent = "Reset everything";
            status("");
          }, 5000);
          return;
        }
        if (timer) { clearTimeout(timer); }
        armed = false;
        reset.textContent = "Reset everything";
        try { window.localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
        state = defaults();
        renderSetup();
        renderWeeks();
        renderLedger();
        refreshDynamic();
        status("Everything reset.");
      });
    }
  }

  /* ------------------------------------------------------------- controls */

  function setPreview(d) {
    previewDate = d;
    var pd = $("preview-date");
    if (pd) { pd.value = d ? [d.getFullYear(), ("0" + (d.getMonth() + 1)).slice(-2), ("0" + d.getDate()).slice(-2)].join("-") : ""; }
    refreshDynamic();
  }

  function renderPreviewBar() {
    var bar = $("preview-bar");
    if (!bar) { return; }
    clear(bar);
    if (!previewDate) { bar.hidden = true; return; }
    bar.hidden = false;
    var t = el("span", "preview-bar-text");
    t.appendChild(el("strong", null, "Preview mode"));
    t.appendChild(document.createTextNode(" — the whole page is showing " + fmtLong(previewDate) +
      ", including the slipped-week counter. None of this is today."));
    bar.appendChild(t);
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn-invert";
    b.textContent = "Back to today";
    b.addEventListener("click", function () { setPreview(null); });
    bar.appendChild(b);
  }

  function wireControls() {
    var pd = $("preview-date");
    if (pd) {
      pd.addEventListener("change", function () {
        if (!pd.value) { setPreview(null); return; }
        var d = parseYMD(pd.value);
        setPreview(isNaN(d.getTime()) ? null : d);
      });
    }
    var pr = $("preview-reset");
    if (pr) { pr.addEventListener("click", function () { setPreview(null); }); }
    var ex = $("weeks-expand");
    if (ex) { ex.addEventListener("click", function () { weekNodes.forEach(function (n) { n.det.open = true; }); }); }
    var co = $("weeks-collapse");
    if (co) { co.addEventListener("click", function () { weekNodes.forEach(function (n) { n.det.open = false; }); }); }
  }

  function refreshDynamic() {
    var phase = phaseFor(dayIndex(refDate()));
    document.body.className = "phase-" + phase + (previewDate ? " is-preview" : "");
    renderNow();
    renderSlips();
    updateWeekStates(false);
    renderHCount();
    renderSetupProgress();
    renderPreviewBar();
    renderStorageBanner();
  }

  /* ------------------------------------------------------------------ go */

  storage.writable = probeStorage();
  state = load();

  renderStatic();
  renderSetup();
  renderWeeks();
  renderLegend();
  renderLedger();
  renderRubric();
  wireIO();
  wireControls();
  refreshDynamic();

  /* If the tab is left open across midnight, recompute on return. */
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && !previewDate) { refreshDynamic(); }
  });
})();
