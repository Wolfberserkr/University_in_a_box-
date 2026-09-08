import React, { useMemo, useState } from 'react';
import { useStore, KEY } from '../lib/store.js';
import { buildPatch, patchText, patchSummary } from '../lib/patch.js';
import { fmtLong, toDate, DAY_NAMES } from '../lib/calendar.js';
import { Card, Callout, Copy } from '../components/ui.jsx';

export default function Data() {
  const { data, state, dispatch, today, canStore, announce } = useStore();
  const [io, setIo] = useState(null);          // 'export' | 'import' | null
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  const blocks = useMemo(() => buildPatch(data, state, today), [data, state, today]);
  const patch = useMemo(() => patchText(blocks, today), [blocks, today]);
  const edits = blocks.reduce((s, b) => s + b.edits.length, 0);
  const audit = useMemo(() => patchSummary(blocks, data.patchTargets), [blocks, data]);
  const rows = blocks.reduce((s, b) => s + b.edits.reduce((t, e) => t + (e.rows ? e.rows.length : 0) + (e.find ? 1 : 0), 0), 0);
  const notes = blocks.reduce((s, b) => s + b.notes.length, 0);
  const isSunday = DAY_NAMES[toDate(today).getDay()] === 'Sun';
  const last = (state.closes || [])[0];

  const download = (name, body) => {
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    document.body.append(a);
    a.click();
    // the click is queued; revoking in the same tick cancels the download
    requestAnimationFrame(() => { a.remove(); URL.revokeObjectURL(url); });
  };

  return (
    <>
      <div className="page-head">
        <h2>Your data</h2>
        <p>Ticks, closed weeks, rubric marks, gaps and tags live in this browser only — per
          browser, per device, never uploaded anywhere. The record is the repository, and the
          Sunday close is where this page hands its state back to it.</p>
      </div>

      {!canStore && (
        <Callout kind="warn" icon="!" title="Storage is blocked in this browser">
          <p>Everything below still works for this tab, and then it is gone. Export before you close it.</p>
        </Callout>
      )}

      {/* -------------------------- the write-back ------------------------- */}

      <Card title="The Sunday close"
            actions={last && (
              <span className="small">Last close {fmtLong(last.on).replace(/,.*/, '')} · {last.edits} edit{last.edits === 1 ? '' : 's'}</span>
            )}>
        <div className="close-head">
          <p className="close-count">
            <strong>{edits}</strong> edit{edits === 1 ? '' : 's'}
            <span className="dim"> · {rows} line{rows === 1 ? '' : 's'} · {blocks.length} file{blocks.length === 1 ? '' : 's'}</span>
          </p>
          <p className="small">
            {isSunday
              ? 'It is Sunday. The Editor grades, the Advisor closes the week, and this is what goes back into the files.'
              : `Not Sunday — ${fmtLong(today)}. The close runs on Sunday; this is what it would write today.`}
          </p>
        </div>

        <p className="small">
          A static page cannot commit, and a browser holding a repository write token is worse
          than a copy-paste step. So this is the patch: for every change, the line as the site
          last read it out of the file, and the line it should become. Paste it into the files,
          or hand the whole block to Claude Code in this repository and let it apply them.
        </p>

        {edits === 0 ? (
          <p className="small">Nothing to write back. Every week you have closed, every tag you
            have moved and every gap you have logged is already in the repository as the site
            last read it.</p>
        ) : (
          <>
            <div className="btn-row">
              <Copy className="btn btn-primary" text={patch} label="Copy the whole patch" />
              <button type="button" className="btn"
                      onClick={() => download(`uib-close-${today}.md`, patch)}>Download .md</button>
              <button type="button" className="btn btn-quiet right"
                      onClick={() => {
                        dispatch({ type: 'close:record', on: today, edits, files: blocks.map((b) => b.path) });
                        announce(`Close recorded: ${edits} edit${edits === 1 ? '' : 's'} across ${blocks.length} file${blocks.length === 1 ? '' : 's'}. Re-run the build so the site reads the new files.`);
                      }}>I have applied this</button>
            </div>

            {audit.problems.length === 0 ? (
              <p className="verify-line">
                <span className="verify-mark" aria-hidden="true">✓</span>
                {audit.edits} edit{audit.edits === 1 ? '' : 's'} across {audit.files} file{audit.files === 1 ? '' : 's'}
                {audit.rows > 0 && <>, {audit.rows} appended row{audit.rows === 1 ? '' : 's'}</>}
                {' '}— applied to the files as the site read them on {data.generated.slice(0, 10)}, every one matched exactly once and nothing was left over.
              </p>
            ) : (
              <Callout kind="bad" icon="!" title="This patch contradicts itself — do not paste it">
                <ul>{audit.problems.map((pr, i) => <li key={i}>{pr}</li>)}</ul>
                <p>This is a bug in the site, not in your work. The repository is unchanged
                  and your progress is safe; report it rather than applying anything above.</p>
              </Callout>
            )}

            {notes > 0 && blocks.flatMap((b) => b.notes.map((n, i) => (
              <Callout key={`${b.path}-${i}`} kind="warn" icon="!" title={`${b.path} — read this before pasting`}>
                <p>{n}</p>
              </Callout>
            )))}

            {blocks.map((b) => (
              <section className="close-file" key={b.path}>
                <div className="close-file-head">
                  <h4><code>{b.path}</code></h4>
                  <span className="small dim">{b.edits.length} edit{b.edits.length === 1 ? '' : 's'}</span>
                  <Copy className="btn btn-sm right" text={patchText(blocks, today, b.path)}
                        label={`Copy just ${b.path.split('/').pop()}`} />
                </div>
                {b.edits.map((e, i) => (
                  <div className="diff" key={i}>
                    <p className="diff-why"><span className="diff-section">{e.section}</span> {e.why}</p>
                    {e.find && (
                      <>
                        <p className="diff-line del"><span aria-hidden="true">−</span>{e.find}</p>
                        <p className="diff-line add"><span aria-hidden="true">+</span>{e.replace}</p>
                      </>
                    )}
                    {e.rows && e.rows.length > 0 && (
                      <>
                        <p className="diff-line ctx"><span aria-hidden="true"> </span>{e.appendTo}</p>
                        {e.rows.map((r, j) => (
                          <p className="diff-line add" key={j}><span aria-hidden="true">+</span>{r}</p>
                        ))}
                      </>
                    )}
                  </div>
                ))}
              </section>
            ))}

            <details className="disclose">
              <summary className="small">The patch as plain text</summary>
              <div className="disclose-body"><pre><code>{patch}</code></pre></div>
            </details>
          </>
        )}
      </Card>

      <Callout kind="info" icon="→" title="After you apply it">
        <p>Re-run <code>python3 tools/build-site-data.py</code> and rebuild, so the site reads the
          new files. Until you do, a checkbox or a tag the patch has already moved keeps being
          offered — those edits are idempotent and re-applying one changes nothing. The appended
          rows in §C, §D and §E are not offered twice: the patch compares what this browser holds
          against what the parser read out of the files, so a verdict already written back is
          simply absent from the next close.</p>
      </Callout>

      {(state.closes || []).length > 0 && (
        <Card title="Closes recorded in this browser">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Closed on</th><th>Edits</th><th>Files</th><th>Recorded</th></tr></thead>
              <tbody>
                {state.closes.map((c, i) => (
                  <tr key={i}>
                    <td className="nowrap">{c.on}</td>
                    <td className="nowrap">{c.edits}</td>
                    <td>{(c.files || []).join(' · ')}</td>
                    <td className="nowrap dim">{String(c.at).slice(0, 16).replace('T', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small">A memory aid, not a receipt: this page cannot see the repository,
            so it records that you said you applied a patch, not that the files changed.</p>
        </Card>
      )}

      {/* ---------------------------- export / import ---------------------- */}

      <Card title="Export and import">
        <p className="small">
          A cleared cache takes the term with it. Export after the Sunday close and keep the file
          somewhere that is not a browser cache; import restores it, including onto another device.
        </p>
        <div className="btn-row">
          <button type="button" className="btn" onClick={() => {
            setIo('export'); setText(JSON.stringify(state, null, 2)); setStatus('');
          }}>Show JSON</button>
          <button type="button" className="btn" onClick={() =>
            download(`uib-progress-${today}.json`, JSON.stringify(state, null, 2))}>Download JSON</button>
          <button type="button" className="btn" onClick={() => {
            setIo('import'); setText(''); setStatus('');
          }}>Import JSON</button>
          <button type="button" className="btn btn-danger" onClick={() => {
            if (window.confirm('Erase every tick, closed week, rubric mark, gap and tag change in this browser?\n\nThe repository is untouched. Export first if you have not.')) {
              dispatch({ type: 'state:reset' });
              setStatus('Reset. The repository is untouched.');
              announce('Progress reset in this browser. The repository is untouched.', 'warn');
              setIo(null);
            }
          }}>Reset everything</button>
        </div>

        {io && (
          <div className="copybox">
            <div className="field">
              <label htmlFor="io">{io === 'export' ? 'Your progress, as JSON' : 'Paste exported JSON here'}</label>
              <textarea id="io" value={text} spellCheck="false"
                        onChange={(e) => setText(e.target.value)} />
            </div>
            <div className="btn-row">
              {io === 'export' && <Copy text={text} label="Copy" />}
              {io === 'import' && (
                <button type="button" className="btn btn-primary" onClick={() => {
                  try {
                    const parsed = JSON.parse(text);
                    dispatch({ type: 'state:import', state: parsed });
                    setStatus('Loaded.');
                    announce('Progress imported.');
                    setIo(null);
                  } catch {
                    setStatus('That is not valid JSON. Nothing was changed.');
                  }
                }}>Load this data</button>
              )}
              <button type="button" className="btn btn-quiet" onClick={() => setIo(null)}>Close</button>
            </div>
          </div>
        )}
        {status && <p className="small">{status}</p>}
        <p className="small">Stored under <code>{KEY}</code> in this browser's localStorage.
          Progress from the previous single-page reader (<code>uib.termA.v1</code>) is migrated
          automatically the first time this page loads.</p>
      </Card>

      <Card title="Where everything comes from">
        <p className="small">
          The site holds no curriculum of its own. <code>tools/build-site-data.py</code> reads{' '}
          <code>REGISTRAR.md</code>, <code>DEGREE.md</code>, <code>CATALOG.md</code>,{' '}
          <code>ASSESSMENT.md</code>, <code>START-HERE.md</code>, <code>catalog/*.md</code>,{' '}
          <code>enrolled/*.md</code> and <code>.claude/agents/*.md</code>, and writes one JSON
          file the pages render. Change a week board in the repository and the site follows on the
          next build; there is no second, disagreeing record to keep in sync by hand.
        </p>
        <p className="small">
          Personal work is deliberately not read in. The Priors Sheet, the intake answers and the
          weekly outputs stay in <code>logs/</code> and <code>REGISTRAR.md</code>; the site records
          that they exist and are sealed, and publishes none of them.
          Curriculum data generated {data.generated}.
        </p>
      </Card>
    </>
  );
}
