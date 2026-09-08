import React, { useEffect, useMemo, useReducer, useState } from 'react';
import data from './data/curriculum.json';
import { StoreContext, reducer, load, save, storageAvailable } from './lib/store.js';
import { todayISO, fmtLong } from './lib/calendar.js';
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

export default function App() {
  const route = useHashRoute();
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [previewDate, setPreviewDate] = useState(null);
  const [canStore] = useState(storageAvailable);

  useEffect(() => { if (canStore) save(state); }, [state, canStore]);

  const today = previewDate || todayISO();
  const ctx = useMemo(
    () => ({ data, state, dispatch, today, realToday: todayISO(), previewDate, setPreviewDate, canStore }),
    [state, today, previewDate, canStore]
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

  return (
    <StoreContext.Provider value={ctx}>
      <header className="masthead">
        <div className="masthead-inner">
          <h1><a href="#/">University in a Box</a><span className="sep">·</span>
            <span style={{ fontWeight: 400 }}>{term.label} {data.registrar.programStart.slice(0, 4)}</span></h1>
          <p className="mast-meta">
            {data.registrar.student} · {term.enrolled.join(' + ')} · {fmtLong(today)}
            {previewDate && ' — previewed'}
          </p>
        </div>
        <nav className="tabs" aria-label="Sections">
          {TABS.map(([slug, label]) => (
            <a key={slug} href={`#/${slug}`}
               aria-current={head === slug ? 'page' : undefined}>{label}</a>
          ))}
        </nav>
      </header>

      <main>
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
        {page}
      </main>

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
