import React from 'react';
import { useStore } from '../lib/store.js';
import { Card, Chip } from '../components/ui.jsx';
import Markdown, { MdInline } from '../lib/markdown.jsx';

export default function Courses() {
  const { data } = useStore();
  const bySubject = {};
  data.courses.forEach((c) => {
    (bySubject[c.subject] = bySubject[c.subject] || []).push(c);
  });

  return (
    <>
      <div className="page-head">
        <h2>The catalog</h2>
        <p>Courses are reusable definitions. Enrolling copies a course into{' '}
          <code>enrolled/&lt;CODE&gt;.md</code> where the five agents write its live state —
          a course in the catalog is inert; an enrolment is alive.</p>
      </div>

      {data.catalog.subjects.map((s) => (
        <Card key={s.prefix} title={`${s.name} — ${s.prefix}`}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Code</th><th>Title</th><th>Lvl</th><th>Cr</th><th>Prerequisite</th><th>Unblocks</th><th /></tr>
              </thead>
              <tbody>
                {(bySubject[s.prefix] || []).map((c) => (
                  <tr key={c.code}>
                    <td className="nowrap"><a href={`#/courses/${c.code}`}>{c.code}</a></td>
                    <td>{c.title}</td>
                    <td className="nowrap">{c.level}</td>
                    <td className="nowrap">{c.credits}</td>
                    <td><MdInline md={c.prerequisite} /></td>
                    <td><MdInline md={c.unblocks} /></td>
                    <td className="nowrap">{c.enrolled && <Chip kind="ok">enrolled</Chip>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Markdown md={s.note} className="small" />
        </Card>
      ))}

      <div className="grid grid-2">
        <Card title="Enrolment plan">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Term</th><th>Slot 1</th><th>Slot 2</th></tr></thead>
              <tbody>
                {data.catalog.plan.map((p) => (
                  <tr key={p.term}>
                    <td className="nowrap">{p.term}</td>
                    <td><MdInline md={p.slot1} /></td>
                    <td><MdInline md={p.slot2} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Markdown md={data.catalog.planNote} className="small" />
        </Card>

        <Card title="Candidate subjects for Terms B and C">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Subject</th><th>Would open with</th><th>Why it pairs</th></tr></thead>
              <tbody>
                {data.catalog.future.map((f, i) => (
                  <tr key={i}>
                    <td><MdInline md={f.subject} /></td>
                    <td><MdInline md={f.opensWith} /></td>
                    <td><MdInline md={f.why} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small">Each would displace a psychology course — two concurrent is the cap
            and it is not a suggestion.</p>
        </Card>
      </div>

      <Card title="The psychology major">
        <p className="small">{data.major.title}. The subject-wide program statement and cut list,
          which is what lets the Advisor refuse things.</p>
        {data.major.sections.map((s, i) => (
          <details key={i}>
            <summary style={{ cursor: 'pointer', padding: '.35rem 0', fontFamily: 'var(--sans)', fontSize: '.85rem' }}>{s.title}</summary>
            <Markdown md={s.md} />
          </details>
        ))}
      </Card>

      <Card title="Adding a subject">
        <Markdown md={data.catalog.adding} />
      </Card>
    </>
  );
}
