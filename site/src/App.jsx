import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import data from './data/curriculum.json';
import { StoreContext, reducer, load, save, storageAvailable } from './lib/store.js';
import { todayISO, fmtLong, locate } from './lib/calendar.js';
import { Callout } from './components/ui.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Now from './pages/Now.jsx';
import Weeks from './pages/Weeks.jsx';
import Courses from './pages/Courses.jsx';
import Course from './pages/Course.jsx';
import Sources from './pages/Sources.jsx';
import Rubric from './pages/Rubric.jsx';
import Agents from './pages/Agents.jsx';
import Program from './pages/Program.jsx';
import DataPage from './pages/Data.jsx';

const TABS = [
  ['', 'Dashboard'],
  ['now', 'Right now'],
  ['weeks', 'Term A'],
  ['courses', 'Courses'],
  ['sources', 'Sources'],
  ['rubric', 'The standard'],
  ['agents', 'The faculty'],
  ['program', 'Programme'],
  ['data', 'Your data'],
];

function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

/* A page meant to be opened every morning has to survive being left open
   overnight: today is derived from the clock at render, and nothing re-renders
   on its own. So schedule one timer at the next local midnight, bump a counter,
   and let the week roll over live. */
function useMidnight() {
  const [, tick] = useReducer((n) => n + 1, 0);
  useEffect(() => {
    let timer;
    const arm = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 30);
      timer = setTimeout(() => { tick(); arm(); }, Math.max(1000, next - now));
    };
    arm();
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, []);
}

/* A render that throws must not take the Reset button down with it: /data is
 * the only route that can recover a broken state, so a crash shows a way out
 * rather than a blank page. */
class Boundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Callout kind="bad" icon="!" title="This page could not be rendered">
        <p>Your progress data is probably malformed — an imported file, or a
          half-written record. The repository is untouched.</p>
        <p><code>{String(this.state.error.message || this.state.error)}</code></p>
        <p className="btn-row">
          <button type="button" className="btn btn-danger" onClick={() => {
            try { window.localStorage.removeItem('uib.v2'); } catch { /* nothing to clear */ }
            window.location.reload();
          }}>Clear this browser's progress and reload</button>
        </p>
      </Callout>
    );
  }
}

export default function App() {
  const route = useHashRoute();
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [previewDate, setPreviewDate] = useState(null);
  const [canStore] = useState(storageAvailable);
  const [notice, setNotice] = useState(null);
  useMidnight();

  /* week:set fires per keystroke in the hours and note fields; writing the whole
     term to localStorage on each one is wasted work. Coalesce. */
  useEffect(() => {
    if (!canStore) return undefined;
    const t = setTimeout(() => save(state), 300);
    return () => clearTimeout(t);
  }, [state, canStore]);

  const announce = useCallback((text, tone = 'ok') => {
    setNotice({ text, tone, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 5200);
    return () => clearTimeout(t);
  }, [notice]);

  const today = previewDate || todayISO();
  const ctx = useMemo(
    () => ({ data, state, dispatch, today, realToday: todayISO(), previewDate, setPreviewDate, canStore, announce }),
    [state, today, previewDate, canStore, announce]
  );

  const [head, param] = route.split('/');
  let page;
  switch (head) {
    case '': page = <Dashboard />; break;
    case 'now': page = <Now />; break;
    case 'weeks': page = <Weeks focus={param ? Number(param) : null} />; break;
    case 'courses': page = param ? <Course code={param} /> : <Courses />; break;
    case 'sources': page = <Sources />; break;
    case 'rubric': page = <Rubric />; break;
    case 'agents': page = <Agents />; break;
    case 'program': page = <Program />; break;
    case 'data': page = <DataPage />; break;
    default: page = <Dashboard />;
  }

  const term = data.termA.term;
  // Name the block today is in, not the one the site was built around.
  const at = locate(data.termA.weeks, today, data.registrar.terms);
  const blockLabel = at.block ? at.block.label : at.nextBlock ? `before ${at.nextBlock.label}` : term.label;

  return (
    <StoreContext.Provider value={ctx}>
      <a className="skip" href="#main">Skip to content</a>
      <header className="masthead">
        <div className="masthead-inner">
          <h1><a href="#/">University in a Box</a><span className="sep">·</span>
            <span style={{ fontWeight: 400 }}>{blockLabel}</span></h1>
          <p className="mast-meta">
            <span className="mast-who">{data.registrar.student} · {term.enrolled.join(' + ')} · </span>
            {fmtLong(today)}{previewDate && ' — previewed'}
          </p>
        </div>
        <div className="tabs-wrap">
          <nav className="tabs" aria-label="Sections">
            {TABS.map(([slug, label]) => (
              <a key={slug} href={`#/${slug}`}
                 aria-current={head === slug ? 'page' : undefined}>{label}</a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main" key={route} className="page-enter">
        {!canStore && (
          <Callout kind="warn" icon="!" title="This browser is not storing anything">
            <p>Private window, or site data is blocked. The page still reads correctly and
              still works out the week from today's date — it just forgets every tick when
              you close the tab. Use <a href="#/data">Your data</a> to export before you leave.</p>
          </Callout>
        )}
        {previewDate && (
          <Callout kind="info" icon="◷" title={`Previewing ${fmtLong(previewDate)}`}>
            <p>Nothing is being saved to that date. Every page on the site reads as it will
              read then — including the slipped-week counter.{' '}
              <button type="button" className="btn btn-sm" onClick={() => setPreviewDate(null)}>Back to today</button></p>
          </Callout>
        )}
        <Boundary key={route}>{page}</Boundary>
      </main>

      {/* One polite live region for the whole site: what changed, in words, for
          a screen reader and for anyone who clicked something two views away
          from the number it moved. */}
      <div className="status-wrap" role="status" aria-live="polite">
        {notice && <p className={`status-toast tone-${notice.tone}`} key={notice.id}>{notice.text}</p>}
      </div>

      <footer>
        <p>The repository is the record, not this page:
          {' '}<code>REGISTRAR.md</code>, <code>ASSESSMENT.md</code>,
          {' '}<code>enrolled/PSY-101.md</code>, <code>enrolled/STA-101.md</code>.
          Everything here is generated from those files by <code>tools/build-site-data.py</code>;
          progress you tick goes back to them as a patch from <a href="#/data">Your data</a>.</p>
        <p>{data.registrar.student} · {data.registrar.capacity} · No accreditation: the transcript
          is a record for you, not a credential for anyone else. Curriculum data generated {data.generated.slice(0, 10)}.</p>
      </footer>
    </StoreContext.Provider>
  );
}
