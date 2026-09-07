import React, { useMemo, useState } from 'react';
import { useStore, KEY } from '../lib/store.js';
import { buildPatch, patchText } from '../lib/patch.js';
import { Card, Callout, Copy } from '../components/ui.jsx';

export default function Data() {
  const { data, state, dispatch, today, canStore } = useStore();
  const [io, setIo] = useState(null);          // 'export' | 'import' | null
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  const blocks = useMemo(() => buildPatch(data, state, today), [data, state, today]);
  const patch = useMemo(() => patchText(blocks, today), [blocks, today]);
  const edits = blocks.reduce((s, b) => s + b.edits.length, 0);

  const download = (name, body) => {
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
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

      <Card title={`Sunday close — ${edits} edit${edits === 1 ? '' : 's'} to write back`}>
        <p className="small">
          A static page cannot commit, and a browser holding a repository write token is worse
          than a copy-paste step. So this is the patch: for every change, the line as the site
          last read it out of the file, and the line it should become. Paste it into the files,
          or hand the whole block to Claude Code in this repository and let it apply them.
        </p>
        {edits === 0 ? (
          <p className="small">Nothing to write back yet — no week closed, no tag moved, no gap
            logged since the site last read the repository.</p>
        ) : (
          <>
            <div className="btn-row">
              <Copy text={patch} label="Copy the patch" />
              <button type="button" className="btn"
                      onClick={() => download(`uib-close-${today}.md`, patch)}>Download .md</button>
            </div>
            {blocks.map((b) => (
              <div key={b.path}>
                <h4>{b.path}</h4>
                <ul className="prose">
                  {b.edits.map((e, i) => <li key={i}><code>{e.section}</code> — {e.why}</li>)}
                </ul>
                {b.notes.map((n, i) => (
                  <Callout key={i} kind="warn" icon="!"><p>{n}</p></Callout>
                ))}
              </div>
            ))}
            <pre><code>{patch}</code></pre>
          </>
        )}
      </Card>

      <Callout kind="info" icon="→" title="After you apply it">
        <p>Re-run <code>python3 tools/build-site-data.py</code> and rebuild, so the site reads the
          new file rather than remembering the old one. Until you do, the patch keeps offering the
          same edits — which is the correct behaviour, not a bug: an unapplied close is an open week.</p>
      </Callout>

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
          The site holds no curriculum of its own. <code>tools/build-site-data.py</code> reads
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
