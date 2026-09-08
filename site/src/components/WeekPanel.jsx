import React, { useState } from 'react';
import { useStore, getWeek, rubricScore, reducer, RUBRIC_IDS } from '../lib/store.js';
import { fmtRange } from '../lib/calendar.js';
import { weekStatus, STATUS_LABEL, isBaselineWeek } from '../lib/metrics.js';
import { agentBrief } from '../lib/briefs.js';
import { buildPatch } from '../lib/patch.js';
import { Chip, Copy, courseKind } from './ui.jsx';
import { MdInline } from '../lib/markdown.jsx';

const WeekPanel = React.memo(function WeekPanel({ week, open = false, bulk = null }) {
  const { data, state, today } = useStore();
  const codes = Object.keys(data.enrolled);
  const statuses = codes.map((c) => weekStatus(data, state, c, week, today));

  /* Expand all / Collapse all used to remount every panel through its React
     key, which threw away a half-typed gap. The <details> is opened in place
     instead, so a draft survives the press. */
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (bulk && bulk.mode !== null && ref.current) ref.current.open = bulk.mode;
  }, [bulk && bulk.nonce, bulk && bulk.mode]);

  return (
    <details className="week" ref={ref} open={open} id={`week-${week.n}`}>
      <summary>
        <h3 className="week-n">Week {week.n}</h3>
        <span className="week-dates">{fmtRange(week.start, week.end)}</span>
        {week.midterm && <Chip kind="warn">Midterm</Chip>}
        {week.paper && <Chip kind="warn">Term paper</Chip>}
        {week.roommate && <Chip>Roommate</Chip>}
        <span className="week-flags">
          {codes.map((c, i) => (
            <Chip key={c} kind={statuses[i] === 'pass' ? 'ok' : statuses[i] === 'slipped' ? 'bad'
              : statuses[i] === 'rewrite' ? 'warn' : courseKind(c)}>
              {c.split('-')[0]} {statuses[i] === 'pass' ? '✓' : statuses[i] === 'slipped' ? '!'
                : statuses[i] === 'rewrite' ? '↻' : statuses[i] === 'baseline' ? '◎'
                : statuses[i] === 'current' ? '•' : ''}
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
});
export default WeekPanel;

const CourseWeek = React.memo(function CourseWeek({ entry, week }) {
  const { data, state, dispatch, today, announce } = useStore();
  const { code } = entry;
  const rec = getWeek(state, code, week.n);
  const score = rubricScore(rec);
  const status = weekStatus(data, state, code, week, today);
  const baseline = isBaselineWeek(data, code, week.n);
  const [showAgents, setShowAgents] = useState(false);
  const [gap, setGap] = useState({ concept: '', gap: '' });

  const set = (patch) => dispatch({ type: 'week:set', code, n: week.n, patch });
  const rubric = data.assessment.partA;
  const uid = `${code}-${week.n}`;

  const close = () => {
    const action = { type: 'week:close', code, n: week.n };
    const after = reducer(state, action);
    const edits = buildPatch(data, after, today).reduce((s, b) => s + b.edits.length, 0);
    dispatch(action);
    const verdict = score.graded === 0 ? 'ungraded'
      : score.full ? 'PASS'
      : baseline ? 'REWRITE · baseline measured, none owed'
      : 'REWRITE';
    announce(`${code} week ${week.n} closed · ${verdict} · ${edits} edit${edits === 1 ? '' : 's'} to write back`);
  };

  return (
    <div className={`entry ${courseKind(code)}`}>
      <h4 className="entry-head">{code} · {STATUS_LABEL[status]}{entry.fromCourseFile && ' · from catalog/'}</h4>
      <p className="milestone"><MdInline md={entry.milestone} /></p>
      {/* The tags are already inside the source text and render as chips there;
          a trailing chip repeated the first one and asserted it over a pair. */}
      <p className="line">Source: <MdInline md={entry.source} />
        {(entry.sourceTags || []).length === 0 && entry.source && entry.source !== '—'
          && <> <Chip kind="warn">untagged</Chip></>}</p>
      <p className="line">Output: <MdInline md={entry.output} /></p>
      {entry.unblocks && entry.unblocks !== '—' && (
        <p className="line">Unblocks: <MdInline md={entry.unblocks} /></p>
      )}

      {/* ---- the week's three moves, in the order the cadence runs them ---- */}
      <div className="btn-row">
        {[['read', 'Read'], ['tutor', 'Tutor, cold'], ['written', 'Output written']].map(([k, label]) => (
          <button key={k} type="button" className="btn btn-sm" aria-pressed={!!rec[k]}
                  onClick={() => set({ [k]: !rec[k] })}>{rec[k] ? '✓ ' : ''}{label}</button>
        ))}
        <label className="right hours-field" htmlFor={`hours-${uid}`}>
          Hours
          <input type="number" min="0" step="0.5" id={`hours-${uid}`}
                 value={rec.hours} onChange={(e) => set({ hours: e.target.value })} />
        </label>
      </div>

      {/* --------------------------- Part A grading -------------------------- */}
      {week.midterm ? (
        <p className="small">
          Week 7 is the midterm: oral, cold, run by the Tutor. ASSESSMENT.md Part A grades
          weekly written output, so there is nothing here for the Editor to mark — the
          verdict is the Tutor's and it goes to §C, not §D.
        </p>
      ) : (
      <details className="disclose">
        <summary className="small">
          Editor — Part A, {score.graded ? `${score.passes}/5 so far` : 'not graded'}
          {baseline && ' · baseline week'}
        </summary>
        <div className="disclose-body">
          {baseline && (
            <p className="small">The Priors Sheet will fail A2 and A4 — it cites nothing and gives
              no magnitudes, because in week 1 you cannot yet do either. Record the REWRITE. It is
              logged as baseline measured, not a slipped week, and no rewrite is owed.</p>
          )}
          {rubric.map((c) => (
            <div className="rubric-row" key={c.id}>
              <span className="rubric-id">{c.id}</span>
              <span className="rubric-text"><MdInline md={c.criterion} /> — fails if <MdInline md={c.failsIf} /></span>
              <span className="pf">
                {['pass', 'fail'].map((v) => (
                  <button key={v} type="button" className={`btn btn-sm pf-${v}`}
                          aria-pressed={rec.rubric[c.id] === v}
                          aria-label={`${c.id} ${v}`}
                          onClick={() => dispatch({
                            type: 'week:rubric', code, n: week.n, id: c.id,
                            value: rec.rubric[c.id] === v ? null : v,
                          })}>{v}</button>
                ))}
              </span>
            </div>
          ))}
          <div className="field">
            <label htmlFor={`note-${uid}`}>Reconstruction note — what came back cold, and what did not</label>
            <input type="text" id={`note-${uid}`} value={rec.note}
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
      )}

      {/* ------------------------------ the close ---------------------------- */}
      <div className="btn-row">
        {rec.closed ? (
          <>
            <span className="small">
              Closed{rec.closedOn ? ` ${rec.closedOn}` : ''}{rec.verdict ? ` · ${rec.verdict}` : ''}
            </span>
            <button type="button" className="btn btn-sm btn-quiet"
                    onClick={() => {
                      dispatch({ type: 'week:reopen', code, n: week.n });
                      announce(`${code} week ${week.n} reopened.`, 'warn');
                    }}>Reopen</button>
          </>
        ) : (
          <button type="button" className="btn btn-sm btn-primary" onClick={close}>
            Close week {week.n}
          </button>
        )}
        <button type="button" className="btn btn-sm right" aria-pressed={showAgents}
                onClick={() => setShowAgents((v) => !v)}>Agent briefs</button>
      </div>

      {showAgents && (
        <div className="brief-list">
          {data.agents.map((agent) => {
            const text = agentBrief({ data, state, agent, code, weekNo: week.n });
            return (
              <details key={agent.name} className="disclose">
                <summary className="small">
                  {agent.letter} · {agent.title} — {agent.owns}
                </summary>
                <div className="disclose-body">
                  <div className="btn-row"><Copy text={text} label={`Copy the ${agent.title} brief`} /></div>
                  <pre><code>{text}</code></pre>
                </div>
              </details>
            );
          })}
        </div>
      )}

      {/* -------------------------- log a gap (Tutor) ------------------------ */}
      <details className="disclose">
        <summary className="small">Log a gap from the Tutor session</summary>
        <div className="disclose-body">
          <div className="field">
            <label htmlFor={`gap-concept-${uid}`}>Concept</label>
            <input type="text" id={`gap-concept-${uid}`} value={gap.concept}
                   onChange={(e) => setGap({ ...gap, concept: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor={`gap-detail-${uid}`}>Where comprehension actually broke — specific, not “the chapter”</label>
            <input type="text" id={`gap-detail-${uid}`} value={gap.gap}
                   onChange={(e) => setGap({ ...gap, gap: e.target.value })} />
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn-sm" disabled={!gap.concept.trim()}
                    onClick={() => {
                      dispatch({ type: 'gap:add', gap: { ...gap, course: code, week: week.n } });
                      announce(`Gap logged for ${code} week ${week.n}: ${gap.concept}. It goes to §C at the Sunday close.`);
                      setGap({ concept: '', gap: '' });
                    }}>
              Add to §C
            </button>
          </div>
        </div>
      </details>

      {/* ------------------- log a collision (Roommate, §E) ------------------ */}
      {week.roommate && <CrossForm code={code} week={week} uid={uid} />}
    </div>
  );
});

/* §E was implemented at every layer except the one you can reach: a reducer, a
   patch block and a parser field, and no way to put anything into them. The
   Roommate is fortnightly, so the form appears on the weeks it runs, prefilled
   with the queue the source stack already carries — the point of the queue
   being that the Roommate does not default to jazz every time. */
function CrossForm({ code, week, uid }) {
  const { data, state, dispatch, announce } = useStore();
  const queue = (data.sourceStack.roommateQueue || []);
  const filed = (data.enrolled[code].crossDomain || []);
  const spent = new Set([...filed.map((c) => (c.domain || '').toLowerCase()),
                         ...state.cross.map((c) => (c.domain || '').toLowerCase())]);
  const mine = state.cross.filter((c) => c.course === code);
  const [entry, setEntry] = useState({ domain: '', collidedWith: '', transfer: '' });

  return (
    <details className="disclose">
      <summary className="small">
        Log the Roommate’s collision (§E) — fortnightly{mine.length ? ` · ${mine.length} logged here` : ''}
      </summary>
      <div className="disclose-body">
        <p className="small">A domain is spent once it is used. {filed.length
          ? `${filed.length} already in the file.`
          : 'Nothing in the file yet.'} The best collision this term is often between
          the two live courses — use that before reaching outside.</p>
        <div className="field">
          <label htmlFor={`cross-domain-${uid}`}>Domain</label>
          <input type="text" id={`cross-domain-${uid}`} value={entry.domain}
                 list={`queue-${uid}`}
                 onChange={(e) => setEntry({ ...entry, domain: e.target.value })} />
          <datalist id={`queue-${uid}`}>
            {queue.filter((q) => !spent.has(q.toLowerCase())).map((q) => <option key={q} value={q} />)}
          </datalist>
        </div>
        <div className="field">
          <label htmlFor={`cross-with-${uid}`}>Collided with — the claim or reading it was run against</label>
          <input type="text" id={`cross-with-${uid}`} value={entry.collidedWith}
                 onChange={(e) => setEntry({ ...entry, collidedWith: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor={`cross-transfer-${uid}`}>Transfer that survived</label>
          <input type="text" id={`cross-transfer-${uid}`} value={entry.transfer}
                 onChange={(e) => setEntry({ ...entry, transfer: e.target.value })} />
        </div>
        <div className="btn-row">
          <button type="button" className="btn btn-sm" disabled={!entry.domain.trim()}
                  onClick={() => {
                    dispatch({ type: 'cross:add', entry: { ...entry, course: code, week: week.n } });
                    announce(`Collision logged for ${code} week ${week.n}: ${entry.domain} is now spent.`);
                    setEntry({ domain: '', collidedWith: '', transfer: '' });
                  }}>Add to §E</button>
          {spent.size > 0 && (
            <span className="small right">Spent: {[...spent].filter(Boolean).join(' · ') || 'none'}</span>
          )}
        </div>
        {mine.length > 0 && (
          <ul className="prose small">
            {mine.map((c) => (
              <li key={c.id}>
                wk {c.week} · <strong>{c.domain}</strong>
                {c.collidedWith ? ` × ${c.collidedWith}` : ''}
                {c.transfer ? ` → ${c.transfer}` : ''}{' '}
                <button type="button" className="btn btn-sm btn-quiet"
                        aria-label={`Remove the ${c.domain} collision`}
                        onClick={() => dispatch({ type: 'cross:remove', id: c.id })}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
