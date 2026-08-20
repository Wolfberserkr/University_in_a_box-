/* University in a Box — Term A reader.
   Vanilla JS, no dependencies, no network. State lives in localStorage and is
   wrapped in try/catch everywhere: if storage throws or returns junk, the page
   still renders and simply stops remembering. */
(function () {
  "use strict";

  var D = window.UNIBOX;
  if (!D) { return; }

  var KEY = "uib.termA.v1";
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
  function fmtShort(d) {
    return d.getDate() + " " + MON_SHORT[d.getMonth()];
  }
  function fmtRange(a, b) {
    return fmtShort(parseYMD(a)) + " – " + fmtShort(parseYMD(b));
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  var TERM_START = parseYMD(D.meta.term.start);
  var TERM_END = parseYMD(D.meta.term.end);
  var TERM_START_I = dayIndex(TERM_START);
  var TERM_END_I = dayIndex(TERM_END);

  var previewDate = null; /* Date or null — never persisted */

  function refDate() { return previewDate || startOfToday(); }
  function weekNumberFor(d) {
    return Math.floor((dayIndex(d) - TERM_START_I) / 7) + 1;
  }

  /* -------------------------------------------------------------- storage */

  var storageOK = true;

  function probeStorage() {
    try {
      var t = "__uib_probe__";
      window.localStorage.setItem(t, "1");
      window.localStorage.removeItem(t);
      return true;
    } catch (e) { return false; }
  }

  function defaults() {
    var s = { v: 1, setup: {}, closed: {}, tags: {}, updated: null };
    D.courses.forEach(function (c) {
      c.ledger.forEach(function (row) { s.tags[c.code + "|" + row.id] = row.tag; });
    });
    return s;
  }

  function sanitize(raw) {
    var base = defaults();
    if (!raw || typeof raw !== "object") { return base; }
    var out = { v: 1, setup: {}, closed: {}, tags: base.tags, updated: null };
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
    if (raw.tags && typeof raw.tags === "object") {
      D.courses.forEach(function (c) {
        c.ledger.forEach(function (row) {
          var k = c.code + "|" + row.id;
          var t = raw.tags[k];
          if (t === "R" || t === "V" || t === "H") { out.tags[k] = t; }
        });
      });
    }
    if (typeof raw.updated === "string") { out.updated = raw.updated; }
    return out;
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) { return defaults(); }
      return sanitize(JSON.parse(raw));
    } catch (e) {
      storageOK = false;
      return defaults();
    }
  }

  function save() {
    state.updated = new Date().toISOString();
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      storageOK = false;
      showStorageWarning();
    }
  }

  function showStorageWarning() {
    var b = document.getElementById("storage-warning");
    if (b) { b.hidden = false; }
  }

  var state = defaults();

  /* ------------------------------------------------------------- dom help */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text !== undefined && text !== null) { n.textContent = text; }
    return n;
  }
  function clear(node) { while (node && node.firstChild) { node.removeChild(node.firstChild); } }
  function $(id) { return document.getElementById(id); }

  function tagLabel(t) { return "[" + t + "]"; }
  function tagClass(t) { return "tag tag-" + String(t).toLowerCase(); }

  /* Renders "OSC 2015 [V] + Ritchie 1–2 [R]" with real tag chips. */
  function sourceLine(sources) {
    var frag = document.createDocumentFragment();
    (sources || []).forEach(function (s, i) {
      if (i) { frag.appendChild(document.createTextNode(" + ")); }
      frag.appendChild(document.createTextNode(s.text));
      if (s.tag) {
        frag.appendChild(document.createTextNode(" "));
        frag.appendChild(el("span", tagClass(s.tag), tagLabel(s.tag)));
      }
    });
    return frag;
  }
  function sourceText(sources) {
    return (sources || []).map(function (s) {
      return s.text + (s.tag ? " " + tagLabel(s.tag) : "");
    }).join(" + ");
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
  function hCount() {
    var n = 0, total = 0;
    D.courses.forEach(function (c) {
      c.ledger.forEach(function (row) {
        total++;
        if (state.tags[c.code + "|" + row.id] === "H") { n++; }
      });
    });
    return { h: n, total: total };
  }
  function setupDone() {
    var n = 0;
    D.setup.forEach(function (s) { if (state.setup[s.n]) { n++; } });
    return n;
  }

  /* =================================================== A · the NOW panel */

  function nowChips(weekNo, ref) {
    var strip = el("div", "now-strip");
    if (weekNo >= 1 && weekNo <= D.meta.term.weeks) {
      strip.appendChild(el("span", "chip chip-accent", "Week " + weekNo + " of " + D.meta.term.weeks));
      var w = weekOf(D.courses[0], weekNo);
      if (w) { strip.appendChild(el("span", "chip", "Closes Sun " + fmtShort(parseYMD(w.end)))); }
      if (w && w.midterm) { strip.appendChild(el("span", "chip chip-accent", "Midterm week")); }
      if (w && w.paper) { strip.appendChild(el("span", "chip chip-accent", "Term paper week")); }
    }
    var totalSlips = 0;
    D.courses.forEach(function (c) { totalSlips += slipsFor(c, ref); });
    strip.appendChild(el("span", totalSlips > 0 ? "chip chip-accent" : "chip",
      totalSlips === 0 ? "No slipped weeks" : plural(totalSlips, "slipped week", "slipped weeks")));
    var hc = hCount();
    strip.appendChild(el("span", "chip", hc.h + " of " + hc.total + " sources in hand [H]"));
    return strip;
  }

  function taskItem(title, body, src) {
    var li = el("li");
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

  /* Returns {head, sub, items:[node]} for a day inside the term. */
  function planForDay(weekNo, dow) {
    var isW1 = weekNo === 1;
    var days = isW1 ? D.week1 : D.rhythm.days;
    var idx = (dow + 6) % 7;              /* Mon = 0 … Sun = 6 */
    var entry = days[idx] || days[0];
    var A = courseByCode(D.rhythm.courseA);
    var B = courseByCode(D.rhythm.courseB);
    var wA = weekOf(A, weekNo), wB = weekOf(B, weekNo);
    var items = [];
    var head, sub = entry.detail;

    function hasSource(w) {
      return !!w && (w.sources || []).some(function (s) { return s.text && s.text !== "—"; });
    }
    function readSub(w) {
      if (hasSource(w)) {
        return isW1 ? entry.detail
          : "One primary, one supporting, and stop. Three good sources for one week is how a folder of unread PDFs starts.";
      }
      if (w && w.midterm) {
        return "Thursday is oral and cold, both courses. What helps is recall practice — saying the argument out loud without the paper — not re-reading it.";
      }
      return "2,000 words per course, due Sunday. When they pass, Term A goes on the transcript.";
    }
    function readItem(course, w) {
      if (!hasSource(w)) {
        return taskItem(course.code + " · " + course.title, w.milestone + " — no new source this week.");
      }
      return taskItem(
        course.code + " · " + course.title,
        w.milestone,
        { label: "Primary:", sources: w.sources }
      );
    }

    if (idx === 0) {                       /* Monday */
      head = "Week " + weekNo + " opens";
      if (isW1 && !state.setup[2]) {
        items.push(taskItem(
          "Write the Priors Sheet first — before any source",
          "Step 2 of the setup is still unticked. The moment you read OSC 2015 this measurement is gone for good. 600 words, three findings, what would change your mind."
        ));
      }
      items.push(taskItem("Advisor", "Sets this week's milestone from last week's gaps and verdicts."));
      items.push(taskItem("Librarian", "Confirms one primary + one supporting per course, tagged."));
      if (wA) { items.push(readItem(A, wA)); }
      if (wB) { items.push(readItem(B, wB)); }
    } else if (idx === 1) {                /* Tuesday */
      head = hasSource(wA) ? "Read " + A.code
           : (wA && wA.midterm ? "Midterm week — no new reading" : "Term paper week — writing, not reading");
      sub = readSub(wA);
      if (wA) { items.push(readItem(A, wA)); }
      if (wA && wA.note) { items.push(taskItem("Note", wA.note)); }
      items.push(taskItem("Output due Friday", wA ? wA.output : ""));
    } else if (idx === 2) {                /* Wednesday */
      head = hasSource(wB) ? "Read " + B.code
           : (wB && wB.midterm ? "Midterm week — no new reading" : "Term paper week — writing, not reading");
      sub = readSub(wB);
      if (wB) { items.push(readItem(B, wB)); }
      if (wB && wB.note) { items.push(taskItem("Note", wB.note)); }
      items.push(taskItem("Output due Friday", wB ? wB.output : ""));
    } else if (idx === 3) {                /* Thursday */
      head = (wA && wA.midterm) ? "Midterm — oral, cold" : "Tutor — both courses, cold";
      items.push(taskItem("Sources closed", "No PDF, no notes, no NotebookLM. The Tutor writes what you could not reconstruct to §C as a gap, and a gap closes only when you re-explain it cold in a later week."));
      if (wA) { items.push(taskItem(A.code, wA.milestone + (wA.midterm && wA.note ? " — " + wA.note : ""))); }
      if (wB) { items.push(taskItem(B.code, wB.milestone + (wB.midterm && wB.note ? " — " + wB.note : ""))); }
      items.push(taskItem("Do not say “yeah, that makes sense”", "It ends the conversation socially and teaches nothing. Expect: “then say it back in a form I didn't give you, using a case from your own week.”"));
    } else if (idx === 4) {                /* Friday */
      var isMid = !!(wA && wA.midterm);
      head = isMid ? "Midterm week — no written output" : "Write both outputs";
      if (isMid) {
        sub = "This week's artifact is the Tutor's verdict from yesterday, not 600 words. Gaps go to §C, verdicts to §D.";
        items.push(taskItem("Nothing to write", "Both courses examined orally and cold on Thursday. The week still has to be closed on Sunday."));
      } else {
        if (wA) { items.push(taskItem(A.code + " — " + wA.output, wA.milestone, { label: "From:", sources: wA.sources })); }
        if (wB) { items.push(taskItem(B.code + " — " + wB.output, wB.milestone, { label: "From:", sources: wB.sources })); }
        items.push(taskItem("Rubric", "Five pass/fail criteria, 5/5 or the week is a rewrite. The rubric is further down this page."));
      }
    } else if (idx === 5) {                /* Saturday */
      var fortnight = (weekNo % 2 === 0);
      head = fortnight ? "Roommate — one collision" : "Nothing scheduled";
      if (fortnight) {
        items.push(taskItem("Cross-domain collision", "One domain, collided with this week's material, logged to §E. Spent domains cannot be reused. Two courses are active — the best available collision is often between them."));
      } else {
        items.push(taskItem("Rest", "The Roommate runs fortnightly, on even weeks. This is an odd week. Nothing is owed today."));
      }
    } else {                               /* Sunday */
      head = "Grade, then close week " + weekNo;
      if (wA && wA.midterm) {
        sub = "The Tutor's verdicts are this week's record — no weekly output was owed. Then the Advisor closes the week.";
      }
      if (wA && wA.paper) {
        items.push(taskItem("Last Sunday of Term A", "Both term papers graded, both weeks closed, and the pass rates recorded in REGISTRAR.md. Then Term A is on the transcript."));
      }
      items.push(taskItem("Editor", (wA && wA.midterm)
        ? "Records the Tutor's midterm verdicts. No weekly output is owed this week."
        : "Grades both outputs against ASSESSMENT.md Part A. No praise in the first paragraph, ever."));
      items.push(taskItem("Advisor", "Closes the week. Tick both boxes in the week list below once it is graded."));
      if (isW1) { items.push(taskItem("Seal the Priors Sheet", "Today is the seal date, not the write date. Seal it and never revise it — not in month six when it's embarrassing.")); }
      D.courses.forEach(function (c) {
        if (!isClosed(c.code, weekNo)) {
          items.push(taskItem(c.code + " — still open", "Week " + weekNo + " is not closed yet."));
        }
      });
    }
    return { head: head, sub: sub, items: items, entry: entry };
  }

  function rhythmBlock(weekNo, dow) {
    var wrap = el("details", "rhythm");
    var days = (weekNo === 1) ? D.week1 : D.rhythm.days;
    var sum = el("summary", null, weekNo === 1 ? "Week 1, day by day" : "The week, day by day");
    wrap.appendChild(sum);
    var ul = el("ul", "rhythm-list");
    var todayIdx = (dow + 6) % 7;
    days.forEach(function (d, i) {
      var li = el("li", i === todayIdx ? "is-today" : null);
      li.appendChild(el("span", "day-tag", d.day));
      var body = el("div");
      var what = el("span", "rhythm-what", d.label);
      body.appendChild(what);
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

  function renderNow() {
    var host = $("now-body");
    if (!host) { return; }
    clear(host);

    var ref = refDate();
    var refI = dayIndex(ref);

    var dateLine = el("p", "now-date", (previewDate ? "Previewing " : "") + fmtLong(ref));
    host.appendChild(dateLine);

    if (refI < TERM_START_I) {
      /* ---------- before the term opens ---------- */
      var days = TERM_START_I - refI;
      host.appendChild(el("h3", "now-head", days === 1 ? "Term A opens tomorrow" : "Term A opens in " + plural(days, "day", "days")));
      host.appendChild(el("p", "now-sub",
        "Monday " + fmtLong(TERM_START).replace(/^\w+ /, "") + ". Nothing is due yet — the five setup steps are, and step 2 has a deadline that is not a date but an event: it must be written before you open a single source."));

      var strip = el("div", "now-strip");
      strip.appendChild(el("span", "chip chip-accent", "Pre-term setup"));
      strip.appendChild(el("span", "chip", setupDone() + " of " + D.setup.length + " steps done"));
      strip.appendChild(el("span", state.setup[2] ? "chip" : "chip chip-accent",
        state.setup[2] ? "Priors Sheet written" : "Priors Sheet not written"));
      host.appendChild(strip);

      var ul = el("ul", "now-tasks");
      var open = D.setup.filter(function (s) { return !state.setup[s.n]; });
      if (open.length === 0) {
        ul.appendChild(taskItem("Setup complete", "All five steps ticked. Week 1 opens Monday: read STA-101 Tuesday, PSY-101 Wednesday, Tutor Thursday, write Friday, grade and close Sunday."));
      } else {
        open.forEach(function (s) {
          ul.appendChild(taskItem(
            s.n + ". " + s.title + " · " + s.time,
            (s.orderDependent ? "Order-dependent, cannot be undone. " : "") + s.body
          ));
        });
      }
      host.appendChild(ul);

      var p = el("p", "meta", "Week 1: Tue read STA-101 (Spiegelhalter 1–2), Wed read PSY-101 (OSC 2015), Thu Tutor both courses cold, Fri write both outputs, Sun grade and seal the Priors Sheet.");
      host.appendChild(p);
      return;
    }

    if (refI > TERM_END_I) {
      /* ---------- after the term closes ---------- */
      host.appendChild(el("h3", "now-head", "Term A is closed"));
      var since = refI - TERM_END_I;
      host.appendChild(el("p", "now-sub",
        "The term ended " + fmtLong(TERM_END).replace(/^\w+ /, "") + ", " + plural(since, "day", "days") + " ago. A course is complete when its term paper passes and its weekly pass rate is recorded in REGISTRAR.md."));

      var strip2 = el("div", "now-strip");
      D.courses.forEach(function (c) {
        strip2.appendChild(el("span", "chip", c.code + ": " + closedCount(c) + "/" + c.weeks.length + " weeks closed"));
      });
      var hc2 = hCount();
      strip2.appendChild(el("span", "chip", hc2.h + " of " + hc2.total + " sources [H]"));
      host.appendChild(strip2);

      var ul2 = el("ul", "now-tasks");
      D.courses.forEach(function (c) {
        var s = slipsFor(c, ref);
        ul2.appendChild(taskItem(c.code + " — " + plural(s, "slipped week", "slipped weeks"),
          "Record the weekly pass rate (weeks at 5/5 ÷ weeks attempted) in the transcript. A rate near 100% means the Editor went soft, and the Advisor should say so."));
      });
      (D.meta.afterTerm || []).forEach(function (a) { ul2.appendChild(taskItem(a.label, a.detail)); });
      (D.meta.owedLater || []).forEach(function (o) { ul2.appendChild(taskItem(o.title, o.body)); });
      host.appendChild(ul2);
      return;
    }

    /* ---------- inside the term ---------- */
    var weekNo = weekNumberFor(ref);
    if (weekNo > D.meta.term.weeks) { weekNo = D.meta.term.weeks; }
    var dow = ref.getDay();
    var plan = planForDay(weekNo, dow);

    host.appendChild(el("h3", "now-head", plan.head));
    if (plan.sub) { host.appendChild(el("p", "now-sub", plan.sub)); }
    host.appendChild(nowChips(weekNo, ref));

    var list = el("ul", "now-tasks");
    plan.items.forEach(function (i) { list.appendChild(i); });
    host.appendChild(list);

    /* open weeks behind you */
    var behind = [];
    D.courses.forEach(function (c) {
      c.weeks.forEach(function (w) {
        if (dayIndex(parseYMD(w.end)) < dayIndex(ref) && !isClosed(c.code, w.n)) {
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
            weekNodes[i].det.scrollIntoView({ behavior: "smooth", block: "start" });
          }
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

    var note = el("p", "fine", "Week 1 exception, logged by the Advisor: the Priors Sheet is expected to fail A2 and A4. That is recorded as baseline measured, not as a slipped week.");
    host.appendChild(note);
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
        renderNow();
        renderSetupProgress();
      });
      row.appendChild(cb);

      var body = el("div");
      var lab = document.createElement("label");
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
    var n = setupDone();
    p.textContent = n + " of " + D.setup.length + " done" + (state.setup[2] ? "" : " · the Priors Sheet is still unwritten");
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

    var base = D.courses[0].weeks;
    base.forEach(function (bw) {
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

      var status = el("span", "week-status", "");
      sum.appendChild(status);
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

      weekNodes.push({ n: bw.n, det: det, status: status, start: bw.start, end: bw.end, labels: labels });
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
      var allClosed = D.courses.every(function (c) { return isClosed(c.code, node.n); });
      var anyClosed = D.courses.some(function (c) { return isClosed(c.code, node.n); });
      var slipped = [];
      D.courses.forEach(function (c) { if (endI < refI && !isClosed(c.code, node.n)) { slipped.push(c.code); } });

      D.courses.forEach(function (c) {
        var lab = node.labels && node.labels[c.code];
        if (lab) {
          var late = (endI < refI && !isClosed(c.code, node.n));
          lab.className = "wc-close" + (late ? " is-slipped" : "");
        }
      });

      var cls = "week";
      var text;
      if (slipped.length) {
        cls += " is-slipped";
        text = slipped.length > 1 ? "Slipped ×" + slipped.length : "Slipped · " + slipped[0].split("-")[0];
      } else if (allClosed) {
        cls += " is-done";
        text = "Closed";
      } else if (refI >= startI && refI <= endI) {
        text = anyClosed ? "This week · 1/2" : "This week";
      } else if (refI < startI) {
        text = "Ahead";
      } else {
        text = "Closed";
        cls += " is-done";
      }
      if (refI >= startI && refI <= endI) { cls += " is-now"; }
      node.det.className = cls;
      node.status.textContent = text;

      if (openCurrent && node.n === current && refI >= startI && refI <= endI) {
        node.det.open = true;
      }
    });
  }

  /* ====================================================== E · source ledger */

  var hCountNode = null;

  function renderLegend() {
    var host = $("legend");
    if (!host) { return; }
    clear(host);
    D.tagLegend.forEach(function (l) {
      var row = el("div");
      var dt = el("dt");
      dt.appendChild(el("span", tagClass(l.tag), tagLabel(l.tag)));
      var dd = el("dd");
      dd.appendChild(el("b", null, l.name + ". "));
      dd.appendChild(document.createTextNode(l.body));
      row.appendChild(dt);
      row.appendChild(dd);
      host.appendChild(row);
    });
  }

  var CYCLE = { R: "V", V: "H", H: "R" };

  function renderLedger() {
    var host = $("ledger-list");
    if (!host) { return; }
    clear(host);

    D.courses.forEach(function (c) {
      var sec = el("div", "ledger-course");
      sec.appendChild(el("h3", null, c.code + " — " + c.title));
      sec.appendChild(el("p", "fine", c.ledgerNote));

      var ul = el("ul", "ledger-list");
      c.ledger.forEach(function (row) {
        var key = c.code + "|" + row.id;
        var li = el("li", "ledger-row");

        var btn = document.createElement("button");
        btn.type = "button";
        function paint() {
          var t = state.tags[key] || row.tag;
          btn.className = tagClass(t);
          btn.textContent = tagLabel(t);
          btn.setAttribute("aria-label",
            "Source " + row.id + ", " + row.source + " — tagged " + tagLabel(t) + ". Activate to cycle the tag.");
        }
        paint();
        btn.addEventListener("click", function () {
          var t = state.tags[key] || row.tag;
          state.tags[key] = CYCLE[t] || "R";
          paint();
          save();
          renderHCount();
          renderNow();
        });
        li.appendChild(btn);

        var body = el("div");
        body.appendChild(el("span", "ledger-src", row.source));
        var meta = el("span", "ledger-meta",
          "Week " + row.wk + " · " + row.status + (row.verified && row.verified !== "—" ? " · " + row.verified : ""));
        body.appendChild(meta);
        body.appendChild(el("span", "ledger-id", "row " + row.id + " · filed as " + tagLabel(row.tag)));
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
    var lede = $("mast-lede");
    if (lede) {
      lede.textContent = D.meta.term.enrolled.join(" and ") + ", " + D.meta.term.weeks +
        " weeks, " + fmtShort(TERM_START) + " to " + fmtShort(TERM_END) + " 2026. " + D.meta.capacity + ".";
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
        var parsed;
        try { parsed = JSON.parse(ta.value); }
        catch (e) { status("That is not valid JSON. Nothing was changed."); return; }
        state = sanitize(parsed);
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

  function wireControls() {
    var pd = $("preview-date");
    if (pd) {
      pd.addEventListener("change", function () {
        if (!pd.value) { previewDate = null; }
        else {
          var d = parseYMD(pd.value);
          previewDate = isNaN(d.getTime()) ? null : d;
        }
        refreshDynamic();
      });
    }
    var pr = $("preview-reset");
    if (pr) {
      pr.addEventListener("click", function () {
        previewDate = null;
        if (pd) { pd.value = ""; }
        refreshDynamic();
      });
    }
    var ex = $("weeks-expand");
    if (ex) { ex.addEventListener("click", function () { weekNodes.forEach(function (n) { n.det.open = true; }); }); }
    var co = $("weeks-collapse");
    if (co) { co.addEventListener("click", function () { weekNodes.forEach(function (n) { n.det.open = false; }); }); }
  }

  function refreshDynamic() {
    renderNow();
    renderSlips();
    updateWeekStates(false);
    renderHCount();
    renderSetupProgress();
  }

  /* ------------------------------------------------------------------ go */

  storageOK = probeStorage();
  if (!storageOK) { showStorageWarning(); }
  state = load();
  if (!storageOK) { showStorageWarning(); }

  renderStatic();
  renderSetup();
  renderWeeks();
  renderLegend();
  renderLedger();
  renderRubric();
  renderSlips();
  renderNow();
  wireIO();
  wireControls();

  /* If the tab is left open across midnight, recompute on return. */
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && !previewDate) { refreshDynamic(); }
  });
})();
