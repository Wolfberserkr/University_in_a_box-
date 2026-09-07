import React from 'react';
import { useStore } from '../lib/store.js';
import { locate } from '../lib/calendar.js';
import { agentBrief } from '../lib/briefs.js';
import { Card, Callout, Copy, Chip, courseKind } from '../components/ui.jsx';
import Markdown from '../lib/markdown.jsx';

export default function Agents() {
  const { data, state, today } = useStore();
  const here = locate(data.termA.weeks, today);
  const weekNo = here.phase === 'in' ? here.week.n : 1;
  const codes = Object.keys(data.enrolled);

  return (
    <>
      <div className="page-head">
        <h2>The faculty</h2>
        <p>ALTER describes five roles, and it runs each course. The catalog, levels, prerequisites,
          credit accounting and transcript are the institution — that separation is what lets you
          take Statistics and Psychology in the same term and have it mean something.</p>
      </div>

      <Callout kind="info" icon="→" title="Every agent binds to a course before it does anything">
        <p>Registrar → active enrolment → course file. That is what stops five agents from becoming
          five disconnected chat windows. The briefs below carry the binding plus this week's live
          state, so a session opens already bound.</p>
      </Callout>

      <Card title="Who owns what">
        <div className="table-scroll">
          <table>
            <thead><tr><th /><th>Agent</th><th>Owns, per enrolled course</th><th>Refuses to</th></tr></thead>
            <tbody>
              {data.agents.map((a) => (
                <tr key={a.name}>
                  <td className="nowrap"><strong>{a.letter}</strong></td>
                  <td className="nowrap">{a.title}</td>
                  <td><Markdown md={a.owns} className="" /></td>
                  <td><Markdown md={a.refuses} className="" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={`Briefs for week ${weekNo}`}>
        <p className="small">Copy one into the agent — a Claude Code subagent, or a claude.ai
          Project with <code>AGENT-PACK.md</code> in its knowledge. The brief is generated from
          the live board and your own ticks, so it already names the milestone, the source, the
          open gaps and the last verdict.</p>
        {codes.map((code) => (
          <div key={code} style={{ margin: '.9rem 0' }}>
            <p className="card-title"><Chip kind={courseKind(code)}>{code}</Chip></p>
            {data.agents.map((agent) => {
              const text = agentBrief({ data, state, agent, code, weekNo });
              return (
                <details key={agent.name}>
                  <summary className="small" style={{ cursor: 'pointer', padding: '.25rem 0' }}>
                    {agent.letter} · {agent.title}
                  </summary>
                  <div className="btn-row"><Copy text={text} label="Copy brief" /></div>
                  <pre><code>{text}</code></pre>
                </details>
              );
            })}
          </div>
        ))}
      </Card>

      {data.agents.map((a) => (
        <Card key={a.name} title={`${a.letter} · ${a.title}`}>
          <div className="agent-card">
            <div className="agent-letter" aria-hidden="true">{a.letter}</div>
            <div style={{ minWidth: 0 }}>
              <p className="small" style={{ marginTop: 0 }}>{a.description}</p>
              <p className="small">Owns <Markdown md={a.owns} className="" /> ·
                Tools: {a.tools.join(', ') || '—'} · <code>{a.path}</code></p>
              <div className="btn-row">
                <Copy text={a.prompt} label="Copy the full system prompt" />
              </div>
              <details>
                <summary className="small" style={{ cursor: 'pointer' }}>Read the system prompt</summary>
                <Markdown md={a.prompt} />
              </details>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}
