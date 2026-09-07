import React from 'react';
import { useStore } from '../lib/store.js';
import { locate, fmtRange, daysBetween, fmt } from '../lib/calendar.js';
import {
  courseMetrics, ledgerMetrics, gapMetrics, setupMetrics, creditMetrics,
  termProgress, weekStatus, acquireQueue, STATUS_LABEL, TAG_LABEL, effectiveTag,
} from '../lib/metrics.js';
import { Card, Tile, Callout, Tag, Chip, StackedBar, courseKind } from '../components/ui.jsx';

const MARK = { pass: '✓', rewrite: '↻', closed: '·', slipped: '!', current: '', future: '' };
const TAG_ORDER = ['H', 'V', 'R'];

function pct(x) { return x === null ? '—' : `${Math.round(x * 100)}%`; }

export default function Dashboard() {
  const { data, state, today } = useStore();
  const weeks = data.termA.weeks;
  const codes = Object.keys(data.enrolled);
  const here = locate(weeks, today);

  const courses = codes.map((c) => courseMetrics(data, state, c, today));
  const ledgers = codes.map((c) => ledgerMetrics(data, state, c));
  const gaps = gapMetrics(state);
  const setup = setupMetrics(data, state);
  const credits = creditMetrics(data, state, courses);
  const progress = termProgress(courses);

  const totalH = ledgers.reduce((s, l) => s + l.counts.H, 0);
  const totalRows = ledgers.reduce((s, l) => s + l.total, 0);
  const totalSlipped = courses.reduce((s, c) => s + c.slipped, 0);
  const rewrites = courses.flatMap((c) => c.rewritesOwed.map((n) => ({ code: c.code, n })));
  const queue = acquireQueue(data, state, here.week ? here.week.n : 1);
  const scopeCuts = courses.filter((c) => c.scopeCut);
  const soft = courses.filter((c) => c.editorSoft);

  const attempted = courses.reduce((s, c) => s + c.attempted, 0);
  const full = courses.reduce((s, c) => s + c.full, 0);
  const overallRate = attempted ? full / attempted : null;
  const hours = courses.reduce((s, c) => s + c.hours, 0);

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

      {scopeCuts.map((c) => (
        <Callout key={c.code} kind="bad" icon="!" title={`${c.code}: ${c.slipped} slipped weeks — scope cut triggered`}>
          <p>REGISTRAR.md standing rules: three slips in one course triggers a scope cut in
            that course, and the Advisor executes it without renegotiating. <strong>The calendar
            does not move.</strong> Open the Advisor before you write anything else.</p>
        </Callout>
      ))}

      {soft.map((c) => (
        <Callout key={c.code} kind="warn" icon="?" title={`${c.code} is passing at ${pct(c.passRateExBaseline)} — check the Editor`}>
          <p>A pass rate near 100% by week 6 means the Editor has drifted toward the standard
            you argued for in the moment, which is the specific thing it is bad at. That is why{' '}
            <code>ASSESSMENT.md</code> is locked and dated before week 1. The Advisor should say so.</p>
        </Callout>
      ))}

      {totalSlipped > 0 && !scopeCuts.length && (
        <Callout kind="warn" icon="!" title={`${totalSlipped} slipped week${totalSlipped === 1 ? '' : 's'}`}>
          <p>{courses.filter((c) => c.slipped).map((c) =>
            `${c.code}: week${c.slippedWeeks.length === 1 ? '' : 's'} ${c.slippedWeeks.join(', ')} (${c.slipped}/${c.slipLimit})`).join(' · ')}.
            A week with no output is a slipped week — the output is not a record of the learning, it is the learning.</p>
        </Callout>
      )}

      {rewrites.length > 0 && (
        <Callout kind="warn" icon="↻" title={`${rewrites.length} rewrite${rewrites.length === 1 ? '' : 's'} owed`}>
          <p>{rewrites.map((r) => `${r.code} week ${r.n}`).join(' · ')}. 5/5 or the week is a
            rewrite — there is no partial credit and no strong 4.</p>
        </Callout>
      )}

      {here.phase === 'pre' && setup.done < setup.total && (
        <Callout kind="info" icon="→" title={`${setup.total - setup.done} setup step${setup.total - setup.done === 1 ? '' : 's'} left before Monday`}>
          <p>Step 2, the Priors Sheet, is the one with an order dependency you cannot undo:
            the moment you open a Term A source, that measurement is gone for good.{' '}
            <a href="#/now">Open the checklist →</a></p>
        </Callout>
      )}

      {/* --------------------------------- tiles --------------------------- */}

      <div className="tiles">
        <Tile label="Weeks closed" value={progress.closed} of={progress.total}
              meter={progress.fraction}
              note={`both courses · ${Math.round(progress.fraction * 100)}% of Term A`} />
        <Tile label="Pass rate" value={pct(overallRate)}
              state={overallRate === null ? undefined : overallRate >= 0.9 && attempted >= 5 ? 'warn' : 'ok'}
              note={attempted ? `${full} of ${attempted} weeks at 5/5` : 'no week graded yet'} />
        <Tile label="Slipped weeks" value={totalSlipped}
              state={totalSlipped === 0 ? 'ok' : scopeCuts.length ? 'bad' : 'warn'}
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
              note={`Certificate needs ${credits.certificateNeeds} courses`} />
      </div>

      {/* ---------------------------- the week strip ----------------------- */}

      <Card title="Term A, week by week">
        <div className="strip-wrap">
        <div className="strip-head">
          <span />
          <div className="strip-scale" aria-hidden="true">
            {weeks.map((w) => <span key={w.n}>{w.n}</span>)}
          </div>
        </div>
        <div className="strip">
          {codes.map((code) => (
            <div className="strip-row" key={code}>
              <span className="strip-label">{code}</span>
              <div className="strip-cells">
                {weeks.map((w) => {
                  const s = weekStatus(state, code, w, today);
                  return (
                    <a key={w.n} className={`cell s-${s}`} href={`#/weeks/${w.n}`}
                       title={`${code} week ${w.n} — ${STATUS_LABEL[s]}`}
                       aria-label={`${code} week ${w.n}, ${STATUS_LABEL[s]}`}>
                      <span className="mark" aria-hidden="true">{MARK[s] || w.n}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        </div>
        <p className="legend">
          <span><i className="swatch" style={{ background: 'var(--ok)', borderColor: 'var(--ok)' }} />✓ closed 5/5</span>
          <span><i className="swatch" style={{ background: 'var(--warn)', borderColor: 'var(--warn)' }} />↻ rewrite owed</span>
          <span><i className="swatch" style={{ background: 'var(--bad)', borderColor: 'var(--bad)' }} />! slipped</span>
          <span><i className="swatch" style={{ borderColor: 'var(--accent)', borderWidth: 2 }} />this week</span>
          <span><i className="swatch" style={{ borderStyle: 'dashed' }} />ahead</span>
        </p>
        <p className="small">Week 7 is the midterm, oral and cold. Week 14 is the term paper,
          2,000 words each. Tap any week to open its board.</p>
      </Card>

      <div className="grid grid-2">
        {/* ------------------------- source ledger ------------------------- */}
        <Card title="Source ledger health">
          {ledgers.map((l) => (
            <StackedBar key={l.code} label={l.code} counts={l.counts}
                        order={TAG_ORDER} total={l.total} labels={TAG_LABEL} />
          ))}
          <p className="legend">
            <span><i className="swatch" style={{ background: 'var(--ramp-h)' }} />[H] in hand</span>
            <span><i className="swatch" style={{ background: 'var(--ramp-v)' }} />[V] verified</span>
            <span><i className="swatch" style={{ background: 'var(--ramp-r)' }} />[R] recalled</span>
          </p>
          <p className="small">A tag is a claim about what you have actually done with a source.
            The Librarian is the weakest of the five agents and this ratio is the reason — nothing
            gets read from an untagged row. <a href="#/sources">Full ledger →</a></p>
        </Card>

        {/* --------------------------- acquire ----------------------------- */}
        <Card title={`To get${queue.length ? ` — ${queue.length} due within four weeks` : ''}`}>
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
                <Tile label="At 5/5" value={c.full} of={c.attempted || 0}
                      note={c.attempted ? pct(c.passRate) : 'not graded yet'} />
                <Tile label="Slipped" value={c.slipped} of={c.slipLimit}
                      state={c.slipped === 0 ? 'ok' : c.scopeCut ? 'bad' : 'warn'} />
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
                  <tr key={i}>
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
        <Card title="Hours logged">
          <HoursChart data={data} state={state} codes={codes} courses={courses} />
        </Card>
      )}
    </>
  );
}

/* Grouped columns, one axis, two series, direct-labelled totals. Only rendered
   once hours actually exist - an empty chart is worse than no chart. */
function HoursChart({ data, codes, courses }) {
  const weeks = data.termA.weeks;
  const byWeek = weeks.map((w) => {
    const vals = {};
    codes.forEach((code) => {
      const rec = courses.find((c) => c.code === code).records.find((r) => r.w.n === w.n);
      vals[code] = parseFloat(rec.r.hours) || 0;
    });
    return { n: w.n, vals, total: Object.values(vals).reduce((a, b) => a + b, 0) };
  });
  const max = Math.max(12, ...byWeek.map((b) => b.total));
  const W = 700; const H = 150; const pad = { l: 26, r: 6, t: 8, b: 18 };
  const bw = (W - pad.l - pad.r) / weeks.length;
  const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const colour = { 'PSY-101': 'var(--series-psy)', 'STA-101': 'var(--series-sta)' };

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
           aria-label={`Hours logged per week. ${byWeek.filter((b) => b.total).map((b) => `week ${b.n}: ${b.total} hours`).join('; ')}`}>
        {[0, max / 2, max].map((v) => (
          <g key={v}>
            <line className="grid-line" x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} />
            <text className="axis" x={0} y={y(v) + 3}>{Math.round(v)}</text>
          </g>
        ))}
        {byWeek.map((b) => {
          let stackY = y(0);
          return (
            <g key={b.n}>
              {codes.map((code) => {
                const v = b.vals[code];
                if (!v) return null;
                const h = (v / max) * (H - pad.t - pad.b);
                stackY -= h;
                return (
                  <rect key={code} x={pad.l + b.n * bw - bw + bw * 0.18} width={bw * 0.64}
                        y={stackY} height={Math.max(0, h - 2)} rx="2" fill={colour[code]} />
                );
              })}
              <text className="axis" textAnchor="middle" x={pad.l + b.n * bw - bw / 2} y={H - 5}>{b.n}</text>
            </g>
          );
        })}
      </svg>
      <p className="legend">
        {codes.map((code) => (
          <span key={code}><i className="swatch" style={{ background: colour[code], borderColor: colour[code] }} />{code}</span>
        ))}
        <span className="dim">against a stated capacity of {data.registrar.capacity.split('(')[0].trim()}</span>
      </p>
    </div>
  );
}
