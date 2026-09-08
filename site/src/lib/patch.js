/* The write-back.
 *
 * This page is a working buffer; enrolled/<CODE>.md and REGISTRAR.md are the
 * record. A static page cannot commit, so instead it emits the exact edits -
 * old line, new line - for you to paste, or to hand Claude Code at the Sunday
 * close. Every replacement is built from the row text the parser read out of
 * the file, so an edit that no longer matches is visible rather than silent.
 *
 * Two rules the whole file exists to keep:
 *
 *   1. A cell never breaks its table. Every field that reaches an appended row
 *      goes through `cell()`, which escapes pipes and flattens newlines. The
 *      Tutor's gap field is prompted for a sentence, and `p | H0` is a sentence.
 *
 *   2. A row already in the file is never offered again. §C, §D and §E are
 *      appends, so they cannot self-heal the way a checkbox or a tag can: the
 *      patch reconciles what the buffer holds against what the parser last read
 *      out of the file, and emits only the difference. Reconciling against the
 *      file rather than stamping the buffer means it also survives a cleared
 *      localStorage.
 */
import { getWeek, rubricScore, RUBRIC_IDS } from './store.js';
import { courseMetrics, effectiveTag, isBaselineWeek } from './metrics.js';
import { locate } from './calendar.js';

const TICK = '☑';
const BOX = '☐';

/* One table cell, safe to paste into a Markdown row. */
export function cell(s) {
  const t = String(s ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\s*\n+\s*/g, ' ')
    .trim();
  return t || '—';
}

/* Loose match for "is this the same row" - case and spacing are not identity. */
const key = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

function replaceLast(row, value) {
  // the board's final column is the Closed checkbox
  const i = row.lastIndexOf(BOX);
  return i === -1 ? row : row.slice(0, i) + value + row.slice(i + 1);
}

function setTagInRow(row, tag) {
  return row.replace(/`\[[VRH]\]`/, '`[' + tag + ']`');
}

/* Replace the nth (1-based) cell of a Markdown table row, byte-identical
   everywhere else. `| a | b |`.split('|') is ['', ' a ', ' b ', ''], so cell n
   is parts[n]. */
function setCell(raw, n, value) {
  const parts = raw.split('|');
  if (parts.length <= n) return raw;
  parts[n] = ` ${value} `;
  return parts.join('|');
}

function pct(x) {
  return x === null ? '—' : `${Math.round(x * 100)}%`;
}

/* One file's worth of edits. */
function fileBlock(path, edits, notes = []) {
  if (!edits.length && !notes.length) return null;
  return { path, edits, notes };
}

/* An append that has to land under `header`. If the table still holds only its
 * `| — | | |` placeholder, the first row replaces that instead of sitting under
 * a dash row.
 *
 * The find for that replacement is the table's header, divider and placeholder
 * together, never the placeholder alone: §C's `| — | | | | |` is a substring of
 * §D's `| — | | | | | |`, so a find-and-replace on the short line edits whichever
 * table comes first in the file. `placeholder` arrives from the parser as those
 * three lines verbatim.
 */
function appendEdit({ section, header, placeholder, rows, why }) {
  if (!rows.length) return null;
  if (placeholder) {
    const keep = placeholder.split('\n').slice(0, -1);   // header + divider
    return {
      kind: 'replace', section, why,
      find: placeholder,
      replace: [...keep, rows[0]].join('\n'),
      appendTo: header, rows: rows.slice(1),
    };
  }
  return { kind: 'append', section, why, appendTo: header, rows };
}

export function buildPatch(data, state, today) {
  const blocks = [];
  const codes = Object.keys(data.enrolled);
  const here = locate(data.termA.weeks, today);

  codes.forEach((code) => {
    const enrolled = data.enrolled[code];
    const m = courseMetrics(data, state, code, today);
    const edits = [];
    const notes = [];

    /* --- §A WEEK BOARD: closed checkboxes ------------------------------- */
    enrolled.board.forEach((row) => {
      const allClosed = row.weeks.every((n) => getWeek(state, code, n).closed);
      if (!allClosed || !row.raw.includes(BOX)) return;
      edits.push({
        kind: 'line',
        section: '§A WEEK BOARD',
        find: row.raw,
        replace: replaceLast(row.raw, TICK),
        why: row.weeks.length > 1
          ? `weeks ${row.label} all closed`
          : `week ${row.label} closed`,
      });
    });

    /* --- §A slipped counter --------------------------------------------- */
    if (m.slipped !== enrolled.slipped && enrolled.slippedRaw) {
      edits.push({
        kind: 'line',
        section: '§A WEEK BOARD',
        find: enrolled.slippedRaw,
        replace: enrolled.slippedRaw.replace(
          `**Slipped:** ${enrolled.slipped} / ${enrolled.slipLimit}`,
          `**Slipped:** ${m.slipped} / ${enrolled.slipLimit}`),
        why: m.scopeCut
          ? `${m.slipped} slips — the Advisor executes a scope cut in this course, and the calendar does not move`
          : `weeks ${m.slippedWeeks.join(', ')} passed their Sunday still open`,
      });
    }

    /* --- §B SOURCE LEDGER: tag promotions -------------------------------- */
    (enrolled.ledger || []).forEach((row) => {
      const tag = effectiveTag(state, row);
      if (tag === row.tag || !row.raw) return;
      const note = state.tagNotes[row.id];
      edits.push({
        kind: 'line',
        section: '§B SOURCE LEDGER',
        find: row.raw,
        replace: setTagInRow(row.raw, tag),
        why: `[${row.tag}] → [${tag}]${note ? ` — ${note}` : ''}`,
      });
      if (tag === 'V' && !note) {
        notes.push(`Row ${row.n} promoted to [V] with no record named. The Librarian does not accept that — add what you checked it against before pasting.`);
      }
    });

    /* --- §C GAP LOG ------------------------------------------------------ */
    const filedGaps = enrolled.gaps || [];
    const gapKey = (g) => `${g.week || '—'}|${key(g.concept)}`;
    const filedGapBy = new Map(filedGaps.map((g) => [gapKey(g), g]));
    const gapRow = (g) =>
      `| ${cell(g.week || '—')} | ${cell(g.concept)} | ${cell(g.gap)} | `
      + `${g.status === 'closed' ? 'closed' : 'open'} | ${cell(g.closedBy)} |`;

    const newGaps = [];
    state.gaps.filter((g) => g.course === code).forEach((g) => {
      const filed = filedGapBy.get(gapKey(g));
      if (!filed) { newGaps.push(g); return; }
      // already in the file: only a changed status is worth an edit, and it is
      // a replacement of that row rather than a second copy of it
      const filedStatus = key(filed.status).includes('closed') ? 'closed' : 'open';
      const now = g.status === 'closed' ? 'closed' : 'open';
      if (filedStatus !== now && filed.raw) {
        edits.push({
          kind: 'line',
          section: '§C GAP LOG',
          find: filed.raw,
          replace: gapRow({ ...filed, ...g }),
          why: `${g.concept}: ${filedStatus} → ${now}`,
        });
      }
    });
    const gapAppend = appendEdit({
      section: '§C GAP LOG',
      header: enrolled.gapsHeader,
      placeholder: enrolled.gapsPlaceholder,
      rows: newGaps.map(gapRow),
      why: `${newGaps.length} gap row${newGaps.length === 1 ? '' : 's'} not yet in the file`,
    });
    if (gapAppend) edits.push(gapAppend);

    /* --- §D VERDICT LOG -------------------------------------------------- */
    const filedVerdicts = new Map((enrolled.verdicts || []).map((v) => [v.week, v]));
    const newVerdicts = [];
    m.records
      .filter(({ r }) => r.closed && rubricScore(r).graded > 0)
      .forEach(({ w, r }) => {
        const s = rubricScore(r);
        const fails = RUBRIC_IDS.filter((id) => r.rubric[id] === 'fail');
        const entry = (data.termA.weeks[w.n - 1].entries.find((e) => e.code === code) || {});
        const verdict = s.full ? 'PASS' : 'REWRITE';
        const rewrite = s.full ? '—'
          : isBaselineWeek(code, w.n) ? 'none owed — baseline measured'
          : (r.rewriteDone ? 'done' : 'owed');
        const filed = filedVerdicts.get(w.n);
        if (filed) {
          if (key(filed.verdict) !== key(verdict)) {
            notes.push(`Week ${w.n} is recorded in §D as ${filed.verdict || '—'} and this browser now grades it ${verdict}. The Editor's verdict is the record: change it in the file deliberately, or reopen and regrade here. No edit is offered for it.`);
          }
          return;
        }
        newVerdicts.push(
          `| ${w.n} | ${cell(entry.output || '600w')} | `
          + `${s.passes}/5${fails.length ? ` (${fails.join(', ')})` : ''} | `
          + `${cell(r.note)} | ${verdict} | ${cell(rewrite)} |`);
      });
    const verdictAppend = appendEdit({
      section: '§D VERDICT LOG',
      header: enrolled.verdictsHeader,
      placeholder: enrolled.verdictsPlaceholder,
      rows: newVerdicts,
      why: `${newVerdicts.length} graded week${newVerdicts.length === 1 ? '' : 's'} not yet in the file`,
    });
    if (verdictAppend) edits.push(verdictAppend);

    /* --- §E CROSS-DOMAIN LEDGER ------------------------------------------ */
    const crossKey = (c) => `${c.week || '—'}|${key(c.domain)}`;
    const filedCross = new Set((enrolled.crossDomain || []).map(crossKey));
    const newCross = state.cross
      .filter((c) => c.course === code && !filedCross.has(crossKey(c)));
    const crossAppend = appendEdit({
      section: '§E CROSS-DOMAIN LEDGER',
      header: enrolled.crossHeader,
      placeholder: enrolled.crossPlaceholder,
      rows: newCross.map((c) =>
        `| ${cell(c.week || '—')} | ${cell(c.domain)} | ${cell(c.collidedWith)} | ${cell(c.transfer)} |`),
      why: 'Roommate collisions — each domain is spent once used',
    });
    if (crossAppend) edits.push(crossAppend);

    const block = fileBlock(`enrolled/${code}.md`, edits, notes);
    if (block) blocks.push(block);
  });

  /* --- REGISTRAR.md ------------------------------------------------------ */
  const regEdits = [];
  const perCourse = codes.map((code) => courseMetrics(data, state, code, today));
  const totalSlipped = perCourse.reduce((s, c) => s + c.slipped, 0);

  /* The "Week" column is a position in the calendar, not a count of finished
     work - REGISTRAR.md is what every agent reads first to find out where it
     is. The slipped counter above carries how much is missing. */
  const calendarWeek = here.week ? here.week.n
    : here.phase === 'post' ? data.termA.weeks.length : 1;

  data.registrar.enrolment.forEach((row) => {
    const m = perCourse.find((c) => c.code === row.code);
    if (!m) return;
    const reached = Math.min(row.weeks, Math.max(1, calendarWeek));
    if (reached !== row.week && row.raw) {
      regEdits.push({
        kind: 'line',
        section: 'Enrolment — active',
        find: row.raw,
        replace: row.raw.replace(`| ${row.week} of ${row.weeks} |`, `| ${reached} of ${row.weeks} |`),
        why: `${row.code}: the calendar is at week ${reached}${m.slipped ? ` (${m.slipped} slipped, counted above)` : ''}`,
      });
    }
  });

  /* One edit per transcript row.
   *
   * The pass-rate cell and the Result cell sit on the same line, so emitting
   * them as two edits built from the same `row.raw` makes the second find stale
   * the instant the first is applied: the "complete" edit is then dropped in
   * silence, and the credits line counts a course the table still calls in
   * progress. Both cell changes are composed onto one line and compared once.
   *
   * Pass rate excludes PSY-101 week 1: the Priors Sheet is expected to fail A2
   * and A4, enrolled/PSY-101.md logs it as baseline measured, and the transcript
   * is permanent. Naming the exclusion in the cell keeps the diagnostic honest.
   */
  const isComplete = (m) =>
    m.closed >= m.total && rubricScore(getWeek(state, m.code, m.total)).full;

  /* A course the file already records as complete is finished business.
     Counting it again is how the credits line walks up by three every Sunday
     for the rest of the year - the same failure the §C/§D/§E dedupe exists to
     prevent, one table lower down. */
  const newlyComplete = perCourse.filter((m) => {
    if (!isComplete(m)) return false;
    const row = data.registrar.transcript.find((t) => t.code === m.code);
    return !!row && !/complete/i.test(row.result || '');
  });

  data.registrar.transcript.forEach((row) => {
    const m = perCourse.find((c) => c.code === row.code);
    if (!m || !row.raw) return;
    let next = row.raw;
    const reasons = [];

    const graded = m.attempted - (isBaselineWeek(row.code, 1) && m.attempted ? 1 : 0);
    if (m.passRateExBaseline !== null && graded > 0) {
      const excl = m.attempted !== graded ? '; wk 1 excluded — baseline measured' : '';
      const value = `${pct(m.passRateExBaseline)} (${m.exBaselineFull}/${graded} graded${excl})`;
      next = setCell(next, 6, value);
      reasons.push('weekly pass rate');
    }
    if (newlyComplete.includes(m)) {
      next = setCell(next, 8, '**complete**');
      reasons.push('14 weeks closed and the week-14 paper at 5/5');
    }

    if (next === row.raw) return;
    regEdits.push({
      kind: 'line',
      section: 'Transcript',
      find: row.raw,
      replace: next,
      why: `${row.code}: ${reasons.join(' · ')}`,
    });
  });

  const c = data.registrar.credits;
  if (newlyComplete.length && c.raw) {
    const credits = c.earned + newlyComplete.length * c.perCourse;
    const courses = c.coursesComplete + newlyComplete.length;
    const replace = c.raw
      .replace(`**Credits earned:** ${c.earned} / ${c.total}`,
               `**Credits earned:** ${credits} / ${c.total}`)
      .replace(`**Courses complete:** ${c.coursesComplete} / ${c.coursesPlanned}`,
               `**Courses complete:** ${courses} / ${c.coursesPlanned}`);
    if (replace !== c.raw) {
      regEdits.push({
        kind: 'line',
        section: 'Transcript',
        find: c.raw,
        replace,
        why: `${newlyComplete.map((m) => m.code).join(' · ')} complete — ${c.perCourse} credits each`,
      });
    }
  }

  if (totalSlipped !== data.registrar.slippedRecorded && data.registrar.slippedRaw) {
    regEdits.push({
      kind: 'line',
      section: 'Standing rules',
      find: data.registrar.slippedRaw,
      replace: data.registrar.slippedRaw.replace(
        `**Slipped weeks:** ${data.registrar.slippedRecorded} across all courses.`,
        `**Slipped weeks:** ${totalSlipped} across all courses.`),
      why: perCourse.filter((x) => x.slipped).map((x) => `${x.code} ${x.slipped}/${x.slipLimit}`).join(' · '),
    });
  }

  const regNotes = [];
  /* One note per rule, naming every course it fires for. The same 40 words
     twice, differing only in a course code, is the duplication the callout
     stack exists to prevent - and this is the page where it is loudest. */
  const cut = perCourse.filter((x) => x.scopeCut);
  if (cut.length) {
    regNotes.push(`${cut.map((x) => `${x.code} ${x.slipped}/${x.slipLimit}`).join(' · ')}. `
      + 'REGISTRAR.md standing rules: three slips in one course triggers a scope cut in that '
      + 'course, the Advisor executes it without renegotiating, and the calendar does not move. '
      + 'Open the Advisor before writing anything else.');
  }

  perCourse.filter((x) => x.editorSoft).forEach((x) => {
    regNotes.push(`${x.code} is passing at ${pct(x.passRateExBaseline)} across ${x.attempted} graded weeks. REGISTRAR.md: a rate near 100% by week 6 means the Editor has gone soft, and the Advisor should say so.`);
  });

  const regBlock = fileBlock('REGISTRAR.md', regEdits, regNotes);
  if (regBlock) blocks.push(regBlock);

  return blocks;
}

/* Render the blocks as a paste-ready plain-text patch. `only` narrows it to one
   file, which is what the per-file copy buttons hand over. */
export function patchText(blocks, today, only = null) {
  const list = only ? blocks.filter((b) => b.path === only) : blocks;
  if (!list.length) {
    return `# Sunday close — ${today}\n\nNothing to write back. No week closed, no tag moved, no gap logged that the repository does not already have.\n`;
  }
  const out = [`# Sunday close — ${today}`, '',
    'Apply these to the repository, which is the record. Each edit shows the line as the',
    'site last read it and the line it should become. If a "find" line no longer matches',
    'the file, the file moved on without the site: re-run `python3 tools/build-site-data.py`',
    'and rebuild before trusting this patch.', ''];

  list.forEach((b) => {
    out.push('', `## ${b.path}`, '');
    b.edits.forEach((e) => {
      out.push(`### ${e.section} — ${e.why}`, '');
      if (e.find) {
        // a find may span several lines (a table header, its divider and the
        // placeholder row) - prefix every one of them, so the block stays
        // copy-pasteable as a unit
        String(e.find).split('\n').forEach((l) => out.push(`- ${l}`));
        String(e.replace).split('\n').forEach((l) => out.push(`+ ${l}`));
      }
      if (e.rows && e.rows.length) {
        out.push(`Append under:  ${e.appendTo}`);
        e.rows.forEach((r) => out.push(`+ ${r}`));
      }
      out.push('');
    });
    b.notes.forEach((n) => out.push(`> ${n}`, ''));
  });
  return out.join('\n');
}

/* Does this patch contradict itself?
 *
 * Two edits built from the same line is how the transcript's "complete" cell
 * was silently dropped: apply the first and the second's find no longer exists.
 * A find that is a substring of another is how §C's placeholder edited §D. Both
 * are visible from the patch alone, without the file, so the page checks its own
 * output before offering it rather than waiting for the repository to be wrong.
 */
export function auditPatch(blocks) {
  const problems = [];
  blocks.forEach((b) => {
    const finds = b.edits.filter((e) => e.find).map((e) => ({ find: String(e.find), why: e.why }));

    finds.forEach((a, i) => {
      finds.slice(i + 1).forEach((c) => {
        if (a.find === c.find) {
          problems.push(`${b.path}: two edits target the same line — "${a.why}" and "${c.why}". `
            + 'Applying the first would make the second impossible to find.');
        } else if (a.find.includes(c.find) || c.find.includes(a.find)) {
          const [inner, outer] = a.find.includes(c.find) ? [c, a] : [a, c];
          problems.push(`${b.path}: the find for "${inner.why}" is contained in the find for `
            + `"${outer.why}", so a plain find-and-replace could edit the wrong one.`);
        }
      });
    });

    const headers = b.edits.filter((e) => e.rows && e.rows.length).map((e) => String(e.appendTo));
    headers.forEach((h, i) => {
      if (headers.indexOf(h) !== i) {
        problems.push(`${b.path}: two appends share the header ${h} — merge them into one block.`);
      }
    });
  });
  return problems;
}

export function patchSummary(blocks) {
  const edits = blocks.reduce((n, b) => n + b.edits.length, 0);
  const rows = blocks.reduce((n, b) => n + b.edits.reduce((m, e) => m + ((e.rows && e.rows.length) || 0), 0), 0);
  return { files: blocks.length, edits, rows, problems: auditPatch(blocks) };
}
