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

export function isBaselineWeek(code, n) {
  return code === 'PSY-101' && n === 1;
}

export function effectiveTag(state, row) {
  return state.tags[row.id] || row.tag;
}

export function courseMetrics(data, state, code, today) {
  const weeks = data.termA.weeks;
  const elapsed = elapsedWeeks(weeks, today);
  const records = weeks.map((w) => ({ w, r: getWeek(state, code, w.n) }));

  const closed = records.filter(({ r }) => r.closed);
  const graded = records.filter(({ r }) => rubricScore(r).graded > 0);
  const attempted = records.filter(({ r }) => r.closed || rubricScore(r).graded > 0);
  const full = attempted.filter(({ r }) => rubricScore(r).full);

  const slipped = elapsed.filter((w) => !getWeek(state, code, w.n).closed);
  const rewrites = attempted.filter(({ w, r }) =>
    !rubricScore(r).full && !r.rewriteDone && !isBaselineWeek(code, w.n));

  const exBaseline = attempted.filter(({ w }) => !isBaselineWeek(code, w.n));
  const exBaselineFull = exBaseline.filter(({ r }) => rubricScore(r).full);

  const hours = records.reduce((sum, { r }) => sum + (parseFloat(r.hours) || 0), 0);

  const passRate = attempted.length ? full.length / attempted.length : null;
  const passRateExBaseline = exBaseline.length ? exBaselineFull.length / exBaseline.length : null;

  return {
    code,
    total: weeks.length,
    closed: closed.length,
    attempted: attempted.length,
    graded: graded.length,
    full: full.length,
    passRate,
    passRateExBaseline,
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

export function setupMetrics(data, state) {
  const steps = data.startHere.setup;
  const done = steps.filter((s) => state.setup[s.n] || s.done);
  return { done: done.length, total: steps.length, steps };
}

export function creditMetrics(data, state, courses) {
  const c = data.registrar.credits;
  // A course counts as complete when its 14 weeks are closed and the paper passed.
  const complete = courses.filter((m) => m.closed >= m.total).length;
  const perCourseCredits = 3;
  return {
    earnedRecorded: c.earned,
    totalPlanned: c.total,
    projected: complete * perCourseCredits,
    coursesComplete: c.coursesComplete,
    coursesProjected: complete,
    coursesPlanned: c.coursesPlanned,
    certificateNeeds: c.certificateNeeds,
  };
}

export function termProgress(courses) {
  const closed = courses.reduce((s, c) => s + c.closed, 0);
  const total = courses.reduce((s, c) => s + c.total, 0);
  return { closed, total, fraction: total ? closed / total : 0 };
}

/* Week status for the strip. Order matters: the first true wins. */
export function weekStatus(state, code, week, today) {
  const r = getWeek(state, code, week.n);
  const score = rubricScore(r);
  if (r.closed && score.full) return 'pass';
  if (r.closed && score.graded > 0) return 'rewrite';
  if (r.closed) return 'closed';
  if (week.end < today) return 'slipped';
  if (today >= week.start && today <= week.end) return 'current';
  return 'future';
}

export const STATUS_LABEL = {
  pass: 'Closed 5/5',
  rewrite: 'Closed, rewrite owed',
  closed: 'Closed, ungraded',
  slipped: 'Slipped',
  current: 'This week',
  future: 'Ahead',
};
