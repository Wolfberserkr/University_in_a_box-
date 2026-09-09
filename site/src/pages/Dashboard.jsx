import React, { useMemo, useState } from 'react';
import { useStore } from '../lib/store.js';
import { locate, fmtRange, daysBetween, fmt } from '../lib/calendar.js';
import {
  courseMetrics, ledgerMetrics, gapMetrics, setupMetrics, creditMetrics,
  termProgress, acquireQueue, passRateBand, TAG_LABEL,
} from '../lib/metrics.js';
import {
  Card, Tile, Callout, CalloutStack, Tag, Chip, StackedBar, Copy, courseKind,
} from '../components/ui.jsx';
import WeekStrip from '../components/WeekStrip.jsx';
import { MdInline } from '../lib/markdown.jsx';
import { agentBrief } from '../lib/briefs.js';

const TAG_ORDER = ['H', 'V', 'R'];

function pct(x) { return x === null ? '—' : `${Math.round(x * 100)}%`; }

export default function Dashboard() {
  const { data, state, today } = useStore();
  const weeks = data.termA.weeks;
  const codes = useMemo(() => Object.keys(data.enrolled), [data]);
  const here = locate(weeks, today, data.registrar.terms);

  const courses = useMemo(() => codes.map((c) => courseMetrics(data, state, c, today)),
    [data, state, today, codes]);
  const ledgers = useMemo(() => codes.map((c) => ledgerMetrics(data, state, c)),
    [data, state, codes]);
  const gaps = gapMetrics(state);
  const setup = useMemo(() => setupMetrics(data, state), [data, state]);
  const credits = creditMetrics(data, state, courses);
  const progress = termProgress(courses);

  const totalH = ledgers.reduce((s, l) => s + l.counts.H, 0);
  const totalRows = ledgers.reduce((s, l) => s + l.total, 0);
  const maxLedger = Math.max(...ledgers.map((l) => l.total), 1);
  const totalSlipped = courses.reduce((s, c) => s + c.slipped, 0);
  const rewrites = courses.flatMap((c) => c.rewritesOwed.map((n) => ({ code: c.code, n })));
  const queue = acquireQueue(data, state,
    here.week ? here.week.n : here.phase === 'post' ? weeks.length : 1);
  const scopeCuts = courses.filter((c) => c.scopeCut);
  const soft = courses.filter((c) => c.editorSoft);
  const rate = passRateBand(courses);
  const hours = courses.reduce((s, c) => s + c.hours, 0);

  const open = setup.steps.filter((st) => !(state.setup[st.n] || st.done));
  const priorsOpen = open.some((st) => /priors/i.test(st.title));

  const access = data.registrar.accessCheck;
  const accessDays = access && access.date ? daysBetween(today, access.date) : null;
  // Owed before a named block. Once that block has started the question is
  // settled one way or the other, so the countdown stops rather than shouting
  // "264 days overdue" under a masthead reading "programme complete".
  const accessBlock = access && access.term
    ? data.registrar.terms.find((t) => t.label && t.label.includes(access.term))
    : null;
  const accessMoot = !!(accessBlock && accessBlock.start && today > accessBlock.start);
  const accessDue = access && access.date && accessDays <= 70 && !accessMoot;
  const accessLate = accessDue && accessDays <= 0;

  /* The first morning. Six tiles reading zero and twenty-eight dashed squares
     is not a briefing, it is an empty database. Until something is closed, the
     page opens with the one thing that is true on day one: here is the week,
     here is what each course wants, and here is the step that cannot be
     recovered if it is done in the wrong order. */
  const firstMorning = here.phase !== 'post' && progress.closed === 0
    && courses.every((c) => c.attempted === 0);

  return (
    <>
      <div className="page-head">
        <h2>{here.phase === 'pre'
          ? `Term A opens in ${daysBetween(today, weeks[0].start)} days`
          : here.phase === 'in'
            ? `Week ${here.week.n} of ${weeks.length}`
            : 'Term A is over'}</h2>
        <p>
          {here.phase === 'pre'
            ? <>Nothing is late. {setup.done} of {setup.total} setup steps are done, and the
              only thing that cannot be recovered later is the Priors Sheet.{' '}
              <a href="#/now">What to do before Monday →</a></>
            : here.phase === 'in'
              ? <>{fmtRange(here.week.start, here.week.end)} · {here.weekday}.{' '}
                <a href="#/now">Today's work →</a></>
              : <>Fourteen weeks closed on {fmt(weeks[weeks.length - 1].end)}. What the
                transcript records is on the <a href="#/program">programme page</a>.</>}
        </p>
      </div>

      {/* ---------- things that need a decision, most severe first ---------- */}

      <CalloutStack>
        {here.phase === 'in' && scopeCuts.length > 0 && (
          <Callout key="cut" kind="bad" icon="!"
                   title={`Scope cut triggered — ${scopeCuts.map((c) => c.code).join(' and ')}`}>
            <p>{scopeCuts.map((c) => `${c.code} ${c.slipped}/${c.slipLimit}`).join(' · ')}.
              REGISTRAR.md standing rules: three slips in one course triggers a scope cut in
              that course, and the Advisor executes it without renegotiating. <strong>The calendar
              does not move.</strong> Open the Advisor before you write anything else.</p>
          </Callout>
        )}

        {here.phase === 'in' && soft.length > 0 && (
          <Callout key="soft" kind="warn" icon="?"
                   title={`Check the Editor — ${soft.map((c) => `${c.code} at ${pct(c.passRateExBaseline)}`).join(', ')}`}>
            <p>A pass rate near 100% by week 6 means the Editor has drifted toward the standard
              you argued for in the moment, which is the specific thing it is bad at. That is why{' '}
              <code>ASSESSMENT.md</code> is locked and dated before week 1. The Advisor should say so.</p>
          </Callout>
        )}

        {here.phase === 'in' && totalSlipped > 0 && scopeCuts.length === 0 && (
          <Callout key="slip" kind="warn" icon="!"
                   title={`${totalSlipped} slipped week${totalSlipped === 1 ? '' : 's'}`}>
            <p>{courses.filter((c) => c.slipped).map((c) =>
              `${c.code}: week${c.slippedWeeks.length === 1 ? '' : 's'} ${c.slippedWeeks.join(', ')} (${c.slipped}/${c.slipLimit})`).join(' · ')}.
              A week with no output is a slipped week — the output is not a record of the learning, it is the learning.</p>
          </Callout>
        )}

        {rewrites.length > 0 && (
          <Callout key="rw" kind="warn" icon="↻"
                   title={`${rewrites.length} rewrite${rewrites.length === 1 ? '' : 's'} owed`}>
            <p>{rewrites.map((r) => `${r.code} week ${r.n}`).join(' · ')}. 5/5 or the week is a
              rewrite — there is no partial credit and no strong 4.</p>
          </Callout>
        )}

        {here.phase === 'pre' && open.length > 0 && (
          <Callout key="setup" kind="info" icon="→"
                   title={`${open.length} setup step${open.length === 1 ? '' : 's'} left before Monday`}>
            <p>
              {open.map((st) => `${st.n}. ${st.title}`).join(' · ')}.
              {' '}{priorsOpen
                ? 'The Priors Sheet is the one with an order dependency you cannot undo: the moment you open a Term A source, that measurement is gone for good.'
                : 'The Priors Sheet is written and sealed, so nothing left here is order-dependent — but the seal only holds while no Term A source is opened.'}
              {' '}<a href="#/now">Open the checklist →</a></p>
          </Callout>
        )}

        {accessDue && (
          <Callout key="access" kind={accessLate ? 'bad' : accessDays <= 14 ? 'warn' : 'info'} icon="◷"
                   title={accessLate
                     ? `Access check is ${Math.abs(accessDays)} day${Math.abs(accessDays) === 1 ? '' : 's'} overdue — it was owed before ${access.term}`
                     : `Access check owed in ${accessDays} days — before ${access.term}`}>
            <p>{access.why} <a href="#/program">Standing rules →</a></p>
          </Callout>
        )}
      </CalloutStack>

      {/* ------------------------- the first morning ------------------------ */}

      {firstMorning ? (
        <FirstMorning here={here} setup={setup} />
      ) : (
        <div className="tiles">
          <Tile label="Course-weeks closed" value={progress.closed} of={progress.total}
                meter={progress.fraction}
                note={`${weeks.length} weeks × ${codes.length} courses`} />
          <Tile label="Pass rate" value={pct(rate.rate)} state={rate.state}
                note={rate.attempted
                  ? `${rate.full} of ${rate.attempted} graded weeks at 5/5 · a diagnostic, not a grade`
                  : 'no week graded yet'} />
          <Tile label={here.phase === 'post' ? 'Weeks that slipped' : 'Slipped weeks'} value={totalSlipped}
                state={here.phase === 'post' || totalSlipped === 0 ? undefined
                  : scopeCuts.length ? 'bad' : 'warn'}
                note={totalSlipped === 0
                  ? 'nothing late · three in one course cuts scope'
                  : courses.map((c) => `${c.code} ${c.slipped}/${c.slipLimit}`).join(' · ')} />
          <Tile label="Sources in hand" value={totalH} of={totalRows}
                meter={totalRows ? totalH / totalRows : 0}
                note="[H] — in NotebookLM, the citation authority" />
          <Tile label="Open gaps" value={gaps.open}
                state={gaps.open > 4 ? 'warn' : undefined}
                note={gaps.closed ? `${gaps.closed} closed cold` : 'logged by the Tutor'} />
          <Tile label="Credits" value={credits.earnedRecorded} of={credits.totalPlanned}
                meter={credits.totalPlanned ? credits.earnedRecorded / credits.totalPlanned : 0}
                sub={credits.projected !== credits.earnedRecorded
                  ? `${credits.projected} projected from this browser`
                  : undefined}
                note={`recorded in REGISTRAR.md · Certificate needs ${credits.certificateNeeds} courses`} />
        </div>
      )}

      {/* ---------------------------- the week strip ----------------------- */}

      <Card title="Term A, week by week">
        <WeekStrip />
      </Card>

      <div className="grid grid-2">
        {/* ------------------------- source ledger ------------------------- */}
        <Card title="Source ledger health">
          {ledgers.map((l) => (
            <StackedBar key={l.code} label={l.code} counts={l.counts}
                        order={TAG_ORDER} total={l.total} scaleTo={maxLedger}
                        labels={TAG_LABEL} />
          ))}
          <p className="legend">
            <span><i className="swatch swatch-H" />[H] in hand</span>
            <span><i className="swatch swatch-V" />[V] verified</span>
            <span><i className="swatch swatch-R" />[R] recalled</span>
            <span className="dim">tracks are to scale against the longer ledger</span>
          </p>
          <p className="small">A tag is a claim about what you have actually done with a source.
            The Librarian is the weakest of the five agents and this ratio is the reason — nothing
            gets read from an untagged row. <a href="#/sources">Full ledger →</a></p>
        </Card>

        {/* --------------------------- acquire ----------------------------- */}
        {/* After the term, nothing is "due within four weeks" - what is left is
            what the term closed without. Saying it the other way makes September
            sources read as this month's work. */}
        <Card title={`To get${queue.length
          ? here.phase === 'post'
            ? ` — ${queue.length} never acquired before the term closed`
            : ` — ${queue.length} due within four weeks`
          : ''}`}>
          {queue.length === 0 ? (
            <p className="small">Nothing outstanding inside the next four weeks. Buy what the
              current three weeks need and nothing further: a folder of sixty unread PDFs by
              month nine is the specific way this year fails.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Wk</th><th>Source</th><th>Tag</th><th>Course</th></tr></thead>
                <tbody>
                  {queue.slice(0, 8).map((row) => (
                    <tr key={row.id}>
                      <td className="nowrap">{row.wk}{row.due <= 0 ? ' ⚠' : ''}</td>
                      <td>{row.source.replace(/[*`]/g, '')}</td>
                      <td><Tag tag={row.tag} /></td>
                      <td><Chip kind={courseKind(row.code)}>{row.code}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ---------------------------- per course --------------------------- */}

      <div className="grid grid-2">
        {courses.map((c) => {
          const course = data.courses.find((x) => x.code === c.code);
          return (
            <Card key={c.code} title={`${c.code} — ${course.title}`}>
              <div className="tiles" style={{ marginBottom: '.6rem' }}>
                <Tile label="Closed" value={c.closed} of={c.total} meter={c.closed / c.total} />
                <Tile label="At 5/5" value={c.exBaselineFull} of={c.exBaselineAttempted || 0}
                      note={c.exBaselineAttempted ? `${pct(c.passRateExBaseline)} of graded weeks` : 'not graded yet'} />
                <Tile label="Slipped" value={c.slipped} of={c.slipLimit}
                      state={c.slipped === 0 ? undefined : c.scopeCut ? 'bad' : 'warn'} />
              </div>
              <p className="small">
                Level {course.level} · {course.credits} credits · {course.load}
                {c.hours > 0 && ` · ${c.hours} h logged`}
                {' · '}<a href={`#/courses/${c.code}`}>course file →</a>
              </p>
            </Card>
          );
        })}
      </div>

      {/* ------------------------------ the year --------------------------- */}

      <Card title="The year">
        <div className="table-scroll">
          <table>
            <thead><tr><th>Block</th><th>Weeks</th><th>Dates</th><th>Enrolled</th><th>State</th></tr></thead>
            <tbody>
              {data.registrar.terms.map((t, i) => {
                const started = t.start && t.start <= today;
                const done = t.end && t.end < today;
                return (
                  <tr key={i} className={started && !done ? 'is-now' : undefined}>
                    <td className="nowrap">{t.label}</td>
                    <td className="nowrap">{t.weeks}</td>
                    <td className="nowrap">{t.dates}</td>
                    <td>{t.enrolled.map((c) => (
                      <React.Fragment key={c}><Chip kind={courseKind(c)}>{c}</Chip>{' '}</React.Fragment>
                    ))}</td>
                    <td className="nowrap dim">{done ? 'closed' : started ? 'running' : 'ahead'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="small">
          {credits.coursesComplete} of {credits.coursesPlanned} courses complete ·
          Certificate needs {credits.certificateNeeds}, so the year carries one course of slack
          against a bad term. <a href="#/program">Credit accounting and the four honest gaps →</a>
        </p>
      </Card>

      {hours > 0 && (
        <Card title="Hours logged against capacity">
          <HoursChart data={data} state={state} codes={codes} courses={courses} today={today} />
        </Card>
      )}
    </>
  );
}

/* ------------------------------------------------------------------------- */

/* Day one, or any morning before anything has been graded. One card, both
   milestones, one primary move — and the Advisor brief already bound to the
   course, which is the thing you actually have to do first on a Monday. */
function FirstMorning({ here, setup }) {
  const { data, state, today } = useStore();
  // Before week 1 there is no current week, and the week that matters is the
  // one about to open: the same card, read as a countdown instead of a day.
  const pre = here.phase === 'pre';
  const week = here.week || data.termA.weeks[0];
  const days = pre ? daysBetween(today, week.start) : 0;
  const advisor = data.agents.find((a) => a.name === 'advisor');
  const [copyFor, setCopyFor] = useState(week.entries[0] ? week.entries[0].code : null);
  const owed = setup.steps.filter((s) => !s.done);

  return (
    <Card
      title={pre
        ? `Week ${week.n} opens in ${days} day${days === 1 ? '' : 's'} · ${fmt(week.start)}`
        : `Week ${week.n} · ${here.weekday} · nothing closed yet`}
      className="first-morning">
      <p className="fm-lede">
        {pre
          ? 'Two courses, one milestone each, and nothing has started. There is no number on this page worth reading yet — there is what the first week wants, and the steps that have to happen before it.'
          : 'Two courses, one milestone each. Nothing is late and nothing is graded, so there is no number on this page worth reading yet — there is only the week.'}
      </p>
      <ol className="fm-list">
        {week.entries.map((entry) => (
          <li key={entry.code} className={courseKind(entry.code)}>
            <p className="fm-code">{entry.code}</p>
            <p className="fm-ms"><MdInline md={entry.milestone} /></p>
            <p className="fm-meta">
              Source: <MdInline md={entry.source} /> · Output: <MdInline md={entry.output} />
            </p>
          </li>
        ))}
      </ol>
      <div className="btn-row">
        <Copy className="btn btn-primary"
              text={agentBrief({ data, state, agent: advisor, code: copyFor, weekNo: week.n })}
              label={`Copy the Advisor brief for ${copyFor}`} />
        {week.entries.length > 1 && (
          <span className="fm-switch">
            {week.entries.map((e) => (
              <button key={e.code} type="button" className="btn btn-sm"
                      aria-pressed={copyFor === e.code}
                      onClick={() => setCopyFor(e.code)}>{e.code}</button>
            ))}
          </span>
        )}
        <a className="btn right" href="#/now">Today, hour by hour →</a>
      </div>
      {owed.length > 0 && (
        <p className="small fm-owed">
          Still open from the setup list: {owed.map((s) => s.title).join(' · ')}.{' '}
          {owed.some((s) => /priors/i.test(s.title))
            ? <strong>The Priors Sheet is the one that cannot be recovered — write it before you open a source.</strong>
            : <a href="#/now">Open the checklist →</a>}
        </p>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------------- */

/* Hours per week, stacked by course, against the capacity band DEGREE.md spends
   four hundred words establishing. The band is the point of the chart: the
   question is not "how many hours" but "did this week fit". Axis steps are
   whole hours by construction; the window stops two weeks past the present so
   the plot is not two thirds reserved for weeks that have not happened. */
function HoursChart({ data, codes, courses, today }) {
  const [hover, setHover] = useState(null);
  const [table, setTable] = useState(false);
  const weeks = data.termA.weeks;
  const band = data.registrar.capacityBand;

  const byWeek = weeks.map((w) => {
    const vals = {};
    codes.forEach((code) => {
      const rec = courses.find((c) => c.code === code).records.find((r) => r.w.n === w.n);
      vals[code] = parseFloat(rec.r.hours) || 0;
    });
    return { n: w.n, w, vals, total: Object.values(vals).reduce((a, b) => a + b, 0) };
  });

  const lastLogged = byWeek.filter((b) => b.total > 0).map((b) => b.n).pop() || 1;
  const elapsed = weeks.filter((w) => w.end < today).length;
  const shown = byWeek.slice(0, Math.min(weeks.length, Math.max(lastLogged, elapsed) + 2));

  const STEP = 4;
  const raw = Math.max(band ? band.high : 12, ...shown.map((b) => b.total));
  const max = Math.ceil(raw / STEP) * STEP;
  const ticks = [];
  for (let v = 0; v <= max; v += STEP) ticks.push(v);

  const W = 700; const H = 168; const pad = { l: 30, r: 62, t: 10, b: 26 };
  const bw = (W - pad.l - pad.r) / shown.length;
  const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const colour = { 'PSY-101': 'var(--series-psy)', 'STA-101': 'var(--series-sta)' };
  const hovered = hover === null ? null : shown.find((b) => b.n === hover);

  /* A stacked segment is rounded where the data ends and square where it meets
     the segment below, so the join has no pinch and the baseline stays flat. */
  const seg = (x, top, h, w, roundTop) => {
    const r = roundTop ? Math.min(3, h / 2, w / 2) : 0;
    if (!r) return `M${x} ${top}h${w}v${h}h${-w}z`;
    return `M${x} ${top + r}a${r} ${r} 0 0 1 ${r} ${-r}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - r}h${-w}z`;
  };

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
           onMouseLeave={() => setHover(null)}
           aria-label={`Hours logged per week against a capacity of ${band ? `${band.low} to ${band.high} hours` : 'the stated weekly hours'}. ${shown.filter((b) => b.total).map((b) => `week ${b.n}: ${b.total} hours`).join('; ')}`}>
        {band && (
          <g>
            <rect className="band" x={pad.l} width={W - pad.l - pad.r}
                  y={y(band.high)} height={Math.max(0, y(band.low) - y(band.high))} />
            <text className="axis band-label" x={W - pad.r + 6} y={(y(band.low) + y(band.high)) / 2 + 3}>
              {band.low}–{band.high} h capacity
            </text>
          </g>
        )}
        {ticks.map((v) => (
          <g key={v}>
            <line className="grid-line" x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} />
            <text className="axis" textAnchor="end" x={pad.l - 6} y={y(v) + 3}>{v}</text>
          </g>
        ))}
        <text className="axis axis-unit" textAnchor="end" x={pad.l - 6} y={pad.t - 2}>h</text>

        {shown.map((b, i) => {
          let stackY = y(0);
          const x0 = pad.l + i * bw;
          const nonZero = codes.filter((c) => b.vals[c] > 0);
          return (
            <g key={b.n} className={hover === b.n ? 'is-hover' : ''}>
              {nonZero.map((code, j) => {
                const v = b.vals[code];
                const h = (v / max) * (H - pad.t - pad.b);
                stackY -= h;
                return (
                  <path key={code} d={seg(x0 + bw * 0.2, stackY, Math.max(1, h - 2), bw * 0.6,
                                          j === nonZero.length - 1)}
                        fill={colour[code]} />
                );
              })}
              <text className="axis" textAnchor="middle" x={x0 + bw / 2} y={H - 6}>{b.n}</text>
              <rect className="hit" x={x0} y={pad.t} width={bw} height={H - pad.t - pad.b}
                    onMouseEnter={() => setHover(b.n)} />
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div className="chart-tip" style={{
          '--tip-x': `${((pad.l + (shown.indexOf(hovered) + 0.5) * bw) / W) * 100}%`,
        }}>
          <strong>Week {hovered.n}</strong> <span className="dim">{fmtRange(hovered.w.start, hovered.w.end)}</span>
          {codes.map((code) => (
            <span key={code} className="tip-row">
              <i className="swatch" style={{ background: colour[code], borderColor: colour[code] }} />
              {code} <b>{hovered.vals[code] || 0} h</b>
            </span>
          ))}
          <span className="tip-row tip-total">
            total <b>{hovered.total} h</b>
            {band && (hovered.total > band.high ? ' · over capacity'
              : hovered.total < band.low && hovered.total > 0 ? ' · under the band'
              : hovered.total > 0 ? ' · inside the band' : '')}
          </span>
        </div>
      )}

      <p className="legend">
        {codes.map((code) => (
          <span key={code}><i className="swatch" style={{ background: colour[code], borderColor: colour[code] }} />{code}</span>
        ))}
        <span><i className="swatch sw-band" />{band ? `${band.low}–${band.high} h/week` : 'capacity'} at a bad week</span>
        <button type="button" className="btn btn-sm btn-quiet right" aria-expanded={table}
                onClick={() => setTable((v) => !v)}>{table ? 'Hide the numbers' : 'Show the numbers'}</button>
      </p>

      {table && (
        <div className="table-scroll">
          <table>
            <thead><tr><th>Wk</th>{codes.map((c) => <th key={c}>{c}</th>)}<th>Total</th><th>vs capacity</th></tr></thead>
            <tbody>
              {shown.map((b) => (
                <tr key={b.n}>
                  <td className="nowrap">{b.n}</td>
                  {codes.map((c) => <td key={c} className="nowrap">{b.vals[c] || 0}</td>)}
                  <td className="nowrap"><strong>{b.total}</strong></td>
                  <td className="nowrap dim">{!b.total ? '—'
                    : !band ? ''
                    : b.total > band.high ? `+${(b.total - band.high).toFixed(1).replace(/\.0$/, '')} over`
                    : b.total < band.low ? `${(band.low - b.total).toFixed(1).replace(/\.0$/, '')} under`
                    : 'inside'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
