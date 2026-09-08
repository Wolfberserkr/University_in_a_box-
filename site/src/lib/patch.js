/* The write-back.
 *
 * This page is a working buffer; enrolled/<CODE>.md and REGISTRAR.md are the
 * record. A static page cannot commit, so instead it emits the exact edits -
 * old line, new line - for you to paste, or to hand Claude Code at the Sunday
 * close. Every replacement is built from the row text the parser read out of
 * the file, so an edit that no longer matches is visible rather than silent.
 */
import { getWeek, rubricScore, RUBRIC_IDS } from './store.js';
import { courseMetrics, effectiveTag, isBaselineWeek } from './metrics.js';

const TICK = '☑';
const BOX = '☐';

function replaceLast(row, value) {
  // the board's final column is the Closed checkbox
  const i = row.lastIndexOf(BOX);
  return i === -1 ? row : row.slice(0, i) + value + row.slice(i + 1);
}

function setTagInRow(row, tag) {
  return row.replace(/`\[[VRH]\]`/, '`[' + tag + ']`');
}

function pct(x) {
  return x === null ? '—' : `${Math.round(x * 100)}%`;
}

/* One file's worth of edits. */
function fileBlock(path, edits, notes = []) {
  if (!edits.length && !notes.length) return null;
  return { path, edits, notes };
}

export function buildPatch(data, state, today) {
  const blocks = [];
  const codes = Object.keys(data.enrolled);

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
        section: '§A WEEK BOARD',
        find: row.raw,
        replace: replaceLast(row.raw, TICK),
        why: row.weeks.length > 1
          ? `weeks ${row.label} all closed`
          : `week ${row.label} closed`,
      });
    });

    /* --- §A slipped counter --------------------------------------------- */
    if (m.slipped !== enrolled.slipped) {
      edits.push({
        section: '§A WEEK BOARD',
        find: `**Slipped:** ${enrolled.slipped} / ${enrolled.slipLimit}.`,
        replace: `**Slipped:** ${m.slipped} / ${enrolled.slipLimit}.`,
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
        section: '§B SOURCE LEDGER',
        find: row.raw,
        replace: setTagInRow(row.raw, tag),
        why: `[${row.tag}] → [${tag}]${note ? ` — ${note}` : ''}`,
      });
      if (tag === 'V' && !note) {
        notes.push(`Row ${row.n} promoted to [V] with no record named. The Librarian does not accept that — add what you checked it against before pasting.`);
      }
    });

    /* --- §C GAP LOG: new rows -------------------------------------------- */
    const gaps = state.gaps.filter((g) => g.course === code);
    if (gaps.length) {
      edits.push({
        section: '§C GAP LOG',
        appendTo: '| Wk | Concept | Gap (specific) | Status | Closed by |',
        rows: gaps.map((g) =>
          `| ${g.week || '—'} | ${g.concept || ''} | ${g.gap || ''} | ${g.status === 'closed' ? 'closed' : 'open'} | ${g.closedBy || ''} |`),
        why: `${gaps.length} gap row${gaps.length === 1 ? '' : 's'} logged by the Tutor`,
      });
    }

    /* --- §D VERDICT LOG: new rows ---------------------------------------- */
    const verdicts = m.records
      .filter(({ r }) => r.closed && rubricScore(r).graded > 0)
      .map(({ w, r }) => {
        const s = rubricScore(r);
        const fails = RUBRIC_IDS.filter((id) => r.rubric[id] === 'fail');
        const artifact = (data.termA.weeks[w.n - 1].entries.find((e) => e.code === code) || {}).output || '600w';
        const verdict = s.full ? 'PASS' : 'REWRITE';
        const rewrite = s.full ? '—'
          : isBaselineWeek(code, w.n) ? 'none owed — baseline measured'
          : (r.rewriteDone ? 'done' : 'owed');
        return `| ${w.n} | ${artifact.replace(/\|/g, '/')} | ${s.passes}/5${fails.length ? ` (${fails.join(', ')})` : ''} | ${r.note ? r.note.replace(/\|/g, '/') : '—'} | ${verdict} | ${rewrite} |`;
      });
    if (verdicts.length) {
      edits.push({
        section: '§D VERDICT LOG',
        appendTo: '| Wk | Artifact | Rubric | Recon | Verdict | Rewrite |',
        rows: verdicts,
        why: `${verdicts.length} graded week${verdicts.length === 1 ? '' : 's'}`,
      });
    }

    /* --- §E CROSS-DOMAIN LEDGER ------------------------------------------ */
    const cross = state.cross.filter((c) => c.course === code);
    if (cross.length) {
      edits.push({
        section: '§E CROSS-DOMAIN LEDGER',
        appendTo: '| Wk | Domain | Collided with | Transfer that survived |',
        rows: cross.map((c) => `| ${c.week || '—'} | ${c.domain || ''} | ${c.collidedWith || ''} | ${c.transfer || ''} |`),
        why: 'Roommate collisions — each domain is spent once used',
      });
    }

    const block = fileBlock(`enrolled/${code}.md`, edits, notes);
    if (block) blocks.push(block);
  });

  /* --- REGISTRAR.md ------------------------------------------------------ */
  const regEdits = [];
  const perCourse = codes.map((code) => courseMetrics(data, state, code, today));
  const totalSlipped = perCourse.reduce((s, c) => s + c.slipped, 0);

  data.registrar.enrolment.forEach((row) => {
    const m = perCourse.find((c) => c.code === row.code);
    if (!m) return;
    const current = row.week;
    const reached = Math.min(m.total, Math.max(current, m.closed + 1));
    // both enrolment rows read "| 1 of 14 |", so the whole row is the find target
    if (reached !== current && row.raw) {
      regEdits.push({
        section: 'Enrolment — active',
        find: row.raw,
        replace: row.raw.replace(`| ${current} of ${row.weeks} |`, `| ${reached} of ${row.weeks} |`),
        why: `${row.code}: ${m.closed} week${m.closed === 1 ? '' : 's'} closed`,
      });
    }
  });

  data.registrar.transcript.forEach((row) => {
    const m = perCourse.find((c) => c.code === row.code);
    if (!m || m.attempted === 0) return;
    regEdits.push({
      section: 'Transcript',
      find: row.code,
      replace: `pass rate → ${pct(m.passRate)} (${m.full}/${m.attempted} weeks at 5/5)`,
      why: 'set the "Weekly pass rate" cell on this row',
      cellEdit: true,
    });
  });

  if (totalSlipped !== data.registrar.slippedRecorded) {
    regEdits.push({
      section: 'Standing rules',
      find: `**Slipped weeks:** ${data.registrar.slippedRecorded} across all courses.`,
      replace: `**Slipped weeks:** ${totalSlipped} across all courses.`,
      why: perCourse.filter((c) => c.slipped).map((c) => `${c.code} ${c.slipped}/${c.slipLimit}`).join(' · '),
    });
  }

  const regNotes = [];
  perCourse.filter((c) => c.scopeCut).forEach((c) => {
    regNotes.push(`${c.code} has hit ${c.slipped} slipped weeks. REGISTRAR.md standing rules: the Advisor executes a scope cut in that course and the calendar does not move. Open the Advisor before writing anything else.`);
  });
  perCourse.filter((c) => c.editorSoft).forEach((c) => {
    regNotes.push(`${c.code} is passing at ${pct(c.passRateExBaseline)} across ${c.attempted} graded weeks. REGISTRAR.md: a rate near 100% by week 6 means the Editor has gone soft, and the Advisor should say so.`);
  });

  const regBlock = fileBlock('REGISTRAR.md', regEdits, regNotes);
  if (regBlock) blocks.push(regBlock);

  return blocks;
}

/* Render the blocks as a paste-ready plain-text patch. */
export function patchText(blocks, today) {
  if (!blocks.length) {
    return `# Sunday close — ${today}\n\nNothing to write back. No week closed, no tag moved, no gap logged since the last export.\n`;
  }
  const out = [`# Sunday close — ${today}`, '',
    'Apply these to the repository, which is the record. Each edit shows the line as the',
    'site last read it and the line it should become. If a "find" line no longer matches',
    'the file, the file moved on without the site: re-run `python3 tools/build-site-data.py`',
    'and rebuild before trusting this patch.', ''];

  blocks.forEach((b) => {
    out.push('', `## ${b.path}`, '');
    b.edits.forEach((e) => {
      out.push(`### ${e.section} — ${e.why}`, '');
      if (e.rows) {
        out.push(`Append under:  ${e.appendTo}`);
        e.rows.forEach((r) => out.push(`+ ${r}`));
      } else if (e.cellEdit) {
        out.push(`On the ${e.find} row: ${e.replace}`);
      } else {
        out.push(`- ${e.find}`);
        out.push(`+ ${e.replace}`);
      }
      out.push('');
    });
    b.notes.forEach((n) => out.push(`> ${n}`, ''));
  });
  return out.join('\n');
}
