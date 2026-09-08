import React from 'react';
import { useStore } from '../lib/store.js';
import { courseMetrics, creditMetrics } from '../lib/metrics.js';
import { Card, Tile, Callout, Chip, courseKind } from '../components/ui.jsx';
import Markdown from '../lib/markdown.jsx';

export default function Program() {
  const { data, state, today } = useStore();
  const codes = Object.keys(data.enrolled);
  const courses = codes.map((c) => courseMetrics(data, state, c, today));
  const credits = creditMetrics(data, state, courses);
  const d = data.degree;
  const r = data.registrar;

  return (
    <>
      <div className="page-head">
        <h2>The programme</h2>
        <p>Credit accounting done honestly, the levels, the awards, the calendar, the transcript,
          and the four gaps that are not papered over.</p>
      </div>

      <div className="tiles">
        <Tile label="Credits" value={credits.earnedRecorded} of={credits.totalPlanned}
              meter={credits.totalPlanned ? credits.earnedRecorded / credits.totalPlanned : 0}
              note="3 per course, recorded on completion" />
        <Tile label="Courses complete" value={credits.coursesComplete} of={credits.coursesPlanned}
              note={`Certificate needs ${credits.certificateNeeds} — one course of slack`} />
        <Tile label="Award target" value={r.award.split('(')[0].trim()}
              note={r.award.includes('(') ? r.award.slice(r.award.indexOf('(')) : ''} />
        <Tile label="Programme start" value={r.programStart} note={r.capacity.split('(')[0].trim()} />
      </div>

      <Card title="Transcript">
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Course</th><th>Title</th><th>Lvl</th><th>Cr</th><th>Term</th>
                <th>Weekly pass rate</th><th>Paper</th><th>Result</th></tr>
            </thead>
            <tbody>
              {r.transcript.map((row) => {
                const m = courses.find((c) => c.code === row.code);
                return (
                  <tr key={row.code}>
                    <td className="nowrap"><a href={`#/courses/${row.code}`}>{row.code}</a></td>
                    <td>{row.title}</td>
                    <td className="nowrap">{row.level}</td>
                    <td className="nowrap">{row.credits}</td>
                    <td className="nowrap">{row.term}</td>
                    <td className="nowrap">
                      {row.passRate !== '—' ? row.passRate
                        : m && m.attempted
                          ? <span title="not yet written back to REGISTRAR.md">
                              {Math.round(m.passRate * 100)}% <span className="dim">unwritten</span>
                            </span>
                          : <span className="dim">—</span>}
                    </td>
                    <td className="nowrap">{row.paper}</td>
                    <td className="nowrap">{row.result}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Markdown md={r.transcriptNote} className="small" />
      </Card>

      <Card title="Calendar 2026–27">
        <div className="table-scroll">
          <table>
            <thead><tr><th>Block</th><th>Weeks</th><th>Dates</th><th>Enrolled</th></tr></thead>
            <tbody>
              {r.terms.map((t, i) => (
                <tr key={i} style={t.start && t.start <= today && (!t.end || t.end >= today)
                  ? { background: 'var(--accent-soft)' } : undefined}>
                  <td className="nowrap">{t.label}</td>
                  <td className="nowrap">{t.weeks}</td>
                  <td className="nowrap">{t.dates}</td>
                  <td>{t.enrolled.map((c) => (
                    <React.Fragment key={c}><Chip kind={courseKind(c)}>{c}</Chip>{' '}</React.Fragment>
                  ))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Markdown md={r.calendarNote} className="small" />
      </Card>

      <Card title="Credit accounting">
        <Markdown md={d.creditMd} />
        <div className="table-scroll">
          <table>
            <thead><tr><th>University hour</th><th>Do you pay it?</th></tr></thead>
            <tbody>
              {d.overhead.map((o, i) => (
                <tr key={i}>
                  <td><Markdown md={o.hour} className="" /></td>
                  <td className="nowrap"><Markdown md={o.paid} className="" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-2">
        <Card title="Levels">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Level</th><th>Relationship to the material</th><th>Assessment</th></tr></thead>
              <tbody>
                {d.levels.map((l, i) => (
                  <tr key={i}>
                    <td className="nowrap"><Markdown md={l.level} className="" /></td>
                    <td><Markdown md={l.relationship} className="" /></td>
                    <td><Markdown md={l.assessment} className="" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Markdown md={d.levelsNote} className="small" />
        </Card>

        <Card title="Awards">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Award</th><th>Courses</th><th>Time</th><th>Requires</th></tr></thead>
              <tbody>
                {d.awards.map((a, i) => (
                  <tr key={i}>
                    <td className="nowrap"><Markdown md={a.award} className="" /></td>
                    <td className="nowrap">{a.courses}</td>
                    <td className="nowrap">{a.time}</td>
                    <td><Markdown md={a.requires} className="" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Markdown md={d.awardsNote} className="small" />
        </Card>
      </div>

      <Card title="Baseline and intake">
        <div className="table-scroll">
          <table>
            <thead><tr><th /><th>Question</th><th>State</th><th>Effect</th></tr></thead>
            <tbody>
              {r.intake.map((q) => (
                <tr key={q.id}>
                  <td className="nowrap"><strong>{q.id}</strong></td>
                  <td><Markdown md={q.question} className="" /></td>
                  <td className="nowrap">
                    {q.declined ? <Chip kind="warn">declined</Chip>
                      : q.answered ? <Chip kind="ok">answered</Chip>
                      : <Chip>open</Chip>}
                  </td>
                  <td><Markdown md={q.effect} className="" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small">The answers themselves, and the sealed Priors Sheet, stay in the
          repository — <code>logs/PSY-101/week-01.md</code> and <code>REGISTRAR.md</code>. This
          site records that they exist and are sealed; it does not publish them.
          {data.logs.count > 0 && ` ${data.logs.count} weekly log file${data.logs.count === 1 ? '' : 's'} on disk.`}</p>
      </Card>

      <Card title="Standing rules">
        <Markdown md={r.rulesMd} />
      </Card>

      <Callout kind="warn" icon="!" title="No accreditation">
        <p>Nobody outside this repository recognises any of it. The transcript is a record for you,
          not a credential for anyone else.</p>
      </Callout>

      <Card title="The four honest gaps">
        <Markdown md={d.gapsIntro} />
        <ol className="prose">
          {d.gaps.map((g, i) => (
            <li key={i} style={{ marginBottom: '.55rem' }}>
              <strong>{g.title}.</strong> <Markdown md={g.body} className="" />
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
