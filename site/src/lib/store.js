/* Progress state.
 *
 * Lives in this browser's localStorage. It is a working buffer, not the record:
 * the record is enrolled/<CODE>.md and REGISTRAR.md in the repository. The
 * Sunday close turns this buffer into a Markdown patch you paste back into
 * those files (see lib/patch.js), which is why every field here maps onto a
 * column that already exists in the repo's tables.
 */
import { createContext, useContext } from 'react';
import { todayISO } from './calendar.js';

export const KEY = 'uib.v2';
export const LEGACY_KEY = 'uib.termA.v1';
export const RUBRIC_IDS = ['A1', 'A2', 'A3', 'A4', 'A5'];

export const emptyState = () => ({
  v: 2,
  setup: {},      // { [stepNumber]: true }
  weeks: {},      // { [code]: { [week]: weekRecord } }
  tags: {},       // { [ledgerRowId]: 'R' | 'V' | 'H' }
  tagNotes: {},   // { [ledgerRowId]: 'checked against ...' }
  gaps: [],       // Tutor §C
  cross: [],      // Roommate §E
  closes: [],     // [{ at, edits, files }] - what the last Sunday close wrote back
  updated: null,
});

export const emptyWeek = () => ({
  read: false,
  tutor: false,
  written: false,
  closed: false,
  rubric: {},     // { A1: 'pass' | 'fail' }
  verdict: '',    // '' | 'PASS' | 'REWRITE'
  rewriteDone: false,
  hours: '',
  note: '',
  closedOn: null,
});

export function getWeek(state, code, n) {
  return { ...emptyWeek(), ...((state.weeks[code] || {})[n] || {}) };
}

export function rubricScore(week) {
  const passes = RUBRIC_IDS.filter((id) => week.rubric[id] === 'pass').length;
  const fails = RUBRIC_IDS.filter((id) => week.rubric[id] === 'fail').length;
  return { passes, fails, graded: passes + fails, full: passes === RUBRIC_IDS.length };
}

/* ---------------------------------------------------------------- storage */

export function storageAvailable() {
  try {
    const probe = '__uib_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) return migrate(JSON.parse(legacy));
  } catch {
    /* corrupt or blocked: fall through to a clean slate */
  }
  return emptyState();
}

export function save(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/* v1 was the single-page Term A reader: flat tick ids, closed-week list, tags. */
/* Anything imported may be the wrong shape - the Import JSON control takes a
 * file the user pastes. A null where an object belongs used to blank every
 * route including /data, which is the only page carrying Reset, so the user got
 * a white screen from a control that promises nothing was changed. */
const asObject = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const asArray = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : []);

export function normalise(raw) {
  const base = emptyState();
  const r = asObject(raw);
  return {
    ...base,
    v: 2,
    setup: asObject(r.setup),
    weeks: Object.fromEntries(
      Object.entries(asObject(r.weeks)).map(([code, wk]) => [
        code,
        Object.fromEntries(Object.entries(asObject(wk)).map(([n, w]) => [
          n, { ...emptyWeek(), ...asObject(w), rubric: asObject(asObject(w).rubric) },
        ])),
      ])
    ),
    tags: asObject(r.tags),
    tagNotes: asObject(r.tagNotes),
    gaps: asArray(r.gaps),
    cross: asArray(r.cross),
    closes: asArray(r.closes),
    updated: typeof r.updated === 'string' ? r.updated : null,
  };
}

export function migrate(raw) {
  if (!raw || typeof raw !== 'object') return emptyState();
  if (raw.v === 2) return normalise(raw);

  const next = emptyState();
  if (raw.setup && typeof raw.setup === 'object') next.setup = { ...raw.setup };
  if (Array.isArray(raw.setup)) raw.setup.forEach((n) => { next.setup[n] = true; });
  if (raw.tags && typeof raw.tags === 'object') next.tags = { ...raw.tags };

  const closed = raw.closed || raw.closedWeeks || {};
  const marks = Array.isArray(closed) ? closed : Object.keys(closed).filter((k) => closed[k]);
  marks.forEach((mark) => {
    const m = /^([A-Z]{3}-\d{3})[.:-](\d+)$/.exec(String(mark));
    if (!m) return;
    const [, code, n] = m;
    next.weeks[code] = next.weeks[code] || {};
    next.weeks[code][n] = { ...emptyWeek(), closed: true };
  });
  next.updated = raw.updated || null;
  return normalise(next);
}

/* crypto.randomUUID is not available on every file:// origin in every browser,
   and this id only has to be unique within one browser's own state. */
function uid() {
  try {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  } catch { /* fall through */ }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------------------------------------------------------------- reducer */

export function reducer(state, action) {
  const stamp = (s) => ({ ...s, updated: new Date().toISOString() });

  switch (action.type) {
    case 'setup:toggle': {
      const setup = { ...state.setup, [action.n]: !state.setup[action.n] };
      return stamp({ ...state, setup });
    }
    case 'week:set': {
      const { code, n, patch } = action;
      const course = { ...(state.weeks[code] || {}) };
      course[n] = { ...getWeek(state, code, n), ...patch };
      return stamp({ ...state, weeks: { ...state.weeks, [code]: course } });
    }
    case 'week:rubric': {
      const { code, n, id, value } = action;
      const week = getWeek(state, code, n);
      const rubric = { ...week.rubric };
      if (value === null) delete rubric[id];
      else rubric[id] = value;
      const course = { ...(state.weeks[code] || {}), [n]: { ...week, rubric } };
      return stamp({ ...state, weeks: { ...state.weeks, [code]: course } });
    }
    case 'week:close': {
      const { code, n } = action;
      const week = getWeek(state, code, n);
      const { full, graded } = rubricScore(week);
      const course = {
        ...(state.weeks[code] || {}),
        [n]: {
          ...week,
          closed: true,
          closedOn: todayISO(),
          // A verdict is the Editor's, and it grades against Part A. Closing a
          // week nobody graded records no verdict rather than inventing a
          // REWRITE - the strip already calls that state "closed, ungraded".
          verdict: week.verdict || (graded > 0 ? (full ? 'PASS' : 'REWRITE') : ''),
        },
      };
      return stamp({ ...state, weeks: { ...state.weeks, [code]: course } });
    }
    case 'week:reopen': {
      const { code, n } = action;
      const week = getWeek(state, code, n);
      const course = { ...(state.weeks[code] || {}), [n]: { ...week, closed: false, closedOn: null } };
      return stamp({ ...state, weeks: { ...state.weeks, [code]: course } });
    }
    case 'tag:set': {
      const tags = { ...state.tags };
      const tagNotes = { ...state.tagNotes };
      if (action.tag === null) { delete tags[action.id]; delete tagNotes[action.id]; }
      else {
        tags[action.id] = action.tag;
        if (action.note !== undefined) tagNotes[action.id] = action.note;
      }
      return stamp({ ...state, tags, tagNotes });
    }
    case 'gap:add':
      return stamp({ ...state, gaps: [...state.gaps, { id: uid(), status: 'open', ...action.gap }] });
    case 'gap:update':
      return stamp({
        ...state,
        gaps: state.gaps.map((g) => (g.id === action.id ? { ...g, ...action.patch } : g)),
      });
    case 'gap:remove':
      return stamp({ ...state, gaps: state.gaps.filter((g) => g.id !== action.id) });
    case 'cross:add':
      return stamp({ ...state, cross: [...state.cross, { id: uid(), ...action.entry }] });
    case 'cross:update':
      return stamp({
        ...state,
        cross: state.cross.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
      });
    /* The Sunday close is the one moment this buffer touches the record. It is
       recorded here so the site can say when it last happened and what it wrote,
       which is the difference between a patch you trust and a patch you re-read. */
    case 'close:record':
      return stamp({
        ...state,
        closes: [{ at: new Date().toISOString(), on: action.on, edits: action.edits, files: action.files },
                 ...(state.closes || [])].slice(0, 8),
      });
    case 'cross:remove':
      return stamp({ ...state, cross: state.cross.filter((c) => c.id !== action.id) });
    case 'state:import':
      return stamp({ ...emptyState(), ...migrate(action.state) });
    case 'state:reset':
      return stamp(emptyState());
    default:
      return state;
  }
}

/* ---------------------------------------------------------------- context */

export const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);
