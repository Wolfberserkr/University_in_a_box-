import React, { useState } from 'react';
import { useStore, getWeek, rubricScore, RUBRIC_IDS } from '../lib/store.js';
import { fmtRange } from '../lib/calendar.js';
import { weekStatus, STATUS_LABEL, isBaselineWeek } from '../lib/metrics.js';
import { agentBrief } from '../lib/briefs.js';
import { Tag, Chip, Copy, courseKind } from './ui.jsx';
import Markdown from '../lib/markdown.jsx';

export default function WeekPanel({ week, open = false }) {
  const { data, state, today } = useStore();
  const codes = Object.keys(data.enrolled);
  const statuses = codes.map((c) => weekStatus(state, c, week, today));

  return (
    <details className="week" open={open} id={`week-${week.n}`}>
      <summary>
        <span className="week-n">Week {week.n}</span>
        <span className="week-dates">{fmtRange(week.start, week.end)}</span>
        {week.midterm && <Chip kind="warn">Midterm</Chip>}
        {week.paper && <Chip kind="warn">Term paper</Chip>}
        {week.roommate && <Chip>Roommate</Chip>}
        <span className="week-flags">
          {codes.map((c, i) => (
            <Chip key={c} kind={statuses[i] === 'pass' ? 'ok' : statuses[i] === 'slipped' ? 'bad'
              : statuses[i] === 'rewrite' ? 'warn' : courseKind(c)}>
              {c.split('-')[0]} {statuses[i] === 'pass' ? '✓' : statuses[i] === 'slipped' ? '!'
                : statuses[i] === 'rewrite' ? '↻' : statuses[i] === 'current' ? '•' : ''}
            </Chip>
          ))}
        </span>
      </summary>
      <div className="week-body">
        {week.entries.map((entry) => (
          <CourseWeek key={entry.code} entry={entry} week={week} />
        ))}
      </div>
    </details>
  );
}

function CourseWeek({ entry, week }) {
  const { data, state, dispatch, today } = useStore();
  const { code } = entry;
  const rec = getWeek(state, code, week.n);
  const score = rubricScore(rec);
  const status = weekStatus(state, code, week, today);
  const baseline = isBaselineWeek(code, week.n);
  const [showAgents, setShowAgents] = useState(false);
  const [gap, setGap] = useState({ concept: '', gap: '' });

  const set = (patch) => dispatch({ type: 'week:set', code, n: week.n, patch });
  const rubric = data.assessment.partA;

  return (
    <div className={`entry ${courseKind(code)}`}>
      <h5>{code} · {STATUS_LABEL[status]}{entry.fromCourseFile && ' · from catalog/'}</h5>
      <p className="milestone"><Markdown md={entry.milestone} className="" /></p>
      <p className="line">Source: <Markdown md={entry.source} className="" />
        {entry.sourceTag && <> <Tag tag={entry.sourceTag} /></>}</p>
      <p className="line">Output: <Markdown md={entry.output} className="" /></p>
      {entry.unblocks && entry.unblocks !== '—' && (
        <p className="line">Unblocks: <Markdown md={entry.unblocks} className="" /></p>
      )}

      {/* ---- the week's three moves, in the order the cadence runs them ---- */}
      <div className="btn-row">
        {[['read', 'Read'], ['tutor', 'Tutor, cold'], ['written', 'Output written']].map(([k, label]) => (
          <button key={k} type="button" className="btn btn-sm" aria-pressed={!!rec[k]}
                  onClick={() => set({ [k]: !rec[k] })}>{rec[k] ? '✓ ' : ''}{label}</button>
        ))}
        <label className="right" style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
          Hours
          <input type="number" min="0" step="0.5" style={{ width: '4.5rem' }}
                 value={rec.hours} onChange={(e) => set({ hours: e.target.value })} />
        </label>
      </div>

      {/* --------------------------- Part A grading -------------------------- */}
      <details>
        <summary className="small" style={{ cursor: 'pointer' }}>
          Editor — Part A, {score.graded ? `${score.passes}/5 so far` : 'not graded'}
          {baseline && ' · baseline week'}
        </summary>
        <div style={{ marginTop: '.4rem' }}>
          {baseline && (
            <p className="small">The Priors Sheet will fail A2 and A4 — it cites nothing and gives
              no magnitudes, because in week 1 you cannot yet do either. Record the REWRITE. It is
              logged as baseline measured, not a slipped week, and no rewrite is owed.</p>
          )}
          {rubric.map((c) => (
            <div className="rubric-row" key={c.id}>
              <span className="rubric-id">{c.id}</span>
              <span className="rubric-text"><Markdown md={c.criterion} className="" /> — fails if <Markdown md={c.failsIf} className="" /></span>
              <span className="pf">
                {['pass', 'fail'].map((v) => (
                  <button key={v} type="button" className="btn btn-sm"
                          aria-pressed={rec.rubric[c.id] === v}
                          onClick={() => dispatch({
                            type: 'week:rubric', code, n: week.n, id: c.id,
                            value: rec.rubric[c.id] === v ? null : v,
                          })}>{v}</button>
                ))}
              </span>
            </div>
          ))}
          <div className="field">
            <label htmlFor={`note-${code}-${week.n}`}>Reconstruction note — what came back cold, and what did not</label>
            <input type="text" id={`note-${code}-${week.n}`} value={rec.note}
                   onChange={(e) => set({ note: e.target.value })} />
          </div>
          {score.graded === RUBRIC_IDS.length && !score.full && !baseline && (
            <p className="small">
              5/5 or the week is a rewrite — no partial credit, no strong 4.{' '}
              <button type="button" className="btn btn-sm" aria-pressed={rec.rewriteDone}
                      onClick={() => set({ rewriteDone: !rec.rewriteDone })}>
                {rec.rewriteDone ? '✓ rewrite done' : 'Mark rewrite done'}
              </button>
            </p>
          )}
        </div>
      </details>

      {/* ------------------------------ the close ---------------------------- */}
      <div className="btn-row">
        {rec.closed ? (
          <>
            <span className="small">
              Closed{rec.closedOn ? ` ${rec.closedOn}` : ''}{rec.verdict ? ` · ${rec.verdict}` : ''}
            </span>
            <button type="button" className="btn btn-sm btn-quiet"
                    onClick={() => dispatch({ type: 'week:reopen', code, n: week.n })}>Reopen</button>
          </>
        ) : (
          <button type="button" className="btn btn-sm btn-primary"
                  onClick={() => dispatch({ type: 'week:close', code, n: week.n })}>
            Close week {week.n}
          </button>
        )}
        <button type="button" className="btn btn-sm right" aria-pressed={showAgents}
                onClick={() => setShowAgents((v) => !v)}>Agent briefs</button>
      </div>

      {showAgents && (
        <div style={{ marginTop: '.4rem' }}>
          {data.agents.map((agent) => {
            const text = agentBrief({ data, state, agent, code, weekNo: week.n });
            return (
              <details key={agent.name}>
                <summary className="small" style={{ cursor: 'pointer' }}>
                  {agent.letter} · {agent.title} — {agent.owns}
                </summary>
                <div className="btn-row"><Copy text={text} label={`Copy the ${agent.title} brief`} /></div>
                <pre><code>{text}</code></pre>
              </details>
            );
          })}
        </div>
      )}

      {/* -------------------------- log a gap (Tutor) ------------------------ */}
      <details>
        <summary className="small" style={{ cursor: 'pointer' }}>Log a gap from the Tutor session</summary>
        <div className="field">
          <label>Concept</label>
          <input type="text" value={gap.concept}
                 onChange={(e) => setGap({ ...gap, concept: e.target.value })} />
        </div>
        <div className="field">
          <label>Where comprehension actually broke — specific, not "the chapter"</label>
          <input type="text" value={gap.gap}
                 onChange={(e) => setGap({ ...gap, gap: e.target.value })} />
        </div>
        <div className="btn-row">
          <button type="button" className="btn btn-sm" disabled={!gap.concept.trim()}
                  onClick={() => { dispatch({ type: 'gap:add', gap: { ...gap, course: code, week: week.n } }); setGap({ concept: '', gap: '' }); }}>
            Add to §C
          </button>
        </div>
      </details>
    </div>
  );
}
