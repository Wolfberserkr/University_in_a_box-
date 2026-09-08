import React, { useRef, useState } from 'react';
import { useStore, getWeek, rubricScore, reducer } from '../lib/store.js';
import { fmtRange } from '../lib/calendar.js';
import { weekStatus, STATUS_LABEL, STATUS_MARK, isBaselineWeek } from '../lib/metrics.js';
import { buildPatch } from '../lib/patch.js';
import { Chip, useChanged, courseKind } from './ui.jsx';
import { MdInline } from '../lib/markdown.jsx';

/* The week strip.
 *
 * Twenty-eight cells that used to encode one variable and link away. Now they
 * carry the shape of the term: the two landmarks the copy underneath talks
 * about are drawn, the milestone for any week is one hover or one arrow key
 * away, a week closes here instead of two views away, and the cell that changed
 * says so. Arrow keys move within the grid on one tab stop, which is what a
 * grid of controls owes a keyboard.
 */
export default function WeekStrip({ compact = false }) {
  const { data, state, dispatch, today, announce } = useStore();
  const weeks = data.termA.weeks;
  const codes = Object.keys(data.enrolled);
  const current = weeks.find((w) => today >= w.start && today <= w.end);

  const [sel, setSel] = useState(() => ({ code: codes[0], n: current ? current.n : 1 }));
  const [hover, setHover] = useState(null);
  const gridRef = useRef(null);

  const shownWeek = weeks.find((w) => w.n === (hover || sel.n)) || weeks[0];

  const move = (e, code, n) => {
    const ci = codes.indexOf(code);
    let next = null;
    if (e.key === 'ArrowRight') next = { code, n: Math.min(weeks.length, n + 1) };
    else if (e.key === 'ArrowLeft') next = { code, n: Math.max(1, n - 1) };
    else if (e.key === 'ArrowDown') next = { code: codes[Math.min(codes.length - 1, ci + 1)], n };
    else if (e.key === 'ArrowUp') next = { code: codes[Math.max(0, ci - 1)], n };
    else if (e.key === 'Home') next = { code, n: 1 };
    else if (e.key === 'End') next = { code, n: weeks.length };
    if (!next) return;
    e.preventDefault();
    setSel(next);
    const el = gridRef.current && gridRef.current.querySelector(`[data-cell="${next.code}-${next.n}"]`);
    if (el) el.focus();
  };

  const closeWeek = (code, n) => {
    const action = { type: 'week:close', code, n };
    const after = reducer(state, action);
    const edits = buildPatch(data, after, today).reduce((s, b) => s + b.edits.length, 0);
    dispatch(action);
    const score = rubricScore(getWeek(after, code, n));
    const verdict = score.graded === 0 ? 'ungraded'
      : score.full ? 'PASS'
      : isBaselineWeek(data, code, n) ? 'REWRITE · baseline measured, none owed'
      : 'REWRITE';
    announce(`${code} week ${n} closed · ${verdict} · ${edits} edit${edits === 1 ? '' : 's'} to write back`);
  };

  const reopen = (code, n) => {
    dispatch({ type: 'week:reopen', code, n });
    announce(`${code} week ${n} reopened. It counts as slipped once its Sunday has passed.`, 'warn');
  };

  return (
    <div className="strip-block">
      <div className="strip-wrap">
        <div className="strip-inner">
          <div className="strip-head">
            <span className="strip-label" aria-hidden="true" />
            <div className="strip-scale" aria-hidden="true">
              {weeks.map((w) => (
                <span key={w.n} className={w.midterm || w.paper ? 'is-landmark' : ''}>{w.n}</span>
              ))}
            </div>
          </div>
          <div className="strip-head">
            <span className="strip-label" aria-hidden="true" />
            <div className="strip-lane" aria-hidden="true">
              {weeks.map((w) => (
                <span key={w.n} className={`lane${w.midterm ? ' is-mark' : w.paper ? ' is-mark' : ''}`}>
                  {(w.midterm || w.paper) && (
                    <b className={w.n === weeks.length ? 'is-last' : ''}>{w.midterm ? 'midterm' : 'paper'}</b>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="strip" ref={gridRef} role="group"
               aria-label={`Term A, ${weeks.length} weeks, ${codes.length} courses`}>
            {codes.map((code) => (
              <div className="strip-row" key={code}>
                <span className="strip-label">{code}</span>
                <div className="strip-cells">
                  {weeks.map((w) => (
                    <Cell key={w.n} code={code} week={w}
                          status={weekStatus(data, state, code, w, today)}
                          selected={sel.code === code && sel.n === w.n}
                          onSelect={() => setSel({ code, n: w.n })}
                          onHover={setHover}
                          onKeyDown={(e) => move(e, code, w.n)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="legend">
        <span><i className="swatch sw-pass" aria-hidden="true">✓</i>closed 5/5</span>
        <span><i className="swatch sw-baseline" aria-hidden="true">◎</i>baseline measured</span>
        <span><i className="swatch sw-rewrite" aria-hidden="true">↻</i>rewrite owed</span>
        <span><i className="swatch sw-slipped" aria-hidden="true">!</i>slipped</span>
        <span><i className="swatch sw-current" aria-hidden="true">•</i>this week</span>
        <span><i className="swatch sw-future" aria-hidden="true" />ahead</span>
      </p>

      {!compact && (
        <WeekDetail week={shownWeek} pinned={!hover} onClose={closeWeek} onReopen={reopen} />
      )}
    </div>
  );
}

function Cell({ code, week, status, selected, onSelect, onHover, onKeyDown }) {
  const flash = useChanged(status, 800);
  const label = `${code} week ${week.n}, ${STATUS_LABEL[status]}`;
  return (
    <button type="button"
            data-cell={`${code}-${week.n}`}
            className={`cell s-${status}${selected ? ' is-sel' : ''}${flash ? ' is-flash' : ''}`}
            tabIndex={selected ? 0 : -1}
            aria-label={label}
            onFocus={onSelect}
            onClick={onSelect}
            onKeyDown={onKeyDown}
            onMouseEnter={() => onHover(week.n)}
            onMouseLeave={() => onHover(null)}>
      <span className="mark" aria-hidden="true">{STATUS_MARK[status] || week.n}</span>
    </button>
  );
}

/* Fixed-height so hovering the strip never moves the page under the pointer. */
function WeekDetail({ week, pinned, onClose, onReopen }) {
  const { data, state, today } = useStore();
  const isNow = today >= week.start && today <= week.end;

  return (
    <div className="strip-detail">
      <p className="strip-detail-head">
        <strong>Week {week.n}</strong>
        <span className="dim">{fmtRange(week.start, week.end)}</span>
        {isNow && <Chip kind="accent">this week</Chip>}
        {week.midterm && <Chip kind="warn">Midterm — oral, cold</Chip>}
        {week.paper && <Chip kind="warn">Term paper, 2,000w</Chip>}
        {week.roommate && <Chip>Roommate fortnight</Chip>}
        <a className="right" href={`#/weeks/${week.n}`}>Full board →</a>
      </p>
      {week.entries.map((entry) => {
        const rec = getWeek(state, entry.code, week.n);
        const status = weekStatus(data, state, entry.code, week, today);
        return (
          <div key={entry.code} className={`strip-detail-row ${courseKind(entry.code)}`}>
            <span className="strip-detail-code">{entry.code}</span>
            <span className="strip-detail-ms"><MdInline md={entry.milestone} /></span>
            <span className="strip-detail-status dim">{STATUS_LABEL[status]}</span>
            {rec.closed ? (
              <button type="button" className="btn btn-sm btn-quiet"
                      onClick={() => onReopen(entry.code, week.n)}>Reopen</button>
            ) : (
              <button type="button" className="btn btn-sm btn-primary"
                      onClick={() => onClose(entry.code, week.n)}>Close week {week.n}</button>
            )}
          </div>
        );
      })}
      <p className="small strip-detail-hint">
        {pinned
          ? 'Arrow keys move across the grid; the milestone and the close button follow.'
          : 'Hovering — click a cell to pin it.'}
      </p>
    </div>
  );
}
