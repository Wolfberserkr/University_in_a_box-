import React from 'react';
import { useStore } from '../lib/store.js';
import { Card, Callout, Chip } from '../components/ui.jsx';
import Markdown, { MdInline } from '../lib/markdown.jsx';

export default function Rubric() {
  const { data } = useStore();
  const a = data.assessment;

  return (
    <>
      <div className="page-head">
        <h2>The standard <Chip kind="bad">locked</Chip></h2>
        <p>The standard for every course in the catalog. Written once, applies everywhere.
          Courses do not define their own rubric; they name only what is specific to them.</p>
      </div>

      <Callout kind="bad" icon="🔒" title="Why it is locked">
        <p>An AI grader drifts toward whatever standard is argued for in the moment. It will not
          argue with a document that already exists. If you find yourself wanting to edit{' '}
          <code>ASSESSMENT.md</code> during a grading round, that impulse is the exact thing the
          lock exists to defeat — log the amendment instead; it applies to the next term.
          The site is a reader for this file and cannot write to it.</p>
      </Callout>

      <Card title="Level scaling">
        <div className="table-scroll">
          <table>
            <thead><tr><th>Level</th><th>Weekly</th><th>Midterm, wk 7</th><th>Term paper, wk 14</th><th>Extra</th></tr></thead>
            <tbody>
              {a.scaling.map((r, i) => (
                <tr key={i}>
                  <td className="nowrap"><MdInline md={r.level} /></td>
                  <td><MdInline md={r.weekly} /></td>
                  <td><MdInline md={r.midterm} /></td>
                  <td><MdInline md={r.paper} /></td>
                  <td className="nowrap"><MdInline md={r.extra} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Markdown md={a.scalingNote} className="small" />
      </Card>

      <Card title="Part A — weekly output, every course, every week">
        <div className="table-scroll">
          <table>
            <thead><tr><th>#</th><th>Criterion</th><th>Fails if</th></tr></thead>
            <tbody>
              {a.partA.map((c) => (
                <tr key={c.id}>
                  <td className="nowrap"><strong>{c.id}</strong></td>
                  <td><MdInline md={c.criterion} /></td>
                  <td><MdInline md={c.failsIf} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Markdown md={a.partANote} className="small" />
      </Card>

      <Card title="Part B — term paper, week 14 of any course">
        <div className="table-scroll">
          <table>
            <thead><tr><th>#</th><th>Criterion</th><th>Fails if</th></tr></thead>
            <tbody>
              {a.partB.map((c) => (
                <tr key={c.id}>
                  <td className="nowrap"><strong>{c.id}</strong></td>
                  <td><MdInline md={c.criterion} /></td>
                  <td><MdInline md={c.failsIf} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Markdown md={a.partBNote} className="small" />
      </Card>

      <Card title="Part C — capstone, week 52">
        <Markdown md={a.partC} />
      </Card>

      <Card title="Part D — programme level, at each award boundary">
        <Markdown md={a.partDNote} />
        <ol className="prose">
          {a.partD.map((q) => <li key={q.n}><MdInline md={q.q} /></li>)}
        </ol>
      </Card>
    </>
  );
}
