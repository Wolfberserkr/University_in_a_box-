import React, { useMemo, useState } from 'react';
import { useStore } from '../lib/store.js';
import { effectiveTag, ledgerMetrics, TAG_LABEL } from '../lib/metrics.js';
import { Card, Tag, Chip, Callout, StackedBar, courseKind } from '../components/ui.jsx';
import Markdown from '../lib/markdown.jsx';

const TAG_ORDER = ['H', 'V', 'R'];

/* The moves the program allows. A tag is a claim about what you have actually
   done with a source, so the picker only offers the legal ones: [R] becomes [V]
   when you name the record you checked it against, [V] becomes [H] when it
   lands in NotebookLM, and [H] can be dropped back. */
const LEGAL = { R: ['V'], V: ['R', 'H'], H: ['V'] };

function TagPicker({ row }) {
  const { state, dispatch } = useStore();
  const current = effectiveTag(state, row);
  const allowed = LEGAL[current] || [];
  return (
    <span className="tag-picker">
      {['R', 'V', 'H'].map((t) => (
        <button key={t} type="button"
                aria-pressed={current === t}
                disabled={current !== t && !allowed.includes(t)}
                title={current === t ? `Currently [${t}] — ${TAG_LABEL[t]}`
                  : allowed.includes(t) ? `Move to [${t}]`
                  : `[${current}] cannot become [${t}] directly`}
                onClick={() => {
                  if (current === t) return;
                  if (t === 'V') {
                    const note = window.prompt(
                      'Verified against which record? Name it — a PubMed ID, a DOI, a publisher page.\n\nA [V] with nothing behind it is an [R] in disguise, and rubric criterion A2 grades against the tag.',
                      state.tagNotes[row.id] || row.verifiedAgainst.replace(/[*`]/g, '') || ''
                    );
                    if (!note || !note.trim()) return;
                    dispatch({ type: 'tag:set', id: row.id, tag: 'V', note: note.trim() });
                    return;
                  }
                  dispatch({ type: 'tag:set', id: row.id, tag: t });
                }}>
          {t}
        </button>
      ))}
    </span>
  );
}

export default function Sources() {
  const { data, state } = useStore();
  const codes = Object.keys(data.enrolled);
  const ledgers = codes.map((c) => ledgerMetrics(data, state, c));
  const [q, setQ] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const rows = useMemo(() => {
    const all = codes.flatMap((code) =>
      data.enrolled[code].ledger.map((r) => ({ ...r, code, tagNow: effectiveTag(state, r) })));
    return all.filter((r) => {
      if (courseFilter && r.code !== courseFilter) return false;
      if (tagFilter && r.tagNow !== tagFilter) return false;
      if (q && !`${r.source} ${r.verifiedAgainst} ${r.status}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    }).sort((a, b) => (parseInt(a.week, 10) || 99) - (parseInt(b.week, 10) || 99));
  }, [data, state, q, tagFilter, courseFilter, codes]);

  const stack = data.sourceStack;

  return (
    <>
      <div className="page-head">
        <h2>Sources</h2>
        <p>Every source in both live courses, plus the full psychology stack behind the major.
          The tags are load-bearing: nothing gets read from an untagged row, and rubric criterion
          A2 fails an empirical claim that leans on an <span className="tag tag-r">[R]</span> source
          without saying so.</p>
      </div>

      <Callout kind="warn" icon="!" title="The Librarian is the weakest of the five">
        <p>Not because of the prompt. Curation is recall, and language models produce confident,
          well-formed citations for papers that do not exist. Run it with search enabled, or work
          from PDFs already in NotebookLM. The <span className="tag tag-v">[V]</span> to{' '}
          <span className="tag tag-r">[R]</span> ratio below is the point, not an apology.</p>
      </Callout>

      <Card title="Ledger health">
        {ledgers.map((l) => (
          <StackedBar key={l.code} label={l.code} counts={l.counts} order={TAG_ORDER}
                      total={l.total} labels={TAG_LABEL} />
        ))}
        <div className="table-scroll">
          <table>
            <thead><tr><th>Tag</th><th>Means</th><th>Trust</th></tr></thead>
            <tbody>
              {stack.tagKey.map((k) => (
                <tr key={k.tag}>
                  <td><Tag tag={k.tag} /></td>
                  <td><Markdown md={k.means} className="" /></td>
                  <td><Markdown md={k.trust} className="" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Live ledgers — enrolled courses">
        <div className="filters">
          <label htmlFor="q">Search</label>
          <input type="text" id="q" value={q} placeholder="author, journal, status"
                 onChange={(e) => setQ(e.target.value)} />
          <label htmlFor="cf">Course</label>
          <select id="cf" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">all</option>
            {codes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label htmlFor="tf">Tag</label>
          <select id="tf" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
            <option value="">all</option>
            {['H', 'V', 'R'].map((t) => <option key={t} value={t}>[{t}] {TAG_LABEL[t]}</option>)}
          </select>
          <span className="small right">{rows.length} of {ledgers.reduce((s, l) => s + l.total, 0)}</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Wk</th><th>Course</th><th>Source</th><th>Tag</th><th>Checked against</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="nowrap">{r.week}</td>
                  <td><Chip kind={courseKind(r.code)}>{r.code}</Chip></td>
                  <td>
                    <Markdown md={r.source} className="" />
                    {state.tagNotes[r.id] && (
                      <div className="small">you checked: {state.tagNotes[r.id]}</div>
                    )}
                  </td>
                  <td className="nowrap">
                    <TagPicker row={r} />
                    {r.tagNow !== r.tag && <div className="small">was [{r.tag}]</div>}
                  </td>
                  <td>
                    {r.links.length
                      ? r.links.map((l) => (
                          <div key={l.href}><a href={l.href} target="_blank" rel="noreferrer noopener">{l.label}</a></div>
                        ))
                      : <Markdown md={r.verifiedAgainst} className="" />}
                  </td>
                  <td><Markdown md={r.status} className="" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {codes.map((c) => <Markdown key={c} md={data.enrolled[c].ledgerNote} className="small" />)}
      </Card>

      <Card title="The psychology stack">
        <p className="small">The whole reading list behind the major, term by term. It is not a
          shopping list — see the acquisition order at the bottom. Buying it all in week 1 gets you
          a folder instead of a habit.</p>
        {stack.groups.map((g) => (
          <details key={g.title}>
            <summary style={{ cursor: 'pointer', padding: '.4rem 0', fontFamily: 'var(--sans)', fontSize: '.86rem', fontWeight: 600 }}>
              {g.title} <span className="dim">· {g.items.length} items</span>
            </summary>
            <Markdown md={g.intro} className="small" />
            <div className="table-scroll">
              <table>
                <thead><tr><th>#</th><th>Tag</th><th>Source</th><th>Links</th></tr></thead>
                <tbody>
                  {g.items.map((it) => (
                    <tr key={it.n}>
                      <td className="nowrap">{it.n}</td>
                      <td><Tag tag={it.tag} /></td>
                      <td><Markdown md={it.text} className="" />
                        {it.shelf && <div className="small">{it.shelf}</div>}</td>
                      <td>{it.links.map((l) => (
                        <div key={l.href}><a href={l.href} target="_blank" rel="noreferrer noopener">{l.label}</a></div>
                      ))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </Card>

      <div className="grid grid-2">
        <Card title="Acquisition order">
          <Markdown md={stack.acquisition} />
        </Card>
        <Card title="The Roommate's queue">
          <Markdown md={stack.roommateNote} className="small" />
          <ul className="prose">
            {stack.roommateQueue.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
          <p className="small">Each domain is spent after use. Listed so the Roommate does not
            default to jazz every time.</p>
        </Card>
      </div>
    </>
  );
}
