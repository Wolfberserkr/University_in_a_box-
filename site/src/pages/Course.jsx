import React from 'react';
import { useStore } from '../lib/store.js';
import { courseMetrics, passRateBand } from '../lib/metrics.js';
import { Card, Tile, Tag, Chip, Callout } from '../components/ui.jsx';
import Markdown, { MdInline } from '../lib/markdown.jsx';

export default function Course({ code }) {
  const { data, state, today } = useStore();
  const course = data.courses.find((c) => c.code === code);
  if (!course) {
    return (
      <Callout kind="warn" icon="?" title={`No course ${code} in the catalog`}>
        <p><a href="#/courses">Back to the catalog →</a></p>
      </Callout>
    );
  }
  const live = data.enrolled[code];
  const m = live ? courseMetrics(data, state, code, today) : null;

  return (
    <>
      <div className="page-head">
        <h2>{course.code} — {course.title}</h2>
        <p>Level {course.level} · {course.credits} credits · {course.weeks} weeks · {course.load}
          {course.enrolled && <> · <Chip kind="ok">enrolled, Term A</Chip></>}</p>
      </div>

      {course.headerNote && <Markdown md={course.headerNote} className="prose" />}

      {m && (
        <div className="tiles">
          <Tile label="Weeks closed" value={m.closed} of={m.total} meter={m.closed / m.total} />
          <Tile label="At 5/5" value={m.exBaselineFull} of={m.exBaselineAttempted}
                state={passRateBand([m]).state}
                note={m.exBaselineAttempted
                  ? `${Math.round(m.passRateExBaseline * 100)}% — a diagnostic, not a grade`
                    + (m.attempted !== m.exBaselineAttempted ? ' · wk 1 excluded, baseline measured' : '')
                  : 'not graded yet'} />
          <Tile label="Slipped" value={m.slipped} of={m.slipLimit}
                state={m.slipped === 0 ? undefined : m.scopeCut ? 'bad' : 'warn'}
                note={m.scopeCut ? 'scope cut triggered' : 'the calendar does not move'} />
          <Tile label="Hours logged" value={m.hours || 0} note="against ~5 h/week" />
        </div>
      )}

      <Card title="The question">
        <Markdown md={course.question} />
      </Card>

      <Card title={`Why ${course.level}-level`}>
        <Markdown md={course.whyLevel} />
      </Card>

      <Card title={`Sequence — ${course.weeks} weeks`}>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Wk</th><th>Milestone</th><th>Primary source</th><th>Unblocks</th></tr></thead>
            <tbody>
              {course.sequence.map((r, i) => (
                <tr key={i}>
                  <td className="nowrap">{r.label}</td>
                  <td><MdInline md={r.milestone} /></td>
                  <td><MdInline md={r.source} /></td>
                  <td><MdInline md={r.unblocks} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Markdown md={course.sequenceNote} className="small" />
      </Card>

      <div className="grid grid-2">
        <Card title="Cut list">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Cut</th><th>Reason</th></tr></thead>
              <tbody>
                {course.cutList.map((c, i) => (
                  <tr key={i}>
                    <td><MdInline md={c.cut} /></td>
                    <td><MdInline md={c.reason} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Markdown md={course.cutNote} className="small" />
        </Card>

        <Card title="Sources">
          {course.sources.length > 0 ? (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Source</th><th>Tag</th><th>Checked against</th></tr></thead>
                <tbody>
                  {course.sources.map((s, i) => (
                    <tr key={i}>
                      <td><MdInline md={s.source} /></td>
                      <td><Tag tag={s.tag} /></td>
                      <td>{s.links.length
                        ? s.links.map((l) => <div key={l.href}><a href={l.href} target="_blank" rel="noreferrer noopener">{l.label}</a></div>)
                        : <MdInline md={s.verifiedAgainst} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <Markdown md={course.sourcesNote} className="small" />
        </Card>
      </div>

      <Card title="Assessment">
        <Markdown md={course.assessment} />
        <p className="small">The rubric itself is not defined here. Every course in the catalog is
          graded against <a href="#/rubric">the locked standard</a>; a course names only what is
          specific to it.</p>
      </Card>

      {course.sections
        .filter((s) => !/question|why|sequence|cut list|sources|assessment/i.test(s.title))
        .map((s, i) => (
          <Card key={i} title={s.title}>
            <Markdown md={s.md} />
          </Card>
        ))}

      {live && (
        <Card title="Live enrolment state">
          <p className="small">From <code>enrolled/{code}.md</code>. The five agents write these
            sections; the site reads them and hands changes back as a patch.</p>
          <Markdown md={live.boardNote} className="small" />
          <p className="btn-row">
            <a className="btn" href="#/weeks">Open the week boards</a>
            <a className="btn" href="#/sources">Source ledger</a>
          </p>
        </Card>
      )}
    </>
  );
}
