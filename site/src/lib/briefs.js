/* Per-week agent briefs.
 *
 * The five ALTER agents each bind to a course before they do anything:
 * registrar → active enrolment → course file. That binding is what stops five
 * agents becoming five disconnected chat windows, and it is exactly the part
 * that is tedious to retype every Monday. These briefs carry it, plus the one
 * week's live state, so a session opens already bound.
 */
import { getWeek, rubricScore, RUBRIC_IDS } from './store.js';
import { courseMetrics } from './metrics.js';
import { todayISO } from './calendar.js';

const TASK = {
  advisor: 'Open the week. Read last week\'s gaps (§C) and verdicts (§D) first, then set this week\'s milestone in §A. Refuse anything that unblocks no later week, and price any change against the calendar rather than moving it.',
  librarian: 'Pull one primary and one supporting source for this milestone. Tag every citation [V] or [R] and say which record you checked it against. Do not present a recalled citation as a verified one. Write to §B only.',
  tutor: 'Run the 45-minute oral exam, cold. Sources closed. Open on retrieval — "without looking, what was the argument?" Do not accept "yeah, that makes sense": ask for it back in a form you did not supply, using a case from my own week. Write the specific break point to §C.',
  editor: 'Grade this week\'s output against ASSESSMENT.md Part A. Each criterion is pass/fail, 5/5 or the week is a rewrite; no partial credit, no strong 4. No praise in the first paragraph. Verdict to §D.',
  roommate: 'One cross-domain collision this fortnight. Do not reach for a domain already spent, and check whether the best available collision is between the two live courses before reaching outside. Log to §E.',
};

export function agentBrief({ data, state, agent, code, weekNo, today }) {
  const week = data.termA.weeks[weekNo - 1];
  const entry = week ? week.entries.find((e) => e.code === code) : null;
  const enrolled = data.enrolled[code] || {};
  const course = data.courses.find((c) => c.code === code) || {};
  const rec = getWeek(state, code, weekNo);
  const score = rubricScore(rec);

  const gaps = state.gaps.filter((g) => g.course === code && g.status !== 'closed');
  const lastGraded = data.termA.weeks
    .slice(0, weekNo - 1)
    .map((w) => ({ n: w.n, r: getWeek(state, code, w.n) }))
    .filter(({ r }) => r.closed && rubricScore(r).graded > 0)
    .pop();

  const lines = [
    `You are the ${agent.title} (${agent.letter}) in this program. Bind to the course before anything else.`,
    '',
    `Course:      ${code} — ${course.title}`,
    `State file:  enrolled/${code}.md   ·  definition: catalog/${code}.md  ·  standard: ASSESSMENT.md (locked)`,
    `Term:        ${data.termA.term.label}, week ${weekNo} of ${data.termA.weeks.length}  (${week ? week.start : '?'} → ${week ? week.end : '?'})`,
    `You own:     ${agent.owns}. Write only there.`,
    '',
  ];

  if (entry) {
    lines.push(`Milestone:   ${strip(entry.milestone)}`);
    // strip() keeps the [H]/[V] markers that are already in the source text;
    // appending the parsed tags as well printed each one three times over
    const src = strip(entry.source);
    const missing = (entry.sourceTags || []).filter((t) => !src.includes(`[${t}]`));
    lines.push(`Source:      ${src}${missing.length ? ` ${missing.map((t) => `[${t}]`).join(' ')}` : ''}`);
    lines.push(`Output:      ${strip(entry.output)}`);
    if (entry.unblocks) lines.push(`Unblocks:    ${strip(entry.unblocks)}`);
    lines.push('');
  }

  if (week && week.midterm) lines.push('This is the week-7 MIDTERM: oral, cold, no sources open.', '');
  if (week && week.paper) lines.push('This is week 14: the term paper. Part B criteria apply on top of Part A.', '');

  lines.push(`Open gaps (§C): ${gaps.length ? gaps.map((g) => `${g.concept || 'unnamed'} — ${g.gap || ''}`).join(' | ') : 'none logged'}`);
  lines.push(`Last verdict (§D): ${lastGraded
    ? `week ${lastGraded.n}, ${rubricScore(lastGraded.r).passes}/5${failList(lastGraded.r)}, ${lastGraded.r.verdict || '—'}`
    : 'none yet'}`);
  if (score.graded > 0) {
    lines.push(`This week so far: ${score.passes}/5${failList(rec)}${rec.closed ? ', closed' : ', open'}`);
  }
  // The Advisor is the agent that executes a scope cut and this is the only
  // number that triggers one, so the brief carries the live count. When it has
  // moved ahead of the file, say both - the gap is itself the thing to act on.
  const limit = enrolled.slipLimit ?? 3;
  const recorded = enrolled.slipped ?? 0;
  // Computed here rather than accepted as an argument: the previous version
  // took `metrics` with a null default, no call site passed it, and the brief
  // quietly reported the file's slip count on a page showing a scope cut.
  const live = courseMetrics(data, state, code, today || todayISO()).slipped;
  lines.push(`Slipped in this course: ${live} / ${limit}`
    + (live !== recorded ? ` (REGISTRAR.md still records ${recorded} — the close has not been written back)` : '')
    + `.${live >= limit ? ' That is a scope cut, and the Advisor executes it without renegotiating.' : ''}`
    + ' The calendar does not move.');
  lines.push('', TASK[agent.name]);

  if (agent.name === 'librarian') {
    lines.push('', 'Web search must be on. Without it every source you hand back is [R] and you should say so.');
  }
  if (agent.name === 'editor' && code === 'PSY-101' && weekNo === 1) {
    lines.push('', 'Advisor\'s note for this week: the Priors Sheet will fail A2 and A4 — it cites nothing and gives no magnitudes, because in week 1 the student cannot yet do either. Grade it normally and record the REWRITE. It is logged as baseline measured, not a slipped week. No rewrite is owed and the standard is not amended.');
  }

  return lines.join('\n');
}

function failList(rec) {
  const fails = RUBRIC_IDS.filter((id) => rec.rubric[id] === 'fail');
  return fails.length ? ` (failed ${fails.join(', ')})` : '';
}

function strip(s) {
  return String(s || '').replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim();
}
