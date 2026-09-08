import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../lib/store.js';
import { locate } from '../lib/calendar.js';
import { courseMetrics, gapMetrics } from '../lib/metrics.js';
import { Card, Callout, Chip, courseKind } from '../components/ui.jsx';
import WeekPanel from '../components/WeekPanel.jsx';
import WeekStrip from '../components/WeekStrip.jsx';
import Markdown, { MdInline } from '../lib/markdown.jsx';

export default function Weeks({ focus }) {
  const { data, state, dispatch, today, announce } = useStore();
  const weeks = data.termA.weeks;
  const here = locate(weeks, today, data.registrar.terms);
  const codes = useMemo(() => Object.keys(data.enrolled), [data]);
  /* `expandAll` used to be a plain boolean, so pressing "Expand all" twice with
     a manual collapse in between did nothing: the value had not changed, so
     React never touched the `open` prop. The nonce makes every press a new
     instruction. */
  const [bulk, setBulk] = useState({ mode: null, nonce: 0 });
  const gaps = gapMetrics(state);

  // a jump to one week is an instruction about that week, so it clears a
  // standing "expand all"
  useEffect(() => { setBulk({ mode: null, nonce: 0 }); }, [focus]);

  useEffect(() => {
    if (!focus) return;
    const el = document.getElementById(`week-${focus}`);
    if (el) el.scrollIntoView({ block: 'start' });
  }, [focus]);

  const openFor = (n) =>
    bulk.mode !== null ? bulk.mode : (focus ? n === focus : here.phase === 'in' && here.week.n === n);

  return (
    <>
      <div className="page-head">
        <h2>Term A, fourteen weeks</h2>
        <p>Both courses, week by week. Weeks 1–7 and 14 come from the boards in{' '}
          <code>enrolled/</code>; weeks 8–13, which the boards file as a single row reading
          “see course file”, come from <code>catalog/PSY-101.md</code> and{' '}
          <code>catalog/STA-101.md</code>. Close a week when its output is written and graded —
          a week whose Sunday has passed and is still open counts as slipped.</p>
      </div>

      <Card title="The term at a glance">
        <WeekStrip />
      </Card>

      {data.registrar.interlock && (
        <Callout kind="info" icon="→" title="The term interlocks one way">
          <p><MdInline md={data.registrar.interlock.replace(/^\*\*[^*]+\*\*\s*/, '')} /></p>
        </Callout>
      )}

      <div className="btn-row">
        <button type="button" className="btn btn-quiet"
                onClick={() => setBulk((b) => ({ mode: true, nonce: b.nonce + 1 }))}>Expand all</button>
        <button type="button" className="btn btn-quiet"
                onClick={() => setBulk((b) => ({ mode: false, nonce: b.nonce + 1 }))}>Collapse all</button>
        {here.phase === 'in' && (
          <a className="btn btn-quiet" href={`#/weeks/${here.week.n}`}>Jump to this week</a>
        )}
      </div>

      {weeks.map((w) => (
        <WeekPanel key={w.n} week={w} open={openFor(w.n)} bulk={bulk} />
      ))}

      <div className="grid grid-2" style={{ marginTop: '1.4rem' }}>
        <Card title={`§C Gap log — ${gaps.open} open, ${gaps.closed} closed`}>
          {state.gaps.length === 0 ? (
            <p className="small">Nothing logged in this browser. A gap closes only when you
              re-explain it cold, in a later session, in a frame the Tutor did not supply.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Wk</th><th>Course</th><th>Concept</th><th>Gap</th><th>Status</th><th><span className="sr-only">Remove</span></th></tr></thead>
                <tbody>
                  {state.gaps.map((g) => (
                    <tr key={g.id}>
                      <td className="nowrap">{g.week}</td>
                      <td><Chip kind={courseKind(g.course)}>{g.course}</Chip></td>
                      <td>{g.concept}</td>
                      <td>{g.gap}</td>
                      <td>
                        <button type="button" className="btn btn-sm"
                                aria-pressed={g.status === 'closed'}
                                onClick={() => {
                                  const next = g.status === 'closed' ? 'open' : 'closed';
                                  dispatch({ type: 'gap:update', id: g.id, patch: { status: next } });
                                  announce(`${g.concept} marked ${next}.`);
                                }}>
                          {g.status === 'closed' ? 'closed' : 'open'}
                        </button>
                      </td>
                      <td><button type="button" className="btn btn-sm btn-quiet"
                                  aria-label={`Remove the gap “${g.concept}”`}
                                  onClick={() => dispatch({ type: 'gap:remove', id: g.id })}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <FiledRows label="Already in the file"
                     rows={codes.flatMap((code) => (data.enrolled[code].gaps || [])
                       .map((g) => ({ code, text: `wk ${g.week ?? '—'} · ${g.concept} — ${g.status}` })))} />
          {codes.map((code) => (
            <Markdown key={code} md={data.enrolled[code].gapsNote} className="small" />
          ))}
        </Card>

        <Card title="§D Verdict log">
          <VerdictTable />
          <FiledRows label="Already in the file"
                     rows={codes.flatMap((code) => (data.enrolled[code].verdicts || [])
                       .map((v) => ({ code, text: `wk ${v.week ?? '—'} · ${v.rubric} · ${v.verdict}` })))} />
          {codes.map((code) => (
            <Markdown key={code} md={data.enrolled[code].verdictsNote} className="small" />
          ))}
        </Card>
      </div>

      <Card title={`§E Cross-domain ledger — ${state.cross.length} logged here`}>
        <p className="small">The Roommate is fortnightly and a domain is spent once used. Log a
          collision on any even week above; this is what the Sunday close appends to §E.</p>
        {state.cross.length === 0 ? (
          <p className="small">Nothing logged in this browser yet.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead><tr><th>Wk</th><th>Course</th><th>Domain</th><th>Collided with</th><th>Transfer that survived</th><th><span className="sr-only">Remove</span></th></tr></thead>
              <tbody>
                {state.cross.map((c) => (
                  <tr key={c.id}>
                    <td className="nowrap">{c.week}</td>
                    <td><Chip kind={courseKind(c.course)}>{c.course}</Chip></td>
                    <td>{c.domain}</td>
                    <td>{c.collidedWith}</td>
                    <td>{c.transfer}</td>
                    <td><button type="button" className="btn btn-sm btn-quiet"
                                aria-label={`Remove the ${c.domain} collision`}
                                onClick={() => dispatch({ type: 'cross:remove', id: c.id })}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <FiledRows label="Already in the file"
                   rows={codes.flatMap((code) => (data.enrolled[code].crossDomain || [])
                     .map((c) => ({ code, text: `wk ${c.week ?? '—'} · ${c.domain} × ${c.collidedWith}` })))} />
        {codes.map((code) => (
          <Markdown key={code} md={data.enrolled[code].crossNote} className="small" />
        ))}
      </Card>
    </>
  );
}

/* What the repository already holds for a section, so it is visible that the
   patch is not about to offer it again. */
function FiledRows({ label, rows }) {
  if (!rows.length) return null;
  return (
    <p className="small filed-rows">
      <strong>{label}:</strong>{' '}
      {rows.map((r, i) => (
        <React.Fragment key={i}>{i > 0 && ' · '}{r.code} {r.text}</React.Fragment>
      ))}
    </p>
  );
}

function VerdictTable() {
  const { data, state, today } = useStore();
  const codes = useMemo(() => Object.keys(data.enrolled), [data]);
  const rows = useMemo(() => codes.flatMap((code) => {
    const m = courseMetrics(data, state, code, today);
    return m.records
      .filter(({ r }) => r.closed || Object.keys(r.rubric).length)
      .map(({ w, r }) => ({ code, n: w.n, r }));
  }).sort((a, b) => a.n - b.n), [data, state, today, codes]);

  if (!rows.length) {
    return <p className="small">Nothing graded yet. Each criterion is pass/fail and it is 5/5 or
      the week is a rewrite — there is no partial credit and no “strong 4”.</p>;
  }
  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>Wk</th><th>Course</th><th>Rubric</th><th>Verdict</th><th>Recon</th></tr></thead>
        <tbody>
          {rows.map(({ code, n, r }) => {
            const passes = ['A1', 'A2', 'A3', 'A4', 'A5'].filter((id) => r.rubric[id] === 'pass').length;
            const fails = ['A1', 'A2', 'A3', 'A4', 'A5'].filter((id) => r.rubric[id] === 'fail');
            return (
              <tr key={`${code}-${n}`}>
                <td className="nowrap">{n}</td>
                <td><Chip kind={courseKind(code)}>{code}</Chip></td>
                <td className="nowrap">{passes}/5 {fails.length > 0 && <span className="dim">({fails.join(', ')})</span>}</td>
                <td className="nowrap">{r.verdict || (r.closed ? '—' : 'open')}</td>
                <td>{r.note || <span className="dim">—</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
