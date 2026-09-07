import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store.js';
import { locate } from '../lib/calendar.js';
import { courseMetrics, gapMetrics } from '../lib/metrics.js';
import { Card, Callout, Chip, courseKind } from '../components/ui.jsx';
import WeekPanel from '../components/WeekPanel.jsx';
import Markdown from '../lib/markdown.jsx';

export default function Weeks({ focus }) {
  const { data, state, dispatch, today } = useStore();
  const weeks = data.termA.weeks;
  const here = locate(weeks, today);
  const codes = Object.keys(data.enrolled);
  const [expandAll, setExpandAll] = useState(null);
  const gaps = gapMetrics(state);

  useEffect(() => {
    if (focus) {
      const el = document.getElementById(`week-${focus}`);
      if (el) { el.open = true; el.scrollIntoView({ block: 'start' }); }
    }
  }, [focus]);

  const openFor = (n) =>
    expandAll !== null ? expandAll : (focus ? n === focus : here.phase === 'in' && here.week.n === n);

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

      <Callout kind="info" icon="→" title="Term A interlocks one way">
        <p>STA-101 wk 2 → PSY-101 wk 3 · STA-101 wk 3 → PSY-101 wk 4 · STA-101 wk 6 → PSY-101 wk 5.
          If something has to slip, slip PSY-101 — never STA-101 weeks 2 or 3.</p>
      </Callout>

      <div className="btn-row">
        <button type="button" className="btn btn-quiet" onClick={() => setExpandAll(true)}>Expand all</button>
        <button type="button" className="btn btn-quiet" onClick={() => setExpandAll(false)}>Collapse all</button>
        {here.phase === 'in' && (
          <a className="btn btn-quiet" href={`#/weeks/${here.week.n}`}>Jump to this week</a>
        )}
      </div>

      {weeks.map((w) => <WeekPanel key={w.n} week={w} open={openFor(w.n)} />)}

      <div className="grid grid-2" style={{ marginTop: '1.4rem' }}>
        <Card title={`§C Gap log — ${gaps.open} open, ${gaps.closed} closed`}>
          {state.gaps.length === 0 ? (
            <p className="small">Nothing logged. A gap closes only when you re-explain it cold, in
              a later session, in a frame the Tutor did not supply.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Wk</th><th>Course</th><th>Concept</th><th>Gap</th><th>Status</th><th /></tr></thead>
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
                                onClick={() => dispatch({
                                  type: 'gap:update', id: g.id,
                                  patch: { status: g.status === 'closed' ? 'open' : 'closed' },
                                })}>
                          {g.status === 'closed' ? 'closed' : 'open'}
                        </button>
                      </td>
                      <td><button type="button" className="btn btn-sm btn-quiet"
                                  onClick={() => dispatch({ type: 'gap:remove', id: g.id })}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {codes.map((code) => (
            <Markdown key={code} md={data.enrolled[code].gapsNote} className="small" />
          ))}
        </Card>

        <Card title="§D Verdict log">
          <VerdictTable />
          {codes.map((code) => (
            <Markdown key={code} md={data.enrolled[code].verdictsNote} className="small" />
          ))}
        </Card>
      </div>
    </>
  );
}

function VerdictTable() {
  const { data, state, today } = useStore();
  const codes = Object.keys(data.enrolled);
  const rows = codes.flatMap((code) => {
    const m = courseMetrics(data, state, code, today);
    return m.records
      .filter(({ r }) => r.closed || Object.keys(r.rubric).length)
      .map(({ w, r }) => ({ code, n: w.n, r }));
  }).sort((a, b) => a.n - b.n);

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
