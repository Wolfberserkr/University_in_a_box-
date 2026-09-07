import React from 'react';
import { useStore } from '../lib/store.js';
import { locate, fmtRange, fmtLong, daysBetween, DAY_NAMES, toDate } from '../lib/calendar.js';
import { setupMetrics } from '../lib/metrics.js';
import { Card, Callout, Tag, Chip, courseKind } from '../components/ui.jsx';
import Markdown from '../lib/markdown.jsx';
import WeekPanel from '../components/WeekPanel.jsx';

export default function Now() {
  const { data, state, dispatch, today, previewDate, setPreviewDate } = useStore();
  const weeks = data.termA.weeks;
  const here = locate(weeks, today);
  const setup = setupMetrics(data, state);
  const sh = data.startHere;

  const dayName = DAY_NAMES[toDate(today).getDay()];
  const rhythmToday = sh.rhythm.find((r) => r.day === dayName);
  const week1Today = here.phase === 'in' && here.week.n === 1
    ? sh.week1.find((r) => r.day.startsWith(dayName))
    : null;

  return (
    <>
      <div className="page-head">
        <h2>Right now</h2>
        <p>{fmtLong(today)}. One question, answered in under three seconds: what do I do today?</p>
      </div>

      {here.phase === 'pre' ? (
        <Callout kind="info" icon="◷" title={`${daysBetween(today, weeks[0].start)} days until week 1`}>
          <p>Term A opens {fmtLong(weeks[0].start)}. Until then the work is the checklist below —
            about 90 minutes total, spread across four days.</p>
        </Callout>
      ) : here.phase === 'in' ? (
        <Card title={`Week ${here.week.n} · ${fmtRange(here.week.start, here.week.end)} · ${dayName}`}>
          <h3 style={{ marginTop: 0 }}>
            {week1Today ? <Markdown md={week1Today.do} className="" />
              : rhythmToday ? rhythmToday.do
              : 'Nothing scheduled today.'}
          </h3>
          {week1Today && <p className="small">Week 1 runs to its own plan · {week1Today.time}</p>}
          {!week1Today && rhythmToday && (
            <p className="small">
              The standing rhythm. {dayName === 'Sat' && !here.week.roommate
                ? 'The Roommate is fortnightly and this is an odd week — nothing today.'
                : dayName === 'Tue' || dayName === 'Wed'
                  ? 'Nobody talks to you on reading days.'
                  : ''}
            </p>
          )}
        </Card>
      ) : (
        <Callout kind="ok" icon="✓" title="Term A is behind you">
          <p>Weeks 1–14 are done. What the transcript records, and what Term B opens with, is on
            the <a href="#/program">programme page</a>.</p>
        </Callout>
      )}

      {here.phase === 'in' && <WeekPanel week={here.week} open />}

      {/* ------------------------------ setup ------------------------------ */}

      <Card title={`Before Monday — ${setup.done} of ${setup.total} done`}>
        <Markdown md={sh.setupIntro} />
        <ol className="checklist">
          {sh.setup.map((step) => {
            const done = !!state.setup[step.n] || step.done;
            return (
              <li key={step.n} className={done ? 'done' : ''}>
                <div className="check-row">
                  <input type="checkbox" id={`setup-${step.n}`} checked={done}
                         onChange={() => dispatch({ type: 'setup:toggle', n: step.n })} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <label htmlFor={`setup-${step.n}`}>
                      <span className="check-title">{step.n}. {step.title}</span>
                      {step.note && <span className="check-meta"> · {step.note}</span>}
                    </label>
                    <details>
                      <summary className="check-meta" style={{ cursor: 'pointer' }}>What this involves</summary>
                      <Markdown md={step.md} />
                    </details>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* ------------------------- the weekly rhythm ------------------------ */}

      <div className="grid grid-2">
        <Card title="Every week, after week 1">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Day</th><th>Do</th></tr></thead>
              <tbody>
                {sh.rhythm.map((r) => (
                  <tr key={r.day} style={r.day === dayName && here.phase === 'in'
                    ? { background: 'var(--accent-soft)' } : undefined}>
                    <td className="nowrap"><strong>{r.day}</strong></td>
                    <td>{r.do}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small">Week 7 is the midterm, both courses, oral and cold. Week 14 is the
            term paper, 2,000 words each.</p>
        </Card>

        <Card title="Week 1, day by day">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Day</th><th>Do</th><th>Time</th></tr></thead>
              <tbody>
                {data.startHere.week1.map((r) => (
                  <tr key={r.day}>
                    <td className="nowrap"><strong>{r.day}</strong></td>
                    <td><Markdown md={r.do} className="" /></td>
                    <td className="nowrap dim">{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Markdown md={data.startHere.week1Note.split('\n\n').slice(-1)[0]} className="small" />
        </Card>
      </div>

      {/* ------------------------------- preview ---------------------------- */}

      <Card title="Preview a different date">
        <div className="btn-row" style={{ alignItems: 'center' }}>
          <label htmlFor="preview">Show the whole site as it will read on</label>
          <input type="date" id="preview" style={{ width: 'auto' }}
                 min="2026-08-01" max="2027-10-01"
                 value={previewDate || ''}
                 onChange={(e) => setPreviewDate(e.target.value || null)} />
          {previewDate && (
            <button type="button" className="btn btn-quiet" onClick={() => setPreviewDate(null)}>Back to today</button>
          )}
        </div>
        <p className="small">Preview only. Nothing is saved and no tick changes — but the
          slipped-week counter and the week boards follow the previewed date too, which is the
          point: it shows you what October looks like if this week does not happen.</p>
      </Card>

      {/* ------------------------------- enders ----------------------------- */}

      <Card title="The four things that actually end this">
        <Markdown md={data.startHere.endersIntro} />
        <ol className="prose">
          {data.startHere.enders.map((e) => (
            <li key={e.n} style={{ marginBottom: '.6rem' }}>
              <strong>{e.title}.</strong> <Markdown md={e.body} className="" />
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Owed later, easy to forget">
        {data.startHere.owed.map((o, i) => (
          <div key={i} style={{ marginBottom: '.8rem' }}>
            <h4 style={{ margin: '0 0 .2rem' }}>{o.title}</h4>
            <Markdown md={o.body} />
          </div>
        ))}
      </Card>
    </>
  );
}
