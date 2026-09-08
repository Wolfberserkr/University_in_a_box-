/* Everything the dashboard reports, derived from curriculum.json + progress state.
 *
 * Definitions come from the repository, not from taste:
 *   pass rate    REGISTRAR.md - "weeks at 5/5 / weeks attempted"
 *   slipped      docs + START-HERE - a week whose Sunday has passed and is still open
 *   scope cut    REGISTRAR.md - three slips in one course, and the calendar never moves
 *   editor soft  REGISTRAR.md - "a rate near 100% by week 6 means the Editor has gone soft"
 *   week 1 PSY   enrolled/PSY-101.md - the Priors Sheet is expected to fail A2 and A4;
 *                it is logged as baseline measured, not a slipped week, and owes no rewrite
 */
import { getWeek, rubricScore } from './store.js';
import { elapsedWeeks } from './calendar.js';

export const TAGS = ['R', 'V', 'H'];
export const TAG_LABEL = { R: 'Recalled', V: 'Verified', H: 'In hand' };

/* Which week the Advisor has declared a measurement rather than a performance.
 * Declared in the board note in enrolled/<CODE>.md and parsed out of it - the
 * site holds no curriculum of its own, and "PSY-101 week 1" typed here would be
 * exactly that. */
export function isBaselineWeek(data, code, n) {
  const enrolled = data.enrolled[code];
  return !!enrolled && enrolled.baselineWeek === n;
}

export function effectiveTag(state, row) {
  return state.tags[row.id] || row.tag;
}

export function courseMetrics(data, state, code, today) {
  const weeks = data.termA.weeks;
  const elapsed = elapsedWeeks(weeks, today);
  const records = weeks.map((w) => ({ w, r: getWeek(state, code, w.n) }));

  const closed = records.filter(({ r }) => r.closed);

  /* Week 7 is the midterm: oral, cold, run by the Tutor. ASSESSMENT.md Part A
     grades weekly written output, so the midterm is not a Part A artifact and
     does not belong in a pass rate built out of Part A verdicts. */
  const gradeable = records.filter(({ w }) => !w.midterm);

  /* A pass rate is `weeks at 5/5 / weeks attempted` (REGISTRAR.md). A week you
     closed without the Editor grading it is not a failed week - nobody read it.
     Counting it knocks the rate down on the strength of an absent verdict, so
     attempted means graded, and the closed-but-ungraded weeks are reported
     separately rather than folded in. */
  const graded = gradeable.filter(({ r }) => rubricScore(r).graded > 0);
  const ungraded = gradeable.filter(({ r }) => r.closed && rubricScore(r).graded === 0);
  const attempted = graded;
  const full = attempted.filter(({ r }) => rubricScore(r).full);

  const slipped = elapsed.filter((w) => !getWeek(state, code, w.n).closed);
  const rewrites = attempted.filter(({ w, r }) =>
    !rubricScore(r).full && !r.rewriteDone && !isBaselineWeek(data, code, w.n));

  const exBaseline = attempted.filter(({ w }) => !isBaselineWeek(data, code, w.n));
  const exBaselineFull = exBaseline.filter(({ r }) => rubricScore(r).full);

  const hours = records.reduce((sum, { r }) => sum + (parseFloat(r.hours) || 0), 0);

  const passRate = attempted.length ? full.length / attempted.length : null;
  const passRateExBaseline = exBaseline.length ? exBaselineFull.length / exBaseline.length : null;

  return {
    code,
    total: weeks.length,
    elapsed: elapsed.length,
    closed: closed.length,
    attempted: attempted.length,
    ungraded: ungraded.length,
    graded: graded.length,
    full: full.length,
    passRate,
    passRateExBaseline,
    exBaselineAttempted: exBaseline.length,
    exBaselineFull: exBaselineFull.length,
    slipped: slipped.length,
    slippedWeeks: slipped.map((w) => w.n),
    slipLimit: (data.enrolled[code] || {}).slipLimit || 3,
    scopeCut: slipped.length >= ((data.enrolled[code] || {}).slipLimit || 3),
    rewritesOwed: rewrites.map(({ w }) => w.n),
    hours,
    // "near 100% by week 6" - the Editor-has-gone-soft check, baseline excluded
    editorSoft: exBaseline.length >= 5 && passRateExBaseline !== null && passRateExBaseline >= 0.9,
    records,
  };
}

export function ledgerMetrics(data, state, code) {
  const rows = (data.enrolled[code] || {}).ledger || [];
  const counts = { R: 0, V: 0, H: 0 };
  rows.forEach((row) => { counts[effectiveTag(state, row)] += 1; });
  return { code, rows, counts, total: rows.length };
}

/* Sources whose week is close and which are not yet in hand. */
export function acquireQueue(data, state, currentWeek, horizon = 4) {
  const out = [];
  Object.keys(data.enrolled).forEach((code) => {
    (data.enrolled[code].ledger || []).forEach((row) => {
      const wk = parseInt(row.week, 10);
      if (!wk) return;
      const tag = effectiveTag(state, row);
      if (tag === 'H') return;
      const due = wk - (currentWeek || 1);
      if (due > horizon) return;
      out.push({ ...row, code, wk, tag, due });
    });
  });
  return out.sort((a, b) => a.wk - b.wk);
}

export function gapMetrics(state) {
  const open = state.gaps.filter((g) => g.status !== 'closed');
  const closed = state.gaps.filter((g) => g.status === 'closed');
  return { open: open.length, closed: closed.length, total: state.gaps.length, openList: open };
}

/* Setup progress, read out of the repository wherever the repository can
 * answer it. The magic string START-HERE.md carries ("**Already done") only
 * covers the Priors Sheet; the site is already holding the evidence for three
 * of the other four steps, and telling a student who has done most of the prep
 * that they have done a fifth of it is exactly the failure the "repository is
 * the source of truth" design exists to prevent.
 *
 *   intake     REGISTRAR.md baseline table - answered or declined
 *   sources    §B ledger rows tagged [H] - in hand supersedes acquired
 *   agents     REGISTRAR.md standing rules - "Agents stood up: ... ✓"
 *   notebooks  one [H] row per enrolled course
 *
 * A tick in this browser can still mark a step done; it can never un-do one the
 * repository says is done.
 */
export function setupMetrics(data, state) {
  const steps = data.startHere.setup;
  const intake = data.registrar.intake || [];
  const codes = Object.keys(data.enrolled);
  const inHand = codes.flatMap((c) => (data.enrolled[c].ledger || []))
    .filter((row) => effectiveTag(state, row) === 'H');
  const withNotebook = codes.filter((c) =>
    (data.enrolled[c].ledger || []).some((row) => effectiveTag(state, row) === 'H'));
  const agents = data.registrar.agents || { stoodUp: [], total: 0 };

  const evidence = (step) => {
    const t = step.title.toLowerCase();
    if (/intake|question/.test(t)) {
      const settled = intake.filter((q) => q.answered || q.declined);
      return {
        done: intake.length > 0 && settled.length === intake.length,
        of: `${settled.length} of ${intake.length}`,
        evidence: intake.length
          ? `${intake.filter((q) => q.answered).map((q) => q.id).join(' · ')} answered`
            + (intake.some((q) => q.declined)
              ? `, ${intake.filter((q) => q.declined).map((q) => q.id).join(' · ')} declined and re-instrumented`
              : '')
          : '',
        evidenceFrom: 'REGISTRAR.md → Baseline',
      };
    }
    if (/notebooklm|notebook/.test(t)) {
      return {
        done: withNotebook.length >= codes.length && codes.length > 0,
        of: `${withNotebook.length} of ${codes.length}`,
        evidence: withNotebook.length ? `${withNotebook.join(' · ')} have a source in hand` : '',
        evidenceFrom: '§B source ledgers',
      };
    }
    if (/source/.test(t)) {
      const target = step.tableRows || inHand.length;
      return {
        done: target > 0 && inHand.length >= target,
        of: `${inHand.length} of ${target}`,
        evidence: `${inHand.length} ledger row${inHand.length === 1 ? '' : 's'} tagged [H]`,
        evidenceFrom: '§B source ledgers',
      };
    }
    if (/agent/.test(t)) {
      const owed = (agents.names || []).filter((a) => !agents.stoodUp.includes(a));
      return {
        done: agents.total > 0 && agents.stoodUp.length >= agents.total,
        of: `${agents.stoodUp.length} of ${agents.total}`,
        evidence: agents.stoodUp.length
          ? `${agents.stoodUp.join(' · ')} stood up${owed.length ? ` · ${owed.join(', ')} still owed` : ''}`
          : '',
        evidenceFrom: 'REGISTRAR.md → Standing rules',
      };
    }
    return { done: !!step.done, of: '', evidence: step.doneNote || '', evidenceFrom: 'START-HERE.md' };
  };

  const rows = steps.map((step) => {
    const e = evidence(step);
    const ticked = !!state.setup[step.n];
    // repoDone is the repository's answer and is not yours to change here.
    // `done` folds in your own tick, which must stay undoable - conflating the
    // two latched the one tickable step forever under a tooltip claiming the
    // repository had recorded it.
    return { ...step, ...e, ticked, repoDone: e.done, done: e.done || ticked };
  });
  return { done: rows.filter((r) => r.done).length, total: rows.length, steps: rows };
}

/* Credits. `earnedRecorded` is what REGISTRAR.md says and only the Sunday close
 * can move it. `projected` is what this browser's ticks would make it: a course
 * counts when all its weeks are closed AND its week-14 paper is 5/5, which is
 * REGISTRAR.md's own definition ("complete when its term paper passes and its
 * weekly pass rate is recorded"). The two are shown side by side and never
 * added together. */
export function creditMetrics(data, state, courses) {
  const c = data.registrar.credits;
  const per = c.perCourse || 3;
  const complete = courses.filter((m) => {
    if (m.closed < m.total) return false;
    return rubricScore(getWeek(state, m.code, m.total)).full;
  }).length;
  return {
    earnedRecorded: c.earned,
    totalPlanned: c.total,
    perCourse: per,
    projected: c.earned + complete * per,
    coursesComplete: c.coursesComplete,
    coursesProjected: c.coursesComplete + complete,
    coursesPlanned: c.coursesPlanned,
    certificateNeeds: c.certificateNeeds,
  };
}

export function termProgress(courses) {
  const closed = courses.reduce((s, c) => s + c.closed, 0);
  const total = courses.reduce((s, c) => s + c.total, 0);
  return { closed, total, fraction: total ? closed / total : 0 };
}

/* Week status for the strip. Order matters: the first true wins.
 *
 * `baseline` sits ahead of `rewrite` because enrolled/PSY-101.md says so in
 * bold: the Priors Sheet fails A2 and A4, it is logged as baseline measured,
 * and no rewrite is owed. courseMetrics already excludes it; the strip has to
 * agree, or the dashboard contradicts itself on one screen. */
export function weekStatus(data, state, code, week, today) {
  const r = getWeek(state, code, week.n);
  const score = rubricScore(r);
  if (r.closed && score.full) return 'pass';
  if (r.closed && score.graded > 0 && isBaselineWeek(data, code, week.n)) return 'baseline';
  if (r.closed && score.graded > 0) return 'rewrite';
  if (r.closed) return 'closed';
  if (week.end < today) return 'slipped';
  if (today >= week.start && today <= week.end) return 'current';
  return 'future';
}

export const STATUS_LABEL = {
  pass: 'Closed 5/5',
  baseline: 'Closed · baseline measured',
  rewrite: 'Closed, rewrite owed',
  closed: 'Closed, ungraded',
  slipped: 'Slipped',
  current: 'This week',
  future: 'Ahead',
};

export const STATUS_MARK = {
  pass: '\u2713', baseline: '\u25CE', rewrite: '\u21BB', closed: '\u00B7',
  slipped: '!', current: '', future: '',
};

/* One definition of what a pass rate means, used by the tile and by the
 * Editor-has-gone-soft callout alike. REGISTRAR.md calls it "a diagnostic for
 * the Advisor, not a grade to optimise", so none of the three bands is
 * "success" and the middle band carries no colour at all. */
export function passRateBand(courses) {
  const attempted = courses.reduce((s, c) => s + c.exBaselineAttempted, 0);
  const full = courses.reduce((s, c) => s + c.exBaselineFull, 0);
  const rate = attempted ? full / attempted : null;
  let state;
  if (rate === null) state = undefined;
  else if (attempted >= 5 && rate >= 0.9) state = 'warn';
  else if (attempted >= 2 && rate < 0.6) state = 'bad';
  return { rate, attempted, full, state };
}
